import assert from 'node:assert/strict';
import test from 'node:test';

import { DriverRuntimeError } from '../index.mjs';
import { openMockDriverRuntime } from '../testing.mjs';
import { assertPublicRecord, validateRequest } from '../src/protocol.mjs';

function expectCode(code) {
  return (error) => error instanceof DriverRuntimeError && error.code === code;
}

const MOCK_PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');

async function waitForState(runtime, state) {
  const deadline = Date.now() + 1_000;
  while (runtime.state !== state && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(runtime.state, state);
}

test('mock facade preserves context identity across turns and closes deterministically', async () => {
  const first = await openMockDriverRuntime();
  const second = await openMockDriverRuntime();
  const description = await first.runtime.describe();
  assert.equal(Object.isFrozen(description), true);
  assert.equal(Object.isFrozen(description.context), true);
  assert.equal(description.runtime.backend, 'mock');
  assert.equal(description.profile.nativeQualified, false);
  assert.deepEqual(description.inventory.counts, { live: 2, closing: 0, closed: 0, orphaned: 0 });

  const turnOne = await first.runtime.contextStatus(description.context);
  const turnTwo = await first.runtime.contextStatus(description.context);
  assert.equal(turnOne.currentOnOwner, true);
  assert.equal(turnTwo.currentOnOwner, true);
  assert(turnTwo.operationSequence > turnOne.operationSequence);

  await assert.rejects(first.runtime.contextStatus({ ...description.context, kind: 'library' }), (error) => error.code === 'RESOURCE_WRONG_KIND');
  const other = await second.runtime.describe();
  await assert.rejects(first.runtime.contextStatus(other.context), (error) => error.code === 'RESOURCE_WRONG_RUNTIME');
  await assert.rejects(first.runtime.contextStatus({ ...description.context, nonce: 'f'.repeat(32) }), (error) => error.code === 'RESOURCE_FORGED');
  assert.equal((await first.runtime.describe()).health.current, 'healthy');

  const terminal = await first.runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.workerExitCode, 0);
  assert.equal(terminal.workerExited, true);
  assert.deepEqual(terminal.disposalOrder, ['context', 'library']);
  assert.deepEqual(terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 2, orphaned: 0 });
  assert.equal(await first.runtime.close(), terminal);
  await assert.rejects(first.runtime.describe(), expectCode('DRIVER_RUNTIME_CLOSED'));
  await second.runtime.close();
});

test('mock health records distinguish immediate and deferred provenance monotonically', async () => {
  const { runtime, testing } = await openMockDriverRuntime();
  await assert.rejects(testing.injectHealth('immediate-driver', 41), (error) => {
    assert.equal(error.code, 'CUDA_IMMEDIATE_FAILURE');
    assert.equal(error.category, 'immediate-driver');
    assert.equal(error.healthBefore, 'healthy');
    assert.equal(error.healthAfter, 'suspect');
    assert.equal(error.details.originOperationId, 41);
    return true;
  });
  assert.equal(runtime.health, 'suspect');
  await assert.rejects(testing.injectHealth('deferred-driver', 73), (error) => {
    assert.equal(error.code, 'CUDA_DEFERRED_FAILURE');
    assert.equal(error.category, 'deferred-driver');
    assert.equal(error.healthBefore, 'suspect');
    assert.equal(error.healthAfter, 'poisoned');
    assert.equal(error.details.originOperationId, 73);
    assert(error.details.observedOperationId > 0);
    return true;
  });
  assert.equal(runtime.health, 'poisoned');
  const description = await runtime.describe();
  assert.deepEqual(description.health.history.map(({ before, after }) => ({ before, after })), [
    { before: 'healthy', after: 'suspect' },
    { before: 'suspect', after: 'poisoned' },
  ]);
  assert.equal((await runtime.close()).health.current, 'closed');
});

test('bounded queue rejects overflow while a blocked actor leaves the main loop responsive', async () => {
  const { runtime, testing } = await openMockDriverRuntime({ maxPending: 1 });
  let timerFired = false;
  const timer = new Promise((resolve) => setTimeout(() => { timerFired = true; resolve(); }, 10));
  const blocked = testing.blockActor(100);
  await assert.rejects(runtime.describe(), expectCode('DRIVER_BACKPRESSURE'));
  await timer;
  assert.equal(timerFired, true);
  const result = await blocked;
  assert.equal(result.blockedMilliseconds, 100);
  assert.equal(result.health.current, 'healthy');
  await runtime.close();
});

test('graceful close retains a reserved command slot when the user queue is full', async () => {
  const { runtime, testing } = await openMockDriverRuntime({ maxPending: 1 });
  const blocked = testing.blockActor(50);
  const terminalPromise = runtime.close();
  const [blockResult, terminal] = await Promise.all([blocked, terminalPromise]);
  assert.equal(blockResult.blockedMilliseconds, 50);
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.workerExitCode, 0);
  assert.deepEqual(terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 2, orphaned: 0 });
});

test('unexpected Worker loss invalidates the epoch and reports inaccessible resources without cleanup', async () => {
  const { runtime, testing } = await openMockDriverRuntime();
  const before = await runtime.describe();
  assert.equal(before.inventory.counts.live, 2);
  const terminal = await testing.terminateActor();
  assert.equal(runtime.state, 'restart-required');
  assert.equal(runtime.health, 'restart-required');
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.cleanupClaim, 'unproved-worker-loss');
  assert.equal(terminal.restartRequired, true);
  assert.equal(terminal.inventory.dead, true);
  assert.equal(terminal.inventory.counts.orphaned, 2);
  assert.equal(await runtime.close(), terminal);
  await assert.rejects(runtime.contextStatus(before.context), expectCode('DRIVER_RUNTIME_CLOSED'));
});

test('mock device memory provides copied full and offset transfers with bounded quota and stale rejection', async () => {
  const { runtime } = await openMockDriverRuntime({ memory: { maxDeviceBytes: 24, maxAllocationBytes: 16, maxTransferBytes: 16 } });
  const description = await runtime.describe();
  assert.deepEqual(description.memory.policy, { maxDeviceBytes: 24, maxAllocationBytes: 16, maxTransferBytes: 16 });
  assert.equal(description.memory.reservedBytes, 0);
  await assert.rejects(runtime.allocateDevice(null), expectCode('DRIVER_MEMORY_OPTIONS'));
  await assert.rejects(runtime.allocateDevice({ byteLength: 8, extra: true }), expectCode('DRIVER_MEMORY_OPTIONS'));

  const allocation = await runtime.allocateDevice({ byteLength: 16 });
  assert.equal(allocation.kind, 'device');
  assert.equal(allocation.byteLength, 16);
  assert.equal(allocation.memory.kind, 'device-memory');
  assert.equal(allocation.usage.reservedBytes, 16);
  await assert.rejects(runtime.allocateDevice({ byteLength: 9 }), expectCode('MEMORY_QUOTA_EXCEEDED'));
  assert.equal(runtime.health, 'healthy');

  const submitted = Uint8Array.from({ length: 16 }, (_, index) => index + 1);
  const writing = runtime.writeDevice(allocation.memory, submitted);
  submitted.fill(255);
  await writing;
  await runtime.writeDevice(allocation.memory, Uint8Array.of(90, 91, 92), { deviceOffset: 5 });
  const read = await runtime.readDevice(allocation.memory, { byteLength: 16 });
  assert(read.bytes instanceof Uint8Array);
  assert.equal(Buffer.isBuffer(read.bytes), false);
  assert.deepEqual([...read.bytes], [1, 2, 3, 4, 5, 90, 91, 92, 9, 10, 11, 12, 13, 14, 15, 16]);
  read.bytes.fill(0);
  assert.equal((await runtime.readDevice(allocation.memory, { deviceOffset: 5, byteLength: 1 })).bytes[0], 90);

  await assert.rejects(runtime.readDevice(allocation.memory, { deviceOffset: 16, byteLength: 1 }), expectCode('MEMORY_RANGE_OUT_OF_BOUNDS'));
  await assert.rejects(runtime.writeDevice(allocation.memory, Buffer.from([1])), expectCode('MEMORY_BYTES_INVALID'));
  await assert.rejects(runtime.writeDevice(allocation.memory, new Uint8Array(17)), expectCode('MEMORY_TRANSFER_LIMIT'));
  assert.equal(runtime.health, 'healthy');
  assert.equal((await runtime.memoryStatus(allocation.memory)).byteLength, 16);
  const released = await runtime.releaseMemory(allocation.memory);
  assert.equal(released.disposition.freed, true);
  assert.equal(released.usage.reservedBytes, 0);
  await assert.rejects(runtime.memoryStatus(allocation.memory), expectCode('RESOURCE_CLOSED'));

  const replacement = await runtime.allocateDevice({ byteLength: 8 });
  assert.equal(replacement.memory.slot, allocation.memory.slot);
  assert(replacement.memory.generation > allocation.memory.generation);
  await assert.rejects(runtime.memoryStatus(allocation.memory), expectCode('RESOURCE_STALE'));
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.deepEqual(terminal.disposalOrder.slice(-3), ['device-memory', 'context', 'library']);
});

test('unexpected Worker loss retains allocation inventory and reserved-byte evidence', async () => {
  const { runtime, testing } = await openMockDriverRuntime({ memory: { maxDeviceBytes: 32, maxAllocationBytes: 32, maxTransferBytes: 16 } });
  await runtime.allocateDevice({ byteLength: 12 });
  const before = await runtime.describe();
  assert.equal(before.inventory.counts.live, 3);
  const terminal = await testing.terminateActor();
  assert.equal(terminal.inventory.counts.orphaned, 3);
  assert.equal(terminal.memory.reservedBytes, 12);
  assert.equal(terminal.memory.allocationCount, 1);
  assert.equal(terminal.memory.state, 'orphaned');
});

test('mock execution facade snapshots PTX and completes only after private event polling', async () => {
  const { runtime } = await openMockDriverRuntime();
  const bytes = Uint8Array.from(MOCK_PTX);
  const loading = runtime.loadModule({ format: 'ptx', bytes });
  bytes.fill(0);
  const module = await loading;
  assert.equal(module.format, 'ptx');
  assert.equal(module.byteLength, MOCK_PTX.byteLength);
  assert.match(module.sha256, /^[a-f0-9]{64}$/);
  const fn = await runtime.getFunction(module.module, { name: 'mock_kernel', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  await assert.rejects(runtime.releaseModule(module.module), expectCode('RESOURCE_HAS_CHILDREN'));
  const allocation = await runtime.allocateDevice({ byteLength: 16 });
  let applicationTimer = false;
  const timer = new Promise((resolve) => setTimeout(() => { applicationTimer = true; resolve(); }, 0));
  const completion = await runtime.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 16, y: 1, z: 1 },
    arguments: [{ kind: 'device-memory', memory: allocation.memory }, { kind: 'u32', value: 4 }],
  });
  await timer;
  assert.equal(applicationTimer, true);
  assert.equal(completion.status, 'completed');
  assert.equal(completion.pollCount, 2);
  assert.equal((await runtime.functionStatus(fn.function)).name, 'mock_kernel');
  await runtime.releaseFunction(fn.function);
  await assert.rejects(runtime.functionStatus(fn.function), expectCode('RESOURCE_CLOSED'));
  await runtime.releaseModule(module.module);
  await runtime.releaseMemory(allocation.memory);
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.deepEqual(terminal.disposalOrder.slice(-3), ['stream', 'context', 'library']);
});

test('mock deferred launch failure is terminal, poisons health, and releases completed-use leases', async () => {
  const { runtime, testing } = await openMockDriverRuntime();
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await runtime.getFunction(module.module, { name: 'deferred', parameters: [{ kind: 'device-memory' }] });
  const allocation = await runtime.allocateDevice({ byteLength: 8 });
  await testing.setExecutionMode('deferred');
  await assert.rejects(runtime.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: allocation.memory }],
  }), (error) => error.code === 'CUDA_DEFERRED_FAILURE' && error.category === 'deferred-driver' && error.healthAfter === 'poisoned');
  assert.equal(runtime.health, 'poisoned');
  await assert.rejects(runtime.allocateDevice({ byteLength: 1 }), expectCode('DRIVER_RUNTIME_POISONED'));
  const description = await runtime.describe();
  assert.equal(description.inventory.resources.find((entry) => entry.kind === 'function').leases, 0);
  assert.equal(description.inventory.resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  await runtime.releaseFunction(fn.function);
  await runtime.releaseModule(module.module);
  await runtime.releaseMemory(allocation.memory);
  assert.equal((await runtime.close()).graceful, true);
});

test('mock completion timeout exits the owner and preserves orphaned event and argument leases', async () => {
  const { runtime, testing } = await openMockDriverRuntime({ execution: { maxCompletionMilliseconds: 3 } });
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await runtime.getFunction(module.module, { name: 'timeout', parameters: [{ kind: 'device-memory' }] });
  const allocation = await runtime.allocateDevice({ byteLength: 8 });
  await testing.setExecutionMode('timeout');
  await assert.rejects(runtime.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: allocation.memory }],
  }), (error) => error.code === 'EXECUTION_COMPLETION_TIMEOUT' && error.category === 'restart-required');
  await waitForState(runtime, 'restart-required');
  const terminal = runtime.terminalReport;
  assert.equal(terminal.cleanupClaim, 'unproved-worker-loss');
  assert.equal(terminal.inventory.dead, true);
  assert.equal(terminal.inventory.resources.find((entry) => entry.kind === 'event').state, 'orphaned');
  assert.equal(terminal.inventory.resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(terminal.inventory.resources.find((entry) => entry.kind === 'device-memory').leases, 1);
  assert.equal(terminal.execution.inFlight, true);
});

test('protocol rejects unknown commands and public records reject native-shaped values', () => {
  assert.throws(() => validateRequest({ schemaVersion: 1, requestId: 1, operation: 'native.call', payload: {} }), expectCode('DRIVER_COMMAND_UNSUPPORTED'));
  assert.throws(() => validateRequest({ schemaVersion: 1, requestId: 1, operation: 'runtime.describe', payload: { extra: true } }), expectCode('DRIVER_COMMAND_PAYLOAD'));
  assert.throws(() => assertPublicRecord({ pointer: 1n }), expectCode('DRIVER_RESULT_NATIVE_VALUE'));
  assert.throws(() => assertPublicRecord({ bytes: Buffer.alloc(8) }), expectCode('DRIVER_RESULT_NATIVE_VALUE'));
  assert.deepEqual(assertPublicRecord({ bytes: Uint8Array.of(1, 2) }).bytes, Uint8Array.of(1, 2));
  assert.throws(() => assertPublicRecord({ bytes: Uint8Array.of(1, 2) }, { maxByteLength: 1 }), expectCode('DRIVER_RESULT_BOUNDS'));
  assert.deepEqual(assertPublicRecord({ safe: true, values: [1, 'two', null] }), { safe: true, values: [1, 'two', null] });
});
