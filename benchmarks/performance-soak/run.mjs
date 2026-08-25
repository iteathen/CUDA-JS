import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';

import { canonicalJson, evaluateRun, parseNvidiaTelemetry, sha256Bytes, sha256Canonical, summarizeNumbers, summarizeTelemetry, validateProfiles } from './harness.mjs';

const execFile = promisify(execFileCallback);
const repositoryRoot = path.resolve(import.meta.dirname, '..', '..');
const profilesPath = path.join(import.meta.dirname, 'profiles.json');
const telemetryQuery = 'name,driver_version,pstate,persistence_mode,compute_mode,power.limit,clocks.current.graphics,clocks.current.memory,temperature.gpu,power.draw,utilization.gpu,memory.used,memory.total,clocks_throttle_reasons.active';
const source = `
function observe(out, input, n, rounds) {
  let i = gpu.thread.globalX();
  let step = gpu.u32(0);
  if (i >= n) {
    return;
  }
  let value = input[i];
  while (step < rounds) {
    value ^= value << gpu.u32(13);
    value ^= value >> gpu.u32(17);
    value ^= value << gpu.u32(5);
    step++;
  }
  out[i] = value;
}
`;
const functions = [{ name: 'observe', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }, { name: 'input', type: 'ptr<u32>' }, { name: 'n', type: 'u32' }, { name: 'rounds', type: 'u32' }], returns: 'void' }];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function safeFailure(error, fallback = 'UnknownError') {
  const name = error instanceof Error && /^[A-Za-z][A-Za-z0-9]{0,63}$/u.test(error.name) ? error.name : fallback;
  const code = typeof error?.code === 'string' && /^[A-Z][A-Z0-9_]{0,63}$/u.test(error.code) ? error.code : undefined;
  return code ? { name, code } : { name };
}

function u32Bytes(values) {
  return new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
}

function expectedOutput(input, rounds) {
  return Uint32Array.from(input, (initial) => {
    let value = initial >>> 0;
    for (let step = 0; step < rounds; step += 1) {
      value = (value ^ ((value << 13) >>> 0)) >>> 0;
      value = (value ^ (value >>> 17)) >>> 0;
      value = (value ^ ((value << 5) >>> 0)) >>> 0;
    }
    return value;
  });
}

async function git(args) {
  const { stdout } = await execFile('git', args, { cwd: repositoryRoot, windowsHide: true });
  return stdout.trim();
}

async function sha256File(file) {
  return sha256Bytes(await readFile(file));
}

class TelemetrySampler {
  constructor(intervalMilliseconds) {
    this.intervalMilliseconds = intervalMilliseconds;
    this.phase = 'preflight';
    this.samples = [];
    this.timer = null;
    this.sampling = false;
  }

  setPhase(phase) { this.phase = phase; }

  async sample() {
    if (this.sampling) return;
    this.sampling = true;
    const recordedAt = new Date().toISOString();
    const memory = process.memoryUsage();
    try {
      const { stdout } = await execFile('nvidia-smi', [`--query-gpu=${telemetryQuery}`, '--format=csv,noheader,nounits'], { windowsHide: true, timeout: Math.max(5_000, this.intervalMilliseconds * 2) });
      const lines = stdout.trim().split(/\r?\n/u).filter(Boolean);
      assert.equal(lines.length, 1, 'The first observation profile requires exactly one visible GPU.');
      this.samples.push({ recordedAt, phase: this.phase, ...parseNvidiaTelemetry(lines[0]), processRssBytes: memory.rss, processHeapUsedBytes: memory.heapUsed });
    } catch (error) {
      this.samples.push({ recordedAt, phase: this.phase, error: error instanceof Error ? error.name : 'UnknownTelemetryError' });
    } finally {
      this.sampling = false;
    }
  }

  async start() {
    await this.sample();
    this.timer = setInterval(() => void this.sample(), this.intervalMilliseconds);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    while (this.sampling) await delay(10);
    await this.sample();
  }
}

async function runProfile(profile) {
  assert.equal(process.platform, profile.host.platform, `Profile ${profile.id} requires ${profile.host.platform}.`);
  assert.equal(process.arch, profile.host.architecture, `Profile ${profile.id} requires ${profile.host.architecture}.`);
  assert.equal(process.version, profile.host.node, `Profile ${profile.id} requires ${profile.host.node}.`);
  assert.equal(await git(['status', '--porcelain', '--untracked-files=no']), '', 'Performance evidence requires a clean tracked worktree.');

  const startedAt = new Date().toISOString();
  const runId = startedAt.replaceAll(/[-:.]/gu, '');
  const outputDirectory = path.join(repositoryRoot, 'build', 'performance-soak', profile.id, runId);
  const sampler = new TelemetrySampler(profile.sampling.telemetryIntervalMilliseconds);
  const input = Uint32Array.from({ length: profile.workload.elementCount }, (_, index) => (Math.imul(index + 1, 0x9e3779b9) ^ 0xa5a5a5a5) >>> 0);
  const expected = u32Bytes(expectedOutput(input, profile.workload.rounds));
  const expectedSha256 = sha256Bytes(expected);
  const correctnessChecks = [];
  const sampledLatenciesMilliseconds = [];
  let runtime;
  let output;
  let inputMemory;
  let module;
  let fn;
  let terminal;
  let failure = null;
  let launchCount = 0;
  let workloadLaunchCount = 0;
  let workloadElapsedMilliseconds = 0;
  let totalLatencyMilliseconds = 0;
  let minimumLatencyMilliseconds = Number.POSITIVE_INFINITY;
  let maximumLatencyMilliseconds = 0;
  let deviceProgram;
  let compilerArtifact;
  let runtimeProfile;
  const cold = {};

  async function verifyOutput(label) {
    const bytes = (await output.read({ byteLength: expected.byteLength })).bytes;
    const observedSha256 = sha256Bytes(bytes);
    const check = { label, launchCount, observedSha256, expectedSha256, pass: observedSha256 === expectedSha256 };
    correctnessChecks.push(check);
    assert.equal(check.pass, true, `${label} output differs from the independent host oracle.`);
  }

  await sampler.start();
  sampler.setPhase('idle');
  await delay(profile.phases.idleMilliseconds);
  try {
    sampler.setPhase('cold');
    let mark = performance.now();
    runtime = await openCudaRuntime({ compiler: true, driver: { memory: { maxDeviceBytes: profile.workload.elementCount * 8 + 4096, maxAllocationBytes: profile.workload.elementCount * 4, maxTransferBytes: profile.workload.elementCount * 4 }, execution: { maxModuleBytes: 2_097_152, maxArguments: 4, maxCompletionMilliseconds: 60_000 } } });
    cold.runtimeOpenMilliseconds = performance.now() - mark;
    const description = await runtime.describe();
    assert.equal(description.profile.cudaApiVersion, profile.host.cuda.apiVersion, 'CUDA API version differs from the profile.');
    assert.equal(description.device.attributes.computeCapabilityMajor, profile.host.cuda.computeCapabilityMajor, 'Compute-capability major differs from the profile.');
    assert.equal(description.device.attributes.computeCapabilityMinor, profile.host.cuda.computeCapabilityMinor, 'Compute-capability minor differs from the profile.');
    assert.equal(description.compiler.provider.profile, profile.host.cuda.compilerProviderProfile, 'Compiler provider differs from the profile.');
    runtimeProfile = { profile: description.profile, driver: description.driver, device: description.device, compiler: { provider: description.compiler.provider } };
    mark = performance.now();
    const compiled = await compileDeviceProgram(runtime, { source, functions });
    cold.compileMilliseconds = performance.now() - mark;
    deviceProgram = { contract: compiled.deviceProgram.contract, sha256: compiled.deviceProgram.sha256 };
    compilerArtifact = { format: compiled.compiler.artifact.format, byteLength: compiled.compiler.artifact.byteLength, sha256: compiled.compiler.artifact.sha256 };
    mark = performance.now();
    output = await runtime.allocateDevice({ byteLength: expected.byteLength });
    inputMemory = await runtime.allocateDevice({ byteLength: input.byteLength });
    await output.write(new Uint8Array(expected.byteLength));
    await inputMemory.write(u32Bytes(input));
    cold.allocateAndInitializeMilliseconds = performance.now() - mark;
    mark = performance.now();
    module = await runtime.loadModule({ format: compiled.compiler.artifact.format, bytes: compiled.compiler.artifact.bytes });
    const kernel = compiled.deviceProgram.kernels.find((entry) => entry.name === 'observe');
    assert(kernel);
    fn = await module.getFunction({ name: kernel.functionName, parameters: kernel.parameters });
    cold.moduleAndFunctionMilliseconds = performance.now() - mark;

    sampler.setPhase('warmup');
    for (let index = 0; index < profile.phases.warmupLaunches; index += 1) {
      const completion = await fn.launch({ grid: { x: profile.workload.elementCount / profile.workload.blockX, y: 1, z: 1 }, block: { x: profile.workload.blockX, y: 1, z: 1 }, arguments: [output, inputMemory, profile.workload.elementCount, profile.workload.rounds] });
      assert.equal(completion.status, 'completed');
      launchCount += 1;
    }
    await verifyOutput('post-warmup');

    sampler.setPhase('workload');
    const workloadStart = performance.now();
    while ((workloadElapsedMilliseconds = performance.now() - workloadStart) < profile.phases.workloadMilliseconds) {
      const launchStart = performance.now();
      const completion = await fn.launch({ grid: { x: profile.workload.elementCount / profile.workload.blockX, y: 1, z: 1 }, block: { x: profile.workload.blockX, y: 1, z: 1 }, arguments: [output, inputMemory, profile.workload.elementCount, profile.workload.rounds] });
      const latency = performance.now() - launchStart;
      assert.equal(completion.status, 'completed');
      launchCount += 1;
      workloadLaunchCount += 1;
      totalLatencyMilliseconds += latency;
      minimumLatencyMilliseconds = Math.min(minimumLatencyMilliseconds, latency);
      maximumLatencyMilliseconds = Math.max(maximumLatencyMilliseconds, latency);
      if (workloadLaunchCount % profile.sampling.latencySampleStride === 0) sampledLatenciesMilliseconds.push(latency);
      if (workloadLaunchCount % profile.sampling.correctnessEveryLaunches === 0) await verifyOutput(`workload-${workloadLaunchCount}`);
    }
    workloadElapsedMilliseconds = performance.now() - workloadStart;
    await verifyOutput('post-workload');
  } catch (error) {
    failure = safeFailure(error);
  } finally {
    sampler.setPhase('teardown');
    for (const resource of [fn, module, inputMemory, output]) {
      try { if (resource) await resource.close(); } catch (error) { failure ??= safeFailure(error, 'CleanupError'); }
    }
    if (runtime) {
      try { terminal = await runtime.close(); } catch (error) { failure ??= safeFailure(error, 'RuntimeCloseError'); }
    }
  }

  sampler.setPhase('cooldown');
  await delay(profile.phases.cooldownMilliseconds);
  await sampler.stop();
  const invalidReasons = evaluateRun({ profile, samples: sampler.samples, correctnessChecks, terminal, launchCount, workloadElapsedMilliseconds });
  if (failure) invalidReasons.push('execution-failure');
  const sourceCommit = await git(['rev-parse', 'HEAD']);
  const sourceTree = await git(['show', '-s', '--format=%T', 'HEAD']);
  const telemetrySample = sampler.samples.find((sample) => !sample.error);
  const telemetryIdentity = telemetrySample ? { gpuName: telemetrySample.gpuName, driverVersion: telemetrySample.driverVersion, persistenceMode: telemetrySample.persistenceMode, computeMode: telemetrySample.computeMode, memoryTotalMiB: telemetrySample.memoryTotalMiB, powerLimitWatts: telemetrySample.powerLimitWatts } : null;
  const rawSamples = `${sampler.samples.map((sample) => canonicalJson(sample)).join('\n')}\n`;
  const latencySummary = sampledLatenciesMilliseconds.length > 0 ? summarizeNumbers(sampledLatenciesMilliseconds) : null;
  const result = {
    schemaVersion: 1,
    profile: profile.id,
    status: invalidReasons.length === 0 ? 'pass' : 'invalid',
    startedAt,
    completedAt: new Date().toISOString(),
    subject: { sourceCommit, sourceTree, package: JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8')).version, node: { version: process.version, executableSha256: await sha256File(process.execPath) }, platform: process.platform, architecture: process.arch, operatingSystem: { release: os.release(), version: os.version() }, runtime: runtimeProfile, telemetryGpu: telemetryIdentity },
    methodology: {
      profileSha256: sha256Canonical(profile),
      profile,
      synchronization: 'Each public function launch is awaited to terminal completion before the next launch.',
      latencyBoundary: 'Application-thread time from public fn.launch() call through terminal completion.',
      telemetry: 'Read-only nvidia-smi query plus process.memoryUsage(); no device or host setting is changed.',
      ambientAssumption: 'Indoor ambient is not instrumented; thermal values are observations and cannot support ambient-normalized capacity claims.',
      competingLoadAssumption: 'Ordinary WDDM desktop activity may exist; idle-phase utilization and noise limits invalidate excessive baseline load.',
    },
    identity: { deviceProgram, compilerArtifact, expectedOutputSha256: expectedSha256 },
    observations: {
      cold, launchCount, warmupLaunchCount: profile.phases.warmupLaunches, workloadLaunchCount, workloadElapsedMilliseconds,
      throughputElementsPerSecond: workloadElapsedMilliseconds > 0 ? workloadLaunchCount * profile.workload.elementCount / (workloadElapsedMilliseconds / 1000) : 0,
      latency: latencySummary ? { ...latencySummary, allLaunchMean: totalLatencyMilliseconds / workloadLaunchCount, allLaunchMinimum: minimumLatencyMilliseconds, allLaunchMaximum: maximumLatencyMilliseconds, sampleStride: profile.sampling.latencySampleStride } : null,
      telemetry: summarizeTelemetry(sampler.samples), correctnessChecks, terminal,
    },
    rawEvidence: { telemetrySampleCount: sampler.samples.length, telemetryJsonlSha256: sha256Bytes(Buffer.from(rawSamples)), sampledLatencyCount: sampledLatenciesMilliseconds.length, sampledLatenciesSha256: sha256Canonical(sampledLatenciesMilliseconds) },
    invalidReasons: [...new Set(invalidReasons)].sort(),
    failure,
    claim: profile.claim,
  };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, 'samples.jsonl'), rawSamples);
  await writeFile(path.join(outputDirectory, 'sampled-latencies.json'), `${canonicalJson(sampledLatenciesMilliseconds)}\n`);
  await writeFile(path.join(outputDirectory, 'qualification.json'), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(outputDirectory, 'public-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ profile: profile.id, status: result.status, invalidReasons: result.invalidReasons, outputDirectory, publicSummarySha256: sha256Canonical(result) }));
  if (result.status !== 'pass') process.exitCode = 1;
  return result;
}

export async function run(profileId) {
  const profiles = validateProfiles(JSON.parse(await readFile(profilesPath, 'utf8')));
  const profile = profiles.profiles.find((entry) => entry.id === profileId);
  assert(profile, `Unknown performance profile: ${profileId}`);
  return runProfile(profile);
}
