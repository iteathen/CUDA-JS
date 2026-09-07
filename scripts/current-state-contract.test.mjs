import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCurrentStateContract } from './current-state-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadRepositoryFixture() {
  const [packageJson, compatibilityManifest, nextStep, statusText, rootAgentsText, agentLocalText] = await Promise.all([
    readFile(path.join(root, 'package.json'), 'utf8').then(JSON.parse),
    readFile(path.join(root, 'packaging/compatibility-manifest.json'), 'utf8').then(JSON.parse),
    readFile(path.join(root, 'next_step.yaml'), 'utf8').then(JSON.parse),
    readFile(path.join(root, 'STATUS.md'), 'utf8'),
    readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    readFile(path.join(root, 'AGENT_LOCAL.md'), 'utf8'),
  ]);
  return { packageJson, compatibilityManifest, nextStep, statusText, rootAgentsText, agentLocalText };
}

function clone(value) {
  return structuredClone(value);
}

test('current repository state satisfies the freshness contract', async () => {
  const fixture = await loadRepositoryFixture();
  assert.deepEqual(validateCurrentStateContract(fixture), []);
});

test('rejects package projection drift', async () => {
  const fixture = await loadRepositoryFixture();
  const nextStep = clone(fixture.nextStep);
  nextStep.package_candidate = 'cuda-js@0.1.0-alpha.17';
  const errors = validateCurrentStateContract({ ...fixture, nextStep });
  assert.ok(errors.some((error) => error.includes('package_candidate')));
});

test('rejects compatibility manifest version drift', async () => {
  const fixture = await loadRepositoryFixture();
  const compatibilityManifest = clone(fixture.compatibilityManifest);
  compatibilityManifest.package.version = '0.1.0-alpha.17';
  const errors = validateCurrentStateContract({ ...fixture, compatibilityManifest });
  assert.ok(errors.some((error) => error.includes('manifest package version')));
});

test('rejects self-referential live main fields', async () => {
  const fixture = await loadRepositoryFixture();
  const nextStep = clone(fixture.nextStep);
  nextStep.current_main = '0'.repeat(40);
  nextStep.current_main_tree = '1'.repeat(40);
  const errors = validateCurrentStateContract({ ...fixture, nextStep });
  assert.ok(errors.some((error) => error.includes('current_main')));
  assert.ok(errors.some((error) => error.includes('current_main_tree')));
});

test('rejects status/current-focus disagreement for the active issue', async () => {
  const fixture = await loadRepositoryFixture();
  const issue = fixture.nextStep.current_focus.issue;
  const marker = `#${issue}`;
  assert.ok(fixture.statusText.includes(marker));
  const errors = validateCurrentStateContract({
    ...fixture,
    statusText: fixture.statusText.replaceAll(marker, '#999'),
  });
  assert.ok(errors.some((error) => error.includes(`current focus #${issue}`)));
});

test('rejects root AGENTS mutation away from the immutable global redirect', async () => {
  const fixture = await loadRepositoryFixture();
  const errors = validateCurrentStateContract({
    ...fixture,
    rootAgentsText: `${fixture.rootAgentsText}Local policy must not be added here.\n`,
  });
  assert.ok(errors.some((error) => error.includes('exact immutable one-line redirect')));
});

test('rejects local agent routing drift and retired dashboards', async () => {
  const fixture = await loadRepositoryFixture();
  const missingGlobal = validateCurrentStateContract({
    ...fixture,
    agentLocalText: fixture.agentLocalText.replace('account-global `AGENTS.md`', 'local instructions'),
  });
  assert.ok(missingGlobal.some((error) => error.includes('account-global AGENTS.md')));

  const retired = validateCurrentStateContract({
    ...fixture,
    agentLocalText: `${fixture.agentLocalText}\n## Current workstream\n`,
  });
  assert.ok(retired.some((error) => error.includes('retired live implementation/workstream dashboards')));
});
