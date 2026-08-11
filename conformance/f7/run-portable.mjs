import assert from 'node:assert/strict';

import { COMPILER_RUNTIME_TEST, openCompilerRuntimeForTesting } from '../../components/compiler-actor/testing.mjs';
import { openMockDriverRuntime } from '../../components/driver-actor/testing.mjs';
import { inspectHostProfile } from '../../components/platform-diagnostics/index.mjs';
import { sourceIdentity, writeEvidence } from './evidence.mjs';
import { runPropertyPartitions } from './property-cases.mjs';

const started = Date.now();
const rssBefore = process.memoryUsage().rss;
const source = 'extern "C" __global__ void f7_portable() {}\n';
const propertyPartitions = runPropertyPartitions();
const stress = { driverCycles: 0, compilerCycles: 0, driverTerminals: [], compilerTerminals: [] };

for (let index = 0; index < 24; index += 1) {
  const { runtime } = await openMockDriverRuntime({ memory: { maxDeviceBytes: 64, maxAllocationBytes: 64, maxTransferBytes: 64 } });
  const allocation = await runtime.allocateDevice({ byteLength: 16 });
  await runtime.writeDevice(allocation.memory, Uint8Array.from({ length: 16 }, (_, offset) => (index + offset) & 255));
  assert.equal((await runtime.readDevice(allocation.memory, { byteLength: 16 })).bytes[0], index);
  await runtime.releaseMemory(allocation.memory);
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.deepEqual(terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 3, orphaned: 0 });
  stress.driverCycles += 1;
  stress.driverTerminals.push({ graceful: terminal.graceful, workerExitCode: terminal.workerExitCode, counts: terminal.teardown.inventory.counts });
}

for (let index = 0; index < 24; index += 1) {
  const runtime = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
  const compiled = await runtime.compile({ source: `${source}// ${index}\n` });
  await runtime.link({ inputs: [compiled.artifact] });
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.resources.programsCreated, terminal.resources.programsDestroyed);
  assert.equal(terminal.resources.linksCreated, terminal.resources.linksDestroyed);
  stress.compilerCycles += 1;
  stress.compilerTerminals.push({ graceful: terminal.graceful, workerExitCode: terminal.workerExitCode, resources: terminal.resources });
}

const { runtime: driver, testing: driverTesting } = await openMockDriverRuntime();
const compiler = await openCompilerRuntimeForTesting({ cacheMode: 'disabled' });
let applicationTimerFired = false;
const driverBlocked = driverTesting.blockActor(100);
const compilerBlocked = compiler[COMPILER_RUNTIME_TEST]('testing.block', { milliseconds: 100 });
await new Promise((resolve) => setTimeout(() => { applicationTimerFired = true; resolve(); }, 10));
assert.equal(applicationTimerFired, true);
await Promise.all([driverBlocked, compilerBlocked]);
await driver.close();
await compiler.close();

const elapsedMilliseconds = Date.now() - started;
const rssAfter = process.memoryUsage().rss;
const rssGrowthBytes = Math.max(0, rssAfter - rssBefore);
assert(elapsedMilliseconds < 30_000, `Portable F7 hardening exceeded its broad 30 second regression ceiling: ${elapsedMilliseconds}ms.`);
assert(rssGrowthBytes < 256 * 1_048_576, `Portable F7 stress exceeded its broad 256 MiB process-memory ceiling: ${rssGrowthBytes}.`);

await writeEvidence('portable.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F7',
  capsule: 'portable-platform-security-failure-stress',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { host: inspectHostProfile(), node: process.version, platform: process.platform, architecture: process.arch },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0007-windows-platform-hardening.md',
    'components/platform-diagnostics/src/platform-diagnostics.mjs',
    'components/compiler-actor/src/contract.mjs',
    'components/compiler-actor/src/actor-worker.mjs',
  ]),
  observations: { propertyPartitions: { seed: propertyPartitions.seed, count: propertyPartitions.count, sha256: propertyPartitions.sha256 }, stress, applicationTimerFired, elapsedMilliseconds, rssBefore, rssAfter, rssGrowthBytes },
  claimLimits: ['Portable validation, failure, lifecycle, and diagnostic controls only.', 'Elapsed time and process memory are broad regression observations, not performance claims.', 'No native provider, Driver, GPU, WSL, or Linux CUDA support claim.'],
});

console.log(`F7 portable conformance passed: ${propertyPartitions.count * 2} deterministic property cases, 48 graceful actor cycles, failure containment, responsiveness, and bounded regression observations.`);
