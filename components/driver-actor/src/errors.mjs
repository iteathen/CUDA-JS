const ERROR_FIELDS = Object.freeze([
  'name', 'code', 'category', 'message', 'details', 'operation', 'operationId', 'healthBefore', 'healthAfter',
]);

const OPERATION_PATTERN = /^[A-Za-z][A-Za-z0-9_.:()-]{0,127}$/;

function operationName(value) {
  return typeof value === 'string' && OPERATION_PATTERN.test(value) ? value : null;
}

export class DriverRuntimeError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'DriverRuntimeError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
    this.operation = operationName(state.operation);
    this.operationId = state.operationId ?? null;
    this.healthBefore = state.healthBefore ?? null;
    this.healthAfter = state.healthAfter ?? null;
  }
}

export function serializeError(error) {
  const domainCode = typeof error?.code === 'string' && /^(?:CUDA|CUBLASLT|DRIVER|EXECUTION|MEMORY|PREPARED|RESOURCE)_[A-Z0-9_]+$/.test(error.code);
  const structured = error instanceof DriverRuntimeError || (domainCode
    && (error?.category === undefined || (typeof error.category === 'string' && /^[a-z][a-z-]{0,63}$/.test(error.category)))
    && typeof error?.message === 'string'
    && error.message.length <= 4_096);
  const permissionDenied = error?.code === 'ERR_ACCESS_DENIED';
  const record = {
    name: structured ? error.name ?? 'DriverRuntimeError' : permissionDenied ? 'Error' : 'DriverRuntimeError',
    code: structured ? error.code : permissionDenied ? 'ERR_ACCESS_DENIED' : 'DRIVER_RUNTIME_INTERNAL',
    category: structured ? error.category ?? 'internal' : permissionDenied ? 'permission' : 'internal',
    message: structured ? error.message : permissionDenied ? 'DriverActor lacks required Node permission.' : 'DriverActor internal failure.',
    details: structured ? error.details ?? {} : {},
    operation: structured ? operationName(error.operation) : null,
    operationId: structured ? error.operationId ?? null : null,
    healthBefore: structured ? error.healthBefore ?? null : null,
    healthAfter: structured ? error.healthAfter ?? null : null,
  };
  return Object.freeze(record);
}

export function deserializeError(record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    return new DriverRuntimeError('DRIVER_PROTOCOL_ERROR', 'internal', 'Worker returned an invalid error record.');
  }
  const normalized = Object.fromEntries(ERROR_FIELDS.map((field) => [field, record[field] ?? null]));
  return new DriverRuntimeError(
    typeof normalized.code === 'string' ? normalized.code : 'DRIVER_PROTOCOL_ERROR',
    typeof normalized.category === 'string' ? normalized.category : 'internal',
    typeof normalized.message === 'string' ? normalized.message : 'Worker operation failed.',
    normalized.details && typeof normalized.details === 'object' && !Array.isArray(normalized.details) ? normalized.details : {},
    normalized,
  );
}

export function validationError(code, message, details = {}, operationId = null) {
  return new DriverRuntimeError(code, 'validation', message, details, { operationId });
}
