import { parentPort, workerData } from 'node:worker_threads';

import { serializeError } from './errors.mjs';
import { assertPublicRecord, validateRequest } from './protocol.mjs';

if (!parentPort) throw new Error('DriverActor must run in a Worker.');

function post(message) {
  assertPublicRecord(message);
  parentPort.postMessage(message);
}

async function loadBackend() {
  if (workerData.backend === 'windows-native') {
    const module = await import('./backends/windows-native.mjs');
    return module.createBackend(workerData);
  }
  if (workerData.backend === 'mock' && workerData.testHooks === true) {
    const module = await import('./backends/mock.mjs');
    return module.createBackend(workerData);
  }
  throw Object.assign(new Error('DriverActor backend profile is not allowlisted.'), { code: 'DRIVER_BACKEND_UNSUPPORTED', category: 'unsupported' });
}

try {
  const backend = await loadBackend();
  const initial = await backend.describe({ operationId: 0 });
  post({ kind: 'ready', result: initial });

  let queue = Promise.resolve();
  parentPort.on('message', (message) => {
    queue = queue.then(async () => {
      let request;
      try {
        request = validateRequest(message, { testHooks: workerData.testHooks === true });
        let result;
        if (request.operation === 'runtime.describe') result = await backend.describe({ operationId: request.requestId });
        else if (request.operation === 'context.status') result = await backend.contextStatus({ token: request.payload.token, operationId: request.requestId });
        else if (request.operation === 'runtime.close') result = await backend.close({ operationId: request.requestId });
        else if (request.operation === 'testing.block') result = await backend.testingBlock({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.inject-health') result = await backend.testingInjectHealth({ ...request.payload, operationId: request.requestId });
        else throw Object.assign(new Error('Validated command has no handler.'), { code: 'DRIVER_COMMAND_HANDLER', category: 'internal' });
        post({ kind: 'response', requestId: request.requestId, ok: true, result });
      } catch (error) {
        const requestId = request?.requestId ?? (Number.isSafeInteger(message?.requestId) ? message.requestId : 0);
        post({ kind: 'response', requestId, ok: false, error: serializeError(error) });
      } finally {
        if (request?.operation === 'runtime.close') setImmediate(() => parentPort.close());
      }
    }).catch((error) => {
      post({ kind: 'fatal', error: serializeError(error) });
      parentPort.close();
    });
  });
} catch (error) {
  post({ kind: 'startup-error', error: serializeError(error) });
  parentPort.close();
}
