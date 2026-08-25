import assert from 'node:assert/strict';
import test from 'node:test';

import { CudaJsError } from '../../runtime-facade/index.mjs';
import { openCudaRuntimeForTesting } from '../../runtime-facade/testing.mjs';
import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { HostMemoryTransferManager } from '../index.mjs';

function expectCode(code) { return (error) => error instanceof CudaJsError && error.code === code; }

test('bounded async transfers preserve snapshots, terminal D2H ownership, dependencies, pressure, and cleanup', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({
    driver: {
      memory: { maxDeviceBytes: 64, maxAllocationBytes: 16, maxTransferBytes: 16 },
      execution: { maxPendingGpuOperations: 2 },
    },
  });
  const source = await runtime.allocateDevice({ byteLength: 16 });
  const destination = await runtime.allocateDevice({ byteLength: 16 });
  const input = Uint8Array.of(1, 2, 3, 4);
  try {

  const upload = await source.writeAsync(input);
  input.fill(9);
  const deviceCopy = await destination.copyFromAsync(source, { byteLength: 4, after: upload });
  assert.equal(upload.state, 'pending');
  assert.equal(deviceCopy.state, 'pending');
  await assert.rejects(destination.writeAsync(Uint8Array.of(8)), expectCode('EXECUTION_BUSY'));

  assert.equal((await deviceCopy.status()).status, 'pending');
  assert.equal((await deviceCopy.wait()).status, 'completed');

  const download = await destination.readAsync({ byteLength: 4, after: deviceCopy });
  const pendingDownload = await download.status();
  assert.equal(pendingDownload.status, 'pending');
  assert.equal(Object.hasOwn(pendingDownload, 'result'), false);
  const downloaded = await download.wait();
  assert.equal(downloaded.status, 'completed');
  assert.equal(downloaded.kind, 'device-to-host');
  assert.deepEqual([...downloaded.result.bytes], [1, 2, 3, 4]);
  downloaded.result.bytes.fill(7);
  assert.deepEqual([...(await download.status()).result.bytes], [1, 2, 3, 4]);

  assert.equal((await upload.wait()).status, 'completed');
  await assert.rejects(source.copyFromAsync(source, { sourceOffset: 0, destinationOffset: 1, byteLength: 3 }), expectCode('MEMORY_TRANSFER_OVERLAP_UNSUPPORTED'));

  await download.close();
  await deviceCopy.close();
  await upload.close();
  await destination.close();
  await source.close();
  const terminal = await runtime.close();
  assert.equal(terminal.graceful, true);
  assert.equal(terminal.driver.resourceCounts.live, 0);
  assert.equal(terminal.driver.resourceCounts.closing, 0);
  assert.equal(terminal.driver.resourceCounts.orphaned, 0);
  assert.equal(terminal.driver.resourceCounts.closed > 0, true);
  } finally {
    if (runtime.state === 'open') await runtime.close();
  }
});

test('transfer admission validates direction-specific ranges and source ownership before native work', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ driver: { memory: { maxDeviceBytes: 16, maxAllocationBytes: 16, maxTransferBytes: 8 }, execution: { maxPendingGpuOperations: 2 } } });
  const memory = await runtime.allocateDevice({ byteLength: 16 });
  await assert.rejects(memory.writeAsync(Buffer.from([1])), expectCode('MEMORY_BYTES_INVALID'));
  await assert.rejects(memory.writeAsync(new Uint8Array()), expectCode('MEMORY_BYTES_INVALID'));
  await assert.rejects(memory.writeAsync(new Uint8Array(9)), expectCode('MEMORY_TRANSFER_LIMIT'));
  await assert.rejects(memory.readAsync({ byteLength: 0 }), expectCode('DRIVER_MEMORY_TRANSFER'));
  await assert.rejects(memory.readAsync({ deviceOffset: 15, byteLength: 2 }), expectCode('MEMORY_RANGE_OUT_OF_BOUNDS'));
  await memory.close();
  assert.equal((await runtime.close()).graceful, true);
});

test('the compatibility-default one-operation profile does not silently activate pinned transfers', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting();
  const memory = await runtime.allocateDevice({ byteLength: 4 });
  await assert.rejects(memory.writeAsync(Uint8Array.of(1)), expectCode('MEMORY_TRANSFER_PROFILE_REQUIRED'));
  await memory.close();
  assert.equal((await runtime.close()).graceful, true);
});

test('partial staging initialization resumes and invalid backend views release their leases', async () => {
  const registry = new ResourceRegistry({ runtimeId: 'transfer-unit', epoch: 1, nonce: (() => { let next = 0; return () => String(++next).padStart(32, '0'); })() });
  const context = registry.allocate({ kind: 'context', value: {}, dispose() {} });
  let allocationCalls = 0;
  const manager = new HostMemoryTransferManager({
    registry,
    contextToken: context,
    maxTransferBytes: 4,
    memory: { acquireRangeForTransfer() { throw new Error('memory range must not be reached'); } },
    execution: {
      summary() { return { policy: { maxPendingGpuOperations: 2 } }; },
      submitTransfer() { throw new Error('submission must not be reached'); },
    },
    operations: {
      async allocateStaging() {
        allocationCalls += 1;
        if (allocationCalls === 2) throw Object.assign(new Error('injected allocation failure'), { code: 'MEMORY_TRANSFER_ALLOCATION_FAILED' });
        return new Uint8Array(4);
      },
      async freeStaging() {},
      stagingView() { return {}; },
      async copyHtoDAsync() {},
      async copyDtoHAsync() {},
      async copyDtoDAsync() {},
    },
  });
  await assert.rejects(manager.initialize(), { code: 'MEMORY_TRANSFER_ALLOCATION_FAILED' });
  assert.equal(manager.summary().allocatedBlockCount, 1);
  await manager.initialize();
  assert.equal(manager.summary().allocatedBlockCount, 2);
  await assert.rejects(manager.hostToDevice({}, Uint8Array.of(1)), { code: 'MEMORY_TRANSFER_BACKEND_INVALID' });
  assert.equal(manager.summary().busyBlockCount, 0);
  assert.equal(registry.inventory().resources.filter((entry) => entry.kind === 'pinned-staging').every((entry) => entry.leases === 0), true);
  const terminal = await registry.closeAll();
  assert.equal(terminal.errors.length, 0);
  assert.equal(terminal.inventory.counts.live, 0);
});
