import { openCompilerRuntimeForTesting } from '../compiler-actor/testing.mjs';
import { openMockDriverRuntime } from '../driver-actor/testing.mjs';
import { openCudaRuntimeWithAdapters } from './src/runtime.mjs';

export function openCudaRuntimeForTesting(options = {}) {
  return openCudaRuntimeWithAdapters(options, {
    openDriver: async (driverOptions) => (await openMockDriverRuntime(driverOptions)).runtime,
    openCompiler: openCompilerRuntimeForTesting,
  }, (description) => Object.freeze({
    schemaVersion: 1,
    status: 'mock-only',
    reason: null,
    host: Object.freeze({ node: process.version, platform: process.platform, architecture: process.arch }),
    claim: description.claim,
  }));
}
