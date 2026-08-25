import assert from 'node:assert/strict';
import test from 'node:test';

import { compileDeviceProgram } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

const request = {
  source: `
function mix(x) {
  return x ^ gpu.u32(17);
}
function kernel(out, input, n) {
  let i = gpu.thread.globalX();
  if (i >= n) {
    return;
  }
  let value = input[i];
  let count = gpu.u32(0);
  while (count < gpu.u32(2)) {
    value = mix(value);
    count++;
  }
  out[i] = value;
}
`,
  functions: [
    { name: 'mix', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
    {
      name: 'kernel',
      kind: 'kernel',
      parameters: [
        { name: 'out', type: 'ptr<u32>' },
        { name: 'input', type: 'ptr<u32>' },
        { name: 'n', type: 'u32' },
      ],
      returns: 'void',
    },
  ],
};

test('public Device-JS bridge translates privately then reuses CompilerActor', { timeout: 10_000 }, async () => {
  const runtime = await openCudaRuntimeForTesting({ compiler: true });
  try {
    const result = await compileDeviceProgram(runtime, request);
    assert.equal(result.schemaVersion, 1);
    assert.equal(result.deviceProgram.contract, 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0014-publication-mailbox-v1');
    assert.equal(result.deviceProgram.parser.name, 'acorn');
    assert.equal(result.deviceProgram.kernels.length, 1);
    assert.deepEqual(result.deviceProgram.kernels[0].parameters, [
      { kind: 'device-memory' },
      { kind: 'device-memory' },
      { kind: 'u32' },
    ]);
    assert.equal(result.compiler.artifact.format, 'ptx');
    assert.equal(Object.hasOwn(result, 'generatedSource'), false);
    assert.equal(JSON.stringify(result).includes('__global__'), false);
    assert.equal(JSON.stringify(result).includes('threadIdx'), false);
  } finally {
    assert.equal((await runtime.close()).graceful, true);
  }
});
