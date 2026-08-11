import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import os from 'node:os';

import { inspectHostProfile } from '../../components/platform-diagnostics/index.mjs';
import { sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'linux', 'F7 Linux readiness requires native Linux.');
assert.equal(process.version, 'v26.7.0', 'F7 Linux readiness requires exact Node v26.7.0.');
let procVersion = '';
try { procVersion = (await readFile('/proc/version', 'utf8')).trim(); } catch {}
const host = inspectHostProfile({ osRelease: os.release(), osVersion: os.version(), procVersion });
assert(!host.hostKind.startsWith('wsl'), 'WSL cannot supply native Linux qualification evidence.');
assert(['linux-native-x64', 'linux-native-arm64'].includes(host.hostKind), 'F7 Linux readiness requires native Linux x64 or ARM64.');

await writeEvidence('linux-readiness.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F7L',
  capsule: 'native-linux-platform-handoff-readiness',
  status: 'prepared-not-qualified',
  generatedAt: new Date().toISOString(),
  host,
  sources: await sourceIdentity(['docs/specs/SPEC-0007-windows-platform-hardening.md', 'conformance/f7/README.md']),
  remainingGates: host.hostKind === 'linux-native-arm64'
    ? ['independent ARM64 ABI/layout oracle', 'canonical ARM64 Driver and compiler providers', 'device/context/memory/execution/compiler parity', 'permission and terminal cleanup evidence']
    : ['retained F2L through F6L native Driver/GPU/provider gates', 'F7 permission and repeated native lifecycle evidence'],
  claimLimits: ['Host classification and handoff readiness only.', 'No Driver, compiler, GPU, WSL, or native Linux CUDA success claim.'],
});

console.log(`F7 Linux readiness passed for ${host.hostKind}: platform is classified and the native qualification gates remain explicit.`);
