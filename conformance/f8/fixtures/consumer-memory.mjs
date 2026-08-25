import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY, inspectCudaHost } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

const ptx = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
assert.equal(CUDA_JS_COMPATIBILITY.publicApi.schemaVersion, 1);
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16']);
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.typedDeviceViews, 'contiguous-1d-component-foundation-no-public-facade-yet');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.boundedMultiOperationScheduling, 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue');
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.asyncTransfers, 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d');
assert.equal(inspectCudaHost().compatibility, CUDA_JS_COMPATIBILITY);

const first = await openCudaRuntimeForTesting();
const second = await openCudaRuntimeForTesting();
const transferRuntime = await openCudaRuntimeForTesting({ driver: { memory: { maxDeviceBytes: 16, maxAllocationBytes: 8, maxTransferBytes: 8 }, execution: { maxPendingGpuOperations: 2 } } });
const module = await first.loadModule({ format: 'ptx', bytes: ptx });
const fn = await module.getFunction({ name: 'portable_copy_consumer', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
const scalarFn = await module.getFunction({
  name: 'portable_scalar_consumer',
  parameters: [{ kind: 'u64' }, { kind: 'i32' }, { kind: 'f32' }, { kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }],
});
const firstMemory = await first.allocateDevice({ byteLength: 8 });
const secondMemory = await second.allocateDevice({ byteLength: 8 });
await firstMemory.write(Uint8Array.of(1, 3, 5, 7));
assert.deepEqual([...(await firstMemory.read({ byteLength: 4 })).bytes], [1, 3, 5, 7]);
await assert.rejects(fn.launch({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [secondMemory, 4],
}), { code: 'CUDA_JS_RESOURCE_OWNER' });
const completion = await fn.launch({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [firstMemory, 4],
});
assert.equal(completion.status, 'completed');
const operation = await fn.submit({
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [firstMemory, 4],
});
assert.equal(operation.kind, 'operation');
assert.equal(operation.state, 'pending');
assert.equal((await operation.status()).status, 'pending');
assert.equal((await operation.wait()).status, 'completed');
assert.equal((await operation.close()).state, 'closed');
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

console.log(JSON.stringify({
  consumer: 'portable-memory',
  packageVersion: CUDA_JS_COMPATIBILITY.package.version,
  crossRuntimeRejected: true,
  completion: completion.status,
  scalarKinds: scalarCompletion.argumentKinds,
  operationLifecycle: true,
  asyncTransferLifecycle: true,
  graceful: true,
}));
