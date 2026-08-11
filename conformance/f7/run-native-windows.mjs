import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import { openCompilerRuntime } from '../../components/compiler-actor/index.mjs';
import { openDriverRuntime } from '../../components/driver-actor/index.mjs';
import { assessCudaSupport, inspectHostProfile } from '../../components/platform-diagnostics/index.mjs';
import { repositoryRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F7W native conformance requires Windows.');
assert.equal(process.arch, 'x64', 'F7W native conformance requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F7W native conformance requires exact Node v26.7.0.');
assert(process.execArgv.includes('--experimental-ffi'), 'F7W native conformance requires experimental FFI.');

function permissionProbe(target, allowFfi) {
  const toolkitRoot = path.resolve(process.env.CUDA_PATH_V13_3 ?? process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
  const systemRoot = path.resolve(process.env.SystemRoot);
  const args = [
    '--permission',
    `--allow-fs-read=${repositoryRoot}`,
    `--allow-fs-read=${systemRoot}`,
    `--allow-fs-read=${toolkitRoot}`,
    '--allow-worker',
    ...(allowFfi ? ['--allow-ffi'] : []),
    '--experimental-ffi',
    path.join(repositoryRoot, 'conformance', 'f7', 'permission-probe.mjs'),
    target,
  ];
  const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error) throw result.error;
  const line = result.stdout.trim().split(/\r?\n/).at(-1);
  assert(line, `F7 ${target} permission probe produced no result.`);
  return { processStatus: result.status, record: JSON.parse(line), stderrPresent: result.stderr.trim().length > 0 };
}

const started = Date.now();
const rssBefore = process.memoryUsage().rss;
const host = inspectHostProfile();
const source = 'extern "C" __global__ void f7_native() {}\n';
const driverCycles = [];
const compilerCycles = [];

for (let index = 0; index < 8; index += 1) {
  const runtime = await openDriverRuntime();
  const description = await runtime.describe();
  const assessment = assessCudaSupport(host, description);
  assert.equal(assessment.status, 'testing-unconfirmed');
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.workerExitCode, 0);
  assert.deepEqual(terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 2, orphaned: 0 });
  driverCycles.push({ assessment, attributes: description.device.attributes, terminal: { graceful: terminal.graceful, workerExitCode: terminal.workerExitCode, counts: terminal.teardown.inventory.counts } });
}
for (const cycle of driverCycles.slice(1)) assert.deepEqual(cycle.attributes, driverCycles[0].attributes);

for (let index = 0; index < 8; index += 1) {
  const runtime = await openCompilerRuntime({ cacheMode: 'disabled' });
  const compiled = await runtime.compile({ source: `${source}// ${index}\n` });
  const linked = await runtime.link({ inputs: [compiled.artifact] });
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.workerExitCode, 0);
  assert.equal(terminal.resources.programsCreated, terminal.resources.programsDestroyed);
  assert.equal(terminal.resources.linksCreated, terminal.resources.linksDestroyed);
  compilerCycles.push({ compile: { byteLength: compiled.artifact.byteLength, sha256: compiled.artifact.sha256 }, link: { byteLength: linked.artifact.byteLength, sha256: linked.artifact.sha256 }, terminal: { graceful: terminal.graceful, workerExitCode: terminal.workerExitCode, resources: terminal.resources } });
}

const permissions = {
  driver: { denied: permissionProbe('driver', false), allowed: permissionProbe('driver', true) },
  compiler: { denied: permissionProbe('compiler', false), allowed: permissionProbe('compiler', true) },
};
for (const [target, result] of Object.entries(permissions)) {
  assert.equal(result.denied.processStatus, 0, `${target} denial probe process failed.`);
  assert.equal(result.denied.record.ok, false, `${target} must fail without FFI permission.`);
  assert.equal(result.denied.record.code, 'ERR_ACCESS_DENIED', `${target} denial must be attributable to FFI permission.`);
  assert.equal(result.allowed.processStatus, 0, `${target} allow probe process failed.`);
  assert.deepEqual(result.allowed.record, { ok: true, target, backend: target === 'driver' ? 'windows-native' : 'windows-native', graceful: true, workerExitCode: 0 });
}

const elapsedMilliseconds = Date.now() - started;
const rssAfter = process.memoryUsage().rss;
const rssGrowthBytes = Math.max(0, rssAfter - rssBefore);
assert(elapsedMilliseconds < 180_000, `Native F7 hardening exceeded its broad three minute regression ceiling: ${elapsedMilliseconds}ms.`);
assert(rssGrowthBytes < 512 * 1_048_576, `Native F7 stress exceeded its broad 512 MiB process-memory ceiling: ${rssGrowthBytes}.`);

await writeEvidence('native-windows.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F7W',
  capsule: 'windows-platform-permission-native-lifecycle-hardening',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { host, osVersion: os.version() },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0007-windows-platform-hardening.md',
    'components/platform-diagnostics/src/platform-diagnostics.mjs',
    'components/driver-actor/src/backends/windows-native.mjs',
    'components/compiler-actor/src/actor-worker.mjs',
    'conformance/f7/permission-probe.mjs',
  ]),
  observations: { driverCycles, compilerCycles, permissions, elapsedMilliseconds, rssBefore, rssAfter, rssGrowthBytes },
  claimLimits: ['Execution is a testing-phase operation and does not promote support.', 'Exact Windows x64 Node 26.7.0 CUDA 13.3 evidence identity only.', 'Elapsed time and process memory are broad regression observations, not performance claims.', 'No device state is changed.', 'No WSL or native Linux CUDA support claim.'],
});

console.log(`F7W native conformance passed: ${driverCycles[0].assessment.cuda.driverModel}, watchdog ${driverCycles[0].assessment.cuda.watchdog}, 16 graceful native actor cycles, and explicit permission denial/allow.`);
