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
  assert.match(rendered, /Architectural disposition \| Implementation status \| Qualification status \| Priority/);
  assert.match(rendered, /2026-08-12-native-and-platform-qualification-continuation\.md/);
  assert.doesNotMatch(rendered, /2026-08-11-(?:hardware-qualification-program|node-and-extended-qualification)\.md/);
  assert.doesNotMatch(rendered, /no-support|\*\*no support\*\*/i);
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

test('every extended axis exposes independent dimensions and remains fail-closed', async () => {
  const { registry, profiles, extensions } = await fixtures();
  assert.equal(extensions.schemaVersion, 2);
  assert.equal(extensions.axes.length, 9);
  assert.deepEqual(extensions.policy.requiredIndependentDimensions, [
    'architecturalDisposition',
    'implementationStatus',
    'qualificationStatus',
    'priority',
  ]);
  for (const entry of extensions.axes) {
    assert.equal(Object.hasOwn(entry, 'status'), false);
    assert.equal(Object.hasOwn(entry, 'publicDisposition'), false);
    assert.equal(typeof entry.architecturalDisposition, 'string');
    assert.equal(typeof entry.implementationStatus, 'string');
    assert.equal(entry.qualificationStatus, 'not-qualified');
    assert.equal(typeof entry.priority, 'string');
    assert(entry.safetyRules.length > 0);
    assert.deepEqual(entry.commands, []);
  }
  extensions.axes.find((entry) => entry.id === 'concurrent-launch').commands.push(['scripts/run-f5.mjs', 'all']);
  assert.throws(() => validateRegistry(registry, profiles, extensions), /must not expose a promotable command chain/);
});

test('legacy collapsed extension fields and axis-level known-incompatible state are rejected', async () => {
  const first = await fixtures();
  first.extensions.axes[0].publicDisposition = 'not-qualified';
  assert.throws(() => validateRegistry(first.registry, first.profiles, first.extensions), /legacy public disposition/);

  const second = await fixtures();
  second.extensions.axes[0].qualificationStatus = 'known-incompatible';
  assert.throws(() => validateRegistry(second.registry, second.profiles, second.extensions), /must remain not-qualified/);

  const third = await fixtures();
  delete third.extensions.axes[0].implementationStatus;
  assert.throws(() => validateRegistry(third.registry, third.profiles, third.extensions), /Invalid implementation status/);
});

test('Hyper-V readiness is known-incompatible only for the exact negative profile', async () => {
  const result = classifyHyperVReadiness({
    platform: 'win32',
    osCaption: 'Microsoft Windows 11 Pro',
    hyperVModulePresent: true,
    partitionableGpuCount: 0,
    assignedGpuPartitionAdapterCount: 0,
  });
  assert.equal(result.qualificationStatus, 'known-incompatible');
  assert.equal(result.profileScope, 'exact-observed-host');
  assert.deepEqual(result.reasons, ['client-host-vendor-unsupported', 'no-partitionable-gpu', 'no-assigned-gpu-partition']);

  const { registry, profiles, extensions } = await fixtures();
  const virtualization = extensions.axes.find((entry) => entry.id === 'virtualization');
  assert.equal(virtualization.qualificationStatus, 'not-qualified');
  assert.equal(virtualization.knownIncompatibleProfiles.length, 1);
  assert.equal(virtualization.knownIncompatibleProfiles[0].qualificationStatus, 'known-incompatible');
  assert.doesNotThrow(() => validateRegistry(registry, profiles, extensions));
});

test('a ready-looking Hyper-V inventory remains not-qualified without native promotion evidence', () => {
  const result = classifyHyperVReadiness({
    platform: 'win32',
    osCaption: 'Microsoft Windows Server 2025',
    hyperVModulePresent: true,
    partitionableGpuCount: 1,
    assignedGpuPartitionAdapterCount: 1,
  });
  assert.equal(result.qualificationStatus, 'not-qualified');
  assert.deepEqual(result.reasons, []);
});

test('an incomplete inventory alone does not over-broaden known-incompatible', () => {
  const result = classifyHyperVReadiness({
    platform: 'win32',
    osCaption: 'Microsoft Windows Server 2025',
    hyperVModulePresent: true,
    partitionableGpuCount: 0,
    assignedGpuPartitionAdapterCount: 0,
  });
  assert.equal(result.qualificationStatus, 'not-qualified');
  assert.deepEqual(result.reasons, ['no-partitionable-gpu', 'no-assigned-gpu-partition']);
});

test('concurrent-launch records the implemented SPEC-0016 baseline without promoting proposed widening', async () => {
  const { extensions } = await fixtures();
  const concurrent = extensions.axes.find((entry) => entry.id === 'concurrent-launch');
  assert.equal(concurrent.architecturalDisposition, 'planned');
  assert.equal(concurrent.implementationStatus, 'not-implemented');
  assert.equal(concurrent.qualificationStatus, 'not-qualified');
  assert.equal(concurrent.priority, 'after:issue-51');
  assert.match(concurrent.currentBoundary, /SPEC-0016.*implemented/);
  assert.match(concurrent.currentBoundary, /SPEC-0018.*proposed.*not implemented.*not qualified/);
});

test('runner-ready evidence paths include every accepted native phase', async () => {
  const { profiles } = await fixtures();
  const windows = profiles.profiles.find((profile) => profile.id === 'windows-native-x64');
  for (const owner of ['exp-000', 'exp-012', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8']) {
    assert(windows.evidenceFiles.some((entry) => entry.includes(`/${owner}/`) || entry.includes(`build/${owner}/`)), `missing ${owner}`);
  }
});
