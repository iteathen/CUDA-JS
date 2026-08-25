import { createNativeBackend } from './native.mjs';
import { resolveLinuxNativeProfile } from './native-profiles.mjs';

export function createBackend(options) {
  return createNativeBackend({ ...options, nativeProfile: resolveLinuxNativeProfile() });
}
