import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';

import { ResourceError } from './resource-error.mjs';

const TOKEN_FIELDS = Object.freeze([
  'schemaVersion', 'runtimeId', 'epoch', 'kind', 'slot', 'generation', 'nonce', 'state',
]);
const RESOURCE_STATES = new Set(['live', 'closing', 'closed', 'orphaned']);
const KIND_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;
const NONCE_PATTERN = /^[a-f0-9]{32}$/;

function fail(code, message, details) {
  throw new ResourceError(code, message, details);
}

function exactFields(value, fields) {
  return Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

export function isResourceToken(value) {
  return value !== null
    && typeof value === 'object'
    && !Array.isArray(value)
    && exactFields(value, TOKEN_FIELDS)
    && value.schemaVersion === 1
    && typeof value.runtimeId === 'string'
    && value.runtimeId.length > 0
    && Number.isSafeInteger(value.epoch)
    && value.epoch > 0
    && typeof value.kind === 'string'
    && KIND_PATTERN.test(value.kind)
    && Number.isSafeInteger(value.slot)
    && value.slot >= 0
    && Number.isSafeInteger(value.generation)
    && value.generation > 0
    && typeof value.nonce === 'string'
    && NONCE_PATTERN.test(value.nonce)
    && value.state === 'live';
}

function publicToken(entry, runtimeId, epoch) {
  return Object.freeze({
    schemaVersion: 1,
    runtimeId,
    epoch,
    kind: entry.kind,
    slot: entry.slot,
    generation: entry.generation,
    nonce: entry.nonce,
    state: 'live',
  });
}

function parentRecord(entry, entries) {
  if (entry.parentSlot === null) return null;
  const parent = entries[entry.parentSlot];
  return parent ? { kind: parent.kind, slot: parent.slot, generation: parent.generation } : null;
}

function entryRecord(entry, entries) {
  return Object.freeze({
    kind: entry.kind,
    slot: entry.slot,
    generation: entry.generation,
    state: entry.state,
    parent: parentRecord(entry, entries),
    childCount: entry.children.size,
    leases: entry.leases,
  });
}

export class ResourceRegistry {
  #runtimeId;
  #epoch;
  #entries = [];
  #freeSlots = [];
  #dead = false;
  #nonce;

  constructor({ runtimeId = randomUUID(), epoch = 1, nonce = () => randomBytes(16).toString('hex') } = {}) {
    assert.equal(typeof runtimeId, 'string');
    assert(runtimeId.length > 0, 'runtimeId must not be empty.');
    assert(Number.isSafeInteger(epoch) && epoch > 0, 'epoch must be a positive safe integer.');
    assert.equal(typeof nonce, 'function');
    this.#runtimeId = runtimeId;
    this.#epoch = epoch;
    this.#nonce = nonce;
  }

  get runtimeId() { return this.#runtimeId; }
  get epoch() { return this.#epoch; }
  get dead() { return this.#dead; }

  allocate({ kind, value, parent = null, dispose }) {
    if (this.#dead) fail('RESOURCE_DEAD_EPOCH', 'Cannot allocate in a dead runtime epoch.', { epoch: this.#epoch });
    if (typeof kind !== 'string' || !KIND_PATTERN.test(kind)) fail('RESOURCE_KIND_INVALID', 'Resource kind is invalid.', { kind });
    if (typeof dispose !== 'function') fail('RESOURCE_DISPOSER_INVALID', 'Resource disposer must be a function.', { kind });
    const parentEntry = parent === null ? null : this.#resolve(parent);
    const slot = this.#freeSlots.length > 0 ? this.#freeSlots.shift() : this.#entries.length;
    const previous = this.#entries[slot];
    const generation = (previous?.generation ?? 0) + 1;
    const nonce = this.#nonce();
    if (typeof nonce !== 'string' || !NONCE_PATTERN.test(nonce)) fail('RESOURCE_NONCE_INVALID', 'Nonce source returned an invalid value.', { slot });
    const entry = {
      slot,
      generation,
      nonce,
      kind,
      state: 'live',
      parentSlot: parentEntry?.slot ?? null,
      children: new Set(),
      leases: 0,
      value,
      dispose,
    };
    this.#entries[slot] = entry;
    parentEntry?.children.add(slot);
    return publicToken(entry, this.#runtimeId, this.#epoch);
  }

  get(token, { kind } = {}) {
    return this.#resolve(token, kind).value;
  }

  acquire(token, { kind } = {}) {
    const entry = this.#resolve(token, kind);
    entry.leases += 1;
    let released = false;
    return Object.freeze({
      value: entry.value,
      release: () => {
        if (released) fail('RESOURCE_LEASE_RELEASED', 'Resource lease was already released.', { slot: entry.slot, generation: entry.generation });
        released = true;
        entry.leases -= 1;
        assert(entry.leases >= 0, 'Resource lease count underflow.');
      },
    });
  }

  async close(token) {
    const entry = this.#resolve(token);
    if (entry.children.size > 0) fail('RESOURCE_HAS_CHILDREN', 'Resource has live children.', { slot: entry.slot, childCount: entry.children.size });
    if (entry.leases > 0) fail('RESOURCE_BUSY', 'Resource has in-flight leases.', { slot: entry.slot, leases: entry.leases });
    entry.state = 'closing';
    try {
      const disposition = await entry.dispose(entry.value);
      entry.value = undefined;
      entry.state = 'closed';
      if (entry.parentSlot !== null) this.#entries[entry.parentSlot]?.children.delete(entry.slot);
      if (!this.#freeSlots.includes(entry.slot)) this.#freeSlots.push(entry.slot);
      this.#freeSlots.sort((left, right) => left - right);
      return Object.freeze({ resource: entryRecord(entry, this.#entries), disposition: disposition ?? null });
    } catch (error) {
      entry.state = 'orphaned';
      fail('RESOURCE_DISPOSE_FAILED', 'Resource disposer failed; cleanup is unproved.', {
        slot: entry.slot,
        generation: entry.generation,
        causeName: error?.name ?? 'Error',
        causeCode: error?.code ?? null,
        causeMessage: error?.message ?? String(error),
      });
    }
  }

  async closeTree(token) {
    const root = this.#resolve(token);
    const order = this.#descendants(root).sort((left, right) => right.depth - left.depth || right.entry.slot - left.entry.slot);
    const dispositions = [];
    const errors = [];
    for (const { entry } of order) {
      if (entry.state !== 'live') continue;
      try {
        dispositions.push(await this.close(publicToken(entry, this.#runtimeId, this.#epoch)));
      } catch (error) {
        errors.push({ code: error.code ?? 'RESOURCE_CLOSE_FAILED', message: error.message, details: error.details ?? {} });
      }
    }
    return Object.freeze({ dispositions: Object.freeze(dispositions), errors: Object.freeze(errors), inventory: this.inventory() });
  }

  async closeAll() {
    const live = this.#entries.filter((entry) => entry?.state === 'live');
    const order = live.map((entry) => ({ entry, depth: this.#depth(entry) }))
      .sort((left, right) => right.depth - left.depth || right.entry.slot - left.entry.slot);
    const dispositions = [];
    const errors = [];
    for (const { entry } of order) {
      if (entry.state !== 'live') continue;
      try {
        dispositions.push(await this.close(publicToken(entry, this.#runtimeId, this.#epoch)));
      } catch (error) {
        errors.push({ code: error.code ?? 'RESOURCE_CLOSE_FAILED', message: error.message, details: error.details ?? {} });
      }
    }
    return Object.freeze({ dispositions: Object.freeze(dispositions), errors: Object.freeze(errors), inventory: this.inventory() });
  }

  markEpochDead(reason = 'owner-lost') {
    if (this.#dead) return this.inventory();
    this.#dead = true;
    for (const entry of this.#entries) {
      if (entry && (entry.state === 'live' || entry.state === 'closing')) entry.state = 'orphaned';
    }
    const inventory = this.inventory();
    return Object.freeze({ ...inventory, reason });
  }

  inventory() {
    const resources = this.#entries.filter(Boolean).map((entry) => entryRecord(entry, this.#entries));
    const counts = { live: 0, closing: 0, closed: 0, orphaned: 0 };
    for (const resource of resources) counts[resource.state] += 1;
    return Object.freeze({
      schemaVersion: 1,
      runtimeId: this.#runtimeId,
      epoch: this.#epoch,
      dead: this.#dead,
      counts: Object.freeze(counts),
      resources: Object.freeze(resources),
    });
  }

  #resolve(token, expectedKind) {
    if (!isResourceToken(token)) fail('RESOURCE_TOKEN_INVALID', 'Resource token shape is invalid.');
    if (token.runtimeId !== this.#runtimeId) fail('RESOURCE_WRONG_RUNTIME', 'Resource belongs to another runtime.', { runtimeId: token.runtimeId });
    if (token.epoch !== this.#epoch || this.#dead) fail('RESOURCE_DEAD_EPOCH', 'Resource belongs to a dead runtime epoch.', { epoch: token.epoch, currentEpoch: this.#epoch });
    const entry = this.#entries[token.slot];
    if (!entry || token.generation !== entry.generation) fail('RESOURCE_STALE', 'Resource generation is stale.', { slot: token.slot, generation: token.generation });
    if (token.kind !== entry.kind || (expectedKind !== undefined && entry.kind !== expectedKind)) {
      fail('RESOURCE_WRONG_KIND', 'Resource kind does not match the required operation.', { actual: entry.kind, tokenKind: token.kind, expected: expectedKind ?? entry.kind });
    }
    if (token.nonce !== entry.nonce) fail('RESOURCE_FORGED', 'Resource capability nonce does not match.', { slot: token.slot, generation: token.generation });
    if (!RESOURCE_STATES.has(entry.state)) fail('RESOURCE_STATE_INVALID', 'Registry contains an invalid resource state.', { state: entry.state });
    if (entry.state === 'closing') fail('RESOURCE_CLOSING', 'Resource is closing.', { slot: entry.slot });
    if (entry.state === 'closed') fail('RESOURCE_CLOSED', 'Resource is closed.', { slot: entry.slot });
    if (entry.state === 'orphaned') fail('RESOURCE_ORPHANED', 'Resource is orphaned and inaccessible.', { slot: entry.slot });
    return entry;
  }

  #depth(entry) {
    let depth = 0;
    let current = entry;
    const seen = new Set();
    while (current.parentSlot !== null) {
      if (seen.has(current.slot)) fail('RESOURCE_DEPENDENCY_CYCLE', 'Resource dependency cycle detected.', { slot: entry.slot });
      seen.add(current.slot);
      current = this.#entries[current.parentSlot];
      if (!current) fail('RESOURCE_PARENT_MISSING', 'Resource parent is missing.', { slot: entry.slot });
      depth += 1;
    }
    return depth;
  }

  #descendants(root) {
    const output = [];
    const visit = (entry, depth) => {
      output.push({ entry, depth });
      for (const slot of entry.children) {
        const child = this.#entries[slot];
        if (child) visit(child, depth + 1);
      }
    };
    visit(root, 0);
    return output;
  }
}
