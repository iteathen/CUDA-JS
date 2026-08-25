import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot, nativeEvidenceName } from './evidence.mjs';

const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable.json'), 'utf8'));
assert.equal(portable.status, 'pass');
assert.equal(portable.observations.propertyPartitions.count, 256);
assert.match(portable.observations.propertyPartitions.sha256, /^[a-f0-9]{64}$/);
assert.equal(portable.observations.stress.driverCycles, 24);
assert.equal(portable.observations.stress.compilerCycles, 24);
assert.equal(portable.observations.applicationTimerFired, true);
assert(portable.observations.stress.driverTerminals.every((entry) => entry.graceful && entry.workerExitCode === 0 && entry.counts.live === 0 && entry.counts.orphaned === 0));
assert(portable.observations.stress.compilerTerminals.every((entry) => entry.graceful && entry.workerExitCode === 0 && entry.resources.programsCreated === entry.resources.programsDestroyed && entry.resources.linksCreated === entry.resources.linksDestroyed));

const nativePath = path.join(evidenceRoot, nativeEvidenceName);
if (['win32', 'linux'].includes(process.platform) && process.arch === 'x64' && existsSync(nativePath)) {
  const native = JSON.parse(await readFile(nativePath, 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.observations.driverCycles.length, 8);
  assert.equal(native.observations.compilerCycles.length, 8);
  assert.equal(native.observations.driverCycles[0].assessment.status, 'testing-unconfirmed');
  assert(process.platform === 'win32'
    ? ['wddm-watchdog', 'wddm-no-watchdog', 'tcc'].includes(native.observations.driverCycles[0].assessment.cuda.driverModel)
    : native.observations.driverCycles[0].assessment.cuda.driverModel === 'linux-native');
  assert(native.observations.driverCycles.every((entry) => entry.terminal.graceful && entry.terminal.workerExitCode === 0 && entry.terminal.counts.live === 0 && entry.terminal.counts.orphaned === 0));
  assert(native.observations.compilerCycles.every((entry) => entry.terminal.graceful && entry.terminal.workerExitCode === 0 && entry.terminal.resources.programsCreated === entry.terminal.resources.programsDestroyed && entry.terminal.resources.linksCreated === entry.terminal.resources.linksDestroyed));
  for (const target of ['driver', 'compiler']) {
    assert.equal(native.observations.permissions[target].denied.record.ok, false);
    assert.equal(native.observations.permissions[target].denied.record.code, 'ERR_ACCESS_DENIED');
    assert.equal(native.observations.permissions[target].allowed.record.ok, true);
    assert.equal(native.observations.permissions[target].allowed.record.graceful, true);
  }
}

if (process.platform === 'linux' && !existsSync(nativePath)) {
  const readiness = JSON.parse(await readFile(path.join(evidenceRoot, 'linux-readiness.json'), 'utf8'));
  assert(['diagnostic-source-ready-not-qualified', 'prepared-not-qualified'].includes(readiness.status));
  assert(['linux-native-x64', 'linux-native-arm64'].includes(readiness.host.hostKind));
  assert(!readiness.host.hostKind.startsWith('wsl'));
}

console.log(`F7 verification passed for ${process.platform}-${process.arch}: platform classification, sanitized actor boundaries, failure/property partitions, and repeated lifecycle stress${existsSync(nativePath) ? ', plus native CUDA device and permission evidence' : ', plus native-host Linux handoff readiness'}.`);
