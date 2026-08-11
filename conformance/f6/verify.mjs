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
}

console.log(`F6 verification passed for ${process.platform}-${process.arch}: compiler contract, cache validation/corruption, lifecycle${process.platform === 'win32' ? ', exact MSVC parity, and PTX/cubin Driver execution' : ''}.`);
