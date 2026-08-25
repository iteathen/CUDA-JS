import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  capabilityOraclePath,
  capabilityPtxPath,
  capabilitySourcePath,
  evidenceRoot,
  nativeRoot,
  parseOracle,
  repositoryRoot,
  sha256,
  sourceIdentity,
} from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F5 native capability build requires Windows.');
assert.equal(process.arch, 'x64', 'F5 native capability build requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F5 native capability build requires official Node v26.7.0.');

function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`Command failed (${result.status}): ${executable} ${args.join(' ')}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}

const toolkitRoot = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
const includePath = path.join(toolkitRoot, 'include');
const importLibraryPath = path.join(toolkitRoot, 'lib', 'x64', 'cuda.lib');
const nvccPath = path.join(toolkitRoot, 'bin', 'nvcc.exe');
const manifestPath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'win-x64', 'compatibility-manifest.json');
const oracleSourcePath = path.join(repositoryRoot, 'conformance', 'f5', 'native', 'windows-capability-oracle.c');
const objectPath = path.join(nativeRoot, 'windows-capability-oracle.obj');
const oracleTextPath = path.join(evidenceRoot, 'capability-oracle.txt');
const vsDevCmd = [
  process.env.VSDEVCMD,
  'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
].filter(Boolean).find((candidate) => existsSync(candidate));

assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
for (const required of [nvccPath, path.join(includePath, 'cuda.h'), importLibraryPath, manifestPath, capabilitySourcePath, oracleSourcePath]) {
  assert(existsSync(required), `Required F5 native capability input is missing: ${required}`);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.equal(await sha256(path.join(includePath, 'cuda.h')), manifest.toolkit.headerSha256);
assert.equal(await sha256(importLibraryPath), manifest.toolkit.importLibrarySha256);

await mkdir(nativeRoot, { recursive: true });
await mkdir(evidenceRoot, { recursive: true });
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
  'conformance/f5/native/windows-capability-oracle.c',
  'schemas/cuda-13.3/win-x64/compatibility-manifest.json',
];
await writeFile(path.join(evidenceRoot, 'capability-oracle-build.json'), `${JSON.stringify({
  schemaVersion: 1,
  workPackage: 'NQ-SCALAR/NQ-OPERATION/NQ-TRANSFER/NQ-MAILBOX',
  capsule: 'independent-msvc-driver-scalar-operation-transfer-mailbox-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, osVersion: os.version(), compiler: 'MSVC x64 + nvcc PTX', toolkit: manifest.toolkit },
  sources: await sourceIdentity(sources),
  artifacts: {
    oracle: { sha256: await sha256(capabilityOraclePath) },
    ptx: { sha256: await sha256(capabilityPtxPath) },
  },
  oracle,
  claimLimits: [
    'Exact Windows x64 Node 26.7.0 / CUDA 13.3 / compute_75 profile only.',
    'The delayed kernel is bounded below the current WDDM watchdog and establishes event not-ready behavior, not performance.',
  ],
}, null, 2)}\n`);
await writeFile(oracleTextPath, oracleText);
console.log('F5 native capability oracle passed: mixed scalar ABI parity and delayed event not-ready evidence established.');
