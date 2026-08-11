import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

import { SyntheticFfiActor } from './actor-client.mjs';
import { evidenceRoot, repositoryRoot } from './paths.mjs';

const actor = await SyntheticFfiActor.create();
const ready = await actor.ready();
const cases = ['args.integer.3', 'args.integer.4', 'args.floating.3', 'args.floating.4'];
const iterations = 25000;
const sampleCount = 8;
const samples = {};

try {
  for (const caseId of cases) {
    await actor.request('benchmark', { caseId, iterations: 1000 });
    samples[caseId] = [];
    for (let sample = 0; sample < sampleCount; sample++) {
      samples[caseId].push(await actor.request('benchmark', { caseId, iterations }));
    }
  }

  const roundTrips = [];
  for (let sample = 0; sample < 50; sample++) {
    const started = performance.now();
    await actor.execute('args.integer.3');
    roundTrips.push(Math.round((performance.now() - started) * 1e6));
  }

  for (const caseId of cases) {
    const terminal = samples[caseId][0].terminalValue;
    assert.ok(samples[caseId].every((entry) => entry.terminalValue === terminal));
  }

  await mkdir(evidenceRoot, { recursive: true });
  const evidence = {
    schemaVersion: 1,
    experiment: 'EXP-000',
    capsule: 'benchmark',
    status: 'pass',
    generatedAt: new Date().toISOString(),
    profile: ready.profile,
    iterations,
    sampleCount,
    samples,
    roundTripNanoseconds: roundTrips,
    staticEligibility: Object.fromEntries(cases.map((caseId) => {
      const symbol = `cjs_args_${caseId.split('.')[1]}_${caseId.split('.')[2]}`;
      return [caseId, ready.fastEligibility[symbol]];
    })),
    claimLimits: [
      'Raw samples are calibration evidence, not a performance support claim.',
      'Timing does not directly prove Fast FFI selection.',
      'Worker round-trip and batched native-call costs are reported separately.',
    ],
  };
  await writeFile(path.join(evidenceRoot, 'benchmark.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log('EXP-000 benchmark samples recorded.');
  console.log(`Evidence: ${path.relative(repositoryRoot, path.join(evidenceRoot, 'benchmark.json'))}`);
} finally {
  const cleanup = await actor.close();
  assert.equal(cleanup.cleanup.nativeLiveAfterResources, '0');
}
