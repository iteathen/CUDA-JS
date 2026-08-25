import { readFile } from 'node:fs/promises';

import { validateProfiles } from '../benchmarks/performance-soak/harness.mjs';

const command = process.argv[2] ?? 'check';

if (command === 'check') {
  const profiles = JSON.parse(await readFile(new URL('../benchmarks/performance-soak/profiles.json', import.meta.url), 'utf8'));
  validateProfiles(profiles);
  console.log(`Performance profile validation passed: ${profiles.profiles.length} bounded profiles.`);
} else if (command === 'short' || command === 'soak') {
  const { run } = await import('../benchmarks/performance-soak/run.mjs');
  await run(command === 'short' ? 'windows-sm75-presubmit-v1' : 'windows-sm75-bounded-soak-15m-v1');
} else {
  throw new Error(`Unknown performance-soak command: ${command}`);
}
