import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryManager } from '../../memory/index.mjs';
import { ResourceRegistry } from '../../resource-registry/index.mjs';
import {
  DEFAULT_EXECUTION_POLICY,
  ExecutionError,
  ExecutionManager,
  normalizeExecutionPolicy,
  packParameterValues,
  parameterLayout,
} from '../index.mjs';

const PTX = Uint8Array.from(Buffer.from('.version 8.0\n.target sm_75\n.address_size 64\n'));
const LIMITS = Object.freeze({
  maxThreadsPerBlock: 1024,
  maxBlockDimX: 1024,
  maxBlockDimY: 1024,
  maxBlockDimZ: 64,
  maxGridDimX: 2_147_483_647,
  maxGridDimY: 65_535,
  maxGridDimZ: 65_535,
  maxSharedMemoryPerBlock: 49_152,
});

function fixture({
  query = () => 'complete',
  policy = {},
  clock = () => Date.now(),
  sleep,
  streamRegistrationFailure = null,
  moduleRegistrationFailure = null,
  eventRegistrationFailure = null,
  eventCloseFailure = null,
  unloadModuleFailure = null,
  destroyStreamFailure = null,
  destroyEventFailure = null,
  submitLaunchFailure = null,
} = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'execution-test', epoch: 1, nonce: (() => {
    let value = 0;
    return () => (++value).toString(16).padStart(32, '0');
  })() });
  const order = [];
  const library = registry.allocate({ kind: 'library', value: {}, dispose() { order.push('library'); } });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose() { order.push('context'); } });
  if (streamRegistrationFailure !== null || moduleRegistrationFailure !== null || eventRegistrationFailure !== null) {
    const allocateResource = registry.allocate.bind(registry);
    registry.allocate = (request) => {
      if (request?.kind === 'stream' && streamRegistrationFailure !== null) throw streamRegistrationFailure;
      if (request?.kind === 'module' && moduleRegistrationFailure !== null) throw moduleRegistrationFailure;
      if (request?.kind === 'event' && eventRegistrationFailure !== null) throw eventRegistrationFailure;
      return allocateResource(request);
    };
  }
  if (eventCloseFailure !== null) {
    const closeResource = registry.close.bind(registry);
    registry.close = async (token) => {
      if (token?.kind === 'event') throw eventCloseFailure;
      return closeResource(token);
    };
  }
  const allocations = new Map();
  const memory = new MemoryManager({
    registry,
    contextToken: context,
    policy: { maxDeviceBytes: 128, maxAllocationBytes: 128, maxTransferBytes: 128 },
    operations: {
      async query() { return { freeBytes: 128, totalBytes: 128 }; },
      async allocate({ byteLength }) { const native = 0x1000n + BigInt(allocations.size * 0x100); allocations.set(native, new Uint8Array(byteLength)); return native; },
      async free({ native }) { assert.equal(allocations.delete(native), true); order.push('device-memory'); },
      async write({ native, deviceOffset, bytes }) { allocations.get(native).set(bytes, deviceOffset); },
      async read({ native, deviceOffset, byteLength }) { return Uint8Array.from(allocations.get(native).subarray(deviceOffset, deviceOffset + byteLength)); },
    },
  });
  let handle = 10n;
  const calls = { createEvent: 0, createStream: 0, destroyEvent: 0, destroyStream: 0, loadModule: 0, submitLaunch: 0, unloadModule: 0 };
  const operations = {
    async createStream() { calls.createStream += 1; return ++handle; },
    async destroyStream() { calls.destroyStream += 1; if (destroyStreamFailure !== null) throw destroyStreamFailure; order.push('stream'); },
    async loadModule() { calls.loadModule += 1; return ++handle; },
    async unloadModule() { calls.unloadModule += 1; if (unloadModuleFailure !== null) throw unloadModuleFailure; order.push('module'); },
    async getFunction() { return ++handle; },
    async createEvent() { calls.createEvent += 1; order.push('event-create'); return ++handle; },
    async destroyEvent() { calls.destroyEvent += 1; if (destroyEventFailure !== null) throw destroyEventFailure; order.push('event'); },
    async devicePointer({ native, byteOffset }) { return native + BigInt(byteOffset); },
    async submitLaunch(request) { calls.submitLaunch += 1; if (submitLaunchFailure !== null) throw submitLaunchFailure; operations.lastLaunch = request; },
    async recordEvent() { order.push('event-record'); },
    async queryEvent(request) { return query(request, registry); },
    health() { return { current: 'healthy', history: [] }; },
    restartRequired({ code, message, details, operationId }) {
      return new ExecutionError(code, 'restart-required', message, details, { operationId, healthBefore: 'healthy', healthAfter: 'restart-required' });
    },
  };
  const execution = new ExecutionManager({ registry, contextToken: context, memory, policy, deviceLimits: LIMITS, operations, clock, sleep });
  return { registry, memory, execution, operations, order, calls };
}

test('execution policy is exact and bounded', () => {
  assert.deepEqual(normalizeExecutionPolicy(), DEFAULT_EXECUTION_POLICY);
  assert.throws(() => normalizeExecutionPolicy({ extra: 1 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
  assert.throws(() => normalizeExecutionPolicy({ maxModuleBytes: 64 * 1_048_576 + 1 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
  assert.throws(() => normalizeExecutionPolicy({ maxArguments: 65 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
  assert.throws(() => normalizeExecutionPolicy({ maxCompletionMilliseconds: 300_001 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
});

test('parameter packing is naturally aligned, deterministic, and zero padded', () => {
  const parameters = [{ kind: 'device-memory' }, { kind: 'u32' }, { kind: 'device-memory' }];
  const layout = parameterLayout(parameters);
  assert.deepEqual(layout.entries.map(({ offset, byteLength }) => ({ offset, byteLength })), [
    { offset: 0, byteLength: 8 },
    { offset: 8, byteLength: 4 },
    { offset: 16, byteLength: 8 },
  ]);
  assert.equal(layout.byteLength, 24);
  const packed = packParameterValues(parameters, [0x1122n, 0xaabbccdd, 0x3344n]);
  assert.equal(packed.buffer.readBigUInt64LE(0), 0x1122n);
  assert.equal(packed.buffer.readUInt32LE(8), 0xaabbccdd);
  assert.deepEqual([...packed.buffer.subarray(12, 16)], [0, 0, 0, 0]);
  assert.equal(packed.buffer.readBigUInt64LE(16), 0x3344n);
});

test('module, function, repeated memory leases, polling, and teardown preserve dependency order', async () => {
  let polls = 0;
  const { registry, memory, execution, operations, order } = fixture({
    query(_request, liveRegistry) {
      polls += 1;
      if (polls === 1) {
        const resources = liveRegistry.inventory().resources;
        assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
        assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 2);
        return 'pending';
      }
      return 'complete';
    },
  });
  await execution.initialize();
  const submitted = Uint8Array.from(PTX);
  const module = await execution.loadModule({ format: 'ptx', bytes: submitted, operationId: 1 });
  submitted.fill(0);
  assert.match(module.sha256, /^[a-f0-9]{64}$/);
  const fn = await execution.getFunction(module.module, { name: 'vector_add', parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }], operationId: 2 });
  await assert.rejects(execution.releaseModule(module.module), (error) => error.code === 'RESOURCE_HAS_CHILDREN');
  const allocation = await memory.allocate({ byteLength: 64 });
  const completion = await execution.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 32, y: 1, z: 1 },
    arguments: [
      { kind: 'device-memory', memory: allocation.memory },
      { kind: 'device-memory', memory: allocation.memory, byteOffset: 4 },
      { kind: 'u32', value: 16 },
    ],
    operationId: 3,
  });
  assert.equal(completion.status, 'completed');
  assert.equal(completion.pollCount, 2);
  assert.equal(operations.lastLaunch.parameterBuffer.readBigUInt64LE(0), 0x1000n);
  assert.equal(operations.lastLaunch.parameterBuffer.readBigUInt64LE(8), 0x1004n);
  assert.equal(operations.lastLaunch.parameterBuffer.readUInt32LE(16), 16);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  await execution.releaseFunction(fn.function);
  await execution.releaseModule(module.module);
  await registry.closeAll();
  assert.deepEqual(order.slice(-5), ['module', 'device-memory', 'stream', 'context', 'library']);
});

test('module, schema, launch bounds, argument kinds, and memory offsets fail before unsafe backend work', async () => {
  const { memory, execution, operations } = fixture();
  await execution.initialize();
  await assert.rejects(execution.loadModule({ format: 'fatbin', bytes: PTX }), (error) => error.code === 'EXECUTION_MODULE_FORMAT');
  const cubin = await execution.loadModule({ format: 'cubin', bytes: Uint8Array.of(0, 1, 255) });
  assert.equal(cubin.format, 'cubin');
  await execution.releaseModule(cubin.module);
  await assert.rejects(execution.loadModule({ format: 'ptx', bytes: Uint8Array.of(65, 0, 66) }), (error) => error.code === 'EXECUTION_MODULE_TEXT');
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX });
  await assert.rejects(execution.getFunction(module.module, { name: '../bad', parameters: [{ kind: 'u32' }] }), (error) => error.code === 'EXECUTION_FUNCTION_NAME');
  await assert.rejects(execution.getFunction(module.module, { name: 'bad', parameters: [{ kind: 'i64' }] }), (error) => error.code === 'EXECUTION_PARAMETER_INVALID');
  const fn = await execution.getFunction(module.module, { name: 'bounded', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const allocation = await memory.allocate({ byteLength: 8 });
  const valid = { grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: allocation.memory }, { kind: 'u32', value: 1 }] };
  await assert.rejects(execution.launch(fn.function, { ...valid, block: { x: 1024, y: 2, z: 1 } }), (error) => error.code === 'EXECUTION_BLOCK_VOLUME');
  await assert.rejects(execution.launch(fn.function, { ...valid, arguments: [{ kind: 'device-memory', memory: allocation.memory, byteOffset: 8 }, { kind: 'u32', value: 1 }] }), (error) => error.code === 'MEMORY_RANGE_OUT_OF_BOUNDS');
  await assert.rejects(execution.launch(fn.function, { ...valid, arguments: [{ kind: 'device-memory', memory: allocation.memory }, { kind: 'u32', value: 0x1_0000_0000 }] }), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  assert.equal(operations.lastLaunch, undefined);
});

test('completion timeout retains event, function, and memory leases for owner-loss accounting', async () => {
  let now = 0;
  const { registry, memory, execution } = fixture({
    policy: { maxCompletionMilliseconds: 2 },
    query: () => 'pending',
    clock: () => now,
    sleep: async (milliseconds) => { now += milliseconds; },
  });
  await execution.initialize();
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await execution.getFunction(module.module, { name: 'timeout', parameters: [{ kind: 'device-memory' }] });
  const allocation = await memory.allocate({ byteLength: 8 });
  await assert.rejects(execution.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [{ kind: 'device-memory', memory: allocation.memory }],
  }), (error) => error.code === 'EXECUTION_COMPLETION_TIMEOUT' && error.category === 'restart-required');
  const resources = registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 1);
  assert.equal(execution.summary().inFlight, true);
});

test('stream registration rollback retains primary and direct-destroy cleanup failure', async () => {
  const registrationFailure = new ExecutionError(
    'RESOURCE_NONCE_INVALID',
    'stale-resource',
    'stream registration rejected',
    { resourceKind: 'stream' },
    { operation: 'resource.allocate', operationId: 41, healthBefore: 'healthy', healthAfter: 'healthy' },
  );
  const cleanupFailure = new ExecutionError(
    'CUDA_STREAM_DESTROY_FAILED',
    'immediate-driver',
    'stream destroy failed',
    { nativeStatus: 400, nativeHandle: '0xdecafbad' },
    { operation: 'cuStreamDestroy_v2', operationId: 41, healthBefore: 'healthy', healthAfter: 'suspect' },
  );
  const { execution, calls } = fixture({ streamRegistrationFailure: registrationFailure, destroyStreamFailure: cleanupFailure });

  let firstFailure;
  await assert.rejects(execution.initialize(41), (error) => {
    firstFailure = error;
    assert.equal(error.code, 'EXECUTION_STREAM_ROLLBACK_FAILED');
    assert.equal(error.category, 'immediate-driver');
    assert.equal(error.operation, 'execution.initialize');
    assert.equal(error.healthAfter, 'suspect');
    assert.equal(error.details.primaryFailure.code, 'RESOURCE_NONCE_INVALID');
    assert.equal(error.details.cleanupFailures[0].code, 'CUDA_STREAM_DESTROY_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuStreamDestroy_v2');
    assert.deepEqual(error.details.inventory.unproved, [{ kind: 'stream', registered: false, disposition: 'unproved' }]);
    assert.doesNotMatch(JSON.stringify(error.details), /decafbad|nativeHandle/i);
    return true;
  });
  assert.equal(execution.summary().rollbackFailure.code, 'EXECUTION_STREAM_ROLLBACK_FAILED');
  assert.equal(execution.summary().unprovedRollbackCount, 1);
  await assert.rejects(execution.initialize(42), (error) => error === firstFailure);
  await assert.rejects(execution.prepareClose(43), (error) => error === firstFailure);
  assert.equal(calls.createStream, 1);
  assert.equal(calls.destroyStream, 1);
  assert.equal(execution.summary().privateStream, false);
});

test('module registration rollback retains primary and cleanup provenance without leaking native capability details', async () => {
  const registrationFailure = new ExecutionError(
    'RESOURCE_NONCE_INVALID',
    'stale-resource',
    'module registration rejected',
    { resourceKind: 'module', providerPath: 'C:\\private\\provider.dll' },
    { operation: 'resource.allocate', operationId: 51, healthBefore: 'healthy', healthAfter: 'healthy' },
  );
  const cleanupFailure = new ExecutionError(
    'CUDA_MODULE_UNLOAD_FAILED',
    'deferred-driver',
    'module unload failed',
    {
      nativeStatus: 719,
      nativeName: 'CUDA_ERROR_LAUNCH_FAILED',
      nativeHandle: '0xfeedface',
      nativeDescription: 'x'.repeat(512),
      causeNativeDescription: 'host buildbox account alice user bob email mailroom machine runner-01 contact bob@example.test',
      causeNativeMessage: 'nonce nonceSecret123 token tokenSecret123 runtimeId runtimeSecret123',
      causeReason: 'handle 123456 pointer barePointer9 address bareAddress9',
      reason: '0123456789abcdef0123456789abcdef',
    },
    { operation: 'cuModuleUnload', operationId: 51, healthBefore: 'suspect', healthAfter: 'poisoned' },
  );
  const { execution, calls } = fixture({ moduleRegistrationFailure: registrationFailure, unloadModuleFailure: cleanupFailure });

  let firstFailure;
  await assert.rejects(execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 51 }), (error) => {
    firstFailure = error;
    assert(error instanceof ExecutionError);
    assert.equal(error.code, 'EXECUTION_MODULE_ROLLBACK_FAILED');
    assert.equal(error.category, 'deferred-driver');
    assert.equal(error.operation, 'execution.module.load');
    assert.equal(error.operationId, 51);
    assert.equal(error.healthBefore, 'healthy');
    assert.equal(error.healthAfter, 'poisoned');
    assert.equal(error.details.primaryFailure.code, 'RESOURCE_NONCE_INVALID');
    assert.equal(error.details.primaryFailure.operation, 'resource.allocate');
    assert.equal(error.details.cleanupFailures.length, 1);
    assert.equal(error.details.cleanupFailures[0].code, 'CUDA_MODULE_UNLOAD_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuModuleUnload');
    assert.equal(error.details.cleanupFailures[0].details.nativeStatus, 719);
    assert.equal(error.details.cleanupFailures[0].details.nativeDescription.length, 160);
    const cleanupDetails = error.details.cleanupFailures[0].details;
    assert.match(cleanupDetails.causeNativeDescription, /\[redacted-identity\]/);
    assert.match(cleanupDetails.causeNativeMessage, /\[redacted-capability\]/);
    assert.match(cleanupDetails.causeReason, /\[redacted-handle\]/);
    assert.equal(cleanupDetails.reason, '[redacted-capability]');
    assert.equal(error.details.resultingHealth, 'poisoned');
    assert.deepEqual(error.details.inventory.unproved, [{ kind: 'module', registered: false, disposition: 'unproved' }]);
    assert.doesNotMatch(JSON.stringify(error.details), /feedface|private|providerPath|nativeHandle|buildbox|alice|user bob|mailroom|runner-01|bob@example\.test|nonceSecret123|tokenSecret123|runtimeSecret123|123456|barePointer9|bareAddress9|0123456789abcdef0123456789abcdef/i);
    return true;
  });
  await assert.rejects(execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 52 }), (error) => error === firstFailure);
  await assert.rejects(execution.prepareClose(53), (error) => error === firstFailure);
  assert.equal(calls.loadModule, 1);
  assert.equal(calls.unloadModule, 1);
  assert.equal(execution.summary().moduleCount, 0);
});

test('submit rollback cleans an unregistered event and retains both failures when direct cleanup fails', async () => {
  const registrationFailure = new ExecutionError(
    'RESOURCE_NONCE_INVALID',
    'stale-resource',
    'event registration rejected',
    { resourceKind: 'event' },
    { operation: 'resource.allocate', operationId: 61, healthBefore: 'healthy', healthAfter: 'healthy' },
  );
  const cleanupFailure = new ExecutionError(
    'CUDA_EVENT_DESTROY_FAILED',
    'immediate-driver',
    'event destroy failed',
    { nativeStatus: 400 },
    { operation: 'cuEventDestroy', operationId: 61, healthBefore: 'healthy', healthAfter: 'suspect' },
  );
  const { execution, calls } = fixture({ eventRegistrationFailure: registrationFailure, destroyEventFailure: cleanupFailure });
  await execution.initialize(60);
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 60 });
  const fn = await execution.getFunction(module.module, { name: 'event_registration', parameters: [{ kind: 'u32' }], operationId: 60 });

  let firstFailure;
  await assert.rejects(execution.submit(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'u32', value: 1 }], operationId: 61,
  }), (error) => {
    firstFailure = error;
    assert.equal(error.code, 'EXECUTION_SUBMIT_ROLLBACK_FAILED');
    assert.equal(error.category, 'immediate-driver');
    assert.equal(error.healthAfter, 'suspect');
    assert.equal(error.details.primaryFailure.code, 'RESOURCE_NONCE_INVALID');
    assert.equal(error.details.cleanupFailures[0].code, 'CUDA_EVENT_DESTROY_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuEventDestroy');
    assert.deepEqual(error.details.inventory.unproved, [{ kind: 'event', registered: false, disposition: 'unproved' }]);
    return true;
  });
  await assert.rejects(execution.submit(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'u32', value: 2 }], operationId: 62,
  }), (error) => error === firstFailure);
  await assert.rejects(execution.prepareClose(63), (error) => error === firstFailure);
  assert.equal(calls.createEvent, 1);
  assert.equal(calls.destroyEvent, 1);
  assert.equal(calls.submitLaunch, 0);
});

test('submit rollback retains a stronger registered-event cleanup failure and releases execution leases', async () => {
  const submitFailure = new ExecutionError(
    'CUDA_LAUNCH_REJECTED',
    'immediate-driver',
    'launch rejected',
    { nativeStatus: 1 },
    { operation: 'cuLaunchKernelEx', operationId: 71, healthBefore: 'healthy', healthAfter: 'suspect' },
  );
  const cleanupFailure = new ExecutionError(
    'RESOURCE_DISPOSE_FAILED',
    'deferred-driver',
    'event cleanup poisoned the context',
    {
      resourceKind: 'event',
      causeCode: 'CUDA_EVENT_DESTROY_FAILED',
      causeNativeStatus: 719,
      causeNativeName: 'CUDA_ERROR_LAUNCH_FAILED',
      causeNativeDescription: 'event destroy observed a deferred failure',
      causeDisposalCallCount: 1,
      nativeHandle: '0xdecafbad',
    },
    { operation: 'cuEventDestroy', operationId: 71, healthBefore: 'suspect', healthAfter: 'poisoned' },
  );
  const { execution, registry, calls } = fixture({ submitLaunchFailure: submitFailure, eventCloseFailure: cleanupFailure });
  await execution.initialize(70);
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 70 });
  const fn = await execution.getFunction(module.module, { name: 'submit_rollback', parameters: [{ kind: 'u32' }], operationId: 70 });

  await assert.rejects(execution.submit(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'u32', value: 1 }], operationId: 71,
  }), (error) => {
    assert.equal(error.code, 'EXECUTION_SUBMIT_ROLLBACK_FAILED');
    assert.equal(error.category, 'deferred-driver');
    assert.equal(error.healthAfter, 'poisoned');
    assert.equal(error.details.primaryFailure.code, 'CUDA_LAUNCH_REJECTED');
    assert.equal(error.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuEventDestroy');
    assert.equal(error.details.cleanupFailures[0].details.causeNativeStatus, 719);
    assert.equal(error.details.cleanupFailures[0].details.causeNativeName, 'CUDA_ERROR_LAUNCH_FAILED');
    assert.equal(error.details.cleanupFailures[0].details.causeDisposalCallCount, 1);
    assert.equal(error.details.resultingHealth, 'poisoned');
    assert.deepEqual(error.details.inventory.unproved, [{ kind: 'event', registered: true, disposition: 'unproved' }]);
    assert.doesNotMatch(JSON.stringify(error.details), /decafbad|nativeHandle/i);
    return true;
  });
  assert.equal(calls.submitLaunch, 1);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
});

test('internal adapter operations release rejected leases and retain adapter-specific rollback truth', async () => {
  const first = fixture();
  let firstReleased = 0;
  const pending = await first.execution.submitAdapterOperation({
    kind: 'test-adapter', accesses: [], leases: [{ release() { firstReleased += 1; } }],
    enqueue() {}, operationId: 1,
  });
  let rejectedReleased = 0;
  await assert.rejects(first.execution.submitAdapterOperation({
    kind: 'test-adapter', accesses: [], leases: [{ release() { rejectedReleased += 1; } }],
    enqueue() {}, operationId: 2,
  }), (error) => error.code === 'EXECUTION_BUSY');
  assert.equal(rejectedReleased, 1);
  assert.equal(firstReleased, 0);
  assert.equal((await first.execution.operationStatus(pending.operation, 3)).status, 'completed');
  assert.equal(firstReleased, 1);

  const cleanupFailure = new ExecutionError(
    'RESOURCE_DISPOSE_FAILED', 'deferred-driver', 'adapter event cleanup failed', { resourceKind: 'event' },
    { operation: 'cuEventDestroy', operationId: 11, healthBefore: 'healthy', healthAfter: 'poisoned' },
  );
  const second = fixture({ eventCloseFailure: cleanupFailure });
  let rollbackReleased = 0;
  await assert.rejects(second.execution.submitAdapterOperation({
    kind: 'test-adapter', accesses: [], leases: [{ release() { rollbackReleased += 1; } }],
    enqueue() { throw new ExecutionError('TEST_ADAPTER_SUBMIT_FAILED', 'immediate-driver', 'adapter rejected'); }, operationId: 11,
  }), (error) => {
    assert.equal(error.code, 'EXECUTION_ADAPTER_ROLLBACK_FAILED');
    assert.equal(error.details.primaryFailure.code, 'TEST_ADAPTER_SUBMIT_FAILED');
    assert.equal(error.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
    return true;
  });
  assert.equal(rollbackReleased, 1);
});

test('module release reaches the registry stored failure on repeated close without a descriptor preflight', async () => {
  const unloadFailure = new ExecutionError(
    'CUDA_MODULE_UNLOAD_FAILED',
    'deferred-driver',
    'module cleanup failed',
    { nativeStatus: 719 },
    { operation: 'cuModuleUnload', healthBefore: 'healthy', healthAfter: 'poisoned' },
  );
  let closes = 0;
  const { execution, registry, calls } = fixture({ unloadModuleFailure: unloadFailure });
  const closeResource = registry.close.bind(registry);
  let firstFailure = null;
  registry.close = async (token) => {
    if (token?.kind === 'module') {
      closes += 1;
      try { return await closeResource(token); }
      catch (error) {
        firstFailure ??= error;
        throw error;
      }
    }
    return closeResource(token);
  };
  await execution.initialize();
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX });
  await assert.rejects(execution.releaseModule(module.module), (error) => error === firstFailure);
  await assert.rejects(execution.releaseModule(module.module), (error) => error === firstFailure);
  assert.equal(closes, 2);
  assert.equal(calls.unloadModule, 1);
  assert.equal(execution.summary().moduleCount, 1);
});
