import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { DEFAULT_MEMORY_POLICY, MemoryError, MemoryManager, normalizeMemoryPolicy } from '../index.mjs';

function fixture({
  policy = { maxDeviceBytes: 32, maxAllocationBytes: 24, maxTransferBytes: 16 },
  failAllocate = false,
  failFree = false,
  registrationFailure = null,
  freeFailure = null,
  delayedWrite = null,
} = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'memory-test', epoch: 1, nonce: (() => {
    let value = 0;
    return () => (++value).toString(16).padStart(32, '0');
  })() });
  const order = [];
  const library = registry.allocate({ kind: 'library', value: {}, dispose() { order.push('library'); } });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose() { order.push('context'); } });
  if (registrationFailure !== null) {
    const allocateResource = registry.allocate.bind(registry);
    registry.allocate = (request) => {
      if (request?.kind === 'device-memory') throw registrationFailure;
      return allocateResource(request);
    };
  }
  const live = new Set();
  const calls = { allocate: 0, free: 0, write: 0, read: 0 };
  const manager = new MemoryManager({
    registry,
    contextToken: context,
    policy,
    operations: {
      async query() { return { freeBytes: 1_024, totalBytes: 2_048 }; },
      async allocate({ byteLength }) {
        calls.allocate += 1;
        if (failAllocate) throw Object.assign(new Error('injected allocation failure'), { code: 'INJECT_ALLOCATE' });
        const storage = new Uint8Array(byteLength);
        live.add(storage);
        return storage;
      },
      async free({ native }) {
        calls.free += 1;
        if (freeFailure !== null) throw freeFailure;
        if (failFree) throw Object.assign(new Error('injected free failure'), { code: 'INJECT_FREE' });
        assert.equal(live.delete(native), true);
        order.push('device-memory');
        return { freed: true };
      },
      async write({ native, deviceOffset, bytes }) {
        calls.write += 1;
        if (delayedWrite) await delayedWrite;
        native.set(bytes, deviceOffset);
      },
      async read({ native, deviceOffset, byteLength }) {
        calls.read += 1;
        return Uint8Array.from(native.subarray(deviceOffset, deviceOffset + byteLength));
      },
    },
  });
  return { registry, manager, calls, order, context };
}

test('memory policy is exact, bounded, and defaults conservatively', () => {
  assert.deepEqual(normalizeMemoryPolicy(), DEFAULT_MEMORY_POLICY);
  assert.throws(() => normalizeMemoryPolicy({ extra: 1 }), (error) => error instanceof MemoryError && error.code === 'MEMORY_POLICY_INVALID');
  assert.throws(() => normalizeMemoryPolicy({ maxDeviceBytes: 8, maxAllocationBytes: 9 }), (error) => error.code === 'MEMORY_POLICY_INVALID');
  assert.throws(() => normalizeMemoryPolicy({ maxTransferBytes: 64 * 1_048_576 + 1 }), (error) => error.code === 'MEMORY_POLICY_INVALID');
});

test('allocation quota reserves, rolls back on failure, reuses capacity, and rejects stale tokens', async () => {
  const failed = fixture({ failAllocate: true });
  await assert.rejects(failed.manager.allocate({ byteLength: 8 }), (error) => error.code === 'INJECT_ALLOCATE');
  assert.equal(failed.manager.reservedBytes, 0);
  assert.equal(failed.manager.allocationCount, 0);

  const { manager, calls } = fixture();
  const first = await manager.allocate({ byteLength: 20 });
  await assert.rejects(manager.allocate({ byteLength: 13 }), (error) => error.code === 'MEMORY_QUOTA_EXCEEDED');
  await assert.rejects(manager.allocate({ byteLength: 25 }), (error) => error.code === 'MEMORY_ALLOCATION_LIMIT');
  assert.equal(calls.allocate, 1);
  const released = await manager.release(first.memory);
  assert.equal(released.usage.reservedBytes, 0);
  const replacement = await manager.allocate({ byteLength: 16 });
  assert.equal(replacement.memory.slot, first.memory.slot);
  assert(replacement.memory.generation > first.memory.generation);
  await assert.rejects(manager.status(first.memory), (error) => error.code === 'RESOURCE_STALE');
});

test('full and offset transfers preserve bytes and reject every invalid range before backend work', async () => {
  const { manager, calls } = fixture();
  const allocation = await manager.allocate({ byteLength: 16 });
  const full = Uint8Array.from({ length: 16 }, (_, index) => (index * 17 + 3) & 0xff);
  await manager.write(allocation.memory, full);
  const patch = Uint8Array.of(9, 8, 7, 6);
  await manager.write(allocation.memory, patch, { deviceOffset: 6 });
  const read = await manager.read(allocation.memory, { deviceOffset: 0, byteLength: 16 });
  assert.deepEqual([...read.bytes], [...full.slice(0, 6), ...patch, ...full.slice(10)]);
  read.bytes[0] = 255;
  assert.notEqual((await manager.read(allocation.memory, { deviceOffset: 0, byteLength: 1 })).bytes[0], 255);

  const writesBefore = calls.write;
  const readsBefore = calls.read;
  await assert.rejects(manager.write(allocation.memory, Uint8Array.of(1, 2), { deviceOffset: 15 }), (error) => error.code === 'MEMORY_RANGE_OUT_OF_BOUNDS');
  await assert.rejects(manager.read(allocation.memory, { deviceOffset: Number.MAX_SAFE_INTEGER, byteLength: 1 }), (error) => error.code === 'MEMORY_RANGE_OUT_OF_BOUNDS');
  await assert.rejects(manager.read(allocation.memory, { deviceOffset: 0, byteLength: 17 }), (error) => error.code === 'MEMORY_TRANSFER_LIMIT');
  await assert.rejects(manager.write(allocation.memory, Buffer.from([1])), (error) => error.code === 'MEMORY_BYTES_INVALID');
  assert.equal(calls.write, writesBefore);
  assert.equal(calls.read, readsBefore);
});

test('leases fence release and graceful teardown frees memory before context and library', async () => {
  let unblock;
  const delayedWrite = new Promise((resolve) => { unblock = resolve; });
  const { manager, registry, order } = fixture({ delayedWrite });
  const allocation = await manager.allocate({ byteLength: 8 });
  const writing = manager.write(allocation.memory, Uint8Array.of(1));
  await assert.rejects(manager.release(allocation.memory), (error) => error.code === 'RESOURCE_BUSY');
  unblock();
  await writing;
  const teardown = await registry.closeAll();
  assert.deepEqual(order, ['device-memory', 'context', 'library']);
  assert.deepEqual(teardown.inventory.counts, { live: 0, closing: 0, closed: 3, orphaned: 0 });
  assert.equal(manager.reservedBytes, 0);
});

test('failed free remains orphaned and quota-reserved', async () => {
  const { manager, registry, calls } = fixture({ failFree: true });
  const allocation = await manager.allocate({ byteLength: 12 });
  let firstFailure;
  await assert.rejects(manager.release(allocation.memory), (error) => {
    firstFailure = error;
    return error.code === 'RESOURCE_DISPOSE_FAILED';
  });
  await assert.rejects(manager.release(allocation.memory), (error) => error === firstFailure);
  assert.equal(calls.free, 1);
  assert.equal(manager.reservedBytes, 12);
  assert.equal(manager.allocationCount, 1);
  assert.deepEqual(registry.inventory().counts, { live: 2, closing: 0, closed: 0, orphaned: 1 });
});

test('allocation registration rollback retains sanitized primary and cleanup failures with strongest health', async () => {
  const primaryFailure = Object.assign(new Error('registration rejected'), {
    code: 'RESOURCE_NONCE_INVALID',
    category: 'stale-resource',
    operation: 'resource.allocate',
    healthBefore: 'healthy',
    healthAfter: 'healthy',
    details: { resourceKind: 'device-memory', providerPath: 'C:\\private\\provider.dll' },
  });
  const cleanupFailure = new MemoryError(
    'CUDA_FREE_FAILED',
    'deferred-driver',
    'free failed',
    {
      nativeStatus: 719,
      nativeName: 'CUDA_ERROR_LAUNCH_FAILED',
      nativeDescription: 'x'.repeat(512),
      causeNativeDescription: 'host buildbox account alice user bob email mailroom machine runner-01 contact bob@example.test',
      causeNativeMessage: 'nonce nonceSecret123 token tokenSecret123 runtimeId runtimeSecret123',
      causeReason: 'handle 123456 pointer barePointer9 address bareAddress9',
      reason: '0123456789abcdef0123456789abcdef',
      nativeHandle: '0xfeedface',
      providerPath: 'C:\\private\\nvcuda.dll',
    },
    { operation: 'cuMemFree', operationId: 41, healthBefore: 'suspect', healthAfter: 'poisoned' },
  );
  const { manager, calls } = fixture({ registrationFailure: primaryFailure, freeFailure: cleanupFailure });

  let firstFailure;
  await assert.rejects(manager.allocate({ byteLength: 8, operationId: 41 }), (error) => {
    firstFailure = error;
    assert(error instanceof MemoryError);
    assert.equal(error.code, 'MEMORY_ALLOCATION_ROLLBACK_FAILED');
    assert.equal(error.category, 'deferred-driver');
    assert.equal(error.operation, 'memory.allocate');
    assert.equal(error.operationId, 41);
    assert.equal(error.healthBefore, 'healthy');
    assert.equal(error.healthAfter, 'poisoned');
    assert.equal(error.details.resultingHealth, 'poisoned');
    assert.equal(error.details.terminal, 'unproved');
    assert.equal(error.details.primaryFailure.code, 'RESOURCE_NONCE_INVALID');
    assert.equal(error.details.primaryFailure.operation, 'resource.allocate');
    assert.equal(error.details.cleanupFailures.length, 1);
    assert.equal(error.details.cleanupFailures[0].code, 'CUDA_FREE_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuMemFree');
    assert.equal(error.details.cleanupFailures[0].healthAfter, 'poisoned');
    assert.equal(error.details.cleanupFailures[0].details.nativeStatus, 719);
    assert.equal(error.details.cleanupFailures[0].details.nativeDescription.length, 160);
    const cleanupDetails = error.details.cleanupFailures[0].details;
    assert.match(cleanupDetails.causeNativeDescription, /\[redacted-identity\]/);
    assert.match(cleanupDetails.causeNativeMessage, /\[redacted-capability\]/);
    assert.match(cleanupDetails.causeReason, /\[redacted-handle\]/);
    assert.equal(cleanupDetails.reason, '[redacted-capability]');
    assert.deepEqual(error.details.inventory.unproved, [{ kind: 'device-memory', registered: false, disposition: 'unproved' }]);
    const serialized = JSON.stringify(error.details);
    assert.doesNotMatch(serialized, /feedface|private|providerPath|nativeHandle|buildbox|alice|user bob|mailroom|runner-01|bob@example\.test|nonceSecret123|tokenSecret123|runtimeSecret123|123456|barePointer9|bareAddress9|0123456789abcdef0123456789abcdef/i);
    return true;
  });
  assert.equal(calls.free, 1);
  await assert.rejects(manager.allocate({ byteLength: 4, operationId: 42 }), (error) => error === firstFailure);
  assert.equal(manager.rollbackFailure(), firstFailure);
  assert.equal(calls.allocate, 1);
  assert.equal(calls.free, 1);
  assert.equal(manager.reservedBytes, 8);
  assert.equal(manager.allocationCount, 0);
});

test('unstructured allocation rollback cleanup is restart-required with bounded cause summary', async () => {
  const primaryFailure = Object.assign(new Error('registration rejected'), { code: 'REGISTER_REJECTED', category: 'internal' });
  const cleanupFailure = Object.assign(new Error(`cleanup failed at C:\\private\\${'x'.repeat(512)}`), { code: 'FREE_UNSTRUCTURED' });
  const { manager } = fixture({ registrationFailure: primaryFailure, freeFailure: cleanupFailure });

  await assert.rejects(manager.allocate({ byteLength: 4, operationId: 9 }), (error) => {
    assert.equal(error.code, 'MEMORY_ALLOCATION_ROLLBACK_FAILED');
    assert.equal(error.category, 'restart-required');
    assert.equal(error.healthAfter, 'restart-required');
    assert.equal(error.details.cleanupFailures[0].code, 'MEMORY_ALLOCATION_CLEANUP_UNPROVED');
    assert.equal(error.details.cleanupFailures[0].details.causeCode, 'FREE_UNSTRUCTURED');
    assert.match(error.details.cleanupFailures[0].details.causeMessage, /\[redacted-path\]/);
    assert.doesNotMatch(JSON.stringify(error.details), /private/);
    return true;
  });
});
