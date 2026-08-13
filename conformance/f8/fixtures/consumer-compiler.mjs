import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY as compatibilitySubpath } from 'cuda-js/compatibility';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

assert.deepEqual(compatibilitySubpath.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
assert.equal(compatibilitySubpath.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
assert.deepEqual(compatibilitySubpath.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);

const runtime = await openCudaRuntimeForTesting({ compiler: true });
const source = 'extern "C" __global__ void portable_consumer() {}\n';
const compiled = await runtime.compile({ source, name: 'portable-consumer.cu' });
const relocatable = await runtime.compile({ source, name: 'portable-consumer-rdc.cu', options: { relocatableDeviceCode: true } });
const ltoFirst = await runtime.compile({ source, name: 'portable-consumer-lto-a.cu', output: 'lto-ir' });
const ltoSecond = await runtime.compile({ source: `${source}// second unit\n`, name: 'portable-consumer-lto-b.cu', output: 'lto-ir' });
const linked = await runtime.link({ inputs: [compiled.artifact] });
const ltoLinked = await runtime.link({ inputs: [ltoFirst.artifact, ltoSecond.artifact] });
assert.equal(compiled.artifact.format, 'ptx');
assert.equal(relocatable.artifact.format, 'ptx');
assert.equal(relocatable.artifact.relocatableDeviceCode, true);
assert.equal(ltoFirst.artifact.format, 'lto-ir');
assert.equal(ltoLinked.artifact.format, 'cubin');
assert.equal(linked.artifact.format, 'cubin');
assert.match(compiled.artifact.sha256, /^[a-f0-9]{64}$/);
assert.match(relocatable.artifact.sha256, /^[a-f0-9]{64}$/);
assert.match(ltoFirst.artifact.sha256, /^[a-f0-9]{64}$/);
assert.match(ltoLinked.artifact.sha256, /^[a-f0-9]{64}$/);
assert.notEqual(compiled.cache.key, relocatable.cache.key);
assert.notEqual(compiled.cache.key, ltoFirst.cache.key);
const description = await runtime.describe();
assert.equal(description.package.version, compatibilitySubpath.package.version);
assert.equal(description.compiler.claim, 'platform-neutral-compiler-mock-only');
assert.equal(Object.hasOwn(description.compiler, 'runtime'), false);
const terminal = await runtime.close();
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.workerExitCode, 0);

console.log(JSON.stringify({ consumer: 'portable-compiler', packageVersion: compatibilitySubpath.package.version, ptx: compiled.artifact.sha256, rdc: relocatable.artifact.sha256, ltoIr: ltoFirst.artifact.sha256, ltoCubin: ltoLinked.artifact.sha256, cubin: linked.artifact.sha256, graceful: terminal.graceful }));
