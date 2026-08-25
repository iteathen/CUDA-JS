export const DEVICE_JS_CONTRACT = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';

const DEVICE_POINTER_ATOMIC_HELPERS = new Map([
  ['gpu.atomic.loadRelaxedDevice', Object.freeze({ operation: 'load', order: 'relaxed' })],
  ['gpu.atomic.storeRelaxedDevice', Object.freeze({ operation: 'store', order: 'relaxed' })],
  ['gpu.atomic.loadAcquireDevice', Object.freeze({ operation: 'load', order: 'acquire' })],
  ['gpu.atomic.storeReleaseDevice', Object.freeze({ operation: 'store', order: 'release' })],
]);

const MAILBOX_ATOMIC_HELPERS = new Set([
  'gpu.mailbox.loadAcquireSystem',
  'gpu.mailbox.storeReleaseSystem',
]);

const VOID_HELPERS = new Set([
  'gpu.barrier.block',
  'gpu.fence.device',
  'gpu.atomic.storeRelaxedDevice',
  'gpu.atomic.storeReleaseDevice',
  'gpu.mailbox.storeReleaseSystem',
]);

export function devicePointerAtomicHelper(path) {
  return DEVICE_POINTER_ATOMIC_HELPERS.get(path) ?? null;
}

export function isScopedAtomicHelper(path) {
  return DEVICE_POINTER_ATOMIC_HELPERS.has(path) || MAILBOX_ATOMIC_HELPERS.has(path);
}

export function isVoidHelper(path) {
  return VOID_HELPERS.has(path);
}
