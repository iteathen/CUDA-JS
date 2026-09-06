import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT,
  DEVICE_JS_ERF_LIBRARY_CONTRACT,
  DeviceJsError,
  translateDeviceLibrary,
  translateDeviceProgram,
} from '../testing.mjs';

const BASE = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';
const ERF = `${BASE}+SPEC-0030-erf-v1`;
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

test('gpu.math.erf lowers f32 directly with its additive compatibility child only', () => {
  const translated = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.erf(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  });
  assert.equal(translated.contract, ERF);
  assert.equal(translated.compile.headerProfile, 'none');
  assert.match(translated.generatedSource, /erff\(p1\)/u);
  assert.doesNotMatch(translated.generatedSource, /tanh|gelu|approx/iu);
});

test('gpu.math.erf composes with dense f64 without weakening dense header requirements', () => {
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
});

test('erf device libraries propagate exact child identity through typed imports', () => {
  const f32Library = translateDeviceLibrary({
    source: 'function gaussian(x) { return gpu.math.erf(x); }',
    functions: [{ name: 'gaussian', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['gaussian'],
  });
  assert.equal(f32Library.contract, DEVICE_JS_ERF_LIBRARY_CONTRACT);
  const f32Program = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = apply(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    imports: [imported(f32Library)],
  });
  assert.equal(f32Program.contract, DEVICE_JS_ERF_LIBRARY_CONTRACT);

  const f64Library = translateDeviceLibrary({
    source: 'function gaussian(x) { return gpu.math.erf(x); }',
    functions: [{ name: 'gaussian', kind: 'device', parameters: [{ name: 'x', type: 'f64' }], returns: 'f64' }],
    exports: ['gaussian'],
  });
  assert.equal(f64Library.contract, DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT);
  assert.equal(f64Library.compile.headerProfile, 'cuda-numeric');
});

test('erf library child identity cannot be relabeled as a legacy library contract', () => {
  const library = translateDeviceLibrary({
    source: 'function gaussian(x) { return gpu.math.erf(x); }',
    functions: [{ name: 'gaussian', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['gaussian'],
  });
  const forged = { ...imported(library), libraryContract: 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1+SPEC-0028-device-library-v1' };
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = apply(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    imports: [forged],
  }), deviceError('DEVICE_JS_IMPORT_INVALID'));
});
