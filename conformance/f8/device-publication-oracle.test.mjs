import assert from 'node:assert/strict';
import test from 'node:test';

import { replayPublicationTrace } from './fixtures/device-publication-oracle.mjs';

function reads(generation, payload) {
  return Object.entries(payload).map(([field, value]) => ({ kind: 'read', generation, field, value }));
}

test('CUDA-free oracle accepts immutable multiword message publication', () => {
  const payload = { low: 0x89abcdef, high: 0x01234567, checksum: 0x76543210 };
  assert.deepEqual(replayPublicationTrace({
    fields: Object.keys(payload),
    expectedGeneration: 7,
    trace: [
      ...Object.entries(payload).map(([field, value]) => ({ kind: 'write', generation: 7, field, value })),
      { kind: 'release', generation: 7 },
      { kind: 'acquire', generation: 7 },
      ...reads(7, payload),
    ],
  }), payload);
});

test('CUDA-free oracle accepts an unrelated work-slot publication consumer', () => {
  const payload = { workId: 19, begin: 128, end: 191 };
  assert.deepEqual(replayPublicationTrace({
    fields: Object.keys(payload),
    expectedGeneration: 3,
    trace: [
      ...Object.entries(payload).map(([field, value]) => ({ kind: 'write', generation: 3, field, value })),
      { kind: 'release', generation: 3 },
      { kind: 'acquire', generation: 3 },
      ...reads(3, payload),
    ],
  }), payload);
});

test('CUDA-free oracle rejects early-ready, pre-acquire, partial and wrong-generation traces', () => {
  const fields = ['first', 'second'];
  for (const trace of [
    [
      { kind: 'release', generation: 2 },
    ],
    [
      { kind: 'write', generation: 2, field: 'first', value: 11 },
      { kind: 'release', generation: 2 },
    ],
    [
      { kind: 'write', generation: 2, field: 'first', value: 11 },
      { kind: 'write', generation: 2, field: 'second', value: 13 },
      { kind: 'release', generation: 2 },
      { kind: 'read', generation: 2, field: 'first', value: 11 },
    ],
    [
      { kind: 'write', generation: 1, field: 'first', value: 11 },
      { kind: 'write', generation: 1, field: 'second', value: 13 },
      { kind: 'release', generation: 1 },
      { kind: 'acquire', generation: 1 },
    ],
    [
      { kind: 'write', generation: 3, field: 'first', value: 11 },
      { kind: 'write', generation: 3, field: 'second', value: 13 },
      { kind: 'release', generation: 3 },
      { kind: 'acquire', generation: 3 },
    ],
  ]) {
    assert.throws(() => replayPublicationTrace({ fields, expectedGeneration: 2, trace }));
  }
});
