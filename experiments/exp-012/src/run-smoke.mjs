import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

import { sha256 } from './evidence.mjs';
import { driverPath, evidenceRoot, repositoryRoot } from './paths.mjs';

const buildEvidence = JSON.parse(await readFile(path.join(evidenceRoot, 'build.json'), 'utf8'));

function runWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./driver-worker.mjs', import.meta.url), {
      workerData: { driverPath },
      execArgv: ['--experimental-ffi'],
    });
    let message;
    worker.once('message', (value) => { message = value; });
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (!message) return reject(new Error(`EXP-012 Worker exited with ${code} before producing evidence.`));
      if (!message.ok) return reject(Object.assign(new Error(message.error.message), message.error));
      if (code !== 0) return reject(new Error(`EXP-012 Worker exited with ${code}.`));
      resolve({ ...message.result, workerExitCode: code });
    });
  });
}

function parsePermissionProbe(args) {
  const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error) throw result.error;
  const line = result.stdout.trim().split(/\r?\n/).at(-1);
  assert(line, `Permission probe produced no JSON. stderr=${result.stderr}`);
  return { processStatus: result.status, record: JSON.parse(line), stderr: result.stderr.trim() };
}

const result = await runWorker();
assert.deepEqual(result.cuda, buildEvidence.oracle.cuda, 'Node FFI CUDA observations must exactly match the independent C oracle.');
assert.equal(result.profile.node, 'v26.7.0');
assert.deepEqual(result.boundSymbols, [
  'cuCtxCreate_v4', 'cuCtxDestroy_v2', 'cuCtxGetCurrent', 'cuCtxSetCurrent',
  'cuDeviceGet', 'cuDeviceGetAttribute', 'cuDeviceGetCount', 'cuDriverGetVersion',
  'cuGetErrorName', 'cuGetErrorString', 'cuGetProcAddress_v2', 'cuInit',
]);
assert.equal(result.missingLibrary.rejected, true);
assert.deepEqual(result.missingLibrary.error, { name: 'Error', code: 'ERR_FFI_CALL_FAILED' });
assert.equal(result.cuda.invalidInitFlagsStatus, 1);
assert.equal(result.cuda.procAddress.negatives.missingSymbol.status, 1);
assert.equal(result.cuda.procAddress.negatives.missingSymbol.nonzero, false);
assert.equal(result.cuda.procAddress.negatives.insufficientVersion.status, 2);
assert.equal(result.cuda.procAddress.negatives.insufficientVersion.nonzero, false);
assert.equal(result.cuda.procAddress.negatives.versionedQueryName.status, 1);
assert.equal(result.cuda.procAddress.negatives.versionedQueryName.nonzero, false);
for (const entry of result.cuda.procAddress.entries) {
  assert.equal(entry.result, 0, `${entry.publicName} procedure query failed.`);
  assert.equal(entry.status, 0, `${entry.publicName} procedure query status failed.`);
  assert.equal(entry.nonzero, true, `${entry.publicName} procedure query returned null.`);
  assert.equal(entry.namedExportAvailable, true, `${entry.nativeSymbol} export is missing.`);
}
assert.deepEqual(result.cleanup, {
  contextDestroyed: true,
  currentNull: true,
  libraryClosed: true,
  staleWrapperRejected: true,
  staleWrapperError: { name: 'Error', code: 'ERR_FFI_LIBRARY_CLOSED' },
});
assert.equal(result.workerExitCode, 0);

const probeScript = path.join(repositoryRoot, 'experiments', 'exp-012', 'src', 'permission-probe.mjs');
const fsPermission = `--allow-fs-read=${repositoryRoot}`;
const denied = parsePermissionProbe(['--permission', fsPermission, '--experimental-ffi', probeScript, driverPath]);
const allowed = parsePermissionProbe(['--permission', fsPermission, '--allow-ffi', '--experimental-ffi', probeScript, driverPath]);
assert.equal(denied.record.ok, false, 'Permission model must deny FFI without --allow-ffi.');
assert.equal(denied.record.code, 'ERR_ACCESS_DENIED');
assert.equal(denied.processStatus, 0);
assert.deepEqual(allowed.record, { ok: true, status: 0 }, 'Permission model must allow the explicit FFI profile.');
assert.equal(allowed.processStatus, 0);

const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-012',
  capsule: 'windows-node-ffi-cuda-smoke',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  driver: { path: driverPath, sha256: await sha256(driverPath) },
  buildEvidenceSha256: await sha256(path.join(evidenceRoot, 'build.json')),
  result,
  permission: { denied, allowed },
  oracleAgreement: 'exact-sanitized-record-match',
  rawPointerBoundary: 'no pointer values cross the Worker boundary',
  claimLimits: [
    'Exact Windows x64 Node 26.7.0 / Driver / Toolkit / GPU profile only.',
    'Linux support remains incomplete and deferred.',
    'No returned procedure pointer is invoked.',
    'No production DriverActor, memory, module, launch, completion, compiler, Fast FFI, performance, packaging, or public API claim.',
  ],
};
await writeFile(path.join(evidenceRoot, 'smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`EXP-012 Windows CUDA smoke passed: Driver ${result.cuda.driverVersion.value}, device ${result.cuda.device.value}, compute capability ${result.cuda.attributes.computeCapabilityMajor.value}.${result.cuda.attributes.computeCapabilityMinor.value}.`);
console.log(`Evidence: ${path.relative(repositoryRoot, path.join(evidenceRoot, 'smoke.json'))}`);
