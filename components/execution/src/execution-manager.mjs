import { createHash } from 'node:crypto';

const MIB = 1_048_576;
const POLICY_FIELDS = Object.freeze(['maxModuleBytes', 'maxArguments', 'maxCompletionMilliseconds']);
const PARAMETER_KINDS = new Set(['device-memory', 'u32']);

export const DEFAULT_EXECUTION_POLICY = Object.freeze({
  maxModuleBytes: 4 * MIB,
  maxArguments: 32,
  maxCompletionMilliseconds: 30_000,
});

export class ExecutionError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'ExecutionError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
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
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function boundedPositive(value, field, maximum) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    fail('EXECUTION_POLICY_INVALID', 'validation', `${field} must be a positive safe integer no greater than ${maximum}.`, { field, value, maximum });
  }
  return value;
}

export function normalizeExecutionPolicy(value = {}) {
  if (!plainObject(value) || Object.keys(value).some((key) => !POLICY_FIELDS.includes(key))) {
    fail('EXECUTION_POLICY_INVALID', 'validation', 'Execution policy contains unknown fields.');
  }
  return Object.freeze({
    maxModuleBytes: boundedPositive(value.maxModuleBytes ?? DEFAULT_EXECUTION_POLICY.maxModuleBytes, 'maxModuleBytes', 64 * MIB),
    maxArguments: boundedPositive(value.maxArguments ?? DEFAULT_EXECUTION_POLICY.maxArguments, 'maxArguments', 64),
    maxCompletionMilliseconds: boundedPositive(value.maxCompletionMilliseconds ?? DEFAULT_EXECUTION_POLICY.maxCompletionMilliseconds, 'maxCompletionMilliseconds', 300_000),
  });
}

function normalizeParameters(parameters, maximum) {
  if (!Array.isArray(parameters) || parameters.length < 1 || parameters.length > maximum) {
    fail('EXECUTION_PARAMETERS_INVALID', 'validation', 'Function parameters must be a nonempty bounded array.', { count: parameters?.length ?? null, maximum });
  }
  return Object.freeze(parameters.map((parameter, index) => {
    if (!exactFields(parameter, ['kind']) || !PARAMETER_KINDS.has(parameter.kind)) {
      fail('EXECUTION_PARAMETER_INVALID', 'validation', 'Function parameter record is invalid.', { index, kind: parameter?.kind ?? null });
    }
    return Object.freeze({ kind: parameter.kind });
  }));
}

function checkedAlign(offset, alignment) {
  const remainder = offset % alignment;
  const result = remainder === 0 ? offset : offset + alignment - remainder;
  if (!Number.isSafeInteger(result)) fail('EXECUTION_PARAMETER_LAYOUT', 'validation', 'Parameter layout exceeds the safe integer range.');
  return result;
}

export function parameterLayout(parameters) {
  if (!Array.isArray(parameters) || parameters.length < 1) fail('EXECUTION_PARAMETERS_INVALID', 'validation', 'Parameter layout requires a nonempty schema.');
  let size = 0;
  const entries = parameters.map((parameter, index) => {
    const kind = parameter?.kind;
    if (!PARAMETER_KINDS.has(kind)) fail('EXECUTION_PARAMETER_INVALID', 'validation', 'Parameter kind is unsupported.', { index, kind: kind ?? null });
    const width = kind === 'device-memory' ? 8 : 4;
    size = checkedAlign(size, width);
    const entry = Object.freeze({ index, kind, offset: size, byteLength: width, alignment: width });
    size += width;
    if (!Number.isSafeInteger(size)) fail('EXECUTION_PARAMETER_LAYOUT', 'validation', 'Parameter layout exceeds the safe integer range.');
    return entry;
  });
  return Object.freeze({ entries: Object.freeze(entries), byteLength: size });
}

export function packParameterValues(parameters, values) {
  if (!Array.isArray(values) || values.length !== parameters.length) {
    fail('EXECUTION_ARGUMENT_COUNT', 'validation', 'Launch argument count must exactly match the declared parameter count.', { expected: parameters.length, actual: values?.length ?? null });
  }
  const layout = parameterLayout(parameters);
  const buffer = Buffer.alloc(layout.byteLength);
  for (const entry of layout.entries) {
    const value = values[entry.index];
    if (entry.kind === 'device-memory') {
      if (typeof value !== 'bigint' || value < 0n || value > 0xffff_ffff_ffff_ffffn) {
        fail('EXECUTION_ARGUMENT_VALUE', 'validation', 'Private device-memory value is invalid.', { index: entry.index });
      }
      buffer.writeBigUInt64LE(value, entry.offset);
    } else {
      if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) {
        fail('EXECUTION_ARGUMENT_VALUE', 'validation', 'u32 argument is out of range.', { index: entry.index, value });
      }
      buffer.writeUInt32LE(value, entry.offset);
    }
  }
  return Object.freeze({ buffer, layout });
}

function moduleBytes(value, maximum) {
  if (!(value instanceof Uint8Array) || Buffer.isBuffer(value) || value.byteLength < 1 || value.byteLength > maximum) {
    fail('EXECUTION_MODULE_BYTES', 'validation', 'PTX bytes must be a nonempty ordinary Uint8Array within policy.', { byteLength: value?.byteLength ?? null, maximum });
  }
  for (const byte of value) {
    if (byte === 0 || byte > 0x7f) fail('EXECUTION_MODULE_TEXT', 'validation', 'PTX bytes must be NUL-free seven-bit text.');
  }
  return Uint8Array.from(value);
}

function functionName(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 256 || !/^[\x20-\x7e]+$/.test(value) || /[\\/]/.test(value) || value.includes('\0')) {
    fail('EXECUTION_FUNCTION_NAME', 'validation', 'Function name must be bounded printable ASCII without path separators.');
  }
  return value;
}

function dimensions(value, field) {
  if (!exactFields(value, ['x', 'y', 'z'])) fail('EXECUTION_DIMENSIONS', 'validation', `${field} must be an exact x/y/z record.`, { field });
  for (const axis of ['x', 'y', 'z']) {
    if (!Number.isSafeInteger(value[axis]) || value[axis] < 1) fail('EXECUTION_DIMENSIONS', 'validation', `${field}.${axis} must be a positive safe integer.`, { field, axis, value: value[axis] });
  }
  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

function assertOperations(operations) {
  if (!plainObject(operations)) fail('EXECUTION_BACKEND_INVALID', 'internal', 'Execution backend operations are invalid.');
  for (const name of ['createStream', 'destroyStream', 'loadModule', 'unloadModule', 'getFunction', 'createEvent', 'destroyEvent', 'devicePointer', 'submitLaunch', 'recordEvent', 'queryEvent', 'health', 'restartRequired']) {
    if (typeof operations[name] !== 'function') fail('EXECUTION_BACKEND_INVALID', 'internal', `Execution backend operation is missing: ${name}.`);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class ExecutionManager {
  #registry;
  #contextToken;
  #memory;
  #policy;
  #limits;
  #operations;
  #clock;
  #sleep;
  #streamToken = null;
  #inFlight = false;
  #moduleCount = 0;
  #functionCount = 0;
  #completionCount = 0;

  constructor({ registry, contextToken, memory, policy = {}, deviceLimits, operations, clock = () => Date.now(), sleep = delay }) {
    if (!registry || typeof registry.allocate !== 'function' || typeof registry.acquire !== 'function') fail('EXECUTION_REGISTRY_INVALID', 'internal', 'Execution manager requires a resource registry.');
    if (!memory || typeof memory.acquireForExecution !== 'function') fail('EXECUTION_MEMORY_INVALID', 'internal', 'Execution manager requires the internal memory lease port.');
    if (!plainObject(deviceLimits)) fail('EXECUTION_LIMITS_INVALID', 'internal', 'Execution manager requires device launch limits.');
    for (const field of ['maxThreadsPerBlock', 'maxBlockDimX', 'maxBlockDimY', 'maxBlockDimZ', 'maxGridDimX', 'maxGridDimY', 'maxGridDimZ', 'maxSharedMemoryPerBlock']) {
      if (!Number.isSafeInteger(deviceLimits[field]) || deviceLimits[field] < 1) fail('EXECUTION_LIMITS_INVALID', 'internal', 'Device launch limit is invalid.', { field });
    }
    assertOperations(operations);
    this.#registry = registry;
    this.#contextToken = contextToken;
    this.#memory = memory;
    this.#policy = normalizeExecutionPolicy(policy);
    this.#limits = Object.freeze({ ...deviceLimits });
    this.#operations = operations;
    this.#clock = clock;
    this.#sleep = sleep;
  }

  get policy() { return this.#policy; }

  async initialize(operationId = 0) {
    if (this.#streamToken) fail('EXECUTION_ALREADY_INITIALIZED', 'internal', 'Execution manager is already initialized.');
    const native = await this.#operations.createStream({ operationId });
    this.#streamToken = this.#registry.allocate({
      kind: 'stream',
      value: Object.freeze({ native }),
      parent: this.#contextToken,
      dispose: async (record) => Object.freeze({ kind: 'stream', destroyed: true, backend: await this.#operations.destroyStream({ native: record.native, operationId: null }) ?? null }),
    });
    return this.summary();
  }

  summary() {
    return Object.freeze({
      policy: this.#policy,
      moduleCount: this.#moduleCount,
      functionCount: this.#functionCount,
      completionCount: this.#completionCount,
      inFlight: this.#inFlight,
      privateStream: this.#streamToken !== null,
    });
  }

  async loadModule({ format, bytes, operationId = null }) {
    if (format !== 'ptx') fail('EXECUTION_MODULE_FORMAT', 'unsupported', 'F5 supports only PTX modules.', { format });
    const owned = moduleBytes(bytes, this.#policy.maxModuleBytes);
    if (this.#streamToken === null) await this.initialize(operationId);
    const sha256 = createHash('sha256').update(owned).digest('hex');
    const native = await this.#operations.loadModule({ bytes: owned, operationId });
    let token;
    try {
      token = this.#registry.allocate({
        kind: 'module',
        value: Object.freeze({ native, format, byteLength: owned.byteLength, sha256 }),
        parent: this.#contextToken,
        dispose: async (record) => Object.freeze({ kind: 'module', unloaded: true, backend: await this.#operations.unloadModule({ native: record.native, operationId: null }) ?? null }),
      });
      this.#moduleCount += 1;
    } catch (error) {
      await this.#operations.unloadModule({ native, operationId });
      throw error;
    }
    return this.#moduleDescriptor(token, this.#registry.get(token, { kind: 'module' }), operationId);
  }

  moduleStatus(token, operationId = null) {
    return this.#moduleDescriptor(token, this.#registry.get(token, { kind: 'module' }), operationId);
  }

  async getFunction(moduleToken, { name, parameters, operationId = null }) {
    const normalizedName = functionName(name);
    const normalizedParameters = normalizeParameters(parameters, this.#policy.maxArguments);
    const moduleLease = this.#registry.acquire(moduleToken, { kind: 'module' });
    let native;
    try {
      native = await this.#operations.getFunction({ moduleNative: moduleLease.value.native, name: normalizedName, operationId });
    } finally {
      moduleLease.release();
    }
    const token = this.#registry.allocate({
      kind: 'function',
      value: Object.freeze({ native, module: moduleToken, name: normalizedName, parameters: normalizedParameters }),
      parent: moduleToken,
      dispose: async () => Object.freeze({ kind: 'function', invalidated: true }),
    });
    this.#functionCount += 1;
    return this.#functionDescriptor(token, this.#registry.get(token, { kind: 'function' }), operationId);
  }

  functionStatus(token, operationId = null) {
    return this.#functionDescriptor(token, this.#registry.get(token, { kind: 'function' }), operationId);
  }

  async launch(functionToken, { grid: gridValue, block: blockValue, sharedMemoryBytes = 0, arguments: argumentValues, operationId = null }) {
    if (this.#inFlight) fail('EXECUTION_BUSY', 'backpressure', 'Exactly one launch may be in flight.', { operationId });
    const grid = dimensions(gridValue, 'grid');
    const block = dimensions(blockValue, 'block');
    this.#validateLaunchBounds(grid, block, sharedMemoryBytes);
    if (!Array.isArray(argumentValues)) fail('EXECUTION_ARGUMENTS_INVALID', 'validation', 'Launch arguments must be an array.');

    const functionLease = this.#registry.acquire(functionToken, { kind: 'function' });
    const memoryLeases = [];
    let eventToken = null;
    let submitted = false;
    let abandoned = false;
    this.#inFlight = true;
    try {
      const values = [];
      if (argumentValues.length !== functionLease.value.parameters.length) fail('EXECUTION_ARGUMENT_COUNT', 'validation', 'Launch argument count must exactly match the declared parameter count.', { expected: functionLease.value.parameters.length, actual: argumentValues.length });
      for (let index = 0; index < functionLease.value.parameters.length; index += 1) {
        const parameter = functionLease.value.parameters[index];
        const argument = argumentValues[index];
        if (parameter.kind === 'device-memory') {
          if (!plainObject(argument) || Object.keys(argument).some((key) => !['kind', 'memory', 'byteOffset'].includes(key))
              || !Object.hasOwn(argument, 'kind') || !Object.hasOwn(argument, 'memory') || argument.kind !== 'device-memory') {
            fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Device argument does not match its declared kind.', { index });
          }
          const lease = this.#memory.acquireForExecution(argument.memory, argument.byteOffset ?? 0);
          memoryLeases.push(lease);
          values.push(await this.#operations.devicePointer({ native: lease.native, byteOffset: lease.byteOffset, operationId }));
        } else {
          if (!exactFields(argument, ['kind', 'value']) || argument.kind !== 'u32') fail('EXECUTION_ARGUMENT_KIND', 'validation', 'Scalar argument does not match its declared kind.', { index });
          values.push(argument.value);
        }
      }
      const packed = packParameterValues(functionLease.value.parameters, values);
      const stream = this.#registry.get(this.#streamToken, { kind: 'stream' });
      const eventNative = await this.#operations.createEvent({ operationId });
      eventToken = this.#registry.allocate({
        kind: 'event',
        value: Object.freeze({ native: eventNative }),
        parent: this.#streamToken,
        dispose: async (record) => Object.freeze({ kind: 'event', destroyed: true, backend: await this.#operations.destroyEvent({ native: record.native, operationId: null }) ?? null }),
      });
      await this.#operations.submitLaunch({
        functionNative: functionLease.value.native,
        streamNative: stream.native,
        config: Object.freeze({ grid, block, sharedMemoryBytes }),
        parameterBuffer: packed.buffer,
        operationId,
      });
      submitted = true;
      try {
        await this.#operations.recordEvent({ eventNative, streamNative: stream.native, operationId });
      } catch (error) {
        throw this.#operations.restartRequired({
          code: 'EXECUTION_EVENT_PROVENANCE_LOST',
          message: 'Launch was submitted but completion provenance could not be established.',
          details: { causeCode: error?.code ?? null },
          operationId,
        });
      }

      const started = this.#clock();
      let polls = 0;
      let pollDelay = 1;
      for (;;) {
        const state = await this.#operations.queryEvent({ eventNative, operationId });
        polls += 1;
        const elapsed = Math.max(0, Math.trunc(this.#clock() - started));
        if (state === 'complete') {
          await this.#registry.close(eventToken);
          eventToken = null;
          this.#completionCount += 1;
          return Object.freeze({
            schemaVersion: 1,
            status: 'completed',
            module: functionLease.value.module,
            function: functionToken,
            grid,
            block,
            sharedMemoryBytes,
            argumentKinds: Object.freeze(functionLease.value.parameters.map((entry) => entry.kind)),
            pollCount: polls,
            elapsedMilliseconds: Math.min(elapsed, this.#policy.maxCompletionMilliseconds),
            operationSequence: operationId,
            health: this.#operations.health(),
          });
        }
        if (state !== 'pending') fail('EXECUTION_EVENT_STATE', 'internal', 'Execution backend returned an invalid event state.', { state });
        if (elapsed >= this.#policy.maxCompletionMilliseconds) {
          throw this.#operations.restartRequired({
            code: 'EXECUTION_COMPLETION_TIMEOUT',
            message: 'Launch completion deadline expired; runtime restart is required.',
            details: { maxCompletionMilliseconds: this.#policy.maxCompletionMilliseconds, pollCount: polls },
            operationId,
          });
        }
        await this.#sleep(Math.min(pollDelay, this.#policy.maxCompletionMilliseconds - elapsed));
        pollDelay = Math.min(pollDelay * 2, 16);
      }
    } catch (error) {
      if (submitted && error?.category === 'restart-required') {
        abandoned = true;
        throw error;
      }
      if (eventToken !== null) {
        try { await this.#registry.close(eventToken); } catch {}
        eventToken = null;
      }
      throw error;
    } finally {
      if (!abandoned) {
        for (let index = memoryLeases.length - 1; index >= 0; index -= 1) memoryLeases[index].release();
        functionLease.release();
        this.#inFlight = false;
      }
    }
  }

  async releaseFunction(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'function' });
    const closed = await this.#registry.close(token);
    this.#functionCount -= 1;
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'function', name: record.name }), disposition: closed.disposition, operationSequence: operationId });
  }

  async releaseModule(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'module' });
    const closed = await this.#registry.close(token);
    this.#moduleCount -= 1;
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'module', format: record.format, byteLength: record.byteLength, sha256: record.sha256 }), disposition: closed.disposition, operationSequence: operationId });
  }

  #moduleDescriptor(token, record, operationId) {
    return Object.freeze({ schemaVersion: 1, module: token, format: record.format, byteLength: record.byteLength, sha256: record.sha256, operationSequence: operationId });
  }

  #functionDescriptor(token, record, operationId) {
    return Object.freeze({ schemaVersion: 1, function: token, module: record.module, name: record.name, parameters: record.parameters, operationSequence: operationId });
  }

  #validateLaunchBounds(grid, block, sharedMemoryBytes) {
    const limits = this.#limits;
    if (grid.x > limits.maxGridDimX || grid.y > limits.maxGridDimY || grid.z > limits.maxGridDimZ
        || block.x > limits.maxBlockDimX || block.y > limits.maxBlockDimY || block.z > limits.maxBlockDimZ) {
      fail('EXECUTION_DIMENSION_LIMIT', 'validation', 'Launch dimensions exceed device limits.', { grid, block });
    }
    const volume = block.x * block.y * block.z;
    if (!Number.isSafeInteger(volume) || volume > limits.maxThreadsPerBlock) fail('EXECUTION_BLOCK_VOLUME', 'validation', 'Block volume exceeds the device limit.', { volume, maximum: limits.maxThreadsPerBlock });
    if (!Number.isSafeInteger(sharedMemoryBytes) || sharedMemoryBytes < 0 || sharedMemoryBytes > limits.maxSharedMemoryPerBlock) {
      fail('EXECUTION_SHARED_MEMORY', 'validation', 'Shared memory exceeds the device limit.', { sharedMemoryBytes, maximum: limits.maxSharedMemoryPerBlock });
    }
  }
}
