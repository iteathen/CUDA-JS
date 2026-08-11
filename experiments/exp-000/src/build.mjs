import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  buildRoot,
  evidenceRoot,
  experimentRoot,
  generatedRoot,
  nativeLibraryPath,
  nativeRoot,
  oraclePath,
  repositoryRoot,
  runtimeIrPath,
} from './paths.mjs';
import { parseOracleOutput, sha256 } from './evidence.mjs';

function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    ...options,
  });
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
  const result = spawnSync(command, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    shell: true,
  });
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

function quote(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
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

function runWindowsBuild() {
  const vsDevCmd = resolveVsDevCmd();
  if (!vsDevCmd) {
    throw new Error('MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
  }

  const source = path.join(generatedRoot, 'synthetic_abi.c');
  const oracleSource = path.join(generatedRoot, 'oracle.c');
  const object = path.join(nativeRoot, 'synthetic_abi.obj');
  const importLibrary = path.join(nativeRoot, 'synthetic_abi.lib');
  const oracleObject = path.join(nativeRoot, 'oracle.obj');
  const common = '/nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS';
  const libraryCommand = [
    `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
    `cl ${common} /LD ${quote(source)} /Fo:${quote(object)} /link /OUT:${quote(nativeLibraryPath)} /IMPLIB:${quote(importLibrary)}`,
  ].join(' && ');
  runShell(libraryCommand);

  const oracleCommand = [
    `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
    `cl ${common} ${quote(oracleSource)} ${quote(importLibrary)} /Fo:${quote(oracleObject)} /Fe:${quote(oraclePath)}`,
  ].join(' && ');
  runShell(oracleCommand);

  const versionCommand = [
    `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
    'cl 2>&1',
  ].join(' && ');
  const versionResult = runShell(versionCommand);
  const version = `${versionResult.stdout}\n${versionResult.stderr}`.trim();
  return {
    compiler: 'msvc',
    compilerVersion: version.split(/\r?\n/)[0],
    commands: [libraryCommand, oracleCommand],
  };
}

function runPosixBuild() {
  const compiler = process.env.CC ?? 'cc';
  const source = path.join(generatedRoot, 'synthetic_abi.c');
  const oracleSource = path.join(generatedRoot, 'oracle.c');
  const libraryArguments = ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', '-fPIC', '-shared', source, '-o', nativeLibraryPath];
  const oracleArguments = [
    '-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', oracleSource,
    '-L', nativeRoot, '-lsynthetic_abi', '-Wl,-rpath,$ORIGIN', '-o', oraclePath,
  ];
  run(compiler, libraryArguments);
  run(compiler, oracleArguments);
  const version = run(compiler, ['--version']).stdout.trim().split(/\r?\n/)[0];
  return {
    compiler,
    compilerVersion: version,
    commands: [
      `${compiler} ${libraryArguments.join(' ')}`,
      `${compiler} ${oracleArguments.join(' ')}`,
    ],
  };
}

await mkdir(nativeRoot, { recursive: true });
await mkdir(evidenceRoot, { recursive: true });

run(process.execPath, [path.join(experimentRoot, 'src', 'generate.mjs')]);
const compilerEvidence = process.platform === 'win32' ? runWindowsBuild() : runPosixBuild();
const oracleRun = run(oraclePath, [], { cwd: nativeRoot });
const oracle = parseOracleOutput(oracleRun.stdout);
const runtimeIr = JSON.parse(await readFile(runtimeIrPath, 'utf8'));

const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-000',
  claim: 'build-and-direct-c-oracle-only',
  generatedAt: new Date().toISOString(),
  sourceIdentity: runtimeIr.sourceIdentity,
  schemaSha256: runtimeIr.schemaSha256,
  generatorSha256: runtimeIr.generatorSha256,
  node: {
    executable: process.execPath,
    version: process.version,
    flags: process.execArgv,
    executableSha256: await sha256(process.execPath),
  },
  platform: {
    platform: process.platform,
    architecture: process.arch,
    release: os.release(),
    type: os.type(),
    endianness: os.endianness(),
  },
  compiler: compilerEvidence,
  artifacts: {
    library: {
      path: path.relative(repositoryRoot, nativeLibraryPath),
      sha256: await sha256(nativeLibraryPath),
    },
    oracle: {
      path: path.relative(repositoryRoot, oraclePath),
      sha256: await sha256(oraclePath),
    },
  },
  oracle,
  claimLimits: [
    'No CUDA behavior is exercised.',
    'Cross-platform support is not inferred.',
    'Build success does not qualify Fast FFI dispatch.',
  ],
};

await writeFile(path.join(evidenceRoot, 'build.json'), `${JSON.stringify(evidence, null, 2)}\n`);
await writeFile(path.join(evidenceRoot, 'oracle.txt'), oracleRun.stdout);
console.log(`built ${path.relative(repositoryRoot, nativeLibraryPath)}`);
console.log(`oracle ${path.relative(repositoryRoot, oraclePath)}`);
console.log(`evidence ${path.relative(repositoryRoot, path.join(evidenceRoot, 'build.json'))}`);
