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
  await operation.close(); await plan.close(); await adapter.close();
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
  const workspacePlan = await adapter.createF32MatmulPlan({ m: 1, n: 1, k: 1, maxWorkspaceBytes: 256 });
  await assert.rejects(workspacePlan.submit({ a: short, b: short, c: short, d: short }), (error) => error.code === 'CUBLASLT_WORKSPACE_REQUIRED');
  await workspacePlan.close(); await plain.close(); await adapter.close(); await wrong.close(); await short.close(); await memory.close();
  assert.equal((await runtime.close()).graceful, true);
});
