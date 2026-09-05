import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { buildAndRunDenseNumericOracle } from './dense-numeric-oracle.mjs';
import { consumersRoot, evidenceRoot, nativePackageEvidenceName, nativeProfile, packageRoot, repositoryRoot, sha256, sourceIdentity, writeEvidence } from './evidence.mjs';

assert(['win32', 'linux'].includes(process.platform), 'F8 native package conformance requires Windows or native Linux.');
assert.equal(process.arch, 'x64', 'F8 native package conformance requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F8 native package conformance requires exact Node v26.7.0.');
if (process.platform === 'linux') assert.doesNotMatch(os.release(), /microsoft/i, 'F8 native Linux package conformance does not accept WSL.');
const node = process.env.CUDA_JS_F8_NODE ?? process.execPath;
const npmCli = process.env.CUDA_JS_F8_NPM_CLI;
assert(npmCli && existsSync(npmCli), 'F8 native package conformance requires the selected npm CLI.');

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
const prerequisitePath = path.join(repositoryRoot, 'build', 'f7', `${process.platform}-${process.arch}`, 'evidence', `native-${nativeProfile}.json`);
const prerequisite = JSON.parse(await readFile(prerequisitePath, 'utf8'));
assert.equal(prerequisite.status, 'pass', 'F8 native package conformance requires passing F7 native evidence from the same workspace.');
if (process.platform === 'linux') assert.equal(prerequisite.environment.host.osRelease, os.release(), 'F8L requires the same native Linux kernel as F7L.');
const denseNumericOracle = await buildAndRunDenseNumericOracle();
const directory = path.join(consumersRoot, `consumer-native-${nativeProfile}`);
await rm(directory, { recursive: true, force: true });
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, 'package.json'), `${JSON.stringify({ name: `cuda-js-native-${nativeProfile}-consumer`, version: '1.0.0', private: true, type: 'module' }, null, 2)}\n`);
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-vector.mjs'), path.join(directory, 'consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-device-js.mjs'), path.join(directory, 'device-js-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-multi-operation.mjs'), path.join(directory, 'multi-operation-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-prepared-dag.mjs'), path.join(directory, 'prepared-dag-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-mailbox.mjs'), path.join(directory, 'mailbox-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-cublaslt.mjs'), path.join(directory, 'cublaslt-consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-dense-numeric.mjs'), path.join(directory, 'dense-numeric-consumer.mjs'));
await writeFile(path.join(directory, 'dense-numeric-oracle.json'), `${JSON.stringify(denseNumericOracle.observation, null, 2)}\n`);
await cp(path.join(repositoryRoot, 'conformance', 'f5', 'fixtures', 'vector-add.ptx.txt'), path.join(directory, 'vector-add.ptx.txt'));
await cp(path.join(repositoryRoot, 'build', 'f5', `${process.platform}-${process.arch}`, 'native', 'native-capabilities.ptx'), path.join(directory, 'native-capabilities.ptx'));
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
assert(Number.isSafeInteger(deviceJsObservation.runtimeProfile.device.architecture.major));
assert(Number.isSafeInteger(deviceJsObservation.runtimeProfile.device.architecture.minor));
if (nativeProfile === 'windows') {
  assert.equal(deviceJsObservation.runtimeProfile.device.architecture.major, 7);
  assert.equal(deviceJsObservation.runtimeProfile.device.architecture.minor, 5);
}
assert.equal(Object.hasOwn(deviceJsObservation.runtimeProfile.device, 'ordinal'), false);
assert.equal(deviceJsObservation.runtimeProfile.profile.nativeQualified, false);
assert.equal(deviceJsObservation.runtimeProfile.compiler.provider.profile, nativeProfile === 'windows' ? 'cuda-13.3-windows-x64-compiler' : 'cuda-13.3-ubuntu-24.04-x64-compiler');
assert.equal(deviceJsObservation.rejectionBeforeCompilerResources, true);
assert.equal(deviceJsObservation.graceful, true);
const denseNumericOutput = runNode(['--experimental-ffi', 'dense-numeric-consumer.mjs'], directory);
const denseNumericObservation = JSON.parse(denseNumericOutput.split(/\r?\n/).at(-1));
assert.deepEqual({
  f64Bits: denseNumericObservation.f64Bits,
  f16Bits: denseNumericObservation.f16Bits,
  bf16Bits: denseNumericObservation.bf16Bits,
  words: denseNumericObservation.words,
}, {
  f64Bits: denseNumericOracle.observation.f64Bits,
  f16Bits: denseNumericOracle.observation.f16Bits,
  bf16Bits: denseNumericOracle.observation.bf16Bits,
  words: denseNumericOracle.observation.words,
});
assert.equal(denseNumericObservation.oracleIndependent, true);
assert.equal(denseNumericObservation.graceful, true);
const multiOperationOutput = runNode(['--experimental-ffi', 'multi-operation-consumer.mjs'], directory);
const multiOperationObservation = JSON.parse(multiOperationOutput.split(/\r?\n/).at(-1));
assert.equal(multiOperationObservation.producerPendingAfterObserver, true);
assert.deepEqual(multiOperationObservation.observedWords, [1]);
assert.deepEqual(multiOperationObservation.transferBytes, [3, 5, 7, 11]);
assert.equal(multiOperationObservation.graceful, true);
const preparedDagOutput = runNode(['--experimental-ffi', 'prepared-dag-consumer.mjs'], directory);
const preparedDagObservation = JSON.parse(preparedDagOutput.split(/\r?\n/).at(-1));
assert.equal(preparedDagObservation.checksum, 15_600_773);
assert.deepEqual(preparedDagObservation.preparedIdentity, { contract: 'SPEC-0020-prepared-kernel-dag-v1', nodeCount: 1, edgeCount: 0, realization: 'semantic-single-stream' });
assert.equal(preparedDagObservation.graceful, true);
const mailboxOutput = runNode(['--experimental-ffi', 'mailbox-consumer.mjs'], directory);
const mailboxObservation = JSON.parse(mailboxOutput.split(/\r?\n/).at(-1));
assert.equal(mailboxObservation.firstPending, true);
assert.equal(mailboxObservation.applicationTimerFired, true);
assert.equal(mailboxObservation.published, 41);
assert.equal(mailboxObservation.observed, 42);
assert.equal(mailboxObservation.opaque, true);
assert.equal(mailboxObservation.graceful, true);
let cublasLtObservation = null;
if (nativeProfile === 'windows') {
  const cublasLtOutput = runNode(['--experimental-ffi', 'cublaslt-consumer.mjs'], directory);
  cublasLtObservation = JSON.parse(cublasLtOutput.split(/\r?\n/).at(-1));
  assert.deepEqual(cublasLtObservation.output, [58, 64, 139, 154]);
  assert.equal(cublasLtObservation.status, 'completed');
  assert.equal(cublasLtObservation.operationKind, 'prepared-batch');
  assert.deepEqual(cublasLtObservation.prepared, {
    contract: 'SPEC-0020-prepared-kernel-dag-v1+SPEC-0031-prepared-cublaslt-f32-matmul-node-v1',
    nodeCount: 3,
    edgeCount: 2,
    realization: 'semantic-single-stream',
  });
  assert.deepEqual(cublasLtObservation.finalWords, [1114112003, 1115684867, 1124794371, 1125777411]);
  assert.equal(cublasLtObservation.workspaceBytes, 0);
  assert.deepEqual(cublasLtObservation.provider, { name: 'cuBLASLt', version: '13.5.1', qualification: 'exact-windows-profile', workspaceAlignmentBytes: 256 });
  assert.equal(cublasLtObservation.graceful, true);
}
runNode([npmCli, 'uninstall', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', 'cuda-js'], directory);
assert(!existsSync(installed));

const target = await writeEvidence(nativePackageEvidenceName, {
  schemaVersion: 1,
  workPackage: `CJS-F8${nativeProfile === 'windows' ? 'W' : 'L'}`,
  capsule: `installed-package-native-vector-device-js-device-publication-operation-transfer-prepared-dag-mailbox${nativeProfile === 'windows' ? '-cublaslt' : ''}-consumers`,
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch, kernel: os.release(), osVersion: os.version() },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0008-package-public-facade.md',
    'docs/specs/SPEC-0013-restricted-device-js.md',
    'docs/specs/SPEC-0013-public-surface-addendum.md',
    'docs/specs/SPEC-0022-scoped-atomic-observation-addendum.md',
    'docs/specs/SPEC-0022-device-publication-addendum.md',
    'docs/specs/SPEC-0019-host-memory-and-async-transfer.md',
    'docs/specs/SPEC-0020-prepared-batch-and-graph-execution.md',
    'docs/specs/SPEC-0030-device-js-dense-numeric-profile.md',
    'docs/specs/SPEC-0031-prepared-cublaslt-f32-matmul-node.md',
    'docs/specs/SPEC-0014-long-lived-sideband.md',
    'docs/specs/SPEC-0023-context-bound-cuda-library-adapters.md',
    'docs/specs/SPEC-0029-cublaslt-f32-matmul.md',
    'components/runtime-facade/src/runtime.mjs',
    'conformance/f8/fixtures/consumer-native-vector.mjs',
    'conformance/f8/fixtures/consumer-native-device-js.mjs',
    'conformance/f8/fixtures/consumer-native-dense-numeric.mjs',
    'conformance/f8/native/dense-numeric-oracle.cu',
    'conformance/f8/fixtures/consumer-native-multi-operation.mjs',
    'conformance/f8/fixtures/consumer-native-prepared-dag.mjs',
    'conformance/f8/fixtures/consumer-native-mailbox.mjs',
    'conformance/f8/fixtures/consumer-native-cublaslt.mjs',
    'conformance/f5/fixtures/vector-add.ptx.txt',
  ]),
  prerequisite: { path: path.relative(repositoryRoot, prerequisitePath), sha256: await sha256(prerequisitePath) },
  package: portable.package,
  observation,
  deviceJsObservation,
  denseNumericOracle,
  denseNumericObservation,
  multiOperationObservation,
  preparedDagObservation,
  mailboxObservation,
  cublasLtObservation,
  claimLimits: [`Exact installed ${nativeProfile} x64 Node 26.7.0 package and recorded Driver/GPU input profile only.`, 'The vector, prepared-DAG, async-transfer, and mailbox consumers retain the F5 independent native C oracle; dense f64/f16/bf16 Device-JS retains a separately compiled CUDA C++ numerical oracle; Device-JS release/acquire publication retains a separate CUDA-free protocol oracle and exact native multiword comparison.', 'Prepared-DAG evidence proves exact semantic single-stream preparation, submission, completion, result parity, and cleanup on the recorded native device profile; it is not CUDA Graph or performance evidence.', 'The dense numeric result qualifies exact specified semantics on the recorded compiler/header/target/GPU profile; it makes no tensor-core, performance, fast-math, or broader-provider claim.', 'The device-publication claim covers same-device u32/u64 readiness and immutable payload visibility when acquire observes release; it does not claim universal scheduling progress, freshness, fairness, generation policy or queue correctness.', 'The mailbox claim is bounded to private mapped storage, named u32 lanes, one live operation lease, and system-scope acquire/release publication.', 'Linux evidence remains unqualified until the complete exact Ubuntu chain is reviewed and promoted; no cross-platform, performance, strict-JIT, process-isolation, registry-release, or production-stability claim.'],
});
console.log(`F8${nativeProfile === 'windows' ? 'W' : 'L'} installed-package native consumers passed with vector checksum ${observation.checksum}, source-only Device-JS device publication, dense f64/f16/bf16 oracle parity, prepared-DAG replay, mailbox publication${nativeProfile === 'windows' ? ', and cuBLASLt matmul' : ''} evidence; evidence: ${target}`);
