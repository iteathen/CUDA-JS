import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { evidenceRoot, oraclePath, parseOracle, ptxPath, repositoryRoot, sha256, sourceIdentity } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F5W native build requires Windows.');
assert.equal(process.arch, 'x64', 'F5W native build requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F5W native build requires official Node v26.7.0.');

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
const sourcePath = path.join(repositoryRoot, 'conformance', 'f5', 'native', 'windows-launch-oracle.c');
const objectPath = path.join(path.dirname(oraclePath), 'windows-launch-oracle.obj');
const vsDevCmd = [
  process.env.VSDEVCMD,
  'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
].filter(Boolean).find((candidate) => existsSync(candidate));
assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
for (const required of [path.join(includePath, 'cuda.h'), importLibraryPath, manifestPath, sourcePath, ptxPath]) assert(existsSync(required), `Required F5W input is missing: ${required}`);

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.toolkit.headerSha256, 'Windows CUDA header identity differs from the accepted manifest.');
assert.equal(await sha256(importLibraryPath), manifest.toolkit.importLibrarySha256, 'Windows CUDA import library identity differs from the accepted manifest.');
assert.deepEqual(manifest.layouts.CUlaunchConfig, {
  size: 56,
  alignment: 8,
  fields: { gridDimX: 0, gridDimY: 4, gridDimZ: 8, blockDimX: 12, blockDimY: 16, blockDimZ: 20, sharedMemBytes: 24, hStream: 32, attrs: 40, numAttrs: 48 },
});

await mkdir(path.dirname(oraclePath), { recursive: true });
await mkdir(evidenceRoot, { recursive: true });
const command = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  `cl /nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS ${quote(sourcePath)} /I${quote(includePath)} ${quote(importLibraryPath)} /Fo:${quote(objectPath)} /Fe:${quote(oraclePath)}`,
].join(' && ');
shell(command);
const run = spawnSync(oraclePath, [ptxPath], { cwd: repositoryRoot, encoding: 'utf8' });
if (run.error) throw run.error;
if (run.status !== 0) throw new Error(`F5W C oracle failed (${run.status}).\n${run.stdout}\n${run.stderr}`);
const oracle = parseOracle(run.stdout);
assert.deepEqual(oracle.RESULT, [1, oracle.RESULT[1]]);
assert.deepEqual(oracle.PARAM_LAYOUT, [0, 8, 16, 24, 28]);
assert.deepEqual(oracle.CONFIG_LAYOUT, [56, 0, 4, 8, 12, 16, 20, 24, 32, 40, 48]);
assert.deepEqual(oracle.EVENT_DESTROY, [0]);
assert.deepEqual(oracle.MODULE_UNLOAD, [0]);
assert.deepEqual(oracle.STREAM_DESTROY, [0]);
assert.deepEqual(oracle.CONTEXT_DESTROY, [0]);

const sources = ['conformance/f5/native/windows-launch-oracle.c', 'conformance/f5/fixtures/vector-add.ptx.txt', 'schemas/cuda-13.3/win-x64/compatibility-manifest.json'];
const evidence = {
  schemaVersion: 1,
  workPackage: 'CJS-F5W',
  capsule: 'independent-msvc-launch-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, osVersion: os.version(), compiler: 'MSVC x64', toolkit: manifest.toolkit },
  sources: await sourceIdentity(sources),
  artifact: { sha256: await sha256(oraclePath) },
  oracle,
  claimLimits: ['Exact accepted Windows x64 profile only.', 'Tracked PTX vector launch and event completion only.', 'No native Linux CUDA, compilation, performance, or public stability claim.'],
};
await writeFile(path.join(evidenceRoot, 'oracle-build.json'), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(path.join(evidenceRoot, 'oracle.txt'), run.stdout);
console.log(`F5W independent MSVC oracle passed: vector checksum ${oracle.RESULT[1]}, packed parameters, event, module, stream, and context teardown proved.`);
