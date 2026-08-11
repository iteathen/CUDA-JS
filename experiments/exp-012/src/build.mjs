import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { parseLayoutProbe, parseOracle, sha256 } from './evidence.mjs';
import {
  compatibilityManifestPath,
  driverPath,
  evidenceRoot,
  nativeProbeExecutablePath,
  nativeProbeSourcePath,
  nativeRoot,
  oracleExecutablePath,
  oracleSourcePath,
  repositoryRoot,
  sharedGeneratedRoot,
  toolkitImportLibraryPath,
  toolkitIncludePath,
  toolkitRoot,
  toolkitVersionPath,
} from './paths.mjs';

assert.equal(process.platform, 'win32', 'EXP-012 build requires Windows.');
assert.equal(process.arch, 'x64', 'EXP-012 build requires Windows x64.');

function quote(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error([
      `Command failed (${result.status}): ${executable} ${args.join(' ')}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function runShell(command) {
  const result = spawnSync(command, { cwd: repositoryRoot, encoding: 'utf8', shell: true });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error([
      `Command failed (${result.status}): ${command}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function resolveVsDevCmd() {
  const candidates = [
    process.env.VSDEVCMD,
    'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
    'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

for (const requiredPath of [
  compatibilityManifestPath,
  driverPath,
  nativeProbeSourcePath,
  oracleSourcePath,
  toolkitImportLibraryPath,
  toolkitVersionPath,
]) {
  assert(existsSync(requiredPath), `Required EXP-012 input is missing: ${requiredPath}`);
}

const manifest = JSON.parse(await readFile(compatibilityManifestPath, 'utf8'));
const runtimeIrPath = path.join(sharedGeneratedRoot, 'runtime-ir.json');
const ffiDefinitionsPath = path.join(sharedGeneratedRoot, 'ffi-definitions.mjs');
const packersPath = path.join(sharedGeneratedRoot, 'packers.mjs');
const runtimeIr = JSON.parse(await readFile(runtimeIrPath, 'utf8'));
const toolkitVersion = JSON.parse(await readFile(toolkitVersionPath, 'utf8'));
const cudaHeaderPath = path.join(toolkitIncludePath, 'cuda.h');
const cudaTypedefsPath = path.join(toolkitIncludePath, 'cudaTypedefs.h');
assert.equal(await sha256(cudaHeaderPath), manifest.toolkit.headerSha256, 'Windows cuda.h identity differs from accepted F1B facts.');
assert.equal(await sha256(cudaTypedefsPath), manifest.toolkit.typedefHeaderSha256, 'Windows cudaTypedefs.h identity mismatch.');
assert.equal(await sha256(toolkitImportLibraryPath), manifest.toolkit.importLibrarySha256, 'Windows CUDA import library identity mismatch.');
assert.equal(toolkitVersion.cuda.version, manifest.toolkit.rootVersion, 'CUDA toolkit root version mismatch.');
assert.equal(toolkitVersion.cuda_cudart.version, manifest.toolkit.cudartVersion, 'CUDA cudart version mismatch.');
assert.equal(toolkitVersion.cuda_nvcc.version, manifest.toolkit.nvccVersion, 'CUDA compiler version mismatch.');

const vsDevCmd = resolveVsDevCmd();
assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
await mkdir(nativeRoot, { recursive: true });
await mkdir(evidenceRoot, { recursive: true });

const common = '/nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS';
const probeObjectPath = path.join(nativeRoot, 'cuda-native-abi-probe.obj');
const oracleObjectPath = path.join(nativeRoot, 'cuda-driver-oracle.obj');
const probeCommand = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  `cl ${common} ${quote(nativeProbeSourcePath)} /I${quote(toolkitIncludePath)} /Fo:${quote(probeObjectPath)} /Fe:${quote(nativeProbeExecutablePath)}`,
].join(' && ');
runShell(probeCommand);
const probeRun = run(nativeProbeExecutablePath, []);
const observedAbi = parseLayoutProbe(probeRun.stdout);
assert.deepEqual(observedAbi.target, { pointerSize: 8, sizeSize: 8, littleEndian: true });
assert.deepEqual(observedAbi.layouts, manifest.layouts, 'Windows native ABI probe differs from the committed compatibility manifest.');
assert.equal(Object.keys(observedAbi.functions).length, Object.keys(runtimeIr.functions).length, 'Windows native ABI probe must cover every selected function.');
for (const [publicName, functionFact] of Object.entries(runtimeIr.functions)) {
  assert.deepEqual(observedAbi.functions[publicName], { nativeSymbol: functionFact.nativeSymbol, pointerSize: 8 });
}

const oracleCommand = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  `cl ${common} ${quote(oracleSourcePath)} /I${quote(toolkitIncludePath)} ${quote(toolkitImportLibraryPath)} /Fo:${quote(oracleObjectPath)} /Fe:${quote(oracleExecutablePath)}`,
].join(' && ');
runShell(oracleCommand);
const oracleRun = run(oracleExecutablePath, []);
const oracle = parseOracle(oracleRun.stdout);

const versionCommand = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  'cl 2>&1',
].join(' && ');
const compilerVersion = `${runShell(versionCommand).stdout}`.trim().split(/\r?\n/)[0];
const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-012',
  capsule: 'build-and-independent-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  node: {
    executable: process.execPath,
    version: process.version,
    flags: process.execArgv,
    sha256: await sha256(process.execPath),
  },
  platform: {
    platform: process.platform,
    architecture: process.arch,
    type: os.type(),
    release: os.release(),
    endianness: os.endianness(),
  },
  compiler: { command: 'cl', version: compilerVersion },
  toolkit: {
    root: toolkitRoot,
    version: toolkitVersion.cuda.version,
    cudartVersion: toolkitVersion.cuda_cudart.version,
    nvccVersion: toolkitVersion.cuda_nvcc.version,
    headerSha256: await sha256(cudaHeaderPath),
    typedefHeaderSha256: await sha256(cudaTypedefsPath),
    importLibrarySha256: await sha256(toolkitImportLibraryPath),
    versionManifestSha256: await sha256(toolkitVersionPath),
  },
  driver: {
    path: driverPath,
    sha256: await sha256(driverPath),
  },
  inputs: {
    compatibilityManifestSha256: await sha256(compatibilityManifestPath),
    runtimeIrSha256: await sha256(runtimeIrPath),
    ffiDefinitionsSha256: await sha256(ffiDefinitionsPath),
    packersSha256: await sha256(packersPath),
    nativeProbeSourceSha256: await sha256(nativeProbeSourcePath),
    oracleSourceSha256: await sha256(oracleSourcePath),
  },
  artifacts: {
    nativeProbe: { path: nativeProbeExecutablePath, sha256: await sha256(nativeProbeExecutablePath) },
    oracle: { path: oracleExecutablePath, sha256: await sha256(oracleExecutablePath) },
  },
  observedAbi,
  oracle,
  commands: { probe: probeCommand, oracle: oracleCommand },
  claimLimits: [
    'Exact Windows x64 profile only.',
    'No Linux support inference.',
    'No production DriverActor, memory, module, launch, completion, compiler, Fast FFI, performance, or packaging claim.',
  ],
};

await writeFile(path.join(evidenceRoot, 'native-abi-probe.txt'), probeRun.stdout);
await writeFile(path.join(evidenceRoot, 'oracle.txt'), oracleRun.stdout);
await writeFile(path.join(evidenceRoot, 'build.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`EXP-012 build/oracle passed: ${path.relative(repositoryRoot, path.join(evidenceRoot, 'build.json'))}`);
