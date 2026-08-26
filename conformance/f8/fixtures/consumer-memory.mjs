import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY, inspectCudaHost } from 'cuda-js';
import { discoverCudaDevicesForTesting, openCudaRuntimeForTesting } from 'cuda-js/testing';

const ptx = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
assert.equal(CUDA_JS_COMPATIBILITY.publicApi.schemaVersion, 1);
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16', 'publication-mailbox-host-to-device-u32', 'publication-mailbox-device-to-host-u32']);
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.typedDeviceViews, 'allocation-owned-contiguous-1d-opaque-capability-explicit-launch-access');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.boundedMultiOperationScheduling, 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.asyncTransfers, 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.publicationMailboxes, 'private-mapped-named-u32-one-operation-lease-system-acquire-release');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDags, 'bounded-kernel-dag-immutable-bindings-single-stream-semantic-replay');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.cublasLtF32Matmul, 'optional-row-major-contiguous-typed-views-explicit-bounded-workspace');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceSelection, 'finite-sanitized-snapshot-opaque-process-local-selector-one-device-per-runtime-selected-targets');
assert.equal(inspectCudaHost().compatibility, CUDA_JS_COMPATIBILITY);

const deviceSnapshot = await discoverCudaDevicesForTesting([
  { nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 },
  { nativeDevice: 3, computeCapabilityMajor: 8, computeCapabilityMinor: 9 },
]);
const selectedRuntime = await openCudaRuntimeForTesting({ device: deviceSnapshot.devices[1].selector, compiler: true });
const selectedDescription = await selectedRuntime.describe();
assert.equal(selectedDescription.device.architecture.class, 'cc-8.9');
assert.equal(selectedDescription.device.target.compile, 'compute_89');
assert.equal((await selectedRuntime.compile({ source: 'extern "C" __global__ void selected() {}\n' })).artifact.architecture, 'compute_89');
assert.equal(JSON.stringify(selectedDescription).includes('ordinal'), false);
assert.equal((await selectedRuntime.close()).graceful, true);

const first = await openCudaRuntimeForTesting();
const second = await openCudaRuntimeForTesting();
const transferRuntime = await openCudaRuntimeForTesting({ driver: { memory: { maxDeviceBytes: 16, maxAllocationBytes: 8, maxTransferBytes: 8 }, execution: { maxPendingGpuOperations: 2 } } });
const module = await first.loadModule({ format: 'ptx', bytes: ptx });
const fn = await module.getFunction({ name: 'portable_copy_consumer', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
const scalarFn = await module.getFunction({
  name: 'portable_scalar_consumer',
  parameters: [{ kind: 'u64' }, { kind: 'i32' }, { kind: 'f32' }, { kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }],
});
const mailboxFn = await module.getFunction({
  name: 'portable_mailbox_consumer',
  parameters: [{ kind: 'publication-mailbox-host-to-device-u32' }, { kind: 'publication-mailbox-device-to-host-u32' }],
});
const mailbox = await first.createPublicationMailbox({ lanes: [
  { name: 'control', direction: 'host-to-device' },
  { name: 'observation', direction: 'device-to-host' },
] });
assert.equal(JSON.stringify(mailbox), '{}');
mailbox.store('control', 41);
assert.equal(mailbox.load('observation'), 0);
const mailboxOperation = await mailboxFn.submit({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 },
  arguments: [
    { kind: 'publication-mailbox', mailbox, lane: 'control' },
    { kind: 'publication-mailbox', mailbox, lane: 'observation' },
  ],
});
await assert.rejects(mailbox.reset(), { code: 'MEMORY_MAILBOX_BUSY' });
assert.equal((await mailboxOperation.wait()).status, 'completed');
assert.equal((await mailbox.reset()).generation, 2);
await mailboxOperation.close();
await mailbox.close();
await mailboxFn.close();
const firstMemory = await first.allocateDevice({ byteLength: 8 });
const secondMemory = await second.allocateDevice({ byteLength: 8 });
const firstView = await firstMemory.view({ dtype: 'u32', elementCount: 2 });
assert.equal(firstView.kind, 'device-view');
assert.equal(firstView.byteLength, 8);
await firstMemory.write(Uint8Array.of(1, 3, 5, 7));
assert.deepEqual([...(await firstMemory.read({ byteLength: 4 })).bytes], [1, 3, 5, 7]);
await assert.rejects(fn.launch({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [secondMemory, 4],
}), { code: 'CUDA_JS_RESOURCE_OWNER' });
const completion = await fn.launch({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [firstMemory, 4],
});
assert.equal(completion.status, 'completed');
const viewCompletion = await fn.launch({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [firstView, 4],
  accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 8, mode: 'read-write' }],
});
assert.equal(viewCompletion.status, 'completed');
const operation = await fn.submit({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [firstMemory, 4],
});
assert.equal(operation.kind, 'operation');
assert.equal(operation.state, 'pending');
assert.equal((await operation.status()).status, 'pending');
assert.equal((await operation.wait()).status, 'completed');
assert.equal((await operation.close()).state, 'closed');
const preparedDag = await first.prepareOperationDag([{
  id: 'step',
  function: fn,
  grid: { x: 1, y: 1, z: 1 },
  block: { x: 1, y: 1, z: 1 },
  arguments: [{ binding: 'data' }, 4],
  accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 8, mode: 'read-write' }],
}]);
assert.equal(JSON.stringify(preparedDag), '{}');
const preparedOperation = await preparedDag.submit({ data: firstView });
const preparedTerminal = await preparedOperation.wait();
assert.equal(preparedTerminal.kind, 'prepared-batch');
assert.equal(preparedTerminal.preparedSha256, preparedDag.sha256);
await preparedOperation.close();
await preparedDag.close();
const scalarCompletion = await scalarFn.launch({
  grid: { x: 1, y: 1, z: 1 },
  block: { x: 1, y: 1, z: 1 },
  arguments: [0xffff_ffff_ffff_ffffn, -2, 1.5, Number.NaN, Infinity, -Infinity],
});
assert.equal(scalarCompletion.status, 'completed');
assert.deepEqual(scalarCompletion.argumentKinds, ['u64', 'i32', 'f32', 'f64', 'f16', 'bf16']);
await assert.rejects(scalarFn.launch({
  grid: { x: 1, y: 1, z: 1 },
  block: { x: 1, y: 1, z: 1 },
  arguments: [0n, 0, Infinity, 0, 0, 0],
}), { code: 'DRIVER_LAUNCH_OPTIONS' });
await scalarFn.close();
await fn.close();
await module.close();
await firstView.close();
await firstMemory.close();
assert.equal((await first.close()).graceful, true);
await secondMemory.write(Uint8Array.of(9));
assert.deepEqual([...(await secondMemory.read({ byteLength: 1 })).bytes], [9]);
assert.equal((await second.close()).graceful, true);
const transferSource = await transferRuntime.allocateDevice({ byteLength: 8 });
const transferDestination = await transferRuntime.allocateDevice({ byteLength: 8 });
const transferInput = Uint8Array.of(2, 4, 6, 8);
const upload = await transferSource.writeAsync(transferInput);
transferInput.fill(0);
const deviceCopy = await transferDestination.copyFromAsync(transferSource, { byteLength: 4, after: upload });
await upload.wait();
const download = await transferDestination.readAsync({ byteLength: 4, after: deviceCopy });
assert.deepEqual([...(await download.wait()).result.bytes], [2, 4, 6, 8]);
await deviceCopy.wait();
await download.close();
await deviceCopy.close();
await upload.close();
await transferDestination.close();
await transferSource.close();
assert.equal((await transferRuntime.close()).graceful, true);

const libraryRuntime = await openCudaRuntimeForTesting();
const matrixValues = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [0, 0, 0, 0], [0, 0, 0, 0]];
const matrices = [];
for (let index = 0; index < matrixValues.length; index += 1) {
  const memory = await libraryRuntime.allocateDevice({ byteLength: matrixValues[index].length * 4 });
  await memory.write(new Uint8Array(new Float32Array(matrixValues[index]).buffer));
  const view = await memory.view({ dtype: 'f32', elementCount: matrixValues[index].length, access: index < 3 ? 'read' : 'write' });
  matrices.push({ memory, view });
}
const cublasLt = await libraryRuntime.openCublasLt();
const matmulPlan = await cublasLt.createF32MatmulPlan({ m: 2, n: 2, k: 3 });
const matmul = await matmulPlan.submit({ a: matrices[0].view, b: matrices[1].view, c: matrices[2].view, d: matrices[3].view });
assert.equal((await matmul.wait()).kind, 'cublaslt-f32-matmul');
const matmulOutput = (await matrices[3].memory.read({ byteLength: 16 })).bytes;
assert.deepEqual([...new Float32Array(matmulOutput.buffer, matmulOutput.byteOffset, 4)], [58, 64, 139, 154]);
await matmul.close(); await matmulPlan.close(); await cublasLt.close();
for (const matrix of matrices) { await matrix.view.close(); await matrix.memory.close(); }
assert.equal((await libraryRuntime.close()).graceful, true);

console.log(JSON.stringify({
  consumer: 'portable-memory',
  packageVersion: CUDA_JS_COMPATIBILITY.package.version,
  crossRuntimeRejected: true,
  completion: completion.status,
  scalarKinds: scalarCompletion.argumentKinds,
  operationLifecycle: true,
  asyncTransferLifecycle: true,
  publicationMailboxLifecycle: true,
  preparedOperationDagLifecycle: true,
  cublasLtLifecycle: true,
  deviceSelectionLifecycle: true,
  typedViewLifecycle: true,
  graceful: true,
}));
