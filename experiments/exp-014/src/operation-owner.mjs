import { Worker } from 'node:worker_threads';
import { setTimeout as delay } from 'node:timers/promises';

export class ExperimentError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ExperimentError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) {
  throw new ExperimentError(code, message, details);
}

class LeaseLedger {
  #functions = new Map();
  #memory = new Map();
  #values = new Map();

  ensureFunction(id) {
    if (!this.#functions.has(id)) this.#functions.set(id, 0);
  }

  ensureMemory(id, value = 0) {
    if (!this.#memory.has(id)) this.#memory.set(id, 0);
    if (!this.#values.has(id)) this.#values.set(id, value);
  }

  acquireFunction(id) {
    this.ensureFunction(id);
    this.#functions.set(id, this.#functions.get(id) + 1);
    return this.#releaseOnce(this.#functions, id, 'FUNCTION_LEASE_RELEASED');
  }

  acquireMemory(id) {
    this.ensureMemory(id);
    this.#memory.set(id, this.#memory.get(id) + 1);
    return this.#releaseOnce(this.#memory, id, 'MEMORY_LEASE_RELEASED');
  }

  functionLeases(id) { return this.#functions.get(id) ?? 0; }
  memoryLeases(id) { return this.#memory.get(id) ?? 0; }

  readMemory(id) {
    this.ensureMemory(id);
    if (this.memoryLeases(id) !== 0) fail('MEMORY_EXECUTION_BUSY', 'Host read conflicts with an execution-leased allocation.', { id, leases: this.memoryLeases(id) });
    return this.#values.get(id);
  }

  writeMemory(id, value) {
    this.ensureMemory(id);
    if (this.memoryLeases(id) !== 0) fail('MEMORY_EXECUTION_BUSY', 'Host write conflicts with an execution-leased allocation.', { id, leases: this.memoryLeases(id) });
    this.#values.set(id, value);
    return value;
  }

  snapshot(functionId, memoryIds) {
    return Object.freeze({
      functionLeases: this.functionLeases(functionId),
      memoryLeases: Object.freeze(memoryIds.map((id) => Object.freeze({ id, leases: this.memoryLeases(id) }))),
    });
  }

  #releaseOnce(map, id, code) {
    let released = false;
    return () => {
      if (released) fail(code, 'Lease release attempted more than once.', { id });
      released = true;
      const next = (map.get(id) ?? 0) - 1;
      if (next < 0) fail('LEASE_UNDERFLOW', 'Lease count underflow.', { id });
      map.set(id, next);
    };
  }
}

class OperationHandle {
  #owner;
  #id;

  constructor(owner, id) {
    this.#owner = owner;
    this.#id = id;
    Object.freeze(this);
  }

  get id() { return this.#id; }

  status() { return this.#owner.status(this.#id); }

  async wait({ pollMilliseconds = 2 } = {}) {
    for (;;) {
      const status = await this.status();
      if (status.status !== 'pending') return status;
      await delay(pollMilliseconds);
    }
  }

  close() { return this.#owner.closeOperation(this.#id); }

  readyForTest() { return this.#owner.readyForTest(this.#id); }
}

export class SerializedOperationOwner {
  #queue = Promise.resolve();
  #ledger = new LeaseLedger();
  #operations = new Map();
  #pendingId = null;
  #nextId = 1;
  #state = 'open';
  #cleanupCount = 0;
  #commandCount = 0;

  get state() { return this.#state; }
  get cleanupCount() { return this.#cleanupCount; }
  get commandCount() { return this.#commandCount; }

  defineMemory(id, value = 0) {
    this.#ledger.ensureMemory(id, value);
  }

  async submit({ functionId = 'kernel', memoryIds = [], durationTicks = 12, failAtTick = null, intervalMilliseconds = 3 } = {}) {
    return this.#enqueue('submit', async () => {
      this.#requireOpen();
      if (this.#pendingId !== null) fail('EXECUTION_BUSY', 'Exactly one mock GPU operation may be pending.');
      if (!Number.isSafeInteger(durationTicks) || durationTicks < 1) fail('DURATION_INVALID', 'durationTicks must be positive.');
      if (failAtTick !== null && (!Number.isSafeInteger(failAtTick) || failAtTick < 1)) fail('FAIL_TICK_INVALID', 'failAtTick must be null or positive.');
      if (!Number.isSafeInteger(intervalMilliseconds) || intervalMilliseconds < 1) fail('INTERVAL_INVALID', 'intervalMilliseconds must be positive.');

      const functionRelease = this.#ledger.acquireFunction(functionId);
      const memoryReleases = [];
      try {
        for (const id of memoryIds) memoryReleases.push(this.#ledger.acquireMemory(id));
        const buffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2);
        const words = new Int32Array(buffer);
        const id = this.#nextId++;
        let readyResolve;
        let readyReject;
        const readyPromise = new Promise((resolve, reject) => {
          readyResolve = resolve;
          readyReject = reject;
        });
        const worker = new Worker(new URL('./mock-device-worker.mjs', import.meta.url), {
          workerData: { buffer, durationTicks, failAtTick, intervalMilliseconds },
        });
        const operation = {
          id,
          functionId,
          memoryIds: [...memoryIds],
          functionRelease,
          memoryReleases,
          buffer,
          words,
          worker,
          workerLost: false,
          ready: false,
          readyPromise,
          readyResolve,
          readyReject,
          state: 'pending',
          eventActive: true,
          terminal: null,
          logicalClosed: false,
          terminalized: false,
        };
        worker.on('message', (message) => {
          if (message?.kind === 'ready' && !operation.ready) {
            operation.ready = true;
            operation.readyResolve();
          }
        });
        worker.on('exit', (code) => {
          if (!operation.ready) operation.readyReject(new Error(`mock device exited before readiness: ${code}`));
          if (operation.state === 'pending' && Atomics.load(words, 0) === 0) {
            operation.workerLost = true;
            operation.workerExitCode = code;
          }
        });
        worker.on('error', (error) => {
          if (!operation.ready) operation.readyReject(error);
          if (operation.state === 'pending' && Atomics.load(words, 0) === 0) operation.workerLost = true;
        });
        this.#operations.set(id, operation);
        this.#pendingId = id;
        return new OperationHandle(this, id);
      } catch (error) {
        for (let index = memoryReleases.length - 1; index >= 0; index -= 1) memoryReleases[index]();
        functionRelease();
        throw error;
      }
    });
  }

  readyForTest(id) {
    return this.#operation(id).readyPromise;
  }

  status(id) {
    return this.#enqueue('status', async () => {
      const operation = this.#operation(id);
      if (operation.logicalClosed) fail('OPERATION_CLOSED', 'Logical operation is closed.', { id });
      return this.#observe(operation);
    }, { allowRestartRequired: true });
  }

  closeOperation(id) {
    return this.#enqueue('operation-close', async () => {
      const operation = this.#operation(id);
      if (operation.logicalClosed) return Object.freeze({ status: 'closed', alreadyClosed: true, id });
      if (operation.state === 'pending') fail('OPERATION_BUSY', 'Pending operation cannot be closed or represented as cancelled.', { id });
      if (operation.state === 'orphaned') fail('OPERATION_ORPHANED', 'Orphaned operation cannot claim logical cleanup.', { id });
      operation.logicalClosed = true;
      return Object.freeze({ status: 'closed', alreadyClosed: false, id });
    }, { allowRestartRequired: true });
  }

  memoryRead(id) {
    return this.#enqueue('memory-read', async () => {
      this.#requireOpen();
      return this.#ledger.readMemory(id);
    });
  }

  memoryWrite(id, value) {
    return this.#enqueue('memory-write', async () => {
      this.#requireOpen();
      return this.#ledger.writeMemory(id, value);
    });
  }

  leaseSnapshot(functionId, memoryIds) {
    return this.#ledger.snapshot(functionId, memoryIds);
  }

  async closeRuntime({ maxWaitMilliseconds = 250, pollMilliseconds = 2 } = {}) {
    return this.#enqueue('runtime-close', async () => {
      if (this.#state === 'closed' || this.#state === 'restart-required') return this.#runtimeRecord();
      this.#state = 'closing';
      const started = Date.now();
      if (this.#pendingId !== null) {
        const operation = this.#operation(this.#pendingId);
        for (;;) {
          const status = await this.#observe(operation);
          if (status.status !== 'pending') break;
          if (Date.now() - started >= maxWaitMilliseconds) {
            await this.#orphan(operation, 'close-timeout');
            return this.#runtimeRecord();
          }
          await delay(pollMilliseconds);
        }
      }
      this.#state = 'closed';
      for (const operation of this.#operations.values()) {
        if (operation.state !== 'orphaned') operation.logicalClosed = true;
      }
      return this.#runtimeRecord();
    }, { allowClosing: true, allowRestartRequired: true });
  }

  async legacyTimeout(id) {
    return this.#enqueue('legacy-timeout', async () => {
      const operation = this.#operation(id);
      if (operation.state !== 'pending') return this.#publicStatus(operation);
      await this.#orphan(operation, 'legacy-completion-timeout');
      return this.#publicStatus(operation);
    }, { allowRestartRequired: true });
  }

  async terminateDeviceForTest(id) {
    const operation = this.#operation(id);
    if (operation.state !== 'pending') return this.#publicStatus(operation);
    await operation.worker.terminate();
    for (let index = 0; index < 20 && !operation.workerLost; index += 1) await delay(1);
    return this.status(id);
  }

  #operation(id) {
    const operation = this.#operations.get(id);
    if (!operation) fail('OPERATION_UNKNOWN', 'Operation id is unknown.', { id });
    return operation;
  }

  async #observe(operation) {
    if (operation.state !== 'pending') return this.#publicStatus(operation);
    if (operation.workerLost) {
      await this.#orphan(operation, 'device-owner-lost');
      return this.#publicStatus(operation);
    }
    const nativeState = Atomics.load(operation.words, 0);
    if (nativeState === 0) return this.#publicStatus(operation);
    if (nativeState === 1) {
      this.#terminalize(operation, 'completed');
      return this.#publicStatus(operation);
    }
    if (nativeState === 2) {
      this.#terminalize(operation, 'failed');
      return this.#publicStatus(operation);
    }
    fail('DEVICE_STATE_INVALID', 'Mock device published an invalid state.', { state: nativeState });
  }

  #terminalize(operation, status) {
    if (operation.terminalized) return;
    operation.terminalized = true;
    operation.eventActive = false;
    this.#cleanupCount += 1;
    for (let index = operation.memoryReleases.length - 1; index >= 0; index -= 1) operation.memoryReleases[index]();
    operation.functionRelease();
    operation.state = status;
    operation.terminal = Object.freeze({
      id: operation.id,
      status,
      ticks: Atomics.load(operation.words, 1),
      cleanupCount: this.#cleanupCount,
      eventActive: false,
      leases: this.#ledger.snapshot(operation.functionId, [...new Set(operation.memoryIds)]),
    });
    if (this.#pendingId === operation.id) this.#pendingId = null;
  }

  async #orphan(operation, reason) {
    if (operation.state === 'orphaned') return;
    operation.state = 'orphaned';
    operation.terminal = Object.freeze({
      id: operation.id,
      status: 'orphaned',
      reason,
      ticks: Atomics.load(operation.words, 1),
      eventActive: operation.eventActive,
      leases: this.#ledger.snapshot(operation.functionId, [...new Set(operation.memoryIds)]),
    });
    this.#state = 'restart-required';
    if (operation.worker.threadId !== -1) await operation.worker.terminate();
  }

  #publicStatus(operation) {
    if (operation.terminal) return operation.terminal;
    return Object.freeze({
      id: operation.id,
      status: 'pending',
      ticks: Atomics.load(operation.words, 1),
      eventActive: operation.eventActive,
      leases: this.#ledger.snapshot(operation.functionId, [...new Set(operation.memoryIds)]),
    });
  }

  #runtimeRecord() {
    const orphaned = [...this.#operations.values()].filter((operation) => operation.state === 'orphaned');
    return Object.freeze({
      state: this.#state,
      graceful: this.#state === 'closed',
      restartRequired: this.#state === 'restart-required',
      cleanupCount: this.#cleanupCount,
      orphaned: Object.freeze(orphaned.map((operation) => operation.terminal)),
    });
  }

  #requireOpen() {
    if (this.#state !== 'open') fail('RUNTIME_NOT_OPEN', 'Owner is not accepting ordinary commands.', { state: this.#state });
  }

  #enqueue(name, callback, { allowClosing = false, allowRestartRequired = false } = {}) {
    const run = this.#queue.then(async () => {
      if (this.#state === 'closing' && !allowClosing) fail('RUNTIME_CLOSING', 'Owner is closing.', { command: name });
      if (this.#state === 'restart-required' && !allowRestartRequired) fail('RUNTIME_RESTART_REQUIRED', 'Owner requires restart.', { command: name });
      if (this.#pendingId !== null && !['submit', 'status', 'operation-close', 'runtime-close', 'legacy-timeout'].includes(name)) {
        fail('EXECUTION_COMMAND_BLOCKED', 'Command is outside the first-slice pending-operation allowlist.', { command: name, pendingOperationId: this.#pendingId });
      }
      this.#commandCount += 1;
      return callback();
    });
    this.#queue = run.catch(() => {});
    return run;
  }
}

export async function legacyLaunch(owner, request, { maxCompletionMilliseconds = 250, pollMilliseconds = 2 } = {}) {
  const operation = await owner.submit(request);
  const started = Date.now();
  for (;;) {
    const status = await operation.status();
    if (status.status !== 'pending') {
      if (status.status === 'completed' || status.status === 'failed') await operation.close();
      return status;
    }
    if (Date.now() - started >= maxCompletionMilliseconds) return owner.legacyTimeout(operation.id);
    await delay(pollMilliseconds);
  }
}
