import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY } from 'cuda-js/compatibility';

assert.equal(CUDA_JS_COMPATIBILITY.package.version, '0.1.0-alpha.17');
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits, {
  nodes: 32,
  edges: 64,
  bindings: 64,
  predecessorsPerNode: 8,
});
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits, { parametersPerFunction: 64 });
assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits), true);
assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits), true);

console.log(JSON.stringify({
  consumer: 'portable-compatibility-limits',
  packageVersion: CUDA_JS_COMPATIBILITY.package.version,
  preparedOperationDagLimits: CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits,
  deviceJsLimits: CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits,
  frozen: true,
}));
