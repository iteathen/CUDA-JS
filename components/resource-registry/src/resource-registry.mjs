import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';

import { ResourceError } from './resource-error.mjs';

const TOKEN_FIELDS = Object.freeze([
  'schemaVersion', 'runtimeId', 'epoch', 'kind', 'slot', 'generation', 'nonce', 'state',
]);
const RESOURCE_STATES = new Set(['live', 'closing', 'closed', 'orphaned']);
const KIND_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;
const NONCE_PATTERN = /^[a-f0-9]{32}$/;
const ERROR_CODE_PATTERN = /^(?:CUDA|DRIVER|EXECUTION|MEMORY|RESOURCE|COMPILER|LINKER|NVRTC|NVJITLINK|HEALTH)_[A-Z0-9_]{1,127}$/;
const ERROR_CATEGORIES = new Set([
  'validation', 'unsupported', 'permission', 'pressure', 'backpressure', 'stale-resource',
  'closed-runtime', 'immediate-driver', 'deferred-driver', 'provider', 'restart-required',
  'internal', 'native-compiler', 'native-linker', 'compile', 'link',
]);
const HEALTH_STATES = new Set(['healthy', 'suspect', 'poisoned', 'restart-required', 'closed']);
const HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3, closed: 4 });
const OPERATION_PATTERN = /^[A-Za-z][A-Za-z0-9._():-]{0,127}$/;
const MAX_CAUSE_MESSAGE = 256;
const MAX_NATIVE_TEXT = 160;
const MAX_AGGREGATE_RECORDS = 32;
const MAX_INVENTORY_RECORDS = 16;
const APPROVED_CAUSE_DETAILS = Object.freeze({
  nativeStatus: 'NativeStatus',
  nativeName: 'NativeName',
  nativeDescription: 'NativeDescription',
  nativeMessage: 'NativeMessage',
  reason: 'Reason',
  byteLength: 'ByteLength',
  originOperationId: 'OriginOperationId',
  observedOperationId: 'ObservedOperationId',
  disposalCallCount: 'DisposalCallCount',
});

function fail(code, message, details) {
  throw new ResourceError(code, message, details);
}

function exactFields(value, fields) {
  return Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
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

function field(value, name) {
  try {
    return value?.[name];
  } catch {
    return undefined;
  }
}

function sanitizedText(value, maximum) {
  if (typeof value !== 'string') return null;
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
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
  if (normalized.length === 0) return null;
  return normalized.slice(0, maximum);
}

function safeName(value) {
  return typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value) ? value : 'Error';
}

function safeCauseCode(value) {
  return typeof value === 'string' && /^[A-Z][A-Z0-9_]{0,127}$/.test(value) ? value : null;
}

function safeOperationId(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function validOptionalHealth(value) {
  return value === undefined || value === null || (typeof value === 'string' && HEALTH_STATES.has(value));
}

function validHealthTransition(before, after) {
  if (!validOptionalHealth(before) || !validOptionalHealth(after)) return false;
  if (before === undefined || before === null || after === undefined || after === null) return true;
  return HEALTH_RANK[after] >= HEALTH_RANK[before];
}

function structuredDisposalError(error) {
  const code = field(error, 'code');
  const category = field(error, 'category');
  const message = field(error, 'message');
  const operation = field(error, 'operation');
  const operationId = field(error, 'operationId');
  const healthBefore = field(error, 'healthBefore');
  const healthAfter = field(error, 'healthAfter');
  const details = field(error, 'details');
  return typeof code === 'string'
    && ERROR_CODE_PATTERN.test(code)
    && typeof category === 'string'
    && ERROR_CATEGORIES.has(category)
    && typeof message === 'string'
    && message.length > 0
    && message.length <= 4_096
    && (operation === undefined || operation === null || (typeof operation === 'string' && OPERATION_PATTERN.test(operation)))
    && (operationId === undefined || operationId === null || safeOperationId(operationId) !== null)
    && validHealthTransition(healthBefore, healthAfter)
    && (details === undefined || plainObject(details));
}

function approvedCauseDetails(details) {
  if (!plainObject(details)) return {};
  const output = {};
  for (const [source, suffix] of Object.entries(APPROVED_CAUSE_DETAILS)) {
    const value = field(details, source);
    if (value === undefined) continue;
    if (value === null) {
      output[`cause${suffix}`] = null;
    } else if (typeof value === 'string') {
      const sanitized = sanitizedText(value, MAX_NATIVE_TEXT);
      if (sanitized !== null) output[`cause${suffix}`] = sanitized;
    } else if (Number.isSafeInteger(value)) {
      output[`cause${suffix}`] = value;
    }
  }
  return output;
}

function normalizeDisposalFailure(error, entry) {
  const structured = structuredDisposalError(error);
  const rawMessage = field(error, 'message');
  const causeMessage = sanitizedText(
    typeof rawMessage === 'string' ? rawMessage : 'Disposer threw an unstructured error.',
    MAX_CAUSE_MESSAGE,
  );
  const category = structured ? field(error, 'category') : 'restart-required';
  const observedOperation = structured ? field(error, 'operation') : null;
  const operation = observedOperation ?? 'resource.close';
  const details = Object.freeze({
    resourceKind: entry.kind,
    resourceState: 'orphaned',
    disposition: structured ? 'orphaned' : 'unproved',
    causeName: safeName(field(error, 'name')),
    causeCode: structured ? field(error, 'code') : safeCauseCode(field(error, 'code')),
    causeCategory: structured ? category : null,
    causeOperation: operation,
    causeMessage: causeMessage ?? 'Disposer failure details were unavailable.',
    ...approvedCauseDetails(field(error, 'details')),
  });
  const normalized = new ResourceError(
    'RESOURCE_DISPOSE_FAILED',
    'Resource disposer failed; cleanup is unproved.',
    details,
    {
      category,
      operation,
      operationId: structured ? safeOperationId(field(error, 'operationId')) : null,
      healthBefore: structured ? field(error, 'healthBefore') ?? null : null,
      healthAfter: structured ? field(error, 'healthAfter') ?? null : 'restart-required',
    },
  );
  return Object.freeze(normalized);
}

function failureRecord(error) {
  return Object.freeze({
    name: error.name,
    code: error.code,
    category: error.category,
    message: error.message,
    details: error.details,
    operation: error.operation,
    operationId: error.operationId,
    healthBefore: error.healthBefore,
    healthAfter: error.healthAfter,
  });
}

function cleanupIsUnsafe(error) {
  return error.category === 'restart-required'
    || error.category === 'deferred-driver'
    || error.healthBefore === 'poisoned'
    || error.healthBefore === 'restart-required'
    || error.healthAfter === 'poisoned'
    || error.healthAfter === 'restart-required';
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
    ...(entry.disposalFailure ? { failure: failureRecord(entry.disposalFailure) } : {}),
    ...(entry.orphanDisposition ? {
      disposition: entry.orphanDisposition,
      orphanReason: entry.orphanReason,
    } : {}),
  });
}

function inventoryPriority(entry) {
  if (entry.disposalFailure) return 0;
  if (entry.state === 'orphaned') return 1;
  if (entry.state === 'closing') return 2;
  if (entry.state === 'live') return 3;
  return 4;
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
      disposalFailure: null,
      orphanDisposition: null,
      orphanReason: null,
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
    const entry = this.#locate(token, undefined, { allowDead: true });
    if (entry.state === 'orphaned' && entry.disposalFailure) throw entry.disposalFailure;
    if (this.#dead) fail('RESOURCE_DEAD_EPOCH', 'Resource belongs to a dead runtime epoch.', { epoch: token.epoch, currentEpoch: this.#epoch });
    this.#assertLive(entry);
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
      const normalized = normalizeDisposalFailure(error, entry);
      entry.disposalFailure = normalized;
      entry.orphanDisposition = normalized.details.disposition;
      entry.orphanReason = 'disposal-failed';
      throw normalized;
    }
  }

  async closeTree(token) {
    const root = this.#resolve(token);
    const order = this.#descendants(root).sort((left, right) => right.depth - left.depth || right.entry.slot - left.entry.slot);
    return this.#cascade(order);
  }

  async closeAll() {
    const candidates = this.#entries.filter((entry) => entry?.state === 'live' || entry?.state === 'orphaned');
    const order = candidates.map((entry) => ({ entry, depth: this.#depth(entry) }))
      .sort((left, right) => right.depth - left.depth || right.entry.slot - left.entry.slot);
    return this.#cascade(order);
  }

  markEpochDead(reason = 'owner-lost') {
    if (this.#dead) return this.inventory();
    this.#dead = true;
    for (const entry of this.#entries) {
      if (entry && (entry.state === 'live' || entry.state === 'closing')) {
        entry.state = 'orphaned';
        entry.orphanDisposition = 'unproved';
        entry.orphanReason = 'owner-lost';
      }
    }
    const inventory = this.inventory();
    return Object.freeze({ ...inventory, reason });
  }

  inventory() {
    const entries = this.#entries.filter(Boolean);
    const counts = { live: 0, closing: 0, closed: 0, orphaned: 0 };
    for (const entry of entries) counts[entry.state] += 1;
    const retainedEntries = entries.length <= MAX_INVENTORY_RECORDS
      ? entries
      : [...entries]
        .sort((left, right) => inventoryPriority(left) - inventoryPriority(right) || left.slot - right.slot)
        .slice(0, MAX_INVENTORY_RECORDS);
    const resources = retainedEntries.map((entry) => entryRecord(entry, this.#entries));
    return Object.freeze({
      schemaVersion: 1,
      runtimeId: this.#runtimeId,
      epoch: this.#epoch,
      dead: this.#dead,
      counts: Object.freeze(counts),
      resourceCount: entries.length,
      resources: Object.freeze(resources),
      resourcesTruncated: entries.length - resources.length,
    });
  }

  #resolve(token, expectedKind) {
    const entry = this.#locate(token, expectedKind);
    this.#assertLive(entry);
    return entry;
  }

  #locate(token, expectedKind, { allowDead = false } = {}) {
    if (!isResourceToken(token)) fail('RESOURCE_TOKEN_INVALID', 'Resource token shape is invalid.');
    if (token.runtimeId !== this.#runtimeId) fail('RESOURCE_WRONG_RUNTIME', 'Resource belongs to another runtime.', { runtimeId: token.runtimeId });
    if (token.epoch !== this.#epoch || (this.#dead && !allowDead)) fail('RESOURCE_DEAD_EPOCH', 'Resource belongs to a dead runtime epoch.', { epoch: token.epoch, currentEpoch: this.#epoch });
    const entry = this.#entries[token.slot];
    if (!entry || token.generation !== entry.generation) fail('RESOURCE_STALE', 'Resource generation is stale.', { slot: token.slot, generation: token.generation });
    if (token.kind !== entry.kind || (expectedKind !== undefined && entry.kind !== expectedKind)) {
      fail('RESOURCE_WRONG_KIND', 'Resource kind does not match the required operation.', { actual: entry.kind, tokenKind: token.kind, expected: expectedKind ?? entry.kind });
    }
    if (token.nonce !== entry.nonce) fail('RESOURCE_FORGED', 'Resource capability nonce does not match.', { slot: token.slot, generation: token.generation });
    if (!RESOURCE_STATES.has(entry.state)) fail('RESOURCE_STATE_INVALID', 'Registry contains an invalid resource state.', { state: entry.state });
    return entry;
  }

  #assertLive(entry) {
    if (entry.state === 'closing') fail('RESOURCE_CLOSING', 'Resource is closing.', { slot: entry.slot });
    if (entry.state === 'closed') fail('RESOURCE_CLOSED', 'Resource is closed.', { slot: entry.slot });
    if (entry.state === 'orphaned') fail('RESOURCE_ORPHANED', 'Resource is orphaned and inaccessible.', { slot: entry.slot });
  }

  async #cascade(order) {
    const dispositions = [];
    const errors = [];
    const skipped = [];
    let dispositionCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let unsafeFailure = null;

    const retainDisposition = (disposition) => {
      dispositionCount += 1;
      dispositions.push(disposition);
      if (dispositions.length > MAX_AGGREGATE_RECORDS) dispositions.shift();
    };

    const retainError = (error) => {
      errorCount += 1;
      const firstUnsafeFailure = cleanupIsUnsafe(error) && unsafeFailure === null;
      const record = failureRecord(error);
      if (errors.length < MAX_AGGREGATE_RECORDS) errors.push(record);
      else if (firstUnsafeFailure) errors[errors.length - 1] = record;
      if (firstUnsafeFailure) unsafeFailure = error;
    };
    const retainSkipped = (entry, reason, blockedBy = null) => {
      entry.state = 'orphaned';
      entry.orphanDisposition = 'unproved';
      entry.orphanReason = reason;
      skippedCount += 1;
      if (skipped.length < MAX_AGGREGATE_RECORDS) {
        skipped.push(Object.freeze({
          resource: Object.freeze({ kind: entry.kind, slot: entry.slot, generation: entry.generation, state: entry.state }),
          disposition: 'unproved',
          reason,
          blockedByCode: blockedBy?.code ?? null,
          blockedByCategory: blockedBy?.category ?? null,
        }));
      }
    };

    for (const { entry } of order) {
      if (entry.disposalFailure) retainError(entry.disposalFailure);
      else if (entry.state === 'orphaned' && entry.orphanDisposition === 'unproved') {
        skippedCount += 1;
        if (skipped.length < MAX_AGGREGATE_RECORDS) {
          skipped.push(Object.freeze({
            resource: Object.freeze({ kind: entry.kind, slot: entry.slot, generation: entry.generation, state: entry.state }),
            disposition: 'unproved',
            reason: entry.orphanReason ?? 'cleanup-unproved',
            blockedByCode: null,
            blockedByCategory: null,
          }));
        }
      }
    }

    for (const { entry } of order) {
      if (entry.state !== 'live') continue;
      if (unsafeFailure) {
        retainSkipped(entry, 'unsafe-after-disposal-failure', unsafeFailure);
        continue;
      }
      if (entry.children.size > 0) {
        const blockingChild = [...entry.children]
          .map((slot) => this.#entries[slot])
          .find((child) => child && child.state !== 'closed');
        retainSkipped(entry, 'dependent-resource-unproved', blockingChild?.disposalFailure ?? null);
        continue;
      }
      try {
        retainDisposition(await this.close(publicToken(entry, this.#runtimeId, this.#epoch)));
      } catch (error) {
        retainError(error);
      }
    }
    return Object.freeze({
      dispositions: Object.freeze(dispositions),
      dispositionCount,
      dispositionsTruncated: dispositionCount - dispositions.length,
      errors: Object.freeze(errors),
      errorCount,
      errorsTruncated: errorCount - errors.length,
      skipped: Object.freeze(skipped),
      skippedCount,
      skippedTruncated: skippedCount - skipped.length,
      inventory: this.inventory(),
    });
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
    const pending = [{ entry: root, depth: 0 }];
    const visited = new Set();
    while (pending.length > 0) {
      const current = pending.pop();
      if (visited.has(current.entry.slot)) fail('RESOURCE_DEPENDENCY_CYCLE', 'Resource dependency cycle detected.', { slot: current.entry.slot });
      visited.add(current.entry.slot);
      output.push(current);
      const children = [...current.entry.children];
      for (let index = children.length - 1; index >= 0; index -= 1) {
        const child = this.#entries[children[index]];
        if (child) pending.push({ entry: child, depth: current.depth + 1 });
      }
    }
    return output;
  }
}
