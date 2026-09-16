// Pure Device-JS profile facts. Native resources remain compiler/runtime-owned.
export const WARP_CONTRACT_SUFFIX = 'SPEC-0022-warp32-v1';
export const WARP_HELPERS = Object.freeze([
  'gpu.warp.width', 'gpu.warp.laneId', 'gpu.warp.ballot',
]);

export function isWarpHelper(path) { return WARP_HELPERS.includes(path); }
export function contractUsesWarp(contract) {
  return typeof contract === 'string' && contract.endsWith(`+${WARP_CONTRACT_SUFFIX}`);
}
export function withoutWarpContract(contract) {
  return contractUsesWarp(contract) ? contract.slice(0, -(WARP_CONTRACT_SUFFIX.length + 1)) : contract;
}
export function withWarpContract(contract, selected) {
  return selected ? `${contract}+${WARP_CONTRACT_SUFFIX}` : contract;
}

// The wrapper makes mask evaluation single-shot, including expressions with side
// effects, and makes excluded result bits explicitly zero. It adds no memory fence.
export function warpPreludeLines() {
  return [
    'static __device__ __forceinline__ unsigned int djs_warp_ballot(unsigned int mask, bool predicate) {',
    '  return __ballot_sync(mask, predicate) & mask;',
    '}',
    '',
  ];
}

// Called only for this closed helper set. The frontend supplies its authoritative
// expression/type owner and diagnostic function; this module owns warp semantics.
export function emitWarpHelper(path, args, node, expression, fail) {
  const ballot = path === 'gpu.warp.ballot';
  if (args.length !== (ballot ? 2 : 0) || args.some((arg) => arg.type === 'SpreadElement')) {
    fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} requires ${ballot ? 'two arguments' : 'no arguments'}.`, node);
  }
  if (path === 'gpu.warp.width') return '32u';
  if (path === 'gpu.warp.laneId') {
    return 'static_cast<unsigned int>(((threadIdx.z * blockDim.y + threadIdx.y) * blockDim.x + threadIdx.x) % 32u)';
  }
  const mask = expression(args[0]);
  const predicate = expression(args[1]);
  if (mask.type.text !== 'u32' || predicate.type.text !== 'bool') {
    fail('DEVICE_JS_WARP_TYPE', 'Warp ballot requires a u32 participation mask and bool predicate.', node);
  }
  return `djs_warp_ballot(${mask.code}, ${predicate.code})`;
}
