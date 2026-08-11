import assert from 'node:assert/strict';
import test from 'node:test';

import { packLayout, readScalar, writeScalar } from '../src/packers.mjs';
import { loadRuntimeIr } from '../src/runtime-ir.mjs';
import { runtimeIrPath } from '../src/paths.mjs';

const ir = await loadRuntimeIr(runtimeIrPath);

test('scalar packers preserve signed, unsigned, floating, and pointer-width values', () => {
  const storage = Buffer.alloc(32);
  writeScalar(storage, 0, 'i32', -2000000001);
  writeScalar(storage, 8, 'u64', 18446744073709551557n);
  writeScalar(storage, 16, 'f64', -18.125);
  writeScalar(storage, 24, 'pointer', 0x1122334455667788n);
  assert.equal(readScalar(storage, 0, 'i32'), -2000000001);
  assert.equal(readScalar(storage, 8, 'u64'), 18446744073709551557n);
  assert.equal(readScalar(storage, 16, 'f64'), -18.125);
  assert.equal(readScalar(storage, 24, 'pointer'), 0x1122334455667788n);
});

test('packers reject out-of-bounds storage', () => {
  assert.throws(() => writeScalar(Buffer.alloc(7), 0, 'u64', 1n), RangeError);
  assert.throws(() => readScalar(Buffer.alloc(8), 1, 'u64'), RangeError);
});

test('layout packer requires explicit union discrimination', () => {
  assert.throws(() => packLayout(ir, 'tagged', { tag: 1, value: { value: 1 } }), /explicit discriminated/);
  const packed = packLayout(ir, 'tagged', { tag: 1, value: { kind: 'i64', value: -7n } });
  assert.equal(packed.length, 24);
  assert.equal(readScalar(packed, 0, 'u32'), 1);
  assert.equal(readScalar(packed, 8, 'i64'), -7n);
});
