import assert from 'node:assert/strict';

import { openCudaRuntimeForTesting } from 'cuda-js/testing';

const runtime = await openCudaRuntimeForTesting();
const first = await runtime.openCublasLt();
const second = await runtime.openCublasLt();

assert.notEqual(first, second);
assert.equal(first.kind, 'cublaslt-adapter');
assert.equal(second.kind, 'cublaslt-adapter');
assert.equal(first.profile, second.profile);
assert.deepEqual(first.provider, second.provider);

const plan = await first.createF32MatmulPlan({ m: 1, n: 1, k: 1 });
await assert.rejects(first.close(), (error) => error.code === 'RESOURCE_HAS_CHILDREN');
assert.equal(first.state, 'open');

const secondClose = await second.close();
assert.equal(secondClose.state, 'closed');
assert.equal(first.state, 'open');
assert.equal((await plan.status()).state, 'open');

await plan.close();
assert.equal((await first.close()).state, 'closed');

const reacquired = await runtime.openCublasLt();
assert.deepEqual(reacquired.provider, first.provider);
await reacquired.close();
assert.equal((await runtime.close()).graceful, true);

console.log(JSON.stringify({
  consumer: 'portable-cublaslt-borrow',
  publicOnly: true,
  distinctBorrowers: true,
  siblingCloseIndependent: true,
  planFencesOwner: true,
  cleanReacquisition: true,
  graceful: true,
}));
