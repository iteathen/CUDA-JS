import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { parseLayoutProbe, sha256 } from '../../exp-012/src/evidence.mjs';
import {
  buildRoot,
  evidenceRoot,
  extractedRoot,
  includeRoot,
  inputRoot,
  nativeLayoutsPath,
  nativeProbeExecutablePath,
  nativeProbeSourcePath,
  nativeRoot,
  oracleExecutablePath,
  oracleSourcePath,
  profilePath,
  repositoryRoot,
  runtimeIrPath,
  stubLibraryRoot,
} from './paths.mjs';

assert.equal(process.platform, 'linux', 'EXP-001 preparation requires Linux.');
assert.equal(process.arch, 'x64', 'EXP-001 preparation requires Linux x64.');

function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error([`Command failed (${result.status}): ${executable} ${args.join(' ')}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  }
  return { stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function assertBuildOwned(target) {
  const relative = path.relative(buildRoot, target);
  assert(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Refusing to replace non-build path: ${target}`);
}

async function acquire(profile) {
  mkdirSync(inputRoot, { recursive: true });
  for (const packageEntry of profile.packages) {
    const target = path.join(inputRoot, packageEntry.fileName);
    if (!existsSync(target) || await sha256(target) !== packageEntry.sha256) {
      const response = await fetch(packageEntry.url);
      assert(response.ok, `Failed to download ${packageEntry.url}: ${response.status}`);
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
    }
    assert.equal(await sha256(target), packageEntry.sha256, `${packageEntry.fileName} identity mismatch.`);
  }
  assertBuildOwned(extractedRoot);
  rmSync(extractedRoot, { recursive: true, force: true });
  mkdirSync(extractedRoot, { recursive: true });
  for (const packageEntry of profile.packages) run('dpkg-deb', ['-x', path.join(inputRoot, packageEntry.fileName), extractedRoot]);
}

function normalizedExpectedLayouts(nativeLayouts) {
  return Object.fromEntries(Object.entries(nativeLayouts.types).map(([name, layout]) => [name, {
    size: layout.size,
    alignment: layout.alignment,
    fields: Object.fromEntries(layout.fields.map((field) => [field.name, field.offset])),
  }]));
}

const profile = JSON.parse(await readFile(profilePath, 'utf8'));
await acquire(profile);
mkdirSync(nativeRoot, { recursive: true });
mkdirSync(evidenceRoot, { recursive: true });
const compiler = process.env.CC ?? 'cc';
const common = ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror'];
run(compiler, [...common, nativeProbeSourcePath, '-I', includeRoot, '-o', nativeProbeExecutablePath]);
const probe = run(nativeProbeExecutablePath, []);
const observedAbi = parseLayoutProbe(probe.stdout);
const nativeLayouts = JSON.parse(await readFile(nativeLayoutsPath, 'utf8'));
assert.deepEqual(observedAbi.layouts, normalizedExpectedLayouts(nativeLayouts));
assert.deepEqual(observedAbi.functions, nativeLayouts.functions);
run(compiler, [
  ...common,
  oracleSourcePath,
  '-I', includeRoot,
  '-L', stubLibraryRoot,
  `-Wl,-rpath-link,${stubLibraryRoot}`,
  '-lcuda', '-ldl',
  '-o', oracleExecutablePath,
]);

const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-001',
  capsule: 'gpu-free-linux-source-abi-readiness',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  profile,
  node: { version: process.version, executable: process.execPath, sha256: await sha256(process.execPath) },
  platform: { platform: process.platform, architecture: process.arch, kernel: os.release(), glibc: process.report.getReport().header.glibcVersionRuntime },
  compiler: { command: compiler, version: run(compiler, ['--version']).stdout.trim().split(/\r?\n/)[0] },
  packages: await Promise.all(profile.packages.map(async (entry) => ({ ...entry, observedSha256: await sha256(path.join(inputRoot, entry.fileName)) }))),
  inputs: {
    profileSha256: await sha256(profilePath),
    headerSha256: await sha256(path.join(includeRoot, 'cuda.h')),
    nativeLayoutsSha256: await sha256(nativeLayoutsPath),
    runtimeIrSha256: await sha256(runtimeIrPath),
    probeSourceSha256: await sha256(nativeProbeSourcePath),
    oracleSourceSha256: await sha256(oracleSourcePath),
  },
  artifacts: {
    nativeProbeSha256: await sha256(nativeProbeExecutablePath),
    oracleSha256: await sha256(oracleExecutablePath),
  },
  observedAbi,
  claimLimits: [
    'The Linux source, official inputs, native ABI probe, and C oracle compile are ready.',
    'The oracle was not executed and no Driver/GPU support is claimed.',
    'A qualified native Linux NVIDIA Driver/GPU host must run the smoke capsule.',
  ],
};
await writeFile(path.join(evidenceRoot, 'native-abi-probe.txt'), probe.stdout);
await writeFile(path.join(evidenceRoot, 'build.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log('EXP-001 GPU-free preparation passed: official inputs verified, native ABI matched, and the Driver oracle compiled.');
