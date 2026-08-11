import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SyntheticFfiActor } from './actor-client.mjs';
import { expectedCaseResult } from './expectations.mjs';
import { evidenceRoot, nativeLibraryPath, repositoryRoot, runtimeIrPath } from './paths.mjs';
import { loadRuntimeIr } from './runtime-ir.mjs';

if (!existsSync(nativeLibraryPath)) {
  throw new Error('EXP-000 native fixture is missing. Run npm run exp:000:build first.');
}

const caseFlag = process.argv.indexOf('--case');
const selectedId = caseFlag >= 0 ? process.argv[caseFlag + 1] : null;
if (caseFlag >= 0 && !selectedId) throw new Error('--case requires a stable case id.');

const ir = await loadRuntimeIr(runtimeIrPath);
const buildEvidence = JSON.parse(await readFile(path.join(evidenceRoot, 'build.json'), 'utf8'));
const runnable = ir.cases.filter((entry) =>
  entry.runner === 'direct'
  || entry.category === 'pointer'
  || entry.category === 'structure'
  || entry.runner === 'resolver-only'
  || entry.runner === 'callback-same-thread');
const selected = selectedId ? runnable.filter((entry) => entry.id === selectedId) : runnable;
if (selected.length === 0) throw new Error(`Unknown or non-correctness case id: ${selectedId}`);

const actor = await SyntheticFfiActor.create();
const ready = await actor.ready();
const results = [];
let cleanup;
let failure;

try {
  const layoutReport = await actor.request('layout-report');
  assert.deepEqual(layoutReport, buildEvidence.oracle.layouts, 'Runtime layout queries must match the direct C oracle.');
  for (const [name, layout] of Object.entries(ir.layouts)) {
    assert.equal(layoutReport[name].size, layout.size, `${name} size must match Runtime IR.`);
    assert.equal(layoutReport[name].alignment, layout.alignment, `${name} alignment must match Runtime IR.`);
    assert.deepEqual(layoutReport[name].fields, Object.fromEntries(layout.fields.map((field) => [field.name, field.offset])));
  }

  for (const entry of selected) {
    const actual = await actor.execute(entry.id);
    const expected = expectedCaseResult(entry, buildEvidence.oracle);
    try {
      if (typeof expected === 'number' && Number.isFinite(expected)) {
        const tolerance = Number.isInteger(expected) ? 0 : Math.max(1e-6, Math.abs(expected) * 1e-6);
        assert.ok(Math.abs(actual - expected) <= tolerance, `${entry.id}: expected ${expected}; received ${actual}`);
      } else {
        assert.deepEqual(actual, expected);
      }
      results.push({
        id: entry.id,
        status: 'pass',
        actual,
        fastEligibility: ready.fastEligibility[entry.symbol],
      });
      console.log(`PASS ${entry.id}`);
    } catch (error) {
      results.push({ id: entry.id, status: 'fail', actual, expected, error: error.message });
      throw error;
    }
  }
} catch (error) {
  failure = { name: error.name, message: error.message, stack: error.stack };
} finally {
  cleanup = await actor.close();
}

assert.equal(cleanup.cleanup.nativeLiveAfterResources, '0', 'Correctness actor must release every native allocation.');
await mkdir(evidenceRoot, { recursive: true });
const evidence = {
  schemaVersion: 1,
  experiment: 'EXP-000',
  capsule: 'correctness',
  status: failure ? 'fail' : 'pass',
  generatedAt: new Date().toISOString(),
  profile: ready.profile,
  sourceIdentity: ir.sourceIdentity,
  librarySha256: buildEvidence.artifacts.library.sha256,
  selectedCase: selectedId,
  results,
  cleanup,
  failure,
  claimLimits: [
    'Correctness is proven only for the exact recorded Node/Windows/MSVC artifact profile.',
    'Static fast eligibility is not direct Fast FFI qualification.',
    'No CUDA behavior is exercised.',
  ],
};
await writeFile(path.join(evidenceRoot, 'correctness.json'), `${JSON.stringify(evidence, null, 2)}\n`);

if (failure) {
  console.error(`FAIL ${failure.message}`);
  process.exit(1);
}
console.log(`EXP-000 correctness: ${results.length} cases passed.`);
console.log(`Evidence: ${path.relative(repositoryRoot, path.join(evidenceRoot, 'correctness.json'))}`);
