import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  capabilityArtifacts,
  capabilityOraclePath,
  capabilityRoot,
  capabilitySources,
  evidenceRoot,
  repositoryRoot,
  sha256,
  sourceIdentity,
} from './evidence.mjs';

assert.equal(process.platform, 'win32');
assert.equal(process.arch, 'x64');
assert.equal(process.version, 'v26.7.0');

function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`Command failed (${result.status}): ${executable} ${args.join(' ')}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}
function parse(text) {
  return Object.fromEntries(text.trim().split(/\r?\n/u).map((line) => {
    const separator = line.indexOf('=');
    assert(separator > 0, `Invalid oracle line: ${line}`);
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
}

const toolkitRoot = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
const includePath = path.join(toolkitRoot, 'include');
const libraryPath = path.join(toolkitRoot, 'lib', 'x64');
const binaryPath = path.join(toolkitRoot, 'bin', 'x64');
const manifestPath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'win-x64', 'compiler-provider-manifest.json');
const oracleSourcePath = path.join(repositoryRoot, 'conformance', 'f6', 'native', 'windows-capability-compiler-oracle.c');
const objectPath = path.join(capabilityRoot, 'windows-capability-compiler-oracle.obj');
const oracleTextPath = path.join(evidenceRoot, 'capability-oracle.txt');
const vsDevCmd = [
  process.env.VSDEVCMD,
  'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
].filter(Boolean).find((candidate) => existsSync(candidate));

assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
for (const required of [manifestPath, oracleSourcePath, ...Object.values(capabilitySources), path.join(includePath, 'nvrtc.h'), path.join(includePath, 'nvJitLink.h'), path.join(libraryPath, 'nvrtc.lib'), path.join(libraryPath, 'nvJitLink.lib')]) {
  assert(existsSync(required), `Required F6 capability input is missing: ${required}`);
}
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
assert.equal(await sha256(path.join(includePath, 'nvrtc.h')), manifest.headers['nvrtc.h']);
assert.equal(await sha256(path.join(includePath, 'nvJitLink.h')), manifest.headers['nvJitLink.h']);
for (const provider of Object.values(manifest.providers)) {
  const providerPath = path.join(binaryPath, provider.file);
  assert(existsSync(providerPath), `Compiler provider is missing: ${providerPath}`);
  assert.equal((await readFile(providerPath)).byteLength, provider.byteLength);
  assert.equal(await sha256(providerPath), provider.sha256);
}

await mkdir(capabilityRoot, { recursive: true });
await mkdir(evidenceRoot, { recursive: true });
const compileCommand = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  `cl /nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS ${quote(oracleSourcePath)} /I${quote(includePath)} ${quote(path.join(libraryPath, 'cuda.lib'))} ${quote(path.join(libraryPath, 'nvrtc.lib'))} ${quote(path.join(libraryPath, 'nvJitLink.lib'))} /Fo:${quote(objectPath)} /Fe:${quote(capabilityOraclePath)}`,
].join(' && ');
run(compileCommand, [], { shell: true });
const oracleText = run(capabilityOraclePath, [
  capabilitySources.rdcKernel, capabilitySources.rdcDevice, capabilitySources.ltoKernel, capabilitySources.ltoDevice,
  capabilityArtifacts.rdcKernel, capabilityArtifacts.rdcDevice, capabilityArtifacts.rdcCubin,
  capabilityArtifacts.ltoKernel, capabilityArtifacts.ltoDevice, capabilityArtifacts.ltoCubin,
  capabilityArtifacts.rdcOutput, capabilityArtifacts.ltoOutput,
], { env: { ...process.env, PATH: `${binaryPath};${process.env.PATH ?? ''}` } });
const oracle = parse(oracleText);
assert.equal(oracle.NVRTC_VERSION, '13.3');
assert.equal(oracle.NVJITLINK_VERSION, '13.3');
assert.equal(oracle.PROGRAMS_CREATED, '4');
assert.equal(oracle.PROGRAMS_DESTROYED, '4');
assert.equal(oracle.LINKS_CREATED, '2');
assert.equal(oracle.LINKS_DESTROYED, '2');
assert.equal(oracle.DRIVER_OUTPUT_BYTES, '256');
assert.equal(oracle.DRIVER_CLEANUP, 'proved');

const sources = [
  'docs/specs/SPEC-0010-relocatable-device-code.md',
  'docs/specs/SPEC-0012-device-lto.md',
  'conformance/f6/native/windows-capability-compiler-oracle.c',
  'conformance/f6/fixtures/rdc-kernel.cu.txt',
  'conformance/f6/fixtures/rdc-device.cu.txt',
  'conformance/f6/fixtures/lto-kernel.cu.txt',
  'conformance/f6/fixtures/lto-device.cu.txt',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
];
const artifacts = Object.fromEntries(await Promise.all(Object.entries(capabilityArtifacts).map(async ([name, file]) => [name, { byteLength: (await readFile(file)).byteLength, sha256: await sha256(file) }])));
await writeFile(path.join(evidenceRoot, 'capability-oracle-build.json'), `${JSON.stringify({
  schemaVersion: 1,
  workPackage: 'NQ-RDC/NQ-LTO',
  capsule: 'independent-msvc-nvrtc-nvjitlink-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, osVersion: os.version(), compiler: 'MSVC x64', providerProfile: manifest.profile },
  sources: await sourceIdentity(sources),
  artifacts,
  oracle,
  claimLimits: ['Exact Windows x64 Node 26.7.0 / CUDA 13.3 / compute_75 profile only.', 'Artifact equality is deterministic qualification evidence, not a cross-provider reproducibility claim.', 'No LTO performance claim.'],
}, null, 2)}\n`);
await writeFile(oracleTextPath, oracleText);
console.log('F6 native capability oracle passed: two RDC PTX units and two LTO-IR units linked with balanced native resources.');
