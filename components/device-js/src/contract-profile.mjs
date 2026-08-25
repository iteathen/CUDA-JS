export const DEVICE_JS_CONTRACT = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0014-publication-mailbox-v1';

const SCOPED_ATOMIC_HELPERS = new Set([
  'gpu.atomic.loadRelaxedDevice',
  'gpu.atomic.storeRelaxedDevice',
  'gpu.mailbox.loadAcquireSystem',
  'gpu.mailbox.storeReleaseSystem',
]);

const VOID_HELPERS = new Set([
  'gpu.barrier.block',
  'gpu.fence.device',
  'gpu.atomic.storeRelaxedDevice',
  'gpu.mailbox.storeReleaseSystem',
]);

export function isScopedAtomicHelper(path) {
  return SCOPED_ATOMIC_HELPERS.has(path);
}

export function isVoidHelper(path) {
  return VOID_HELPERS.has(path);
}
