import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceError, ResourceRegistry, isResourceToken } from '../index.mjs';

function deterministicRegistry(runtimeId = 'runtime-a') {
  let nonce = 0;
  return new ResourceRegistry({
    runtimeId,
    epoch: 1,
    nonce: () => (++nonce).toString(16).padStart(32, '0'),
  });
}

function expectCode(code) {
  return (error) => error instanceof ResourceError && error.code === code;
}

test('tokens are frozen, exact, and private values require the matching capability', () => {
  const registry = deterministicRegistry();
  const value = { private: true };
  const token = registry.allocate({ kind: 'context', value, dispose() {} });
  assert.equal(Object.isFrozen(token), true);
  assert.equal(isResourceToken(token), true);
  assert.equal(registry.get(token, { kind: 'context' }), value);
  assert.throws(() => registry.get({ ...token, extra: true }), expectCode('RESOURCE_TOKEN_INVALID'));
  assert.throws(() => registry.get({ ...token, runtimeId: 'runtime-b' }), expectCode('RESOURCE_WRONG_RUNTIME'));
  assert.throws(() => registry.get(token, { kind: 'library' }), expectCode('RESOURCE_WRONG_KIND'));
  assert.throws(() => registry.get({ ...token, nonce: 'f'.repeat(32) }), expectCode('RESOURCE_FORGED'));
});

test('slots reuse only after close and stale generations never resolve replacements', async () => {
  const registry = deterministicRegistry();
  const first = registry.allocate({ kind: 'context', value: 'first', dispose() {} });
  await registry.close(first);
  assert.throws(() => registry.get(first), expectCode('RESOURCE_CLOSED'));
  const second = registry.allocate({ kind: 'context', value: 'second', dispose() {} });
  assert.equal(second.slot, first.slot);
  assert.equal(second.generation, first.generation + 1);
  assert.notEqual(second.nonce, first.nonce);
  assert.throws(() => registry.get(first), expectCode('RESOURCE_STALE'));
  assert.equal(registry.get(second), 'second');
});

test('leases and children fence disposal while cascade closes child before parent', async () => {
  const registry = deterministicRegistry();
  const order = [];
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() { order.push('library'); } });
  const child = registry.allocate({ kind: 'context', value: 'context', parent, dispose() { order.push('context'); } });
  const lease = registry.acquire(child, { kind: 'context' });
  await assert.rejects(registry.close(child), expectCode('RESOURCE_BUSY'));
  await assert.rejects(registry.close(parent), expectCode('RESOURCE_HAS_CHILDREN'));
  lease.release();
  assert.throws(() => lease.release(), expectCode('RESOURCE_LEASE_RELEASED'));
  const report = await registry.closeTree(parent);
  assert.deepEqual(order, ['context', 'library']);
  assert.equal(report.errors.length, 0);
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: 2, orphaned: 0 });
});

test('closing state rejects new access until the disposer terminates', async () => {
  const registry = deterministicRegistry();
  let finish;
  const token = registry.allocate({
    kind: 'context',
    value: 'context',
    dispose: () => new Promise((resolve) => { finish = resolve; }),
  });
  const closing = registry.close(token);
  assert.throws(() => registry.get(token), expectCode('RESOURCE_CLOSING'));
  finish({ released: true });
  const record = await closing;
  assert.deepEqual(record.disposition, { released: true });
  assert.throws(() => registry.get(token), expectCode('RESOURCE_CLOSED'));
});

test('disposer failure becomes orphaned and never reports clean cleanup', async () => {
  const registry = deterministicRegistry();
  const token = registry.allocate({
    kind: 'context',
    value: 'context',
    dispose() { throw Object.assign(new Error('destroy failed'), { code: 'CUDA_DESTROY_FAILED' }); },
  });
  await assert.rejects(registry.close(token), expectCode('RESOURCE_DISPOSE_FAILED'));
  assert.equal(registry.inventory().counts.orphaned, 1);
  assert.throws(() => registry.get(token), expectCode('RESOURCE_ORPHANED'));
});

test('dead epochs mark inaccessible resources orphaned without invoking disposers', () => {
  const registry = deterministicRegistry();
  let disposed = false;
  const token = registry.allocate({ kind: 'context', value: 'context', dispose() { disposed = true; } });
  const report = registry.markEpochDead('worker-lost');
  assert.equal(disposed, false);
  assert.equal(report.dead, true);
  assert.equal(report.counts.orphaned, 1);
  assert.throws(() => registry.get(token), expectCode('RESOURCE_DEAD_EPOCH'));
  assert.deepEqual(registry.markEpochDead('again').counts, report.counts);
});
