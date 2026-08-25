import os from 'node:os';

const MINIMUM_NODE_VERSION = 'v26.1.0';
const QUALIFIED_NODE_VERSION = 'v26.7.0';
const HOST_FIELDS = Object.freeze(['architecture', 'nodeAbi', 'nodeVersion', 'osRelease', 'osVersion', 'platform', 'procVersion']);
const BINARY_ATTRIBUTES = Object.freeze(['integrated', 'kernelExecTimeout', 'tccDriver']);
const NATIVE_PROFILES = Object.freeze({
  'windows-native-x64': Object.freeze({ backend: 'windows-native', platform: 'win32', architecture: 'x64', backendReason: 'WINDOWS_DRIVER_BACKEND_INCOMPATIBLE', descriptionReason: 'WINDOWS_DRIVER_DESCRIPTION_INVALID' }),
  'linux-native-x64': Object.freeze({ backend: 'linux-native', platform: 'linux', architecture: 'x64', backendReason: 'LINUX_DRIVER_BACKEND_INCOMPATIBLE', descriptionReason: 'LINUX_DRIVER_DESCRIPTION_INVALID' }),
});

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, allowed) {
  return plainObject(value) && Object.keys(value).every((key) => allowed.includes(key));
}

function boundedString(value, label, maximum = 512) {
  if (typeof value !== 'string' || value.length < 1 || value.length > maximum || value.includes('\0')) throw Object.assign(new Error(`${label} is invalid.`), { code: 'PLATFORM_PROFILE_INVALID' });
  return value;
}

function frozen(value) {
  if (value && typeof value === 'object') {
    for (const child of Array.isArray(value) ? value : Object.values(value)) frozen(child);
    Object.freeze(value);
  }
  return value;
}

export function permissionState({ permissionEnabled, ffiAllowed }) {
  if (typeof permissionEnabled !== 'boolean' || typeof ffiAllowed !== 'boolean') throw Object.assign(new Error('Permission facts must be boolean.'), { code: 'PLATFORM_PERMISSION_INVALID' });
  if (!permissionEnabled) return 'unrestricted-process';
  return ffiAllowed ? 'explicit-ffi' : 'ffi-denied';
}

export function classifyNodeRuntime(version) {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return frozen({ disposition: 'known-incompatible', reason: 'NODE_VERSION_INVALID', minimumVersion: MINIMUM_NODE_VERSION, qualifiedVersion: QUALIFIED_NODE_VERSION });
  const actual = match.slice(1).map(Number);
  const minimum = [26, 1, 0];
  const comparison = actual.findIndex((value, index) => value !== minimum[index]);
  const atLeastMinimum = comparison === -1 || actual[comparison] > minimum[comparison];
  return frozen({
    disposition: atLeastMinimum ? (version === QUALIFIED_NODE_VERSION ? 'qualified-experimental' : 'testing-unconfirmed') : 'known-incompatible',
    reason: atLeastMinimum ? null : 'NODE_FFI_SUBSTRATE_UNAVAILABLE',
    minimumVersion: MINIMUM_NODE_VERSION,
    qualifiedVersion: QUALIFIED_NODE_VERSION,
  });
}

export function classifyHost(input) {
  if (!exactFields(input, HOST_FIELDS)) throw Object.assign(new Error('Host profile fields are invalid.'), { code: 'PLATFORM_PROFILE_INVALID' });
  const platform = boundedString(input.platform, 'platform', 32);
  const architecture = boundedString(input.architecture, 'architecture', 32);
  const nodeVersion = boundedString(input.nodeVersion, 'nodeVersion', 32);
  const nodeAbi = boundedString(input.nodeAbi, 'nodeAbi', 32);
  const osRelease = boundedString(input.osRelease, 'osRelease');
  const osVersion = boundedString(input.osVersion, 'osVersion');
  const procVersion = input.procVersion === '' ? '' : boundedString(input.procVersion, 'procVersion', 1_024);
  const marker = `${osRelease}\n${osVersion}\n${procVersion}`.toLowerCase();
  let hostKind = 'unsupported';
  if (platform === 'win32' && architecture === 'x64') hostKind = 'windows-native-x64';
  else if (platform === 'linux' && architecture === 'x64' && marker.includes('microsoft-standard-wsl2')) hostKind = 'wsl2-x64';
  else if (platform === 'linux' && architecture === 'x64' && marker.includes('microsoft')) hostKind = 'wsl1-x64';
  else if (platform === 'linux' && architecture === 'x64') hostKind = 'linux-native-x64';
  else if (platform === 'linux' && architecture === 'arm64') hostKind = 'linux-native-arm64';

  const disposition = hostKind === 'windows-native-x64' ? 'native-candidate'
    : hostKind.startsWith('wsl') ? 'diagnostic-only'
      : hostKind.startsWith('linux-native') ? 'qualification-required'
        : 'unsupported';
  const action = hostKind === 'windows-native-x64' ? 'run-windows-native-f7'
    : hostKind === 'linux-native-x64' ? 'run-linux-native-f2l-through-f8l'
      : hostKind === 'linux-native-arm64' ? 'complete-independent-sbsa-qualification'
        : hostKind.startsWith('wsl') ? 'run-separate-wsl2-qualification'
          : 'use-a-documented-host-profile';
  return frozen({ schemaVersion: 1, node: { version: nodeVersion, abi: nodeAbi, ...classifyNodeRuntime(nodeVersion) }, platform, architecture, os: { release: osRelease, version: osVersion }, hostKind, disposition, action });
}

export function inspectHostProfile(overrides = {}) {
  if (!plainObject(overrides) || Object.keys(overrides).some((key) => !['architecture', 'execArgv', 'nodeAbi', 'nodeVersion', 'osRelease', 'osVersion', 'permissionEnabled', 'ffiAllowed', 'platform', 'procVersion'].includes(key))) {
    throw Object.assign(new Error('Host profile overrides are invalid.'), { code: 'PLATFORM_PROFILE_INVALID' });
  }
  const execArgv = overrides.execArgv ?? process.execArgv;
  if (!Array.isArray(execArgv) || !execArgv.every((entry) => typeof entry === 'string')) throw Object.assign(new Error('execArgv is invalid.'), { code: 'PLATFORM_PROFILE_INVALID' });
  const permissionEnabled = overrides.permissionEnabled ?? (process.permission !== undefined);
  const ffiAllowed = overrides.ffiAllowed ?? (!permissionEnabled || process.permission.has('ffi'));
  const host = classifyHost({
    nodeVersion: overrides.nodeVersion ?? process.version,
    nodeAbi: overrides.nodeAbi ?? process.versions.modules,
    platform: overrides.platform ?? process.platform,
    architecture: overrides.architecture ?? process.arch,
    osRelease: overrides.osRelease ?? os.release(),
    osVersion: overrides.osVersion ?? os.version(),
    procVersion: overrides.procVersion ?? '',
  });
  return frozen({ ...host, ffi: { experimental: execArgv.includes('--experimental-ffi'), permission: permissionState({ permissionEnabled, ffiAllowed }) } });
}

function fail(reason, host, details = {}) {
  return frozen({ schemaVersion: 1, status: 'incompatible', reason, host, details });
}

export function assessCudaSupport(host, driverDescription) {
  if (!plainObject(host) || host.schemaVersion !== 1 || !plainObject(host.node) || !plainObject(host.ffi)) return fail('HOST_PROFILE_INVALID', null);
  if (!['unrestricted-process', 'explicit-ffi', 'ffi-denied'].includes(host.ffi.permission) || typeof host.ffi.experimental !== 'boolean') return fail('HOST_PROFILE_INVALID', null);
  const nativeProfile = NATIVE_PROFILES[host.hostKind];
  if (!nativeProfile) return fail(host.hostKind?.startsWith('wsl') ? 'WSL_BACKEND_UNAVAILABLE' : host.hostKind?.startsWith('linux-native') ? 'LINUX_BACKEND_UNAVAILABLE' : 'HOST_BACKEND_UNAVAILABLE', host);
  const nodeRuntime = classifyNodeRuntime(host.node.version);
  if (nodeRuntime.disposition === 'known-incompatible') return fail('NODE_SUBSTRATE_INCOMPATIBLE', host, { minimum: nodeRuntime.minimumVersion, actual: host.node.version, reason: nodeRuntime.reason });
  if (host.ffi.experimental !== true) return fail('EXPERIMENTAL_FFI_REQUIRED', host);
  if (host.ffi.permission === 'ffi-denied') return fail('FFI_PERMISSION_REQUIRED', host);
  if (!plainObject(driverDescription) || driverDescription.schemaVersion !== 1 || driverDescription.profile?.nativeOperational !== true || driverDescription.runtime?.backend !== nativeProfile.backend
      || driverDescription.profile?.platform !== nativeProfile.platform || driverDescription.profile?.architecture !== nativeProfile.architecture || driverDescription.profile?.node !== host.node.version) return fail(nativeProfile.backendReason, host);
  if (!Number.isSafeInteger(driverDescription.driver?.apiVersion) || driverDescription.driver.apiVersion < 1 || driverDescription.device?.ordinal !== 0) return fail(nativeProfile.descriptionReason, host);
  const attributes = driverDescription.device?.attributes;
  if (!plainObject(attributes)) return fail('CUDA_DEVICE_ATTRIBUTES_INVALID', host);
  for (const name of BINARY_ATTRIBUTES) if (![0, 1].includes(attributes[name])) return fail('CUDA_DEVICE_ATTRIBUTES_INVALID', host, { field: name });
  if (!Number.isInteger(attributes.computeMode) || attributes.computeMode < 0 || attributes.computeMode > 3) return fail('CUDA_DEVICE_ATTRIBUTES_INVALID', host, { field: 'computeMode' });
  const computeModes = ['default', 'exclusive-thread', 'prohibited', 'exclusive-process'];
  const driverModel = host.hostKind === 'linux-native-x64'
    ? 'linux-native'
    : attributes.tccDriver === 1 ? 'tcc' : attributes.kernelExecTimeout === 1 ? 'wddm-watchdog' : 'wddm-no-watchdog';
  if (attributes.computeMode === 2) return fail('CUDA_COMPUTE_MODE_PROHIBITED', host, { driverModel, computeMode: computeModes[attributes.computeMode] });
  return frozen({
    schemaVersion: 1,
    status: 'testing-unconfirmed',
    reason: 'PROFILE_EVIDENCE_UNCONFIRMED',
    host,
    cuda: {
      driverApiVersion: driverDescription.driver.apiVersion,
      deviceOrdinal: driverDescription.device.ordinal,
      driverModel,
      watchdog: attributes.kernelExecTimeout === 1 ? 'enabled' : 'disabled',
      integrated: attributes.integrated === 1,
      computeMode: computeModes[attributes.computeMode],
    },
    claim: 'testing-only-unconfirmed-profile',
  });
}
