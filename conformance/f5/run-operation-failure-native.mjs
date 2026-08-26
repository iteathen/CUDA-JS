import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { openCudaRuntime } from '../../components/runtime-facade/index.mjs';
import { capabilityPtxPath } from './evidence.mjs';

assert(['win32', 'linux'].includes(process.platform));
assert.equal(process.arch, 'x64');
assert.equal(process.version, 'v26.7.0');

const ptx = Uint8Array.from(await readFile(capabilityPtxPath));
const runtime = await openCudaRuntime({
  driver: {
    memory: { maxDeviceBytes: 4, maxAllocationBytes: 4, maxTransferBytes: 4 },
    execution: { maxModuleBytes: 1_048_576, maxArguments: 2, maxCompletionMilliseconds: 30_000 },
  },
});
let memory;
let module;
let fn;
let operation;
let failure;
let cleanupError;
let terminal;
try {
  memory = await runtime.allocateDevice({ byteLength: 4 });
  module = await runtime.loadModule({ format: 'ptx', bytes: ptx });
  fn = await module.getFunction({ name: 'cuda_js_native_deferred_fault', parameters: [{ kind: 'device-memory' }] });
  operation = await fn.submit({ grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [memory] });
  let status = { status: 'pending' };
  for (let attempt = 0; status.status === 'pending' && attempt < 21; attempt += 1) {
    try { status = await operation.status(); }
    catch (error) {
      cleanupError = { code: error.code, category: error.category, healthBefore: error.healthBefore, healthAfter: error.healthAfter, details: error.details };
      const primary = error.details?.primaryFailure;
      failure = {
        code: primary?.code,
        category: primary?.category,
        message: primary?.message,
        healthBefore: primary?.healthBefore,
        healthAfter: primary?.healthAfter,
        nativeStatus: primary?.details?.nativeStatus,
        nativeName: primary?.details?.nativeName,
        nativeDescription: primary?.details?.nativeDescription,
        observedAt: {
          driverCall: primary?.operation,
          operationSequence: primary?.operationId,
        },
        causalOperation: primary?.details?.causalOperation,
      };
      break;
    }
  }
  assert.equal(cleanupError.code, 'EXECUTION_EVENT_CLEANUP_UNPROVED');
  assert.equal(cleanupError.category, 'restart-required');
  assert.equal(cleanupError.healthBefore, 'poisoned');
  assert.equal(cleanupError.healthAfter, 'restart-required');
  assert(failure);
  assert.equal(failure.category, 'deferred-driver');
  assert.equal(failure.healthAfter, 'poisoned');
  assert.equal(failure.observedAt.driverCall, 'cuEventQuery');
  assert(Number.isSafeInteger(failure.observedAt.operationSequence));
  assert.equal(failure.causalOperation ?? null, null);
  assert(Number.isSafeInteger(failure.nativeStatus));
  assert.equal(typeof failure.nativeName, 'string');
  assert.equal(typeof failure.nativeDescription, 'string');
  await assert.rejects(runtime.allocateDevice({ byteLength: 1 }), (error) => ['DRIVER_RUNTIME_POISONED', 'DRIVER_RUNTIME_RESTART_REQUIRED', 'DRIVER_RESTART_REQUIRED', 'CUDA_JS_RUNTIME_CLOSED', 'CUDA_JS_RESOURCE_ORPHANED'].includes(error.code));
  await assert.rejects(operation.close(), (error) => ['DRIVER_RESTART_REQUIRED', 'DRIVER_RUNTIME_CLOSED', 'CUDA_JS_RUNTIME_CLOSED', 'CUDA_JS_RESOURCE_ORPHANED'].includes(error.code));
} finally {
  terminal = await runtime.close();
}
assert.equal(terminal.graceful, false);
assert.equal(terminal.restartRequired, true);
assert.equal(terminal.driver.cleanupClaim, 'unproved-worker-loss');
console.log(JSON.stringify({ status: 'pass', cleanupError, failure, terminal: { graceful: terminal.graceful, restartRequired: terminal.restartRequired, workerExitCode: terminal.driver.workerExitCode, cleanupClaim: terminal.driver.cleanupClaim, resourceCounts: terminal.driver.resourceCounts } }));
