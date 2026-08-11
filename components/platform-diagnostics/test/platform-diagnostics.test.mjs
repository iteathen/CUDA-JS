import assert from 'node:assert/strict';
import test from 'node:test';

import { assessCudaSupport, classifyHost, inspectHostProfile, permissionState } from '../index.mjs';

function host(overrides = {}) {
  return inspectHostProfile({
    nodeVersion: 'v26.7.0', nodeAbi: '141', platform: 'win32', architecture: 'x64',
    osRelease: '10.0.26200', osVersion: 'Windows 11', procVersion: '',
    execArgv: ['--experimental-ffi'], permissionEnabled: false, ...overrides,
  });
}

function driver(overrides = {}) {
  return {
    schemaVersion: 1,
    runtime: { backend: 'windows-native' },
    profile: { nativeQualified: true, node: 'v26.7.0', platform: 'win32', architecture: 'x64' },
    driver: { apiVersion: 13030 },
    device: { ordinal: 0, attributes: { kernelExecTimeout: 1, integrated: 0, computeMode: 0, tccDriver: 0, ...overrides } },
  };
}

test('host classifier keeps Windows, native Linux, SBSA candidates, and WSL distinct', () => {
  const base = { nodeVersion: 'v26.7.0', nodeAbi: '141', osRelease: '6.8.0', osVersion: 'Linux', procVersion: '' };
  assert.equal(classifyHost({ ...base, platform: 'win32', architecture: 'x64' }).hostKind, 'windows-native-x64');
  assert.equal(classifyHost({ ...base, platform: 'linux', architecture: 'x64' }).hostKind, 'linux-native-x64');
  assert.equal(classifyHost({ ...base, platform: 'linux', architecture: 'arm64' }).hostKind, 'linux-native-arm64');
  assert.equal(classifyHost({ ...base, platform: 'linux', architecture: 'x64', osRelease: '5.15.0-microsoft-standard-WSL2' }).hostKind, 'wsl2-x64');
  assert.equal(classifyHost({ ...base, platform: 'linux', architecture: 'x64', procVersion: 'Microsoft' }).hostKind, 'wsl1-x64');
  assert.equal(classifyHost({ ...base, platform: 'darwin', architecture: 'arm64' }).disposition, 'unsupported');
  assert.throws(() => classifyHost({ ...base, platform: 'linux', architecture: 'x64', extra: true }), { code: 'PLATFORM_PROFILE_INVALID' });
});

test('permission and launch diagnostics fail closed', () => {
  assert.equal(permissionState({ permissionEnabled: false, ffiAllowed: false }), 'unrestricted-process');
  assert.equal(permissionState({ permissionEnabled: true, ffiAllowed: true }), 'explicit-ffi');
  assert.equal(permissionState({ permissionEnabled: true, ffiAllowed: false }), 'ffi-denied');
  assert.equal(assessCudaSupport(host({ execArgv: [] }), driver()).reason, 'EXPERIMENTAL_FFI_REQUIRED');
  assert.equal(assessCudaSupport(host({ permissionEnabled: true, ffiAllowed: false }), driver()).reason, 'FFI_PERMISSION_REQUIRED');
  assert.equal(assessCudaSupport(host({ nodeVersion: 'v26.7.1' }), driver()).reason, 'NODE_VERSION_UNSUPPORTED');
  assert.equal(assessCudaSupport(host({ platform: 'linux', osVersion: 'Linux' }), driver()).reason, 'LINUX_QUALIFICATION_REQUIRED');
});

test('Windows CUDA diagnostics distinguish WDDM watchdog and TCC without changing device state', () => {
  const wddm = assessCudaSupport(host(), driver());
  assert.equal(wddm.status, 'accepted');
  assert.equal(wddm.cuda.driverModel, 'wddm-watchdog');
  assert.equal(wddm.cuda.watchdog, 'enabled');
  assert.equal(Object.isFrozen(wddm.cuda), true);
  assert.equal(assessCudaSupport(host(), driver({ kernelExecTimeout: 0 })).cuda.driverModel, 'wddm-no-watchdog');
  assert.equal(assessCudaSupport(host(), driver({ kernelExecTimeout: 0, tccDriver: 1 })).cuda.driverModel, 'tcc');
  assert.equal(assessCudaSupport(host(), driver({ computeMode: 2 })).reason, 'CUDA_COMPUTE_MODE_PROHIBITED');
  assert.equal(assessCudaSupport(host(), driver({ tccDriver: 7 })).reason, 'CUDA_DEVICE_ATTRIBUTES_INVALID');
});
