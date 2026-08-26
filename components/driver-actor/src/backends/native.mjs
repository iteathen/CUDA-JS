import ffi from 'node:ffi';

import { ExecutionManager } from '../../../execution/index.mjs';
import { HostMemoryTransferManager } from '../../../host-memory-transfer/index.mjs';
import { DeviceViewManager, MemoryManager } from '../../../memory/index.mjs';
import { PublicationMailboxManager } from '../../../publication-mailbox/index.mjs';
import { CudaLibraryAdapterManager } from '../../../cuda-library-adapters/index.mjs';
import { ResourceRegistry } from '../../../resource-registry/index.mjs';
import { cudaTier0FfiDefinitions } from '../../../../schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs';
import { createDefaultCuCtxCreateParams, cudaTier0Layouts } from '../../../../schemas/cuda-13.3/linux-x64/generated/packers.mjs';
import { cublasLtF32MatmulAbi, cublasLtF32MatmulFfiDefinitions } from '../../../../schemas/cuda-13.3/win-x64/generated/cublaslt-ffi-definitions.mjs';
import { DriverRuntimeError } from '../errors.mjs';
import { HealthState, observeErrorHealth } from '../health.mjs';
import { startupRollbackFailure } from '../startup-rollback.mjs';

const CUDA_API_VERSION = 13030;
const DRIVER_ACTOR_SYMBOLS = Object.freeze([
  'cuInit', 'cuDriverGetVersion', 'cuDeviceGetCount', 'cuDeviceGet', 'cuDeviceGetAttribute',
  'cuGetErrorName', 'cuGetErrorString', 'cuCtxCreate_v4', 'cuCtxDestroy_v2',
  'cuCtxSetCurrent', 'cuCtxGetCurrent',
  'cuMemGetInfo_v2', 'cuMemAlloc_v2', 'cuMemFree_v2', 'cuMemHostAlloc', 'cuMemFreeHost',
  'cuMemHostRegister_v2', 'cuMemHostGetDevicePointer_v2', 'cuMemHostUnregister',
  'cuMemcpyHtoD_v2', 'cuMemcpyDtoH_v2', 'cuMemcpyHtoDAsync_v2', 'cuMemcpyDtoHAsync_v2', 'cuMemcpyDtoDAsync_v2',
  'cuModuleLoadData', 'cuModuleGetFunction', 'cuModuleUnload',
  'cuStreamCreate', 'cuStreamDestroy_v2',
  'cuEventCreate', 'cuEventRecord', 'cuEventQuery', 'cuEventDestroy_v2',
  'cuLaunchKernelEx',
]);
const DRIVER_ACTOR_FFI_DEFINITIONS = Object.freeze(Object.fromEntries(
  DRIVER_ACTOR_SYMBOLS.map((symbol) => [symbol, cudaTier0FfiDefinitions[symbol]]),
));
const DEVICE_DISCOVERY_SYMBOLS = Object.freeze([
  'cuInit', 'cuDriverGetVersion', 'cuDeviceGetCount', 'cuDeviceGet', 'cuDeviceGetAttribute',
]);
const DEVICE_DISCOVERY_FFI_DEFINITIONS = Object.freeze(Object.fromEntries(
  DEVICE_DISCOVERY_SYMBOLS.map((symbol) => [symbol, cudaTier0FfiDefinitions[symbol]]),
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
  canMapHostMemory: 19,
  computeMode: 20,
  tccDriver: 35,
  unifiedAddressing: 41,
  computeCapabilityMajor: 75,
  computeCapabilityMinor: 76,
  hostNativeAtomicSupported: 86,
});

function readPointer(storage) { return storage.readBigUInt64LE(0); }
function readI32(storage) { return storage.readInt32LE(0); }
function pointerOut() { return Buffer.alloc(8); }

export async function discoverNativeDevices({ nativeProfile }) {
  let library = null;
  let primaryError = null;
  let result = null;
  let staleWrapper = null;
  try {
    library = new ffi.DynamicLibrary(nativeProfile.driverPath);
    const discovery = library.getFunctions(DEVICE_DISCOVERY_FFI_DEFINITIONS);
    staleWrapper = discovery.cuInit;
    const requireSuccess = (operation, status) => {
      if (status !== 0) throw new DriverRuntimeError('DRIVER_DEVICE_DISCOVERY_FAILED', 'provider', `${operation} failed during CUDA device discovery.`, { nativeStatus: status }, { operation });
    };
    const queryI32 = (operation, ...args) => {
      const output = Buffer.alloc(4);
      requireSuccess(operation, discovery[operation](output, ...args));
      return readI32(output);
    };
    requireSuccess('cuInit', discovery.cuInit(0));
    queryI32('cuDriverGetVersion');
    const deviceCount = queryI32('cuDeviceGetCount');
    if (!Number.isSafeInteger(deviceCount) || deviceCount < 0 || deviceCount > 256) {
      throw new DriverRuntimeError('DRIVER_DEVICE_INVENTORY_INVALID', 'provider', 'CUDA returned an invalid bounded device count.');
    }
    const devices = [];
    for (let nativeDevice = 0; nativeDevice < deviceCount; nativeDevice += 1) {
      const device = queryI32('cuDeviceGet', nativeDevice);
      const computeCapabilityMajor = queryI32('cuDeviceGetAttribute', ATTRIBUTES.computeCapabilityMajor, device);
      const computeCapabilityMinor = queryI32('cuDeviceGetAttribute', ATTRIBUTES.computeCapabilityMinor, device);
      devices.push({ nativeDevice, computeCapabilityMajor, computeCapabilityMinor });
    }
    result = Object.freeze(devices.map((device) => Object.freeze(device)));
  } catch (error) {
    primaryError = error;
  }

  if (library) {
    try {
      library.close();
      if (staleWrapper) {
        let staleWrapperRejected = false;
        try { staleWrapper(0); } catch { staleWrapperRejected = true; }
        if (!staleWrapperRejected) throw new Error('closed Driver wrapper remained callable');
      }
    } catch {
      throw new DriverRuntimeError(
        'DRIVER_DEVICE_DISCOVERY_CLEANUP_FAILED',
        'restart-required',
        'CUDA device discovery did not prove Driver library cleanup.',
        { primaryCode: typeof primaryError?.code === 'string' ? primaryError.code : null },
        { operation: 'driver.device-discovery.close', healthBefore: 'healthy', healthAfter: 'restart-required' },
      );
    }
  }
  if (primaryError) throw primaryError;
  return result;
}

export async function createNativeBackend({ runtimeId, epoch, memoryPolicy, executionPolicy, nativeProfile, selectedDevice }) {
  const health = new HealthState();
  const registry = new ResourceRegistry({ runtimeId, epoch });
  const driverPath = nativeProfile.driverPath;
  let library;
  let functions;
  let staleWrapper;
  let libraryToken;
  let rawContext = null;
  let contextToken;
  let memory;
  let mailboxes;
  let execution;
  let transfer;
  let libraryAdapters;

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
    if (deviceCount < 1) throw new DriverRuntimeError('DRIVER_DEVICE_MISSING', 'unsupported', 'The native DriverActor profile requires at least one CUDA device.', { deviceCount });
    const selectedOrdinal = selectedDevice?.nativeDevice ?? 0;
    if (selectedOrdinal >= deviceCount) {
      throw new DriverRuntimeError('DRIVER_SELECTED_DEVICE_STALE', 'stale-resource', 'Selected device is outside the current CUDA visibility snapshot.');
    }
    const device = queryI32('cuDeviceGet', 0, selectedOrdinal);
    const attributes = {};
    for (const [name, attribute] of Object.entries(ATTRIBUTES)) attributes[name] = queryI32('cuDeviceGetAttribute', 0, attribute, device);
    if (selectedDevice && (attributes.computeCapabilityMajor !== selectedDevice.architecture.major
        || attributes.computeCapabilityMinor !== selectedDevice.architecture.minor)) {
      throw new DriverRuntimeError('DRIVER_SELECTED_DEVICE_STALE', 'stale-resource', 'Selected device architecture changed after discovery.');
    }

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
    const views = new DeviceViewManager({ registry });

    mailboxes = new PublicationMailboxManager({
      registry,
      contextToken,
      operations: {
        async register({ view, byteLength, operationId }) {
          requireCurrent(operationId);
          if (attributes.canMapHostMemory !== 1 || attributes.unifiedAddressing !== 1) {
            throw new DriverRuntimeError('MEMORY_MAILBOX_PROFILE_UNSUPPORTED', 'unsupported', 'The selected device does not support the accepted mapped-mailbox profile.', { canMapHostMemory: attributes.canMapHostMemory, unifiedAddressing: attributes.unifiedAddressing }, { operationId, healthBefore: health.current, healthAfter: health.current });
          }
          requireSuccess('cuMemHostRegister_v2', functions.cuMemHostRegister_v2(view, BigInt(byteLength), 2), operationId);
          return ffi.getRawPointer(view);
        },
        async map({ view, operationId }) {
          requireCurrent(operationId);
          const output = pointerOut();
          requireSuccess('cuMemHostGetDevicePointer_v2', functions.cuMemHostGetDevicePointer_v2(output, view, 0), operationId);
          const pointer = readPointer(output);
          if (pointer === 0n) throw new DriverRuntimeError('MEMORY_MAILBOX_MAPPING_NULL', 'immediate-driver', 'CUDA mailbox mapping returned a null device alias.', {}, { operationId, healthBefore: health.current, healthAfter: health.current });
          return pointer;
        },
        async unregister({ view, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuMemHostUnregister', functions.cuMemHostUnregister(view), operationId, 'poisoned');
          return { nativeUnregistered: true };
        },
      },
    });

    const launchLayout = cudaTier0Layouts.CUlaunchConfig;
    if (!launchLayout || launchLayout.size !== 56) throw new DriverRuntimeError('DRIVER_LAUNCH_LAYOUT_UNSUPPORTED', 'unsupported', 'Generated CUlaunchConfig layout is unavailable for the native DriverActor profile.');
    const launchOffsets = Object.freeze(Object.fromEntries(launchLayout.fields.map((field) => [field.name, field.offset])));
    for (const field of ['gridDimX', 'gridDimY', 'gridDimZ', 'blockDimX', 'blockDimY', 'blockDimZ', 'sharedMemBytes', 'hStream', 'attrs', 'numAttrs']) {
      if (!Number.isSafeInteger(launchOffsets[field])) throw new DriverRuntimeError('DRIVER_LAUNCH_LAYOUT_UNSUPPORTED', 'unsupported', 'Generated CUlaunchConfig field is missing.', { field });
    }

    execution = new ExecutionManager({
      registry,
      contextToken,
      memory,
      views,
      mailboxes,
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

    transfer = new HostMemoryTransferManager({
      registry,
      contextToken,
      memory,
      execution,
      maxTransferBytes: memoryPolicy.maxTransferBytes,
      operations: {
        async allocateStaging({ byteLength, operationId }) {
          requireCurrent(operationId);
          const output = pointerOut();
          const status = functions.cuMemHostAlloc(output, BigInt(byteLength), 0);
          if (status === 2) {
            throw new DriverRuntimeError('CUDA_OUT_OF_MEMORY', 'pressure', 'CUDA pinned host allocation reported out of memory.', { nativeStatus: status, byteLength }, { operation: 'cuMemHostAlloc', operationId, healthBefore: health.current, healthAfter: health.current });
          }
          requireSuccess('cuMemHostAlloc', status, operationId);
          const native = readPointer(output);
          if (native === 0n) throw new DriverRuntimeError('DRIVER_HOST_MEMORY_NULL', 'immediate-driver', 'CUDA pinned host allocation succeeded but returned a null address.', { byteLength }, { operationId, healthBefore: health.current, healthAfter: health.current });
          return native;
        },
        async freeStaging({ native, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuMemFreeHost', functions.cuMemFreeHost(native), operationId, 'poisoned');
          return { nativeFreed: true };
        },
        stagingView({ native, byteLength }) { return ffi.toBuffer(native, byteLength, false); },
        async copyHtoDAsync({ destinationNative, destinationOffset, stagingNative, byteLength, streamNative, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuMemcpyHtoDAsync_v2', functions.cuMemcpyHtoDAsync_v2(destinationNative + BigInt(destinationOffset), stagingNative, BigInt(byteLength), streamNative), operationId);
        },
        async copyDtoHAsync({ stagingNative, sourceNative, sourceOffset, byteLength, streamNative, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuMemcpyDtoHAsync_v2', functions.cuMemcpyDtoHAsync_v2(stagingNative, sourceNative + BigInt(sourceOffset), BigInt(byteLength), streamNative), operationId);
        },
        async copyDtoDAsync({ destinationNative, destinationOffset, sourceNative, sourceOffset, byteLength, streamNative, operationId }) {
          requireCurrent(operationId);
          requireSuccess('cuMemcpyDtoDAsync_v2', functions.cuMemcpyDtoDAsync_v2(destinationNative + BigInt(destinationOffset), sourceNative + BigInt(sourceOffset), BigInt(byteLength), streamNative), operationId);
        },
      },
    });

    libraryAdapters = new CudaLibraryAdapterManager({
      registry,
      contextToken,
      memory,
      views,
      execution,
      operations: {
        async openCublasLt({ operationId }) {
          requireCurrent(operationId);
          const profile = await nativeProfile.resolveCublasLtProfile();
          let providerLibrary = null;
          let providerFunctions = null;
          let handle = 0n;
          try {
            try {
              providerLibrary = new ffi.DynamicLibrary(profile.providerPath);
              providerFunctions = providerLibrary.getFunctions(cublasLtF32MatmulFfiDefinitions);
            } catch {
              throw new DriverRuntimeError('CUBLASLT_PROVIDER_EXPORTS', 'unsupported', 'The admitted cuBLASLt provider could not supply the selected export/signature profile.');
            }
            const version = providerFunctions.cublasLtGetVersion().toString();
            if (version !== profile.manifest.provider.version) throw new DriverRuntimeError('CUBLASLT_PROVIDER_VERSION', 'unsupported', 'The cuBLASLt runtime version differs from the admitted provider profile.', { expected: profile.manifest.provider.version, actual: version });
            const output = pointerOut();
            const status = providerFunctions.cublasLtCreate(output);
            handle = readPointer(output);
            if (status !== 0) throw new DriverRuntimeError('CUBLASLT_CREATE_FAILED', 'provider', 'cuBLASLt handle creation failed.', { nativeStatus: status }, { operation: 'cublasLtCreate', operationId, healthBefore: health.current, healthAfter: health.current });
            if (handle === 0n) throw new DriverRuntimeError('CUBLASLT_HANDLE_NULL', 'provider', 'cuBLASLt handle creation returned null.', {}, { operation: 'cublasLtCreate', operationId, healthBefore: health.current, healthAfter: health.current });
            return {
              native: Object.freeze({ library: providerLibrary, functions: providerFunctions, handle, profile: profile.manifest.profile }),
              provider: Object.freeze({ name: 'cuBLASLt', version: '13.5.1', qualification: 'exact-windows-profile' }),
            };
          } catch (error) {
            const cleanupFailures = [];
            if (handle !== 0n) {
              try {
                const status = providerFunctions.cublasLtDestroy(handle);
                if (status !== 0) cleanupFailures.push(`cublasLtDestroy:${status}`);
              } catch (cleanupError) { cleanupFailures.push(cleanupError?.code ?? 'cublasLtDestroy-threw'); }
            }
            if (providerLibrary) {
              try { providerLibrary.close(); }
              catch (cleanupError) { cleanupFailures.push(cleanupError?.code ?? 'library-close-threw'); }
            }
            if (cleanupFailures.length > 0) {
              throw new DriverRuntimeError('CUBLASLT_OPEN_ROLLBACK_FAILED', 'restart-required', 'cuBLASLt opening failed and acquired provider ownership did not close terminally.', {
                causeCode: error?.code ?? 'CUBLASLT_OPEN_FAILED', causeReason: String(cleanupFailures[0]),
              }, { operation: 'cublasLt.open', operationId, healthBefore: health.current, healthAfter: 'restart-required' });
            }
            throw error;
          }
        },
        async closeCublasLt({ native, operationId }) {
          requireCurrent(operationId);
          const status = native.functions.cublasLtDestroy(native.handle);
          if (status !== 0) throw new DriverRuntimeError('CUBLASLT_DESTROY_FAILED', 'restart-required', 'cuBLASLt handle cleanup failed.', { nativeStatus: status }, { operation: 'cublasLtDestroy', operationId, healthBefore: health.current, healthAfter: 'restart-required' });
          const stale = native.functions.cublasLtGetVersion;
          native.library.close();
          let staleRejected = false;
          try { stale(); } catch { staleRejected = true; }
          if (!staleRejected) throw new DriverRuntimeError('CUBLASLT_LIBRARY_STALE_WRAPPER', 'restart-required', 'Closed cuBLASLt library left a callable wrapper.', {}, { operation: 'cublasLt.library.close', operationId, healthBefore: health.current, healthAfter: 'restart-required' });
          return { handleDestroyed: true, libraryClosed: true, staleWrapperRejected: true };
        },
        async createF32MatmulPlan({ adapterNative, plan, operationId }) {
          requireCurrent(operationId);
          const f = adapterNative.functions;
          const handles = [];
          const createHandle = (operation, invoke, destroy) => {
            const output = pointerOut();
            const status = invoke(output);
            if (status !== 0) throw new DriverRuntimeError('CUBLASLT_PLAN_CREATE_FAILED', status === 3 ? 'pressure' : 'provider', `${operation} failed.`, { nativeStatus: status }, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
            const value = readPointer(output);
            if (value === 0n) throw new DriverRuntimeError('CUBLASLT_PLAN_HANDLE_NULL', 'provider', `${operation} returned null.`, {}, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
            handles.push({ value, destroy });
            return value;
          };
          const requireProvider = (operation, status) => {
            if (status !== 0) throw new DriverRuntimeError('CUBLASLT_PLAN_CREATE_FAILED', [7, 8, 15].includes(status) ? 'unsupported' : status === 3 ? 'pressure' : 'provider', `${operation} failed.`, { nativeStatus: status }, { operation, operationId, healthBefore: health.current, healthAfter: health.current });
          };
          try {
            const desc = createHandle('cublasLtMatmulDescCreate', (out) => f.cublasLtMatmulDescCreate(out, cublasLtF32MatmulAbi.constants.compute32F, cublasLtF32MatmulAbi.constants.cudaR32F), f.cublasLtMatmulDescDestroy);
            const transpose = (attribute, enabled) => {
              const value = Buffer.alloc(4); value.writeInt32LE(enabled ? cublasLtF32MatmulAbi.constants.operationT : cublasLtF32MatmulAbi.constants.operationN);
              requireProvider('cublasLtMatmulDescSetAttribute', f.cublasLtMatmulDescSetAttribute(desc, attribute, value, 4n));
            };
            transpose(cublasLtF32MatmulAbi.constants.matmulTransAAttribute, plan.transposeA);
            transpose(cublasLtF32MatmulAbi.constants.matmulTransBAttribute, plan.transposeB);
            const layout = (rows, columns, leadingDimension) => {
              const value = createHandle('cublasLtMatrixLayoutCreate', (out) => f.cublasLtMatrixLayoutCreate(out, cublasLtF32MatmulAbi.constants.cudaR32F, BigInt(rows), BigInt(columns), BigInt(leadingDimension)), f.cublasLtMatrixLayoutDestroy);
              const order = Buffer.alloc(4); order.writeInt32LE(cublasLtF32MatmulAbi.constants.orderRow);
              requireProvider('cublasLtMatrixLayoutSetAttribute', f.cublasLtMatrixLayoutSetAttribute(value, cublasLtF32MatmulAbi.constants.layoutOrderAttribute, order, 4n));
              return value;
            };
            const a = layout(plan.transposeA ? plan.k : plan.m, plan.transposeA ? plan.m : plan.k, plan.transposeA ? plan.m : plan.k);
            const b = layout(plan.transposeB ? plan.n : plan.k, plan.transposeB ? plan.k : plan.n, plan.transposeB ? plan.k : plan.n);
            const c = layout(plan.m, plan.n, plan.n);
            const d = layout(plan.m, plan.n, plan.n);
            const preference = createHandle('cublasLtMatmulPreferenceCreate', (out) => f.cublasLtMatmulPreferenceCreate(out), f.cublasLtMatmulPreferenceDestroy);
            const workspaceLimit = Buffer.alloc(8); workspaceLimit.writeBigUInt64LE(BigInt(plan.maxWorkspaceBytes));
            requireProvider('cublasLtMatmulPreferenceSetAttribute', f.cublasLtMatmulPreferenceSetAttribute(preference, cublasLtF32MatmulAbi.constants.preferenceMaxWorkspaceBytesAttribute, workspaceLimit, 8n));
            const result = Buffer.alloc(cublasLtF32MatmulAbi.heuristicResult.size);
            const count = Buffer.alloc(4);
            requireProvider('cublasLtMatmulAlgoGetHeuristic', f.cublasLtMatmulAlgoGetHeuristic(adapterNative.handle, desc, a, b, c, d, preference, 1, result, count));
            if (count.readInt32LE(0) !== 1 || result.readInt32LE(cublasLtF32MatmulAbi.heuristicResult.stateOffset) !== 0) throw new DriverRuntimeError('CUBLASLT_ALGORITHM_UNAVAILABLE', 'unsupported', 'No cuBLASLt algorithm satisfies the bounded f32 matmul plan.');
            const workspaceBytesBig = result.readBigUInt64LE(cublasLtF32MatmulAbi.heuristicResult.workspaceSizeOffset);
            if (workspaceBytesBig > BigInt(Number.MAX_SAFE_INTEGER)) throw new DriverRuntimeError('CUBLASLT_WORKSPACE_REQUIREMENT_INVALID', 'provider', 'cuBLASLt returned an unsafe workspace size.');
            return {
              native: Object.freeze({ handle: adapterNative.handle, functions: f, desc, a, b, c, d, preference, algorithm: Buffer.from(result.subarray(0, cublasLtF32MatmulAbi.heuristicResult.algorithmSize)) }),
              workspaceBytes: Number(workspaceBytesBig),
            };
          } catch (error) {
            const cleanupFailures = [];
            for (let index = handles.length - 1; index >= 0; index -= 1) {
              try {
                const status = handles[index].destroy(handles[index].value);
                if (status !== 0) cleanupFailures.push(status);
              } catch (cleanupError) { cleanupFailures.push(cleanupError?.code ?? 'destroy-threw'); }
            }
            if (cleanupFailures.length > 0) {
              throw new DriverRuntimeError('CUBLASLT_PLAN_CREATE_ROLLBACK_FAILED', 'restart-required', 'cuBLASLt plan creation failed and descriptor rollback cleanup was unproved.', {
                causeCode: error?.code ?? 'CUBLASLT_PLAN_CREATE_FAILED', causeReason: String(cleanupFailures[0]),
              }, { operation: 'cublasLt.plan.create', operationId, healthBefore: health.current, healthAfter: 'restart-required' });
            }
            throw error;
          }
        },
        async destroyF32MatmulPlan({ native, operationId }) {
          requireCurrent(operationId);
          const failures = [];
          for (const [operation, handle] of [['cublasLtMatmulPreferenceDestroy', native.preference], ['cublasLtMatrixLayoutDestroy', native.d], ['cublasLtMatrixLayoutDestroy', native.c], ['cublasLtMatrixLayoutDestroy', native.b], ['cublasLtMatrixLayoutDestroy', native.a], ['cublasLtMatmulDescDestroy', native.desc]]) {
            try {
              const status = native.functions[operation](handle);
              if (status !== 0) failures.push(`${operation}:${status}`);
            } catch (error) { failures.push(`${operation}:${error?.code ?? 'threw'}`); }
          }
          if (failures.length > 0) throw new DriverRuntimeError('CUBLASLT_PLAN_DESTROY_FAILED', 'restart-required', 'One or more cuBLASLt plan descriptors failed cleanup.', { causeCode: failures[0] }, { operation: 'cublasLt.plan.destroy', operationId, healthBefore: health.current, healthAfter: 'restart-required' });
          return { descriptorCount: 6, descriptorsDestroyed: true };
        },
        async submitF32Matmul({ planNative, alpha, beta, a, b, c, d, workspace, workspaceBytes, streamNative, operationId }) {
          requireCurrent(operationId);
          const alphaStorage = Buffer.alloc(4); alphaStorage.writeFloatLE(alpha);
          const betaStorage = Buffer.alloc(4); betaStorage.writeFloatLE(beta);
          const pointer = (operand) => operand.native + BigInt(operand.byteOffset);
          const status = planNative.functions.cublasLtMatmul(
            planNative.handle, planNative.desc, alphaStorage, pointer(a), planNative.a, pointer(b), planNative.b,
            betaStorage, pointer(c), planNative.c, pointer(d), planNative.d, planNative.algorithm,
            workspace ? pointer(workspace) : 0n, BigInt(workspaceBytes), streamNative,
          );
          if (status !== 0) throw new DriverRuntimeError('CUBLASLT_MATMUL_FAILED', [7, 8, 15].includes(status) ? 'unsupported' : 'immediate-driver', 'cuBLASLt matrix multiplication submission failed.', { nativeStatus: status }, { operation: 'cublasLtMatmul', operationId, healthBefore: health.current, healthAfter: [7, 8, 15].includes(status) ? health.current : 'suspect' });
        },
      },
    });
    execution.registerPreparedNodeFamily(libraryAdapters.preparedNodeFamily());

    async function description(operationSequence = 0) {
      const executionSummary = execution.summary();
      return {
        schemaVersion: 1,
        runtime: { id: runtimeId, epoch, state: 'open', backend: nativeProfile.backend },
        profile: { node: process.version, platform: process.platform, architecture: process.arch, cudaApiVersion: CUDA_API_VERSION, nativeOperational: true, nativeQualified: false },
        driver: { apiVersion: driverVersion, deviceCount },
        device: { ordinal: selectedOrdinal, attributes },
        context: contextToken,
        memory: await memory.usage(operationSequence),
        transfer: transfer.summary(),
        mailbox: mailboxes.summary(),
        libraries: libraryAdapters.summary(),
        execution: executionSummary,
        health: health.snapshot(),
        inventory: registry.inventory(),
        operationSequence,
        claim: executionSummary.completionCount > 0 ? nativeProfile.executionClaim : nativeProfile.memoryClaim,
      };
    }

    return {
      inventory() { return registry.inventory(); },
      health() { return health.snapshot(); },
      observeError,
      assertAccepting(operation, operationId) {
        const cleanupOrRead = new Set([
          'runtime.describe', 'runtime.close', 'context.status', 'memory.status', 'memory.release', 'memory.view.status', 'memory.view.release',
          'execution.module.status', 'execution.module.release', 'execution.function.status', 'execution.function.release',
          'execution.prepared.status', 'execution.prepared.release', 'execution.operation.status', 'execution.operation.release', 'mailbox.status', 'mailbox.release',
          'library.cublaslt.status', 'library.cublaslt.release', 'library.cublaslt.plan.status', 'library.cublaslt.plan.release',
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
          cleanupClaim: clean ? nativeProfile.cleanupClaim : 'unproved',
          health: health.snapshot(),
          teardown,
          context: contextDisposition,
          library: libraryDisposition,
          operationSequence: operationId,
        };
      },
      memory,
      views,
      mailboxes,
      transfer,
      libraryAdapters,
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
