import assert from 'node:assert/strict';
import test from 'node:test';

import { compileDeviceLibrary, compileDeviceProgram } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const request = {
  source: `
function mix(x) {
  return x ^ gpu.u32(17);
}
function kernel(out, input, n) {
  let i = gpu.thread.globalX();
  if (i >= n) {
    return;
  }
  let value = input[i];
  let count = gpu.u32(0);
  while (count < gpu.u32(2)) {
    value = mix(value);
    count++;
  }
  out[i] = value;
}
`,
  functions: [
    { name: 'mix', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
    {
      name: 'kernel',
      kind: 'kernel',
      parameters: [
        { name: 'out', type: 'ptr<u32>' },
        { name: 'input', type: 'ptr<u32>' },
        { name: 'n', type: 'u32' },
      ],
      returns: 'void',
    },
  ],
};

test('public Device-JS bridge translates privately then reuses CompilerActor', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    const compilerResourcesBefore = (await runtime.describe()).compiler.resources;
    await assert.rejects(compileDeviceProgram(runtime, {
      source: 'function publish(ready) { gpu.atomic.storeReleaseDevice(ready, gpu.u32(0), gpu.u32(1)); }',
      functions: [{ name: 'publish', kind: 'kernel', parameters: [{ name: 'ready', type: 'ptr<u32>' }], returns: 'void' }],
    }), (error) => error.code === 'DEVICE_JS_ATOMIC_PROFILE_REQUIRED');
    assert.deepEqual((await runtime.describe()).compiler.resources, compilerResourcesBefore);

    const result = await compileDeviceProgram(runtime, request);
    assert.equal(result.schemaVersion, 1);
    assert.equal(result.deviceProgram.contract, 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1');
    assert.equal(result.deviceProgram.parser.name, 'acorn');
    assert.equal(result.deviceProgram.kernels.length, 1);
    assert.deepEqual(result.deviceProgram.kernels[0].parameters, [
      { kind: 'device-memory' },
      { kind: 'device-memory' },
      { kind: 'u32' },
    ]);
    assert.equal(result.compiler.artifact.format, 'ptx');
    assert.equal(Object.hasOwn(result, 'generatedSource'), false);
    assert.equal(JSON.stringify(result).includes('__global__'), false);
    assert.equal(JSON.stringify(result).includes('threadIdx'), false);
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

const libraryRequest = {
  source: 'function affine(x, scale, bias) { return (x * scale) + bias; }',
  functions: [{
    name: 'affine',
    kind: 'device',
    parameters: [{ name: 'x', type: 'u32' }, { name: 'scale', type: 'u32' }, { name: 'bias', type: 'u32' }],
    returns: 'u32',
  }],
  exports: ['affine'],
};

function consumer(alias, kernel) {
  return {
    source: `function ${kernel}(out) { out[gpu.u32(0)] = ${alias}(gpu.u32(2), gpu.u32(3), gpu.u32(4)); }`,
    functions: [{ name: kernel, kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  };
}

test('public Device-JS libraries compose through typed RDC/LTO without CUDA source or hidden compiler work', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    const compiled = await compileDeviceLibrary(runtime, libraryRequest);
    assert.equal(compiled.compiler.operationSequence, 1);
    assert.equal(compiled.library.format, 'ptx');
    assert.equal(compiled.library.artifact.relocatableDeviceCode, true);
    assert.equal(compiled.library.exports[0].name, 'affine');
    assert.equal(compiled.library.exports[0].symbol, `djs_lib_${compiled.library.sha256}_0`);
    assert.equal(JSON.stringify(compiled).includes('__device__'), false);
    assert.equal(JSON.stringify(compiled).includes(libraryRequest.source), false);

    const original = compiled.library.artifact.bytes[0];
    compiled.library.artifact.bytes[0] ^= 0xff;
    await assert.rejects(compileDeviceProgram(runtime, {
      ...consumer('apply', 'invalidKernel'),
      imports: [{ library: compiled.library, name: 'affine', as: 'apply' }],
    }), (error) => error.code === 'LINKER_INPUT_INVALID');
    compiled.library.artifact.bytes[0] = original;

    const first = await compileDeviceProgram(runtime, {
      ...consumer('apply', 'firstKernel'),
      imports: [{ library: compiled.library, name: 'affine', as: 'apply' }],
    });
    assert.equal(first.compiler.operationSequence, 2);
    assert.equal(first.linker.operationSequence, 3);
    assert.equal(first.linker.artifact.format, 'cubin');
    assert.equal(first.deviceProgram.imports[0].exportName, 'affine');

    const second = await compileDeviceProgram(runtime, {
      ...consumer('transform', 'secondKernel'),
      imports: [{ library: compiled.library, name: 'affine', as: 'transform' }],
    });
    assert.equal(second.compiler.operationSequence, 4);
    assert.equal(second.linker.operationSequence, 5);
    assert.notEqual(second.deviceProgram.sha256, first.deviceProgram.sha256);

    const lto = await compileDeviceLibrary(runtime, {
      ...libraryRequest,
      source: 'function affine(x, scale, bias) { return ((x * scale) + bias) + gpu.u32(0); }',
      output: 'lto-ir',
    });
    assert.equal(lto.compiler.operationSequence, 6);
    assert.equal(lto.library.format, 'lto-ir');
    const ltoProgram = await compileDeviceProgram(runtime, {
      ...consumer('applyLto', 'ltoKernel'),
      imports: [{ library: lto.library, name: 'affine', as: 'applyLto' }],
    });
    assert.equal(ltoProgram.compiler.operationSequence, 7);
    assert.equal(ltoProgram.compiler.artifact.format, 'lto-ir');
    assert.equal(ltoProgram.linker.operationSequence, 8);
    assert.equal(ltoProgram.linker.artifact.format, 'cubin');

    await assert.rejects(compileDeviceProgram(runtime, {
      ...consumer('missing', 'missingKernel'),
      imports: [{ library: compiled.library, name: 'missing', as: 'missing' }],
    }), (error) => error.code === 'DEVICE_JS_IMPORT_UNKNOWN');

    await assert.rejects(compileDeviceLibrary(runtime, {
      ...libraryRequest,
      compile: { relocatableDeviceCode: true },
    }), (error) => error.code === 'DEVICE_JS_LIBRARY_COMPILE_CONFLICT');
    await assert.rejects(compileDeviceProgram(runtime, {
      ...consumer('conflict', 'rdcConflictKernel'),
      compile: { relocatableDeviceCode: true },
      imports: [{ library: compiled.library, name: 'affine', as: 'conflict' }],
    }), (error) => error.code === 'DEVICE_JS_LIBRARY_COMPILE_CONFLICT');

    const mismatched = {
      ...compiled.library,
      architecture: 'compute_80',
      artifact: { ...compiled.library.artifact, architecture: 'compute_80' },
    };
    await assert.rejects(compileDeviceProgram(runtime, {
      ...consumer('wrongTarget', 'targetMismatchKernel'),
      imports: [{ library: mismatched, name: 'affine', as: 'wrongTarget' }],
    }), (error) => error.code === 'LINKER_ARCHITECTURE_MISMATCH');

    const contradictory = {
      ...compiled.library,
      exports: [{
        ...compiled.library.exports[0],
        parameters: [
          { ...compiled.library.exports[0].parameters[0], type: 'u64' },
          ...compiled.library.exports[0].parameters.slice(1),
        ],
      }],
    };
    await assert.rejects(compileDeviceProgram(runtime, {
      ...consumer('apply', 'contradictoryKernel'),
      imports: [
        { library: compiled.library, name: 'affine', as: 'apply' },
        { library: contradictory, name: 'affine', as: 'contradictory' },
      ],
    }), (error) => error.code === 'DEVICE_JS_LIBRARY_CONFLICT');

    const contradictoryContract = {
      ...compiled.library,
      contract: `${compiled.library.contract.replace('+SPEC-0028-device-library-v1', '')}+SPEC-0030-dense-numeric-v1+SPEC-0028-device-library-v1`,
    };
    await assert.rejects(compileDeviceProgram(runtime, {
      ...consumer('apply', 'contractContradictionKernel'),
      imports: [
        { library: compiled.library, name: 'affine', as: 'apply' },
        { library: contradictoryContract, name: 'affine', as: 'contradictoryContract' },
      ],
    }), (error) => error.code === 'DEVICE_JS_LIBRARY_CONFLICT');

    await assert.rejects(compileDeviceProgram(runtime, {
      source: 'function useBoth(out) { out[gpu.u32(0)] = applyPtx(gpu.u32(1), gpu.u32(2), gpu.u32(3)) + applyLto(gpu.u32(4), gpu.u32(5), gpu.u32(6)); }',
      functions: [{ name: 'useBoth', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
      imports: [
        { library: compiled.library, name: 'affine', as: 'applyPtx' },
        { library: lto.library, name: 'affine', as: 'applyLto' },
      ],
    }), (error) => error.code === 'LINKER_INPUT_FORMAT_MIXED');

    const probe = await compileDeviceProgram(runtime, {
      ...consumer('stillValid', 'postNegativeKernel'),
      imports: [{ library: compiled.library, name: 'affine', as: 'stillValid' }],
    });
    assert.equal(probe.compiler.operationSequence, 9);
    assert.equal(probe.linker.operationSequence, 10);

    const hiddenDense = await compileDeviceLibrary(runtime, {
      source: 'function hidden(x) { return gpu.cast.f16(x); } function rounded(x) { return gpu.cast.u32(hidden(x)); }',
      functions: [
        { name: 'hidden', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'f16' },
        { name: 'rounded', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
      ],
      exports: ['rounded'],
    });
    const hiddenDenseProgram = await compileDeviceProgram(runtime, {
      source: 'function k(out, x) { out[gpu.u32(0)] = rounded(x); }',
      functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }, { name: 'x', type: 'u32' }], returns: 'void' }],
      imports: [{ library: hiddenDense.library, name: 'rounded', as: 'rounded' }],
    });
    assert.match(hiddenDenseProgram.deviceProgram.contract, /SPEC-0030-dense-numeric-v1\+SPEC-0028-device-library-v1$/u);
    assert.equal(hiddenDenseProgram.compiler.headerProfile, 'cuda-numeric');
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});
