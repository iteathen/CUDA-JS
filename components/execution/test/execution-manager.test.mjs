import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryManager } from '../../memory/index.mjs';
import { ResourceRegistry } from '../../resource-registry/index.mjs';
import {
  DEFAULT_EXECUTION_POLICY,
  ExecutionError,
  ExecutionManager,
  normalizeExecutionPolicy,
  packParameterValues,
  parameterLayout,
} from '../index.mjs';

const PTX = Uint8Array.from(Buffer.from('.version 8.0\n.target sm_75\n.address_size 64\n'));
const LIMITS = Object.freeze({
  maxThreadsPerBlock: 1024,
  maxBlockDimX: 1024,
  maxBlockDimY: 1024,
  maxBlockDimZ: 64,
  maxGridDimX: 2_147_483_647,
  maxGridDimY: 65_535,
  maxGridDimZ: 65_535,
  maxSharedMemoryPerBlock: 49_152,
});

function fixture({ query = () => 'complete', policy = {}, clock = () => Date.now(), sleep } = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'execution-test', epoch: 1, nonce: (() => {
    let value = 0;
    return () => (++value).toString(16).padStart(32, '0');
  })() });
  const order = [];
  const library = registry.allocate({ kind: 'library', value: {}, dispose() { order.push('library'); } });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose() { order.push('context'); } });
  const allocations = new Map();
  const memory = new MemoryManager({
    registry,
    contextToken: context,
    policy: { maxDeviceBytes: 128, maxAllocationBytes: 128, maxTransferBytes: 128 },
    operations: {
      async query() { return { freeBytes: 128, totalBytes: 128 }; },
      async allocate({ byteLength }) { const native = 0x1000n + BigInt(allocations.size * 0x100); allocations.set(native, new Uint8Array(byteLength)); return native; },
      async free({ native }) { assert.equal(allocations.delete(native), true); order.push('device-memory'); },
      async write({ native, deviceOffset, bytes }) { allocations.get(native).set(bytes, deviceOffset); },
      async read({ native, deviceOffset, byteLength }) { return Uint8Array.from(allocations.get(native).subarray(deviceOffset, deviceOffset + byteLength)); },
    },
  });
  let handle = 10n;
  const operations = {
    async createStream() { return ++handle; },
    async destroyStream() { order.push('stream'); },
    async loadModule() { return ++handle; },
    async unloadModule() { order.push('module'); },
    async getFunction() { return ++handle; },
    async createEvent() { order.push('event-create'); return ++handle; },
    async destroyEvent() { order.push('event'); },
    async devicePointer({ native, byteOffset }) { return native + BigInt(byteOffset); },
    async submitLaunch(request) { operations.lastLaunch = request; },
    async recordEvent() { order.push('event-record'); },
    async queryEvent(request) { return query(request, registry); },
    health() { return { current: 'healthy', history: [] }; },
    restartRequired({ code, message, details, operationId }) {
      return new ExecutionError(code, 'restart-required', message, details, { operationId, healthBefore: 'healthy', healthAfter: 'restart-required' });
    },
  };
  const execution = new ExecutionManager({ registry, contextToken: context, memory, policy, deviceLimits: LIMITS, operations, clock, sleep });
  return { registry, memory, execution, operations, order };
}

test('execution policy is exact and bounded', () => {
  assert.deepEqual(normalizeExecutionPolicy(), DEFAULT_EXECUTION_POLICY);
  assert.throws(() => normalizeExecutionPolicy({ extra: 1 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
  assert.throws(() => normalizeExecutionPolicy({ maxModuleBytes: 64 * 1_048_576 + 1 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
  assert.throws(() => normalizeExecutionPolicy({ maxArguments: 65 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
  assert.throws(() => normalizeExecutionPolicy({ maxCompletionMilliseconds: 300_001 }), (error) => error.code === 'EXECUTION_POLICY_INVALID');
});

test('parameter packing is naturally aligned, deterministic, and zero padded', () => {
  const parameters = [{ kind: 'device-memory' }, { kind: 'u32' }, { kind: 'device-memory' }];
  const layout = parameterLayout(parameters);
  assert.deepEqual(layout.entries.map(({ offset, byteLength }) => ({ offset, byteLength })), [
    { offset: 0, byteLength: 8 },
    { offset: 8, byteLength: 4 },
    { offset: 16, byteLength: 8 },
  ]);
  assert.equal(layout.byteLength, 24);
  const packed = packParameterValues(parameters, [0x1122n, 0xaabbccdd, 0x3344n]);
  assert.equal(packed.buffer.readBigUInt64LE(0), 0x1122n);
  assert.equal(packed.buffer.readUInt32LE(8), 0xaabbccdd);
  assert.deepEqual([...packed.buffer.subarray(12, 16)], [0, 0, 0, 0]);
  assert.equal(packed.buffer.readBigUInt64LE(16), 0x3344n);
});

test('module, function, repeated memory leases, polling, and teardown preserve dependency order', async () => {
  let polls = 0;
  const { registry, memory, execution, operations, order } = fixture({
    query(_request, liveRegistry) {
      polls += 1;
      if (polls === 1) {
        const resources = liveRegistry.inventory().resources;
        assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
        assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 2);
        return 'pending';
      }
      return 'complete';
    },
  });
  await execution.initialize();
  const submitted = Uint8Array.from(PTX);
  const module = await execution.loadModule({ format: 'ptx', bytes: submitted, operationId: 1 });
  submitted.fill(0);
  assert.match(module.sha256, /^[a-f0-9]{64}$/);
  const fn = await execution.getFunction(module.module, { name: 'vector_add', parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }], operationId: 2 });
  await assert.rejects(execution.releaseModule(module.module), (error) => error.code === 'RESOURCE_HAS_CHILDREN');
  const allocation = await memory.allocate({ byteLength: 64 });
  const completion = await execution.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 32, y: 1, z: 1 },
    arguments: [
      { kind: 'device-memory', memory: allocation.memory },
      { kind: 'device-memory', memory: allocation.memory, byteOffset: 4 },
      { kind: 'u32', value: 16 },
    ],
    operationId: 3,
  });
  assert.equal(completion.status, 'completed');
  assert.equal(completion.pollCount, 2);
  assert.equal(operations.lastLaunch.parameterBuffer.readBigUInt64LE(0), 0x1000n);
  assert.equal(operations.lastLaunch.parameterBuffer.readBigUInt64LE(8), 0x1004n);
  assert.equal(operations.lastLaunch.parameterBuffer.readUInt32LE(16), 16);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);
  await execution.releaseFunction(fn.function);
  await execution.releaseModule(module.module);
  await registry.closeAll();
  assert.deepEqual(order.slice(-5), ['module', 'device-memory', 'stream', 'context', 'library']);
});

test('module, schema, launch bounds, argument kinds, and memory offsets fail before unsafe backend work', async () => {
  const { memory, execution, operations } = fixture();
  await execution.initialize();
  await assert.rejects(execution.loadModule({ format: 'fatbin', bytes: PTX }), (error) => error.code === 'EXECUTION_MODULE_FORMAT');
  const cubin = await execution.loadModule({ format: 'cubin', bytes: Uint8Array.of(0, 1, 255) });
  assert.equal(cubin.format, 'cubin');
  await execution.releaseModule(cubin.module);
  await assert.rejects(execution.loadModule({ format: 'ptx', bytes: Uint8Array.of(65, 0, 66) }), (error) => error.code === 'EXECUTION_MODULE_TEXT');
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX });
  await assert.rejects(execution.getFunction(module.module, { name: '../bad', parameters: [{ kind: 'u32' }] }), (error) => error.code === 'EXECUTION_FUNCTION_NAME');
  await assert.rejects(execution.getFunction(module.module, { name: 'bad', parameters: [{ kind: 'i64' }] }), (error) => error.code === 'EXECUTION_PARAMETER_INVALID');
  const fn = await execution.getFunction(module.module, { name: 'bounded', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }] });
  const allocation = await memory.allocate({ byteLength: 8 });
  const valid = { grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: allocation.memory }, { kind: 'u32', value: 1 }] };
  await assert.rejects(execution.launch(fn.function, { ...valid, block: { x: 1024, y: 2, z: 1 } }), (error) => error.code === 'EXECUTION_BLOCK_VOLUME');
  await assert.rejects(execution.launch(fn.function, { ...valid, arguments: [{ kind: 'device-memory', memory: allocation.memory, byteOffset: 8 }, { kind: 'u32', value: 1 }] }), (error) => error.code === 'MEMORY_RANGE_OUT_OF_BOUNDS');
  await assert.rejects(execution.launch(fn.function, { ...valid, arguments: [{ kind: 'device-memory', memory: allocation.memory }, { kind: 'u32', value: 0x1_0000_0000 }] }), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  assert.equal(operations.lastLaunch, undefined);
});

test('completion timeout retains event, function, and memory leases for owner-loss accounting', async () => {
  let now = 0;
  const { registry, memory, execution } = fixture({
    policy: { maxCompletionMilliseconds: 2 },
    query: () => 'pending',
    clock: () => now,
    sleep: async (milliseconds) => { now += milliseconds; },
  });
  await execution.initialize();
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await execution.getFunction(module.module, { name: 'timeout', parameters: [{ kind: 'device-memory' }] });
  const allocation = await memory.allocate({ byteLength: 8 });
  await assert.rejects(execution.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [{ kind: 'device-memory', memory: allocation.memory }],
  }), (error) => error.code === 'EXECUTION_COMPLETION_TIMEOUT' && error.category === 'restart-required');
  const resources = registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.find((entry) => entry.kind === 'function').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 1);
  assert.equal(execution.summary().inFlight, true);
});
