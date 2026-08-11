import { ResourceRegistry } from '../../../resource-registry/index.mjs';
import { MemoryManager } from '../../../memory/index.mjs';
import { ExecutionManager } from '../../../execution/index.mjs';
import { DriverRuntimeError } from '../errors.mjs';
import { HealthState, healthForErrorCategory } from '../health.mjs';

export async function createBackend({ runtimeId, epoch, memoryPolicy, executionPolicy }) {
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
  const addresses = new WeakMap();
  let nextAddress = 0x1000n;
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
        addresses.set(storage, nextAddress);
        nextAddress += BigInt(byteLength + 256);
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
  const deviceLimits = Object.freeze({
    maxThreadsPerBlock: 1024,
    maxBlockDimX: 1024,
    maxBlockDimY: 1024,
    maxBlockDimZ: 64,
    maxGridDimX: 2_147_483_647,
    maxGridDimY: 65_535,
    maxGridDimZ: 65_535,
    maxSharedMemoryPerBlock: 49_152,
  });
  let executionMode = 'complete';
  let nextNative = 1;
  const execution = new ExecutionManager({
    registry,
    contextToken,
    memory,
    policy: executionPolicy,
    deviceLimits,
    operations: {
      async createStream() { return Object.freeze({ kind: 'stream', id: nextNative++ }); },
      async destroyStream() { disposalOrder.push('stream'); return { mockStreamReleased: true }; },
      async loadModule({ bytes }) { return Object.freeze({ kind: 'module', id: nextNative++, byteLength: bytes.byteLength }); },
      async unloadModule() { disposalOrder.push('module'); return { mockModuleReleased: true }; },
      async getFunction({ moduleNative, name }) { return Object.freeze({ kind: 'function', id: nextNative++, moduleId: moduleNative.id, name }); },
      async createEvent() { return { kind: 'event', id: nextNative++, polls: 0 }; },
      async destroyEvent() { disposalOrder.push('event'); return { mockEventReleased: true }; },
      async devicePointer({ native, byteOffset }) { return addresses.get(native) + BigInt(byteOffset); },
      async submitLaunch() {},
      async recordEvent() {},
      async queryEvent({ eventNative, operationId }) {
        eventNative.polls += 1;
        if (executionMode === 'timeout') return 'pending';
        if (executionMode === 'deferred' && eventNative.polls > 1) {
          const before = health.current;
          health.transition('poisoned', { reason: 'mock-deferred-execution', operationId });
          throw new DriverRuntimeError('CUDA_DEFERRED_FAILURE', 'deferred-driver', 'Injected deferred launch failure.', { nativeStatus: 999 }, { operationId, healthBefore: before, healthAfter: health.current });
        }
        return eventNative.polls === 1 ? 'pending' : 'complete';
      },
      health() { return health.snapshot(); },
      restartRequired({ code, message, details, operationId }) {
        const before = health.current;
        health.transition('restart-required', { reason: code, operationId });
        return new DriverRuntimeError(code, 'restart-required', message, details, { operationId, healthBefore: before, healthAfter: health.current });
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
        attributes: {
          ...deviceLimits,
          multiprocessorCount: 1,
          kernelExecTimeout: 0,
          integrated: 0,
          computeMode: 0,
          tccDriver: 0,
          computeCapabilityMajor: 0,
          computeCapabilityMinor: 0,
        },
      },
      context: contextToken,
      memory: await memory.usage(operationSequence),
      execution: execution.summary(),
      health: health.snapshot(),
      inventory: registry.inventory(),
      operationSequence,
      claim: 'platform-neutral-lifecycle-mock-only',
    };
  }

  return {
    inventory() { return registry.inventory(); },
    assertAccepting(operation, operationId) {
      const cleanupOrRead = new Set(['runtime.describe', 'runtime.close', 'context.status', 'memory.status', 'memory.release', 'execution.module.status', 'execution.module.release', 'execution.function.status', 'execution.function.release']);
      if (health.current === 'poisoned' && !cleanupOrRead.has(operation)) {
        throw new DriverRuntimeError('DRIVER_RUNTIME_POISONED', 'deferred-driver', 'Runtime health is poisoned; only inspection and cleanup operations remain available.', { operation }, { operationId, healthBefore: health.current, healthAfter: health.current });
      }
    },
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
    execution,
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
    async testingSetExecutionMode({ mode, operationId }) {
      executionMode = mode;
      return { schemaVersion: 1, mode, operationSequence: operationId, health: health.snapshot(), inventory: registry.inventory() };
    },
  };
}
