import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  extensionsPath,
  generatedDocumentMatches,
  profilesPath,
  registryPath,
  renderSupportDocument,
  validateRegistry,
} from './qualification.mjs';
import { classifyHyperVReadiness } from './hyperv-readiness.mjs';

async function fixtures() {
  return {
    registry: JSON.parse(await readFile(registryPath, 'utf8')),
    profiles: JSON.parse(await readFile(profilesPath, 'utf8')),
    extensions: JSON.parse(await readFile(extensionsPath, 'utf8')),
  };
}

test('accepted exact hardware profile satisfies promotion invariants', async () => {
  const { registry, profiles, extensions } = await fixtures();
  assert.doesNotThrow(() => validateRegistry(registry, profiles, extensions));
  const rendered = renderSupportDocument(registry, profiles, extensions);
  assert.match(rendered, /GeForce GTX 1660 Ti/);
  assert.match(rendered, /seeking evidence/);
  assert.match(rendered, /Linux ARM64 SBSA/);
});

test('generated support checks accept Windows checkout line endings without hiding content changes', () => {
  const rendered = '# Hardware\n\nCurrent.\n';
  assert.equal(generatedDocumentMatches(rendered.replaceAll('\n', '\r\n'), rendered), true);
  assert.equal(generatedDocumentMatches('# Hardware\r\n\r\nStale.\r\n', rendered), false);
});

test('portable evidence cannot promote a hardware profile', async () => {
  const { registry, profiles, extensions } = await fixtures();
  registry.qualifiedProfiles[0].evidence.directHardware = false;
  assert.throws(() => validateRegistry(registry, profiles, extensions), /direct-hardware evidence/);
});

test('an incomplete profile cannot expose a promotable command chain', async () => {
  const { registry, profiles, extensions } = await fixtures();
  const wsl = profiles.profiles.find((profile) => profile.id === 'wsl2-x64');
  wsl.commands.push(['scripts/run-exp-001.mjs', 'prepare']);
  assert.throws(() => validateRegistry(registry, profiles, extensions), /must not expose a promotable command chain/);
});

test('every omitted qualification axis remains fail-closed and publicly coordinated', async () => {
  const { registry, profiles, extensions } = await fixtures();
  assert.equal(extensions.axes.length, 9);
  assert(extensions.axes.every((entry) => entry.qualificationStatus === 'not-qualified' && entry.commands.length === 0));
  assert(extensions.axes.every((entry) => entry.architecturalDisposition && entry.implementationStatus && entry.priority));
  assert(extensions.axes.every((entry) => !Object.hasOwn(entry, 'status') && !Object.hasOwn(entry, 'publicDisposition')));
  extensions.axes.find((entry) => entry.id === 'concurrent-launch').commands.push(['scripts/run-f5.mjs', 'all']);
  assert.throws(() => validateRegistry(registry, profiles, extensions), /must not expose a promotable command chain/);
});

test('Hyper-V readiness separates blocked readiness from exact-profile incompatibility', () => {
  const result = classifyHyperVReadiness({
    platform: 'win32',
    osCaption: 'Microsoft Windows 11 Pro',
    hyperVModulePresent: true,
    partitionableGpuCount: 0,
    assignedGpuPartitionAdapterCount: 0,
  });
  assert.equal(result.readinessStatus, 'blocked');
  assert.equal(result.qualificationStatus, 'known-incompatible');
  assert.deepEqual(result.reasons, ['client-host-vendor-unsupported', 'no-partitionable-gpu', 'no-assigned-gpu-partition']);
});

test('a missing extension status dimension fails instead of collapsing to an aggregate label', async () => {
  const { registry, profiles, extensions } = await fixtures();
  delete extensions.axes[0].qualificationStatus;
  assert.throws(() => validateRegistry(registry, profiles, extensions), /Invalid qualification status/);
});

test('runner-ready evidence paths include every accepted native phase', async () => {
  const { profiles } = await fixtures();
  const windows = profiles.profiles.find((profile) => profile.id === 'windows-native-x64');
  const linux = profiles.profiles.find((profile) => profile.id === 'linux-native-x64');
  for (const owner of ['exp-000', 'exp-012', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']) {
    assert(windows.evidenceFiles.some((entry) => entry.includes(`/${owner}/`) || entry.includes(`build/${owner}/`)), `missing ${owner}`);
  }
  for (const relative of [
    'build/f5/win32-x64/evidence/capability-oracle-build.json',
    'build/f5/win32-x64/evidence/native-windows-capabilities.json',
    'build/f6/win32-x64/evidence/capability-oracle-build.json',
    'build/f6/win32-x64/evidence/native-windows-capabilities.json',
  ]) assert(windows.evidenceFiles.includes(relative), `missing ${relative}`);
  assert.equal(linux.status, 'runner-ready');
  assert.deepEqual(linux.missingCapsules, []);
  assert(linux.commands.some((entry) => entry[0] === 'scripts/run-exp-001.mjs' && entry[1] === 'all'));
  for (const owner of ['exp-001', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']) {
    assert(linux.evidenceFiles.some((entry) => entry.includes(`/${owner}/`) || entry.includes(`build/${owner}/`)), `missing Linux ${owner}`);
  }
  for (const relative of [
    'build/f4/linux-x64/evidence/oracle-build.json',
    'build/f5/linux-x64/evidence/capability-oracle-build.json',
    'build/f5/linux-x64/evidence/native-linux-capabilities.json',
    'build/f6/linux-x64/evidence/native-linux-oracle.json',
    'build/f8/linux-x64/evidence/native-linux-package.json',
  ]) assert(linux.evidenceFiles.includes(relative), `missing ${relative}`);
});
