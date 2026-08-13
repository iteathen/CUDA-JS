import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

import { DetachedMockOperation, DetachedOperationError } from '../src/detached-operation.mjs';
import { PublicationMailbox, PublicationMailboxError } from '../src/mailbox.mjs';

function mailbox() {
  return new PublicationMailbox({
    lanes: [
      { name: 'multiplier', direction: 'host-to-device' },
      { name: 'observation', direction: 'device-to-host' },
      { name: 'stop', direction: 'host-to-device' },
    ],
  });
}

test('independent work exchanges sideband publications while pending', { timeout: 10_000 }, async () => {
  const box = mailbox();
  const generation = box.generation;
  box.hostStore(0, 1, generation);
  box.hostStore(2, 0, generation);

  const operation = new DetachedMockOperation({ mailbox: box, multiplierLane: 0, observationLane: 1, stopLane: 2 });
  assert.equal(operation.state, 'pending');
  assert.equal(operation.generation, generation);
  assert.equal(box.leaseCount, 1);

  await delay(30);
  const first = box.hostLoad(1, generation);
  assert.ok(first > 0, `expected independently progressing observation, got ${first}`);
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
});

test('application loop remains responsive while experiment work is active', { timeout: 10_000 }, async () => {
  const box = mailbox();
  box.hostStore(0, 1);
  const operation = new DetachedMockOperation({ mailbox: box, multiplierLane: 0, observationLane: 1, stopLane: 2 });
  let turns = 0;
  const timer = setInterval(() => { turns += 1; }, 1);
  try {
    await delay(40);
    assert.ok(turns >= 5, `expected responsive host event loop, got ${turns} turns`);
    assert.equal(operation.state, 'pending');
  } finally {
    clearInterval(timer);
    box.hostStore(2, 1);
    await operation.wait();
    box.close();
  }
});

test('controlled mock-device loss releases the mailbox lease but reports failure', { timeout: 10_000 }, async () => {
  const box = mailbox();
  box.hostStore(0, 1);
  const operation = new DetachedMockOperation({ mailbox: box, multiplierLane: 0, observationLane: 1, stopLane: 2 });
  await delay(15);
  const terminal = await operation.terminateForTest();
  assert.equal(terminal.status, 'failed');
  assert.equal(operation.state, 'failed');
  assert.equal(box.leaseCount, 0);
  assert.equal(operation.close().terminal.status, 'failed');
  assert.equal(box.close().state, 'closed');
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
