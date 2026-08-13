export class CompilerRuntimeError extends Error {
  constructor(code, category, message, details = {}, options = {}) {
    super(message, options);
    this.name = 'CompilerRuntimeError';
    this.code = code;
    this.category = category;
    this.details = details;
    this.operation = options.operation ?? null;
    this.healthBefore = options.healthBefore ?? null;
    this.healthAfter = options.healthAfter ?? null;
  }
}

const MAX_CLEANUP_FAILURES = 8;
const SAFE_TEXT = /^[\x20-\x7e]+$/;
const ABSOLUTE_PATH = /(?:^|[\s'"])(?:[a-zA-Z]:[\\/]|\\\\|\/[^/\s])/;
const SENSITIVE_TEXT = /(?:https?|file):\/\/|\b(?:0x[0-9a-f]{6,}|[0-9a-f]{32,})\b|\b(?:handle|pointer|address|nonce|token|runtime(?:id|-id)?|host|hostname|account|user|username|email|machine|identity)\b\s*(?:[=:]\s*|\s+)[^\s,;]+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const DETAIL_FIELDS = new Set(['causeCode', 'causeName', 'input', 'kind', 'nativeMessage', 'nativeStatus', 'provider', 'size', 'workerExitCode']);
const HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3 });

function safeText(value, fallback, maxLength = 256) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength && SAFE_TEXT.test(value) && !ABSOLUTE_PATH.test(value) && !SENSITIVE_TEXT.test(value)
    ? value
    : fallback;
}

function safeScalar(value) {
  if (value === null || typeof value === 'boolean') return value;
  if (Number.isSafeInteger(value)) return value;
  if (typeof value === 'string') return safeText(value, undefined, 256);
  return undefined;
}

function sanitizedDetails(details) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};
  const result = {};
  for (const [key, value] of Object.entries(details)) {
    if (!DETAIL_FIELDS.has(key)) continue;
    const accepted = safeScalar(value);
    if (accepted !== undefined) result[key] = accepted;
  }
  return result;
}

function healthFor(error, unstructured = false) {
  if (unstructured) return 'restart-required';
  if (Object.hasOwn(HEALTH_RANK, error?.healthAfter)) return error.healthAfter;
  if (error?.category === 'restart-required') return 'restart-required';
  return Object.hasOwn(HEALTH_RANK, error?.healthBefore) ? error.healthBefore : 'healthy';
}

function strongestHealth(values) {
  let strongest = 'healthy';
  for (const value of values) {
    if (Object.hasOwn(HEALTH_RANK, value) && HEALTH_RANK[value] > HEALTH_RANK[strongest]) strongest = value;
  }
  return strongest;
}

export function compilerFailureRecord(error, { operation = 'compiler.cleanup' } = {}) {
  const structured = error instanceof CompilerRuntimeError;
  const code = structured
    ? safeText(error.code, 'COMPILER_INTERNAL', 128)
    : safeText(error?.code, 'COMPILER_INTERNAL', 128);
  const category = structured ? safeText(error.category, 'internal', 128) : 'restart-required';
  const observedOperation = structured ? safeText(error.operation, operation, 128) : operation;
  const healthBefore = structured && Object.hasOwn(HEALTH_RANK, error.healthBefore) ? error.healthBefore : 'healthy';
  return Object.freeze({
    code,
    category,
    message: structured ? safeText(error.message, 'Compiler operation failed.', 512) : 'Compiler cleanup completion is unproved.',
    operation: observedOperation,
    healthBefore,
    healthAfter: healthFor(error, !structured),
    details: Object.freeze({
      ...sanitizedDetails(structured ? error.details : {}),
      ...(!structured && safeText(error?.name, null, 64) ? { causeName: safeText(error.name, null, 64) } : {}),
      ...(!structured && safeText(error?.code, null, 128) ? { causeCode: safeText(error.code, null, 128) } : {}),
    }),
  });
}

function terminalInventory(inventory) {
  if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) return Object.freeze({ disposition: 'unproved' });
  const result = { disposition: 'unproved' };
  for (const [key, value] of Object.entries(inventory)) {
    if (key.length <= 64 && /^[a-zA-Z][a-zA-Z0-9]*$/.test(key) && Number.isSafeInteger(value) && value >= 0) result[key] = value;
  }
  return Object.freeze(result);
}

export function combineCompilerCleanupFailures(primaryFailure, cleanupFailures, options = {}) {
  if (!Array.isArray(cleanupFailures) || cleanupFailures.length < 1) throw new TypeError('At least one cleanup failure is required.');
  const retained = cleanupFailures.slice(0, MAX_CLEANUP_FAILURES);
  const cleanupRecords = retained.map((error) => compilerFailureRecord(error, { operation: options.operation ?? 'compiler.cleanup' }));
  const primaryRecord = primaryFailure ? compilerFailureRecord(primaryFailure, { operation: options.primaryOperation ?? 'compiler.operation' }) : null;
  const first = retained[0];
  const firstStructured = first instanceof CompilerRuntimeError;
  const resultingHealth = strongestHealth([
    primaryRecord?.healthAfter,
    ...cleanupRecords.map((record) => record.healthAfter),
  ]);
  const firstCode = firstStructured ? safeText(first.code, 'COMPILER_CLEANUP_FAILED', 128) : 'COMPILER_CLEANUP_FAILED';
  const firstCategory = firstStructured ? safeText(first.category, 'restart-required', 128) : 'restart-required';
  const firstOperation = firstStructured ? safeText(first.operation, 'compiler.cleanup', 128) : 'compiler.cleanup';
  const firstMessage = firstStructured ? safeText(first.message, 'Compiler cleanup completion is unproved.', 512) : 'Compiler cleanup completion is unproved.';
  const code = safeText(options.code, firstCode, 128);
  const category = safeText(options.category, firstCategory, 128);
  const operation = safeText(options.operation, firstOperation, 128);
  const message = safeText(options.message, firstMessage, 512);
  const details = Object.freeze({
    ...sanitizedDetails(firstStructured ? first.details : {}),
    ...(primaryRecord ? { primaryFailure: primaryRecord } : {}),
    cleanupFailures: Object.freeze(cleanupRecords),
    ...(cleanupFailures.length > retained.length ? { cleanupFailuresOmitted: cleanupFailures.length - retained.length } : {}),
    resultingHealth,
    terminalInventory: terminalInventory(options.inventory),
  });
  return new CompilerRuntimeError(code, category, message, details, {
    operation,
    healthBefore: primaryRecord?.healthBefore ?? cleanupRecords[0].healthBefore,
    healthAfter: resultingHealth,
  });
}

export function compilerError(code, message, details = {}) {
  return new CompilerRuntimeError(code, 'validation', message, details);
}

export function serializeError(error) {
  const known = error instanceof CompilerRuntimeError;
  const permissionDenied = error?.code === 'ERR_ACCESS_DENIED';
  return {
    name: known ? error.name : permissionDenied ? 'Error' : 'CompilerRuntimeError',
    code: known ? error.code : permissionDenied ? 'ERR_ACCESS_DENIED' : 'COMPILER_INTERNAL',
    category: known ? error.category : permissionDenied ? 'permission' : 'internal',
    message: known ? error.message : permissionDenied ? 'CompilerActor lacks required Node permission.' : 'CompilerActor internal failure.',
    details: known ? error.details : {},
    operation: known ? error.operation : null,
    healthBefore: known ? error.healthBefore : null,
    healthAfter: known ? error.healthAfter : null,
  };
}

export function deserializeError(record) {
  return new CompilerRuntimeError(record.code, record.category, record.message, record.details, {
    operation: record.operation,
    healthBefore: record.healthBefore,
    healthAfter: record.healthAfter,
  });
}
