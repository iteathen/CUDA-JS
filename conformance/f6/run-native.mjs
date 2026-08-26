import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { openCompilerRuntime } from '../../components/compiler-actor/index.mjs';
import { openDriverRuntime } from '../../components/driver-actor/index.mjs';
import { checksumBytes, elementCount, u32Bytes, vectorInputs } from '../f5/evidence.mjs';
import { cacheRoot, digestBytes, oracleCubinPath, oraclePtxPath, repositoryRoot, sha256, sourceIdentity, sourcePath, writeEvidence } from './evidence.mjs';

assert(['win32', 'linux'].includes(process.platform), 'F6 native conformance requires Windows or native Linux.');
assert.equal(process.arch, 'x64', 'F6 native conformance requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F6 native conformance requires official Node v26.7.0.');
const platformKey = process.platform === 'win32' ? 'windows' : 'linux';
const workPackage = process.platform === 'win32' ? 'CJS-F6W' : 'CJS-F6L';

const source = await readFile(sourcePath, 'utf8');
const oraclePtx = Uint8Array.from(await readFile(oraclePtxPath));
const oracleCubin = Uint8Array.from(await readFile(oracleCubinPath));
const environmentBefore = Object.fromEntries(Object.entries(process.env).sort(([left], [right]) => left.localeCompare(right)));
const compiler = await openCompilerRuntime({ cacheDirectory: cacheRoot });
let compilerTerminal;
let invalidLinkError;
let firstCompile;
let compileMiss;
let compileHit;
let corruptionMiss;
let linkMiss;
let linkHit;
try {
  firstCompile = await compiler.compile({ source, name: 'vector-add.cu' });
  await compiler.invalidate(firstCompile.cache.key);
  let timerFired = false;
  const timer = new Promise((resolve) => setTimeout(() => { timerFired = true; resolve(); }, 0));
  compileMiss = await compiler.compile({ source, name: 'vector-add.cu' });
  await timer;
  assert.equal(timerFired, true);
  assert.equal(compileMiss.cache.status, 'miss');
  assert.deepEqual(compileMiss.artifact.bytes, oraclePtx);
  compileHit = await compiler.compile({ source, name: 'vector-add.cu' });
  assert.equal(compileHit.cache.status, 'hit');
  assert.deepEqual(compileHit.artifact.bytes, oraclePtx);

  await writeFile(path.join(cacheRoot, `${compileMiss.cache.key}.bin`), Uint8Array.of(1, 2, 3));
  corruptionMiss = await compiler.compile({ source, name: 'vector-add.cu' });
  assert.equal(corruptionMiss.cache.status, 'miss');
  assert.deepEqual(corruptionMiss.artifact.bytes, oraclePtx);

  const firstLink = await compiler.link({ inputs: [compileMiss.artifact] });
  await compiler.invalidate(firstLink.cache.key);
  linkMiss = await compiler.link({ inputs: [compileMiss.artifact] });
  assert.equal(linkMiss.cache.status, 'miss');
  assert.deepEqual(linkMiss.artifact.bytes, oracleCubin);
  linkHit = await compiler.link({ inputs: [compileMiss.artifact] });
  assert.equal(linkHit.cache.status, 'hit');
  assert.deepEqual(linkHit.artifact.bytes, oracleCubin);
  try { await compiler.link({ inputs: [Uint8Array.of(65, 66, 67)] }); } catch (error) { invalidLinkError = { code: error.code, category: error.category, healthAfter: error.healthAfter }; }
  assert.equal(invalidLinkError.category, 'link');
  assert.equal(compiler.health, 'healthy');
} finally {
  compilerTerminal = await compiler.close();
}
assert.equal(compilerTerminal.graceful, true);
assert.equal(compilerTerminal.workerExitCode, 0);
assert.equal(compilerTerminal.resources.programsCreated, compilerTerminal.resources.programsDestroyed);
assert.equal(compilerTerminal.resources.linksCreated, compilerTerminal.resources.linksDestroyed);
const environmentAfter = Object.fromEntries(Object.entries(process.env).sort(([left], [right]) => left.localeCompare(right)));
assert.deepEqual(environmentAfter, environmentBefore);

const vectors = vectorInputs();
const expected = u32Bytes(vectors.expected);
const vectorBytes = expected.byteLength;
const driver = await openDriverRuntime({
  memory: { maxDeviceBytes: vectorBytes * 3, maxAllocationBytes: vectorBytes, maxTransferBytes: vectorBytes },
  execution: { maxModuleBytes: 1_048_576, maxArguments: 8, maxCompletionMilliseconds: 30_000 },
});
let driverTerminal;
const launchObservations = [];
try {
  const left = await driver.allocateDevice({ byteLength: vectorBytes });
  const right = await driver.allocateDevice({ byteLength: vectorBytes });
  const output = await driver.allocateDevice({ byteLength: vectorBytes });
  await driver.writeDevice(left.memory, u32Bytes(vectors.left));
  await driver.writeDevice(right.memory, u32Bytes(vectors.right));
  for (const artifact of [compileMiss.artifact, linkMiss.artifact]) {
    const module = await driver.loadModule({ format: artifact.format, bytes: artifact.bytes });
    const fn = await driver.getFunction(module.module, {
      name: 'vector_add',
      parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }],
    });
    const completion = await driver.launch(fn.function, {
      grid: { x: Math.ceil(elementCount / 128), y: 1, z: 1 },
      block: { x: 128, y: 1, z: 1 },
      arguments: [
        { kind: 'device-memory', memory: left.memory },
        { kind: 'device-memory', memory: right.memory },
        { kind: 'device-memory', memory: output.memory },
        { kind: 'u32', value: elementCount },
      ],
    });
    const read = await driver.readDevice(output.memory, { byteLength: vectorBytes });
    assert.deepEqual(read.bytes, expected);
    launchObservations.push({ format: artifact.format, moduleSha256: module.sha256, completion: { status: completion.status, pollCount: completion.pollCount }, checksum: checksumBytes(read.bytes) });
    await driver.releaseFunction(fn.function);
    await driver.releaseModule(module.module);
  }
  await driver.releaseMemory(output.memory);
  await driver.releaseMemory(right.memory);
  await driver.releaseMemory(left.memory);
} finally {
  driverTerminal = await driver.close();
}
assert.equal(driverTerminal.graceful, true);
assert.equal(driverTerminal.workerExitCode, 0);
assert.equal(driverTerminal.teardown.inventory.counts.live, 0);
assert.deepEqual(launchObservations.map((entry) => entry.format), ['ptx', 'cubin']);
assert.equal(launchObservations[0].checksum, launchObservations[1].checksum);

const sources = [
  'docs/specs/SPEC-0006-compiler-linker-cache.md',
  `schemas/cuda-13.3/${process.platform === 'win32' ? 'win-x64' : 'linux-x64'}/compiler-provider-manifest.json`,
  'components/compiler-actor/src/backends/native.mjs',
  'components/compiler-actor/src/backends/native-profiles.mjs',
  `components/compiler-actor/src/backends/${platformKey}-native.mjs`,
  'components/driver-actor/src/backends/native.mjs',
  'components/driver-actor/src/backends/native-profiles.mjs',
  `components/driver-actor/src/backends/${platformKey}-native.mjs`,
  'components/compiler-actor/src/cache.mjs',
  'components/execution/src/execution-manager.mjs',
  'experiments/exp-009/native/compiler-oracle.c',
  'experiments/exp-009/fixtures/vector-add.cu.txt',
];
const target = await writeEvidence(`native-${platformKey}.json`, {
  schemaVersion: 1,
  workPackage,
  capsule: `${platformKey}-compiler-linker-cache-driver-handoff`,
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: { version: process.version, executableSha256: await sha256(process.execPath) }, platform: process.platform, architecture: process.arch, kernel: os.release(), osVersion: os.version(), processEnvironmentUnchanged: true },
  sources: await sourceIdentity(sources),
  oracle: { ptx: { byteLength: oraclePtx.byteLength, sha256: digestBytes(oraclePtx) }, cubin: { byteLength: oracleCubin.byteLength, sha256: digestBytes(oracleCubin) } },
  observations: {
    provider: compileMiss.provider,
    compile: { artifact: { format: compileMiss.artifact.format, byteLength: compileMiss.artifact.byteLength, sha256: compileMiss.artifact.sha256 }, miss: compileMiss.cache.status, hit: compileHit.cache.status, corruption: corruptionMiss.cache.status },
    link: { artifact: { format: linkMiss.artifact.format, byteLength: linkMiss.artifact.byteLength, sha256: linkMiss.artifact.sha256 }, miss: linkMiss.cache.status, hit: linkHit.cache.status, invalidLinkError },
    launches: launchObservations,
    compilerTerminal,
    driverTerminal,
  },
  capabilityBoundary: 'Evidence contains copied artifact identities and terminal records only; no source, artifact bytes, toolkit path, native handle, address, program, link, module, stream, or event capability is recorded.',
  claimLimits: [`Exact ${platformKey} x64 Node 26.7.0, CUDA 13.3 provider, Driver, and GPU profile only.`, 'No cross-platform inference, crash recovery, performance, packaging, or stable API claim.'],
});
console.log(`${workPackage} native conformance passed: exact C parity for PTX ${compileMiss.artifact.sha256} and cubin ${linkMiss.artifact.sha256}; both executed with checksum ${launchObservations[0].checksum}.`);
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
