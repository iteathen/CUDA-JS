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
const nativeProfile = inspection.compatibility.nativeProfiles.find((profile) => profile.host === inspection.host.hostKind);
assert(nativeProfile, 'The compatibility manifest must classify this native Linux host.');
const admission = { status: 'not-attempted' };
if (inspection.host.hostKind === 'linux-native-x64') {
  assert.equal(nativeProfile.status, 'testing-unconfirmed-by-default');
  assert.equal(nativeProfile.qualification, 'not-qualified');
  let runtime;
  try {
    runtime = await openCudaRuntime();
    const description = await runtime.describe();
    const terminal = await runtime.close();
    Object.assign(admission, { status: 'operational-unqualified', support: description.support.status, graceful: terminal.graceful, workerExitCode: terminal.driver?.workerExitCode ?? null });
    assert.equal(description.support.status, 'testing-unconfirmed');
    assert.equal(terminal.graceful, true);
  } catch (error) {
    if (runtime) await runtime.close();
    const readinessBlockers = new Set(['DRIVER_LIBRARY_MISSING', 'DRIVER_LIBRARY_NONCANONICAL', 'DRIVER_LIBRARY_AMBIGUOUS', 'DRIVER_DEVICE_MISSING', 'CUDA_DRIVER_FAILURE']);
    assert(readinessBlockers.has(error?.code), `Unexpected Linux facade admission failure: ${error?.code ?? 'UNKNOWN'}`);
    Object.assign(admission, { status: 'environment-blocked', code: error.code, category: error.category });
  }
} else {
  assert.equal(nativeProfile.status, 'backend-unavailable');
  let error;
  try { await openCudaRuntime(); } catch (caught) { error = caught; }
  assert.equal(error?.code, 'CUDA_JS_LINUX_BACKEND_UNAVAILABLE');
  Object.assign(admission, { status: 'backend-unavailable', code: error.code, category: error.category });
}

const remainingGates = [
  'run native F2L through F6L Driver, context, memory, execution, compiler, and cleanup evidence',
  'complete and run F7L permission and repeated native lifecycle evidence',
  'complete and run the installed-package native Linux consumers against independent C oracles',
  'update the exact compatibility profile only after native provider and terminal cleanup evidence pass',
];
const target = await writeEvidence('linux-readiness.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F8L',
  capsule: 'native-linux-package-readiness',
  status: inspection.host.hostKind === 'linux-native-x64' ? 'facade-source-ready-not-qualified' : 'backend-unavailable',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, hostKind: inspection.host.hostKind },
  sources: await sourceIdentity(['docs/specs/SPEC-0008-package-public-facade.md', 'conformance/f8/README.md', 'components/runtime-facade/src/runtime.mjs']),
  observations: { portablePackage: portable.status, compatibility: { status: nativeProfile.status, qualification: nativeProfile.qualification ?? null }, admission },
  remainingGates,
  claimLimits: ['Package installation, import, mock consumer, and native Linux x64 facade source admission only.', 'Operational readiness, if observed, remains testing-unconfirmed and does not qualify a provider, Driver, GPU, compiler, execution, or cleanup profile.'],
});
console.log(`F8 Linux readiness retained ${remainingGates.length} native qualification gates for ${inspection.host.hostKind}; evidence: ${target}`);
