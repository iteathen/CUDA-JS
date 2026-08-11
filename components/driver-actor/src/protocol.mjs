import { isResourceToken } from '../../resource-registry/index.mjs';
import { validationError } from './errors.mjs';

const REQUEST_FIELDS = Object.freeze(['schemaVersion', 'requestId', 'operation', 'payload']);
const BASE_OPERATIONS = new Set([
  'runtime.describe', 'context.status', 'runtime.close',
  'memory.allocate', 'memory.status', 'memory.write', 'memory.read', 'memory.release',
]);
const TEST_OPERATIONS = new Set(['testing.block', 'testing.inject-health']);

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

function memoryTokenPayload(payload) {
  return plainObject(payload) && exactFields(payload, ['token']) && isResourceToken(payload.token);
}

function positiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function nonnegativeSafeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function ordinaryBytes(value) {
  return value instanceof Uint8Array && !Buffer.isBuffer(value);
}

export function validateRequest(message, { testHooks = false, memoryPolicy = { maxTransferBytes: 16 * 1_048_576 } } = {}) {
  if (!plainObject(message) || !exactFields(message, REQUEST_FIELDS)) {
    throw validationError('DRIVER_COMMAND_INVALID', 'Command envelope is invalid.');
  }
  if (message.schemaVersion !== 1) throw validationError('DRIVER_COMMAND_VERSION', 'Command schema version is unsupported.', { schemaVersion: message.schemaVersion }, message.requestId);
  if (!Number.isSafeInteger(message.requestId) || message.requestId < 1) throw validationError('DRIVER_COMMAND_ID', 'Command request ID is invalid.');
  if (typeof message.operation !== 'string') throw validationError('DRIVER_COMMAND_OPERATION', 'Command operation must be a string.', {}, message.requestId);
  const allowed = BASE_OPERATIONS.has(message.operation) || (testHooks && TEST_OPERATIONS.has(message.operation));
  if (!allowed) throw validationError('DRIVER_COMMAND_UNSUPPORTED', 'Command operation is not allowlisted.', { operation: message.operation }, message.requestId);

  if (message.operation === 'runtime.describe' || message.operation === 'runtime.close') {
    if (!emptyPayload(message.payload)) throw validationError('DRIVER_COMMAND_PAYLOAD', 'Operation payload must be empty.', {}, message.requestId);
  } else if (message.operation === 'context.status') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['token']) || !isResourceToken(message.payload.token)) {
      throw validationError('DRIVER_CONTEXT_TOKEN', 'Context status requires one exact resource token.', {}, message.requestId);
    }
  } else if (message.operation === 'memory.allocate') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['byteLength']) || !positiveSafeInteger(message.payload.byteLength)) {
      throw validationError('MEMORY_RANGE_INVALID', 'Memory allocation requires one positive safe-integer byteLength.', {}, message.requestId);
    }
  } else if (message.operation === 'memory.status' || message.operation === 'memory.release') {
    if (!memoryTokenPayload(message.payload)) throw validationError('DRIVER_MEMORY_TOKEN', 'Memory operation requires one exact resource token.', {}, message.requestId);
  } else if (message.operation === 'memory.write') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['token', 'bytes', 'deviceOffset']) || !isResourceToken(payload.token)
        || !ordinaryBytes(payload.bytes) || !nonnegativeSafeInteger(payload.deviceOffset) || payload.bytes.byteLength < 1) {
      throw validationError('DRIVER_MEMORY_WRITE', 'Memory write payload is invalid.', {}, message.requestId);
    }
    if (payload.bytes.byteLength > memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'Memory write exceeds the configured transfer limit.', {}, message.requestId);
  } else if (message.operation === 'memory.read') {
    const payload = message.payload;
    if (!plainObject(payload) || !exactFields(payload, ['token', 'deviceOffset', 'byteLength']) || !isResourceToken(payload.token)
        || !nonnegativeSafeInteger(payload.deviceOffset) || !positiveSafeInteger(payload.byteLength)) {
      throw validationError('DRIVER_MEMORY_READ', 'Memory read payload is invalid.', {}, message.requestId);
    }
    if (payload.byteLength > memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'Memory read exceeds the configured transfer limit.', {}, message.requestId);
  } else if (message.operation === 'testing.block') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['milliseconds'])
        || !Number.isSafeInteger(message.payload.milliseconds) || message.payload.milliseconds < 1 || message.payload.milliseconds > 2_000) {
      throw validationError('DRIVER_TEST_BLOCK', 'Mock block duration must be an integer from 1 through 2000.', {}, message.requestId);
    }
  } else if (message.operation === 'testing.inject-health') {
    if (!plainObject(message.payload) || !exactFields(message.payload, ['category', 'originOperationId'])
        || !['immediate-driver', 'deferred-driver'].includes(message.payload.category)
        || !Number.isSafeInteger(message.payload.originOperationId) || message.payload.originOperationId < 1) {
      throw validationError('DRIVER_TEST_HEALTH', 'Mock health injection payload is invalid.', {}, message.requestId);
    }
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
    if (typeof current === 'bigint' || typeof current === 'function' || typeof current === 'symbol' || current === undefined) {
      throw validationError('DRIVER_RESULT_NATIVE_VALUE', 'Public result contains a prohibited native or executable value.');
    }
    if (current instanceof Uint8Array && !Buffer.isBuffer(current)) {
      if (current.byteLength > maxByteLength) throw validationError('DRIVER_RESULT_BOUNDS', 'Public result contains an oversized byte copy.');
      return;
    }
    if (ArrayBuffer.isView(current) || current instanceof ArrayBuffer || current instanceof SharedArrayBuffer) {
      throw validationError('DRIVER_RESULT_NATIVE_VALUE', 'Public result contains raw storage.');
    }
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
