import assert from 'node:assert/strict';
import test from 'node:test';

import { compileDeviceLibrary, compileDeviceProgram, inspectDeviceProgram } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const casRequest = Object.freeze({
  source: 'function claim(out, state, index, compare, value) { out[gpu.u32(0)] = gpu.atomic.cas(state, index, compare, value); }',
  functions: Object.freeze([Object.freeze({
    name: 'claim',
    kind: 'kernel',
    parameters: Object.freeze([
      Object.freeze({ name: 'out', type: 'ptr<u32>' }),
      Object.freeze({ name: 'state', type: 'ptr<u32>' }),
      Object.freeze({ name: 'index', type: 'u32' }),
      Object.freeze({ name: 'compare', type: 'u32' }),
      Object.freeze({ name: 'value', type: 'u32' }),
    ]),
    returns: 'void',
  })]),
});

test('inspectDeviceProgram is deterministic, CUDA-free and admits base CAS from CUDA-JS authority', () => {
  const first = inspectDeviceProgram(casRequest);
  const second = inspectDeviceProgram(casRequest);
  assert.deepEqual(second, first);
  assert.equal(first.schemaVersion, 1);
  assert.equal(first.deviceProgram.functions[0].name, 'claim');
  assert.deepEqual(first.inspection.publicHelperUsage, [{ function: 'claim', helpers: ['gpu.atomic.cas'] }]);
  assert.equal(first.inspection.compile.architecture, 'compute_75');
  assert.equal(Object.hasOwn(first, 'compiler'), false);
  assert.equal(Object.hasOwn(first, 'linker'), false);
  assert.equal(Object.hasOwn(first, 'generatedSource'), false);
  assert.equal(JSON.stringify(first).includes('__device__'), false);
  assert.equal(JSON.stringify(first).includes('atomicCAS'), false);
  assert.equal(JSON.stringify(first.inspection.publicHelperUsage).includes('gpu.u32'), false);
});

test('inspection preserves explicit lower compile-profile requirements before native work', () => {
  const request = {
    source: 'function publish(ready) { gpu.atomic.storeReleaseDevice(ready, gpu.u32(0), gpu.u32(1)); }',
    functions: [{ name: 'publish', kind: 'kernel', parameters: [{ name: 'ready', type: 'ptr<u32>' }], returns: 'void' }],
  };
  assert.throws(() => inspectDeviceProgram(request), (error) => error.code === 'DEVICE_JS_ATOMIC_PROFILE_REQUIRED');
  const inspected = inspectDeviceProgram({ ...request, compile: { headerProfile: 'cuda-cccl' } });
  assert.equal(inspected.inspection.compile.headerProfile, 'cuda-cccl');
  assert.deepEqual(inspected.inspection.publicHelperUsage, [{ function: 'publish', helpers: ['gpu.atomic.storeReleaseDevice'] }]);
});

test('inspectDeviceProgram rejects unknown Device-JS helpers at the lower owner', () => {
  assert.throws(() => inspectDeviceProgram({
    source: 'function bad(out) { out[gpu.u32(0)] = gpu.atomic.notAHelper(out, gpu.u32(0)); }',
    functions: [{ name: 'bad', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  }), (error) => error.code === 'DEVICE_JS_HELPER_UNKNOWN' || error.code === 'DEVICE_JS_CALL_UNKNOWN');
});

test('compileDeviceProgram and pure inspection share one semantic frontend result', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    const request = {
      source: 'function kernel(out, state) { let old = gpu.atomic.cas(state, gpu.u32(0), gpu.u32(0), gpu.u32(1)); out[gpu.u32(0)] = old; }',
      functions: [{
        name: 'kernel',
        kind: 'kernel',
        parameters: [{ name: 'out', type: 'ptr<u32>' }, { name: 'state', type: 'ptr<u32>' }],
        returns: 'void',
      }],
      compile: { architecture: 'compute_75' },
    };
    const inspected = inspectDeviceProgram(request);
    const compiled = await compileDeviceProgram(runtime, request);
    assert.deepEqual(compiled.deviceProgram, inspected.deviceProgram);
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('pure inspection accepts public DeviceJsImport values without a runtime', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  let library;
  try {
    library = (await compileDeviceLibrary(runtime, {
      source: 'function affine(x) { return x + gpu.u32(1); }',
      functions: [{ name: 'affine', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' }],
      exports: ['affine'],
    })).library;
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }

  const request = {
    source: 'function kernel(out) { out[gpu.u32(0)] = apply(gpu.u32(4)); }',
    functions: [{ name: 'kernel', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
    imports: [{ library, name: 'affine', as: 'apply' }],
  };
  const inspected = inspectDeviceProgram(request);
  assert.equal(inspected.deviceProgram.imports[0].exportName, 'affine');
  assert.equal(inspected.deviceProgram.imports[0].name, 'apply');
  assert.deepEqual(inspected.inspection.publicHelperUsage, [{ function: 'kernel', helpers: [] }]);
});
