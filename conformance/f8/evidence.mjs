import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const profileName = `${process.platform}-${process.arch}`;
export const evidenceRoot = path.join(repositoryRoot, 'build', 'f8', profileName, 'evidence');
export const packageRoot = path.join(repositoryRoot, 'build', 'f8', profileName, 'package');
export const consumersRoot = path.join(repositoryRoot, 'build', 'f8', profileName, 'consumers');
export const nativeProfile = process.platform === 'win32' ? 'windows' : process.platform === 'linux' ? 'linux' : 'unsupported';
export const nativePackageEvidenceName = `native-${nativeProfile}-package.json`;

export async function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(await readFile(filePath));
  return hash.digest('hex');
}

export async function sourceIdentity(paths) {
  return Object.fromEntries(await Promise.all(paths.map(async (relative) => [relative, await sha256(path.join(repositoryRoot, relative))])));
}

export async function writeEvidence(name, record) {
  await mkdir(evidenceRoot, { recursive: true });
  const target = path.join(evidenceRoot, name);
  await writeFile(target, `${JSON.stringify(record, null, 2)}\n`);
  return target;
}
