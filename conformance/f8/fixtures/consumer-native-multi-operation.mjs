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
console.log(JSON.stringify({ consumer: 'native-multi-operation', producerPendingAfterObserver, observedWords, graceful: terminal.graceful }));
