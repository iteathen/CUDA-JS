import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot, nativeEvidenceName, nativeProfile } from './evidence.mjs';

const mock = JSON.parse(await readFile(path.join(evidenceRoot, 'mock.json'), 'utf8'));
assert.equal(mock.status, 'pass');
assert.equal(mock.observations.byteLength, 4_096);
assert.equal(mock.observations.rangeError.code, 'MEMORY_RANGE_OUT_OF_BOUNDS');
assert.equal(mock.observations.release.usage.reservedBytes, 0);
assert.equal(mock.observations.terminal.graceful, true);
assert.equal(mock.observations.unexpectedLoss.memory.reservedBytes, 1_024);

const nativePath = path.join(evidenceRoot, nativeEvidenceName);
if (process.platform === 'win32' && process.arch === 'x64') assert(existsSync(nativePath), 'F4W verification requires exact native Windows evidence.');
const nativeEvidencePresent = ['win32', 'linux'].includes(process.platform) && process.arch === 'x64' && existsSync(nativePath);
if (nativeEvidencePresent) {
  const native = JSON.parse(await readFile(nativePath, 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.observations.checksum, native.observations.oracleChecksum);
  assert.equal(native.observations.rangeError.code, 'MEMORY_RANGE_OUT_OF_BOUNDS');
  assert.equal(native.observations.pressureError.code, 'MEMORY_QUOTA_EXCEEDED');
  assert.equal(native.observations.replacement.reusedSlot, true);
  assert.equal(native.observations.replacement.generationAdvanced, true);
  assert.equal(native.observations.terminal.graceful, true);
  assert.equal(native.observations.terminal.workerExitCode, 0);
  assert.deepEqual(native.observations.terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 3, orphaned: 0 });
}

console.log(`F4 verification passed for ${process.platform}-${process.arch}: bounded copied bytes, quota/ranges, opaque lifecycle, teardown, and honest loss state${nativeEvidencePresent ? `, plus independent native ${nativeProfile} parity` : ''}.`);
