import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot } from './evidence.mjs';

const mock = JSON.parse(await readFile(path.join(evidenceRoot, 'mock.json'), 'utf8'));
assert.equal(mock.status, 'pass');
assert.deepEqual(mock.observations.parameterLayout.entries.map((entry) => entry.offset), [0, 8, 16, 24]);
assert.equal(mock.observations.parameterLayout.byteLength, 28);
assert.equal(mock.observations.completion.status, 'completed');
assert.equal(mock.observations.deferredError.healthAfter, 'poisoned');
assert.equal(mock.observations.timeoutError.healthAfter, 'restart-required');
assert.equal(mock.observations.timeoutTerminal.cleanupClaim, 'unproved-worker-loss');

if (process.platform === 'win32') {
  const native = JSON.parse(await readFile(path.join(evidenceRoot, 'native-windows.json'), 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.observations.checksum, native.observations.oracleChecksum);
  assert.deepEqual(native.observations.parameterLayout.offsets, [0, 8, 16, 24]);
  assert.equal(native.observations.parameterLayout.byteLength, 28);
  assert.equal(native.observations.completion.status, 'completed');
  assert.equal(native.observations.invalidModuleError.category, 'validation');
  assert.equal(native.observations.missingFunctionError.category, 'validation');
  assert.equal(native.observations.terminal.graceful, true);
  assert.equal(native.observations.terminal.workerExitCode, 0);
  assert.equal(native.observations.terminal.teardown.inventory.counts.live, 0);
  assert.equal(native.observations.terminal.teardown.inventory.counts.orphaned, 0);
}

console.log(`F5 verification passed for ${process.platform}-${process.arch}: bounded PTX, declared packing, leases, event completion, deferred failure, timeout loss${process.platform === 'win32' ? ', plus independent native Windows vector parity' : ''}.`);
