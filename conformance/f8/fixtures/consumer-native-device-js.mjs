import assert from 'node:assert/strict';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';

const count = 64;
const scale = Math.fround(7.25);
const wide = 0x0123456789abcdefn;
const wideMask = 0xfedcba9876543210n;
const bias = -7;
const input = Uint32Array.from({ length: count }, (_, index) => (Math.imul(index + 3, 0x1020304) ^ 0x89abcdef) >>> 0);
const source = `
function rotate(x) {
  return (x << gpu.u32(1)) | (x >> gpu.u32(31));
}

function qualify(out, input, flags, buckets, atomicShared, atomicObserved, wideOut, atomicWide, atomicWideObserved, floatOut, n, scale, wide, bias) {
  let i = gpu.thread.globalX();
  let zero = gpu.u32(0);
  let one = gpu.u32(1);
  if (i >= n) {
    return;
  }
  let value = input[i];
  let limit = value & gpu.u32(3);
  let step = zero;
  while (step < limit) {
    value = rotate(value ^ (step + one));
    step++;
  }
  if ((i & one) === zero) {
    value ^= gpu.u32(1515870810);
  } else {
    value += gpu.u32(bias);
  }
  out[i] = value;
  gpu.atomic.add(buckets, i & gpu.u32(3), one);
  gpu.atomic.cas(flags, i, zero, one);
  gpu.atomic.storeRelaxedDevice(atomicShared, zero, i + one);
  atomicObserved[i] = gpu.atomic.loadRelaxedDevice(atomicShared, zero);
  gpu.atomic.storeRelaxedDevice(atomicWide, zero, wide ^ gpu.u64(i));
  atomicWideObserved[i] = gpu.atomic.loadRelaxedDevice(atomicWide, zero);
  if (i === zero) {
    wideOut[zero] = wide ^ gpu.u64(18364758544493064720n);
    floatOut[zero] = gpu.math.sqrt(scale);
  }
}
`;
const functions = [
  { name: 'rotate', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
  {
    name: 'qualify',
    kind: 'kernel',
    parameters: [
      { name: 'out', type: 'ptr<u32>' },
      { name: 'input', type: 'ptr<u32>' },
      { name: 'flags', type: 'ptr<u32>' },
      { name: 'buckets', type: 'ptr<u32>' },
      { name: 'atomicShared', type: 'ptr<u32>' },
      { name: 'atomicObserved', type: 'ptr<u32>' },
      { name: 'wideOut', type: 'ptr<u64>' },
      { name: 'atomicWide', type: 'ptr<u64>' },
      { name: 'atomicWideObserved', type: 'ptr<u64>' },
      { name: 'floatOut', type: 'ptr<f32>' },
      { name: 'n', type: 'u32' },
      { name: 'scale', type: 'f32' },
      { name: 'wide', type: 'u64' },
      { name: 'bias', type: 'i32' },
    ],
    returns: 'void',
  },
];

function u32Bytes(values) {
  const bytes = new Uint8Array(values.length * 4);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < values.length; index += 1) view.setUint32(index * 4, values[index], true);
  return bytes;
}
function expectedWords() {
  return Uint32Array.from(input, (initial, index) => {
    let value = initial >>> 0;
    const limit = value & 3;
    for (let step = 0; step < limit; step += 1) {
      value = (value ^ ((step + 1) >>> 0)) >>> 0;
      value = ((value << 1) | (value >>> 31)) >>> 0;
    }
    return (index & 1) === 0 ? (value ^ 0x5a5a5a5a) >>> 0 : (value + (bias >>> 0)) >>> 0;
  });
}

const runtime = await openCudaRuntime({
  compiler: true,
  driver: {
    memory: { maxDeviceBytes: 2_048, maxAllocationBytes: count * 8, maxTransferBytes: count * 8 },
    execution: { maxModuleBytes: 2_097_152, maxArguments: 16, maxCompletionMilliseconds: 30_000 },
  },
});
let terminal;
let compilerResourcesBefore;
let compilerResourcesAfter;
let compilerArtifact;
let programIdentity;
let runtimeProfile;
let outputWords;
let bucketWords;
let flagWords;
let wideResult;
let floatResult;
let atomicRelaxedDeviceU32;
let atomicRelaxedDeviceU64;
try {
  compilerResourcesBefore = (await runtime.describe()).compiler.resources;
  await assert.rejects(compileDeviceProgram(runtime, {
    source: 'function invalid(out) { out[gpu.u32(0)] = 1; }',
    functions: [{ name: 'invalid', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  }), (error) => error.code === 'DEVICE_JS_LITERAL_REQUIRES_CAST');
  compilerResourcesAfter = (await runtime.describe()).compiler.resources;
  assert.deepEqual(compilerResourcesAfter, compilerResourcesBefore);

  const compiled = await compileDeviceProgram(runtime, { source, functions, compile: { headerProfile: 'cuda-cccl' } });
  assert.equal(compiled.deviceProgram.contract, 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0014-publication-mailbox-v1');
  assert.deepEqual(compiled.deviceProgram.parser, { name: 'acorn', version: '8.15.0' });
  assert.equal(compiled.compiler.artifact.format, 'ptx');
  assert.equal(JSON.stringify(compiled).includes('__global__'), false);
  assert.equal(JSON.stringify(compiled).includes('threadIdx'), false);
  compilerArtifact = { format: compiled.compiler.artifact.format, byteLength: compiled.compiler.artifact.byteLength, sha256: compiled.compiler.artifact.sha256 };
  programIdentity = compiled.deviceProgram.sha256;
  const description = await runtime.describe();
  runtimeProfile = {
    profile: description.profile,
    driver: description.driver,
    device: description.device,
    compiler: { provider: description.compiler.provider },
  };

  const output = await runtime.allocateDevice({ byteLength: count * 4 });
  const inputMemory = await runtime.allocateDevice({ byteLength: count * 4 });
  const flags = await runtime.allocateDevice({ byteLength: count * 4 });
  const buckets = await runtime.allocateDevice({ byteLength: 16 });
  const atomicShared = await runtime.allocateDevice({ byteLength: 4 });
  const atomicObserved = await runtime.allocateDevice({ byteLength: count * 4 });
  const wideOutput = await runtime.allocateDevice({ byteLength: 8 });
  const atomicWide = await runtime.allocateDevice({ byteLength: 8 });
  const atomicWideObserved = await runtime.allocateDevice({ byteLength: count * 8 });
  const floatOutput = await runtime.allocateDevice({ byteLength: 4 });
  await inputMemory.write(u32Bytes(input));
  await output.write(new Uint8Array(count * 4));
  await flags.write(new Uint8Array(count * 4));
  await buckets.write(new Uint8Array(16));
  await atomicShared.write(new Uint8Array(4));
  await atomicObserved.write(new Uint8Array(count * 4));
  await wideOutput.write(new Uint8Array(8));
  await atomicWide.write(new Uint8Array(8));
  await atomicWideObserved.write(new Uint8Array(count * 8));
  await floatOutput.write(new Uint8Array(4));

  const module = await runtime.loadModule({ format: 'ptx', bytes: compiled.compiler.artifact.bytes });
  const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'qualify');
  assert(kernel);
  const fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
  const completion = await fn.launch({
    grid: { x: 2, y: 1, z: 1 },
    block: { x: 32, y: 1, z: 1 },
    arguments: [output, inputMemory, flags, buckets, atomicShared, atomicObserved, wideOutput, atomicWide, atomicWideObserved, floatOutput, count, scale, wide, bias],
  });
  assert.equal(completion.status, 'completed');

  const outputBytes = (await output.read({ byteLength: count * 4 })).bytes;
  const flagBytes = (await flags.read({ byteLength: count * 4 })).bytes;
  const bucketBytes = (await buckets.read({ byteLength: 16 })).bytes;
  const atomicObservedBytes = (await atomicObserved.read({ byteLength: count * 4 })).bytes;
  const wideBytes = (await wideOutput.read({ byteLength: 8 })).bytes;
  const atomicWideObservedBytes = (await atomicWideObserved.read({ byteLength: count * 8 })).bytes;
  const floatBytes = (await floatOutput.read({ byteLength: 4 })).bytes;
  outputWords = Array.from({ length: count }, (_, index) => new DataView(outputBytes.buffer, outputBytes.byteOffset, outputBytes.byteLength).getUint32(index * 4, true));
  flagWords = Array.from({ length: count }, (_, index) => new DataView(flagBytes.buffer, flagBytes.byteOffset, flagBytes.byteLength).getUint32(index * 4, true));
  bucketWords = Array.from({ length: 4 }, (_, index) => new DataView(bucketBytes.buffer, bucketBytes.byteOffset, bucketBytes.byteLength).getUint32(index * 4, true));
  const atomicObservedWords = Array.from({ length: count }, (_, index) => new DataView(atomicObservedBytes.buffer, atomicObservedBytes.byteOffset, atomicObservedBytes.byteLength).getUint32(index * 4, true));
  wideResult = new DataView(wideBytes.buffer, wideBytes.byteOffset, wideBytes.byteLength).getBigUint64(0, true);
  const atomicWideObservedWords = Array.from({ length: count }, (_, index) => new DataView(atomicWideObservedBytes.buffer, atomicWideObservedBytes.byteOffset, atomicWideObservedBytes.byteLength).getBigUint64(index * 8, true));
  floatResult = new DataView(floatBytes.buffer, floatBytes.byteOffset, floatBytes.byteLength).getFloat32(0, true);
  assert.deepEqual(outputWords, Array.from(expectedWords()));
  assert.deepEqual(flagWords, Array(count).fill(1));
  assert.deepEqual(bucketWords, [16, 16, 16, 16]);
  atomicRelaxedDeviceU32 = atomicObservedWords.every((value) => value >= 1 && value <= count);
  assert.equal(atomicRelaxedDeviceU32, true);
  assert.equal(wideResult, wide ^ wideMask);
  atomicRelaxedDeviceU64 = atomicWideObservedWords.every((value) => (value ^ wide) < BigInt(count));
  assert.equal(atomicRelaxedDeviceU64, true);
  const floatOracle = Math.fround(Math.sqrt(scale));
  assert(Math.abs(floatResult - floatOracle) <= 1e-6, `f32 sqrt result ${floatResult} differs from host oracle ${floatOracle}`);

  await fn.close();
  await module.close();
  await floatOutput.close();
  await atomicWideObserved.close();
  await atomicWide.close();
  await wideOutput.close();
  await atomicObserved.close();
  await atomicShared.close();
  await buckets.close();
  await flags.close();
  await inputMemory.close();
  await output.close();
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.graceful, true);
assert.equal(terminal.compiler.resources.programsCreated, terminal.compiler.resources.programsDestroyed);
assert.equal(terminal.driver.graceful, true);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.closing, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);

console.log(JSON.stringify({
  consumer: 'native-device-js',
  sourceOnly: true,
  deviceProgram: programIdentity,
  compilerArtifact,
  runtimeProfile,
  structuredIntegerBitwise: true,
  dataDependentWhile: true,
  globalIndex: true,
  exactU64: wideResult.toString(16).padStart(16, '0'),
  f32: { input: scale, output: floatResult, hostOracle: Math.fround(Math.sqrt(scale)), tolerance: 1e-6 },
  atomicBuckets: bucketWords,
  atomicCasUniqueFlags: flagWords.every((value) => value === 1),
  atomicRelaxedDeviceU32,
  atomicRelaxedDeviceU64,
  rejectionBeforeCompilerResources: JSON.stringify(compilerResourcesBefore) === JSON.stringify(compilerResourcesAfter),
  graceful: terminal.graceful,
  compilerResources: terminal.compiler.resources,
  driverResourceCounts: terminal.driver.resourceCounts,
}));
