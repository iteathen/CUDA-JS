import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { requestRecord, validateRequest } from '../src/protocol.mjs';

function tokens() {
  const registry = new ResourceRegistry({ runtimeId: 'protocol-prepared-test', epoch: 1, nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })() });
  const context = registry.allocate({ kind: 'context', value: {}, dispose: async () => ({}) });
  const module = registry.allocate({ kind: 'module', value: {}, parent: context, dispose: async () => ({}) });
  const fn = registry.allocate({ kind: 'function', value: {}, parent: module, dispose: async () => ({}) });
  const memory = registry.allocate({ kind: 'device-memory', value: {}, parent: context, dispose: async () => ({}) });
  const view = registry.allocate({ kind: 'device-view', value: {}, parent: memory, dispose: async () => ({}) });
  const prepared = registry.allocate({ kind: 'prepared-dag', value: {}, parent: context, dispose: async () => ({}) });
  const operation = registry.allocate({ kind: 'operation', value: {}, parent: context, dispose: async () => ({}) });
  return { fn, memory, view, prepared, operation };
}

const OPTIONS = Object.freeze({ executionPolicy: Object.freeze({ maxModuleBytes: 4 * 1_048_576, maxArguments: 32 }) });

function kernel(functionToken) {
  return {
    id: 'step', kind: 'kernel', after: [], functionToken,
    grid: { x: 1, y: 1, z: 1 }, block: { x: 32, y: 1, z: 1 }, sharedMemoryBytes: 0,
    arguments: [{ binding: 'data' }, { kind: 'u32', value: 4 }],
    accesses: [{ argumentIndex: 0, byteOffset: 0, byteLength: 16, mode: 'read-write' }],
  };
}

test('Driver protocol admits exact prepared create, resource, and submission commands', () => {
  const { fn, memory, view, prepared, operation } = tokens();
  const create = requestRecord(1, 'execution.prepared.create', { nodes: [kernel(fn)] });
  assert.equal(validateRequest(create, OPTIONS), create);
  for (const name of ['execution.prepared.status', 'execution.prepared.release']) {
    const request = requestRecord(2, name, { token: prepared });
    assert.equal(validateRequest(request, OPTIONS), request);
  }
  const withMemory = requestRecord(3, 'execution.prepared.submit', {
    token: prepared,
    bindings: [{ name: 'data', kind: 'device-memory', memory, byteOffset: 0 }],
    after: operation,
  });
  assert.equal(validateRequest(withMemory, OPTIONS), withMemory);
  const withViewAndScalar = requestRecord(4, 'execution.prepared.submit', {
    token: prepared,
    bindings: [{ name: 'count', kind: 'f16', value: Infinity }, { name: 'data', kind: 'device-view', view }],
    after: null,
  });
  assert.equal(validateRequest(withViewAndScalar, OPTIONS), withViewAndScalar);
});

test('Driver protocol rejects widened prepared topology and binding surfaces', () => {
  const { fn, memory, prepared } = tokens();
  assert.throws(() => validateRequest(requestRecord(5, 'execution.prepared.create', {
    nodes: [{ ...kernel(fn), transfer: true }],
  }), OPTIONS), { code: 'DRIVER_PREPARED_OPTIONS' });
  assert.throws(() => validateRequest(requestRecord(6, 'execution.prepared.create', {
    nodes: [{ ...kernel(fn), kind: 'library' }],
  }), OPTIONS), { code: 'DRIVER_PREPARED_OPTIONS' });
  assert.throws(() => validateRequest(requestRecord(7, 'execution.prepared.submit', {
    token: prepared,
    bindings: [{ name: 'data', kind: 'device-memory', memory, byteOffset: 0, pointer: 1n }],
    after: null,
  }), OPTIONS), { code: 'DRIVER_PREPARED_BINDINGS' });
  assert.throws(() => validateRequest(requestRecord(8, 'execution.prepared.submit', {
    token: prepared,
    bindings: [
      { name: 'data', kind: 'device-memory', memory, byteOffset: 0 },
      { name: 'data', kind: 'device-memory', memory, byteOffset: 0 },
    ],
    after: null,
  }), OPTIONS), { code: 'DRIVER_PREPARED_BINDINGS' });
});
