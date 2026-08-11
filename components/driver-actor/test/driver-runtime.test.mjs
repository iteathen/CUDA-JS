import assert from 'node:assert/strict';
import test from 'node:test';

import { DriverRuntimeError } from '../index.mjs';
import { openMockDriverRuntime } from '../testing.mjs';
import { assertPublicRecord, validateRequest } from '../src/protocol.mjs';

function expectCode(code) {
  return (error) => error instanceof DriverRuntimeError && error.code === code;
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

test('protocol rejects unknown commands and public records reject native-shaped values', () => {
  assert.throws(() => validateRequest({ schemaVersion: 1, requestId: 1, operation: 'native.call', payload: {} }), expectCode('DRIVER_COMMAND_UNSUPPORTED'));
  assert.throws(() => validateRequest({ schemaVersion: 1, requestId: 1, operation: 'runtime.describe', payload: { extra: true } }), expectCode('DRIVER_COMMAND_PAYLOAD'));
  assert.throws(() => assertPublicRecord({ pointer: 1n }), expectCode('DRIVER_RESULT_NATIVE_VALUE'));
  assert.throws(() => assertPublicRecord({ bytes: Buffer.alloc(8) }), expectCode('DRIVER_RESULT_NATIVE_VALUE'));
  assert.deepEqual(assertPublicRecord({ safe: true, values: [1, 'two', null] }), { safe: true, values: [1, 'two', null] });
});
