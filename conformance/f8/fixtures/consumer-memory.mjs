import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY, inspectCudaHost } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

const ptx = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
assert.equal(CUDA_JS_COMPATIBILITY.publicApi.schemaVersion, 1);
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32']);
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
assert.equal(inspectCudaHost().compatibility, CUDA_JS_COMPATIBILITY);

const first = await openCudaRuntimeForTesting();
const second = await openCudaRuntimeForTesting();
const module = await first.loadModule({ format: 'ptx', bytes: ptx });
const fn = await module.getFunction({ name: 'portable_copy_consumer', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
const scalarFn = await module.getFunction({ name: 'portable_scalar_consumer', parameters: [{ kind: 'u64' }, { kind: 'i32' }, { kind: 'f32' }] });
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
  grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [0xffff_ffff_ffff_ffffn, -2, 1.5],
});
assert.equal(scalarCompletion.status, 'completed');
assert.deepEqual(scalarCompletion.argumentKinds, ['u64', 'i32', 'f32']);
await scalarFn.close();
await fn.close();
await module.close();
await firstMemory.close();
assert.equal((await first.close()).graceful, true);
await secondMemory.write(Uint8Array.of(9));
assert.deepEqual([...(await secondMemory.read({ byteLength: 1 })).bytes], [9]);
assert.equal((await second.close()).graceful, true);

console.log(JSON.stringify({ consumer: 'portable-memory', packageVersion: CUDA_JS_COMPATIBILITY.package.version, crossRuntimeRejected: true, completion: completion.status, scalarKinds: scalarCompletion.argumentKinds, operationLifecycle: true, graceful: true }));
