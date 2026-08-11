import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { execute } from '../conformance/hardware/qualification.mjs';

const action = process.argv[2] ?? 'check';
const requestedVersion = 'v26.7.0';
if (action === 'qualify' && process.version !== requestedVersion) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const platformProfile = process.platform === 'win32' && process.arch === 'x64'
    ? { directory: 'node-v26.7.0-win-x64', executable: 'node.exe' }
    : process.platform === 'linux' && ['x64', 'arm64'].includes(process.arch)
      ? { directory: `node-v26.7.0-linux-${process.arch}`, executable: path.join('bin', 'node') }
      : null;
  const selected = process.env.CUDA_JS_NODE
    ? path.resolve(process.env.CUDA_JS_NODE)
    : platformProfile ? path.join(root, 'build', 'toolchains', platformProfile.directory, platformProfile.executable) : '';
  if (!existsSync(selected)) {
    console.error(`Hardware qualification requires official Node ${requestedVersion}. Set CUDA_JS_NODE${selected ? ` or install the standalone profile at ${selected}` : ''}.`);
    process.exit(2);
  }
  const result = spawnSync(selected, [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
    cwd: root,
    env: { ...process.env, CUDA_JS_NODE: selected },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
try {
  await execute(action);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
