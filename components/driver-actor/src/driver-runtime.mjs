import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';

import { normalizeMemoryPolicy } from '../../memory/index.mjs';
import { isResourceToken } from '../../resource-registry/index.mjs';
import { deserializeError, DriverRuntimeError, validationError } from './errors.mjs';
import { requestRecord } from './protocol.mjs';

export const DRIVER_RUNTIME_TEST = Symbol('cuda-js.driver-runtime.test');
const PUBLIC_OPTION_FIELDS = Object.freeze(['maxPending', 'memory']);

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactOptionFields(options) {
  return Object.keys(options).every((key) => PUBLIC_OPTION_FIELDS.includes(key));
}

function freezeRecord(value) {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Uint8Array) return value;
  for (const item of Array.isArray(value) ? value : Object.values(value)) freezeRecord(item);
  return Object.freeze(value);
}

function orphanInventory(lastInventory) {
  if (!lastInventory) return null;
  const resources = lastInventory.resources.map((resource) => ({
    ...resource,
    state: ['live', 'closing'].includes(resource.state) ? 'orphaned' : resource.state,
  }));
  const counts = { live: 0, closing: 0, closed: 0, orphaned: 0 };
  for (const resource of resources) counts[resource.state] += 1;
  return freezeRecord({ ...lastInventory, dead: true, counts, resources, reason: 'worker-lost' });
}

class DriverRuntime {
  #backend;
  #testHooks;
  #maxPending;
  #memoryPolicy;
  #runtimeId = randomUUID();
  #epoch = 1;
  #worker;
  #state = 'opening';
  #health = 'healthy';
  #nextRequestId = 1;
  #pending = new Map();
  #readyResolve;
  #readyReject;
  #readyPromise;
  #exitResolve;
  #exitPromise;
  #exitCode = null;
  #lastInventory = null;
  #lastMemory = null;
  #description = null;
  #closePromise = null;
  #gracefulTerminal = null;
  #terminalReport = null;

  constructor({ backend, testHooks, maxPending, memoryPolicy }) {
    this.#backend = backend;
    this.#testHooks = testHooks;
    this.#maxPending = maxPending;
    this.#memoryPolicy = memoryPolicy;
    this.#readyPromise = new Promise((resolve, reject) => { this.#readyResolve = resolve; this.#readyReject = reject; });
    this.#exitPromise = new Promise((resolve) => { this.#exitResolve = resolve; });
  }

  static async open(options) {
    const runtime = new DriverRuntime(options);
    await runtime.#start();
    return runtime;
  }

  get state() { return this.#state; }
  get health() { return this.#health; }
  get terminalReport() { return this.#terminalReport; }

  async describe() {
    return this.#request('runtime.describe', {});
  }

  async contextStatus(token = this.#description?.context) {
    if (!isResourceToken(token)) throw validationError('DRIVER_CONTEXT_TOKEN', 'contextStatus requires the exact opaque context token.');
    return this.#request('context.status', { token });
  }

  async allocateDevice(options = {}) {
    if (!plainObject(options) || Object.keys(options).length !== 1 || !Object.hasOwn(options, 'byteLength')) {
      throw validationError('DRIVER_MEMORY_OPTIONS', 'allocateDevice requires exactly one byteLength field.');
    }
    return this.#request('memory.allocate', { byteLength: options.byteLength });
  }

  async memoryStatus(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'memoryStatus requires an exact opaque memory token.');
    return this.#request('memory.status', { token });
  }

  async writeDevice(token, bytes, options = {}) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'writeDevice requires an exact opaque memory token.');
    if (!(bytes instanceof Uint8Array) || Buffer.isBuffer(bytes)) throw validationError('MEMORY_BYTES_INVALID', 'writeDevice requires an ordinary Uint8Array.');
    if (!plainObject(options) || Object.keys(options).some((key) => key !== 'deviceOffset')) throw validationError('DRIVER_MEMORY_OPTIONS', 'writeDevice options contain unknown fields.');
    if (bytes.byteLength > this.#memoryPolicy.maxTransferBytes) throw validationError('MEMORY_TRANSFER_LIMIT', 'writeDevice bytes exceed the configured transfer limit.');
    const snapshot = Uint8Array.from(bytes);
    return this.#request('memory.write', { token, bytes: snapshot, deviceOffset: options.deviceOffset ?? 0 });
  }

  async readDevice(token, options) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'readDevice requires an exact opaque memory token.');
    if (!plainObject(options) || Object.keys(options).some((key) => !['deviceOffset', 'byteLength'].includes(key))) throw validationError('DRIVER_MEMORY_OPTIONS', 'readDevice options are invalid.');
    return this.#request('memory.read', { token, deviceOffset: options.deviceOffset ?? 0, byteLength: options.byteLength });
  }

  async releaseMemory(token) {
    if (!isResourceToken(token)) throw validationError('DRIVER_MEMORY_TOKEN', 'releaseMemory requires an exact opaque memory token.');
    return this.#request('memory.release', { token });
  }

  async close() {
    if (this.#closePromise) return this.#closePromise;
    if (this.#state === 'restart-required') return this.#terminalReport;
    if (this.#state === 'closed') return this.#terminalReport;
    this.#state = 'closing';
    this.#closePromise = (async () => {
      try {
        const terminal = await this.#requestInternal('runtime.close', {}, { allowClosing: true });
        this.#gracefulTerminal = terminal;
        await this.#exitPromise;
        if (terminal.graceful === true && this.#exitCode === 0) {
          this.#state = 'closed';
          this.#health = 'closed';
          this.#terminalReport = freezeRecord({ ...terminal, workerExitCode: this.#exitCode, workerExited: true });
        } else {
          this.#setRestartRequired(this.#exitCode, 'graceful-close-unproved');
        }
        return this.#terminalReport;
      } catch (error) {
        await this.#exitPromise;
        this.#setRestartRequired(this.#exitCode, 'close-command-failed');
        return this.#terminalReport ?? Promise.reject(error);
      }
    })();
    return this.#closePromise;
  }

  async [DRIVER_RUNTIME_TEST](operation, payload = {}) {
    if (!this.#testHooks) throw validationError('DRIVER_TEST_HOOKS_DISABLED', 'DriverRuntime test hooks are disabled.');
    if (operation === 'terminate') {
      if (this.#state !== 'open') throw new DriverRuntimeError('DRIVER_RUNTIME_CLOSED', 'closed-runtime', 'Runtime is not open.', { state: this.#state });
      await this.#worker.terminate();
      await this.#exitPromise;
      return this.#terminalReport;
    }
    return this.#request(operation, payload);
  }

  async #start() {
    const execArgv = this.#backend === 'windows-native' ? ['--experimental-ffi'] : [];
    this.#worker = new Worker(new URL('./actor-worker.mjs', import.meta.url), {
      workerData: { backend: this.#backend, testHooks: this.#testHooks, runtimeId: this.#runtimeId, epoch: this.#epoch, memoryPolicy: this.#memoryPolicy },
      execArgv,
    });
    this.#worker.on('message', (message) => this.#onMessage(message));
    this.#worker.on('error', (error) => {
      if (this.#state === 'opening') this.#readyReject(error);
    });
    this.#worker.on('exit', (code) => this.#onExit(code));
    await this.#readyPromise;
  }

  #onMessage(message) {
    if (!plainObject(message) || typeof message.kind !== 'string') {
      this.#setRestartRequired(null, 'invalid-worker-message');
      void this.#worker.terminate();
      return;
    }
    if (message.kind === 'ready') {
      if (this.#state !== 'opening') return;
      this.#description = freezeRecord(message.result);
      this.#updateStateFromRecord(this.#description);
      this.#state = 'open';
      this.#readyResolve(this);
      return;
    }
    if (message.kind === 'startup-error') {
      const error = deserializeError(message.error);
      this.#readyReject(error);
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
    if (message.ok === true) {
      if (message.state) this.#updateStateFromRecord(message.state);
      const result = freezeRecord(message.result);
      this.#updateStateFromRecord(result);
      if (pending.operation === 'runtime.close') this.#gracefulTerminal = result;
      pending.resolve(result);
    } else {
      const error = deserializeError(message.error);
      if (error.healthAfter) this.#health = error.healthAfter;
      pending.reject(error);
    }
  }

  #onExit(code) {
    this.#exitCode = code;
    this.#exitResolve(code);
    if (this.#state === 'opening') {
      this.#readyReject(new DriverRuntimeError('DRIVER_WORKER_STARTUP_EXIT', 'restart-required', 'DriverActor exited before startup completed.', { workerExitCode: code }));
    }
    const graceful = this.#gracefulTerminal?.graceful === true && code === 0;
    if (!graceful && this.#state !== 'closed') this.#setRestartRequired(code, 'unexpected-worker-exit');
    if (!graceful) {
      const error = new DriverRuntimeError('DRIVER_RESTART_REQUIRED', 'restart-required', 'DriverActor ownership was lost; process restart is required.', { workerExitCode: code }, { healthBefore: this.#health, healthAfter: 'restart-required' });
      for (const pending of this.#pending.values()) pending.reject(error);
      this.#pending.clear();
    }
  }

  #setRestartRequired(workerExitCode, reason) {
    if (this.#state === 'closed') return;
    const before = this.#health;
    this.#state = 'restart-required';
    this.#health = 'restart-required';
    this.#terminalReport = freezeRecord({
      schemaVersion: 1,
      graceful: false,
      cleanupClaim: 'unproved-worker-loss',
      restartRequired: true,
      reason,
      health: { current: 'restart-required', history: [{ before, after: 'restart-required', reason, operationId: null }] },
      inventory: orphanInventory(this.#lastInventory),
      memory: this.#lastMemory ? freezeRecord({ ...this.#lastMemory, state: 'orphaned', reason: 'worker-lost' }) : null,
      workerExitCode,
      workerExited: workerExitCode !== null,
    });
  }

  #updateStateFromRecord(record) {
    if (record?.health?.current) this.#health = record.health.current;
    if (record?.inventory) this.#lastInventory = record.inventory;
    if (record?.teardown?.inventory) this.#lastInventory = record.teardown.inventory;
    if (record?.memory?.policy) this.#lastMemory = record.memory;
    if (record?.usage?.policy) this.#lastMemory = record.usage;
  }

  #request(operation, payload) {
    return this.#requestInternal(operation, payload, { allowClosing: false });
  }

  #requestInternal(operation, payload, { allowClosing }) {
    if (this.#state !== 'open' && !(allowClosing && this.#state === 'closing')) {
      return Promise.reject(new DriverRuntimeError('DRIVER_RUNTIME_CLOSED', this.#state === 'restart-required' ? 'restart-required' : 'closed-runtime', 'Runtime is not accepting commands.', { state: this.#state }));
    }
    if (!allowClosing && this.#pending.size >= this.#maxPending) {
      return Promise.reject(new DriverRuntimeError('DRIVER_BACKPRESSURE', 'backpressure', 'DriverActor command queue is full.', { maxPending: this.#maxPending }));
    }
    const requestId = this.#nextRequestId++;
    const request = requestRecord(requestId, operation, payload);
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject, operation });
      this.#worker.postMessage(request);
    });
  }
}

function validateMaxPending(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 1_024) {
    throw validationError('DRIVER_MAX_PENDING', 'maxPending must be an integer from 1 through 1024.', { maxPending: value });
  }
  return value;
}

export async function openDriverRuntime(options = {}) {
  if (!plainObject(options) || !exactOptionFields(options)) throw validationError('DRIVER_OPTIONS_INVALID', 'Driver runtime options contain unknown fields.');
  return DriverRuntime.open({ backend: 'windows-native', testHooks: false, maxPending: validateMaxPending(options.maxPending ?? 64), memoryPolicy: normalizeMemoryPolicy(options.memory ?? {}) });
}

export async function openDriverRuntimeForTesting(options = {}) {
  if (!plainObject(options) || !exactOptionFields(options)) throw validationError('DRIVER_OPTIONS_INVALID', 'Driver runtime options contain unknown fields.');
  return DriverRuntime.open({ backend: 'mock', testHooks: true, maxPending: validateMaxPending(options.maxPending ?? 64), memoryPolicy: normalizeMemoryPolicy(options.memory ?? {}) });
}
