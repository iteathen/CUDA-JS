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
  const linux = profiles.profiles.find((profile) => profile.id === 'linux-native-x64');
  linux.commands.push(['scripts/run-exp-001.mjs', 'prepare']);
  assert.throws(() => validateRegistry(registry, profiles, extensions), /must not expose a promotable command chain/);
});

test('every omitted qualification axis remains fail-closed and publicly coordinated', async () => {
  const { registry, profiles, extensions } = await fixtures();
  assert.equal(extensions.axes.length, 9);
  assert(extensions.axes.every((entry) => entry.publicDisposition === 'no-support' && entry.commands.length === 0));
  extensions.axes.find((entry) => entry.id === 'concurrent-launch').commands.push(['scripts/run-f5.mjs', 'all']);
  assert.throws(() => validateRegistry(registry, profiles, extensions), /must not expose a promotable command chain/);
});

test('Hyper-V readiness is no-support for client Windows with no partitionable GPU', () => {
  const result = classifyHyperVReadiness({
    platform: 'win32',
    osCaption: 'Microsoft Windows 11 Pro',
    hyperVModulePresent: true,
    partitionableGpuCount: 0,
    assignedGpuPartitionAdapterCount: 0,
  });
  assert.equal(result.disposition, 'no-support');
  assert.deepEqual(result.reasons, ['client-host-vendor-unsupported', 'no-partitionable-gpu', 'no-assigned-gpu-partition']);
});

test('runner-ready evidence paths include every accepted native phase', async () => {
  const { profiles } = await fixtures();
  const windows = profiles.profiles.find((profile) => profile.id === 'windows-native-x64');
  for (const owner of ['exp-000', 'exp-012', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']) {
    assert(windows.evidenceFiles.some((entry) => entry.includes(`/${owner}/`) || entry.includes(`build/${owner}/`)), `missing ${owner}`);
  }
});
