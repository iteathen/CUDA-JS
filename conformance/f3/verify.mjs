import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot } from './evidence.mjs';

const mock = JSON.parse(await readFile(path.join(evidenceRoot, 'mock.json'), 'utf8'));
assert.equal(mock.status, 'pass');
assert.equal(mock.observations.mainLoopResponsive, true);
assert.equal(mock.observations.graceful.graceful, true);
assert.equal(mock.observations.graceful.workerExitCode, 0);
assert.equal(mock.observations.unexpectedLoss.restartRequired, true);
assert.equal(mock.observations.unexpectedLoss.cleanupClaim, 'unproved-worker-loss');
assert(mock.observations.unexpectedLoss.inventory.counts.orphaned > 0);

const platformKey = process.platform === 'win32' ? 'windows' : process.platform === 'linux' ? 'linux' : null;
const nativePath = platformKey ? path.join(evidenceRoot, `native-${platformKey}.json`) : null;
if (process.platform === 'win32' && process.arch === 'x64') assert(nativePath && existsSync(nativePath), 'F3W verification requires exact native Windows evidence.');
const nativeEvidencePresent = process.arch === 'x64' && nativePath !== null && existsSync(nativePath);
if (nativeEvidencePresent) {
  const native = JSON.parse(await readFile(nativePath, 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.observations.description.health.current, 'healthy');
  assert.equal(native.observations.turns.length, 8);
  assert(native.observations.turns.every((turn) => turn.currentOnOwner === true));
  assert.equal(native.observations.validationError.code, 'RESOURCE_WRONG_KIND');
  assert.equal(native.observations.terminal.graceful, true);
  assert.equal(native.observations.terminal.context.currentNull, true);
  assert.equal(native.observations.terminal.library.libraryClosed, true);
  assert.equal(native.observations.terminal.workerExitCode, 0);
}

console.log(`F3 verification passed for ${process.platform}-${process.arch}: opaque resources, health, responsiveness, graceful teardown, honest Worker-loss state${nativeEvidencePresent ? ', and native context affinity' : ''}.`);
