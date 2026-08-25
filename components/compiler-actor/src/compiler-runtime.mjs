import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

import { normalizeCompileRequest, normalizeLinkRequest, plainObject } from './contract.mjs';
import { compilerError, compilerFailureRecord, CompilerRuntimeError, deserializeError } from './errors.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DEFAULT_CACHE = path.join(root, 'build', 'cache', 'compiler-v1');
const OPTION_FIELDS = Object.freeze(['cacheDirectory', 'cacheMode']);
const TERMINAL_CLEANUP_FAILURE_LIMIT = 8;
const TERMINAL_HEALTH_RANK = Object.freeze({ healthy: 0, suspect: 1, poisoned: 2, 'restart-required': 3 });
export const COMPILER_RUNTIME_TEST = Symbol('cuda-js.compiler-runtime.test');

function isNativeBackend(backend) { return backend === 'windows-native' || backend === 'linux-native'; }
function backendPlatform(backend) {
  if (backend === 'windows-native') return 'win32';
  if (backend === 'linux-native') return 'linux';
  return process.platform;
}

function workerExecArgv() {
  return process.execArgv.filter((argument) => argument === '--experimental-ffi'
    || argument === '--permission'
    || argument === '--permission-audit'
    || argument === '--allow-ffi'
    || argument === '--allow-worker'
    || argument.startsWith('--allow-fs-read=')
    || argument.startsWith('--allow-fs-write='));
}

function terminalHealth(...values) {
  let strongest = 'healthy';
  for (const value of values) {
    if (typeof value === 'string' && Object.hasOwn(TERMINAL_HEALTH_RANK, value)
        && TERMINAL_HEALTH_RANK[value] > TERMINAL_HEALTH_RANK[strongest]) strongest = value;
  }
  return strongest;
}

function terminalCleanupRecords(error, fallbackRecord) {
  const records = Array.isArray(error?.details?.cleanupFailures) ? error.details.cleanupFailures : [];
  return records.length > 0 ? records : fallbackRecord ? [fallbackRecord] : [];
}

class CompilerRuntime {
  #backend;
  #testHooks;
  #cacheDirectory;
  #cacheMode;
  #worker;
  #state = 'opening';
  #health = 'healthy';
  #nextRequestId = 1;
  #pending = new Map();
  #readyPromise;
  #readyResolve;
  #readyReject;
  #exitPromise;
  #exitResolve;
  #terminalReport = null;
  #gracefulTerminal = null;
  #closeFailure = null;
  #materialFailure = null;
  #closePromise = null;

  constructor(options) {
    Object.assign(this, {});
    this.#backend = options.backend;
    this.#testHooks = options.testHooks;
    this.#cacheDirectory = options.cacheDirectory;
    this.#cacheMode = options.cacheMode;
    this.#readyPromise = new Promise((resolve, reject) => { this.#readyResolve = resolve; this.#readyReject = reject; });
    this.#exitPromise = new Promise((resolve) => { this.#exitResolve = resolve; });
  }

  static async open(options) {
    const runtime = new CompilerRuntime(options);
    await runtime.#start();
    return runtime;
  }

  get state() { return this.#state; }
  get health() { return this.#health; }
  get terminalReport() { return this.#terminalReport; }

  async status() { return this.#request('runtime.status', {}); }

  async compile(request) {
    const normalized = normalizeCompileRequest(request, backendPlatform(this.#backend));
    return this.#request('compiler.compile', {
      source: normalized.source,
      name: normalized.name,
      headers: normalized.headers.map(({ name, source }) => ({ name, source })),
      output: normalized.output,
      options: {
        architecture: normalized.options.architecture,
        languageStandard: normalized.options.languageStandard,
        fmad: normalized.options.fmad,
        deviceAsDefaultExecutionSpace: normalized.options.deviceAsDefaultExecutionSpace,
        headerProfile: normalized.options.headerProfile,
        ...(normalized.output === 'ptx' ? { relocatableDeviceCode: normalized.options.relocatableDeviceCode } : {}),
      },
    });
  }

  async link(request) {
    const normalized = normalizeLinkRequest(request);
    return this.#request('linker.link', {
      inputs: normalized.inputs.map((input) => input.format === 'lto-ir'
        ? {
            format: 'lto-ir',
            bytes: Uint8Array.from(input.bytes),
            byteLength: input.byteLength,
            sha256: input.sha256,
            architecture: input.architecture,
            producer: { profile: input.producer.profile, nvrtcVersion: input.producer.nvrtcVersion },
          }
        : {
            format: 'ptx',
            bytes: Uint8Array.from(input.bytes),
            ...(input.architecture ? { architecture: input.architecture } : {}),
            ...(input.relocatableDeviceCode ? { relocatableDeviceCode: true } : {}),
          }),
      options: { architecture: normalized.options.architecture },
    });
  }

  async invalidate(key) {
    if (typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key)) throw compilerError('COMPILER_CACHE_KEY_INVALID', 'Cache key must be lowercase SHA-256.');
    return this.#request('cache.invalidate', { key });
  }

  async close() {
    if (this.#closePromise) return this.#closePromise;
    if (this.#state === 'closed' || this.#state === 'restart-required') return this.#terminalReport;
    this.#state = 'closing';
    this.#closePromise = (async () => {
      try {
        const result = await this.#requestInternal('runtime.close', {}, true);
        await this.#exitPromise;
        if (result.graceful && this.#terminalReport?.workerExitCode === 0) {
          this.#state = 'closed';
          this.#health = 'closed';
          this.#terminalReport = Object.freeze({ ...result, workerExited: true, workerExitCode: 0 });
        }
      } catch (error) {
        this.#closeFailure ??= error;
        await this.#exitPromise;
      }
      return this.#terminalReport;
    })();
    return this.#closePromise;
  }

  async [COMPILER_RUNTIME_TEST](operation, payload = {}) {
    if (!this.#testHooks) throw compilerError('COMPILER_TEST_HOOKS_DISABLED', 'CompilerActor test hooks are disabled.');
    if (operation === 'terminate') {
      await this.#worker.terminate();
      await this.#exitPromise;
      return this.#terminalReport;
    }
    return this.#request(operation, payload);
  }

  async #start() {
    if (isNativeBackend(this.#backend) && !process.execArgv.includes('--experimental-ffi')) {
      throw new CompilerRuntimeError('COMPILER_FFI_FLAG_REQUIRED', 'unsupported', 'The native CompilerActor requires Node to be launched with experimental FFI enabled.');
    }
    if (isNativeBackend(this.#backend) && process.permission !== undefined && !process.execArgv.includes('--permission')) {
      throw new CompilerRuntimeError('COMPILER_PERMISSION_PROFILE_UNSUPPORTED', 'unsupported', 'The native CompilerActor requires permission flags to be explicit process arguments.');
    }
    this.#worker = new Worker(new URL('./actor-worker.mjs', import.meta.url), {
      workerData: { backend: this.#backend, testHooks: this.#testHooks, cacheDirectory: this.#cacheDirectory, cacheMode: this.#cacheMode },
      execArgv: workerExecArgv(),
    });
    this.#worker.on('message', (message) => this.#onMessage(message));
    this.#worker.on('error', (error) => { if (this.#state === 'opening') this.#readyReject(error); });
    this.#worker.on('exit', (code) => this.#onExit(code));
    await this.#readyPromise;
  }

  #onMessage(message) {
    if (message.kind === 'ready') {
      this.#state = 'open';
      this.#health = message.result.health.current;
      this.#readyResolve(this);
      return;
    }
    if (message.kind === 'startup-error') {
      this.#readyReject(deserializeError(message.error));
      return;
    }
    if (message.kind === 'fatal') {
      const error = deserializeError(message.error);
      for (const pending of this.#pending.values()) pending.reject(error);
      this.#pending.clear();
      return;
    }
    if (message.kind !== 'response' || !Number.isSafeInteger(message.requestId)) return;
    const pending = this.#pending.get(message.requestId);
    if (!pending) return;
    this.#pending.delete(message.requestId);
    if (message.ok) {
      if (message.result?.health?.current) this.#health = message.result.health.current;
      if (pending.operation === 'runtime.close') this.#gracefulTerminal = message.result;
      pending.resolve(message.result);
    } else {
      const error = deserializeError(message.error);
      if (error.healthAfter) this.#health = error.healthAfter;
      if (error.healthAfter === 'restart-required' || Array.isArray(error.details?.cleanupFailures)) this.#materialFailure ??= error;
      if (pending.operation === 'runtime.close') this.#closeFailure = error;
      pending.reject(error);
    }
  }

  #onExit(code) {
    this.#exitResolve(code);
    const graceful = this.#state === 'closing' && this.#gracefulTerminal?.graceful === true && code === 0;
    const firstMaterialError = this.#materialFailure;
    const firstMaterialFailure = firstMaterialError ? compilerFailureRecord(firstMaterialError, { operation: 'compiler.cleanup' }) : null;
    const closeFailure = this.#closeFailure ? compilerFailureRecord(this.#closeFailure, { operation: 'runtime.close' }) : null;
    const materialError = firstMaterialError ?? this.#closeFailure;
    const materialFailure = firstMaterialFailure ?? closeFailure;
    const allCleanupFailures = [
      ...terminalCleanupRecords(firstMaterialError, firstMaterialFailure),
      ...(this.#closeFailure === firstMaterialError ? [] : terminalCleanupRecords(this.#closeFailure, closeFailure)),
    ];
    const cleanupFailures = Object.freeze(allCleanupFailures.slice(0, TERMINAL_CLEANUP_FAILURE_LIMIT));
    const cleanupFailureCount = allCleanupFailures.length;
    const resultingHealth = terminalHealth(
      firstMaterialError?.details?.resultingHealth,
      this.#closeFailure?.details?.resultingHealth,
      materialFailure?.healthAfter,
      closeFailure?.healthAfter,
    );
    this.#terminalReport = Object.freeze({
      ...(this.#gracefulTerminal ?? this.#terminalReport ?? {}),
      graceful,
      cleanupClaim: graceful ? this.#gracefulTerminal.cleanupClaim : this.#gracefulTerminal?.cleanupClaim ?? (materialFailure ? 'unproved' : 'unproved-worker-loss'),
      workerExited: true,
      workerExitCode: code,
      restartRequired: !graceful,
      ...(materialFailure ? {
        materialFailure,
        ...(closeFailure ? { closeFailure } : {}),
        ...(materialError.details?.primaryFailure ? { primaryFailure: materialError.details.primaryFailure } : {}),
        cleanupFailures,
        cleanupFailureCount,
        cleanupFailuresTruncated: Math.max(0, cleanupFailureCount - cleanupFailures.length),
        resultingHealth,
        terminalInventory: firstMaterialError?.details?.terminalInventory
          ?? this.#closeFailure?.details?.terminalInventory
          ?? Object.freeze({ disposition: 'unproved' }),
      } : {}),
    });
    if (!graceful) {
      const before = this.#health;
      this.#state = 'restart-required';
      this.#health = 'restart-required';
      const error = new CompilerRuntimeError('COMPILER_RESTART_REQUIRED', 'restart-required', 'CompilerActor ownership was lost; a new runtime is required.', { workerExitCode: code }, { healthBefore: before, healthAfter: 'restart-required' });
      for (const pending of this.#pending.values()) pending.reject(error);
      this.#pending.clear();
      if (before === 'healthy') this.#readyReject(error);
    }
  }

  #request(operation, payload) { return this.#requestInternal(operation, payload, false); }
  #requestInternal(operation, payload, allowClosing) {
    if (this.#state !== 'open' && !(allowClosing && this.#state === 'closing')) return Promise.reject(new CompilerRuntimeError('COMPILER_RUNTIME_CLOSED', this.#state === 'restart-required' ? 'restart-required' : 'closed-runtime', 'CompilerRuntime is not accepting commands.', { state: this.#state }));
    if (!allowClosing && this.#pending.size >= 16) return Promise.reject(new CompilerRuntimeError('COMPILER_BACKPRESSURE', 'backpressure', 'CompilerActor command queue is full.', { maxPending: 16 }));
    const requestId = this.#nextRequestId++;
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { operation, resolve, reject });
      this.#worker.postMessage({ schemaVersion: 1, requestId, operation, payload });
    });
  }
}

function runtimeOptions(options, backend, testHooks) {
  if (!plainObject(options) || Object.keys(options).some((key) => !OPTION_FIELDS.includes(key))) throw compilerError('COMPILER_OPTIONS_INVALID', 'Compiler runtime options contain unknown fields.');
  const cacheMode = options.cacheMode ?? 'read-write';
  if (!['read-write', 'read-only', 'disabled'].includes(cacheMode)) throw compilerError('COMPILER_CACHE_MODE_INVALID', 'cacheMode must be read-write, read-only, or disabled.');
  const cacheDirectory = path.resolve(options.cacheDirectory ?? DEFAULT_CACHE);
  if (Object.hasOwn(options, 'cacheDirectory') && (!path.isAbsolute(options.cacheDirectory) || path.normalize(options.cacheDirectory) !== options.cacheDirectory)) throw compilerError('COMPILER_CACHE_DIRECTORY_INVALID', 'cacheDirectory must be a normalized absolute path.');
  return { backend, testHooks, cacheDirectory, cacheMode };
}

export function selectNativeBackend(platform = process.platform, architecture = process.arch) {
  if (platform === 'win32' && architecture === 'x64') return 'windows-native';
  if (platform === 'linux' && architecture === 'x64') return 'linux-native';
  throw new CompilerRuntimeError('COMPILER_PROFILE_UNSUPPORTED', 'unsupported', 'The native CompilerActor requires Windows x64 or native Linux x86-64.', { platform, architecture });
}

export async function openCompilerRuntime(options = {}) { return CompilerRuntime.open(runtimeOptions(options, selectNativeBackend(), false)); }
export async function openCompilerRuntimeForTesting(options = {}) { return CompilerRuntime.open(runtimeOptions(options, 'mock', true)); }
