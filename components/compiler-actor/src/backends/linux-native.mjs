import { createNativeBackend } from './native.mjs';
import { resolveLinuxNativeProfile } from './native-profiles.mjs';

export async function createBackend() {
  return createNativeBackend({ nativeProfile: await resolveLinuxNativeProfile() });
}
