import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { openCudaRuntime } from 'cuda-js';

const count = 1_024;
const ptx = Uint8Array.from(await readFile(new URL('./vector-add.ptx.txt', import.meta.url)));
const left = new Uint32Array(count);
const right = new Uint32Array(count);
const expected = new Uint32Array(count);
for (let index = 0; index < count; index += 1) {
  left[index] = (Math.imul(index, 3) + 7) >>> 0;
  right[index] = (Math.imul(index, 5) + 11) >>> 0;
  expected[index] = (left[index] + right[index]) >>> 0;
}
function bytes(values) {
  const output = new Uint8Array(values.length * 4);
  const view = new DataView(output.buffer);
  for (let index = 0; index < values.length; index += 1) view.setUint32(index * 4, values[index], true);
  return output;
}
function checksum(values) {
  let value = 2_166_136_261;
  for (const byte of values) {
    value = (value ^ byte) >>> 0;
    value = Math.imul(value, 16_777_619) >>> 0;
  }
  return value;
}

const expectedBytes = bytes(expected);
const byteLength = expectedBytes.byteLength;
const runtime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: byteLength * 3, maxAllocationBytes: byteLength, maxTransferBytes: byteLength },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 8, maxCompletionMilliseconds: 30_000 },
  },
});
let terminal;
try {
  const output = await runtime.allocateDevice({ byteLength });
  const leftMemory = await runtime.allocateDevice({ byteLength });
  const rightMemory = await runtime.allocateDevice({ byteLength });
  await leftMemory.write(bytes(left));
  await rightMemory.write(bytes(right));
  const module = await runtime.loadModule({ format: 'ptx', bytes: ptx });
  const fn = await module.getFunction({
    name: 'cuda_js_vector_add_u32',
    parameters: [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }],
  });
  const completion = await fn.launch({
    grid: { x: Math.ceil(count / 128), y: 1, z: 1 },
    block: { x: 128, y: 1, z: 1 },
    arguments: [output, leftMemory, rightMemory, count],
  });
  assert.equal(completion.status, 'completed');
  const actual = (await output.read({ byteLength })).bytes;
  assert.deepEqual(actual, expectedBytes);
  assert.equal(checksum(actual), 15_600_773);
  await fn.close();
  await module.close();
  await rightMemory.close();
  await leftMemory.close();
  await output.close();
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.driver.workerExitCode, 0);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.closing, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);
console.log(JSON.stringify({ consumer: 'native-windows-vector', checksum: 15_600_773, graceful: terminal.graceful, workerExitCode: terminal.driver.workerExitCode }));
