import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { DeviceViewManager, deviceViewRangesOverlap } from '../src/device-view-manager.mjs';

function fixture(byteLength = 64) {
  let parentDisposeCount = 0;
  const registry = new ResourceRegistry({ runtimeId: 'view-test-runtime', epoch: 1, nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })() });
  const context = registry.allocate({ kind: 'context', value: Object.freeze({}), dispose: async () => ({ closed: true }) });
  const memory = registry.allocate({
    kind: 'device-memory',
    value: Object.freeze({ byteLength, native: Object.freeze({ private: true }) }),
    parent: context,
    dispose: async () => { parentDisposeCount += 1; return { freed: true }; },
  });
  return { registry, context, memory, views: new DeviceViewManager({ registry }), parentDisposeCount: () => parentDisposeCount };
}

test('device view creates bounded aligned full, tail and zero-length descriptors without native data', () => {
  const { views, memory } = fixture();
  const full = views.create(memory, { dtype: 'f32', elementCount: 16, access: 'read' });
  assert.equal(full.kind, 'device-view');
  assert.equal(full.dtype, 'f32');
  assert.equal(full.byteOffset, 0);
  assert.equal(full.byteLength, 64);
  assert.equal(full.elementCount, 16);
  assert.equal(full.access, 'read');
  assert.deepEqual(full.memory, memory);
  assert.equal(Object.hasOwn(full, 'native'), false);
  assert.equal(Object.hasOwn(full, 'address'), false);

  const tail = views.create(memory, { dtype: 'f16', byteOffset: 62, elementCount: 1 });
  assert.equal(tail.byteLength, 2);
  assert.equal(tail.byteOffset, 62);

  const emptyAtClosedBoundary = views.create(memory, { dtype: 'bf16', byteOffset: 64, elementCount: 0, access: 'write' });
  assert.equal(emptyAtClosedBoundary.byteLength, 0);
  assert.equal(emptyAtClosedBoundary.byteOffset, 64);
});

test('device view rejects unsupported dtype, alignment, range and safe-integer overflow before allocation', () => {
  const { views, memory, registry } = fixture();
  const before = registry.inventory().resourceCount;
  assert.throws(() => views.create(memory, { dtype: 'u8', elementCount: 1 }), { code: 'MEMORY_VIEW_DTYPE_INVALID' });
  assert.throws(() => views.create(memory, { dtype: 'f64', byteOffset: 4, elementCount: 1 }), { code: 'MEMORY_VIEW_ALIGNMENT' });
  assert.throws(() => views.create(memory, { dtype: 'u32', byteOffset: 64, elementCount: 1 }), { code: 'MEMORY_VIEW_RANGE_OUT_OF_BOUNDS' });
  assert.throws(() => views.create(memory, { dtype: 'f64', elementCount: Number.MAX_SAFE_INTEGER }), { code: 'MEMORY_VIEW_RANGE_INVALID' });
  assert.equal(registry.inventory().resourceCount, before);
});

test('live views are registry children and prevent parent release until view close', async () => {
  const { views, memory, registry, parentDisposeCount } = fixture();
  const view = views.create(memory, { dtype: 'u32', elementCount: 4 });
  await assert.rejects(() => registry.close(memory), { code: 'RESOURCE_HAS_CHILDREN' });
  assert.equal(parentDisposeCount(), 0);
  const releasedView = await views.release(view.view);
  assert.equal(releasedView.released.kind, 'device-view');
  await registry.close(memory);
  assert.equal(parentDisposeCount(), 1);
  assert.throws(() => views.status(view.view), { code: 'RESOURCE_CLOSED' });
});

test('view leases enforce declared access and block view close while in flight', async () => {
  const { views, memory } = fixture();
  const descriptor = views.create(memory, { dtype: 'f32', elementCount: 4, access: 'read' });
  assert.throws(() => views.acquire(descriptor.view, { access: 'write' }), { code: 'MEMORY_VIEW_ACCESS_DENIED' });
  const lease = views.acquire(descriptor.view, { access: 'read' });
  assert.equal(lease.byteLength, 16);
  await assert.rejects(() => views.release(descriptor.view), { code: 'RESOURCE_BUSY' });
  lease.release();
  await views.release(descriptor.view);
});

test('view overlap classification uses exact half-open byte ranges', () => {
  const { views, memory } = fixture();
  const left = views.create(memory, { dtype: 'u32', byteOffset: 0, elementCount: 4 });
  const touching = views.create(memory, { dtype: 'u32', byteOffset: 16, elementCount: 2 });
  const overlapping = views.create(memory, { dtype: 'u32', byteOffset: 12, elementCount: 2 });
  const empty = views.create(memory, { dtype: 'u32', byteOffset: 8, elementCount: 0 });
  assert.equal(deviceViewRangesOverlap(left, touching), false);
  assert.equal(deviceViewRangesOverlap(left, overlapping), true);
  assert.equal(deviceViewRangesOverlap(left, empty), false);
});
