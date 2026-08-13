const TARGET_SYNTAX = /^(compute|sm)_([1-9][0-9]+)([fa])?$/;

export const CUDA_TARGET_POLICY_VERSION = 'SPEC-0006-target-v1';
export const CUDA_TARGET_POLICY_ENTRIES = Object.freeze([
  ['75', '7.5'], ['80', '8.0'], ['86', '8.6'], ['87', '8.7'], ['88', '8.8'], ['89', '8.9'],
  ['90', '9.0'], ['100', '10.0'], ['103', '10.3'], ['110', '11.0'], ['120', '12.0'], ['121', '12.1'],
].map(([base, computeCapability]) => Object.freeze({ base, computeCapability })));
export const CUDA_TARGET_BASES = Object.freeze(CUDA_TARGET_POLICY_ENTRIES.map(({ base }) => base));
export const CUDA_TARGET_POLICY_IDENTITY = Object.freeze({
  revision: CUDA_TARGET_POLICY_VERSION,
  entries: CUDA_TARGET_POLICY_ENTRIES,
  admittedVariants: Object.freeze(['none']),
});

const POLICY_BY_BASE = new Map(CUDA_TARGET_POLICY_ENTRIES.map((entry) => [entry.base, entry]));

function freezeResult(result) {
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
  });
}

export function inspectCudaTarget(value, { expectedPrefix = null } = {}) {
  if (expectedPrefix !== null && !['compute', 'sm'].includes(expectedPrefix)) throw new TypeError('expectedPrefix must be compute, sm, or null.');
  const target = parseCudaTarget(value);
  if (!target) return freezeResult({ ok: false, reason: 'syntax', target: null });
  if (expectedPrefix !== null && target.prefix !== expectedPrefix) return freezeResult({ ok: false, reason: 'prefix', target });
  const policy = target.variant === 'none' ? POLICY_BY_BASE.get(target.base) ?? null : null;
  if (!policy) return freezeResult({ ok: false, reason: 'policy', target, policy: null });
  return freezeResult({ ok: true, reason: null, target, policy });
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
    entries: CUDA_TARGET_POLICY_ENTRIES,
    admittedVariants: Object.freeze(['none']),
    parsedVariants: Object.freeze(['none', 'family', 'architecture']),
  });
}
