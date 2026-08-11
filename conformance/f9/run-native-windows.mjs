import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { openCudaRuntime } from '../../components/runtime-facade/index.mjs';
import { repositoryRoot, sha256, sourceIdentity, sourcePath, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F9 native conformance requires Windows.');
assert.equal(process.arch, 'x64', 'F9 native conformance requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F9 native conformance requires official Node v26.7.0.');

const source = await readFile(sourcePath, 'utf8');
const expectedWords = [0xdecafbad, 1, 0xdecafbad];
const runtime = await openCudaRuntime({
  compiler: true,
  driver: {
    memory: { maxDeviceBytes: 12, maxAllocationBytes: 12, maxTransferBytes: 12 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 4, maxCompletionMilliseconds: 30_000 },
  },
});
let memory;
let module;
let fn;
let compiled;
let description;
let completion;
let words;
let terminal;
try {
  description = await runtime.describe();
  compiled = await runtime.compile({
    source,
    name: 'atomic-publication.cu',
    options: { architecture: 'compute_75', languageStandard: 'c++17', fmad: false, headerProfile: 'cuda-cccl' },
  });
  assert.equal(compiled.headerProfile, 'cuda-cccl');
  assert.equal(compiled.provider.headerProfiles.cudaCccl.sha256, 'e9a5447d01afe22e7d15d2a4bb8c71a9f3a74175d9788781d51a8b61f3c2913c');
  memory = await runtime.allocateDevice({ byteLength: 12 });
  await memory.write(new Uint8Array(12));
  module = await runtime.loadModule({ format: compiled.artifact.format, bytes: compiled.artifact.bytes });
  fn = await module.getFunction({ name: 'cuda_js_atomic_publication', parameters: [{ kind: 'device-memory' }] });
  completion = await fn.launch({
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 2, y: 1, z: 1 },
    arguments: [memory],
  });
  assert.equal(completion.status, 'completed');
  const read = await memory.read({ byteLength: 12 });
  words = Array.from(new Uint32Array(read.bytes.buffer, read.bytes.byteOffset, 3));
  assert.deepEqual(words, expectedWords);
} finally {
  if (fn) await fn.close();
  if (module) await module.close();
  if (memory) await memory.close();
  terminal = await runtime.close();
}

assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.graceful, true);
assert.equal(terminal.compiler.resources.programsCreated, terminal.compiler.resources.programsDestroyed);
assert.equal(terminal.driver.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);

const sources = [
  'docs/specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
  'components/compiler-actor/src/contract.mjs',
  'components/compiler-actor/src/header-profile.mjs',
  'components/compiler-actor/src/backends/windows-native.mjs',
  'components/runtime-facade/src/runtime.mjs',
  'conformance/f9/fixtures/atomic-publication.cu.txt',
  'conformance/f9/run-native-windows.mjs',
  'packaging/compatibility-manifest.json',
];
const target = await writeEvidence('native-windows.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F9-A/B',
  capsule: 'public-facade-trusted-cccl-atomic-publication',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: {
    node: { version: process.version, moduleAbi: process.versions.modules, executableSha256: await sha256(process.execPath) },
    platform: process.platform,
    architecture: process.arch,
    osVersion: os.version(),
    support: description.support,
    driver: description.driver,
    device: description.device,
  },
  sources: await sourceIdentity(sources),
  observation: {
    headerProfile: compiled.headerProfile,
    headerProfileIdentity: compiled.provider.headerProfiles.cudaCccl,
    provider: compiled.provider,
    artifact: { format: compiled.artifact.format, byteLength: compiled.artifact.byteLength, sha256: compiled.artifact.sha256, architecture: compiled.artifact.architecture },
    cache: compiled.cache,
    launch: { status: completion.status, grid: completion.grid, block: completion.block, pollCount: completion.pollCount, health: completion.health },
    expectedWords,
    observedWords: words,
    hostProducedIntermediateInputsAfterLaunch: 0,
    terminal,
  },
  command: 'npm run f9:native',
  capabilityBoundary: 'The fixture is consumer-neutral and uses only the public package facade. No search schema, native path, header content, raw pointer, handle, stream, event, or mutable native storage is recorded.',
  claimLimits: [
    'Exact Windows x64 Node 26.7.0, CUDA 13.3 provider/header profile, Driver API 13030, and compute-capability 7.5 device only.',
    'This proves one generic device-scope release/acquire publication case, not arbitrary atomics, CUDA-MCGS semantics, performance, Linux support, or a released compatible pair.',
  ],
});

console.log(`F9 native atomic publication passed with PTX ${compiled.artifact.sha256} and words ${words.join(',')}.`);
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
