export const TANH_CONTRACT_SUFFIX = 'SPEC-0030-tanh-v1';

const TANH_HELPERS = Object.freeze(new Set(['gpu.math.tanh']));

export function isTanhHelper(path) {
  return TANH_HELPERS.has(path);
}
