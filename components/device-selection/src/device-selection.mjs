import { createHash, randomBytes } from 'node:crypto';

const SELECTOR_FIELDS = Object.freeze(['schemaVersion', 'snapshot', 'capability']);
const PRIVATE_DEVICE_FIELDS = Object.freeze(['nativeDevice', 'computeCapabilityMajor', 'computeCapabilityMinor']);
const TARGET_FIELDS = Object.freeze(['policyVersion', 'compileTarget', 'linkTarget']);

export class DeviceSelectionError extends Error {
  constructor(code, category, message, details = {}) {
    super(message);
    this.name = 'DeviceSelectionError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, category, message, details = {}) {
  throw new DeviceSelectionError(code, category, message, details);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function defaultNonce() {
  return randomBytes(16).toString('hex');
}

function opaqueToken(nonce, field) {
  const value = nonce();
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{16,128}$/.test(value)) {
    fail('DEVICE_SELECTION_NONCE_INVALID', 'internal', `Device selection ${field} nonce is invalid.`);
  }
  return value;
}

function normalizePrivateDevice(value, index) {
  if (!exactFields(value, PRIVATE_DEVICE_FIELDS)) {
    fail('DEVICE_INVENTORY_INVALID', 'internal', 'Private device inventory record is invalid.', { index });
  }
  if (!Number.isSafeInteger(value.nativeDevice) || value.nativeDevice < 0) {
    fail('DEVICE_INVENTORY_INVALID', 'internal', 'Private native device identifier is invalid.', { index });
  }
  if (!Number.isSafeInteger(value.computeCapabilityMajor) || value.computeCapabilityMajor < 1 || value.computeCapabilityMajor > 99
      || !Number.isSafeInteger(value.computeCapabilityMinor) || value.computeCapabilityMinor < 0 || value.computeCapabilityMinor > 99) {
    fail('DEVICE_INVENTORY_INVALID', 'internal', 'Private device architecture facts are invalid.', { index });
  }
  return Object.freeze({
    nativeDevice: value.nativeDevice,
    computeCapabilityMajor: value.computeCapabilityMajor,
    computeCapabilityMinor: value.computeCapabilityMinor,
  });
}

function normalizeInventory(value) {
  if (!Array.isArray(value) || value.length > 256) {
    fail('DEVICE_INVENTORY_INVALID', 'internal', 'Private device inventory must be a bounded array.');
  }
  const devices = value.map(normalizePrivateDevice);
  const nativeDevices = new Set();
  for (const [index, device] of devices.entries()) {
    if (nativeDevices.has(device.nativeDevice)) {
      fail('DEVICE_INVENTORY_AMBIGUOUS', 'internal', 'Private device inventory contains a duplicate native device.', { index });
    }
    nativeDevices.add(device.nativeDevice);
  }
  return Object.freeze(devices);
}

function architectureFacts(device) {
  return Object.freeze({
    major: device.computeCapabilityMajor,
    minor: device.computeCapabilityMinor,
    class: `cc-${device.computeCapabilityMajor}.${device.computeCapabilityMinor}`,
  });
}

function publicDescriptor(selector, device) {
  return Object.freeze({
    schemaVersion: 1,
    selector,
    architecture: architectureFacts(device),
  });
}

function validateSelector(value) {
  if (!exactFields(value, SELECTOR_FIELDS) || value.schemaVersion !== 1
      || typeof value.snapshot !== 'string' || typeof value.capability !== 'string') {
    fail('DEVICE_SELECTOR_INVALID', 'validation', 'Device selector is malformed.');
  }
  return value;
}

function boundedTargetString(value, field) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 128 || !/^[A-Za-z0-9._+-]+$/.test(value)) {
    fail('DEVICE_TARGET_POLICY_INVALID', 'internal', `Target policy returned invalid ${field}.`);
  }
  return value;
}

function canonicalTargetIdentity(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export class DeviceSelectionAuthority {
  #listDevices;
  #nonce;
  #snapshot = null;
  #currentSnapshotId = null;
  #issuedSnapshots = new Set();
  #selectors = new Map();

  constructor({ listDevices, nonce = defaultNonce }) {
    if (typeof listDevices !== 'function') {
      fail('DEVICE_SELECTION_PROVIDER_INVALID', 'internal', 'Device selection requires a private inventory provider.');
    }
    if (typeof nonce !== 'function') {
      fail('DEVICE_SELECTION_NONCE_INVALID', 'internal', 'Device selection nonce provider is invalid.');
    }
    this.#listDevices = listDevices;
    this.#nonce = nonce;
  }

  async discover() {
    const devices = normalizeInventory(await this.#listDevices());
    const snapshot = opaqueToken(this.#nonce, 'snapshot');
    const selectors = new Map();
    const publicDevices = [];
    for (const device of devices) {
      let capability;
      do capability = opaqueToken(this.#nonce, 'selector');
      while (selectors.has(capability));
      const selector = Object.freeze({ schemaVersion: 1, snapshot, capability });
      selectors.set(capability, device);
      publicDevices.push(publicDescriptor(selector, device));
    }
    this.#issuedSnapshots.add(snapshot);
    this.#currentSnapshotId = snapshot;
    this.#selectors = selectors;
    this.#snapshot = Object.freeze({
      schemaVersion: 1,
      snapshot,
      deviceCount: publicDevices.length,
      devices: Object.freeze(publicDevices),
    });
    return this.#snapshot;
  }

  currentSnapshot() {
    if (this.#snapshot === null) {
      fail('DEVICE_SNAPSHOT_UNAVAILABLE', 'validation', 'No device-discovery snapshot has been established.');
    }
    return this.#snapshot;
  }

  select(selector) {
    const { device, publicSelection } = this.#resolve(selector);
    void device;
    return publicSelection;
  }

  selectDefault() {
    const snapshot = this.currentSnapshot();
    if (snapshot.deviceCount < 1) {
      fail('DEVICE_NOT_AVAILABLE', 'unsupported', 'No CUDA device is available in the current discovery snapshot.');
    }
    return this.select(snapshot.devices[0].selector);
  }

  resolvePrivate(selector) {
    const { device, publicSelection } = this.#resolve(selector);
    return Object.freeze({
      nativeDevice: device.nativeDevice,
      architecture: publicSelection.architecture,
      selection: publicSelection,
    });
  }

  resolveTarget(selector, targetPolicy) {
    if (typeof targetPolicy !== 'function') {
      fail('DEVICE_TARGET_POLICY_INVALID', 'internal', 'Selected-device target resolution requires an injected target policy.');
    }
    const { device, publicSelection } = this.#resolve(selector);
    const architecture = architectureFacts(device);
    const resolved = targetPolicy(architecture);
    if (!exactFields(resolved, TARGET_FIELDS)) {
      fail('DEVICE_TARGET_POLICY_INVALID', 'internal', 'Target policy returned an invalid record.');
    }
    const policyVersion = boundedTargetString(resolved.policyVersion, 'policyVersion');
    const compileTarget = boundedTargetString(resolved.compileTarget, 'compileTarget');
    const linkTarget = boundedTargetString(resolved.linkTarget, 'linkTarget');
    const identityInput = Object.freeze({
      contract: 'SPEC-0017-v1',
      architecture,
      policyVersion,
      compileTarget,
      linkTarget,
    });
    return Object.freeze({
      schemaVersion: 1,
      architecture,
      compileTarget,
      linkTarget,
      policyVersion,
      identity: canonicalTargetIdentity(identityInput),
      selection: publicSelection,
    });
  }

  #resolve(selectorValue) {
    const selector = validateSelector(selectorValue);
    if (selector.snapshot !== this.#currentSnapshotId) {
      if (this.#issuedSnapshots.has(selector.snapshot)) {
        fail('DEVICE_SELECTOR_STALE', 'stale-resource', 'Device selector belongs to a superseded discovery snapshot.');
      }
      fail('DEVICE_SELECTOR_FOREIGN', 'validation', 'Device selector does not belong to this selection authority.');
    }
    const device = this.#selectors.get(selector.capability);
    if (device === undefined) {
      fail('DEVICE_SELECTOR_FOREIGN', 'validation', 'Device selector capability is unknown to this selection authority.');
    }
    return Object.freeze({ device, publicSelection: publicDescriptor(selector, device) });
  }
}
