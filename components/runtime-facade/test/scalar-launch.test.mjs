import assert from 'node:assert/strict';
import test from 'node:test';

import { CudaJsError } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const MOCK_PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');

function expectCode(code) {
  return (error) => error instanceof CudaJsError && error.code === code;
}

test('public facade preserves declared u64/i32/f32 scalar kinds', async () => {
  const runtime = await openCudaRuntimeForTesting();
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await module.getFunction({
    name: 'scalar_kernel',
    parameters: [{ kind: 'u64' }, { kind: 'i32' }, { kind: 'f32' }],
  });

  const completion = await fn.launch({
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [0xffff_ffff_ffff_ffffn, -2, 1.5],
  });

  assert.equal(completion.status, 'completed');
  assert.deepEqual(completion.argumentKinds, ['u64', 'i32', 'f32']);

  await assert.rejects(fn.launch({
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [1, -2, 1.5],
  }), expectCode('EXECUTION_ARGUMENT_VALUE'));

  await fn.close();
  await module.close();
  assert.equal((await runtime.close()).graceful, true);
});
