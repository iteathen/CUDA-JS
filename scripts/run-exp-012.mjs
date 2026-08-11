import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'all';
const entrypoints = {
  build: ['experiments/exp-012/src/build.mjs'],
  smoke: ['experiments/exp-012/src/run-smoke.mjs'],
  verify: ['experiments/exp-012/src/verify.mjs'],
  all: [
    'experiments/exp-012/src/build.mjs',
    'experiments/exp-012/src/run-smoke.mjs',
    'experiments/exp-012/src/verify.mjs',
  ],
};

if (!(action in entrypoints)) {
  console.error(`Unknown EXP-012 action: ${action}`);
  process.exit(2);
}
if (process.platform !== 'win32' || process.arch !== 'x64') {
  console.error('EXP-012 requires Windows x64 with a real NVIDIA Driver/GPU.');
  process.exit(2);
}
function resolveQualifiedNode() {
  const configured = process.env.CUDA_JS_NODE;
  if (configured) return path.resolve(configured);
  if (process.version === requestedVersion) return process.execPath;
  return path.join(repositoryRoot, 'build', 'toolchains', `node-${requestedVersion}-win-x64`, 'node.exe');
}

const node = resolveQualifiedNode();
if (!existsSync(node)) {
  console.error(`EXP-012 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { cwd: repositoryRoot, encoding: 'utf8' });
if (version.error) throw version.error;
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`EXP-012 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}

for (const entrypoint of entrypoints[action]) {
  const result = spawnSync(node, ['--experimental-ffi', entrypoint], {
    cwd: repositoryRoot,
    env: { ...process.env, CUDA_JS_EXP_NODE: node },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
