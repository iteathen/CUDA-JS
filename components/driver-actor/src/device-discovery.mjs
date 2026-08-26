import { Worker } from 'node:worker_threads';

import { deserializeError, DriverRuntimeError } from './errors.mjs';

function workerExecArgv() {
  return process.execArgv.filter((argument) => argument === '--experimental-ffi'
    || argument === '--permission'
    || argument === '--permission-audit'
    || argument === '--allow-ffi'
    || argument === '--allow-worker'
    || argument.startsWith('--allow-fs-read=')
    || argument.startsWith('--allow-fs-write='));
}

function validateInventory(value) {
  if (!Array.isArray(value) || value.length > 256) throw new DriverRuntimeError('DRIVER_DEVICE_INVENTORY_INVALID', 'internal', 'Device-discovery Worker returned an invalid inventory.');
  return Object.freeze(value.map((device, index) => {
    if (device === null || typeof device !== 'object' || Array.isArray(device)
        || Object.keys(device).sort().join('\0') !== 'computeCapabilityMajor\0computeCapabilityMinor\0nativeDevice'
        || !Number.isSafeInteger(device.nativeDevice) || device.nativeDevice < 0
        || !Number.isSafeInteger(device.computeCapabilityMajor) || device.computeCapabilityMajor < 1 || device.computeCapabilityMajor > 99
        || !Number.isSafeInteger(device.computeCapabilityMinor) || device.computeCapabilityMinor < 0 || device.computeCapabilityMinor > 99) {
      throw new DriverRuntimeError('DRIVER_DEVICE_INVENTORY_INVALID', 'internal', 'Device-discovery Worker returned an invalid device record.', { index });
    }
    return Object.freeze({ ...device });
  }));
}

export async function discoverDriverDevices() {
  if (!process.execArgv.includes('--experimental-ffi')) throw new DriverRuntimeError('DRIVER_FFI_FLAG_REQUIRED', 'unsupported', 'Native CUDA device discovery requires Node experimental FFI.');
  if (process.permission !== undefined && !process.execArgv.includes('--permission')) throw new DriverRuntimeError('DRIVER_PERMISSION_PROFILE_UNSUPPORTED', 'unsupported', 'Native CUDA device discovery requires explicit permission arguments.');
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./device-discovery-worker.mjs', import.meta.url), { execArgv: workerExecArgv() });
    let settled = false;
    let received = false;
    let inventory = null;
    let responseError = null;
    worker.on('message', (message) => {
      if (settled || received) return;
      received = true;
      if (message?.kind === 'ready') {
        try { inventory = validateInventory(message.result); } catch (error) { responseError = error; }
      } else if (message?.kind === 'startup-error') responseError = deserializeError(message.error);
      else responseError = new DriverRuntimeError('DRIVER_DEVICE_DISCOVERY_PROTOCOL', 'internal', 'Device-discovery Worker returned an invalid response.');
    });
    worker.on('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    worker.on('exit', (code) => {
      if (settled) return;
      settled = true;
      if (code !== 0 || !received) {
        reject(new DriverRuntimeError('DRIVER_DEVICE_DISCOVERY_WORKER_LOST', 'restart-required', 'Device-discovery Worker exited before returning a terminal inventory.', { exitCode: code }));
      } else if (responseError) reject(responseError);
      else resolve(inventory);
    });
  });
}
