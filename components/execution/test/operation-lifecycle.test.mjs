import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryManager } from '../../memory/index.mjs';
import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { ExecutionError, ExecutionManager } from '../index.mjs';

const PTX = Uint8Array.from(Buffer.from('.version 8.0\n.target sm_75\n.address_size 64\n'));
const LIMITS = Object.freeze({
  maxThreadsPerBlock: 1024, maxBlockDimX: 1024, maxBlockDimY: 1024, maxBlockDimZ: 64,
  maxGridDimX: 2_147_483_647, maxGridDimY: 65_535, maxGridDimZ: 65_535, maxSharedMemoryPerBlock: 49_152,
});

function fixture({ query = () => 'pending', policy = {}, clock = () => Date.now(), sleep = async () => {} } = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'operation-test', epoch: 1, nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })() });
  const library = registry.allocate({ kind: 'library', value: {}, dispose() {} });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose() {} });
  const allocations = new Map();
  const memory = new MemoryManager({
    registry, contextToken: context,
    policy: { maxDeviceBytes: 256, maxAllocationBytes: 256, maxTransferBytes: 256 },
    operations: {
      async query() { return { freeBytes: 256, totalBytes: 256 }; },
      async allocate({ byteLength }) { const native = 0x1000n + BigInt(allocations.size * 0x100); allocations.set(native, new Uint8Array(byteLength)); return native; },
      async free({ native }) { allocations.delete(native); },
      async write({ native, deviceOffset, bytes }) { allocations.get(native).set(bytes, deviceOffset); },
      async read({ native, deviceOffset, byteLength }) { return Uint8Array.from(allocations.get(native).subarray(deviceOffset, deviceOffset + byteLength)); },
    },
  });
  let handle = 10n;
  const operations = {
    async createStream() { return ++handle; }, async destroyStream() {}, async loadModule() { return ++handle; }, async unloadModule() {}, async getFunction() { return ++handle; },
    async createEvent() { return ++handle; }, async destroyEvent() {}, async devicePointer({ native, byteOffset }) { return native + BigInt(byteOffset); }, async submitLaunch() {}, async recordEvent() {},
    async queryEvent(request) { return query(request); },
    health() { return { current: 'healthy', history: [] }; },
    restartRequired({ code, message, details, operationId }) { return new ExecutionError(code, 'restart-required', message, details, { operationId, healthBefore: 'healthy', healthAfter: 'restart-required' }); },
  };
  const execution = new ExecutionManager({ registry, contextToken: context, memory, policy, deviceLimits: LIMITS, operations, clock, sleep });
  return { registry, memory, execution };
}

async function prepared(value = {}) {
  const fx = fixture(value);
  await fx.execution.initialize();
  const module = await fx.execution.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await fx.execution.getFunction(module.module, { name: 'k', parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }] });
  const allocation = await fx.memory.allocate({ byteLength: 32 });
  return { ...fx, module, fn, allocation };
}

function launchRequest(allocation) {
  return { grid: { x: 1, y: 1, z: 1 }, block: { x: 32, y: 1, z: 1 }, arguments: [
    { kind: 'device-memory', memory: allocation.memory }, { kind: 'device-memory', memory: allocation.memory, byteOffset: 4 }, { kind: 'u32', value: 8 },
  ] };
}

test('submit creates one pending logical operation and retains exact execution leases', async () => {
  const { registry, execution, fn, allocation } = await prepared();
  const operation = await execution.submit(fn.function, { ...launchRequest(allocation), operationId: 7 });
  assert.equal(operation.status, 'pending');
  assert.equal(execution.summary().pendingOperation, true);
  const resources = registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 2);
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.find((entry) => entry.kind === 'operation').state, 'live');
});

test('pending gate admits only operation observation/release/timeout and runtime close', async () => {
  const { execution, fn, allocation } = await prepared();
  const operation = await execution.submit(fn.function, launchRequest(allocation));
  for (const command of ['execution.operation.status', 'execution.operation.release', 'execution.operation.timeout', 'runtime.close']) assert.doesNotThrow(() => execution.assertCommandAllowed(command));
  for (const command of ['execution.submit', 'memory.read', 'runtime.describe', 'execution.function.status']) assert.throws(() => execution.assertCommandAllowed(command), (error) => error.code === 'EXECUTION_COMMAND_BLOCKED');
  await assert.rejects(execution.releaseOperation(operation.operation), (error) => error.code === 'EXECUTION_OPERATION_BUSY');
});

test('separate status turns terminalize once, release leases, and permit logical close', async () => {
  let queries = 0;
  const { registry, execution, fn, allocation } = await prepared({ query: () => (++queries === 1 ? 'pending' : 'complete') });
  const operation = await execution.submit(fn.function, launchRequest(allocation));
  assert.equal((await execution.operationStatus(operation.operation, 11)).status, 'pending');
  const complete = await execution.operationStatus(operation.operation, 12);
  assert.equal(complete.status, 'completed');
  assert.equal(complete.pollCount, 2);
  assert.equal(execution.summary().pendingOperation, false);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  const repeated = await execution.operationStatus(operation.operation, 13);
  assert.equal(repeated.status, 'completed');
  assert.equal(repeated.pollCount, 2);
  assert.equal((await execution.releaseOperation(operation.operation, 14)).released.terminalState, 'completed');
});

test('deferred failure becomes stable terminal failure with proved cleanup', async () => {
  const failure = new ExecutionError('CUDA_DEFERRED_FAILURE', 'deferred-driver', 'deferred failure', {}, { healthBefore: 'healthy', healthAfter: 'poisoned' });
  const { registry, execution, fn, allocation } = await prepared({ query: () => { throw failure; } });
  const operation = await execution.submit(fn.function, launchRequest(allocation));
  const status = await execution.operationStatus(operation.operation, 20);
  assert.equal(status.status, 'failed');
  assert.equal(status.failure.code, 'CUDA_DEFERRED_FAILURE');
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  assert.equal(execution.summary().pendingOperation, false);
  await execution.releaseOperation(operation.operation);
});

test('close preparation completes proved work but preserves orphaned ownership on timeout', async () => {
  let queries = 0;
  const success = await prepared({ query: () => (++queries < 3 ? 'pending' : 'complete'), sleep: async () => {} });
  await success.execution.submit(success.fn.function, launchRequest(success.allocation));
  await success.execution.prepareClose(30);
  assert.equal(success.execution.summary().pendingOperation, false);

  let now = 0;
  const timeout = await prepared({ query: () => 'pending', policy: { maxCompletionMilliseconds: 2 }, clock: () => now, sleep: async (milliseconds) => { now += milliseconds; } });
  const operation = await timeout.execution.submit(timeout.fn.function, launchRequest(timeout.allocation));
  await assert.rejects(timeout.execution.prepareClose(31), (error) => error.code === 'EXECUTION_CLOSE_TIMEOUT' && error.category === 'restart-required');
  const status = await timeout.execution.operationStatus(operation.operation, 32);
  assert.equal(status.status, 'orphaned');
  assert.equal(timeout.execution.summary().pendingOperation, true);
  const resources = timeout.registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 2);
  const second = await timeout.execution.prepareClose(33);
  assert.equal(second.pendingOperation, true);
});
