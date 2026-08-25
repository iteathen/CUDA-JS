import { createNativeBackend } from './native.mjs';
import { resolveWindowsNativeProfile } from './native-profiles.mjs';

export function createBackend(options) {
  return createNativeBackend({ ...options, nativeProfile: resolveWindowsNativeProfile() });
}
