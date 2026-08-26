import { createNativeBackend, discoverNativeDevices } from './native.mjs';
import { resolveWindowsNativeProfile } from './native-profiles.mjs';

export function createBackend(options) {
  return createNativeBackend({ ...options, nativeProfile: resolveWindowsNativeProfile() });
}

export function discoverDevices() {
  return discoverNativeDevices({ nativeProfile: resolveWindowsNativeProfile() });
}
