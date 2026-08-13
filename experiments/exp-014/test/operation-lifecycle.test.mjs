import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

import { ExperimentError, legacyLaunch, SerializedOperationOwner } from '../src/operation-owner.mjs';

function code(expected) {
  return (error) => error instanceof ExperimentError && error.code === expected;
}

test('OPL-001/002/003: submit returns pending, device progresses without polling, later status is a short owner command', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('m', 7);
  const before = owner.commandCount;
  const operation = await owner.submit({ functionId: 'f', memoryIds: ['m'], durationTicks: 100, intervalMilliseconds: 2 });
  assert.equal(owner.commandCount, before + 1);
  const immediate = await operation.status();
  assert.equal(immediate.status, 'pending');
  const commandsAfterImmediateStatus = owner.commandCount;

  await delay(30);
  assert.equal(owner.commandCount, commandsAfterImmediateStatus, 'device progress must not require host status commands');
  const later = await operation.status();
  assert.equal(later.status, 'pending');
  assert.ok(later.ticks > immediate.ticks, `expected independent progress: ${immediate.ticks} -> ${later.ticks}`);
  assert.equal(owner.commandCount, commandsAfterImmediateStatus + 1);

  const terminal = await operation.wait();
  assert.equal(terminal.status, 'completed');
  await operation.close();
  assert.equal((await owner.closeRuntime()).graceful, true);
});

test('OPL-004/005/006: single-flight backpressure, repeated leases, and conservative pending-command allowlist are exact', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('leased', 11);
  owner.defineMemory('unrelated', 22);
  const operation = await owner.submit({ functionId: 'f', memoryIds: ['leased', 'leased'], durationTicks: 80, intervalMilliseconds: 2 });

  const leases = owner.leaseSnapshot('f', ['leased']);
  assert.equal(leases.functionLeases, 1);
  assert.deepEqual(leases.memoryLeases, [{ id: 'leased', leases: 2 }]);
  await assert.rejects(owner.submit({ functionId: 'g', memoryIds: [] }), code('EXECUTION_BUSY'));

  await assert.rejects(owner.memoryRead('leased'), code('EXECUTION_COMMAND_BLOCKED'));
  await assert.rejects(owner.memoryWrite('leased', 99), code('EXECUTION_COMMAND_BLOCKED'));
  await assert.rejects(owner.memoryRead('unrelated'), code('EXECUTION_COMMAND_BLOCKED'));
  await assert.rejects(owner.memoryWrite('unrelated', 99), code('EXECUTION_COMMAND_BLOCKED'));

  const terminal = await operation.wait();
  assert.equal(terminal.status, 'completed');
  assert.equal(owner.leaseSnapshot('f', ['leased']).functionLeases, 0);
  assert.deepEqual(owner.leaseSnapshot('f', ['leased']).memoryLeases, [{ id: 'leased', leases: 0 }]);

  assert.equal(await owner.memoryRead('leased'), 11);
  assert.equal(await owner.memoryWrite('unrelated', 99), 99);
  assert.equal(await owner.memoryRead('unrelated'), 99);
  await operation.close();
  assert.equal((await owner.closeRuntime()).graceful, true);
});

test('OPL-007/008/009: pending close is not cancellation and terminalization is idempotent', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('m', 1);
  const operation = await owner.submit({ functionId: 'f', memoryIds: ['m'], durationTicks: 35, intervalMilliseconds: 2 });
  const first = await operation.status();
  await assert.rejects(operation.close(), code('OPERATION_BUSY'));
  await delay(20);
  const second = await operation.status();
  assert.ok(second.ticks > first.ticks, 'failed close must not stop device progress');

  const terminal = await operation.wait();
  assert.equal(terminal.status, 'completed');
  assert.equal(terminal.cleanupCount, 1);
  assert.equal(terminal.eventActive, false);
  assert.equal(owner.cleanupCount, 1);

  const repeated = await operation.status();
  assert.deepEqual(repeated, terminal);
  assert.equal(owner.cleanupCount, 1, 'repeated status must not repeat cleanup');

  assert.deepEqual(await operation.close(), { status: 'closed', alreadyClosed: false, id: operation.id });
  assert.deepEqual(await operation.close(), { status: 'closed', alreadyClosed: true, id: operation.id });
  await assert.rejects(operation.status(), code('OPERATION_CLOSED'));
  assert.equal((await owner.closeRuntime()).graceful, true);
});

test('OPL-010: runtime close may wait inside the closing owner and terminalizes before graceful teardown', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('m');
  await owner.submit({ functionId: 'f', memoryIds: ['m'], durationTicks: 10, intervalMilliseconds: 2 });
  const terminal = await owner.closeRuntime({ maxWaitMilliseconds: 500, pollMilliseconds: 2 });
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.restartRequired, false);
  assert.equal(terminal.cleanupCount, 1);
  assert.deepEqual(owner.leaseSnapshot('f', ['m']), { functionLeases: 0, memoryLeases: [{ id: 'm', leases: 0 }] });
});

test('OPL-011: runtime close timeout preserves orphaned event/lease evidence and never claims graceful cleanup', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('m');
  const operation = await owner.submit({ functionId: 'f', memoryIds: ['m'], durationTicks: 10_000, intervalMilliseconds: 3 });
  const terminal = await owner.closeRuntime({ maxWaitMilliseconds: 12, pollMilliseconds: 2 });
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.restartRequired, true);
  assert.equal(terminal.state, 'restart-required');
  assert.equal(terminal.cleanupCount, 0);
  assert.equal(terminal.orphaned.length, 1);
  assert.equal(terminal.orphaned[0].id, operation.id);
  assert.equal(terminal.orphaned[0].status, 'orphaned');
  assert.equal(terminal.orphaned[0].eventActive, true);
  assert.deepEqual(owner.leaseSnapshot('f', ['m']), { functionLeases: 1, memoryLeases: [{ id: 'm', leases: 1 }] });
});

test('OPL-012: legacy terminal launch preserves bounded success and restart-required timeout truth', { timeout: 10_000 }, async () => {
  const successOwner = new SerializedOperationOwner();
  successOwner.defineMemory('m');
  const completed = await legacyLaunch(successOwner, { functionId: 'f', memoryIds: ['m'], durationTicks: 5, intervalMilliseconds: 2 }, { maxCompletionMilliseconds: 500 });
  assert.equal(completed.status, 'completed');
  assert.equal(successOwner.state, 'open');
  assert.equal(successOwner.cleanupCount, 1);
  assert.equal((await successOwner.closeRuntime()).graceful, true);

  const timeoutOwner = new SerializedOperationOwner();
  timeoutOwner.defineMemory('m');
  const timedOut = await legacyLaunch(timeoutOwner, { functionId: 'f', memoryIds: ['m'], durationTicks: 10_000, intervalMilliseconds: 3 }, { maxCompletionMilliseconds: 12, pollMilliseconds: 2 });
  assert.equal(timedOut.status, 'orphaned');
  assert.equal(timedOut.reason, 'legacy-completion-timeout');
  assert.equal(timeoutOwner.state, 'restart-required');
  assert.equal(timeoutOwner.cleanupCount, 0);
  assert.deepEqual(timeoutOwner.leaseSnapshot('f', ['m']), { functionLeases: 1, memoryLeases: [{ id: 'm', leases: 1 }] });
});

test('OPL-013: controlled device failure becomes a stable failed terminal record and releases leases once', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('m');
  const operation = await owner.submit({ functionId: 'f', memoryIds: ['m', 'm'], durationTicks: 100, failAtTick: 4, intervalMilliseconds: 2 });
  const failed = await operation.wait();
  assert.equal(failed.status, 'failed');
  assert.equal(failed.cleanupCount, 1);
  assert.deepEqual(owner.leaseSnapshot('f', ['m']), { functionLeases: 0, memoryLeases: [{ id: 'm', leases: 0 }] });
  assert.deepEqual(await operation.status(), failed);
  await operation.close();
  assert.equal((await owner.closeRuntime()).graceful, true);
});

test('OPL-014: unexpected mock-device loss is orphaned/restart-required and retains unproved leases', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  owner.defineMemory('m');
  const operation = await owner.submit({ functionId: 'f', memoryIds: ['m'], durationTicks: 10_000, intervalMilliseconds: 3 });
  const orphaned = await owner.terminateDeviceForTest(operation.id);
  assert.equal(orphaned.status, 'orphaned');
  assert.equal(orphaned.reason, 'device-owner-lost');
  assert.equal(owner.state, 'restart-required');
  assert.equal(owner.cleanupCount, 0);
  assert.deepEqual(owner.leaseSnapshot('f', ['m']), { functionLeases: 1, memoryLeases: [{ id: 'm', leases: 1 }] });
  await assert.rejects(operation.close(), code('OPERATION_ORPHANED'));
});

test('OPL-015: application event loop remains responsive while device work is pending', { timeout: 10_000 }, async () => {
  const owner = new SerializedOperationOwner();
  const operation = await owner.submit({ durationTicks: 40, intervalMilliseconds: 2 });
  let turns = 0;
  const timer = setInterval(() => { turns += 1; }, 1);
  try {
    await delay(30);
    assert.ok(turns >= 5, `expected host event-loop progress, got ${turns}`);
    assert.equal((await operation.status()).status, 'pending');
    assert.equal((await operation.wait()).status, 'completed');
    await operation.close();
  } finally {
    clearInterval(timer);
  }
  assert.equal((await owner.closeRuntime()).graceful, true);
});
