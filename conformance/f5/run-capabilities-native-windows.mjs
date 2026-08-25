import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { compileDeviceProgram, openCudaRuntime } from '../../components/runtime-facade/index.mjs';
import { parameterLayout } from '../../components/execution/index.mjs';
import {
  capabilityPtxPath,
  evidenceRoot,
  parseOracle,
  repositoryRoot,
  sha256,
  sourceIdentity,
  writeEvidence,
} from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F5 native capability conformance requires Windows.');
assert.equal(process.arch, 'x64', 'F5 native capability conformance requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F5 native capability conformance requires official Node v26.7.0.');

function u32Words(bytes) {
  assert.equal(bytes.byteLength % 4, 0);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({ length: bytes.byteLength / 4 }, (_, index) => view.getUint32(index * 4, true));
}

function u32Bytes(words) {
  const storage = new Uint8Array(words.length * 4);
  const view = new DataView(storage.buffer);
  words.forEach((word, index) => view.setUint32(index * 4, word, true));
  return storage;
}

const ptx = Uint8Array.from(await readFile(capabilityPtxPath));
const oracle = parseOracle(await readFile(path.join(evidenceRoot, 'capability-oracle.txt'), 'utf8'));
const scalarCases = [
  { arguments: [0, 0n, -0x8000_0000, -0], expected: oracle.SCALAR_CASE_0 },
  { arguments: [0xffff_ffff, 0xffff_ffff_ffff_ffffn, 0x7fff_ffff, 1 / 3], expected: oracle.SCALAR_CASE_1 },
  { arguments: [0x1234_5678, 0x0102_0304_0506_0708n, -2, 1.5], expected: oracle.SCALAR_CASE_2 },
];
const scalarParameters = [{ kind: 'u32' }, { kind: 'u64' }, { kind: 'i32' }, { kind: 'f32' }, { kind: 'device-memory' }];
const layout = parameterLayout(scalarParameters);
assert.deepEqual([...layout.entries.map((entry) => entry.offset), layout.byteLength], oracle.SCALAR_LAYOUT);

const runtime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 64, maxAllocationBytes: 20, maxTransferBytes: 20 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 8, maxCompletionMilliseconds: 30_000 },
  },
});
let module;
let scalar;
let delayed;
let scalarOutput;
let delayedOutput;
let terminal;
const scalarObservations = [];
let operationObservation;
try {
  module = await runtime.loadModule({ format: 'ptx', bytes: ptx });
  scalar = await module.getFunction({ name: 'cuda_js_native_scalar', parameters: scalarParameters });
  delayed = await module.getFunction({ name: 'cuda_js_native_delayed', parameters: [{ kind: 'device-memory' }, { kind: 'u64' }] });
  scalarOutput = await runtime.allocateDevice({ byteLength: 20 });
  delayedOutput = await runtime.allocateDevice({ byteLength: 4 });

  for (const [index, entry] of scalarCases.entries()) {
    await scalarOutput.write(new Uint8Array(20));
    const completion = await scalar.launch({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [...entry.arguments, scalarOutput] });
    const words = u32Words((await scalarOutput.read({ byteLength: 20 })).bytes);
    assert.deepEqual(words, entry.expected, `Scalar case ${index} differs from the independent oracle.`);
    scalarObservations.push({ caseId: `NQ-SCALAR-${index + 1}`, words, argumentKinds: completion.argumentKinds });
  }
  for (const badArguments of [
    [0, 1, 0, 1, scalarOutput],
    [0, 1n, 0x8000_0000, 1, scalarOutput],
    [0, 1n, 0, Infinity, scalarOutput],
  ]) {
    await assert.rejects(scalar.launch({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: badArguments }), (error) => error.code === 'DRIVER_LAUNCH_OPTIONS');
  }

  await delayedOutput.write(new Uint8Array(4));
  let applicationTimerFired = false;
  const applicationTimer = new Promise((resolve) => setTimeout(() => { applicationTimerFired = true; resolve(); }, 0));
  const operation = await delayed.submit({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [delayedOutput, 250_000_000n] });
  await applicationTimer;
  assert.equal(applicationTimerFired, true);
  await assert.rejects(delayedOutput.read({ byteLength: 4 }), (error) => error.code === 'EXECUTION_COMMAND_BLOCKED');
  await assert.rejects(delayed.submit({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [delayedOutput, 1n] }), (error) => error.code === 'EXECUTION_COMMAND_BLOCKED');
  const first = await operation.status();
  assert.equal(first.status, 'pending', 'The first native status must observe the completion event as not-ready.');
  const completed = await operation.wait();
  assert.equal(completed.status, 'completed');
  const delayedWords = u32Words((await delayedOutput.read({ byteLength: 4 })).bytes);
  assert.deepEqual(delayedWords, [oracle.DELAY_RESULT[0]]);
  await operation.close();
  operationObservation = { first, completed, applicationTimerFired, delayedWords };

  await delayed.close();
  await scalar.close();
  await module.close();
  await delayedOutput.close();
  await scalarOutput.close();
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);

const concurrentRuntime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 16, maxAllocationBytes: 4, maxTransferBytes: 4 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 4, maxCompletionMilliseconds: 30_000, maxPendingGpuOperations: 2 },
  },
});
let concurrentTerminal;
let concurrentObservation;
try {
  const concurrentModule = await concurrentRuntime.loadModule({ format: 'ptx', bytes: ptx });
  const producer = await concurrentModule.getFunction({ name: 'cuda_js_native_atomic_producer', parameters: [{ kind: 'device-memory' }, { kind: 'u64' }] });
  const observer = await concurrentModule.getFunction({ name: 'cuda_js_native_atomic_observer', parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }] });
  const shared = await concurrentRuntime.allocateDevice({ byteLength: 4 });
  const observed = await concurrentRuntime.allocateDevice({ byteLength: 4 });
  await shared.write(new Uint8Array(4));
  await observed.write(new Uint8Array(4));
  const producerOperation = await producer.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [shared, 500_000_000n],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-update-relaxed-device', dtype: 'u32' }],
  });
  const observerOperation = await observer.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [shared, observed],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-observe-relaxed-device', dtype: 'u32' },
      { argumentIndex: 1, byteOffset: 0, byteLength: 4, mode: 'write' },
    ],
  });
  const observerTerminal = await observerOperation.wait();
  const producerWhileObserverTerminal = await producerOperation.status();
  assert.equal(producerWhileObserverTerminal.status, 'pending', 'Independent observer must terminalize before the long producer on the qualified profile.');
  await producerOperation.wait();
  const observedWords = u32Words((await observed.read({ byteLength: 4 })).bytes);
  assert.deepEqual(observedWords, [1], 'The independent observer must read the valid in-progress atomic publication.');
  concurrentObservation = { observerTerminal, producerWhileObserverTerminal, observedWords };
  await observerOperation.close();
  await producerOperation.close();
  await observer.close();
  await producer.close();
  await concurrentModule.close();
  await observed.close();
  await shared.close();
} finally {
  concurrentTerminal = await concurrentRuntime.close();
}
assert.equal(concurrentTerminal.graceful, true);
assert.equal(concurrentTerminal.driver.resourceCounts.live, 0);
assert.equal(concurrentTerminal.driver.resourceCounts.orphaned, 0);

const transferRuntime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 64, maxAllocationBytes: 16, maxTransferBytes: 16 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 4, maxCompletionMilliseconds: 30_000, maxPendingGpuOperations: 2 },
  },
});
let transferTerminal;
let transferObservation;
try {
  const transferModule = await transferRuntime.loadModule({ format: 'ptx', bytes: ptx });
  const increment = await transferModule.getFunction({ name: 'cuda_js_native_transfer_increment', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const transferMemory = await transferRuntime.allocateDevice({ byteLength: 16 });
  const copyMemory = await transferRuntime.allocateDevice({ byteLength: 16 });
  const hostWords = [3, 5, 7, 11];
  const hostBytes = u32Bytes(hostWords);
  const uploadPromise = transferMemory.writeAsync(hostBytes);
  hostBytes.fill(0);
  const upload = await uploadPromise;
  const compute = await increment.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 4, y: 1, z: 1 }, arguments: [transferMemory, 4], after: upload,
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'read-write' }],
  });
  await upload.wait();
  const download = await transferMemory.readAsync({ byteLength: 16, after: compute });
  assert.equal(Object.hasOwn(download, 'result'), false);
  const downloadTerminal = await download.wait();
  const incrementedWords = u32Words(downloadTerminal.result.bytes);
  assert.deepEqual(incrementedWords, [4, 6, 8, 12], 'H2D -> kernel -> D2H must preserve the independent source vector and same-stream dependencies.');
  await compute.wait();

  const deviceCopy = await copyMemory.copyFromAsync(transferMemory, { byteLength: 16, after: compute });
  const copiedDownload = await copyMemory.readAsync({ byteLength: 16, after: deviceCopy });
  const copiedWords = u32Words((await copiedDownload.wait()).result.bytes);
  assert.deepEqual(copiedWords, incrementedWords, 'D2D -> D2H must preserve exact bytes.');
  await deviceCopy.wait();
  transferObservation = { oracleInputWords: oracle.ASYNC_TRANSFER, incrementedWords, copiedWords };

  await copiedDownload.close();
  await deviceCopy.close();
  await download.close();
  await compute.close();
  await upload.close();
  await increment.close();
  await transferModule.close();
  await copyMemory.close();
  await transferMemory.close();
} finally {
  transferTerminal = await transferRuntime.close();
}
assert.equal(transferTerminal.graceful, true);
assert.equal(transferTerminal.driver.resourceCounts.live, 0);
assert.equal(transferTerminal.driver.resourceCounts.orphaned, 0);

const mailboxRuntime = await openCudaRuntime({
  compiler: true,
  driver: {
    memory: { maxDeviceBytes: 4, maxAllocationBytes: 4, maxTransferBytes: 4 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 4, maxCompletionMilliseconds: 30_000 },
  },
});
let mailboxTerminal;
let mailboxObservation;
try {
  const source = `
function mailboxKernel(control, observation) {
  let value = gpu.u32(0);
  while (value === gpu.u32(0)) {
    value = gpu.mailbox.loadAcquireSystem(control);
  }
  gpu.mailbox.storeReleaseSystem(observation, value + gpu.u32(1));
}
`;
  const compiled = await compileDeviceProgram(mailboxRuntime, {
    source,
    functions: [{
      name: 'mailboxKernel',
      kind: 'kernel',
      parameters: [
        { name: 'control', type: 'mailbox<host-to-device,u32>' },
        { name: 'observation', type: 'mailbox<device-to-host,u32>' },
      ],
      returns: 'void',
    }],
    compile: { headerProfile: 'cuda-cccl' },
  });
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'mailboxKernel');
  assert(kernel);
  const module = await mailboxRuntime.loadModule({ format: 'ptx', bytes: compiled.compiler.artifact.bytes });
  const fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
  const mailbox = await mailboxRuntime.createPublicationMailbox({ lanes: [
    { name: 'control', direction: 'host-to-device' },
    { name: 'observation', direction: 'device-to-host' },
  ] });
  const operation = await fn.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 },
    arguments: [
      { kind: 'publication-mailbox', mailbox, lane: 'control' },
      { kind: 'publication-mailbox', mailbox, lane: 'observation' },
    ],
  });
  let applicationTimerFired = false;
  await new Promise((resolve) => setTimeout(() => { applicationTimerFired = true; resolve(); }, 0));
  const first = await operation.status();
  assert.equal(first.status, 'pending', 'The mailbox kernel must remain pending before the host publication.');
  await assert.rejects(mailbox.reset(), (error) => error.code === 'MEMORY_MAILBOX_BUSY');
  await assert.rejects(mailbox.close(), (error) => error.code === 'MEMORY_MAILBOX_BUSY');
  assert.equal(mailbox.store('control', 41), 41);
  const completed = await operation.wait();
  assert.equal(completed.status, 'completed');
  const observed = mailbox.load('observation');
  assert.equal(observed, 42);
  mailboxObservation = {
    first,
    completed,
    applicationTimerFired,
    published: 41,
    observed,
    generation: mailbox.generation,
    compilerArtifact: { format: compiled.compiler.artifact.format, byteLength: compiled.compiler.artifact.byteLength, sha256: compiled.compiler.artifact.sha256 },
  };
  await operation.close();
  await mailbox.close();
  await fn.close();
  await module.close();
} finally {
  mailboxTerminal = await mailboxRuntime.close();
}
assert.equal(mailboxTerminal.graceful, true);
assert.equal(mailboxTerminal.compiler.graceful, true);
assert.equal(mailboxTerminal.driver.resourceCounts.live, 0);
assert.equal(mailboxTerminal.driver.resourceCounts.orphaned, 0);

const closeRuntime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 4, maxAllocationBytes: 4, maxTransferBytes: 4 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 2, maxCompletionMilliseconds: 30_000 },
  },
});
const closeMemory = await closeRuntime.allocateDevice({ byteLength: 4 });
const closeModule = await closeRuntime.loadModule({ format: 'ptx', bytes: ptx });
const closeFunction = await closeModule.getFunction({ name: 'cuda_js_native_delayed', parameters: [{ kind: 'device-memory' }, { kind: 'u64' }] });
await closeFunction.submit({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [closeMemory, 250_000_000n] });
const pendingCloseTerminal = await closeRuntime.close();
assert.equal(pendingCloseTerminal.graceful, true);
assert.equal(pendingCloseTerminal.driver.resourceCounts.live, 0);
assert.equal(pendingCloseTerminal.driver.resourceCounts.orphaned, 0);

const child = spawnSync(process.execPath, ['--experimental-ffi', 'conformance/f5/run-operation-failure-native-windows.mjs'], { cwd: repositoryRoot, encoding: 'utf8' });
if (child.error) throw child.error;
if (child.status !== 0) throw new Error(`Native deferred-failure child failed (${child.status}).\n${child.stdout}\n${child.stderr}`);
const deferredFailure = JSON.parse(child.stdout.trim().split(/\r?\n/).at(-1));

const postFaultRuntime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 20, maxAllocationBytes: 20, maxTransferBytes: 20 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 8, maxCompletionMilliseconds: 30_000 },
  },
});
const postFaultMemory = await postFaultRuntime.allocateDevice({ byteLength: 20 });
const postFaultModule = await postFaultRuntime.loadModule({ format: 'ptx', bytes: ptx });
const postFaultFunction = await postFaultModule.getFunction({ name: 'cuda_js_native_scalar', parameters: scalarParameters });
await postFaultFunction.launch({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [0, 0n, 0, 0, postFaultMemory] });
assert.deepEqual(u32Words((await postFaultMemory.read({ byteLength: 20 })).bytes), [0, 0, 0, 0, 0]);
await postFaultFunction.close();
await postFaultModule.close();
await postFaultMemory.close();
const postFaultTerminal = await postFaultRuntime.close();
assert.equal(postFaultTerminal.graceful, true);
assert.equal(postFaultTerminal.driver.resourceCounts.live, 0);
assert.equal(postFaultTerminal.driver.resourceCounts.orphaned, 0);

const sources = [
  'docs/specs/SPEC-0011-scalar-kernel-arguments.md',
  'docs/specs/SPEC-0016-operation-lifecycle.md',
  'docs/specs/SPEC-0018-bounded-multi-operation-scheduling.md',
  'docs/specs/SPEC-0019-host-memory-and-async-transfer.md',
  'docs/specs/SPEC-0014-long-lived-sideband.md',
  'components/publication-mailbox/src/publication-mailbox-manager.mjs',
  'components/device-js/src/translator.mjs',
  'components/execution/src/execution-manager.mjs',
  'components/host-memory-transfer/src/host-memory-transfer-manager.mjs',
  'components/driver-actor/src/backends/windows-native.mjs',
  'components/runtime-facade/src/runtime.mjs',
  'conformance/f5/fixtures/native-capabilities.cu.txt',
  'conformance/f5/native/windows-capability-oracle.c',
  'conformance/f5/run-capabilities-native-windows.mjs',
  'conformance/f5/run-operation-failure-native-windows.mjs',
];
const target = await writeEvidence('native-windows-capabilities.json', {
  schemaVersion: 1,
  workPackage: 'NQ-SCALAR/NQ-OPERATION/NQ-TRANSFER/NQ-MAILBOX',
  capsule: 'public-facade-native-scalar-operation-transfer-mailbox-lifecycle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: { version: process.version, moduleAbi: process.versions.modules, executableSha256: await sha256(process.execPath) }, platform: process.platform, architecture: process.arch, osVersion: os.version() },
  sources: await sourceIdentity(sources),
  oracle: { scalarLayout: oracle.SCALAR_LAYOUT, typeLayout: oracle.TYPE_LAYOUT, firstEventQueryStatus: oracle.DELAY_FIRST_QUERY[0], delayedWord: oracle.DELAY_RESULT[0], asyncTransferWords: oracle.ASYNC_TRANSFER, mailboxPublication: oracle.MAILBOX_PUBLICATION, ptxSha256: await sha256(capabilityPtxPath) },
  observations: { scalarCases: scalarObservations, operation: operationObservation, concurrentAtomicObservation: concurrentObservation, concurrentTerminal, asyncTransfer: transferObservation, transferTerminal, mailbox: mailboxObservation, mailboxTerminal, pendingRuntimeClose: pendingCloseTerminal, deferredFailure, postFaultTerminal, terminal },
  capabilityBoundary: 'All native handles, packed bytes, stream/event identity, mapped mailbox storage, and faulting context state remained private. The deferred fault ran in a child process with its own private runtime/context.',
  claimLimits: [
    'Exact Windows x64 Node 26.7.0 / Driver 610.74 / CUDA 13.3 / GTX 1660 Ti sm_75 profile only.',
    'The delay proves asynchronous not-ready/status/close semantics, not a latency or performance guarantee.',
    'The qualified widened profile is exactly two private streams, two pending operations, no queue, and declared u32/u64 relaxed device-scope atomic access.',
    'The async transfer profile is exactly two internal pinned staging blocks, contiguous H2D/D2H/D2D, snapshot ingress, and terminal-result egress; it makes no universal overlap claim.',
    'The mailbox profile is exactly one privately mapped mailbox, named u32 lanes, one direction and writer per lane, one live GPU operation lease, and system-scope acquire/release publication.',
  ],
});
console.log(`F5 native capability conformance passed: ${scalarObservations.length} scalar cases, native pending/terminal lifecycle, mapped mailbox publication, conservative deferred failure, and terminal cleanup. Evidence: ${path.relative(repositoryRoot, target)}`);
