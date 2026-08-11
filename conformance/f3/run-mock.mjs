import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

import { openMockDriverRuntime } from '../../components/driver-actor/testing.mjs';
import { evidenceRoot, repositoryRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

const sources = [
  'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md',
  'components/resource-registry/src/resource-registry.mjs',
  'components/driver-actor/src/driver-runtime.mjs',
  'components/driver-actor/src/actor-worker.mjs',
  'components/driver-actor/src/backends/mock.mjs',
];

const { runtime, testing } = await openMockDriverRuntime({ maxPending: 4 });
const description = await runtime.describe();
const turns = [];
for (let index = 0; index < 4; index += 1) turns.push(await runtime.contextStatus(description.context));
assert(turns.every((turn) => turn.currentOnOwner === true));
assert.deepEqual(turns.map((turn) => turn.operationSequence), [...turns.map((turn) => turn.operationSequence)].sort((left, right) => left - right));

let timerFired = false;
const timer = new Promise((resolve) => setTimeout(() => { timerFired = true; resolve(); }, 10));
const blocked = testing.blockActor(75);
await timer;
const blockedResult = await blocked;
assert.equal(timerFired, true);
assert.equal(blockedResult.blockedMilliseconds, 75);

let deferredError;
try {
  await testing.injectHealth('deferred-driver', 51);
} catch (error) {
  deferredError = {
    code: error.code,
    category: error.category,
    operationId: error.operationId,
    healthBefore: error.healthBefore,
    healthAfter: error.healthAfter,
    details: error.details,
  };
}
assert.equal(deferredError.category, 'deferred-driver');
assert.equal(deferredError.details.originOperationId, 51);
assert.equal(deferredError.healthAfter, 'poisoned');
const terminal = await runtime.close();
assert.equal(terminal.graceful, true);
assert.equal(terminal.workerExitCode, 0);
assert.deepEqual(terminal.disposalOrder, ['context', 'library']);

const loss = await openMockDriverRuntime();
const beforeLoss = await loss.runtime.describe();
const lossTerminal = await loss.testing.terminateActor();
assert.equal(lossTerminal.restartRequired, true);
assert.equal(lossTerminal.cleanupClaim, 'unproved-worker-loss');
assert.equal(lossTerminal.inventory.counts.orphaned, beforeLoss.inventory.counts.live);

const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F3',
  capsule: 'platform-neutral-driver-actor-lifecycle-mock',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, kernel: os.release() },
  sources: await sourceIdentity(sources),
  observations: {
    turns: turns.map((turn) => ({ currentOnOwner: turn.currentOnOwner, operationSequence: turn.operationSequence })),
    mainLoopResponsive: timerFired,
    blockedMilliseconds: blockedResult.blockedMilliseconds,
    deferredError,
    graceful: terminal,
    unexpectedLoss: lossTerminal,
  },
  rawPointerBoundary: 'public-record-validator rejects bigint and raw storage; no pointer appears in evidence',
  claimLimits: [
    'Pure lifecycle mock only.',
    'No CUDA ABI, Driver, GPU, native cleanup, platform support, or performance claim.',
    'Unexpected Worker loss intentionally reports inaccessible orphan state rather than cleanup.',
  ],
};
const target = await writeEvidence('mock.json', evidence);
console.log('F3 platform-neutral mock passed: context turns, health provenance, responsiveness, graceful teardown, and unexpected-loss reporting.');
console.log(`Evidence: ${path.relative(repositoryRoot, target ?? path.join(evidenceRoot, 'mock.json'))}`);
