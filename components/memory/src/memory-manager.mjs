const MIB = 1_048_576;
const TIB = 1_099_511_627_776;
const POLICY_FIELDS = Object.freeze(['maxDeviceBytes', 'maxAllocationBytes', 'maxTransferBytes']);
const HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3 });
const FAILURE_CATEGORIES = new Set([
  'validation', 'unsupported', 'permission', 'pressure', 'backpressure', 'stale-resource',
  'closed-runtime', 'immediate-driver', 'deferred-driver', 'provider', 'restart-required',
  'internal', 'native-compiler', 'native-linker', 'compile', 'link',
]);
const APPROVED_FAILURE_DETAIL_FIELDS = new Set([
  'actual', 'byteLength', 'causeCategory', 'causeCode', 'causeMessage', 'causeName', 'causeOperation', 'childCount',
  'causeByteLength', 'causeDisposalCallCount', 'causeNativeDescription', 'causeNativeMessage', 'causeNativeName',
  'causeNativeStatus', 'causeObservedOperationId', 'causeOriginOperationId', 'causeReason',
  'currentEpoch', 'disposition', 'epoch', 'expected', 'field', 'generation', 'kind',
  'leases', 'maximum', 'nativeDescription', 'nativeName', 'nativeStatus', 'operationId',
  'originOperationId', 'reason', 'reservedBytes', 'resourceKind', 'resourceState', 'slot',
  'state', 'status',
]);
const FAILURE_STRING_LIMIT = 160;
const CLEANUP_FAILURE_LIMIT = 8;

export const DEFAULT_MEMORY_POLICY = Object.freeze({
  maxDeviceBytes: 256 * MIB,
  maxAllocationBytes: 128 * MIB,
  maxTransferBytes: 16 * MIB,
});

export class MemoryError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'MemoryError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
    this.operation = state.operation ?? null;
    this.operationId = state.operationId ?? null;
    this.healthBefore = state.healthBefore ?? null;
    this.healthAfter = state.healthAfter ?? null;
  }
}

function fail(code, category, message, details, state) {
  throw new MemoryError(code, category, message, details, state);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function failureField(value, name) {
  try { return value?.[name]; } catch { return undefined; }
}

function boundedFailureString(value) {
  if (typeof value !== 'string') return null;
  const printable = value
    .replace(/[\x00-\x1f\x7f]+/g, ' ')
    .replace(/(?:https?|file):\/\/[^\s"'<>]+/gi, '[redacted-location]')
    .replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"'<>]+/g, '[redacted-path]')
    .replace(/(^|[\s("'=])\/(?:[^\s"'<>]+)/g, '$1[redacted-path]')
    .replace(/\b0x[0-9a-f]{6,}\b/gi, '[redacted-handle]')
    .replace(/\b[0-9a-f]{32,}\b/gi, '[redacted-capability]')
    .replace(/\b(handle|pointer|address)\b\s*(?:[=:]\s*|\s+)(?:0x[0-9a-f]+|\d+|[A-Za-z0-9._:+/-]{8,})\b/gi, '$1=[redacted-handle]')
    .replace(/\b(nonce|token|runtimeid|runtime-id)\b\s*(?:[=:]\s*|\s+)[^\s,;]+/gi, '$1=[redacted-capability]')
    .replace(/\b(host|hostname|account|user|username|email|machine|identity)\b\s*(?:[=:]\s*|\s+)[^\s,;]+/gi, '$1=[redacted-identity]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-identity]')
    .trim();
  if (printable.length < 1) return null;
  return printable.slice(0, FAILURE_STRING_LIMIT);
}

function failureCode(value, fallback) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]{0,95}$/.test(value) ? value : fallback;
}

function failureOperation(value, fallback) {
  const operation = boundedFailureString(value);
  return operation !== null && /^[A-Za-z][A-Za-z0-9._:()-]{0,127}$/.test(operation) ? operation : fallback;
}

function failureHealth(value) {
  return typeof value === 'string' && Object.hasOwn(HEALTH_RANK, value) ? value : null;
}

function categoryHealth(category) {
  if (['validation', 'unsupported', 'pressure', 'backpressure', 'stale-resource', 'closed-runtime'].includes(category)) return null;
  if (category === 'immediate-driver') return 'suspect';
  if (category === 'deferred-driver') return 'poisoned';
  if (category === 'restart-required') return 'restart-required';
  return 'suspect';
}

function approvedFailureDetails(value) {
  if (!plainObject(value)) return Object.freeze({});
  const output = {};
  try {
    for (const key of Object.keys(value).sort()) {
      if (!APPROVED_FAILURE_DETAIL_FIELDS.has(key)) continue;
      const entry = value[key];
      if (entry === null || typeof entry === 'boolean' || (typeof entry === 'number' && Number.isFinite(entry))) {
        output[key] = entry;
      } else {
        const text = boundedFailureString(entry);
        if (text !== null && !/[\\/]/.test(text)) output[key] = text;
      }
    }
  } catch { return Object.freeze({}); }
  return Object.freeze(output);
}

function unstructuredFailureDetails(error) {
  const details = {};
  const causeName = boundedFailureString(failureField(error, 'name'));
  const causeMessage = boundedFailureString(failureField(error, 'message'));
  const causeCode = failureCode(failureField(error, 'code'), null);
  if (causeName !== null && !/[\\/]/.test(causeName)) details.causeName = causeName;
  if (causeMessage !== null && !/[\\/]/.test(causeMessage)) details.causeMessage = causeMessage;
  if (causeCode !== null) details.causeCode = causeCode;
  return Object.freeze(details);
}

function semanticFailure(error, { fallbackCode, fallbackCategory, fallbackOperation, cleanup = false }) {
  const errorCode = failureField(error, 'code');
  const errorCategory = failureField(error, 'category');
  const errorOperationId = failureField(error, 'operationId');
  const structured = typeof errorCode === 'string'
    && typeof errorCategory === 'string'
    && FAILURE_CATEGORIES.has(errorCategory);
  const category = structured ? errorCategory : (cleanup ? 'restart-required' : fallbackCategory);
  const healthBefore = structured ? failureHealth(failureField(error, 'healthBefore')) : null;
  const explicitHealthAfter = structured ? failureHealth(failureField(error, 'healthAfter')) : null;
  let healthAfter = structured ? (explicitHealthAfter ?? categoryHealth(category)) : (cleanup ? 'restart-required' : null);
  if (healthBefore !== null && (healthAfter === null || HEALTH_RANK[healthBefore] > HEALTH_RANK[healthAfter])) healthAfter = healthBefore;
  return Object.freeze({
    code: structured ? failureCode(errorCode, fallbackCode) : fallbackCode,
    category,
    operation: structured ? failureOperation(failureField(error, 'operation'), fallbackOperation) : fallbackOperation,
    operationId: Number.isSafeInteger(errorOperationId) && errorOperationId >= 0 ? errorOperationId : null,
    healthBefore,
    healthAfter,
    details: structured ? approvedFailureDetails(failureField(error, 'details')) : unstructuredFailureDetails(error),
  });
}

function strongestHealth(records) {
  let strongest = null;
  for (const record of records) {
    if (record.healthAfter !== null && (strongest === null || HEALTH_RANK[record.healthAfter] > HEALTH_RANK[strongest])) strongest = record.healthAfter;
  }
  return strongest;
}

function strongestCategory(records, resultingHealth) {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index].healthAfter === resultingHealth) return records[index].category;
  }
  return records.at(-1)?.category ?? 'internal';
}

function rollbackInventory(registry, unprovedResources) {
  let inventory = null;
  try { inventory = typeof registry?.inventory === 'function' ? registry.inventory() : null; } catch {}
  const counts = {};
  for (const state of ['live', 'closing', 'closed', 'orphaned']) {
    const count = inventory?.counts?.[state];
    counts[state] = Number.isSafeInteger(count) && count >= 0 ? count : 0;
  }
  const orphaned = Array.isArray(inventory?.resources)
    ? inventory.resources.filter((entry) => entry?.state === 'orphaned').slice(0, CLEANUP_FAILURE_LIMIT).map((entry) => Object.freeze({ kind: boundedFailureString(entry.kind) ?? 'resource', state: 'orphaned' }))
    : [];
  return Object.freeze({
    counts: Object.freeze(counts),
    orphaned: Object.freeze(orphaned),
    unproved: Object.freeze(unprovedResources.slice(0, CLEANUP_FAILURE_LIMIT).map((entry) => Object.freeze({
      kind: boundedFailureString(entry.kind) ?? 'resource',
      registered: entry.registered === true,
      disposition: 'unproved',
    }))),
  });
}

function allocationRollbackError({ primaryError, cleanupErrors, operationId, registry }) {
  const primaryFailure = semanticFailure(primaryError, {
    fallbackCode: 'MEMORY_ALLOCATION_REGISTRATION_FAILED',
    fallbackCategory: 'internal',
    fallbackOperation: 'memory.allocate.register',
  });
  const cleanupFailures = Object.freeze(cleanupErrors.slice(0, CLEANUP_FAILURE_LIMIT).map((error) => semanticFailure(error, {
    fallbackCode: 'MEMORY_ALLOCATION_CLEANUP_UNPROVED',
    fallbackCategory: 'restart-required',
    fallbackOperation: 'memory.free',
    cleanup: true,
  })));
  const records = [primaryFailure, ...cleanupFailures];
  const resultingHealth = strongestHealth(records);
  const healthBefore = records.find((record) => record.healthBefore !== null)?.healthBefore ?? null;
  const details = Object.freeze({
    primaryFailure,
    cleanupFailures,
    resultingHealth,
    terminal: 'unproved',
    inventory: rollbackInventory(registry, [{ kind: 'device-memory', registered: false }]),
  });
  return new MemoryError(
    'MEMORY_ALLOCATION_ROLLBACK_FAILED',
    strongestCategory(records, resultingHealth),
    'Device allocation registration failed and native rollback cleanup was unproved.',
    details,
    { operation: 'memory.allocate', operationId, healthBefore, healthAfter: resultingHealth },
  );
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
  #allocationLengths = new Map();
  #rollbackFailure = null;

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
  rollbackFailure() { return this.#rollbackFailure; }

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
    if (this.#rollbackFailure) throw this.#rollbackFailure;
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
      this.#allocationLengths.set(`${token.slot}:${token.generation}`, allocationLength);
    } catch (error) {
      try {
        await this.#operations.free({ native, byteLength: allocationLength, operationId });
        this.#reservedBytes -= allocationLength;
      } catch (cleanupError) {
        // Capacity remains reserved because native cleanup could not be proved.
        this.#rollbackFailure ??= allocationRollbackError({
          primaryError: error,
          cleanupErrors: [cleanupError],
          operationId,
          registry: this.#registry,
        });
        throw this.#rollbackFailure;
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
    const identity = Number.isSafeInteger(token?.slot) && Number.isSafeInteger(token?.generation)
      ? `${token.slot}:${token.generation}`
      : null;
    const rememberedLength = identity === null ? undefined : this.#allocationLengths.get(identity);
    const allocationLength = rememberedLength ?? this.#registry.get(token, { kind: 'device-memory' }).byteLength;
    const closed = await this.#registry.close(token);
    if (identity !== null) this.#allocationLengths.delete(identity);
    return Object.freeze({
      schemaVersion: 1,
      released: Object.freeze({ kind: 'device', byteLength: allocationLength }),
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
