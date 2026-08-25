import { createHash } from 'node:crypto';

const numericTelemetryFields = [
  'powerLimitWatts', 'graphicsClockMHz', 'memoryClockMHz', 'temperatureC', 'powerWatts',
  'gpuUtilizationPercent', 'memoryUsedMiB', 'memoryTotalMiB', 'processRssBytes', 'processHeapUsedBytes',
];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function finiteNumber(value, name) {
  invariant(typeof value === 'number' && Number.isFinite(value), `${name} must be finite.`);
  return value;
}

function positiveInteger(value, name) {
  invariant(Number.isSafeInteger(value) && value > 0, `${name} must be a positive safe integer.`);
  return value;
}

function nonnegativeInteger(value, name) {
  invariant(Number.isSafeInteger(value) && value >= 0, `${name} must be a nonnegative safe integer.`);
  return value;
}

function parseNumber(value, field) {
  const trimmed = value.trim();
  if (trimmed === '[N/A]' || trimmed === 'N/A') return null;
  const parsed = Number(trimmed);
  invariant(Number.isFinite(parsed), `nvidia-smi returned a nonnumeric ${field}.`);
  return parsed;
}

export function parseNvidiaTelemetry(line) {
  const values = line.trim().split(',').map((value) => value.trim());
  invariant(values.length === 14, `Expected 14 nvidia-smi telemetry fields, received ${values.length}.`);
  const [name, driverVersion, performanceState, persistenceMode, computeMode, powerLimit, graphicsClock, memoryClock, temperature, power, utilization, memoryUsed, memoryTotal, throttleMask] = values;
  invariant(name.length > 0 && driverVersion.length > 0, 'nvidia-smi identity fields are required.');
  invariant(/^0x[0-9a-f]+$/iu.test(throttleMask), 'nvidia-smi throttle mask must be hexadecimal.');
  return {
    gpuName: name,
    driverVersion,
    performanceState,
    persistenceMode,
    computeMode,
    powerLimitWatts: parseNumber(powerLimit, 'power limit'),
    graphicsClockMHz: parseNumber(graphicsClock, 'graphics clock'),
    memoryClockMHz: parseNumber(memoryClock, 'memory clock'),
    temperatureC: parseNumber(temperature, 'temperature'),
    powerWatts: parseNumber(power, 'power'),
    gpuUtilizationPercent: parseNumber(utilization, 'GPU utilization'),
    memoryUsedMiB: parseNumber(memoryUsed, 'memory used'),
    memoryTotalMiB: parseNumber(memoryTotal, 'memory total'),
    throttleMaskHex: `0x${BigInt(throttleMask).toString(16).padStart(16, '0')}`,
  };
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function sha256Canonical(value) {
  return sha256Bytes(Buffer.from(canonicalJson(value)));
}

export function percentile(values, probability) {
  invariant(Array.isArray(values) && values.length > 0, 'Percentile requires at least one value.');
  finiteNumber(probability, 'probability');
  invariant(probability >= 0 && probability <= 1, 'probability must be between zero and one.');
  const sorted = values.map((value, index) => finiteNumber(value, `values[${index}]`)).sort((left, right) => left - right);
  const rank = Math.ceil(probability * sorted.length) - 1;
  return sorted[Math.max(0, rank)];
}

export function summarizeNumbers(values) {
  invariant(values.length > 0, 'Numeric summary requires samples.');
  let total = 0;
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (const [index, input] of values.entries()) {
    const value = finiteNumber(input, `values[${index}]`);
    total += value;
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }
  return { count: values.length, minimum, p50: percentile(values, 0.5), p95: percentile(values, 0.95), p99: percentile(values, 0.99), maximum, mean: total / values.length };
}

export function summarizeTelemetry(samples) {
  const phases = [...new Set(samples.map((sample) => sample.phase))].sort();
  return Object.fromEntries(phases.map((phase) => {
    const phaseSamples = samples.filter((sample) => sample.phase === phase && !sample.error);
    const fields = {};
    for (const field of numericTelemetryFields) {
      const values = phaseSamples.map((sample) => sample[field]).filter((value) => typeof value === 'number' && Number.isFinite(value));
      if (values.length > 0) fields[field] = summarizeNumbers(values);
    }
    return [phase, { sampleCount: phaseSamples.length, fields }];
  }));
}

export function validateProfiles(record) {
  invariant(record?.schemaVersion === 1, 'Performance profile schemaVersion must be 1.');
  invariant(Array.isArray(record.profiles) && record.profiles.length >= 2, 'At least two performance profiles are required.');
  const ids = new Set();
  for (const profile of record.profiles) {
    invariant(typeof profile.id === 'string' && /^[a-z0-9][a-z0-9-]+$/u.test(profile.id), 'Profile ID must be canonical.');
    invariant(!ids.has(profile.id), `Duplicate profile ID: ${profile.id}`);
    ids.add(profile.id);
    invariant(profile.host?.platform === 'win32' && profile.host?.architecture === 'x64' && profile.host?.node === 'v26.7.0', `${profile.id} must pin the exact first host profile.`);
    positiveInteger(profile.host.cuda?.apiVersion, `${profile.id}.host.cuda.apiVersion`);
    positiveInteger(profile.host.cuda?.computeCapabilityMajor, `${profile.id}.host.cuda.computeCapabilityMajor`);
    nonnegativeInteger(profile.host.cuda?.computeCapabilityMinor, `${profile.id}.host.cuda.computeCapabilityMinor`);
    invariant(typeof profile.host.cuda?.compilerProviderProfile === 'string' && /^[a-z0-9][a-z0-9.-]+$/u.test(profile.host.cuda.compilerProviderProfile), `${profile.id} must pin a canonical compiler provider profile.`);
    positiveInteger(profile.workload?.elementCount, `${profile.id}.workload.elementCount`);
    positiveInteger(profile.workload?.rounds, `${profile.id}.workload.rounds`);
    positiveInteger(profile.workload?.blockX, `${profile.id}.workload.blockX`);
    invariant(profile.workload.elementCount % profile.workload.blockX === 0, `${profile.id} elementCount must divide evenly by blockX.`);
    for (const [name, value] of Object.entries(profile.phases ?? {})) positiveInteger(value, `${profile.id}.phases.${name}`);
    for (const [name, value] of Object.entries(profile.sampling ?? {})) positiveInteger(value, `${profile.id}.sampling.${name}`);
    finiteNumber(profile.invalidRun?.minimumTelemetryFraction, `${profile.id}.invalidRun.minimumTelemetryFraction`);
    invariant(profile.invalidRun.minimumTelemetryFraction > 0 && profile.invalidRun.minimumTelemetryFraction <= 1, `${profile.id} telemetry fraction is invalid.`);
    positiveInteger(profile.invalidRun.maximumTelemetryGapMilliseconds, `${profile.id}.invalidRun.maximumTelemetryGapMilliseconds`);
    finiteNumber(profile.invalidRun.maximumIdleGpuUtilizationP95, `${profile.id}.invalidRun.maximumIdleGpuUtilizationP95`);
    finiteNumber(profile.invalidRun.maximumGpuTemperatureC, `${profile.id}.invalidRun.maximumGpuTemperatureC`);
    finiteNumber(profile.invalidRun.maximumCooldownMemoryDeltaMiB, `${profile.id}.invalidRun.maximumCooldownMemoryDeltaMiB`);
    invariant(/^0x[0-9a-f]{16}$/u.test(profile.invalidRun.allowedThrottleMaskHex), `${profile.id} throttle mask must be canonical.`);
    invariant(typeof profile.claim === 'string' && profile.claim.length >= 40, `${profile.id} needs explicit claim limits.`);
  }
  return record;
}

function expectedSamples(duration, interval, fraction) {
  return Math.max(1, Math.floor(duration / interval * fraction));
}

export function evaluateRun({ profile, samples, correctnessChecks, terminal, launchCount, workloadElapsedMilliseconds }) {
  const reasons = [];
  const goodSamples = samples.filter((sample) => !sample.error);
  const byPhase = (phase) => goodSamples.filter((sample) => sample.phase === phase);
  const idle = byPhase('idle');
  const workload = byPhase('workload');
  const cooldown = byPhase('cooldown');
  const fraction = profile.invalidRun.minimumTelemetryFraction;
  const interval = profile.sampling.telemetryIntervalMilliseconds;
  if (idle.length < expectedSamples(profile.phases.idleMilliseconds, interval, fraction)) reasons.push('insufficient-idle-telemetry');
  if (workload.length < expectedSamples(profile.phases.workloadMilliseconds, interval, fraction)) reasons.push('insufficient-workload-telemetry');
  if (cooldown.length < expectedSamples(profile.phases.cooldownMilliseconds, interval, fraction)) reasons.push('insufficient-cooldown-telemetry');
  if (samples.some((sample) => sample.error)) reasons.push('telemetry-sample-error');
  const telemetryIdentity = goodSamples.map((sample) => ({ gpuName: sample.gpuName, driverVersion: sample.driverVersion, persistenceMode: sample.persistenceMode, computeMode: sample.computeMode, memoryTotalMiB: sample.memoryTotalMiB, powerLimitWatts: sample.powerLimitWatts }));
  if (telemetryIdentity.some((identity) => typeof identity.gpuName !== 'string' || typeof identity.driverVersion !== 'string' || typeof identity.persistenceMode !== 'string' || typeof identity.computeMode !== 'string' || !Number.isFinite(identity.memoryTotalMiB) || !Number.isFinite(identity.powerLimitWatts))) reasons.push('telemetry-identity-missing');
  else if (new Set(telemetryIdentity.map(canonicalJson)).size !== 1) reasons.push('telemetry-identity-changed');
  const timestamps = goodSamples.map((sample) => Date.parse(sample.recordedAt)).filter(Number.isFinite).sort((left, right) => left - right);
  for (let index = 1; index < timestamps.length; index += 1) {
    if (timestamps[index] - timestamps[index - 1] > profile.invalidRun.maximumTelemetryGapMilliseconds) { reasons.push('telemetry-gap'); break; }
  }
  if (idle.length > 0 && percentile(idle.map((sample) => sample.gpuUtilizationPercent), 0.95) > profile.invalidRun.maximumIdleGpuUtilizationP95) reasons.push('idle-baseline-too-busy');
  if (workload.some((sample) => sample.temperatureC > profile.invalidRun.maximumGpuTemperatureC)) reasons.push('temperature-limit');
  const allowedMask = BigInt(profile.invalidRun.allowedThrottleMaskHex);
  if (workload.some((sample) => (BigInt(sample.throttleMaskHex) & ~allowedMask) !== 0n)) reasons.push('unexpected-throttle-reason');
  if (idle.length > 0 && cooldown.length > 0) {
    const idleMemory = percentile(idle.map((sample) => sample.memoryUsedMiB), 0.95);
    if (cooldown.at(-1).memoryUsedMiB > idleMemory + profile.invalidRun.maximumCooldownMemoryDeltaMiB) reasons.push('gpu-memory-did-not-return');
  }
  if (!Array.isArray(correctnessChecks) || correctnessChecks.length < 2 || correctnessChecks.some((check) => check.pass !== true)) reasons.push('correctness-failure');
  if (!terminal?.graceful || terminal?.compiler?.graceful !== true || terminal?.driver?.graceful !== true || terminal?.driver?.resourceCounts?.live !== 0 || terminal?.driver?.resourceCounts?.closing !== 0 || terminal?.driver?.resourceCounts?.orphaned !== 0) reasons.push('nonterminal-resource-state');
  if (!Number.isSafeInteger(launchCount) || launchCount <= profile.phases.warmupLaunches) reasons.push('insufficient-launches');
  if (!(workloadElapsedMilliseconds >= profile.phases.workloadMilliseconds)) reasons.push('workload-ended-early');
  return [...new Set(reasons)].sort();
}
