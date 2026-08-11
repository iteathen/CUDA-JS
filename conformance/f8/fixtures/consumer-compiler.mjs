import assert from 'node:assert/strict';

import { CUDA_JS_COMPATIBILITY as compatibilitySubpath } from 'cuda-js/compatibility';
import { openCudaRuntimeForTesting } from 'cuda-js/testing';

const runtime = await openCudaRuntimeForTesting({ compiler: true });
const source = 'extern "C" __global__ void portable_consumer() {}\n';
const compiled = await runtime.compile({ source, name: 'portable-consumer.cu' });
const linked = await runtime.link({ inputs: [compiled.artifact] });
assert.equal(compiled.artifact.format, 'ptx');
assert.equal(linked.artifact.format, 'cubin');
assert.match(compiled.artifact.sha256, /^[a-f0-9]{64}$/);
assert.match(linked.artifact.sha256, /^[a-f0-9]{64}$/);
const description = await runtime.describe();
assert.equal(description.package.version, compatibilitySubpath.package.version);
assert.equal(description.compiler.claim, 'platform-neutral-compiler-mock-only');
assert.equal(Object.hasOwn(description.compiler, 'runtime'), false);
const terminal = await runtime.close();
assert.equal(terminal.graceful, true);
assert.equal(terminal.compiler.workerExitCode, 0);

console.log(JSON.stringify({ consumer: 'portable-compiler', packageVersion: compatibilitySubpath.package.version, ptx: compiled.artifact.sha256, cubin: linked.artifact.sha256, graceful: terminal.graceful }));
