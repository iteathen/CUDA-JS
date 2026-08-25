import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { DriverRuntimeError, openDriverRuntime } from '../index.mjs';
import { openMockDriverRuntime } from '../testing.mjs';
import { assertPublicRecord, validateRequest } from '../src/protocol.mjs';
import { deserializeError, serializeError } from '../src/errors.mjs';
import { startupRollbackFailure } from '../src/startup-rollback.mjs';
import { resolveLinuxNativeProfile, resolveWindowsNativeProfile } from '../src/backends/native-profiles.mjs';
import { selectNativeBackend } from '../src/driver-runtime.mjs';

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
  assert.equal(description.profile.nativeOperational, false);
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

test('Driver error transport preserves a bounded observation operation', () => {
  const source = new DriverRuntimeError(
    'CUDA_DRIVER_FAILURE',
    'immediate-driver',
    'Native operation failed.',
    { nativeStatus: 999 },
    { operation: 'cuMemFree_v2', operationId: 17, healthBefore: 'healthy', healthAfter: 'suspect' },
  );
  const serialized = serializeError(source);
  assert.equal(serialized.operation, 'cuMemFree_v2');
  const transported = deserializeError(serialized);
  assert.equal(transported.operation, 'cuMemFree_v2');
  assert.equal(transported.operationId, 17);
  assert.equal(transported.healthAfter, 'suspect');
  assert.equal(serializeError(Object.assign(new Error('unsafe'), {
    code: 'CUDA_DRIVER_FAILURE', category: 'immediate-driver', operation: 'C:\\private\\call',
  })).operation, null);
});

test('native startup rollback product retains bounded primary and cleanup semantics', () => {
  const primary = new DriverRuntimeError(
    'RESOURCE_NONCE_INVALID',
    'internal',
    'Context registry admission failed.',
    { slot: 1, privatePath: 'C:\\private\\context' },
    { operation: 'resource.allocate', operationId: 7, healthBefore: 'healthy', healthAfter: 'suspect' },
  );
  const cleanup = new DriverRuntimeError(
    'CUDA_DRIVER_FAILURE',
    'immediate-driver',
    'cuCtxDestroy_v2 failed.',
    {
      nativeStatus: 999,
      nativeName: 'CUDA_ERROR_UNKNOWN',
      nativeDescription: `at C:\\private\\nvcuda.dll host secret-machine user secret-user handle 0xdecafbad token ${'a'.repeat(32)} runtimeId runtime-secret bare ${'b'.repeat(32)} account@example.test`,
      privatePointer: '0x1234',
    },
    { operation: 'cuCtxDestroy_v2', operationId: 7, healthBefore: 'suspect', healthAfter: 'poisoned' },
  );
  const error = startupRollbackFailure({
    primaryError: primary,
    cleanupErrors: [cleanup],
    inventory: {
      counts: { live: 1, closing: 0, closed: 0, orphaned: 1 },
      resources: [{ kind: 'library', state: 'live' }, { kind: 'context', state: 'orphaned' }],
    },
    unprovedResources: [{ kind: 'device', state: 'orphaned', disposition: 'unproved' }],
    healthCurrent: 'poisoned',
  });
  assert.equal(error.code, 'DRIVER_STARTUP_ROLLBACK_FAILED');
  assert.equal(error.category, 'immediate-driver');
  assert.equal(error.operation, 'runtime.open');
  assert.equal(error.healthAfter, 'poisoned');
  assert.equal(error.details.primaryFailure.code, 'RESOURCE_NONCE_INVALID');
  assert.equal(error.details.cleanupFailures.length, 1);
  assert.equal(error.details.cleanupFailures[0].operation, 'cuCtxDestroy_v2');
  assert.equal(error.details.cleanupFailures[0].details.nativeName, 'CUDA_ERROR_UNKNOWN');
  assert.equal(error.details.cleanupFailures[0].details.nativeStatus, 999);
  assert.match(error.details.cleanupFailures[0].details.nativeDescription, /\[redacted-path\]/);
  assert.match(error.details.cleanupFailures[0].details.nativeDescription, /\[redacted-identity\]/);
  assert.match(error.details.cleanupFailures[0].details.nativeDescription, /\[redacted-handle\]/);
  assert.match(error.details.cleanupFailures[0].details.nativeDescription, /\[redacted-capability\]/);
  assert.equal(error.details.cleanupFailureCount, 1);
  assert.equal(error.details.cleanupFailuresTruncated, 0);
  assert.equal(error.details.terminal, 'unproved');
  assert.deepEqual(error.details.inventory.counts, { live: 1, closing: 0, closed: 0, orphaned: 2 });
  assert.deepEqual(error.details.inventory.resources.at(-1), { kind: 'device', state: 'orphaned', disposition: 'unproved' });
  assert.equal(JSON.stringify(error.details).includes('private'), false);
  assert.equal(JSON.stringify(error.details).includes('0x1234'), false);
  assert.doesNotMatch(JSON.stringify(error.details), /secret-machine|secret-user|runtime-secret|account@example|a{32}|b{32}/);
});

test('native backend source directly rolls back pre-registration context/library ownership and retains failures', async () => {
  const source = await readFile(new URL('../src/backends/native.mjs', import.meta.url), 'utf8');
  assert.match(source, /rawContext = context;\s*contextToken = registry\.allocate/);
  assert.match(source, /if \(rawContext !== null\)[\s\S]*destroyContextForRollback\(rawContext\)/);
  assert.match(source, /if \(!libraryToken && library && !dependencyCleanupBlocked\)[\s\S]*closeDriverLibrary\(library\)/);
  assert.match(source, /cleanupErrors\.push\(\.\.\.teardown\.errors\)/);
  assert.match(source, /startupRollbackFailure\(\{/);
  assert.doesNotMatch(source, /library\.close\(\);?\s*\} catch \{\}/);
  assert.doesNotMatch(source, /requireSuccess\('[^']*\(/);
});

test('native profiles keep platform discovery private, canonical, and unambiguous', () => {
  assert.equal(selectNativeBackend('win32', 'x64'), 'windows-native');
  assert.equal(selectNativeBackend('linux', 'x64'), 'linux-native');
  assert.throws(() => selectNativeBackend('linux', 'arm64'), expectCode('DRIVER_PROFILE_UNSUPPORTED'));

  const windows = resolveWindowsNativeProfile({
    platform: 'win32', architecture: 'x64', systemRoot: 'C:\\Windows',
    exists: () => true, realpath: (value) => value,
  });
  assert.equal(windows.backend, 'windows-native');
  assert.equal(windows.driverPath, 'C:\\Windows\\System32\\nvcuda.dll');

  const canonical = '/usr/lib/x86_64-linux-gnu/libcuda.so.610.74';
  const linux = resolveLinuxNativeProfile({
    platform: 'linux', architecture: 'x64', exists: () => true, realpath: () => canonical,
  });
  assert.equal(linux.backend, 'linux-native');
  assert.equal(linux.driverPath, canonical);
  assert.match(linux.memoryClaim, /unqualified$/);

  assert.throws(() => resolveLinuxNativeProfile({
    platform: 'linux', architecture: 'x64', exists: () => true,
    realpath: (value) => value.startsWith('/usr/lib64') ? '/opt/other/libcuda.so.1' : canonical,
  }), expectCode('DRIVER_LIBRARY_AMBIGUOUS'));
  assert.throws(() => resolveLinuxNativeProfile({
    platform: 'linux', architecture: 'x64', exists: () => true,
    realpath: () => '/usr/local/cuda/lib64/stubs/libcuda.so',
  }), expectCode('DRIVER_LIBRARY_NONCANONICAL'));
  assert.throws(() => resolveLinuxNativeProfile({
    platform: 'linux', architecture: 'x64', exists: (value) => value.startsWith('/usr/lib/x86_64-linux-gnu'),
    realpath: () => '/opt/vendor/libcuda.so.1',
  }), expectCode('DRIVER_LIBRARY_NONCANONICAL'));
});

for (const scenario of [
  { mode: 'immediate', category: 'immediate-driver', health: 'suspect', workerExits: false },
  { mode: 'poisoned', category: 'immediate-driver', health: 'poisoned', workerExits: false },
  { mode: 'restart-required', category: 'restart-required', health: 'restart-required', workerExits: true },
  { mode: 'unstructured', category: 'restart-required', health: 'restart-required', workerExits: true },
]) {
  test(`mock ${scenario.mode} disposal failure preserves health, admission, and single-call evidence`, async () => {
    const { runtime, testing } = await openMockDriverRuntime();
    const allocation = await runtime.allocateDevice({ byteLength: 8 });
    await testing.setDisposalFailureMode(scenario.mode);
    let firstFailure;
    let immediateClose;
    await assert.rejects(runtime.releaseMemory(allocation.memory), (error) => {
      firstFailure = error;
      assert.equal(error.code, 'RESOURCE_DISPOSE_FAILED');
      assert.equal(error.category, scenario.category);
      assert.equal(error.operation, scenario.mode === 'unstructured' ? 'resource.close' : 'mock.memory.free');
      assert.equal(error.healthAfter, scenario.health);
      assert.equal(error.details.resourceKind, 'device-memory');
      assert.equal(error.details.resourceState, 'orphaned');
      assert.equal(error.details.disposition, scenario.mode === 'unstructured' ? 'unproved' : 'orphaned');
      if (scenario.mode === 'unstructured') {
        assert.equal(error.details.causeCode, null);
        assert.equal(error.details.causeDisposalCallCount, 1);
      } else {
        assert.equal(error.details.causeCode, 'CUDA_MOCK_DISPOSAL_FAILURE');
        assert.equal(error.details.causeOperation, 'mock.memory.free');
        assert.equal(error.details.causeDisposalCallCount, 1);
      }
      if (scenario.workerExits) {
        immediateClose = runtime.close();
      }
      return true;
    });

    if (scenario.workerExits) {
      assert.equal(runtime.health, 'restart-required');
      const terminal = await immediateClose;
      assert.equal(terminal.workerExited, true);
      assert.equal(terminal.workerExitCode, 0);
      assert.equal(runtime.terminalReport, terminal);
      assert.equal(await runtime.close(), terminal);
      assert.equal(terminal.commandAcknowledged, true);
      assert.equal(terminal.error.code, firstFailure.code);
      assert.equal(terminal.error.category, scenario.category);
      assert.equal(terminal.error.operation, firstFailure.operation);
      assert.equal(terminal.acknowledgedHealth.current, 'restart-required');
      assert.equal(terminal.acknowledgedInventory.resources.find((entry) => entry.kind === 'device-memory').state, 'orphaned');
      assert.equal(terminal.inventory.dead, true);
      return;
    }

    assert.equal(runtime.health, scenario.health);
    const firstStatus = await testing.disposalStatus();
    assert.equal(firstStatus.disposalCallCount, 1);
    assert.equal(firstStatus.inventory.resources.find((entry) => entry.kind === 'device-memory').state, 'orphaned');
    await assert.rejects(runtime.releaseMemory(allocation.memory), (error) => {
      assert.equal(error.code, firstFailure.code);
      assert.equal(error.category, firstFailure.category);
      assert.equal(error.operation, firstFailure.operation);
      return true;
    });
    assert.equal((await testing.disposalStatus()).disposalCallCount, 1);

    if (scenario.health === 'poisoned') {
      await assert.rejects(runtime.allocateDevice({ byteLength: 1 }), (error) => error.code === 'DRIVER_RUNTIME_POISONED' && error.healthAfter === 'poisoned');
    } else {
      const admitted = await runtime.allocateDevice({ byteLength: 1 });
      assert.equal(admitted.byteLength, 1);
    }

    const terminal = await runtime.close();
    assert.equal(terminal.graceful, false);
    assert.equal(terminal.commandAcknowledged, true);
    assert.equal(terminal.acknowledgedHealth.current, scenario.health);
    assert.equal(terminal.acknowledgedInventory.counts.orphaned > 0, true);
    assert.equal(terminal.inventory.dead, true);
    assert.equal(terminal.health.current, 'restart-required');
  });
}

test('queued commands observe restart health before pending-operation backpressure', async () => {
  const { runtime, testing } = await openMockDriverRuntime();
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await runtime.getFunction(module.module, { name: 'restart_queue', parameters: [{ kind: 'u32' }] });
  await testing.setExecutionMode('restart-required');
  const operation = await runtime.submit(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'u32', value: 1 }],
  });

  const restart = runtime.operationStatus(operation.operation);
  const queuedDescribe = runtime.describe();
  const queuedAllocation = runtime.allocateDevice({ byteLength: 1 });

  await assert.rejects(restart, (error) => error.code === 'CUDA_EVENT_QUERY_RESTART_REQUIRED' && error.category === 'restart-required');
  for (const queued of [queuedDescribe, queuedAllocation]) {
    await assert.rejects(queued, (error) => error.code === 'DRIVER_RESTART_REQUIRED'
      && error.category === 'restart-required'
      && error.healthBefore === 'restart-required'
      && error.healthAfter === 'restart-required');
  }

  const terminal = await runtime.close();
  assert.equal(terminal.workerExited, true);
  assert.equal(runtime.terminalReport, terminal);
  assert.equal(await runtime.close(), terminal);
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

test('Worker-loss terminal preserves total counts when inventory records are truncated', async () => {
  const { runtime, testing } = await openMockDriverRuntime();
  for (let index = 0; index < 20; index += 1) await runtime.allocateDevice({ byteLength: 1 });
  const before = await runtime.describe();
  assert.equal(before.inventory.resourceCount, 22);
  assert.equal(before.inventory.resources.length, 16);
  assert.equal(before.inventory.resourcesTruncated, 6);
  assert.equal(before.inventory.counts.live, 22);

  const terminal = await testing.terminateActor();
  assert.equal(terminal.inventory.resourceCount, 22);
  assert.equal(terminal.inventory.resources.length, 16);
  assert.equal(terminal.inventory.resourcesTruncated, 6);
  assert.deepEqual(terminal.inventory.counts, { live: 0, closing: 0, closed: 0, orphaned: 22 });
});

test('large graceful teardown bounds mock disposal order while retaining exact totals and terminal parent proof', async () => {
  const { runtime } = await openMockDriverRuntime({
    memory: { maxDeviceBytes: 4_096, maxAllocationBytes: 4_096, maxTransferBytes: 4_096 },
  });
  for (let index = 0; index < 1_400; index += 1) await runtime.allocateDevice({ byteLength: 1 });

  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.cleanupClaim, 'proved-mock-lifecycle-only');
  assert.equal(terminal.disposalOrderCount, 1_402);
  assert.equal(terminal.disposalOrder.length, 32);
  assert.equal(terminal.disposalOrderTruncated, 1_370);
  assert.deepEqual(terminal.disposalOrder.slice(-2), ['context', 'library']);
  assert.equal(terminal.teardown.dispositionCount, 1_402);
  assert.equal(terminal.teardown.dispositionsTruncated, 1_370);
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

test('simultaneous public launch submissions remain ordered and serialized in the accepted profile', async () => {
  const { runtime } = await openMockDriverRuntime();
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await runtime.getFunction(module.module, { name: 'serialized', parameters: [{ kind: 'device-memory' }] });
  const firstMemory = await runtime.allocateDevice({ byteLength: 8 });
  const secondMemory = await runtime.allocateDevice({ byteLength: 8 });
  const launch = (memory) => runtime.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [{ kind: 'device-memory', memory }],
  });

  const [first, second] = await Promise.all([launch(firstMemory.memory), launch(secondMemory.memory)]);
  assert.equal(first.status, 'completed');
  assert.equal(second.status, 'completed');
  assert.equal(first.pollCount, 2);
  assert.equal(second.pollCount, 2);
  assert(first.operationSequence < second.operationSequence, 'Worker command order must serialize simultaneous submissions.');
  assert.equal((await runtime.describe()).execution.inFlight, false);

  await runtime.releaseFunction(fn.function);
  await runtime.releaseModule(module.module);
  await runtime.releaseMemory(firstMemory.memory);
  await runtime.releaseMemory(secondMemory.memory);
  assert.equal((await runtime.close()).graceful, true);
});

test('mock deferred launch failure is terminal, poisons health, and releases completed-use leases', async () => {
  const { runtime, testing } = await openMockDriverRuntime();
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await runtime.getFunction(module.module, { name: 'deferred', parameters: [{ kind: 'device-memory' }] });
  const allocation = await runtime.allocateDevice({ byteLength: 8 });
  await testing.setExecutionMode('deferred');
  await assert.rejects(runtime.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: allocation.memory }],
  }), (error) => {
    assert.equal(error.code, 'CUDA_DEFERRED_FAILURE');
    assert.equal(error.category, 'deferred-driver');
    assert.equal(error.operation, 'execution.event.query');
    assert.equal(error.healthAfter, 'poisoned');
    assert.equal(error.details.nativeStatus, 999);
    return true;
  });
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

test('unexpected Driver errors are sanitized and permission denial stays attributable', () => {
  const internal = serializeError(Object.assign(new Error('failed at C:\\private\\nvcuda.dll'), { code: 'ENOENT' }));
  assert.equal(internal.code, 'DRIVER_RUNTIME_INTERNAL');
  assert.equal(internal.message, 'DriverActor internal failure.');
  assert.deepEqual(internal.details, {});
  const permission = serializeError(Object.assign(new Error('denied'), { code: 'ERR_ACCESS_DENIED' }));
  assert.equal(permission.code, 'ERR_ACCESS_DENIED');
  assert.equal(permission.category, 'permission');
  assert.equal(permission.message, 'DriverActor lacks required Node permission.');
});

test('native DriverActor fails before Worker creation when the process FFI flag is absent', async () => {
  if (process.execArgv.includes('--experimental-ffi')) return;
  await assert.rejects(openDriverRuntime(), { code: 'DRIVER_FFI_FLAG_REQUIRED' });
});
