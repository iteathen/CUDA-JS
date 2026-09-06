import { ERF_CONTRACT_SUFFIX } from './erf-profile.mjs';
import { TANH_CONTRACT_SUFFIX } from './tanh-profile.mjs';

export const DEVICE_JS_CONTRACT = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';
export const DEVICE_JS_DENSE_NUMERIC_CONTRACT = `${DEVICE_JS_CONTRACT}+SPEC-0030-dense-numeric-v1`;
export const DEVICE_JS_DENSE_NUMERIC_ERF_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_CONTRACT}+${ERF_CONTRACT_SUFFIX}`;
export const DEVICE_JS_DENSE_NUMERIC_TANH_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_CONTRACT}+${TANH_CONTRACT_SUFFIX}`;
export const DEVICE_JS_DENSE_NUMERIC_ERF_TANH_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_ERF_CONTRACT}+${TANH_CONTRACT_SUFFIX}`;
export const DEVICE_JS_LIBRARY_CONTRACT = `${DEVICE_JS_CONTRACT}+SPEC-0028-device-library-v1`;
export const DEVICE_JS_DENSE_NUMERIC_LIBRARY_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_CONTRACT}+SPEC-0028-device-library-v1`;
export const DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_ERF_CONTRACT}+SPEC-0028-device-library-v1`;
export const DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_TANH_CONTRACT}+SPEC-0028-device-library-v1`;
export const DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT = `${DEVICE_JS_DENSE_NUMERIC_ERF_TANH_CONTRACT}+SPEC-0028-device-library-v1`;

// Internal aliases keep the translator composition code single-shaped while accepted
// authority deliberately has no child-only contract: every child selects dense first.
export const DEVICE_JS_ERF_CONTRACT = DEVICE_JS_DENSE_NUMERIC_ERF_CONTRACT;
export const DEVICE_JS_ERF_LIBRARY_CONTRACT = DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT;
export const DEVICE_JS_TANH_CONTRACT = DEVICE_JS_DENSE_NUMERIC_TANH_CONTRACT;
export const DEVICE_JS_TANH_LIBRARY_CONTRACT = DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT;
export const DEVICE_JS_ERF_TANH_CONTRACT = DEVICE_JS_DENSE_NUMERIC_ERF_TANH_CONTRACT;
export const DEVICE_JS_ERF_TANH_LIBRARY_CONTRACT = DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT;

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
