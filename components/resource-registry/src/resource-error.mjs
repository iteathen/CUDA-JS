export class ResourceError extends Error {
  constructor(code, message, details = {}, state = {}) {
    super(message);
    this.name = 'ResourceError';
    this.code = code;
    const normalizedState = typeof state === 'string'
      ? { category: state }
      : state !== null && typeof state === 'object' ? state : {};
    this.category = normalizedState.category ?? 'stale-resource';
    this.details = Object.freeze({ ...details });
    this.operation = normalizedState.operation ?? null;
    this.operationId = normalizedState.operationId ?? null;
    this.healthBefore = normalizedState.healthBefore ?? null;
    this.healthAfter = normalizedState.healthAfter ?? null;
  }
}
