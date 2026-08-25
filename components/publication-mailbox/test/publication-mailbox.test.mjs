import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { PublicationMailboxManager } from '../index.mjs';

function fixture(overrides = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'mailbox-test', epoch: 1, nonce: (() => { let n = 0; return () => (++n).toString(16).padStart(32, '0'); })() });
  const context = registry.allocate({ kind: 'context', value: {}, dispose() {} });
  let next = 0x1000n;
  const live = new Set();
  const manager = new PublicationMailboxManager({ registry, contextToken: context, operations: {
    async register({ view }) { live.add(view); return view; },
    async map({ view }) { assert(live.has(view)); const value = next; next += 0x100n; return value; },
    async unregister({ view }) { assert(live.delete(view)); return { unregistered: true }; },
    ...overrides,
  } });
  return { registry, context, manager, live };
}

const lanes = [{ name: 'control', direction: 'host-to-device' }, { name: 'observation', direction: 'device-to-host' }];

test('mailbox owns mapped storage, direction-specific bindings, generation, and one live operation lease', async () => {
  const fx = fixture();
  const buffer = new SharedArrayBuffer(8);
  const created = await fx.manager.create(buffer, { lanes, operationId: 1 });
  assert.equal(fx.live.size, 1);
  const lease = fx.manager.acquireForExecution(created.mailbox, 1, [
    { lane: 'control', direction: 'host-to-device' },
    { lane: 'observation', direction: 'device-to-host' },
  ]);
  assert.deepEqual(lease.pointers, [0x1000n, 0x1004n]);
  assert.throws(() => fx.manager.reset(created.mailbox, 1), (error) => error.code === 'MEMORY_MAILBOX_BUSY');
  assert.throws(() => fx.manager.acquireForExecution(created.mailbox, 1, [{ lane: 'control', direction: 'host-to-device' }]), (error) => error.code === 'MEMORY_MAILBOX_BUSY');
  lease.release();
  Atomics.store(new Int32Array(buffer), 0, -1);
  assert.equal(fx.manager.reset(created.mailbox, 1).generation, 2);
  assert.deepEqual([...new Int32Array(buffer)], [0, 0]);
  assert.throws(() => fx.manager.acquireForExecution(created.mailbox, 1, [{ lane: 'control', direction: 'host-to-device' }]), (error) => error.code === 'MEMORY_MAILBOX_GENERATION_STALE');
  await fx.manager.release(created.mailbox, 4);
  assert.equal(fx.live.size, 0);
});

test('mailbox rejects invalid schema, wrong direction, and mapping rollback residue', async () => {
  const fx = fixture();
  await assert.rejects(fx.manager.create(new SharedArrayBuffer(4), { lanes }), (error) => error.code === 'MEMORY_MAILBOX_STORAGE_INVALID');
  const created = await fx.manager.create(new SharedArrayBuffer(8), { lanes });
  assert.throws(() => fx.manager.acquireForExecution(created.mailbox, 1, [{ lane: 'control', direction: 'device-to-host' }]), (error) => error.code === 'MEMORY_MAILBOX_DIRECTION_MISMATCH');
  await fx.manager.release(created.mailbox);

  const rollback = fixture({ async map() { throw Object.assign(new Error('map failed'), { code: 'CUDA_MAP_FAILURE' }); } });
  await assert.rejects(rollback.manager.create(new SharedArrayBuffer(8), { lanes }), (error) => error.code === 'CUDA_MAP_FAILURE');
  assert.equal(rollback.live.size, 0);
});

test('mailbox unregister failure is retained as explicit orphaned cleanup debt', async () => {
  const fx = fixture({ async unregister() { throw Object.assign(new Error('unregister failed'), { code: 'CUDA_UNREGISTER_FAILURE' }); } });
  const created = await fx.manager.create(new SharedArrayBuffer(8), { lanes });
  await assert.rejects(fx.manager.release(created.mailbox), (error) => error.code === 'RESOURCE_DISPOSE_FAILED' && error.details.causeCode === 'CUDA_UNREGISTER_FAILURE');
  assert.equal(fx.registry.inventory().counts.orphaned, 1);
});
