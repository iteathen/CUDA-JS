import assert from 'node:assert/strict';
import test from 'node:test';
import { translateDeviceLibrary, translateDeviceProgram } from '../testing.mjs';
import { inspectDeviceProgram, compileDeviceLibrary, compileDeviceProgram } from '../../runtime-facade/index.mjs';
import { openCudaRuntimeForTesting } from '../../runtime-facade/testing.mjs';
import { CUDA_TARGET_BASES } from '../../cuda-target/index.mjs';

const suffix = '+SPEC-0022-warp32-v1';
const kernel = (expression, extra = '') => ({
  source: `function k(out) { ${extra} out[gpu.u32(0)] = ${expression}; }`,
  functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
});

test('warp helpers lower exactly, select identity, and preserve single evaluation', () => {
  const request = kernel('gpu.warp.ballot(mask--, gpu.warp.laneId() < gpu.warp.width())', 'let mask = gpu.u32(4294967295);');
  const translated = translateDeviceProgram(request);
  assert(translated.contract.endsWith(suffix));
  assert.equal(translated.compile.headerProfile, 'none');
  assert.match(translated.generatedSource, /__ballot_sync\(mask, predicate\) & mask/);
  assert.equal(translated.generatedSource.match(/v0--/g).length, 1);
  assert.match(translated.generatedSource, /threadIdx.z \* blockDim.y \+ threadIdx.y/);
  assert.deepEqual(translateDeviceProgram(request), translated);
  assert.deepEqual(inspectDeviceProgram(request).inspection.publicHelperUsage[0].helpers,
    ['gpu.warp.ballot', 'gpu.warp.laneId', 'gpu.warp.width']);
  const legacy = translateDeviceProgram(kernel('gpu.thread.x()'));
  assert(!legacy.contract.endsWith(suffix));
  assert.doesNotMatch(legacy.generatedSource, /djs_warp|__ballot/);
  assert.notEqual(legacy.sha256, translated.sha256);
});

test('closed warp signature and canonical target admission', () => {
  for (const [expression, code] of [
    ['gpu.warp.width(gpu.u32(1))', 'DEVICE_JS_HELPER_ARGUMENTS'],
    ['gpu.warp.laneId(true)', 'DEVICE_JS_HELPER_ARGUMENTS'],
    ['gpu.warp.ballot(true)', 'DEVICE_JS_HELPER_ARGUMENTS'],
    ['gpu.warp.ballot(gpu.i32(1), true)', 'DEVICE_JS_WARP_TYPE'],
    ['gpu.warp.ballot(gpu.u32(1), gpu.u32(1))', 'DEVICE_JS_WARP_TYPE'],
    ['gpu.warp.activeMask()', 'DEVICE_JS_HELPER_UNKNOWN'],
  ]) assert.throws(() => inspectDeviceProgram(kernel(expression)), { code });
  const request = kernel('gpu.warp.ballot(gpu.u32(4294967295), true)');
  for (const base of CUDA_TARGET_BASES) {
    assert(translateDeviceProgram({ ...request, compile: { architecture: `compute_${base}` } }).contract.endsWith(suffix));
  }
  for (const architecture of ['compute_50', 'compute_120a', 'compute_1000', 'sm_75']) {
    assert.throws(() => inspectDeviceProgram({ ...request, compile: { architecture } }), { code: 'DEVICE_JS_COMPILE_OPTIONS_INVALID' });
  }
});

test('warp profile composes with dense math and scoped atomics', () => {
  const translated = translateDeviceProgram({
    source: 'function k(out) { const x = gpu.math.tanh(gpu.math.erf(gpu.f64(1))); const bits = gpu.warp.ballot(gpu.u32(4294967295), x > gpu.f64(0)); gpu.atomic.storeReleaseDevice(out, gpu.thread.globalX(), bits); }',
    functions: kernel('gpu.u32(0)').functions,
  });
  assert.match(translated.contract, /dense-numeric-v1\+SPEC-0030-erf-v1\+SPEC-0030-tanh-v1\+SPEC-0022-warp32-v1$/);
  assert.equal(translated.compile.headerProfile, 'cuda-device');
  assert.match(translated.generatedSource, /cuda\/atomic/);
  assert.match(translated.generatedSource, /__ballot_sync/);
});

test('public PTX/LTO library imports retain warp and numeric requirements without direct helpers', async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    for (const output of ['ptx', 'lto-ir']) {
      for (const numeric of [false, true]) {
        const fn = {
          name: 'vote', kind: 'device',
          parameters: [{ name: 'mask', type: 'u32' }, { name: 'p', type: numeric ? 'f64' : 'bool' }],
          returns: 'u32',
        };
        const request = {
          source: `function vote(mask, p) { return gpu.warp.ballot(mask, ${numeric ? 'gpu.math.tanh(gpu.math.erf(p)) > gpu.f64(0)' : 'p'}); }`,
          functions: [fn], exports: ['vote'],
        };
        const { library } = await compileDeviceLibrary(runtime, { ...request, output });
        assert(library.contract.endsWith(suffix));
        const program = {
          ...kernel(`vote(gpu.u32(4294967295), ${numeric ? 'gpu.f64(1)' : 'true'})`),
          imports: [{ library, name: 'vote', as: 'vote' }],
        };
        const inspected = inspectDeviceProgram(program);
        const compiled = await compileDeviceProgram(runtime, program);
        assert.deepEqual(compiled.deviceProgram, inspected.deviceProgram);
        assert.equal(compiled.linker.artifact.format, 'cubin');
        assert(compiled.deviceProgram.contract.endsWith(suffix));
        assert.deepEqual(inspected.inspection.publicHelperUsage[0].helpers, []);
        if (numeric) {
          assert.match(compiled.deviceProgram.contract, /dense-numeric-v1\+SPEC-0030-erf-v1\+SPEC-0030-tanh-v1\+SPEC-0028-device-library-v1\+SPEC-0022-warp32-v1$/);
          assert.equal(inspected.inspection.compile.headerProfile, 'cuda-numeric');
        }
        const before = (await runtime.describe()).compiler.resources;
        for (const contract of [library.contract + suffix, library.contract + '-unknown']) {
          await assert.rejects(compileDeviceProgram(runtime, {
            ...program, imports: [{ library: { ...library, contract }, name: 'vote', as: 'vote' }],
          }), { code: 'DEVICE_JS_LIBRARY_INVALID' });
        }
        await assert.rejects(compileDeviceProgram(runtime, kernel('gpu.warp.ballot(true, true)')), { code: 'DEVICE_JS_WARP_TYPE' });
        assert.deepEqual((await runtime.describe()).compiler.resources, before);
        assert(translateDeviceLibrary(request).contract.endsWith(suffix));
      }
    }
  } finally {
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
    assert.equal(terminal.driver.resourceCounts.live, 0);
  }
});
