import assert from 'node:assert/strict';
import test from 'node:test';

import { openCudaRuntimeForTesting } from '../../runtime-facade/testing.mjs';

function bytes(values) { return new Uint8Array(new Float32Array(values).buffer); }
function floats(value) { return [...new Float32Array(value.buffer, value.byteOffset, value.byteLength / 4)]; }

async function matrix(runtime, values, access = 'read-write') {
  const memory = await runtime.allocateDevice({ byteLength: values.length * 4 });
  await memory.write(bytes(values));
  const view = await memory.view({ dtype: 'f32', elementCount: values.length, access });
  return { memory, view };
}

test('public optional cuBLASLt profile is lazy and computes one row-major f32 matmul', async () => {
  const runtime = await openCudaRuntimeForTesting();
  assert.equal((await runtime.describe()).libraries.state, 'unopened');
  const a = await matrix(runtime, [1, 2, 3, 4, 5, 6], 'read');
  const b = await matrix(runtime, [7, 8, 9, 10, 11, 12], 'read');
  const c = await matrix(runtime, [1, 1, 1, 1], 'read');
  const d = await matrix(runtime, [0, 0, 0, 0], 'write');
  const adapter = await runtime.openCublasLt();
  const plan = await adapter.createF32MatmulPlan({ m: 2, n: 2, k: 3 });
  assert.deepEqual(plan.requirements, { a: 6, b: 6, c: 4, d: 4 });
  assert.equal(plan.maxWorkspaceBytes, 0);
  const operation = await plan.submit({ a: a.view, b: b.view, c: c.view, d: d.view, alpha: 1, beta: 2 });
  await assert.rejects(plan.close(), (error) => error.code === 'RESOURCE_BUSY');
  assert.equal((await operation.wait()).kind, 'cublaslt-f32-matmul');
  assert.deepEqual(floats((await d.memory.read({ byteLength: 16 })).bytes), [60, 66, 141, 156]);
  await operation.close();
  await plan.close();
  await adapter.close();
  for (const item of [a, b, c, d]) { await item.view.close(); await item.memory.close(); }
  assert.equal((await runtime.close()).graceful, true);
});

test('transpose and explicit workspace remain finite semantic choices', async () => {
  const runtime = await openCudaRuntimeForTesting();
  const a = await matrix(runtime, [1, 4, 2, 5, 3, 6], 'read');
  const b = await matrix(runtime, [7, 9, 11, 8, 10, 12], 'read');
  const c = await matrix(runtime, [0, 0, 0, 0], 'read');
  const d = await matrix(runtime, [0, 0, 0, 0], 'write');
  const workspaceMemory = await runtime.allocateDevice({ byteLength: 256 });
  const workspace = await workspaceMemory.view({ dtype: 'u32', elementCount: 64 });
  const adapter = await runtime.openCublasLt();
  const plan = await adapter.createF32MatmulPlan({ m: 2, n: 2, k: 3, transposeA: true, transposeB: true, maxWorkspaceBytes: 256 });
  assert.equal(plan.workspaceBytes, 256);
  const operation = await plan.submit({ a: a.view, b: b.view, c: c.view, d: d.view, workspace });
  await operation.wait();
  assert.deepEqual(floats((await d.memory.read({ byteLength: 16 })).bytes), [58, 64, 139, 154]);
  await operation.close();
  const prepared = await runtime.prepareOperationDag([{
    id: 'matmul', kind: 'cublaslt-f32-matmul', plan,
    a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' }, workspace: { binding: 'workspace' },
  }]);
  const preparedOperation = await prepared.submit({ a: a.view, b: b.view, c: c.view, d: d.view, workspace });
  await preparedOperation.wait();
  assert.deepEqual(floats((await d.memory.read({ byteLength: 16 })).bytes), [58, 64, 139, 154]);
  await preparedOperation.close(); await prepared.close(); await plan.close(); await adapter.close();
  await workspace.close(); await workspaceMemory.close();
  for (const item of [a, b, c, d]) { await item.view.close(); await item.memory.close(); }
  assert.equal((await runtime.close()).graceful, true);
});

test('the first profile rejects wrong dtype, short views, missing workspace, and duplicate adapters', async () => {
  const runtime = await openCudaRuntimeForTesting();
  await assert.rejects(runtime.openCublasLt({}), (error) => error.code === 'CUDA_JS_CUBLASLT_OPTIONS_UNSUPPORTED');
  const memory = await runtime.allocateDevice({ byteLength: 256 });
  const short = await memory.view({ dtype: 'f32', elementCount: 1 });
  const wrong = await memory.view({ dtype: 'u32', elementCount: 4 });
  const adapter = await runtime.openCublasLt();
  await assert.rejects(runtime.openCublasLt(), (error) => error.code === 'CUBLASLT_ADAPTER_ALREADY_OPEN');
  const plain = await adapter.createF32MatmulPlan({ m: 2, n: 2, k: 1 });
  await assert.rejects(plain.submit({ a: short, b: short, c: short, d: short, alpha: Number.MAX_VALUE }), (error) => error.code === 'CUBLASLT_MATMUL_SCALAR_INVALID');
  await assert.rejects(plain.submit({ a: wrong, b: short, c: short, d: short }), (error) => error.code === 'CUBLASLT_MATMUL_DTYPE_INVALID');
  await assert.rejects(plain.submit({ a: short, b: short, c: short, d: short }), (error) => error.code === 'CUBLASLT_MATMUL_VIEW_TOO_SMALL');
  const prepared = await runtime.prepareOperationDag([{
    id: 'matmul', kind: 'cublaslt-f32-matmul', plan: plain,
    a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' },
  }]);
  await assert.rejects(prepared.submit({ a: memory, b: memory, c: memory, d: memory }), (error) => error.code === 'CUBLASLT_PREPARED_VIEW_REQUIRED');
  await assert.rejects(prepared.submit({ a: wrong, b: short, c: short, d: short }), (error) => error.code === 'CUBLASLT_MATMUL_DTYPE_INVALID');
  await prepared.close();
  await assert.rejects(runtime.prepareOperationDag([{
    id: 'matmul', kind: 'cublaslt-f32-matmul', plan: adapter,
    a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' },
  }]), (error) => error.code === 'CUDA_JS_RESOURCE_KIND');
  const stalePlan = await adapter.createF32MatmulPlan({ m: 1, n: 1, k: 1 });
  await stalePlan.close();
  await assert.rejects(runtime.prepareOperationDag([{
    id: 'matmul', kind: 'cublaslt-f32-matmul', plan: stalePlan,
    a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' },
  }]), (error) => error.code === 'CUDA_JS_RESOURCE_CLOSED');
  const foreignRuntime = await openCudaRuntimeForTesting();
  const foreignAdapter = await foreignRuntime.openCublasLt();
  const foreignPlan = await foreignAdapter.createF32MatmulPlan({ m: 1, n: 1, k: 1 });
  await assert.rejects(runtime.prepareOperationDag([{
    id: 'matmul', kind: 'cublaslt-f32-matmul', plan: foreignPlan,
    a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' },
  }]), (error) => error.code === 'CUDA_JS_RESOURCE_OWNER');
  await foreignPlan.close(); await foreignAdapter.close();
  assert.equal((await foreignRuntime.close()).graceful, true);
  const workspacePlan = await adapter.createF32MatmulPlan({ m: 1, n: 1, k: 1, maxWorkspaceBytes: 256 });
  await assert.rejects(workspacePlan.submit({ a: short, b: short, c: short, d: short }), (error) => error.code === 'CUBLASLT_WORKSPACE_REQUIRED');
  await assert.rejects(runtime.prepareOperationDag([{
    id: 'matmul', kind: 'cublaslt-f32-matmul', plan: workspacePlan,
    a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' },
  }]), (error) => error.code === 'CUDA_JS_PREPARED_CUBLASLT_BINDING_INVALID');
  await workspacePlan.close(); await plain.close(); await adapter.close(); await wrong.close(); await short.close(); await memory.close();
  assert.equal((await runtime.close()).graceful, true);
});

test('prepared DAG composes kernel and cuBLASLt nodes into one replayable operation', async () => {
  const runtime = await openCudaRuntimeForTesting();
  const a = await matrix(runtime, [1, 2, 3, 4, 5, 6], 'read');
  const b = await matrix(runtime, [7, 8, 9, 10, 11, 12], 'read');
  const c = await matrix(runtime, [1, 1, 1, 1], 'read');
  const d = await matrix(runtime, [0, 0, 0, 0], 'read-write');
  const module = await runtime.loadModule({ format: 'ptx', bytes: new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n') });
  const fn = await module.getFunction({ name: 'observe', parameters: [{ kind: 'device-memory' }] });
  const adapter = await runtime.openCublasLt();
  const plan = await adapter.createF32MatmulPlan({ m: 2, n: 2, k: 3 });
  const prepared = await runtime.prepareOperationDag([
    {
      id: 'before', function: fn, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 },
      arguments: [{ binding: 'a' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 24, mode: 'read' }],
    },
    {
      id: 'matmul', kind: 'cublaslt-f32-matmul', after: ['before'], plan,
      a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' },
      alpha: { binding: 'alpha' }, beta: 2,
    },
    {
      id: 'after', after: ['matmul'], function: fn, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 },
      arguments: [{ binding: 'd' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'read' }],
    },
  ]);
  assert.equal(prepared.contract, 'SPEC-0020-prepared-kernel-dag-v1+SPEC-0031-prepared-cublaslt-f32-matmul-node-v1');
  assert.equal(prepared.nodeCount, 3);
  assert.equal(prepared.edgeCount, 2);
  const preparedIdentity = prepared.sha256;
  assert.equal((await prepared.status()).sha256, preparedIdentity);
  await assert.rejects(plan.close(), (error) => error.code === 'RESOURCE_BUSY');
  const operation = await prepared.submit({ a: a.view, b: b.view, c: c.view, d: d.view, alpha: 1 });
  await assert.rejects(d.view.close(), (error) => error.code === 'RESOURCE_BUSY');
  const completed = await operation.wait();
  assert.equal(completed.kind, 'prepared-batch');
  assert.deepEqual(floats((await d.memory.read({ byteLength: 16 })).bytes), [60, 66, 141, 156]);
  await operation.close();
  const replay = await prepared.submit({ a: a.view, b: b.view, c: c.view, d: d.view, alpha: 1 });
  await replay.wait();
  assert.equal(prepared.sha256, preparedIdentity);
  assert.deepEqual(floats((await d.memory.read({ byteLength: 16 })).bytes), [60, 66, 141, 156]);
  await replay.close();
  const hazardous = await runtime.prepareOperationDag([
    { id: 'left', kind: 'cublaslt-f32-matmul', plan, a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' } },
    { id: 'right', kind: 'cublaslt-f32-matmul', plan, a: { binding: 'a' }, b: { binding: 'b' }, c: { binding: 'c' }, d: { binding: 'd' } },
  ]);
  await assert.rejects(hazardous.submit({ a: a.view, b: b.view, c: c.view, d: d.view }), (error) => error.code === 'PREPARED_DAG_RESOURCE_HAZARD');
  await hazardous.close();
  await prepared.close();
  await plan.close();
  await adapter.close();
  await fn.close();
  await module.close();
  for (const item of [a, b, c, d]) { await item.view.close(); await item.memory.close(); }
  assert.equal((await runtime.close()).graceful, true);
});
