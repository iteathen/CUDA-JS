import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { requestRecord, validateRequest } from '../src/protocol.mjs';

function tokens() {
  const registry = new ResourceRegistry({
    runtimeId: 'protocol-numeric-test',
    epoch: 1,
    nonce: (() => { let value = 0; return () => (++value).toString(16).padStart(32, '0'); })(),
  });
  const context = registry.allocate({ kind: 'context', value: {}, dispose: async () => ({}) });
  const module = registry.allocate({ kind: 'module', value: {}, parent: context, dispose: async () => ({}) });
  const fn = registry.allocate({ kind: 'function', value: {}, parent: module, dispose: async () => ({}) });
  const mailbox = registry.allocate({ kind: 'publication-mailbox', value: {}, parent: context, dispose: async () => ({}) });
  return { module, fn, mailbox };
}

const OPTIONS = Object.freeze({ executionPolicy: Object.freeze({ maxModuleBytes: 4 * 1_048_576, maxArguments: 32 }) });

test('Driver protocol accepts SPEC-0021 function parameter kinds from the execution ABI owner', () => {
  const { module } = tokens();
  const request = requestRecord(1, 'execution.function.get', {
    moduleToken: module,
    name: 'extended',
    parameters: [{ kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }, { kind: 'f32' }],
  });
  assert.equal(validateRequest(request, OPTIONS), request);
});

test('Driver protocol uses the same scalar-value admission semantics as execution', () => {
  const { fn } = tokens();
  const base = {
    functionToken: fn,
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    sharedMemoryBytes: 0,
  };
  const accepted = requestRecord(2, 'execution.submit', {
    ...base,
    arguments: [
      { kind: 'f64', value: Number.NaN },
      { kind: 'f16', value: Infinity },
      { kind: 'bf16', value: -Infinity },
    ],
  });
  assert.equal(validateRequest(accepted, OPTIONS), accepted);

  assert.throws(() => validateRequest(requestRecord(3, 'execution.submit', {
    ...base,
    arguments: [{ kind: 'f32', value: Infinity }],
  }), OPTIONS), { code: 'DRIVER_LAUNCH_OPTIONS' });

  assert.throws(() => validateRequest(requestRecord(4, 'execution.submit', {
    ...base,
    arguments: [{ kind: 'f16', value: '1' }],
  }), OPTIONS), { code: 'DRIVER_LAUNCH_OPTIONS' });
});

test('Driver protocol still rejects unsupported parameter kinds', () => {
  const { module } = tokens();
  assert.throws(() => validateRequest(requestRecord(5, 'execution.function.get', {
    moduleToken: module,
    name: 'unsupported',
    parameters: [{ kind: 'i64' }],
  }), OPTIONS), { code: 'DRIVER_FUNCTION_OPTIONS' });
});

test('Driver protocol admits only opaque publication-mailbox bindings for mailbox parameter kinds', () => {
  const { module, fn, mailbox } = tokens();
  const declaration = requestRecord(6, 'execution.function.get', {
    moduleToken: module,
    name: 'mailbox',
    parameters: [{ kind: 'publication-mailbox-host-to-device-u32' }, { kind: 'publication-mailbox-device-to-host-u32' }],
  });
  assert.equal(validateRequest(declaration, OPTIONS), declaration);
  const submission = requestRecord(7, 'execution.submit', {
    functionToken: fn,
    grid: { x: 1, y: 1, z: 1 },
    block: { x: 1, y: 1, z: 1 },
    sharedMemoryBytes: 0,
    arguments: [{ kind: 'publication-mailbox', mailbox, generation: 1, lane: 'control' }],
  });
  assert.equal(validateRequest(submission, OPTIONS), submission);
  assert.throws(() => validateRequest(requestRecord(8, 'execution.submit', {
    ...submission.payload,
    arguments: [{ kind: 'publication-mailbox', mailbox, generation: 1, lane: 'control', pointer: 1n }],
  }), OPTIONS), { code: 'DRIVER_LAUNCH_OPTIONS' });
});
