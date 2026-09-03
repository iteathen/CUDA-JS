import assert from 'node:assert/strict';
import test from 'node:test';

import { openCudaRuntimeForTesting } from '../../runtime-facade/testing.mjs';

function workspaceAlignmentFailure(alignment) {
  return (error) => error.code === 'CUBLASLT_WORKSPACE_ALIGNMENT'
    && error.category === 'validation'
    && error.details?.workspaceAlignmentBytes === alignment;
}

test('public cuBLASLt capability owns workspace alignment for ordinary and prepared execution', async () => {
  const runtime = await openCudaRuntimeForTesting();
  const matrixMemory = await runtime.allocateDevice({ byteLength: 4 });
  const matrix = await matrixMemory.view({ dtype: 'f32', elementCount: 1 });
  const workspaceMemory = await runtime.allocateDevice({ byteLength: 512 });
  const misalignedWorkspace = await workspaceMemory.view({ dtype: 'u32', elementCount: 64, byteOffset: 4 });
  const adapter = await runtime.openCublasLt();

  assert.equal(adapter.provider.workspaceAlignmentBytes, 256);
  assert.equal((await adapter.status()).provider.workspaceAlignmentBytes, adapter.provider.workspaceAlignmentBytes);

  const plan = await adapter.createF32MatmulPlan({ m: 1, n: 1, k: 1, maxWorkspaceBytes: 256 });
  assert.equal(plan.workspaceBytes, 256);
  await assert.rejects(
    plan.submit({ a: matrix, b: matrix, c: matrix, d: matrix, workspace: misalignedWorkspace }),
    workspaceAlignmentFailure(adapter.provider.workspaceAlignmentBytes),
  );

  const prepared = await runtime.prepareOperationDag([{
    id: 'matmul',
    kind: 'cublaslt-f32-matmul',
    plan,
    a: { binding: 'a' },
    b: { binding: 'b' },
    c: { binding: 'c' },
    d: { binding: 'd' },
    workspace: { binding: 'workspace' },
  }]);
  await assert.rejects(
    prepared.submit({ a: matrix, b: matrix, c: matrix, d: matrix, workspace: misalignedWorkspace }),
    workspaceAlignmentFailure(adapter.provider.workspaceAlignmentBytes),
  );

  await prepared.close();
  await plan.close();
  await adapter.close();
  await misalignedWorkspace.close();
  await workspaceMemory.close();
  await matrix.close();
  await matrixMemory.close();
  assert.equal((await runtime.close()).graceful, true);
});
