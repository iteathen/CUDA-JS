import assert from 'node:assert/strict';
import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';
const runtime = await openCudaRuntime({ compiler: true });
let module, fn, memory, mailbox, operation;
try {
  const compiled = await compileDeviceProgram(runtime, {
    source: 'function step(state, stop, progress) { state[gpu.u32(0)] = state[gpu.u32(0)] + gpu.u32(1); gpu.mailbox.storeReleaseSystem(progress, state[gpu.u32(0)]); if (state[gpu.u32(0)] < gpu.u32(1000000) && gpu.mailbox.loadAcquireSystem(stop) === gpu.u32(0)) { gpu.execution.tailSelf(); } }',
    functions: [{ name: 'step', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }, { name: 'stop', type: 'mailbox<host-to-device,u32>' }, { name: 'progress', type: 'mailbox<device-to-host,u32>' }], returns: 'void' }],
  });
  module = await runtime.loadModule({ format: compiled.linker.artifact.format, bytes: compiled.linker.artifact.bytes });
  const kernel = compiled.deviceProgram.kernels[0];
  fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters, executionProfile: kernel.executionProfile });
  memory = await runtime.allocateDevice({ byteLength: 4 });
  await memory.write(new Uint8Array(4));
  mailbox = await runtime.createPublicationMailbox({ lanes: [{ name: 'stop', direction: 'host-to-device' }, { name: 'progress', direction: 'device-to-host' }] });
  mailbox.store('stop', 0);
  operation = await runtime.submitDeviceContinuation({
    nodes: [{ id: 'controller', function: fn, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ binding: 'state' }, { binding: 'stop' }, { binding: 'progress' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'read-write' }] }],
    bindings: { state: memory, stop: { kind: 'publication-mailbox', mailbox, lane: 'stop' }, progress: { kind: 'publication-mailbox', mailbox, lane: 'progress' } }, continuationNode: 'controller',
  });
  assert.equal((await operation.status()).status, 'pending');
  assert.equal((await mailbox.status()).leased, true);
  await assert.rejects(mailbox.reset(), (error) => error.category === 'backpressure');
  await assert.rejects(mailbox.close(), (error) => error.category === 'backpressure');
  await new Promise((resolve) => setTimeout(resolve, 10));
  // One external cooperative stop request; no host advancement or relaunch.
  mailbox.store('stop', 1);
  const status = await operation.wait();
  assert.equal(status.status, 'completed');
  const { bytes } = await memory.read({ byteLength: 4 });
  const rounds = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
  assert(rounds > 0 && rounds < 1_000_000);
  assert.equal(mailbox.load('progress'), rounds);
  assert.equal((await mailbox.status()).leased, false);
  const description = await runtime.describe();
  assert.equal(description.execution.deviceContinuation.hostLaunches, 1);
  console.log(JSON.stringify({ node: process.version, rounds, publication: mailbox.load('progress'), stoppedBeforeFiniteLimit: true, nativeGraphCounts: description.execution.deviceContinuation, elapsedMilliseconds: status.elapsedMilliseconds }));
} finally {
  if (operation?.state === 'pending') { mailbox.store('stop', 1); await operation.wait(); }
  if (operation) await operation.close();
  if (mailbox) await mailbox.close();
  if (memory) await memory.close();
  if (fn) await fn.close();
  if (module) await module.close();
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.driver.resourceCounts.live, 0);
  assert.equal(terminal.driver.resourceCounts.orphaned, 0);
  console.log(JSON.stringify({ graceful: terminal.graceful, resourceCounts: terminal.driver.resourceCounts }));
}
