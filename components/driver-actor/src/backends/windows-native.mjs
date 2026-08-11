import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';

import ffi from 'node:ffi';

import { ResourceRegistry } from '../../../resource-registry/index.mjs';
import { cudaTier0FfiDefinitions } from '../../../../schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs';
import { createDefaultCuCtxCreateParams } from '../../../../schemas/cuda-13.3/linux-x64/generated/packers.mjs';
import { DriverRuntimeError } from '../errors.mjs';
import { HealthState } from '../health.mjs';

const NODE_VERSION = 'v26.7.0';
const CUDA_API_VERSION = 13030;
const DRIVER_ACTOR_SYMBOLS = Object.freeze([
  'cuInit', 'cuDriverGetVersion', 'cuDeviceGetCount', 'cuDeviceGet', 'cuDeviceGetAttribute',
  'cuGetErrorName', 'cuGetErrorString', 'cuCtxCreate_v4', 'cuCtxDestroy_v2',
  'cuCtxSetCurrent', 'cuCtxGetCurrent',
]);
const DRIVER_ACTOR_FFI_DEFINITIONS = Object.freeze(Object.fromEntries(
  DRIVER_ACTOR_SYMBOLS.map((symbol) => [symbol, cudaTier0FfiDefinitions[symbol]]),
));
const ATTRIBUTES = Object.freeze({
  maxThreadsPerBlock: 1,
  multiprocessorCount: 16,
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
  if (process.version !== NODE_VERSION) {
    throw new DriverRuntimeError('DRIVER_NODE_UNSUPPORTED', 'unsupported', `The native F3 profile requires official Node ${NODE_VERSION}.`, { node: process.version });
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

export async function createBackend({ runtimeId, epoch }) {
  const health = new HealthState();
  const registry = new ResourceRegistry({ runtimeId, epoch });
  const driverPath = canonicalDriverPath();
  let library;
  let functions;
  let libraryToken;
  let contextToken;

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
    health.transition(requestedHealth, { reason: operation, operationId });
    return new DriverRuntimeError(
      'CUDA_DRIVER_FAILURE',
      'immediate-driver',
      `${operation} failed with CUDA status ${status}.`,
      {
        nativeStatus: status,
        nativeName: errorText('cuGetErrorName', status),
        nativeDescription: errorText('cuGetErrorString', status),
      },
      { operationId, healthBefore: before, healthAfter: health.current },
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

  try {
    library = new ffi.DynamicLibrary(driverPath);
    functions = library.getFunctions(DRIVER_ACTOR_FFI_DEFINITIONS);
    const staleWrapper = functions.cuInit;
    libraryToken = registry.allocate({
      kind: 'library',
      value: library,
      dispose(value) {
        value.close();
        let staleWrapperRejected = false;
        let staleWrapperCode = null;
        try { staleWrapper(0); } catch (error) {
          staleWrapperRejected = true;
          staleWrapperCode = error.code ?? null;
        }
        if (!staleWrapperRejected) throw new DriverRuntimeError('DRIVER_LIBRARY_STALE_WRAPPER', 'restart-required', 'Closed Driver library left a callable wrapper.');
        return { libraryClosed: true, staleWrapperRejected, staleWrapperCode };
      },
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
    contextToken = registry.allocate({
      kind: 'context',
      value: context,
      parent: libraryToken,
      dispose(value) {
        requireSuccess('cuCtxSetCurrent(teardown)', functions.cuCtxSetCurrent(value), null, 'poisoned');
        requireSuccess('cuCtxDestroy_v2', functions.cuCtxDestroy_v2(value), null, 'poisoned');
        const currentStorage = pointerOut();
        requireSuccess('cuCtxGetCurrent(after-destroy)', functions.cuCtxGetCurrent(currentStorage), null, 'poisoned');
        const currentNull = readPointer(currentStorage) === 0n;
        if (!currentNull) throw new DriverRuntimeError('DRIVER_CONTEXT_STILL_CURRENT', 'restart-required', 'Destroyed context remained current during teardown.');
        return { contextDestroyed: true, currentNull };
      },
    });

    const currentStorage = pointerOut();
    requireSuccess('cuCtxGetCurrent(startup)', functions.cuCtxGetCurrent(currentStorage), 0, 'poisoned');
    if (readPointer(currentStorage) !== context) {
      health.transition('poisoned', { reason: 'startup-context-mismatch', operationId: 0 });
      throw new DriverRuntimeError('DRIVER_CONTEXT_MISMATCH', 'immediate-driver', 'Created context is not current on the owning Worker.', {}, { operationId: 0, healthBefore: 'healthy', healthAfter: health.current });
    }

    function description(operationSequence = 0) {
      return {
        schemaVersion: 1,
        runtime: { id: runtimeId, epoch, state: 'open', backend: 'windows-native' },
        profile: { node: process.version, platform: process.platform, architecture: process.arch, cudaApiVersion: CUDA_API_VERSION, nativeQualified: true },
        driver: { apiVersion: driverVersion, deviceCount },
        device: { ordinal: 0, attributes },
        context: contextToken,
        health: health.snapshot(),
        inventory: registry.inventory(),
        operationSequence,
        claim: 'exact-windows-f3w-profile',
      };
    }

    return {
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
    };
  } catch (error) {
    const teardown = await registry.closeAll();
    if (!libraryToken && library) {
      try { library.close(); } catch {}
    }
    if (teardown.errors.length > 0 && error && typeof error === 'object') {
      error.details = Object.freeze({ ...(error.details ?? {}), startupCleanupErrors: teardown.errors });
    }
    throw error;
  }
}
