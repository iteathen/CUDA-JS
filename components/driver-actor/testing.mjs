import { DRIVER_RUNTIME_TEST, openDriverRuntimeForTesting } from './src/driver-runtime.mjs';
import { withLegacyLaunchSerialization } from './src/legacy-launch-adapter.mjs';

export async function openMockDriverRuntime(options = {}) {
  const runtime = withLegacyLaunchSerialization(await openDriverRuntimeForTesting(options));
  const testing = Object.freeze({
    blockActor(milliseconds) {
      return runtime[DRIVER_RUNTIME_TEST]('testing.block', { milliseconds });
    },
    injectHealth(category, originOperationId) {
      return runtime[DRIVER_RUNTIME_TEST]('testing.inject-health', { category, originOperationId });
    },
    terminateActor() {
      return runtime[DRIVER_RUNTIME_TEST]('terminate');
    },
    setExecutionMode(mode) {
      return runtime[DRIVER_RUNTIME_TEST]('testing.execution-mode', { mode });
    },
  });
  return Object.freeze({ runtime, testing });
}
