import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { inspectCudaHost, openCudaRuntime } from '../../components/runtime-facade/index.mjs';
import { evidenceRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'linux', 'F8 Linux readiness requires native Linux.');
assert(['x64', 'arm64'].includes(process.arch), 'F8 Linux readiness requires Linux x64 or ARM64.');
assert.equal(process.version, 'v26.7.0');
const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable-package.json'), 'utf8'));
assert.equal(portable.status, 'pass');
const inspection = inspectCudaHost();
assert(['linux-native-x64', 'linux-native-arm64'].includes(inspection.host.hostKind));
let error;
try { await openCudaRuntime(); } catch (caught) { error = caught; }
assert.equal(error?.code, 'CUDA_JS_LINUX_BACKEND_UNAVAILABLE');
assert.equal(error?.category, 'unsupported');

const remainingGates = [
  'complete native F2L through F7L Driver, context, memory, execution, permission, stress, and cleanup evidence',
  'implement canonical libcuda.so.1, NVRTC, and nvJitLink adapters without changing the public facade',
  'run the installed-package native vector consumer against an independent C oracle',
  'update the exact compatibility profile only after native provider and terminal cleanup evidence pass',
];
const target = await writeEvidence('linux-readiness.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F8L',
  capsule: 'native-linux-package-readiness',
  status: 'backend-unavailable',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, hostKind: inspection.host.hostKind },
  sources: await sourceIdentity(['docs/specs/SPEC-0008-package-public-facade.md', 'conformance/f8/README.md', 'components/runtime-facade/src/runtime.mjs']),
  observations: { portablePackage: portable.status, nativeOpenCode: error.code, nativeOpenCategory: error.category },
  remainingGates,
  claimLimits: ['Package installation, import, mock consumer, and explicit backend-unavailable readiness only.', 'No native Linux CUDA provider, Driver, GPU, compiler, execution, or cleanup support claim.'],
});
console.log(`F8 Linux readiness retained ${remainingGates.length} native qualification gates for ${inspection.host.hostKind}; evidence: ${target}`);
