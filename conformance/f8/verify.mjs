import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import compatibility from '../../packaging/compatibility-manifest.json' with { type: 'json' };
import packageJson from '../../package.json' with { type: 'json' };
import { evidenceRoot } from './evidence.mjs';

assert.equal(packageJson.name, compatibility.package.name);
assert.equal(packageJson.version, compatibility.package.version);
assert.equal(packageJson.version, '0.1.0-alpha.6');
assert.equal(packageJson.dependencies.acorn, '8.15.0');
assert.equal(packageJson.engines.node, '>=26.1.0');
assert.equal(packageJson.private, false);
assert.equal(packageJson.license, 'AGPL-3.0-or-later');
assert.equal(compatibility.package.license, packageJson.license);
assert.equal(compatibility.package.commercialLicensing, 'available-separately');
assert.equal(compatibility.node.minimumVersion, 'v26.1.0');
assert.equal(compatibility.node.version, 'v26.7.0');
assert.deepEqual(compatibility.capabilities.functionParameters, ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16']);
assert.equal(compatibility.capabilities.gpuOperationLifecycle, 'opaque-submit-status-wait-close-one-pending');
assert.equal(compatibility.capabilities.boundedMultiOperationScheduling, 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue');
assert.equal(compatibility.capabilities.asyncTransfers, 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d');
assert.deepEqual(compatibility.capabilities.compilerOutputFormats, ['ptx', 'lto-ir']);
assert.equal(compatibility.capabilities.ptxRelocatableDeviceCode, 'typed-boolean-default-false');
assert.deepEqual(compatibility.capabilities.linkInputFamilies, ['ptx', 'typed-lto-ir']);
assert.equal(compatibility.capabilities.deviceJsFrontend, 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1');
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
const compilerConsumer = portable.observations.consumers.find((entry) => entry.consumer === 'portable-compiler');
assert(compilerConsumer);
assert.equal(compilerConsumer.packageVersion, packageJson.version);
for (const field of ['ptx', 'rdc', 'ltoIr', 'ltoCubin', 'cubin', 'deviceJs', 'deviceJsProgram']) {
  assert.match(compilerConsumer[field], /^[a-f0-9]{64}$/);
}
assert.deepEqual(compilerConsumer.deviceJsParser, { name: 'acorn', version: '8.15.0' });
if (process.platform === 'win32') {
  const native = JSON.parse(await readFile(path.join(evidenceRoot, 'native-windows-package.json'), 'utf8'));
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
  assert.equal(native.deviceJsObservation.runtimeProfile.device.attributes.computeCapabilityMajor, 7);
  assert.equal(native.deviceJsObservation.runtimeProfile.device.attributes.computeCapabilityMinor, 5);
  assert.equal(native.deviceJsObservation.runtimeProfile.compiler.provider.profile, 'cuda-13.3-windows-x64-compiler');
  assert.equal(native.deviceJsObservation.rejectionBeforeCompilerResources, true);
  assert.equal(native.deviceJsObservation.graceful, true);
  assert.equal(native.deviceJsObservation.compilerResources.programsCreated, native.deviceJsObservation.compilerResources.programsDestroyed);
  assert.equal(native.deviceJsObservation.driverResourceCounts.live, 0);
  assert.equal(native.deviceJsObservation.driverResourceCounts.orphaned, 0);
  assert.deepEqual(native.multiOperationObservation.transferBytes, [3, 5, 7, 11]);
  assert.equal(native.multiOperationObservation.graceful, true);
}
if (process.platform === 'linux') {
  const readiness = JSON.parse(await readFile(path.join(evidenceRoot, 'linux-readiness.json'), 'utf8'));
  assert.equal(readiness.status, 'backend-unavailable');
  assert.equal(readiness.observations.nativeOpenCode, 'CUDA_JS_LINUX_BACKEND_UNAVAILABLE');
}
console.log(`F8 verification passed for ${process.platform}-${process.arch}: exact package exports, reconciled additive public capabilities including Device-JS and SPEC-0016 operations, install/uninstall, independent consumers, instance isolation, and ${process.platform === 'win32' ? 'native Windows facade plus source-only Device-JS execution' : 'retained native Linux qualification gates'}.`);
