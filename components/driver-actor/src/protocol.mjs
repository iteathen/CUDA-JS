import { isResourceToken } from '../../resource-registry/index.mjs';
import { validationError } from './errors.mjs';

const REQUEST_FIELDS = Object.freeze(['schemaVersion', 'requestId', 'operation', 'payload']);
const BASE_OPERATIONS = new Set(['runtime.describe', 'context.status', 'runtime.close']);
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

export function validateRequest(message, { testHooks = false } = {}) {
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

export function assertPublicRecord(value, { maxDepth = 12, maxNodes = 2_000 } = {}) {
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
