import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
const verifyWorkflow = await text('.github/workflows/docs.yml');
const nodeWorkflow = await text('.github/workflows/node-compatibility.yml');
const gitignore = await text('.gitignore');

if (!security.includes('GitHub private vulnerability reporting') || !security.includes('currently not enabled')) {
  errors.push('SECURITY.md must state the current private-vulnerability-reporting limitation explicitly');
}
if (!security.includes('Workers provide event-loop isolation') || !security.includes('do **not** provide OS-process crash isolation')) {
  errors.push('SECURITY.md must preserve the Worker-vs-process isolation claim boundary');
}
if (!publicRepository.includes('GitHub private vulnerability reporting is currently **disabled**')) {
  errors.push('docs/PUBLIC_REPOSITORY.md must record the current GitHub security-setting state');
}
if (!contributing.includes('[`SECURITY.md`](SECURITY.md)') || !contributing.includes('Security-sensitive reports')) {
  errors.push('CONTRIBUTING.md must route security-sensitive reports through SECURITY.md');
}
if (!issueConfig.includes('https://github.com/iteathen/CUDA-JS/blob/main/SECURITY.md')) {
  errors.push('issue configuration must route security-sensitive reports to SECURITY.md');
}
if (issueConfig.includes('/security/advisories/new')) {
  errors.push('issue configuration must not advertise the disabled private vulnerability reporting endpoint');
}
if (!pullRequestTemplate.includes('Security, provenance, licensing, and public-repository effects')) {
  errors.push('pull-request template must include public security/provenance disclosure');
}
for (const [relative, workflow] of [
  ['.github/workflows/docs.yml', verifyWorkflow],
  ['.github/workflows/node-compatibility.yml', nodeWorkflow],
]) {
  if (!/\npermissions:\s*\n\s+contents:\s*read\s*(?:\n|$)/.test(workflow)) {
    errors.push(`${relative} must declare workflow-level contents: read permission`);
  }
  if (/pull_request_target\s*:/.test(workflow)) {
    errors.push(`${relative} must not use pull_request_target for public PR-controlled execution`);
  }
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
