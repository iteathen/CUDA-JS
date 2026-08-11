import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SyntheticFfiActor } from './actor-client.mjs';
import { evidenceRoot, nativeLibraryPath, repositoryRoot } from './paths.mjs';

function parseProbe(args) {
  const result = spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Permission probe exited ${result.status}: ${result.stderr}`);
  const line = result.stdout.trim().split(/\r?\n/).at(-1);
  return JSON.parse(line);
}

const records = {};

const resourceActor = await SyntheticFfiActor.create();
const token = await resourceActor.allocate(16);
const copied = await resourceActor.copyAllocation(token);
assert.deepEqual(copied, Array.from({ length: 16 }, (_, index) => (index * 17 + 3) & 0xff));
const release = await resourceActor.release(token);
assert.equal(release.state, 'closed');
let staleError;
try {
  await resourceActor.copyAllocation(token);
} catch (error) {
  staleError = { code: error.code, message: error.message };
}
assert.equal(staleError.code, 'CJS_STALE_RESOURCE');

const foreignView = await resourceActor.request('foreign-view-probe');
assert.notEqual(foreignView.copy[0], foreignView.afterMutation[0]);
const resourceCleanup = await resourceActor.close();
assert.equal(resourceCleanup.cleanup.nativeLiveAfterResources, '0');
let closedError;
try {
  await resourceActor.inventory();
} catch (error) {
  closedError = { code: error.code, message: error.message };
}
assert.equal(closedError.code, 'CJS_RUNTIME_CLOSED');
records.resources = { token, copied, release, staleError, foreignView, cleanup: resourceCleanup, closedError };

const crossRuntimeA = await SyntheticFfiActor.create();
const crossRuntimeB = await SyntheticFfiActor.create();
const crossToken = await crossRuntimeA.allocate(8);
let crossRuntimeError;
try {
  await crossRuntimeB.copyAllocation(crossToken);
} catch (error) {
  crossRuntimeError = { code: error.code, message: error.message };
}
assert.equal(crossRuntimeError.code, 'CJS_CROSS_RUNTIME');
await crossRuntimeA.release(crossToken);
await Promise.all([crossRuntimeA.close(), crossRuntimeB.close()]);
records.crossRuntime = crossRuntimeError;

const blockingActor = await SyntheticFfiActor.create();
let ticks = 0;
const interval = setInterval(() => ticks++, 10);
const started = performance.now();
const slept = await blockingActor.execute('lifecycle.blocking-worker', { milliseconds: 180 });
const elapsedMilliseconds = performance.now() - started;
clearInterval(interval);
await blockingActor.close();
assert.equal(slept, 180);
assert.ok(ticks >= 8, `Main event loop ticked only ${ticks} times during Worker-native sleep.`);
records.responsiveness = { requestedMilliseconds: 180, elapsedMilliseconds, mainLoopTicks: ticks };

const closeActor = await SyntheticFfiActor.create();
const closeProbe = await closeActor.request('library-close-probe');
assert.equal(closeProbe.doubleClose, 'no-op');
assert.equal(closeProbe.staleWrapperRejected, true);
const closeCleanup = await closeActor.close();
records.libraryClose = { closeProbe, cleanup: closeCleanup };

const unexpectedActor = await SyntheticFfiActor.create();
const libraryObject = await unexpectedActor.request('hold-stable');
const unexpected = await unexpectedActor.terminateUnexpectedly();
assert.equal(unexpected.restartRequired, true);
assert.equal(unexpected.exit.state, 'dead');
assert.equal(unexpected.inventory.nativeLiveAllocations, '0');
records.unexpectedWorkerLoss = { libraryObject, ...unexpected };

const probeScript = path.join(repositoryRoot, 'experiments', 'exp-000', 'src', 'permission-probe.mjs');
const fsPermission = `--allow-fs-read=${repositoryRoot}`;
const denied = parseProbe(['--permission', fsPermission, '--experimental-ffi', probeScript, nativeLibraryPath]);
const allowed = parseProbe(['--permission', fsPermission, '--allow-ffi', '--experimental-ffi', probeScript, nativeLibraryPath]);
assert.equal(denied.ok, false);
assert.equal(denied.code, 'ERR_ACCESS_DENIED');
assert.deepEqual(allowed, { ok: true, value: 324508639 });
records.permission = { denied, allowed };

const finalActor = await SyntheticFfiActor.create();
const finalInventory = await finalActor.inventory();
assert.equal(finalInventory.nativeLiveAllocations, '0');
const finalCleanup = await finalActor.close();
records.finalInventory = { before: finalInventory, cleanup: finalCleanup };

await mkdir(evidenceRoot, { recursive: true });
const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-000',
  capsule: 'lifecycle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  profile: { node: process.version, platform: process.platform, architecture: process.arch },
  records,
  claimLimits: [
    'Unexpected Worker loss invalidates the runtime and requires restart; it does not claim inaccessible native cleanup.',
    'The zero-copy foreign view remains experiment-private and is never returned by the public actor client.',
    'No CUDA context or resource is exercised.',
  ],
};
await writeFile(path.join(evidenceRoot, 'lifecycle.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log('EXP-000 lifecycle: pass');
console.log(`Evidence: ${path.relative(repositoryRoot, path.join(evidenceRoot, 'lifecycle.json'))}`);
