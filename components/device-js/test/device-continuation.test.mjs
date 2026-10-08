import assert from 'node:assert/strict';
import test from 'node:test';
import { translateDeviceProgram } from '../testing.mjs';

function request(source, kind = 'kernel') {
  return { source, functions: [{ name: 'step', kind, parameters: [{ name: 'state', type: 'ptr<u32>' }], returns: 'void' }] };
}

test('tail continuation is a closed kernel-only helper with explicit execution metadata', () => {
  const result = translateDeviceProgram(request('function step(state) { if (state[gpu.u32(0)] < gpu.u32(8)) { gpu.execution.tailSelf(); } }'));
  assert.equal(result.kernels[0].executionProfile, 'device-continuation-v1');
  assert.match(result.contract, /SPEC-0020-device-continuation-v1/);
  assert.match(result.generatedSource, /cudaGetCurrentGraphExec\(\)/);
  assert.match(result.generatedSource, /cudaGraphLaunch/);
  assert.equal(result.kernels[0].parameters.length, 1);
  assert.equal(result.compile.headerProfile, 'cuda-device');
  assert.equal(result.compile.relocatableDeviceCode, true);
});

test('tail continuation rejects parameters, multiple calls and loops before compiler dispatch', () => {
  for (const source of [
    'function step(state) { gpu.execution.tailSelf(gpu.u32(0)); }',
    'function step(state) { gpu.execution.tailSelf(); gpu.execution.tailSelf(); }',
    'function step(state) { while (state[gpu.u32(0)] < gpu.u32(8)) { gpu.execution.tailSelf(); } }',
  ]) assert.throws(() => translateDeviceProgram(request(source)), (error) => error.code.startsWith('DEVICE_JS_CONTINUATION_'));
});

test('tail continuation retains private warp lowering in the composed contract', () => {
  const result = translateDeviceProgram(request('function step(state) { state[gpu.u32(0)] = gpu.warp.ballot(gpu.u32(1), true); if (state[gpu.u32(0)] < gpu.u32(8)) { gpu.execution.tailSelf(); } }'));
  assert.match(result.contract, /SPEC-0022-warp32-v1\+SPEC-0020-device-continuation-v1$/);
  assert.match(result.generatedSource, /__ballot_sync/);
  assert.match(result.generatedSource, /djs_warp_ballot\(/);
});
