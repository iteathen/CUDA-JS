import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { openDriverRuntime } from '../../components/driver-actor/index.mjs';
import { assertPublicRecord } from '../../components/driver-actor/src/protocol.mjs';
import { checksumBytes, fixtureBytes, oraclePath, parseOracle, patchBytes, repositoryRoot, sha256, sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F4W native conformance requires Windows.');
assert.equal(process.arch, 'x64', 'F4W native conformance requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F4W native conformance requires official Node v26.7.0.');

const oracleRun = spawnSync(oraclePath, [], { cwd: repositoryRoot, encoding: 'utf8' });
if (oracleRun.error) throw oracleRun.error;
if (oracleRun.status !== 0) throw new Error(`F4W oracle failed (${oracleRun.status}).\n${oracleRun.stdout}\n${oracleRun.stderr}`);
const oracle = parseOracle(oracleRun.stdout);
const sources = [
  'docs/specs/SPEC-0004-device-memory-foundation.md',
  'components/memory/src/memory-manager.mjs',
  'components/driver-actor/src/driver-runtime.mjs',
  'components/driver-actor/src/actor-worker.mjs',
  'components/driver-actor/src/backends/windows-native.mjs',
  'components/driver-actor/src/backends/native-profiles.mjs',
  'components/driver-actor/src/backends/native.mjs',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'conformance/f4/native/windows-memory-oracle.c',
];
const runtime = await openDriverRuntime({ memory: { maxDeviceBytes: 4_096, maxAllocationBytes: 4_096, maxTransferBytes: 4_096 } });
let description;
let allocation;
let checksum;
let rangeError;
let pressureError;
let staleError;
let replacement;
let terminal;
try {
  description = assertPublicRecord(await runtime.describe(), { maxByteLength: 4_096 });
  assert.equal(description.claim, 'exact-windows-f4w-profile');
  assert.equal(description.memory.policy.maxDeviceBytes, 4_096);
  assert(description.memory.native.totalBytes >= description.memory.native.freeBytes);
  allocation = await runtime.allocateDevice({ byteLength: 4_096 });
  const fixture = fixtureBytes();
  const expected = Uint8Array.from(fixture);
  await runtime.writeDevice(allocation.memory, fixture);
  const patch = patchBytes();
  expected.set(patch, 777);
  await runtime.writeDevice(allocation.memory, patch, { deviceOffset: 777 });
  const read = assertPublicRecord(await runtime.readDevice(allocation.memory, { byteLength: 4_096 }), { maxByteLength: 4_096 });
  assert.deepEqual(read.bytes, expected);
  checksum = checksumBytes(read.bytes);
  assert.equal(checksum, oracle.RESULT[1]);

  try { await runtime.readDevice(allocation.memory, { deviceOffset: 4_096, byteLength: 1 }); } catch (error) { rangeError = { code: error.code, category: error.category }; }
  try { await runtime.allocateDevice({ byteLength: 1 }); } catch (error) { pressureError = { code: error.code, category: error.category }; }
  assert.deepEqual(rangeError, { code: 'MEMORY_RANGE_OUT_OF_BOUNDS', category: 'validation' });
  assert.deepEqual(pressureError, { code: 'MEMORY_QUOTA_EXCEEDED', category: 'pressure' });
  assert.equal(runtime.health, 'healthy');
  assert.deepEqual((await runtime.readDevice(allocation.memory, { byteLength: 4_096 })).bytes, expected);
  const release = await runtime.releaseMemory(allocation.memory);
  assert.equal(release.usage.reservedBytes, 0);
  try { await runtime.memoryStatus(allocation.memory); } catch (error) { staleError = { code: error.code, category: error.category }; }
  assert.equal(staleError.code, 'RESOURCE_CLOSED');
  replacement = await runtime.allocateDevice({ byteLength: 1_024 });
  assert.equal(replacement.memory.slot, allocation.memory.slot);
  assert(replacement.memory.generation > allocation.memory.generation);
} finally {
  terminal = assertPublicRecord(await runtime.close(), { maxByteLength: 4_096 });
}
assert.equal(terminal.graceful, true);
assert.deepEqual(terminal.teardown.dispositions.map((entry) => entry.resource.kind), ['device-memory', 'context', 'library']);
assert.deepEqual(terminal.teardown.inventory.counts, { live: 0, closing: 0, closed: 3, orphaned: 0 });
assert.equal(terminal.workerExitCode, 0);
assert.deepEqual(oracle.FREE, [0]);
assert.deepEqual(oracle.CURRENT_NULL, [0, 1]);

const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F4W',
  capsule: 'windows-driver-actor-device-memory',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: { version: process.version, executableSha256: await sha256(process.execPath) }, platform: process.platform, architecture: process.arch, osVersion: os.version() },
  sources: await sourceIdentity(sources),
  oracle: { executableSha256: await sha256(oraclePath), observations: oracle },
  observations: {
    memory: description.memory,
    allocation: { kind: allocation.kind, byteLength: allocation.byteLength, tokenKind: allocation.memory.kind },
    checksum,
    oracleChecksum: oracle.RESULT[1],
    rangeError,
    pressureError,
    staleError,
    replacement: { byteLength: replacement.byteLength, reusedSlot: replacement.memory.slot === allocation.memory.slot, generationAdvanced: replacement.memory.generation > allocation.memory.generation },
    terminal,
  },
  rawPointerBoundary: 'All public records passed the bounded validator; evidence stores only opaque tokens, safe counts, checksums, and dispositions.',
  claimLimits: ['Exact accepted Windows x64 Node 26.7.0 / CUDA Driver / toolkit / GPU profile only.', 'Synchronous bounded device allocation and copied transfers only.', 'No native Linux CUDA, asynchronous copy, module, launch, compiler, performance, packaging, or stable API claim.'],
};
const target = await writeEvidence('native-windows.json', evidence);
console.log(`F4W native memory passed: 4096-byte C/Node parity checksum ${checksum}, bounds and pressure controls, slot reuse, free-before-context teardown.`);
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
