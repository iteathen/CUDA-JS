export class DeviceJsError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'DeviceJsError';
    this.code = code;
    this.category = 'validation';
    this.details = Object.freeze({ ...details });
  }
}

export function deviceJsError(code, message, details = {}) {
  return new DeviceJsError(code, message, details);
}
