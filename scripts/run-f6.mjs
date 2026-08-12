import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'all';
const unitFiles = [
  'components/compiler-actor/test/compiler-actor.test.mjs',
  'components/compiler-actor/test/relocatable-device-code.test.mjs',
  'components/compiler-actor/test/device-lto.test.mjs',
  'components/execution/test/execution-manager.test.mjs',
  'components/driver-actor/test/driver-runtime.test.mjs',
];

function qualifiedNode() {
  if (process.env.CUDA_JS_NODE) return path.resolve(process.env.CUDA_JS_NODE);
  if (process.version === requestedVersion) return process.execPath;
  const suffix = process.platform === 'win32' ? 'win-x64' : 'linux-x64';
  return path.join(root, 'build', 'toolchains', `node-${requestedVersion}-${suffix}`, process.platform === 'win32' ? 'node.exe' : path.join('bin', 'node'));
}
const node = qualifiedNode();
if (!existsSync(node)) {
  console.error(`CJS-F6 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { cwd: root, encoding: 'utf8' });
if (version.error) throw version.error;
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`CJS-F6 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}

const steps = {
  unit: [{ args: ['--test', ...unitFiles] }],
  portable: [{ args: ['--test', ...unitFiles] }, { args: ['conformance/f6/run-portable.mjs'] }],
  'linux-readiness': [{ linuxOnly: true, args: ['--experimental-ffi', 'conformance/f6/run-linux-readiness.mjs'] }],
  experiment: [{ windowsOnly: true, args: ['--experimental-ffi', 'experiments/exp-009/src/run-native-windows.mjs'] }],
  native: [
    { windowsOnly: true, args: ['--experimental-ffi', 'experiments/exp-009/src/run-native-windows.mjs'] },
    { windowsOnly: true, args: ['--experimental-ffi', 'conformance/f6/run-native-windows.mjs'] },
  ],
  verify: [{ args: ['conformance/f6/verify.mjs'] }],
  all: [
    { args: ['--test', ...unitFiles] },
    { args: ['conformance/f6/run-portable.mjs'] },
    { windowsOnly: true, args: ['--experimental-ffi', 'experiments/exp-009/src/run-native-windows.mjs'] },
    { windowsOnly: true, args: ['--experimental-ffi', 'conformance/f6/run-native-windows.mjs'] },
    { args: ['conformance/f6/verify.mjs'] },
  ],
};
if (!(action in steps)) {
  console.error(`Unknown CJS-F6 action: ${action}`);
  process.exit(2);
}
for (const step of steps[action]) {
  if (step.windowsOnly && process.platform !== 'win32') {
    if (['experiment', 'native'].includes(action)) {
      console.error('CJS-F6 native conformance requires the exact qualified Windows x64 provider profile.');
      process.exit(2);
    }
    continue;
  }
  if (step.linuxOnly && process.platform !== 'linux') {
    console.error('CJS-F6 Linux readiness requires native Linux x86-64.');
    process.exit(2);
  }
  const result = spawnSync(node, step.args, { cwd: root, env: { ...process.env, CUDA_JS_F6_NODE: node }, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
