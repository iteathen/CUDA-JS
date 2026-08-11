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
  const known = error instanceof CompilerRuntimeError;
  const permissionDenied = error?.code === 'ERR_ACCESS_DENIED';
  return {
    name: known ? error.name : permissionDenied ? 'Error' : 'CompilerRuntimeError',
    code: known ? error.code : permissionDenied ? 'ERR_ACCESS_DENIED' : 'COMPILER_INTERNAL',
    category: known ? error.category : permissionDenied ? 'permission' : 'internal',
    message: known ? error.message : permissionDenied ? 'CompilerActor lacks required Node permission.' : 'CompilerActor internal failure.',
    details: known ? error.details : {},
    healthBefore: known ? error.healthBefore : null,
    healthAfter: known ? error.healthAfter : null,
  };
}

export function deserializeError(record) {
  return new CompilerRuntimeError(record.code, record.category, record.message, record.details, {
    healthBefore: record.healthBefore,
    healthAfter: record.healthAfter,
  });
}
