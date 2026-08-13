import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceError, ResourceRegistry, isResourceToken } from '../index.mjs';

function deterministicRegistry(runtimeId = 'runtime-a') {
  let nonce = 0;
  return new ResourceRegistry({
    runtimeId,
    epoch: 1,
    nonce: () => (++nonce).toString(16).padStart(32, '0'),
  });
}

function expectCode(code) {
  return (error) => error instanceof ResourceError && error.code === code;
}

function structuredFailure({
  code = 'CUDA_DRIVER_FAILURE',
  category,
  operation = 'cuMemFree',
  operationId = 17,
  healthBefore,
  healthAfter,
  details = {},
}) {
  return Object.assign(new Error(`${operation ?? 'cleanup'} failed`), {
    code,
    category,
    operation,
    operationId,
    healthBefore,
    healthAfter,
    details,
  });
}

test('tokens are frozen, exact, and private values require the matching capability', () => {
  const registry = deterministicRegistry();
  const value = { private: true };
  const token = registry.allocate({ kind: 'context', value, dispose() {} });
  assert.equal(Object.isFrozen(token), true);
  assert.equal(isResourceToken(token), true);
  assert.equal(registry.get(token, { kind: 'context' }), value);
  assert.throws(() => registry.get({ ...token, extra: true }), expectCode('RESOURCE_TOKEN_INVALID'));
  assert.throws(() => registry.get({ ...token, runtimeId: 'runtime-b' }), expectCode('RESOURCE_WRONG_RUNTIME'));
  assert.throws(() => registry.get(token, { kind: 'library' }), expectCode('RESOURCE_WRONG_KIND'));
  assert.throws(() => registry.get({ ...token, nonce: 'f'.repeat(32) }), expectCode('RESOURCE_FORGED'));
});

test('slots reuse only after close and stale generations never resolve replacements', async () => {
  const registry = deterministicRegistry();
  const first = registry.allocate({ kind: 'context', value: 'first', dispose() {} });
  await registry.close(first);
  assert.throws(() => registry.get(first), expectCode('RESOURCE_CLOSED'));
  const second = registry.allocate({ kind: 'context', value: 'second', dispose() {} });
  assert.equal(second.slot, first.slot);
  assert.equal(second.generation, first.generation + 1);
  assert.notEqual(second.nonce, first.nonce);
  assert.throws(() => registry.get(first), expectCode('RESOURCE_STALE'));
  assert.equal(registry.get(second), 'second');
});

test('leases and children fence disposal while cascade closes child before parent', async () => {
  const registry = deterministicRegistry();
  const order = [];
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() { order.push('library'); } });
  const child = registry.allocate({ kind: 'context', value: 'context', parent, dispose() { order.push('context'); } });
  const lease = registry.acquire(child, { kind: 'context' });
  await assert.rejects(registry.close(child), expectCode('RESOURCE_BUSY'));
  await assert.rejects(registry.close(parent), expectCode('RESOURCE_HAS_CHILDREN'));
  lease.release();
  assert.throws(() => lease.release(), expectCode('RESOURCE_LEASE_RELEASED'));
  const report = await registry.closeTree(parent);
  assert.deepEqual(order, ['context', 'library']);
  assert.equal(report.errors.length, 0);
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: 2, orphaned: 0 });
});

test('closing state rejects new access until the disposer terminates', async () => {
  const registry = deterministicRegistry();
  let finish;
  const token = registry.allocate({
    kind: 'context',
    value: 'context',
    dispose: () => new Promise((resolve) => { finish = resolve; }),
  });
  const closing = registry.close(token);
  assert.throws(() => registry.get(token), expectCode('RESOURCE_CLOSING'));
  finish({ released: true });
  const record = await closing;
  assert.deepEqual(record.disposition, { released: true });
  assert.throws(() => registry.get(token), expectCode('RESOURCE_CLOSED'));
});

test('disposer failure becomes orphaned and never reports clean cleanup', async () => {
  const registry = deterministicRegistry();
  const token = registry.allocate({
    kind: 'context',
    value: 'context',
    dispose() { throw Object.assign(new Error('destroy failed'), { code: 'CUDA_DESTROY_FAILED' }); },
  });
  await assert.rejects(registry.close(token), expectCode('RESOURCE_DISPOSE_FAILED'));
  assert.equal(registry.inventory().counts.orphaned, 1);
  assert.throws(() => registry.get(token), expectCode('RESOURCE_ORPHANED'));
});

test('pre-disposer token and dependency rejections remain stale-resource and do no disposer work', async () => {
  const registry = deterministicRegistry();
  let parentCalls = 0;
  let childCalls = 0;
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() { parentCalls += 1; } });
  const child = registry.allocate({ kind: 'context', value: 'context', parent, dispose() { childCalls += 1; } });

  await assert.rejects(registry.close(parent), (error) => {
    assert.equal(error.code, 'RESOURCE_HAS_CHILDREN');
    assert.equal(error.category, 'stale-resource');
    assert.equal(error.operation, null);
    assert.equal(error.healthBefore, null);
    assert.equal(error.healthAfter, null);
    return true;
  });
  await assert.rejects(registry.close({ ...child, nonce: 'f'.repeat(32) }), (error) => {
    assert.equal(error.code, 'RESOURCE_FORGED');
    assert.equal(error.category, 'stale-resource');
    return true;
  });
  assert.equal(parentCalls, 0);
  assert.equal(childCalls, 0);
});

for (const expected of [
  {
    label: 'immediate-driver suspect',
    category: 'immediate-driver',
    operation: 'cuMemFree',
    operationId: 21,
    healthBefore: 'healthy',
    healthAfter: 'suspect',
  },
  {
    label: 'deferred-driver poisoned',
    category: 'deferred-driver',
    operation: 'cuEventDestroy',
    operationId: 22,
    healthBefore: 'suspect',
    healthAfter: 'poisoned',
  },
  {
    label: 'restart-required without an underlying observation operation',
    category: 'restart-required',
    operation: null,
    expectedOperation: 'resource.close',
    operationId: 23,
    healthBefore: 'poisoned',
    healthAfter: 'restart-required',
  },
]) {
  test(`structured ${expected.label} disposal provenance is retained and repeated close is deterministic`, async () => {
    const registry = deterministicRegistry();
    let calls = 0;
    const token = registry.allocate({
      kind: 'device-memory',
      value: 'private-native-value',
      dispose() {
        calls += 1;
        throw structuredFailure({
          ...expected,
          details: {
            nativeStatus: 700,
            nativeName: 'CUDA_ERROR_ILLEGAL_ADDRESS',
            nativeDescription: 'device cleanup failed',
            disposalCallCount: calls,
          },
        });
      },
    });

    let first;
    await assert.rejects(registry.close(token), (error) => {
      first = error;
      assert.equal(error.code, 'RESOURCE_DISPOSE_FAILED');
      assert.equal(error.category, expected.category);
      assert.equal(error.operation, expected.expectedOperation ?? expected.operation);
      assert.equal(error.operationId, expected.operationId);
      assert.equal(error.healthBefore, expected.healthBefore);
      assert.equal(error.healthAfter, expected.healthAfter);
      assert.equal(error.details.resourceKind, 'device-memory');
      assert.equal(error.details.resourceState, 'orphaned');
      assert.equal(error.details.disposition, 'orphaned');
      assert.equal(error.details.causeCode, 'CUDA_DRIVER_FAILURE');
      assert.equal(error.details.causeCategory, expected.category);
      assert.equal(error.details.causeNativeStatus, 700);
      assert.equal(error.details.causeNativeName, 'CUDA_ERROR_ILLEGAL_ADDRESS');
      assert.equal(error.details.causeDisposalCallCount, 1);
      assert.equal(Object.isFrozen(error), true);
      assert.equal(Object.isFrozen(error.details), true);
      return true;
    });
    await assert.rejects(registry.close(token), (error) => {
      assert.equal(error, first);
      return true;
    });
    assert.equal(calls, 1);

    const resource = registry.inventory().resources[0];
    assert.equal(resource.state, 'orphaned');
    assert.equal(resource.disposition, 'orphaned');
    assert.equal(resource.failure.code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(resource.failure.category, expected.category);
    assert.equal(resource.failure.healthAfter, expected.healthAfter);
    assert.equal(Object.isFrozen(resource.failure), true);
  });
}

test('unstructured disposal failure becomes restart-required, bounded, sanitized, and non-retryable', async () => {
  const registry = deterministicRegistry();
  let calls = 0;
  const token = registry.allocate({
    kind: 'context',
    value: { nativeHandle: 0x1234n },
    dispose() {
      calls += 1;
      const error = new Error(`cleanup failed at C:\\private\\cuda.dll and /srv/secret/libcuda.so for 0xdeadbeef host build-17 account secret-user nonce ${'a'.repeat(32)} ${'x'.repeat(512)}`);
      error.code = 'EIO';
      error.category = 'immediate-driver';
      error.operation = 'not/a/valid/operation';
      error.details = { disposalCallCount: calls, nativeHandle: 0xdeadbeefn, providerPath: '/srv/secret/libcuda.so' };
      throw error;
    },
  });

  let first;
  await assert.rejects(registry.close(token), (error) => {
    first = error;
    assert.equal(error.code, 'RESOURCE_DISPOSE_FAILED');
    assert.equal(error.category, 'restart-required');
    assert.equal(error.operation, 'resource.close');
    assert.equal(error.operationId, null);
    assert.equal(error.healthBefore, null);
    assert.equal(error.healthAfter, 'restart-required');
    assert.equal(error.details.disposition, 'unproved');
    assert.equal(error.details.causeCode, 'EIO');
    assert.equal(error.details.causeCategory, null);
    assert.equal(error.details.causeDisposalCallCount, 1);
    assert.ok(error.details.causeMessage.length <= 256);
    const serialized = JSON.stringify(error.details);
    assert.equal(serialized.includes('private'), false);
    assert.equal(serialized.includes('/srv/secret'), false);
    assert.equal(serialized.includes('deadbeef'), false);
    assert.equal(serialized.includes('build-17'), false);
    assert.equal(serialized.includes('secret-user'), false);
    assert.equal(serialized.includes('a'.repeat(32)), false);
    assert.equal(serialized.includes('nativeHandle'), false);
    assert.equal(serialized.includes('providerPath'), false);
    return true;
  });
  await assert.rejects(registry.close(token), (error) => error === first);
  assert.equal(calls, 1);
  assert.equal(registry.inventory().resources[0].disposition, 'unproved');
});

test('structured disposal details retain only bounded approved native evidence', async () => {
  const registry = deterministicRegistry();
  const token = registry.allocate({
    kind: 'event',
    value: 'event',
    dispose() {
      throw structuredFailure({
        category: 'immediate-driver',
        healthBefore: 'healthy',
        healthAfter: 'suspect',
        details: {
          nativeStatus: 999,
          nativeName: 'CUDA_ERROR_UNKNOWN',
          nativeDescription: `identity tenant-secret address decimal-native-address-123456789 contact@example.test failed at C:\\secret\\nvcuda.dll with 0xabcdef12 host secret-host user secret-user email account@example.test machine build-17 token ${'b'.repeat(32)} runtimeId runtime-secret ${'z'.repeat(256)}`,
          nativeHandle: 0xabcdef12n,
          providerPath: 'C:\\secret\\nvcuda.dll',
          stack: '/home/account/private.mjs:10',
          raw: { host: 'sensitive' },
        },
      });
    },
  });

  await assert.rejects(registry.close(token), (error) => {
    assert.equal(error.details.causeNativeStatus, 999);
    assert.equal(error.details.causeNativeName, 'CUDA_ERROR_UNKNOWN');
    assert.ok(error.details.causeNativeDescription.length <= 160);
    const serialized = JSON.stringify(error.details);
    assert.equal(serialized.includes('secret'), false);
    assert.equal(serialized.includes('abcdef12'), false);
    assert.equal(serialized.includes('nativeHandle'), false);
    assert.equal(serialized.includes('providerPath'), false);
    assert.equal(serialized.includes('private.mjs'), false);
    assert.equal(serialized.includes('sensitive'), false);
    assert.equal(serialized.includes('secret-host'), false);
    assert.equal(serialized.includes('secret-user'), false);
    assert.equal(serialized.includes('account@example.test'), false);
    assert.equal(serialized.includes('build-17'), false);
    assert.equal(serialized.includes('tenant-secret'), false);
    assert.equal(serialized.includes('decimal-native-address'), false);
    assert.equal(serialized.includes('contact@example.test'), false);
    assert.equal(serialized.includes('b'.repeat(32)), false);
    assert.equal(serialized.includes('runtime-secret'), false);
    return true;
  });
});

test('cascade retains a suspect child failure, closes independent siblings, and orphans its parent unproved', async () => {
  const registry = deterministicRegistry();
  const calls = [];
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() { calls.push('parent'); } });
  registry.allocate({ kind: 'context', value: 'safe', parent, dispose() { calls.push('safe'); } });
  registry.allocate({
    kind: 'context',
    value: 'failing',
    parent,
    dispose() {
      calls.push('failing');
      throw structuredFailure({ category: 'immediate-driver', healthBefore: 'healthy', healthAfter: 'suspect' });
    },
  });

  const report = await registry.closeTree(parent);
  assert.deepEqual(calls, ['failing', 'safe']);
  assert.equal(report.errorCount, 1);
  assert.equal(report.errors[0].code, 'RESOURCE_DISPOSE_FAILED');
  assert.equal(report.errors[0].category, 'immediate-driver');
  assert.equal(report.errors[0].operation, 'cuMemFree');
  assert.equal(report.errors[0].healthAfter, 'suspect');
  assert.equal(report.skippedCount, 1);
  assert.equal(report.skipped[0].resource.kind, 'library');
  assert.equal(report.skipped[0].disposition, 'unproved');
  assert.equal(report.skipped[0].reason, 'dependent-resource-unproved');
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: 1, orphaned: 2 });
});

test('poisoned cascade failure stops further disposer work and marks every skipped resource unproved', async () => {
  const registry = deterministicRegistry();
  const calls = [];
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() { calls.push('parent'); } });
  registry.allocate({ kind: 'context', value: 'unsafe-sibling', parent, dispose() { calls.push('sibling'); } });
  registry.allocate({
    kind: 'context',
    value: 'failing',
    parent,
    dispose() {
      calls.push('failing');
      throw structuredFailure({
        category: 'deferred-driver',
        operation: 'cuEventDestroy',
        healthBefore: 'suspect',
        healthAfter: 'poisoned',
      });
    },
  });

  const report = await registry.closeAll();
  assert.deepEqual(calls, ['failing']);
  assert.equal(report.errorCount, 1);
  assert.equal(report.errors[0].category, 'deferred-driver');
  assert.equal(report.errors[0].healthAfter, 'poisoned');
  assert.equal(report.skippedCount, 2);
  assert.ok(report.skipped.every((record) => record.disposition === 'unproved'));
  assert.ok(report.skipped.every((record) => record.reason === 'unsafe-after-disposal-failure'));
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: 0, orphaned: 3 });
  assert.equal(report.inventory.resources.filter((resource) => resource.disposition === 'unproved').length, 2);

  const repeated = await registry.closeAll();
  assert.deepEqual(calls, ['failing']);
  assert.equal(repeated.errorCount, 1);
  assert.equal(repeated.errors[0].code, 'RESOURCE_DISPOSE_FAILED');
  assert.equal(repeated.skippedCount, 2);
});

test('cascade failure and skipped lists are bounded while total counts and per-resource inventory remain truthful', async () => {
  const registry = deterministicRegistry();
  let calls = 0;
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() {} });
  for (let index = 0; index < 65; index += 1) {
    registry.allocate({
      kind: 'event',
      value: index,
      parent,
      dispose() {
        calls += 1;
        throw structuredFailure({
          category: 'immediate-driver',
          operationId: index,
          healthBefore: 'healthy',
          healthAfter: 'suspect',
        });
      },
    });
  }

  const report = await registry.closeAll();
  assert.equal(calls, 65);
  assert.equal(report.errorCount, 65);
  assert.equal(report.errors.length, 32);
  assert.equal(report.errorsTruncated, 33);
  assert.equal(report.skippedCount, 1);
  assert.equal(report.inventory.resourceCount, 66);
  assert.equal(report.inventory.resources.length, 16);
  assert.equal(report.inventory.resourcesTruncated, 50);
  assert.equal(report.inventory.resources.filter((resource) => resource.failure).length, 16);
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: 0, orphaned: 66 });
});

test('a first unsafe failure beyond the error cap remains visible without replacing the first divergence', async () => {
  const registry = deterministicRegistry();
  let calls = 0;
  const parent = registry.allocate({ kind: 'library', value: 'library', dispose() {} });
  registry.allocate({
    kind: 'event',
    value: 'late-unsafe',
    parent,
    dispose() {
      calls += 1;
      throw structuredFailure({
        code: 'CUDA_DEFERRED_FAILURE',
        category: 'deferred-driver',
        operation: 'cuEventDestroy',
        operationId: 1,
        healthBefore: 'suspect',
        healthAfter: 'poisoned',
      });
    },
  });
  for (let index = 0; index < 32; index += 1) {
    registry.allocate({
      kind: 'event',
      value: index,
      parent,
      dispose() {
        calls += 1;
        throw structuredFailure({
          category: 'immediate-driver',
          operationId: index + 2,
          healthBefore: 'healthy',
          healthAfter: 'suspect',
        });
      },
    });
  }

  const report = await registry.closeAll();
  assert.equal(calls, 33);
  assert.equal(report.errorCount, 33);
  assert.equal(report.errors.length, 32);
  assert.equal(report.errorsTruncated, 1);
  assert.equal(report.errors[0].category, 'immediate-driver');
  assert.equal(report.errors[0].operationId, 33);
  assert.equal(report.errors.at(-1).category, 'deferred-driver');
  assert.equal(report.errors.at(-1).operationId, 1);
  assert.equal(report.errors.at(-1).healthAfter, 'poisoned');
  assert.equal(report.skippedCount, 1);
  assert.equal(report.skipped[0].resource.kind, 'library');
  assert.equal(report.skipped[0].blockedByCategory, 'deferred-driver');
});

test('large inventories and cascade dispositions are bounded with exact totals and material-record priority', async () => {
  const registry = deterministicRegistry();
  for (let index = 0; index < 300; index += 1) {
    registry.allocate({
      kind: 'event',
      value: index,
      dispose() {},
    });
  }

  const before = registry.inventory();
  assert.equal(before.resourceCount, 300);
  assert.equal(before.resources.length, 16);
  assert.equal(before.resourcesTruncated, 284);
  assert.deepEqual(before.counts, { live: 300, closing: 0, closed: 0, orphaned: 0 });

  let failed;
  const material = registry.allocate({
    kind: 'event',
    value: 'material',
    dispose() {
      throw structuredFailure({
        category: 'immediate-driver',
        operation: 'cuEventDestroy',
        healthBefore: 'healthy',
        healthAfter: 'suspect',
      });
    },
  });
  await assert.rejects(registry.close(material), (error) => {
    failed = error;
    return error.code === 'RESOURCE_DISPOSE_FAILED';
  });
  const prioritized = registry.inventory();
  assert.equal(prioritized.resourceCount, 301);
  assert.equal(prioritized.resources[0].slot, material.slot);
  assert.equal(prioritized.resources[0].failure.code, failed.code);
  assert.equal(prioritized.resourcesTruncated, 285);

  const report = await registry.closeAll();
  assert.equal(report.dispositionCount, 300);
  assert.equal(report.dispositions.length, 32);
  assert.equal(report.dispositionsTruncated, 268);
  assert.equal(report.errorCount, 1);
  assert.equal(report.inventory.resourceCount, 301);
  assert.equal(report.inventory.resources.length, 16);
  assert.equal(report.inventory.resourcesTruncated, 285);
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: 300, orphaned: 1 });
});

test('deep closeTree traversal is iterative and preserves child-before-parent disposal', async () => {
  const registry = deterministicRegistry();
  const depth = 12_000;
  let root = null;
  let parent = null;
  let calls = 0;
  const firstDisposals = [];
  const lastDisposals = [];
  for (let index = 0; index < depth; index += 1) {
    const token = registry.allocate({
      kind: 'event',
      value: index,
      parent,
      dispose(value) {
        calls += 1;
        if (firstDisposals.length < 2) firstDisposals.push(value);
        lastDisposals.push(value);
        if (lastDisposals.length > 2) lastDisposals.shift();
      },
    });
    root ??= token;
    parent = token;
  }

  const report = await registry.closeTree(root);
  assert.equal(calls, depth);
  assert.deepEqual(firstDisposals, [depth - 1, depth - 2]);
  assert.deepEqual(lastDisposals, [1, 0]);
  assert.equal(report.dispositionCount, depth);
  assert.equal(report.dispositions.length, 32);
  assert.equal(report.dispositionsTruncated, depth - 32);
  assert.equal(report.errorCount, 0);
  assert.equal(report.skippedCount, 0);
  assert.equal(report.inventory.resourceCount, depth);
  assert.equal(report.inventory.resources.length, 16);
  assert.equal(report.inventory.resourcesTruncated, depth - 16);
  assert.deepEqual(report.inventory.counts, { live: 0, closing: 0, closed: depth, orphaned: 0 });
});

test('dead epoch replays an exact stored disposal failure after validating token identity', async () => {
  const registry = deterministicRegistry();
  let calls = 0;
  const token = registry.allocate({
    kind: 'event',
    value: 'event',
    dispose() {
      calls += 1;
      throw structuredFailure({
        category: 'restart-required',
        operation: 'cuEventDestroy',
        healthBefore: 'poisoned',
        healthAfter: 'restart-required',
      });
    },
  });

  let first;
  await assert.rejects(registry.close(token), (error) => {
    first = error;
    return error.code === 'RESOURCE_DISPOSE_FAILED';
  });
  registry.markEpochDead('owner-lost-after-disposal-failure');

  await assert.rejects(registry.close({ ...token, runtimeId: 'runtime-b' }), expectCode('RESOURCE_WRONG_RUNTIME'));
  await assert.rejects(registry.close({ ...token, epoch: 2 }), expectCode('RESOURCE_DEAD_EPOCH'));
  await assert.rejects(registry.close({ ...token, generation: token.generation + 1 }), expectCode('RESOURCE_STALE'));
  await assert.rejects(registry.close({ ...token, kind: 'context' }), expectCode('RESOURCE_WRONG_KIND'));
  await assert.rejects(registry.close({ ...token, nonce: 'f'.repeat(32) }), expectCode('RESOURCE_FORGED'));
  await assert.rejects(registry.close(token), (error) => error === first);
  assert.equal(calls, 1);
});

test('dead epochs mark inaccessible resources orphaned without invoking disposers', () => {
  const registry = deterministicRegistry();
  let disposed = false;
  const token = registry.allocate({ kind: 'context', value: 'context', dispose() { disposed = true; } });
  const report = registry.markEpochDead('worker-lost');
  assert.equal(disposed, false);
  assert.equal(report.dead, true);
  assert.equal(report.counts.orphaned, 1);
  assert.throws(() => registry.get(token), expectCode('RESOURCE_DEAD_EPOCH'));
  assert.deepEqual(registry.markEpochDead('again').counts, report.counts);
});
