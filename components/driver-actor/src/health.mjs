import { DriverRuntimeError } from './errors.mjs';

export const HEALTH_STATES = Object.freeze(['healthy', 'suspect', 'poisoned', 'restart-required', 'closed']);
const HEALTH_RANK = Object.freeze(Object.fromEntries(HEALTH_STATES.map((state, index) => [state, index])));

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
  if (requested !== null) return requested;
  if (['validation', 'unsupported', 'stale-resource', 'backpressure'].includes(category)) return null;
  if (category === 'immediate-driver') return 'suspect';
  if (category === 'deferred-driver') return 'poisoned';
  if (category === 'restart-required') return 'restart-required';
  return 'suspect';
}
