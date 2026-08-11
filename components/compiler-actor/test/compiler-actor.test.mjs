import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { COMPILER_RUNTIME_TEST, normalizeCompileOptions, normalizeCompileRequest, normalizeLinkRequest, openCompilerRuntimeForTesting } from '../testing.mjs';

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
