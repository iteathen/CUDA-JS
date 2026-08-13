import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { normalizeCompileRequest } from '../../components/compiler-actor/testing.mjs';
import { CUDA_TARGET_BASES } from '../../components/cuda-target/index.mjs';
import { assessCudaSupport, inspectHostProfile } from '../../components/platform-diagnostics/index.mjs';

function generator(initial) {
  let state = initial >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function windowsHost() {
  return inspectHostProfile({
    nodeVersion: 'v26.7.0', nodeAbi: '141', platform: 'win32', architecture: 'x64',
    osRelease: '10.0.26200', osVersion: 'Windows 11', procVersion: '',
    execArgv: ['--experimental-ffi'], permissionEnabled: true, ffiAllowed: true,
  });
}

function driver(attributes) {
  return {
    schemaVersion: 1,
    runtime: { backend: 'windows-native' },
    profile: { nativeOperational: true, nativeQualified: false, node: 'v26.7.0', platform: 'win32', architecture: 'x64' },
    driver: { apiVersion: 13030 },
    device: { ordinal: 0, attributes },
  };
}

export function runPropertyPartitions(seed = 0xc0da1303, count = 256) {
  const next = generator(seed);
  const compileCases = [];
  const diagnosticCases = [];
  for (let index = 0; index < count; index += 1) {
    const kind = next() % 6;
    const id = `compile-${seed.toString(16)}-${String(index).padStart(4, '0')}`;
    let request;
    let expected;
    if (kind === 0) { request = { source: `extern \"C\" __global__ void k${index}() {}\n` }; expected = 'accepted'; }
    else if (kind === 1) { request = { source: 'x', ambientPath: 'kernel.cu' }; expected = 'COMPILER_REQUEST_INVALID'; }
    else if (kind === 2) { request = { source: 'x', name: `folder/k${index}.cu` }; expected = 'COMPILER_NAME_INVALID'; }
    else if (kind === 3) { request = { source: 'x', options: { architecture: `compute_${next() % 50}` } }; expected = 'COMPILER_ARCHITECTURE_INVALID'; }
    else if (kind === 4) { request = { source: 'x', headers: [{ name: 'same.h', source: 'a' }, { name: 'same.h', source: 'b' }] }; expected = 'COMPILER_HEADER_DUPLICATE'; }
    else { request = { source: 'x', options: { architecture: `compute_${CUDA_TARGET_BASES[next() % CUDA_TARGET_BASES.length]}`, languageStandard: next() % 2 ? 'c++17' : 'c++20', fmad: Boolean(next() % 2) } }; expected = 'accepted'; }
    let actual = 'accepted';
    try { normalizeCompileRequest(request, 'win32'); } catch (error) { actual = error.code; }
    assert.equal(actual, expected, id);
    compileCases.push({ id, kind, outcome: actual });

    const diagnosticKind = next() % 5;
    const attributes = { kernelExecTimeout: next() % 2, integrated: next() % 2, computeMode: next() % 4, tccDriver: next() % 2 };
    if (diagnosticKind === 1) attributes.kernelExecTimeout = 4;
    if (diagnosticKind === 2) attributes.integrated = -1;
    if (diagnosticKind === 3) attributes.computeMode = 9;
    if (diagnosticKind === 4) attributes.tccDriver = 7;
    const assessment = assessCudaSupport(windowsHost(), driver(attributes));
    const diagnosticExpected = diagnosticKind === 0 ? (attributes.computeMode === 2 ? 'CUDA_COMPUTE_MODE_PROHIBITED' : 'testing-unconfirmed') : 'CUDA_DEVICE_ATTRIBUTES_INVALID';
    const diagnosticActual = assessment.status === 'testing-unconfirmed' ? 'testing-unconfirmed' : assessment.reason;
    assert.equal(diagnosticActual, diagnosticExpected, `diagnostic-${seed.toString(16)}-${index}`);
    diagnosticCases.push({ id: `diagnostic-${seed.toString(16)}-${String(index).padStart(4, '0')}`, kind: diagnosticKind, outcome: diagnosticActual });
  }
  const record = { seed, count, compileCases, diagnosticCases };
  return Object.freeze({ seed, count, sha256: createHash('sha256').update(JSON.stringify(record)).digest('hex'), outcomes: Object.freeze({ compile: compileCases, diagnostics: diagnosticCases }) });
}
