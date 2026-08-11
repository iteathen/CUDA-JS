import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

export function parseOracleOutput(output) {
  const result = {
    environment: {},
    cases: {},
    layouts: {},
    cleanup: {},
  };

  for (const line of output.trim().split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    const [kind] = parts;
    if (kind === 'ENV') {
      result.environment[parts[1]] = parts[2];
    } else if (kind === 'CASE') {
      result.cases[parts[1]] = { type: parts[2], value: parts[3] };
    } else if (kind === 'LAYOUT') {
      result.layouts[parts[1]] = { size: Number(parts[2]), alignment: Number(parts[3]), fields: {} };
    } else if (kind === 'FIELD') {
      result.layouts[parts[1]].fields[parts[2]] = Number(parts[3]);
    } else if (kind === 'CLEANUP') {
      result.cleanup[parts[1]] = parts[2];
    } else if (line.length > 0) {
      throw new Error(`Unknown oracle output: ${line}`);
    }
  }
  return result;
}
