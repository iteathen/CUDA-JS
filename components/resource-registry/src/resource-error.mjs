export class ResourceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ResourceError';
    this.code = code;
    this.category = 'stale-resource';
    this.details = Object.freeze({ ...details });
  }
}
