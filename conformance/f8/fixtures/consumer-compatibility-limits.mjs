import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY } from 'cuda-js/compatibility';

assert.equal(CUDA_JS_COMPATIBILITY.package.version, '0.1.0-alpha.18');
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits, {
  nodes: 32,
  edges: 64,
  bindings: 64,
  predecessorsPerNode: 8,
});
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits, { parametersPerFunction: 64 });

const minimumBaseAlignment = CUDA_JS_COMPATIBILITY.capabilities.deviceMemoryAllocationMinimumAlignmentBytes;
assert.equal(minimumBaseAlignment, 256);

function admitsBaseAlignment(requiredAlignment) {
  return Number.isSafeInteger(requiredAlignment)
    && requiredAlignment > 0
    && Number.isInteger(Math.log2(requiredAlignment))
    && requiredAlignment <= minimumBaseAlignment;
}

const baseAlignmentAdmission = Object.freeze({
  '8': admitsBaseAlignment(8),
  '256': admitsBaseAlignment(256),
  '512': admitsBaseAlignment(512),
});
assert.deepEqual(baseAlignmentAdmission, { '8': true, '256': true, '512': false });
assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits), true);
assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits), true);

console.log(JSON.stringify({
  consumer: 'portable-compatibility-limits',
  packageVersion: CUDA_JS_COMPATIBILITY.package.version,
  deviceMemoryAllocationMinimumAlignmentBytes: minimumBaseAlignment,
  baseAlignmentAdmission,
  preparedOperationDagLimits: CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits,
  deviceJsLimits: CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits,
  frozen: true,
}));
