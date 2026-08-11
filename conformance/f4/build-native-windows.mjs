import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { evidenceRoot, oraclePath, parseOracle, repositoryRoot, sha256, sourceIdentity } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F4W native build requires Windows.');
assert.equal(process.arch, 'x64', 'F4W native build requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F4W native build requires official Node v26.7.0.');

function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function shell(command) {
  const result = spawnSync(command, { cwd: repositoryRoot, encoding: 'utf8', shell: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`Command failed (${result.status}): ${command}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}

const toolkitRoot = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
const includePath = path.join(toolkitRoot, 'include');
const importLibraryPath = path.join(toolkitRoot, 'lib', 'x64', 'cuda.lib');
const manifestPath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'win-x64', 'compatibility-manifest.json');
const sourcePath = path.join(repositoryRoot, 'conformance', 'f4', 'native', 'windows-memory-oracle.c');
const objectPath = path.join(path.dirname(oraclePath), 'windows-memory-oracle.obj');
const vsDevCmd = [
  process.env.VSDEVCMD,
  'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
].filter(Boolean).find((candidate) => existsSync(candidate));
assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
for (const required of [path.join(includePath, 'cuda.h'), importLibraryPath, manifestPath, sourcePath]) assert(existsSync(required), `Required F4W input is missing: ${required}`);

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.toolkit.headerSha256, 'Windows CUDA header identity differs from the accepted manifest.');
assert.equal(await sha256(importLibraryPath), manifest.toolkit.importLibrarySha256, 'Windows CUDA import library identity differs from the accepted manifest.');
assert.deepEqual(manifest.layouts.CUdeviceptr, { size: 8, alignment: 8, fields: {} });
assert.deepEqual(manifest.layouts.size_t, { size: 8, alignment: 8, fields: {} });

await mkdir(path.dirname(oraclePath), { recursive: true });
await mkdir(evidenceRoot, { recursive: true });
const command = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  `cl /nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS ${quote(sourcePath)} /I${quote(includePath)} ${quote(importLibraryPath)} /Fo:${quote(objectPath)} /Fe:${quote(oraclePath)}`,
].join(' && ');
shell(command);
const run = spawnSync(oraclePath, [], { cwd: repositoryRoot, encoding: 'utf8' });
if (run.error) throw run.error;
if (run.status !== 0) throw new Error(`F4W C oracle failed (${run.status}).\n${run.stdout}\n${run.stderr}`);
const oracle = parseOracle(run.stdout);
assert.deepEqual(oracle.RESULT, [1, oracle.RESULT[1]]);
assert.deepEqual(oracle.FREE, [0]);
assert.deepEqual(oracle.CONTEXT_DESTROY, [0]);
assert.deepEqual(oracle.CURRENT_NULL, [0, 1]);

const sources = ['conformance/f4/native/windows-memory-oracle.c', 'schemas/cuda-13.3/win-x64/compatibility-manifest.json'];
const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F4W',
  capsule: 'independent-msvc-device-memory-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, osVersion: os.version(), compiler: 'MSVC x64', toolkit: manifest.toolkit },
  sources: await sourceIdentity(sources),
  artifact: { sha256: await sha256(oraclePath) },
  oracle,
  claimLimits: ['Exact accepted Windows x64 profile only.', 'Synchronous device allocation and copied transfers only.', 'No Linux Driver, launch, compiler, performance, or public stability claim.'],
};
await writeFile(path.join(evidenceRoot, 'oracle-build.json'), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(path.join(evidenceRoot, 'oracle.txt'), run.stdout);
console.log(`F4W independent MSVC oracle passed: checksum ${oracle.RESULT[1]}, free and context teardown proved.`);
