import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { openCudaRuntime } from '../../components/runtime-facade/index.mjs';
import {
  capabilityArtifacts,
  capabilitySources,
  digestBytes,
  repositoryRoot,
  sha256,
  sourceIdentity,
  writeEvidence,
} from './evidence.mjs';

assert.equal(process.platform, 'win32');
assert.equal(process.arch, 'x64');
assert.equal(process.version, 'v26.7.0');

const source = Object.fromEntries(await Promise.all(Object.entries(capabilitySources).map(async ([name, file]) => [name, await readFile(file, 'utf8')])));
const oracle = Object.fromEntries(await Promise.all(Object.entries(capabilityArtifacts).map(async ([name, file]) => [name, Uint8Array.from(await readFile(file))])));
const elementCount = 64;
const inputWords = Uint32Array.from({ length: elementCount }, (_, index) => ((index * 0x01010101) ^ 0xdeadbeef) >>> 0);
const inputBytes = Uint8Array.from(new Uint8Array(inputWords.buffer));
const memoryBytes = elementCount * 4;
const runtime = await openCudaRuntime({
  compiler: true,
  driver: {
    memory: { maxDeviceBytes: memoryBytes * 2, maxAllocationBytes: memoryBytes, maxTransferBytes: memoryBytes },
    execution: { maxModuleBytes: 4_194_304, maxArguments: 4, maxCompletionMilliseconds: 30_000 },
  },
});

const failures = {};
const artifacts = {};
const launches = [];
let terminal;
let statusBeforeClose;
try {
  try { await runtime.compile({ source: 'extern "C" __global__ void malformed( {', name: 'invalid.cu' }); }
  catch (error) { failures.compile = { code: error.code, category: error.category, healthBefore: error.healthBefore, healthAfter: error.healthAfter }; }
  assert.equal(failures.compile.category, 'compile');
  assert.equal(runtime.health, 'healthy');

  try { await runtime.link({ inputs: [Uint8Array.from(Buffer.from('not valid PTX'))] }); }
  catch (error) { failures.link = { code: error.code, category: error.category, healthBefore: error.healthBefore, healthAfter: error.healthAfter }; }
  assert.equal(failures.link.category, 'link');
  assert.equal(runtime.health, 'healthy');

  const defaultOmitted = await runtime.compile({ source: source.rdcDevice, name: 'default-control.cu' });
  const defaultExplicit = await runtime.compile({ source: source.rdcDevice, name: 'default-control.cu', options: { relocatableDeviceCode: false } });
  assert.deepEqual(defaultOmitted.artifact.bytes, defaultExplicit.artifact.bytes);
  assert.equal(defaultOmitted.cache.key, defaultExplicit.cache.key);
  assert.equal(Object.hasOwn(defaultOmitted.artifact, 'relocatableDeviceCode'), false);

  let timerFired = false;
  const timer = new Promise((resolve) => setTimeout(() => { timerFired = true; resolve(); }, 0));
  const rdcKernel = await runtime.compile({ source: source.rdcKernel, name: 'rdc-kernel.cu', options: { relocatableDeviceCode: true } });
  await timer;
  assert.equal(timerFired, true);
  const rdcDevice = await runtime.compile({ source: source.rdcDevice, name: 'rdc-device.cu', options: { relocatableDeviceCode: true } });
  assert.equal(rdcKernel.artifact.relocatableDeviceCode, true);
  assert.equal(rdcDevice.artifact.relocatableDeviceCode, true);
  assert.deepEqual(rdcKernel.artifact.bytes, oracle.rdcKernel);
  assert.deepEqual(rdcDevice.artifact.bytes, oracle.rdcDevice);
  const rdcLink = await runtime.link({ inputs: [rdcKernel.artifact, rdcDevice.artifact] });
  assert.deepEqual(rdcLink.artifact.bytes, oracle.rdcCubin);

  const ltoKernel = await runtime.compile({ source: source.ltoKernel, name: 'lto-kernel.cu', output: 'lto-ir' });
  const ltoDevice = await runtime.compile({ source: source.ltoDevice, name: 'lto-device.cu', output: 'lto-ir' });
  assert.equal(ltoKernel.artifact.format, 'lto-ir');
  assert.equal(ltoDevice.artifact.format, 'lto-ir');
  assert.equal(ltoKernel.artifact.bytes.includes(0), true);
  assert.deepEqual(ltoKernel.artifact.bytes, oracle.ltoKernel);
  assert.deepEqual(ltoDevice.artifact.bytes, oracle.ltoDevice);
  const ltoLink = await runtime.link({ inputs: [ltoKernel.artifact, ltoDevice.artifact] });
  assert.deepEqual(ltoLink.artifact.bytes, oracle.ltoCubin);

  await assert.rejects(runtime.link({ inputs: [rdcKernel.artifact, ltoKernel.artifact] }), (error) => error.code === 'LINKER_INPUT_FORMAT_MIXED');
  const corruptBytes = Uint8Array.from(ltoKernel.artifact.bytes);
  corruptBytes[0] ^= 0xff;
  await assert.rejects(runtime.link({ inputs: [{ ...ltoKernel.artifact, bytes: corruptBytes }] }), (error) => error.code === 'LINKER_INPUT_INVALID');
  await assert.rejects(runtime.link({ inputs: [{ ...ltoKernel.artifact, producer: { ...ltoKernel.artifact.producer, nvrtcVersion: '12.9' } }] }), (error) => error.code === 'LINKER_LTO_INCOMPATIBLE');
  try { await runtime.link({ inputs: [ltoKernel.artifact.bytes] }); }
  catch (error) { failures.rawLto = { code: error.code, category: error.category }; }
  assert.equal(failures.rawLto.category, 'validation');
  assert.equal(failures.rawLto.code, 'LINKER_INPUT_INVALID');
  assert.equal(runtime.health, 'healthy');

  artifacts.rdc = { inputs: [rdcKernel, rdcDevice].map((result) => ({ format: result.artifact.format, byteLength: result.artifact.byteLength, sha256: result.artifact.sha256, cacheKey: result.cache.key })), cubin: { byteLength: rdcLink.artifact.byteLength, sha256: rdcLink.artifact.sha256, cacheKey: rdcLink.cache.key } };
  artifacts.lto = { inputs: [ltoKernel, ltoDevice].map((result) => ({ format: result.artifact.format, byteLength: result.artifact.byteLength, sha256: result.artifact.sha256, producer: result.artifact.producer, cacheKey: result.cache.key })), cubin: { byteLength: ltoLink.artifact.byteLength, sha256: ltoLink.artifact.sha256, cacheKey: ltoLink.cache.key } };

  const input = await runtime.allocateDevice({ byteLength: memoryBytes });
  const output = await runtime.allocateDevice({ byteLength: memoryBytes });
  await input.write(inputBytes);
  for (const candidate of [
    { capability: 'rdc', artifact: rdcLink.artifact, functionName: 'cuda_js_rdc_kernel', oracleOutput: oracle.rdcOutput },
    { capability: 'lto', artifact: ltoLink.artifact, functionName: 'cuda_js_lto_kernel', oracleOutput: oracle.ltoOutput },
  ]) {
    const module = await runtime.loadModule({ format: 'cubin', bytes: candidate.artifact.bytes });
    const fn = await module.getFunction({ name: candidate.functionName, parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }] });
    const completion = await fn.launch({ grid: { x: 1, y: 1, z: 1 }, block: { x: elementCount, y: 1, z: 1 }, arguments: [input, output, elementCount] });
    const read = await output.read({ byteLength: memoryBytes });
    assert.deepEqual(read.bytes, candidate.oracleOutput);
    launches.push({ capability: candidate.capability, status: completion.status, pollCount: completion.pollCount, moduleSha256: module.sha256, outputSha256: digestBytes(read.bytes), exactIndependentOracleParity: true });
    await fn.close();
    await module.close();
  }
  await output.close();
  await input.close();

  statusBeforeClose = await runtime.describe();
  assert.equal(statusBeforeClose.compiler.resources.programsCreated, statusBeforeClose.compiler.resources.programsDestroyed);
  assert.equal(statusBeforeClose.compiler.resources.linksCreated, statusBeforeClose.compiler.resources.linksDestroyed);
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.graceful, true);
assert.equal(terminal.compiler.resources.programsCreated, terminal.compiler.resources.programsDestroyed);
assert.equal(terminal.compiler.resources.linksCreated, terminal.compiler.resources.linksDestroyed);
assert.equal(terminal.driver.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);

const sources = [
  'docs/specs/SPEC-0010-relocatable-device-code.md',
  'docs/specs/SPEC-0012-device-lto.md',
  'components/compiler-actor/src/contract.mjs',
  'components/compiler-actor/src/backends/windows-native.mjs',
  'components/runtime-facade/src/runtime.mjs',
  'conformance/f6/run-capabilities-native-windows.mjs',
  'conformance/f6/fixtures/rdc-kernel.cu.txt',
  'conformance/f6/fixtures/rdc-device.cu.txt',
  'conformance/f6/fixtures/lto-kernel.cu.txt',
  'conformance/f6/fixtures/lto-device.cu.txt',
];
const target = await writeEvidence('native-windows-capabilities.json', {
  schemaVersion: 1,
  workPackage: 'NQ-RDC/NQ-LTO',
  capsule: 'public-facade-rdc-lto-native-qualification',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: { version: process.version, executableSha256: await sha256(process.execPath) }, platform: process.platform, architecture: process.arch, osVersion: os.version() },
  sources: await sourceIdentity(sources),
  oracle: Object.fromEntries(Object.entries(capabilityArtifacts).map(([name]) => [name, { byteLength: oracle[name].byteLength, sha256: digestBytes(oracle[name]) }])),
  observations: { defaultPtxStable: true, applicationTimerFired: true, failures, artifacts, launches, compilerResourcesBeforeClose: statusBeforeClose.compiler.resources, terminal },
  capabilityBoundary: 'Evidence contains copied identities, outputs, failure classifications, and terminal records only; no source, artifact bytes, native handle, address, program, link, module, stream, or event capability is recorded.',
  claimLimits: ['Exact accepted Windows x64 Node 26.7.0, CUDA 13.3 provider, Driver, and compute_75 GPU profile only.', 'No Linux/WSL/ARM, performance, cross-provider deterministic-output, or general linker-control claim.'],
});
console.log(`F6 native capabilities passed: exact independent parity for two RDC PTX units, two LTO-IR units, both cubins, and both GPU outputs. Evidence: ${path.relative(repositoryRoot, target)}`);
