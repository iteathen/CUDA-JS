import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { assertCompilerPublicRecord, COMPILER_RUNTIME_TEST, normalizeCompileOptions, normalizeCompileRequest, normalizeLinkRequest, openCompilerRuntimeForTesting } from '../testing.mjs';
import { openCompilerRuntime } from '../index.mjs';

const source = 'extern "C" __global__ void k() {}\n';

test('typed compiler and linker contracts normalize deterministically and reject ambient inputs', () => {
  assert.deepEqual(normalizeCompileOptions({}, 'win32').native, [
    '--gpu-architecture=compute_75', '--std=c++17', '--fmad=false', '--frandom-seed=0', '--no-cache',
  ]);
  assert.deepEqual(normalizeCompileOptions({}, 'linux').native.slice(-1), ['--modify-stack-limit=false']);
  const request = normalizeCompileRequest({ source, headers: [{ name: 'z.h', source: 'z' }, { name: 'a.h', source: 'a' }] }, 'linux');
  assert.deepEqual(request.headers.map((header) => header.name), ['a.h', 'z.h']);
  assert.throws(() => normalizeCompileRequest({ source, path: 'kernel.cu' }), { code: 'COMPILER_REQUEST_INVALID' });
  assert.throws(() => normalizeCompileRequest({ source, options: { arbitrary: '--use-fast-math' } }), { code: 'COMPILER_OPTIONS_INVALID' });
  assert.throws(() => normalizeLinkRequest({ inputs: [new Uint8Array([1, 0, 2])] }), { code: 'LINKER_INPUT_INVALID' });
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
