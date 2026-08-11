import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

import { parseOracle, sha256 } from '../../exp-012/src/evidence.mjs';
import { evidenceRoot, oracleExecutablePath, repositoryRoot } from './paths.mjs';

const readiness = JSON.parse(await readFile(path.join(evidenceRoot, 'readiness.json'), 'utf8'));
assert.equal(readiness.status, 'ready', 'EXP-001 real smoke requires a ready native Linux Driver/GPU environment. Run npm run exp:001:readiness.');
const driverPath = readiness.observed.driverPath;

function runWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../../exp-012/src/driver-worker.mjs', import.meta.url), {
      workerData: { driverPath, experimentId: 'EXP-001' },
      execArgv: ['--experimental-ffi'],
    });
    let message;
    worker.once('message', (value) => { message = value; });
    worker.once('error', reject);
    worker.once('exit', (code) => {
      if (!message) return reject(new Error(`EXP-001 Worker exited with ${code} before producing evidence.`));
      if (!message.ok) return reject(Object.assign(new Error(message.error.message), message.error));
      if (code !== 0) return reject(new Error(`EXP-001 Worker exited with ${code}.`));
      resolve({ ...message.result, workerExitCode: code });
    });
  });
}

function permissionProbe(args) {
  const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error) throw result.error;
  return { processStatus: result.status, record: JSON.parse(result.stdout.trim().split(/\r?\n/).at(-1)), stderr: result.stderr.trim() };
}

const oracleProcess = spawnSync(oracleExecutablePath, [], { cwd: path.dirname(oracleExecutablePath), encoding: 'utf8' });
if (oracleProcess.error) throw oracleProcess.error;
assert.equal(oracleProcess.status, 0, `Linux C oracle failed: ${oracleProcess.stderr}`);
const oracle = parseOracle(oracleProcess.stdout);
const result = await runWorker();
assert.deepEqual(result.cuda, oracle.cuda, 'Linux Node FFI observations must exactly match the independent C oracle.');
assert.equal(result.profile.platform, 'linux');
assert.equal(result.profile.architecture, 'x64');
assert.equal(result.boundSymbols.length, 12);
assert.equal(result.cleanup.contextDestroyed, true);
assert.equal(result.cleanup.currentNull, true);
assert.equal(result.cleanup.staleWrapperRejected, true);

const probeScript = path.join(repositoryRoot, 'experiments', 'exp-001', 'src', 'permission-probe.mjs');
const fsPermission = `--allow-fs-read=${repositoryRoot}`;
const denied = permissionProbe(['--permission', fsPermission, '--experimental-ffi', probeScript, driverPath]);
const allowed = permissionProbe(['--permission', fsPermission, '--allow-ffi', '--experimental-ffi', probeScript, driverPath]);
assert.equal(denied.record.code, 'ERR_ACCESS_DENIED');
assert.deepEqual(allowed.record, { ok: true, status: 0 });

const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-001',
  capsule: 'native-linux-node-ffi-cuda-smoke',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  readiness,
  driver: { path: driverPath, sha256: await sha256(driverPath) },
  oracle: { executableSha256: await sha256(oracleExecutablePath), observations: oracle.cuda },
  result,
  permission: { denied, allowed },
  rawPointerBoundary: 'no pointer values cross the Worker boundary',
  claimLimits: [
    'Exact native Linux x86-64 Node/Driver/GPU profile only.',
    'No WSL, Windows, ARM64, Fast FFI, performance, broad CUDA, or production actor claim.',
  ],
};
await writeFile(path.join(evidenceRoot, 'smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`EXP-001 native Linux CUDA smoke passed: ${readiness.observed.nvidiaSmi.stdout}`);
