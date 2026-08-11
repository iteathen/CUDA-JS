import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { COMPILER_RUNTIME_TEST, normalizeCompileOptions, openCompilerRuntimeForTesting } from '../../components/compiler-actor/testing.mjs';
import { sourceIdentity, writeEvidence } from './evidence.mjs';

const cacheDirectory = await mkdtemp(path.join(os.tmpdir(), 'cuda-js-f6-portable-'));
const source = 'extern "C" __global__ void portable_kernel() {}\n';
let observations;
try {
  const runtime = await openCompilerRuntimeForTesting({ cacheDirectory });
  const compiled = await runtime.compile({ source });
  const hit = await runtime.compile({ source });
  assert.equal(compiled.cache.status, 'miss');
  assert.equal(hit.cache.status, 'hit');
  assert.deepEqual(hit.artifact.bytes, compiled.artifact.bytes);
  const linked = await runtime.link({ inputs: [compiled.artifact] });
  assert.equal(linked.artifact.format, 'cubin');
  await writeFile(path.join(cacheDirectory, `${compiled.cache.key}.bin`), Uint8Array.of(7));
  const repaired = await runtime.compile({ source });
  assert.equal(repaired.cache.status, 'miss');
  assert.deepEqual(repaired.artifact.bytes, compiled.artifact.bytes);

  let timerFired = false;
  const blocking = runtime[COMPILER_RUNTIME_TEST]('testing.block', { milliseconds: 75 });
  await new Promise((resolve) => setTimeout(() => { timerFired = true; resolve(); }, 10));
  assert.equal(timerFired, true);
  await blocking;
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  observations = {
    linuxOptions: normalizeCompileOptions({}, 'linux').native,
    windowsOptions: normalizeCompileOptions({}, 'win32').native,
    cache: { miss: compiled.cache.status, hit: hit.cache.status, corruption: repaired.cache.status, key: compiled.cache.key },
    artifacts: { ptx: { byteLength: compiled.artifact.byteLength, sha256: compiled.artifact.sha256 }, cubin: { byteLength: linked.artifact.byteLength, sha256: linked.artifact.sha256 } },
    applicationTimerFired: timerFired,
    terminal,
  };
  assert.equal(observations.linuxOptions.at(-1), '--modify-stack-limit=false');
  assert(!observations.windowsOptions.includes('--modify-stack-limit=false'));
} finally {
  await rm(cacheDirectory, { recursive: true, force: true });
}

await writeEvidence('portable.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F6',
  capsule: 'portable-compiler-cache-lifecycle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, osVersion: os.version() },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0006-compiler-linker-cache.md',
    'components/compiler-actor/src/contract.mjs',
    'components/compiler-actor/src/cache.mjs',
    'components/compiler-actor/src/actor-worker.mjs',
  ]),
  observations,
  claimLimits: ['Platform-neutral request, cache, protocol, and lifecycle behavior only.', 'No native provider, Driver, GPU, or Linux CUDA support claim.'],
});
console.log('F6 portable conformance passed: typed options, Linux side-effect guard, cache validation/corruption, responsive actor, and graceful close.');
