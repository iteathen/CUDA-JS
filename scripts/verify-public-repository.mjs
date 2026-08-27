import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateWorkflowActionPolicy } from './workflow-action-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

async function text(relative) {
  const target = path.join(root, relative);
  try {
    const info = await stat(target);
    if (!info.isFile() || info.size === 0) {
      errors.push(`missing or empty public-repository file: ${relative}`);
      return '';
    }
    return await readFile(target, 'utf8');
  } catch {
    errors.push(`missing public-repository file: ${relative}`);
    return '';
  }
}

const security = await text('SECURITY.md');
const publicRepository = await text('docs/PUBLIC_REPOSITORY.md');
const contributing = await text('CONTRIBUTING.md');
const issueConfig = await text('.github/ISSUE_TEMPLATE/config.yml');
const pullRequestTemplate = await text('.github/pull_request_template.md');
const gitignore = await text('.gitignore');
const dependabot = await text('.github/dependabot.yml');
const provenanceText = await text('.github/actions-provenance.json');
const workflowDirectory = path.join(root, '.github/workflows');
const workflowPaths = (await readdir(workflowDirectory))
  .filter((name) => /\.ya?ml$/.test(name))
  .map((name) => `.github/workflows/${name}`)
  .sort();
const workflows = Object.fromEntries(await Promise.all(
  workflowPaths.map(async (relative) => [relative, await text(relative)]),
));

if (!security.includes('https://github.com/iteathen/CUDA-JS/security/advisories/new')
    || !security.includes('If the private form is unexpectedly unavailable')) {
  errors.push('SECURITY.md must route reports privately and preserve a fail-safe unavailable-channel path');
}
if (!security.includes('Workers provide event-loop isolation') || !security.includes('do **not** provide OS-process crash isolation')) {
  errors.push('SECURITY.md must preserve the Worker-vs-process isolation claim boundary');
}
if (!publicRepository.includes('GitHub private vulnerability reporting is **enabled**')
    || !publicRepository.includes('source documentation alone cannot prove that setting is enabled')) {
  errors.push('docs/PUBLIC_REPOSITORY.md must record enabled read-back and its external-evidence limit');
}
if (!contributing.includes('[`SECURITY.md`](SECURITY.md)') || !contributing.includes('Security-sensitive reports')) {
  errors.push('CONTRIBUTING.md must route security-sensitive reports through SECURITY.md');
}
if (!issueConfig.includes('https://github.com/iteathen/CUDA-JS/security/advisories/new')) {
  errors.push('issue configuration must route security-sensitive reports to the enabled private reporting endpoint');
}
if (!pullRequestTemplate.includes('Security, provenance, licensing, and public-repository effects')) {
  errors.push('pull-request template must include public security/provenance disclosure');
}
for (const [relative, workflow] of Object.entries(workflows)) {
  if (!/\npermissions:\s*\n\s+contents:\s*read\s*(?:\n|$)/.test(workflow)) {
    errors.push(`${relative} must declare workflow-level contents: read permission`);
  }
  if (/pull_request_target\s*:/.test(workflow)) {
    errors.push(`${relative} must not use pull_request_target for public PR-controlled execution`);
  }
}

try {
  const provenance = JSON.parse(provenanceText);
  errors.push(...validateWorkflowActionPolicy({ workflows, provenance, dependabot, publicRepository }));
} catch (error) {
  errors.push(`.github/actions-provenance.json must contain valid JSON: ${error.message}`);
}

for (const pattern of ['.env', '.env.*', '*.pem', '*.key', '*.p12', '*.pfx', '.netrc', '.npmrc']) {
  if (!gitignore.split(/\r?\n/).includes(pattern)) {
    errors.push(`.gitignore missing defense-in-depth secret pattern: ${pattern}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log('public repository security and collaboration checks passed');
}
