import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { evaluateRun, parseNvidiaTelemetry, percentile, sha256Canonical, summarizeNumbers, validateProfiles } from './harness.mjs';

test('profiles are bounded, exact and independently named', async () => {
  const profiles = JSON.parse(await readFile(new URL('./profiles.json', import.meta.url), 'utf8'));
  assert.doesNotThrow(() => validateProfiles(profiles));
  assert.equal(profiles.profiles[0].phases.workloadMilliseconds < profiles.profiles[1].phases.workloadMilliseconds, true);
  assert.deepEqual(profiles.profiles.map((profile) => profile.host.cuda.computeCapabilityMajor), [7, 7]);
  const invalid = structuredClone(profiles);
  delete invalid.profiles[0].host.cuda.compilerProviderProfile;
  assert.throws(() => validateProfiles(invalid), /compiler provider profile/u);
});

test('telemetry parser preserves exact identity and numeric observations', () => {
  const sample = parseNvidiaTelemetry('NVIDIA GeForce GTX 1660 Ti, 610.74, P8, [N/A], Default, 120.00, 390, 405, 33, 19.62, 24, 678, 6144, 0x0000000000000001');
  assert.equal(sample.gpuName, 'NVIDIA GeForce GTX 1660 Ti');
  assert.equal(sample.persistenceMode, '[N/A]');
  assert.equal(sample.powerLimitWatts, 120);
  assert.equal(sample.throttleMaskHex, '0x0000000000000001');
});

test('statistics and canonical evidence identity are order stable', () => {
  assert.equal(percentile([9, 1, 5, 3, 7], 0.95), 9);
  assert.deepEqual(summarizeNumbers([1, 2, 3]), { count: 3, minimum: 1, p50: 2, p95: 3, p99: 3, maximum: 3, mean: 2 });
  assert.equal(sha256Canonical({ b: 2, a: 1 }), sha256Canonical({ a: 1, b: 2 }));
});

test('invalid-run evaluation is sensitive to correctness, noise, telemetry and cleanup', async () => {
  const record = validateProfiles(JSON.parse(await readFile(new URL('./profiles.json', import.meta.url), 'utf8')));
  const profile = structuredClone(record.profiles[0]);
  profile.phases.idleMilliseconds = 1000;
  profile.phases.workloadMilliseconds = 1000;
  profile.phases.cooldownMilliseconds = 1000;
  const samples = ['idle', 'workload', 'cooldown'].map((phase, index) => ({ recordedAt: new Date(1_000 + index * 1_000).toISOString(), phase, gpuName: 'GPU', driverVersion: '1.2.3', persistenceMode: 'Disabled', computeMode: 'Default', powerLimitWatts: 100, memoryTotalMiB: 4096, gpuUtilizationPercent: phase === 'workload' ? 90 : 0, temperatureC: 50, memoryUsedMiB: phase === 'workload' ? 800 : 700, throttleMaskHex: '0x0000000000000001' }));
  const terminal = { graceful: true, compiler: { graceful: true }, driver: { graceful: true, resourceCounts: { live: 0, closing: 0, orphaned: 0 } } };
  assert.deepEqual(evaluateRun({ profile, samples, correctnessChecks: [{ pass: true }, { pass: true }], terminal, launchCount: 10, workloadElapsedMilliseconds: 1000 }), []);
  const failures = evaluateRun({ profile, samples: samples.map((sample) => ({ ...sample, gpuUtilizationPercent: 99 })), correctnessChecks: [{ pass: false }], terminal: { graceful: false }, launchCount: 0, workloadElapsedMilliseconds: 1 });
  assert(failures.includes('idle-baseline-too-busy'));
  assert(failures.includes('correctness-failure'));
  assert(failures.includes('nonterminal-resource-state'));
  assert(failures.includes('workload-ended-early'));
  const drift = structuredClone(samples);
  drift[1].driverVersion = '9.9.9';
  assert(evaluateRun({ profile, samples: drift, correctnessChecks: [{ pass: true }, { pass: true }], terminal, launchCount: 10, workloadElapsedMilliseconds: 1000 }).includes('telemetry-identity-changed'));
});
