import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { resolveLinuxNativeProfile } from '../../components/driver-actor/src/backends/native-profiles.mjs';
import { evidenceRoot, nativeProfile, nativeRoot, oraclePath, parseOracle, repositoryRoot, sha256, sourceIdentity } from './evidence.mjs';

assert(['win32', 'linux'].includes(process.platform), 'F4 native build requires Windows or native Linux.');
assert.equal(process.arch, 'x64', 'F4 native build requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F4 native build requires official Node v26.7.0.');
if (process.platform === 'linux') assert.doesNotMatch(os.release(), /microsoft/i, 'F4 native Linux evidence does not accept WSL.');

function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function run(executable, args = [], options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`Command failed (${result.status}): ${executable} ${args.join(' ')}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}

const sourceRelative = 'conformance/f4/native/memory-oracle.c';
const sourcePath = path.join(repositoryRoot, sourceRelative);
let manifestRelative;
let manifest;
let compiler;
let build;
let toolkit;

await mkdir(nativeRoot, { recursive: true });
await mkdir(evidenceRoot, { recursive: true });

if (process.platform === 'win32') {
  const toolkitRoot = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
  const includePath = path.join(toolkitRoot, 'include');
  const importLibraryPath = path.join(toolkitRoot, 'lib', 'x64', 'cuda.lib');
  manifestRelative = 'schemas/cuda-13.3/win-x64/compatibility-manifest.json';
  const manifestPath = path.join(repositoryRoot, manifestRelative);
  const objectPath = path.join(nativeRoot, 'memory-oracle.obj');
  const vsDevCmd = [
    process.env.VSDEVCMD,
    'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
  ].filter(Boolean).find((candidate) => existsSync(candidate));
  assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
  for (const required of [path.join(includePath, 'cuda.h'), importLibraryPath, manifestPath, sourcePath]) assert(existsSync(required), `Required F4W input is missing: ${required}`);
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.toolkit.headerSha256, 'Windows CUDA header identity differs from the accepted manifest.');
  assert.equal(await sha256(importLibraryPath), manifest.toolkit.importLibrarySha256, 'Windows CUDA import library identity differs from the accepted manifest.');
  assert.deepEqual(manifest.layouts.CUdeviceptr, { size: 8, alignment: 8, fields: {} });
  assert.deepEqual(manifest.layouts.size_t, { size: 8, alignment: 8, fields: {} });
  const command = [
    `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
    `cl /nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS ${quote(sourcePath)} /I${quote(includePath)} ${quote(importLibraryPath)} /Fo:${quote(objectPath)} /Fe:${quote(oraclePath)}`,
  ].join(' && ');
  run(command, [], { shell: true });
  compiler = 'MSVC x64';
  build = { command };
  toolkit = manifest.toolkit;
} else {
  const compilerExecutable = process.env.CC ?? 'cc';
  const toolkitRoot = '/usr/local/cuda-13.3';
  const includePath = path.join(toolkitRoot, 'targets', 'x86_64-linux', 'include');
  manifestRelative = 'schemas/cuda-13.3/linux-x64/generated/compatibility-manifest.json';
  const manifestPath = path.join(repositoryRoot, manifestRelative);
  const driverProfile = resolveLinuxNativeProfile();
  for (const required of [path.join(includePath, 'cuda.h'), driverProfile.driverPath, manifestPath, sourcePath]) assert(existsSync(required), `Required F4L input is missing: ${required}`);
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.exactIdentity.headerSha256, 'Linux CUDA header identity differs from the accepted manifest.');
  assert.deepEqual(manifest.target, { abi: 'sysv', architecture: 'x86_64', byteOrder: 'little-endian', id: 'linux-x64-sysv', os: 'linux', pointerBits: 64, sizeBits: 64 });
  const args = ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', sourcePath, `-I${includePath}`, driverProfile.driverPath, `-Wl,-rpath,${path.dirname(driverProfile.driverPath)}`, '-o', oraclePath];
  compiler = run(compilerExecutable, ['--version']).split(/\r?\n/u)[0];
  run(compilerExecutable, args);
  build = { executable: compilerExecutable, arguments: args, driverSha256: await sha256(driverProfile.driverPath) };
  toolkit = { version: manifest.toolkitRelease, packageVersion: manifest.packageVersion, headerSha256: manifest.exactIdentity.headerSha256 };
}

const oracleText = run(oraclePath);
const oracle = parseOracle(oracleText);
assert.deepEqual(oracle.RESULT, [1, oracle.RESULT[1]]);
assert.deepEqual(oracle.FREE, [0]);
assert.deepEqual(oracle.CONTEXT_DESTROY, [0]);
assert.deepEqual(oracle.CURRENT_NULL, [0, 1]);

const evidence = {
  schemaVersion: 1,
  workPackage: `CJS-F4${nativeProfile === 'windows' ? 'W' : 'L'}`,
  capsule: 'independent-native-device-memory-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, kernel: os.release(), osVersion: os.version(), compiler, toolkit },
  sources: await sourceIdentity([sourceRelative, manifestRelative]),
  build,
  artifact: { sha256: await sha256(oraclePath) },
  oracle,
  claimLimits: [
    `Exact ${nativeProfile} x64 input profile only; support requires the complete reviewed platform chain.`,
    'Synchronous device allocation and copied transfers only.',
    'No launch, compiler, performance, cross-platform inference, or public stability claim.',
  ],
};
await writeFile(path.join(evidenceRoot, 'oracle-build.json'), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(path.join(evidenceRoot, 'oracle.txt'), oracleText);
console.log(`F4${nativeProfile === 'windows' ? 'W' : 'L'} independent native oracle passed: checksum ${oracle.RESULT[1]}, free and context teardown proved.`);
