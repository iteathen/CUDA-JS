import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import compatibility from '../../packaging/compatibility-manifest.json' with { type: 'json' };
import packageJson from '../../package.json' with { type: 'json' };
import { evidenceRoot, nativePackageEvidenceName, nativeProfile } from './evidence.mjs';

assert.equal(packageJson.name, compatibility.package.name);
assert.equal(packageJson.version, compatibility.package.version);
assert.equal(packageJson.version, '0.1.0-alpha.14');
assert.equal(packageJson.dependencies.acorn, '8.15.0');
assert.equal(packageJson.engines.node, '>=26.1.0');
assert.equal(packageJson.private, false);
assert.equal(packageJson.license, 'AGPL-3.0-or-later');
assert.equal(compatibility.package.license, packageJson.license);
assert.equal(compatibility.package.commercialLicensing, 'available-separately');
assert.equal(compatibility.node.minimumVersion, 'v26.1.0');
assert.equal(compatibility.node.version, 'v26.7.0');
assert.deepEqual(compatibility.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16', 'publication-mailbox-host-to-device-u32', 'publication-mailbox-device-to-host-u32']);
assert.equal(compatibility.capabilities.typedDeviceViews, 'allocation-owned-contiguous-1d-opaque-capability-explicit-launch-access');
assert.equal(compatibility.capabilities.deviceSelection, 'finite-sanitized-snapshot-opaque-process-local-selector-one-device-per-runtime-selected-targets');
assert.equal(compatibility.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
assert.equal(compatibility.capabilities.boundedMultiOperationScheduling, 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue');
assert.equal(compatibility.capabilities.asyncTransfers, 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d');
assert.equal(compatibility.capabilities.publicationMailboxes, 'private-mapped-named-u32-one-operation-lease-system-acquire-release');
assert.equal(compatibility.capabilities.preparedOperationDags, 'bounded-kernel-dag-immutable-bindings-single-stream-semantic-replay');
assert.equal(compatibility.capabilities.cublasLtF32Matmul, 'optional-row-major-contiguous-typed-views-explicit-bounded-workspace');
assert.deepEqual(compatibility.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
assert.equal(compatibility.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
assert.deepEqual(compatibility.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);
assert.equal(compatibility.capabilities.deviceJsFrontend, 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1+spec-0022-device-publication-v1+spec-0014-publication-mailbox-v1');
assert.equal(compatibility.capabilities.deviceJsDenseNumeric, 'f64-f16-bf16-exact-casts-special-values-manifest-verified-headers');
assert.equal(compatibility.capabilities.deviceJsLibraries, 'typed-leaf-libraries-explicit-aliased-imports-rdc-or-lto-final-cubin');
assert.deepEqual(compatibility.capabilities.deviceJsParser, { name: 'acorn', version: '8.15.0', role: 'syntax-only-replaceable-adapter' });
assert.deepEqual(Object.keys(packageJson.exports).sort(), ['.', './compatibility', './testing']);
const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable-package.json'), 'utf8'));
assert.equal(portable.status, 'pass');
assert.equal(portable.package.version, packageJson.version);
assert.equal(portable.observations.firstConsumerDeletion, true);
assert.equal(portable.observations.secondInstance, true);
assert.equal(portable.observations.installed, portable.observations.uninstalled);
const memoryConsumer = portable.observations.consumers.find((entry) => entry.consumer === 'portable-memory');
assert(memoryConsumer);
assert.equal(memoryConsumer.packageVersion, packageJson.version);
assert.deepEqual(memoryConsumer.scalarKinds, ['u64', 'i32', 'f32', 'f64', 'f16', 'bf16']);
assert.equal(memoryConsumer.operationLifecycle, true);
assert.equal(memoryConsumer.asyncTransferLifecycle, true);
assert.equal(memoryConsumer.publicationMailboxLifecycle, true);
assert.equal(memoryConsumer.deviceSelectionLifecycle, true);
assert.equal(memoryConsumer.typedViewLifecycle, true);
assert.equal(memoryConsumer.preparedOperationDagLifecycle, true);
assert.match(memoryConsumer.denseNumeric, /^[a-f0-9]{64}$/);
const compilerConsumer = portable.observations.consumers.find((entry) => entry.consumer === 'portable-compiler');
assert(compilerConsumer);
assert.equal(compilerConsumer.packageVersion, packageJson.version);
for (const field of ['ptx', 'rdc', 'ltoIr', 'ltoCubin', 'cubin', 'deviceJs', 'deviceJsProgram', 'devicePublication', 'denseNumeric', 'deviceLibrary', 'denseDeviceLibrary', 'composedFirst', 'composedSecond']) {
  assert.match(compilerConsumer[field], /^[a-f0-9]{64}$/);
}
assert.deepEqual(compilerConsumer.deviceJsParser, { name: 'acorn', version: '8.15.0' });
const nativePath = path.join(evidenceRoot, nativePackageEvidenceName);
if (['win32', 'linux'].includes(process.platform) && process.arch === 'x64' && existsSync(nativePath)) {
  const native = JSON.parse(await readFile(nativePath, 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.observation.checksum, 15_600_773);
  assert.equal(native.observation.graceful, true);
  assert.equal(native.deviceJsObservation.sourceOnly, true);
  assert.equal(native.deviceJsObservation.structuredIntegerBitwise, true);
  assert.equal(native.deviceJsObservation.dataDependentWhile, true);
  assert.equal(native.deviceJsObservation.globalIndex, true);
  assert.equal(native.deviceJsObservation.exactU64, 'ffffffffffffffff');
  assert.deepEqual(native.deviceJsObservation.atomicBuckets, [16, 16, 16, 16]);
  assert.equal(native.deviceJsObservation.atomicCasUniqueFlags, true);
  assert.equal(native.deviceJsObservation.atomicRelaxedDeviceU32, true);
  assert.equal(native.deviceJsObservation.atomicRelaxedDeviceU64, true);
  assert.equal(native.deviceJsObservation.atomicPublicationDeviceU32, true);
  assert.equal(native.deviceJsObservation.atomicPublicationDeviceU64, true);
  assert.deepEqual(native.deviceJsObservation.atomicPublicationPayload, [0x89abcdef, 0x01234567, 0x76543210, 0xfedcba98]);
  assert(Number.isSafeInteger(native.deviceJsObservation.runtimeProfile.device.architecture.major));
  assert(Number.isSafeInteger(native.deviceJsObservation.runtimeProfile.device.architecture.minor));
  if (nativeProfile === 'windows') {
    assert.equal(native.deviceJsObservation.runtimeProfile.device.architecture.major, 7);
    assert.equal(native.deviceJsObservation.runtimeProfile.device.architecture.minor, 5);
  }
  assert.equal(Object.hasOwn(native.deviceJsObservation.runtimeProfile.device, 'ordinal'), false);
  assert.equal(native.deviceJsObservation.runtimeProfile.profile.nativeQualified, false);
  assert.equal(native.deviceJsObservation.runtimeProfile.compiler.provider.profile, nativeProfile === 'windows' ? 'cuda-13.3-windows-x64-compiler' : 'cuda-13.3-ubuntu-24.04-x64-compiler');
  assert.equal(native.deviceJsObservation.rejectionBeforeCompilerResources, true);
  assert.equal(native.deviceJsObservation.graceful, true);
  assert.equal(native.deviceJsObservation.compilerResources.programsCreated, native.deviceJsObservation.compilerResources.programsDestroyed);
  assert.equal(native.deviceJsObservation.driverResourceCounts.live, 0);
  assert.equal(native.deviceJsObservation.driverResourceCounts.orphaned, 0);
  assert.deepEqual(native.denseNumericObservation.f64Bits, native.denseNumericOracle.observation.f64Bits);
  assert.deepEqual(native.denseNumericObservation.f16Bits, native.denseNumericOracle.observation.f16Bits);
  assert.deepEqual(native.denseNumericObservation.bf16Bits, native.denseNumericOracle.observation.bf16Bits);
  assert.deepEqual(native.denseNumericObservation.words, native.denseNumericOracle.observation.words);
  assert.equal(native.denseNumericObservation.oracleIndependent, true);
  assert.equal(native.denseNumericObservation.graceful, true);
  assert.deepEqual(native.multiOperationObservation.transferBytes, [3, 5, 7, 11]);
  assert.equal(native.multiOperationObservation.graceful, true);
  if (nativeProfile === 'windows') {
    assert.deepEqual(native.cublasLtObservation.output, [58, 64, 139, 154]);
    assert.equal(native.cublasLtObservation.status, 'completed');
    assert.deepEqual(native.cublasLtObservation.provider, { name: 'cuBLASLt', version: '13.5.1', qualification: 'exact-windows-profile' });
    assert.equal(native.cublasLtObservation.graceful, true);
  } else {
    assert.equal(native.cublasLtObservation, null);
  }
}
if (process.platform === 'linux' && !existsSync(nativePath)) {
  const readiness = JSON.parse(await readFile(path.join(evidenceRoot, 'linux-readiness.json'), 'utf8'));
  if (process.arch === 'x64') {
    assert.equal(readiness.status, 'facade-source-ready-not-qualified');
    assert.equal(readiness.observations.compatibility.status, 'testing-unconfirmed-by-default');
    assert(['environment-blocked', 'operational-unqualified'].includes(readiness.observations.admission.status));
    assert.notEqual(readiness.observations.admission.code, 'CUDA_JS_LINUX_BACKEND_UNAVAILABLE');
  } else {
    assert.equal(readiness.status, 'backend-unavailable');
    assert.equal(readiness.observations.admission.code, 'CUDA_JS_LINUX_BACKEND_UNAVAILABLE');
  }
}
console.log(`F8 verification passed for ${process.platform}-${process.arch}: exact package exports, reconciled additive public capabilities including Device-JS, SPEC-0016 operations, and SPEC-0020 semantic prepared DAGs, install/uninstall, independent consumers, instance isolation, and ${existsSync(nativePath) ? `native ${nativeProfile} facade plus source-only Device-JS execution` : 'retained native Linux qualification gates'}.`);
