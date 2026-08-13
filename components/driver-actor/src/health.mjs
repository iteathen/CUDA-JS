import { DriverRuntimeError } from './errors.mjs';

export const HEALTH_STATES = Object.freeze(['healthy', 'suspect', 'poisoned', 'restart-required', 'closed']);
const HEALTH_RANK = Object.freeze(Object.fromEntries(HEALTH_STATES.map((state, index) => [state, index])));

function acceptedHealth(value) {
  return typeof value === 'string' && value !== 'closed' && Object.hasOwn(HEALTH_RANK, value) ? value : null;
}

function strongestHealth(left, right) {
  if (left === null) return right;
  if (right === null) return left;
  return HEALTH_RANK[right] > HEALTH_RANK[left] ? right : left;
}

function observeFailureRecord(record) {
  const explicit = acceptedHealth(record?.healthAfter);
  const category = typeof record?.category === 'string' ? healthForErrorCategory(record.category) : null;
  return strongestHealth(explicit, category);
}

function observeNestedHealth(error) {
  let requested = null;
  requested = strongestHealth(requested, observeFailureRecord(error?.details?.primaryFailure));
  const cleanupFailures = Array.isArray(error?.details?.cleanupFailures) ? error.details.cleanupFailures : [];
  for (const failure of cleanupFailures) requested = strongestHealth(requested, observeFailureRecord(failure));
  return requested;
}

export class HealthState {
  #current = 'healthy';
  #history = [];

  get current() { return this.#current; }

  transition(next, { reason, operationId = null } = {}) {
    if (!(next in HEALTH_RANK)) throw new DriverRuntimeError('HEALTH_STATE_INVALID', 'internal', 'Unknown health state.', { next });
    if (this.#current === 'closed' && next !== 'closed') {
      throw new DriverRuntimeError('HEALTH_TRANSITION_INVALID', 'internal', 'Closed health is terminal.', { current: this.#current, next });
    }
    if (next !== 'closed' && HEALTH_RANK[next] < HEALTH_RANK[this.#current]) {
      throw new DriverRuntimeError('HEALTH_TRANSITION_INVALID', 'internal', 'Health transitions cannot recover within one runtime epoch.', { current: this.#current, next });
    }
    const before = this.#current;
    this.#current = next;
    if (before !== next) this.#history.push(Object.freeze({ before, after: next, reason: reason ?? 'unspecified', operationId }));
    return Object.freeze({ before, after: this.#current });
  }

  snapshot() {
    return Object.freeze({ current: this.#current, history: Object.freeze([...this.#history]) });
  }
}

export function healthForErrorCategory(category, requested = null) {
  if (requested !== null) return acceptedHealth(requested);
  if (['validation', 'unsupported', 'pressure', 'stale-resource', 'backpressure', 'closed-runtime'].includes(category)) return null;
  if (category === 'immediate-driver') return 'suspect';
  if (category === 'deferred-driver') return 'poisoned';
  if (category === 'restart-required') return 'restart-required';
  return 'suspect';
}

export function observeErrorHealth(health, error, { operationId = null, reason = null } = {}) {
  const structured = typeof error?.code === 'string' && typeof error?.category === 'string';
  const categoryHealth = structured ? healthForErrorCategory(error.category) : 'restart-required';
  const explicitHealth = acceptedHealth(error?.healthAfter);
  let requested = strongestHealth(explicitHealth, categoryHealth);
  requested = strongestHealth(requested, observeNestedHealth(error));
  if (requested !== null && health.current !== 'closed' && HEALTH_RANK[requested] > HEALTH_RANK[health.current]) {
    health.transition(requested, {
      reason: reason ?? error?.operation ?? error?.category ?? 'unstructured-error',
      operationId: Number.isSafeInteger(error?.operationId) ? error.operationId : operationId,
    });
  }
  return health.snapshot();
}
