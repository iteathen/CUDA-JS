export class CompilerRuntimeError extends Error {
  constructor(code, category, message, details = {}, options = {}) {
    super(message, options);
    this.name = 'CompilerRuntimeError';
    this.code = code;
    this.category = category;
    this.details = details;
    this.healthBefore = options.healthBefore ?? null;
    this.healthAfter = options.healthAfter ?? null;
  }
}

export function compilerError(code, message, details = {}) {
  return new CompilerRuntimeError(code, 'validation', message, details);
}

export function serializeError(error) {
  return {
    name: error?.name ?? 'Error',
    code: error?.code ?? 'COMPILER_INTERNAL',
    category: error?.category ?? 'internal',
    message: error?.message ?? 'CompilerActor failed.',
    details: error?.details ?? {},
    healthBefore: error?.healthBefore ?? null,
    healthAfter: error?.healthAfter ?? null,
  };
}

export function deserializeError(record) {
  return new CompilerRuntimeError(record.code, record.category, record.message, record.details, {
    healthBefore: record.healthBefore,
    healthAfter: record.healthAfter,
  });
}
