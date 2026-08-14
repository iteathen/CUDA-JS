import assert from 'node:assert/strict';
import test from 'node:test';

import { MemoryManager } from '../../memory/index.mjs';
import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { ExecutionError, ExecutionManager } from '../index.mjs';

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

function fixture() {
  const registry = new ResourceRegistry({
    runtimeId: 'extended-numeric-execution-test',
    epoch: 1,
    nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })(),
  });
  const library = registry.allocate({ kind: 'library', value: {}, dispose: async () => ({ closed: true }) });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose: async () => ({ closed: true }) });
  const memory = new MemoryManager({
    registry,
    contextToken: context,
    policy: { maxDeviceBytes: 64, maxAllocationBytes: 64, maxTransferBytes: 64 },
    operations: {
      async query() { return { freeBytes: 64, totalBytes: 64 }; },
      async allocate() { return 0x1000n; },
      async free() {},
      async write() {},
      async read({ byteLength }) { return new Uint8Array(byteLength); },
    },
  });
  let next = 10n;
  let submitCount = 0;
  let lastLaunch = null;
  const operations = {
    async createStream() { return ++next; },
    async destroyStream() {},
    async loadModule() { return ++next; },
    async unloadModule() {},
    async getFunction() { return ++next; },
    async createEvent() { return ++next; },
    async destroyEvent() {},
    async devicePointer({ native, byteOffset }) { return native + BigInt(byteOffset); },
    async submitLaunch(request) { submitCount += 1; lastLaunch = request; },
    async recordEvent() {},
    async queryEvent() { return 'complete'; },
    health() { return { current: 'healthy', history: [] }; },
    restartRequired({ code, message, details, operationId }) {
      return new ExecutionError(code, 'restart-required', message, details, { operationId, healthBefore: 'healthy', healthAfter: 'restart-required' });
    },
  };
  return {
    registry,
    execution: new ExecutionManager({ registry, contextToken: context, memory, deviceLimits: LIMITS, operations }),
    submitCount: () => submitCount,
    lastLaunch: () => lastLaunch,
  };
}

test('function registration and launch carry f64/f16/bf16 through the real execution path', async () => {
  const { registry, execution, submitCount, lastLaunch } = fixture();
  await execution.initialize();
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX, operationId: 1 });
  const fn = await execution.getFunction(module.module, {
    name: 'extended_numeric',
    parameters: [{ kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }],
    operationId: 2,
  });
  assert.deepEqual(fn.parameters, [{ kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }]);

  const completion = await execution.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [
      { kind: 'f64', value: Number.NaN },
      { kind: 'f16', value: 1 },
      { kind: 'bf16', value: -2 },
    ],
    operationId: 3,
  });
  assert.equal(completion.status, 'completed');
  assert.equal(submitCount(), 1);
  const packed = lastLaunch().parameterBuffer;
  assert.equal(packed.byteLength, 12);
  assert.equal(packed.readBigUInt64LE(0), 0x7ff8_0000_0000_0000n);
  assert.equal(packed.readUInt16LE(8), 0x3c00);
  assert.equal(packed.readUInt16LE(10), 0xc000);

  await execution.releaseFunction(fn.function);
  await execution.releaseModule(module.module);
  const terminal = await registry.closeAll();
  assert.equal(terminal.errorCount, 0);
  assert.equal(terminal.skippedCount, 0);
  assert.equal(terminal.inventory.counts.live, 0);
  assert.equal(terminal.inventory.counts.orphaned, 0);
});

test('invalid extended scalar values reject before native submission', async () => {
  const { execution, submitCount } = fixture();
  await execution.initialize();
  const module = await execution.loadModule({ format: 'ptx', bytes: PTX });
  const fn = await execution.getFunction(module.module, { name: 'invalid_extended', parameters: [{ kind: 'f16' }] });
  await assert.rejects(execution.launch(fn.function, {
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    arguments: [{ kind: 'f16', value: '1' }],
  }), { code: 'EXECUTION_ARGUMENT_VALUE' });
  assert.equal(submitCount(), 0);
});
