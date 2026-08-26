import assert from 'node:assert/strict';
import test from 'node:test';

import { CudaDeviceSelector, DeviceSelectionAuthority, resolveArchitectureTarget, resolveOpaqueDeviceSelector } from '../index.mjs';

function authority(devices) {
  return new DeviceSelectionAuthority({ listDevices: async () => devices });
}

test('finite discovery snapshot exposes only opaque selectors and sanitized architecture facts', async () => {
  const selection = authority([
    { nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 },
    { nativeDevice: 4, computeCapabilityMajor: 8, computeCapabilityMinor: 9 },
  ]);
  const snapshot = await selection.discover();
  assert.equal(snapshot.deviceCount, 2);
  assert.deepEqual(snapshot.devices.map((entry) => entry.architecture.class), ['cc-7.5', 'cc-8.9']);
  const serialized = JSON.stringify(snapshot).toLowerCase();
  for (const forbidden of ['nativedevice', 'ordinal', 'uuid', 'serial', 'pci', 'cudevice']) assert.equal(serialized.includes(forbidden), false);
  assert.ok(snapshot.devices[0].selector instanceof CudaDeviceSelector);
  assert.notEqual(snapshot.devices[0].selector, snapshot.devices[1].selector);
  assert.equal(JSON.stringify(snapshot.devices[0].selector), '{}');
});

test('default and explicit selection retain private native identity without exposing it publicly', async () => {
  const selection = authority([
    { nativeDevice: 3, computeCapabilityMajor: 8, computeCapabilityMinor: 6 },
    { nativeDevice: 7, computeCapabilityMajor: 9, computeCapabilityMinor: 0 },
  ]);
  const snapshot = await selection.discover();
  assert.equal(selection.selectDefault().architecture.class, 'cc-8.6');
  assert.equal(selection.select(snapshot.devices[1].selector).architecture.class, 'cc-9.0');
  const internal = selection.resolvePrivate(snapshot.devices[1].selector);
  assert.equal(internal.nativeDevice, 7);
  assert.equal(Object.hasOwn(internal.selection, 'nativeDevice'), false);
  assert.equal(resolveOpaqueDeviceSelector(snapshot.devices[1].selector).nativeDevice, 7);
});

test('refresh invalidates stale selectors and foreign selectors fail closed', async () => {
  const first = authority([{ nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 }]);
  const second = authority([{ nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 }]);
  const firstSnapshot = await first.discover();
  const foreignSnapshot = await second.discover();
  assert.throws(() => first.select(foreignSnapshot.devices[0].selector), { code: 'DEVICE_SELECTOR_FOREIGN' });
  await first.discover();
  assert.throws(() => first.select(firstSnapshot.devices[0].selector), { code: 'DEVICE_SELECTOR_STALE' });
  assert.throws(() => first.select({}), { code: 'DEVICE_SELECTOR_INVALID' });
});

test('a failed refresh invalidates the prior snapshot without retaining issued generations', async () => {
  let failDiscovery = false;
  const selection = new DeviceSelectionAuthority({
    listDevices: async () => {
      if (failDiscovery) throw new Error('private provider detail');
      return [{ nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 }];
    },
  });
  const snapshot = await selection.discover();
  failDiscovery = true;
  await assert.rejects(selection.discover(), {
    code: 'DEVICE_DISCOVERY_FAILED',
    category: 'provider',
    message: 'CUDA device discovery failed before a snapshot was established.',
  });
  assert.throws(() => selection.select(snapshot.devices[0].selector), { code: 'DEVICE_SELECTOR_STALE' });
  assert.throws(() => selection.currentSnapshot(), { code: 'DEVICE_SNAPSHOT_UNAVAILABLE' });
});

test('empty and ambiguous private inventories fail with exact dispositions', async () => {
  const empty = authority([]);
  await empty.discover();
  assert.throws(() => empty.selectDefault(), { code: 'DEVICE_NOT_AVAILABLE' });
  const duplicate = authority([
    { nativeDevice: 2, computeCapabilityMajor: 8, computeCapabilityMinor: 0 },
    { nativeDevice: 2, computeCapabilityMajor: 8, computeCapabilityMinor: 0 },
  ]);
  await assert.rejects(duplicate.discover(), { code: 'DEVICE_INVENTORY_AMBIGUOUS' });
});

test('selected-device target identity depends on architecture and target-policy result, not native ordinal', async () => {
  const policy = ({ major, minor }) => ({
    policyVersion: 'cuda-target-v1',
    compileTarget: `compute_${major}${minor}`,
    linkTarget: `sm_${major}${minor}`,
  });
  const left = authority([{ nativeDevice: 1, computeCapabilityMajor: 8, computeCapabilityMinor: 9 }]);
  const right = authority([{ nativeDevice: 42, computeCapabilityMajor: 8, computeCapabilityMinor: 9 }]);
  const different = authority([{ nativeDevice: 1, computeCapabilityMajor: 9, computeCapabilityMinor: 0 }]);
  const leftSnapshot = await left.discover();
  const rightSnapshot = await right.discover();
  const differentSnapshot = await different.discover();
  const leftTarget = left.resolveTarget(leftSnapshot.devices[0].selector, policy);
  const rightTarget = right.resolveTarget(rightSnapshot.devices[0].selector, policy);
  const differentTarget = different.resolveTarget(differentSnapshot.devices[0].selector, policy);
  assert.equal(leftTarget.identity, rightTarget.identity);
  assert.notEqual(leftTarget.identity, differentTarget.identity);
  assert.equal(leftTarget.compileTarget, 'compute_89');
  assert.equal(leftTarget.linkTarget, 'sm_89');
});

test('architecture-only target resolution supports the implicit default device without inventing a selector', () => {
  const target = resolveArchitectureTarget({ major: 8, minor: 9, class: 'cc-8.9' }, (architecture) => ({
    policyVersion: 'cuda-target-v1',
    compileTarget: `compute_${architecture.major}${architecture.minor}`,
    linkTarget: `sm_${architecture.major}${architecture.minor}`,
  }));
  assert.equal(target.compileTarget, 'compute_89');
  assert.equal(target.linkTarget, 'sm_89');
  assert.equal(target.identity.length, 64);
  assert.throws(() => resolveArchitectureTarget({ major: 8, minor: 9, class: 'cc-8.8' }, () => ({})), { code: 'DEVICE_ARCHITECTURE_INVALID' });
});
