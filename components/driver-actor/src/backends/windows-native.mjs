import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';

import ffi from 'node:ffi';

import { ExecutionManager } from '../../../execution/index.mjs';
import { MemoryManager } from '../../../memory/index.mjs';
import { ResourceRegistry } from '../../../resource-registry/index.mjs';
import { cudaTier0FfiDefinitions } from '../../../../schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs';
import { createDefaultCuCtxCreateParams, cudaTier0Layouts } from '../../../../schemas/cuda-13.3/linux-x64/generated/packers.mjs';
import { DriverRuntimeError } from '../errors.mjs';
import { HealthState, observeErrorHealth } from '../health.mjs';
import { startupRollbackFailure } from '../startup-rollback.mjs';

const CUDA_API_VERSION = 13030;
const DRIVER_ACTOR_SYMBOLS = Object.freeze([
  'cuInit', 'cuDriverGetVersion', 'cuDeviceGetCount', 'cuDeviceGet', 'cuDeviceGetAttribute',
  'cuGetErrorName', 'cuGetErrorString', 'cuCtxCreate_v4', 'cuCtxDestroy_v2',
  'cuCtxSetCurrent', 'cuCtxGetCurrent',
  'cuMemGetInfo_v2', 'cuMemAlloc_v2', 'cuMemFree_v2', 'cuMemcpyHtoD_v2', 'cuMemcpyDtoH_v2',
  'cuModuleLoadData', 'cuModuleGetFunction', 'cuModuleUnload',
  'cuStreamCreate', 'cuStreamDestroy_v2',
  'cuEventCreate', 'cuEventRecord', 'cuEventQuery', 'cuEventDestroy_v2',
  'cuLaunchKernelEx',
]);
const DRIVER_ACTOR_FFI_DEFINITIONS = Object.freeze(Object.fromEntries(
  DRIVER_ACTOR_SYMBOLS.map((symbol) => [symbol, cudaTier0FfiDefinitions[symbol]]),
));
const ATTRIBUTES = Object.freeze({
  maxThreadsPerBlock: 1,
  maxBlockDimX: 2,
  maxBlockDimY: 3,
  maxBlockDimZ: 4,
  maxGridDimX: 5,
  maxGridDimY: 6,
  maxGridDimZ: 7,
  maxSharedMemoryPerBlock: 8,
  multiprocessorCount: 16,
  kernelExecTimeout: 17,
  integrated: 18,
  computeMode: 20,
  tccDriver: 35,
  computeCapabilityMajor: 75,
  computeCapabilityMinor: 76,
});

function readPointer(storage) { return storage.readBigUInt64LE(0); }
function readI32(storage) { return storage.readInt32LE(0); }
function pointerOut() { return Buffer.alloc(8); }

function canonicalDriverPath() {
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new DriverRuntimeError('DRIVER_PROFILE_UNSUPPORTED', 'unsupported', 'The native F3 profile requires Windows x64.', { platform: process.platform, architecture: process.arch });
  }
  const systemRoot = process.env.SystemRoot;
  if (!systemRoot) throw new DriverRuntimeError('DRIVER_SYSTEM_ROOT_MISSING', 'unsupported', 'SystemRoot is unavailable.');
  const expected = path.resolve(systemRoot, 'System32', 'nvcuda.dll');
  if (!existsSync(expected)) throw new DriverRuntimeError('DRIVER_LIBRARY_MISSING', 'unsupported', 'The canonical Windows CUDA Driver is unavailable.');
  const resolved = realpathSync.native(expected);
  if (resolved.toLowerCase() !== expected.toLowerCase()) {
    throw new DriverRuntimeError('DRIVER_LIBRARY_NONCANONICAL', 'unsupported', 'The Windows CUDA Driver did not resolve to the canonical system path.');
  }
  return resolved;
}

export async function createBackend({ runtimeId, epoch, memoryPolicy, executionPolicy }) {
  const health = new HealthState();
  const registry = new ResourceRegistry({ runtimeId, epoch });
  const driverPath = canonicalDriverPath();
  let library;
  let functions;
  let staleWrapper;
  let libraryToken;
  let rawContext = null;
  let contextToken;
  let memory;
  let execution;

  function errorText(functionName, status) {
    try {
      const output = pointerOut();
      const callStatus = functions[functionName](status, output);
      const pointer = readPointer(output);
      return callStatus === 0 && pointer !== 0n ? ffi.toString(pointer) : null;
    } catch {
      return null;
    }
  }

  function driverFailure(operation, status, operationId, requestedHealth = 'suspect') {
    const before = health.current;
    observeErrorHealth(health, {
      code: 'CUDA_DRIVER_FAILURE', category: 'immediate-driver', operation, operationId, healthAfter: requestedHealth,
    }, { operationId, reason: operation });
    return new DriverRuntimeError(
      'CUDA_DRIVER_FAILURE',
      'immediate-driver',
      `${operation} failed with CUDA status ${status}.`,
      {
        nativeStatus: status,
        nativeName: errorText('cuGetErrorName', status),
        nativeDescription: errorText('cuGetErrorString', status),
      },
      { operation, operationId, healthBefore: before, healthAfter: health.current },
    );
  }

  function requireSuccess(operation, status, operationId, requestedHealth) {
    if (status !== 0) throw driverFailure(operation, status, operationId, requestedHealth);
  }

  function queryI32(functionName, operationId, ...args) {
    const output = Buffer.alloc(4);
    requireSuccess(functionName, functions[functionName](output, ...args), operationId);
    return readI32(output);
  }

  function classifiedFailure(operation, status, operationId, category, requestedHealth = null) {
    const before = health.current;
    observeErrorHealth(health, {
      code: 'CUDA_DRIVER_FAILURE', category, operation, operationId, healthAfter: requestedHealth,
    }, { operationId, reason: operation });
    return new DriverRuntimeError(
      'CUDA_DRIVER_FAILURE',
      category,
      `${operation} failed with CUDA status ${status}.`,
      { nativeStatus: status, nativeName: errorText('cuGetErrorName', status), nativeDescription: errorText('cuGetErrorString', status) },
      { operation, operationId, healthBefore: before, healthAfter: health.current },
    );
  }

  function observeError(error, { operationId = null, operation = null } = {}) {
    observeErrorHealth(health, error, { operationId, reason: error?.operation ?? operation });
    return error;
  }

  function observeTeardown(teardown, operationId) {
    for (const error of teardown?.errors ?? []) observeError(error, { operationId, operation: 'runtime.close' });
  }

  function closeDriverLibrary(value) {
    value.close();
    if (typeof staleWrapper !== 'function') {
      return { libraryClosed: true, staleWrapperRejected: null, staleWrapperCode: null };
    }
    let staleWrapperRejected = false;
    let staleWrapperCode = null;
    try { staleWrapper(0); } catch (error) {
      staleWrapperRejected = true;
      staleWrapperCode = error.code ?? null;
    }
    if (!staleWrapperRejected) {
      const before = health.current;
      health.transition('restart-required', { reason: 'driver-library-wrapper-still-callable', operationId: null });
      throw new DriverRuntimeError(
        'DRIVER_LIBRARY_STALE_WRAPPER',
        'restart-required',
        'Closed Driver library left a callable wrapper.',
        {},
        { operation: 'driver.library.close', healthBefore: before, healthAfter: health.current },
      );
    }
    return { libraryClosed: true, staleWrapperRejected, staleWrapperCode };
  }

  function contextStillCurrent(operationId) {
    const before = health.current;
    health.transition('restart-required', { reason: 'context-still-current-after-destroy', operationId });
    return new DriverRuntimeError(
      'DRIVER_CONTEXT_STILL_CURRENT',
      'restart-required',
      'Destroyed context remained current during teardown.',
      {},
      { operation: 'cuCtxGetCurrent', operationId, healthBefore: before, healthAfter: health.current },
    );
  }

  function destroyContextForRollback(value) {
    requireSuccess('cuCtxSetCurrent', functions.cuCtxSetCurrent(value), 0, 'poisoned');
    requireSuccess('cuCtxDestroy_v2', functions.cuCtxDestroy_v2(value), 0, 'poisoned');
    const currentStorage = pointerOut();
    requireSuccess('cuCtxGetCurrent', functions.cuCtxGetCurrent(currentStorage), 0, 'poisoned');
    if (readPointer(currentStorage) !== 0n) throw contextStillCurrent(0);
  }

  function readSafeU64(storage, field) {
    const value = storage.readBigUInt64LE(0);
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new DriverRuntimeError('DRIVER_MEMORY_CAPACITY_UNSAFE', 'unsupported', `${field} exceeds the safe public byte-count range.`, { field });
    }
    return Number(value);
  }

  try {
    library = new ffi.DynamicLibrary(driverPath);
    functions = library.getFunctions(DRIVER_ACTOR_FFI_DEFINITIONS);
    staleWrapper = functions.cuInit;
    libraryToken = registry.allocate({
      kind: 'library',
      value: library,
      dispose: closeDriverLibrary,
    });

    requireSuccess('cuInit', functions.cuInit(0), 0);
    const driverVersion = queryI32('cuDriverGetVersion', 0);
    const deviceCount = queryI32('cuDeviceGetCount', 0);
    if (deviceCount < 1) throw new DriverRuntimeError('DRIVER_DEVICE_MISSING', 'unsupported', 'The F3 profile requires at least one CUDA device.', { deviceCount });
    const device = queryI32('cuDeviceGet', 0, 0);
    const attributes = {};
    for (const [name, attribute] of Object.entries(ATTRIBUTES)) attributes[name] = queryI32('cuDeviceGetAttribute', 0, attribute, device);

    const contextStorage = pointerOut();
    const parameters = createDefaultCuCtxCreateParams();
    requireSuccess('cuCtxCreate_v4', functions.cuCtxCreate_v4(contextStorage, parameters, 0, device), 0, 'poisoned');
    const context = readPointer(contextStorage);
    if (context === 0n) {
      const before = health.current;
      health.transition('poisoned', { reason: 'context-create-null', operationId: 0 });
      throw new DriverRuntimeError('DRIVER_CONTEXT_NULL', 'immediate-driver', 'Context creation succeeded but returned null.', {}, { operationId: 0, healthBefore: before, healthAfter: health.current });
    }
    rawContext = context;
    contextToken = registry.allocate({
      kind: 'context',
      value: context,
      parent: libraryToken,
      dispose(value) {
        requireSuccess('cuCtxSetCurrent', functions.cuCtxSetCurrent(value), null, 'poisoned');
        requireSuccess('cuCtxDestroy_v2', functions.cuCtxDestroy_v2(value), null, 'poisoned');
        const currentStorage = pointerOut();
        requireSuccess('cuCtxGetCurrent', functions.cuCtxGetCurrent(currentStorage), null, 'poisoned');
        const currentNull = readPointer(currentStorage) === 0n;
        if (!currentNull) throw contextStillCurrent(null);
        return { contextDestroyed: true, currentNull };
      },
    });
    rawContext = null;

    const currentStorage = pointerOut();
    requireSuccess('cuCtxGetCurrent', functions.cuCtxGetCurrent(currentStorage), 0, 'poisoned');
    if (readPointer(currentStorage) !== context) {
      health.transition('poisoned', { reason: 'startup-context-mismatch', operationId: 0 });
      throw new DriverRuntimeError('DRIVER_CONTEXT_MISMATCH', 'immediate-driver', 'Created context is not current on the owning Worker.', {}, { operationId: 0, healthBefore: 'healthy', healthAfter: health.current });
    }

    function requireCurrent(operationId) {
      const output = pointerOut();
      requireSuccess('cuCtxGetCurrent', functions.cuCtxGetCurrent(output), operationId, 'poisoned');
      if (readPointer(output) !== context) {
        const before = health.current;
        health.transition('poisoned', { reason: 'memory-context-mismatch', operationId });
        throw new DriverRuntimeError('DRIVER_CONTEXT_MISMATCH', 'immediate-driver', 'Private context is not current for a memory operation.', {}, { operationId, healthBefore: before, healthAfter: health.current });
      }
    }

    memory = new MemoryManager({
      registry,
      contextToken,
      policy: memoryPolicy,
      operations: {
        async query({ operationId }) {
          requireCurrent(operationId);
          const freeStorage = Buffer.alloc(8);
          const totalStorage = Buffer.alloc(8);
          requireSuccess('cuMemGetInfo_v2', functions.cuMemGetInfo_v2(freeStorage, totalStorage), operationId);
          return { freeBytes: readSafeU64(freeStorage, 'freeBytes'), totalBytes: readSafeU64(totalStorage, 'totalBytes') };
        },
        async allocate({ byteLength, operationId }) {
          requireCurrent(operationId);
          const output = pointerOut();
          const status = functions.cuMemAlloc_v2(output, BigInt(byteLength));
          if (status === 2) {
            throw new DriverRuntimeError('CUDA_OUT_OF_MEMORY', 'pressure', 'CUDA device allocation reported out of memory.', { nativeStatus: status, byteLength }, { operationId, healthBefore: health.current, healthAfter: health.current });
          }
          requireSuccess('cuMemAlloc_v2', status, operationId);
          const address = readPointer(output);
          if (address === 0n) throw new DriverRuntimeError('DRIVER_MEMORY_NULL', 'immediate-driver', 'CUDA allocation succeeded but returned a null address.', { byteLength }, { operationId, healthBefore: health.current, healthAfter: health.current });
          return address;
        },
        async free({ native, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuMemFree_v2', functions.cuMemFree_v2(native), operationId);
          return { nativeFreed: true };
        },
        async write({ native, deviceOffset, bytes, operationId }) {
          requireCurrent(operationId);
          const staging = Buffer.from(bytes);
          requireSuccess('cuMemcpyHtoD_v2', functions.cuMemcpyHtoD_v2(native + BigInt(deviceOffset), staging, BigInt(staging.byteLength)), operationId);
        },
        async read({ native, deviceOffset, byteLength, operationId }) {
          requireCurrent(operationId);
          const staging = Buffer.alloc(byteLength);
          requireSuccess('cuMemcpyDtoH_v2', functions.cuMemcpyDtoH_v2(staging, native + BigInt(deviceOffset), BigInt(byteLength)), operationId);
          return Uint8Array.from(staging);
        },
      },
    });

    const launchLayout = cudaTier0Layouts.CUlaunchConfig;
    if (!launchLayout || launchLayout.size !== 56) throw new DriverRuntimeError('DRIVER_LAUNCH_LAYOUT_UNSUPPORTED', 'unsupported', 'Generated CUlaunchConfig layout is unavailable for the Windows F5 profile.');
    const launchOffsets = Object.freeze(Object.fromEntries(launchLayout.fields.map((field) => [field.name, field.offset])));
    for (const field of ['gridDimX', 'gridDimY', 'gridDimZ', 'blockDimX', 'blockDimY', 'blockDimZ', 'sharedMemBytes', 'hStream', 'attrs', 'numAttrs']) {
      if (!Number.isSafeInteger(launchOffsets[field])) throw new DriverRuntimeError('DRIVER_LAUNCH_LAYOUT_UNSUPPORTED', 'unsupported', 'Generated CUlaunchConfig field is missing.', { field });
    }

    execution = new ExecutionManager({
      registry,
      contextToken,
      memory,
      policy: executionPolicy,
      deviceLimits: attributes,
      operations: {
        async createStream({ operationId }) {
          requireCurrent(operationId);
          const output = pointerOut();
          requireSuccess('cuStreamCreate', functions.cuStreamCreate(output, 1), operationId);
          const native = readPointer(output);
          if (native === 0n) throw new DriverRuntimeError('DRIVER_STREAM_NULL', 'immediate-driver', 'CUDA stream creation succeeded but returned null.', {}, { operationId, healthBefore: health.current, healthAfter: health.current });
          return native;
        },
        async destroyStream({ native, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuStreamDestroy_v2', functions.cuStreamDestroy_v2(native), operationId, 'poisoned');
          return { nativeDestroyed: true };
        },
        async loadModule({ format, bytes, operationId }) {
          requireCurrent(operationId);
          const source = Buffer.alloc(bytes.byteLength + (format === 'ptx' ? 1 : 0));
          Buffer.from(bytes).copy(source);
          const output = pointerOut();
          const status = functions.cuModuleLoadData(output, source);
          if (status !== 0) throw classifiedFailure('cuModuleLoadData', status, operationId, [200, 209, 218, 222].includes(status) ? 'validation' : 'immediate-driver', [200, 209, 218, 222].includes(status) ? null : 'suspect');
          const native = readPointer(output);
          if (native === 0n) throw new DriverRuntimeError('DRIVER_MODULE_NULL', 'immediate-driver', 'CUDA module load succeeded but returned null.', {}, { operationId, healthBefore: health.current, healthAfter: health.current });
          return native;
        },
        async unloadModule({ native, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuModuleUnload', functions.cuModuleUnload(native), operationId, 'poisoned');
          return { nativeUnloaded: true };
        },
        async getFunction({ moduleNative, name, operationId }) {
          requireCurrent(operationId);
          const output = pointerOut();
          const encodedName = Buffer.from(`${name}\0`, 'ascii');
          const status = functions.cuModuleGetFunction(output, moduleNative, encodedName);
          if (status !== 0) throw classifiedFailure('cuModuleGetFunction', status, operationId, status === 500 ? 'validation' : 'immediate-driver', status === 500 ? null : 'suspect');
          const native = readPointer(output);
          if (native === 0n) throw new DriverRuntimeError('DRIVER_FUNCTION_NULL', 'immediate-driver', 'CUDA function lookup succeeded but returned null.', {}, { operationId, healthBefore: health.current, healthAfter: health.current });
          return native;
        },
        async createEvent({ operationId }) {
          requireCurrent(operationId);
          const output = pointerOut();
          requireSuccess('cuEventCreate', functions.cuEventCreate(output, 2), operationId);
          const native = readPointer(output);
          if (native === 0n) throw new DriverRuntimeError('DRIVER_EVENT_NULL', 'immediate-driver', 'CUDA event creation succeeded but returned null.', {}, { operationId, healthBefore: health.current, healthAfter: health.current });
          return native;
        },
        async destroyEvent({ native, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuEventDestroy_v2', functions.cuEventDestroy_v2(native), operationId, 'poisoned');
          return { nativeDestroyed: true };
        },
        async devicePointer({ native, byteOffset }) {
          return native + BigInt(byteOffset);
        },
        async submitLaunch({ functionNative, streamNative, config, parameterBuffer, operationId }) {
          requireCurrent(operationId);
          const storage = Buffer.alloc(launchLayout.size);
          storage.writeUInt32LE(config.grid.x, launchOffsets.gridDimX);
          storage.writeUInt32LE(config.grid.y, launchOffsets.gridDimY);
          storage.writeUInt32LE(config.grid.z, launchOffsets.gridDimZ);
          storage.writeUInt32LE(config.block.x, launchOffsets.blockDimX);
          storage.writeUInt32LE(config.block.y, launchOffsets.blockDimY);
          storage.writeUInt32LE(config.block.z, launchOffsets.blockDimZ);
          storage.writeUInt32LE(config.sharedMemoryBytes, launchOffsets.sharedMemBytes);
          storage.writeBigUInt64LE(streamNative, launchOffsets.hStream);
          storage.writeBigUInt64LE(0n, launchOffsets.attrs);
          storage.writeUInt32LE(0, launchOffsets.numAttrs);

          const sizeStorage = Buffer.alloc(8);
          sizeStorage.writeBigUInt64LE(BigInt(parameterBuffer.byteLength));
          const extra = Buffer.alloc(40);
          extra.writeBigUInt64LE(1n, 0);
          extra.writeBigUInt64LE(ffi.getRawPointer(parameterBuffer), 8);
          extra.writeBigUInt64LE(2n, 16);
          extra.writeBigUInt64LE(ffi.getRawPointer(sizeStorage), 24);
          extra.writeBigUInt64LE(0n, 32);
          const status = functions.cuLaunchKernelEx(storage, functionNative, 0n, extra);
          if (status !== 0) throw classifiedFailure('cuLaunchKernelEx', status, operationId, 'immediate-driver', 'suspect');
        },
        async recordEvent({ eventNative, streamNative, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuEventRecord', functions.cuEventRecord(eventNative, streamNative), operationId);
        },
        async queryEvent({ eventNative, operationId }) {
          requireCurrent(operationId);
          const status = functions.cuEventQuery(eventNative);
          if (status === 0) return 'complete';
          if (status === 600) return 'pending';
          throw classifiedFailure('cuEventQuery', status, operationId, 'deferred-driver', 'poisoned');
        },
        health() { return health.snapshot(); },
        restartRequired({ code, message, details, operationId }) {
          const before = health.current;
          health.transition('restart-required', { reason: code, operationId });
          return new DriverRuntimeError(code, 'restart-required', message, details, { operationId, healthBefore: before, healthAfter: health.current });
        },
      },
    });

    async function description(operationSequence = 0) {
      const executionSummary = execution.summary();
      return {
        schemaVersion: 1,
        runtime: { id: runtimeId, epoch, state: 'open', backend: 'windows-native' },
        profile: { node: process.version, platform: process.platform, architecture: process.arch, cudaApiVersion: CUDA_API_VERSION, nativeOperational: true, nativeQualified: false },
        driver: { apiVersion: driverVersion, deviceCount },
        device: { ordinal: 0, attributes },
        context: contextToken,
        memory: await memory.usage(operationSequence),
        execution: executionSummary,
        health: health.snapshot(),
        inventory: registry.inventory(),
        operationSequence,
        claim: executionSummary.completionCount > 0 ? 'exact-windows-f5w-profile' : 'exact-windows-f4w-profile',
      };
    }

    return {
      inventory() { return registry.inventory(); },
      health() { return health.snapshot(); },
      observeError,
      assertAccepting(operation, operationId) {
        const cleanupOrRead = new Set([
          'runtime.describe', 'runtime.close', 'context.status', 'memory.status', 'memory.release',
          'execution.module.status', 'execution.module.release', 'execution.function.status', 'execution.function.release',
          'execution.operation.status', 'execution.operation.release',
        ]);
        if (health.current === 'restart-required') {
          throw new DriverRuntimeError('DRIVER_RESTART_REQUIRED', 'restart-required', 'Runtime health requires process restart.', { operation }, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
        }
        if (health.current === 'poisoned' && !cleanupOrRead.has(operation)) {
          throw new DriverRuntimeError('DRIVER_RUNTIME_POISONED', 'deferred-driver', 'Runtime health is poisoned; only inspection and cleanup operations remain available.', { operation }, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
        }
      },
      async describe({ operationId }) {
        return description(operationId);
      },
      async contextStatus({ token, operationId }) {
        const expected = registry.get(token, { kind: 'context' });
        const currentStorage = pointerOut();
        requireSuccess('cuCtxGetCurrent', functions.cuCtxGetCurrent(currentStorage), operationId, 'poisoned');
        const currentOnOwner = readPointer(currentStorage) === expected;
        if (!currentOnOwner) {
          const before = health.current;
          health.transition('poisoned', { reason: 'context-mismatch', operationId });
          throw new DriverRuntimeError('DRIVER_CONTEXT_MISMATCH', 'immediate-driver', 'Private context is not current on its owning Worker.', {}, { operationId, healthBefore: before, healthAfter: health.current });
        }
        return {
          schemaVersion: 1,
          context: token,
          currentOnOwner,
          health: health.snapshot(),
          inventory: registry.inventory(),
          operationSequence: operationId,
        };
      },
      async close({ operationId }) {
        const teardown = await registry.closeAll();
        observeTeardown(teardown, operationId);
        const contextDisposition = teardown.dispositions.find((entry) => entry.resource.kind === 'context')?.disposition ?? null;
        const libraryDisposition = teardown.dispositions.find((entry) => entry.resource.kind === 'library')?.disposition ?? null;
        const clean = teardown.errors.length === 0
          && teardown.inventory.counts.live === 0
          && teardown.inventory.counts.closing === 0
          && teardown.inventory.counts.orphaned === 0
          && contextDisposition?.contextDestroyed === true
          && contextDisposition?.currentNull === true
          && libraryDisposition?.libraryClosed === true
          && libraryDisposition?.staleWrapperRejected === true;
        if (clean) health.transition('closed', { reason: 'graceful-close', operationId });
        else if (health.current === 'healthy') health.transition('suspect', { reason: 'unproved-close', operationId });
        return {
          schemaVersion: 1,
          graceful: clean,
          cleanupClaim: clean ? 'proved-exact-windows-profile' : 'unproved',
          health: health.snapshot(),
          teardown,
          context: contextDisposition,
          library: libraryDisposition,
          operationSequence: operationId,
        };
      },
      memory,
      execution,
    };
  } catch (error) {
    observeError(error, { operationId: 0, operation: 'runtime.open' });
    const cleanupErrors = [];
    const unprovedResources = [];
    let dependencyCleanupBlocked = false;
    if (rawContext !== null) {
      try {
        destroyContextForRollback(rawContext);
        rawContext = null;
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
        unprovedResources.push({ kind: 'context', state: 'orphaned', disposition: 'unproved' });
        observeError(cleanupError, { operationId: 0, operation: 'runtime.open.cleanup' });
        dependencyCleanupBlocked = true;
      }
    }

    let teardown;
    if (dependencyCleanupBlocked) {
      teardown = { errors: [], inventory: registry.markEpochDead('startup-rollback-dependency-unproved') };
    } else {
      teardown = await registry.closeAll();
      cleanupErrors.push(...teardown.errors);
      observeTeardown(teardown, 0);
    }

    if (!libraryToken && library && !dependencyCleanupBlocked) {
      try { closeDriverLibrary(library); } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
        unprovedResources.push({ kind: 'library', state: 'orphaned', disposition: 'unproved' });
        observeError(cleanupError, { operationId: 0, operation: 'runtime.open.cleanup' });
      }
    }

    if (cleanupErrors.length > 0) {
      const rollbackError = startupRollbackFailure({
        primaryError: error,
        cleanupErrors,
        inventory: teardown.inventory,
        unprovedResources,
        healthCurrent: health.current,
      });
      observeError(rollbackError, { operationId: 0, operation: 'runtime.open' });
      throw rollbackError;
    }
    throw error;
  }
}
