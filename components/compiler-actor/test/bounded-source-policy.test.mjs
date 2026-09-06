import assert from 'node:assert/strict';
import test from 'node:test';

import { LIMITS, normalizeCompileRequest } from '../src/contract.mjs';

const SOURCE_BYTES_LIMIT = 4_194_304;

test('compiler request normalization admits finite source larger than the legacy 1 MiB guard', () => {
  assert.equal(LIMITS.sourceBytes, SOURCE_BYTES_LIMIT);
  const source = `//${'x'.repeat(1_100_000)}\nextern "C" __global__ void k() {}`;
  assert(Buffer.byteLength(source, 'utf8') > 1_048_576);
  assert(Buffer.byteLength(source, 'utf8') < SOURCE_BYTES_LIMIT);
  const request = normalizeCompileRequest({ source });
  assert.equal(request.sourceByteLength, Buffer.byteLength(source, 'utf8'));
  assert.equal(request.source, source);
});

test('compiler request normalization still rejects source above the revised finite 4 MiB guard', () => {
  const source = `//${'x'.repeat(SOURCE_BYTES_LIMIT)}\nextern "C" __global__ void k() {}`;
  assert.throws(
    () => normalizeCompileRequest({ source }),
    (error) => error?.code === 'COMPILER_SOURCE_INVALID'
      && error?.details?.maximum === SOURCE_BYTES_LIMIT
      && error?.details?.byteLength === Buffer.byteLength(source, 'utf8'),
  );
});
