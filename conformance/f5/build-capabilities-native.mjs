import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { resolveLinuxNativeProfile } from '../../components/driver-actor/src/backends/native-profiles.mjs';
import { capabilityOraclePath, capabilityPtxPath, capabilitySourcePath, evidenceRoot, nativeProfile, nativeRoot, parseOracle, repositoryRoot, sha256, sourceIdentity } from './evidence.mjs';

assert(['win32', 'linux'].includes(process.platform), 'F5 native capability build requires Windows or native Linux.');
assert.equal(process.arch, 'x64', 'F5 native capability build requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F5 native capability build requires official Node v26.7.0.');
if (process.platform === 'linux') assert.doesNotMatch(os.release(), /microsoft/i, 'F5 native Linux capability evidence does not accept WSL.');

function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function run(executable, args = [], options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`Command failed (${result.status}): ${executable} ${args.join(' ')}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}

const oracleSourceRelative = 'conformance/f5/native/capability-oracle.c';
const oracleSourcePath = path.join(repositoryRoot, oracleSourceRelative);
const oracleTextPath = path.join(evidenceRoot, 'capability-oracle.txt');
let manifestRelative;
let manifest;
let compiler;
let toolkit;
let build;

await mkdir(nativeRoot, { recursive: true });
await mkdir(evidenceRoot, { recursive: true });

if (process.platform === 'win32') {
  const toolkitRoot = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
  const includePath = path.join(toolkitRoot, 'include');
  const importLibraryPath = path.join(toolkitRoot, 'lib', 'x64', 'cuda.lib');
  const nvccPath = path.join(toolkitRoot, 'bin', 'nvcc.exe');
  manifestRelative = 'schemas/cuda-13.3/win-x64/compatibility-manifest.json';
  const manifestPath = path.join(repositoryRoot, manifestRelative);
  const objectPath = path.join(nativeRoot, 'capability-oracle.obj');
  const vsDevCmd = [
    process.env.VSDEVCMD,
    'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
  ].filter(Boolean).find((candidate) => existsSync(candidate));
  assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
  for (const required of [nvccPath, path.join(includePath, 'cuda.h'), importLibraryPath, manifestPath, capabilitySourcePath, oracleSourcePath]) assert(existsSync(required), `Required F5W capability input is missing: ${required}`);
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.toolkit.headerSha256);
  assert.equal(await sha256(importLibraryPath), manifest.toolkit.importLibrarySha256);
  const nvccCommand = [
    `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
    `${quote(nvccPath)} --ptx -arch=compute_75 --std=c++17 --fmad=false -Xcompiler /Zc:preprocessor -x cu ${quote(capabilitySourcePath)} -o ${quote(capabilityPtxPath)}`,
  ].join(' && ');
  run(nvccCommand, [], { shell: true });
  const compileCommand = [
    `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
    `cl /nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS ${quote(oracleSourcePath)} /I${quote(includePath)} ${quote(importLibraryPath)} /Fo:${quote(objectPath)} /Fe:${quote(capabilityOraclePath)}`,
  ].join(' && ');
  run(compileCommand, [], { shell: true });
  compiler = 'MSVC x64 + nvcc PTX';
  toolkit = manifest.toolkit;
  build = { nvccCommand, compileCommand };
} else {
  const compilerExecutable = process.env.CC ?? 'cc';
  const toolkitRoot = '/usr/local/cuda-13.3';
  const includePath = path.join(toolkitRoot, 'targets', 'x86_64-linux', 'include');
  const nvccPath = path.join(toolkitRoot, 'bin', 'nvcc');
  manifestRelative = 'schemas/cuda-13.3/linux-x64/generated/compatibility-manifest.json';
  const manifestPath = path.join(repositoryRoot, manifestRelative);
  const driverProfile = resolveLinuxNativeProfile();
  for (const required of [nvccPath, path.join(includePath, 'cuda.h'), driverProfile.driverPath, manifestPath, capabilitySourcePath, oracleSourcePath]) assert(existsSync(required), `Required F5L capability input is missing: ${required}`);
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.exactIdentity.headerSha256);
  const nvccVersion = run(nvccPath, ['--version']).trim();
  assert.match(nvccVersion, /release 13\.3,/u, 'F5L capability PTX must be compiled by CUDA 13.3 nvcc.');
  const nvccArgs = ['--ptx', '-arch=compute_75', '--std=c++17', '--fmad=false', '-x', 'cu', capabilitySourcePath, '-o', capabilityPtxPath];
  run(nvccPath, nvccArgs);
  const compileArgs = ['-std=c11', '-D_POSIX_C_SOURCE=200809L', '-O2', '-Wall', '-Wextra', '-Werror', oracleSourcePath, `-I${includePath}`, driverProfile.driverPath, `-Wl,-rpath,${path.dirname(driverProfile.driverPath)}`, '-o', capabilityOraclePath];
  compiler = `${run(compilerExecutable, ['--version']).split(/\r?\n/u)[0]} + nvcc PTX`;
  run(compilerExecutable, compileArgs);
  toolkit = { version: manifest.toolkitRelease, packageVersion: manifest.packageVersion, headerSha256: manifest.exactIdentity.headerSha256 };
  build = { nvcc: { executable: nvccPath, version: nvccVersion, sha256: await sha256(nvccPath), arguments: nvccArgs }, oracle: { executable: compilerExecutable, arguments: compileArgs }, driverSha256: await sha256(driverProfile.driverPath) };
}

const oracleText = run(capabilityOraclePath, [capabilityPtxPath]);
const oracle = parseOracle(oracleText);
assert.deepEqual(oracle.SCALAR_LAYOUT, [0, 8, 16, 20, 24, 32]);
assert.deepEqual(oracle.TYPE_LAYOUT, [4, 4, 8, 8, 4, 4, 4, 4, 8, 8]);
assert.deepEqual(oracle.DELAY_FIRST_QUERY, [600]);
assert.equal(oracle.DELAY_RESULT[0], 0xc001d00d);
assert.deepEqual(oracle.ASYNC_TRANSFER, [3, 5, 7, 11]);
assert.deepEqual(oracle.MAILBOX_PUBLICATION, [41, 42]);
assert.deepEqual(oracle.MAILBOX_UNREGISTER, [0]);
for (const key of ['EVENT_DESTROY', 'FREE_TRANSFER_COPY', 'FREE_TRANSFER', 'FREE_TRANSFER_OUTPUT', 'FREE_TRANSFER_INPUT', 'FREE_OUTPUT', 'MODULE_UNLOAD', 'STREAM_DESTROY', 'CONTEXT_DESTROY']) assert.deepEqual(oracle[key], [0]);

const sources = [
  'docs/specs/SPEC-0011-scalar-kernel-arguments.md',
  'docs/specs/SPEC-0016-operation-lifecycle.md',
  'conformance/f5/fixtures/native-capabilities.cu.txt',
  oracleSourceRelative,
  manifestRelative,
];
await writeFile(path.join(evidenceRoot, 'capability-oracle-build.json'), `${JSON.stringify({
  schemaVersion: 1,
  workPackage: 'NQ-SCALAR/NQ-OPERATION/NQ-TRANSFER/NQ-MAILBOX',
  capsule: 'independent-native-driver-scalar-operation-transfer-mailbox-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, kernel: os.release(), osVersion: os.version(), compiler, toolkit },
  sources: await sourceIdentity(sources),
  build,
  artifacts: { oracle: { sha256: await sha256(capabilityOraclePath) }, ptx: { sha256: await sha256(capabilityPtxPath) } },
  oracle,
  claimLimits: [
    `Exact ${nativeProfile} x64 Node 26.7.0 / CUDA 13.3 / compute_75 input profile only.`,
    'The delayed kernel establishes event not-ready behavior within a bounded timeout; it is not a latency or performance claim.',
    'Linux evidence remains unqualified until the complete exact Ubuntu chain is reviewed and promoted.',
  ],
}, null, 2)}\n`);
await writeFile(oracleTextPath, oracleText);
console.log(`F5${nativeProfile === 'windows' ? 'W' : 'L'} native capability oracle passed: mixed scalar ABI, delayed event, transfer, and mailbox parity established.`);
