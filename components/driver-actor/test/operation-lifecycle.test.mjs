import assert from 'node:assert/strict';
import test from 'node:test';

import { openMockDriverRuntime } from '../testing.mjs';

const PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');

async function prepared(options = {}) {
  const opened = await openMockDriverRuntime(options);
  const module = await opened.runtime.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await opened.runtime.getFunction(module.module, { name: 'operation_kernel', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const memory = await opened.runtime.allocateDevice({ byteLength: 16 });
  return { ...opened, module, fn, memory };
}

function launchRequest(memory) {
  return { grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: memory.memory }, { kind: 'u32', value: 4 }] };
}

function preparedNode(fn, { id, after = [] }) {
  return {
    id, kind: 'kernel', after, functionToken: fn.function,
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, sharedMemoryBytes: 0,
    arguments: [{ binding: 'data' }, { kind: 'u32', value: 4 }],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'read-write' }],
  };
}

test('DriverRuntime submission and completion use separate short actor turns', { timeout: 10_000 }, async () => {
  const { runtime, module, fn, memory } = await prepared();
  try {
    const operation = await runtime.submit(fn.function, launchRequest(memory));
    assert.equal(operation.status, 'pending');
    await assert.rejects(runtime.readDevice(memory.memory, { byteLength: 1 }), (error) => error.code === 'EXECUTION_COMMAND_BLOCKED');
    await assert.rejects(runtime.submit(fn.function, launchRequest(memory)), (error) => error.code === 'EXECUTION_COMMAND_BLOCKED');
    const pending = await runtime.operationStatus(operation.operation);
    assert.equal(pending.status, 'pending');
    const complete = await runtime.operationStatus(operation.operation);
    assert.equal(complete.status, 'completed');
    assert.equal((await runtime.releaseOperation(operation.operation)).released.terminalState, 'completed');

    const legacy = await runtime.launch(fn.function, launchRequest(memory));
    assert.equal(legacy.status, 'completed');
    assert.ok(legacy.pollCount >= 2);
  } finally {
    if (runtime.state === 'open') {
      await runtime.releaseMemory(memory.memory).catch(() => {});
      await runtime.releaseFunction(fn.function).catch(() => {});
      await runtime.releaseModule(module.module).catch(() => {});
    }
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
  }
});

test('waitOperation polls outside the actor and does not impose the legacy deadline', { timeout: 10_000 }, async () => {
  const { runtime, fn, memory } = await prepared({ execution: { maxCompletionMilliseconds: 1 } });
  const operation = await runtime.submit(fn.function, launchRequest(memory));
  const terminal = await runtime.waitOperation(operation.operation);
  assert.equal(terminal.status, 'completed');
  assert.equal((await runtime.releaseOperation(operation.operation)).released.terminalState, 'completed');
  assert.equal((await runtime.close()).graceful, true);
});

test('legacy launch timeout becomes restart-required without false cleanup', { timeout: 10_000 }, async () => {
  const { runtime, testing, fn, memory } = await prepared({ execution: { maxCompletionMilliseconds: 5 } });
  await testing.setExecutionMode('timeout');
  await assert.rejects(runtime.launch(fn.function, launchRequest(memory)), (error) => error.code === 'EXECUTION_COMPLETION_TIMEOUT' && error.category === 'restart-required');
  const terminal = await runtime.close();
  assert.equal(terminal.restartRequired, true);
  assert.notEqual(terminal.cleanupClaim, 'proved-mock-lifecycle-only');
  assert.ok((terminal.inventory?.counts?.orphaned ?? 0) > 0);
});

test('runtime close terminalizes a pending operation before dependency teardown', { timeout: 10_000 }, async () => {
  const { runtime, fn, memory } = await prepared();
  const operation = await runtime.submit(fn.function, launchRequest(memory));
  assert.equal(operation.status, 'pending');
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.teardown.inventory.counts.live, 0);
  assert.equal(terminal.teardown.inventory.counts.orphaned, 0);
});

test('DriverRuntime prepares and replays one semantic DAG through one operation boundary', { timeout: 10_000 }, async () => {
  const { runtime, module, fn, memory } = await prepared();
  let dag;
  try {
    dag = await runtime.prepareOperationDag({ nodes: [
      preparedNode(fn, { id: 'second', after: ['first'] }),
      preparedNode(fn, { id: 'first' }),
    ] });
    assert.equal(dag.kind, 'prepared-operation-dag');
    assert.equal(dag.nodeCount, 2);
    assert.equal((await runtime.preparedOperationDagStatus(dag.prepared)).sha256, dag.sha256);
    const submit = () => runtime.submitPreparedOperationDag(dag.prepared, {
      bindings: [{ name: 'data', kind: 'device-memory', memory: memory.memory, byteOffset: 0 }],
    });
    const first = await submit();
    assert.equal(first.kind, 'prepared-batch');
    assert.equal((await runtime.waitOperation(first.operation)).status, 'completed');
    await runtime.releaseOperation(first.operation);
    const replay = await submit();
    assert.equal((await runtime.waitOperation(replay.operation)).preparedSha256, dag.sha256);
    await runtime.releaseOperation(replay.operation);
    assert.equal((await runtime.releasePreparedOperationDag(dag.prepared)).released.sha256, dag.sha256);
    dag = null;
  } finally {
    if (runtime.state === 'open') {
      if (dag) await runtime.releasePreparedOperationDag(dag.prepared).catch(() => {});
      await runtime.releaseMemory(memory.memory).catch(() => {});
      await runtime.releaseFunction(fn.function).catch(() => {});
      await runtime.releaseModule(module.module).catch(() => {});
    }
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
  }
});
