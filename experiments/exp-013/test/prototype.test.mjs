import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { setImmediate as scheduleImmediate } from 'node:timers';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

import { DetachedMockOperation, DetachedOperationError } from '../src/detached-operation.mjs';
import { PublicationMailbox, PublicationMailboxError } from '../src/mailbox.mjs';

function observeApplicationTurn({ clock = () => performance.now(), schedule = scheduleImmediate, timeoutMilliseconds = 500 } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const deadline = clock() + timeoutMilliseconds;
    const timeoutError = () => {
      const error = new Error('Application event-loop turn did not run before the bounded deadline.');
      error.code = 'APPLICATION_TURN_TIMEOUT';
      return error;
    };
    const finish = (complete, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      complete(value);
    };
    const timeout = setTimeout(() => finish(reject, timeoutError()), timeoutMilliseconds);
    try {
      schedule(() => {
        if (clock() >= deadline) finish(reject, timeoutError());
        else finish(resolve);
      });
    } catch (error) {
      finish(reject, error);
    }
  });
}

function mailbox() {
  return new PublicationMailbox({
    lanes: [
      { name: 'multiplier', direction: 'host-to-device' },
      { name: 'observation', direction: 'device-to-host' },
      { name: 'stop', direction: 'host-to-device' },
    ],
  });
}

async function cleanup(box, operation) {
  if (operation?.state === 'pending') {
    try { box.hostStore(2, 1, operation.generation); } catch {}
    try { await operation.wait(); } catch {}
  }
  if (box?.state === 'open' && box.leaseCount === 0) {
    try { box.close(); } catch {}
  }
}

test('independent work exchanges sideband publications while pending', { timeout: 10_000 }, async () => {
  const box = mailbox();
  const generation = box.generation;
  box.hostStore(0, 1, generation);
  box.hostStore(2, 0, generation);
  const operation = new DetachedMockOperation({ mailbox: box, multiplierLane: 0, observationLane: 1, stopLane: 2 });
  try {
    assert.equal(operation.state, 'pending');
    assert.equal(operation.generation, generation);
    assert.equal(box.leaseCount, 1);

    await operation.ready();
    await delay(30);
    const first = box.hostLoad(1, generation);
    assert.ok(first > 0, `expected independently progressing observation after readiness, got ${first}`);
    assert.equal(operation.status().state, 'pending');

    box.hostStore(0, 7, generation);
    await delay(30);
    const second = box.hostLoad(1, generation);
    assert.ok(second > first + 2, `expected multiplier update to affect progress: ${first} -> ${second}`);

    assert.throws(() => box.hostStore(1, 1, generation), (error) => error instanceof PublicationMailboxError && error.code === 'MAILBOX_DIRECTION');
    assert.throws(() => box.hostLoad(0, generation), (error) => error instanceof PublicationMailboxError && error.code === 'MAILBOX_DIRECTION');
    assert.throws(() => box.reset(), (error) => error instanceof PublicationMailboxError && error.code === 'MAILBOX_BUSY');
    assert.throws(() => box.close(), (error) => error instanceof PublicationMailboxError && error.code === 'MAILBOX_BUSY');
    assert.throws(() => operation.close(), (error) => error instanceof DetachedOperationError && error.code === 'OPERATION_BUSY');

    box.hostStore(2, 1, generation);
    const terminal = await operation.wait();
    assert.equal(terminal.status, 'completed');
    assert.equal(box.leaseCount, 0);
    assert.equal(operation.close().state, 'closed');

    const nextGeneration = box.reset();
    assert.equal(nextGeneration, generation + 1);
    assert.equal(box.hostLoad(1, nextGeneration), 0);
    assert.throws(() => box.hostStore(0, 1, generation), (error) => error instanceof PublicationMailboxError && error.code === 'MAILBOX_STALE_GENERATION');
    assert.equal(box.close().state, 'closed');
  } finally {
    await cleanup(box, operation);
  }
});

test('application loop remains responsive while experiment work is active', { timeout: 10_000 }, async () => {
  const box = mailbox();
  box.hostStore(0, 1);
  const operation = new DetachedMockOperation({ mailbox: box, multiplierLane: 0, observationLane: 1, stopLane: 2 });
  try {
    await operation.ready();
    await observeApplicationTurn();
    assert.equal(operation.state, 'pending');
  } finally {
    await cleanup(box, operation);
  }
});

test('application-turn oracle rejects a missing or deadline-late turn', { timeout: 10_000 }, async () => {
  await assert.rejects(
    observeApplicationTurn({ schedule() {}, timeoutMilliseconds: 25 }),
    (error) => error.code === 'APPLICATION_TURN_TIMEOUT',
  );
  let now = 0;
  await assert.rejects(
    observeApplicationTurn({
      clock: () => now,
      schedule(callback) { now = 501; callback(); },
      timeoutMilliseconds: 500,
    }),
    (error) => error.code === 'APPLICATION_TURN_TIMEOUT',
  );
});

test('controlled mock-device loss releases the mailbox lease but reports failure', { timeout: 10_000 }, async () => {
  const box = mailbox();
  box.hostStore(0, 1);
  const operation = new DetachedMockOperation({ mailbox: box, multiplierLane: 0, observationLane: 1, stopLane: 2 });
  try {
    await operation.ready();
    const terminal = await operation.terminateForTest();
    assert.equal(terminal.status, 'failed');
    assert.equal(operation.state, 'failed');
    assert.equal(box.leaseCount, 0);
    assert.equal(operation.close().terminal.status, 'failed');
    assert.equal(box.close().state, 'closed');
  } finally {
    await cleanup(box, operation);
  }
});

test('mailbox validates schema, u32 bounds, generation and double lease release', () => {
  assert.throws(() => new PublicationMailbox({ lanes: [] }), (error) => error.code === 'MAILBOX_SCHEMA_INVALID');
  assert.throws(() => new PublicationMailbox({ lanes: [{ name: 'x', direction: 'wrong' }] }), (error) => error.code === 'MAILBOX_SCHEMA_INVALID');
  const box = mailbox();
  assert.throws(() => box.hostStore(0, -1), (error) => error.code === 'MAILBOX_VALUE_INVALID');
  assert.throws(() => box.hostStore(0, 0x1_0000_0000), (error) => error.code === 'MAILBOX_VALUE_INVALID');
  assert.throws(() => box.hostStore(0, 1, box.generation + 1), (error) => error.code === 'MAILBOX_STALE_GENERATION');
  const lease = box.acquire();
  lease.release();
  assert.throws(() => lease.release(), (error) => error.code === 'MAILBOX_LEASE_RELEASED');
  box.close();
});
