import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const forbiddenLiveKeys = new Set([
  'current_main',
  'current_main_tree',
  'live_main',
  'live_main_tree',
]);

function visitKeys(value, errors, prefix = '') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visitKeys(item, errors, `${prefix}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    const location = prefix ? `${prefix}.${key}` : key;
    if (forbiddenLiveKeys.has(key)) {
      errors.push(`forbidden self-referential live-state key: ${location}`);
    }
    visitKeys(child, errors, location);
  }
}

function isSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

export function validateCurrentStateContract({
  packageJson,
  compatibilityManifest,
  nextStep,
  statusText,
  rootAgentsText,
  canonicalAgentsText,
}) {
  const errors = [];
  const expectedPackage = `${packageJson?.name}@${packageJson?.version}`;

  if (!packageJson?.name || !packageJson?.version) {
    errors.push('package.json must provide name and version');
  }

  if (nextStep?.package_candidate !== expectedPackage) {
    errors.push(`next_step package_candidate must equal ${expectedPackage}`);
  }

  if (compatibilityManifest?.package?.name !== packageJson?.name) {
    errors.push('compatibility manifest package name must match package.json');
  }
  if (compatibilityManifest?.package?.version !== packageJson?.version) {
    errors.push('compatibility manifest package version must match package.json');
  }
  if (nextStep?.public_api_schema !== compatibilityManifest?.publicApi?.schemaVersion) {
    errors.push('next_step public_api_schema must match compatibility manifest publicApi.schemaVersion');
  }

  const focus = nextStep?.current_focus;
  if (!focus || focus.repository !== 'iteathen/CUDA-JS' || !Number.isInteger(focus.issue) || focus.issue <= 0) {
    errors.push('next_step current_focus must identify one positive CUDA-JS issue');
  }
  if (typeof focus?.next_action !== 'string' || focus.next_action.trim() === '') {
    errors.push('next_step current_focus.next_action must be non-empty');
  }

  const recorded = nextStep?.recorded_protected_input;
  if (!isSha(recorded?.main) || !isSha(recorded?.tree)) {
    errors.push('recorded_protected_input must contain exact 40-hex main/tree provenance');
  }
  if (typeof recorded?.meaning !== 'string' || !/not a self-updating current-main field/i.test(recorded.meaning)) {
    errors.push('recorded_protected_input.meaning must explicitly reject self-updating current-main semantics');
  }

  visitKeys(nextStep, errors);

  if (typeof statusText !== 'string' || !statusText.includes(expectedPackage)) {
    errors.push(`STATUS.md must name ${expectedPackage}`);
  }
  if (focus?.issue && !statusText.includes(`#${focus.issue}`)) {
    errors.push(`STATUS.md must name current focus #${focus.issue}`);
  }
  if (recorded?.main && !statusText.includes(recorded.main)) {
    errors.push('STATUS.md must name the recorded protected input commit');
  }
  if (!/exact protected branch\/commit\/tree identity is read from GitHub/i.test(statusText)) {
    errors.push('STATUS.md must state that live protected identity comes from GitHub read-back');
  }

  if (typeof rootAgentsText !== 'string' || !rootAgentsText.includes('## Live-state routing')) {
    errors.push('root AGENTS.md must contain Live-state routing');
  }
  if (rootAgentsText?.includes('## Current accepted implementation baseline')) {
    errors.push('root AGENTS.md must not contain the retired live implementation dashboard heading');
  }
  if (!rootAgentsText?.includes('package.json') || !rootAgentsText?.includes('packaging/compatibility-manifest.json')) {
    errors.push('root AGENTS.md must route current package/capability truth to designated owners');
  }

  if (typeof canonicalAgentsText !== 'string' || !canonicalAgentsText.includes('## Current-state discipline')) {
    errors.push('agent_files/AGENTS.md must contain Current-state discipline');
  }
  if (canonicalAgentsText?.includes('## Current workstream')) {
    errors.push('agent_files/AGENTS.md must not contain the retired live workstream dashboard heading');
  }

  return errors;
}

async function readJson(relative) {
  return JSON.parse(await readFile(path.join(root, relative), 'utf8'));
}

export async function validateRepositoryCurrentState() {
  const [packageJson, compatibilityManifest, nextStep, statusText, rootAgentsText, canonicalAgentsText] = await Promise.all([
    readJson('package.json'),
    readJson('packaging/compatibility-manifest.json'),
    readJson('next_step.yaml'),
    readFile(path.join(root, 'STATUS.md'), 'utf8'),
    readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    readFile(path.join(root, 'agent_files/AGENTS.md'), 'utf8'),
  ]);

  return validateCurrentStateContract({
    packageJson,
    compatibilityManifest,
    nextStep,
    statusText,
    rootAgentsText,
    canonicalAgentsText,
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const errors = await validateRepositoryCurrentState();
  if (errors.length > 0) {
    for (const error of errors) console.error(`current-state contract: ${error}`);
    process.exitCode = 1;
  } else {
    console.log('current-state contract: ok');
  }
}
