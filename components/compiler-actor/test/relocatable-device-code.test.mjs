import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  compileIdentity,
  normalizeCompileOptions,
  normalizeCompileRequest,
  normalizeLinkRequest,
  openCompilerRuntimeForTesting,
} from '../testing.mjs';

const source = 'extern "C" __global__ void k() {}\n';

const provider = {
  platform: 'win32',
  architecture: 'x64',
  node: 'v26.7.0',
  nodeAbi: '147',
  identity: {
    profile: 'fixture',
    nvrtc: null,
    nvrtcBuiltins: null,
    nvJitLink: null,
    headerProfiles: {
      cudaCccl: {
        profile: 'fixture-cccl',
        algorithm: 'fixture',
        roots: ['cuda', 'nv'],
        fileCount: 1,
        byteLength: 1,
        sha256: '0'.repeat(64),
      },
    },
  },
};

test('relocatable device-code option is typed, default-off, deterministic, and identity-bearing', () => {
  const expectedDefault = [
    '--gpu-architecture=compute_75',
    '--std=c++17',
    '--fmad=false',
    '--frandom-seed=0',
    '--no-cache',
  ];
  const omitted = normalizeCompileOptions({}, 'win32');
  const disabled = normalizeCompileOptions({ relocatableDeviceCode: false }, 'win32');
  const enabled = normalizeCompileOptions({ relocatableDeviceCode: true }, 'win32');

  assert.deepEqual(omitted.native, expectedDefault);
  assert.deepEqual(disabled.native, expectedDefault);
  assert.equal(omitted.relocatableDeviceCode, false);
  assert.equal(disabled.relocatableDeviceCode, false);
  assert.equal(enabled.relocatableDeviceCode, true);
  assert.deepEqual(enabled.native, [
    '--gpu-architecture=compute_75',
    '--std=c++17',
    '--fmad=false',
    '--relocatable-device-code=true',
    '--frandom-seed=0',
    '--no-cache',
  ]);

  assert.throws(() => normalizeCompileOptions({ relocatableDeviceCode: 1 }, 'win32'), { code: 'COMPILER_OPTIONS_INVALID' });
  assert.throws(() => normalizeCompileOptions({ relocatableDeviceCode: 'true' }, 'win32'), { code: 'COMPILER_OPTIONS_INVALID' });

  const ordinaryIdentity = compileIdentity(normalizeCompileRequest({ source }, 'win32'), provider);
  const explicitFalseIdentity = compileIdentity(normalizeCompileRequest({ source, options: { relocatableDeviceCode: false } }, 'win32'), provider);
  const rdcIdentity = compileIdentity(normalizeCompileRequest({ source, options: { relocatableDeviceCode: true } }, 'win32'), provider);
  const profiledRdcIdentity = compileIdentity(normalizeCompileRequest({ source, options: { headerProfile: 'cuda-cccl', relocatableDeviceCode: true } }, 'win32'), provider);

  assert.deepEqual(explicitFalseIdentity, ordinaryIdentity);
  assert.equal(ordinaryIdentity.contractVersion, 'SPEC-0006-v1');
  assert.equal(rdcIdentity.contractVersion, 'SPEC-0010-v1');
  assert.equal(rdcIdentity.request.relocatableDeviceCode, true);
  assert.equal(profiledRdcIdentity.contractVersion, 'SPEC-0010-v1');
  assert.equal(profiledRdcIdentity.request.headerProfile, 'cuda-cccl');
  assert.notDeepEqual(rdcIdentity.request.options, ordinaryIdentity.request.options);
});

test('typed PTX link inputs preserve the relocatable marker and reject false or non-boolean markers', () => {
  const bytes = Uint8Array.of(1, 2, 3);
  const normalized = normalizeLinkRequest({
    inputs: [{ format: 'ptx', bytes, relocatableDeviceCode: true }],
  });
  assert.equal(normalized.inputs[0].relocatableDeviceCode, true);

  assert.throws(() => normalizeLinkRequest({
    inputs: [{ format: 'ptx', bytes, relocatableDeviceCode: false }],
  }), { code: 'LINKER_INPUT_INVALID' });
  assert.throws(() => normalizeLinkRequest({
    inputs: [{ format: 'ptx', bytes, relocatableDeviceCode: 'true' }],
  }), { code: 'LINKER_INPUT_INVALID' });
});

test('CompilerActor separates RDC cache identity, publishes typed metadata, links it, and closes cleanly', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-rdc-'));
  try {
    const runtime = await openCompilerRuntimeForTesting({ cacheDirectory: directory });
    const ordinary = await runtime.compile({ source });
    const explicitFalse = await runtime.compile({ source, options: { relocatableDeviceCode: false } });
    const relocatable = await runtime.compile({ source, options: { relocatableDeviceCode: true } });

    assert.equal(ordinary.cache.status, 'miss');
    assert.equal(explicitFalse.cache.status, 'hit');
    assert.equal(explicitFalse.cache.key, ordinary.cache.key);
    assert.equal(Object.hasOwn(ordinary.artifact, 'relocatableDeviceCode'), false);

    assert.equal(relocatable.cache.status, 'miss');
    assert.notEqual(relocatable.cache.key, ordinary.cache.key);
    assert.equal(relocatable.artifact.format, 'ptx');
    assert.equal(relocatable.artifact.relocatableDeviceCode, true);

    const linked = await runtime.link({ inputs: [relocatable.artifact] });
    assert.equal(linked.artifact.format, 'cubin');
    assert.equal(Object.hasOwn(linked.artifact, 'relocatableDeviceCode'), false);

    const status = await runtime.status();
    assert.equal(status.resources.programsCreated, status.resources.programsDestroyed);
    assert.equal(status.resources.linksCreated, status.resources.linksDestroyed);

    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
    assert.equal(terminal.resources.programsCreated, terminal.resources.programsDestroyed);
    assert.equal(terminal.resources.linksCreated, terminal.resources.linksDestroyed);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
