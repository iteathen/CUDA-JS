import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'all';
const unitFiles = [
  'components/resource-registry/test/resource-registry.test.mjs',
  'components/memory/test/memory-manager.test.mjs',
  'components/memory/test/device-view-manager.test.mjs',
  'components/driver-actor/test/driver-runtime.test.mjs',
  'components/driver-actor/test/health.test.mjs',
];

function resolveQualifiedNode() {
  if (process.env.CUDA_JS_NODE) return path.resolve(process.env.CUDA_JS_NODE);
  if (process.version === requestedVersion) return process.execPath;
  const suffix = process.platform === 'win32' ? 'win-x64' : 'linux-x64';
  const executable = process.platform === 'win32' ? 'node.exe' : path.join('bin', 'node');
  return path.join(repositoryRoot, 'build', 'toolchains', `node-${requestedVersion}-${suffix}`, executable);
}

const node = resolveQualifiedNode();
if (!existsSync(node)) {
  console.error(`CJS-F4 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { cwd: repositoryRoot, encoding: 'utf8' });
if (version.error) throw version.error;
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`CJS-F4 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}

const steps = {
  unit: [{ args: ['--test', ...unitFiles] }],
  mock: [{ args: ['conformance/f4/run-mock.mjs'] }],
  build: [{ windowsOnly: true, args: ['conformance/f4/build-native-windows.mjs'] }],
  native: [
    { windowsOnly: true, args: ['conformance/f4/build-native-windows.mjs'] },
    { windowsOnly: true, args: ['--experimental-ffi', 'conformance/f4/run-native-windows.mjs'] },
  ],
  verify: [{ args: ['conformance/f4/verify.mjs'] }],
  portable: [
    { args: ['--test', ...unitFiles] },
    { args: ['conformance/f4/run-mock.mjs'] },
    { args: ['conformance/f4/verify.mjs'] },
  ],
  all: [
    { args: ['--test', ...unitFiles] },
    { args: ['conformance/f4/run-mock.mjs'] },
    { windowsOnly: true, args: ['conformance/f4/build-native-windows.mjs'] },
    { windowsOnly: true, args: ['--experimental-ffi', 'conformance/f4/run-native-windows.mjs'] },
    { args: ['conformance/f4/verify.mjs'] },
  ],
};
if (!(action in steps)) {
  console.error(`Unknown CJS-F4 action: ${action}`);
  process.exit(2);
}

for (const step of steps[action]) {
  if (step.windowsOnly && process.platform !== 'win32') {
    if (['build', 'native'].includes(action)) {
      console.error('CJS-F4 native conformance requires the exact qualified Windows x64 Driver/GPU profile.');
      process.exit(2);
    }
    continue;
  }
  const result = spawnSync(node, step.args, { cwd: repositoryRoot, env: { ...process.env, CUDA_JS_F4_NODE: node }, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
