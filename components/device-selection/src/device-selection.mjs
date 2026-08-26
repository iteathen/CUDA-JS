import { createHash } from 'node:crypto';

const PRIVATE_DEVICE_FIELDS = Object.freeze(['nativeDevice', 'computeCapabilityMajor', 'computeCapabilityMinor']);
const TARGET_FIELDS = Object.freeze(['policyVersion', 'compileTarget', 'linkTarget']);
const selectorData = new WeakMap();

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

function boundedTargetString(value, field) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 128 || !/^[A-Za-z0-9._+-]+$/.test(value)) {
    fail('DEVICE_TARGET_POLICY_INVALID', 'internal', `Target policy returned invalid ${field}.`);
  }
  return value;
}

function canonicalTargetIdentity(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function resolveArchitectureTarget(architecture, targetPolicy) {
  if (!exactFields(architecture, ['major', 'minor', 'class'])
      || !Number.isSafeInteger(architecture.major) || architecture.major < 1 || architecture.major > 99
      || !Number.isSafeInteger(architecture.minor) || architecture.minor < 0 || architecture.minor > 99
      || architecture.class !== `cc-${architecture.major}.${architecture.minor}`) {
    fail('DEVICE_ARCHITECTURE_INVALID', 'validation', 'Selected-device architecture facts are invalid.');
  }
  if (typeof targetPolicy !== 'function') {
    fail('DEVICE_TARGET_POLICY_INVALID', 'internal', 'Selected-device target resolution requires an injected target policy.');
  }
  const resolved = targetPolicy(Object.freeze({ ...architecture }));
  if (!exactFields(resolved, TARGET_FIELDS)) {
    fail('DEVICE_TARGET_POLICY_INVALID', 'internal', 'Target policy returned an invalid record.');
  }
  const policyVersion = boundedTargetString(resolved.policyVersion, 'policyVersion');
  const compileTarget = boundedTargetString(resolved.compileTarget, 'compileTarget');
  const linkTarget = boundedTargetString(resolved.linkTarget, 'linkTarget');
  const normalizedArchitecture = Object.freeze({ ...architecture });
  const identityInput = Object.freeze({
    contract: 'SPEC-0017-v1',
    architecture: normalizedArchitecture,
    policyVersion,
    compileTarget,
    linkTarget,
  });
  return Object.freeze({
    schemaVersion: 1,
    architecture: normalizedArchitecture,
    compileTarget,
    linkTarget,
    policyVersion,
    identity: canonicalTargetIdentity(identityInput),
  });
}

export class DeviceSelectionAuthority {
  #listDevices;
  #snapshot = null;
  #generation = 0;

  constructor({ listDevices }) {
    if (typeof listDevices !== 'function') {
      fail('DEVICE_SELECTION_PROVIDER_INVALID', 'internal', 'Device selection requires a private inventory provider.');
    }
    this.#listDevices = listDevices;
  }

  async discover() {
    const generation = ++this.#generation;
    this.#snapshot = null;
    let inventory;
    try {
      inventory = await this.#listDevices();
    } catch (error) {
      if (error instanceof DeviceSelectionError) throw error;
      fail('DEVICE_DISCOVERY_FAILED', 'provider', 'CUDA device discovery failed before a snapshot was established.');
    }
    const devices = normalizeInventory(inventory);
    const publicDevices = [];
    for (const device of devices) {
      const selector = Object.freeze(new CudaDeviceSelector());
      selectorData.set(selector, Object.freeze({ authority: this, generation, device }));
      publicDevices.push(publicDescriptor(selector, device));
    }
    this.#snapshot = Object.freeze({
      schemaVersion: 1,
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
    const { device, publicSelection } = this.#resolve(selector);
    const architecture = architectureFacts(device);
    const resolved = resolveArchitectureTarget(architecture, targetPolicy);
    return Object.freeze({
      ...resolved,
      selection: publicSelection,
    });
  }

  #resolve(selectorValue) {
    if (!(selectorValue instanceof CudaDeviceSelector)) {
      fail('DEVICE_SELECTOR_INVALID', 'validation', 'Device selector is malformed.');
    }
    const privateSelector = selectorData.get(selectorValue);
    if (!privateSelector || privateSelector.authority !== this) {
      fail('DEVICE_SELECTOR_FOREIGN', 'validation', 'Device selector does not belong to this selection authority.');
    }
    if (privateSelector.generation !== this.#generation || this.#snapshot === null) {
      fail('DEVICE_SELECTOR_STALE', 'stale-resource', 'Device selector belongs to a superseded discovery snapshot.');
    }
    return Object.freeze({
      device: privateSelector.device,
      publicSelection: publicDescriptor(selectorValue, privateSelector.device),
    });
  }
}

export class CudaDeviceSelector {
  get kind() { return 'cuda-device-selector'; }
}

export function resolveOpaqueDeviceSelector(selector) {
  if (!(selector instanceof CudaDeviceSelector)) {
    fail('DEVICE_SELECTOR_INVALID', 'validation', 'Device selector is malformed.');
  }
  const privateSelector = selectorData.get(selector);
  if (!privateSelector) fail('DEVICE_SELECTOR_FOREIGN', 'validation', 'Device selector does not belong to this process.');
  return privateSelector.authority.resolvePrivate(selector);
}
