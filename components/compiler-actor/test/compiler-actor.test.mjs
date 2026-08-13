import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { assertCompilerPublicRecord, compileIdentity, COMPILER_RUNTIME_TEST, inventoryHeaderProfile, linkIdentity, normalizeCompileOptions, normalizeCompileRequest, normalizeLinkRequest, openCompilerRuntimeForTesting, snapshotHeaderProfile } from '../testing.mjs';
import { openCompilerRuntime } from '../index.mjs';

const source = 'extern "C" __global__ void k() {}\n';

test('typed compiler and linker contracts normalize deterministically and reject ambient inputs', () => {
  assert.deepEqual(normalizeCompileOptions({}, 'win32').native, [
    '--gpu-architecture=compute_75', '--std=c++17', '--fmad=false', '--frandom-seed=0', '--no-cache',
  ]);
  assert.equal(normalizeCompileOptions({}, 'win32').headerProfile, 'none');
  assert.equal(normalizeCompileOptions({ headerProfile: 'cuda-cccl' }, 'win32').headerProfile, 'cuda-cccl');
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
      headerProfiles: { cudaCccl: { profile: 'fixture-cccl', algorithm: 'fixture', roots: ['cuda', 'nv'], fileCount: 1, byteLength: 1, sha256: '0'.repeat(64) } },
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
  const linkedIdentity = linkIdentity(normalizeLinkRequest({ inputs: [new Uint8Array([1, 2, 3])] }), provider);
  assert.equal(Object.hasOwn(linkedIdentity.provider, 'headerProfiles'), false);
});

test('compiler and linker consume admitted three-digit targets and target-policy identity', () => {
  const provider = {
    platform: 'win32', architecture: 'x64', node: 'v26.7.0', nodeAbi: '147',
    identity: { profile: 'fixture', nvrtc: null, nvrtcBuiltins: null, nvJitLink: null, headerProfiles: {} },
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

test('CompilerActor serializes work, validates cache hits, rejects corruption, and invalidates exact keys', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f6-cache-'));
  try {
    const runtime = await openCompilerRuntimeForTesting({ cacheDirectory: directory });
    const first = await runtime.compile({ source });
    assert.equal(first.cache.status, 'miss');
    assert.equal(first.artifact.format, 'ptx');
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
  }
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
