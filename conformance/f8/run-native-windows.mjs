import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { consumersRoot, evidenceRoot, packageRoot, repositoryRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F8W native package conformance requires Windows.');
assert.equal(process.arch, 'x64', 'F8W native package conformance requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F8W native package conformance requires exact Node v26.7.0.');
const node = process.env.CUDA_JS_F8_NODE ?? process.execPath;
const npmCli = process.env.CUDA_JS_F8_NPM_CLI;
assert(npmCli && existsSync(npmCli), 'F8W native package conformance requires the selected npm CLI.');

function runNode(args, cwd) {
  const result = spawnSync(node, args, { cwd, encoding: 'utf8', env: { ...process.env, CUDA_JS_F8_NODE: node, CUDA_JS_F8_NPM_CLI: npmCli } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed (${result.status}): ${node} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable-package.json'), 'utf8'));
assert.equal(portable.status, 'pass');
const tarball = path.join(packageRoot, portable.package.filename);
assert(existsSync(tarball), 'Run F8 portable packaging before native package conformance.');
const directory = path.join(consumersRoot, 'consumer-native-windows');
await rm(directory, { recursive: true, force: true });
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, 'package.json'), `${JSON.stringify({ name: 'cuda-js-native-windows-consumer', version: '1.0.0', private: true, type: 'module' }, null, 2)}\n`);
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-windows.mjs'), path.join(directory, 'consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-device-js.mjs'), path.join(directory, 'device-js-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-multi-operation.mjs'), path.join(directory, 'multi-operation-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-mailbox.mjs'), path.join(directory, 'mailbox-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f5', 'fixtures', 'vector-add.ptx.txt'), path.join(directory, 'vector-add.ptx.txt'));
await cp(path.join(repositoryRoot, 'build', 'f5', 'win32-x64', 'native', 'native-capabilities.ptx'), path.join(directory, 'native-capabilities.ptx'));
runNode([npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball], directory);
const installed = path.join(directory, 'node_modules', 'cuda-js');
assert(existsSync(installed));
const output = runNode(['--experimental-ffi', 'consumer.mjs'], directory);
const observation = JSON.parse(output.split(/\r?\n/).at(-1));
assert.equal(observation.checksum, 15_600_773);
assert.equal(observation.graceful, true);
const deviceJsOutput = runNode(['--experimental-ffi', 'device-js-consumer.mjs'], directory);
const deviceJsObservation = JSON.parse(deviceJsOutput.split(/\r?\n/).at(-1));
assert.equal(deviceJsObservation.sourceOnly, true);
assert.equal(deviceJsObservation.structuredIntegerBitwise, true);
assert.equal(deviceJsObservation.dataDependentWhile, true);
assert.equal(deviceJsObservation.globalIndex, true);
assert.equal(deviceJsObservation.exactU64, 'ffffffffffffffff');
assert.deepEqual(deviceJsObservation.atomicBuckets, [16, 16, 16, 16]);
assert.equal(deviceJsObservation.atomicCasUniqueFlags, true);
assert.equal(deviceJsObservation.atomicRelaxedDeviceU32, true);
assert.equal(deviceJsObservation.atomicRelaxedDeviceU64, true);
assert.equal(deviceJsObservation.atomicPublicationDeviceU32, true);
assert.equal(deviceJsObservation.atomicPublicationDeviceU64, true);
assert.deepEqual(deviceJsObservation.atomicPublicationPayload, [0x89abcdef, 0x01234567, 0x76543210, 0xfedcba98]);
assert.equal(deviceJsObservation.runtimeProfile.device.attributes.computeCapabilityMajor, 7);
assert.equal(deviceJsObservation.runtimeProfile.device.attributes.computeCapabilityMinor, 5);
assert.equal(deviceJsObservation.runtimeProfile.compiler.provider.profile, 'cuda-13.3-windows-x64-compiler');
assert.equal(deviceJsObservation.rejectionBeforeCompilerResources, true);
assert.equal(deviceJsObservation.graceful, true);
const multiOperationOutput = runNode(['--experimental-ffi', 'multi-operation-consumer.mjs'], directory);
const multiOperationObservation = JSON.parse(multiOperationOutput.split(/\r?\n/).at(-1));
assert.equal(multiOperationObservation.producerPendingAfterObserver, true);
assert.deepEqual(multiOperationObservation.observedWords, [1]);
assert.deepEqual(multiOperationObservation.transferBytes, [3, 5, 7, 11]);
assert.equal(multiOperationObservation.graceful, true);
const mailboxOutput = runNode(['--experimental-ffi', 'mailbox-consumer.mjs'], directory);
const mailboxObservation = JSON.parse(mailboxOutput.split(/\r?\n/).at(-1));
assert.equal(mailboxObservation.firstPending, true);
assert.equal(mailboxObservation.applicationTimerFired, true);
assert.equal(mailboxObservation.published, 41);
assert.equal(mailboxObservation.observed, 42);
assert.equal(mailboxObservation.opaque, true);
assert.equal(mailboxObservation.graceful, true);
runNode([npmCli, 'uninstall', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', 'cuda-js'], directory);
assert(!existsSync(installed));

const target = await writeEvidence('native-windows-package.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F8W',
  capsule: 'installed-package-native-windows-vector-device-js-device-publication-operation-transfer-mailbox-consumers',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0008-package-public-facade.md',
    'docs/specs/SPEC-0013-restricted-device-js.md',
    'docs/specs/SPEC-0013-public-surface-addendum.md',
    'docs/specs/SPEC-0022-scoped-atomic-observation-addendum.md',
    'docs/specs/SPEC-0022-device-publication-addendum.md',
    'docs/specs/SPEC-0019-host-memory-and-async-transfer.md',
    'docs/specs/SPEC-0014-long-lived-sideband.md',
    'components/runtime-facade/src/runtime.mjs',
    'conformance/f8/fixtures/consumer-native-windows.mjs',
    'conformance/f8/fixtures/consumer-native-device-js.mjs',
    'conformance/f8/fixtures/consumer-native-multi-operation.mjs',
    'conformance/f8/fixtures/consumer-native-mailbox.mjs',
    'conformance/f5/fixtures/vector-add.ptx.txt',
  ]),
  package: portable.package,
  observation,
  deviceJsObservation,
  multiOperationObservation,
  mailboxObservation,
  claimLimits: ['Exact installed Windows x64 Node 26.7.0 package and accepted Driver/GPU profile only.', 'The legacy vector, async-transfer, and mailbox consumers retain the F5 independent native C oracle; Device-JS release/acquire publication retains a separate CUDA-free protocol oracle and exact native multiword comparison.', 'The device-publication claim covers same-device u32/u64 readiness and immutable payload visibility when acquire observes release; it does not claim universal scheduling progress, freshness, fairness, generation policy or queue correctness.', 'The mailbox claim is bounded to private mapped storage, named u32 lanes, one live operation lease, and system-scope acquire/release publication.', 'No Linux, performance, strict-JIT, process-isolation, registry-release, or production-stability claim.'],
});
console.log(`F8W installed-package native consumers passed with vector checksum ${observation.checksum}, source-only Device-JS device publication, and mailbox publication qualification; evidence: ${target}`);
