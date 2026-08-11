import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { inventoryHeaderProfile } from '../../components/compiler-actor/testing.mjs';
import { writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'linux', 'F9 Linux readiness requires native Linux.');
assert.equal(process.arch, 'x64', 'F9 Linux readiness requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F9 Linux readiness requires exact Node v26.7.0.');

const candidates = [
  '/usr/local/cuda-13.3/include/cccl',
  '/usr/local/cuda/include/cccl',
];
let selected = null;
let observed = null;
let error = null;
for (const candidate of candidates) {
  if (!existsSync(candidate)) continue;
  try {
    const inventory = await inventoryHeaderProfile(candidate, ['cuda', 'nv']);
    selected = candidate;
    observed = inventory.observed;
    break;
  } catch (caught) {
    error = { code: caught.code ?? 'F9_LINUX_READINESS_FAILED', message: caught.message };
    selected = candidate;
    break;
  }
}

const record = {
  schemaVersion: 1,
  workPackage: 'CJS-F9L-readiness',
  capsule: 'native-linux-cccl-header-profile-readiness',
  status: observed ? 'inventory-ready' : 'not-ready',
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    nodeAbi: process.versions.modules,
    platform: process.platform,
    architecture: process.arch,
    kernel: os.release(),
    osVersion: os.version(),
  },
  candidates,
  selected,
  observed,
  error,
  next: observed
    ? 'Create a separately reviewed Linux manifest only after exact provenance, native CompilerActor, independent NVRTC parity, public package compile, Driver launch, and cleanup evidence pass.'
    : 'Install or expose the exact CUDA 13.3 x86-64 CCCL roots, then rerun this bounded readiness probe.',
  claimLimits: [
    'Readiness and path-free header inventory only.',
    'No Linux NVRTC compilation, CUDA Driver launch, device publication, native cleanup, compatible-pair, or support claim.',
    'The Windows header digest is not reused as Linux authority.',
  ],
};
const target = await writeEvidence('readiness.json', record);
console.log(`F9 Linux CCCL readiness: ${record.status}. Evidence: ${path.relative(process.cwd(), target)}`);
