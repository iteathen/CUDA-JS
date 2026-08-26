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
assert.equal(projectPackage.dependencies.acorn, '8.15.0');
assert.equal(Object.hasOwn(projectPackage.exports, './cuda-target'), false);
const packed = JSON.parse(runNpm(['pack', '--json', '--pack-destination', packageRoot], repositoryRoot));
assert.equal(packed.length, 1);
const packageRecord = packed[0];
assert.equal(packageRecord.name, 'cuda-js');
assert.equal(packageRecord.version, projectPackage.version);
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
  'components/device-js/index.mjs',
  'components/device-selection/index.mjs',
  'components/device-selection/src/device-selection.mjs',
  'components/device-js/src/strict-translator.mjs',
  'components/cuda-target/index.mjs',
  'components/cuda-target/component.yaml',
  'components/execution/src/numeric-abi.mjs',
  'components/prepared-execution/index.mjs',
  'components/publication-mailbox/index.mjs',
  'components/memory/src/device-view-manager.mjs',
  'components/runtime-facade/index.mjs',
  'components/runtime-facade/testing.mjs',
  'components/runtime-facade/compatibility.mjs',
  'components/runtime-facade/src/device-program.mjs',
  'packaging/compatibility-manifest.json',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'schemas/cuda-13.3/linux-x64/generated/packers.mjs',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
]) assert(fileNames.includes(required), `Package is missing ${required}`);

const projectLicense = await readFile(path.join(repositoryRoot, 'LICENSE'), 'utf8');
assert(projectLicense.includes('GNU AFFERO GENERAL PUBLIC LICENSE'));

const deletionNeedles = ['cuda-mcgs', 'umcgs', 'graph-search', 'minimax', 'search ir'];
const implementationFiles = fileNames.filter((name) => name.startsWith('components/runtime-facade/') || name.startsWith('components/device-js/') || name.startsWith('components/device-selection/') || name.startsWith('components/prepared-execution/') || name.startsWith('components/execution/') || name === 'packaging/compatibility-manifest.json');
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

const memoryObservation = observations.find((entry) => entry.consumer === 'portable-memory');
assert(memoryObservation);
assert.deepEqual(memoryObservation.scalarKinds, ['u64', 'i32', 'f32', 'f64', 'f16', 'bf16']);
assert.equal(memoryObservation.asyncTransferLifecycle, true);
assert.equal(memoryObservation.publicationMailboxLifecycle, true);
assert.equal(memoryObservation.preparedOperationDagLifecycle, true);
assert.equal(memoryObservation.deviceSelectionLifecycle, true);
const compilerObservation = observations.find((entry) => entry.consumer === 'portable-compiler');
assert(compilerObservation);
for (const field of ['ptx', 'rdc', 'ltoIr', 'ltoCubin', 'cubin', 'deviceJs', 'deviceJsProgram', 'devicePublication']) assert.match(compilerObservation[field], /^[a-f0-9]{64}$/);
assert.deepEqual(compilerObservation.deviceJsParser, { name: 'acorn', version: '8.15.0' });

const target = await writeEvidence('portable-package.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F8',
  capsule: 'portable-package-install-independent-consumers',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, profileName },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0008-package-public-facade.md',
    'docs/specs/SPEC-0013-restricted-device-js.md',
    'docs/specs/SPEC-0017-device-selection-and-target-resolution.md',
    'docs/specs/SPEC-0013-public-surface-addendum.md',
    'docs/specs/SPEC-0022-device-publication-addendum.md',
    'docs/specs/SPEC-0021-extended-numeric-abi-and-device-views.md',
    'docs/specs/SPEC-0019-host-memory-and-async-transfer.md',
    'docs/specs/SPEC-0014-long-lived-sideband.md',
    'docs/specs/SPEC-0020-prepared-batch-and-graph-execution.md',
    'LICENSE',
    'LICENSING.md',
    'package.json',
    'packaging/compatibility-manifest.json',
    'components/execution/src/numeric-abi.mjs',
    'components/execution/src/execution-manager.mjs',
    'components/prepared-execution/src/prepared-operation-dag.mjs',
    'components/memory/src/device-view-manager.mjs',
    'components/publication-mailbox/src/publication-mailbox-manager.mjs',
    'components/device-js/src/strict-translator.mjs',
    'components/device-selection/src/device-selection.mjs',
    'components/runtime-facade/src/runtime.mjs',
    'components/runtime-facade/src/device-program.mjs',
    'conformance/f8/fixtures/consumer-memory.mjs',
    'conformance/f8/fixtures/consumer-compiler.mjs',
    'conformance/f8/run-portable.mjs',
  ]),
  package: { name: packageRecord.name, version: packageRecord.version, license: projectPackage.license, filename: packageRecord.filename, sha256: await sha256(tarball), files: fileNames.length, unpackedSize: packageRecord.unpackedSize },
  observations: { consumers: observations, firstConsumerDeletion: true, secondInstance: true, installed: fixtureNames.length, uninstalled: fixtureNames.length },
  claimLimits: [
    'Portable package, public facade, SPEC-0014 mailbox lifecycle, SPEC-0017 selection/target orchestration, SPEC-0019 transfer lifecycle, SPEC-0020 semantic prepared-DAG replay, SPEC-0021 scalar/view behavior, Device-JS translation including device-publication source admission, mock lifecycle, and install/uninstall behavior only.',
    'Prepared operation DAG evidence covers immutable kernel-only semantic single-stream replay, not CUDA Graph realization or performance.',
    'RDC, extended scalar ABI, Device LTO, Device-JS, SPEC-0016 operations, SPEC-0017 native selection, and typed device-view native consumers remain subject to their exact native promotion gates.',
    'No native CUDA, Linux CUDA, performance, strict-JIT, process-isolation, or registry-release claim.',
  ],
});
console.log(`F8 portable package conformance passed for ${packageRecord.name}@${packageRecord.version}; evidence: ${target}`);
