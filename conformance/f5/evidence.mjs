import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const profileName = `${process.platform}-${process.arch}`;
export const evidenceRoot = path.join(repositoryRoot, 'build', 'f5', profileName, 'evidence');
export const nativeRoot = path.join(repositoryRoot, 'build', 'f5', 'win32-x64', 'native');
export const oraclePath = path.join(nativeRoot, 'windows-launch-oracle.exe');
export const ptxPath = path.join(repositoryRoot, 'conformance', 'f5', 'fixtures', 'vector-add.ptx.txt');
export const elementCount = 1_024;

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
    if (!kind || values.some((value) => !/^\d+$/.test(value))) throw new Error(`Invalid F5 oracle record: ${line}`);
    records[kind] = values.map(Number);
  }
  return records;
}

export function vectorInputs(count = elementCount) {
  const left = new Uint32Array(count);
  const right = new Uint32Array(count);
  const expected = new Uint32Array(count);
  for (let index = 0; index < count; index += 1) {
    left[index] = (Math.imul(index, 3) + 7) >>> 0;
    right[index] = (Math.imul(index, 5) + 11) >>> 0;
    expected[index] = (left[index] + right[index]) >>> 0;
  }
  return { left, right, expected };
}

export function u32Bytes(values) {
  const bytes = new Uint8Array(values.length * 4);
  const view = new DataView(bytes.buffer);
  for (let index = 0; index < values.length; index += 1) view.setUint32(index * 4, values[index], true);
  return bytes;
}

export function checksumBytes(bytes) {
  let checksum = 2_166_136_261;
  for (const value of bytes) {
    checksum = (checksum ^ value) >>> 0;
    checksum = Math.imul(checksum, 16_777_619) >>> 0;
  }
  return checksum;
}
