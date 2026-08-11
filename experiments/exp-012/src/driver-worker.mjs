import path from 'node:path';
import ffi from 'node:ffi';
import { parentPort, workerData } from 'node:worker_threads';

import {
  cudaTier0FfiDefinitions,
  cudaTier0SymbolAliases,
} from '../../../schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs';
import { createDefaultCuCtxCreateParams } from '../../../schemas/cuda-13.3/linux-x64/generated/packers.mjs';

const experimentId = workerData?.experimentId ?? 'EXP-012';
if (!parentPort) throw new Error(`${experimentId} Driver owner must run in a Worker.`);

const CUDA_VERSION = 13030;
const F2_NATIVE_SYMBOLS = Object.freeze([
  'cuCtxCreate_v4', 'cuCtxDestroy_v2', 'cuCtxGetCurrent', 'cuCtxSetCurrent',
  'cuDeviceGet', 'cuDeviceGetAttribute', 'cuDeviceGetCount', 'cuDriverGetVersion',
  'cuGetErrorName', 'cuGetErrorString', 'cuGetProcAddress_v2', 'cuInit',
]);
const f2FfiDefinitions = Object.freeze(Object.fromEntries(F2_NATIVE_SYMBOLS.map((name) => [name, cudaTier0FfiDefinitions[name]])));
const f2SymbolAliases = Object.freeze(Object.fromEntries(Object.entries(cudaTier0SymbolAliases).filter(([, native]) => F2_NATIVE_SYMBOLS.includes(native))));
const attributes = Object.freeze({
  maxThreadsPerBlock: 1,
  multiprocessorCount: 16,
  computeCapabilityMajor: 75,
  computeCapabilityMinor: 76,
});

function pointerOut() {
  return Buffer.alloc(8);
}

function readPointer(storage) {
  return storage.readBigUInt64LE(0);
}

function readI32(storage) {
  return storage.readInt32LE(0);
}

function queryProcedure(functions, library, publicName, nativeSymbol, version = CUDA_VERSION) {
  const pointerStorage = pointerOut();
  const statusStorage = Buffer.alloc(4);
  const result = functions.cuGetProcAddress_v2(
    Buffer.from(`${publicName}\0`, 'ascii'),
    pointerStorage,
    version,
    0n,
    statusStorage,
  );
  const pointer = readPointer(pointerStorage);
  let namedExport = 0n;
  try {
    namedExport = library.getSymbol(nativeSymbol);
  } catch {
    namedExport = 0n;
  }
  return {
    result,
    status: readI32(statusStorage),
    nonzero: pointer !== 0n,
    namedExportAvailable: namedExport !== 0n,
    matchesNamedExport: pointer !== 0n && pointer === namedExport,
  };
}

function queryNegative(functions, name, version) {
  const pointerStorage = pointerOut();
  const statusStorage = Buffer.alloc(4);
  const result = functions.cuGetProcAddress_v2(
    Buffer.from(`${name}\0`, 'ascii'),
    pointerStorage,
    version,
    0n,
    statusStorage,
  );
  return { result, status: readI32(statusStorage), nonzero: readPointer(pointerStorage) !== 0n };
}

function errorText(functions, functionName) {
  const output = pointerOut();
  const status = functions[functionName](0, output);
  const pointer = readPointer(output);
  return { status, value: pointer === 0n ? '<null>' : ffi.toString(pointer) };
}

function executeCuda(functions, library) {
  const cuda = {
    invalidInitFlagsStatus: functions.cuInit(1),
    initStatus: functions.cuInit(0),
    driverVersion: null,
    deviceCount: null,
    device: null,
    attributes: {},
    errors: {},
    procAddress: { entries: [], negatives: {} },
    context: {},
  };
  if (cuda.initStatus !== 0) throw new Error(`cuInit failed with ${cuda.initStatus}.`);

  const versionStorage = Buffer.alloc(4);
  cuda.driverVersion = { status: functions.cuDriverGetVersion(versionStorage), value: readI32(versionStorage) };
  const countStorage = Buffer.alloc(4);
  cuda.deviceCount = { status: functions.cuDeviceGetCount(countStorage), value: readI32(countStorage) };
  if (cuda.deviceCount.status !== 0 || cuda.deviceCount.value < 1) throw new Error(`${experimentId} requires at least one CUDA device.`);

  const deviceStorage = Buffer.alloc(4);
  const deviceStatus = functions.cuDeviceGet(deviceStorage, 0);
  const device = readI32(deviceStorage);
  cuda.device = { status: deviceStatus, ordinal: 0, value: device };
  for (const [name, attribute] of Object.entries(attributes)) {
    const output = Buffer.alloc(4);
    cuda.attributes[name] = { status: functions.cuDeviceGetAttribute(output, attribute, device), value: readI32(output) };
  }

  cuda.errors.name = errorText(functions, 'cuGetErrorName');
  cuda.errors.description = errorText(functions, 'cuGetErrorString');
  for (const [publicName, nativeSymbol] of Object.entries(f2SymbolAliases)) {
    cuda.procAddress.entries.push({
      publicName,
      nativeSymbol,
      ...queryProcedure(functions, library, publicName, nativeSymbol),
    });
  }
  cuda.procAddress.negatives.missingSymbol = queryNegative(functions, 'cudaJsDefinitelyMissing', CUDA_VERSION);
  cuda.procAddress.negatives.insufficientVersion = queryNegative(functions, 'cuInit', 1);
  cuda.procAddress.negatives.versionedQueryName = queryNegative(functions, 'cuCtxCreate_v4', CUDA_VERSION);

  const contextStorage = pointerOut();
  const parameters = createDefaultCuCtxCreateParams();
  let context = 0n;
  try {
    const createStatus = functions.cuCtxCreate_v4(contextStorage, parameters, 0, device);
    context = readPointer(contextStorage);
    cuda.context.create = { status: createStatus, value: context !== 0n };
    if (createStatus !== 0 || context === 0n) throw new Error(`cuCtxCreate_v4 failed with ${createStatus}.`);

    const currentStorage = pointerOut();
    cuda.context.getCurrent = { status: functions.cuCtxGetCurrent(currentStorage), value: readPointer(currentStorage) === context };
    cuda.context.clear = { status: functions.cuCtxSetCurrent(null), value: true };
    currentStorage.fill(0xff);
    cuda.context.getAfterClear = { status: functions.cuCtxGetCurrent(currentStorage), value: readPointer(currentStorage) === 0n };
    cuda.context.restore = { status: functions.cuCtxSetCurrent(context), value: true };
    currentStorage.fill(0);
    cuda.context.getAfterRestore = { status: functions.cuCtxGetCurrent(currentStorage), value: readPointer(currentStorage) === context };
    const destroyStatus = functions.cuCtxDestroy_v2(context);
    cuda.context.destroy = { status: destroyStatus, value: true };
    if (destroyStatus === 0) context = 0n;
    currentStorage.fill(0xff);
    cuda.context.getAfterDestroy = { status: functions.cuCtxGetCurrent(currentStorage), value: readPointer(currentStorage) === 0n };
  } finally {
    if (context !== 0n) {
      functions.cuCtxSetCurrent(context);
      functions.cuCtxDestroy_v2(context);
    }
  }
  return cuda;
}

let library;
try {
  let missingLibraryRejected = false;
  let missingLibraryError = null;
  try {
    const missingName = process.platform === 'win32'
      ? 'cuda-js-definitely-missing.dll'
      : 'libcuda-js-definitely-missing.so.1';
    const missingPath = path.join(path.dirname(workerData.driverPath), missingName);
    const missingLibrary = new ffi.DynamicLibrary(missingPath);
    missingLibrary.close();
  } catch (error) {
    missingLibraryRejected = true;
    missingLibraryError = { name: error.name, code: error.code ?? null };
  }

  library = new ffi.DynamicLibrary(workerData.driverPath);
  const functions = library.getFunctions(f2FfiDefinitions);
  const cuda = executeCuda(functions, library);
  const staleWrapper = functions.cuInit;
  library.close();
  library = null;
  let staleWrapperRejected = false;
  let staleWrapperError = null;
  try {
    staleWrapper(0);
  } catch (error) {
    staleWrapperRejected = true;
    staleWrapperError = { name: error.name, code: error.code ?? null };
  }
  parentPort.postMessage({
    ok: true,
    result: {
      profile: { node: process.version, platform: process.platform, architecture: process.arch },
      boundSymbols: Object.keys(f2FfiDefinitions),
      missingLibrary: { rejected: missingLibraryRejected, error: missingLibraryError },
      cuda,
      cleanup: { contextDestroyed: cuda.context.destroy.status === 0, currentNull: cuda.context.getAfterDestroy.value, libraryClosed: true, staleWrapperRejected, staleWrapperError },
    },
  });
} catch (error) {
  if (library) {
    try { library.close(); } catch {}
  }
  parentPort.postMessage({ ok: false, error: { name: error.name, code: error.code ?? null, message: error.message, stack: error.stack } });
} finally {
  parentPort.close();
}
