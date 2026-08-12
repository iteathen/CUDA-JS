export class PublicationMailboxError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'PublicationMailboxError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) {
  throw new PublicationMailboxError(code, message, details);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export class PublicationMailbox {
  #lanes;
  #buffer;
  #words;
  #generation = 1;
  #leases = 0;
  #closed = false;

  constructor({ lanes }) {
    if (!Array.isArray(lanes) || lanes.length < 1 || lanes.length > 256) fail('MAILBOX_SCHEMA_INVALID', 'Mailbox lanes must be a nonempty bounded array.');
    this.#lanes = Object.freeze(lanes.map((lane, index) => {
      if (!plainObject(lane) || Object.keys(lane).sort().join('\0') !== 'direction\0name'
          || typeof lane.name !== 'string' || lane.name.length < 1 || lane.name.length > 64
          || !['host-to-device', 'device-to-host'].includes(lane.direction)) {
        fail('MAILBOX_SCHEMA_INVALID', 'Mailbox lane record is invalid.', { index });
      }
      return Object.freeze({ index, name: lane.name, direction: lane.direction });
    }));
    const names = new Set(this.#lanes.map((lane) => lane.name));
    if (names.size !== this.#lanes.length) fail('MAILBOX_SCHEMA_INVALID', 'Mailbox lane names must be unique.');
    this.#buffer = new SharedArrayBuffer(this.#lanes.length * Int32Array.BYTES_PER_ELEMENT);
    this.#words = new Int32Array(this.#buffer);
  }

  get buffer() { return this.#buffer; }
  get generation() { return this.#generation; }
  get state() { return this.#closed ? 'closed' : 'open'; }
  get leaseCount() { return this.#leases; }
  get lanes() { return this.#lanes; }

  #assertOpen() {
    if (this.#closed) fail('MAILBOX_CLOSED', 'Mailbox is closed.');
  }

  #lane(index, direction) {
    this.#assertOpen();
    if (!Number.isSafeInteger(index) || index < 0 || index >= this.#lanes.length) fail('MAILBOX_LANE_INVALID', 'Mailbox lane index is invalid.', { index });
    const lane = this.#lanes[index];
    if (lane.direction !== direction) fail('MAILBOX_DIRECTION', 'Mailbox access violates the declared single-writer direction.', { index, expected: direction, actual: lane.direction });
    return lane;
  }

  #assertGeneration(generation) {
    if (!Number.isSafeInteger(generation) || generation !== this.#generation) fail('MAILBOX_STALE_GENERATION', 'Mailbox generation is stale.', { expected: this.#generation, actual: generation });
  }

  hostStore(index, value, generation = this.#generation) {
    this.#lane(index, 'host-to-device');
    this.#assertGeneration(generation);
    if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) fail('MAILBOX_VALUE_INVALID', 'Mailbox u32 value is invalid.', { index });
    Atomics.store(this.#words, index, value | 0);
    return value >>> 0;
  }

  hostLoad(index, generation = this.#generation) {
    this.#lane(index, 'device-to-host');
    this.#assertGeneration(generation);
    return Atomics.load(this.#words, index) >>> 0;
  }

  acquire(generation = this.#generation) {
    this.#assertOpen();
    this.#assertGeneration(generation);
    this.#leases += 1;
    let released = false;
    return Object.freeze({
      generation,
      buffer: this.#buffer,
      lanes: this.#lanes,
      release: () => {
        if (released) fail('MAILBOX_LEASE_RELEASED', 'Mailbox lease was already released.');
        released = true;
        this.#leases -= 1;
      },
    });
  }

  reset() {
    this.#assertOpen();
    if (this.#leases !== 0) fail('MAILBOX_BUSY', 'Mailbox cannot reset while leased.', { leases: this.#leases });
    this.#generation += 1;
    this.#words.fill(0);
    return this.#generation;
  }

  close() {
    if (this.#closed) return Object.freeze({ state: 'closed', alreadyClosed: true });
    if (this.#leases !== 0) fail('MAILBOX_BUSY', 'Mailbox cannot close while leased.', { leases: this.#leases });
    this.#closed = true;
    return Object.freeze({ state: 'closed', alreadyClosed: false });
  }
}
