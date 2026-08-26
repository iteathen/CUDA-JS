import { parentPort, workerData } from 'node:worker_threads';

import { DriverRuntimeError, serializeError } from './errors.mjs';
import { assertPublicRecord, validateRequest } from './protocol.mjs';

if (!parentPort) throw new Error('DriverActor must run in a Worker.');

function post(message) {
  assertPublicRecord(message, { maxByteLength: workerData.memoryPolicy.maxTransferBytes });
  parentPort.postMessage(message);
}

async function loadBackend() {
  if (workerData.backend === 'windows-native') return (await import('./backends/windows-native.mjs')).createBackend(workerData);
  if (workerData.backend === 'linux-native') return (await import('./backends/linux-native.mjs')).createBackend(workerData);
  if (workerData.backend === 'mock' && workerData.testHooks === true) return (await import('./backends/mock.mjs')).createBackend(workerData);
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
        backend.execution.assertCommandAllowed(request.operation, request.requestId);
        let result;
        if (request.operation === 'runtime.describe') result = await backend.describe({ operationId: request.requestId });
        else if (request.operation === 'context.status') result = await backend.contextStatus({ token: request.payload.token, operationId: request.requestId });
        else if (request.operation === 'memory.allocate') result = await backend.memory.allocate({ byteLength: request.payload.byteLength, operationId: request.requestId });
        else if (request.operation === 'memory.status') result = await backend.memory.status(request.payload.token, request.requestId);
        else if (request.operation === 'memory.view.create') result = backend.views.create(request.payload.memory, request.payload.options);
        else if (request.operation === 'memory.view.status') result = backend.views.status(request.payload.token);
        else if (request.operation === 'memory.view.release') result = await backend.views.release(request.payload.token);
        else if (request.operation === 'memory.write') result = await backend.memory.write(request.payload.token, request.payload.bytes, { deviceOffset: request.payload.deviceOffset, operationId: request.requestId });
        else if (request.operation === 'memory.read') result = await backend.memory.read(request.payload.token, { deviceOffset: request.payload.deviceOffset, byteLength: request.payload.byteLength, operationId: request.requestId });
        else if (request.operation === 'memory.transfer.h2d') result = await backend.transfer.hostToDevice(request.payload.token, request.payload.bytes, { deviceOffset: request.payload.deviceOffset, after: request.payload.after, operationId: request.requestId });
        else if (request.operation === 'memory.transfer.d2h') result = await backend.transfer.deviceToHost(request.payload.token, { deviceOffset: request.payload.deviceOffset, byteLength: request.payload.byteLength, after: request.payload.after, operationId: request.requestId });
        else if (request.operation === 'memory.transfer.d2d') result = await backend.transfer.deviceToDevice(request.payload.destinationToken, request.payload.sourceToken, { destinationOffset: request.payload.destinationOffset, sourceOffset: request.payload.sourceOffset, byteLength: request.payload.byteLength, after: request.payload.after, operationId: request.requestId });
        else if (request.operation === 'mailbox.create') result = await backend.mailboxes.create(request.payload.buffer, { lanes: request.payload.lanes, operationId: request.requestId });
        else if (request.operation === 'mailbox.status') result = backend.mailboxes.status(request.payload.token, request.requestId);
        else if (request.operation === 'mailbox.reset') result = backend.mailboxes.reset(request.payload.token, request.payload.generation, request.requestId);
        else if (request.operation === 'mailbox.release') result = await backend.mailboxes.release(request.payload.token, request.requestId);
        else if (request.operation === 'memory.release') result = await backend.memory.release(request.payload.token, request.requestId);
        else if (request.operation === 'execution.module.load') result = await backend.execution.loadModule({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'execution.module.status') result = backend.execution.moduleStatus(request.payload.token, request.requestId);
        else if (request.operation === 'execution.module.release') result = await backend.execution.releaseModule(request.payload.token, request.requestId);
        else if (request.operation === 'execution.function.get') result = await backend.execution.getFunction(request.payload.moduleToken, { name: request.payload.name, parameters: request.payload.parameters, operationId: request.requestId });
        else if (request.operation === 'execution.function.status') result = backend.execution.functionStatus(request.payload.token, request.requestId);
        else if (request.operation === 'execution.function.release') result = await backend.execution.releaseFunction(request.payload.token, request.requestId);
        else if (request.operation === 'execution.submit') result = await backend.execution.submit(request.payload.functionToken, { ...request.payload, operationId: request.requestId });
        else if (request.operation === 'execution.prepared.create') result = await backend.execution.prepareOperationDag({ nodes: request.payload.nodes, operationId: request.requestId });
        else if (request.operation === 'execution.prepared.status') result = backend.execution.preparedOperationDagStatus(request.payload.token, request.requestId);
        else if (request.operation === 'execution.prepared.submit') result = await backend.execution.submitPreparedOperationDag(request.payload.token, { bindings: request.payload.bindings, after: request.payload.after, operationId: request.requestId });
        else if (request.operation === 'execution.prepared.release') result = await backend.execution.releasePreparedOperationDag(request.payload.token, request.requestId);
        else if (request.operation === 'execution.operation.status') result = await backend.execution.operationStatus(request.payload.token, request.requestId);
        else if (request.operation === 'execution.operation.release') result = await backend.execution.releaseOperation(request.payload.token, request.requestId);
        else if (request.operation === 'execution.operation.timeout') result = await backend.execution.legacyTimeout(request.payload.token, request.requestId);
        else if (request.operation === 'runtime.close') {
          const prepared = await backend.execution.prepareClose(request.requestId);
          if (prepared.pendingOperation) {
            throw new DriverRuntimeError('EXECUTION_CLOSE_TERMINALITY_UNPROVED', 'restart-required', 'Runtime close cannot begin dependency teardown while GPU operation terminality is unproved.', {}, { operationId: request.requestId, healthBefore: 'restart-required', healthAfter: 'restart-required' });
          }
          result = await backend.close({ operationId: request.requestId });
        } else if (request.operation === 'testing.block') result = await backend.testingBlock({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.inject-health') result = await backend.testingInjectHealth({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.execution-mode') result = await backend.testingSetExecutionMode({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.disposal-mode') result = await backend.testingSetDisposalMode({ ...request.payload, operationId: request.requestId });
        else if (request.operation === 'testing.disposal-status') result = await backend.testingDisposalStatus({ operationId: request.requestId });
        else throw Object.assign(new Error('Validated command has no handler.'), { code: 'DRIVER_COMMAND_HANDLER', category: 'internal' });
        const state = request.operation.startsWith('memory.') || request.operation.startsWith('mailbox.')
          ? { inventory: backend.inventory(), memory: result.usage ?? null, execution: backend.execution.summary() }
          : request.operation.startsWith('execution.')
            ? { inventory: backend.inventory(), execution: backend.execution.summary() }
            : null;
        post({ kind: 'response', requestId: request.requestId, ok: true, result, state });
      } catch (error) {
        const requestId = request?.requestId ?? (Number.isSafeInteger(message?.requestId) ? message.requestId : 0);
        const observedError = backend?.observeError?.(error, { operation: request?.operation ?? null, operationId: requestId }) ?? error;
        const state = backend ? { health: backend.health?.() ?? null, inventory: backend.inventory(), execution: backend.execution.summary() } : null;
        post({ kind: 'response', requestId, ok: false, error: serializeError(observedError), state });
        if (state?.health?.current === 'restart-required' || observedError?.healthAfter === 'restart-required' || observedError?.category === 'restart-required') setImmediate(() => parentPort.close());
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
