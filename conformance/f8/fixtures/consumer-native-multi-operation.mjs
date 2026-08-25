import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { openCudaRuntime } from 'cuda-js';

const ptx = Uint8Array.from(await readFile(new URL('./native-capabilities.ptx', import.meta.url)));
const runtime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 16, maxAllocationBytes: 4, maxTransferBytes: 4 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 4, maxCompletionMilliseconds: 30_000, maxPendingGpuOperations: 2 },
  },
});
let terminal;
let observedWords;
let producerPendingAfterObserver;
let transferBytes;
try {
  const module = await runtime.loadModule({ format: 'ptx', bytes: ptx });
  const producer = await module.getFunction({ name: 'cuda_js_native_atomic_producer', parameters: [{ kind: 'device-memory' }, { kind: 'u64' }] });
  const observer = await module.getFunction({ name: 'cuda_js_native_atomic_observer', parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }] });
  const shared = await runtime.allocateDevice({ byteLength: 4 });
  const observed = await runtime.allocateDevice({ byteLength: 4 });
  await shared.write(new Uint8Array(4));
  await observed.write(new Uint8Array(4));
  const producerOperation = await producer.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [shared, 500_000_000n],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-update-relaxed-device', dtype: 'u32' }],
  });
  const observerOperation = await observer.submit({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [shared, observed],
    accesses: [
      { argumentIndex: 0, byteOffset: 0, byteLength: 4, mode: 'atomic-observe-relaxed-device', dtype: 'u32' },
      { argumentIndex: 1, byteOffset: 0, byteLength: 4, mode: 'write' },
    ],
  });
  await observerOperation.wait();
  producerPendingAfterObserver = (await producerOperation.status()).status === 'pending';
  assert.equal(producerPendingAfterObserver, true);
  await producerOperation.wait();
  const bytes = (await observed.read({ byteLength: 4 })).bytes;
  observedWords = [new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true)];
  assert.deepEqual(observedWords, [1]);
  const transferSource = await runtime.allocateDevice({ byteLength: 4 });
  const transferDestination = await runtime.allocateDevice({ byteLength: 4 });
  const input = Uint8Array.of(3, 5, 7, 11);
  const uploadPromise = transferSource.writeAsync(input);
  input.fill(0);
  const upload = await uploadPromise;
  const deviceCopy = await transferDestination.copyFromAsync(transferSource, { byteLength: 4, after: upload });
  await upload.wait();
  const download = await transferDestination.readAsync({ byteLength: 4, after: deviceCopy });
  transferBytes = [...(await download.wait()).result.bytes];
  assert.deepEqual(transferBytes, [3, 5, 7, 11]);
  await deviceCopy.wait();
  await download.close();
  await deviceCopy.close();
  await upload.close();
  await transferDestination.close();
  await transferSource.close();
  await observerOperation.close();
  await producerOperation.close();
  await observer.close();
  await producer.close();
  await module.close();
  await observed.close();
  await shared.close();
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);
console.log(JSON.stringify({ consumer: 'native-multi-operation-transfer', producerPendingAfterObserver, observedWords, transferBytes, graceful: terminal.graceful }));
