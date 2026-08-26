import assert from 'node:assert/strict';

import { compileDeviceLibrary, compileDeviceProgram } from 'cuda-js';
import { CUDA_JS_COMPATIBILITY as compatibilitySubpath } from 'cuda-js/compatibility';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

assert.deepEqual(compatibilitySubpath.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
assert.equal(compatibilitySubpath.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
assert.deepEqual(compatibilitySubpath.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);
assert.equal(compatibilitySubpath.capabilities.deviceJsFrontend, 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1+spec-0022-device-publication-v1+spec-0014-publication-mailbox-v1');
assert.equal(compatibilitySubpath.capabilities.deviceJsLibraries, 'typed-leaf-libraries-explicit-aliased-imports-rdc-or-lto-final-cubin');

const runtime = await openCudaRuntimeForTesting({ compiler: true });
const source = 'extern "C" __global__ void portable_consumer() {}\n';
const compiled = await runtime.compile({ source, name: 'portable-consumer.cu' });
const relocatable = await runtime.compile({ source, name: 'portable-consumer-rdc.cu', options: { relocatableDeviceCode: true } });
const ltoFirst = await runtime.compile({ source, name: 'portable-consumer-lto-a.cu', output: 'lto-ir' });
const ltoSecond = await runtime.compile({ source: `${source}// second unit\n`, name: 'portable-consumer-lto-b.cu', output: 'lto-ir' });
const linked = await runtime.link({ inputs: [compiled.artifact] });
const ltoLinked = await runtime.link({ inputs: [ltoFirst.artifact, ltoSecond.artifact] });
const deviceJs = await compileDeviceProgram(runtime, {
  source: 'function portableKernel() { gpu.barrier.block(); }',
  functions: [{ name: 'portableKernel', kind: 'kernel', parameters: [], returns: 'void' }],
  compile: { architecture: 'compute_120' },
});
const devicePublication = await compileDeviceProgram(runtime, {
  source: 'function publish(payload, ready32, ready64) { payload[gpu.u32(0)] = gpu.u32(17); gpu.atomic.storeReleaseDevice(ready32, gpu.u32(0), gpu.u32(3)); gpu.atomic.storeReleaseDevice(ready64, gpu.u32(0), gpu.u64(3n)); let observed32 = gpu.atomic.loadAcquireDevice(ready32, gpu.u32(0)); let observed64 = gpu.atomic.loadAcquireDevice(ready64, gpu.u32(0)); }',
  functions: [{ name: 'publish', kind: 'kernel', parameters: [
    { name: 'payload', type: 'ptr<u32>' },
    { name: 'ready32', type: 'ptr<u32>' },
    { name: 'ready64', type: 'ptr<u64>' },
  ], returns: 'void' }],
  compile: { architecture: 'compute_120', headerProfile: 'cuda-cccl' },
});
const deviceLibrary = await compileDeviceLibrary(runtime, {
  source: 'function combine(x, y) { return x + y; }',
  functions: [{ name: 'combine', kind: 'device', parameters: [{ name: 'x', type: 'u32' }, { name: 'y', type: 'u32' }], returns: 'u32' }],
  exports: ['combine'],
  compile: { architecture: 'compute_120' },
});
const composedFirst = await compileDeviceProgram(runtime, {
  source: 'function first(out) { out[gpu.u32(0)] = add(gpu.u32(2), gpu.u32(3)); }',
  functions: [{ name: 'first', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  imports: [{ library: deviceLibrary.library, name: 'combine', as: 'add' }],
  compile: { architecture: 'compute_120' },
});
const composedSecond = await compileDeviceProgram(runtime, {
  source: 'function second(out) { out[gpu.u32(0)] = merge(gpu.u32(5), gpu.u32(8)); }',
  functions: [{ name: 'second', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  imports: [{ library: deviceLibrary.library, name: 'combine', as: 'merge' }],
  compile: { architecture: 'compute_120' },
});

assert.equal(compiled.artifact.format, 'ptx');
assert.equal(relocatable.artifact.format, 'ptx');
assert.equal(relocatable.artifact.relocatableDeviceCode, true);
assert.equal(ltoFirst.artifact.format, 'lto-ir');
assert.equal(ltoLinked.artifact.format, 'cubin');
assert.equal(linked.artifact.format, 'cubin');
assert.equal(deviceJs.deviceProgram.contract, 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1');
assert.equal(deviceJs.deviceProgram.parser.name, 'acorn');
assert.equal(deviceJs.deviceProgram.parser.version, '8.15.0');
assert.equal(deviceJs.deviceProgram.kernels[0].name, 'portableKernel');
assert.equal(deviceJs.compiler.artifact.format, 'ptx');
assert.equal(deviceJs.compiler.artifact.architecture, 'compute_120');
assert.equal(devicePublication.deviceProgram.contract, deviceJs.deviceProgram.contract);
assert.equal(devicePublication.compiler.artifact.format, 'ptx');
assert.equal(deviceLibrary.library.artifact.relocatableDeviceCode, true);
assert.equal(composedFirst.linker.artifact.format, 'cubin');
assert.equal(composedSecond.linker.artifact.format, 'cubin');
assert.notEqual(composedFirst.deviceProgram.sha256, composedSecond.deviceProgram.sha256);
for (const artifact of [compiled.artifact, relocatable.artifact, ltoFirst.artifact, linked.artifact, ltoLinked.artifact, deviceJs.compiler.artifact, devicePublication.compiler.artifact, deviceLibrary.library.artifact, composedFirst.linker.artifact, composedSecond.linker.artifact]) {
  assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
}
assert.notEqual(compiled.cache.key, relocatable.cache.key);
assert.notEqual(compiled.cache.key, ltoFirst.cache.key);
const description = await runtime.describe();
assert.equal(description.package.version, compatibilitySubpath.package.version);
assert.equal(description.compiler.claim, 'platform-neutral-compiler-mock-only');
assert.equal(Object.hasOwn(description.compiler, 'runtime'), false);
const terminal = await runtime.close();
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.workerExitCode, 0);

console.log(JSON.stringify({
  consumer: 'portable-compiler',
  packageVersion: compatibilitySubpath.package.version,
  ptx: compiled.artifact.sha256,
  rdc: relocatable.artifact.sha256,
  ltoIr: ltoFirst.artifact.sha256,
  ltoCubin: ltoLinked.artifact.sha256,
  cubin: linked.artifact.sha256,
  deviceJs: deviceJs.compiler.artifact.sha256,
  deviceJsProgram: deviceJs.deviceProgram.sha256,
  devicePublication: devicePublication.deviceProgram.sha256,
  deviceLibrary: deviceLibrary.library.sha256,
  composedFirst: composedFirst.deviceProgram.sha256,
  composedSecond: composedSecond.deviceProgram.sha256,
  deviceJsParser: deviceJs.deviceProgram.parser,
  graceful: terminal.graceful,
}));
