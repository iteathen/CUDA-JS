import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { assertCompilerPublicRecord, combineCompilerCleanupFailures, compileIdentity, COMPILER_RUNTIME_TEST, composeHeaderProfiles, inventoryHeaderProfile, linkIdentity, normalizeCompileOptions, normalizeCompileRequest, normalizeLinkRequest, openCompilerRuntimeForTesting, providerTargetProfile, snapshotHeaderProfile } from '../testing.mjs';
import { CompilerRuntimeError, openCompilerRuntime } from '../index.mjs';
import { resolveLinuxNativeProfile, resolveWindowsNativeProfile } from '../src/backends/native-profiles.mjs';
import { selectNativeBackend } from '../src/compiler-runtime.mjs';

const source = 'extern "C" __global__ void k() {}\n';
const POLICY_BASES = Object.freeze(['75', '80', '86', '87', '88', '89', '90', '100', '103', '110', '120', '121']);
const NVRTC_COMPUTE_TARGETS = Object.freeze([
  'compute_75', 'compute_80', 'compute_86', 'compute_87', 'compute_89', 'compute_90', 'compute_90a',
  'compute_100', 'compute_100f', 'compute_100a', 'compute_101', 'compute_101f', 'compute_101a',
  'compute_103', 'compute_103f', 'compute_103a', 'compute_120', 'compute_120f', 'compute_120a',
  'compute_121', 'compute_121f', 'compute_121a',
]);
const NVJITLINK_SM_TARGETS = Object.freeze([
  'sm_75', 'sm_80', 'sm_86', 'sm_87', 'sm_88', 'sm_89', 'sm_90', 'sm_90a',
  'sm_100', 'sm_100f', 'sm_100a', 'sm_103', 'sm_103f', 'sm_103a', 'sm_110', 'sm_110f',
  'sm_110a', 'sm_120', 'sm_120f', 'sm_120a', 'sm_121', 'sm_121f', 'sm_121a',
]);
const compilerProviderManifest = JSON.parse(readFileSync(new URL('../../../schemas/cuda-13.3/win-x64/compiler-provider-manifest.json', import.meta.url), 'utf8'));
const linuxCompilerProviderManifest = JSON.parse(readFileSync(new URL('../../../schemas/cuda-13.3/linux-x64/compiler-provider-manifest.json', import.meta.url), 'utf8'));
const NATIVE_TARGET_CAPABILITIES = providerTargetProfile(compilerProviderManifest.targetCapabilities);

function providerFilesystem(manifest, { root, providerDirectory, includeDirectory, pathApi }) {
  const records = new Map();
  for (const record of Object.values(manifest.providers)) records.set(pathApi.join(providerDirectory, record.file), record);
  for (const [name, sha256] of Object.entries(manifest.headers)) records.set(pathApi.join(includeDirectory, name), { sha256 });
  return {
    exists: (candidate) => candidate === root || records.has(candidate),
    realpath: (candidate) => candidate,
    statFile: async (candidate) => ({ size: records.get(candidate)?.byteLength ?? 0 }),
    hashFile: async (candidate) => records.get(candidate).sha256,
  };
}

test('native CompilerActor selection and provider discovery remain thin exact platform profiles', async () => {
  assert.equal(selectNativeBackend('win32', 'x64'), 'windows-native');
  assert.equal(selectNativeBackend('linux', 'x64'), 'linux-native');
  assert.throws(() => selectNativeBackend('linux', 'arm64'), { code: 'COMPILER_PROFILE_UNSUPPORTED' });
  assert.deepEqual(linuxCompilerProviderManifest.targetCapabilities, compilerProviderManifest.targetCapabilities);

  const windowsRoot = 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3';
  const windowsFiles = providerFilesystem(compilerProviderManifest, {
    root: windowsRoot,
    providerDirectory: path.win32.join(windowsRoot, 'bin', 'x64'),
    includeDirectory: path.win32.join(windowsRoot, 'include'),
    pathApi: path.win32,
  });
  const windows = await resolveWindowsNativeProfile({
    platform: 'win32',
    architecture: 'x64',
    cudaPathV13_3: windowsRoot,
    manifest: compilerProviderManifest,
    ...windowsFiles,
  });
  assert.equal(windows.backend, 'windows-native');
  assert.equal(windows.manifest.profile, 'cuda-13.3-windows-x64-compiler');
  assert.equal(windows.nvrtcPath, path.win32.join(windowsRoot, 'bin', 'x64', compilerProviderManifest.providers.nvrtc.file));

  const linuxRoot = '/usr/local/cuda-13.3';
  const linuxTarget = path.posix.join(linuxRoot, 'targets', 'x86_64-linux');
  const linuxFiles = providerFilesystem(linuxCompilerProviderManifest, {
    root: linuxRoot,
    providerDirectory: path.posix.join(linuxTarget, 'lib'),
    includeDirectory: path.posix.join(linuxTarget, 'include'),
    pathApi: path.posix,
  });
  const linux = await resolveLinuxNativeProfile({
    platform: 'linux',
    architecture: 'x64',
    manifest: linuxCompilerProviderManifest,
    ...linuxFiles,
  });
  assert.equal(linux.backend, 'linux-native');
  assert.equal(linux.manifest.profile, 'cuda-13.3-ubuntu-24.04-x64-compiler');
  assert.equal(linux.ccclRoot, '/usr/local/cuda-13.3/targets/x86_64-linux/include/cccl');
  assert.equal(linux.claim, 'native-linux-f6l-profile-unqualified');
  await assert.rejects(resolveLinuxNativeProfile({
    platform: 'linux',
    architecture: 'x64',
    manifest: linuxCompilerProviderManifest,
    ...linuxFiles,
    hashFile: async (candidate) => candidate.endsWith(linuxCompilerProviderManifest.providers.nvrtc.file)
      ? '0'.repeat(64)
      : linuxFiles.hashFile(candidate),
  }), { code: 'COMPILER_PROVIDER_IDENTITY' });
  await assert.rejects(resolveLinuxNativeProfile({
    platform: 'linux',
    architecture: 'x64',
    manifest: linuxCompilerProviderManifest,
    ...linuxFiles,
    realpath: (candidate) => candidate === linuxRoot ? '/opt/cuda-13.3' : candidate,
  }), { code: 'COMPILER_TOOLKIT_NONCANONICAL' });
});

test('typed compiler and linker contracts normalize deterministically and reject ambient inputs', () => {
  assert.deepEqual(normalizeCompileOptions({}, 'win32').native, [
    '--gpu-architecture=compute_75', '--std=c++17', '--fmad=false', '--frandom-seed=0', '--no-cache',
  ]);
  assert.equal(normalizeCompileOptions({}, 'win32').headerProfile, 'none');
  assert.equal(normalizeCompileOptions({ headerProfile: 'cuda-cccl' }, 'win32').headerProfile, 'cuda-cccl');
  assert.equal(normalizeCompileOptions({ headerProfile: 'cuda-numeric' }, 'win32').headerProfile, 'cuda-numeric');
  assert.equal(normalizeCompileOptions({ headerProfile: 'cuda-device' }, 'win32').headerProfile, 'cuda-device');
  assert.throws(() => normalizeCompileOptions({ headerProfile: 'ambient-path' }, 'win32'), { code: 'COMPILER_HEADER_PROFILE_INVALID' });
  assert.deepEqual(normalizeCompileOptions({}, 'linux').native.slice(-1), ['--modify-stack-limit=false']);
  const request = normalizeCompileRequest({ source, headers: [{ name: 'z.h', source: 'z' }, { name: 'a.h', source: 'a' }] }, 'linux');
  assert.deepEqual(request.headers.map((header) => header.name), ['a.h', 'z.h']);
  assert.throws(() => normalizeCompileRequest({ source, path: 'kernel.cu' }), { code: 'COMPILER_REQUEST_INVALID' });
  assert.throws(() => normalizeCompileRequest({ source, options: { arbitrary: '--use-fast-math' } }), { code: 'COMPILER_OPTIONS_INVALID' });
  assert.throws(() => normalizeLinkRequest({ inputs: [new Uint8Array([1, 0, 2])] }), { code: 'LINKER_INPUT_INVALID' });

  const provider = {
    platform: 'win32', architecture: 'x64', node: 'v26.7.0', nodeAbi: '147',
    identity: {
      profile: 'fixture', nvrtc: null, nvrtcBuiltins: null, nvJitLink: null,
      targetCapabilities: NATIVE_TARGET_CAPABILITIES,
      headerProfiles: {
        cudaCccl: { profile: 'fixture-cccl', algorithm: 'fixture', roots: ['cuda', 'nv'], fileCount: 1, byteLength: 1, sha256: '0'.repeat(64) },
        cudaNumeric: { profile: 'fixture-numeric', algorithm: 'fixture', roots: ['nv'], files: ['cuda_fp16.h', 'cuda_bf16.h'], fileCount: 3, byteLength: 3, sha256: '1'.repeat(64) },
        cudaDevice: { profile: 'fixture-device', algorithm: 'fixture', roots: ['cuda', 'nv'], files: ['cuda_fp16.h', 'cuda_bf16.h'], fileCount: 4, byteLength: 4, sha256: '2'.repeat(64) },
      },
    },
  };
  const defaultIdentity = compileIdentity(normalizeCompileRequest({ source }, 'win32'), provider);
  assert.equal(defaultIdentity.contractVersion, 'SPEC-0006-v1');
  assert.equal(Object.hasOwn(defaultIdentity.request, 'headerProfile'), false);
  const profiledIdentity = compileIdentity(normalizeCompileRequest({ source, options: { headerProfile: 'cuda-cccl' } }, 'win32'), provider);
  assert.equal(profiledIdentity.contractVersion, 'SPEC-0009-v1');
  assert.equal(profiledIdentity.request.headerProfile, 'cuda-cccl');
  assert.throws(() => compileIdentity(normalizeCompileRequest({ source, headers: [{ name: 'cuda', source: 'shadow' }], options: { headerProfile: 'cuda-cccl' } }, 'win32'), provider), { code: 'COMPILER_HEADER_PROFILE_CONFLICT' });
  assert.throws(() => compileIdentity(normalizeCompileRequest({ source, headers: [{ name: 'nv', source: 'shadow' }], options: { headerProfile: 'cuda-cccl' } }, 'win32'), provider), { code: 'COMPILER_HEADER_PROFILE_CONFLICT' });
  const numericIdentity = compileIdentity(normalizeCompileRequest({ source, options: { headerProfile: 'cuda-numeric' } }, 'win32'), provider);
  assert.equal(numericIdentity.contractVersion, 'SPEC-0030-v1');
  assert.throws(() => compileIdentity(normalizeCompileRequest({ source, headers: [{ name: 'cuda_fp16.h', source: 'shadow' }], options: { headerProfile: 'cuda-numeric' } }, 'win32'), provider), { code: 'COMPILER_HEADER_PROFILE_CONFLICT' });
  assert.equal(compileIdentity(normalizeCompileRequest({ source, options: { headerProfile: 'cuda-device' } }, 'win32'), provider).contractVersion, 'SPEC-0030-v1');
  const linkedIdentity = linkIdentity(normalizeLinkRequest({ inputs: [new Uint8Array([1, 2, 3])] }), provider);
  assert.equal(Object.hasOwn(linkedIdentity.provider, 'headerProfiles'), false);
});

test('compiler and linker consume admitted three-digit targets and target-policy identity', () => {
  const provider = {
    platform: 'win32', architecture: 'x64', node: 'v26.7.0', nodeAbi: '147',
    identity: { profile: 'fixture', nvrtc: null, nvrtcBuiltins: null, nvJitLink: null, targetCapabilities: NATIVE_TARGET_CAPABILITIES, headerProfiles: {} },
  };
  const compile75 = normalizeCompileRequest({ source, options: { architecture: 'compute_75' } }, 'win32');
  const compile120 = normalizeCompileRequest({ source, options: { architecture: 'compute_120' } }, 'win32');
  assert.equal(compile120.options.architecture, 'compute_120');
  assert.notDeepEqual(compileIdentity(compile75, provider), compileIdentity(compile120, provider));
  assert.equal(compileIdentity(compile120, provider).targetPolicy.revision, 'SPEC-0006-target-v1');
  const ptx = { format: 'ptx', bytes: new Uint8Array([1, 2, 3]), architecture: 'compute_120' };
  const linked = normalizeLinkRequest({ inputs: [ptx], options: { architecture: 'sm_120' } });
  assert.equal(linked.options.architecture, 'sm_120');
  assert.equal(linkIdentity(linked, provider).targetPolicy.revision, 'SPEC-0006-target-v1');
  const link75 = normalizeLinkRequest({ inputs: [new Uint8Array([1, 2, 3])], options: { architecture: 'sm_75' } });
  const link120 = normalizeLinkRequest({ inputs: [new Uint8Array([1, 2, 3])], options: { architecture: 'sm_120' } });
  assert.notDeepEqual(linkIdentity(link75, provider), linkIdentity(link120, provider));
  assert.throws(() => normalizeCompileOptions({ architecture: 'sm_120' }), { code: 'COMPILER_ARCHITECTURE_INVALID' });
  assert.throws(() => normalizeCompileOptions({ architecture: 'compute_120f' }), { code: 'COMPILER_ARCHITECTURE_INVALID' });
  assert.throws(() => normalizeCompileOptions({ architecture: 'compute_1000' }), { code: 'COMPILER_ARCHITECTURE_INVALID' });
  assert.throws(() => normalizeLinkRequest({ inputs: [ptx], options: { architecture: 'sm_121' } }), { code: 'LINKER_ARCHITECTURE_MISMATCH' });
  assert.throws(() => normalizeLinkRequest({ inputs: [ptx], options: { architecture: 'compute_120' } }), { code: 'LINKER_ARCHITECTURE_INVALID' });
});

test('exact CUDA 13.3 provider targets preflight every policy-admitted compile and link target', () => {
  const provider = {
    platform: 'win32', architecture: 'x64', node: 'v26.7.0', nodeAbi: '147',
    identity: {
      profile: 'cuda-13.3-windows-x64-compiler', nvrtc: null, nvrtcBuiltins: null, nvJitLink: null,
      targetCapabilities: NATIVE_TARGET_CAPABILITIES, headerProfiles: {},
    },
  };
  assert.equal(compilerProviderManifest.schemaVersion, 4);
  assert.equal(compilerProviderManifest.targetCapabilities.revision, 'cuda-13.3-documented-provider-targets-v1');
  assert.deepEqual(compilerProviderManifest.targetCapabilities.compile, NVRTC_COMPUTE_TARGETS);
  assert.deepEqual(compilerProviderManifest.targetCapabilities.link, NVJITLINK_SM_TARGETS);
  assert.deepEqual(NATIVE_TARGET_CAPABILITIES.compile, [...NVRTC_COMPUTE_TARGETS].sort());
  assert.deepEqual(NATIVE_TARGET_CAPABILITIES.link, [...NVJITLINK_SM_TARGETS].sort());

  for (const base of POLICY_BASES) {
    const compileRequest = normalizeCompileRequest({ source, options: { architecture: `compute_${base}` } }, 'win32');
    if (base === '88' || base === '110') {
      assert.throws(() => compileIdentity(compileRequest, provider), {
        code: 'COMPILER_ARCHITECTURE_UNSUPPORTED',
        category: 'unsupported',
        details: { architecture: `compute_${base}`, providerProfile: provider.identity.profile },
      });
    } else {
      assert.doesNotThrow(() => compileIdentity(compileRequest, provider));
    }
    const linkRequest = normalizeLinkRequest({ inputs: [new Uint8Array([1, 2, 3])], options: { architecture: `sm_${base}` } });
    assert.doesNotThrow(() => linkIdentity(linkRequest, provider));
  }

  const missingProfile = { ...provider, identity: { ...provider.identity, targetCapabilities: undefined } };
  assert.throws(() => compileIdentity(normalizeCompileRequest({ source }, 'win32'), missingProfile), { code: 'COMPILER_PROVIDER_TARGET_PROFILE_INVALID', category: 'unsupported' });
  const compile75 = compileIdentity(normalizeCompileRequest({ source }, 'win32'), provider);
  assert.equal(Object.hasOwn(compile75.provider, 'targetCapabilities'), true);
  const revisedProvider = {
    ...provider,
    identity: {
      ...provider.identity,
      targetCapabilities: { ...provider.identity.targetCapabilities, revision: 'cuda-13.3-documented-provider-targets-v2' },
    },
  };
  assert.notDeepEqual(compile75, compileIdentity(normalizeCompileRequest({ source }, 'win32'), revisedProvider));
});

test('CompilerActor serializes work, validates cache hits, rejects corruption, and invalidates exact keys', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f6-cache-'));
  try {
    const runtime = await openCompilerRuntimeForTesting({ cacheDirectory: directory });
    const first = await runtime.compile({ source });
    assert.equal(first.cache.status, 'miss');
    assert.equal(first.artifact.format, 'ptx');
    assert.equal(Object.hasOwn(first.provider, 'targetCapabilities'), false);
    const second = await runtime.compile({ source });
    assert.equal(second.cache.status, 'hit');
    assert.deepEqual(second.artifact.bytes, first.artifact.bytes);
    const profiled = await runtime.compile({ source, options: { headerProfile: 'cuda-cccl' } });
    assert.notEqual(profiled.cache.key, first.cache.key);
    assert.equal(profiled.headerProfile, 'cuda-cccl');

    const linked = await runtime.link({ inputs: [first.artifact] });
    assert.equal(linked.cache.status, 'miss');
    assert.equal(linked.artifact.format, 'cubin');
    assert.equal((await runtime.link({ inputs: [first.artifact] })).cache.status, 'hit');

    await writeFile(path.join(directory, `${first.cache.key}.bin`), Uint8Array.from([1, 2, 3]));
    const repaired = await runtime.compile({ source });
    assert.equal(repaired.cache.status, 'miss');
    assert.deepEqual(repaired.artifact.bytes, first.artifact.bytes);
    assert.equal((await runtime.compile({ source })).cache.status, 'hit');

    const readOnly = await openCompilerRuntimeForTesting({ cacheDirectory: directory, cacheMode: 'read-only' });
    assert.equal((await readOnly.compile({ source })).cache.status, 'hit');
    assert.equal((await readOnly.invalidate(first.cache.key)).status, 'read-only');
    assert.equal((await readOnly.compile({ source })).cache.status, 'hit');
    assert.equal((await readOnly.close()).graceful, true);

    assert.equal((await runtime.invalidate(first.cache.key)).status, 'invalidated');
    assert.equal((await runtime.invalidate(first.cache.key)).status, 'absent');
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, true);
    assert.equal(terminal.workerExitCode, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('trusted header profiles use deterministic nested-path identity and reject mutation', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f9-headers-'));
  const manifest = {
    profile: 'fixture-v1',
    algorithm: 'sha256-path-u32le-size-u64le-content-v1',
    roots: ['cuda', 'nv'],
    fileCount: 2,
    byteLength: 14,
    sha256: '124fe56c0bfa4058cda1b117b000bdd26aef7c590851fa1a37c4bf6ebc73a489',
  };
  try {
    await mkdir(path.join(directory, 'cuda'));
    await mkdir(path.join(directory, 'nv'));
    await writeFile(path.join(directory, 'cuda', 'atomic'), 'atomic\n');
    await writeFile(path.join(directory, 'nv', 'target'), 'target\n');
    const snapshot = await snapshotHeaderProfile(directory, manifest);
    assert.deepEqual(snapshot.headers.map((header) => header.name), ['cuda/atomic', 'nv/target']);
    assert(snapshot.headers.every((header) => header.source.at(-1) === 0));
    assert.deepEqual((await inventoryHeaderProfile(directory, ['cuda', 'nv'])).observed, {
      algorithm: manifest.algorithm,
      roots: manifest.roots,
      fileCount: manifest.fileCount,
      byteLength: manifest.byteLength,
      sha256: manifest.sha256,
    });
    await assert.rejects(snapshotHeaderProfile(directory, { ...manifest, fileCount: 3 }), { code: 'COMPILER_HEADER_PROFILE_IDENTITY' });
    await assert.rejects(snapshotHeaderProfile(directory, { ...manifest, byteLength: 15 }), { code: 'COMPILER_HEADER_PROFILE_IDENTITY' });
    await assert.rejects(snapshotHeaderProfile(directory, { ...manifest, sha256: '0'.repeat(64) }), { code: 'COMPILER_HEADER_PROFILE_IDENTITY' });
    await writeFile(path.join(directory, 'cuda', 'extra'), 'extra\n');
    await assert.rejects(snapshotHeaderProfile(directory, manifest), { code: 'COMPILER_HEADER_PROFILE_IDENTITY' });
    await rm(path.join(directory, 'cuda', 'extra'));
    await writeFile(path.join(directory, 'cuda', 'atomic'), 'changed\n');
    await assert.rejects(snapshotHeaderProfile(directory, manifest), { code: 'COMPILER_HEADER_PROFILE_IDENTITY' });
    await writeFile(path.join(directory, 'cuda', 'atomic'), Buffer.from([0]));
    await assert.rejects(snapshotHeaderProfile(directory, manifest), { code: 'COMPILER_HEADER_PROFILE_UNSAFE' });
    await assert.rejects(inventoryHeaderProfile(directory, ['cuda', 'missing']), { code: 'COMPILER_HEADER_PROFILE_MISSING' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('trusted header profiles admit exact top-level files and deterministic composition', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-numeric-headers-'));
  try {
    await mkdir(path.join(directory, 'nv'));
    await writeFile(path.join(directory, 'cuda_fp16.h'), 'half\n');
    await writeFile(path.join(directory, 'cuda_bf16.h'), 'bfloat\n');
    await writeFile(path.join(directory, 'nv', 'target'), 'target\n');

    const numericInventory = await inventoryHeaderProfile(directory, [], ['cuda_fp16.h', 'cuda_bf16.h']);
    const nvInventory = await inventoryHeaderProfile(directory, ['nv']);
    assert.deepEqual(numericInventory.observed.files, ['cuda_fp16.h', 'cuda_bf16.h']);
    assert.deepEqual(numericInventory.headers.map((header) => header.name), ['cuda_bf16.h', 'cuda_fp16.h']);

    const numeric = await snapshotHeaderProfile(directory, { profile: 'numeric-base', ...numericInventory.observed });
    const nv = await snapshotHeaderProfile(directory, { profile: 'nv-root', ...nvInventory.observed });
    const components = [
      { name: 'numeric', snapshot: numeric },
      { name: 'nv', snapshot: nv },
    ];
    const digest = createHash('sha256');
    for (const component of components) {
      const name = Buffer.from(component.name, 'utf8');
      const componentDigest = Buffer.from(component.snapshot.identity.sha256, 'ascii');
      const header = Buffer.alloc(8);
      header.writeUInt32LE(name.byteLength, 0);
      header.writeUInt32LE(componentDigest.byteLength, 4);
      digest.update(header).update(name).update(componentDigest);
    }
    const record = {
      profile: 'numeric-composite',
      algorithm: 'sha256-header-profile-components-v1',
      components: ['numeric', 'nv'],
      roots: ['nv'],
      files: ['cuda_fp16.h', 'cuda_bf16.h'],
      fileCount: 3,
      byteLength: 19,
      sha256: digest.digest('hex'),
    };
    const composite = composeHeaderProfiles(record, components);
    assert.deepEqual(composite.headers.map((header) => header.name), ['cuda_bf16.h', 'cuda_fp16.h', 'nv/target']);
    assert.deepEqual(composite.identity.components, ['numeric', 'nv']);
    assert.throws(() => composeHeaderProfiles({ ...record, fileCount: 4 }, components), { code: 'COMPILER_HEADER_PROFILE_IDENTITY' });
    assert.throws(() => composeHeaderProfiles({ ...record, components: ['numeric', 'numeric'] }, [components[0], { ...components[1], name: 'numeric' }]), { code: 'COMPILER_HEADER_PROFILE_MANIFEST' });
    assert.throws(() => composeHeaderProfiles({ ...record, files: ['cuda_fp16.h'] }, components), { code: 'COMPILER_HEADER_PROFILE_MANIFEST' });
    assert.throws(() => composeHeaderProfiles(record, [{ ...components[0], snapshot: { ...numeric, identity: { ...numeric.identity, sha256: 'invalid' } } }, components[1]]), { code: 'COMPILER_HEADER_PROFILE_MANIFEST' });
    assert.throws(() => composeHeaderProfiles(record, [
      { name: 'numeric', snapshot: numeric },
      { name: 'nv', snapshot: numeric },
    ]), { code: 'COMPILER_HEADER_PROFILE_MANIFEST' });

    const duplicate = {
      identity: { ...numeric.identity, sha256: 'f'.repeat(64) },
      headers: numeric.headers,
    };
    const duplicateDigest = createHash('sha256');
    for (const [name, snapshot] of [['numeric', numeric], ['nv', duplicate]]) {
      const nameBytes = Buffer.from(name, 'utf8');
      const componentDigest = Buffer.from(snapshot.identity.sha256, 'ascii');
      const header = Buffer.alloc(8);
      header.writeUInt32LE(nameBytes.byteLength, 0);
      header.writeUInt32LE(componentDigest.byteLength, 4);
      duplicateDigest.update(header).update(nameBytes).update(componentDigest);
    }
    assert.throws(() => composeHeaderProfiles({ ...record, sha256: duplicateDigest.digest('hex'), fileCount: 4, byteLength: 24 }, [
      { name: 'numeric', snapshot: numeric },
      { name: 'nv', snapshot: duplicate },
    ]), { code: 'COMPILER_HEADER_PROFILE_MANIFEST' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('trusted header profiles reject symbolic links when the host permits creating the fixture', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f9-symlink-'));
  try {
    await mkdir(path.join(directory, 'cuda'));
    await mkdir(path.join(directory, 'nv'));
    await writeFile(path.join(directory, 'target'), 'target\n');
    try {
      await symlink(path.join(directory, 'target'), path.join(directory, 'cuda', 'atomic'), 'file');
    } catch (error) {
      if (error?.code === 'EPERM' || error?.code === 'EACCES') {
        const targetDirectory = path.join(directory, 'target-directory');
        await mkdir(targetDirectory);
        try {
          await symlink(targetDirectory, path.join(directory, 'cuda', 'linked-directory'), 'junction');
        } catch (junctionError) {
          if (junctionError?.code === 'EPERM' || junctionError?.code === 'EACCES') {
            context.skip(`Host cannot create a symbolic-link or junction fixture: ${junctionError.code}`);
            return;
          }
          throw junctionError;
        }
      } else {
        throw error;
      }
    }
    await writeFile(path.join(directory, 'nv', 'target'), 'target\n');
    await assert.rejects(inventoryHeaderProfile(directory, ['cuda', 'nv']), { code: 'COMPILER_HEADER_PROFILE_UNSAFE' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('trusted header profiles reject non-regular entries on native Linux', { skip: process.platform !== 'linux' }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f9-nonregular-'));
  try {
    await mkdir(path.join(directory, 'cuda'));
    await mkdir(path.join(directory, 'nv'));
    await writeFile(path.join(directory, 'nv', 'target'), 'target\n');
    const fifo = path.join(directory, 'cuda', 'fifo');
    const created = spawnSync('mkfifo', [fifo], { encoding: 'utf8' });
    assert.equal(created.status, 0, created.stderr || 'mkfifo failed');
    await assert.rejects(inventoryHeaderProfile(directory, ['cuda', 'nv']), { code: 'COMPILER_HEADER_PROFILE_UNSAFE' });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('CompilerActor blocking work leaves the application loop responsive', async () => {
  const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
  let timerFired = false;
  const timer = new Promise((resolve) => setTimeout(() => { timerFired = true; resolve(); }, 20));
  const blocking = runtime[COMPILER_RUNTIME_TEST]('testing.block', { milliseconds: 100 });
  await timer;
  assert.equal(timerFired, true);
  await blocking;
  await runtime.close();
});

test('unexpected CompilerActor loss is restart-required without a cleanup claim', async () => {
  const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
  const terminal = await runtime[COMPILER_RUNTIME_TEST]('terminate');
  assert.equal(runtime.state, 'restart-required');
  assert.equal(runtime.health, 'restart-required');
  assert.equal(terminal.restartRequired, true);
  await assert.rejects(runtime.status(), { code: 'COMPILER_RUNTIME_CLOSED' });
});

test('CompilerActor public records reject native storage, paths, and source-shaped fields', () => {
  assert.throws(() => assertCompilerPublicRecord({ pointer: 1n }), { code: 'COMPILER_RESULT_NATIVE_VALUE' });
  assert.throws(() => assertCompilerPublicRecord({ bytes: Buffer.alloc(1) }), { code: 'COMPILER_RESULT_NATIVE_VALUE' });
  assert.throws(() => assertCompilerPublicRecord({ source: 'copied input' }), { code: 'COMPILER_RESULT_KEY' });
  assert.throws(() => assertCompilerPublicRecord({ message: 'failed at C:\\private\\provider.dll' }), { code: 'COMPILER_RESULT_PATH' });
  assert.deepEqual(assertCompilerPublicRecord({ artifact: { bytes: Uint8Array.of(1, 2) } }), { artifact: { bytes: Uint8Array.of(1, 2) } });
});

test('CompilerActor injected creation and operation failures recover only when destruction is proved', async () => {
  for (const mode of ['compile-create', 'compile-operation', 'link-create', 'link-operation']) {
    const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
    const compiled = mode.startsWith('link') ? await runtime.compile({ source }) : null;
    await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode });
    const operation = mode.startsWith('compile') ? runtime.compile({ source }) : runtime.link({ inputs: [compiled.artifact] });
    const stage = mode.endsWith('create') ? 'CREATE' : 'OPERATION';
    await assert.rejects(operation, { code: `${mode.startsWith('compile') ? 'COMPILER' : 'LINKER'}_INJECTED_${stage}_FAILURE` });
    assert.equal(runtime.health, 'healthy');
    const status = await runtime.status();
    assert.equal(status.resources.programsCreated, status.resources.programsDestroyed);
    assert.equal(status.resources.linksCreated, status.resources.linksDestroyed);
    await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode: 'none' });
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('CompilerActor injected destruction failure is restart-required and cleanup remains unproved', async () => {
  for (const mode of ['compile-destroy', 'link-destroy']) {
    const compiler = mode.startsWith('compile');
    const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
    const compiled = mode.startsWith('link') ? await runtime.compile({ source }) : null;
    await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode });
    const operation = mode.startsWith('compile') ? runtime.compile({ source }) : runtime.link({ inputs: [compiled.artifact] });
    await assert.rejects(operation, { code: mode.startsWith('compile') ? 'COMPILER_INJECTED_DESTROY_FAILURE' : 'LINKER_INJECTED_DESTROY_FAILURE' });
    assert.equal(runtime.health, 'restart-required');
    await assert.rejects(runtime.compile({ source }), { code: 'COMPILER_RESTART_REQUIRED' });
    const terminal = await runtime.close();
    assert.equal(terminal.graceful, false);
    assert.equal(terminal.cleanupClaim, 'unproved');
    assert.equal(terminal.restartRequired, true);
    assert.equal(terminal.materialFailure.code, compiler ? 'COMPILER_INJECTED_DESTROY_FAILURE' : 'LINKER_INJECTED_DESTROY_FAILURE');
    assert.equal(terminal.materialFailure.operation, compiler ? 'mock.nvrtcDestroyProgram' : 'mock.nvJitLinkDestroy');
    assert.equal(Object.hasOwn(terminal, 'primaryFailure'), false);
    assert.equal(terminal.cleanupFailures.length, 1);
  }
});

test('CompilerActor retains primary operation failure alongside failed destruction', async () => {
  for (const mode of ['compile-operation-destroy', 'link-operation-destroy']) {
    const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
    const compiled = mode.startsWith('link') ? await runtime.compile({ source }) : null;
    await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode });
    const operation = mode.startsWith('compile') ? runtime.compile({ source }) : runtime.link({ inputs: [compiled.artifact] });
    await assert.rejects(operation, (error) => {
      const compiler = mode.startsWith('compile');
      assert.equal(error.code, compiler ? 'COMPILER_INJECTED_DESTROY_FAILURE' : 'LINKER_INJECTED_DESTROY_FAILURE');
      assert.equal(error.category, 'restart-required');
      assert.equal(error.operation, compiler ? 'mock.nvrtcDestroyProgram' : 'mock.nvJitLinkDestroy');
      assert.equal(error.healthAfter, 'restart-required');
      assert.equal(error.details.primaryFailure.code, compiler ? 'COMPILER_INJECTED_OPERATION_FAILURE' : 'LINKER_INJECTED_OPERATION_FAILURE');
      assert.equal(error.details.primaryFailure.operation, compiler ? 'compiler.compile' : 'linker.link');
      assert.equal(error.details.cleanupFailures.length, 1);
      assert.equal(error.details.cleanupFailures[0].code, error.code);
      assert.equal(error.details.resultingHealth, 'restart-required');
      assert.equal(error.details.terminalInventory.disposition, 'unproved');
      assert.equal(JSON.stringify(error.details).includes('source'), false);
      return true;
    });
    assert.equal(runtime.health, 'restart-required');
    const terminal = await runtime.close();
    const compiler = mode.startsWith('compile');
    assert.equal(terminal.graceful, false);
    assert.equal(terminal.cleanupClaim, 'unproved');
    assert.equal(terminal.restartRequired, true);
    assert.equal(terminal.materialFailure.code, compiler ? 'COMPILER_INJECTED_DESTROY_FAILURE' : 'LINKER_INJECTED_DESTROY_FAILURE');
    assert.equal(terminal.primaryFailure.code, compiler ? 'COMPILER_INJECTED_OPERATION_FAILURE' : 'LINKER_INJECTED_OPERATION_FAILURE');
    assert.equal(terminal.cleanupFailures.length, 1);
  }
});

test('CompilerActor close retains every bounded provider-library cleanup failure in terminal truth', async () => {
  const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
  await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode: 'close-libraries' });
  const terminal = await runtime.close();
  assert.equal(runtime.state, 'restart-required');
  assert.equal(runtime.health, 'restart-required');
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.cleanupClaim, 'unproved');
  assert.equal(terminal.closeFailure.code, 'COMPILER_LIBRARY_CLOSE_FAILED');
  assert.equal(terminal.closeFailure.category, 'restart-required');
  assert.equal(terminal.closeFailure.operation, 'mock.library.close');
  assert.equal(terminal.cleanupFailures.length, 2);
  assert.deepEqual(terminal.cleanupFailures.map((failure) => failure.details.provider), ['nvJitLink', 'nvrtc']);
  assert.equal(terminal.resultingHealth, 'restart-required');
  assert.equal(terminal.terminalInventory.disposition, 'unproved');
});

test('CompilerActor terminal preserves the first operation divergence alongside later provider-close failures', async () => {
  const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
  await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode: 'close-libraries' });
  await runtime[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode: 'compile-operation-destroy' });
  await assert.rejects(runtime.compile({ source }), { code: 'COMPILER_INJECTED_DESTROY_FAILURE' });

  const terminal = await runtime.close();
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.materialFailure.code, 'COMPILER_INJECTED_DESTROY_FAILURE');
  assert.equal(terminal.materialFailure.operation, 'mock.nvrtcDestroyProgram');
  assert.equal(terminal.primaryFailure.code, 'COMPILER_INJECTED_OPERATION_FAILURE');
  assert.equal(terminal.closeFailure.code, 'COMPILER_LIBRARY_CLOSE_FAILED');
  assert.equal(terminal.closeFailure.operation, 'mock.library.close');
  assert.deepEqual(terminal.cleanupFailures.map((failure) => failure.code), [
    'COMPILER_INJECTED_DESTROY_FAILURE',
    'COMPILER_INJECTED_LIBRARY_CLOSE_FAILURE',
    'COMPILER_INJECTED_LIBRARY_CLOSE_FAILURE',
  ]);
  assert.equal(terminal.cleanupFailureCount, 3);
  assert.equal(terminal.cleanupFailuresTruncated, 0);
  assert.equal(terminal.resultingHealth, 'restart-required');
  assert.equal(terminal.terminalInventory.disposition, 'unproved');
});

test('compiler cleanup products are capped and omit source, path, log, and raw error text', () => {
  const primary = new CompilerRuntimeError(
    'NVRTC_COMPILE_FAILED',
    'compile',
    'Compilation failed.',
    { nativeStatus: 6, nativeMessage: `host secret-machine token ${'a'.repeat(32)} bare ${'b'.repeat(32)}`, log: 'secret source at C:\\private\\kernel.cu', source: 'secret' },
    { operation: 'compiler.compile' },
  );
  const cleanupFailures = [
    new CompilerRuntimeError(
      'COMPILER_PROVIDER_CLOSE_FAILED',
      'restart-required',
      'cleanup failed for machine build-17',
      { nativeMessage: 'user secret-user runtimeId runtime-secret account@example.test' },
      { operation: 'compiler.library.close', healthBefore: 'healthy', healthAfter: 'restart-required' },
    ),
    ...Array.from({ length: 11 }, (_, index) => Object.assign(new Error(`private C:\\provider-${index}.dll`), { code: `ERR_CLOSE_${index}` })),
  ];
  const combined = combineCompilerCleanupFailures(primary, cleanupFailures, {
    code: 'COMPILER_LIBRARY_CLOSE_FAILED',
    category: 'restart-required',
    message: 'Compiler provider cleanup failed.',
    operation: 'compiler.library.close',
    inventory: { programsCreated: 1, programsDestroyed: 0 },
  });
  assert.equal(combined.details.cleanupFailures.length, 8);
  assert.equal(combined.details.cleanupFailuresOmitted, 4);
  assert.equal(combined.details.primaryFailure.details.nativeStatus, 6);
  assert.equal(Object.hasOwn(combined.details.primaryFailure.details, 'nativeMessage'), false);
  assert.equal(combined.details.cleanupFailures[0].message, 'Compiler operation failed.');
  assert.equal(Object.hasOwn(combined.details.cleanupFailures[0].details, 'nativeMessage'), false);
  const publicFailure = {
    code: combined.code,
    category: combined.category,
    operation: combined.operation,
    details: combined.details,
    healthBefore: combined.healthBefore,
    healthAfter: combined.healthAfter,
  };
  assert.doesNotThrow(() => assertCompilerPublicRecord(publicFailure));
  const serialized = JSON.stringify(publicFailure);
  assert.equal(serialized.includes('private'), false);
  assert.equal(serialized.includes('kernel.cu'), false);
  assert.equal(serialized.includes('secret'), false);
  assert.equal(serialized.includes('build-17'), false);
  assert.equal(serialized.includes('runtime-secret'), false);
  assert.equal(serialized.includes('account@example.test'), false);
  assert.equal(serialized.includes('a'.repeat(32)), false);
  assert.equal(serialized.includes('b'.repeat(32)), false);
  assert.equal(serialized.includes('log'), false);
  assert.equal(serialized.includes('source'), false);
});

test('unexpected cache filesystem failures are sanitized before crossing the Worker boundary', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f7-cache-failure-'));
  const file = path.join(directory, 'not-a-directory');
  try {
    await writeFile(file, 'occupied');
    await assert.rejects(openCompilerRuntimeForTesting({ cacheDirectory: file }), (error) => {
      assert.equal(error.code, 'COMPILER_INTERNAL');
      assert.equal(error.message, 'CompilerActor internal failure.');
      assert(!error.message.includes(directory));
      assert.deepEqual(error.details, {});
      return true;
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('native CompilerActor fails before Worker creation when the process FFI flag is absent', async () => {
  if (process.execArgv.includes('--experimental-ffi')) return;
  await assert.rejects(openCompilerRuntime({ cacheMode: 'disabled' }), { code: 'COMPILER_FFI_FLAG_REQUIRED' });
});
