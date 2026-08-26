import assert from 'node:assert/strict';
import test from 'node:test';

import { CudaJsError } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
function expectCode(code) { return (error) => error instanceof CudaJsError && error.code === code; }

async function fixture() {
  const runtime = await openCudaRuntimeForTesting();
  const module = await runtime.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await module.getFunction({ name: 'prepared_step', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const memory = await runtime.allocateDevice({ byteLength: 32 });
  return { runtime, module, fn, memory };
}

function node(fn, { id, after } = { id: 'step' }) {
  return {
    id,
    ...(after === undefined ? {} : { after }),
    function: fn,
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 32, y: 1, z: 1 },
    arguments: [{ binding: 'data' }, 4],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'read-write' }],
  };
}

test('public prepared DAG is opaque, defaults kernel fields, replays, and accepts canonical or convenience bindings', { timeout: 10_000 }, async () => {
  const { runtime, module, fn, memory } = await fixture();
  let dag;
  let view;
  try {
    dag = await runtime.prepareOperationDag([
      node(fn, { id: 'second', after: ['first'] }),
      node(fn, { id: 'first' }),
    ]);
    assert.equal(dag.kind, 'prepared-operation-dag');
    assert.equal(dag.contract, 'SPEC-0020-prepared-kernel-dag-v1');
    assert.equal(dag.nodeCount, 2);
    assert.equal(dag.edgeCount, 1);
    assert.equal(dag.realization, 'semantic-single-stream');
    assert.deepEqual(dag.bindings, [{ name: 'data', kind: 'device-memory' }]);
    assert.equal(Object.isFrozen(dag.bindings), true);
    assert.equal(JSON.stringify(dag), '{}');
    const status = await dag.status();
    assert.equal(status.sha256, dag.sha256);
    assert.equal(Object.hasOwn(status, 'prepared'), false);
    await assert.rejects(fn.close(), expectCode('RESOURCE_BUSY'));

    const first = await dag.submit({ bindings: { data: memory } });
    assert.equal(first.kind, 'operation');
    await assert.rejects(dag.close(), expectCode('RESOURCE_BUSY'));
    const completed = await first.wait();
    assert.equal(completed.kind, 'prepared-batch');
    assert.equal(completed.preparedSha256, dag.sha256);
    assert.equal(completed.nodeCount, 2);
    assert.equal(completed.edgeCount, 1);
    assert.equal(Object.hasOwn(completed, 'prepared'), false);
    await first.close();

    view = await memory.view({ dtype: 'u32', elementCount: 4, access: 'read-write' });
    const replay = await dag.submit({ data: view });
    assert.equal((await replay.wait()).status, 'completed');
    await replay.close();
    assert.equal((await dag.close()).state, 'closed');
    dag = null;
    assert.equal((await fn.close()).state, 'closed');
  } finally {
    if (dag?.state === 'open') await dag.close().catch(() => {});
    if (view?.state === 'open') await view.close().catch(() => {});
    if (fn.state === 'open') await fn.close().catch(() => {});
    if (module.state === 'open') await module.close().catch(() => {});
    if (memory.state === 'open') await memory.close().catch(() => {});
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('public prepared DAG rejects incomplete, extra, cross-runtime, and fixed device bindings before actor work', { timeout: 10_000 }, async () => {
  const first = await fixture();
  const second = await fixture();
  let dag;
  try {
    await assert.rejects(first.runtime.prepareOperationDag({ nodes: [{ ...node(first.fn), arguments: [first.memory, 4] }] }), expectCode('CUDA_JS_PREPARED_DEVICE_BINDING_REQUIRED'));
    dag = await first.runtime.prepareOperationDag({ nodes: [node(first.fn)] });
    await assert.rejects(dag.submit({ bindings: {} }), expectCode('CUDA_JS_PREPARED_BINDINGS_INVALID'));
    await assert.rejects(dag.submit({ data: first.memory, extra: 1 }), expectCode('CUDA_JS_PREPARED_BINDINGS_INVALID'));
    await assert.rejects(dag.submit({ data: second.memory }), expectCode('CUDA_JS_RESOURCE_OWNER'));
  } finally {
    if (dag?.state === 'open') await dag.close().catch(() => {});
    assert.equal((await first.runtime.close()).graceful, true);
    assert.equal((await second.runtime.close()).graceful, true);
  }
});
