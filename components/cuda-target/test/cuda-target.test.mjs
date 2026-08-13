import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  CUDA_TARGET_BASES,
  CUDA_TARGET_POLICY_ENTRIES,
  CUDA_TARGET_POLICY_IDENTITY,
  CUDA_TARGET_POLICY_VERSION,
  cudaTargetPolicySnapshot,
  inspectCudaTarget,
  normalizeCudaTarget,
  pairedCudaTarget,
  parseCudaTarget,
} from '../index.mjs';

const admitted = ['75', '80', '86', '87', '88', '89', '90', '100', '103', '110', '120', '121'];
const capabilities = ['7.5', '8.0', '8.6', '8.7', '8.8', '8.9', '9.0', '10.0', '10.3', '11.0', '12.0', '12.1'];

test('target policy owns the exact initial hardware-registry bases', () => {
  assert.deepEqual(CUDA_TARGET_BASES, admitted);
  assert.equal(CUDA_TARGET_POLICY_VERSION, 'SPEC-0006-target-v1');
  assert.deepEqual(CUDA_TARGET_POLICY_ENTRIES, admitted.map((base, index) => ({ base, computeCapability: capabilities[index] })));
  assert.deepEqual(CUDA_TARGET_POLICY_IDENTITY, {
    revision: 'SPEC-0006-target-v1', entries: CUDA_TARGET_POLICY_ENTRIES, admittedVariants: ['none'],
  });
  assert.deepEqual(cudaTargetPolicySnapshot(), {
    version: 'SPEC-0006-target-v1',
    entries: CUDA_TARGET_POLICY_ENTRIES,
    admittedVariants: ['none'],
    parsedVariants: ['none', 'family', 'architecture'],
  });
});

test('parser represents two, three, and longer numeric target bases without a digit ceiling', () => {
  assert.deepEqual(parseCudaTarget('compute_75'), {
    prefix: 'compute', base: '75', variant: 'none', suffix: null, name: 'compute_75',
  });
  assert.deepEqual(parseCudaTarget('sm_120'), {
    prefix: 'sm', base: '120', variant: 'none', suffix: null, name: 'sm_120',
  });
  const future = parseCudaTarget('compute_1000');
  assert.equal(future.base, '1000');
  assert.equal(inspectCudaTarget(future.name, { expectedPrefix: 'compute' }).reason, 'policy');
});

test('current family and architecture suffixes are parsed but policy rejected', () => {
  const family = parseCudaTarget('compute_120f');
  assert.equal(family.variant, 'family');
  assert.equal(family.suffix, 'f');
  assert.equal(inspectCudaTarget(family.name, { expectedPrefix: 'compute' }).reason, 'policy');

  const architecture = parseCudaTarget('sm_120a');
  assert.equal(architecture.variant, 'architecture');
  assert.equal(architecture.suffix, 'a');
  assert.equal(inspectCudaTarget('sm_120a', { expectedPrefix: 'sm' }).reason, 'policy');
});

test('admitted targets carry literal reviewed semantic metadata', () => {
  for (let index = 0; index < admitted.length; index += 1) {
    for (const prefix of ['compute', 'sm']) {
      const inspected = inspectCudaTarget(`${prefix}_${admitted[index]}`, { expectedPrefix: prefix });
      assert.equal(inspected.ok, true);
      assert.equal(inspected.policy.computeCapability, capabilities[index]);
    }
  }
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
    'compute+120',
    'compute_120A',
    'compute_120fa',
    'COMPUTE_120',
    ' compute_120',
    'sm120',
  ]) assert.equal(parseCudaTarget(value), null, String(value));
});

test('target-checking production consumers cannot own a private CUDA target regex', async () => {
  const consumers = [
    '../../compiler-actor/src/contract.mjs',
    '../../device-js/src/translator.mjs',
    '../../device-js/src/strict-translator.mjs',
    '../../../conformance/hardware/qualification.mjs',
  ];
  for (const relative of consumers) {
    const source = await readFile(new URL(relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\/(?:\^)?(?:compute|sm)_.*\/[gimsuy]*/, relative);
  }
});
