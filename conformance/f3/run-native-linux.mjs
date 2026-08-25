import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { openDriverRuntime } from '../../components/driver-actor/index.mjs';
import { assertPublicRecord } from '../../components/driver-actor/src/protocol.mjs';
import { repositoryRoot, sha256, sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'linux', 'F3L native conformance requires Linux.');
assert.equal(process.arch, 'x64', 'F3L native conformance requires Linux x86-64.');
assert.equal(process.version, 'v26.7.0', 'F3L native conformance requires official Node v26.7.0.');
assert.doesNotMatch(os.release(), /microsoft/i, 'F3L native conformance does not accept WSL evidence.');

const f2EvidencePath = path.join(repositoryRoot, 'build', 'exp-001', 'linux-x64', 'evidence', 'smoke.json');
const f2 = JSON.parse(await readFile(f2EvidencePath, 'utf8'));
assert.equal(f2.status, 'pass', 'F3L requires passing EXP-001/F2L evidence from the same workspace.');
assert.equal(f2.readiness.status, 'ready');
assert.equal(f2.readiness.observed.node, process.version);
assert.equal(f2.readiness.observed.platform, process.platform);
assert.equal(f2.readiness.observed.architecture, process.arch);
assert.equal(f2.readiness.observed.kernel, os.release());
assert.equal(f2.readiness.observed.isWsl, false);
assert.equal(await sha256(f2.driver.path), f2.driver.sha256, 'F3L requires the same canonical Driver identity as EXP-001/F2L.');
const sources = [
  'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md',
  'components/resource-registry/src/resource-registry.mjs',
  'components/driver-actor/src/driver-runtime.mjs',
  'components/driver-actor/src/actor-worker.mjs',
  'components/driver-actor/src/backends/linux-native.mjs',
  'components/driver-actor/src/backends/native-profiles.mjs',
  'components/driver-actor/src/backends/native.mjs',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'schemas/cuda-13.3/linux-x64/generated/packers.mjs',
];

const runtime = await openDriverRuntime();
let description;
let turns;
let validationError;
let terminal;
try {
  description = assertPublicRecord(await runtime.describe());
  assert.equal(description.runtime.backend, 'linux-native');
  assert.equal(description.profile.nativeOperational, true);
  assert.equal(description.profile.nativeQualified, false);
  assert.equal(description.claim, 'native-linux-f4l-operational-unqualified');
  assert.equal(description.driver.apiVersion, f2.result.cuda.driverVersion.value);
  assert.equal(description.driver.deviceCount, f2.result.cuda.deviceCount.value);
  assert.equal(description.device.ordinal, f2.result.cuda.device.ordinal);
  for (const [name, observation] of Object.entries(f2.result.cuda.attributes)) assert.equal(description.device.attributes[name], observation.value);
  assert.equal(description.health.current, 'healthy');
  assert.deepEqual(description.inventory.counts, { live: 2, closing: 0, closed: 0, orphaned: 0 });

  turns = [];
  for (let index = 0; index < 8; index += 1) turns.push(assertPublicRecord(await runtime.contextStatus(description.context)));
  assert(turns.every((turn) => turn.currentOnOwner === true));
  assert.equal(new Set(turns.map((turn) => turn.operationSequence)).size, turns.length);

  try {
    await runtime.contextStatus({ ...description.context, kind: 'library' });
  } catch (error) {
    validationError = { name: error.name, code: error.code, category: error.category, message: error.message };
  }
  assert.deepEqual(validationError, {
    name: 'DriverRuntimeError',
    code: 'RESOURCE_WRONG_KIND',
    category: 'stale-resource',
    message: 'Resource kind does not match the required operation.',
  });
  assert.equal((await runtime.describe()).health.current, 'healthy');
} finally {
  terminal = assertPublicRecord(await runtime.close());
}

assert.equal(terminal.graceful, true);
assert.equal(terminal.cleanupClaim, 'proved-native-linux-profile-cleanup');
assert.equal(terminal.context.contextDestroyed, true);
assert.equal(terminal.context.currentNull, true);
assert.equal(terminal.library.libraryClosed, true);
assert.equal(terminal.library.staleWrapperRejected, true);
assert.equal(terminal.workerExitCode, 0);
assert.deepEqual(terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 2, orphaned: 0 });

const driverPath = f2.driver.path;
const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F3L',
  capsule: 'native-linux-driver-actor-resource-lifecycle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: {
    node: { version: process.version, executableSha256: await sha256(process.execPath) },
    platform: process.platform,
    architecture: process.arch,
    osVersion: os.version(),
    kernel: os.release(),
    glibc: process.report.getReport().header.glibcVersionRuntime,
    driverSha256: await sha256(driverPath),
  },
  sources: await sourceIdentity(sources),
  f2Evidence: { path: path.relative(repositoryRoot, f2EvidencePath), sha256: await sha256(f2EvidencePath) },
  observations: {
    description,
    turns: turns.map((turn) => ({ currentOnOwner: turn.currentOnOwner, operationSequence: turn.operationSequence })),
    validationError,
    terminal,
  },
  rawPointerBoundary: 'all public/evidence records passed the bounded public-record validator',
  claimLimits: [
    'Exact native Linux x86-64 Node 26.7.0 / Driver / GPU profile only.',
    'This qualifies F3L only; memory, module, launch, completion, compiler, package, performance, and stable API claims remain separate.',
    'WSL and Linux ARM64 remain separate profiles.',
    'Unexpected native Worker loss is not induced because it could strand an in-process CUDA context; the platform-neutral capsule proves only control-plane reporting.',
  ],
};
const target = await writeEvidence('native-linux.json', evidence);
console.log(`F3L native DriverActor passed: ${turns.length} owner-thread context turns, stale-kind rejection, terminal context/library cleanup, Worker exit zero.`);
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
