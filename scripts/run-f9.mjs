import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'all';

function qualifiedNode() {
  if (process.env.CUDA_JS_NODE) return path.resolve(process.env.CUDA_JS_NODE);
  if (process.version === requestedVersion) return process.execPath;
  return path.join(root, 'build', 'toolchains', `node-${requestedVersion}-win-x64`, 'node.exe');
}
const node = qualifiedNode();
if (!existsSync(node)) {
  console.error(`CJS-F9 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { cwd: root, encoding: 'utf8' });
if (version.error) throw version.error;
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`CJS-F9 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}
const steps = {
  unit: [['--test', 'components/compiler-actor/test/compiler-actor.test.mjs']],
  portable: [['--test', 'components/compiler-actor/test/compiler-actor.test.mjs']],
  'linux-readiness': [['conformance/f9/run-linux-readiness.mjs']],
  native: [['--experimental-ffi', 'conformance/f9/run-native-windows.mjs']],
  verify: [['conformance/f9/verify.mjs']],
  all: [
    ['--test', 'components/compiler-actor/test/compiler-actor.test.mjs'],
    ['--experimental-ffi', 'conformance/f9/run-native-windows.mjs'],
    ['conformance/f9/verify.mjs'],
  ],
};
if (!(action in steps)) {
  console.error(`Unknown CJS-F9 action: ${action}`);
  process.exit(2);
}
if (['native', 'verify', 'all'].includes(action) && (process.platform !== 'win32' || process.arch !== 'x64')) {
  console.error(`CJS-F9 ${action} requires Windows x64; use portable or linux-readiness on Linux.`);
  process.exit(2);
}
if (action === 'linux-readiness' && (process.platform !== 'linux' || process.arch !== 'x64')) {
  console.error('CJS-F9 linux-readiness requires native Linux x64.');
  process.exit(2);
}
for (const args of steps[action]) {
  const result = spawnSync(node, args, { cwd: root, env: { ...process.env, CUDA_JS_F9_NODE: node }, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
