import { parentPort } from 'node:worker_threads';

import { serializeError } from './errors.mjs';

if (!parentPort) throw new Error('CUDA device discovery must run in a Worker.');

try {
  const backend = process.platform === 'win32' && process.arch === 'x64'
    ? './backends/windows-native.mjs'
    : process.platform === 'linux' && process.arch === 'x64'
      ? './backends/linux-native.mjs'
      : null;
  if (backend === null) throw Object.assign(new Error('CUDA device discovery requires Windows x64 or native Linux x86-64.'), { code: 'DRIVER_PROFILE_UNSUPPORTED', category: 'unsupported' });
  const { discoverDevices } = await import(backend);
  const result = await discoverDevices();
  parentPort.postMessage({ kind: 'ready', result });
} catch (error) {
  parentPort.postMessage({ kind: 'startup-error', error: serializeError(error) });
} finally {
  parentPort.close();
}
