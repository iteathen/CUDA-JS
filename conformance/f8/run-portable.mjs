import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { consumersRoot, packageRoot, profileName, repositoryRoot, sha256, sourceIdentity, writeEvidence } from './evidence.mjs';

const node = process.env.CUDA_JS_F8_NODE ?? process.execPath;
const npmCli = process.env.CUDA_JS_F8_NPM_CLI;
assert.equal(process.version, 'v26.7.0', 'F8 portable package conformance requires exact Node v26.7.0.');
assert(npmCli && existsSync(npmCli), 'F8 portable package conformance requires the npm CLI selected by run-f8.');

function runNode(args, cwd) {
  const result = spawnSync(node, args, { cwd, encoding: 'utf8', env: { ...process.env, CUDA_JS_F8_NODE: node, CUDA_JS_F8_NPM_CLI: npmCli } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed (${result.status}): ${node} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

function runNpm(args, cwd) {
  return runNode([npmCli, ...args], cwd);
}

await rm(packageRoot, { recursive: true, force: true });
await rm(consumersRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });
await mkdir(consumersRoot, { recursive: true });

const projectPackage = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
assert.equal(projectPackage.license, 'AGPL-3.0-or-later');
const packed = JSON.parse(runNpm(['pack', '--json', '--pack-destination', packageRoot], repositoryRoot));
assert.equal(packed.length, 1);
const packageRecord = packed[0];
assert.equal(packageRecord.name, 'cuda-js');
assert.equal(packageRecord.version, '0.1.0-alpha.2');
const fileNames = packageRecord.files.map((entry) => entry.path).sort();
for (const name of fileNames) {
  assert(!name.startsWith('build/'));
  assert(!name.startsWith('conformance/'));
  assert(!name.startsWith('docs/'));
  assert(!name.startsWith('experiments/'));
  assert(!name.startsWith('third_party/'));
  assert(!name.startsWith('tools/'));
  assert(!/\.(?:dll|exe|node|so|dylib|ptx|cubin|fatbin)$/i.test(name));
}
for (const required of [
  'LICENSE',
  'LICENSING.md',
  'components/runtime-facade/index.mjs',
  'components/runtime-facade/testing.mjs',
  'components/runtime-facade/compatibility.mjs',
  'packaging/compatibility-manifest.json',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'schemas/cuda-13.3/linux-x64/generated/packers.mjs',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
]) assert(fileNames.includes(required), `Package is missing ${required}`);

const projectLicense = await readFile(path.join(repositoryRoot, 'LICENSE'), 'utf8');
assert(projectLicense.includes('GNU AFFERO GENERAL PUBLIC LICENSE'));

const deletionNeedles = ['cuda-mcgs', 'umcgs', 'graph-search', 'minimax', 'search ir'];
const implementationFiles = fileNames.filter((name) => name.startsWith('components/runtime-facade/') || name === 'packaging/compatibility-manifest.json');
for (const relative of implementationFiles) {
  const text = (await readFile(path.join(repositoryRoot, relative), 'utf8')).toLowerCase();
  for (const needle of deletionNeedles) assert(!text.includes(needle), `${relative} contains first-consumer coupling: ${needle}`);
}

const tarball = path.join(packageRoot, packageRecord.filename);
assert(existsSync(tarball));
const fixtureNames = ['consumer-memory.mjs', 'consumer-compiler.mjs'];
const observations = [];
for (const fixture of fixtureNames) {
  const consumerName = path.basename(fixture, '.mjs');
  const directory = path.join(consumersRoot, consumerName);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'package.json'), `${JSON.stringify({ name: `cuda-js-${consumerName}`, version: '1.0.0', private: true, type: 'module' }, null, 2)}\n`);
  await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', fixture), path.join(directory, 'consumer.mjs'));
  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball], directory);
  const installed = path.join(directory, 'node_modules', 'cuda-js');
  assert(existsSync(installed));
  const output = runNode(['consumer.mjs'], directory);
  const record = JSON.parse(output.split(/\r?\n/).at(-1));
  observations.push(record);
  runNpm(['uninstall', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', 'cuda-js'], directory);
  assert(!existsSync(installed), `${consumerName} uninstall left package files behind`);
}

const target = await writeEvidence('portable-package.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F8',
  capsule: 'portable-package-install-independent-consumers',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, profileName },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0008-package-public-facade.md',
    'LICENSE',
    'LICENSING.md',
    'package.json',
    'packaging/compatibility-manifest.json',
    'components/runtime-facade/src/runtime.mjs',
    'conformance/f8/run-portable.mjs',
  ]),
  package: { name: packageRecord.name, version: packageRecord.version, license: projectPackage.license, filename: packageRecord.filename, sha256: await sha256(tarball), files: fileNames.length, unpackedSize: packageRecord.unpackedSize },
  observations: { consumers: observations, firstConsumerDeletion: true, secondInstance: true, installed: fixtureNames.length, uninstalled: fixtureNames.length },
  claimLimits: ['Portable package, public facade, mock lifecycle, and install/uninstall behavior only.', 'No native CUDA, Linux CUDA, performance, strict-JIT, process-isolation, or registry-release claim.'],
});
console.log(`F8 portable package conformance passed for ${packageRecord.name}@${packageRecord.version}; evidence: ${target}`);
