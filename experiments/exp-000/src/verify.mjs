import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { experimentRoot, repositoryRoot } from './paths.mjs';

const commands = [
  [path.join(experimentRoot, 'src', 'generate.mjs'), '--check'],
  [
    '--test',
    path.join(experimentRoot, 'test', 'packers.test.mjs'),
    path.join(experimentRoot, 'test', 'runtime-ir.test.mjs'),
  ],
  [path.join(experimentRoot, 'src', 'run-correctness.mjs')],
  [path.join(experimentRoot, 'src', 'run-lifecycle.mjs')],
];

for (const args of commands) {
  const result = spawnSync(process.execPath, ['--experimental-ffi', ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('EXP-000 verification passed.');
