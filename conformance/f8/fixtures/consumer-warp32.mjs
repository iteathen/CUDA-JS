import assert from 'node:assert/strict';
import { compileDeviceLibrary, compileDeviceProgram, inspectDeviceProgram, openCudaRuntime } from 'cuda-js';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';
import { CUDA_JS_COMPATIBILITY } from 'cuda-js/compatibility';

const native = process.argv.includes('--native');
const suffix = '+SPEC-0022-warp32-v1';
assert.equal(CUDA_JS_COMPATIBILITY.capabilities.deviceJsWarp32, 'typed-width-lane-masked-ballot-device-only-v1');
const runtime = await (native ? openCudaRuntime : openCudaRuntimeForTesting)({
  compiler: true,
  driver: {
    memory: { maxDeviceBytes: 1048576, maxAllocationBytes: 524288, maxTransferBytes: 524288 },
    execution: { maxModuleBytes: 2097152, maxArguments: 8, maxCompletionMilliseconds: 30000 },
  },
});
const voteSource = 'function vote(mask, predicate) { return gpu.warp.ballot(mask, predicate); }';
const voteMetadata = { name: 'vote', kind: 'device', parameters: [{ name: 'mask', type: 'u32' }, { name: 'predicate', type: 'bool' }], returns: 'u32' };
const kernelSource = `
function qualify(out, masks, seeds, mode) {
  const width = gpu.warp.width();
  const lane = gpu.warp.laneId();
  const local = (gpu.thread.z() * gpu.blockDim.y() + gpu.thread.y()) * gpu.blockDim.x() + gpu.thread.x();
  const threads = gpu.blockDim.x() * gpu.blockDim.y() * gpu.blockDim.z();
  const index = gpu.block.x() * threads + local;
  const warp = local / width;
  const warps = (threads + width - gpu.u32(1)) / width;
  const group = gpu.block.x() * warps + warp;
  const base = index * gpu.u32(10);
  out[base] = width;
  out[base + gpu.u32(1)] = lane;
  let mask = masks[group];
  const remaining = threads - warp * width;
  if (remaining < width) mask = mask & ((gpu.u32(1) << remaining) - gpu.u32(1));
  if (mode === gpu.u32(1)) {
    if ((lane % gpu.u32(2)) === gpu.u32(0)) mask = mask & gpu.u32(1431655765);
    else mask = mask & gpu.u32(2863311530);
  }
  if ((mask & (gpu.u32(1) << lane)) === gpu.u32(0)) return;
  if (mode === gpu.u32(2) && (lane % gpu.u32(2)) !== gpu.u32(0)) return;
  let state = seeds[group];
  let round = gpu.u32(0);
  while (round < gpu.u32(8)) {
    const predicate = ((state >> ((lane + round) % width)) & gpu.u32(1)) !== gpu.u32(0);
    state = vote(mask, predicate);
    out[base + gpu.u32(2) + round] = state;
    round++;
  }
}
`;
const metadata = { name: 'qualify', kind: 'kernel', parameters: [
  { name: 'out', type: 'ptr<u32>' }, { name: 'masks', type: 'ptr<u32>' },
  { name: 'seeds', type: 'ptr<u32>' }, { name: 'mode', type: 'u32' },
], returns: 'void' };
const bit = (value, lane) => Math.floor(value / (2 ** lane)) % 2 === 1;
// Independent truth construction uses per-lane booleans and arithmetic, never
// execution of generated source or a mock GPU's unexecuted output buffers.
function oracle(seed, lanes) {
  let state = seed;
  const rounds = [];
  for (let round = 0; round < 8; round++) {
    state = lanes.reduce((sum, lane) => sum + (bit(state, (lane + round) % 32) ? 2 ** lane : 0), 0);
    rounds.push(state);
  }
  return rounds;
}
const bytes = (words) => {
  const result = new Uint8Array(words.length * 4);
  const view = new DataView(result.buffer);
  words.forEach((value, index) => view.setUint32(index * 4, value, true));
  return result;
};
const shapes = [{ x: 32, y: 1, z: 1 }, { x: 64, y: 1, z: 1 }, { x: 17, y: 1, z: 1 }, { x: 10, y: 5, z: 2 }, { x: 7, y: 3, z: 3 }];
let checkedWords = 0;
let submissions = 0;
const identities = [];
let profile;
let terminal;
try {
  const before = (await runtime.describe()).compiler.resources;
  await assert.rejects(compileDeviceProgram(runtime, {
    source: 'function bad() { gpu.warp.ballot(true, true); }',
    functions: [{ name: 'bad', kind: 'kernel', parameters: [], returns: 'void' }],
  }), { code: 'DEVICE_JS_WARP_TYPE' });
  assert.deepEqual((await runtime.describe()).compiler.resources, before);
  for (const format of ['direct', 'ptx', 'lto-ir']) {
    let request = { source: voteSource + kernelSource, functions: [voteMetadata, metadata] };
    if (format !== 'direct') {
      const { library } = await compileDeviceLibrary(runtime, { source: voteSource, functions: [voteMetadata], exports: ['vote'], output: format });
      request = { source: kernelSource, functions: [metadata], imports: [{ library, name: 'vote', as: 'vote' }] };
    }
    const compiled = await compileDeviceProgram(runtime, request);
    assert(compiled.deviceProgram.contract.endsWith(suffix));
    assert.deepEqual(inspectDeviceProgram(request).deviceProgram, compiled.deviceProgram);
    identities.push(compiled.deviceProgram.sha256);
    if (!native) continue; // Portable compilation is not a ballot execution oracle.
    const artifact = (compiled.linker ?? compiled.compiler).artifact;
    const module = await runtime.loadModule({ format: artifact.format, bytes: artifact.bytes });
    const entry = compiled.deviceProgram.kernels[0];
    const fn = await module.getFunction({ name: entry.functionName, parameters: entry.parameters });
    for (const block of shapes) {
      const threads = block.x * block.y * block.z;
      const warps = Math.ceil(threads / 32);
      const blocks = 40;
      const groups = blocks * warps;
      const masks = Array.from({ length: groups }, (_, i) => i < 32 ? 2 ** i : [0, 0xffffffff, 0x55555555, 0xaaaaaaaa, 0x80000001, 0x17a629cd][i % 6]);
      const seeds = Array.from({ length: groups }, (_, i) => i < 32 ? 0xffffffff : [0, 0xffffffff, 0x55555555, 0xaaaaaaaa, (Math.imul(i + 1, 1664525) + 1013904223) >>> 0][i % 5]);
      const maskMemory = await runtime.allocateDevice({ byteLength: groups * 4 });
      const seedMemory = await runtime.allocateDevice({ byteLength: groups * 4 });
      const output = await runtime.allocateDevice({ byteLength: blocks * threads * 40 });
      await maskMemory.write(bytes(masks));
      await seedMemory.write(bytes(seeds));
      for (const mode of [0, 1, 2]) {
        const expected = Array(blocks * threads * 10).fill(0xdeadbeef);
        for (let b = 0; b < blocks; b++) {
          for (let t = 0; t < threads; t++) {
            const lane = t % 32;
            const group = b * warps + Math.floor(t / 32);
            const base = (b * threads + t) * 10;
            expected[base] = 32;
            expected[base + 1] = lane;
            if (!bit(masks[group], lane) || (mode === 2 && lane % 2)) continue;
            const lanes = Array.from({ length: Math.min(32, threads - Math.floor(t / 32) * 32) }, (_, i) => i)
              .filter((i) => bit(masks[group], i) && (mode !== 1 || i % 2 === lane % 2) && (mode !== 2 || i % 2 === 0));
            oracle(seeds[group], lanes).forEach((value, round) => { expected[base + 2 + round] = value; });
          }
        }
        await output.write(bytes(Array(expected.length).fill(0xdeadbeef)));
        // One operation; eight dependent device collectives; no intermediate host
        // read, write, callback, or additional submission advances the computation.
        const operation = await fn.submit({ grid: { x: blocks, y: 1, z: 1 }, block, arguments: [output, maskMemory, seedMemory, mode] });
        submissions++;
        const completion = await operation.wait();
        assert.equal(completion.status, 'completed');
        await operation.close();
        const result = (await output.read({ byteLength: expected.length * 4 })).bytes;
        const view = new DataView(result.buffer, result.byteOffset, result.byteLength);
        const actual = Array.from({ length: expected.length }, (_, i) => view.getUint32(i * 4, true));
        assert.deepEqual(actual, expected, JSON.stringify({ format, block, mode }));
        checkedWords += expected.length;
      }
      await output.close();
      await seedMemory.close();
      await maskMemory.close();
    }
    await fn.close();
    await module.close();
  }
  const description = await runtime.describe();
  profile = { profile: description.profile, device: description.device, driver: description.driver, compiler: description.compiler.provider };
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.resources.programsCreated, terminal.compiler.resources.programsDestroyed);
assert.equal(terminal.compiler.resources.linksCreated, terminal.compiler.resources.linksDestroyed);
assert.equal(terminal.driver.resourceCounts.live, 0);
assert.equal(terminal.driver.resourceCounts.closing, 0);
assert.equal(terminal.driver.resourceCounts.orphaned, 0);
console.log(JSON.stringify({ consumer: native ? 'native-warp32' : 'portable-warp32', publicOnly: true, native, identities, checkedWords, submissions, deviceRoundsPerSubmission: 8, graceful: terminal.graceful, profile, compilerResources: terminal.compiler.resources, driverResourceCounts: terminal.driver.resourceCounts }));
