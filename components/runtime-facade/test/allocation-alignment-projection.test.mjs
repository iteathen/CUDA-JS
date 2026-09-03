import assert from 'node:assert/strict';
import test from 'node:test';

import { openCudaRuntimeForTesting } from '../testing.mjs';

test('public allocation request rejects caller-selected alignment before lower work', async () => {
  const runtime = await openCudaRuntimeForTesting();
  try {
    await assert.rejects(
      runtime.allocateDevice({ byteLength: 8, alignment: 256 }),
      (error) => error?.code === 'CUDA_JS_MEMORY_OPTIONS_INVALID' && error?.category === 'validation',
    );
  } finally {
    await runtime.close();
  }
});
