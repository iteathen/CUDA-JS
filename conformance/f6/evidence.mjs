import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const profileName = `${process.platform}-${process.arch}`;
export const evidenceRoot = path.join(repositoryRoot, 'build', 'f6', profileName, 'evidence');
export const cacheRoot = path.join(repositoryRoot, 'build', 'f6', profileName, 'cache');
export const sourcePath = path.join(repositoryRoot, 'experiments', 'exp-009', 'fixtures', 'vector-add.cu.txt');
export const oracleRoot = path.join(repositoryRoot, 'build', 'exp-009', 'windows-x64');
export const oraclePtxPath = path.join(oracleRoot, 'oracle.ptx');
export const oracleCubinPath = path.join(oracleRoot, 'oracle.cubin');
export const capabilityRoot = path.join(repositoryRoot, 'build', 'f6', profileName, 'capabilities');
export const capabilityOraclePath = path.join(capabilityRoot, 'windows-capability-compiler-oracle.exe');
export const capabilitySources = Object.freeze({
  rdcKernel: path.join(repositoryRoot, 'conformance', 'f6', 'fixtures', 'rdc-kernel.cu.txt'),
  rdcDevice: path.join(repositoryRoot, 'conformance', 'f6', 'fixtures', 'rdc-device.cu.txt'),
  ltoKernel: path.join(repositoryRoot, 'conformance', 'f6', 'fixtures', 'lto-kernel.cu.txt'),
  ltoDevice: path.join(repositoryRoot, 'conformance', 'f6', 'fixtures', 'lto-device.cu.txt'),
});
export const capabilityArtifacts = Object.freeze({
  rdcKernel: path.join(capabilityRoot, 'oracle-rdc-kernel.ptx'),
  rdcDevice: path.join(capabilityRoot, 'oracle-rdc-device.ptx'),
  rdcCubin: path.join(capabilityRoot, 'oracle-rdc.cubin'),
  ltoKernel: path.join(capabilityRoot, 'oracle-lto-kernel.ltoir'),
  ltoDevice: path.join(capabilityRoot, 'oracle-lto-device.ltoir'),
  ltoCubin: path.join(capabilityRoot, 'oracle-lto.cubin'),
  rdcOutput: path.join(capabilityRoot, 'oracle-rdc-output.bin'),
  ltoOutput: path.join(capabilityRoot, 'oracle-lto-output.bin'),
});

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
