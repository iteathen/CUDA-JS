import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT,
  DeviceJsError,
  translateDeviceLibrary,
  translateDeviceProgram,
} from '../testing.mjs';

const BASE = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';
const DENSE_ERF = `${BASE}+SPEC-0030-dense-numeric-v1+SPEC-0030-erf-v1`;

function deviceError(code) {
  return (error) => error instanceof DeviceJsError && error.code === code;
}

function imported(library, alias = 'apply') {
  const exported = library.exports[0];
  return {
    name: alias,
    symbol: exported.symbol,
    parameters: exported.parameters,
    returns: exported.returns,
    librarySha256: library.sha256,
    libraryContract: library.contract,
    exportName: exported.name,
    artifactSha256: 'a'.repeat(64),
    format: 'ptx',
    architecture: 'compute_75',
  };
}

test('gpu.math.erf lowers f32 through the accepted dense plus erf child', () => {
  const translated = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  });
  assert.equal(translated.contract, DENSE_ERF);
  assert.equal(translated.compile.headerProfile, 'cuda-numeric');
  assert.match(translated.generatedSource, /erff\(p1\)/u);
  assert.doesNotMatch(translated.generatedSource, /tanh|gelu|approx/iu);
});

test('gpu.math.erf lowers f64 through the same exact dense plus erf child', () => {
  const translated = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f64>' }, { name: 'x', type: 'f64' }], returns: 'void' }],
  });
  assert.equal(translated.contract, DENSE_ERF);
  assert.equal(translated.compile.headerProfile, 'cuda-numeric');
  assert.match(translated.generatedSource, /erf\(p1\)/u);
  assert.doesNotMatch(translated.generatedSource, /erff\(p1\)/u);
});

test('gpu.math.erf fails closed on wrong arity and unsupported scalar kinds', () => {
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  }), deviceError('DEVICE_JS_HELPER_ARGUMENTS'));
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(x, x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  }), deviceError('DEVICE_JS_HELPER_ARGUMENTS'));
  for (const kind of ['u32', 'i32', 'f16', 'bf16']) {
    assert.throws(() => translateDeviceProgram({
      source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(x); }',
      functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: `ptr<${kind}>` }, { name: 'x', type: kind }], returns: 'void' }],
    }), deviceError('DEVICE_JS_MATH_TYPE'), kind);
  }
  assert.throws(() => translateDeviceProgram({
    source: 'function bad(x) { gpu.math.erf(x); return; } function k() { bad(gpu.bool(true)); }',
    functions: [
      { name: 'bad', kind: 'device', parameters: [{ name: 'x', type: 'bool' }], returns: 'void' },
      { name: 'k', kind: 'kernel', parameters: [], returns: 'void' },
    ],
  }), deviceError('DEVICE_JS_MATH_TYPE'));
});

test('gpu.math.erf rejects contradictory header profiles before provider work', () => {
  const request = {
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  };
  for (const headerProfile of ['none', 'cuda-cccl']) {
    assert.throws(() => translateDeviceProgram({ ...request, compile: { headerProfile } }), deviceError('DEVICE_JS_NUMERIC_PROFILE_REQUIRED'), headerProfile);
  }
  assert.equal(translateDeviceProgram({ ...request, compile: { headerProfile: 'cuda-numeric' } }).compile.headerProfile, 'cuda-numeric');
  assert.equal(translateDeviceProgram({ ...request, compile: { headerProfile: 'cuda-device' } }).compile.headerProfile, 'cuda-device');
});

test('erf device libraries propagate the exact dense plus erf child through typed imports', () => {
  for (const kind of ['f32', 'f64']) {
    const library = translateDeviceLibrary({
      source: 'function gaussian(x) { return gpu.math.erf(x); }',
      functions: [{ name: 'gaussian', kind: 'device', parameters: [{ name: 'x', type: kind }], returns: kind }],
      exports: ['gaussian'],
    });
    assert.equal(library.contract, DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT);
    assert.equal(library.compile.headerProfile, 'cuda-numeric');
    const program = translateDeviceProgram({
      source: 'function k(out, x) { out[gpu.u32(0)] = apply(x); }',
      functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: `ptr<${kind}>` }, { name: 'x', type: kind }], returns: 'void' }],
      imports: [imported(library)],
    });
    assert.equal(program.contract, DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT);
    assert.equal(program.compile.headerProfile, 'cuda-numeric');
  }
});

test('unknown mutated erf library contract fails before composition', () => {
  const library = translateDeviceLibrary({
    source: 'function gaussian(x) { return gpu.math.erf(x); }',
    functions: [{ name: 'gaussian', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['gaussian'],
  });
  const mutated = { ...imported(library), libraryContract: `${library.contract}+forged` };
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = apply(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    imports: [mutated],
  }), deviceError('DEVICE_JS_IMPORT_INVALID'));
});
