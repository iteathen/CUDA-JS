import { Worker } from 'node:worker_threads';

export class DetachedOperationError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'DetachedOperationError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) {
  throw new DetachedOperationError(code, message, details);
}

export class DetachedMockOperation {
  #mailbox;
  #lease;
  #worker;
  #state = 'pending';
  #terminal = null;
  #terminalPromise;
  #resolve;
  #reject;
  #readyPromise;
  #readyResolve;
  #readyReject;
  #ready = false;
  #released = false;

  constructor({ mailbox, multiplierLane, observationLane, stopLane }) {
    this.#mailbox = mailbox;
    this.#lease = mailbox.acquire();
    this.#terminalPromise = new Promise((resolve, reject) => { this.#resolve = resolve; this.#reject = reject; });
    this.#readyPromise = new Promise((resolve, reject) => { this.#readyResolve = resolve; this.#readyReject = reject; });
    this.#worker = new Worker(new URL('./mock-device-worker.mjs', import.meta.url), {
      workerData: {
        buffer: this.#lease.buffer,
        multiplierLane,
        observationLane,
        stopLane,
        generation: this.#lease.generation,
      },
    });
    this.#worker.on('message', (message) => {
      if (message?.kind === 'ready' && this.#state === 'pending' && !this.#ready) {
        this.#ready = true;
        this.#readyResolve(Object.freeze({ ready: true, generation: this.#lease.generation }));
        return;
      }
      if (message?.kind !== 'complete' || this.#state !== 'pending') return;
      this.#state = 'completed';
      this.#terminal = Object.freeze({ status: 'completed', ticks: message.ticks, observation: message.observation, generation: this.#lease.generation });
      if (!this.#ready) {
        this.#ready = true;
        this.#readyResolve(Object.freeze({ ready: true, generation: this.#lease.generation }));
      }
      this.#release();
      this.#resolve(this.#terminal);
    });
    this.#worker.on('error', (error) => {
      if (this.#state !== 'pending') return;
      this.#state = 'failed';
      this.#terminal = Object.freeze({ status: 'failed', generation: this.#lease.generation, message: error.message });
      this.#release();
      const failure = new DetachedOperationError('OPERATION_FAILED', 'Mock device operation failed.', { message: error.message });
      if (!this.#ready) this.#readyReject(failure);
      this.#reject(failure);
    });
    this.#worker.on('exit', (code) => {
      if (this.#state !== 'pending') return;
      this.#state = 'failed';
      this.#terminal = Object.freeze({ status: 'failed', generation: this.#lease.generation, workerExitCode: code });
      this.#release();
      const failure = new DetachedOperationError('OPERATION_WORKER_LOST', 'Mock device Worker exited before terminal publication.', { code });
      if (!this.#ready) this.#readyReject(failure);
      this.#reject(failure);
    });
  }

  get state() { return this.#state; }
  get generation() { return this.#lease.generation; }

  ready() {
    return this.#readyPromise;
  }

  status() {
    return Object.freeze({ state: this.#state, generation: this.#lease.generation, terminal: this.#terminal });
  }

  async wait() {
    if (this.#state === 'completed') return this.#terminal;
    if (this.#state === 'failed') fail('OPERATION_FAILED', 'Operation is already failed.');
    return this.#terminalPromise;
  }

  close() {
    if (this.#state === 'pending') fail('OPERATION_BUSY', 'Pending operation cannot be closed or represented as cancelled.');
    return Object.freeze({ state: 'closed', terminal: this.#terminal });
  }

  async terminateForTest() {
    if (this.#state !== 'pending') return this.#terminal;
    await this.#worker.terminate();
    return this.#terminalPromise.catch(() => this.#terminal);
  }

  #release() {
    if (this.#released) return;
    this.#released = true;
    this.#lease.release();
  }
}
