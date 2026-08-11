import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'all';
const unitFiles = [
  'components/resource-registry/test/resource-registry.test.mjs',
  'components/memory/test/memory-manager.test.mjs',
  'components/execution/test/execution-manager.test.mjs',
  'components/driver-actor/test/driver-runtime.test.mjs',
  'components/compiler-actor/test/compiler-actor.test.mjs',
  'components/platform-diagnostics/test/platform-diagnostics.test.mjs',
  'conformance/f7/property-cases.test.mjs',
];

function qualifiedNode() {
  if (process.env.CUDA_JS_NODE) return path.resolve(process.env.CUDA_JS_NODE);
  if (process.version === requestedVersion) return process.execPath;
  const suffix = process.platform === 'win32' ? 'win-x64' : 'linux-x64';
  return path.join(root, 'build', 'toolchains', `node-${requestedVersion}-${suffix}`, process.platform === 'win32' ? 'node.exe' : path.join('bin', 'node'));
}
const node = qualifiedNode();
if (!existsSync(node)) {
  console.error(`CJS-F7 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { cwd: root, encoding: 'utf8' });
if (version.error) throw version.error;
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`CJS-F7 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}

const steps = {
  unit: [{ args: ['--test', ...unitFiles] }],
  portable: [{ args: ['--test', ...unitFiles] }, { args: ['conformance/f7/run-portable.mjs'] }],
  'linux-readiness': [{ linuxOnly: true, args: ['conformance/f7/run-linux-readiness.mjs'] }],
  native: [{ windowsOnly: true, args: ['--experimental-ffi', 'conformance/f7/run-native-windows.mjs'] }],
  verify: [{ args: ['conformance/f7/verify.mjs'] }],
  all: [
    { args: ['--test', ...unitFiles] },
    { args: ['conformance/f7/run-portable.mjs'] },
    { windowsOnly: true, args: ['--experimental-ffi', 'conformance/f7/run-native-windows.mjs'] },
    { linuxOnly: true, args: ['conformance/f7/run-linux-readiness.mjs'] },
    { args: ['conformance/f7/verify.mjs'] },
  ],
};
if (!(action in steps)) {
  console.error(`Unknown CJS-F7 action: ${action}`);
  process.exit(2);
}
for (const step of steps[action]) {
  if (step.windowsOnly && process.platform !== 'win32') {
    if (action === 'native') {
      console.error('CJS-F7 native conformance currently requires the exact qualified Windows x64 profile.');
      process.exit(2);
    }
    continue;
  }
  if (step.linuxOnly && process.platform !== 'linux') {
    if (action === 'linux-readiness') {
      console.error('CJS-F7 Linux readiness requires native Linux x64 or ARM64.');
      process.exit(2);
    }
    continue;
  }
  const result = spawnSync(node, step.args, { cwd: root, env: { ...process.env, CUDA_JS_F7_NODE: node }, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
