import assert from 'node:assert/strict';
import test from 'node:test';

import { ResourceRegistry } from '../../resource-registry/index.mjs';
import { CudaLibraryAdapterError, CudaLibraryAdapterManager } from '../index.mjs';

function nonceSource(invalidAt = null) {
  let value = 0;
  return () => {
    value += 1;
    if (value === invalidAt) return 'invalid';
    return value.toString(16).padStart(32, '0');
  };
}

function fixture({ invalidNonceAt = null } = {}) {
  const registry = new ResourceRegistry({ runtimeId: 'cublaslt-borrow-test', epoch: 1, nonce: nonceSource(invalidNonceAt) });
  const library = registry.allocate({ kind: 'library', value: {}, dispose() { return { closed: true }; } });
  const context = registry.allocate({ kind: 'context', value: {}, parent: library, dispose() { return { closed: true }; } });
  const calls = { open: 0, close: 0, createPlan: 0, destroyPlan: 0 };
  let failClose = false;
  let nextNative = 0;
  const manager = new CudaLibraryAdapterManager({
    registry,
    contextToken: context,
    memory: { acquireForExecution() { throw new Error('not used'); } },
    views: { acquire() { throw new Error('not used'); } },
    execution: { submitAdapterOperation() { throw new Error('not used'); } },
    operations: {
      async openCublasLt() {
        calls.open += 1;
        return {
          native: Object.freeze({ id: ++nextNative }),
          provider: Object.freeze({ name: 'cuBLASLt', version: 'test', qualification: 'portable-test' }),
        };
      },
      async closeCublasLt() {
        calls.close += 1;
        if (failClose) {
          throw new CudaLibraryAdapterError(
            'CUDA_LIBRARY_ADAPTER_TEST_CLOSE_FAILED',
            'restart-required',
            'Injected provider close failure.',
            {},
            { operation: 'cublasLtDestroy', healthBefore: 'healthy', healthAfter: 'restart-required' },
          );
        }
        return { providerClosed: true };
      },
      async createF32MatmulPlan({ plan }) {
        calls.createPlan += 1;
        return { native: Object.freeze({ id: ++nextNative, plan }), workspaceBytes: 0 };
      },
      async destroyF32MatmulPlan() { calls.destroyPlan += 1; return { planClosed: true }; },
      async submitF32Matmul() {},
    },
  });
  return {
    registry,
    manager,
    calls,
    failFinalClose() { failClose = true; },
  };
}

function liveResources(registry, kind) {
  return registry.inventory().resources.filter((entry) => entry.kind === kind && entry.state === 'live');
}

test('cuBLASLt borrowers share one underlying provider while retaining independent plan ownership', async () => {
  const { registry, manager, calls } = fixture();
  const first = await manager.openCublasLt(1);
  const second = await manager.openCublasLt(2);
  assert.notDeepEqual(first.adapter, second.adapter);
  assert.deepEqual(first.provider, second.provider);
  assert.equal(calls.open, 1);
  assert.equal(liveResources(registry, 'cublaslt-adapter').length, 1);
  assert.equal(liveResources(registry, 'cublaslt-borrow').length, 2);

  const plan = await manager.createF32MatmulPlan(first.adapter, { m: 1, n: 1, k: 1 }, 3);
  const planRecord = liveResources(registry, 'cublaslt-matmul-plan')[0];
  assert.equal(planRecord.parent.kind, 'cublaslt-borrow');
  assert.equal(liveResources(registry, 'cublaslt-borrow').find((entry) => entry.slot === planRecord.parent.slot).parent.kind, 'cublaslt-adapter');
  await assert.rejects(manager.releaseAdapter(first.adapter, 4), (error) => error.code === 'RESOURCE_HAS_CHILDREN');

  await manager.releaseAdapter(second.adapter, 5);
  assert.equal(calls.close, 0);
  assert.equal(liveResources(registry, 'cublaslt-borrow').length, 1);
  assert.deepEqual((await manager.adapterStatus(first.adapter, 6)).provider, first.provider);

  await manager.releasePlan(plan.plan, 7);
  await manager.releaseAdapter(first.adapter, 8);
  assert.equal(calls.destroyPlan, 1);
  assert.equal(calls.close, 1);
  assert.equal(manager.summary().state, 'unopened');

  const reacquired = await manager.openCublasLt(9);
  assert.equal(calls.open, 2);
  await manager.releaseAdapter(reacquired.adapter, 10);
  assert.equal(calls.close, 2);
});

test('borrower registration rollback closes a newly created provider before reporting failure', async () => {
  const { registry, manager, calls } = fixture({ invalidNonceAt: 4 });
  await assert.rejects(manager.openCublasLt(1), (error) => error.code === 'RESOURCE_NONCE_INVALID');
  assert.equal(calls.open, 1);
  assert.equal(calls.close, 1);
  assert.equal(manager.summary().state, 'unopened');
  assert.equal(liveResources(registry, 'cublaslt-adapter').length, 0);
  assert.equal(liveResources(registry, 'cublaslt-borrow').length, 0);

  const borrower = await manager.openCublasLt(2);
  assert.equal(calls.open, 2);
  await manager.releaseAdapter(borrower.adapter, 3);
  assert.equal(calls.close, 2);
});

test('failed final provider close is restart-required and cannot be followed by a fresh clean borrow', async () => {
  const { registry, manager, calls, failFinalClose } = fixture();
  const borrower = await manager.openCublasLt(1);
  failFinalClose();
  await assert.rejects(
    manager.releaseAdapter(borrower.adapter, 2),
    (error) => error.code === 'RESOURCE_DISPOSE_FAILED' && error.category === 'restart-required',
  );
  assert.equal(calls.open, 1);
  assert.equal(calls.close, 1);
  const adapter = registry.inventory().resources.find((entry) => entry.kind === 'cublaslt-adapter');
  assert.equal(adapter.state, 'orphaned');
  assert.equal(adapter.failure.category, 'restart-required');
  await assert.rejects(manager.openCublasLt(3), (error) => error.code === 'RESOURCE_ORPHANED');
  assert.equal(calls.open, 1);
});

test('owner loss orphans provider, borrower, and plan resources without fabricated cleanup', async () => {
  const { registry, manager, calls } = fixture();
  const first = await manager.openCublasLt(1);
  await manager.openCublasLt(2);
  await manager.createF32MatmulPlan(first.adapter, { m: 1, n: 1, k: 1 }, 3);
  const terminal = registry.markEpochDead('owner-lost');
  for (const kind of ['cublaslt-adapter', 'cublaslt-borrow', 'cublaslt-matmul-plan']) {
    const resources = terminal.resources.filter((entry) => entry.kind === kind);
    assert(resources.length > 0);
    assert(resources.every((entry) => entry.state === 'orphaned'));
  }
  assert.equal(calls.close, 0);
  assert.equal(calls.destroyPlan, 0);
});
