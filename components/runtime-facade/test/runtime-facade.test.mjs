import assert from 'node:assert/strict';
import test from 'node:test';

import { CUDA_JS_COMPATIBILITY, CudaJsError, inspectCudaHost, openCudaRuntime } from '../index.mjs';
import { openCudaRuntimeWithAdapters } from '../src/runtime.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const MOCK_PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
const SOURCE = 'extern "C" __global__ void unrelated_kernel() {}\n';

function expectCode(code) {
  return (error) => error instanceof CudaJsError && error.code === code;
}

test('compatibility and host inspection are immutable and reconcile the current public surface', () => {
  assert.equal(CUDA_JS_COMPATIBILITY.package.version, '0.1.0-alpha.4');
  assert.equal(CUDA_JS_COMPATIBILITY.node.version, 'v26.7.0');
  assert.equal(CUDA_JS_COMPATIBILITY.node.minimumVersion, 'v26.1.0');
  assert.equal(CUDA_JS_COMPATIBILITY.node.operationPolicy, 'testing-unconfirmed-at-or-above-minimum');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY), true);
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.nativeProfiles), true);
  const inspection = inspectCudaHost();
  assert.equal(inspection.host.node.version, process.version);
  assert.equal(inspection.compatibility, CUDA_JS_COMPATIBILITY);
  assert.equal(Object.isFrozen(inspection), true);
});

test('native entry fails before provider work when its launch profile is absent', async () => {
  if (process.platform === 'win32' && !process.execArgv.includes('--experimental-ffi')) await assert.rejects(openCudaRuntime(), expectCode('CUDA_JS_FFI_FLAG_REQUIRED'));
});

test('facade owns copied memory and hides private actor capabilities', async () => {
  const runtime = await openCudaRuntimeForTesting({ driver: { memory: { maxDeviceBytes: 32, maxAllocationBytes: 16, maxTransferBytes: 16 } } });
  const memory = await runtime.allocateDevice({ byteLength: 16 });
  assert.deepEqual(Object.keys(runtime), []);
  assert.deepEqual(Object.keys(memory), []);
  assert.equal(JSON.stringify(runtime), '{}');
  assert.equal(JSON.stringify(memory), '{}');
  const source = Uint8Array.of(1, 2, 3, 4);
  await memory.write(source, { deviceOffset: 4 });
  source.fill(9);
  const copy = await memory.read({ deviceOffset: 4, byteLength: 4 });
  assert.deepEqual([...copy.bytes], [1, 2, 3, 4]);
  copy.bytes.fill(8);
  assert.deepEqual([...(await memory.read({ deviceOffset: 4, byteLength: 4 })).bytes], [1, 2, 3, 4]);
  assert.equal((await memory.close()).state, 'closed');
  assert.equal((await memory.close()).alreadyTerminal, true);
  await assert.rejects(memory.read({ byteLength: 1 }), expectCode('CUDA_JS_RESOURCE_CLOSED'));
  assert.equal((await runtime.close()).graceful, true);
});

test('module and function capabilities translate declared public launch arguments', async () => {
  const runtime = await openCudaRuntimeForTesting();
  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await module.getFunction({ name: 'unrelated_kernel', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const memory = await runtime.allocateDevice({ byteLength: 8 });
  const completion = await fn.launch({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [memory, 2] });
  assert.equal(completion.status, 'completed');
  assert.deepEqual(completion.argumentKinds, ['device-memory', 'u32']);
  assert.equal(JSON.stringify(fn), '{}');
  await fn.close();
  await module.close();
  await memory.close();
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.driver.workerExitCode, 0);
  assert.deepEqual(Object.keys(terminal.driver).sort(), ['cleanupClaim', 'graceful', 'health', 'resourceCounts', 'restartRequired', 'workerExitCode', 'workerExited'].sort());
});

test('optional compiler is explicit and returns copied PTX and cubin artifacts', async () => {
  const disabled = await openCudaRuntimeForTesting();
  await assert.rejects(disabled.compile({ source: SOURCE }), expectCode('CUDA_JS_COMPILER_DISABLED'));
  await disabled.close();
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  const compiled = await runtime.compile({ source: SOURCE });
  const linked = await runtime.link({ inputs: [compiled.artifact] });
  assert.equal(compiled.artifact.format, 'ptx');
  assert.equal(linked.artifact.format, 'cubin');
  assert.notEqual(compiled.artifact.bytes, linked.artifact.bytes);
  const description = await runtime.describe();
  assert.equal(description.compiler.claim, 'platform-neutral-compiler-mock-only');
  assert.equal(Object.hasOwn(description.compiler, 'runtime'), false);
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.compiler.workerExitCode, 0);
});

test('two runtimes isolate resources and first close leaves the second usable', async () => {
  const first = await openCudaRuntimeForTesting();
  const second = await openCudaRuntimeForTesting();
  const firstModule = await first.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const firstFunction = await firstModule.getFunction({ name: 'first', parameters: [{ kind: 'device-memory' }] });
  const secondMemory = await second.allocateDevice({ byteLength: 8 });
  await assert.rejects(firstFunction.launch({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [secondMemory] }), expectCode('CUDA_JS_RESOURCE_OWNER'));
  assert.equal((await first.close()).graceful, true);
  await secondMemory.write(Uint8Array.of(7));
  assert.deepEqual([...(await secondMemory.read({ byteLength: 1 })).bytes], [7]);
  assert.equal((await second.close()).graceful, true);
  assert.equal(secondMemory.state, 'closed');
});

test('public compiler cache never defaults to package-owned writable storage', async () => {
  await assert.rejects(openCudaRuntimeForTesting({ compiler: { cacheMode: 'read-write' } }), expectCode('CUDA_JS_CACHE_DIRECTORY_REQUIRED'));
  await assert.rejects(openCudaRuntimeForTesting({ extra: true }), expectCode('CUDA_JS_OPTIONS_INVALID'));
});

test('aggregate close attempts both owners and reports unproved cleanup without throwing', async () => {
  const closed = [];
  const driver = { health: 'healthy', async describe() { return { claim: 'stub' }; }, async close() { closed.push('driver'); throw Object.assign(new Error('driver close'), { code: 'DRIVER_CLOSE', category: 'restart-required' }); } };
  const compiler = { health: 'healthy', async close() { closed.push('compiler'); throw Object.assign(new Error('compiler close'), { code: 'COMPILER_CLOSE', category: 'restart-required' }); } };
  const runtime = await openCudaRuntimeWithAdapters({ compiler: true }, { openDriver: async () => driver, openCompiler: async () => compiler }, () => ({ status: 'mock-only' }));
  const terminal = await runtime.close();
  assert.deepEqual(closed, ['compiler', 'driver']);
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.restartRequired, true);
  assert.equal(terminal.compiler.error.code, 'COMPILER_CLOSE');
  assert.equal(terminal.driver.error.code, 'DRIVER_CLOSE');
});

test('open failure reports restart-required when an acquired owner cannot close', async () => {
  const driver = { health: 'healthy', async describe() { return { claim: 'stub' }; }, async close() { return { graceful: false }; } };
  await assert.rejects(openCudaRuntimeWithAdapters({ compiler: true }, {
    openDriver: async () => driver,
    openCompiler: async () => { throw Object.assign(new Error('compiler open'), { code: 'COMPILER_OPEN', category: 'provider' }); },
  }, () => ({ status: 'mock-only' })), expectCode('CUDA_JS_OPEN_CLEANUP_UNPROVED'));
});

test('unconfirmed profiles operate while known-incompatible profiles close and reject', async () => {
  const closed = [];
  const adapter = { health: 'healthy', async describe() { return { claim: 'candidate' }; }, async close() { closed.push('driver'); return { graceful: true, workerExited: true, workerExitCode: 0 }; } };
  const candidate = await openCudaRuntimeWithAdapters({}, { openDriver: async () => adapter, openCompiler: async () => null }, () => ({ status: 'testing-unconfirmed', reason: 'PROFILE_EVIDENCE_UNCONFIRMED' }));
  assert.equal((await candidate.describe()).support.status, 'testing-unconfirmed');
  assert.equal((await candidate.close()).graceful, true);
  await assert.rejects(openCudaRuntimeWithAdapters({}, { openDriver: async () => adapter, openCompiler: async () => null }, () => ({ status: 'incompatible', reason: 'KNOWN_INCOMPATIBLE_FIXTURE' })), expectCode('CUDA_JS_PROFILE_INCOMPATIBLE'));
  assert.deepEqual(closed, ['driver', 'driver']);
});
