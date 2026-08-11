import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY, inspectCudaHost } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

const ptx = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
assert.equal(CUDA_JS_COMPATIBILITY.publicApi.schemaVersion, 1);
assert.equal(inspectCudaHost().compatibility, CUDA_JS_COMPATIBILITY);

const first = await openCudaRuntimeForTesting();
const second = await openCudaRuntimeForTesting();
const module = await first.loadModule({ format: 'ptx', bytes: ptx });
const fn = await module.getFunction({ name: 'portable_copy_consumer', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
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
await fn.close();
await module.close();
await firstMemory.close();
assert.equal((await first.close()).graceful, true);
await secondMemory.write(Uint8Array.of(9));
assert.deepEqual([...(await secondMemory.read({ byteLength: 1 })).bytes], [9]);
assert.equal((await second.close()).graceful, true);

console.log(JSON.stringify({ consumer: 'portable-memory', packageVersion: CUDA_JS_COMPATIBILITY.package.version, crossRuntimeRejected: true, completion: completion.status, graceful: true }));
