import assert from 'node:assert/strict';
import { inspectDeviceViewRelation as relation, CUDA_JS_COMPATIBILITY } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

// Independent example policies: an out-of-place transform rejects overlap;
// a buffer reuse planner requires exactly the same bytes. Neither policy lives in CUDA-JS.
const admitsTransform = (input, output) => relation(input, output) === 'disjoint';
const canReuseBuffer = (oldView, nextView) => relation(oldView, nextView) === 'same-range';
const runtime = await openCudaRuntimeForTesting();
try {
  const memory = await runtime.allocateDevice({ byteLength: 32 });
  const a = await memory.view({ dtype: 'u32', elementCount: 4 });
  const same = await memory.view({ dtype: 'f32', elementCount: 4 });
  const overlap = await memory.view({ dtype: 'u32', elementCount: 4, byteOffset: 8 });
  const disjoint = await memory.view({ dtype: 'u32', elementCount: 4, byteOffset: 16 });
  assert.equal(admitsTransform(a, overlap), false);
  assert.equal(admitsTransform(a, disjoint), true);
  assert.equal(canReuseBuffer(a, same), true);
  assert.equal(canReuseBuffer(a, overlap), false);
  assert.deepEqual(Object.keys(a), []);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceViewRelation, 'pure-same-runtime-byte-range-relation-v1');
} finally {
  assert.equal((await runtime.close()).graceful, true);
}
console.log(JSON.stringify({ consumer: 'portable-view-relation', publicOnly: true, independentPolicies: 2, graceful: true }));
