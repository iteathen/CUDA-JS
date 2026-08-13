import assert from 'node:assert/strict';
import test from 'node:test';

import { HealthState, observeErrorHealth } from '../src/health.mjs';

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

test('error observation chooses the strongest explicit, category, and cleanup health without downgrade', () => {
  const health = new HealthState();
  observeErrorHealth(health, { code: 'CUDA_FAILURE', category: 'immediate-driver', healthAfter: 'poisoned', operation: 'cuMemFree_v2' }, { operationId: 1 });
  assert.equal(health.current, 'poisoned');
  observeErrorHealth(health, { code: 'CUDA_FAILURE', category: 'immediate-driver', healthAfter: 'suspect', operation: 'cuMemFree_v2' }, { operationId: 2 });
  assert.equal(health.current, 'poisoned');
  observeErrorHealth(health, {
    code: 'MEMORY_ALLOCATION_ROLLBACK_FAILED',
    category: 'internal',
    details: { cleanupFailures: [{ category: 'restart-required', healthAfter: 'restart-required' }] },
  }, { operationId: 3 });
  assert.equal(health.current, 'restart-required');
  assert.deepEqual(health.snapshot().history.map((entry) => entry.after), ['poisoned', 'restart-required']);
});

test('structured stale-resource disposal controls do not poison health without an explicit transition', () => {
  const health = new HealthState();
  observeErrorHealth(health, {
    code: 'RESOURCE_DISPOSE_FAILED',
    category: 'stale-resource',
    operation: 'resource.close',
    healthBefore: 'healthy',
    healthAfter: 'healthy',
  }, { operationId: 1 });
  assert.equal(health.current, 'healthy');
  assert.deepEqual(health.snapshot().history, []);
});
