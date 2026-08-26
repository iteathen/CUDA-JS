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
  const suffix = process.platform === 'win32' ? 'win-x64' : 'linux-x64';
  return path.join(root, 'build', 'toolchains', `node-${requestedVersion}-${suffix}`, process.platform === 'win32' ? 'node.exe' : path.join('bin', 'node'));
}

function npmCliFor(node) {
  if (process.env.CUDA_JS_NPM_CLI) return path.resolve(process.env.CUDA_JS_NPM_CLI);
  const candidates = [
    path.join(path.dirname(node), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.resolve(path.dirname(node), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    process.version === requestedVersion && process.env.npm_execpath ? path.resolve(process.env.npm_execpath) : null,
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

const node = qualifiedNode();
if (!existsSync(node)) {
  console.error(`CJS-F8 requires official Node ${requestedVersion} at ${node} or CUDA_JS_NODE.`);
  process.exit(2);
}
const version = spawnSync(node, ['--version'], { cwd: root, encoding: 'utf8' });
if (version.error) throw version.error;
if (version.status !== 0 || version.stdout.trim() !== requestedVersion) {
  console.error(`CJS-F8 requires ${requestedVersion}; selected executable reports ${version.stdout.trim() || 'no version'}.`);
  process.exit(2);
}
const npmCli = npmCliFor(node);
if (!npmCli || !existsSync(npmCli)) {
  console.error(`CJS-F8 requires an npm CLI paired with Node ${requestedVersion}; selected path: ${npmCli ?? 'none'}.`);
  process.exit(2);
}

const unit = { args: ['--test',
  'components/cuda-target/test/cuda-target.test.mjs',
  'components/device-selection/test/device-selection.test.mjs',
  'components/device-js/test/translator.test.mjs',
  'components/device-js/test/strict-contract.test.mjs',
  'components/device-js/test/device-library.test.mjs',
  'components/prepared-execution/test/prepared-operation-dag.test.mjs',
  'components/execution/test/prepared-operation-dag.test.mjs',
  'components/driver-actor/test/protocol-prepared-operation-dag.test.mjs',
  'conformance/f8/device-publication-oracle.test.mjs',
  'components/runtime-facade/test/runtime-facade.test.mjs',
  'components/runtime-facade/test/scalar-launch.test.mjs',
  'components/runtime-facade/test/operation-lifecycle.test.mjs',
  'components/runtime-facade/test/prepared-operation-dag.test.mjs',
  'components/runtime-facade/test/device-js.test.mjs',
] };
const portable = { args: ['conformance/f8/run-portable.mjs'] };
const native = { nativeX64Only: true, args: ['conformance/f8/run-native.mjs'] };
const linux = { linuxOnly: true, args: ['--experimental-ffi', 'conformance/f8/run-linux-readiness.mjs'] };
const verify = { args: ['conformance/f8/verify.mjs'] };
const steps = {
  unit: [unit],
  portable: [unit, portable],
  native: [unit, portable, native],
  'linux-readiness': [linux],
  verify: [verify],
  all: [unit, portable, native, linux, verify],
};
if (!(action in steps)) {
  console.error(`Unknown CJS-F8 action: ${action}`);
  process.exit(2);
}
for (const step of steps[action]) {
  if (step.nativeX64Only && !(['win32', 'linux'].includes(process.platform) && process.arch === 'x64')) {
    if (action === 'native') {
      console.error('CJS-F8 native conformance requires a native Windows or Linux x64 profile.');
      process.exit(2);
    }
    continue;
  }
  if (step.linuxOnly && process.platform !== 'linux') {
    if (action === 'linux-readiness') {
      console.error('CJS-F8 Linux readiness requires native Linux x64 or ARM64.');
      process.exit(2);
    }
    continue;
  }
  const result = spawnSync(node, step.args, { cwd: root, env: { ...process.env, CUDA_JS_F8_NODE: node, CUDA_JS_F8_NPM_CLI: npmCli }, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
