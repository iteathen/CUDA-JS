import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  compileIdentity,
  linkIdentity,
  normalizeCompileRequest,
  normalizeLinkRequest,
  openCompilerRuntimeForTesting,
  validateLtoCompatibility,
} from '../testing.mjs';

const source = 'extern "C" __global__ void k() {}\n';

function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

function provider(linkVersion = '13.3') {
  return {
    platform: 'win32',
    architecture: 'x64',
    node: 'v26.7.0',
    nodeAbi: '147',
    identity: {
      profile: 'fixture-cuda-13.3',
      nvrtc: { version: '13.3', byteLength: 1, sha256: '1'.repeat(64) },
      nvrtcBuiltins: { version: '13.3', byteLength: 1, sha256: '2'.repeat(64) },
      nvJitLink: { version: linkVersion, byteLength: 1, sha256: '3'.repeat(64) },
      headerProfiles: {
        cudaCccl: { profile: 'fixture-cccl', algorithm: 'fixture', roots: ['cuda', 'nv'], fileCount: 1, byteLength: 1, sha256: '0'.repeat(64) },
      },
    },
  };
}

function ltoArtifact(bytes = Uint8Array.of(0, 1, 2, 3), overrides = {}) {
  return {
    format: 'lto-ir',
    bytes,
    byteLength: bytes.byteLength,
    sha256: sha256(bytes),
    architecture: 'compute_75',
    producer: { profile: 'fixture-cuda-13.3', nvrtcVersion: '13.3' },
    ...overrides,
  };
}

test('PTX remains the default while LTO-IR selects deterministic -dlto identity', () => {
  const omitted = normalizeCompileRequest({ source }, 'win32');
  const explicitPtx = normalizeCompileRequest({ source, output: 'ptx' }, 'win32');
  const lto = normalizeCompileRequest({ source, output: 'lto-ir' }, 'win32');

  assert.deepEqual(explicitPtx, omitted);
  assert.equal(omitted.output, 'ptx');
  assert.deepEqual(omitted.options.native, [
    '--gpu-architecture=compute_75', '--std=c++17', '--fmad=false', '--frandom-seed=0', '--no-cache',
  ]);
  assert.equal(lto.output, 'lto-ir');
  assert.deepEqual(lto.options.native, [
    '--gpu-architecture=compute_75', '--std=c++17', '--fmad=false', '--dlink-time-opt', '--frandom-seed=0', '--no-cache',
  ]);
  assert.equal(compileIdentity(omitted, provider()).contractVersion, 'SPEC-0006-v1');
  assert.equal(compileIdentity(lto, provider()).contractVersion, 'SPEC-0012-v1');
  assert.notDeepEqual(compileIdentity(lto, provider()), compileIdentity(omitted, provider()));
});

test('LTO-IR rejects explicit RDC because -dlto owns relocatable semantics', () => {
  for (const value of [false, true]) {
    assert.throws(() => normalizeCompileRequest({ source, output: 'lto-ir', options: { relocatableDeviceCode: value } }, 'win32'), { code: 'COMPILER_OUTPUT_CONFLICT' });
  }
});

test('typed LTO-IR is binary-safe, homogeneous, identity-bearing, and selects -lto', () => {
  const first = ltoArtifact(Uint8Array.of(0, 1, 2, 3));
  const second = ltoArtifact(Uint8Array.of(4, 0, 5, 6));
  const request = normalizeLinkRequest({ inputs: [first, second] });

  assert.equal(request.mode, 'lto');
  assert.deepEqual(request.options.native, ['-arch=sm_75', '-lto']);
  assert.equal(request.inputs[0].format, 'lto-ir');
  assert.equal(request.inputs[0].bytes[0], 0);
  assert.deepEqual(request.inputs[0].producer, { profile: 'fixture-cuda-13.3', nvrtcVersion: '13.3', major: 13, minor: 3 });

  const identity = linkIdentity(request, provider());
  assert.equal(identity.contractVersion, 'SPEC-0012-v1');
  assert.equal(identity.request.mode, 'lto');
  assert.equal(identity.request.inputs[0].format, 'lto-ir');
  assert.equal(identity.request.inputs[0].producer.nvrtcVersion, '13.3');
});

test('raw LTO bytes, mixed formats, malformed metadata, and architecture mismatch fail closed', () => {
  const raw = Uint8Array.of(1, 2, 3);
  const good = ltoArtifact();

  assert.throws(() => normalizeLinkRequest({ inputs: [raw, good] }), { code: 'LINKER_INPUT_FORMAT_MIXED' });
  assert.throws(() => normalizeLinkRequest({ inputs: [{ ...good, byteLength: good.byteLength + 1 }] }), { code: 'LINKER_INPUT_INVALID' });
  assert.throws(() => normalizeLinkRequest({ inputs: [{ ...good, sha256: '0'.repeat(64) }] }), { code: 'LINKER_INPUT_INVALID' });
  assert.throws(() => normalizeLinkRequest({ inputs: [{ ...good, producer: { profile: 'x', nvrtcVersion: '13' } }] }), { code: 'LINKER_LTO_PRODUCER_INVALID' });
  assert.throws(() => normalizeLinkRequest({ inputs: [{ ...good, architecture: 'compute_80' }], options: { architecture: 'sm_75' } }), { code: 'LINKER_ARCHITECTURE_MISMATCH' });
  assert.throws(() => normalizeLinkRequest({ inputs: [{ ...good, unexpected: true }] }), { code: 'LINKER_INPUT_INVALID' });
});

test('LTO compatibility prevalidation rejects wrong major and newer producer', () => {
  const compatible = normalizeLinkRequest({ inputs: [ltoArtifact()] });
  assert.doesNotThrow(() => validateLtoCompatibility(compatible, provider('13.3')));
  assert.throws(() => validateLtoCompatibility(compatible, provider('12.9')), { code: 'LINKER_LTO_INCOMPATIBLE' });

  const newer = normalizeLinkRequest({ inputs: [ltoArtifact(undefined, { producer: { profile: 'fixture-cuda-13.4', nvrtcVersion: '13.4' } })] });
  assert.throws(() => validateLtoCompatibility(newer, provider('13.3')), { code: 'LINKER_LTO_INCOMPATIBLE' });

  const mixedMajor = [
    ltoArtifact(),
    ltoArtifact(Uint8Array.of(9, 8, 7), { producer: { profile: 'fixture-cuda-12.9', nvrtcVersion: '12.9' } }),
  ];
  assert.throws(() => normalizeLinkRequest({ inputs: mixedMajor }), { code: 'LINKER_LTO_INCOMPATIBLE' });
});

test('CompilerActor mock publishes typed LTO-IR, separates cache identity, links, and closes cleanly', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-lto-'));
  try {
    const runtime = await openCompilerRuntimeForTesting({ cacheDirectory: directory });
    const ptx = await runtime.compile({ source });
    const lto = await runtime.compile({ source, output: 'lto-ir' });
    const ltoHit = await runtime.compile({ source, output: 'lto-ir' });

    assert.equal(ptx.artifact.format, 'ptx');
    assert.equal(lto.artifact.format, 'lto-ir');
    assert.equal(lto.artifact.bytes[0], 0);
    assert.deepEqual(lto.artifact.producer, { profile: 'portable-compiler-mock-v1', nvrtcVersion: '13.3' });
    assert.notEqual(ptx.cache.key, lto.cache.key);
    assert.equal(lto.cache.status, 'miss');
    assert.equal(ltoHit.cache.status, 'hit');
    assert.equal(ltoHit.cache.key, lto.cache.key);

    const second = await runtime.compile({ source: `${source}// second\n`, output: 'lto-ir' });
    const linked = await runtime.link({ inputs: [lto.artifact, second.artifact] });
    assert.equal(linked.artifact.format, 'cubin');

    await assert.rejects(runtime.link({ inputs: [ptx.artifact, lto.artifact] }), (error) => error.code === 'LINKER_INPUT_FORMAT_MIXED');

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
