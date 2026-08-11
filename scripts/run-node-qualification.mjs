import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { execute } from '../conformance/node/qualification.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredVersion = 'v26.7.0';
const action = process.argv[2] ?? 'check';

function selectedNode() {
  if (process.env.CUDA_JS_NODE) return path.resolve(process.env.CUDA_JS_NODE);
  if (process.version === requiredVersion) return process.execPath;
  return path.join(root, 'build', 'toolchains', 'node-v26.7.0-win-x64', 'node.exe');
}

function run(node, args) {
  const result = spawnSync(node, args, { cwd: root, env: process.env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (action === 'probe' || action === 'check-internal' || action === 'render-internal') {
  execute(action.replace('-internal', '')).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
} else {
  const node = selectedNode();
  if (!existsSync(node)) {
    console.error(`Node qualification maintenance requires official ${requiredVersion}. Set CUDA_JS_NODE or install ${node}.`);
    process.exit(2);
  }
  const version = spawnSync(node, ['--version'], { cwd: root, encoding: 'utf8' });
  if (version.status !== 0 || version.stdout.trim() !== requiredVersion) {
    console.error(`Selected Node must report ${requiredVersion}.`);
    process.exit(2);
  }
  if (action === 'check') {
    run(node, ['--test', 'conformance/node/qualification.test.mjs']);
    run(node, ['scripts/run-node-qualification.mjs', 'check-internal']);
  } else if (action === 'render') {
    run(node, ['scripts/run-node-qualification.mjs', 'render-internal']);
  } else {
    console.error(`Unknown Node qualification action: ${action}`);
    process.exit(2);
  }
}
