import assert from 'node:assert/strict';
import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime({ compiler: true, driver: { execution: { maxCompletionMilliseconds: 60_000 } } });
const roundLimit = Number(process.argv.find((argument) => argument.startsWith('--rounds='))?.slice(9) ?? 8);
assert(Number.isSafeInteger(roundLimit) && roundLimit >= 1 && roundLimit <= 8_000_000);
let module, fn, body, memory, operation;
try {
  const compiled = await compileDeviceProgram(runtime, {
    source: 'function body(state) { state[gpu.u32(1)] = state[gpu.u32(1)] + state[gpu.u32(0)] + gpu.u32(1); } function step(state, limit) { state[gpu.u32(0)] = state[gpu.u32(0)] + gpu.u32(1); if (state[gpu.u32(0)] < limit) { gpu.execution.tailSelf(); } }',
    functions: [
      { name: 'body', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }], returns: 'void' },
      { name: 'step', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }, { name: 'limit', type: 'u32' }], returns: 'void' },
    ],
  });
  assert(compiled.linker);
  module = await runtime.loadModule({ format: compiled.linker.artifact.format, bytes: compiled.linker.artifact.bytes });
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'step');
  const bodyKernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'body');
  fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters, executionProfile: kernel.executionProfile });
  body = await module.getFunction({ name: bodyKernel.functionName, parameters: bodyKernel.parameters });
  memory = await runtime.allocateDevice({ byteLength: 8 });
  await memory.write(new Uint8Array(8));
  operation = await runtime.submitDeviceContinuation({
    nodes: [
      { id: 'body', function: body, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ binding: 'state' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 8, mode: 'read-write' }] },
      { id: 'controller', after: ['body'], function: fn, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ binding: 'state' }, { binding: 'limit' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'read-write' }] },
    ],
    bindings: { state: memory, limit: roundLimit }, continuationNode: 'controller',
  });
  const initial = await operation.status();
  if (roundLimit >= 100_000) {
    assert.equal(initial.status, 'pending');
    await assert.rejects(operation.close(), (error) => error.category === 'backpressure');
  }
  const status = await operation.wait();
  assert.equal(status.status, 'completed');
  const { bytes } = await memory.read({ byteLength: 8 });
  const rounds = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
  const sum = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
  assert.equal(rounds, roundLimit);
  assert.equal(sum, Number(BigInt(roundLimit) * BigInt(roundLimit + 1) / 2n & 0xffff_ffffn));
  const description = await runtime.describe();
  assert.deepEqual(description.execution.deviceContinuation, { definitionsCreated: 1, executablesCreated: 1, hostLaunches: 1, definitionsDestroyed: 1, executablesDestroyed: 1 });
  console.log(JSON.stringify({ node: process.version, rounds, sum, initialStatus: initial.status, elapsedMilliseconds: status.elapsedMilliseconds, status: status.status, kind: status.kind, nativeGraphCounts: description.execution.deviceContinuation, device: description.device, driver: description.driver, durationQualification: 'not-qualified' }));
} finally {
  if (operation) await operation.close();
  if (memory) await memory.close();
  if (fn) await fn.close();
  if (body) await body.close();
  if (module) await module.close();
  const terminal = await runtime.close();
  console.log(JSON.stringify({ graceful: terminal.graceful, resourceCounts: terminal.driver?.resourceCounts }));
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.driver.resourceCounts.live, 0);
  assert.equal(terminal.driver.resourceCounts.orphaned, 0);
}
