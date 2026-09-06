export const ERF_CONTRACT_SUFFIX = 'SPEC-0030-erf-v1';

export function isErfHelper(path) {
  return path === 'gpu.math.erf';
}

export function erfCode(scalar, code) {
  if (scalar === 'f32') return `erff(${code})`;
  if (scalar === 'f64') return `erf(${code})`;
  return null;
}
