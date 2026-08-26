export const DENSE_NUMERIC_CONTRACT_SUFFIX = 'SPEC-0030-dense-numeric-v1';
export const DENSE_NUMERIC_SCALARS = Object.freeze(['f64', 'f16', 'bf16']);
export const FLOAT_SCALARS = Object.freeze(['f32', 'f64', 'f16', 'bf16']);

export const CUDA_SCALAR_TYPES = Object.freeze({
  bool: 'bool',
  u32: 'unsigned int',
  i32: 'int',
  u64: 'unsigned long long',
  f32: 'float',
  f64: 'double',
  f16: '__half',
  bf16: '__nv_bfloat16',
});

const DENSE_HELPERS = Object.freeze([
  /^gpu\.(?:f32|f64|f16|bf16)\.(?:nan|positiveInfinity|negativeInfinity)$/,
  /^gpu\.(?:f64|f16|bf16)$/,
  /^gpu\.cast\.(?:u32|i32|u64|f32|f64|f16|bf16)$/,
  /^gpu\.math\.(?:abs|isNaN|minimum|maximum)$/,
]);

export function isDenseNumericHelper(path) {
  return typeof path === 'string' && DENSE_HELPERS.some((pattern) => pattern.test(path));
}

export function denseNumericPreludeLines() {
  return [
    '#include <cuda_fp16.h>',
    '#include <cuda_bf16.h>',
    '',
    '__device__ int djs_u32_as_i32(unsigned int x) { union { unsigned int u; int i; } bits; bits.u = x; return bits.i; }',
    '__device__ int djs_abs_i32(int x) { return x < 0 ? djs_u32_as_i32(0u - static_cast<unsigned int>(x)) : x; }',
    '__device__ unsigned int djs_sat_u32(float x) { if (isnan(x) || x <= 0.0f) return 0u; if (x >= 4294967296.0f) return 0xffffffffu; return static_cast<unsigned int>(x); }',
    '__device__ unsigned int djs_sat_u32(double x) { if (isnan(x) || x <= 0.0) return 0u; if (x >= 4294967296.0) return 0xffffffffu; return static_cast<unsigned int>(x); }',
    '__device__ int djs_sat_i32(float x) { if (isnan(x)) return 0; if (x <= -2147483648.0f) return (-2147483647 - 1); if (x >= 2147483648.0f) return 2147483647; return static_cast<int>(x); }',
    '__device__ int djs_sat_i32(double x) { if (isnan(x)) return 0; if (x <= -2147483648.0) return (-2147483647 - 1); if (x >= 2147483648.0) return 2147483647; return static_cast<int>(x); }',
    '__device__ unsigned long long djs_sat_u64(float x) { if (isnan(x) || x <= 0.0f) return 0ULL; if (x >= 18446744073709551616.0f) return 0xffffffffffffffffULL; return static_cast<unsigned long long>(x); }',
    '__device__ unsigned long long djs_sat_u64(double x) { if (isnan(x) || x <= 0.0) return 0ULL; if (x >= 18446744073709551616.0) return 0xffffffffffffffffULL; return static_cast<unsigned long long>(x); }',
    '__device__ float djs_minimum_f32(float a, float b) { if (isnan(a) || isnan(b)) return __uint_as_float(0x7fc00000u); if (a == 0.0f && b == 0.0f) return __uint_as_float(__float_as_uint(a) | __float_as_uint(b)); return fminf(a, b); }',
    '__device__ float djs_maximum_f32(float a, float b) { if (isnan(a) || isnan(b)) return __uint_as_float(0x7fc00000u); if (a == 0.0f && b == 0.0f) return __uint_as_float(__float_as_uint(a) & __float_as_uint(b)); return fmaxf(a, b); }',
    '__device__ double djs_minimum_f64(double a, double b) { if (isnan(a) || isnan(b)) return __longlong_as_double(static_cast<long long>(0x7ff8000000000000ULL)); if (a == 0.0 && b == 0.0) return __longlong_as_double(__double_as_longlong(a) | __double_as_longlong(b)); return fmin(a, b); }',
    '__device__ double djs_maximum_f64(double a, double b) { if (isnan(a) || isnan(b)) return __longlong_as_double(static_cast<long long>(0x7ff8000000000000ULL)); if (a == 0.0 && b == 0.0) return __longlong_as_double(__double_as_longlong(a) & __double_as_longlong(b)); return fmax(a, b); }',
    '',
  ];
}

export function exactCastCode(target, source, code) {
  if (target === source) return code;
  const floatValue = source === 'f16' ? `__half2float(${code})` : source === 'bf16' ? `__bfloat162float(${code})` : code;
  if (target === 'u32') {
    if (FLOAT_SCALARS.includes(source)) return `djs_sat_u32(${floatValue})`;
    return `static_cast<unsigned int>(${code})`;
  }
  if (target === 'i32') {
    if (FLOAT_SCALARS.includes(source)) return `djs_sat_i32(${floatValue})`;
    if (source === 'u32' || source === 'u64') return `djs_u32_as_i32(static_cast<unsigned int>(${code}))`;
    return code;
  }
  if (target === 'u64') {
    if (FLOAT_SCALARS.includes(source)) return `djs_sat_u64(${floatValue})`;
    return `static_cast<unsigned long long>(${code})`;
  }
  if (target === 'f32') {
    if (source === 'i32') return `__int2float_rn(${code})`;
    if (source === 'u32') return `__uint2float_rn(${code})`;
    if (source === 'u64') return `__ull2float_rn(${code})`;
    if (source === 'f64') return `__double2float_rn(${code})`;
    return floatValue;
  }
  if (target === 'f64') {
    if (source === 'u64') return `__ull2double_rn(${code})`;
    if (source === 'f16' || source === 'bf16') return `static_cast<double>(${floatValue})`;
    return `static_cast<double>(${code})`;
  }
  if (target === 'f16') {
    if (source === 'i32') return `__int2half_rn(${code})`;
    if (source === 'u32') return `__uint2half_rn(${code})`;
    if (source === 'u64') return `__ull2half_rn(${code})`;
    if (source === 'f32') return `__float2half_rn(${code})`;
    if (source === 'f64') return `__double2half(${code})`;
    if (source === 'bf16') return `__float2half_rn(__bfloat162float(${code}))`;
  }
  if (target === 'bf16') {
    if (source === 'i32') return `__int2bfloat16_rn(${code})`;
    if (source === 'u32') return `__uint2bfloat16_rn(${code})`;
    if (source === 'u64') return `__ull2bfloat16_rn(${code})`;
    if (source === 'f32') return `__float2bfloat16_rn(${code})`;
    if (source === 'f64') return `__double2bfloat16(${code})`;
    if (source === 'f16') return `__float2bfloat16_rn(__half2float(${code}))`;
  }
  return null;
}

export function specialConstantCode(scalar, name) {
  const bits = {
    f32: { nan: '__uint_as_float(0x7fc00000u)', positiveInfinity: '__uint_as_float(0x7f800000u)', negativeInfinity: '__uint_as_float(0xff800000u)' },
    f64: { nan: '__longlong_as_double(static_cast<long long>(0x7ff8000000000000ULL))', positiveInfinity: '__longlong_as_double(static_cast<long long>(0x7ff0000000000000ULL))', negativeInfinity: '__longlong_as_double(static_cast<long long>(0xfff0000000000000ULL))' },
    f16: { nan: '__ushort_as_half(0x7e00u)', positiveInfinity: '__ushort_as_half(0x7c00u)', negativeInfinity: '__ushort_as_half(0xfc00u)' },
    bf16: { nan: '__ushort_as_bfloat16(0x7fc0u)', positiveInfinity: '__ushort_as_bfloat16(0x7f80u)', negativeInfinity: '__ushort_as_bfloat16(0xff80u)' },
  };
  return bits[scalar]?.[name] ?? null;
}
