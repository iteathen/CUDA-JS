import assert from 'node:assert/strict';
import test from 'node:test';

import { DeviceJsError, translateDeviceProgram } from '../testing.mjs';

const functions = [
  {
    name: 'rotate',
    kind: 'device',
    parameters: [{ name: 'x', type: 'u32' }],
    returns: 'u32',
  },
  {
    name: 'searchKernel',
    kind: 'kernel',
    parameters: [
      { name: 'out', type: 'ptr<u32>' },
      { name: 'input', type: 'ptr<u32>' },
      { name: 'flags', type: 'ptr<u32>' },
      { name: 'n', type: 'u32' },
      { name: 'scale', type: 'f32' },
      { name: 'wide', type: 'u64' },
      { name: 'bias', type: 'i32' },
    ],
    returns: 'void',
  },
];

const source = `
function rotate(x) {
  let one = gpu.u32(1);
  return (x << one) | (x >> one);
}

function searchKernel(out, input, flags, n, scale, wide, bias) {
  let i = gpu.thread.globalX();
  let zero = gpu.u32(0);
  let one = gpu.u32(1);
  let step = gpu.u32(0);
  gpu.barrier.block();
  if (i >= n) {
    return;
  }
  let x = input[i];
  while (step < gpu.u32(3)) {
    x ^= rotate(step + one);
    step++;
  }
  let f = gpu.math.sqrt(scale);
  f = gpu.math.max(f, gpu.f32(0.5));
  out[i] = x;
  gpu.atomic.add(out, i, one);
  gpu.atomic.cas(flags, i, zero, one);
  gpu.fence.device();
}
`;

function expectDeviceCode(code) {
  return (error) => error instanceof DeviceJsError && error.code === code;
}

test('Device-JS translates structured control flow, pointer access, helpers and mixed scalar ABI deterministically', () => {
  const first = translateDeviceProgram({ source, functions });
  const second = translateDeviceProgram({ source, functions });

  assert.equal(first.contract, 'SPEC-0013-v1');
  assert.equal(first.sha256, second.sha256);
  assert.equal(first.generatedSource, second.generatedSource);
  assert.equal(first.parser.name, 'acorn');
  assert.match(first.parser.version, /^8\./);
  assert.equal(first.kernels.length, 1);
  assert.equal(first.kernels[0].name, 'searchKernel');
  assert.equal(first.kernels[0].functionName, 'djs_kernel_0');
  assert.deepEqual(first.kernels[0].parameters, [
    { kind: 'device-memory' },
    { kind: 'device-memory' },
    { kind: 'device-memory' },
    { kind: 'u32' },
    { kind: 'f32' },
    { kind: 'u64' },
    { kind: 'i32' },
  ]);

  assert.match(first.generatedSource, /__device__ unsigned int djs_device_0\(unsigned int p0\);/);
  assert.match(first.generatedSource, /extern "C" __global__ void djs_kernel_0\(unsigned int\* p0, unsigned int\* p1, unsigned int\* p2, unsigned int p3, float p4, unsigned long long p5, int p6\)/);
  assert.match(first.generatedSource, /static_cast<unsigned int>\(\(\(blockIdx\.x \* blockDim\.x\) \+ threadIdx\.x\)\)/);
  assert.match(first.generatedSource, /while \(/);
  assert.match(first.generatedSource, /atomicAdd\(/);
  assert.match(first.generatedSource, /atomicCAS\(/);
  assert.match(first.generatedSource, /__syncthreads\(\)/);
  assert.match(first.generatedSource, /__threadfence\(\)/);
  assert.match(first.generatedSource, /sqrtf\(/);
  assert.match(first.generatedSource, /fmaxf\(/);
  assert.doesNotMatch(first.generatedSource, /searchKernel/);
  assert.doesNotMatch(first.generatedSource, /rotate\(/);
});

test('program identity changes with semantic source, type metadata and compile inputs', () => {
  const baseline = translateDeviceProgram({ source, functions });
  const sourceChange = translateDeviceProgram({ source: `${source}\n`, functions });
  const typeChange = translateDeviceProgram({
    source,
    functions: functions.map((fn) => fn.name === 'searchKernel'
      ? { ...fn, parameters: fn.parameters.map((parameter) => parameter.name === 'bias' ? { ...parameter, type: 'u32' } : parameter) }
      : fn),
  });
  const compileChange = translateDeviceProgram({ source, functions, compile: { architecture: 'compute_80' } });

  assert.notEqual(sourceChange.sha256, baseline.sha256);
  assert.notEqual(typeChange.sha256, baseline.sha256);
  assert.notEqual(compileChange.sha256, baseline.sha256);
  assert.match(baseline.generatedName, /^device-js-[a-f0-9]{16}\.cu$/);
});

test('Device-JS uses canonical CUDA target policy and preserves validation ownership', () => {
  const accepted = translateDeviceProgram({ source, functions, compile: { architecture: 'compute_120' } });
  assert.equal(accepted.compile.architecture, 'compute_120');
  for (const [architecture, reason] of [
    ['compute_120f', 'policy'], ['compute_120a', 'policy'], ['compute_1000', 'policy'], ['sm_120', 'prefix'], ['compute_7', 'syntax'],
  ]) {
    assert.throws(
      () => translateDeviceProgram({ source, functions, compile: { architecture } }),
      (error) => error instanceof DeviceJsError
        && error.code === 'DEVICE_JS_COMPILE_OPTIONS_INVALID'
        && error.category === 'validation'
        && error.details.reason === reason,
      architecture,
    );
  }
});

test('numeric literals require explicit scalar constructors and are range checked', () => {
  const metadata = [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }];
  assert.throws(() => translateDeviceProgram({ source: 'function k(out) { let x = 1; out[gpu.u32(0)] = x; }', functions: metadata }), expectDeviceCode('DEVICE_JS_LITERAL_REQUIRES_CAST'));
  assert.throws(() => translateDeviceProgram({ source: 'function k(out) { let x = gpu.u32(-1); }', functions: metadata }), expectDeviceCode('DEVICE_JS_LITERAL_RANGE'));
  assert.throws(() => translateDeviceProgram({ source: 'function k(out) { let x = gpu.u64(18446744073709551616n); }', functions: metadata }), expectDeviceCode('DEVICE_JS_LITERAL_RANGE'));
  assert.throws(() => translateDeviceProgram({ source: 'function k(out) { let x = gpu.f32(1e400); }', functions: metadata }), expectDeviceCode('DEVICE_JS_LITERAL_RANGE'));
});

test('ordinary JS coercion and unsupported language forms fail closed', () => {
  const metadata = [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }];
  const rejected = [
    'function k(out) { let x = {}; }',
    'function k(out) { let x = []; }',
    'function k(out) { switch (gpu.u32(1)) { default: return; } }',
    'function k(out) { try { return; } catch (e) { return; } }',
    'function k(out) { let f = () => gpu.u32(1); }',
    'function k(out) { let s = "1"; }',
    'function k(out) { out.x = gpu.u32(1); }',
    'function k(out) { for (const x of out) { return; } }',
  ];
  for (const candidate of rejected) assert.throws(() => translateDeviceProgram({ source: candidate, functions: metadata }), DeviceJsError);
});

test('metadata mismatch and static type mismatch fail before CUDA generation', () => {
  assert.throws(() => translateDeviceProgram({
    source: 'function k(x) { return; }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'y', type: 'u32' }], returns: 'void' }],
  }), expectDeviceCode('DEVICE_JS_FUNCTION_METADATA_MISMATCH'));

  assert.throws(() => translateDeviceProgram({
    source: 'function k(out) { let x = gpu.u32(1); x = gpu.f32(1.0); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  }), expectDeviceCode('DEVICE_JS_TYPE_MISMATCH'));
});

test('direct and indirect device recursion fail deterministically', () => {
  assert.throws(() => translateDeviceProgram({
    source: 'function f(x) { return f(x); } function k(out) { out[gpu.u32(0)] = f(gpu.u32(1)); }',
    functions: [
      { name: 'f', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
      { name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' },
    ],
  }), expectDeviceCode('DEVICE_JS_RECURSION_FORBIDDEN'));

  assert.throws(() => translateDeviceProgram({
    source: 'function a(x) { return b(x); } function b(x) { return a(x); } function k(out) { out[gpu.u32(0)] = a(gpu.u32(1)); }',
    functions: [
      { name: 'a', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
      { name: 'b', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
      { name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' },
    ],
  }), expectDeviceCode('DEVICE_JS_RECURSION_FORBIDDEN'));
});

test('unknown helpers and kernel calls from device code fail closed', () => {
  assert.throws(() => translateDeviceProgram({
    source: 'function k(out) { gpu.magic(); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  }), expectDeviceCode('DEVICE_JS_HELPER_UNKNOWN'));

  assert.throws(() => translateDeviceProgram({
    source: 'function d() { k(); return; } function k() { return; }',
    functions: [
      { name: 'd', kind: 'device', parameters: [], returns: 'void' },
      { name: 'k', kind: 'kernel', parameters: [], returns: 'void' },
    ],
  }), expectDeviceCode('DEVICE_JS_KERNEL_CALL_FORBIDDEN'));
});
