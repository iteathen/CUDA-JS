import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const profileName = `${process.platform}-${process.arch}`;
export const evidenceRoot = path.join(repositoryRoot, 'build', 'f7', profileName, 'evidence');

export function digestBytes(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export async function sha256(file) { return digestBytes(await readFile(file)); }
export async function sourceIdentity(paths) {
  return Object.fromEntries(await Promise.all(paths.map(async (relative) => [relative, await sha256(path.join(repositoryRoot, relative))])));
}
export async function writeEvidence(name, record) {
  await mkdir(evidenceRoot, { recursive: true });
  const target = path.join(evidenceRoot, name);
  await writeFile(target, `${JSON.stringify(record, null, 2)}\n`);
  return target;
}
