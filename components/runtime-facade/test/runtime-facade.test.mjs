import assert from 'node:assert/strict';
import test from 'node:test';

import { COMPILER_RUNTIME_TEST, openCompilerRuntimeForTesting } from '../../compiler-actor/testing.mjs';
import { CUDA_JS_COMPATIBILITY, CudaJsError, inspectCudaHost, openCudaRuntime } from '../index.mjs';
import { openCudaRuntimeWithAdapters } from '../src/runtime.mjs';
import { discoverCudaDevicesForTesting, openCudaRuntimeForTesting } from '../testing.mjs';

const MOCK_PTX = new TextEncoder().encode('.version 8.0\n.target sm_75\n.address_size 64\n');
const SOURCE = 'extern "C" __global__ void unrelated_kernel() {}\n';

function expectCode(code) {
  return (error) => error instanceof CudaJsError && error.code === code;
}

function driverDescription(claim = 'stub') {
  return {
    claim,
    driver: { apiVersion: 13030, deviceCount: 1 },
    device: { ordinal: 0, attributes: { computeCapabilityMajor: 7, computeCapabilityMinor: 5 } },
  };
}

test('compatibility and host inspection are immutable and reconcile the current public surface', () => {
  assert.equal(CUDA_JS_COMPATIBILITY.package.version, '0.1.0-alpha.12');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceSelection, 'finite-sanitized-snapshot-opaque-process-local-selector-one-device-per-runtime-selected-targets');
  assert.equal(CUDA_JS_COMPATIBILITY.node.version, 'v26.7.0');
  assert.equal(CUDA_JS_COMPATIBILITY.node.minimumVersion, 'v26.1.0');
  assert.equal(CUDA_JS_COMPATIBILITY.node.operationPolicy, 'testing-unconfirmed-at-or-above-minimum');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16', 'publication-mailbox-host-to-device-u32', 'publication-mailbox-device-to-host-u32']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.typedDeviceViews, 'allocation-owned-contiguous-1d-opaque-capability-explicit-launch-access');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.boundedMultiOperationScheduling, 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.asyncTransfers, 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.publicationMailboxes, 'private-mapped-named-u32-one-operation-lease-system-acquire-release');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDags, 'bounded-kernel-dag-immutable-bindings-single-stream-semantic-replay');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.cublasLtF32Matmul, 'optional-row-major-contiguous-typed-views-explicit-bounded-workspace');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsFrontend, 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1+spec-0022-device-publication-v1+spec-0014-publication-mailbox-v1');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLibraries, 'typed-leaf-libraries-explicit-aliased-imports-rdc-or-lto-final-cubin');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.deviceJsParser, { name: 'acorn', version: '8.15.0', role: 'syntax-only-replaceable-adapter' });
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY), true);
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.nativeProfiles), true);
  const linux = CUDA_JS_COMPATIBILITY.nativeProfiles.find((profile) => profile.host === 'linux-native-x64');
  assert.equal(linux.status, 'testing-unconfirmed-by-default');
  assert.equal(linux.qualification, 'not-qualified');
  const inspection = inspectCudaHost();
  assert.equal(inspection.host.node.version, process.version);
  assert.equal(inspection.compatibility, CUDA_JS_COMPATIBILITY);
  assert.equal(Object.isFrozen(inspection), true);
});

test('public error details bound hostile traversal and redact identity and capability evidence', () => {
  let getterCalls = 0;
  const wide = {};
  for (let index = 0; index < 2_000; index += 1) {
    Object.defineProperty(wide, `field${String(index).padStart(4, '0')}`, {
      enumerable: true,
      get() { getterCalls += 1; return index; },
    });
  }
  const bounded = new CudaJsError('CUDA_JS_TEST', 'internal', 'test', wide);
  assert.equal(Object.keys(bounded.details).length, 64);
  assert.equal(getterCalls, 64);

  const trapped = new Proxy({}, { getPrototypeOf() { throw new Error('getPrototypeOf trap leaked'); } });
  assert.doesNotThrow(() => new CudaJsError('CUDA_JS_TEST', 'internal', 'test', trapped));
  assert.deepEqual(new CudaJsError('CUDA_JS_TEST', 'internal', 'test', trapped).details, {});

  const capability = 'b'.repeat(32);
  const redacted = new CudaJsError('CUDA_JS_TEST', 'internal', 'test', {
    username: 'secret-user',
    email: 'account@example.internal',
    machine: 'secret-host',
    nativeAddress: 'decimal-native-address-123456789',
    causeMessage: `cleanup on host secret-host for user secret-user nonce=${capability} token ${capability} address 123456789 email account@example.internal`,
  });
  const serialized = JSON.stringify(redacted.details);
  assert.deepEqual(Object.keys(redacted.details), ['causeMessage']);
  assert.match(redacted.details.causeMessage, /\[redacted-identity\]/);
  assert.match(redacted.details.causeMessage, /\[redacted-capability\]/);
  assert.match(redacted.details.causeMessage, /\[redacted-handle\]/);
  assert.doesNotMatch(serialized, /secret|example\.internal|123456789|b{32}/);
});

test('native entry fails before provider work when its launch profile is absent', async () => {
  if (['win32', 'linux'].includes(process.platform) && process.arch === 'x64' && !process.execArgv.includes('--experimental-ffi')) await assert.rejects(openCudaRuntime(), expectCode('CUDA_JS_FFI_FLAG_REQUIRED'));
});

test('opaque selection binds DriverActor bootstrap and selected-device compiler defaults without public native identity', async () => {
  const snapshot = await discoverCudaDevicesForTesting([
    { nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 },
    { nativeDevice: 7, computeCapabilityMajor: 8, computeCapabilityMinor: 9 },
  ]);
  assert.equal(snapshot.deviceCount, 2);
  assert.equal(JSON.stringify(snapshot.devices[1].selector), '{}');

  const selected = await openCudaRuntimeForTesting({ device: snapshot.devices[1].selector, compiler: true });
  const selectedDescription = await selected.describe();
  assert.deepEqual(selectedDescription.device.architecture, { major: 8, minor: 9, class: 'cc-8.9' });
  assert.equal(selectedDescription.device.selection, 'explicit');
  assert.equal(selectedDescription.device.target.compile, 'compute_89');
  assert.equal(selectedDescription.device.target.link, 'sm_89');
  assert.equal(JSON.stringify(selectedDescription).includes('ordinal'), false);
  assert.equal(JSON.stringify(selectedDescription).includes('nativeDevice'), false);
  const selectedCompile = await selected.compile({ source: SOURCE });
  const selectedLink = await selected.link({ inputs: [selectedCompile.artifact] });
  assert.equal(selectedCompile.artifact.architecture, 'compute_89');
  assert.equal(selectedLink.artifact.architecture, 'sm_89');

  const implicit = await openCudaRuntimeForTesting({ compiler: true });
  const implicitDescription = await implicit.describe();
  assert.equal(implicitDescription.device.selection, 'default');
  assert.equal(implicitDescription.device.target.compile, 'compute_75');
  const implicitCompile = await implicit.compile({ source: SOURCE });
  assert.notEqual(selectedCompile.cache.key, implicitCompile.cache.key);

  assert.equal((await selected.close()).graceful, true);
  assert.equal((await implicit.close()).graceful, true);
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

test('public typed views preserve bounded ranges, access roles, operation leases and opaque ownership', async (context) => {
  const runtime = await openCudaRuntimeForTesting();
  context.after(async () => { await runtime.close(); });
  const memory = await runtime.allocateDevice({ byteLength: 32 });
  const view = await memory.view({ dtype: 'f32', byteOffset: 8, elementCount: 4, access: 'read' });
  assert.deepEqual(Object.keys(view), []);
  assert.equal(JSON.stringify(view), '{}');
  assert.equal(view.kind, 'device-view');
  assert.equal(view.dtype, 'f32');
  assert.equal(view.byteOffset, 8);
  assert.equal(view.elementCount, 4);
  assert.equal(view.byteLength, 16);
  assert.equal(view.access, 'read');
  assert.deepEqual(await view.status(), { schemaVersion: 1, kind: 'device-view', state: 'open', dtype: 'f32', byteOffset: 8, elementCount: 4, byteLength: 16, access: 'read' });

  const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
  const fn = await module.getFunction({ name: 'unrelated_kernel', parameters: [{ kind: 'device-memory' }] });
  const launch = { grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [view] };
  await assert.rejects(fn.submit(launch), expectCode('EXECUTION_ACCESSES_REQUIRED'));
  await assert.rejects(fn.submit({ ...launch, accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'write' }] }), expectCode('MEMORY_VIEW_ACCESS_DENIED'));
  await assert.rejects(fn.submit({ ...launch, accesses: [{ argumentIndex: 0, byteOffset: 12, byteLength: 8, mode: 'read' }] }), expectCode('EXECUTION_ACCESS_RANGE'));

  const operation = await fn.submit({ ...launch, accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'read' }] });
  await assert.rejects(view.close(), expectCode('RESOURCE_BUSY'));
  assert.equal((await operation.wait()).status, 'completed');
  await operation.close();
  await assert.rejects(memory.close(), expectCode('RESOURCE_HAS_CHILDREN'));
  assert.equal((await view.close()).state, 'closed');
  assert.equal((await memory.close()).state, 'closed');
  await fn.close();
  await module.close();
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

test('CompilerActor cleanup degradation blocks cross-owner facade admission', async () => {
  let compiler;
  let allocations = 0;
  let moduleLoads = 0;
  const driver = {
    state: 'open',
    health: 'healthy',
    async describe() { return driverDescription(); },
    async allocateDevice() { allocations += 1; throw new Error('allocation should not be admitted'); },
    async loadModule() { moduleLoads += 1; throw new Error('module load should not be admitted'); },
    async close() {
      driver.state = 'closed';
      driver.health = 'closed';
      return { graceful: true, cleanupClaim: 'proved-stub', health: { current: 'closed' }, workerExited: true, workerExitCode: 0 };
    },
  };
  const runtime = await openCudaRuntimeWithAdapters({ compiler: true }, {
    openDriver: async () => driver,
    openCompiler: async (options) => {
      compiler = await openCompilerRuntimeForTesting(options);
      return compiler;
    },
  }, () => ({ status: 'mock-only' }));

  await compiler[COMPILER_RUNTIME_TEST]('testing.failure-mode', { mode: 'compile-operation-destroy' });
  await assert.rejects(runtime.compile({ source: SOURCE }), (error) => error.code === 'COMPILER_INJECTED_DESTROY_FAILURE' && error.healthAfter === 'restart-required');
  assert.equal(runtime.health, 'restart-required');
  assert.equal(runtime.state, 'restart-required');
  await assert.rejects(runtime.allocateDevice({ byteLength: 1 }), (error) => error.code === 'CUDA_JS_RUNTIME_CLOSED' && error.category === 'restart-required');
  await assert.rejects(runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX }), (error) => error.code === 'CUDA_JS_RUNTIME_CLOSED' && error.category === 'restart-required');
  assert.equal(allocations, 0);
  assert.equal(moduleLoads, 0);
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.restartRequired, true);
  assert.equal(terminal.compiler.materialFailure.code, 'COMPILER_INJECTED_DESTROY_FAILURE');
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
  const driver = { health: 'healthy', async describe() { return driverDescription(); }, async close() { closed.push('driver'); throw Object.assign(new Error('driver close'), { code: 'DRIVER_CLOSE', category: 'restart-required' }); } };
  const compiler = { health: 'healthy', async close() { closed.push('compiler'); throw Object.assign(new Error('compiler close'), { code: 'COMPILER_CLOSE', category: 'restart-required' }); } };
  const runtime = await openCudaRuntimeWithAdapters({ compiler: true }, { openDriver: async () => driver, openCompiler: async () => compiler }, () => ({ status: 'mock-only' }));
  const terminal = await runtime.close();
  assert.deepEqual(closed, ['compiler', 'driver']);
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.restartRequired, true);
  assert.equal(terminal.compiler.error.code, 'COMPILER_CLOSE');
  assert.equal(terminal.driver.error.code, 'DRIVER_CLOSE');
});

test('public terminal retains an acknowledged material Driver disposal failure', async () => {
  const driver = {
    health: 'healthy',
    async describe() { return driverDescription(); },
    async close() {
      return {
        graceful: false,
        restartRequired: true,
        cleanupClaim: 'unproved-worker-loss',
        commandAcknowledged: true,
        failedOperation: 'memory.release',
        error: {
          code: 'RESOURCE_DISPOSE_FAILED',
          category: 'restart-required',
          operation: 'cuMemFree_v2',
          message: 'Resource disposer failed; cleanup is unproved.',
          details: { disposition: 'unproved', providerPath: 'C:\\private\\nvcuda.dll' },
          healthBefore: 'healthy',
          healthAfter: 'restart-required',
        },
        health: { current: 'restart-required' },
        inventory: { counts: { live: 0, closing: 0, closed: 0, orphaned: 1 } },
        workerExited: true,
        workerExitCode: 1,
      };
    },
  };
  const runtime = await openCudaRuntimeWithAdapters({}, { openDriver: async () => driver, openCompiler: async () => null }, () => ({ status: 'mock-only' }));
  const terminal = await runtime.close();
  assert.equal(terminal.driver.commandAcknowledged, true);
  assert.equal(terminal.driver.failedOperation, 'memory.release');
  assert.equal(terminal.driver.error.code, 'RESOURCE_DISPOSE_FAILED');
  assert.equal(terminal.driver.error.operation, 'cuMemFree_v2');
  assert.equal(terminal.driver.error.healthAfter, 'restart-required');
  assert.equal(Object.hasOwn(terminal.driver.error.details, 'providerPath'), false);
  assert.deepEqual(terminal.driver.resourceCounts, { live: 0, closing: 0, closed: 0, orphaned: 1 });
});

test('open failure reports restart-required when an acquired owner cannot close', async () => {
  const driver = { health: 'healthy', async describe() { return driverDescription(); }, async close() { return { graceful: false }; } };
  await assert.rejects(openCudaRuntimeWithAdapters({ compiler: true }, {
    openDriver: async () => driver,
    openCompiler: async () => { throw Object.assign(new Error('compiler open'), { code: 'COMPILER_OPEN', category: 'provider' }); },
  }, () => ({ status: 'mock-only' })), (error) => {
    assert.equal(error.code, 'CUDA_JS_OPEN_CLEANUP_UNPROVED');
    assert.equal(error.category, 'restart-required');
    assert.equal(error.healthAfter, 'restart-required');
    assert.equal(error.details.primaryFailure.code, 'COMPILER_OPEN');
    assert.equal(error.details.cleanupFailures.length, 1);
    assert.equal(error.details.cleanupFailures[0].code, 'CUDA_JS_OWNER_CLEANUP_UNPROVED');
    assert.equal(error.details.resultingHealth, 'restart-required');
    assert.deepEqual(error.details.terminalInventory[0], { owner: 'driver', graceful: false, cleanupClaim: null, resourceCounts: null });
    return true;
  });
});

test('open rollback retains an acquired owner material terminal failure', async () => {
  const driver = {
    health: 'healthy',
    async describe() { return driverDescription(); },
    async close() {
      return {
        graceful: false,
        cleanupClaim: 'unproved-worker-loss',
        error: {
          code: 'RESOURCE_DISPOSE_FAILED',
          category: 'restart-required',
          operation: 'cuCtxDestroy_v2',
          message: 'Context disposal failed.',
          details: { disposition: 'unproved', causeMessage: 'failed at C:\\private\\nvcuda.dll handle=0xdecafbad' },
          healthBefore: 'healthy',
          healthAfter: 'restart-required',
        },
      };
    },
  };
  await assert.rejects(openCudaRuntimeWithAdapters({ compiler: true }, {
    openDriver: async () => driver,
    openCompiler: async () => { throw Object.assign(new Error('compiler open'), { code: 'COMPILER_OPEN', category: 'provider' }); },
  }, () => ({ status: 'mock-only' })), (error) => {
    assert.equal(error.code, 'CUDA_JS_OPEN_CLEANUP_UNPROVED');
    assert.equal(error.details.cleanupFailures.length, 1);
    assert.equal(error.details.cleanupFailures[0].code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(error.details.cleanupFailures[0].operation, 'cuCtxDestroy_v2');
    assert.match(error.details.cleanupFailures[0].details.causeMessage, /\[redacted-path\]/);
    assert.match(error.details.cleanupFailures[0].details.causeMessage, /\[redacted-handle\]/);
    assert.doesNotMatch(JSON.stringify(error.details), /private|decafbad/);
    return true;
  });
});

test('failed disposal orphans the facade resource, preserves provenance, and never retries release', async () => {
  let releaseCalls = 0;
  const driver = {
    state: 'open',
    health: 'healthy',
    async describe() { return driverDescription(); },
    async allocateDevice() { return { memory: Object.freeze({ private: 'token' }), byteLength: 8 }; },
    async releaseMemory() {
      releaseCalls += 1;
      driver.health = 'poisoned';
      throw Object.assign(new Error('Resource disposer failed; cleanup is unproved.'), {
        code: 'RESOURCE_DISPOSE_FAILED',
        category: 'immediate-driver',
        operation: 'cuMemFree_v2',
        healthBefore: 'healthy',
        healthAfter: 'poisoned',
        details: {
          resourceKind: 'device-memory', resourceState: 'orphaned', disposition: 'orphaned',
          causeCode: 'CUDA_DRIVER_FAILURE', causeCategory: 'immediate-driver', causeOperation: 'cuMemFree_v2',
          nativeStatus: 999, nativeName: 'CUDA_ERROR_UNKNOWN', nativeDescription: 'x'.repeat(2_000), disposalCallCount: 1,
          causeMessage: 'failed at C:\\private\\nvcuda.dll host=secret-machine handle=0xdecafbad',
          providerPath: 'C:\\private\\nvcuda.dll', nativePointer: '0x1234', stack: 'secret stack',
        },
      });
    },
    async close() { return { graceful: false, cleanupClaim: 'unproved', health: { current: 'poisoned' }, teardown: { inventory: { counts: { live: 0, closing: 0, closed: 0, orphaned: 1 } }, errors: [] }, workerExited: true, workerExitCode: 0 }; },
  };
  const runtime = await openCudaRuntimeWithAdapters({}, { openDriver: async () => driver, openCompiler: async () => null }, () => ({ status: 'mock-only' }));
  const memory = await runtime.allocateDevice({ byteLength: 8 });
  let first;
  await assert.rejects(memory.close(), (error) => {
    first = error;
    assert.equal(error.code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(error.category, 'immediate-driver');
    assert.equal(error.operation, 'cuMemFree_v2');
    assert.equal(error.healthBefore, 'healthy');
    assert.equal(error.healthAfter, 'poisoned');
    assert.equal(error.details.nativeStatus, 999);
    assert.equal(error.details.nativeDescription.length, 1_024);
    assert.match(error.details.causeMessage, /\[redacted-path\]/);
    assert.match(error.details.causeMessage, /\[redacted-identity\]/);
    assert.match(error.details.causeMessage, /\[redacted-handle\]/);
    assert.equal(Object.hasOwn(error.details, 'providerPath'), false);
    assert.equal(Object.hasOwn(error.details, 'nativePointer'), false);
    assert.equal(Object.hasOwn(error.details, 'stack'), false);
    return true;
  });
  assert.equal(memory.state, 'orphaned');
  await assert.rejects(memory.close(), (error) => error === first);
  assert.equal(releaseCalls, 1);
  await assert.rejects(memory.read({ byteLength: 1 }), (error) => error.code === 'CUDA_JS_RESOURCE_CLOSED' && error.category === 'immediate-driver' && error.healthAfter === 'poisoned');
  await assert.rejects(runtime.allocateDevice({ byteLength: 1 }), (error) => error.code === 'DRIVER_RUNTIME_POISONED' && error.healthAfter === 'poisoned');
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, false);
  assert.deepEqual(terminal.driver.resourceCounts, { live: 0, closing: 0, closed: 0, orphaned: 1 });
});

test('pre-disposer close rejection remains retryable and does not orphan the facade resource', async () => {
  let calls = 0;
  const driver = {
    state: 'open', health: 'healthy',
    async describe() { return driverDescription(); },
    async allocateDevice() { return { memory: Object.freeze({ private: 'token' }), byteLength: 4 }; },
    async releaseMemory() {
      calls += 1;
      if (calls === 1) throw Object.assign(new Error('Resource has children.'), { code: 'RESOURCE_HAS_CHILDREN', category: 'stale-resource' });
      return { disposition: { freed: true } };
    },
    async close() { return { graceful: true, health: { current: 'closed' }, workerExited: true, workerExitCode: 0 }; },
  };
  const runtime = await openCudaRuntimeWithAdapters({}, { openDriver: async () => driver, openCompiler: async () => null }, () => ({ status: 'mock-only' }));
  const memory = await runtime.allocateDevice({ byteLength: 4 });
  await assert.rejects(memory.close(), (error) => error.code === 'RESOURCE_HAS_CHILDREN' && error.category === 'stale-resource');
  assert.equal(memory.state, 'open');
  assert.equal((await memory.close()).state, 'closed');
  assert.equal(calls, 2);
  assert.equal((await runtime.close()).graceful, true);
});

test('unconfirmed profiles operate while known-incompatible profiles close and reject', async () => {
  const closed = [];
  const adapter = { health: 'healthy', async describe() { return driverDescription('candidate'); }, async close() { closed.push('driver'); return { graceful: true, workerExited: true, workerExitCode: 0 }; } };
  const candidate = await openCudaRuntimeWithAdapters({}, { openDriver: async () => adapter, openCompiler: async () => null }, () => ({ status: 'testing-unconfirmed', reason: 'PROFILE_EVIDENCE_UNCONFIRMED' }));
  assert.equal((await candidate.describe()).support.status, 'testing-unconfirmed');
  assert.equal((await candidate.close()).graceful, true);
  await assert.rejects(openCudaRuntimeWithAdapters({}, { openDriver: async () => adapter, openCompiler: async () => null }, () => ({ status: 'incompatible', reason: 'KNOWN_INCOMPATIBLE_FIXTURE' })), expectCode('CUDA_JS_PROFILE_INCOMPATIBLE'));
  assert.deepEqual(closed, ['driver', 'driver']);
});
