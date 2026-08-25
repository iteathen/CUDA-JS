import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { openDriverRuntime } from '../../components/driver-actor/index.mjs';
import { assertPublicRecord } from '../../components/driver-actor/src/protocol.mjs';
import { parameterLayout } from '../../components/execution/index.mjs';
import { checksumBytes, elementCount, nativeEvidenceName, nativeProfile, oraclePath, parseOracle, ptxPath, repositoryRoot, sha256, sourceIdentity, u32Bytes, vectorInputs, writeEvidence } from './evidence.mjs';

assert(['win32', 'linux'].includes(process.platform), 'F5 native conformance requires Windows or native Linux.');
assert.equal(process.arch, 'x64', 'F5 native conformance requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F5 native conformance requires official Node v26.7.0.');
if (process.platform === 'linux') assert.doesNotMatch(os.release(), /microsoft/i, 'F5 native Linux conformance does not accept WSL.');

const oracleRun = spawnSync(oraclePath, [ptxPath], { cwd: repositoryRoot, encoding: 'utf8' });
if (oracleRun.error) throw oracleRun.error;
if (oracleRun.status !== 0) throw new Error(`F5${nativeProfile === 'windows' ? 'W' : 'L'} oracle failed (${oracleRun.status}).\n${oracleRun.stdout}\n${oracleRun.stderr}`);
const oracle = parseOracle(oracleRun.stdout);
let prerequisite = null;
if (process.platform === 'linux') {
  const prerequisitePath = path.join(repositoryRoot, 'build', 'f4', 'linux-x64', 'evidence', 'native-linux.json');
  const f4 = JSON.parse(await readFile(prerequisitePath, 'utf8'));
  assert.equal(f4.status, 'pass', 'F5L requires passing F4L evidence from the same workspace.');
  assert.equal(f4.environment.kernel, os.release(), 'F5L requires the same native Linux kernel as F4L.');
  prerequisite = { path: path.relative(repositoryRoot, prerequisitePath), sha256: await sha256(prerequisitePath) };
}
const ptx = Uint8Array.from(await readFile(ptxPath));
const parameters = [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }];
const layout = parameterLayout(parameters);
assert.deepEqual([...layout.entries.map((entry) => entry.offset), layout.byteLength], oracle.PARAM_LAYOUT);
const vectors = vectorInputs();
const expectedBytes = u32Bytes(vectors.expected);
const vectorBytes = expectedBytes.byteLength;
const runtime = await openDriverRuntime({
  memory: { maxDeviceBytes: vectorBytes * 3, maxAllocationBytes: vectorBytes, maxTransferBytes: vectorBytes },
  execution: { maxModuleBytes: 1_048_576, maxArguments: 8, maxCompletionMilliseconds: 30_000 },
});
let module;
let fn;
let output;
let left;
let right;
let completion;
let checksum;
let invalidModuleError;
let missingFunctionError;
let staleFunctionError;
let terminal;
try {
  try { await runtime.loadModule({ format: 'ptx', bytes: new TextEncoder().encode('.version invalid\n') }); } catch (error) { invalidModuleError = { code: error.code, category: error.category, healthAfter: error.healthAfter }; }
  assert.equal(invalidModuleError.category, 'validation');
  assert.equal(runtime.health, 'healthy');

  module = await runtime.loadModule({ format: 'ptx', bytes: ptx });
  assert.equal(module.byteLength, ptx.byteLength);
  try { await runtime.getFunction(module.module, { name: 'missing_function', parameters: [{ kind: 'u32' }] }); } catch (error) { missingFunctionError = { code: error.code, category: error.category, healthAfter: error.healthAfter }; }
  assert.equal(missingFunctionError.category, 'validation');
  assert.equal(runtime.health, 'healthy');
  fn = await runtime.getFunction(module.module, { name: 'cuda_js_vector_add_u32', parameters });
  output = await runtime.allocateDevice({ byteLength: vectorBytes });
  left = await runtime.allocateDevice({ byteLength: vectorBytes });
  right = await runtime.allocateDevice({ byteLength: vectorBytes });
  await runtime.writeDevice(left.memory, u32Bytes(vectors.left));
  await runtime.writeDevice(right.memory, u32Bytes(vectors.right));

  let applicationTimerFired = false;
  const applicationTimer = new Promise((resolve) => setTimeout(() => { applicationTimerFired = true; resolve(); }, 0));
  completion = assertPublicRecord(await runtime.launch(fn.function, {
    grid: { x: Math.ceil(elementCount / 128), y: 1, z: 1 },
    block: { x: 128, y: 1, z: 1 },
    arguments: [
      { kind: 'device-memory', memory: output.memory },
      { kind: 'device-memory', memory: left.memory },
      { kind: 'device-memory', memory: right.memory },
      { kind: 'u32', value: elementCount },
    ],
  }), { maxByteLength: vectorBytes });
  await applicationTimer;
  assert.equal(applicationTimerFired, true);
  assert.equal(completion.status, 'completed');
  const result = assertPublicRecord(await runtime.readDevice(output.memory, { byteLength: vectorBytes }), { maxByteLength: vectorBytes });
  assert.deepEqual(result.bytes, expectedBytes);
  checksum = checksumBytes(result.bytes);
  assert.equal(checksum, oracle.RESULT[1]);
  const description = await runtime.describe();
  assert.equal(description.runtime.backend, `${nativeProfile}-native`);
  assert.equal(description.claim, nativeProfile === 'windows' ? 'exact-windows-f5w-profile' : 'native-linux-f5l-operational-unqualified');

  await runtime.releaseFunction(fn.function);
  try { await runtime.functionStatus(fn.function); } catch (error) { staleFunctionError = { code: error.code, category: error.category }; }
  assert.equal(staleFunctionError.code, 'RESOURCE_CLOSED');
  await runtime.releaseModule(module.module);
  await runtime.releaseMemory(right.memory);
  await runtime.releaseMemory(left.memory);
  await runtime.releaseMemory(output.memory);
} finally {
  terminal = assertPublicRecord(await runtime.close(), { maxByteLength: vectorBytes });
}
assert.equal(terminal.graceful, true);
assert.deepEqual(terminal.teardown.dispositions.map((entry) => entry.resource.kind), ['stream', 'context', 'library']);
assert.equal(terminal.teardown.inventory.counts.live, 0);
assert.equal(terminal.teardown.inventory.counts.closing, 0);
assert.equal(terminal.teardown.inventory.counts.orphaned, 0);
assert.equal(terminal.workerExitCode, 0);

const sources = [
  'docs/specs/SPEC-0005-module-launch-completion.md',
  'components/execution/src/execution-manager.mjs',
  `components/driver-actor/src/backends/${nativeProfile}-native.mjs`,
  'components/driver-actor/src/backends/native-profiles.mjs',
  'components/driver-actor/src/backends/native.mjs',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'schemas/cuda-13.3/linux-x64/generated/packers.mjs',
  'conformance/f5/native/launch-oracle.c',
  'conformance/f5/fixtures/vector-add.ptx.txt',
];
const evidence = {
  schemaVersion: 1,
  workPackage: `CJS-F5${nativeProfile === 'windows' ? 'W' : 'L'}`,
  capsule: 'native-driver-actor-module-launch-completion',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: { version: process.version, executableSha256: await sha256(process.execPath) }, platform: process.platform, architecture: process.arch, osVersion: os.version() },
  sources: await sourceIdentity(sources),
  prerequisite,
  oracle: { executableSha256: await sha256(oraclePath), observations: oracle },
  observations: {
    module: { format: module.format, byteLength: module.byteLength, sha256: module.sha256 },
    function: { name: fn.name, parameters: fn.parameters },
    parameterLayout: { offsets: layout.entries.map((entry) => entry.offset), byteLength: layout.byteLength },
    completion,
    checksum,
    oracleChecksum: oracle.RESULT[1],
    invalidModuleError,
    missingFunctionError,
    staleFunctionError,
    terminal,
  },
  rawPointerBoundary: 'All public records passed the bounded validator; evidence contains no module bytes, host parameter storage, native handle, address, stream, or event.',
  claimLimits: [
    `Exact ${nativeProfile} x64 Node 26.7.0 / CUDA Driver / toolkit / GPU input profile only.`,
    nativeProfile === 'linux' ? 'Operational F5L evidence remains unqualified until the complete exact Ubuntu chain is reviewed and promoted.' : 'Accepted Windows support remains limited to its recorded exact profile.',
    'One tracked PTX vector kernel, one private stream, and one event-polled launch at a time; no cross-platform inference, compilation, performance, packaging, or stable API claim.',
  ],
};
const target = await writeEvidence(nativeEvidenceName, evidence);
console.log(`F5${nativeProfile === 'windows' ? 'W' : 'L'} native launch passed: C/Node vector parity checksum ${checksum}, ${completion.pollCount} completion poll(s), explicit module/stream/context teardown.`);
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
