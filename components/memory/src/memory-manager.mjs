const MIB = 1_048_576;
const TIB = 1_099_511_627_776;
const POLICY_FIELDS = Object.freeze(['maxDeviceBytes', 'maxAllocationBytes', 'maxTransferBytes']);

export const DEFAULT_MEMORY_POLICY = Object.freeze({
  maxDeviceBytes: 256 * MIB,
  maxAllocationBytes: 128 * MIB,
  maxTransferBytes: 16 * MIB,
});

export class MemoryError extends Error {
  constructor(code, category, message, details = {}) {
    super(message);
    this.name = 'MemoryError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, category, message, details) {
  throw new MemoryError(code, category, message, details);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function positiveSafeInteger(value, name, maximum) {
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    fail('MEMORY_POLICY_INVALID', 'validation', `${name} must be a positive safe-integer byte count no greater than ${maximum}.`, { field: name, value, maximum });
  }
  return value;
}

export function normalizeMemoryPolicy(value = {}) {
  if (!plainObject(value) || Object.keys(value).some((key) => !POLICY_FIELDS.includes(key))) {
    fail('MEMORY_POLICY_INVALID', 'validation', 'Memory policy contains unknown fields.');
  }
  const policy = Object.freeze({
    maxDeviceBytes: positiveSafeInteger(value.maxDeviceBytes ?? DEFAULT_MEMORY_POLICY.maxDeviceBytes, 'maxDeviceBytes', TIB),
    maxAllocationBytes: positiveSafeInteger(value.maxAllocationBytes ?? DEFAULT_MEMORY_POLICY.maxAllocationBytes, 'maxAllocationBytes', TIB),
    maxTransferBytes: positiveSafeInteger(value.maxTransferBytes ?? DEFAULT_MEMORY_POLICY.maxTransferBytes, 'maxTransferBytes', 64 * MIB),
  });
  if (policy.maxAllocationBytes > policy.maxDeviceBytes) {
    fail('MEMORY_POLICY_INVALID', 'validation', 'maxAllocationBytes cannot exceed maxDeviceBytes.', policy);
  }
  return policy;
}

function byteLength(value, { field = 'byteLength', positive = true } = {}) {
  if (!Number.isSafeInteger(value) || value < (positive ? 1 : 0)) {
    fail('MEMORY_RANGE_INVALID', 'validation', `${field} must be ${positive ? 'a positive' : 'a nonnegative'} safe integer.`, { field, value });
  }
  return value;
}

function checkedRange(allocationLength, deviceOffset, transferLength) {
  byteLength(deviceOffset, { field: 'deviceOffset', positive: false });
  byteLength(transferLength);
  if (deviceOffset > allocationLength || transferLength > allocationLength - deviceOffset) {
    fail('MEMORY_RANGE_OUT_OF_BOUNDS', 'validation', 'Transfer range exceeds the allocation.', { allocationLength, deviceOffset, byteLength: transferLength });
  }
}

function assertOperations(operations) {
  if (!plainObject(operations)) fail('MEMORY_BACKEND_INVALID', 'internal', 'Memory backend operations are invalid.');
  for (const name of ['query', 'allocate', 'free', 'write', 'read']) {
    if (typeof operations[name] !== 'function') fail('MEMORY_BACKEND_INVALID', 'internal', `Memory backend operation is missing: ${name}.`);
  }
}

export class MemoryManager {
  #registry;
  #contextToken;
  #policy;
  #operations;
  #reservedBytes = 0;
  #allocationCount = 0;

  constructor({ registry, contextToken, policy = {}, operations }) {
    if (!registry || typeof registry.allocate !== 'function' || typeof registry.acquire !== 'function') {
      fail('MEMORY_REGISTRY_INVALID', 'internal', 'Memory manager requires a resource registry.');
    }
    assertOperations(operations);
    this.#registry = registry;
    this.#contextToken = contextToken;
    this.#policy = normalizeMemoryPolicy(policy);
    this.#operations = operations;
  }

  get policy() { return this.#policy; }
  get reservedBytes() { return this.#reservedBytes; }
  get allocationCount() { return this.#allocationCount; }

  async usage(operationId = null) {
    const native = await this.#operations.query({ operationId });
    return Object.freeze({
      policy: this.#policy,
      reservedBytes: this.#reservedBytes,
      allocationCount: this.#allocationCount,
      native: native === null ? null : Object.freeze({ freeBytes: native.freeBytes, totalBytes: native.totalBytes }),
    });
  }

  async allocate({ byteLength: requestedByteLength, operationId = null }) {
    const allocationLength = byteLength(requestedByteLength);
    if (allocationLength > this.#policy.maxAllocationBytes) {
      fail('MEMORY_ALLOCATION_LIMIT', 'pressure', 'Allocation exceeds the configured per-allocation limit.', { byteLength: allocationLength, maxAllocationBytes: this.#policy.maxAllocationBytes });
    }
    if (this.#reservedBytes > this.#policy.maxDeviceBytes - allocationLength) {
      fail('MEMORY_QUOTA_EXCEEDED', 'pressure', 'Allocation exceeds the configured device-memory budget.', { byteLength: allocationLength, reservedBytes: this.#reservedBytes, maxDeviceBytes: this.#policy.maxDeviceBytes });
    }

    this.#reservedBytes += allocationLength;
    let native;
    try {
      native = await this.#operations.allocate({ byteLength: allocationLength, operationId });
    } catch (error) {
      this.#reservedBytes -= allocationLength;
      throw error;
    }

    let token;
    try {
      token = this.#registry.allocate({
        kind: 'device-memory',
        value: Object.freeze({ native, byteLength: allocationLength }),
        parent: this.#contextToken,
        dispose: async (record) => {
          const disposition = await this.#operations.free({ native: record.native, byteLength: record.byteLength, operationId: null });
          this.#reservedBytes -= record.byteLength;
          this.#allocationCount -= 1;
          return Object.freeze({ kind: 'device', byteLength: record.byteLength, freed: true, backend: disposition ?? null });
        },
      });
      this.#allocationCount += 1;
    } catch (error) {
      try {
        await this.#operations.free({ native, byteLength: allocationLength, operationId });
        this.#reservedBytes -= allocationLength;
      } catch {
        // Capacity remains reserved because native cleanup could not be proved.
      }
      throw error;
    }
    return this.#descriptor(token, allocationLength, operationId);
  }

  async status(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'device-memory' });
    return this.#descriptor(token, record.byteLength, operationId);
  }

  async write(token, bytes, { deviceOffset = 0, operationId = null } = {}) {
    if (!(bytes instanceof Uint8Array) || Buffer.isBuffer(bytes)) {
      fail('MEMORY_BYTES_INVALID', 'validation', 'Memory write requires an ordinary Uint8Array.');
    }
    if (bytes.byteLength > this.#policy.maxTransferBytes) {
      fail('MEMORY_TRANSFER_LIMIT', 'pressure', 'Write exceeds the configured transfer limit.', { byteLength: bytes.byteLength, maxTransferBytes: this.#policy.maxTransferBytes });
    }
    const lease = this.#registry.acquire(token, { kind: 'device-memory' });
    try {
      checkedRange(lease.value.byteLength, deviceOffset, bytes.byteLength);
      await this.#operations.write({ native: lease.value.native, deviceOffset, bytes, operationId });
      return Object.freeze({
        schemaVersion: 1,
        memory: token,
        deviceOffset,
        byteLength: bytes.byteLength,
        usage: await this.usage(operationId),
      });
    } finally {
      lease.release();
    }
  }

  async read(token, { deviceOffset = 0, byteLength: requestedByteLength, operationId = null }) {
    const transferLength = byteLength(requestedByteLength);
    if (transferLength > this.#policy.maxTransferBytes) {
      fail('MEMORY_TRANSFER_LIMIT', 'pressure', 'Read exceeds the configured transfer limit.', { byteLength: transferLength, maxTransferBytes: this.#policy.maxTransferBytes });
    }
    const lease = this.#registry.acquire(token, { kind: 'device-memory' });
    try {
      checkedRange(lease.value.byteLength, deviceOffset, transferLength);
      const bytes = await this.#operations.read({ native: lease.value.native, deviceOffset, byteLength: transferLength, operationId });
      if (!(bytes instanceof Uint8Array) || Buffer.isBuffer(bytes) || bytes.byteLength !== transferLength) {
        fail('MEMORY_BACKEND_BYTES_INVALID', 'internal', 'Memory backend returned an invalid owned byte copy.', { expected: transferLength, actual: bytes?.byteLength ?? null });
      }
      return Object.freeze({
        schemaVersion: 1,
        memory: token,
        deviceOffset,
        byteLength: transferLength,
        bytes,
        usage: await this.usage(operationId),
      });
    } finally {
      lease.release();
    }
  }

  async release(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'device-memory' });
    const closed = await this.#registry.close(token);
    return Object.freeze({
      schemaVersion: 1,
      released: Object.freeze({ kind: 'device', byteLength: record.byteLength }),
      disposition: closed.disposition,
      usage: await this.usage(operationId),
    });
  }

  acquireForExecution(token, byteOffset = 0) {
    byteLength(byteOffset, { field: 'byteOffset', positive: false });
    const lease = this.#registry.acquire(token, { kind: 'device-memory' });
    if (byteOffset >= lease.value.byteLength) {
      lease.release();
      fail('MEMORY_RANGE_OUT_OF_BOUNDS', 'validation', 'Execution argument offset must select a byte inside the allocation.', {
        allocationLength: lease.value.byteLength,
        byteOffset,
      });
    }
    return Object.freeze({
      native: lease.value.native,
      byteLength: lease.value.byteLength,
      byteOffset,
      release: lease.release,
    });
  }

  async #descriptor(token, allocationLength, operationId) {
    return Object.freeze({
      schemaVersion: 1,
      memory: token,
      kind: 'device',
      byteLength: allocationLength,
      usage: await this.usage(operationId),
    });
  }
}
