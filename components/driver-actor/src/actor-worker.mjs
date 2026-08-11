import { parentPort, workerData } from 'node:worker_threads';

import { serializeError } from './errors.mjs';
import { assertPublicRecord, validateRequest } from './protocol.mjs';

if (!parentPort) throw new Error('DriverActor must run in a Worker.');

function post(message) {
  assertPublicRecord(message, { maxByteLength: workerData.memoryPolicy.maxTransferBytes });
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
        request = validateRequest(message, { testHooks: workerData.testHooks === true, memoryPolicy: workerData.memoryPolicy, executionPolicy: workerData.executionPolicy });
        backend.assertAccepting?.(request.operation, request.requestId);
        let result;
        if (request.operation === 'runtime.describe') result = await backend.describe({ operationId: request.requestId });
        else if (request.operation === 'context.status') result = await backend.contextStatus({ token: request.payload.token, operationId: request.requestId });
        else if (request.operation === 'memory.allocate') result = await backend.memory.allocate({ byteLength: request.payload.byteLength, operationId: request.requestId });
        else if (request.operation === 'memory.status') result = await backend.memory.status(request.payload.token, request.requestId);
        else if (request.operation === 'memory.write') result = await backend.memory.write(request.payload.token, request.payload.bytes, { deviceOffset: request.payload.deviceOffset, operationId: request.requestId });
        else if (request.operation === 'memory.read') result = await backend.memory.read(request.payload.token, { deviceOffset: request.payload.deviceOffset, byteLength: request.payload.byteLength, operationId: request.requestId });
        else if (request.operation === 'memory.release') result = await backend.memory.release(request.payload.token, request.requestId);
        else if (request.operation === 'execution.module.load') result = await backend.execution.loadModule({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'execution.module.status') result = backend.execution.moduleStatus(request.payload.token, request.requestId);
        else if (request.operation === 'execution.module.release') result = await backend.execution.releaseModule(request.payload.token, request.requestId);
        else if (request.operation === 'execution.function.get') result = await backend.execution.getFunction(request.payload.moduleToken, { name: request.payload.name, parameters: request.payload.parameters, operationId: request.requestId });
        else if (request.operation === 'execution.function.status') result = backend.execution.functionStatus(request.payload.token, request.requestId);
        else if (request.operation === 'execution.function.release') result = await backend.execution.releaseFunction(request.payload.token, request.requestId);
        else if (request.operation === 'execution.launch') result = await backend.execution.launch(request.payload.functionToken, { ...request.payload, operationId: request.requestId });
        else if (request.operation === 'runtime.close') result = await backend.close({ operationId: request.requestId });
        else if (request.operation === 'testing.block') result = await backend.testingBlock({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.inject-health') result = await backend.testingInjectHealth({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.execution-mode') result = await backend.testingSetExecutionMode({ ...request.payload, operationId: request.requestId });
        else throw Object.assign(new Error('Validated command has no handler.'), { code: 'DRIVER_COMMAND_HANDLER', category: 'internal' });
        const state = request.operation.startsWith('memory.')
          ? { inventory: backend.inventory(), memory: result.usage ?? null, execution: backend.execution.summary() }
          : request.operation.startsWith('execution.')
            ? { inventory: backend.inventory(), execution: backend.execution.summary() }
            : null;
        post({ kind: 'response', requestId: request.requestId, ok: true, result, state });
      } catch (error) {
        const requestId = request?.requestId ?? (Number.isSafeInteger(message?.requestId) ? message.requestId : 0);
        const state = backend ? { inventory: backend.inventory(), execution: backend.execution.summary() } : null;
        post({ kind: 'response', requestId, ok: false, error: serializeError(error), state });
        if (error?.healthAfter === 'restart-required') setImmediate(() => parentPort.close());
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
