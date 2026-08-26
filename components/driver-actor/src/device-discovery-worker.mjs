import { parentPort } from 'node:worker_threads';

import { serializeError } from './errors.mjs';

if (!parentPort) throw new Error('CUDA device discovery must run in a Worker.');

try {
  const { discoverDevices } = await import('./backends/windows-native.mjs');
  const result = await discoverDevices();
  parentPort.postMessage({ kind: 'ready', result });
} catch (error) {
  parentPort.postMessage({ kind: 'startup-error', error: serializeError(error) });
} finally {
  parentPort.close();
}
