import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'prepare';
const entrypoints = {
  build: ['experiments/exp-001/src/build.mjs'],
  readiness: ['experiments/exp-001/src/readiness.mjs'],
  smoke: ['experiments/exp-001/src/readiness.mjs', 'experiments/exp-001/src/run-smoke.mjs'],
  all: ['experiments/exp-001/src/build.mjs', 'experiments/exp-001/src/readiness.mjs', 'experiments/exp-001/src/run-smoke.mjs'],
  prepare: ['experiments/exp-001/src/build.mjs', 'experiments/exp-001/src/readiness.mjs'],
};
if (!(action in entrypoints)) {
  console.error(`Unknown EXP-001 action: ${action}`);
  process.exit(2);
}
if (process.platform !== 'linux' || process.arch !== 'x64') {
  console.error('EXP-001 requires native Linux x64. Windows and WSL evidence are separate profiles.');
  process.exit(2);
}
const node = process.env.CUDA_JS_NODE
  ? path.resolve(process.env.CUDA_JS_NODE)
  : process.version === requestedVersion
    ? process.execPath
    : path.join(repositoryRoot, 'build', 'toolchains', `node-${requestedVersion}-linux-x64`, 'bin', 'node');
if (!existsSync(node)) {
  console.error(`EXP-001 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { encoding: 'utf8' });
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`EXP-001 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}
for (const entrypoint of entrypoints[action]) {
  const result = spawnSync(node, ['--experimental-ffi', entrypoint], { cwd: repositoryRoot, env: { ...process.env, CUDA_JS_EXP_NODE: node }, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
