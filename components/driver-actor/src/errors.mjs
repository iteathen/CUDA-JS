const ERROR_FIELDS = Object.freeze([
  'name', 'code', 'category', 'message', 'details', 'operationId', 'healthBefore', 'healthAfter',
]);

export class DriverRuntimeError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'DriverRuntimeError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
    this.operationId = state.operationId ?? null;
    this.healthBefore = state.healthBefore ?? null;
    this.healthAfter = state.healthAfter ?? null;
  }
}

export function serializeError(error) {
  const record = {
    name: error?.name ?? 'Error',
    code: error?.code ?? 'DRIVER_RUNTIME_INTERNAL',
    category: error?.category ?? 'internal',
    message: error?.message ?? String(error),
    details: error?.details ?? {},
    operationId: error?.operationId ?? null,
    healthBefore: error?.healthBefore ?? null,
    healthAfter: error?.healthAfter ?? null,
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
