import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { openMockDriverRuntime } from '../../components/driver-actor/testing.mjs';
import { parameterLayout } from '../../components/execution/index.mjs';
import { ptxPath, repositoryRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

const parameters = [{ kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'device-memory' }, { kind: 'u32' }];
const layout = parameterLayout(parameters);
assert.deepEqual(layout.entries.map((entry) => entry.offset), [0, 8, 16, 24]);
assert.equal(layout.byteLength, 28);
const ptx = Uint8Array.from(await readFile(ptxPath));
const { runtime } = await openMockDriverRuntime({ execution: { maxCompletionMilliseconds: 100 } });
const submitted = Uint8Array.from(ptx);
const loading = runtime.loadModule({ format: 'ptx', bytes: submitted });
submitted.fill(0);
const module = await loading;
const fn = await runtime.getFunction(module.module, { name: 'cuda_js_vector_add_u32', parameters });
const memory = await runtime.allocateDevice({ byteLength: 64 });
const completion = await runtime.launch(fn.function, {
  grid: { x: 1, y: 1, z: 1 }, block: { x: 32, y: 1, z: 1 },
  arguments: [
    { kind: 'device-memory', memory: memory.memory },
    { kind: 'device-memory', memory: memory.memory, byteOffset: 4 },
    { kind: 'device-memory', memory: memory.memory, byteOffset: 8 },
    { kind: 'u32', value: 8 },
  ],
});
assert.equal(completion.status, 'completed');
assert.equal(completion.pollCount, 2);
await runtime.releaseFunction(fn.function);
await runtime.releaseModule(module.module);
await runtime.releaseMemory(memory.memory);
const terminal = await runtime.close();
assert.equal(terminal.graceful, true);

const deferred = await openMockDriverRuntime();
const deferredModule = await deferred.runtime.loadModule({ format: 'ptx', bytes: ptx });
const deferredFunction = await deferred.runtime.getFunction(deferredModule.module, { name: 'deferred', parameters: [{ kind: 'device-memory' }] });
const deferredMemory = await deferred.runtime.allocateDevice({ byteLength: 8 });
await deferred.testing.setExecutionMode('deferred');
let deferredError;
try {
  await deferred.runtime.launch(deferredFunction.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: deferredMemory.memory }],
  });
} catch (error) {
  deferredError = { code: error.code, category: error.category, healthAfter: error.healthAfter };
}
assert.deepEqual(deferredError, { code: 'CUDA_DEFERRED_FAILURE', category: 'deferred-driver', healthAfter: 'poisoned' });
await deferred.runtime.releaseFunction(deferredFunction.function);
await deferred.runtime.releaseModule(deferredModule.module);
await deferred.runtime.releaseMemory(deferredMemory.memory);
assert.equal((await deferred.runtime.close()).graceful, true);

const timeout = await openMockDriverRuntime({ execution: { maxCompletionMilliseconds: 3 } });
const timeoutModule = await timeout.runtime.loadModule({ format: 'ptx', bytes: ptx });
const timeoutFunction = await timeout.runtime.getFunction(timeoutModule.module, { name: 'timeout', parameters: [{ kind: 'device-memory' }] });
const timeoutMemory = await timeout.runtime.allocateDevice({ byteLength: 8 });
await timeout.testing.setExecutionMode('timeout');
let timeoutError;
try {
  await timeout.runtime.launch(timeoutFunction.function, {
    grid: { x: 1, y: 1, z: 1 }, block: { x: 1, y: 1, z: 1 }, arguments: [{ kind: 'device-memory', memory: timeoutMemory.memory }],
  });
} catch (error) {
  timeoutError = { code: error.code, category: error.category, healthAfter: error.healthAfter };
}
assert.deepEqual(timeoutError, { code: 'EXECUTION_COMPLETION_TIMEOUT', category: 'restart-required', healthAfter: 'restart-required' });
const deadline = Date.now() + 1_000;
while (timeout.runtime.state !== 'restart-required' && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 5));
const timeoutTerminal = timeout.runtime.terminalReport;
assert.equal(timeoutTerminal.inventory.resources.find((entry) => entry.kind === 'event').state, 'orphaned');
assert.equal(timeoutTerminal.inventory.resources.find((entry) => entry.kind === 'function').leases, 1);
assert.equal(timeoutTerminal.inventory.resources.find((entry) => entry.kind === 'device-memory').leases, 1);

const sources = [
  'docs/specs/SPEC-0005-module-launch-completion.md',
  'components/execution/src/execution-manager.mjs',
  'components/memory/src/memory-manager.mjs',
  'components/driver-actor/src/protocol.mjs',
  'components/driver-actor/src/backends/mock.mjs',
  'conformance/f5/fixtures/vector-add.ptx.txt',
];
const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F5W',
  capsule: 'platform-neutral-launch-completion-mock',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, kernel: os.release() },
  sources: await sourceIdentity(sources),
  observations: { module: { byteLength: module.byteLength, sha256: module.sha256 }, parameterLayout: layout, completion, deferredError, terminal, timeoutError, timeoutTerminal },
  claimLimits: ['Control-plane orchestration mock only.', 'The mock does not interpret PTX or establish any CUDA ABI, Driver, GPU, native cleanup, native Linux CUDA, or performance claim.'],
};
const target = await writeEvidence('mock.json', evidence);
console.log('F5 portable mock passed: copied PTX identity, aligned packing, terminal polling, deferred provenance, teardown, and timeout loss accounting.');
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
