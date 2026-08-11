import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';

import { openMockDriverRuntime } from '../../components/driver-actor/testing.mjs';
import { checksumBytes, fixtureBytes, patchBytes, repositoryRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

const sources = [
  'docs/specs/SPEC-0004-device-memory-foundation.md',
  'components/memory/src/memory-manager.mjs',
  'components/driver-actor/src/protocol.mjs',
  'components/driver-actor/src/backends/mock.mjs',
];
const options = { memory: { maxDeviceBytes: 8_192, maxAllocationBytes: 4_096, maxTransferBytes: 4_096 } };
const { runtime } = await openMockDriverRuntime(options);
const allocation = await runtime.allocateDevice({ byteLength: 4_096 });
const fixture = fixtureBytes();
const expected = Uint8Array.from(fixture);
await runtime.writeDevice(allocation.memory, fixture);
const patch = patchBytes();
expected.set(patch, 777);
await runtime.writeDevice(allocation.memory, patch, { deviceOffset: 777 });
const read = await runtime.readDevice(allocation.memory, { byteLength: 4_096 });
assert.deepEqual(read.bytes, expected);
const checksum = checksumBytes(read.bytes);

let rangeError;
try { await runtime.readDevice(allocation.memory, { deviceOffset: 4_096, byteLength: 1 }); } catch (error) { rangeError = { code: error.code, category: error.category }; }
assert.deepEqual(rangeError, { code: 'MEMORY_RANGE_OUT_OF_BOUNDS', category: 'validation' });
assert.equal(runtime.health, 'healthy');
const release = await runtime.releaseMemory(allocation.memory);
assert.equal(release.usage.reservedBytes, 0);
const terminal = await runtime.close();
assert.equal(terminal.graceful, true);

const loss = await openMockDriverRuntime(options);
await loss.runtime.allocateDevice({ byteLength: 1_024 });
const lossTerminal = await loss.testing.terminateActor();
assert.equal(lossTerminal.inventory.counts.orphaned, 3);
assert.equal(lossTerminal.memory.reservedBytes, 1_024);

const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F4',
  capsule: 'platform-neutral-device-memory-mock',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, kernel: os.release() },
  sources: await sourceIdentity(sources),
  observations: { byteLength: read.byteLength, checksum, rangeError, release, terminal, unexpectedLoss: lossTerminal },
  claimLimits: ['Owned-byte lifecycle mock only.', 'No CUDA ABI, Driver, GPU, native cleanup, Linux CUDA, or performance claim.'],
};
const target = await writeEvidence('mock.json', evidence);
console.log(`F4 portable mock passed: exact copied bytes, checksum ${checksum}, quota release, range rejection, teardown, and loss accounting.`);
console.log(`Evidence: ${path.relative(repositoryRoot, target)}`);
