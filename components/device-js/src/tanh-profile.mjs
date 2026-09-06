export const TANH_CONTRACT_SUFFIX = 'SPEC-0030-tanh-v1';

const TANH_HELPERS = Object.freeze(new Set(['gpu.math.tanh']));

export function isTanhHelper(path) {
  return TANH_HELPERS.has(path);
}

export function tanhCode(path, argumentType, argumentCode, fail) {
  if (!isTanhHelper(path)) return null;
  if (!['f32', 'f64'].includes(argumentType)) {
    fail('DEVICE_JS_MATH_TYPE', `${path} requires an f32 or f64 value.`, { type: argumentType });
  }
  return argumentType === 'f32' ? `tanhf(${argumentCode})` : `tanh(${argumentCode})`;
}
