import { isParameterKind, isScalarParameterValue } from '../../execution/index.mjs';
import { deviceViewDtypeWidth } from '../../memory/index.mjs';
import { isResourceToken } from '../../resource-registry/index.mjs';
import { validationError } from './errors.mjs';

const REQUEST_FIELDS = Object.freeze(['schemaVersion', 'requestId', 'operation', 'payload']);
const BASE_OPERATIONS = new Set([
  'runtime.describe', 'context.status', 'runtime.close',
  'memory.allocate', 'memory.status', 'memory.write', 'memory.read', 'memory.release',
  'memory.view.create', 'memory.view.status', 'memory.view.release',
  'memory.transfer.h2d', 'memory.transfer.d2h', 'memory.transfer.d2d',
  'mailbox.create', 'mailbox.status', 'mailbox.reset', 'mailbox.release',
  'execution.module.load', 'execution.module.status', 'execution.module.release',
  'execution.function.get', 'execution.function.status', 'execution.function.release',
  'execution.submit', 'execution.operation.status', 'execution.operation.release', 'execution.operation.timeout',
]);
const TEST_OPERATIONS = new Set([
  'testing.block', 'testing.inject-health', 'testing.execution-mode',
  'testing.disposal-mode', 'testing.disposal-status',
]);

function exactFields(value, fields) {
  return Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function emptyPayload(payload) {
  return plainObject(payload) && Object.keys(payload).length === 0;
}

function tokenPayload(payload) {
  return plainObject(payload) && exactFields(payload, ['token']) && isResourceToken(payload.token);
}

function positiveSafeInteger(value) { return Number.isSafeInteger(value) && value > 0; }
function nonnegativeSafeInteger(value) { return Number.isSafeInteger(value) && value >= 0; }
function ordinaryBytes(value) { return value instanceof Uint8Array && !Buffer.isBuffer(value); }
function optionalOperationToken(value) { return value === null || isResourceToken(value); }

function dimensions(value) {
  return plainObject(value) && exactFields(value, ['x', 'y', 'z'])
    && ['x', 'y', 'z'].every((axis) => positiveSafeInteger(value[axis]));
}

function parameterSchema(value, maximum) {
  return Array.isArray(value) && value.length > 0 && value.length <= maximum
    && value.every((entry) => plainObject(entry) && exactFields(entry, ['kind']) && isParameterKind(entry.kind));
}

function scalarArgument(entry) {
  return exactFields(entry, ['kind', 'value']) && isScalarParameterValue(entry.kind, entry.value);
}

function launchArguments(value, maximum) {
  return Array.isArray(value) && value.length > 0 && value.length <= maximum && value.every((entry) => {
    if (!plainObject(entry)) return false;
    if (entry.kind === 'publication-mailbox') {
      return exactFields(entry, ['kind', 'mailbox', 'generation', 'lane'])
        && isResourceToken(entry.mailbox) && positiveSafeInteger(entry.generation)
        && typeof entry.lane === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(entry.lane);
    }
    if (entry.kind === 'device-view') return exactFields(entry, ['kind', 'view']) && isResourceToken(entry.view);
    if (!isParameterKind(entry.kind)) return false;
    if (entry.kind !== 'device-memory') return scalarArgument(entry);
    const fields = Object.keys(entry);
    return fields.every((key) => ['kind', 'memory', 'byteOffset'].includes(key))
      && Object.hasOwn(entry, 'memory') && isResourceToken(entry.memory)
      && (!Object.hasOwn(entry, 'byteOffset') || nonnegativeSafeInteger(entry.byteOffset));
  });
}

function launchAccesses(value, maximum) {
  return value === undefined || (Array.isArray(value) && value.length <= maximum && value.every((entry) => plainObject(entry)
    && Object.keys(entry).every((key) => ['argumentIndex', 'byteOffset', 'byteLength', 'mode', 'dtype'].includes(key))
    && nonnegativeSafeInteger(entry.argumentIndex) && nonnegativeSafeInteger(entry.byteOffset) && positiveSafeInteger(entry.byteLength)
    && ['read', 'write', 'read-write', 'atomic-observe-relaxed-device', 'atomic-update-relaxed-device'].includes(entry.mode)
    && (!Object.hasOwn(entry, 'dtype') || ['u32', 'u64'].includes(entry.dtype))));
}

export function validateRequest(message, { testHooks = false, memoryPolicy = { maxTransferBytes: 16 * 1_048_576 }, executionPolicy = { maxModuleBytes: 4 * 1_048_576, maxArguments: 32 } } = {}) {
  if (!plainObject(message) || !exactFields(message, REQUEST_FIELDS)) throw validationError('DRIVER_COMMAND_INVALID', 'Command envelope is invalid.');
  if (message.schemaVersion !== 1) throw validationError('DRIVER_COMMAND_VERSION', 'Command schema version is unsupported.', { schemaVersion: message.schemaVersion }, message.requestId);
  if (!Number.isSafeInteger(message.requestId) || message.requestId < 1) throw validationError('DRIVER_COMMAND_ID', 'Command request ID is invalid.');
  if (typeof message.operation !== 'string') throw validationError('DRIVER_COMMAND_OPERATION', 'Command operation must be a string.', {}, message.requestId);
  const allowed = BASE_OPERATIONS.has(message.operation) || (testHooks && TEST_OPERATIONS.has(message.operation));
  if (!allowed) throw validationError('DRIVER_COMMAND_UNSUPPORTED', 'Command operation is not allowlisted.', { operation: message.operation }, message.requestId);

  if (message.operation === 'runtime.describe' || message.operation === 'runtime.close') {
    if (!emptyPayload(message.payload)) throw validationError('DRIVER_COMMAND_PAYLOAD', 'Operation payload must be empty.', {}, message.requestId);
  } else if (message.operation === 'context.status') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['token']) || !isResourceToken(message.payload.token)) throw validationError('DRIVER_CONTEXT_TOKEN', 'Context status requires one exact resource token.', {}, message.requestId);
  } else if (message.operation === 'memory.allocate') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['byteLength']) || !positiveSafeInteger(message.payload.byteLength)) throw validationError('MEMORY_RANGE_INVALID', 'Memory allocation requires one positive safe-integer byteLength.', {}, message.requestId);
  } else if (message.operation === 'memory.status' || message.operation === 'memory.release') {
    if (!tokenPayload(message.payload)) throw validationError('DRIVER_MEMORY_TOKEN', 'Memory operation requires one exact resource token.', {}, message.requestId);
  } else if (message.operation === 'memory.view.create') {
    const payload = message.payload;
    const options = payload?.options;
    if (!plainObject(payload) || !exactFields(payload, ['memory', 'options']) || !isResourceToken(payload.memory)
        || !plainObject(options) || Object.keys(options).some((key) => !['dtype', 'byteOffset', 'elementCount', 'access'].includes(key))
        || !Object.hasOwn(options, 'dtype') || !Object.hasOwn(options, 'elementCount') || deviceViewDtypeWidth(options.dtype) === null
        || (Object.hasOwn(options, 'byteOffset') && !nonnegativeSafeInteger(options.byteOffset)) || !nonnegativeSafeInteger(options.elementCount)
        || (Object.hasOwn(options, 'access') && !['read', 'write', 'read-write'].includes(options.access))) throw validationError('MEMORY_VIEW_OPTIONS_INVALID', 'Device view create payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'memory.view.status' || message.operation === 'memory.view.release') {
    if (!tokenPayload(message.payload)) throw validationError('DRIVER_MEMORY_VIEW_TOKEN', 'Device view operation requires one exact resource token.', {}, message.requestId);
  } else if (message.operation === 'mailbox.create') {
    const payload = message.payload;
    const lanes = payload?.lanes;
    if (!plainObject(payload) || !exactFields(payload, ['buffer', 'lanes']) || !(payload.buffer instanceof SharedArrayBuffer)
        || !Array.isArray(lanes) || lanes.length < 1 || lanes.length > 64 || payload.buffer.byteLength !== lanes.length * 4
        || !lanes.every((lane) => plainObject(lane) && exactFields(lane, ['name', 'direction'])
          && typeof lane.name === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(lane.name)
          && ['host-to-device', 'device-to-host'].includes(lane.direction))) throw validationError('MEMORY_MAILBOX_OPTIONS_INVALID', 'Mailbox create payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'mailbox.status' || message.operation === 'mailbox.release') {
    if (!tokenPayload(message.payload)) throw validationError('MEMORY_MAILBOX_TOKEN', 'Mailbox operation requires one exact resource token.', {}, message.requestId);
  } else if (message.operation === 'mailbox.reset') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['token', 'generation']) || !isResourceToken(message.payload.token) || !positiveSafeInteger(message.payload.generation)) throw validationError('MEMORY_MAILBOX_RESET', 'Mailbox reset payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'memory.write') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['token', 'bytes', 'deviceOffset']) || !isResourceToken(payload.token)
        || !ordinaryBytes(payload.bytes) || !nonnegativeSafeInteger(payload.deviceOffset) || payload.bytes.byteLength < 1) throw validationError('DRIVER_MEMORY_WRITE', 'Memory write payload is invalid.', {}, message.requestId);
    if (payload.bytes.byteLength > memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'Memory write exceeds the configured transfer limit.', {}, message.requestId);
  } else if (message.operation === 'memory.read') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['token', 'deviceOffset', 'byteLength']) || !isResourceToken(payload.token)
        || !nonnegativeSafeInteger(payload.deviceOffset) || !positiveSafeInteger(payload.byteLength)) throw validationError('DRIVER_MEMORY_READ', 'Memory read payload is invalid.', {}, message.requestId);
    if (payload.byteLength > memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'Memory read exceeds the configured transfer limit.', {}, message.requestId);
  } else if (message.operation === 'memory.transfer.h2d') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['token', 'bytes', 'deviceOffset', 'after']) || !isResourceToken(payload.token)
        || !ordinaryBytes(payload.bytes) || payload.bytes.byteLength < 1 || payload.bytes.byteLength > memoryPolicy.maxTransferBytes
        || !nonnegativeSafeInteger(payload.deviceOffset) || !optionalOperationToken(payload.after)) throw validationError('DRIVER_MEMORY_TRANSFER', 'Asynchronous H2D payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'memory.transfer.d2h') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['token', 'deviceOffset', 'byteLength', 'after']) || !isResourceToken(payload.token)
        || !nonnegativeSafeInteger(payload.deviceOffset) || !positiveSafeInteger(payload.byteLength) || payload.byteLength > memoryPolicy.maxTransferBytes
        || !optionalOperationToken(payload.after)) throw validationError('DRIVER_MEMORY_TRANSFER', 'Asynchronous D2H payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'memory.transfer.d2d') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['destinationToken', 'sourceToken', 'destinationOffset', 'sourceOffset', 'byteLength', 'after'])
        || !isResourceToken(payload.destinationToken) || !isResourceToken(payload.sourceToken)
        || !nonnegativeSafeInteger(payload.destinationOffset) || !nonnegativeSafeInteger(payload.sourceOffset)
        || !positiveSafeInteger(payload.byteLength) || payload.byteLength > memoryPolicy.maxTransferBytes
        || !optionalOperationToken(payload.after)) throw validationError('DRIVER_MEMORY_TRANSFER', 'Asynchronous D2D payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'execution.module.load') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['format', 'bytes']) || !['ptx', 'cubin'].includes(payload.format) || !ordinaryBytes(payload.bytes)
        || payload.bytes.byteLength < 1 || payload.bytes.byteLength > executionPolicy.maxModuleBytes) throw validationError('EXECUTION_MODULE_BYTES', 'Module load payload is invalid.', {}, message.requestId);
  } else if (['execution.module.status', 'execution.module.release', 'execution.function.status', 'execution.function.release', 'execution.operation.status', 'execution.operation.release', 'execution.operation.timeout'].includes(message.operation)) {
    if (!tokenPayload(message.payload)) throw validationError('DRIVER_EXECUTION_TOKEN', 'Execution resource operation requires one exact token.', {}, message.requestId);
  } else if (message.operation === 'execution.function.get') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['moduleToken', 'name', 'parameters']) || !isResourceToken(payload.moduleToken)
        || typeof payload.name !== 'string' || !parameterSchema(payload.parameters, executionPolicy.maxArguments)) throw validationError('DRIVER_FUNCTION_OPTIONS', 'Function lookup payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'execution.submit') {
    const payload = message.payload;
    if (!plainObject(payload) || Object.keys(payload).some((key) => !['functionToken', 'grid', 'block', 'sharedMemoryBytes', 'arguments', 'after', 'accesses'].includes(key))
        || !['functionToken', 'grid', 'block', 'sharedMemoryBytes', 'arguments'].every((key) => Object.hasOwn(payload, key))
        || !isResourceToken(payload.functionToken) || !dimensions(payload.grid) || !dimensions(payload.block)
        || (payload.after !== undefined && payload.after !== null && !isResourceToken(payload.after)) || !launchAccesses(payload.accesses, executionPolicy.maxArguments)
        || !nonnegativeSafeInteger(payload.sharedMemoryBytes) || !launchArguments(payload.arguments, executionPolicy.maxArguments)) throw validationError('DRIVER_LAUNCH_OPTIONS', 'Submission payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'testing.block') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['milliseconds']) || !Number.isSafeInteger(message.payload.milliseconds) || message.payload.milliseconds < 1 || message.payload.milliseconds > 2_000) throw validationError('DRIVER_TEST_BLOCK', 'Mock block duration must be an integer from 1 through 2000.', {}, message.requestId);
  } else if (message.operation === 'testing.inject-health') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['category', 'originOperationId']) || !['immediate-driver', 'deferred-driver'].includes(message.payload.category)
        || !Number.isSafeInteger(message.payload.originOperationId) || message.payload.originOperationId < 1) throw validationError('DRIVER_TEST_HEALTH', 'Mock health injection payload is invalid.', {}, message.requestId);
  } else if (message.operation === 'testing.execution-mode') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['mode']) || !['complete', 'deferred', 'timeout', 'restart-required'].includes(message.payload.mode)) throw validationError('DRIVER_TEST_EXECUTION_MODE', 'Mock execution mode is invalid.', {}, message.requestId);
  } else if (message.operation === 'testing.disposal-mode') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['mode']) || !['none', 'immediate', 'poisoned', 'restart-required', 'unstructured'].includes(message.payload.mode)) throw validationError('DRIVER_TEST_DISPOSAL_MODE', 'Mock disposal mode is invalid.', {}, message.requestId);
  } else if (message.operation === 'testing.disposal-status') {
    if (!emptyPayload(message.payload)) throw validationError('DRIVER_TEST_DISPOSAL_STATUS', 'Mock disposal status payload must be empty.', {}, message.requestId);
  }
  return message;
}

export function requestRecord(requestId, operation, payload) {
  return Object.freeze({ schemaVersion: 1, requestId, operation, payload });
}

export function assertPublicRecord(value, { maxDepth = 12, maxNodes = 2_000, maxByteLength = 16 * 1_048_576 } = {}) {
  let nodes = 0;
  const visit = (current, depth) => {
    nodes += 1;
    if (nodes > maxNodes) throw validationError('DRIVER_RESULT_BOUNDS', 'Public result exceeds node bounds.');
    if (depth > maxDepth) throw validationError('DRIVER_RESULT_BOUNDS', 'Public result exceeds depth bounds.');
    if (current === null || typeof current === 'boolean') return;
    if (typeof current === 'number') {
      if (!Number.isFinite(current) || !Number.isSafeInteger(current)) throw validationError('DRIVER_RESULT_NUMBER', 'Public result contains a non-safe number.');
      return;
    }
    if (typeof current === 'string') {
      if (current.length > 4_096) throw validationError('DRIVER_RESULT_STRING', 'Public result contains an oversized string.');
      return;
    }
    if (typeof current === 'bigint' || typeof current === 'function' || typeof current === 'symbol' || current === undefined) throw validationError('DRIVER_RESULT_NATIVE_VALUE', 'Public result contains a prohibited native or executable value.');
    if (current instanceof Uint8Array && !Buffer.isBuffer(current)) {
      if (current.byteLength > maxByteLength) throw validationError('DRIVER_RESULT_BOUNDS', 'Public result contains an oversized byte copy.');
      return;
    }
    if (ArrayBuffer.isView(current) || current instanceof ArrayBuffer || current instanceof SharedArrayBuffer) throw validationError('DRIVER_RESULT_NATIVE_VALUE', 'Public result contains raw storage.');
    if (Array.isArray(current)) {
      for (const item of current) visit(item, depth + 1);
      return;
    }
    if (!plainObject(current)) throw validationError('DRIVER_RESULT_OBJECT', 'Public result contains a non-plain object.');
    for (const [key, item] of Object.entries(current)) {
      if (key.length > 128) throw validationError('DRIVER_RESULT_KEY', 'Public result contains an oversized key.');
      visit(item, depth + 1);
    }
  };
  visit(value, 0);
  return value;
}
