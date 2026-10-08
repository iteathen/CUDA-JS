import assert from 'node:assert/strict';
import test from 'node:test';
import { compileDeviceProgram } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

test('public continuation submits one opaque operation and rejects ordinary controller submission', async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  let module, fn, memory, op;
  try {
    const compiled = await compileDeviceProgram(runtime, {
      source: 'function step(state) { state[gpu.u32(0)] = state[gpu.u32(0)] + gpu.u32(1); if (state[gpu.u32(0)] < gpu.u32(8)) { gpu.execution.tailSelf(); } }',
      functions: [{ name: 'step', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }], returns: 'void' }],
    });
    assert(compiled.linker);
    module = await runtime.loadModule({ format: compiled.linker.artifact.format, bytes: compiled.linker.artifact.bytes });
    const kernel = compiled.deviceProgram.kernels[0];
    fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters, executionProfile: kernel.executionProfile });
    assert.equal(fn.executionProfile, 'device-continuation-v1');
    memory = await runtime.allocateDevice({ byteLength: 4 });
    await assert.rejects(fn.submit({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [memory], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'read-write' }] }), (error) => error.code === 'EXECUTION_CONTINUATION_REQUIRED');
    op = await runtime.submitDeviceContinuation({
      nodes: [{ id: 'controller', function: fn, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ binding: 'state' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'read-write' }] }],
      bindings: { state: memory }, continuationNode: 'controller',
    });
    assert.equal(op.kind, 'operation');
    assert.equal((await op.wait()).kind, 'device-continuation');
    assert.equal((await op.status()).status, 'completed');
    assert.equal(Object.keys(op).length, 0);
  } finally {
    if (op) await op.close();
    if (memory) await memory.close();
    if (fn) await fn.close();
    if (module) await module.close();
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('continuation leases opaque mailbox lanes once through the whole operation', async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  let module, fn, mailbox, op;
  try {
    const compiled = await compileDeviceProgram(runtime, {
      source: 'function step(stop, count) { gpu.mailbox.storeReleaseSystem(count, gpu.u32(1)); if (gpu.mailbox.loadAcquireSystem(stop) === gpu.u32(0)) { gpu.execution.tailSelf(); } }',
      functions: [{ name: 'step', kind: 'kernel', parameters: [{ name: 'stop', type: 'mailbox<host-to-device,u32>' }, { name: 'count', type: 'mailbox<device-to-host,u32>' }], returns: 'void' }],
    });
    module = await runtime.loadModule({ format: compiled.linker.artifact.format, bytes: compiled.linker.artifact.bytes });
    const kernel = compiled.deviceProgram.kernels[0];
    fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters, executionProfile: kernel.executionProfile });
    mailbox = await runtime.createPublicationMailbox({ lanes: [{ name: 'stop', direction: 'host-to-device' }, { name: 'count', direction: 'device-to-host' }] });
    op = await runtime.submitDeviceContinuation({ nodes: [{ id: 'controller', function: fn, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ binding: 'stop' }, { binding: 'count' }], accesses: [] }], bindings: { stop: { kind: 'publication-mailbox', mailbox, lane: 'stop' }, count: { kind: 'publication-mailbox', mailbox, lane: 'count' } }, continuationNode: 'controller' });
    assert.equal((await mailbox.status()).leased, true);
    await assert.rejects(mailbox.reset(), (error) => error.category === 'backpressure');
    await assert.rejects(mailbox.close(), (error) => error.category === 'backpressure');
    mailbox.store('stop', 1);
    await op.wait();
    assert.equal((await mailbox.status()).leased, false);
  } finally {
    if (op) await op.close();
    if (mailbox) await mailbox.close();
    if (fn) await fn.close();
    if (module) await module.close();
    assert.equal((await runtime.close()).graceful, true);
  }
});
