import assert from 'node:assert/strict';
import test from 'node:test';

import { HealthState } from '../src/health.mjs';

test('health state never recovers inside one runtime epoch and closed is terminal', () => {
  const health = new HealthState();
  health.transition('suspect', { reason: 'immediate', operationId: 1 });
  assert.throws(() => health.transition('healthy', { reason: 'unsafe-recovery', operationId: 2 }), (error) => error.code === 'HEALTH_TRANSITION_INVALID');
  health.transition('poisoned', { reason: 'deferred', operationId: 3 });
  health.transition('restart-required', { reason: 'lost', operationId: 4 });
  health.transition('closed', { reason: 'terminal', operationId: 5 });
  assert.throws(() => health.transition('restart-required', { reason: 'reopen', operationId: 6 }), (error) => error.code === 'HEALTH_TRANSITION_INVALID');
  assert.deepEqual(health.snapshot().history.map((entry) => entry.after), ['suspect', 'poisoned', 'restart-required', 'closed']);
});
