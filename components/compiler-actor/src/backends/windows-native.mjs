import { createNativeBackend } from './native.mjs';
import { resolveWindowsNativeProfile } from './native-profiles.mjs';

export async function createBackend() {
  return createNativeBackend({ nativeProfile: await resolveWindowsNativeProfile() });
}
