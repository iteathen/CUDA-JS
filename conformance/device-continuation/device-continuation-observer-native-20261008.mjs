import assert from 'node:assert/strict';
import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';
const runtime = await openCudaRuntime({ compiler: true, driver: { execution: { maxPendingGpuOperations: 2 } } });
let module, controller, observer, memory, control, publication, graph, sample;
try {
  const compiled = await compileDeviceProgram(runtime, {
    source: 'function step(state, stop) { let count = gpu.atomic.add(state, gpu.u32(0), gpu.u32(1)) + gpu.u32(1); if (count < gpu.u32(1000000) && gpu.mailbox.loadAcquireSystem(stop) === gpu.u32(0)) { gpu.execution.tailSelf(); } } function observe(state, publication) { gpu.mailbox.storeReleaseSystem(publication, gpu.atomic.loadRelaxedDevice(state, gpu.u32(0))); }',
    functions: [
      { name: 'step', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }, { name: 'stop', type: 'mailbox<host-to-device,u32>' }], returns: 'void' },
      { name: 'observe', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }, { name: 'publication', type: 'mailbox<device-to-host,u32>' }], returns: 'void' },
    ],
  });
  module = await runtime.loadModule({ format: compiled.linker.artifact.format, bytes: compiled.linker.artifact.bytes });
  const step = compiled.deviceProgram.kernels.find((entry) => entry.name === 'step');
  const observe = compiled.deviceProgram.kernels.find((entry) => entry.name === 'observe');
  controller = await module.getFunction({ name: step.functionName, parameters: step.parameters, executionProfile: step.executionProfile });
  observer = await module.getFunction({ name: observe.functionName, parameters: observe.parameters });
  memory = await runtime.allocateDevice({ byteLength: 4 });
  await memory.write(new Uint8Array(4));
  control = await runtime.createPublicationMailbox({ lanes: [{ name: 'stop', direction: 'host-to-device' }] });
  publication = await runtime.createPublicationMailbox({ lanes: [{ name: 'sample', direction: 'device-to-host' }] });
  control.store('stop', 0);
  graph = await runtime.submitDeviceContinuation({
    nodes: [{ id: 'controller', function: controller, grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ binding: 'state' }, { binding: 'stop' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-update-relaxed-device', dtype: 'u32' }] }],
    bindings: { state: memory, stop: { kind: 'publication-mailbox', mailbox: control, lane: 'stop' } }, continuationNode: 'controller',
  });
  sample = await observer.submit({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [memory, { kind: 'publication-mailbox', mailbox: publication, lane: 'sample' }], accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-observe-relaxed-device', dtype: 'u32' }] });
  assert.equal((await sample.wait()).status, 'completed');
  const observed = publication.load('sample');
  assert(observed > 0 && observed < 1_000_000);
  assert.equal((await graph.status()).status, 'pending');
  control.store('stop', 1);
  assert.equal((await graph.wait()).status, 'completed');
  const { bytes } = await memory.read({ byteLength: 4 });
  const final = new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, true);
  assert(final >= observed && final < 1_000_000);
  const description = await runtime.describe();
  assert.equal(description.execution.deviceContinuation.hostLaunches, 1);
  console.log(JSON.stringify({ node: process.version, observed, final, observerCompletedWhileGraphPending: true, selectedPendingCapacity: 2, nativeGraphCounts: description.execution.deviceContinuation }));
} finally {
  if (graph?.state === 'pending') { control.store('stop', 1); await graph.wait(); }
  if (sample) await sample.close();
  if (graph) await graph.close();
  if (publication) await publication.close();
  if (control) await control.close();
  if (memory) await memory.close();
  if (observer) await observer.close();
  if (controller) await controller.close();
  if (module) await module.close();
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.driver.resourceCounts.live, 0);
  assert.equal(terminal.driver.resourceCounts.orphaned, 0);
  console.log(JSON.stringify({ graceful: terminal.graceful, resourceCounts: terminal.driver.resourceCounts }));
}
