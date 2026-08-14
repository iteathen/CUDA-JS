import assert from 'node:assert/strict';
import test from 'node:test';

import { DeviceSelectionAuthority } from '../index.mjs';

function nonce() {
  let value = 0;
  return () => `opaque_${(++value).toString(16).padStart(16, '0')}`;
}

function authority(devices) {
  return new DeviceSelectionAuthority({ listDevices: async () => devices, nonce: nonce() });
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
  assert.notEqual(snapshot.devices[0].selector.capability, snapshot.devices[1].selector.capability);
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
});

test('refresh invalidates stale selectors and foreign selectors fail closed', async () => {
  const first = authority([{ nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 }]);
  const second = authority([{ nativeDevice: 0, computeCapabilityMajor: 7, computeCapabilityMinor: 5 }]);
  const firstSnapshot = await first.discover();
  const foreignSnapshot = await second.discover();
  assert.throws(() => first.select(foreignSnapshot.devices[0].selector), { code: 'DEVICE_SELECTOR_FOREIGN' });
  await first.discover();
  assert.throws(() => first.select(firstSnapshot.devices[0].selector), { code: 'DEVICE_SELECTOR_STALE' });
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
