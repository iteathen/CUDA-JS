import { createHash } from 'node:crypto';
import {
  isParameterKind,
  packParameterValues as packNumericParameterValues,
  parameterLayout as numericParameterLayout,
} from './numeric-abi.mjs';
import { normalizePreparedOperationDag } from '../../prepared-execution/index.mjs';

const MIB = 1_048_576;
const POLICY_FIELDS = Object.freeze(['maxModuleBytes', 'maxArguments', 'maxCompletionMilliseconds', 'maxPendingGpuOperations']);
const PENDING_OPERATION_COMMANDS = new Set([
  'execution.operation.status',
  'execution.operation.release',
  'execution.operation.timeout',
  'execution.prepared.status',
  'execution.prepared.release',
  'memory.view.status',
  'memory.view.release',
  'mailbox.status',
  'mailbox.reset',
  'mailbox.release',
  'library.cublaslt.status',
  'library.cublaslt.release',
  'library.cublaslt.plan.status',
  'library.cublaslt.plan.release',
  'runtime.close',
]);
const HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3 });
const FAILURE_CATEGORIES = new Set([
  'validation', 'unsupported', 'permission', 'pressure', 'backpressure', 'stale-resource',
  'closed-runtime', 'immediate-driver', 'deferred-driver', 'provider', 'restart-required',
  'internal', 'native-compiler', 'native-linker', 'compile', 'link',
]);
const APPROVED_FAILURE_DETAIL_FIELDS = new Set([
  'actual', 'byteLength', 'causeCategory', 'causeCode', 'causeMessage', 'causeName', 'causeOperation', 'childCount',
  'causeByteLength', 'causeDisposalCallCount', 'causeNativeDescription', 'causeNativeMessage', 'causeNativeName',
  'causeNativeStatus', 'causeObservedOperationId', 'causeOriginOperationId', 'causeReason',
  'currentEpoch', 'disposition', 'epoch', 'expected', 'field', 'generation', 'kind',
  'leases', 'maximum', 'nativeDescription', 'nativeName', 'nativeStatus', 'nodeCount', 'operationId',
  'originOperationId', 'reason', 'resourceKind', 'resourceState', 'slot', 'state', 'status',
  'submittedNodeCount',
]);
const FAILURE_STRING_LIMIT = 160;
const CLEANUP_FAILURE_LIMIT = 8;

export const DEFAULT_EXECUTION_POLICY = Object.freeze({
  maxModuleBytes: 4 * MIB,
  maxArguments: 32,
  maxCompletionMilliseconds: 30_000,
  maxPendingGpuOperations: 1,
});

export class ExecutionError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'ExecutionError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
    this.operation = state.operation ?? null;
    this.operationId = state.operationId ?? null;
    this.healthBefore = state.healthBefore ?? null;
    this.healthAfter = state.healthAfter ?? null;
  }
}

function fail(code, category, message, details = {}, state = {}) {
  throw new ExecutionError(code, category, message, details, state);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function failureField(value, name) {
  try { return value?.[name]; } catch { return undefined; }
}

function boundedFailureString(value) {
  if (typeof value !== 'string') return null;
  const printable = value
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/(?:https?|file):\/\/[^\s"'<>]+/gi, '[redacted-location]')
    .replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"'<>]+/g, '[redacted-path]')
    .replace(/(^|[\s("'=])\/(?:[^\s"'<>]+)/g, '$1[redacted-path]')
    .replace(/\b0x[0-9a-f]{6,}\b/gi, '[redacted-handle]')
    .replace(/\b[0-9a-f]{32,}\b/gi, '[redacted-capability]')
    .replace(/\b(handle|pointer|address)\b\s*(?:[=:]\s*|\s+)(?:0x[0-9a-f]+|\d+|[A-Za-z0-9._:+/-]{8,})\b/gi, '$1=[redacted-handle]')
    .replace(/\b(nonce|token|runtimeid|runtime-id)\b\s*(?:[=:]\s*|\s+)[^\s,;]+/gi, '$1=[redacted-capability]')
    .replace(/\b(host|hostname|account|user|username|email|machine|identity)\b\s*(?:[=:]\s*|\s+)[^\s,;]+/gi, '$1=[redacted-identity]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-identity]')
    .trim();
  if (printable.length < 1) return null;
  return printable.slice(0, FAILURE_STRING_LIMIT);
}

function failureCode(value, fallback) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]{0,95}$/.test(value) ? value : fallback;
}

function failureOperation(value, fallback) {
  const operation = boundedFailureString(value);
  return operation !== null && /^[A-Za-z][A-Za-z0-9._:()-]{0,127}$/.test(operation) ? operation : fallback;
}

function failureHealth(value) {
  return typeof value === 'string' && Object.hasOwn(HEALTH_RANK, value) ? value : null;
}

function categoryHealth(category) {
  if (['validation', 'unsupported', 'pressure', 'backpressure', 'stale-resource', 'closed-runtime'].includes(category)) return null;
  if (category === 'immediate-driver') return 'suspect';
  if (category === 'deferred-driver') return 'poisoned';
  if (category === 'restart-required') return 'restart-required';
  return 'suspect';
}

function approvedFailureDetails(value) {
  if (!plainObject(value)) return Object.freeze({});
  const output = {};
  try {
    for (const key of Object.keys(value).sort()) {
      if (!APPROVED_FAILURE_DETAIL_FIELDS.has(key)) continue;
      const entry = value[key];
      if (entry === null || typeof entry === 'boolean' || (typeof entry === 'number' && Number.isFinite(entry))) {
        output[key] = entry;
      } else {
        const text = boundedFailureString(entry);
        if (text !== null && !/[\\/]/.test(text)) output[key] = text;
      }
    }
  } catch { return Object.freeze({}); }
  return Object.freeze(output);
}

function unstructuredFailureDetails(error) {
  const details = {};
  const causeName = boundedFailureString(failureField(error, 'name'));
  const causeMessage = boundedFailureString(failureField(error, 'message'));
  const causeCode = failureCode(failureField(error, 'code'), null);
  if (causeName !== null && !/[\\/]/.test(causeName)) details.causeName = causeName;
  if (causeMessage !== null && !/[\\/]/.test(causeMessage)) details.causeMessage = causeMessage;
  if (causeCode !== null) details.causeCode = causeCode;
  return Object.freeze(details);
}

function semanticFailure(error, { fallbackCode, fallbackCategory, fallbackOperation, cleanup = false }) {
  const errorCode = failureField(error, 'code');
  const errorCategory = failureField(error, 'category');
  const errorOperationId = failureField(error, 'operationId');
  const structured = typeof errorCode === 'string'
    && typeof errorCategory === 'string'
    && FAILURE_CATEGORIES.has(errorCategory);
  const category = structured ? errorCategory : (cleanup ? 'restart-required' : fallbackCategory);
  const healthBefore = structured ? failureHealth(failureField(error, 'healthBefore')) : null;
  const explicitHealthAfter = structured ? failureHealth(failureField(error, 'healthAfter')) : null;
  let healthAfter = structured ? (explicitHealthAfter ?? categoryHealth(category)) : (cleanup ? 'restart-required' : null);
  if (healthBefore !== null && (healthAfter === null || HEALTH_RANK[healthBefore] > HEALTH_RANK[healthAfter])) healthAfter = healthBefore;
  return Object.freeze({
    code: structured ? failureCode(errorCode, fallbackCode) : fallbackCode,
    category,
    operation: structured ? failureOperation(failureField(error, 'operation'), fallbackOperation) : fallbackOperation,
    operationId: Number.isSafeInteger(errorOperationId) && errorOperationId >= 0 ? errorOperationId : null,
    healthBefore,
    healthAfter,
    details: structured ? approvedFailureDetails(failureField(error, 'details')) : unstructuredFailureDetails(error),
  });
}

function strongestHealth(records, minimumHealth = null) {
  let strongest = minimumHealth;
  for (const record of records) {
    if (record.healthAfter !== null && (strongest === null || HEALTH_RANK[record.healthAfter] > HEALTH_RANK[strongest])) strongest = record.healthAfter;
  }
  return strongest;
}

function strongestCategory(records, resultingHealth) {
  if (resultingHealth === 'restart-required') return 'restart-required';
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index].healthAfter === resultingHealth) return records[index].category;
  }
  return records.at(-1)?.category ?? 'internal';
}

function rollbackInventory(registry, unprovedResources) {
  let inventory = null;
  try { inventory = typeof registry?.inventory === 'function' ? registry.inventory() : null; } catch {}
  const counts = {};
  for (const state of ['live', 'closing', 'closed', 'orphaned']) {
    const count = inventory?.counts?.[state];
    counts[state] = Number.isSafeInteger(count) && count >= 0 ? count : 0;
  }
  const orphaned = Array.isArray(inventory?.resources)
    ? inventory.resources.filter((entry) => entry?.state === 'orphaned').slice(0, CLEANUP_FAILURE_LIMIT).map((entry) => Object.freeze({ kind: boundedFailureString(entry.kind) ?? 'resource', state: 'orphaned' }))
    : [];
  return Object.freeze({
    counts: Object.freeze(counts),
    orphaned: Object.freeze(orphaned),
    unproved: Object.freeze(unprovedResources.slice(0, CLEANUP_FAILURE_LIMIT).map((entry) => Object.freeze({
      kind: boundedFailureString(entry.kind) ?? 'resource',
      registered: entry.registered === true,
      disposition: 'unproved',
    }))),
  });
}

function combinedRollbackError({
  code,
  message,
  operation,
  operationId,
  primaryError,
  primaryFallbackCode,
  primaryFallbackOperation,
  cleanupErrors,
  cleanupFallbackCode,
  cleanupFallbackOperation,
  registry,
  unprovedResources,
  minimumHealth = null,
  restartRequired = null,
}) {
  const primaryFailure = primaryError === null ? null : semanticFailure(primaryError, {
    fallbackCode: primaryFallbackCode,
    fallbackCategory: 'internal',
    fallbackOperation: primaryFallbackOperation,
  });
  const cleanupFailures = Object.freeze(cleanupErrors.slice(0, CLEANUP_FAILURE_LIMIT).map((error) => semanticFailure(error, {
    fallbackCode: cleanupFallbackCode,
    fallbackCategory: 'restart-required',
    fallbackOperation: cleanupFallbackOperation,
    cleanup: true,
  })));
  const records = [...(primaryFailure ? [primaryFailure] : []), ...cleanupFailures];
  const resultingHealth = strongestHealth(records, minimumHealth);
  const details = Object.freeze({
    ...(primaryFailure ? { primaryFailure } : {}),
    cleanupFailures,
    resultingHealth,
    terminal: 'unproved',
    inventory: rollbackInventory(registry, unprovedResources),
  });
  let healthBefore = records.find((record) => record.healthBefore !== null)?.healthBefore ?? null;
  if (resultingHealth === 'restart-required' && typeof restartRequired === 'function') {
    const transitioned = restartRequired({ code, message, details, operationId });
    healthBefore = failureHealth(transitioned?.healthBefore) ?? healthBefore;
  }
  return new ExecutionError(code, strongestCategory(records, resultingHealth), message, details, {
    operation,
    operationId,
    healthBefore,
    healthAfter: resultingHealth,
  });
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function boundedPositive(value, field, maximum) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) fail('EXECUTION_POLICY_INVALID', 'validation', `${field} must be a positive safe integer no greater than ${maximum}.`, { field, value, maximum });
  return value;
}

export function normalizeExecutionPolicy(value = {}) {
  if (!plainObject(value) || Object.keys(value).some((key) => !POLICY_FIELDS.includes(key))) fail('EXECUTION_POLICY_INVALID', 'validation', 'Execution policy contains unknown fields.');
  return Object.freeze({
    maxModuleBytes: boundedPositive(value.maxModuleBytes ?? DEFAULT_EXECUTION_POLICY.maxModuleBytes, 'maxModuleBytes', 64 * MIB),
    maxArguments: boundedPositive(value.maxArguments ?? DEFAULT_EXECUTION_POLICY.maxArguments, 'maxArguments', 64),
    maxCompletionMilliseconds: boundedPositive(value.maxCompletionMilliseconds ?? DEFAULT_EXECUTION_POLICY.maxCompletionMilliseconds, 'maxCompletionMilliseconds', 300_000),
    maxPendingGpuOperations: boundedPositive(value.maxPendingGpuOperations ?? DEFAULT_EXECUTION_POLICY.maxPendingGpuOperations, 'maxPendingGpuOperations', 2),
  });
}

function normalizeParameters(parameters, maximum) {
  if (!Array.isArray(parameters) || parameters.length < 1 || parameters.length > maximum) fail('EXECUTION_PARAMETERS_INVALID', 'validation', 'Function parameters must be a nonempty bounded array.', { count: parameters?.length ?? null, maximum });
  return Object.freeze(parameters.map((parameter, index) => {
    if (!exactFields(parameter, ['kind']) || !isParameterKind(parameter.kind)) fail('EXECUTION_PARAMETER_INVALID', 'validation', 'Function parameter record is invalid.', { index, kind: parameter?.kind ?? null });
    return Object.freeze({ kind: parameter.kind });
  }));
}

export function parameterLayout(parameters) {
  return numericParameterLayout(parameters, fail);
}

export function packParameterValues(parameters, values) {
  return packNumericParameterValues(parameters, values, fail);
}

function moduleBytes(format, value, maximum) {
  if (!(value instanceof Uint8Array) || Buffer.isBuffer(value) || value.byteLength < 1 || value.byteLength > maximum) fail('EXECUTION_MODULE_BYTES', 'validation', 'Module bytes must be a nonempty ordinary Uint8Array within policy.', { byteLength: value?.byteLength ?? null, maximum });
  if (format === 'ptx') for (const byte of value) if (byte === 0 || byte > 0x7f) fail('EXECUTION_MODULE_TEXT', 'validation', 'PTX bytes must be NUL-free seven-bit text.');
  return Uint8Array.from(value);
}

function functionName(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 256 || !/^[\x20-\x7e]+$/.test(value) || /[\\/]/.test(value) || value.includes('\0')) fail('EXECUTION_FUNCTION_NAME', 'validation', 'Function name must be bounded printable ASCII without path separators.');
  return value;
}

function dimensions(value, field) {
  if (!exactFields(value, ['x', 'y', 'z'])) fail('EXECUTION_DIMENSIONS', 'validation', `${field} must be an exact x/y/z record.`, { field });
  for (const axis of ['x', 'y', 'z']) if (!Number.isSafeInteger(value[axis]) || value[axis] < 1) fail('EXECUTION_DIMENSIONS', 'validation', `${field}.${axis} must be a positive safe integer.`, { field, axis, value: value[axis] });
  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

function assertOperations(operations) {
  if (!plainObject(operations)) fail('EXECUTION_BACKEND_INVALID', 'internal', 'Execution backend operations are invalid.');
  for (const name of ['createStream', 'destroyStream', 'loadModule', 'unloadModule', 'getFunction', 'createEvent', 'destroyEvent', 'devicePointer', 'submitLaunch', 'recordEvent', 'queryEvent', 'health', 'restartRequired']) {
    if (typeof operations[name] !== 'function') fail('EXECUTION_BACKEND_INVALID', 'internal', `Execution backend operation is missing: ${name}.`);
  }
}

function delay(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

function tokenIdentity(token) { return `${token.slot}:${token.generation}`; }

const ACCESS_MODES = new Set(['read', 'write', 'read-write', 'atomic-observe-relaxed-device', 'atomic-update-relaxed-device']);

function requestedViewAccess(mode) {
  if (mode === 'read' || mode === 'atomic-observe-relaxed-device') return 'read';
  if (mode === 'write') return 'write';
  return 'read-write';
}

function viewAllows(actual, requested) {
  return actual === 'read-write' || actual === requested;
}

function normalizeAccesses(value, argumentValues, memoryLeases, widened) {
  const hasView = argumentValues.some((entry) => entry?.kind === 'device-view');
  if (value === undefined && !widened && !hasView) return Object.freeze([]);
  if (!Array.isArray(value)) fail('EXECUTION_ACCESSES_REQUIRED', 'validation', 'Widened scheduling or device-view use requires an explicit bounded access set.');
  const deviceIndexes = argumentValues.flatMap((entry, index) => ['device-memory', 'device-view'].includes(entry?.kind) ? [index] : []);
  if (value.length !== deviceIndexes.length) fail('EXECUTION_ACCESSES_INVALID', 'validation', 'The access set must contain exactly one entry for each device-memory or device-view argument.', { expected: deviceIndexes.length, actual: value.length });
  return Object.freeze(value.map((entry, accessIndex) => {
    if (!plainObject(entry) || Object.keys(entry).some((key) => !['argumentIndex', 'byteOffset', 'byteLength', 'mode', 'dtype'].includes(key))) fail('EXECUTION_ACCESS_INVALID', 'validation', 'Access declaration contains unknown fields.', { accessIndex });
    const argumentIndex = entry.argumentIndex;
    if (!deviceIndexes.includes(argumentIndex) || value.some((other, index) => index < accessIndex && other?.argumentIndex === argumentIndex)) fail('EXECUTION_ACCESS_INVALID', 'validation', 'Access argumentIndex must uniquely select a device-memory or device-view argument.', { accessIndex, argumentIndex });
    if (!Number.isSafeInteger(entry.byteOffset) || entry.byteOffset < 0 || !Number.isSafeInteger(entry.byteLength) || entry.byteLength < 1 || !ACCESS_MODES.has(entry.mode)) fail('EXECUTION_ACCESS_INVALID', 'validation', 'Access range or mode is invalid.', { accessIndex });
    const leaseIndex = deviceIndexes.indexOf(argumentIndex);
    const lease = memoryLeases[leaseIndex];
    const start = lease.byteOffset + entry.byteOffset;
    const end = start + entry.byteLength;
    const rangeEnd = lease.rangeEnd ?? lease.byteLength;
    if (!Number.isSafeInteger(end) || end > rangeEnd) fail('EXECUTION_ACCESS_RANGE', 'validation', 'Access range exceeds its declared memory capability.', { accessIndex });
    const requested = requestedViewAccess(entry.mode);
    if (lease.viewAccess && !viewAllows(lease.viewAccess, requested)) fail('MEMORY_VIEW_ACCESS_DENIED', 'validation', 'Execution access exceeds the device view access role.', { accessIndex, declared: lease.viewAccess, requested });
    const atomic = entry.mode.startsWith('atomic-');
    if (atomic && !['u32', 'u64'].includes(entry.dtype)) fail('EXECUTION_ACCESS_ATOMIC_TYPE', 'validation', 'Atomic access requires exact u32 or u64 dtype.', { accessIndex });
    if (!atomic && Object.hasOwn(entry, 'dtype')) fail('EXECUTION_ACCESS_ATOMIC_TYPE', 'validation', 'Ordinary access must not declare an atomic dtype.', { accessIndex });
    const width = entry.dtype === 'u64' ? 8 : 4;
    if (atomic && (start % width !== 0 || entry.byteLength % width !== 0)) fail('EXECUTION_ACCESS_ATOMIC_ALIGNMENT', 'validation', 'Atomic access range must be naturally aligned and whole-element sized.', { accessIndex });
    return Object.freeze({ native: lease.native, start, end, mode: entry.mode, ...(atomic ? { dtype: entry.dtype } : {}) });
  }));
}

function rangesOverlap(left, right) { return left.native === right.native && left.start < right.end && right.start < left.end; }
function atomicCompatible(left, right) { return left.mode.startsWith('atomic-') && right.mode.startsWith('atomic-') && left.dtype === right.dtype; }
function ordinaryConflict(left, right) { return rangesOverlap(left, right) && !atomicCompatible(left, right) && !(left.mode === 'read' && right.mode === 'read'); }

function failureRecord(error, { includeDetails = false, trustedDetails = false } = {}) {
  return Object.freeze({
    code: typeof error?.code === 'string' ? error.code : 'EXECUTION_ASYNC_FAILURE',
    category: typeof error?.category === 'string' ? error.category : 'deferred-driver',
    operation: failureOperation(error?.operation, 'execution.operation.status'),
    operationId: Number.isSafeInteger(error?.operationId) ? error.operationId : null,
    message: boundedFailureString(error?.message) ?? 'Asynchronous execution failed.',
    healthBefore: error?.healthBefore ?? null,
    healthAfter: error?.healthAfter ?? null,
    ...(includeDetails ? { details: trustedDetails ? error.details : approvedFailureDetails(error?.details) } : {}),
  });
}

export class ExecutionManager {
  #registry;
  #contextToken;
  #memory;
  #views;
  #mailboxes;
  #policy;
  #limits;
  #operations;
  #clock;
  #sleep;
  #streamTokens = [];
  #pendingOperations = new Map();
  #moduleCount = 0;
  #functionCount = 0;
  #completionCount = 0;
  #preparedDagCount = 0;
  #moduleDescriptors = new Map();
  #functionDescriptors = new Map();
  #rollbackFailure = null;

  constructor({ registry, contextToken, memory, views = null, mailboxes = null, policy = {}, deviceLimits, operations, clock = () => Date.now(), sleep = delay }) {
    if (!registry || typeof registry.allocate !== 'function' || typeof registry.acquire !== 'function') fail('EXECUTION_REGISTRY_INVALID', 'internal', 'Execution manager requires a resource registry.');
    if (!memory || typeof memory.acquireForExecution !== 'function') fail('EXECUTION_MEMORY_INVALID', 'internal', 'Execution manager requires the internal memory lease port.');
    if (!plainObject(deviceLimits)) fail('EXECUTION_LIMITS_INVALID', 'internal', 'Execution manager requires device launch limits.');
    for (const field of ['maxThreadsPerBlock', 'maxBlockDimX', 'maxBlockDimY', 'maxBlockDimZ', 'maxGridDimX', 'maxGridDimY', 'maxGridDimZ', 'maxSharedMemoryPerBlock']) if (!Number.isSafeInteger(deviceLimits[field]) || deviceLimits[field] < 1) fail('EXECUTION_LIMITS_INVALID', 'internal', 'Device launch limit is invalid.', { field });
    assertOperations(operations);
    this.#registry = registry;
    this.#contextToken = contextToken;
    this.#memory = memory;
    this.#views = views;
    this.#mailboxes = mailboxes;
    this.#policy = normalizeExecutionPolicy(policy);
    this.#limits = Object.freeze({ ...deviceLimits });
    this.#operations = operations;
    this.#clock = clock;
    this.#sleep = sleep;
  }

  get policy() { return this.#policy; }

  async initialize(operationId = 0) {
    this.#assertAdmission();
    if (this.#streamTokens.length > 0) fail('EXECUTION_ALREADY_INITIALIZED', 'internal', 'Execution manager is already initialized.');
    for (let index = 0; index < this.#policy.maxPendingGpuOperations; index += 1) {
      const native = await this.#operations.createStream({ operationId });
      try {
        const token = this.#registry.allocate({
          kind: 'stream', value: Object.freeze({ native, index }), parent: this.#contextToken,
          dispose: async (record) => Object.freeze({ kind: 'stream', destroyed: true, backend: await this.#operations.destroyStream({ native: record.native, operationId: null }) ?? null }),
        });
        this.#streamTokens.push(token);
      } catch (primaryError) {
        try {
          await this.#operations.destroyStream({ native, operationId });
        } catch (cleanupError) {
          this.#rollbackFailure ??= combinedRollbackError({
            code: 'EXECUTION_STREAM_ROLLBACK_FAILED',
            message: 'Stream registration failed and native stream rollback cleanup was unproved.',
            operation: 'execution.initialize',
            operationId,
            primaryError,
            primaryFallbackCode: 'EXECUTION_STREAM_REGISTRATION_FAILED',
            primaryFallbackOperation: 'execution.stream.register',
            cleanupErrors: [cleanupError],
            cleanupFallbackCode: 'EXECUTION_STREAM_CLEANUP_UNPROVED',
            cleanupFallbackOperation: 'execution.stream.destroy',
            registry: this.#registry,
            unprovedResources: [{ kind: 'stream', registered: false }],
            restartRequired: this.#operations.restartRequired,
          });
          throw this.#rollbackFailure;
        }
        throw primaryError;
      }
    }
    return this.summary();
  }

  summary() {
    const rollbackFailure = this.#admissionFailure();
    return Object.freeze({
      policy: this.#policy,
      moduleCount: this.#moduleCount,
      functionCount: this.#functionCount,
      completionCount: this.#completionCount,
      preparedDagCount: this.#preparedDagCount,
      inFlight: this.#pendingOperations.size > 0,
      pendingOperation: this.#pendingOperations.size > 0,
      pendingOperationCount: this.#pendingOperations.size,
      privateStream: this.#streamTokens.length > 0,
      privateStreamCount: this.#streamTokens.length,
      ...(rollbackFailure ? {
        unprovedRollbackCount: 1,
        rollbackFailure: failureRecord(rollbackFailure, { includeDetails: true, trustedDetails: true }),
      } : {}),
    });
  }

  assertCommandAllowed(command, operationId = null) {
    if (this.#pendingOperations.size === 0) return;
    if (PENDING_OPERATION_COMMANDS.has(command)) return;
    if (['execution.submit', 'execution.prepared.submit', 'memory.transfer.h2d', 'memory.transfer.d2h', 'memory.transfer.d2d'].includes(command)) {
      if (this.#pendingOperations.size < this.#policy.maxPendingGpuOperations) return;
      if (this.#policy.maxPendingGpuOperations > 1) fail('EXECUTION_BUSY', 'backpressure', 'The bounded pending-operation capacity is exhausted.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
    }
    fail('EXECUTION_COMMAND_BLOCKED', 'backpressure', 'DriverActor command is unavailable while a GPU operation is pending.', { command }, { operationId });
  }

  async loadModule({ format, bytes, operationId = null }) {
    this.#assertAdmission();
    if (!['ptx', 'cubin'].includes(format)) fail('EXECUTION_MODULE_FORMAT', 'unsupported', 'Module format must be PTX or cubin.', { format });
    const owned = moduleBytes(format, bytes, this.#policy.maxModuleBytes);
    if (this.#streamTokens.length === 0) await this.initialize(operationId);
    const sha256 = createHash('sha256').update(owned).digest('hex');
    const native = await this.#operations.loadModule({ format, bytes: owned, operationId });
    let token;
    try {
      token = this.#registry.allocate({
        kind: 'module', value: Object.freeze({ native, format, byteLength: owned.byteLength, sha256 }), parent: this.#contextToken,
        dispose: async (record) => Object.freeze({ kind: 'module', unloaded: true, backend: await this.#operations.unloadModule({ native: record.native, operationId: null }) ?? null }),
      });
      this.#moduleCount += 1;
    } catch (primaryError) {
      try {
        await this.#operations.unloadModule({ native, operationId });
      } catch (cleanupError) {
        this.#rollbackFailure ??= combinedRollbackError({
          code: 'EXECUTION_MODULE_ROLLBACK_FAILED',
          message: 'Module registration failed and native module rollback cleanup was unproved.',
          operation: 'execution.module.load',
          operationId,
          primaryError,
          primaryFallbackCode: 'EXECUTION_MODULE_REGISTRATION_FAILED',
          primaryFallbackOperation: 'execution.module.register',
          cleanupErrors: [cleanupError],
          cleanupFallbackCode: 'EXECUTION_MODULE_CLEANUP_UNPROVED',
          cleanupFallbackOperation: 'execution.module.unload',
          registry: this.#registry,
          unprovedResources: [{ kind: 'module', registered: false }],
          restartRequired: this.#operations.restartRequired,
        });
        throw this.#rollbackFailure;
      }
      throw primaryError;
    }
    this.#moduleDescriptors.set(`${token.slot}:${token.generation}`, Object.freeze({ format, byteLength: owned.byteLength, sha256 }));
    return this.#moduleDescriptor(token, this.#registry.get(token, { kind: 'module' }), operationId);
  }

  moduleStatus(token, operationId = null) { return this.#moduleDescriptor(token, this.#registry.get(token, { kind: 'module' }), operationId); }

  async getFunction(moduleToken, { name, parameters, operationId = null }) {
    this.#assertAdmission();
    const normalizedName = functionName(name);
    const normalizedParameters = normalizeParameters(parameters, this.#policy.maxArguments);
    const moduleLease = this.#registry.acquire(moduleToken, { kind: 'module' });
    let native;
    try { native = await this.#operations.getFunction({ moduleNative: moduleLease.value.native, name: normalizedName, operationId }); }
    finally { moduleLease.release(); }
    const token = this.#registry.allocate({ kind: 'function', value: Object.freeze({ native, module: moduleToken, name: normalizedName, parameters: normalizedParameters }), parent: moduleToken, dispose: async () => Object.freeze({ kind: 'function', invalidated: true }) });
    this.#functionCount += 1;
    this.#functionDescriptors.set(`${token.slot}:${token.generation}`, Object.freeze({ name: normalizedName }));
    return this.#functionDescriptor(token, this.#registry.get(token, { kind: 'function' }), operationId);
  }

  functionStatus(token, operationId = null) { return this.#functionDescriptor(token, this.#registry.get(token, { kind: 'function' }), operationId); }

  async prepareOperationDag({ nodes: nodeValues, operationId = null }) {
    this.#assertAdmission();
    if (!Array.isArray(nodeValues)) fail('PREPARED_DAG_REQUEST_INVALID', 'validation', 'Prepared operation DAG nodes must be an array.');
    const functionLeases = new Map();
    try {
      const privateById = new Map();
      const semanticNodes = nodeValues.map((node, inputIndex) => {
        if (!plainObject(node) || Object.keys(node).some((key) => !['id', 'kind', 'after', 'functionToken', 'grid', 'block', 'sharedMemoryBytes', 'arguments', 'accesses'].includes(key))
            || !['id', 'kind', 'after', 'functionToken', 'grid', 'block', 'sharedMemoryBytes', 'arguments', 'accesses'].every((key) => Object.hasOwn(node, key))) {
          fail('PREPARED_DAG_NODE_INVALID', 'validation', 'Prepared operation DAG node fields are invalid.', { inputIndex });
        }
        const acquiredFunctionLease = this.#registry.acquire(node.functionToken, { kind: 'function' });
        const functionKey = tokenIdentity(node.functionToken);
        let functionLease = functionLeases.get(functionKey);
        if (!functionLease) {
          functionLease = acquiredFunctionLease;
          functionLeases.set(functionKey, functionLease);
        } else {
          acquiredFunctionLease.release();
        }
        const parameters = functionLease.value.parameters;
        if (parameters.some((parameter) => parameter.kind.startsWith('publication-mailbox-'))) {
          fail('PREPARED_DAG_PARAMETER_UNSUPPORTED', 'unsupported', 'The first prepared DAG profile does not accept publication-mailbox parameters.', { inputIndex });
        }
        if (!Array.isArray(node.arguments) || node.arguments.length !== parameters.length) fail('PREPARED_DAG_ARGUMENTS_INVALID', 'validation', 'Prepared node argument count must match its function schema.', { inputIndex });
        const privateArguments = [];
        const semanticArguments = node.arguments.map((entry, argumentIndex) => {
          const parameter = parameters[argumentIndex];
          if (exactFields(entry, ['binding'])) {
            privateArguments.push(Object.freeze({ binding: entry.binding, kind: parameter.kind }));
            return { binding: entry.binding, kind: parameter.kind };
          }
          if (!exactFields(entry, ['kind', 'value']) || entry.kind !== parameter.kind || parameter.kind === 'device-memory') {
            fail('PREPARED_DAG_ARGUMENT_INVALID', 'validation', 'Prepared arguments must be exact named bindings or fixed scalar values.', { inputIndex, argumentIndex });
          }
          const packed = packParameterValues([parameter], [entry.value]).buffer;
          privateArguments.push(Object.freeze({ kind: entry.kind, value: entry.value }));
          return { kind: entry.kind, packedHex: Buffer.from(packed).toString('hex') };
        });
        const grid = dimensions(node.grid, 'grid');
        const block = dimensions(node.block, 'block');
        this.#validateLaunchBounds(grid, block, node.sharedMemoryBytes);
        const moduleRecord = this.#registry.get(functionLease.value.module, { kind: 'module' });
        const semantic = {
          id: node.id,
          kind: node.kind,
          after: Array.isArray(node.after) ? [...node.after] : node.after,
          executable: {
            moduleSha256: moduleRecord.sha256,
            name: functionLease.value.name,
            parameters: parameters.map((parameter) => ({ kind: parameter.kind })),
          },
          grid,
          block,
          sharedMemoryBytes: node.sharedMemoryBytes,
          arguments: semanticArguments,
          accesses: Array.isArray(node.accesses) ? node.accesses.map((entry) => plainObject(entry) ? { ...entry } : entry) : node.accesses,
        };
        privateById.set(node.id, Object.freeze({
          id: node.id,
          functionToken: node.functionToken,
          functionValue: functionLease.value,
          parameters,
          grid,
          block,
          sharedMemoryBytes: node.sharedMemoryBytes,
          arguments: Object.freeze(privateArguments),
          accesses: semantic.accesses,
        }));
        return semantic;
      });
      const normalized = normalizePreparedOperationDag({
        nodes: semanticNodes,
        executionProfile: { maxPendingGpuOperations: this.#policy.maxPendingGpuOperations, deviceLimits: this.#limits },
      });
      const record = {
        contract: normalized.contract,
        sha256: normalized.sha256,
        nodeCount: normalized.nodeCount,
        edgeCount: normalized.edgeCount,
        bindings: normalized.bindings,
        semanticNodes: normalized.nodes,
        submissionOrder: normalized.submissionOrder,
        nodes: Object.freeze(normalized.submissionOrder.map((id) => privateById.get(id))),
        functionLeases: Object.freeze([...functionLeases.values()]),
        functionLeasesReleased: false,
      };
      const token = this.#registry.allocate({
        kind: 'prepared-dag',
        value: record,
        parent: this.#contextToken,
        dispose: async (value) => {
          if (!value.functionLeasesReleased) {
            value.functionLeasesReleased = true;
            for (let index = value.functionLeases.length - 1; index >= 0; index -= 1) value.functionLeases[index].release();
          }
          return Object.freeze({ kind: 'prepared-dag', logicalClosed: true, sha256: value.sha256 });
        },
      });
      this.#preparedDagCount += 1;
      return this.#preparedDagDescriptor(token, record, operationId);
    } catch (error) {
      for (const lease of [...functionLeases.values()].reverse()) lease.release();
      throw error;
    }
  }

  preparedOperationDagStatus(token, operationId = null) {
    return this.#preparedDagDescriptor(token, this.#registry.get(token, { kind: 'prepared-dag' }), operationId);
  }

  async releasePreparedOperationDag(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'prepared-dag' });
    const closed = await this.#registry.close(token);
    this.#preparedDagCount -= 1;
    return Object.freeze({
      schemaVersion: 1,
      released: Object.freeze({ kind: 'prepared-operation-dag', contract: record.contract, sha256: record.sha256, nodeCount: record.nodeCount, edgeCount: record.edgeCount }),
      disposition: closed.disposition,
      operationSequence: operationId,
    });
  }

  async submitPreparedOperationDag(preparedToken, { bindings: bindingValues, after = null, operationId = null }) {
    this.#assertAdmission();
    if (this.#pendingOperations.size >= this.#policy.maxPendingGpuOperations) fail('EXECUTION_BUSY', 'backpressure', 'The bounded pending-operation capacity is exhausted.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
    const preparedLease = this.#registry.acquire(preparedToken, { kind: 'prepared-dag' });
    const memoryLeases = [];
    let dependencyLease = null;
    let eventToken = null;
    let eventNative = null;
    let submittedNodeCount = 0;
    let ownershipTransferred = false;
    try {
      if (!Array.isArray(bindingValues) || bindingValues.length !== preparedLease.value.bindings.length) fail('PREPARED_DAG_BINDINGS_INVALID', 'validation', 'Prepared DAG submission must supply every binding exactly once.');
      const supplied = new Map();
      for (const entry of bindingValues) {
        if (!plainObject(entry) || typeof entry.name !== 'string' || supplied.has(entry.name)) fail('PREPARED_DAG_BINDING_INVALID', 'validation', 'Prepared DAG binding records must have unique names.');
        supplied.set(entry.name, entry);
      }
      const resolved = new Map();
      for (const binding of preparedLease.value.bindings) {
        const entry = supplied.get(binding.name);
        if (!entry) fail('PREPARED_DAG_BINDING_MISSING', 'validation', 'Prepared DAG submission is missing a required binding.', { binding: binding.name });
        if (binding.kind !== 'device-memory') {
          if (!exactFields(entry, ['name', 'kind', 'value']) || entry.kind !== binding.kind) fail('PREPARED_DAG_BINDING_KIND', 'validation', 'Prepared scalar binding kind is invalid.', { binding: binding.name });
          packParameterValues([{ kind: binding.kind }], [entry.value]);
          resolved.set(binding.name, Object.freeze({ kind: binding.kind, value: entry.value, argument: Object.freeze({ kind: binding.kind, value: entry.value }) }));
          continue;
        }
        let lease;
        let argument;
        if (exactFields(entry, ['name', 'kind', 'memory', 'byteOffset']) && entry.kind === 'device-memory') {
          lease = this.#memory.acquireForExecution(entry.memory, entry.byteOffset);
          argument = Object.freeze({ kind: 'device-memory', memory: entry.memory, byteOffset: entry.byteOffset });
        } else if (exactFields(entry, ['name', 'kind', 'view']) && entry.kind === 'device-view') {
          if (!this.#views || typeof this.#views.acquire !== 'function') fail('EXECUTION_VIEW_UNAVAILABLE', 'unsupported', 'Device-view prepared binding support is unavailable.');
          const viewLease = this.#views.acquire(entry.view);
          let memoryLease;
          try { memoryLease = this.#memory.acquireForExecution(viewLease.memory, viewLease.byteOffset); }
          catch (error) { viewLease.release(); throw error; }
          let released = false;
          lease = Object.freeze({
            native: memoryLease.native,
            byteOffset: viewLease.byteOffset,
            byteLength: memoryLease.byteLength,
            rangeEnd: viewLease.byteOffset + viewLease.byteLength,
            viewAccess: viewLease.access,
            release() {
              if (released) return;
              released = true;
              memoryLease.release();
              viewLease.release();
            },
          });
          argument = Object.freeze({ kind: 'device-view', view: entry.view });
        } else {
          fail('PREPARED_DAG_BINDING_KIND', 'validation', 'Prepared device binding must be an exact device-memory or device-view record.', { binding: binding.name });
        }
        memoryLeases.push(lease);
        resolved.set(binding.name, Object.freeze({ kind: 'device-memory', argument, lease }));
      }
      if (supplied.size !== resolved.size) fail('PREPARED_DAG_BINDING_EXTRA', 'validation', 'Prepared DAG submission contains an unknown binding.');

      let dependency = null;
      if (after !== null) {
        dependencyLease = this.#registry.acquire(after, { kind: 'operation' });
        if (dependencyLease.value.submissionSequence >= operationId) fail('EXECUTION_DEPENDENCY_ORDER', 'validation', 'Dependency must be an earlier operation from this runtime epoch.', { operationId });
        if (dependencyLease.value.state === 'failed' || dependencyLease.value.state === 'orphaned') fail('EXECUTION_DEPENDENCY_TERMINAL', 'validation', 'Failed or orphaned work cannot be used as a dependency.', { state: dependencyLease.value.state });
        dependency = dependencyLease.value.state === 'pending' ? dependencyLease.value : null;
      }

      const accessesByNode = new Map();
      for (const node of preparedLease.value.nodes) {
        const argumentValues = [];
        const accessLeases = [];
        node.arguments.forEach((argument) => {
          if (Object.hasOwn(argument, 'binding')) {
            const value = resolved.get(argument.binding);
            argumentValues.push(value.argument);
            if (argument.kind === 'device-memory') accessLeases.push(value.lease);
          } else {
            argumentValues.push({ kind: argument.kind, value: argument.value });
          }
        });
        const accesses = normalizeAccesses(node.accesses, argumentValues, accessLeases, true);
        accessesByNode.set(node.id, accesses);
      }
      const ancestors = new Map();
      const semanticById = new Map(preparedLease.value.semanticNodes.map((node) => [node.id, node]));
      for (const nodeId of preparedLease.value.submissionOrder) {
        const node = semanticById.get(nodeId);
        const values = new Set();
        for (const predecessor of node.after) {
          values.add(predecessor);
          for (const ancestor of ancestors.get(predecessor) ?? []) values.add(ancestor);
        }
        ancestors.set(node.id, values);
      }
      for (let leftIndex = 0; leftIndex < preparedLease.value.semanticNodes.length; leftIndex += 1) {
        const left = preparedLease.value.semanticNodes[leftIndex];
        for (let rightIndex = leftIndex + 1; rightIndex < preparedLease.value.semanticNodes.length; rightIndex += 1) {
          const right = preparedLease.value.semanticNodes[rightIndex];
          if (ancestors.get(left.id)?.has(right.id) || ancestors.get(right.id)?.has(left.id)) continue;
          for (const leftAccess of accessesByNode.get(left.id)) for (const rightAccess of accessesByNode.get(right.id)) {
            if (ordinaryConflict(leftAccess, rightAccess)) fail('PREPARED_DAG_RESOURCE_HAZARD', 'validation', 'Unordered prepared nodes have an overlapping ordinary resource conflict.', { nodeCount: preparedLease.value.nodeCount });
          }
        }
      }
      const aggregateAccesses = Object.freeze([...accessesByNode.values()].flat());
      for (const pending of this.#pendingOperations.values()) {
        if (dependency === pending.record) continue;
        for (const currentAccess of aggregateAccesses) for (const priorAccess of pending.record.accesses) {
          if (ordinaryConflict(currentAccess, priorAccess)) fail('EXECUTION_RESOURCE_HAZARD', 'backpressure', 'Overlapping ordinary access requires an explicit dependency on the pending operation.');
        }
      }

      const pointers = new Map();
      const launches = [];
      for (const node of preparedLease.value.nodes) {
        const values = [];
        for (const argument of node.arguments) {
          if (!Object.hasOwn(argument, 'binding')) {
            values.push(argument.value);
            continue;
          }
          const value = resolved.get(argument.binding);
          if (argument.kind !== 'device-memory') {
            values.push(value.value);
            continue;
          }
          let pointer = pointers.get(argument.binding);
          if (pointer === undefined) {
            pointer = await this.#operations.devicePointer({ native: value.lease.native, byteOffset: value.lease.byteOffset, operationId });
            pointers.set(argument.binding, pointer);
          }
          values.push(pointer);
        }
        launches.push(Object.freeze({ node, parameterBuffer: packParameterValues(node.parameters, values).buffer }));
      }

      if (this.#streamTokens.length === 0) await this.initialize(operationId);
      const streamToken = dependency?.streamToken ?? this.#streamTokens.find((candidate) => ![...this.#pendingOperations.values()].some((entry) => tokenIdentity(entry.streamToken) === tokenIdentity(candidate)));
      if (!streamToken) fail('EXECUTION_BUSY', 'backpressure', 'No private execution stream is available.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
      const stream = this.#registry.get(streamToken, { kind: 'stream' });
      eventNative = await this.#operations.createEvent({ operationId });
      eventToken = this.#registry.allocate({ kind: 'event', value: Object.freeze({ native: eventNative }), parent: streamToken, dispose: async (record) => Object.freeze({ kind: 'event', destroyed: true, backend: await this.#operations.destroyEvent({ native: record.native, operationId: null }) ?? null }) });
      for (const launch of launches) {
        await this.#operations.submitLaunch({
          functionNative: launch.node.functionValue.native,
          streamNative: stream.native,
          config: Object.freeze({ grid: launch.node.grid, block: launch.node.block, sharedMemoryBytes: launch.node.sharedMemoryBytes }),
          parameterBuffer: launch.parameterBuffer,
          operationId,
        });
        submittedNodeCount += 1;
      }
      try { await this.#operations.recordEvent({ eventNative, streamNative: stream.native, operationId }); }
      catch (error) { throw this.#operations.restartRequired({ code: 'PREPARED_DAG_EVENT_PROVENANCE_LOST', message: 'Prepared DAG nodes were submitted but final completion provenance could not be established.', details: { nodeCount: preparedLease.value.nodeCount, submittedNodeCount }, operationId }); }

      const record = {
        kind: 'prepared-batch', state: 'pending', eventToken, streamToken, preparedToken, preparedLease, memoryLeases, dependencyLease,
        accesses: aggregateAccesses, preparedSha256: preparedLease.value.sha256, nodeCount: preparedLease.value.nodeCount, edgeCount: preparedLease.value.edgeCount,
        submissionSequence: operationId, startedAt: this.#clock(), pollCount: 0, terminal: null,
      };
      let operationToken;
      try {
        operationToken = this.#registry.allocate({
          kind: 'operation', value: record, parent: this.#contextToken,
          dispose: async (value) => {
            if (value.state === 'pending') fail('EXECUTION_OPERATION_BUSY', 'backpressure', 'Pending GPU operation cannot be closed.', { operationId: value.submissionSequence });
            if (value.state === 'orphaned') fail('EXECUTION_OPERATION_ORPHANED', 'restart-required', 'Orphaned GPU operation cannot claim logical cleanup.', { operationId: value.submissionSequence });
            return Object.freeze({ kind: 'operation', logicalClosed: true, terminalState: value.state });
          },
        });
      } catch (error) {
        throw this.#operations.restartRequired({ code: 'PREPARED_DAG_OPERATION_REGISTRATION_LOST', message: 'Prepared DAG completion provenance exists but logical operation ownership could not be registered.', details: { nodeCount: preparedLease.value.nodeCount, submittedNodeCount }, operationId });
      }
      ownershipTransferred = true;
      this.#pendingOperations.set(tokenIdentity(operationToken), Object.freeze({ operationToken, streamToken, record }));
      return this.#operationDescriptor(operationToken, record, operationId);
    } catch (error) {
      if (submittedNodeCount > 0) {
        ownershipTransferred = true;
        if (error?.category === 'restart-required') throw error;
        throw this.#operations.restartRequired({
          code: 'PREPARED_DAG_PARTIAL_SUBMISSION',
          message: 'Prepared DAG submission failed after earlier nodes may have entered the private stream; process restart is required.',
          details: { nodeCount: preparedLease.value.nodeCount, submittedNodeCount, causeCode: error?.code ?? null },
          operationId,
        });
      }
      if (eventNative !== null) {
        try {
          if (eventToken !== null) await this.#registry.close(eventToken);
          else await this.#operations.destroyEvent({ native: eventNative, operationId });
        } catch (cleanupError) {
          throw combinedRollbackError({
            code: 'PREPARED_DAG_SUBMIT_ROLLBACK_FAILED',
            message: 'Prepared DAG submission failed and completion-event rollback cleanup was unproved.',
            operation: 'execution.prepared.submit',
            operationId,
            primaryError: error,
            primaryFallbackCode: 'PREPARED_DAG_SUBMIT_FAILED',
            primaryFallbackOperation: 'execution.prepared.submit',
            cleanupErrors: [cleanupError],
            cleanupFallbackCode: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
            cleanupFallbackOperation: eventToken === null ? 'execution.event.destroy' : 'resource.close',
            registry: this.#registry,
            unprovedResources: [{ kind: 'event', registered: eventToken !== null }],
            restartRequired: this.#operations.restartRequired,
          });
        }
      }
      throw error;
    } finally {
      if (!ownershipTransferred) {
        for (let index = memoryLeases.length - 1; index >= 0; index -= 1) memoryLeases[index].release();
        dependencyLease?.release();
        preparedLease.release();
      }
    }
  }

  async submit(functionToken, { grid: gridValue, block: blockValue, sharedMemoryBytes = 0, arguments: argumentValues, after = null, accesses: accessValues, operationId = null }) {
    this.#assertAdmission();
    if (this.#pendingOperations.size >= this.#policy.maxPendingGpuOperations) fail('EXECUTION_BUSY', 'backpressure', 'The bounded pending-operation capacity is exhausted.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
    const grid = dimensions(gridValue, 'grid');
    const block = dimensions(blockValue, 'block');
    this.#validateLaunchBounds(grid, block, sharedMemoryBytes);
    if (!Array.isArray(argumentValues)) fail('EXECUTION_ARGUMENTS_INVALID', 'validation', 'Launch arguments must be an array.');
    const functionLease = this.#registry.acquire(functionToken, { kind: 'function' });
    const memoryLeases = [];
    const mailboxLeases = [];
    let dependencyLease = null;
    let eventToken = null;
    let eventNative = null;
    let submitted = false;
    let ownershipTransferred = false;
    try {
      const values = [];
      const mailboxGroups = new Map();
      if (argumentValues.length !== functionLease.value.parameters.length) fail('EXECUTION_ARGUMENT_COUNT', 'validation', 'Launch argument count must exactly match the declared parameter count.', { expected: functionLease.value.parameters.length, actual: argumentValues.length });
      for (let index = 0; index < functionLease.value.parameters.length; index += 1) {
        const parameter = functionLease.value.parameters[index];
        const argument = argumentValues[index];
        if (parameter.kind === 'device-memory') {
          if (!plainObject(argument) || !['device-memory', 'device-view'].includes(argument.kind)) fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Device argument does not match its declared kind.', { index });
          let lease;
          if (argument.kind === 'device-memory') {
            if (Object.keys(argument).some((key) => !['kind', 'memory', 'byteOffset'].includes(key)) || !Object.hasOwn(argument, 'memory')) fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Device-memory argument is invalid.', { index });
            lease = this.#memory.acquireForExecution(argument.memory, argument.byteOffset ?? 0);
          } else {
            if (Object.keys(argument).some((key) => !['kind', 'view'].includes(key)) || !Object.hasOwn(argument, 'view')) fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Device-view argument is invalid.', { index });
            if (!this.#views || typeof this.#views.acquire !== 'function') fail('EXECUTION_VIEW_UNAVAILABLE', 'unsupported', 'Device-view launch support is unavailable.', { index });
            const viewLease = this.#views.acquire(argument.view);
            let memoryLease;
            try { memoryLease = this.#memory.acquireForExecution(viewLease.memory, viewLease.byteOffset); }
            catch (error) { viewLease.release(); throw error; }
            let released = false;
            lease = Object.freeze({
              native: memoryLease.native,
              byteOffset: viewLease.byteOffset,
              byteLength: memoryLease.byteLength,
              rangeEnd: viewLease.byteOffset + viewLease.byteLength,
              viewAccess: viewLease.access,
              release() {
                if (released) return;
                released = true;
                memoryLease.release();
                viewLease.release();
              },
            });
          }
          memoryLeases.push(lease);
          values.push(await this.#operations.devicePointer({ native: lease.native, byteOffset: lease.byteOffset, operationId }));
        } else if (parameter.kind.startsWith('publication-mailbox-')) {
          if (!exactFields(argument, ['kind', 'mailbox', 'generation', 'lane']) || argument.kind !== 'publication-mailbox' || typeof argument.lane !== 'string') fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Mailbox argument does not match its declared kind.', { index });
          if (!this.#mailboxes || typeof this.#mailboxes.acquireForExecution !== 'function') fail('EXECUTION_MAILBOX_UNAVAILABLE', 'unsupported', 'Publication mailbox launch support is unavailable.');
          const key = tokenIdentity(argument.mailbox);
          const direction = parameter.kind === 'publication-mailbox-host-to-device-u32' ? 'host-to-device' : 'device-to-host';
          const group = mailboxGroups.get(key) ?? { token: argument.mailbox, generation: argument.generation, bindings: [], indexes: [] };
          if (group.generation !== argument.generation) fail('EXECUTION_MAILBOX_GENERATION_MISMATCH', 'validation', 'One mailbox cannot carry multiple generations in one launch.', { index });
          group.bindings.push({ lane: argument.lane, direction });
          group.indexes.push(index);
          mailboxGroups.set(key, group);
          values.push(null);
        } else {
          if (!exactFields(argument, ['kind', 'value']) || argument.kind !== parameter.kind) fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Scalar argument does not match its declared kind.', { index, expectedKind: parameter.kind });
          values.push(argument.value);
        }
      }
      for (const group of mailboxGroups.values()) {
        const lease = this.#mailboxes.acquireForExecution(group.token, group.generation, group.bindings);
        mailboxLeases.push(lease);
        group.indexes.forEach((argumentIndex, pointerIndex) => { values[argumentIndex] = lease.pointers[pointerIndex]; });
      }
      let dependency = null;
      if (after !== null) {
        dependencyLease = this.#registry.acquire(after, { kind: 'operation' });
        if (dependencyLease.value.submissionSequence >= operationId) fail('EXECUTION_DEPENDENCY_ORDER', 'validation', 'Dependency must be an earlier operation from this runtime epoch.', { operationId });
        if (dependencyLease.value.state === 'failed' || dependencyLease.value.state === 'orphaned') fail('EXECUTION_DEPENDENCY_TERMINAL', 'validation', 'Failed or orphaned work cannot be used as a dependency.', { state: dependencyLease.value.state });
        dependency = dependencyLease.value.state === 'pending' ? dependencyLease.value : null;
      }
      const accesses = normalizeAccesses(accessValues, argumentValues, memoryLeases, this.#policy.maxPendingGpuOperations > 1);
      for (const pending of this.#pendingOperations.values()) {
        if (dependency === pending.record) continue;
        for (const currentAccess of accesses) for (const priorAccess of pending.record.accesses) {
          if (ordinaryConflict(currentAccess, priorAccess)) fail('EXECUTION_RESOURCE_HAZARD', 'backpressure', 'Overlapping ordinary access requires an explicit dependency on the pending operation.');
        }
      }
      const packed = packParameterValues(functionLease.value.parameters, values);
      const streamToken = dependency?.streamToken ?? this.#streamTokens.find((candidate) => ![...this.#pendingOperations.values()].some((entry) => tokenIdentity(entry.streamToken) === tokenIdentity(candidate)));
      if (!streamToken) fail('EXECUTION_BUSY', 'backpressure', 'No private execution stream is available.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
      const stream = this.#registry.get(streamToken, { kind: 'stream' });
      eventNative = await this.#operations.createEvent({ operationId });
      eventToken = this.#registry.allocate({ kind: 'event', value: Object.freeze({ native: eventNative }), parent: streamToken, dispose: async (record) => Object.freeze({ kind: 'event', destroyed: true, backend: await this.#operations.destroyEvent({ native: record.native, operationId: null }) ?? null }) });
      await this.#operations.submitLaunch({ functionNative: functionLease.value.native, streamNative: stream.native, config: Object.freeze({ grid, block, sharedMemoryBytes }), parameterBuffer: packed.buffer, operationId });
      submitted = true;
      try { await this.#operations.recordEvent({ eventNative, streamNative: stream.native, operationId }); }
      catch (error) { throw this.#operations.restartRequired({ code: 'EXECUTION_EVENT_PROVENANCE_LOST', message: 'Launch was submitted but completion provenance could not be established.', details: { causeCode: error?.code ?? null }, operationId }); }

      const record = {
        kind: 'kernel', state: 'pending', eventToken, streamToken, functionToken, functionLease, memoryLeases, mailboxLeases, dependencyLease, accesses, module: functionLease.value.module, grid, block, sharedMemoryBytes,
        argumentKinds: Object.freeze(functionLease.value.parameters.map((entry) => entry.kind)), submissionSequence: operationId, startedAt: this.#clock(), pollCount: 0, terminal: null,
      };
      let operationToken;
      try {
        operationToken = this.#registry.allocate({
          kind: 'operation', value: record, parent: this.#contextToken,
          dispose: async (value) => {
            if (value.state === 'pending') fail('EXECUTION_OPERATION_BUSY', 'backpressure', 'Pending GPU operation cannot be closed.', { operationId: value.submissionSequence });
            if (value.state === 'orphaned') fail('EXECUTION_OPERATION_ORPHANED', 'restart-required', 'Orphaned GPU operation cannot claim logical cleanup.', { operationId: value.submissionSequence });
            return Object.freeze({ kind: 'operation', logicalClosed: true, terminalState: value.state });
          },
        });
      } catch (error) {
        throw this.#operations.restartRequired({ code: 'EXECUTION_OPERATION_REGISTRATION_LOST', message: 'Launch provenance exists but logical operation ownership could not be registered.', details: { causeCode: error?.code ?? null }, operationId });
      }
      ownershipTransferred = true;
      this.#pendingOperations.set(tokenIdentity(operationToken), Object.freeze({ operationToken, streamToken, record }));
      return this.#operationDescriptor(operationToken, record, operationId);
    } catch (error) {
      if (submitted && error?.category === 'restart-required') { ownershipTransferred = true; throw error; }
      if (eventNative !== null) {
        try {
          if (eventToken !== null) await this.#registry.close(eventToken);
          else await this.#operations.destroyEvent({ native: eventNative, operationId });
        } catch (cleanupError) {
          const combined = combinedRollbackError({
            code: 'EXECUTION_SUBMIT_ROLLBACK_FAILED',
            message: 'Execution submission failed and completion-event rollback cleanup was unproved.',
            operation: 'execution.submit',
            operationId,
            primaryError: error,
            primaryFallbackCode: 'EXECUTION_SUBMIT_FAILED',
            primaryFallbackOperation: 'execution.submit',
            cleanupErrors: [cleanupError],
            cleanupFallbackCode: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
            cleanupFallbackOperation: eventToken === null ? 'execution.event.destroy' : 'resource.close',
            registry: this.#registry,
            unprovedResources: [{ kind: 'event', registered: eventToken !== null }],
            restartRequired: this.#operations.restartRequired,
          });
          if (eventToken === null) this.#rollbackFailure ??= combined;
          throw eventToken === null ? this.#rollbackFailure : combined;
        }
      }
      throw error;
    } finally {
      if (!ownershipTransferred) {
        for (let index = memoryLeases.length - 1; index >= 0; index -= 1) memoryLeases[index].release();
        for (let index = mailboxLeases.length - 1; index >= 0; index -= 1) mailboxLeases[index].release();
        dependencyLease?.release();
        functionLease.release();
      }
    }
  }

  async submitTransfer({ kind, after = null, accesses, leases, enqueue, complete = null, operationId = null }) {
    if (!['host-to-device', 'device-to-host', 'device-to-device'].includes(kind)) fail('EXECUTION_TRANSFER_INVALID', 'internal', 'Transfer operation adapter request is invalid.');
    return this.submitAdapterOperation({ kind, after, accesses, leases, enqueue, complete, operationId, failureProfile: 'transfer' });
  }

  async submitAdapterOperation({ kind, after = null, accesses, leases, enqueue, complete = null, operationId = null, failureProfile = 'adapter' }) {
    let dependencyLease = null;
    let eventToken = null;
    let eventNative = null;
    let submitted = false;
    let ownershipTransferred = false;
    try {
      this.#assertAdmission();
      if (typeof kind !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(kind) || !Array.isArray(accesses) || !Array.isArray(leases) || typeof enqueue !== 'function' || (complete !== null && typeof complete !== 'function') || !['adapter', 'transfer'].includes(failureProfile)) fail('EXECUTION_ADAPTER_INVALID', 'internal', 'Internal operation adapter request is invalid.');
      if (this.#pendingOperations.size >= this.#policy.maxPendingGpuOperations) fail('EXECUTION_BUSY', 'backpressure', 'The bounded pending-operation capacity is exhausted.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
      if (this.#streamTokens.length === 0) await this.initialize(operationId);
      let dependency = null;
      if (after !== null) {
        dependencyLease = this.#registry.acquire(after, { kind: 'operation' });
        if (dependencyLease.value.submissionSequence >= operationId) fail('EXECUTION_DEPENDENCY_ORDER', 'validation', 'Dependency must be an earlier operation from this runtime epoch.', { operationId });
        if (dependencyLease.value.state === 'failed' || dependencyLease.value.state === 'orphaned') fail('EXECUTION_DEPENDENCY_TERMINAL', 'validation', 'Failed or orphaned work cannot be used as a dependency.', { state: dependencyLease.value.state });
        dependency = dependencyLease.value.state === 'pending' ? dependencyLease.value : null;
      }
      for (const pending of this.#pendingOperations.values()) {
        if (dependency === pending.record) continue;
        for (const currentAccess of accesses) for (const priorAccess of pending.record.accesses) {
          if (ordinaryConflict(currentAccess, priorAccess)) fail('EXECUTION_RESOURCE_HAZARD', 'backpressure', 'Overlapping ordinary access requires an explicit dependency on the pending operation.');
        }
      }
      const streamToken = dependency?.streamToken ?? this.#streamTokens.find((candidate) => ![...this.#pendingOperations.values()].some((entry) => tokenIdentity(entry.streamToken) === tokenIdentity(candidate)));
      if (!streamToken) fail('EXECUTION_BUSY', 'backpressure', 'No private execution stream is available.', { operationId, maximum: this.#policy.maxPendingGpuOperations });
      const stream = this.#registry.get(streamToken, { kind: 'stream' });
      eventNative = await this.#operations.createEvent({ operationId });
      eventToken = this.#registry.allocate({ kind: 'event', value: Object.freeze({ native: eventNative }), parent: streamToken, dispose: async (record) => Object.freeze({ kind: 'event', destroyed: true, backend: await this.#operations.destroyEvent({ native: record.native, operationId: null }) ?? null }) });
      await enqueue(stream.native);
      submitted = true;
      try { await this.#operations.recordEvent({ eventNative, streamNative: stream.native, operationId }); }
      catch (error) { throw this.#operations.restartRequired({ code: 'EXECUTION_EVENT_PROVENANCE_LOST', message: `${failureProfile === 'transfer' ? 'Transfer' : 'Adapter operation'} was submitted but completion provenance could not be established.`, details: { causeCode: error?.code ?? null }, operationId }); }
      const record = {
        kind, state: 'pending', eventToken, streamToken, dependencyLease, accesses: Object.freeze(accesses), externalLeases: leases, complete,
        submissionSequence: operationId, startedAt: this.#clock(), pollCount: 0, terminal: null,
      };
      let operationToken;
      try {
        operationToken = this.#registry.allocate({
          kind: 'operation', value: record, parent: this.#contextToken,
          dispose: async (value) => {
            if (value.state === 'pending') fail('EXECUTION_OPERATION_BUSY', 'backpressure', 'Pending GPU operation cannot be closed.', { operationId: value.submissionSequence });
            if (value.state === 'orphaned') fail('EXECUTION_OPERATION_ORPHANED', 'restart-required', 'Orphaned GPU operation cannot claim logical cleanup.', { operationId: value.submissionSequence });
            return Object.freeze({ kind: 'operation', logicalClosed: true, terminalState: value.state });
          },
        });
      } catch (error) {
        throw this.#operations.restartRequired({ code: 'EXECUTION_OPERATION_REGISTRATION_LOST', message: `${failureProfile === 'transfer' ? 'Transfer' : 'Adapter operation'} provenance exists but logical operation ownership could not be registered.`, details: { causeCode: error?.code ?? null }, operationId });
      }
      ownershipTransferred = true;
      this.#pendingOperations.set(tokenIdentity(operationToken), Object.freeze({ operationToken, streamToken, record }));
      return this.#operationDescriptor(operationToken, record, operationId);
    } catch (error) {
      if (submitted && error?.category === 'restart-required') { ownershipTransferred = true; throw error; }
      if (eventNative !== null) {
        try {
          if (eventToken !== null) await this.#registry.close(eventToken);
          else await this.#operations.destroyEvent({ native: eventNative, operationId });
        } catch (cleanupError) {
          const combined = combinedRollbackError({
            code: failureProfile === 'transfer' ? 'EXECUTION_TRANSFER_ROLLBACK_FAILED' : 'EXECUTION_ADAPTER_ROLLBACK_FAILED',
            message: `${failureProfile === 'transfer' ? 'Transfer' : 'Adapter operation'} submission failed and completion-event rollback cleanup was unproved.`,
            operation: kind,
            operationId,
            primaryError: error,
            primaryFallbackCode: failureProfile === 'transfer' ? 'EXECUTION_TRANSFER_FAILED' : 'EXECUTION_ADAPTER_FAILED',
            primaryFallbackOperation: kind,
            cleanupErrors: [cleanupError],
            cleanupFallbackCode: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
            cleanupFallbackOperation: eventToken === null ? 'execution.event.destroy' : 'resource.close',
            registry: this.#registry,
            unprovedResources: [{ kind: 'event', registered: eventToken !== null }],
            restartRequired: this.#operations.restartRequired,
          });
          if (eventToken === null) this.#rollbackFailure ??= combined;
          throw eventToken === null ? this.#rollbackFailure : combined;
        }
      }
      throw error;
    } finally {
      if (!ownershipTransferred) {
        dependencyLease?.release();
        if (Array.isArray(leases)) for (let index = leases.length - 1; index >= 0; index -= 1) leases[index].release();
      }
    }
  }

  async operationStatus(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'operation' });
    if (record.state !== 'pending') return this.#operationDescriptor(token, record, operationId);
    const event = this.#registry.get(record.eventToken, { kind: 'event' });
    let state;
    try {
      state = await this.#operations.queryEvent({ eventNative: event.native, operationId });
      record.pollCount += 1;
    } catch (error) {
      record.pollCount += 1;
      if (error?.category === 'restart-required') { this.#markOrphaned(record, error); throw error; }
      if (this.#pendingOperations.size > 1) {
        const unattributed = this.#operations.restartRequired({
          code: 'EXECUTION_DEFERRED_FAILURE_UNATTRIBUTED',
          message: 'A deferred failure was observed while multiple operations were pending; affected work cannot be attributed safely.',
          details: { causeCode: error?.code ?? null, pendingOperationCount: this.#pendingOperations.size },
          operationId,
        });
        for (const pending of this.#pendingOperations.values()) this.#markOrphaned(pending.record, unattributed);
        throw unattributed;
      }
      await this.#terminalizeFailure(token, record, error, operationId);
      return this.#operationDescriptor(token, record, operationId);
    }
    if (state === 'pending') return this.#operationDescriptor(token, record, operationId);
    if (state !== 'complete') fail('EXECUTION_EVENT_STATE', 'internal', 'Execution backend returned an invalid event state.', { state });
    await this.#terminalizeCompleted(token, record, operationId);
    return this.#operationDescriptor(token, record, operationId);
  }

  async releaseOperation(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'operation' });
    if (record.state === 'pending') fail('EXECUTION_OPERATION_BUSY', 'backpressure', 'Pending GPU operation cannot be closed or represented as cancelled.', { operationId });
    if (record.state === 'orphaned') fail('EXECUTION_OPERATION_ORPHANED', 'restart-required', 'Orphaned GPU operation cannot claim logical cleanup.', { operationId });
    const terminalState = record.state;
    const closed = await this.#registry.close(token);
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'operation', terminalState }), disposition: closed.disposition, operationSequence: operationId });
  }

  async legacyTimeout(token, operationId = null, code = 'EXECUTION_COMPLETION_TIMEOUT', message = 'Launch completion deadline expired; runtime restart is required.') {
    const record = this.#registry.get(token, { kind: 'operation' });
    if (record.state !== 'pending') return this.#operationDescriptor(token, record, operationId);
    const error = this.#operations.restartRequired({ code, message, details: { maxCompletionMilliseconds: this.#policy.maxCompletionMilliseconds, pollCount: record.pollCount }, operationId });
    this.#markOrphaned(record, error);
    throw error;
  }

  async prepareClose(operationId = null) {
    const rollbackFailure = this.#admissionFailure();
    if (rollbackFailure) throw rollbackFailure;
    if (this.#pendingOperations.size === 0) return this.summary();
    const started = this.#clock();
    let pollDelay = 1;
    for (;;) {
      let hasPending = false;
      for (const { operationToken } of [...this.#pendingOperations.values()]) {
        const status = await this.operationStatus(operationToken, operationId);
        if (status.status === 'pending') hasPending = true;
      }
      if (this.#pendingOperations.size === 0) return this.summary();
      if (!hasPending) return this.summary();
      const elapsed = Math.max(0, Math.trunc(this.#clock() - started));
      if (elapsed >= this.#policy.maxCompletionMilliseconds) {
        const { operationToken } = this.#pendingOperations.values().next().value;
        await this.legacyTimeout(operationToken, operationId, 'EXECUTION_CLOSE_TIMEOUT', 'Runtime close could not prove GPU operation terminality before the completion deadline.');
      }
      await this.#sleep(Math.min(pollDelay, this.#policy.maxCompletionMilliseconds - elapsed));
      pollDelay = Math.min(pollDelay * 2, 16);
    }
  }

  async launch(functionToken, options) {
    const operation = await this.submit(functionToken, options);
    const started = this.#clock();
    let pollDelay = 1;
    for (;;) {
      const status = await this.operationStatus(operation.operation, options.operationId ?? null);
      if (status.status === 'completed') { await this.releaseOperation(operation.operation, options.operationId ?? null); return this.#legacyCompletion(status); }
      if (status.status === 'failed') {
        const failure = status.failure;
        await this.releaseOperation(operation.operation, options.operationId ?? null);
        throw new ExecutionError(failure.code, failure.category, failure.message, failure.details ?? {}, {
          operation: failure.operation,
          operationId: failure.operationId ?? options.operationId ?? null,
          healthBefore: failure.healthBefore,
          healthAfter: failure.healthAfter,
        });
      }
      const elapsed = Math.max(0, Math.trunc(this.#clock() - started));
      if (elapsed >= this.#policy.maxCompletionMilliseconds) await this.legacyTimeout(operation.operation, options.operationId ?? null);
      await this.#sleep(Math.min(pollDelay, this.#policy.maxCompletionMilliseconds - elapsed));
      pollDelay = Math.min(pollDelay * 2, 16);
    }
  }

  async releaseFunction(token, operationId = null) {
    const identity = Number.isSafeInteger(token?.slot) && Number.isSafeInteger(token?.generation)
      ? `${token.slot}:${token.generation}`
      : null;
    const remembered = identity === null ? undefined : this.#functionDescriptors.get(identity);
    const record = remembered ?? this.#registry.get(token, { kind: 'function' });
    const closed = await this.#registry.close(token);
    this.#functionCount -= 1;
    if (identity !== null) this.#functionDescriptors.delete(identity);
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'function', name: record.name }), disposition: closed.disposition, operationSequence: operationId });
  }

  async releaseModule(token, operationId = null) {
    const identity = Number.isSafeInteger(token?.slot) && Number.isSafeInteger(token?.generation)
      ? `${token.slot}:${token.generation}`
      : null;
    const remembered = identity === null ? undefined : this.#moduleDescriptors.get(identity);
    const record = remembered ?? this.#registry.get(token, { kind: 'module' });
    const closed = await this.#registry.close(token);
    this.#moduleCount -= 1;
    if (identity !== null) this.#moduleDescriptors.delete(identity);
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'module', format: record.format, byteLength: record.byteLength, sha256: record.sha256 }), disposition: closed.disposition, operationSequence: operationId });
  }

  #operationDescriptor(token, record, observationSequence) {
    const elapsed = Math.max(0, Math.trunc(this.#clock() - record.startedAt));
    const base = record.kind === 'kernel' ? {
      schemaVersion: 1, operation: token, kind: record.kind, status: record.state, module: record.module, function: record.functionToken, grid: record.grid, block: record.block,
      sharedMemoryBytes: record.sharedMemoryBytes, argumentKinds: record.argumentKinds, pollCount: record.pollCount,
      elapsedMilliseconds: Math.min(elapsed, Number.MAX_SAFE_INTEGER), operationSequence: record.submissionSequence, observationSequence, health: this.#operations.health(),
    } : record.kind === 'prepared-batch' ? {
      schemaVersion: 1, operation: token, kind: record.kind, status: record.state, prepared: record.preparedToken,
      preparedSha256: record.preparedSha256, nodeCount: record.nodeCount, edgeCount: record.edgeCount, pollCount: record.pollCount,
      elapsedMilliseconds: Math.min(elapsed, Number.MAX_SAFE_INTEGER), operationSequence: record.submissionSequence, observationSequence, health: this.#operations.health(),
    } : {
      schemaVersion: 1, operation: token, kind: record.kind, status: record.state, pollCount: record.pollCount,
      elapsedMilliseconds: Math.min(elapsed, Number.MAX_SAFE_INTEGER), operationSequence: record.submissionSequence, observationSequence, health: this.#operations.health(),
    };
    if (record.result) base.result = record.result;
    if (record.failure) base.failure = record.failure;
    if (record.orphanReason) base.orphanReason = record.orphanReason;
    return Object.freeze(base);
  }

  #legacyCompletion(status) {
    return Object.freeze({ schemaVersion: 1, status: 'completed', module: status.module, function: status.function, grid: status.grid, block: status.block, sharedMemoryBytes: status.sharedMemoryBytes, argumentKinds: status.argumentKinds, pollCount: status.pollCount, elapsedMilliseconds: Math.min(status.elapsedMilliseconds, this.#policy.maxCompletionMilliseconds), operationSequence: status.operationSequence, health: status.health });
  }

  async #terminalizeCompleted(token, record, operationId) {
    if (record.complete !== null && record.complete !== undefined) {
      try { record.result = Object.freeze(await record.complete()); }
      catch (error) {
        const completionError = typeof error?.code === 'string' && typeof error?.category === 'string'
          ? error
          : new ExecutionError('EXECUTION_TRANSFER_RESULT_FAILED', 'internal', 'Transfer result materialization failed after GPU completion.', {});
        await this.#terminalizeFailure(token, record, completionError, operationId);
        return;
      }
    }
    try { await this.#registry.close(record.eventToken); }
    catch (cleanupError) {
      const combined = combinedRollbackError({
        code: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
        message: 'GPU work completed but completion-event cleanup could not be proved.',
        operation: 'execution.operation.status',
        operationId,
        primaryError: null,
        primaryFallbackCode: 'EXECUTION_COMPLETED',
        primaryFallbackOperation: 'execution.event.query',
        cleanupErrors: [cleanupError],
        cleanupFallbackCode: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
        cleanupFallbackOperation: 'resource.close',
        registry: this.#registry,
        unprovedResources: [{ kind: 'event', registered: true }],
        minimumHealth: 'restart-required',
        restartRequired: this.#operations.restartRequired,
      });
      this.#markOrphaned(record, combined, { includeDetails: true });
      throw combined;
    }
    record.eventToken = null;
    this.#releaseExecutionLeases(record);
    record.state = 'completed';
    record.terminal = true;
    this.#completionCount += 1;
    this.#pendingOperations.delete(tokenIdentity(token));
  }

  async #terminalizeFailure(token, record, error, operationId) {
    try { await this.#registry.close(record.eventToken); }
    catch (cleanupError) {
      const combined = combinedRollbackError({
        code: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
        message: 'GPU failure was observed but completion-event cleanup could not be proved.',
        operation: 'execution.operation.status',
        operationId,
        primaryError: error,
        primaryFallbackCode: 'EXECUTION_ASYNC_FAILURE',
        primaryFallbackOperation: 'execution.event.query',
        cleanupErrors: [cleanupError],
        cleanupFallbackCode: 'EXECUTION_EVENT_CLEANUP_UNPROVED',
        cleanupFallbackOperation: 'resource.close',
        registry: this.#registry,
        unprovedResources: [{ kind: 'event', registered: true }],
        minimumHealth: 'restart-required',
        restartRequired: this.#operations.restartRequired,
      });
      this.#markOrphaned(record, combined, { includeDetails: true });
      throw combined;
    }
    record.eventToken = null;
    this.#releaseExecutionLeases(record);
    record.state = 'failed';
    record.failure = failureRecord(error, { includeDetails: true });
    record.terminal = true;
    this.#pendingOperations.delete(tokenIdentity(token));
  }

  #markOrphaned(record, error, { includeDetails = false } = {}) {
    record.state = 'orphaned';
    record.orphanReason = typeof error?.code === 'string' ? error.code : 'EXECUTION_TERMINALITY_UNPROVED';
    record.failure = failureRecord(error, { includeDetails, trustedDetails: includeDetails });
  }

  #releaseExecutionLeases(record) {
    if (record.leasesReleased) return;
    record.leasesReleased = true;
    for (let index = (record.memoryLeases ?? []).length - 1; index >= 0; index -= 1) record.memoryLeases[index].release();
    for (let index = (record.mailboxLeases ?? []).length - 1; index >= 0; index -= 1) record.mailboxLeases[index].release();
    for (let index = (record.externalLeases ?? []).length - 1; index >= 0; index -= 1) record.externalLeases[index].release();
    record.dependencyLease?.release();
    record.functionLease?.release();
    record.preparedLease?.release();
  }

  #admissionFailure() {
    return this.#rollbackFailure ?? this.#memory.rollbackFailure?.() ?? null;
  }

  #assertAdmission() {
    const rollbackFailure = this.#admissionFailure();
    if (rollbackFailure) throw rollbackFailure;
  }

  #moduleDescriptor(token, record, operationId) { return Object.freeze({ schemaVersion: 1, module: token, format: record.format, byteLength: record.byteLength, sha256: record.sha256, operationSequence: operationId }); }
  #functionDescriptor(token, record, operationId) { return Object.freeze({ schemaVersion: 1, function: token, module: record.module, name: record.name, parameters: record.parameters, operationSequence: operationId }); }

  #preparedDagDescriptor(token, record, operationId) {
    return Object.freeze({
      schemaVersion: 1,
      prepared: token,
      kind: 'prepared-operation-dag',
      contract: record.contract,
      sha256: record.sha256,
      nodeCount: record.nodeCount,
      edgeCount: record.edgeCount,
      bindings: record.bindings,
      realization: 'semantic-single-stream',
      operationSequence: operationId,
    });
  }

  #validateLaunchBounds(grid, block, sharedMemoryBytes) {
    const limits = this.#limits;
    if (grid.x > limits.maxGridDimX || grid.y > limits.maxGridDimY || grid.z > limits.maxGridDimZ || block.x > limits.maxBlockDimX || block.y > limits.maxBlockDimY || block.z > limits.maxBlockDimZ) fail('EXECUTION_DIMENSION_LIMIT', 'validation', 'Launch dimensions exceed device limits.', { grid, block });
    const volume = block.x * block.y * block.z;
    if (!Number.isSafeInteger(volume) || volume > limits.maxThreadsPerBlock) fail('EXECUTION_BLOCK_VOLUME', 'validation', 'Block volume exceeds the device limit.', { volume, maximum: limits.maxThreadsPerBlock });
    if (!Number.isSafeInteger(sharedMemoryBytes) || sharedMemoryBytes < 0 || sharedMemoryBytes > limits.maxSharedMemoryPerBlock) fail('EXECUTION_SHARED_MEMORY', 'validation', 'Shared memory exceeds the device limit.', { sharedMemoryBytes, maximum: limits.maxSharedMemoryPerBlock });
  }
}
