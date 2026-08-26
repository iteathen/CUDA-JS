import { ResourceRegistry } from '../../../resource-registry/index.mjs';
import { MemoryManager } from '../../../memory/index.mjs';
import { ExecutionManager } from '../../../execution/index.mjs';
import { HostMemoryTransferManager } from '../../../host-memory-transfer/index.mjs';
import { PublicationMailboxManager } from '../../../publication-mailbox/index.mjs';
import { DriverRuntimeError } from '../errors.mjs';
import { HealthState, healthForErrorCategory, observeErrorHealth } from '../health.mjs';

const MAX_DISPOSAL_ORDER_RECORDS = 32;

export async function createBackend({ runtimeId, epoch, memoryPolicy, executionPolicy, selectedDevice }) {
  const selected = selectedDevice ?? Object.freeze({
    nativeDevice: 0,
    architecture: Object.freeze({ major: 7, minor: 5, class: 'cc-7.5' }),
  });
  const health = new HealthState();
  const registry = new ResourceRegistry({ runtimeId, epoch });
  const disposalOrder = [];
  let disposalOrderCount = 0;
  function recordDisposal(kind) {
    disposalOrderCount += 1;
    disposalOrder.push(kind);
    if (disposalOrder.length > MAX_DISPOSAL_ORDER_RECORDS) disposalOrder.shift();
  }
  const libraryToken = registry.allocate({
    kind: 'library', value: Object.freeze({ privateMockLibrary: true }),
    dispose() { recordDisposal('library'); return { libraryClosed: true, staleWrapperRejected: true }; },
  });
  const contextToken = registry.allocate({
    kind: 'context', value: Object.freeze({ privateMockContext: true, nativeDevice: selected.nativeDevice }), parent: libraryToken,
    dispose() { recordDisposal('context'); return { contextDestroyed: true, currentNull: true }; },
  });
  const allocations = new Set();
  const addresses = new WeakMap();
  let nextAddress = 0x1000n;
  let nativeReservedBytes = 0;
  let disposalFailureMode = 'none';
  let disposalCallCount = 0;
  const memory = new MemoryManager({
    registry, contextToken, policy: memoryPolicy,
    operations: {
      async query() { return { freeBytes: memoryPolicy.maxDeviceBytes - nativeReservedBytes, totalBytes: memoryPolicy.maxDeviceBytes }; },
      async allocate({ byteLength }) {
        const storage = new Uint8Array(byteLength); allocations.add(storage); addresses.set(storage, nextAddress); nextAddress += BigInt(byteLength + 256); nativeReservedBytes += byteLength; return storage;
      },
      async free({ native, byteLength, operationId }) {
        disposalCallCount += 1;
        if (disposalFailureMode === 'unstructured') {
          const error = new Error('Injected unstructured mock disposal failure.');
          error.details = { disposalCallCount };
          throw error;
        }
        if (disposalFailureMode !== 'none') {
          const healthAfter = disposalFailureMode === 'immediate' ? 'suspect' : disposalFailureMode;
          const category = healthAfter === 'restart-required' ? 'restart-required' : 'immediate-driver';
          throw new DriverRuntimeError(
            'CUDA_MOCK_DISPOSAL_FAILURE',
            category,
            'Injected mock device-memory disposal failure.',
            { nativeStatus: 999, disposalCallCount },
            { operation: 'mock.memory.free', operationId, healthBefore: health.current, healthAfter },
          );
        }
        if (!allocations.delete(native)) throw Object.assign(new Error('Mock allocation is not live.'), { code: 'MOCK_MEMORY_STALE' });
        nativeReservedBytes -= byteLength; recordDisposal('device-memory'); return { mockStorageReleased: true };
      },
      async write({ native, deviceOffset, bytes }) { native.set(bytes, deviceOffset); },
      async read({ native, deviceOffset, byteLength }) { return Uint8Array.from(native.subarray(deviceOffset, deviceOffset + byteLength)); },
    },
  });
  const deviceLimits = Object.freeze({
    maxThreadsPerBlock: 1024, maxBlockDimX: 1024, maxBlockDimY: 1024, maxBlockDimZ: 64,
    maxGridDimX: 2_147_483_647, maxGridDimY: 65_535, maxGridDimZ: 65_535, maxSharedMemoryPerBlock: 49_152,
  });
  const registeredMailboxes = new Set();
  const mailboxAddresses = new WeakMap();
  let nextMailboxAddress = 0x8000_0000n;
  const mailboxes = new PublicationMailboxManager({
    registry,
    contextToken,
    operations: {
      async register({ view }) { registeredMailboxes.add(view); mailboxAddresses.set(view, nextMailboxAddress); nextMailboxAddress += 0x1000n; return view; },
      async map({ view }) { return mailboxAddresses.get(view); },
      async unregister({ view }) { if (!registeredMailboxes.delete(view)) throw Object.assign(new Error('Mock mailbox is not registered.'), { code: 'MEMORY_MAILBOX_STALE' }); recordDisposal('publication-mailbox'); return { mockUnregistered: true }; },
    },
  });
  let executionMode = 'complete';
  let nextNative = 1;
  const execution = new ExecutionManager({
    registry, contextToken, memory, mailboxes, policy: executionPolicy, deviceLimits,
    operations: {
      async createStream() { return Object.freeze({ kind: 'stream', id: nextNative++ }); },
      async destroyStream() { recordDisposal('stream'); return { mockStreamReleased: true }; },
      async loadModule({ bytes }) { return Object.freeze({ kind: 'module', id: nextNative++, byteLength: bytes.byteLength }); },
      async unloadModule() { recordDisposal('module'); return { mockModuleReleased: true }; },
      async getFunction({ moduleNative, name }) { return Object.freeze({ kind: 'function', id: nextNative++, moduleId: moduleNative.id, name }); },
      async createEvent() { return { kind: 'event', id: nextNative++, polls: 0 }; },
      async destroyEvent() { recordDisposal('event'); return { mockEventReleased: true }; },
      async devicePointer({ native, byteOffset }) { return addresses.get(native) + BigInt(byteOffset); },
      async submitLaunch() {},
      async recordEvent() {},
      async queryEvent({ eventNative, operationId }) {
        eventNative.polls += 1;
        if (executionMode === 'timeout') return 'pending';
        if (executionMode === 'restart-required') {
          const before = health.current;
          health.transition('restart-required', { reason: 'mock-event-query-restart', operationId });
          throw new DriverRuntimeError('CUDA_EVENT_QUERY_RESTART_REQUIRED', 'restart-required', 'Injected event-query failure requires process restart.', { nativeStatus: 999 }, { operation: 'mock.event.query', operationId, healthBefore: before, healthAfter: health.current });
        }
        if (executionMode === 'deferred' && eventNative.polls > 1) {
          const before = health.current;
          health.transition('poisoned', { reason: 'mock-deferred-execution', operationId });
          throw new DriverRuntimeError('CUDA_DEFERRED_FAILURE', 'deferred-driver', 'Injected deferred launch failure.', { nativeStatus: 999 }, { operation: 'execution.event.query', operationId, healthBefore: before, healthAfter: health.current });
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
  const stagingAllocations = new Set();
  const transfer = new HostMemoryTransferManager({
    registry,
    contextToken,
    memory,
    execution,
    maxTransferBytes: memoryPolicy.maxTransferBytes,
    operations: {
      async allocateStaging({ byteLength }) { const storage = new Uint8Array(byteLength); stagingAllocations.add(storage); return storage; },
      async freeStaging({ native }) {
        if (!stagingAllocations.delete(native)) throw Object.assign(new Error('Mock staging block is not live.'), { code: 'MOCK_STAGING_STALE' });
        recordDisposal('pinned-staging');
        return { mockStorageReleased: true };
      },
      stagingView({ native }) { return native; },
      async copyHtoDAsync({ destinationNative, destinationOffset, stagingNative, byteLength }) { destinationNative.set(stagingNative.subarray(0, byteLength), destinationOffset); },
      async copyDtoHAsync({ stagingNative, sourceNative, sourceOffset, byteLength }) { stagingNative.set(sourceNative.subarray(sourceOffset, sourceOffset + byteLength), 0); },
      async copyDtoDAsync({ destinationNative, destinationOffset, sourceNative, sourceOffset, byteLength }) { destinationNative.set(sourceNative.subarray(sourceOffset, sourceOffset + byteLength), destinationOffset); },
    },
  });

  async function description(operationSequence = 0) {
    return {
      schemaVersion: 1,
      runtime: { id: runtimeId, epoch, state: 'open', backend: 'mock' },
      profile: { node: process.version, platform: process.platform, architecture: process.arch, nativeOperational: false, nativeQualified: false },
      driver: { apiVersion: 13030, deviceCount: 1 },
      device: { ordinal: selected.nativeDevice, attributes: { ...deviceLimits, multiprocessorCount: 1, kernelExecTimeout: 0, integrated: 0, computeMode: 0, tccDriver: 0, computeCapabilityMajor: selected.architecture.major, computeCapabilityMinor: selected.architecture.minor } },
      context: contextToken,
      memory: await memory.usage(operationSequence),
      transfer: transfer.summary(),
      mailbox: mailboxes.summary(),
      execution: execution.summary(),
      health: health.snapshot(),
      inventory: registry.inventory(),
      operationSequence,
      claim: 'platform-neutral-lifecycle-mock-only',
    };
  }

  function observeError(error, { operationId = null, operation = null } = {}) {
    observeErrorHealth(health, error, { operationId, reason: error?.operation ?? operation });
    return error;
  }

  function observeTeardown(teardown, operationId) {
    for (const error of teardown?.errors ?? []) observeError(error, { operationId, operation: 'runtime.close' });
  }

  function disposalStatus(operationId) {
    return {
      schemaVersion: 1,
      mode: disposalFailureMode,
      disposalCallCount,
      operationSequence: operationId,
      health: health.snapshot(),
      inventory: registry.inventory(),
    };
  }

  return {
    inventory() { return registry.inventory(); },
    health() { return health.snapshot(); },
    observeError,
    assertAccepting(operation, operationId) {
      const cleanupOrRead = new Set([
        'runtime.describe', 'runtime.close', 'context.status', 'memory.status', 'memory.release',
        'execution.module.status', 'execution.module.release', 'execution.function.status', 'execution.function.release',
        'execution.operation.status', 'execution.operation.release', 'mailbox.status', 'mailbox.release',
        'testing.disposal-status',
      ]);
      if (health.current === 'restart-required') throw new DriverRuntimeError('DRIVER_RESTART_REQUIRED', 'restart-required', 'Runtime health requires process restart.', { operation }, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
      if (health.current === 'poisoned' && !cleanupOrRead.has(operation)) throw new DriverRuntimeError('DRIVER_RUNTIME_POISONED', 'deferred-driver', 'Runtime health is poisoned; only inspection and cleanup operations remain available.', { operation }, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
    },
    async describe({ operationId }) { return description(operationId); },
    async contextStatus({ token, operationId }) {
      registry.get(token, { kind: 'context' });
      return { schemaVersion: 1, context: token, currentOnOwner: true, health: health.snapshot(), inventory: registry.inventory(), operationSequence: operationId };
    },
    async close({ operationId }) {
      const prepared = await execution.prepareClose(operationId);
      if (prepared.pendingOperation) {
        const before = health.current;
        health.transition('restart-required', { reason: 'execution-close-terminality-unproved', operationId });
        throw new DriverRuntimeError('EXECUTION_CLOSE_TERMINALITY_UNPROVED', 'restart-required', 'Runtime close cannot begin dependency teardown while GPU operation terminality is unproved.', {}, { operationId, healthBefore: before, healthAfter: health.current });
      }
      const teardown = await registry.closeAll();
      observeTeardown(teardown, operationId);
      const clean = teardown.errors.length === 0 && teardown.inventory.counts.live === 0 && teardown.inventory.counts.closing === 0 && teardown.inventory.counts.orphaned === 0 && disposalOrder.slice(-2).join(',') === 'context,library';
      if (clean) health.transition('closed', { reason: 'graceful-close', operationId });
      else if (health.current === 'healthy') health.transition('suspect', { reason: 'unproved-close', operationId });
      return {
        schemaVersion: 1,
        graceful: clean,
        cleanupClaim: clean ? 'proved-mock-lifecycle-only' : 'unproved',
        health: health.snapshot(),
        teardown,
        disposalOrder,
        disposalOrderCount,
        disposalOrderTruncated: disposalOrderCount - disposalOrder.length,
        operationSequence: operationId,
      };
    },
    memory,
    mailboxes,
    transfer,
    execution,
    async testingBlock({ milliseconds, operationId }) {
      const storage = new Int32Array(new SharedArrayBuffer(4)); Atomics.wait(storage, 0, 0, milliseconds);
      return { schemaVersion: 1, blockedMilliseconds: milliseconds, operationSequence: operationId, health: health.snapshot(), inventory: registry.inventory() };
    },
    async testingInjectHealth({ category, originOperationId, operationId }) {
      const before = health.current; const target = healthForErrorCategory(category); if (target) health.transition(target, { reason: category, operationId });
      throw new DriverRuntimeError(category === 'deferred-driver' ? 'CUDA_DEFERRED_FAILURE' : 'CUDA_IMMEDIATE_FAILURE', category, `Injected ${category} failure.`, { originOperationId, observedOperationId: operationId, nativeStatus: 999 }, { operationId, healthBefore: before, healthAfter: health.current });
    },
    async testingSetExecutionMode({ mode, operationId }) {
      executionMode = mode;
      return { schemaVersion: 1, mode, operationSequence: operationId, health: health.snapshot(), inventory: registry.inventory() };
    },
    async testingSetDisposalMode({ mode, operationId }) {
      disposalFailureMode = mode;
      return disposalStatus(operationId);
    },
    async testingDisposalStatus({ operationId }) {
      return disposalStatus(operationId);
    },
  };
}
