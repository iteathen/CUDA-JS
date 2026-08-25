import assert from 'node:assert/strict';
import test from 'node:test';

import { assessCudaSupport, classifyHost, classifyNodeRuntime, inspectHostProfile, permissionState } from '../index.mjs';

function host(overrides = {}) {
  return inspectHostProfile({
    nodeVersion: 'v26.7.0', nodeAbi: '147', platform: 'win32', architecture: 'x64',
    osRelease: '10.0.26200', osVersion: 'Windows 11', procVersion: '',
    execArgv: ['--experimental-ffi'], permissionEnabled: false, ...overrides,
  });
}

function driver(overrides = {}) {
  return {
    schemaVersion: 1,
    runtime: { backend: 'windows-native' },
    profile: { nativeOperational: true, nativeQualified: false, node: 'v26.7.0', platform: 'win32', architecture: 'x64' },
    driver: { apiVersion: 13030 },
    device: { ordinal: 0, attributes: { kernelExecTimeout: 1, integrated: 0, computeMode: 0, tccDriver: 0, ...overrides } },
  };
}

function linuxDriver(overrides = {}) {
  return {
    schemaVersion: 1,
    runtime: { backend: 'linux-native' },
    profile: { nativeOperational: true, nativeQualified: false, node: 'v26.7.0', platform: 'linux', architecture: 'x64' },
    driver: { apiVersion: 13030 },
    device: { ordinal: 0, attributes: { kernelExecTimeout: 0, integrated: 0, computeMode: 0, tccDriver: 0, ...overrides } },
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
  assert.equal(classifyNodeRuntime('v26.0.0').disposition, 'known-incompatible');
  assert.equal(classifyNodeRuntime('v26.6.0').disposition, 'testing-unconfirmed');
  assert.equal(classifyNodeRuntime('v26.7.0').disposition, 'qualified-experimental');
  assert.equal(classifyNodeRuntime('v27.0.0').disposition, 'testing-unconfirmed');
  assert.equal(assessCudaSupport(host({ nodeVersion: 'v26.0.0' }), driver()).reason, 'NODE_SUBSTRATE_INCOMPATIBLE');
  const candidateDriver = driver();
  candidateDriver.profile.node = 'v26.6.0';
  assert.equal(assessCudaSupport(host({ nodeVersion: 'v26.6.0' }), candidateDriver).status, 'testing-unconfirmed');
  assert.equal(assessCudaSupport(host({ platform: 'linux', osVersion: 'Linux' }), driver()).reason, 'LINUX_DRIVER_BACKEND_INCOMPATIBLE');
  assert.equal(assessCudaSupport(host({ platform: 'linux', architecture: 'arm64', osVersion: 'Linux' }), linuxDriver()).reason, 'LINUX_BACKEND_UNAVAILABLE');
});

test('native Linux x64 uses the same unconfirmed assessment contract without Windows driver-model semantics', () => {
  const linuxHost = host({ platform: 'linux', architecture: 'x64', osVersion: 'Linux' });
  const assessment = assessCudaSupport(linuxHost, linuxDriver());
  assert.equal(assessment.status, 'testing-unconfirmed');
  assert.equal(assessment.claim, 'testing-only-unconfirmed-profile');
  assert.equal(assessment.cuda.driverModel, 'linux-native');
  assert.equal(assessment.cuda.watchdog, 'disabled');
  assert.equal(assessment.cuda.computeMode, 'default');
  assert.equal(Object.isFrozen(assessment.cuda), true);
  assert.equal(assessCudaSupport(linuxHost, linuxDriver({ computeMode: 2 })).reason, 'CUDA_COMPUTE_MODE_PROHIBITED');
  assert.equal(assessCudaSupport(linuxHost, linuxDriver({ kernelExecTimeout: 7 })).reason, 'CUDA_DEVICE_ATTRIBUTES_INVALID');
});

test('Windows CUDA diagnostics distinguish WDDM watchdog and TCC without changing device state', () => {
  const wddm = assessCudaSupport(host(), driver());
  assert.equal(wddm.status, 'testing-unconfirmed');
  assert.equal(wddm.claim, 'testing-only-unconfirmed-profile');
  assert.equal(wddm.cuda.driverModel, 'wddm-watchdog');
  assert.equal(wddm.cuda.watchdog, 'enabled');
  assert.equal(Object.isFrozen(wddm.cuda), true);
  assert.equal(assessCudaSupport(host(), driver({ kernelExecTimeout: 0 })).cuda.driverModel, 'wddm-no-watchdog');
  assert.equal(assessCudaSupport(host(), driver({ kernelExecTimeout: 0, tccDriver: 1 })).cuda.driverModel, 'tcc');
  assert.equal(assessCudaSupport(host(), driver({ computeMode: 2 })).reason, 'CUDA_COMPUTE_MODE_PROHIBITED');
  assert.equal(assessCudaSupport(host(), driver({ tccDriver: 7 })).reason, 'CUDA_DEVICE_ATTRIBUTES_INVALID');
});
