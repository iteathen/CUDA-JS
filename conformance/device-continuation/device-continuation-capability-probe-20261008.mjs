// Read-only public capability falsifier; no CUDA context, compiler or kernel launch.
import assert from 'node:assert/strict';
import { CUDA_JS_COMPATIBILITY, inspectDeviceProgram } from 'cuda-js';

const schema = [{
  name: 'step', kind: 'kernel', returns: 'void',
  parameters: [{ name: 'state', type: 'ptr<u32>' }],
}];
const finite = inspectDeviceProgram({
  source: 'function step(state) { let i = gpu.u32(0); while (i < gpu.u32(8)) { i = i + gpu.u32(1); } state[gpu.u32(0)] = i; }',
  functions: schema,
});
assert.equal(finite.deviceProgram.functions[0].name, 'step');

const rejected = [];
const continuation = inspectDeviceProgram({ source: 'function step(state) { gpu.execution.tailSelf(); }', functions: schema });
assert.equal(continuation.deviceProgram.kernels[0].executionProfile, 'device-continuation-v1');
for (const helper of ['gpu.graph.tailSelf', 'gpu.graph.current']) {
  try {
    inspectDeviceProgram({ source: `function step(state) { ${helper}(); }`, functions: schema });
    assert.fail(`Unexpected admission of ${helper}`);
  } catch (error) {
    assert.match(error.code ?? '', /^DEVICE_JS_(HELPER|CALL)_UNKNOWN$/);
    rejected.push({ helper, code: error.code });
  }
}
console.log(JSON.stringify({
  node: process.version,
  package: CUDA_JS_COMPATIBILITY.package,
  existingFiniteDeviceLoop: 'admitted',
  continuation: 'admitted-through-closed-candidate-profile',
  candidateContinuationHelpers: rejected,
  nativeMutation: false,
  claim: 'The candidate frontend admits only its closed self-tail helper, with no raw graph retrieval.',
}, null, 2));
