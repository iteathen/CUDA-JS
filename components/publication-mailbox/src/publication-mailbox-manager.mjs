const MAX_LANES = 64;
const LANE_NAME = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const DIRECTIONS = new Set(['host-to-device', 'device-to-host']);

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function fail(code, category, message, details = {}) {
  throw new PublicationMailboxError(code, category, message, details);
}

function normalizeLanes(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_LANES) {
    fail('MEMORY_MAILBOX_LANES_INVALID', 'validation', 'Publication mailbox lanes must be a nonempty bounded array.', { maximum: MAX_LANES });
  }
  const names = new Set();
  return Object.freeze(value.map((entry, index) => {
    if (!exactFields(entry, ['name', 'direction']) || !LANE_NAME.test(entry.name) || !DIRECTIONS.has(entry.direction) || names.has(entry.name)) {
      fail('MEMORY_MAILBOX_LANE_INVALID', 'validation', 'Publication mailbox lane is invalid or duplicated.', { index });
    }
    names.add(entry.name);
    return Object.freeze({ name: entry.name, direction: entry.direction, index });
  }));
}

function assertGeneration(value) {
  if (!Number.isSafeInteger(value) || value < 1) fail('MEMORY_MAILBOX_GENERATION_INVALID', 'validation', 'Mailbox generation must be a positive safe integer.');
}

export class PublicationMailboxError extends Error {
  constructor(code, category, message, details = {}) {
    super(message);
    this.name = 'PublicationMailboxError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
  }
}

export class PublicationMailboxManager {
  #registry;
  #contextToken;
  #operations;
  #mailboxCount = 0;

  constructor({ registry, contextToken, operations }) {
    if (!registry || typeof registry.allocate !== 'function' || typeof registry.acquire !== 'function') fail('MEMORY_MAILBOX_REGISTRY_INVALID', 'internal', 'Publication mailbox requires the resource registry port.');
    if (!operations || !['register', 'map', 'unregister'].every((name) => typeof operations[name] === 'function')) fail('MEMORY_MAILBOX_BACKEND_INVALID', 'internal', 'Publication mailbox backend operations are incomplete.');
    this.#registry = registry;
    this.#contextToken = contextToken;
    this.#operations = operations;
  }

  async create(buffer, { lanes: laneValue, operationId = null }) {
    const lanes = normalizeLanes(laneValue);
    if (!(buffer instanceof SharedArrayBuffer) || buffer.byteLength !== lanes.length * 4) {
      fail('MEMORY_MAILBOX_STORAGE_INVALID', 'validation', 'Publication mailbox backing must be an exact internal SharedArrayBuffer.', { expectedByteLength: lanes.length * 4 });
    }
    const view = new Int32Array(buffer);
    let hostNative = null;
    let deviceNative = null;
    let registered = false;
    try {
      hostNative = await this.#operations.register({ view, byteLength: buffer.byteLength, operationId });
      registered = true;
      deviceNative = await this.#operations.map({ view, hostNative, operationId });
      if (typeof deviceNative !== 'bigint' || deviceNative === 0n) fail('MEMORY_MAILBOX_MAPPING_INVALID', 'internal', 'Mapped mailbox alias is invalid.');
      const record = {
        buffer, view, lanes, hostNative, deviceNative, generation: 1, activeLease: false,
      };
      const token = this.#registry.allocate({
        kind: 'publication-mailbox',
        value: record,
        parent: this.#contextToken,
        dispose: async (value) => Object.freeze({
          kind: 'publication-mailbox',
          unregistered: true,
          backend: await this.#operations.unregister({ view: value.view, hostNative: value.hostNative, operationId: null }) ?? null,
        }),
      });
      this.#mailboxCount += 1;
      return Object.freeze({ schemaVersion: 1, mailbox: token, generation: 1, lanes, byteLength: buffer.byteLength, operationSequence: operationId });
    } catch (error) {
      if (registered) {
        try { await this.#operations.unregister({ view, hostNative, operationId }); }
        catch (cleanupError) {
          throw new PublicationMailboxError('MEMORY_MAILBOX_CREATE_ROLLBACK_FAILED', 'restart-required', 'Mailbox creation failed and registration rollback is unproved.', {
            causeCode: error?.code ?? null,
            cleanupCauseCode: cleanupError?.code ?? null,
          });
        }
      }
      throw error;
    }
  }

  status(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'publication-mailbox' });
    return Object.freeze({ schemaVersion: 1, mailbox: token, generation: record.generation, lanes: record.lanes, byteLength: record.buffer.byteLength, leased: record.activeLease, operationSequence: operationId });
  }

  reset(token, generation, operationId = null) {
    assertGeneration(generation);
    const record = this.#registry.get(token, { kind: 'publication-mailbox' });
    if (record.generation !== generation) fail('MEMORY_MAILBOX_GENERATION_STALE', 'stale-resource', 'Mailbox generation is stale.', { expected: record.generation, actual: generation });
    if (record.activeLease) fail('MEMORY_MAILBOX_BUSY', 'backpressure', 'Mailbox cannot reset while a GPU operation lease is live.');
    if (record.generation >= Number.MAX_SAFE_INTEGER) fail('MEMORY_MAILBOX_GENERATION_EXHAUSTED', 'stale-resource', 'Mailbox generation is exhausted; close and replace it.');
    for (let index = 0; index < record.view.length; index += 1) Atomics.store(record.view, index, 0);
    record.generation += 1;
    return Object.freeze({ schemaVersion: 1, mailbox: token, generation: record.generation, lanes: record.lanes, byteLength: record.buffer.byteLength, leased: false, operationSequence: operationId });
  }

  acquireForExecution(token, generation, bindings) {
    assertGeneration(generation);
    if (!Array.isArray(bindings) || bindings.length < 1 || bindings.length > MAX_LANES) fail('MEMORY_MAILBOX_BINDINGS_INVALID', 'validation', 'Mailbox bindings must be a nonempty bounded array.');
    const registryLease = this.#registry.acquire(token, { kind: 'publication-mailbox' });
    const record = registryLease.value;
    try {
      if (record.generation !== generation) fail('MEMORY_MAILBOX_GENERATION_STALE', 'stale-resource', 'Mailbox generation is stale.', { expected: record.generation, actual: generation });
      if (record.activeLease) fail('MEMORY_MAILBOX_BUSY', 'backpressure', 'The first mailbox profile permits one live GPU operation lease.');
      const seen = new Set();
      const pointers = bindings.map((binding, index) => {
        if (!exactFields(binding, ['lane', 'direction']) || typeof binding.lane !== 'string' || !DIRECTIONS.has(binding.direction) || seen.has(binding.lane)) fail('MEMORY_MAILBOX_BINDING_INVALID', 'validation', 'Mailbox binding is invalid or duplicated.', { index });
        seen.add(binding.lane);
        const lane = record.lanes.find((entry) => entry.name === binding.lane);
        if (!lane || lane.direction !== binding.direction) fail('MEMORY_MAILBOX_DIRECTION_MISMATCH', 'validation', 'Mailbox binding lane or direction does not match the function parameter.', { index, lane: binding.lane });
        return record.deviceNative + BigInt(lane.index * 4);
      });
      record.activeLease = true;
      let released = false;
      return Object.freeze({
        pointers: Object.freeze(pointers),
        release() {
          if (released) fail('MEMORY_MAILBOX_LEASE_RELEASED', 'internal', 'Mailbox execution lease was released more than once.');
          released = true;
          record.activeLease = false;
          registryLease.release();
        },
      });
    } catch (error) {
      registryLease.release();
      throw error;
    }
  }

  async release(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'publication-mailbox' });
    if (record.activeLease) fail('MEMORY_MAILBOX_BUSY', 'backpressure', 'Mailbox cannot close while a GPU operation lease is live.');
    const generation = record.generation;
    const closed = await this.#registry.close(token);
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'publication-mailbox', generation }), disposition: closed.disposition, operationSequence: operationId });
  }

  summary() {
    return Object.freeze({ schemaVersion: 1, profile: 'private-mapped-sab-named-u32-system-scope', maximumLanes: MAX_LANES, mailboxCount: this.#mailboxCount });
  }
}
