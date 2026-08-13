const TARGET_SYNTAX = /^(compute|sm)_([1-9][0-9]+)([fa])?$/;

export const CUDA_TARGET_POLICY_VERSION = 'SPEC-0006-target-v1';
export const CUDA_TARGET_BASES = Object.freeze(['75', '80', '86', '87', '88', '89', '90', '100', '103', '110', '120', '121']);

const ADMITTED_BASES = new Set(CUDA_TARGET_BASES);

function freezeResult(result) {
  if (result.target) Object.freeze(result.target);
  return Object.freeze(result);
}

export function parseCudaTarget(value) {
  if (typeof value !== 'string') return null;
  const match = TARGET_SYNTAX.exec(value);
  if (!match) return null;
  const [, prefix, base, suffix = null] = match;
  const variant = suffix === 'f' ? 'family' : suffix === 'a' ? 'architecture' : 'none';
  return Object.freeze({
    prefix,
    base,
    variant,
    suffix,
    name: value,
    policyVersion: CUDA_TARGET_POLICY_VERSION,
    admitted: suffix === null && ADMITTED_BASES.has(base),
  });
}

export function inspectCudaTarget(value, { expectedPrefix = null } = {}) {
  if (expectedPrefix !== null && !['compute', 'sm'].includes(expectedPrefix)) throw new TypeError('expectedPrefix must be compute, sm, or null.');
  const target = parseCudaTarget(value);
  if (!target) return freezeResult({ ok: false, reason: 'syntax', target: null });
  if (expectedPrefix !== null && target.prefix !== expectedPrefix) return freezeResult({ ok: false, reason: 'prefix', target });
  if (!target.admitted) return freezeResult({ ok: false, reason: 'policy', target });
  return freezeResult({ ok: true, reason: null, target });
}

export function normalizeCudaTarget(value, { expectedPrefix, defaultTarget } = {}) {
  const selected = value ?? defaultTarget;
  const result = inspectCudaTarget(selected, { expectedPrefix });
  return result.ok ? result.target.name : null;
}

export function pairedCudaTarget(value, expectedPrefix) {
  if (!['compute', 'sm'].includes(expectedPrefix)) throw new TypeError('expectedPrefix must be compute or sm.');
  const target = parseCudaTarget(value);
  if (!target) return null;
  return `${expectedPrefix}_${target.base}${target.suffix ?? ''}`;
}

export function cudaTargetPolicySnapshot() {
  return Object.freeze({
    version: CUDA_TARGET_POLICY_VERSION,
    admittedBases: CUDA_TARGET_BASES,
    admittedVariants: Object.freeze(['none']),
    parsedVariants: Object.freeze(['none', 'family', 'architecture']),
  });
}
