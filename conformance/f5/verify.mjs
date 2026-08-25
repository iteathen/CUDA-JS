import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot, nativeCapabilitiesEvidenceName, nativeEvidenceName, nativeProfile } from './evidence.mjs';

const mock = JSON.parse(await readFile(path.join(evidenceRoot, 'mock.json'), 'utf8'));
assert.equal(mock.status, 'pass');
assert.deepEqual(mock.observations.parameterLayout.entries.map((entry) => entry.offset), [0, 8, 16, 24]);
assert.equal(mock.observations.parameterLayout.byteLength, 28);
assert.equal(mock.observations.completion.status, 'completed');
assert.equal(mock.observations.deferredError.healthAfter, 'poisoned');
assert.equal(mock.observations.timeoutError.healthAfter, 'restart-required');
assert.equal(mock.observations.timeoutTerminal.cleanupClaim, 'unproved-worker-loss');

const nativePath = path.join(evidenceRoot, nativeEvidenceName);
if (process.platform === 'win32' && process.arch === 'x64') assert(existsSync(nativePath), 'F5W verification requires exact native Windows evidence.');
const nativeEvidencePresent = ['win32', 'linux'].includes(process.platform) && process.arch === 'x64' && existsSync(nativePath);
if (nativeEvidencePresent) {
  const native = JSON.parse(await readFile(nativePath, 'utf8'));
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

  const capabilities = JSON.parse(await readFile(path.join(evidenceRoot, nativeCapabilitiesEvidenceName), 'utf8'));
  assert.equal(capabilities.status, 'pass');
  assert.deepEqual(capabilities.oracle.scalarLayout, [0, 8, 16, 20, 24, 32]);
  assert.equal(capabilities.oracle.firstEventQueryStatus, 600);
  assert.equal(capabilities.observations.scalarCases.length, 3);
  assert.equal(capabilities.observations.operation.first.status, 'pending');
  assert.equal(capabilities.observations.operation.completed.status, 'completed');
  assert.deepEqual(capabilities.oracle.asyncTransferWords, [3, 5, 7, 11]);
  assert.deepEqual(capabilities.observations.asyncTransfer.incrementedWords, [4, 6, 8, 12]);
  assert.deepEqual(capabilities.observations.asyncTransfer.copiedWords, [4, 6, 8, 12]);
  assert.equal(capabilities.observations.transferTerminal.graceful, true);
  assert.equal(capabilities.observations.transferTerminal.driver.resourceCounts.live, 0);
  assert.equal(capabilities.observations.transferTerminal.driver.resourceCounts.orphaned, 0);
  assert.equal(capabilities.observations.pendingRuntimeClose.graceful, true);
  assert.equal(capabilities.observations.deferredFailure.status, 'pass');
  assert.equal(capabilities.observations.deferredFailure.failure.observedAt.driverCall, 'cuEventQuery');
  assert.equal(capabilities.observations.terminal.driver.resourceCounts.live, 0);
  assert.equal(capabilities.observations.terminal.driver.resourceCounts.orphaned, 0);
}

console.log(`F5 verification passed for ${process.platform}-${process.arch}: bounded PTX, declared packing, leases, event completion, deferred failure, timeout loss${nativeEvidencePresent ? `, independent native ${nativeProfile} vector/scalar/transfer parity, bounded scheduling, and opaque operation lifecycle` : ''}.`);
