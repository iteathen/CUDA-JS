import { openCompilerRuntime } from '../../compiler-actor/index.mjs';
import { openDriverRuntime } from '../../driver-actor/index.mjs';
import { assessCudaSupport, inspectHostProfile } from '../../platform-diagnostics/index.mjs';
import { CUDA_JS_COMPATIBILITY } from '../compatibility.mjs';
import { facadeError, freezePublic, publicError } from './errors.mjs';

const runtimeData = new WeakMap();
const resourceData = new WeakMap();
const OPEN_FIELDS = Object.freeze(['compiler', 'driver']);
const COMPILER_FIELDS = Object.freeze(['cacheDirectory', 'cacheMode']);

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, allowed) {
  return plainObject(value) && Object.keys(value).every((key) => allowed.includes(key));
}

function compilerOptions(value) {
  if (value === false || value === undefined) return null;
  if (value === true) return Object.freeze({ cacheMode: 'disabled' });
  if (!exactFields(value, COMPILER_FIELDS)) throw facadeError('CUDA_JS_OPTIONS_INVALID', 'validation', 'Compiler options contain unknown fields.', {}, 'open');
  const cacheMode = value.cacheMode ?? (value.cacheDirectory === undefined ? 'disabled' : 'read-write');
  if (cacheMode !== 'disabled' && value.cacheDirectory === undefined) throw facadeError('CUDA_JS_CACHE_DIRECTORY_REQUIRED', 'validation', 'A normalized absolute cacheDirectory is required when the public compiler cache is enabled.', { cacheMode }, 'open');
  return Object.freeze({ ...value, cacheMode });
}

function normalizeOptions(value) {
  if (!exactFields(value, OPEN_FIELDS)) throw facadeError('CUDA_JS_OPTIONS_INVALID', 'validation', 'Runtime options contain unknown fields.', {}, 'open');
  if (value.driver !== undefined && !plainObject(value.driver)) throw facadeError('CUDA_JS_OPTIONS_INVALID', 'validation', 'Driver options must be an ordinary object.', {}, 'open');
  return Object.freeze({ driver: value.driver ?? {}, compiler: compilerOptions(value.compiler) });
}

function preflight(host) {
  if (host.hostKind === 'linux-native-x64' || host.hostKind === 'linux-native-arm64') {
    throw facadeError('CUDA_JS_LINUX_BACKEND_UNAVAILABLE', 'unsupported', 'This package does not yet contain a native Linux CUDA backend.', { hostKind: host.hostKind }, 'open');
  }
  if (host.hostKind.startsWith('wsl')) throw facadeError('CUDA_JS_WSL_BACKEND_UNAVAILABLE', 'unsupported', 'This package does not yet contain a WSL CUDA backend.', { hostKind: host.hostKind }, 'open');
  if (host.hostKind !== 'windows-native-x64') throw facadeError('CUDA_JS_HOST_BACKEND_UNAVAILABLE', 'unsupported', 'This package has no native backend for the detected host.', { hostKind: host.hostKind }, 'open');
  if (host.node.disposition === 'known-incompatible') {
    throw facadeError('CUDA_JS_NODE_INCOMPATIBLE', 'unsupported', 'This Node release lacks the minimum runtime substrate required by CUDA-JS.', { actualVersion: host.node.version, minimumVersion: host.node.minimumVersion, reason: host.node.reason }, 'open');
  }
  if (!host.ffi.experimental) throw facadeError('CUDA_JS_FFI_FLAG_REQUIRED', 'unsupported', 'CUDA-JS requires Node experimental FFI.', {}, 'open');
  if (host.ffi.permission === 'ffi-denied') throw facadeError('CUDA_JS_FFI_PERMISSION_REQUIRED', 'permission', 'CUDA-JS requires FFI authority when the Node permission model is active.', {}, 'open');
}

function publicCompilerStatus(status) {
  if (!status) return null;
  return freezePublic({ schemaVersion: 1, provider: status.provider, cache: status.cache, resources: status.resources, health: status.health, claim: status.claim });
}

function publicDriverTerminal(report) {
  if (!report) return null;
  return freezePublic({
    graceful: report.graceful === true,
    restartRequired: report.restartRequired === true,
    cleanupClaim: report.cleanupClaim ?? null,
    workerExited: report.workerExited === true,
    workerExitCode: report.workerExitCode ?? null,
    health: report.health?.current ?? null,
    resourceCounts: report.teardown?.inventory?.counts ?? report.inventory?.counts ?? null,
  });
}

function publicCompilerTerminal(report) {
  if (!report) return null;
  return freezePublic({
    graceful: report.graceful === true,
    restartRequired: report.restartRequired === true,
    cleanupClaim: report.cleanupClaim ?? null,
    workerExited: report.workerExited === true,
    workerExitCode: report.workerExitCode ?? null,
    resources: report.resources ?? null,
  });
}

function publicCloseFailure(error, operation) {
  const normalized = publicError(error, operation);
  return freezePublic({ graceful: false, restartRequired: true, cleanupClaim: 'unproved-close-failure', error: { code: normalized.code, category: normalized.category, operation: normalized.operation } });
}

function dataFor(runtime, operation, allowTerminal = false) {
  const data = runtimeData.get(runtime);
  if (!data) throw facadeError('CUDA_JS_RUNTIME_INVALID', 'validation', 'Runtime object is invalid.', {}, operation);
  if (!allowTerminal && data.state !== 'open') throw facadeError('CUDA_JS_RUNTIME_CLOSED', data.state === 'restart-required' ? 'restart-required' : 'closed-runtime', 'Runtime is not accepting operations.', { state: data.state }, operation);
  return data;
}

function resourceFor(resource, runtime, kind, operation) {
  const entry = resourceData.get(resource);
  if (!entry) throw facadeError('CUDA_JS_RESOURCE_INVALID', 'validation', 'Resource capability is invalid.', { kind }, operation);
  if (entry.runtime !== runtime) throw facadeError('CUDA_JS_RESOURCE_OWNER', 'validation', 'Resource capability belongs to another runtime.', { expectedKind: kind, actualKind: entry.kind }, operation);
  if (entry.kind !== kind) throw facadeError('CUDA_JS_RESOURCE_KIND', 'validation', 'Resource capability kind is invalid for this operation.', { expectedKind: kind, actualKind: entry.kind }, operation);
  if (entry.state !== 'open') throw facadeError('CUDA_JS_RESOURCE_CLOSED', entry.state === 'orphaned' ? 'restart-required' : 'stale-resource', 'Resource capability is terminal.', { kind, state: entry.state }, operation);
  dataFor(runtime, operation);
  return entry;
}

async function invoke(operation, callback) {
  try {
    return await callback();
  } catch (error) {
    throw publicError(error, operation);
  }
}

function registerResource(runtime, kind, token, publicFields, ResourceClass) {
  const data = dataFor(runtime, `${kind}.create`);
  const resource = new ResourceClass();
  resourceData.set(resource, { runtime, kind, token, state: 'open', closePromise: null, ...publicFields });
  data.resources.add(resource);
  return Object.freeze(resource);
}

async function closeResource(resource, operation, release) {
  const entry = resourceData.get(resource);
  if (!entry) throw facadeError('CUDA_JS_RESOURCE_INVALID', 'validation', 'Resource capability is invalid.', {}, operation);
  if (entry.state === 'closed' || entry.state === 'orphaned') return freezePublic({ schemaVersion: 1, kind: entry.kind, state: entry.state, alreadyTerminal: true });
  if (entry.closePromise) return entry.closePromise;
  resourceFor(resource, entry.runtime, entry.kind, operation);
  entry.closePromise = invoke(operation, async () => {
    const result = await release(entry);
    entry.state = 'closed';
    runtimeData.get(entry.runtime)?.resources.delete(resource);
    return freezePublic({ schemaVersion: 1, kind: entry.kind, state: 'closed', disposition: result.disposition ?? null });
  });
  try {
    return await entry.closePromise;
  } catch (error) {
    entry.closePromise = null;
    throw error;
  }
}

class CudaDeviceMemory {
  get kind() { return 'device-memory'; }
  get byteLength() { return resourceData.get(this)?.byteLength ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }

  async status() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.status');
    const result = await invoke('memory.status', () => runtimeData.get(entry.runtime).driver.memoryStatus(entry.token));
    return freezePublic({ schemaVersion: 1, kind: 'device-memory', state: entry.state, byteLength: result.byteLength, usage: result.usage });
  }

  async write(bytes, options = {}) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.write');
    const result = await invoke('memory.write', () => runtimeData.get(entry.runtime).driver.writeDevice(entry.token, bytes, options));
    return freezePublic({ schemaVersion: 1, deviceOffset: result.deviceOffset, byteLength: result.byteLength, usage: result.usage });
  }

  async read(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'device-memory', 'memory.read');
    const result = await invoke('memory.read', () => runtimeData.get(entry.runtime).driver.readDevice(entry.token, options));
    return freezePublic({ schemaVersion: 1, deviceOffset: result.deviceOffset, byteLength: result.byteLength, bytes: result.bytes, usage: result.usage });
  }

  async close() {
    return closeResource(this, 'memory.close', (entry) => runtimeData.get(entry.runtime).driver.releaseMemory(entry.token));
  }
}

class CudaModule {
  get kind() { return 'module'; }
  get format() { return resourceData.get(this)?.format ?? null; }
  get byteLength() { return resourceData.get(this)?.byteLength ?? null; }
  get sha256() { return resourceData.get(this)?.sha256 ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }

  async status() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'module', 'module.status');
    const result = await invoke('module.status', () => runtimeData.get(entry.runtime).driver.moduleStatus(entry.token));
    return freezePublic({ schemaVersion: 1, kind: 'module', state: entry.state, format: result.format, byteLength: result.byteLength, sha256: result.sha256 });
  }

  async getFunction(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'module', 'function.get');
    const result = await invoke('function.get', () => runtimeData.get(entry.runtime).driver.getFunction(entry.token, options));
    return registerResource(entry.runtime, 'function', result.function, { module: this, name: result.name, parameters: result.parameters }, CudaFunction);
  }

  async close() {
    return closeResource(this, 'module.close', (entry) => runtimeData.get(entry.runtime).driver.releaseModule(entry.token));
  }
}

class CudaFunction {
  get kind() { return 'function'; }
  get name() { return resourceData.get(this)?.name ?? null; }
  get parameters() { return resourceData.get(this)?.parameters ?? null; }
  get state() { return resourceData.get(this)?.state ?? 'invalid'; }

  async status() {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'function', 'function.status');
    const result = await invoke('function.status', () => runtimeData.get(entry.runtime).driver.functionStatus(entry.token));
    return freezePublic({ schemaVersion: 1, kind: 'function', state: entry.state, name: result.name, parameters: result.parameters });
  }

  async launch(options) {
    const entry = resourceFor(this, resourceData.get(this)?.runtime, 'function', 'function.launch');
    if (!plainObject(options) || !Array.isArray(options.arguments)) throw facadeError('CUDA_JS_LAUNCH_OPTIONS_INVALID', 'validation', 'Launch requires an arguments array.', {}, 'function.launch');
    if (options.arguments.length !== entry.parameters.length) throw facadeError('CUDA_JS_ARGUMENT_COUNT', 'validation', 'Launch argument count must match the function declaration.', { expected: entry.parameters.length, actual: options.arguments.length }, 'function.launch');
    const argumentsForActor = entry.parameters.map((parameter, index) => {
      const value = options.arguments[index];
      if (parameter.kind === 'u32') return { kind: 'u32', value };
      const memory = resourceFor(value, entry.runtime, 'device-memory', 'function.launch');
      return { kind: 'device-memory', memory: memory.token };
    });
    const request = { ...options, arguments: argumentsForActor };
    const result = await invoke('function.launch', () => runtimeData.get(entry.runtime).driver.launch(entry.token, request));
    return freezePublic({ schemaVersion: 1, status: result.status, grid: result.grid, block: result.block, sharedMemoryBytes: result.sharedMemoryBytes, argumentKinds: result.argumentKinds, pollCount: result.pollCount, elapsedMilliseconds: result.elapsedMilliseconds, operationSequence: result.operationSequence, health: result.health });
  }

  async close() {
    return closeResource(this, 'function.close', (entry) => runtimeData.get(entry.runtime).driver.releaseFunction(entry.token));
  }
}

class CudaRuntime {
  get state() { return runtimeData.get(this)?.state ?? 'invalid'; }
  get health() {
    const data = runtimeData.get(this);
    if (!data) return 'invalid';
    if (data.state !== 'open') return data.state === 'closed' ? 'closed' : 'restart-required';
    return data.driver.health === 'healthy' && (!data.compiler || data.compiler.health === 'healthy') ? 'healthy' : data.driver.health !== 'healthy' ? data.driver.health : data.compiler.health;
  }
  get compilerEnabled() { return runtimeData.get(this)?.compiler !== null; }
  get terminalReport() { return runtimeData.get(this)?.terminalReport ?? null; }

  async describe() {
    const data = dataFor(this, 'runtime.describe');
    const driver = await invoke('runtime.describe', () => data.driver.describe());
    const compiler = data.compiler ? await invoke('compiler.status', () => data.compiler.status()) : null;
    return freezePublic({
      schemaVersion: 1,
      package: { name: CUDA_JS_COMPATIBILITY.package.name, version: CUDA_JS_COMPATIBILITY.package.version, publicApiSchema: CUDA_JS_COMPATIBILITY.publicApi.schemaVersion },
      state: data.state,
      health: this.health,
      support: data.support,
      profile: driver.profile,
      driver: driver.driver,
      device: driver.device,
      memory: driver.memory,
      execution: driver.execution,
      compiler: publicCompilerStatus(compiler),
    });
  }

  async allocateDevice(options) {
    const data = dataFor(this, 'memory.allocate');
    const result = await invoke('memory.allocate', () => data.driver.allocateDevice(options));
    return registerResource(this, 'device-memory', result.memory, { byteLength: result.byteLength }, CudaDeviceMemory);
  }

  async loadModule(options) {
    const data = dataFor(this, 'module.load');
    const result = await invoke('module.load', () => data.driver.loadModule(options));
    return registerResource(this, 'module', result.module, { format: result.format, byteLength: result.byteLength, sha256: result.sha256 }, CudaModule);
  }

  async compile(request) {
    const data = dataFor(this, 'compiler.compile');
    if (!data.compiler) throw facadeError('CUDA_JS_COMPILER_DISABLED', 'unsupported', 'This runtime was opened without the optional compiler.', {}, 'compiler.compile');
    return freezePublic(await invoke('compiler.compile', () => data.compiler.compile(request)));
  }

  async link(request) {
    const data = dataFor(this, 'compiler.link');
    if (!data.compiler) throw facadeError('CUDA_JS_COMPILER_DISABLED', 'unsupported', 'This runtime was opened without the optional compiler.', {}, 'compiler.link');
    return freezePublic(await invoke('compiler.link', () => data.compiler.link(request)));
  }

  async invalidateCache(key) {
    const data = dataFor(this, 'compiler.cache.invalidate');
    if (!data.compiler) throw facadeError('CUDA_JS_COMPILER_DISABLED', 'unsupported', 'This runtime was opened without the optional compiler.', {}, 'compiler.cache.invalidate');
    return freezePublic(await invoke('compiler.cache.invalidate', () => data.compiler.invalidate(key)));
  }

  async close() {
    const data = dataFor(this, 'runtime.close', true);
    if (data.closePromise) return data.closePromise;
    if (data.state === 'closed' || data.state === 'restart-required') return data.terminalReport;
    data.state = 'closing';
    data.closePromise = (async () => {
      let compiler = null;
      let driver = null;
      if (data.compiler) {
        try { compiler = await data.compiler.close(); } catch (error) { compiler = publicCloseFailure(error, 'compiler.close'); }
      }
      try { driver = await data.driver.close(); } catch (error) { driver = publicCloseFailure(error, 'driver.close'); }
      const graceful = driver?.graceful === true && (!compiler || compiler.graceful === true);
      data.state = graceful ? 'closed' : 'restart-required';
      for (const resource of data.resources) {
        const entry = resourceData.get(resource);
        if (entry) entry.state = graceful ? 'closed' : 'orphaned';
      }
      data.resources.clear();
      data.terminalReport = freezePublic({ schemaVersion: 1, graceful, restartRequired: !graceful, state: data.state, compiler: compiler?.error ? compiler : publicCompilerTerminal(compiler), driver: driver?.error ? driver : publicDriverTerminal(driver) });
      return data.terminalReport;
    })();
    return data.closePromise;
  }
}

async function openWithAdapters(options, adapters, supportFactory) {
  const normalized = normalizeOptions(options);
  let driver;
  let compiler;
  try {
    driver = await invoke('driver.open', () => adapters.openDriver(normalized.driver));
    const description = await invoke('driver.describe', () => driver.describe());
    const support = supportFactory(description);
    if (!['accepted', 'testing-unconfirmed', 'mock-only'].includes(support.status)) throw facadeError('CUDA_JS_PROFILE_INCOMPATIBLE', 'unsupported', 'The selected Driver profile is known to be incompatible with this runtime.', { reason: support.reason ?? 'unknown' }, 'open');
    if (normalized.compiler) compiler = await invoke('compiler.open', () => adapters.openCompiler(normalized.compiler));
    const runtime = new CudaRuntime();
    runtimeData.set(runtime, { driver, compiler: compiler ?? null, support, resources: new Set(), state: 'open', closePromise: null, terminalReport: null });
    return Object.freeze(runtime);
  } catch (error) {
    let cleanupUnproved = false;
    if (compiler) {
      try {
        const compilerTerminal = await compiler.close();
        if (compilerTerminal?.graceful !== true) cleanupUnproved = true;
      } catch { cleanupUnproved = true; }
    }
    if (driver) {
      try {
        const driverTerminal = await driver.close();
        if (driverTerminal?.graceful !== true) cleanupUnproved = true;
      } catch { cleanupUnproved = true; }
    }
    if (cleanupUnproved) {
      const cause = publicError(error, 'open');
      throw facadeError('CUDA_JS_OPEN_CLEANUP_UNPROVED', 'restart-required', 'Runtime opening failed and acquired native ownership did not close terminally; restart the process.', { causeCode: cause.code }, 'open');
    }
    throw publicError(error, 'open');
  }
}

export function inspectCudaHost() {
  return freezePublic({ schemaVersion: 1, host: inspectHostProfile(), compatibility: CUDA_JS_COMPATIBILITY });
}

export async function openCudaRuntime(options = {}) {
  const host = inspectHostProfile();
  preflight(host);
  return openWithAdapters(options, { openDriver: openDriverRuntime, openCompiler: openCompilerRuntime }, (description) => assessCudaSupport(host, description));
}

export async function openCudaRuntimeWithAdapters(options, adapters, supportFactory) {
  return openWithAdapters(options, adapters, supportFactory);
}
