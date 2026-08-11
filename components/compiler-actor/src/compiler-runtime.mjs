import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';

import { normalizeCompileRequest, normalizeLinkRequest, plainObject } from './contract.mjs';
import { compilerError, CompilerRuntimeError, deserializeError } from './errors.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DEFAULT_CACHE = path.join(root, 'build', 'cache', 'compiler-v1');
const OPTION_FIELDS = Object.freeze(['cacheDirectory', 'cacheMode']);
export const COMPILER_RUNTIME_TEST = Symbol('cuda-js.compiler-runtime.test');

function workerExecArgv() {
  return process.execArgv.filter((argument) => argument === '--experimental-ffi'
    || argument === '--permission'
    || argument === '--permission-audit'
    || argument === '--allow-ffi'
    || argument === '--allow-worker'
    || argument.startsWith('--allow-fs-read=')
    || argument.startsWith('--allow-fs-write='));
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
    const normalized = normalizeCompileRequest(request, this.#backend === 'windows-native' ? 'win32' : process.platform);
    return this.#request('compiler.compile', {
      source: normalized.source,
      name: normalized.name,
      headers: normalized.headers.map(({ name, source }) => ({ name, source })),
      options: {
        architecture: normalized.options.architecture,
        languageStandard: normalized.options.languageStandard,
        fmad: normalized.options.fmad,
        deviceAsDefaultExecutionSpace: normalized.options.deviceAsDefaultExecutionSpace,
        headerProfile: normalized.options.headerProfile,
      },
    });
  }

  async link(request) {
    const normalized = normalizeLinkRequest(request);
    return this.#request('linker.link', {
      inputs: normalized.inputs.map(({ bytes }) => Uint8Array.from(bytes)),
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
      } catch {
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
    if (this.#backend === 'windows-native' && !process.execArgv.includes('--experimental-ffi')) {
      throw new CompilerRuntimeError('COMPILER_FFI_FLAG_REQUIRED', 'unsupported', 'The native CompilerActor requires Node to be launched with experimental FFI enabled.');
    }
    if (this.#backend === 'windows-native' && process.permission !== undefined && !process.execArgv.includes('--permission')) {
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
      pending.reject(error);
    }
  }

  #onExit(code) {
    this.#exitResolve(code);
    const graceful = this.#state === 'closing' && this.#gracefulTerminal?.graceful === true && code === 0;
    this.#terminalReport = Object.freeze({
      ...(this.#gracefulTerminal ?? this.#terminalReport ?? {}),
      graceful,
      cleanupClaim: graceful ? this.#gracefulTerminal.cleanupClaim : this.#gracefulTerminal?.cleanupClaim ?? 'unproved-worker-loss',
      workerExited: true,
      workerExitCode: code,
      restartRequired: !graceful,
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

export async function openCompilerRuntime(options = {}) { return CompilerRuntime.open(runtimeOptions(options, 'windows-native', false)); }
export async function openCompilerRuntimeForTesting(options = {}) { return CompilerRuntime.open(runtimeOptions(options, 'mock', true)); }
