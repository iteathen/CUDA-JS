import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CUDA_TARGET_BASES,
  CUDA_TARGET_POLICY_VERSION,
  cudaTargetPolicySnapshot,
  inspectCudaTarget,
  normalizeCudaTarget,
  pairedCudaTarget,
  parseCudaTarget,
} from '../index.mjs';

const admitted = ['75', '80', '86', '87', '88', '89', '90', '100', '103', '110', '120', '121'];

test('target policy owns the exact initial hardware-registry bases', () => {
  assert.deepEqual(CUDA_TARGET_BASES, admitted);
  assert.equal(CUDA_TARGET_POLICY_VERSION, 'SPEC-0006-target-v1');
  assert.deepEqual(cudaTargetPolicySnapshot(), {
    version: 'SPEC-0006-target-v1',
    admittedBases: admitted,
    admittedVariants: ['none'],
    parsedVariants: ['none', 'family', 'architecture'],
  });
});

test('parser represents two, three, and longer numeric target bases without a digit ceiling', () => {
  assert.deepEqual(parseCudaTarget('compute_75'), {
    prefix: 'compute', base: '75', variant: 'none', suffix: null, name: 'compute_75', policyVersion: CUDA_TARGET_POLICY_VERSION, admitted: true,
  });
  assert.deepEqual(parseCudaTarget('sm_120'), {
    prefix: 'sm', base: '120', variant: 'none', suffix: null, name: 'sm_120', policyVersion: CUDA_TARGET_POLICY_VERSION, admitted: true,
  });
  const future = parseCudaTarget('compute_1000');
  assert.equal(future.base, '1000');
  assert.equal(future.admitted, false);
});

test('current family and architecture suffixes are parsed but policy rejected', () => {
  const family = parseCudaTarget('compute_120f');
  assert.equal(family.variant, 'family');
  assert.equal(family.suffix, 'f');
  assert.equal(family.admitted, false);

  const architecture = parseCudaTarget('sm_120a');
  assert.equal(architecture.variant, 'architecture');
  assert.equal(architecture.suffix, 'a');
  assert.equal(architecture.admitted, false);
  assert.equal(inspectCudaTarget('sm_120a', { expectedPrefix: 'sm' }).reason, 'policy');
});

test('normalization enforces syntax, prefix, and policy separately', () => {
  assert.equal(normalizeCudaTarget(undefined, { expectedPrefix: 'compute', defaultTarget: 'compute_75' }), 'compute_75');
  assert.equal(normalizeCudaTarget('compute_120', { expectedPrefix: 'compute' }), 'compute_120');
  assert.equal(normalizeCudaTarget('sm_120', { expectedPrefix: 'compute' }), null);
  assert.equal(normalizeCudaTarget('compute_120a', { expectedPrefix: 'compute' }), null);
  assert.equal(normalizeCudaTarget('compute_1000', { expectedPrefix: 'compute' }), null);
});

test('paired target conversion preserves base and accepted CUDA suffix syntax', () => {
  assert.equal(pairedCudaTarget('compute_120', 'sm'), 'sm_120');
  assert.equal(pairedCudaTarget('compute_120f', 'sm'), 'sm_120f');
  assert.equal(pairedCudaTarget('sm_100a', 'compute'), 'compute_100a');
  assert.equal(pairedCudaTarget('bad', 'sm'), null);
});

test('malformed or noncanonical target spellings fail syntax parsing', () => {
  for (const value of [
    null,
    '',
    'compute_7',
    'compute_075',
    'compute_-75',
    'compute_12.0',
    'compute_120A',
    'compute_120fa',
    'COMPUTE_120',
    ' compute_120',
    'sm120',
  ]) assert.equal(parseCudaTarget(value), null, String(value));
});
