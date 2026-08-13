import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot } from './evidence.mjs';

const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable.json'), 'utf8'));
assert.equal(portable.status, 'pass');
assert.equal(portable.observations.linuxOptions.at(-1), '--modify-stack-limit=false');
assert.equal(portable.observations.cache.miss, 'miss');
assert.equal(portable.observations.cache.hit, 'hit');
assert.equal(portable.observations.cache.corruption, 'miss');
assert.equal(portable.observations.applicationTimerFired, true);
assert.equal(portable.observations.terminal.graceful, true);

if (process.platform === 'win32') {
  const native = JSON.parse(await readFile(path.join(evidenceRoot, 'native-windows.json'), 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.environment.processEnvironmentUnchanged, true);
  assert.equal(native.observations.compile.artifact.sha256, native.oracle.ptx.sha256);
  assert.equal(native.observations.link.artifact.sha256, native.oracle.cubin.sha256);
  assert.deepEqual(native.observations.launches.map((entry) => entry.format), ['ptx', 'cubin']);
  assert.equal(native.observations.launches[0].checksum, native.observations.launches[1].checksum);
  assert.equal(native.observations.compilerTerminal.graceful, true);
  assert.equal(native.observations.driverTerminal.graceful, true);
  const oracle = JSON.parse(await readFile(path.join(evidenceRoot, 'capability-oracle-build.json'), 'utf8'));
  assert.equal(oracle.status, 'pass');
  assert.equal(oracle.oracle.PROGRAMS_CREATED, oracle.oracle.PROGRAMS_DESTROYED);
  assert.equal(oracle.oracle.LINKS_CREATED, oracle.oracle.LINKS_DESTROYED);
  assert.equal(oracle.oracle.DRIVER_CLEANUP, 'proved');
  const capabilities = JSON.parse(await readFile(path.join(evidenceRoot, 'native-windows-capabilities.json'), 'utf8'));
  assert.equal(capabilities.status, 'pass');
  assert.equal(capabilities.observations.defaultPtxStable, true);
  assert.equal(capabilities.observations.applicationTimerFired, true);
  assert.equal(capabilities.observations.artifacts.rdc.inputs.length, 2);
  assert.equal(capabilities.observations.artifacts.lto.inputs.length, 2);
  assert.deepEqual(capabilities.observations.launches.map((entry) => entry.capability), ['rdc', 'lto']);
  assert(capabilities.observations.launches.every((entry) => entry.exactIndependentOracleParity === true));
  assert.equal(capabilities.observations.terminal.graceful, true);
  assert.equal(capabilities.observations.terminal.driver.resourceCounts.live, 0);
}

console.log(`F6 verification passed for ${process.platform}-${process.arch}: compiler contract, cache validation/corruption, lifecycle${process.platform === 'win32' ? ', exact MSVC parity, RDC, Device LTO, and public-facade Driver execution' : ''}.`);
