import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';

import { normalizeExecutionPolicy } from '../../execution/index.mjs';
import { deviceViewDtypeWidth, normalizeMemoryPolicy } from '../../memory/index.mjs';
import { isResourceToken } from '../../resource-registry/index.mjs';
import { deserializeError, DriverRuntimeError, validationError } from './errors.mjs';
import { requestRecord } from './protocol.mjs';

export const DRIVER_RUNTIME_TEST = Symbol('cuda-js.driver-runtime.test');
const PUBLIC_OPTION_FIELDS = Object.freeze(['maxPending', 'memory', 'execution', 'selectedDevice']);
const CLIENT_HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3, closed: 4 });

function delay(milliseconds) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }

function workerExecArgv() {
  return process.execArgv.filter((argument) => argument === '--experimental-ffi'
    || argument === '--permission'
    || argument === '--permission-audit'
    || argument === '--allow-ffi'
    || argument === '--allow-worker'
    || argument.startsWith('--allow-fs-read=')
    || argument.startsWith('--allow-fs-write='));
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactOptionFields(options) { return Object.keys(options).every((key) => PUBLIC_OPTION_FIELDS.includes(key)); }

function normalizeSelectedDevice(value) {
  if (value === undefined) return null;
  if (!plainObject(value) || Object.keys(value).sort().join('\0') !== 'architecture\0nativeDevice'
      || !Number.isSafeInteger(value.nativeDevice) || value.nativeDevice < 0
      || !plainObject(value.architecture) || Object.keys(value.architecture).sort().join('\0') !== 'class\0major\0minor'
      || !Number.isSafeInteger(value.architecture.major) || value.architecture.major < 1 || value.architecture.major > 99
      || !Number.isSafeInteger(value.architecture.minor) || value.architecture.minor < 0 || value.architecture.minor > 99
      || value.architecture.class !== `cc-${value.architecture.major}.${value.architecture.minor}`) {
    throw validationError('DRIVER_SELECTED_DEVICE_INVALID', 'Selected device handoff is invalid.');
  }
  return Object.freeze({ nativeDevice: value.nativeDevice, architecture: Object.freeze({ ...value.architecture }) });
}

function freezeRecord(value) {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Uint8Array) return value;
  for (const item of Array.isArray(value) ? value : Object.values(value)) freezeRecord(item);
  return Object.freeze(value);
}

function orphanInventory(lastInventory) {
  if (!lastInventory) return null;
  const resources = lastInventory.resources.map((resource) => ({ ...resource, state: ['live', 'closing'].includes(resource.state) ? 'orphaned' : resource.state }));
  const sourceCounts = lastInventory.counts ?? {};
  const counts = {
    live: 0,
    closing: 0,
    closed: sourceCounts.closed ?? 0,
    orphaned: (sourceCounts.orphaned ?? 0) + (sourceCounts.live ?? 0) + (sourceCounts.closing ?? 0),
  };
  const resourceCount = lastInventory.resourceCount ?? Object.values(counts).reduce((total, count) => total + count, 0);
  const resourcesTruncated = lastInventory.resourcesTruncated ?? Math.max(0, resourceCount - resources.length);
  return freezeRecord({ ...lastInventory, dead: true, counts, resourceCount, resources, resourcesTruncated, reason: 'worker-lost' });
}

function launchPayload(functionToken, options, operationName) {
  if (!isResourceToken(functionToken)) throw validationError('DRIVER_FUNCTION_TOKEN', `${operationName} requires an exact opaque function token.`);
  if (!plainObject(options) || Object.keys(options).some((key) => !['grid', 'block', 'sharedMemoryBytes', 'arguments', 'after', 'accesses'].includes(key))
      || !Object.hasOwn(options, 'grid') || !Object.hasOwn(options, 'block') || !Object.hasOwn(options, 'arguments') || !Array.isArray(options.arguments)) {
    throw validationError('DRIVER_LAUNCH_OPTIONS', `${operationName} options are invalid.`);
  }
  if (options.after !== undefined && options.after !== null && !isResourceToken(options.after)) throw validationError('DRIVER_OPERATION_TOKEN', `${operationName} after must be an exact opaque operation token.`);
  if (options.accesses !== undefined && !Array.isArray(options.accesses)) throw validationError('DRIVER_LAUNCH_OPTIONS', `${operationName} accesses must be an array when supplied.`);
  const copyDimensions = (value) => plainObject(value) ? { ...value } : value;
  const argumentCopies = options.arguments.map((entry) => plainObject(entry) ? { ...entry } : entry);
  const accessCopies = options.accesses === undefined ? undefined : options.accesses.map((entry) => plainObject(entry) ? { ...entry } : entry);
  return {
    functionToken,
    grid: copyDimensions(options.grid),
    block: copyDimensions(options.block),
    sharedMemoryBytes: options.sharedMemoryBytes ?? 0,
    arguments: argumentCopies,
    after: options.after ?? null,
    accesses: accessCopies,
  };
}

function preparedDagPayload(options) {
  if (!plainObject(options) || Object.keys(options).length !== 1 || !Array.isArray(options.nodes)) throw validationError('DRIVER_PREPARED_OPTIONS', 'prepareOperationDag requires exactly one nodes array.');
  return {
    nodes: options.nodes.map((node) => {
      if (!plainObject(node) || !isResourceToken(node.functionToken) || !Array.isArray(node.after) || !Array.isArray(node.arguments) || !Array.isArray(node.accesses)) throw validationError('DRIVER_PREPARED_OPTIONS', 'Prepared DAG nodes are invalid.');
      return {
        ...node,
        after: [...node.after],
        grid: plainObject(node.grid) ? { ...node.grid } : node.grid,
        block: plainObject(node.block) ? { ...node.block } : node.block,
        arguments: node.arguments.map((entry) => plainObject(entry) ? { ...entry } : entry),
        accesses: node.accesses.map((entry) => plainObject(entry) ? { ...entry } : entry),
      };
    }),
  };
}

function preparedSubmissionPayload(token, options) {
  if (!isResourceToken(token)) throw validationError('DRIVER_PREPARED_TOKEN', 'submitPreparedOperationDag requires an exact opaque prepared token.');
  if (!plainObject(options) || Object.keys(options).some((key) => !['bindings', 'after'].includes(key)) || !Array.isArray(options.bindings)) throw validationError('DRIVER_PREPARED_BINDINGS', 'Prepared DAG submission requires a bindings array and optional predecessor.');
  if (options.after !== undefined && options.after !== null && !isResourceToken(options.after)) throw validationError('DRIVER_OPERATION_TOKEN', 'Prepared DAG predecessor must be an exact opaque operation token.');
  return { token, bindings: options.bindings.map((entry) => plainObject(entry) ? { ...entry } : entry), after: options.after ?? null };
}

function operationFailure(status) {
  if (status?.status === 'orphaned') {
    return new DriverRuntimeError('EXECUTION_OPERATION_ORPHANED', 'restart-required', 'GPU operation terminality is unproved; process restart is required.', { orphanReason: status.orphanReason ?? null }, { healthBefore: status.health?.current ?? null, healthAfter: 'restart-required' });
  }
  const failure = status?.failure ?? {};
  return new DriverRuntimeError(
    typeof failure.code === 'string' ? failure.code : 'EXECUTION_ASYNC_FAILURE',
    typeof failure.category === 'string' ? failure.category : 'deferred-driver',
    typeof failure.message === 'string' ? failure.message : 'GPU operation failed asynchronously.',
    failure.details && typeof failure.details === 'object' && !Array.isArray(failure.details) ? failure.details : {},
    {
      operation: failure.operation,
      operationId: failure.operationId,
      healthBefore: failure.healthBefore ?? null,
      healthAfter: failure.healthAfter ?? status?.health?.current ?? null,
    },
  );
}

function legacyCompletion(status) {
  return freezeRecord({
    schemaVersion: 1,
    status: 'completed',
    module: status.module,
    function: status.function,
    grid: status.grid,
    block: status.block,
    sharedMemoryBytes: status.sharedMemoryBytes,
    argumentKinds: status.argumentKinds,
    pollCount: status.pollCount,
    elapsedMilliseconds: status.elapsedMilliseconds,
    operationSequence: status.operationSequence,
    health: status.health,
  });
}

class DriverRuntime {
  #backend;
  #testHooks;
  #maxPending;
  #memoryPolicy;
  #executionPolicy;
  #selectedDevice;
  #runtimeId = randomUUID();
  #epoch = 1;
  #worker;
  #state = 'opening';
  #health = 'healthy';
  #nextRequestId = 1;
  #pending = new Map();
  #readyResolve;
  #readyReject;
  #readyPromise;
  #exitResolve;
  #exitPromise;
  #exitCode = null;
  #lastInventory = null;
  #lastMemory = null;
  #lastExecution = null;
  #description = null;
  #closePromise = null;
  #gracefulTerminal = null;
  #acknowledgedTerminal = null;
  #terminalReport = null;

  constructor({ backend, testHooks, maxPending, memoryPolicy, executionPolicy, selectedDevice }) {
    this.#backend = backend;
    this.#testHooks = testHooks;
    this.#maxPending = maxPending;
    this.#memoryPolicy = memoryPolicy;
    this.#executionPolicy = executionPolicy;
    this.#selectedDevice = selectedDevice;
    this.#readyPromise = new Promise((resolve, reject) => { this.#readyResolve = resolve; this.#readyReject = reject; });
    this.#exitPromise = new Promise((resolve) => { this.#exitResolve = resolve; });
  }

  static async open(options) { const runtime = new DriverRuntime(options); await runtime.#start(); return runtime; }

  get state() { return this.#state; }
  get health() { return this.#health; }
  get terminalReport() { return this.#terminalReport; }

  async describe() { return this.#request('runtime.describe', {}); }

  async contextStatus(token = this.#description?.context) {
    if (!isResourceToken(token)) throw validationError('DRIVER_CONTEXT_TOKEN', 'contextStatus requires the exact opaque context token.');
    return this.#request('context.status', { token });
  }

  async allocateDevice(options = {}) {
    if (!plainObject(options) || Object.keys(options).length !== 1 || !Object.hasOwn(options, 'byteLength')) throw validationError('DRIVER_MEMORY_OPTIONS', 'allocateDevice requires exactly one byteLength field.');
    return this.#request('memory.allocate', { byteLength: options.byteLength });
  }

  async memoryStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'memoryStatus requires an exact opaque memory token.');
    return this.#request('memory.status', { token });
  }

  async createDeviceView(memoryToken, options) {
    if (!isResourceToken(memoryToken)) throw validationError('DRIVER_MEMORY_TOKEN', 'createDeviceView requires an exact opaque memory token.');
    if (!plainObject(options) || Object.keys(options).some((key) => !['dtype', 'byteOffset', 'elementCount', 'access'].includes(key))
        || !Object.hasOwn(options, 'dtype') || !Object.hasOwn(options, 'elementCount') || deviceViewDtypeWidth(options.dtype) === null) throw validationError('MEMORY_VIEW_OPTIONS_INVALID', 'createDeviceView requires an exact typed range record.');
    return this.#request('memory.view.create', { memory: memoryToken, options: { ...options } });
  }

  async deviceViewStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_VIEW_TOKEN', 'deviceViewStatus requires an exact opaque view token.');
    return this.#request('memory.view.status', { token });
  }

  async releaseDeviceView(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_VIEW_TOKEN', 'releaseDeviceView requires an exact opaque view token.');
    return this.#request('memory.view.release', { token });
  }

  async writeDevice(token, bytes, options = {}) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'writeDevice requires an exact opaque memory token.');
    if (!(bytes instanceof Uint8Array) || Buffer.isBuffer(bytes)) throw validationError('MEMORY_BYTES_INVALID', 'writeDevice requires an ordinary Uint8Array.');
    if (!plainObject(options) || Object.keys(options).some((key) => key !== 'deviceOffset')) throw validationError('DRIVER_MEMORY_OPTIONS', 'writeDevice options contain unknown fields.');
    if (bytes.byteLength > this.#memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'writeDevice bytes exceed the configured transfer limit.');
    return this.#request('memory.write', { token, bytes: Uint8Array.from(bytes), deviceOffset: options.deviceOffset ?? 0 });
  }

  async readDevice(token, options) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'readDevice requires an exact opaque memory token.');
    if (!plainObject(options) || Object.keys(options).some((key) => !['deviceOffset', 'byteLength'].includes(key))) throw validationError('DRIVER_MEMORY_OPTIONS', 'readDevice options are invalid.');
    return this.#request('memory.read', { token, deviceOffset: options.deviceOffset ?? 0, byteLength: options.byteLength });
  }

  async writeDeviceAsync(token, bytes, options = {}) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'writeDeviceAsync requires an exact opaque memory token.');
    if (!(bytes instanceof Uint8Array) || Buffer.isBuffer(bytes) || bytes.byteLength < 1) throw validationError('MEMORY_BYTES_INVALID', 'writeDeviceAsync requires a nonempty ordinary Uint8Array.');
    if (!plainObject(options) || Object.keys(options).some((key) => !['deviceOffset', 'after'].includes(key))) throw validationError('DRIVER_MEMORY_OPTIONS', 'writeDeviceAsync options contain unknown fields.');
    if (bytes.byteLength > this.#memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'writeDeviceAsync bytes exceed the configured transfer limit.');
    if (options.after !== undefined && options.after !== null && !isResourceToken(options.after)) throw validationError('DRIVER_OPERATION_TOKEN', 'writeDeviceAsync after must be an exact opaque operation token.');
    return this.#request('memory.transfer.h2d', { token, bytes: Uint8Array.from(bytes), deviceOffset: options.deviceOffset ?? 0, after: options.after ?? null });
  }

  async readDeviceAsync(token, options) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'readDeviceAsync requires an exact opaque memory token.');
    if (!plainObject(options) || Object.keys(options).some((key) => !['deviceOffset', 'byteLength', 'after'].includes(key))) throw validationError('DRIVER_MEMORY_OPTIONS', 'readDeviceAsync options are invalid.');
    if (options.after !== undefined && options.after !== null && !isResourceToken(options.after)) throw validationError('DRIVER_OPERATION_TOKEN', 'readDeviceAsync after must be an exact opaque operation token.');
    return this.#request('memory.transfer.d2h', { token, deviceOffset: options.deviceOffset ?? 0, byteLength: options.byteLength, after: options.after ?? null });
  }

  async copyDeviceAsync(destinationToken, sourceToken, options) {
    if (!isResourceToken(destinationToken) || !isResourceToken(sourceToken)) throw validationError('DRIVER_MEMORY_TOKEN', 'copyDeviceAsync requires exact opaque destination and source memory tokens.');
    if (!plainObject(options) || Object.keys(options).some((key) => !['destinationOffset', 'sourceOffset', 'byteLength', 'after'].includes(key))) throw validationError('DRIVER_MEMORY_OPTIONS', 'copyDeviceAsync options are invalid.');
    if (options.after !== undefined && options.after !== null && !isResourceToken(options.after)) throw validationError('DRIVER_OPERATION_TOKEN', 'copyDeviceAsync after must be an exact opaque operation token.');
    return this.#request('memory.transfer.d2d', { destinationToken, sourceToken, destinationOffset: options.destinationOffset ?? 0, sourceOffset: options.sourceOffset ?? 0, byteLength: options.byteLength, after: options.after ?? null });
  }

  async releaseMemory(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'releaseMemory requires an exact opaque memory token.');
    return this.#request('memory.release', { token });
  }

  async createPublicationMailbox(options) {
    if (!plainObject(options) || Object.keys(options).length !== 1 || !Object.hasOwn(options, 'lanes') || !Array.isArray(options.lanes) || options.lanes.length < 1 || options.lanes.length > 64) throw validationError('MEMORY_MAILBOX_OPTIONS_INVALID', 'createPublicationMailbox requires exactly one bounded lanes array.');
    const lanes = options.lanes.map((lane) => plainObject(lane) ? { ...lane } : lane);
    const buffer = new SharedArrayBuffer(lanes.length * 4);
    const result = await this.#request('mailbox.create', { buffer, lanes });
    return { ...result, buffer };
  }

  async publicationMailboxStatus(token) {
    if (!isResourceToken(token)) throw validationError('MEMORY_MAILBOX_TOKEN', 'publicationMailboxStatus requires an exact opaque mailbox token.');
    return this.#request('mailbox.status', { token });
  }

  async resetPublicationMailbox(token, generation) {
    if (!isResourceToken(token)) throw validationError('MEMORY_MAILBOX_TOKEN', 'resetPublicationMailbox requires an exact opaque mailbox token.');
    return this.#request('mailbox.reset', { token, generation });
  }

  async releasePublicationMailbox(token) {
    if (!isResourceToken(token)) throw validationError('MEMORY_MAILBOX_TOKEN', 'releasePublicationMailbox requires an exact opaque mailbox token.');
    return this.#request('mailbox.release', { token });
  }

  async loadModule(options) {
    if (!plainObject(options) || Object.keys(options).sort().join('\0') !== ['bytes', 'format'].join('\0') || !['ptx', 'cubin'].includes(options.format)) throw validationError('DRIVER_MODULE_OPTIONS', 'loadModule requires exactly format "ptx" or "cubin" and bytes.');
    if (!(options.bytes instanceof Uint8Array) || Buffer.isBuffer(options.bytes) || options.bytes.byteLength < 1 || options.bytes.byteLength > this.#executionPolicy.maxModuleBytes) throw validationError('EXECUTION_MODULE_BYTES', 'loadModule requires bounded ordinary Uint8Array bytes.');
    return this.#request('execution.module.load', { format: options.format, bytes: Uint8Array.from(options.bytes) });
  }

  async moduleStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MODULE_TOKEN', 'moduleStatus requires an exact opaque module token.');
    return this.#request('execution.module.status', { token });
  }

  async getFunction(moduleToken, options) {
    if (!isResourceToken(moduleToken)) throw validationError('DRIVER_MODULE_TOKEN', 'getFunction requires an exact opaque module token.');
    if (!plainObject(options) || Object.keys(options).sort().join('\0') !== ['name', 'parameters'].join('\0') || !Array.isArray(options.parameters)) throw validationError('DRIVER_FUNCTION_OPTIONS', 'getFunction requires exactly name and parameters.');
    return this.#request('execution.function.get', { moduleToken, name: options.name, parameters: options.parameters.map((entry) => plainObject(entry) ? { ...entry } : entry) });
  }

  async functionStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_FUNCTION_TOKEN', 'functionStatus requires an exact opaque function token.');
    return this.#request('execution.function.status', { token });
  }

  async submit(functionToken, options) {
    return this.#request('execution.submit', launchPayload(functionToken, options, 'submit'));
  }

  async prepareOperationDag(options) {
    return this.#request('execution.prepared.create', preparedDagPayload(options));
  }

  async preparedOperationDagStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_PREPARED_TOKEN', 'preparedOperationDagStatus requires an exact opaque prepared token.');
    return this.#request('execution.prepared.status', { token });
  }

  async submitPreparedOperationDag(token, options) {
    return this.#request('execution.prepared.submit', preparedSubmissionPayload(token, options));
  }

  async releasePreparedOperationDag(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_PREPARED_TOKEN', 'releasePreparedOperationDag requires an exact opaque prepared token.');
    return this.#request('execution.prepared.release', { token });
  }

  async openCublasLt() { return this.#request('library.cublaslt.open', {}); }

  async cublasLtStatus(token) {
    if (!isResourceToken(token)) throw validationError('CUBLASLT_RESOURCE_TOKEN', 'cublasLtStatus requires an exact opaque adapter token.');
    return this.#request('library.cublaslt.status', { token });
  }

  async releaseCublasLt(token) {
    if (!isResourceToken(token)) throw validationError('CUBLASLT_RESOURCE_TOKEN', 'releaseCublasLt requires an exact opaque adapter token.');
    return this.#request('library.cublaslt.release', { token });
  }

  async createCublasLtF32MatmulPlan(adapter, options) {
    if (!isResourceToken(adapter) || !plainObject(options)) throw validationError('CUBLASLT_MATMUL_PLAN_INVALID', 'createCublasLtF32MatmulPlan requires an adapter token and plan record.');
    return this.#request('library.cublaslt.plan.create', { adapter, options: { ...options } });
  }

  async cublasLtF32MatmulPlanStatus(token) {
    if (!isResourceToken(token)) throw validationError('CUBLASLT_RESOURCE_TOKEN', 'cublasLtF32MatmulPlanStatus requires an exact opaque plan token.');
    return this.#request('library.cublaslt.plan.status', { token });
  }

  async submitCublasLtF32Matmul(token, request) {
    if (!isResourceToken(token) || !plainObject(request) || !['a', 'b', 'c', 'd'].every((key) => isResourceToken(request[key]))) throw validationError('CUBLASLT_MATMUL_SUBMIT_INVALID', 'submitCublasLtF32Matmul requires exact plan and view capabilities.');
    if (request.workspace !== undefined && request.workspace !== null && !isResourceToken(request.workspace)) throw validationError('CUBLASLT_RESOURCE_TOKEN', 'cuBLASLt workspace must be an exact opaque view token.');
    if (request.after !== undefined && request.after !== null && !isResourceToken(request.after)) throw validationError('DRIVER_OPERATION_TOKEN', 'cuBLASLt predecessor must be an exact opaque operation token.');
    return this.#request('library.cublaslt.plan.submit', { token, a: request.a, b: request.b, c: request.c, d: request.d, alpha: request.alpha ?? 1, beta: request.beta ?? 0, workspace: request.workspace ?? null, after: request.after ?? null });
  }

  async releaseCublasLtF32MatmulPlan(token) {
    if (!isResourceToken(token)) throw validationError('CUBLASLT_RESOURCE_TOKEN', 'releaseCublasLtF32MatmulPlan requires an exact opaque plan token.');
    return this.#request('library.cublaslt.plan.release', { token });
  }

  async operationStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_OPERATION_TOKEN', 'operationStatus requires an exact opaque operation token.');
    return this.#request('execution.operation.status', { token });
  }

  async releaseOperation(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_OPERATION_TOKEN', 'releaseOperation requires an exact opaque operation token.');
    return this.#request('execution.operation.release', { token });
  }

  async waitOperation(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_OPERATION_TOKEN', 'waitOperation requires an exact opaque operation token.');
    let pollDelay = 1;
    for (;;) {
      const status = await this.operationStatus(token);
      if (status.status === 'completed') return status;
      if (status.status === 'failed' || status.status === 'orphaned') throw operationFailure(status);
      if (status.status !== 'pending') throw new DriverRuntimeError('EXECUTION_OPERATION_STATE', 'internal', 'DriverActor returned an invalid operation state.', { status: status.status });
      await delay(pollDelay);
      pollDelay = Math.min(pollDelay * 2, 16);
    }
  }

  async launch(functionToken, options) {
    const operation = await this.submit(functionToken, options);
    const started = Date.now();
    let pollDelay = 1;
    for (;;) {
      const status = await this.operationStatus(operation.operation);
      if (status.status === 'completed') {
        await this.releaseOperation(operation.operation);
        return legacyCompletion(status);
      }
      if (status.status === 'failed') {
        await this.releaseOperation(operation.operation);
        throw operationFailure(status);
      }
      if (status.status === 'orphaned') throw operationFailure(status);
      if (status.status !== 'pending') throw new DriverRuntimeError('EXECUTION_OPERATION_STATE', 'internal', 'DriverActor returned an invalid operation state.', { status: status.status });
      const elapsed = Math.max(0, Date.now() - started);
      if (elapsed >= this.#executionPolicy.maxCompletionMilliseconds) {
        await this.#request('execution.operation.timeout', { token: operation.operation });
        throw new DriverRuntimeError('EXECUTION_COMPLETION_TIMEOUT', 'restart-required', 'Launch completion deadline expired; runtime restart is required.');
      }
      await delay(Math.min(pollDelay, this.#executionPolicy.maxCompletionMilliseconds - elapsed));
      pollDelay = Math.min(pollDelay * 2, 16);
    }
  }

  async releaseFunction(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_FUNCTION_TOKEN', 'releaseFunction requires an exact opaque function token.');
    return this.#request('execution.function.release', { token });
  }

  async releaseModule(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MODULE_TOKEN', 'releaseModule requires an exact opaque module token.');
    return this.#request('execution.module.release', { token });
  }

  async close() {
    if (this.#closePromise) return this.#closePromise;
    if (this.#state === 'closed') return this.#terminalReport;
    if (this.#state === 'restart-required') {
      this.#closePromise = (async () => {
        await this.#exitPromise;
        return this.#terminalReport;
      })();
      return this.#closePromise;
    }
    this.#state = 'closing';
    this.#closePromise = (async () => {
      try {
        const terminal = await this.#requestInternal('runtime.close', {}, { allowClosing: true });
        this.#gracefulTerminal = terminal;
        if (terminal.graceful !== true) this.#acknowledgedTerminal = terminal;
        await this.#exitPromise;
        if (terminal.graceful === true && this.#exitCode === 0) {
          this.#state = 'closed';
          this.#health = 'closed';
          this.#terminalReport = freezeRecord({ ...terminal, workerExitCode: this.#exitCode, workerExited: true });
        } else this.#setRestartRequired(this.#exitCode, 'graceful-close-unproved');
        return this.#terminalReport;
      } catch (error) {
        await this.#exitPromise;
        this.#setRestartRequired(this.#exitCode, 'close-command-failed');
        return this.#terminalReport ?? Promise.reject(error);
      }
    })();
    return this.#closePromise;
  }

  async [DRIVER_RUNTIME_TEST](operation, payload = {}) {
    if (!this.#testHooks) throw validationError('DRIVER_TEST_HOOKS_DISABLED', 'DriverRuntime test hooks are disabled.');
    if (operation === 'terminate') {
      if (this.#state !== 'open') throw new DriverRuntimeError('DRIVER_RUNTIME_CLOSED', 'closed-runtime', 'Runtime is not open.', { state: this.#state });
      await this.#worker.terminate();
      await this.#exitPromise;
      return this.#terminalReport;
    }
    return this.#request(operation, payload);
  }

  async #start() {
    if (this.#backend.endsWith('-native') && !process.execArgv.includes('--experimental-ffi')) throw new DriverRuntimeError('DRIVER_FFI_FLAG_REQUIRED', 'unsupported', 'The native DriverActor requires Node to be launched with experimental FFI enabled.');
    if (this.#backend.endsWith('-native') && process.permission !== undefined && !process.execArgv.includes('--permission')) throw new DriverRuntimeError('DRIVER_PERMISSION_PROFILE_UNSUPPORTED', 'unsupported', 'The native DriverActor requires permission flags to be explicit process arguments.');
    this.#worker = new Worker(new URL('./actor-worker.mjs', import.meta.url), {
      workerData: { backend: this.#backend, testHooks: this.#testHooks, runtimeId: this.#runtimeId, epoch: this.#epoch, memoryPolicy: this.#memoryPolicy, executionPolicy: this.#executionPolicy, selectedDevice: this.#selectedDevice },
      execArgv: workerExecArgv(),
    });
    this.#worker.on('message', (message) => this.#onMessage(message));
    this.#worker.on('error', (error) => { if (this.#state === 'opening') this.#readyReject(error); });
    this.#worker.on('exit', (code) => this.#onExit(code));
    await this.#readyPromise;
  }

  #onMessage(message) {
    if (!plainObject(message) || typeof message.kind !== 'string') {
      this.#setRestartRequired(null, 'invalid-worker-message');
      void this.#worker.terminate();
      return;
    }
    if (message.kind === 'ready') {
      if (this.#state !== 'opening') return;
      this.#description = freezeRecord(message.result);
      this.#updateStateFromRecord(this.#description);
      this.#state = 'open';
      this.#readyResolve(this);
      return;
    }
    if (message.kind === 'startup-error') { this.#readyReject(deserializeError(message.error)); return; }
    if (message.kind === 'fatal') {
      const error = deserializeError(message.error);
      for (const pending of this.#pending.values()) pending.reject(error);
      this.#pending.clear();
      return;
    }
    if (message.kind !== 'response' || !Number.isSafeInteger(message.requestId)) return;
    const pending = this.#pending.get(message.requestId);
    if (!pending) return;
    this.#pending.delete(message.requestId);
    if (message.ok === true) {
      if (message.state) this.#updateStateFromRecord(message.state);
      const result = freezeRecord(message.result);
      this.#updateStateFromRecord(result);
      if (pending.operation === 'runtime.close') {
        this.#gracefulTerminal = result;
        if (result.graceful !== true) this.#acknowledgedTerminal = result;
      }
      pending.resolve(result);
    } else {
      if (message.state) this.#updateStateFromRecord(message.state);
      const error = deserializeError(message.error);
      if (error.healthAfter) this.#observeHealth(error.healthAfter);
      if (pending.operation === 'runtime.close' || this.#health === 'restart-required' || error.category === 'restart-required') {
        this.#acknowledgedTerminal = this.#failureTerminal(pending.operation, message, error);
      }
      if (this.#health === 'restart-required' || error.category === 'restart-required') this.#setRestartRequired(null, 'acknowledged-terminal-error');
      pending.reject(error);
    }
  }

  #onExit(code) {
    this.#exitCode = code;
    this.#exitResolve(code);
    if (this.#state === 'opening') this.#readyReject(new DriverRuntimeError('DRIVER_WORKER_STARTUP_EXIT', 'restart-required', 'DriverActor exited before startup completed.', { workerExitCode: code }));
    const graceful = this.#gracefulTerminal?.graceful === true && code === 0;
    if (!graceful && this.#state !== 'closed') this.#setRestartRequired(code, this.#acknowledgedTerminal ? 'acknowledged-ungraceful-terminal' : 'unexpected-worker-exit');
    if (!graceful) {
      const error = new DriverRuntimeError('DRIVER_RESTART_REQUIRED', 'restart-required', 'DriverActor ownership was lost; process restart is required.', { workerExitCode: code }, { healthBefore: this.#health, healthAfter: 'restart-required' });
      for (const pending of this.#pending.values()) pending.reject(error);
      this.#pending.clear();
    }
  }

  #setRestartRequired(workerExitCode, reason) {
    if (this.#state === 'closed') return;
    const before = this.#health;
    const acknowledged = this.#acknowledgedTerminal;
    const acknowledgedHealth = acknowledged?.health ?? null;
    const acknowledgedInventory = acknowledged?.teardown?.inventory ?? acknowledged?.inventory ?? null;
    const history = Array.isArray(acknowledgedHealth?.history) ? [...acknowledgedHealth.history] : [];
    const observedBefore = typeof acknowledgedHealth?.current === 'string' ? acknowledgedHealth.current : before;
    if (observedBefore !== 'restart-required') history.push(Object.freeze({ before: observedBefore, after: 'restart-required', reason, operationId: null }));
    this.#state = 'restart-required';
    this.#health = 'restart-required';
    this.#terminalReport = freezeRecord({
      ...(acknowledged ?? {}),
      schemaVersion: 1,
      graceful: false,
      cleanupClaim: acknowledged?.cleanupClaim ?? 'unproved-worker-loss',
      restartRequired: true,
      reason,
      commandAcknowledged: acknowledged !== null,
      acknowledgedHealth,
      acknowledgedInventory,
      health: { current: 'restart-required', history },
      inventory: orphanInventory(acknowledgedInventory ?? this.#lastInventory),
      memory: this.#lastMemory ? freezeRecord({ ...this.#lastMemory, state: 'orphaned', reason: 'worker-lost' }) : null,
      execution: this.#lastExecution ? freezeRecord({ ...this.#lastExecution, state: 'orphaned', reason: 'worker-lost' }) : null,
      workerExitCode,
      workerExited: workerExitCode !== null,
    });
  }

  #updateStateFromRecord(record) {
    if (record?.health?.current) this.#observeHealth(record.health.current);
    if (record?.inventory) this.#lastInventory = record.inventory;
    if (record?.teardown?.inventory) this.#lastInventory = record.teardown.inventory;
    if (record?.memory?.policy) this.#lastMemory = record.memory;
    if (record?.usage?.policy) this.#lastMemory = record.usage;
    if (record?.execution?.policy) this.#lastExecution = record.execution;
  }

  #observeHealth(next) {
    if (typeof next !== 'string' || !Object.hasOwn(CLIENT_HEALTH_RANK, next)) return;
    if (this.#health === 'closed') return;
    if (next === 'closed' || CLIENT_HEALTH_RANK[next] > CLIENT_HEALTH_RANK[this.#health]) this.#health = next;
  }

  #failureTerminal(operation, message, error) {
    const state = plainObject(message.state) ? message.state : {};
    return freezeRecord({
      schemaVersion: 1,
      graceful: false,
      cleanupClaim: operation === 'runtime.close' ? 'unproved' : 'unproved-worker-loss',
      commandAcknowledged: true,
      failedOperation: operation,
      error: {
        name: error.name,
        code: error.code,
        category: error.category,
        message: error.message,
        details: error.details,
        operation: error.operation,
        operationId: error.operationId,
        healthBefore: error.healthBefore,
        healthAfter: error.healthAfter,
      },
      health: state.health ?? { current: this.#health, history: [] },
      inventory: state.inventory ?? this.#lastInventory,
      execution: state.execution ?? this.#lastExecution,
    });
  }

  #request(operation, payload) { return this.#requestInternal(operation, payload, { allowClosing: false }); }

  #requestInternal(operation, payload, { allowClosing }) {
    if (this.#state !== 'open' && !(allowClosing && this.#state === 'closing')) return Promise.reject(new DriverRuntimeError('DRIVER_RUNTIME_CLOSED', this.#state === 'restart-required' ? 'restart-required' : 'closed-runtime', 'Runtime is not accepting commands.', { state: this.#state }));
    if (!allowClosing && this.#pending.size >= this.#maxPending) return Promise.reject(new DriverRuntimeError('DRIVER_BACKPRESSURE', 'backpressure', 'DriverActor command queue is full.', { maxPending: this.#maxPending }));
    const requestId = this.#nextRequestId++;
    const request = requestRecord(requestId, operation, payload);
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject, operation });
      this.#worker.postMessage(request);
    });
  }
}

function validateMaxPending(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 1_024) throw validationError('DRIVER_MAX_PENDING', 'maxPending must be an integer from 1 through 1024.', { maxPending: value });
  return value;
}

export function selectNativeBackend(platform = process.platform, architecture = process.arch) {
  if (platform === 'win32' && architecture === 'x64') return 'windows-native';
  if (platform === 'linux' && architecture === 'x64') return 'linux-native';
  throw new DriverRuntimeError('DRIVER_PROFILE_UNSUPPORTED', 'unsupported', 'The native DriverActor requires Windows x64 or native Linux x86-64.', { platform, architecture });
}

export async function openDriverRuntime(options = {}) {
  if (!plainObject(options) || !exactOptionFields(options)) throw validationError('DRIVER_OPTIONS_INVALID', 'Driver runtime options contain unknown fields.');
  const maxPending = validateMaxPending(options.maxPending ?? 64);
  const memoryPolicy = normalizeMemoryPolicy(options.memory ?? {});
  const executionPolicy = normalizeExecutionPolicy(options.execution ?? {});
  return DriverRuntime.open({ backend: selectNativeBackend(), testHooks: false, maxPending, memoryPolicy, executionPolicy, selectedDevice: normalizeSelectedDevice(options.selectedDevice) });
}

export async function openDriverRuntimeForTesting(options = {}) {
  if (!plainObject(options) || !exactOptionFields(options)) throw validationError('DRIVER_OPTIONS_INVALID', 'Driver runtime options contain unknown fields.');
  return DriverRuntime.open({ backend: 'mock', testHooks: true, maxPending: validateMaxPending(options.maxPending ?? 64), memoryPolicy: normalizeMemoryPolicy(options.memory ?? {}), executionPolicy: normalizeExecutionPolicy(options.execution ?? {}), selectedDevice: normalizeSelectedDevice(options.selectedDevice) });
}
