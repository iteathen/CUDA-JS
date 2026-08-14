import assert from 'node:assert/strict';
import test from 'node:test';

import {
  encodeBfloat16,
  encodeFloat16,
  packParameterValues,
  parameterLayout,
} from '../src/numeric-abi.mjs';

function bitsOfF64(value) {
  const buffer = Buffer.alloc(8);
  buffer.writeDoubleLE(value, 0);
  return buffer.readBigUInt64LE(0);
}

test('f16 conversion covers exact values, special values, subnormals, overflow and ties-to-even', () => {
  assert.equal(encodeFloat16(0), 0x0000);
  assert.equal(encodeFloat16(-0), 0x8000);
  assert.equal(encodeFloat16(1), 0x3c00);
  assert.equal(encodeFloat16(-2), 0xc000);
  assert.equal(encodeFloat16(65_504), 0x7bff);
  assert.equal(encodeFloat16(65_520), 0x7c00);
  assert.equal(encodeFloat16(Infinity), 0x7c00);
  assert.equal(encodeFloat16(-Infinity), 0xfc00);
  assert.equal(encodeFloat16(Number.NaN), 0x7e00);
  assert.equal(encodeFloat16(2 ** -14), 0x0400);
  assert.equal(encodeFloat16(2 ** -24), 0x0001);
  assert.equal(encodeFloat16(2 ** -25), 0x0000);
  assert.equal(encodeFloat16(-(2 ** -25)), 0x8000);
  assert.equal(encodeFloat16(1 + 2 ** -11), 0x3c00);
  assert.equal(encodeFloat16(1 + 3 * (2 ** -11)), 0x3c02);
});

test('bf16 conversion covers exact values, special values, subnormals and ties-to-even', () => {
  assert.equal(encodeBfloat16(0), 0x0000);
  assert.equal(encodeBfloat16(-0), 0x8000);
  assert.equal(encodeBfloat16(1), 0x3f80);
  assert.equal(encodeBfloat16(-2), 0xc000);
  assert.equal(encodeBfloat16(Infinity), 0x7f80);
  assert.equal(encodeBfloat16(-Infinity), 0xff80);
  assert.equal(encodeBfloat16(Number.NaN), 0x7fc0);
  assert.equal(encodeBfloat16(2 ** -126), 0x0080);
  assert.equal(encodeBfloat16(2 ** -133), 0x0001);
  assert.equal(encodeBfloat16(2 ** -134), 0x0000);
  assert.equal(encodeBfloat16(1 + 2 ** -8), 0x3f80);
  assert.equal(encodeBfloat16(1 + 3 * (2 ** -8)), 0x3f82);
});

test('mixed extended layout uses natural alignment and deterministic zero padding', () => {
  const parameters = [
    { kind: 'u32' },
    { kind: 'f16' },
    { kind: 'f64' },
    { kind: 'bf16' },
  ];
  const layout = parameterLayout(parameters);
  assert.deepEqual(layout.entries.map(({ kind, offset, byteLength, alignment }) => ({ kind, offset, byteLength, alignment })), [
    { kind: 'u32', offset: 0, byteLength: 4, alignment: 4 },
    { kind: 'f16', offset: 4, byteLength: 2, alignment: 2 },
    { kind: 'f64', offset: 8, byteLength: 8, alignment: 8 },
    { kind: 'bf16', offset: 16, byteLength: 2, alignment: 2 },
  ]);
  assert.equal(layout.byteLength, 18);

  const packed = packParameterValues(parameters, [0x44332211, 1, -0, -2]);
  assert.equal(packed.buffer.readUInt32LE(0), 0x44332211);
  assert.equal(packed.buffer.readUInt16LE(4), 0x3c00);
  assert.deepEqual([...packed.buffer.subarray(6, 8)], [0, 0]);
  assert.equal(packed.buffer.readBigUInt64LE(8), bitsOfF64(-0));
  assert.equal(packed.buffer.readUInt16LE(16), 0xc000);
});

test('new floating kinds canonicalize NaN while legacy f32 remains finite-only', () => {
  const packed = packParameterValues(
    [{ kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }],
    [Number.NaN, Number.NaN, Number.NaN],
  );
  assert.equal(packed.buffer.readBigUInt64LE(0), 0x7ff8_0000_0000_0000n);
  assert.equal(packed.buffer.readUInt16LE(8), 0x7e00);
  assert.equal(packed.buffer.readUInt16LE(10), 0x7fc0);

  assert.throws(() => packParameterValues([{ kind: 'f32' }], [Infinity]), { code: 'EXECUTION_ARGUMENT_VALUE' });
  assert.throws(() => packParameterValues([{ kind: 'f32' }], [Number.NaN]), { code: 'EXECUTION_ARGUMENT_VALUE' });
});

test('extended floating kinds reject implicit non-number coercion', () => {
  for (const kind of ['f64', 'f16', 'bf16']) {
    assert.throws(() => packParameterValues([{ kind }], ['1']), { code: 'EXECUTION_ARGUMENT_VALUE' });
    assert.throws(() => packParameterValues([{ kind }], [1n]), { code: 'EXECUTION_ARGUMENT_VALUE' });
  }
});
