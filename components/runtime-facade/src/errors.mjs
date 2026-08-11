function freezeValue(value) {
  if (value && typeof value === 'object') {
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
    for (const child of Array.isArray(value) ? value : Object.values(value)) freezeValue(child);
    Object.freeze(value);
  }
  return value;
}

function safeDetails(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return Object.freeze({});
  const output = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof key !== 'string' || key.length > 128) continue;
    if (entry === null || ['string', 'boolean', 'number'].includes(typeof entry)) output[key] = entry;
    else if (Array.isArray(entry) && entry.length <= 64 && entry.every((item) => item === null || ['string', 'boolean', 'number'].includes(typeof item))) output[key] = [...entry];
  }
  return freezeValue(output);
}

export class CudaJsError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'CudaJsError';
    this.code = code;
    this.category = category;
    this.operation = state.operation ?? null;
    this.details = safeDetails(details);
    this.healthBefore = state.healthBefore ?? null;
    this.healthAfter = state.healthAfter ?? null;
  }
}

export function facadeError(code, category, message, details = {}, operation = null) {
  return new CudaJsError(code, category, message, details, { operation });
}

export function publicError(error, operation) {
  if (error instanceof CudaJsError) return error;
  const structured = error && typeof error === 'object'
    && typeof error.code === 'string' && /^[A-Z][A-Z0-9_]{2,127}$/.test(error.code)
    && typeof error.category === 'string' && /^[a-z][a-z-]{0,63}$/.test(error.category)
    && typeof error.message === 'string' && error.message.length <= 4_096;
  if (!structured) return new CudaJsError('CUDA_JS_INTERNAL', 'internal', 'CUDA-JS internal operation failed.', {}, { operation });
  return new CudaJsError(error.code, error.category, error.message, error.details, {
    operation,
    healthBefore: error.healthBefore ?? null,
    healthAfter: error.healthAfter ?? null,
  });
}

export function freezePublic(value) {
  return freezeValue(value);
}
