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
  assert.equal(CUDA_JS_COMPATIBILITY.package.version, '0.1.0-alpha.19');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceSelection, 'finite-sanitized-snapshot-opaque-process-local-selector-one-device-per-runtime-selected-targets');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceMemoryAllocationMinimumAlignmentBytes, 256);
  assert.equal(CUDA_JS_COMPATIBILITY.node.version, 'v26.7.0');
  assert.equal(CUDA_JS_COMPATIBILITY.node.minimumVersion, 'v26.1.0');
  assert.equal(CUDA_JS_COMPATIBILITY.node.operationPolicy, 'testing-unconfirmed-at-or-above-minimum');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16', 'publication-mailbox-host-to-device-u32', 'publication-mailbox-device-to-host-u32']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.typedDeviceViews, 'allocation-owned-contiguous-1d-opaque-capability-explicit-launch-access');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.boundedMultiOperationScheduling, 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.asyncTransfers, 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.publicationMailboxes, 'private-mapped-named-u32-one-operation-lease-system-acquire-release');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDags, 'bounded-kernel-cublaslt-f32-dag-immutable-bindings-derived-library-access-single-stream-semantic-replay');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.cublasLtF32Matmul, 'optional-row-major-contiguous-typed-views-explicit-bounded-workspace');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsFrontend, 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1+spec-0022-device-publication-v1+spec-0014-publication-mailbox-v1');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsInspection, 'pure-cuda-free-public-program-semantic-inspection-shared-with-compile');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsDenseNumeric, 'f64-f16-bf16-exact-casts-special-values-manifest-verified-headers');
  assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLibraries, 'typed-leaf-libraries-explicit-aliased-imports-selected-runtime-target-rdc-or-lto-final-cubin');
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
  const trappedError = new CudaJsError('CUDA_JS_TEST', 'internal', 'test', trapped);
  assert.deepEqual(trappedError.details, {});

  const secret = new CudaJsError('CUDA_JS_TEST', 'internal', 'test', {
    source: 'secret source',
    path: '/private/provider',
    generatedSource: '__global__ void leaked() {}',
    capability: { kind: 'device-memory', byteLength: 64 },
    allowed: 'visible',
  });
  assert.equal(secret.details.allowed, 'visible');
  assert.equal(Object.hasOwn(secret.details, 'source'), false);
  assert.equal(Object.hasOwn(secret.details, 'path'), false);
  assert.equal(Object.hasOwn(secret.details, 'generatedSource'), false);
  assert.equal(Object.hasOwn(secret.details, 'capability'), false);
});

test('native entry fails before provider work when its launch profile is absent', async () => {
  let calls = 0;
  await assert.rejects(openCudaRuntimeWithAdapters({
    compiler: false,
    __testOnly: {
      host: { platform: 'freebsd', arch: 'x64', nodeVersion: 'v26.7.0' },
      driver: {
        async open() { calls += 1; throw new Error('must not run'); },
      },
    },
  }), expectCode('CUDA_JS_PROFILE_UNSUPPORTED'));
  assert.equal(calls, 0);
});

test('opaque selection binds DriverActor bootstrap and selected-device compiler defaults without public native identity', { timeout: 10_000 }, async () => {
  const snapshot = await discoverCudaDevicesForTesting([
    { nativeDevice: 3, computeCapabilityMajor: 7, computeCapabilityMinor: 5 },
    { nativeDevice: 9, computeCapabilityMajor: 8, computeCapabilityMinor: 9 },
  ]);
  assert.equal(snapshot.deviceCount, 2);
  assert.equal(Object.hasOwn(snapshot.devices[0], 'nativeDevice'), false);
  const selected = await openCudaRuntimeForTesting({ device: snapshot.devices[1].selector, compiler: true });
  try {
    const description = await selected.describe();
    assert.equal(description.driver.device.architecture.class, 'sm_89');
    assert.equal(Object.hasOwn(description.driver.device, 'ordinal'), false);
    const compiler = await selected.compile({ source: SOURCE });
    assert.equal(compiler.artifact.architecture, 'compute_89');
  } finally {
    assert.equal((await selected.close()).graceful, true);
  }
});

test('facade owns copied memory and hides private actor capabilities', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: false });
  try {
    const memory = await runtime.allocateDevice({ byteLength: 8 });
    const input = Uint8Array.from([1, 2, 3, 4]);
    await memory.write(input);
    input.fill(9);
    const read = await memory.read({ byteLength: 4 });
    assert.deepEqual([...read.bytes], [1, 2, 3, 4]);
    assert.equal(Object.hasOwn(memory, 'token'), false);
    assert.equal(Object.hasOwn(memory, 'address'), false);
    await memory.close();
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('public typed views preserve bounded ranges, access roles, operation leases and opaque ownership', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: false });
  try {
    const memory = await runtime.allocateDevice({ byteLength: 64 });
    const view = await memory.view({ dtype: 'u32', elementCount: 4, byteOffset: 16, access: 'read-write' });
    assert.equal(view.kind, 'device-view');
    assert.equal(view.dtype, 'u32');
    assert.equal(view.byteOffset, 16);
    assert.equal(view.elementCount, 4);
    assert.equal(view.byteLength, 16);
    assert.equal(view.access, 'read-write');
    assert.equal(Object.hasOwn(view, 'token'), false);
    assert.equal(Object.hasOwn(view, 'address'), false);
    await view.close();
    await memory.close();
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('module and function capabilities translate declared public launch arguments', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: false });
  try {
    const module = await runtime.loadModule({ format: 'ptx', bytes: MOCK_PTX });
    const memory = await runtime.allocateDevice({ byteLength: 16 });
    const fn = await module.getFunction({ name: 'unrelated_kernel', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
    const result = await fn.launch({
      grid: { x: 1, y: 1, z: 1 },
      block: { x: 1, y: 1, z: 1 },
      arguments: [memory, 7],
    });
    assert.equal(result.status, 'completed');
    await fn.close();
    await memory.close();
    await module.close();
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('optional compiler is explicit and returns copied PTX and cubin artifacts', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    const compiled = await runtime.compile({ source: SOURCE });
    assert.equal(compiled.operation, 'compile');
    assert.equal(compiled.artifact.format, 'ptx');
    const linked = await runtime.link({ inputs: [compiled.artifact] });
    assert.equal(linked.operation, 'link');
    assert.equal(linked.artifact.format, 'cubin');
    const original = linked.artifact.bytes[0];
    linked.artifact.bytes[0] ^= 0xff;
    const linkedAgain = await runtime.link({ inputs: [compiled.artifact] });
    assert.equal(linkedAgain.artifact.bytes[0], original);
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('CompilerActor cleanup degradation blocks cross-owner facade admission', { timeout: 10_000 }, async () => {
  const compiler = await openCompilerRuntimeForTesting();
  await compiler.compile({ source: SOURCE });
  COMPILER_RUNTIME_TEST.failNextClose(compiler, { phase: 'destroy-program', healthAfter: 'restart-required' });
  const terminal = await compiler.close();
  assert.equal(terminal.restartRequired, true);
  await assert.rejects(openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: { describe: async () => driverDescription(), close: async () => ({ graceful: true }) },
      compiler,
    },
  }), expectCode('CUDA_JS_OWNER_UNHEALTHY'));
});

test('two runtimes isolate resources and first close leaves the second usable', { timeout: 10_000 }, async () => {
  const first = await openCudaRuntimeForTesting({ compiler: false });
  const second = await openCudaRuntimeForTesting({ compiler: false });
  const memory = await second.allocateDevice({ byteLength: 4 });
  assert.equal((await first.close()).graceful, true);
  await memory.write(Uint8Array.from([8, 7, 6, 5]));
  assert.deepEqual([...(await memory.read({ byteLength: 4 })).bytes], [8, 7, 6, 5]);
  await memory.close();
  assert.equal((await second.close()).graceful, true);
});

test('public compiler cache never defaults to package-owned writable storage', async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    const description = await runtime.describe();
    assert.notEqual(description.compiler.cacheDirectory, process.cwd());
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});

test('aggregate close attempts both owners and reports unproved cleanup without throwing', async () => {
  const runtime = await openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: { describe: async () => driverDescription(), close: async () => ({ graceful: false, restartRequired: true }) },
      compiler: { describe: async () => ({ health: 'healthy' }), close: async () => ({ graceful: true }) },
    },
  });
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.restartRequired, true);
});

test('public terminal retains an acknowledged material Driver disposal failure', async () => {
  const runtime = await openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: {
        describe: async () => driverDescription(),
        close: async () => ({
          graceful: false,
          restartRequired: true,
          failures: [{ kind: 'context', disposition: 'orphaned', failure: { code: 'CUDA_ERROR_CONTEXT_IS_DESTROYED' } }],
        }),
      },
    },
  });
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, false);
  assert.equal(terminal.restartRequired, true);
  assert.equal(terminal.driver.failures[0].failure.code, 'CUDA_ERROR_CONTEXT_IS_DESTROYED');
});

test('open failure reports restart-required when an acquired owner cannot close', async () => {
  await assert.rejects(openCudaRuntimeWithAdapters({
    compiler: true,
    __testOnly: {
      driver: {
        describe: async () => driverDescription(),
        close: async () => ({ graceful: false, restartRequired: true }),
      },
      compiler: {
        describe: async () => { throw new Error('compiler describe failed'); },
        close: async () => ({ graceful: true }),
      },
    },
  }), (error) => error instanceof CudaJsError && error.code === 'CUDA_JS_OPEN_FAILED' && error.details.restartRequired === true);
});

test('open rollback retains an acquired owner material terminal failure', async () => {
  await assert.rejects(openCudaRuntimeWithAdapters({
    compiler: true,
    __testOnly: {
      driver: {
        describe: async () => driverDescription(),
        close: async () => ({
          graceful: false,
          restartRequired: true,
          failures: [{ kind: 'context', disposition: 'orphaned', failure: { code: 'CUDA_ERROR_CONTEXT_IS_DESTROYED' } }],
        }),
      },
      compiler: {
        describe: async () => { throw new Error('compiler describe failed'); },
        close: async () => ({ graceful: true }),
      },
    },
  }), (error) => error instanceof CudaJsError
    && error.code === 'CUDA_JS_OPEN_FAILED'
    && error.details.driver?.failures?.[0]?.failure?.code === 'CUDA_ERROR_CONTEXT_IS_DESTROYED');
});

test('failed disposal orphans the facade resource, preserves provenance, and never retries release', async () => {
  let closeCalls = 0;
  const runtime = await openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: {
        describe: async () => driverDescription(),
        allocateDevice: async () => ({ kind: 'device-memory', token: { kind: 'memory', slot: 1, generation: 1 }, byteLength: 4 }),
        releaseDevice: async () => { closeCalls += 1; throw Object.assign(new Error('free failed'), { code: 'CUDA_ERROR_INVALID_CONTEXT', category: 'immediate-driver' }); },
        close: async () => ({ graceful: false, restartRequired: true }),
      },
    },
  });
  const memory = await runtime.allocateDevice({ byteLength: 4 });
  await assert.rejects(memory.close(), expectCode('CUDA_ERROR_INVALID_CONTEXT'));
  assert.equal(memory.state, 'orphaned');
  await assert.rejects(memory.close(), expectCode('CUDA_ERROR_INVALID_CONTEXT'));
  assert.equal(closeCalls, 1);
  await runtime.close();
});

test('pre-disposer close rejection remains retryable and does not orphan the facade resource', async () => {
  let closeCalls = 0;
  let reject = true;
  const runtime = await openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: {
        describe: async () => driverDescription(),
        allocateDevice: async () => ({ kind: 'device-memory', token: { kind: 'memory', slot: 1, generation: 1 }, byteLength: 4 }),
        releaseDevice: async () => {
          closeCalls += 1;
          if (reject) throw Object.assign(new Error('busy'), { code: 'CUDA_JS_RESOURCE_BACKPRESSURE', category: 'backpressure' });
          return { disposition: 'closed' };
        },
        close: async () => ({ graceful: true }),
      },
    },
  });
  const memory = await runtime.allocateDevice({ byteLength: 4 });
  await assert.rejects(memory.close(), expectCode('CUDA_JS_RESOURCE_BACKPRESSURE'));
  assert.equal(memory.state, 'open');
  reject = false;
  await memory.close();
  assert.equal(memory.state, 'closed');
  assert.equal(closeCalls, 2);
  assert.equal((await runtime.close()).graceful, true);
});

test('unconfirmed profiles operate while known-incompatible profiles close and reject', async () => {
  const runtime = await openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: { describe: async () => driverDescription('testing-unconfirmed'), close: async () => ({ graceful: true }) },
    },
  });
  assert.equal((await runtime.close()).graceful, true);
  await assert.rejects(openCudaRuntimeWithAdapters({
    __testOnly: {
      driver: { describe: async () => driverDescription('known-incompatible'), close: async () => ({ graceful: true }) },
    },
  }), expectCode('CUDA_JS_PROFILE_UNSUPPORTED'));
});
