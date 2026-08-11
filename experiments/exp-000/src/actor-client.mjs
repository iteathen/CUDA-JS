import { Worker } from 'node:worker_threads';

import { nativeLibraryPath, runtimeIrPath } from './paths.mjs';

export class SyntheticFfiActor {
  #worker;
  #pending = new Map();
  #nextId = 1;
  #state = 'starting';
  #ready;
  #resolveReady;
  #rejectReady;
  #exit;
  #resolveExit;
  #readyRecord;

  constructor() {
    this.#ready = new Promise((resolve, reject) => {
      this.#resolveReady = resolve;
      this.#rejectReady = reject;
    });
    this.#exit = new Promise((resolve) => { this.#resolveExit = resolve; });
    this.#worker = new Worker(new URL('./ffi-worker.mjs', import.meta.url), {
      workerData: { nativeLibraryPath, runtimeIrPath },
      execArgv: ['--experimental-ffi'],
    });
    this.#worker.on('message', (message) => this.#onMessage(message));
    this.#worker.on('error', (error) => this.#fail(error));
    this.#worker.on('exit', (code) => this.#onExit(code));
  }

  static async create() {
    const actor = new SyntheticFfiActor();
    await actor.ready();
    return actor;
  }

  get state() { return this.#state; }

  async ready() {
    await this.#ready;
    return this.#readyRecord;
  }

  #onMessage(message) {
    if (message.type === 'ready') {
      this.#state = 'open';
      this.#readyRecord = message;
      this.#resolveReady(message);
      return;
    }
    if (message.type !== 'response') return;
    const pending = this.#pending.get(message.id);
    if (!pending) return;
    this.#pending.delete(message.id);
    if (message.ok) {
      pending.resolve(message.result);
    } else {
      const error = new Error(message.error.message);
      error.name = message.error.name;
      error.code = message.error.code;
      pending.reject(error);
    }
  }

  #fail(error) {
    if (this.#state === 'starting') this.#rejectReady(error);
    for (const pending of this.#pending.values()) pending.reject(error);
    this.#pending.clear();
  }

  #onExit(code) {
    const wasClosing = this.#state === 'closing';
    this.#state = code === 0 && wasClosing ? 'closed' : 'dead';
    const error = new Error(`Synthetic FFI Worker exited with code ${code}.`);
    error.code = this.#state === 'dead' ? 'CJS_RESTART_REQUIRED' : 'CJS_RUNTIME_CLOSED';
    if (this.#readyRecord === undefined) this.#rejectReady(error);
    for (const pending of this.#pending.values()) pending.reject(error);
    this.#pending.clear();
    this.#resolveExit({ code, state: this.#state });
  }

  async request(command, payload = {}) {
    await this.ready();
    if (this.#state !== 'open' && !(this.#state === 'closing' && command === 'shutdown')) {
      const error = new Error(`Runtime does not accept ${command} while ${this.#state}.`);
      error.code = this.#state === 'dead' ? 'CJS_RESTART_REQUIRED' : 'CJS_RUNTIME_CLOSED';
      throw error;
    }
    const id = this.#nextId++;
    const response = new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
    this.#worker.postMessage({ id, command, payload });
    return response;
  }

  execute(caseId, payload = {}) { return this.request('execute', { ...payload, caseId }); }
  inventory() { return this.request('inventory'); }
  allocate(size) { return this.request('allocate', { size }); }
  copyAllocation(token) { return this.request('copy-allocation', { token }); }
  release(token) { return this.request('release', { token }); }

  async close() {
    if (this.#state === 'closed') return { alreadyClosed: true };
    if (this.#state === 'dead') return { alreadyDead: true, restartRequired: true };
    await this.ready();
    this.#state = 'closing';
    const cleanup = await this.request('shutdown');
    const exit = await this.#exit;
    return { cleanup, exit };
  }

  async terminateUnexpectedly() {
    await this.ready();
    const inventory = await this.inventory();
    const code = await this.#worker.terminate();
    const exit = await this.#exit;
    return { inventory, code, exit, restartRequired: true };
  }
}
