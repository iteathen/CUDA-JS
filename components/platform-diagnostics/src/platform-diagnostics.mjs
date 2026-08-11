import os from 'node:os';

const NODE_VERSION = 'v26.7.0';
const HOST_FIELDS = Object.freeze(['architecture', 'nodeAbi', 'nodeVersion', 'osRelease', 'osVersion', 'platform', 'procVersion']);
const BINARY_ATTRIBUTES = Object.freeze(['integrated', 'kernelExecTimeout', 'tccDriver']);

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
    : hostKind === 'linux-native-x64' ? 'complete-f2l-through-f7l'
      : hostKind === 'linux-native-arm64' ? 'complete-independent-sbsa-qualification'
        : hostKind.startsWith('wsl') ? 'run-separate-wsl2-qualification'
          : 'use-a-documented-host-profile';
  return frozen({ schemaVersion: 1, node: { version: nodeVersion, abi: nodeAbi }, platform, architecture, os: { release: osRelease, version: osVersion }, hostKind, disposition, action });
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
  return frozen({ schemaVersion: 1, status: 'unsupported', reason, host, details });
}

export function assessCudaSupport(host, driverDescription) {
  if (!plainObject(host) || host.schemaVersion !== 1 || !plainObject(host.node) || !plainObject(host.ffi)) return fail('HOST_PROFILE_INVALID', null);
  if (!['unrestricted-process', 'explicit-ffi', 'ffi-denied'].includes(host.ffi.permission) || typeof host.ffi.experimental !== 'boolean') return fail('HOST_PROFILE_INVALID', null);
  if (host.hostKind !== 'windows-native-x64') return fail(host.hostKind?.startsWith('wsl') ? 'WSL_QUALIFICATION_REQUIRED' : host.hostKind?.startsWith('linux-native') ? 'LINUX_QUALIFICATION_REQUIRED' : 'HOST_UNSUPPORTED', host);
  if (host.node.version !== NODE_VERSION) return fail('NODE_VERSION_UNSUPPORTED', host, { required: NODE_VERSION, actual: host.node.version });
  if (host.ffi.experimental !== true) return fail('EXPERIMENTAL_FFI_REQUIRED', host);
  if (host.ffi.permission === 'ffi-denied') return fail('FFI_PERMISSION_REQUIRED', host);
  if (!plainObject(driverDescription) || driverDescription.schemaVersion !== 1 || driverDescription.profile?.nativeQualified !== true || driverDescription.runtime?.backend !== 'windows-native'
      || driverDescription.profile?.platform !== 'win32' || driverDescription.profile?.architecture !== 'x64' || driverDescription.profile?.node !== host.node.version) return fail('WINDOWS_DRIVER_QUALIFICATION_REQUIRED', host);
  if (!Number.isSafeInteger(driverDescription.driver?.apiVersion) || driverDescription.driver.apiVersion < 1 || driverDescription.device?.ordinal !== 0) return fail('WINDOWS_DRIVER_DESCRIPTION_INVALID', host);
  const attributes = driverDescription.device?.attributes;
  if (!plainObject(attributes)) return fail('CUDA_DEVICE_ATTRIBUTES_INVALID', host);
  for (const name of BINARY_ATTRIBUTES) if (![0, 1].includes(attributes[name])) return fail('CUDA_DEVICE_ATTRIBUTES_INVALID', host, { field: name });
  if (!Number.isInteger(attributes.computeMode) || attributes.computeMode < 0 || attributes.computeMode > 3) return fail('CUDA_DEVICE_ATTRIBUTES_INVALID', host, { field: 'computeMode' });
  const computeModes = ['default', 'exclusive-thread', 'prohibited', 'exclusive-process'];
  const driverModel = attributes.tccDriver === 1 ? 'tcc' : attributes.kernelExecTimeout === 1 ? 'wddm-watchdog' : 'wddm-no-watchdog';
  if (attributes.computeMode === 2) return fail('CUDA_COMPUTE_MODE_PROHIBITED', host, { driverModel, computeMode: computeModes[attributes.computeMode] });
  return frozen({
    schemaVersion: 1,
    status: 'accepted',
    reason: null,
    host,
    cuda: {
      driverApiVersion: driverDescription.driver.apiVersion,
      deviceOrdinal: driverDescription.device.ordinal,
      driverModel,
      watchdog: attributes.kernelExecTimeout === 1 ? 'enabled' : 'disabled',
      integrated: attributes.integrated === 1,
      computeMode: computeModes[attributes.computeMode],
    },
    claim: 'exact-windows-f7w-diagnostic-profile',
  });
}
