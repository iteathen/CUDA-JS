import { ResourceRegistry } from '../../../resource-registry/index.mjs';
import { MemoryManager } from '../../../memory/index.mjs';
import { DriverRuntimeError } from '../errors.mjs';
import { HealthState, healthForErrorCategory } from '../health.mjs';

export async function createBackend({ runtimeId, epoch, memoryPolicy }) {
  const health = new HealthState();
  const registry = new ResourceRegistry({ runtimeId, epoch });
  const disposalOrder = [];
  const libraryToken = registry.allocate({
    kind: 'library',
    value: Object.freeze({ privateMockLibrary: true }),
    dispose() {
      disposalOrder.push('library');
      return { libraryClosed: true, staleWrapperRejected: true };
    },
  });
  const contextToken = registry.allocate({
    kind: 'context',
    value: Object.freeze({ privateMockContext: true }),
    parent: libraryToken,
    dispose() {
      disposalOrder.push('context');
      return { contextDestroyed: true, currentNull: true };
    },
  });
  const allocations = new Set();
  let nativeReservedBytes = 0;
  const memory = new MemoryManager({
    registry,
    contextToken,
    policy: memoryPolicy,
    operations: {
      async query() {
        return { freeBytes: memoryPolicy.maxDeviceBytes - nativeReservedBytes, totalBytes: memoryPolicy.maxDeviceBytes };
      },
      async allocate({ byteLength }) {
        const storage = new Uint8Array(byteLength);
        allocations.add(storage);
        nativeReservedBytes += byteLength;
        return storage;
      },
      async free({ native, byteLength }) {
        if (!allocations.delete(native)) throw Object.assign(new Error('Mock allocation is not live.'), { code: 'MOCK_MEMORY_STALE' });
        nativeReservedBytes -= byteLength;
        disposalOrder.push('device-memory');
        return { mockStorageReleased: true };
      },
      async write({ native, deviceOffset, bytes }) {
        native.set(bytes, deviceOffset);
      },
      async read({ native, deviceOffset, byteLength }) {
        return Uint8Array.from(native.subarray(deviceOffset, deviceOffset + byteLength));
      },
    },
  });

  async function description(operationSequence = 0) {
    return {
      schemaVersion: 1,
      runtime: { id: runtimeId, epoch, state: 'open', backend: 'mock' },
      profile: { node: process.version, platform: process.platform, architecture: process.arch, nativeQualified: false },
      driver: { apiVersion: 13030, deviceCount: 1 },
      device: {
        ordinal: 0,
        attributes: { maxThreadsPerBlock: 1024, multiprocessorCount: 1, computeCapabilityMajor: 0, computeCapabilityMinor: 0 },
      },
      context: contextToken,
      memory: await memory.usage(operationSequence),
      health: health.snapshot(),
      inventory: registry.inventory(),
      operationSequence,
      claim: 'platform-neutral-lifecycle-mock-only',
    };
  }

  return {
    inventory() { return registry.inventory(); },
    async describe({ operationId }) {
      return description(operationId);
    },
    async contextStatus({ token, operationId }) {
      registry.get(token, { kind: 'context' });
      return {
        schemaVersion: 1,
        context: token,
        currentOnOwner: true,
        health: health.snapshot(),
        inventory: registry.inventory(),
        operationSequence: operationId,
      };
    },
    async close({ operationId }) {
      const teardown = await registry.closeAll();
      const clean = teardown.errors.length === 0
        && teardown.inventory.counts.live === 0
        && teardown.inventory.counts.closing === 0
        && teardown.inventory.counts.orphaned === 0
        && disposalOrder.slice(-2).join(',') === 'context,library';
      if (clean) health.transition('closed', { reason: 'graceful-close', operationId });
      else health.transition('suspect', { reason: 'unproved-close', operationId });
      return {
        schemaVersion: 1,
        graceful: clean,
        cleanupClaim: clean ? 'proved-mock-lifecycle-only' : 'unproved',
        health: health.snapshot(),
        teardown,
        disposalOrder,
        operationSequence: operationId,
      };
    },
    memory,
    async testingBlock({ milliseconds, operationId }) {
      const storage = new Int32Array(new SharedArrayBuffer(4));
      Atomics.wait(storage, 0, 0, milliseconds);
      return { schemaVersion: 1, blockedMilliseconds: milliseconds, operationSequence: operationId, health: health.snapshot(), inventory: registry.inventory() };
    },
    async testingInjectHealth({ category, originOperationId, operationId }) {
      const before = health.current;
      const target = healthForErrorCategory(category);
      if (target) health.transition(target, { reason: category, operationId });
      throw new DriverRuntimeError(
        category === 'deferred-driver' ? 'CUDA_DEFERRED_FAILURE' : 'CUDA_IMMEDIATE_FAILURE',
        category,
        `Injected ${category} failure.`,
        { originOperationId, observedOperationId: operationId, nativeStatus: 999 },
        { operationId, healthBefore: before, healthAfter: health.current },
      );
    },
  };
}
