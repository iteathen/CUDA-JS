import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { DEVICE_MEMORY_ALLOCATION_MINIMUM_ALIGNMENT_BYTES } from '../../memory/index.mjs';
import { PREPARED_OPERATION_DAG_LIMITS } from '../../prepared-execution/index.mjs';
import { CUDA_JS_COMPATIBILITY } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';

async function deviceJsParameterLimit() {
  const source = await readFile(new URL('../../device-js/src/translator.mjs', import.meta.url), 'utf8');
  const match = /^const PARAMETER_LIMIT = (\d+);$/m.exec(source);
  assert(match, 'Device-JS translator must retain one explicit PARAMETER_LIMIT owner.');
  return Number(match[1]);
}

test('public compatibility projects finite lower limits without drift', async () => {
  assert.equal(
    CUDA_JS_COMPATIBILITY.capabilities.deviceMemoryAllocationMinimumAlignmentBytes,
    DEVICE_MEMORY_ALLOCATION_MINIMUM_ALIGNMENT_BYTES,
  );
  assert.equal(DEVICE_MEMORY_ALLOCATION_MINIMUM_ALIGNMENT_BYTES, 256);
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits, PREPARED_OPERATION_DAG_LIMITS);
  assert.deepEqual(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits, {
    parametersPerFunction: await deviceJsParameterLimit(),
  });
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY), true);
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities), true);
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits), true);
  assert.equal(Object.isFrozen(CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits), true);
});

test('public allocation does not gain caller-selected alignment', async () => {
  const runtime = await openCudaRuntimeForTesting();
  try {
    await assert.rejects(
      runtime.allocateDevice({ byteLength: 8, alignment: 256 }),
      (error) => error?.code === 'DRIVER_MEMORY_OPTIONS' && error?.category === 'validation',
    );
  } finally {
    await runtime.close();
  }
});
