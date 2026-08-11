import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requestedVersion = 'v26.7.0';
const action = process.argv[2] ?? 'all';
const forwarded = process.argv.slice(3);

const entrypoints = {
  generate: ['experiments/exp-000/src/generate.mjs'],
  build: ['experiments/exp-000/src/build.mjs'],
  correctness: ['experiments/exp-000/src/run-correctness.mjs'],
  lifecycle: ['experiments/exp-000/src/run-lifecycle.mjs'],
  benchmark: ['experiments/exp-000/src/run-benchmark.mjs'],
  case: ['experiments/exp-000/src/run-correctness.mjs', '--case'],
  test: [
    '--test',
    'experiments/exp-000/test/packers.test.mjs',
    'experiments/exp-000/test/runtime-ir.test.mjs',
  ],
  verify: ['experiments/exp-000/src/verify.mjs'],
  all: ['experiments/exp-000/src/run-all.mjs'],
};

if (!(action in entrypoints)) {
  console.error(`Unknown EXP-000 action: ${action}`);
  process.exit(2);
}

function resolveQualifiedNode() {
  const configured = process.env.CUDA_JS_NODE;
  if (configured) return path.resolve(configured);

  if (process.version === requestedVersion) return process.execPath;

  const executable = process.platform === 'win32' ? 'node.exe' : 'bin/node';
  return path.join(
    repositoryRoot,
    'build',
    'toolchains',
    `node-${requestedVersion}-${process.platform === 'win32' ? 'win-x64' : 'linux-x64'}`,
    executable,
  );
}

const node = resolveQualifiedNode();
if (!existsSync(node)) {
  console.error([
    `EXP-000 requires the official Node ${requestedVersion} executable.`,
    `Set CUDA_JS_NODE to that executable or place the portable distribution at:`,
    `  ${node}`,
    `The system Node installation is not modified by CUDA-JS.`,
  ].join('\n'));
  process.exit(2);
}

const versionProbe = spawnSync(node, ['--version'], { cwd: repositoryRoot, encoding: 'utf8' });
if (versionProbe.error) throw versionProbe.error;
const actualVersion = versionProbe.stdout.trim();
if (versionProbe.status !== 0 || actualVersion !== requestedVersion) {
  console.error(`EXP-000 requires ${requestedVersion}; selected executable reports ${actualVersion || 'no version'}.`);
  process.exit(2);
}

const nodeArguments = [
  '--experimental-ffi',
  ...entrypoints[action],
  ...forwarded,
];

const result = spawnSync(node, nodeArguments, {
  cwd: repositoryRoot,
  env: {
    ...process.env,
    CUDA_JS_EXP_NODE: node,
  },
  stdio: 'inherit',
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
