import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { experimentRoot, repositoryRoot } from './paths.mjs';

for (const step of ['build', 'run-correctness', 'run-lifecycle', 'run-benchmark']) {
  const script = path.join(experimentRoot, 'src', `${step}.mjs`);
  const result = spawnSync(process.execPath, ['--experimental-ffi', script], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('EXP-000 complete for the exact recorded local profile.');
