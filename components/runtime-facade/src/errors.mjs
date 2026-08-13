function freezeValue(value) {
  if (value && typeof value === 'object') {
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value;
    for (const child of Array.isArray(value) ? value : Object.values(value)) freezeValue(child);
    Object.freeze(value);
  }
  return value;
}

const PROHIBITED_DETAIL_KEY = /(?:account|address|email|handle|host|identity|machine|nonce|path|pointer|runtimeid|runtime-id|stack|token|user)|^(?:generation|slot)$/i;
const MAX_DETAIL_DEPTH = 6;
const MAX_DETAIL_NODES = 256;
const MAX_DETAIL_ENTRIES = 64;
const MAX_DETAIL_STRING = 1_024;

function safeDetailText(value) {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/(?:https?|file):\/\/[^\s"'<>]+/gi, '[redacted-location]')
    .replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"'<>]+/g, '[redacted-path]')
    .replace(/(^|[\s("'=])\/(?:[^\s"'<>]+)/g, '$1[redacted-path]')
    .replace(/\b0x[0-9a-f]{6,}\b/gi, '[redacted-handle]')
    .replace(/\b[0-9a-f]{32,}\b/gi, '[redacted-capability]')
    .replace(/\b(handle|pointer|address)\b\s*(?:[=:]\s*|\s+)(?:0x[0-9a-f]+|\d+|[A-Za-z0-9._:+/-]{8,})\b/gi, '$1=[redacted-handle]')
    .replace(/\b(nonce|token|runtime(?:id|-id)?)\b\s*(?:[=:]\s*|\s+)[A-Za-z0-9._:+/-]{8,}/gi, '$1=[redacted-capability]')
    .replace(/\b(host|hostname|account|user|username|email|machine|identity)\b\s*(?:[=:]\s*|\s+)[^\s,;]+/gi, '$1=[redacted-identity]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-identity]')
    .slice(0, MAX_DETAIL_STRING);
}

function safeDetails(value) {
  let nodes = 0;
  const visit = (entry, depth) => {
    nodes += 1;
    if (nodes > MAX_DETAIL_NODES || depth > MAX_DETAIL_DEPTH) return undefined;
    if (entry === null || typeof entry === 'boolean') return entry;
    if (typeof entry === 'string') return safeDetailText(entry);
    if (typeof entry === 'number') return Number.isFinite(entry) && Number.isSafeInteger(entry) ? entry : undefined;
    try {
      if (Array.isArray(entry)) {
        const output = [];
        const length = Math.min(Number.isSafeInteger(entry.length) ? entry.length : 0, MAX_DETAIL_ENTRIES);
        for (let index = 0; index < length; index += 1) {
          let item;
          try { item = entry[index]; } catch { continue; }
          const safe = visit(item, depth + 1);
          if (safe !== undefined) output.push(safe);
        }
        return output;
      }
      if (entry === null || typeof entry !== 'object' || ArrayBuffer.isView(entry) || entry instanceof ArrayBuffer) return undefined;
      const prototype = Object.getPrototypeOf(entry);
      if (prototype !== Object.prototype && prototype !== null) return undefined;
      const output = {};
      const keys = Object.keys(entry).slice(0, MAX_DETAIL_ENTRIES);
      for (const key of keys) {
        if (typeof key !== 'string' || key.length > 128 || PROHIBITED_DETAIL_KEY.test(key)) continue;
        let child;
        try { child = entry[key]; } catch { continue; }
        const safe = visit(child, depth + 1);
        if (safe !== undefined) output[key] = safe;
      }
      return output;
    } catch {
      return undefined;
    }
  };
  const safe = visit(value, 0);
  return freezeValue(safe && typeof safe === 'object' && !Array.isArray(safe) ? safe : {});
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
    operation: typeof error.operation === 'string' && /^[A-Za-z][A-Za-z0-9_.():-]{0,127}$/.test(error.operation) ? error.operation : operation,
    healthBefore: error.healthBefore ?? null,
    healthAfter: error.healthAfter ?? null,
  });
}

export function freezePublic(value) {
  return freezeValue(value);
}

export function publicDetails(value) {
  return safeDetails(value);
}
