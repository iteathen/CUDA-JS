import assert from 'node:assert/strict';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime({
  compiler: true,
  driver: {
    memory: { maxDeviceBytes: 4, maxAllocationBytes: 4, maxTransferBytes: 4 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 4, maxCompletionMilliseconds: 30_000 },
  },
});
let terminal;
let observation;
try {
  const compiled = await compileDeviceProgram(runtime, {
    source: `
function mailboxKernel(control, result) {
  let value = gpu.u32(0);
  while (value === gpu.u32(0)) {
    value = gpu.mailbox.loadAcquireSystem(control);
  }
  gpu.mailbox.storeReleaseSystem(result, value + gpu.u32(1));
}
`,
    functions: [{
      name: 'mailboxKernel',
      kind: 'kernel',
      parameters: [
        { name: 'control', type: 'mailbox<host-to-device,u32>' },
        { name: 'result', type: 'mailbox<device-to-host,u32>' },
      ],
      returns: 'void',
    }],
    compile: { headerProfile: 'cuda-cccl' },
  });
  assert.equal(compiled.deviceProgram.contract, 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0014-publication-mailbox-v1');
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'mailboxKernel');
  assert(kernel);
  const module = await runtime.loadModule({ format: 'ptx', bytes: compiled.compiler.artifact.bytes });
  const fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
  const mailbox = await runtime.createPublicationMailbox({ lanes: [
    { name: 'control', direction: 'host-to-device' },
    { name: 'result', direction: 'device-to-host' },
  ] });
  assert.equal(JSON.stringify(mailbox), '{}');
  const operation = await fn.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 },
    arguments: [
      { kind: 'publication-mailbox', mailbox, lane: 'control' },
      { kind: 'publication-mailbox', mailbox, lane: 'result' },
    ],
  });
  let applicationTimerFired = false;
  await new Promise((resolve) => setTimeout(() => { applicationTimerFired = true; resolve(); }, 0));
  const first = await operation.status();
  assert.equal(first.status, 'pending');
  await assert.rejects(mailbox.reset(), (error) => error.code === 'MEMORY_MAILBOX_BUSY');
  await assert.rejects(mailbox.close(), (error) => error.code === 'MEMORY_MAILBOX_BUSY');
  mailbox.store('control', 41);
  assert.equal((await operation.wait()).status, 'completed');
  assert.equal(mailbox.load('result'), 42);
  observation = { firstPending: true, applicationTimerFired, published: 41, observed: 42, opaque: true };
  await operation.close();
  await mailbox.close();
  await fn.close();
  await module.close();
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);

console.log(JSON.stringify({
  consumer: 'native-publication-mailbox',
  ...observation,
  graceful: terminal.graceful,
  compilerResources: terminal.compiler.resources,
  driverResourceCounts: terminal.driver.resourceCounts,
}));
