import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT,
  DeviceJsError,
  translateDeviceLibrary,
  translateDeviceProgram,
} from '../testing.mjs';

const BASE = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';
const DENSE_TANH = `${BASE}+SPEC-0030-dense-numeric-v1+SPEC-0030-tanh-v1`;
const DENSE_ERF_TANH = `${BASE}+SPEC-0030-dense-numeric-v1+SPEC-0030-erf-v1+SPEC-0030-tanh-v1`;

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
    artifactSha256: 'b'.repeat(64),
    format: 'ptx',
    architecture: 'compute_75',
  };
}

function unaryProgram(kind, expression) {
  return translateDeviceProgram({
    source: `function k(out, x) { out[gpu.u32(0)] = ${expression}; }`,
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: `ptr<${kind}>` }, { name: 'x', type: kind }], returns: 'void' }],
  });
}

test('gpu.math.tanh lowers f32 and f64 through the accepted dense plus tanh child', () => {
  const f32 = unaryProgram('f32', 'gpu.math.tanh(x)');
  assert.equal(f32.contract, DENSE_TANH);
  assert.equal(f32.compile.headerProfile, 'cuda-numeric');
  assert.match(f32.generatedSource, /tanhf\(p1\)/u);
  assert.doesNotMatch(f32.generatedSource, /__tanhf|expf?\(|approx|gelu/iu);

  const f64 = unaryProgram('f64', 'gpu.math.tanh(x)');
  assert.equal(f64.contract, DENSE_TANH);
  assert.equal(f64.compile.headerProfile, 'cuda-numeric');
  assert.match(f64.generatedSource, /tanh\(p1\)/u);
  assert.doesNotMatch(f64.generatedSource, /tanhf\(p1\)|__tanhf|expf?\(/u);
});

test('gpu.math.tanh fails closed on wrong arity and unsupported scalar kinds', () => {
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.tanh(); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  }), deviceError('DEVICE_JS_HELPER_ARGUMENTS'));
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.tanh(x, x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  }), deviceError('DEVICE_JS_HELPER_ARGUMENTS'));

  for (const kind of ['u32', 'i32', 'f16', 'bf16']) {
    assert.throws(() => unaryProgram(kind, 'gpu.math.tanh(x)'), deviceError('DEVICE_JS_MATH_TYPE'), kind);
  }
  assert.throws(() => translateDeviceProgram({
    source: 'function bad(x) { gpu.math.tanh(x); return; } function k() { bad(gpu.bool(true)); }',
    functions: [
      { name: 'bad', kind: 'device', parameters: [{ name: 'x', type: 'bool' }], returns: 'void' },
      { name: 'k', kind: 'kernel', parameters: [], returns: 'void' },
    ],
  }), deviceError('DEVICE_JS_MATH_TYPE'));
});

test('gpu.math.tanh rejects contradictory header profiles before provider work', () => {
  const request = {
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.tanh(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  };
  for (const headerProfile of ['none', 'cuda-cccl']) {
    assert.throws(() => translateDeviceProgram({ ...request, compile: { headerProfile } }), deviceError('DEVICE_JS_NUMERIC_PROFILE_REQUIRED'), headerProfile);
  }
  assert.equal(translateDeviceProgram({ ...request, compile: { headerProfile: 'cuda-numeric' } }).compile.headerProfile, 'cuda-numeric');
  assert.equal(translateDeviceProgram({ ...request, compile: { headerProfile: 'cuda-device' } }).compile.headerProfile, 'cuda-device');
});

test('direct erf and tanh select the exact canonical dense plus erf plus tanh child', () => {
  const translated = unaryProgram('f32', 'gpu.math.tanh(gpu.math.erf(x))');
  assert.equal(translated.contract, DENSE_ERF_TANH);
  assert.equal(translated.compile.headerProfile, 'cuda-numeric');
  assert.match(translated.generatedSource, /tanhf\(erff\(p1\)\)/u);
  assert.doesNotMatch(translated.generatedSource, /__tanhf|expf?\(/u);
});

test('tanh device libraries propagate the exact dense plus tanh child through typed imports', () => {
  for (const kind of ['f32', 'f64']) {
    const library = translateDeviceLibrary({
      source: 'function squash(x) { return gpu.math.tanh(x); }',
      functions: [{ name: 'squash', kind: 'device', parameters: [{ name: 'x', type: kind }], returns: kind }],
      exports: ['squash'],
    });
    assert.equal(library.contract, DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT);
    assert.equal(library.compile.headerProfile, 'cuda-numeric');
    const program = translateDeviceProgram({
      source: 'function k(out, x) { out[gpu.u32(0)] = apply(x); }',
      functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: `ptr<${kind}>` }, { name: 'x', type: kind }], returns: 'void' }],
      imports: [imported(library)],
    });
    assert.equal(program.contract, DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT);
    assert.equal(program.compile.headerProfile, 'cuda-numeric');
  }
});

test('erf and tanh requirements compose identically across direct and imported library paths', () => {
  const erfLibrary = translateDeviceLibrary({
    source: 'function gaussian(x) { return gpu.math.erf(x); }',
    functions: [{ name: 'gaussian', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['gaussian'],
  });
  assert.equal(erfLibrary.contract, DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT);
  const tanhLibrary = translateDeviceLibrary({
    source: 'function squash(x) { return gpu.math.tanh(x); }',
    functions: [{ name: 'squash', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['squash'],
  });
  assert.equal(tanhLibrary.contract, DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT);

  const directErfImportedTanh = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = apply(gpu.math.erf(x)); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    imports: [imported(tanhLibrary)],
  });
  assert.equal(directErfImportedTanh.contract, DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT);

  const directTanhImportedErf = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = apply(gpu.math.tanh(x)); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
    imports: [imported(erfLibrary)],
  });
  assert.equal(directTanhImportedErf.contract, DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT);

  const combinedLibrary = translateDeviceLibrary({
    source: 'function both(x) { return gpu.math.tanh(gpu.math.erf(x)); }',
    functions: [{ name: 'both', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
    exports: ['both'],
  });
  assert.equal(combinedLibrary.contract, DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT);
});

test('unknown mutated tanh and combined library contracts fail before composition', () => {
  for (const source of [
    'function squash(x) { return gpu.math.tanh(x); }',
    'function squash(x) { return gpu.math.tanh(gpu.math.erf(x)); }',
  ]) {
    const library = translateDeviceLibrary({
      source,
      functions: [{ name: 'squash', kind: 'device', parameters: [{ name: 'x', type: 'f32' }], returns: 'f32' }],
      exports: ['squash'],
    });
    const mutated = { ...imported(library), libraryContract: `${library.contract}+forged` };
    assert.throws(() => translateDeviceProgram({
      source: 'function k(out, x) { out[gpu.u32(0)] = apply(x); }',
      functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
      imports: [mutated],
    }), deviceError('DEVICE_JS_IMPORT_INVALID'));
  }
});
