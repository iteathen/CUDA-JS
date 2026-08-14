import assert from 'node:assert/strict';
import test from 'node:test';

import { CudaJsError } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const MOCK_PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');

function expectCode(code) {
  return (error) => error instanceof CudaJsError && error.code === code;
}

test('public facade preserves declared u64/i32/f32 scalar kinds', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting();
  let module;
  let fn;
  try {
    module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
    fn = await module.getFunction({
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
    }), expectCode('DRIVER_LAUNCH_OPTIONS'));
  } finally {
    if (fn?.state === 'open') await fn.close();
    if (module?.state === 'open') await module.close();
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
  }
});

test('public facade admits SPEC-0021 f64/f16/bf16 without widening legacy f32', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting();
  let module;
  let fn;
  try {
    module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
    fn = await module.getFunction({
      name: 'extended_scalar_kernel',
      parameters: [{ kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }, { kind: 'f32' }],
    });

    const completion = await fn.launch({
      grid: { x: 1, y: 1, z: 1 },
      block: { x: 1, y: 1, z: 1 },
      arguments: [Number.NaN, Infinity, -Infinity, 1.5],
    });
    assert.equal(completion.status, 'completed');
    assert.deepEqual(completion.argumentKinds, ['f64', 'f16', 'bf16', 'f32']);

    await assert.rejects(fn.launch({
      grid: { x: 1, y: 1, z: 1 },
      block: { x: 1, y: 1, z: 1 },
      arguments: [1, 1, 1, Infinity],
    }), expectCode('DRIVER_LAUNCH_OPTIONS'));
  } finally {
    if (fn?.state === 'open') await fn.close();
    if (module?.state === 'open') await module.close();
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
  }
});
