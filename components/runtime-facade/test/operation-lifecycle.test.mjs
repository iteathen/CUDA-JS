import assert from 'node:assert/strict';
import test from 'node:test';

import { CudaJsError } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
function expectCode(code) { return (error) => error instanceof CudaJsError && error.code === code; }

async function prepared() {
  const runtime = await openCudaRuntimeForTesting();
  const module = await runtime.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await module.getFunction({ name: 'operation_kernel', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const memory = await runtime.allocateDevice({ byteLength: 16 });
  return { runtime, module, fn, memory };
}

const launch = (memory) => ({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [memory, 4] });

test('public submit returns an opaque operation and wait uses later actor turns', { timeout: 10_000 }, async () => {
  const { runtime, module, fn, memory } = await prepared();
  try {
    const operation = await fn.submit(launch(memory));
    assert.equal(operation.kind, 'operation');
    assert.equal(operation.state, 'pending');
    assert.equal(JSON.stringify(operation), '{}');
    await assert.rejects(operation.close(), expectCode('EXECUTION_OPERATION_BUSY'));
    await assert.rejects(memory.read({ byteLength: 1 }), expectCode('EXECUTION_COMMAND_BLOCKED'));

    const first = await operation.status();
    assert.equal(first.status, 'pending');
    const terminal = await operation.wait();
    assert.equal(terminal.status, 'completed');
    assert.equal(operation.state, 'completed');
    assert.equal(Object.hasOwn(terminal, 'operation'), false);
    assert.equal(Object.hasOwn(terminal, 'function'), false);
    assert.equal(Object.hasOwn(terminal, 'module'), false);

    const read = await memory.read({ byteLength: 1 });
    assert.equal(read.byteLength, 1);
    assert.equal((await operation.close()).state, 'closed');
    assert.equal(operation.state, 'closed');

    const legacy = await fn.launch(launch(memory));
    assert.equal(legacy.status, 'completed');
  } finally {
    if (fn.state === 'open') await fn.close();
    if (module.state === 'open') await module.close();
    if (memory.state === 'open') await memory.close();
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('runtime close terminalizes an outstanding public operation and closes its capability', { timeout: 10_000 }, async () => {
  const { runtime, fn, memory } = await prepared();
  const operation = await fn.submit(launch(memory));
  assert.equal(operation.state, 'pending');
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(operation.state, 'closed');
  assert.equal(memory.state, 'closed');
  assert.equal(fn.state, 'closed');
});
