const WIDTHS = Object.freeze({
  'device-memory': 8,
  u32: 4,
  u64: 8,
  i32: 4,
  f32: 4,
  f64: 8,
  f16: 2,
  bf16: 2,
});

const KINDS = new Set(Object.keys(WIDTHS));
const F64_CANONICAL_NAN = 0x7ff8_0000_0000_0000n;
const F16_CANONICAL_NAN = 0x7e00;
const BF16_CANONICAL_NAN = 0x7fc0;

export function isParameterKind(kind) { return KINDS.has(kind); }
export function parameterWidth(kind) { return WIDTHS[kind] ?? null; }

function throwFailure(fail, code, message, details = {}) {
  if (typeof fail === 'function') return fail(code, 'validation', message, details);
  const error = new TypeError(message);
  error.code = code;
  error.details = Object.freeze({ ...details });
  throw error;
}

function checkedAlign(offset, alignment, fail) {
  const remainder = offset % alignment;
  const result = remainder === 0 ? offset : offset + alignment - remainder;
  if (!Number.isSafeInteger(result)) throwFailure(fail, 'EXECUTION_PARAMETER_LAYOUT', 'Parameter layout exceeds the safe integer range.');
  return result;
}

export function parameterLayout(parameters, fail) {
  if (!Array.isArray(parameters) || parameters.length < 1) throwFailure(fail, 'EXECUTION_PARAMETERS_INVALID', 'Parameter layout requires a nonempty schema.');
  let size = 0;
  const entries = parameters.map((parameter, index) => {
    const kind = parameter?.kind;
    if (!isParameterKind(kind)) throwFailure(fail, 'EXECUTION_PARAMETER_INVALID', 'Parameter kind is unsupported.', { index, kind: kind ?? null });
    const width = WIDTHS[kind];
    size = checkedAlign(size, width, fail);
    const entry = Object.freeze({ index, kind, offset: size, byteLength: width, alignment: width });
    size += width;
    if (!Number.isSafeInteger(size)) throwFailure(fail, 'EXECUTION_PARAMETER_LAYOUT', 'Parameter layout exceeds the safe integer range.');
    return entry;
  });
  return Object.freeze({ entries: Object.freeze(entries), byteLength: size });
}

function doubleBits(value) {
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeDoubleLE(value, 0);
  return buffer.readBigUInt64LE(0);
}

function roundShiftEven(value, shift) {
  if (shift <= 0) return value << BigInt(-shift);
  if (value === 0n || shift > 63) return 0n;
  const bits = BigInt(shift);
  const quotient = value >> bits;
  const remainderMask = (1n << bits) - 1n;
  const remainder = value & remainderMask;
  const half = 1n << (bits - 1n);
  if (remainder > half || (remainder === half && (quotient & 1n) === 1n)) return quotient + 1n;
  return quotient;
}

function encodeReducedFloat(value, { exponentBits, fractionBits, bias, canonicalNaN }) {
  const bits = doubleBits(value);
  const sign = Number(bits >> 63n);
  const exponent = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & 0x000f_ffff_ffff_ffffn;
  const signShift = exponentBits + fractionBits;
  const signBits = sign << signShift;
  const maxExponentField = (1 << exponentBits) - 1;

  if (exponent === 0x7ff) {
    if (fraction !== 0n) return canonicalNaN;
    return signBits | (maxExponentField << fractionBits);
  }
  if (exponent === 0 && fraction === 0n) return signBits;
  if (exponent === 0) return signBits;

  let unbiased = exponent - 1023;
  const significand = (1n << 52n) | fraction;
  const minimumNormalExponent = 1 - bias;
  const maximumNormalExponent = maxExponentField - 1 - bias;
  const precision = fractionBits + 1;

  if (unbiased > maximumNormalExponent) return signBits | (maxExponentField << fractionBits);

  if (unbiased >= minimumNormalExponent) {
    let rounded = roundShiftEven(significand, 53 - precision);
    if (rounded === (1n << BigInt(precision))) {
      rounded >>= 1n;
      unbiased += 1;
      if (unbiased > maximumNormalExponent) return signBits | (maxExponentField << fractionBits);
    }
    const exponentField = unbiased + bias;
    const hiddenBit = 1n << BigInt(fractionBits);
    const fractionField = Number(rounded - hiddenBit);
    return signBits | (exponentField << fractionBits) | fractionField;
  }

  const shift = 53 - unbiased - bias - fractionBits;
  const rounded = roundShiftEven(significand, shift);
  if (rounded === 0n) return signBits;
  const minimumNormalSignificand = 1n << BigInt(fractionBits);
  if (rounded >= minimumNormalSignificand) return signBits | (1 << fractionBits);
  return signBits | Number(rounded);
}

export function encodeFloat16(value) {
  if (typeof value !== 'number') throwFailure(null, 'EXECUTION_ARGUMENT_VALUE', 'f16 argument must be a JavaScript number.');
  return encodeReducedFloat(value, { exponentBits: 5, fractionBits: 10, bias: 15, canonicalNaN: F16_CANONICAL_NAN });
}

export function encodeBfloat16(value) {
  if (typeof value !== 'number') throwFailure(null, 'EXECUTION_ARGUMENT_VALUE', 'bf16 argument must be a JavaScript number.');
  return encodeReducedFloat(value, { exponentBits: 8, fractionBits: 7, bias: 127, canonicalNaN: BF16_CANONICAL_NAN });
}

function writeF64(buffer, offset, value, fail, index) {
  if (typeof value !== 'number') throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'f64 argument must be a JavaScript number.', { index });
  if (Number.isNaN(value)) buffer.writeBigUInt64LE(F64_CANONICAL_NAN, offset);
  else buffer.writeDoubleLE(value, offset);
}

function writeF16(buffer, offset, value, fail, index) {
  if (typeof value !== 'number') throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'f16 argument must be a JavaScript number.', { index });
  buffer.writeUInt16LE(encodeReducedFloat(value, { exponentBits: 5, fractionBits: 10, bias: 15, canonicalNaN: F16_CANONICAL_NAN }), offset);
}

function writeBf16(buffer, offset, value, fail, index) {
  if (typeof value !== 'number') throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'bf16 argument must be a JavaScript number.', { index });
  buffer.writeUInt16LE(encodeReducedFloat(value, { exponentBits: 8, fractionBits: 7, bias: 127, canonicalNaN: BF16_CANONICAL_NAN }), offset);
}

export function packParameterValues(parameters, values, fail) {
  if (!Array.isArray(values) || values.length !== parameters.length) throwFailure(fail, 'EXECUTION_ARGUMENT_COUNT', 'Launch argument count must exactly match the declared parameter count.', { expected: parameters.length, actual: values?.length ?? null });
  const layout = parameterLayout(parameters, fail);
  const buffer = Buffer.alloc(layout.byteLength);
  for (const entry of layout.entries) {
    const value = values[entry.index];
    if (entry.kind === 'device-memory') {
      if (typeof value !== 'bigint' || value < 0n || value > 0xffff_ffff_ffff_ffffn) throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'Private device-memory value is invalid.', { index: entry.index });
      buffer.writeBigUInt64LE(value, entry.offset);
    } else if (entry.kind === 'u64') {
      if (typeof value !== 'bigint' || value < 0n || value > 0xffff_ffff_ffff_ffffn) throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'u64 argument is out of range or not an exact bigint.', { index: entry.index });
      buffer.writeBigUInt64LE(value, entry.offset);
    } else if (entry.kind === 'u32') {
      if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'u32 argument is out of range.', { index: entry.index, value });
      buffer.writeUInt32LE(value, entry.offset);
    } else if (entry.kind === 'i32') {
      if (!Number.isInteger(value) || value < -0x8000_0000 || value > 0x7fff_ffff) throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'i32 argument is out of range.', { index: entry.index, value });
      buffer.writeInt32LE(value, entry.offset);
    } else if (entry.kind === 'f32') {
      if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(Math.fround(value))) throwFailure(fail, 'EXECUTION_ARGUMENT_VALUE', 'f32 argument must be finite and representable without binary32 overflow.', { index: entry.index });
      buffer.writeFloatLE(value, entry.offset);
    } else if (entry.kind === 'f64') writeF64(buffer, entry.offset, value, fail, entry.index);
    else if (entry.kind === 'f16') writeF16(buffer, entry.offset, value, fail, entry.index);
    else if (entry.kind === 'bf16') writeBf16(buffer, entry.offset, value, fail, entry.index);
  }
  return Object.freeze({ buffer, layout });
}
