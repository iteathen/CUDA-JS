import assert from 'node:assert/strict';

import { compileDeviceLibrary, compileDeviceProgram } from 'cuda-js';
import { CUDA_JS_COMPATIBILITY } from 'cuda-js/compatibility';
import { discoverCudaDevicesForTesting, openCudaRuntimeForTesting } from 'cuda-js/testing';

assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsTanh, 'f32-f64-same-kind-dense-child-provider-bound-tanhf-tanh');
assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.deviceJsNumericChildOrder, ['SPEC-0030-erf-v1', 'SPEC-0030-tanh-v1']);

const snapshot = await discoverCudaDevicesForTesting([{ nativeDevice: 9, computeCapabilityMajor: 12, computeCapabilityMinor: 0 }]);
const runtime = await openCudaRuntimeForTesting({ device: snapshot.devices[0].selector, compiler: true });
try {
  const tanh = await compileDeviceProgram(runtime, {
    source: 'function squash(out, x) { out[gpu.u32(0)] = gpu.math.tanh(x); }',
    functions: [{ name: 'squash', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    compile: { architecture: 'compute_120' },
  });
  assert.match(tanh.deviceProgram.contract, /SPEC-0030-dense-numeric-v1\+SPEC-0030-tanh-v1$/u);
  assert.equal(tanh.compiler.headerProfile, 'cuda-numeric');

  const combined = await compileDeviceProgram(runtime, {
    source: 'function both(out, x) { out[gpu.u32(0)] = gpu.math.tanh(gpu.math.erf(x)); }',
    functions: [{ name: 'both', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    compile: { architecture: 'compute_120' },
  });
  assert.match(combined.deviceProgram.contract, /SPEC-0030-dense-numeric-v1\+SPEC-0030-erf-v1\+SPEC-0030-tanh-v1$/u);

  const tanhLibrary = await compileDeviceLibrary(runtime, {
    source: 'function squash(x) { return gpu.math.tanh(x); }',
    functions: [{ name: 'squash', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['squash'],
    compile: { architecture: 'compute_120' },
  });
  assert.match(tanhLibrary.library.contract, /SPEC-0030-dense-numeric-v1\+SPEC-0030-tanh-v1\+SPEC-0028-device-library-v1$/u);

  const composed = await compileDeviceProgram(runtime, {
    source: 'function use(out, x) { out[gpu.u32(0)] = squash(gpu.math.erf(x)); }',
    functions: [{ name: 'use', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    imports: [{ library: tanhLibrary.library, name: 'squash', as: 'squash' }],
    compile: { architecture: 'compute_120' },
  });
  assert.match(composed.deviceProgram.contract, /SPEC-0030-dense-numeric-v1\+SPEC-0030-erf-v1\+SPEC-0030-tanh-v1\+SPEC-0028-device-library-v1$/u);
  assert.equal(composed.linker.artifact.format, 'cubin');

  console.log(JSON.stringify({
    consumer: 'portable-tanh',
    publicOnly: true,
    tanh: tanh.deviceProgram.sha256,
    erfTanh: combined.deviceProgram.sha256,
    tanhLibrary: tanhLibrary.library.sha256,
    composedErfTanh: composed.deviceProgram.sha256,
    graceful: (await runtime.close()).graceful,
  }));
} catch (error) {
  await runtime.close();
  throw error;
}
