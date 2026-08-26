import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';

const oracle = JSON.parse(await readFile(new URL('./dense-numeric-oracle.json', import.meta.url), 'utf8'));
const source = `
function affineHalf(x, scale, bias) {
  return (x * scale) + bias;
}

function evaluateBfloat(x) {
  return gpu.math.exp(x / gpu.bf16(2));
}

function evaluateDouble(x) {
  return gpu.math.sqrt(x + gpu.f64(4));
}

function dense(out64, out16, outBf16, words, x64, x16, xBf16) {
  let h = affineHalf(x16, gpu.f16(2), gpu.f16(1));
  let b = evaluateBfloat(xBf16);
  let d = evaluateDouble(x64);
  out64[gpu.u32(0)] = gpu.cast.f64(h);
  out64[gpu.u32(1)] = gpu.math.maximum(gpu.f64(-0), gpu.f64(0));
  out64[gpu.u32(2)] = gpu.math.minimum(gpu.f64(-0), gpu.f64(0));
  out16[gpu.u32(0)] = gpu.math.abs(h);
  out16[gpu.u32(1)] = gpu.math.minimum(gpu.f16.nan(), gpu.f16(1));
  outBf16[gpu.u32(0)] = -b;
  outBf16[gpu.u32(1)] = gpu.math.maximum(gpu.bf16.nan(), gpu.bf16(1));
  words[gpu.u32(0)] = gpu.cast.u32(gpu.f64.nan());
  words[gpu.u32(1)] = gpu.cast.u32(d);
  if (gpu.math.isNaN(out16[gpu.u32(1)])) {
    words[gpu.u32(2)] = gpu.u32(1);
  } else {
    words[gpu.u32(2)] = gpu.u32(0);
  }
  words[gpu.u32(3)] = gpu.cast.u32(gpu.f64.negativeInfinity());
}
`;
const functions = [
  { name: 'affineHalf', kind: 'device', parameters: [{ name: 'x', type: 'f16' }, { name: 'scale', type: 'f16' }, { name: 'bias', type: 'f16' }], returns: 'f16' },
  { name: 'evaluateBfloat', kind: 'device', parameters: [{ name: 'x', type: 'bf16' }], returns: 'bf16' },
  { name: 'evaluateDouble', kind: 'device', parameters: [{ name: 'x', type: 'f64' }], returns: 'f64' },
  { name: 'dense', kind: 'kernel', parameters: [
    { name: 'out64', type: 'ptr<f64>' },
    { name: 'out16', type: 'ptr<f16>' },
    { name: 'outBf16', type: 'ptr<bf16>' },
    { name: 'words', type: 'ptr<u32>' },
    { name: 'x64', type: 'f64' },
    { name: 'x16', type: 'f16' },
    { name: 'xBf16', type: 'bf16' },
  ], returns: 'void' },
];

const runtime = await openCudaRuntime({
  compiler: true,
  driver: { memory: { maxDeviceBytes: 64, maxAllocationBytes: 24, maxTransferBytes: 24 }, execution: { maxModuleBytes: 2_097_152, maxArguments: 8, maxCompletionMilliseconds: 30_000 } },
});
let terminal;
let observation;
try {
  const compiled = await compileDeviceProgram(runtime, { source, functions });
  assert.match(compiled.deviceProgram.contract, /SPEC-0030-dense-numeric-v1$/u);
  assert.equal(compiled.compiler.headerProfile, 'cuda-numeric');
  const module = await runtime.loadModule({ format: 'ptx', bytes: compiled.compiler.artifact.bytes });
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'dense');
  const fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
  const out64 = await runtime.allocateDevice({ byteLength: 24 });
  const out16 = await runtime.allocateDevice({ byteLength: 4 });
  const outBf16 = await runtime.allocateDevice({ byteLength: 4 });
  const words = await runtime.allocateDevice({ byteLength: 16 });
  for (const memory of [out64, out16, outBf16, words]) await memory.write(new Uint8Array(memory.byteLength));
  const completion = await fn.launch({
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 },
    arguments: [out64, out16, outBf16, words, 5, 1.5, 0],
  });
  assert.equal(completion.status, 'completed');
  const bytes64 = (await out64.read({ byteLength: 24 })).bytes;
  const bytes16 = (await out16.read({ byteLength: 4 })).bytes;
  const bytesBf16 = (await outBf16.read({ byteLength: 4 })).bytes;
  const wordBytes = (await words.read({ byteLength: 16 })).bytes;
  const data64 = new DataView(bytes64.buffer, bytes64.byteOffset, bytes64.byteLength);
  const data16 = new DataView(bytes16.buffer, bytes16.byteOffset, bytes16.byteLength);
  const dataBf16 = new DataView(bytesBf16.buffer, bytesBf16.byteOffset, bytesBf16.byteLength);
  const wordView = new DataView(wordBytes.buffer, wordBytes.byteOffset, wordBytes.byteLength);
  observation = {
    f64Bits: Array.from({ length: 3 }, (_, index) => data64.getBigUint64(index * 8, true).toString(16).padStart(16, '0')),
    f16Bits: Array.from({ length: 2 }, (_, index) => data16.getUint16(index * 2, true)),
    bf16Bits: Array.from({ length: 2 }, (_, index) => dataBf16.getUint16(index * 2, true)),
    words: Array.from({ length: 4 }, (_, index) => wordView.getUint32(index * 4, true)),
  };
  assert.deepEqual(observation, { f64Bits: oracle.f64Bits, f16Bits: oracle.f16Bits, bf16Bits: oracle.bf16Bits, words: oracle.words });
  await words.close();
  await outBf16.close();
  await out16.close();
  await out64.close();
  await fn.close();
  await module.close();
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.closing, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);
console.log(JSON.stringify({ consumer: 'native-dense-numeric', ...observation, oracleIndependent: true, graceful: terminal.graceful }));
