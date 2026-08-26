import { openCompilerRuntime } from '../../compiler-actor/index.mjs';
import { CUDA_TARGET_POLICY_ENTRIES, CUDA_TARGET_POLICY_VERSION } from '../../cuda-target/index.mjs';
import { DeviceSelectionAuthority, resolveArchitectureTarget, resolveOpaqueDeviceSelector } from '../../device-selection/index.mjs';
import { discoverDriverDevices, openDriverRuntime } from '../../driver-actor/index.mjs';
import { assessCudaSupport, inspectHostProfile } from '../../platform-diagnostics/index.mjs';
import { CUDA_JS_COMPATIBILITY } from '../compatibility.mjs';
import { CudaJsError, facadeError, freezePublic, publicDetails, publicError } from './errors.mjs';

const runtimeData = new WeakMap();
const resourceData = new WeakMap();
const OPEN_FIELDS = Object.freeze(['compiler', 'device', 'driver']);
const DRIVER_FIELDS = Object.freeze(['execution', 'maxPending', 'memory']);
const COMPILER_FIELDS = Object.freeze(['cacheDirectory', 'cacheMode']);
const HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3 });
const POISONED_ALLOWED_OPERATIONS = new Set([
  'runtime.describe', 'runtime.close',
  'memory.status', 'memory.close',
  'memory.view.status', 'memory.view.close',
  'mailbox.status', 'mailbox.close',
  'module.status', 'module.close',
  'function.status', 'function.close',
  'prepared.status', 'prepared.close',
  'operation.status', 'operation.wait', 'operation.close',
]);

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, allowed) { return plainObject(value) && Object.keys(value).every((key) => allowed.includes(key)); }

function compilerOptions(value) {
  if (value === false || value === undefined) return null;
  if (value === true) return Object.freeze({ cacheMode: 'disabled' });
  if (!exactFields(value, COMPILER_FIELDS)) throw facadeError('CUDA_JS_OPTIONS_INVALID', 'validation', 'Compiler options contain unknown fields.', {}, 'open');
  const cacheMode = value.cacheMode ?? (value.cacheDirectory === undefined ? 'disabled' : 'read-write');
  if (cacheMode !== 'disabled' && value.cacheDirectory === undefined) throw facadeError('CUDA_JS_CACHE_DIRECTORY_REQUIRED', 'validation', 'A normalized absolute cacheDirectory is required when the public compiler cache is enabled.', { cacheMode }, 'open');
  return Object.freeze({ ...value, cacheMode });
}

function selectedDevice(value) {
  if (value === undefined) return null;
  try { return resolveOpaqueDeviceSelector(value); }
  catch (error) { throw facadeError(error.code ?? 'DEVICE_SELECTOR_INVALID', error.category ?? 'validation', error.message ?? 'Device selector is invalid.', error.details ?? {}, 'open'); }
}

function normalizeOptions(value) {
  if (!exactFields(value, OPEN_FIELDS)) throw facadeError('CUDA_JS_OPTIONS_INVALID', 'validation', 'Runtime options contain unknown fields.', {}, 'open');
  if (value.driver !== undefined && !exactFields(value.driver, DRIVER_FIELDS)) throw facadeError('CUDA_JS_OPTIONS_INVALID', 'validation', 'Driver options must be an ordinary object with only public fields.', {}, 'open');
  return Object.freeze({ driver: Object.freeze({ ...(value.driver ?? {}) }), compiler: compilerOptions(value.compiler), selectedDevice: selectedDevice(value.device) });
}

function selectedArchitecture(description) {
  const attributes = description?.device?.attributes;
  return Object.freeze({
    major: attributes?.computeCapabilityMajor,
    minor: attributes?.computeCapabilityMinor,
    class: `cc-${attributes?.computeCapabilityMajor}.${attributes?.computeCapabilityMinor}`,
  });
}

function cudaTargetPolicy(architecture) {
  const entry = CUDA_TARGET_POLICY_ENTRIES.find((candidate) => candidate.computeCapability === `${architecture.major}.${architecture.minor}`);
  if (!entry) throw facadeError('CUDA_JS_DEVICE_TARGET_UNSUPPORTED', 'unsupported', 'Selected-device architecture is not admitted by the current CUDA target policy.', { architecture: architecture.class, targetPolicy: CUDA_TARGET_POLICY_VERSION }, 'open');
  return Object.freeze({ policyVersion: CUDA_TARGET_POLICY_VERSION, compileTarget: `compute_${entry.base}`, linkTarget: `sm_${entry.base}` });
}

function withCompileTarget(request, compileTarget) {
  if (!plainObject(request) || (request.options !== undefined && !plainObject(request.options)) || request.options?.architecture !== undefined) return request;
  return { ...request, options: { ...(request.options ?? {}), architecture: compileTarget } };
}

function withLinkTarget(request, linkTarget) {
  if (!plainObject(request) || (request.options !== undefined && !plainObject(request.options)) || request.options?.architecture !== undefined) return request;
  return { ...request, options: { ...(request.options ?? {}), architecture: linkTarget } };
}

function preflight(host) {
  if (host.hostKind === 'linux-native-arm64') throw facadeError('CUDA_JS_LINUX_BACKEND_UNAVAILABLE', 'unsupported', 'This package does not yet contain a native Linux ARM64 CUDA backend.', { hostKind: host.hostKind }, 'open');
  if (host.hostKind.startsWith('wsl')) throw facadeError('CUDA_JS_WSL_BACKEND_UNAVAILABLE', 'unsupported', 'This package does not yet contain a WSL CUDA backend.', { hostKind: host.hostKind }, 'open');
  if (!['windows-native-x64', 'linux-native-x64'].includes(host.hostKind)) throw facadeError('CUDA_JS_HOST_BACKEND_UNAVAILABLE', 'unsupported', 'This package has no native backend for the detected host.', { hostKind: host.hostKind }, 'open');
  if (host.node.disposition === 'known-incompatible') throw facadeError('CUDA_JS_NODE_INCOMPATIBLE', 'unsupported', 'This Node release lacks the minimum runtime substrate required by CUDA-JS.', { actualVersion: host.node.version, minimumVersion: host.node.minimumVersion, reason: host.node.reason }, 'open');
  if (!host.ffi.experimental) throw facadeError('CUDA_JS_FFI_FLAG_REQUIRED', 'unsupported', 'CUDA-JS requires Node experimental FFI.', {}, 'open');
  if (host.ffi.permission === 'ffi-denied') throw facadeError('CUDA_JS_FFI_PERMISSION_REQUIRED', 'permission', 'CUDA-JS requires FFI authority when the Node permission model is active.', {}, 'open');
}

function publicCompilerStatus(status) {
  if (!status) return null;
  return freezePublic({ schemaVersion: 1, provider: status.provider, cache: status.cache, resources: status.resources, health: status.health, claim: status.claim });
}

function publicFailureRecord(error, operation, fallbackMessage = 'Cleanup failure details were unavailable.') {
  const candidate = error && typeof error === 'object' && typeof error.message !== 'string'
    ? { ...error, message: fallbackMessage }
    : error;
  return failureRecord(publicError(candidate, operation));
}

function publicDriverTerminal(report) {
  if (!report) return null;
  const output = { graceful: report.graceful === true, restartRequired: report.restartRequired === true, cleanupClaim: report.cleanupClaim ?? null, workerExited: report.workerExited === true, workerExitCode: report.workerExitCode ?? null, health: report.health?.current ?? null, resourceCounts: publicDetails(report.teardown?.inventory?.counts ?? report.inventory?.counts ?? {}) };
  if (report.commandAcknowledged === true) output.commandAcknowledged = true;
  if (typeof report.failedOperation === 'string') output.failedOperation = report.failedOperation;
  if (report.error) output.error = publicFailureRecord(report.error, 'driver.close');
  if (Array.isArray(report.teardown?.errors) && report.teardown.errors.length > 0) output.cleanupFailures = report.teardown.errors.slice(0, 64).map((error) => publicFailureRecord(error, 'driver.close'));
  const cleanupFailureCount = Number.isSafeInteger(report.teardown?.errorCount) && report.teardown.errorCount >= 0
    ? report.teardown.errorCount
    : report.teardown?.errors?.length ?? 0;
  if (cleanupFailureCount > 0) {
    output.cleanupFailureCount = cleanupFailureCount;
    output.cleanupFailuresTruncated = Math.max(0, cleanupFailureCount - (output.cleanupFailures?.length ?? 0));
  }
  const skippedResourceCount = Number.isSafeInteger(report.teardown?.skippedCount) && report.teardown.skippedCount >= 0
    ? report.teardown.skippedCount
    : report.teardown?.skipped?.length ?? 0;
  if (skippedResourceCount > 0) output.skippedResourceCount = skippedResourceCount;
  return freezePublic(output);
}

function publicCompilerTerminal(report) {
  if (!report) return null;
  const output = { graceful: report.graceful === true, restartRequired: report.restartRequired === true, cleanupClaim: report.cleanupClaim ?? null, workerExited: report.workerExited === true, workerExitCode: report.workerExitCode ?? null, resources: publicDetails(report.resources ?? {}) };
  if (report.error) output.error = publicFailureRecord(report.error, 'compiler.close');
  if (report.materialFailure) output.materialFailure = publicFailureRecord(report.materialFailure, 'compiler.close');
  if (report.closeFailure) output.closeFailure = publicFailureRecord(report.closeFailure, 'compiler.close');
  if (report.primaryFailure) output.primaryFailure = publicFailureRecord(report.primaryFailure, 'compiler.close', 'The compiler operation failed before cleanup completed.');
  if (Array.isArray(report.cleanupFailures) && report.cleanupFailures.length > 0) output.cleanupFailures = report.cleanupFailures.slice(0, 64).map((error) => publicFailureRecord(error, 'compiler.close'));
  if (typeof report.resultingHealth === 'string' && Object.hasOwn(HEALTH_RANK, report.resultingHealth)) output.resultingHealth = report.resultingHealth;
  if (report.terminalInventory) output.terminalInventory = publicDetails(report.terminalInventory);
  return freezePublic(output);
}

function publicCloseFailure(error, operation) {
  const normalized = publicError(error, operation);
  return freezePublic({ graceful: false, restartRequired: true, cleanupClaim: 'unproved-close-failure', error: failureRecord(normalized) });
}

function failureRecord(error) {
  return freezePublic({
    code: error.code,
    category: error.category,
    operation: error.operation,
    message: error.message,
    details: error.details,
    healthBefore: error.healthBefore,
    healthAfter: error.healthAfter,
  });
}

function strongestHealth(...states) {
  return states.reduce((strongest, state) => (state in HEALTH_RANK && HEALTH_RANK[state] > HEALTH_RANK[strongest] ? state : strongest), 'healthy');
}

function markRestartRequired(data) {
  if (data.state === 'closed') return;
  data.state = 'restart-required';
  const ownerHealth = strongestHealth(data.driver?.health, data.compiler?.health, 'restart-required');
  for (const resource of data.resources) {
    const entry = resourceData.get(resource);
    if (entry && entry.state === 'open') {
      entry.state = 'orphaned';
      entry.closeError ??= new CudaJsError(
        'CUDA_JS_RESOURCE_ORPHANED',
        'restart-required',
        'Resource ownership is inaccessible because the runtime requires restart.',
        { kind: entry.kind, state: 'orphaned' },
        { operation: 'runtime.owner-loss', healthBefore: ownerHealth, healthAfter: 'restart-required' },
      );
    }
  }
}

function synchronizeOwnerState(data) {
  if (data.driver?.state === 'restart-required' || data.driver?.health === 'restart-required'
      || data.compiler?.state === 'restart-required' || data.compiler?.health === 'restart-required') markRestartRequired(data);
}

function dataFor(runtime, operation, allowTerminal = false) {
  const data = runtimeData.get(runtime);
  if (!data) throw facadeError('CUDA_JS_RUNTIME_INVALID', 'validation', 'Runtime object is invalid.', {}, operation);
  synchronizeOwnerState(data);
  if (!allowTerminal && data.state !== 'open') throw facadeError('CUDA_JS_RUNTIME_CLOSED', data.state === 'restart-required' ? 'restart-required' : 'closed-runtime', 'Runtime is not accepting operations.', { state: data.state }, operation);
  if (!allowTerminal && data.driver?.health === 'poisoned' && !POISONED_ALLOWED_OPERATIONS.has(operation)) {
    throw new CudaJsError('DRIVER_RUNTIME_POISONED', 'deferred-driver', 'Runtime health is poisoned; only inspection and cleanup operations remain available.', { operation }, { operation, healthBefore: 'poisoned', healthAfter: 'poisoned' });
  }
  return data;
}

function resourceFor(resource, runtime, kind, operation) {
  const entry = resourceData.get(resource);
  if (!entry) throw facadeError('CUDA_JS_RESOURCE_INVALID', 'validation', 'Resource capability is invalid.', { kind }, operation);
  if (entry.runtime !== runtime) throw facadeError('CUDA_JS_RESOURCE_OWNER', 'validation', 'Resource capability belongs to another runtime.', { expectedKind: kind, actualKind: entry.kind }, operation);
  if (entry.kind !== kind) throw facadeError('CUDA_JS_RESOURCE_KIND', 'validation', 'Resource capability kind is invalid for this operation.', { expectedKind: kind, actualKind: entry.kind }, operation);
  if (entry.state !== 'open') {
    const terminalCategory = entry.state === 'orphaned'
      ? (entry.closeError?.category ?? 'restart-required')
      : 'stale-resource';
    throw new CudaJsError('CUDA_JS_RESOURCE_CLOSED', terminalCategory, 'Resource capability is terminal.', { kind, state: entry.state }, {
      operation,
      healthBefore: entry.closeError?.healthBefore ?? null,
      healthAfter: entry.closeError?.healthAfter ?? null,
    });
  }
  dataFor(runtime, operation);
  return entry;
}

async function invoke(operation, callback) {
  try { return await callback(); }
  catch (error) { throw publicError(error, operation); }
}

function registerResource(runtime, kind, token, publicFields, ResourceClass) {
  const data = dataFor(runtime, `${kind}.create`);
  const resource = new ResourceClass();
  resourceData.set(resource, { runtime, kind, token, state: 'open', closePromise: null, closeError: null, ...publicFields });
  data.resources.add(resource);
  return Object.freeze(resource);
}

async function closeResource(resource, operation, release) {
  const entry = resourceData.get(resource);
  if (!entry) throw facadeError('CUDA_JS_RESOURCE_INVALID', 'validation', 'Resource capability is invalid.', {}, operation);
  if (entry.closeError) throw entry.closeError;
  if (entry.state === 'closed' || entry.state === 'orphaned') return freezePublic({ schemaVersion: 1, kind: entry.kind, state: entry.state, alreadyTerminal: true });
  if (entry.closePromise) return entry.closePromise;
  resourceFor(resource, entry.runtime, entry.kind, operation);
  entry.closePromise = invoke(operation, async () => {
    const result = await release(entry);
    entry.state = 'closed';
    runtimeData.get(entry.runtime)?.resources.delete(resource);
    return freezePublic({ schemaVersion: 1, kind: entry.kind, state: 'closed', disposition: result.disposition ?? null });
  });
  try { return await entry.closePromise; }
  catch (error) {
    const normalized = publicError(error, operation);
    if (normalized.code === 'RESOURCE_DISPOSE_FAILED') {
      entry.state = 'orphaned';
      entry.closeError = normalized;
      const data = runtimeData.get(entry.runtime);
      if (data && (normalized.category === 'restart-required' || normalized.healthAfter === 'restart-required')) markRestartRequired(data);
    } else entry.closePromise = null;
    throw normalized;
  }
}

function translateLaunch(entry, options, operation) {
  if (!plainObject(options) || Object.keys(options).some((key) => !['grid', 'block', 'sharedMemoryBytes', 'arguments', 'after', 'accesses'].includes(key)) || !Array.isArray(options.arguments)) throw facadeError('CUDA_JS_LAUNCH_OPTIONS_INVALID', 'validation', 'Launch requires grid, block, and an arguments array.', {}, operation);
  if (options.accesses !== undefined && !Array.isArray(options.accesses)) throw facadeError('CUDA_JS_LAUNCH_OPTIONS_INVALID', 'validation', 'Launch accesses must be an array when supplied.', {}, operation);
  if (options.arguments.length !== entry.parameters.length) throw facadeError('CUDA_JS_ARGUMENT_COUNT', 'validation', 'Launch argument count must match the function declaration.', { expected: entry.parameters.length, actual: options.arguments.length }, operation);
  const argumentsForActor = entry.parameters.map((parameter, index) => {
    const value = options.arguments[index];
    if (parameter.kind.startsWith('publication-mailbox-')) {
      if (!plainObject(value) || Object.keys(value).sort().join('\0') !== ['kind', 'lane', 'mailbox'].sort().join('\0') || value.kind !== 'publication-mailbox' || typeof value.lane !== 'string') throw facadeError('CUDA_JS_MAILBOX_ARGUMENT_INVALID', 'validation', 'Mailbox launch argument requires exactly kind, mailbox, and lane.', { index }, operation);
      const mailbox = resourceFor(value.mailbox, entry.runtime, 'publication-mailbox', operation);
      return { kind: 'publication-mailbox', mailbox: mailbox.token, generation: mailbox.generation, lane: value.lane };
    }
    if (parameter.kind !== 'device-memory') return { kind: parameter.kind, value };
    const capability = resourceData.get(value);
    if (capability?.kind === 'device-view') {
      const view = resourceFor(value, entry.runtime, 'device-view', operation);
      return { kind: 'device-view', view: view.token };
    }
    const memory = resourceFor(value, entry.runtime, 'device-memory', operation);
    return { kind: 'device-memory', memory: memory.token };
  });
  let after = null;
  if (options.after !== undefined && options.after !== null) after = resourceFor(options.after, entry.runtime, 'operation', operation).token;
  const accesses = options.accesses === undefined ? undefined : options.accesses.map((access) => plainObject(access) ? { ...access } : access);
  return { grid: options.grid, block: options.block, sharedMemoryBytes: options.sharedMemoryBytes ?? 0, arguments: argumentsForActor, after, accesses };
}

function preparedOptions(value, operation) {
  if (Array.isArray(value)) return value;
  if (!plainObject(value) || Object.keys(value).sort().join('\0') !== 'nodes' || !Array.isArray(value.nodes)) throw facadeError('CUDA_JS_PREPARED_OPTIONS_INVALID', 'validation', 'Prepared DAG creation requires a nodes array or exactly one nodes field.', {}, operation);
  return value.nodes;
}

function translatePreparedDag(runtime, value, operation) {
  const nodes = preparedOptions(value, operation);
  if (nodes.length < 1 || nodes.length > 32) throw facadeError('CUDA_JS_PREPARED_NODE_LIMIT', 'validation', 'Prepared DAG requires from one through 32 nodes.', { actual: nodes.length, maximum: 32 }, operation);
  return { nodes: nodes.map((node, nodeIndex) => {
    if (!plainObject(node) || Object.keys(node).some((key) => !['id', 'kind', 'after', 'function', 'grid', 'block', 'sharedMemoryBytes', 'arguments', 'accesses'].includes(key))
        || !['id', 'function', 'grid', 'block', 'arguments', 'accesses'].every((key) => Object.hasOwn(node, key)) || !Array.isArray(node.arguments) || !Array.isArray(node.accesses)) {
      throw facadeError('CUDA_JS_PREPARED_NODE_INVALID', 'validation', 'Prepared DAG node fields are invalid.', { nodeIndex }, operation);
    }
    const fn = resourceFor(node.function, runtime, 'function', operation);
    if (node.arguments.length !== fn.parameters.length) throw facadeError('CUDA_JS_ARGUMENT_COUNT', 'validation', 'Prepared node argument count must match its function declaration.', { nodeIndex, expected: fn.parameters.length, actual: node.arguments.length }, operation);
    const argumentsForActor = fn.parameters.map((parameter, argumentIndex) => {
      const valueAtIndex = node.arguments[argumentIndex];
      if (plainObject(valueAtIndex) && Object.keys(valueAtIndex).length === 1 && Object.hasOwn(valueAtIndex, 'binding')) return { binding: valueAtIndex.binding };
      if (parameter.kind === 'device-memory') throw facadeError('CUDA_JS_PREPARED_DEVICE_BINDING_REQUIRED', 'validation', 'Prepared device arguments must use named bindings.', { nodeIndex, argumentIndex }, operation);
      if (parameter.kind.startsWith('publication-mailbox-')) throw facadeError('CUDA_JS_PREPARED_PARAMETER_UNSUPPORTED', 'unsupported', 'The first prepared DAG profile does not accept publication mailboxes.', { nodeIndex, argumentIndex }, operation);
      return { kind: parameter.kind, value: valueAtIndex };
    });
    return {
      id: node.id,
      kind: node.kind ?? 'kernel',
      after: node.after === undefined ? [] : Array.isArray(node.after) ? [...node.after] : node.after,
      functionToken: fn.token,
      grid: plainObject(node.grid) ? { ...node.grid } : node.grid,
      block: plainObject(node.block) ? { ...node.block } : node.block,
      sharedMemoryBytes: node.sharedMemoryBytes ?? 0,
      arguments: argumentsForActor,
      accesses: node.accesses.map((access) => plainObject(access) ? { ...access } : access),
    };
  }) };
}

function preparedSubmissionOptions(bindingsOrRequest, options, operation) {
  if (plainObject(bindingsOrRequest) && Object.hasOwn(bindingsOrRequest, 'bindings') && plainObject(bindingsOrRequest.bindings)) {
    if (options !== undefined || Object.keys(bindingsOrRequest).some((key) => !['bindings', 'after'].includes(key))) throw facadeError('CUDA_JS_PREPARED_SUBMIT_INVALID', 'validation', 'Canonical prepared submission accepts exactly bindings and optional after.', {}, operation);
    return { bindings: bindingsOrRequest.bindings, after: bindingsOrRequest.after ?? null };
  }
  if (options !== undefined && (!plainObject(options) || Object.keys(options).some((key) => key !== 'after'))) throw facadeError('CUDA_JS_PREPARED_SUBMIT_INVALID', 'validation', 'Prepared submission options may contain only after.', {}, operation);
  return { bindings: bindingsOrRequest, after: options?.after ?? null };
}

function translatePreparedSubmission(entry, bindingsOrRequest, options, operation) {
  const request = preparedSubmissionOptions(bindingsOrRequest, options, operation);
  if (!plainObject(request.bindings)) throw facadeError('CUDA_JS_PREPARED_BINDINGS_INVALID', 'validation', 'Prepared bindings must be a plain name-to-value record.', {}, operation);
  const suppliedNames = Object.keys(request.bindings);
  if (suppliedNames.length !== entry.bindings.length) throw facadeError('CUDA_JS_PREPARED_BINDINGS_INVALID', 'validation', 'Prepared submission must supply every named binding exactly once.', { expected: entry.bindings.length, actual: suppliedNames.length }, operation);
  const bindings = entry.bindings.map((binding) => {
    if (!Object.hasOwn(request.bindings, binding.name)) throw facadeError('CUDA_JS_PREPARED_BINDING_MISSING', 'validation', 'Prepared submission is missing a named binding.', { binding: binding.name }, operation);
    const value = request.bindings[binding.name];
    if (binding.kind !== 'device-memory') return { name: binding.name, kind: binding.kind, value };
    const capability = resourceData.get(value);
    if (capability?.kind === 'device-view') {
      const view = resourceFor(value, entry.runtime, 'device-view', operation);
      return { name: binding.name, kind: 'device-view', view: view.token };
    }
    const memory = resourceFor(value, entry.runtime, 'device-memory', operation);
    return { name: binding.name, kind: 'device-memory', memory: memory.token, byteOffset: 0 };
  });
  const known = new Set(entry.bindings.map((binding) => binding.name));
  if (suppliedNames.some((name) => !known.has(name))) throw facadeError('CUDA_JS_PREPARED_BINDING_EXTRA', 'validation', 'Prepared submission contains an unknown binding.', {}, operation);
  const after = request.after === null ? null : resourceFor(request.after, entry.runtime, 'operation', operation).token;
  return { bindings, after };
}

function publicOperationStatus(result) {
  const output = { schemaVersion: 1, status: result.status, grid: result.grid, block: result.block, sharedMemoryBytes: result.sharedMemoryBytes, argumentKinds: result.argumentKinds, pollCount: result.pollCount, elapsedMilliseconds: result.elapsedMilliseconds, operationSequence: result.operationSequence, health: result.health };
  if (result.kind && result.kind !== 'kernel') output.kind = result.kind;
  if (result.kind === 'prepared-batch') {
    output.preparedSha256 = result.preparedSha256;
    output.nodeCount = result.nodeCount;
    output.edgeCount = result.edgeCount;
  }
  if (result.result) output.result = result.result.bytes instanceof Uint8Array
    ? { bytes: Uint8Array.from(result.result.bytes) }
    : { ...result.result };
  if (result.failure) output.failure = publicFailureRecord(result.failure, 'operation.status', 'GPU operation failed asynchronously.');
  if (result.orphanReason) output.orphanReason = result.orphanReason;
  return freezePublic(output);
}

function updateOperation(entry, result) {
  entry.gpuState = result.status;
  entry.lastStatus = publicOperationStatus(result);
  return entry.lastStatus;
}

class CudaDeviceMemory {
  get kind() { return 'device-memory'; }
  get byteLength() { return resourceData.get(this)?.byteLength ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }
  async status() { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.status'); const result = await invoke('memory.status', () => runtimeData.get(entry.runtime).driver.memoryStatus(entry.token)); return freezePublic({ schemaVersion: 1, kind: 'device-memory', state: entry.state, byteLength: result.byteLength, usage: result.usage }); }
  async write(bytes, options = {}) { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.write'); const result = await invoke('memory.write', () => runtimeData.get(entry.runtime).driver.writeDevice(entry.token, bytes, options)); return freezePublic({ schemaVersion: 1, deviceOffset: result.deviceOffset, byteLength: result.byteLength, usage: result.usage }); }
  async read(options) { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.read'); const result = await invoke('memory.read', () => runtimeData.get(entry.runtime).driver.readDevice(entry.token, options)); return freezePublic({ schemaVersion: 1, deviceOffset: result.deviceOffset, byteLength: result.byteLength, bytes: result.bytes, usage: result.usage }); }
  async writeAsync(bytes, options = {}) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.writeAsync');
    if (!plainObject(options) || Object.keys(options).some((key) => !['deviceOffset', 'after'].includes(key))) throw facadeError('CUDA_JS_TRANSFER_OPTIONS_INVALID', 'validation', 'writeAsync options contain unknown fields.', {}, 'memory.writeAsync');
    const after = options.after === undefined || options.after === null ? null : resourceFor(options.after, entry.runtime, 'operation', 'memory.writeAsync').token;
    const result = await invoke('memory.writeAsync', () => runtimeData.get(entry.runtime).driver.writeDeviceAsync(entry.token, bytes, { deviceOffset: options.deviceOffset ?? 0, after }));
    return registerResource(entry.runtime, 'operation', result.operation, { gpuState: result.status, lastStatus: publicOperationStatus(result) }, CudaOperation);
  }
  async readAsync(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.readAsync');
    if (!plainObject(options) || Object.keys(options).some((key) => !['deviceOffset', 'byteLength', 'after'].includes(key))) throw facadeError('CUDA_JS_TRANSFER_OPTIONS_INVALID', 'validation', 'readAsync options are invalid.', {}, 'memory.readAsync');
    const after = options.after === undefined || options.after === null ? null : resourceFor(options.after, entry.runtime, 'operation', 'memory.readAsync').token;
    const result = await invoke('memory.readAsync', () => runtimeData.get(entry.runtime).driver.readDeviceAsync(entry.token, { deviceOffset: options.deviceOffset ?? 0, byteLength: options.byteLength, after }));
    return registerResource(entry.runtime, 'operation', result.operation, { gpuState: result.status, lastStatus: publicOperationStatus(result) }, CudaOperation);
  }
  async copyFromAsync(source, options) {
    const destination = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.copyFromAsync');
    const sourceEntry = resourceFor(source, destination.runtime, 'device-memory', 'memory.copyFromAsync');
    if (!plainObject(options) || Object.keys(options).some((key) => !['destinationOffset', 'sourceOffset', 'byteLength', 'after'].includes(key))) throw facadeError('CUDA_JS_TRANSFER_OPTIONS_INVALID', 'validation', 'copyFromAsync options are invalid.', {}, 'memory.copyFromAsync');
    const after = options.after === undefined || options.after === null ? null : resourceFor(options.after, destination.runtime, 'operation', 'memory.copyFromAsync').token;
    const result = await invoke('memory.copyFromAsync', () => runtimeData.get(destination.runtime).driver.copyDeviceAsync(destination.token, sourceEntry.token, { destinationOffset: options.destinationOffset ?? 0, sourceOffset: options.sourceOffset ?? 0, byteLength: options.byteLength, after }));
    return registerResource(destination.runtime, 'operation', result.operation, { gpuState: result.status, lastStatus: publicOperationStatus(result) }, CudaOperation);
  }
  async view(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.view.create');
    const result = await invoke('memory.view.create', () => runtimeData.get(entry.runtime).driver.createDeviceView(entry.token, options));
    return registerResource(entry.runtime, 'device-view', result.view, {
      memory: this,
      dtype: result.dtype,
      byteOffset: result.byteOffset,
      elementCount: result.elementCount,
      byteLength: result.byteLength,
      access: result.access,
    }, CudaDeviceView);
  }
  async close() { return closeResource(this, 'memory.close', (entry) => runtimeData.get(entry.runtime).driver.releaseMemory(entry.token)); }
}

class CudaDeviceView {
  get kind() { return 'device-view'; }
  get dtype() { return resourceData.get(this)?.dtype ?? null; }
  get byteOffset() { return resourceData.get(this)?.byteOffset ?? null; }
  get elementCount() { return resourceData.get(this)?.elementCount ?? null; }
  get byteLength() { return resourceData.get(this)?.byteLength ?? null; }
  get access() { return resourceData.get(this)?.access ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }
  async status() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-view', 'memory.view.status');
    const result = await invoke('memory.view.status', () => runtimeData.get(entry.runtime).driver.deviceViewStatus(entry.token));
    return freezePublic({ schemaVersion: 1, kind: 'device-view', state: entry.state, dtype: result.dtype, byteOffset: result.byteOffset, elementCount: result.elementCount, byteLength: result.byteLength, access: result.access });
  }
  async close() { return closeResource(this, 'memory.view.close', (entry) => runtimeData.get(entry.runtime).driver.releaseDeviceView(entry.token)); }
}

class CudaPublicationMailbox {
  get kind() { return 'publication-mailbox'; }
  get generation() { return resourceData.get(this)?.generation ?? null; }
  get lanes() { return resourceData.get(this)?.publicLanes ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }
  store(laneName, value) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'publication-mailbox', 'mailbox.store');
    if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) throw facadeError('CUDA_JS_MAILBOX_VALUE_INVALID', 'validation', 'Mailbox store value must be u32.', {}, 'mailbox.store');
    const lane = entry.laneMap.get(laneName);
    if (!lane || lane.direction !== 'host-to-device') throw facadeError('CUDA_JS_MAILBOX_DIRECTION', 'validation', 'Mailbox store requires a host-to-device lane.', { lane: typeof laneName === 'string' ? laneName : null }, 'mailbox.store');
    Atomics.store(entry.view, lane.index, value | 0);
    return value;
  }
  load(laneName) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'publication-mailbox', 'mailbox.load');
    const lane = entry.laneMap.get(laneName);
    if (!lane || lane.direction !== 'device-to-host') throw facadeError('CUDA_JS_MAILBOX_DIRECTION', 'validation', 'Mailbox load requires a device-to-host lane.', { lane: typeof laneName === 'string' ? laneName : null }, 'mailbox.load');
    return Atomics.load(entry.view, lane.index) >>> 0;
  }
  async status() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'publication-mailbox', 'mailbox.status');
    const result = await invoke('mailbox.status', () => runtimeData.get(entry.runtime).driver.publicationMailboxStatus(entry.token));
    return freezePublic({ schemaVersion: 1, kind: 'publication-mailbox', state: entry.state, generation: result.generation, lanes: entry.publicLanes, leased: result.leased });
  }
  async reset() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'publication-mailbox', 'mailbox.reset');
    const result = await invoke('mailbox.reset', () => runtimeData.get(entry.runtime).driver.resetPublicationMailbox(entry.token, entry.generation));
    entry.generation = result.generation;
    return freezePublic({ schemaVersion: 1, kind: 'publication-mailbox', state: entry.state, generation: entry.generation, lanes: entry.publicLanes, leased: false });
  }
  async close() { return closeResource(this, 'mailbox.close', (entry) => runtimeData.get(entry.runtime).driver.releasePublicationMailbox(entry.token)); }
}

class CudaModule {
  get kind() { return 'module'; }
  get format() { return resourceData.get(this)?.format ?? null; }
  get byteLength() { return resourceData.get(this)?.byteLength ?? null; }
  get sha256() { return resourceData.get(this)?.sha256 ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }
  async status() { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'module', 'module.status'); const result = await invoke('module.status', () => runtimeData.get(entry.runtime).driver.moduleStatus(entry.token)); return freezePublic({ schemaVersion: 1, kind: 'module', state: entry.state, format: result.format, byteLength: result.byteLength, sha256: result.sha256 }); }
  async getFunction(options) { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'module', 'function.get'); const result = await invoke('function.get', () => runtimeData.get(entry.runtime).driver.getFunction(entry.token, options)); return registerResource(entry.runtime, 'function', result.function, { module: this, name: result.name, parameters: result.parameters }, CudaFunction); }
  async close() { return closeResource(this, 'module.close', (entry) => runtimeData.get(entry.runtime).driver.releaseModule(entry.token)); }
}

class CudaOperation {
  get kind() { return 'operation'; }
  get state() {
    const entry = resourceData.get(this);
    if (!entry) return 'invalid';
    return entry.state === 'open' ? entry.gpuState : entry.state;
  }
  async status() { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'operation', 'operation.status'); const result = await invoke('operation.status', () => runtimeData.get(entry.runtime).driver.operationStatus(entry.token)); return updateOperation(entry, result); }
  async wait() { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'operation', 'operation.wait'); const result = await invoke('operation.wait', () => runtimeData.get(entry.runtime).driver.waitOperation(entry.token)); return updateOperation(entry, result); }
  async close() { return closeResource(this, 'operation.close', (entry) => runtimeData.get(entry.runtime).driver.releaseOperation(entry.token)); }
}

class CudaFunction {
  get kind() { return 'function'; }
  get name() { return resourceData.get(this)?.name ?? null; }
  get parameters() { return resourceData.get(this)?.parameters ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }
  async status() { const entry = resourceFor(this, resourceData.get(this)?.runtime, 'function', 'function.status'); const result = await invoke('function.status', () => runtimeData.get(entry.runtime).driver.functionStatus(entry.token)); return freezePublic({ schemaVersion: 1, kind: 'function', state: entry.state, name: result.name, parameters: result.parameters }); }
  async submit(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'function', 'function.submit');
    const request = translateLaunch(entry, options, 'function.submit');
    const result = await invoke('function.submit', () => runtimeData.get(entry.runtime).driver.submit(entry.token, request));
    return registerResource(entry.runtime, 'operation', result.operation, { gpuState: result.status, lastStatus: publicOperationStatus(result) }, CudaOperation);
  }
  async launch(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'function', 'function.launch');
    const request = translateLaunch(entry, options, 'function.launch');
    const result = await invoke('function.launch', () => runtimeData.get(entry.runtime).driver.launch(entry.token, request));
    return freezePublic({ schemaVersion: 1, status: result.status, grid: result.grid, block: result.block, sharedMemoryBytes: result.sharedMemoryBytes, argumentKinds: result.argumentKinds, pollCount: result.pollCount, elapsedMilliseconds: result.elapsedMilliseconds, operationSequence: result.operationSequence, health: result.health });
  }
  async close() { return closeResource(this, 'function.close', (entry) => runtimeData.get(entry.runtime).driver.releaseFunction(entry.token)); }
}

class CudaPreparedOperationDag {
  get kind() { return 'prepared-operation-dag'; }
  get contract() { return resourceData.get(this)?.contract ?? null; }
  get sha256() { return resourceData.get(this)?.sha256 ?? null; }
  get nodeCount() { return resourceData.get(this)?.nodeCount ?? null; }
  get edgeCount() { return resourceData.get(this)?.edgeCount ?? null; }
  get bindings() { return resourceData.get(this)?.bindings ?? null; }
  get realization() { return resourceData.get(this)?.realization ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }
  async status() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'prepared-operation-dag', 'prepared.status');
    const result = await invoke('prepared.status', () => runtimeData.get(entry.runtime).driver.preparedOperationDagStatus(entry.token));
    return freezePublic({ schemaVersion: 1, kind: 'prepared-operation-dag', state: entry.state, contract: result.contract, sha256: result.sha256, nodeCount: result.nodeCount, edgeCount: result.edgeCount, bindings: result.bindings, realization: result.realization });
  }
  async submit(bindingsOrRequest, options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'prepared-operation-dag', 'prepared.submit');
    const request = translatePreparedSubmission(entry, bindingsOrRequest, options, 'prepared.submit');
    const result = await invoke('prepared.submit', () => runtimeData.get(entry.runtime).driver.submitPreparedOperationDag(entry.token, request));
    return registerResource(entry.runtime, 'operation', result.operation, { gpuState: result.status, lastStatus: publicOperationStatus(result) }, CudaOperation);
  }
  async close() { return closeResource(this, 'prepared.close', (entry) => runtimeData.get(entry.runtime).driver.releasePreparedOperationDag(entry.token)); }
}

class CudaRuntime {
  get state() {
    const data = runtimeData.get(this);
    if (!data) return 'invalid';
    synchronizeOwnerState(data);
    return data.state;
  }
  get health() {
    const data = runtimeData.get(this);
    if (!data) return 'invalid';
    synchronizeOwnerState(data);
    if (data.state !== 'open') return data.state === 'closed' ? 'closed' : 'restart-required';
    return data.driver.health === 'healthy' && (!data.compiler || data.compiler.health === 'healthy') ? 'healthy' : data.driver.health !== 'healthy' ? data.driver.health : data.compiler.health;
  }
  get compilerEnabled() { return runtimeData.get(this)?.compiler !== null; }
  get terminalReport() { return runtimeData.get(this)?.terminalReport ?? null; }
  async describe() { const data = dataFor(this, 'runtime.describe'); const driver = await invoke('runtime.describe', () => data.driver.describe()); const compiler = data.compiler ? await invoke('compiler.status', () => data.compiler.status()) : null; return freezePublic({ schemaVersion: 1, package: { name: CUDA_JS_COMPATIBILITY.package.name, version: CUDA_JS_COMPATIBILITY.package.version, publicApiSchema: CUDA_JS_COMPATIBILITY.publicApi.schemaVersion }, state: data.state, health: this.health, support: data.support, profile: driver.profile, driver: driver.driver, device: data.device, memory: driver.memory, transfer: driver.transfer, mailbox: driver.mailbox, execution: driver.execution, compiler: publicCompilerStatus(compiler) }); }
  async allocateDevice(options) { const data = dataFor(this, 'memory.allocate'); const result = await invoke('memory.allocate', () => data.driver.allocateDevice(options)); return registerResource(this, 'device-memory', result.memory, { byteLength: result.byteLength }, CudaDeviceMemory); }
  async createPublicationMailbox(options) {
    const data = dataFor(this, 'mailbox.create');
    const result = await invoke('mailbox.create', () => data.driver.createPublicationMailbox(options));
    const publicLanes = Object.freeze(result.lanes.map((lane) => Object.freeze({ name: lane.name, direction: lane.direction })));
    const laneMap = new Map(result.lanes.map((lane) => [lane.name, lane]));
    return registerResource(this, 'publication-mailbox', result.mailbox, { generation: result.generation, buffer: result.buffer, view: new Int32Array(result.buffer), publicLanes, laneMap }, CudaPublicationMailbox);
  }
  async loadModule(options) { const data = dataFor(this, 'module.load'); const result = await invoke('module.load', () => data.driver.loadModule(options)); return registerResource(this, 'module', result.module, { format: result.format, byteLength: result.byteLength, sha256: result.sha256 }, CudaModule); }
  async prepareOperationDag(options) {
    const data = dataFor(this, 'prepared.create');
    const request = translatePreparedDag(this, options, 'prepared.create');
    const result = await invoke('prepared.create', () => data.driver.prepareOperationDag(request));
    const bindings = Object.freeze(result.bindings.map((binding) => Object.freeze({ name: binding.name, kind: binding.kind })));
    return registerResource(this, 'prepared-operation-dag', result.prepared, {
      contract: result.contract, sha256: result.sha256, nodeCount: result.nodeCount, edgeCount: result.edgeCount, bindings, realization: result.realization,
    }, CudaPreparedOperationDag);
  }
  async compile(request) { const data = dataFor(this, 'compiler.compile'); if (!data.compiler) throw facadeError('CUDA_JS_COMPILER_DISABLED', 'unsupported', 'This runtime was opened without the optional compiler.', {}, 'compiler.compile'); return freezePublic(await invoke('compiler.compile', () => data.compiler.compile(withCompileTarget(request, data.targets.compileTarget)))); }
  async link(request) { const data = dataFor(this, 'compiler.link'); if (!data.compiler) throw facadeError('CUDA_JS_COMPILER_DISABLED', 'unsupported', 'This runtime was opened without the optional compiler.', {}, 'compiler.link'); return freezePublic(await invoke('compiler.link', () => data.compiler.link(withLinkTarget(request, data.targets.linkTarget)))); }
  async invalidateCache(key) { const data = dataFor(this, 'compiler.cache.invalidate'); if (!data.compiler) throw facadeError('CUDA_JS_COMPILER_DISABLED', 'unsupported', 'This runtime was opened without the optional compiler.', {}, 'compiler.cache.invalidate'); return freezePublic(await invoke('compiler.cache.invalidate', () => data.compiler.invalidate(key))); }
  async close() {
    const data = dataFor(this, 'runtime.close', true);
    if (data.closePromise) return data.closePromise;
    if (data.state === 'closed') return data.terminalReport;
    if (data.state === 'restart-required' && data.terminalReport) return data.terminalReport;
    const restartAlreadyRequired = data.state === 'restart-required';
    data.state = 'closing';
    data.closePromise = (async () => {
      let compiler = null;
      let driver = null;
      if (data.compiler) { try { compiler = await data.compiler.close(); } catch (error) { compiler = publicCloseFailure(error, 'compiler.close'); } }
      try { driver = await data.driver.close(); } catch (error) { driver = publicCloseFailure(error, 'driver.close'); }
      const graceful = !restartAlreadyRequired && driver?.graceful === true && (!compiler || compiler.graceful === true);
      data.state = graceful ? 'closed' : 'restart-required';
      for (const resource of data.resources) { const entry = resourceData.get(resource); if (entry) entry.state = graceful ? 'closed' : 'orphaned'; }
      data.resources.clear();
      data.terminalReport = freezePublic({ schemaVersion: 1, graceful, restartRequired: !graceful, state: data.state, compiler: publicCompilerTerminal(compiler), driver: publicDriverTerminal(driver) });
      return data.terminalReport;
    })();
    return data.closePromise;
  }
}

async function openWithAdapters(options, adapters, supportFactory) {
  const normalized = normalizeOptions(options);
  let driver;
  let compiler;
  try {
    const driverOptions = normalized.selectedDevice
      ? { ...normalized.driver, selectedDevice: { nativeDevice: normalized.selectedDevice.nativeDevice, architecture: normalized.selectedDevice.architecture } }
      : normalized.driver;
    driver = await invoke('driver.open', () => adapters.openDriver(driverOptions));
    const description = await invoke('driver.describe', () => driver.describe());
    const support = supportFactory(description);
    if (!['accepted', 'testing-unconfirmed', 'mock-only'].includes(support.status)) throw facadeError('CUDA_JS_PROFILE_INCOMPATIBLE', 'unsupported', 'The selected Driver profile is known to be incompatible with this runtime.', { reason: support.reason ?? 'unknown' }, 'open');
    const targets = await invoke('device.target.resolve', () => resolveArchitectureTarget(selectedArchitecture(description), cudaTargetPolicy));
    if (normalized.selectedDevice && (description.device?.ordinal !== normalized.selectedDevice.nativeDevice
        || targets.architecture.class !== normalized.selectedDevice.architecture.class)) {
      throw facadeError('CUDA_JS_SELECTED_DEVICE_MISMATCH', 'stale-resource', 'DriverActor did not bind the requested selected device.', {}, 'open');
    }
    if (normalized.compiler) compiler = await invoke('compiler.open', () => adapters.openCompiler(normalized.compiler));
    const runtime = new CudaRuntime();
    const device = freezePublic({
      schemaVersion: 1,
      selection: normalized.selectedDevice ? 'explicit' : 'default',
      architecture: targets.architecture,
      target: { policyVersion: targets.policyVersion, compile: targets.compileTarget, link: targets.linkTarget, identity: targets.identity },
    });
    runtimeData.set(runtime, { driver, compiler: compiler ?? null, support, device, targets, resources: new Set(), state: 'open', closePromise: null, terminalReport: null });
    return Object.freeze(runtime);
  } catch (error) {
    const primary = publicError(error, 'open');
    const cleanupFailures = [];
    const terminalInventory = [];
    const cleanupOwner = async (owner, adapter) => {
      if (!adapter) return;
      try {
        const terminal = await adapter.close();
        terminalInventory.push(freezePublic({
          owner,
          graceful: terminal?.graceful === true,
          cleanupClaim: terminal?.cleanupClaim ?? null,
          resourceCounts: terminal?.teardown?.inventory?.counts ?? terminal?.inventory?.counts ?? null,
        }));
        if (terminal?.graceful !== true) {
          const nested = [];
          if (terminal?.error) nested.push(terminal.error);
          if (Array.isArray(terminal?.teardown?.errors)) nested.push(...terminal.teardown.errors);
          if (Array.isArray(terminal?.cleanupFailures)) nested.push(...terminal.cleanupFailures);
          if (nested.length === 0 && terminal?.closeFailure) nested.push(terminal.closeFailure);
          if (nested.length === 0) {
            cleanupFailures.push(failureRecord(new CudaJsError(
              'CUDA_JS_OWNER_CLEANUP_UNPROVED',
              'restart-required',
              'An acquired runtime owner did not prove terminal cleanup.',
              { owner, cleanupClaim: terminal?.cleanupClaim ?? null },
              { operation: `${owner}.close`, healthBefore: terminal?.health?.current ?? null, healthAfter: 'restart-required' },
            )));
          } else {
            for (const cleanupError of nested.slice(0, 64 - cleanupFailures.length)) cleanupFailures.push(publicFailureRecord(cleanupError, `${owner}.close`));
          }
        }
      } catch (cleanupError) {
        cleanupFailures.push(failureRecord(publicError(cleanupError, `${owner}.close`)));
      }
    };
    await cleanupOwner('compiler', compiler);
    await cleanupOwner('driver', driver);
    if (cleanupFailures.length > 0) {
      const resultingHealth = strongestHealth(primary.healthAfter, ...cleanupFailures.map((failure) => failure.healthAfter), 'restart-required');
      throw new CudaJsError(
        'CUDA_JS_OPEN_CLEANUP_UNPROVED',
        'restart-required',
        'Runtime opening failed and acquired native ownership did not close terminally; restart the process.',
        {
          primaryFailure: failureRecord(primary),
          cleanupFailures: cleanupFailures.slice(0, 64),
          cleanupFailureCount: cleanupFailures.length,
          cleanupFailuresTruncated: cleanupFailures.length > 64,
          resultingHealth,
          terminalInventory,
        },
        { operation: 'open', healthBefore: primary.healthBefore, healthAfter: resultingHealth },
      );
    }
    throw primary;
  }
}

export function inspectCudaHost() { return freezePublic({ schemaVersion: 1, host: inspectHostProfile(), compatibility: CUDA_JS_COMPATIBILITY }); }

export async function discoverCudaDevices() {
  const host = inspectHostProfile();
  preflight(host);
  const authority = new DeviceSelectionAuthority({ listDevices: discoverDriverDevices });
  return invoke('device.discover', () => authority.discover());
}

export async function openCudaRuntime(options = {}) {
  const host = inspectHostProfile();
  preflight(host);
  return openWithAdapters(options, { openDriver: openDriverRuntime, openCompiler: openCompilerRuntime }, (description) => assessCudaSupport(host, description));
}

export async function openCudaRuntimeWithAdapters(options, adapters, supportFactory) { return openWithAdapters(options, adapters, supportFactory); }
