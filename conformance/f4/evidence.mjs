import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const profileName = `${process.platform}-${process.arch}`;
export const evidenceRoot = path.join(repositoryRoot, 'build', 'f4', profileName, 'evidence');
export const nativeRoot = path.join(repositoryRoot, 'build', 'f4', 'win32-x64', 'native');
export const oraclePath = path.join(nativeRoot, 'windows-memory-oracle.exe');

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

export function parseOracle(text) {
  const records = {};
  for (const line of text.trim().split(/\r?\n/)) {
    const [kind, ...values] = line.split('\t');
    if (!kind || values.some((value) => !/^\d+$/.test(value))) throw new Error(`Invalid F4 oracle record: ${line}`);
    records[kind] = values.map(Number);
  }
  return records;
}

export function fixtureBytes(length = 4_096) {
  return Uint8Array.from({ length }, (_, index) => (index * 37 + 11) & 0xff);
}

export function patchBytes(length = 257) {
  return Uint8Array.from({ length }, (_, index) => (index * 19 + 5) & 0xff);
}

export function checksumBytes(bytes) {
  let checksum = 2_166_136_261;
  for (const value of bytes) {
    checksum = (checksum ^ value) >>> 0;
    checksum = Math.imul(checksum, 16_777_619) >>> 0;
  }
  return checksum;
}
