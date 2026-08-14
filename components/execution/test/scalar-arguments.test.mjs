import assert from 'node:assert/strict';
import test from 'node:test';

import { packParameterValues, parameterLayout } from '../index.mjs';

test('legacy device-memory/u32 layout remains unchanged', () => {
  const layout = parameterLayout([{ kind: 'device-memory' }, { kind: 'u32' }, { kind: 'device-memory' }]);
  assert.deepEqual(layout.entries.map(({ kind, offset, byteLength, alignment }) => ({ kind, offset, byteLength, alignment })), [
    { kind: 'device-memory', offset: 0, byteLength: 8, alignment: 8 },
    { kind: 'u32', offset: 8, byteLength: 4, alignment: 4 },
    { kind: 'device-memory', offset: 16, byteLength: 8, alignment: 8 },
  ]);
  assert.equal(layout.byteLength, 24);
});

test('mixed scalar signatures use deterministic natural alignment and zero padding', () => {
  const parameters = [
    { kind: 'u32' },
    { kind: 'u64' },
    { kind: 'i32' },
    { kind: 'f32' },
    { kind: 'device-memory' },
  ];
  const layout = parameterLayout(parameters);
  assert.deepEqual(layout.entries.map(({ kind, offset, byteLength, alignment }) => ({ kind, offset, byteLength, alignment })), [
    { kind: 'u32', offset: 0, byteLength: 4, alignment: 4 },
    { kind: 'u64', offset: 8, byteLength: 8, alignment: 8 },
    { kind: 'i32', offset: 16, byteLength: 4, alignment: 4 },
    { kind: 'f32', offset: 20, byteLength: 4, alignment: 4 },
    { kind: 'device-memory', offset: 24, byteLength: 8, alignment: 8 },
  ]);
  assert.equal(layout.byteLength, 32);

  const packed = packParameterValues(parameters, [
    0x11223344,
    0x0102030405060708n,
    -2,
    1.5,
    0x1112131415161718n,
  ]);
  assert.deepEqual([...packed.buffer.subarray(0, 4)], [0x44, 0x33, 0x22, 0x11]);
  assert.deepEqual([...packed.buffer.subarray(4, 8)], [0, 0, 0, 0]);
  assert.deepEqual([...packed.buffer.subarray(8, 16)], [0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
  assert.deepEqual([...packed.buffer.subarray(16, 20)], [0xfe, 0xff, 0xff, 0xff]);
  assert.deepEqual([...packed.buffer.subarray(20, 24)], [0x00, 0x00, 0xc0, 0x3f]);
  assert.deepEqual([...packed.buffer.subarray(24, 32)], [0x18, 0x17, 0x16, 0x15, 0x14, 0x13, 0x12, 0x11]);
});

test('u64 requires exact bigint and enforces the unsigned 64-bit range', () => {
  const parameters = [{ kind: 'u64' }];
  assert.equal(packParameterValues(parameters, [0n]).buffer.readBigUInt64LE(0), 0n);
  assert.equal(packParameterValues(parameters, [0xffff_ffff_ffff_ffffn]).buffer.readBigUInt64LE(0), 0xffff_ffff_ffff_ffffn);
  assert.throws(() => packParameterValues(parameters, [1]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  assert.throws(() => packParameterValues(parameters, [-1n]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  assert.throws(() => packParameterValues(parameters, [0x1_0000_0000_0000_0000n]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
});

test('i32 packs signed boundaries and rejects out-of-range or non-integral inputs', () => {
  const parameters = [{ kind: 'i32' }];
  assert.equal(packParameterValues(parameters, [-0x8000_0000]).buffer.readInt32LE(0), -0x8000_0000);
  assert.equal(packParameterValues(parameters, [0]).buffer.readInt32LE(0), 0);
  assert.equal(packParameterValues(parameters, [0x7fff_ffff]).buffer.readInt32LE(0), 0x7fff_ffff);
  assert.throws(() => packParameterValues(parameters, [-0x8000_0001]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  assert.throws(() => packParameterValues(parameters, [0x8000_0000]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  assert.throws(() => packParameterValues(parameters, [1.5]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
});

test('f32 uses finite IEEE-754 binary32 packing and rejects non-finite or overflowing inputs', () => {
  const parameters = [{ kind: 'f32' }];
  const onePointFive = packParameterValues(parameters, [1.5]).buffer;
  assert.equal(onePointFive.readFloatLE(0), 1.5);
  assert.deepEqual([...onePointFive], [0x00, 0x00, 0xc0, 0x3f]);

  const negativeZero = packParameterValues(parameters, [-0]).buffer.readFloatLE(0);
  assert.equal(Object.is(negativeZero, -0), true);

  const rounded = packParameterValues(parameters, [1 / 3]).buffer.readFloatLE(0);
  assert.equal(rounded, Math.fround(1 / 3));

  const underflow = packParameterValues(parameters, [1e-50]).buffer.readFloatLE(0);
  assert.equal(underflow, 0);

  for (const value of [NaN, Infinity, -Infinity, Number.MAX_VALUE]) {
    assert.throws(() => packParameterValues(parameters, [value]), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
  }
  assert.throws(() => packParameterValues(parameters, ['1.5']), (error) => error.code === 'EXECUTION_ARGUMENT_VALUE');
});

test('SPEC-0021 scalar kinds are admitted with exact natural widths', () => {
  const layout = parameterLayout([{ kind: 'f64' }, { kind: 'f16' }, { kind: 'bf16' }]);
  assert.deepEqual(layout.entries.map(({ kind, offset, byteLength, alignment }) => ({ kind, offset, byteLength, alignment })), [
    { kind: 'f64', offset: 0, byteLength: 8, alignment: 8 },
    { kind: 'f16', offset: 8, byteLength: 2, alignment: 2 },
    { kind: 'bf16', offset: 10, byteLength: 2, alignment: 2 },
  ]);
  assert.equal(layout.byteLength, 12);
});

test('unsupported scalar kinds still fail closed', () => {
  assert.throws(() => parameterLayout([{ kind: 'i64' }]), (error) => error.code === 'EXECUTION_PARAMETER_INVALID');
  assert.throws(() => parameterLayout([{ kind: 'f128' }]), (error) => error.code === 'EXECUTION_PARAMETER_INVALID');
});
