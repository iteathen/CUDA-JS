import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { resolveLinuxNativeProfile } from '../../components/compiler-actor/src/backends/native-profiles.mjs';
import {
  digestBytes,
  oracleCubinPath,
  oraclePtxPath,
  oracleRoot,
  repositoryRoot,
  sourceIdentity,
  sourcePath,
  writeEvidence,
} from './evidence.mjs';

assert.equal(process.platform, 'linux', 'The F6L independent compiler oracle requires native Linux.');
assert.equal(process.arch, 'x64', 'The F6L independent compiler oracle requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'The F6L independent compiler oracle requires official Node v26.7.0.');

const compiler = process.env.CC ?? 'cc';
const oracleSource = path.join(repositoryRoot, 'experiments', 'exp-009', 'native', 'compiler-oracle.c');
const oracleExecutable = path.join(oracleRoot, 'linux-compiler-oracle');
const toolkitRoot = '/usr/local/cuda-13.3';
const targetRoot = path.join(toolkitRoot, 'targets', 'x86_64-linux');
const includeDirectory = path.join(targetRoot, 'include');
const libraryDirectory = path.join(targetRoot, 'lib');

function run(executable, args) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error([`command failed (${result.status}): ${executable}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

const profile = await resolveLinuxNativeProfile();
for (const required of [oracleSource, sourcePath, profile.nvrtcPath, profile.nvJitLinkPath]) {
  assert(existsSync(required), `missing exact F6L input: ${path.basename(required)}`);
}
await mkdir(oracleRoot, { recursive: true });
const compileArguments = [
  '-std=c11',
  '-O2',
  '-Wall',
  '-Wextra',
  '-Werror',
  oracleSource,
  `-I${includeDirectory}`,
  `-L${libraryDirectory}`,
  `-Wl,-rpath,${libraryDirectory}`,
  '-Wl,--no-as-needed',
  '-lnvrtc',
  '-lnvJitLink',
  '-o',
  oracleExecutable,
];
const compilerVersion = run(compiler, ['--version']).stdout.split(/\r?\n/u)[0];
run(compiler, compileArguments);
const oracle = run(oracleExecutable, [sourcePath, oraclePtxPath, oracleCubinPath]);
const ptx = await readFile(oraclePtxPath);
const cubin = await readFile(oracleCubinPath);

await writeEvidence('native-linux-oracle.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F6L',
  capsule: 'native-linux-independent-compiler-oracle',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    nodeAbi: process.versions.modules,
    platform: process.platform,
    architecture: process.arch,
    kernel: os.release(),
    osVersion: os.version(),
    compiler: compilerVersion,
  },
  providerProfile: profile.manifest.profile,
  sources: await sourceIdentity([
    'experiments/exp-009/native/compiler-oracle.c',
    'experiments/exp-009/fixtures/vector-add.cu.txt',
    'schemas/cuda-13.3/linux-x64/compiler-provider-manifest.json',
  ]),
  build: {
    executable: compiler,
    arguments: compileArguments,
  },
  oracle: {
    stdout: oracle.stdout.trim().split(/\r?\n/u),
    ptx: { byteLength: ptx.byteLength, sha256: digestBytes(ptx) },
    cubin: { byteLength: cubin.byteLength, sha256: digestBytes(cubin) },
  },
  claimLimits: [
    'Exact native Linux x86-64 Node 26.7.0 and manifest-pinned CUDA 13.3 compiler-provider profile only.',
    'Independent compiler/linker parity input only; no Driver, GPU, package, performance, or support claim.',
  ],
});

console.log(`F6L independent compiler oracle passed: PTX ${digestBytes(ptx)}, cubin ${digestBytes(cubin)}.`);
