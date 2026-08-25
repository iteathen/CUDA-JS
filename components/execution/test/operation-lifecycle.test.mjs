import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryManager } from '../../memory/index.mjs';
import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { ExecutionError, ExecutionManager } from '../index.mjs';

const PTX = Uint8Array.from(Buffer.from('.version 8.0\n.target sm_75\n.address_size 64\n'));
const LIMITS = Object.freeze({
  maxThreadsPerBlock: 1024, maxBlockDimX: 1024, maxBlockDimY: 1024, maxBlockDimZ: 64,
  maxGridDimX: 2_147_483_647, maxGridDimY: 65_535, maxGridDimZ: 65_535, maxSharedMemoryPerBlock: 49_152,
});

function fixture({ query = () => 'pending', policy = {}, clock = () => Date.now(), sleep = async () => {}, eventCloseFailure = null } = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'operation-test', epoch: 1, nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })() });
  const library = registry.allocate({ kind: 'library', value: {}, dispose() {} });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose() {} });
  if (eventCloseFailure !== null) {
    const closeResource = registry.close.bind(registry);
    registry.close = async (token) => {
      if (token?.kind === 'event') throw eventCloseFailure;
      return closeResource(token);
    };
  }
  const allocations = new Map();
  const memory = new MemoryManager({
    registry, contextToken: context,
    policy: { maxDeviceBytes: 256, maxAllocationBytes: 256, maxTransferBytes: 256 },
    operations: {
      async query() { return { freeBytes: 256, totalBytes: 256 }; },
      async allocate({ byteLength }) { const native = 0x1000n + BigInt(allocations.size * 0x100); allocations.set(native, new Uint8Array(byteLength)); return native; },
      async free({ native }) { allocations.delete(native); },
      async write({ native, deviceOffset, bytes }) { allocations.get(native).set(bytes, deviceOffset); },
      async read({ native, deviceOffset, byteLength }) { return Uint8Array.from(allocations.get(native).subarray(deviceOffset, deviceOffset + byteLength)); },
    },
  });
  let handle = 10n;
  const submissions = [];
  const operations = {
    async createStream() { return ++handle; }, async destroyStream() {}, async loadModule() { return ++handle; }, async unloadModule() {}, async getFunction() { return ++handle; },
    async createEvent() { return ++handle; }, async destroyEvent() {}, async devicePointer({ native, byteOffset }) { return native + BigInt(byteOffset); }, async submitLaunch(request) { submissions.push(request); }, async recordEvent() {},
    async queryEvent(request) { return query(request); },
    health() { return { current: 'healthy', history: [] }; },
    restartRequired({ code, message, details, operationId }) { return new ExecutionError(code, 'restart-required', message, details, { operationId, healthBefore: 'healthy', healthAfter: 'restart-required' }); },
  };
  const execution = new ExecutionManager({ registry, contextToken: context, memory, policy, deviceLimits: LIMITS, operations, clock, sleep });
  return { registry, memory, execution, submissions };
}

async function prepared(value = {}) {
  const fx = fixture(value);
  await fx.execution.initialize();
  const module = await fx.execution.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await fx.execution.getFunction(module.module, { name: 'k', parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }] });
  const allocation = await fx.memory.allocate({ byteLength: 32 });
  return { ...fx, module, fn, allocation };
}

function launchRequest(allocation) {
  return { grid: { x: 1, y: 1, z: 1 }, block: { x: 32, y: 1, z: 1 }, arguments: [
    { kind: 'device-memory', memory: allocation.memory }, { kind: 'device-memory', memory: allocation.memory, byteOffset: 4 }, { kind: 'u32', value: 8 },
  ] };
}

test('submit creates one pending logical operation and retains exact execution leases', async () => {
  const { registry, execution, fn, allocation } = await prepared();
  const operation = await execution.submit(fn.function, { ...launchRequest(allocation), operationId: 7 });
  assert.equal(operation.status, 'pending');
  assert.equal(execution.summary().pendingOperation, true);
  const resources = registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 2);
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.find((entry) => entry.kind === 'operation').state, 'live');
});

test('capacity two admits independent atomic overlap, rejects ordinary hazards, and colocates explicit dependencies', async () => {
  const { execution, fn, allocation, submissions } = await prepared({ policy: { maxPendingGpuOperations: 2 } });
  const request = launchRequest(allocation);
  const atomicAccesses = [
    { argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-update-relaxed-device', dtype: 'u32' },
    { argumentIndex: 1, byteOffset: 0, byteLength: 4, mode: 'atomic-observe-relaxed-device', dtype: 'u32' },
  ];
  await assert.rejects(execution.submit(fn.function, { ...request, operationId: 8 }), (error) => error.code === 'EXECUTION_ACCESSES_REQUIRED');
  await assert.rejects(execution.submit(fn.function, {
    ...request,
    accesses: [
      { argumentIndex: 0, byteOffset: 1, byteLength: 4, mode: 'atomic-update-relaxed-device', dtype: 'u32' },
      atomicAccesses[1],
    ],
    operationId: 9,
  }), (error) => error.code === 'EXECUTION_ACCESS_ATOMIC_ALIGNMENT');
  const first = await execution.submit(fn.function, { ...request, accesses: atomicAccesses, operationId: 10 });
  const second = await execution.submit(fn.function, { ...request, accesses: atomicAccesses, operationId: 11 });
  assert.equal(execution.summary().pendingOperationCount, 2);
  assert.notEqual(submissions[0].streamNative, submissions[1].streamNative);
  await assert.rejects(execution.submit(fn.function, { ...request, accesses: atomicAccesses, operationId: 12 }), (error) => error.code === 'EXECUTION_BUSY');

  const ordered = await prepared({ policy: { maxPendingGpuOperations: 2 } });
  const writes = [
    { argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'write' },
    { argumentIndex: 1, byteOffset: 0, byteLength: 4, mode: 'read' },
  ];
  const predecessor = await ordered.execution.submit(ordered.fn.function, { ...launchRequest(ordered.allocation), accesses: writes, operationId: 20 });
  await assert.rejects(ordered.execution.submit(ordered.fn.function, { ...launchRequest(ordered.allocation), accesses: writes, operationId: 21 }), (error) => error.code === 'EXECUTION_RESOURCE_HAZARD');
  await ordered.execution.submit(ordered.fn.function, { ...launchRequest(ordered.allocation), accesses: writes, after: predecessor.operation, operationId: 22 });
  assert.equal(ordered.submissions[0].streamNative, ordered.submissions[1].streamNative);
  assert.equal(first.status, 'pending');
  assert.equal(second.status, 'pending');
});

test('a deferred error with two pending operations conservatively orphans both', async () => {
  const failure = new ExecutionError('CUDA_DEFERRED_FAILURE', 'deferred-driver', 'unattributed', {}, { healthBefore: 'healthy', healthAfter: 'poisoned' });
  const preparedPair = await prepared({ policy: { maxPendingGpuOperations: 2 }, query: () => { throw failure; } });
  const accesses = [
    { argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-update-relaxed-device', dtype: 'u32' },
    { argumentIndex: 1, byteOffset: 0, byteLength: 4, mode: 'atomic-observe-relaxed-device', dtype: 'u32' },
  ];
  const first = await preparedPair.execution.submit(preparedPair.fn.function, { ...launchRequest(preparedPair.allocation), accesses, operationId: 30 });
  const second = await preparedPair.execution.submit(preparedPair.fn.function, { ...launchRequest(preparedPair.allocation), accesses, operationId: 31 });
  await assert.rejects(preparedPair.execution.operationStatus(first.operation, 32), (error) => error.code === 'EXECUTION_DEFERRED_FAILURE_UNATTRIBUTED');
  assert.equal((await preparedPair.execution.operationStatus(first.operation, 33)).status, 'orphaned');
  assert.equal((await preparedPair.execution.operationStatus(second.operation, 34)).status, 'orphaned');
});

test('pending gate admits only operation observation/release/timeout and runtime close', async () => {
  const { execution, fn, allocation } = await prepared();
  const operation = await execution.submit(fn.function, launchRequest(allocation));
  for (const command of ['execution.operation.status', 'execution.operation.release', 'execution.operation.timeout', 'runtime.close']) assert.doesNotThrow(() => execution.assertCommandAllowed(command));
  for (const command of ['execution.submit', 'memory.read', 'runtime.describe', 'execution.function.status']) assert.throws(() => execution.assertCommandAllowed(command), (error) => error.code === 'EXECUTION_COMMAND_BLOCKED');
  await assert.rejects(execution.releaseOperation(operation.operation), (error) => error.code === 'EXECUTION_OPERATION_BUSY');
});

test('separate status turns terminalize once, release leases, and permit logical close', async () => {
  let queries = 0;
  const { registry, execution, fn, allocation } = await prepared({ query: () => (++queries === 1 ? 'pending' : 'complete') });
  const operation = await execution.submit(fn.function, launchRequest(allocation));
  assert.equal((await execution.operationStatus(operation.operation, 11)).status, 'pending');
  const complete = await execution.operationStatus(operation.operation, 12);
  assert.equal(complete.status, 'completed');
  assert.equal(complete.pollCount, 2);
  assert.equal(execution.summary().pendingOperation, false);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  const repeated = await execution.operationStatus(operation.operation, 13);
  assert.equal(repeated.status, 'completed');
  assert.equal(repeated.pollCount, 2);
  assert.equal((await execution.releaseOperation(operation.operation, 14)).released.terminalState, 'completed');
});

test('deferred failure becomes stable terminal failure with proved cleanup', async () => {
  const failure = new ExecutionError(
    'CUDA_DEFERRED_FAILURE',
    'deferred-driver',
    'deferred failure',
    { nativeStatus: 719, nativeName: 'CUDA_ERROR_LAUNCH_FAILED' },
    { operation: 'cuEventQuery', operationId: 20, healthBefore: 'healthy', healthAfter: 'poisoned' },
  );
  const { registry, execution, fn, allocation } = await prepared({ query: () => { throw failure; } });
  const operation = await execution.submit(fn.function, launchRequest(allocation));
  const status = await execution.operationStatus(operation.operation, 20);
  assert.equal(status.status, 'failed');
  assert.equal(status.failure.code, 'CUDA_DEFERRED_FAILURE');
  assert.equal(status.failure.operation, 'cuEventQuery');
  assert.equal(status.failure.operationId, 20);
  assert.equal(status.failure.details.nativeStatus, 719);
  assert.equal(status.failure.details.nativeName, 'CUDA_ERROR_LAUNCH_FAILED');
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  assert.equal(execution.summary().pendingOperation, false);
  await execution.releaseOperation(operation.operation);
});

test('completed work plus failed event disposal retains cleanup provenance before restart', async () => {
  const cleanupFailure = new ExecutionError(
    'RESOURCE_DISPOSE_FAILED',
    'immediate-driver',
    'event cleanup failed',
    {
      resourceKind: 'event',
      causeCode: 'CUDA_EVENT_DESTROY_FAILED',
      causeNativeStatus: 400,
      causeNativeName: 'CUDA_ERROR_INVALID_HANDLE',
      causeNativeDescription: 'event cleanup failed at C:\\private\\driver.dll',
      providerPath: 'C:\\private\\nvcuda.dll',
    },
    { operation: 'cuEventDestroy_v2', operationId: 26, healthBefore: 'healthy', healthAfter: 'suspect' },
  );
  const { execution, fn, allocation } = await prepared({ query: () => 'complete', eventCloseFailure: cleanupFailure });
  const operation = await execution.submit(fn.function, { ...launchRequest(allocation), operationId: 25 });
  await assert.rejects(execution.operationStatus(operation.operation, 26), (error) => {
    assert.equal(error.code, 'EXECUTION_EVENT_CLEANUP_UNPROVED');
    assert.equal(error.category, 'restart-required');
    assert.equal(error.operation, 'execution.operation.status');
    assert.equal(error.healthAfter, 'restart-required');
    assert.equal(Object.hasOwn(error.details, 'primaryFailure'), false);
    assert.equal(error.details.cleanupFailures.length, 1);
    assert.equal(error.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuEventDestroy_v2');
    assert.equal(error.details.cleanupFailures[0].healthAfter, 'suspect');
    assert.equal(error.details.cleanupFailures[0].details.causeNativeStatus, 400);
    assert.equal(error.details.cleanupFailures[0].details.causeNativeName, 'CUDA_ERROR_INVALID_HANDLE');
    assert.match(error.details.cleanupFailures[0].details.causeNativeDescription, /\[redacted-path\]/);
    assert.doesNotMatch(JSON.stringify(error.details), /private|providerPath/);
    return true;
  });
  const orphaned = await execution.operationStatus(operation.operation, 27);
  assert.equal(orphaned.status, 'orphaned');
  assert.equal(orphaned.failure.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
});

test('close preparation completes proved work but preserves orphaned ownership on timeout', async () => {
  let queries = 0;
  const success = await prepared({ query: () => (++queries < 3 ? 'pending' : 'complete'), sleep: async () => {} });
  await success.execution.submit(success.fn.function, launchRequest(success.allocation));
  await success.execution.prepareClose(30);
  assert.equal(success.execution.summary().pendingOperation, false);

  let now = 0;
  const timeout = await prepared({ query: () => 'pending', policy: { maxCompletionMilliseconds: 2 }, clock: () => now, sleep: async (milliseconds) => { now += milliseconds; } });
  const operation = await timeout.execution.submit(timeout.fn.function, launchRequest(timeout.allocation));
  await assert.rejects(timeout.execution.prepareClose(31), (error) => error.code === 'EXECUTION_CLOSE_TIMEOUT' && error.category === 'restart-required');
  const status = await timeout.execution.operationStatus(operation.operation, 32);
  assert.equal(status.status, 'orphaned');
  assert.equal(timeout.execution.summary().pendingOperation, true);
  const resources = timeout.registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 2);
  const second = await timeout.execution.prepareClose(33);
  assert.equal(second.pendingOperation, true);
});

test('terminal failure plus event cleanup failure retains both errors and restart-required orphan inventory', async () => {
  const primaryFailure = new ExecutionError(
    'CUDA_DEFERRED_FAILURE',
    'deferred-driver',
    'deferred failure',
    { nativeStatus: 719 },
    { operation: 'cuEventQuery', operationId: 80, healthBefore: 'healthy', healthAfter: 'poisoned' },
  );
  const cleanupFailure = new ExecutionError(
    'RESOURCE_DISPOSE_FAILED',
    'immediate-driver',
    'event cleanup failed',
    { resourceKind: 'event', causeCode: 'CUDA_EVENT_DESTROY_FAILED', nativeStatus: 400, providerPath: 'C:\\private\\nvcuda.dll' },
    { operation: 'cuEventDestroy', operationId: 81, healthBefore: 'poisoned', healthAfter: 'poisoned' },
  );
  const { registry, execution, fn, allocation } = await prepared({
    query: () => { throw primaryFailure; },
    eventCloseFailure: cleanupFailure,
  });
  const operation = await execution.submit(fn.function, { ...launchRequest(allocation), operationId: 80 });

  await assert.rejects(execution.operationStatus(operation.operation, 81), (error) => {
    assert.equal(error.code, 'EXECUTION_EVENT_CLEANUP_UNPROVED');
    assert.equal(error.category, 'restart-required');
    assert.equal(error.operation, 'execution.operation.status');
    assert.equal(error.operationId, 81);
    assert.equal(error.healthAfter, 'restart-required');
    assert.equal(error.details.primaryFailure.code, 'CUDA_DEFERRED_FAILURE');
    assert.equal(error.details.primaryFailure.operation, 'cuEventQuery');
    assert.equal(error.details.primaryFailure.healthAfter, 'poisoned');
    assert.equal(error.details.cleanupFailures.length, 1);
    assert.equal(error.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuEventDestroy');
    assert.equal(error.details.cleanupFailures[0].healthAfter, 'poisoned');
    assert.equal(error.details.resultingHealth, 'restart-required');
    assert.deepEqual(error.details.inventory.unproved, [{ kind: 'event', registered: true, disposition: 'unproved' }]);
    assert.doesNotMatch(JSON.stringify(error.details), /private|providerPath/);
    return true;
  });

  const orphaned = await execution.operationStatus(operation.operation, 82);
  assert.equal(orphaned.status, 'orphaned');
  assert.equal(orphaned.failure.code, 'EXECUTION_EVENT_CLEANUP_UNPROVED');
  assert.equal(orphaned.failure.details.primaryFailure.code, 'CUDA_DEFERRED_FAILURE');
  assert.equal(orphaned.failure.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 1);
});
