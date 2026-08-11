import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { profilesPath, registryPath, renderSupportDocument, validateRegistry } from './qualification.mjs';

async function fixtures() {
  return {
    registry: JSON.parse(await readFile(registryPath, 'utf8')),
    profiles: JSON.parse(await readFile(profilesPath, 'utf8')),
  };
}

test('accepted exact hardware profile satisfies promotion invariants', async () => {
  const { registry, profiles } = await fixtures();
  assert.doesNotThrow(() => validateRegistry(registry, profiles));
  const rendered = renderSupportDocument(registry, profiles);
  assert.match(rendered, /GeForce GTX 1660 Ti/);
  assert.match(rendered, /seeking evidence/);
  assert.match(rendered, /Linux ARM64 SBSA/);
});

test('portable evidence cannot promote a hardware profile', async () => {
  const { registry, profiles } = await fixtures();
  registry.qualifiedProfiles[0].evidence.directHardware = false;
  assert.throws(() => validateRegistry(registry, profiles), /direct-hardware evidence/);
});

test('an incomplete profile cannot expose a promotable command chain', async () => {
  const { registry, profiles } = await fixtures();
  const linux = profiles.profiles.find((profile) => profile.id === 'linux-native-x64');
  linux.commands.push(['scripts/run-exp-001.mjs', 'prepare']);
  assert.throws(() => validateRegistry(registry, profiles), /must not expose a promotable command chain/);
});

test('runner-ready evidence paths include every accepted native phase', async () => {
  const { profiles } = await fixtures();
  const windows = profiles.profiles.find((profile) => profile.id === 'windows-native-x64');
  for (const owner of ['exp-000', 'exp-012', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']) {
    assert(windows.evidenceFiles.some((entry) => entry.includes(`/${owner}/`) || entry.includes(`build/${owner}/`)), `missing ${owner}`);
  }
});
