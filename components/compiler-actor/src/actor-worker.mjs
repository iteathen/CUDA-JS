import { createHash } from 'node:crypto';
import { parentPort, workerData } from 'node:worker_threads';

import { ArtifactCache } from './cache.mjs';
import { compileIdentity, linkIdentity, normalizeCompileRequest, normalizeLinkRequest, plainObject } from './contract.mjs';
import { CompilerRuntimeError, serializeError } from './errors.mjs';

if (!parentPort) throw new Error('CompilerActor must run in a Worker.');

function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function publicProvider(provider) { return { profile: provider.identity.profile, nvrtc: provider.identity.nvrtc, nvrtcBuiltins: provider.identity.nvrtcBuiltins, nvJitLink: provider.identity.nvJitLink }; }

async function loadBackend() {
  if (workerData.backend === 'windows-native') return (await import('./backends/windows-native.mjs')).createBackend();
  if (workerData.backend === 'mock' && workerData.testHooks === true) return (await import('./backends/mock.mjs')).createBackend();
  throw new CompilerRuntimeError('COMPILER_BACKEND_UNSUPPORTED', 'unsupported', 'CompilerActor backend is not allowlisted.');
}

function validateEnvelope(message) {
  if (!plainObject(message) || Object.keys(message).sort().join('\0') !== 'operation\0payload\0requestId\0schemaVersion'
      || message.schemaVersion !== 1 || !Number.isSafeInteger(message.requestId) || message.requestId < 1 || typeof message.operation !== 'string' || !plainObject(message.payload)) {
    throw new CompilerRuntimeError('COMPILER_COMMAND_INVALID', 'validation', 'CompilerActor command envelope is invalid.');
  }
  const allowed = new Set(['runtime.status', 'compiler.compile', 'linker.link', 'cache.invalidate', 'runtime.close', ...(workerData.testHooks ? ['testing.block'] : [])]);
  if (!allowed.has(message.operation)) throw new CompilerRuntimeError('COMPILER_COMMAND_UNSUPPORTED', 'validation', 'CompilerActor command is not allowlisted.', { operation: message.operation });
  return message;
}

try {
  const backend = await loadBackend();
  const cache = new ArtifactCache({ directory: workerData.cacheDirectory, mode: workerData.cacheMode });
  await cache.initialize();
  let health = 'healthy';
  let closed = false;
  let operationSequence = 0;

  const status = () => ({
    schemaVersion: 1,
    runtime: { state: closed ? 'closed' : 'open', backend: workerData.backend },
    provider: publicProvider(backend.provider),
    cache: { mode: cache.mode },
    resources: { ...backend.resources },
    health: { current: health },
    operationSequence,
    claim: workerData.backend === 'windows-native' ? 'exact-windows-f6w-profile' : 'platform-neutral-compiler-mock-only',
  });

  parentPort.postMessage({ kind: 'ready', result: status() });
  let queue = Promise.resolve();
  parentPort.on('message', (message) => {
    queue = queue.then(async () => {
      let requestId = message?.requestId;
      try {
        const request = validateEnvelope(message);
        requestId = request.requestId;
        operationSequence = requestId;
        if (closed) throw new CompilerRuntimeError('COMPILER_RUNTIME_CLOSED', 'closed-runtime', 'CompilerActor is closed.');
        let result;
        if (request.operation === 'runtime.status') result = status();
        else if (request.operation === 'compiler.compile') {
          const normalized = normalizeCompileRequest(request.payload, backend.provider.platform);
          const identity = compileIdentity(normalized, backend.provider);
          const cached = await cache.lookup(identity);
          let bytes = cached.artifact;
          let log = '';
          if (!bytes) {
            const native = await backend.compile(normalized);
            bytes = native.bytes;
            log = native.log;
            await cache.publish(identity, bytes);
          }
          result = {
            schemaVersion: 1,
            operation: 'compile',
            artifact: { format: 'ptx', bytes: Uint8Array.from(bytes), byteLength: bytes.byteLength, sha256: sha256(bytes), architecture: normalized.options.architecture },
            log,
            cache: { key: cached.key, status: cached.status },
            provider: publicProvider(backend.provider),
            health: { current: health },
            operationSequence,
          };
        } else if (request.operation === 'linker.link') {
          const normalized = normalizeLinkRequest(request.payload);
          const identity = linkIdentity(normalized, backend.provider);
          const cached = await cache.lookup(identity);
          let bytes = cached.artifact;
          let log = '';
          if (!bytes) {
            const native = await backend.link(normalized);
            bytes = native.bytes;
            log = native.log;
            await cache.publish(identity, bytes);
          }
          result = {
            schemaVersion: 1,
            operation: 'link',
            artifact: { format: 'cubin', bytes: Uint8Array.from(bytes), byteLength: bytes.byteLength, sha256: sha256(bytes), architecture: normalized.options.architecture },
            log,
            cache: { key: cached.key, status: cached.status },
            provider: publicProvider(backend.provider),
            health: { current: health },
            operationSequence,
          };
        } else if (request.operation === 'cache.invalidate') {
          if (Object.keys(request.payload).join('\0') !== 'key' || typeof request.payload.key !== 'string') throw new CompilerRuntimeError('COMPILER_CACHE_KEY_INVALID', 'validation', 'Cache invalidation requires exactly one key.');
          result = { ...await cache.invalidate(request.payload.key), health: { current: health }, operationSequence };
        } else if (request.operation === 'testing.block') {
          if (Object.keys(request.payload).join('\0') !== 'milliseconds' || !Number.isSafeInteger(request.payload.milliseconds) || request.payload.milliseconds < 1 || request.payload.milliseconds > 2_000) throw new CompilerRuntimeError('COMPILER_TEST_BLOCK_INVALID', 'validation', 'Test block duration is invalid.');
          const storage = new Int32Array(new SharedArrayBuffer(4));
          Atomics.wait(storage, 0, 0, request.payload.milliseconds);
          result = { schemaVersion: 1, blockedMilliseconds: request.payload.milliseconds, health: { current: health }, operationSequence };
        } else if (request.operation === 'runtime.close') {
          if (Object.keys(request.payload).length !== 0) throw new CompilerRuntimeError('COMPILER_COMMAND_INVALID', 'validation', 'Close payload must be empty.');
          await backend.close();
          closed = true;
          health = 'closed';
          const clean = backend.resources.programsCreated === backend.resources.programsDestroyed && backend.resources.linksCreated === backend.resources.linksDestroyed;
          result = { schemaVersion: 1, graceful: clean, cleanupClaim: clean ? (workerData.backend === 'windows-native' ? 'proved-native-resources-and-libraries' : 'proved-mock-lifecycle-only') : 'unproved', resources: { ...backend.resources }, health: { current: health }, operationSequence };
        }
        parentPort.postMessage({ kind: 'response', requestId, ok: true, result });
        if (request.operation === 'runtime.close') parentPort.close();
      } catch (error) {
        if (error?.healthAfter === 'restart-required') health = 'restart-required';
        parentPort.postMessage({ kind: 'response', requestId, ok: false, error: serializeError(error), state: status() });
        if (message?.operation === 'runtime.close') parentPort.close();
      }
    }).catch((error) => {
      health = 'restart-required';
      parentPort.postMessage({ kind: 'fatal', error: serializeError(error) });
      parentPort.close();
    });
  });
} catch (error) {
  parentPort.postMessage({ kind: 'startup-error', error: serializeError(error) });
  parentPort.close();
}
