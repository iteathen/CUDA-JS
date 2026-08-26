import { openDriverRuntime as openRawDriverRuntime } from './src/driver-runtime.mjs';
import { withLegacyLaunchSerialization } from './src/legacy-launch-adapter.mjs';

export { DriverRuntimeError } from './src/errors.mjs';
export { discoverDriverDevices } from './src/device-discovery.mjs';

export async function openDriverRuntime(options = {}) {
  return withLegacyLaunchSerialization(await openRawDriverRuntime(options));
}
