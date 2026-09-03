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

function fixture({ query = () => 'complete', submit = () => {}, deviceLimits = LIMITS } = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'prepared-execution-test', epoch: 1, nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })() });
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
  const calls = { createEvent: 0, devicePointer: 0, submitLaunch: 0 };
  const submissions = [];
  const operations = {
    async createStream() { return ++handle; }, async destroyStream() {}, async loadModule() { return ++handle; }, async unloadModule() {}, async getFunction() { return ++handle; },
    async createEvent() { calls.createEvent += 1; return ++handle; }, async destroyEvent() {},
    async devicePointer({ native, byteOffset }) { calls.devicePointer += 1; return native + BigInt(byteOffset); },
    async submitLaunch(request) { calls.submitLaunch += 1; submissions.push(request); return submit(request, calls.submitLaunch); }, async recordEvent() {}, async queryEvent(request) { return query(request); },
    health() { return { current: 'healthy', history: [] }; },
    restartRequired({ code, message, details, operationId }) { return new ExecutionError(code, 'restart-required', message, details, { operationId, healthBefore: 'healthy', healthAfter: 'restart-required' }); },
  };
  const execution = new ExecutionManager({ registry, contextToken: context, memory, policy: {}, deviceLimits, operations });
  return { registry, memory, execution, calls, submissions };
}

async function preparedFixture(value = {}) {
  const fx = fixture(value);
  await fx.execution.initialize();
  const module = await fx.execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 1 });
  const fn = await fx.execution.getFunction(module.module, { name: 'step', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }], operationId: 2 });
  const allocation = await fx.memory.allocate({ byteLength: 64 });
  return { ...fx, module, fn, allocation };
}

function node({ id, functionToken, after = [], binding = 'data', mode = 'write' }) {
  return {
    id, kind: 'kernel', after, functionToken,
    grid: { x: 1, y: 1, z: 1 }, block: { x: 32, y: 1, z: 1 }, sharedMemoryBytes: 0,
    arguments: [{ binding }, { binding: 'count' }],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode }],
  };
}

function bindings(allocation, entries = ['data']) {
  return [
    { name: 'count', kind: 'u32', value: 4 },
    ...entries.map((name) => ({ name, kind: 'device-memory', memory: allocation.memory, byteOffset: 0 })),
  ];
}

test('prepared DAG identity projects native-like discovery facts to the exact launch-limit profile', async () => {
  const nativeLike = await preparedFixture({
    deviceLimits: Object.freeze({
      ...LIMITS,
      warpSize: 32,
      multiprocessorCount: 30,
      computeCapabilityMajor: 7,
      computeCapabilityMinor: 5,
    }),
  });
  const projected = await preparedFixture();
  const nativePrepared = await nativeLike.execution.prepareOperationDag({
    nodes: [node({ id: 'step', functionToken: nativeLike.fn.function })],
    operationId: 3,
  });
  const projectedPrepared = await projected.execution.prepareOperationDag({
    nodes: [node({ id: 'step', functionToken: projected.fn.function })],
    operationId: 3,
  });
  assert.equal(nativePrepared.sha256, projectedPrepared.sha256);
  assert.deepEqual(nativePrepared.bindings, projectedPrepared.bindings);
});

test('prepared DAG owns function identity, submits one operation, replays, and releases leases exactly once', async () => {
  const { registry, execution, fn, allocation, calls, submissions } = await preparedFixture();
  const prepared = await execution.prepareOperationDag({
    nodes: [
      node({ id: 'second', functionToken: fn.function, after: ['first'] }),
      node({ id: 'first', functionToken: fn.function }),
    ],
    operationId: 3,
  });
  assert.equal(prepared.kind, 'prepared-operation-dag');
  assert.equal(prepared.contract, 'SPEC-0020-prepared-kernel-dag-v1');
  assert.equal(prepared.nodeCount, 2);
  assert.equal(prepared.edgeCount, 1);
  assert.deepEqual(prepared.bindings, [{ name: 'count', kind: 'u32' }, { name: 'data', kind: 'device-memory' }]);
  assert.equal(execution.summary().preparedDagCount, 1);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 1);
  await assert.rejects(execution.releaseFunction(fn.function), (error) => error.code === 'RESOURCE_BUSY');

  const first = await execution.submitPreparedOperationDag(prepared.prepared, { bindings: bindings(allocation), operationId: 4 });
  assert.equal(first.kind, 'prepared-batch');
  assert.equal(first.status, 'pending');
  assert.equal(first.preparedSha256, prepared.sha256);
  assert.equal(calls.createEvent, 1);
  assert.equal(calls.devicePointer, 1);
  assert.equal(calls.submitLaunch, 2);
  assert.equal(submissions[0].streamNative, submissions[1].streamNative);
  assert.equal(submissions[0].parameterBuffer.readBigUInt64LE(0), 0x1000n);
  assert.equal(submissions[0].parameterBuffer.readUInt32LE(8), 4);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 1);
  await assert.rejects(execution.releasePreparedOperationDag(prepared.prepared), (error) => error.code === 'RESOURCE_BUSY');

  const completed = await execution.operationStatus(first.operation, 5);
  assert.equal(completed.status, 'completed');
  assert.equal(completed.kind, 'prepared-batch');
  assert.equal(completed.nodeCount, 2);
  await execution.releaseOperation(first.operation, 6);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'device-memory').leases, 0);

  const replay = await execution.submitPreparedOperationDag(prepared.prepared, { bindings: bindings(allocation), operationId: 7 });
  assert.equal(calls.createEvent, 2);
  assert.equal(calls.submitLaunch, 4);
  await execution.operationStatus(replay.operation, 8);
  await execution.releaseOperation(replay.operation, 9);
  const released = await execution.releasePreparedOperationDag(prepared.prepared, 10);
  assert.equal(released.released.sha256, prepared.sha256);
  assert.equal(execution.summary().preparedDagCount, 0);
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
});

test('prepared DAG rejects concrete unordered aliases before pointer resolution or submission', async () => {
  const { execution, fn, allocation, calls } = await preparedFixture();
  const prepared = await execution.prepareOperationDag({
    nodes: [
      node({ id: 'left', functionToken: fn.function, binding: 'left' }),
      node({ id: 'right', functionToken: fn.function, binding: 'right' }),
    ],
    operationId: 3,
  });
  await assert.rejects(execution.submitPreparedOperationDag(prepared.prepared, {
    bindings: bindings(allocation, ['left', 'right']), operationId: 4,
  }), (error) => error.code === 'PREPARED_DAG_RESOURCE_HAZARD');
  assert.deepEqual(calls, { createEvent: 0, devicePointer: 0, submitLaunch: 0 });
  assert.equal(execution.summary().pendingOperationCount, 0);
});

test('prepared DAG validates every function capability before retained-lease deduplication', async () => {
  const { registry, execution, fn } = await preparedFixture();
  const foreignRegistry = new ResourceRegistry({ runtimeId: 'foreign-prepared-test', epoch: 1, nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })() });
  const foreignLibrary = foreignRegistry.allocate({ kind: 'library', value: {}, dispose() {} });
  const foreignContext = foreignRegistry.allocate({ kind: 'context', value: {}, parent: foreignLibrary, dispose() {} });
  foreignRegistry.allocate({ kind: 'stream', value: {}, parent: foreignContext, dispose() {} });
  const foreignModule = foreignRegistry.allocate({ kind: 'module', value: {}, parent: foreignContext, dispose() {} });
  const foreignFunction = foreignRegistry.allocate({ kind: 'function', value: {}, parent: foreignModule, dispose() {} });
  assert.equal(foreignFunction.slot, fn.function.slot);
  assert.equal(foreignFunction.generation, fn.function.generation);

  await assert.rejects(execution.prepareOperationDag({
    nodes: [
      node({ id: 'local', functionToken: fn.function }),
      node({ id: 'foreign', functionToken: foreignFunction, after: ['local'] }),
    ],
    operationId: 3,
  }), (error) => error.code === 'RESOURCE_WRONG_RUNTIME');
  assert.equal(registry.inventory().resources.find((entry) => entry.kind === 'function').leases, 0);
  assert.equal(execution.summary().preparedDagCount, 0);
});

test('prepared DAG reports an unavailable private node family as unsupported', async () => {
  const { execution } = await preparedFixture();
  await assert.rejects(
    execution.prepareOperationDag({ nodes: [{ id: 'provider', kind: 'unavailable-provider', after: [] }], operationId: 3 }),
    (error) => error.code === 'PREPARED_DAG_NODE_KIND' && error.category === 'unsupported',
  );
});

test('prepared DAG validates complete binding sets and transitive ordering', async () => {
  const { execution, fn, allocation, calls } = await preparedFixture();
  const prepared = await execution.prepareOperationDag({
    nodes: [
      node({ id: 'alpha', functionToken: fn.function, binding: 'left' }),
      node({ id: 'zulu', functionToken: fn.function, after: ['alpha'], binding: 'middle' }),
      node({ id: 'bravo', functionToken: fn.function, after: ['zulu'], binding: 'right' }),
    ],
    operationId: 3,
  });
  await assert.rejects(execution.submitPreparedOperationDag(prepared.prepared, {
    bindings: bindings(allocation, ['left', 'middle']), operationId: 4,
  }), (error) => error.code === 'PREPARED_DAG_BINDINGS_INVALID');
  const operation = await execution.submitPreparedOperationDag(prepared.prepared, {
    bindings: bindings(allocation, ['left', 'middle', 'right']), operationId: 5,
  });
  assert.equal(calls.submitLaunch, 3);
  assert.equal(operation.status, 'pending');
});

test('prepared DAG later-node submission failure retains ownership and requires restart', async () => {
  const failure = new ExecutionError('CUDA_LAUNCH_REJECTED', 'immediate-driver', 'later launch rejected', {}, { operation: 'cuLaunchKernelEx', healthBefore: 'healthy', healthAfter: 'suspect' });
  const { registry, execution, fn, allocation, calls } = await preparedFixture({ submit(_request, call) { if (call === 2) throw failure; } });
  const prepared = await execution.prepareOperationDag({
    nodes: [
      node({ id: 'first', functionToken: fn.function }),
      node({ id: 'second', functionToken: fn.function, after: ['first'] }),
    ],
    operationId: 3,
  });
  await assert.rejects(execution.submitPreparedOperationDag(prepared.prepared, {
    bindings: bindings(allocation), operationId: 4,
  }), (error) => error.code === 'PREPARED_DAG_PARTIAL_SUBMISSION' && error.category === 'restart-required' && error.details.submittedNodeCount === 1);
  assert.equal(calls.submitLaunch, 2);
  const resources = registry.inventory().resources;
  assert.equal(resources.find((entry) => entry.kind === 'prepared-dag').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'device-memory').leases, 1);
  assert.equal(resources.find((entry) => entry.kind === 'event').state, 'live');
  assert.equal(resources.some((entry) => entry.kind === 'operation'), false);
});

test('prepared library-node failure after a kernel is conservatively restart-required', async () => {
  const fx = fixture();
  const { execution, memory, calls } = fx;
  execution.registerPreparedNodeFamily({
    kind: 'cublaslt-f32-matmul',
    prepare(node) {
      const reference = { binding: 'data', kind: 'device-memory' };
      return {
        semantic: {
          id: node.id, kind: node.kind, after: node.after,
          plan: {
            contract: 'SPEC-0029-cublaslt-f32-row-major-matmul-v1', m: 1, n: 1, k: 1, transposeA: false, transposeB: false,
            maxWorkspaceBytes: 0, workspaceBytes: 0, requirements: { a: 1, b: 1, c: 1, d: 1 },
            provider: { name: 'test-provider', version: '1', qualification: 'test-only', workspaceAlignmentBytes: 256 },
          },
          a: reference, b: reference, c: reference, d: reference,
          alpha: { kind: 'f32', packedHex: '0000803f' }, beta: { kind: 'f32', packedHex: '00000000' }, workspace: null,
        },
        privateNode: { id: node.id, kind: node.kind },
        dependencies: [],
      };
    },
    resolve(_node, resolved) {
      const lease = resolved.get('data').lease;
      return {
        accesses: [{ native: lease.native, start: lease.byteOffset, end: lease.byteOffset + 4, mode: 'read-write' }],
        async enqueue() { throw Object.assign(new Error('Injected library submission failure.'), { code: 'TEST_LIBRARY_SUBMIT' }); },
      };
    },
  });
  await execution.initialize();
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 1 });
  const fn = await execution.getFunction(module.module, { name: 'step', parameters: [{ kind: 'device-memory' }, { kind: 'u32' }], operationId: 2 });
  const allocation = await memory.allocate({ byteLength: 64 });
  const prepared = await execution.prepareOperationDag({
    nodes: [
      node({ id: 'kernel', functionToken: fn.function }),
      { id: 'library', kind: 'cublaslt-f32-matmul', after: ['kernel'] },
    ],
    operationId: 3,
  });
  await assert.rejects(execution.submitPreparedOperationDag(prepared.prepared, { bindings: bindings(allocation), operationId: 4 }), (error) => error.code === 'PREPARED_DAG_PARTIAL_SUBMISSION' && error.category === 'restart-required');
  assert.equal(calls.submitLaunch, 1);
});