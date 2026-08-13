import assert from 'node:assert/strict';
import test from 'node:test';

import { validateWorkflowActionPolicy } from './workflow-action-policy.mjs';

const actionSha = '1111111111111111111111111111111111111111';
const reusableSha = '2222222222222222222222222222222222222222';

function dependency(source, release, commit, workflows) {
  const repository = source.split('/').slice(0, 2).join('/');
  return {
    source,
    repository,
    release,
    commit,
    releaseUrl: `https://github.com/${repository}/releases/tag/${release}`,
    commitUrl: `https://github.com/${repository}/commit/${commit}`,
    license: 'MIT',
    licenseUrl: `https://github.com/${repository}/blob/${commit}/LICENSE`,
    workflows,
  };
}

function fixture() {
  return {
    workflows: {
      '.github/workflows/ci.yml': [
        `      - uses: owner/action@${actionSha} # v1.2.3`,
        '      - uses: ./.github/actions/local-check',
        `    uses: owner/reusable/.github/workflows/check.yml@${reusableSha} # v2.0.0`,
      ].join('\n'),
    },
    provenance: {
      schemaVersion: 1,
      reviewedAt: '2026-08-13',
      policy: {
        remoteReferences: 'full-length-git-commit-sha',
        releaseComments: 'required-on-same-line',
        localReferences: 'allowed-within-current-repository-without-a-ref',
        remoteReusableWorkflows: 'same-policy-as-remote-actions',
        dockerReferences: 'prohibited',
      },
      dependencies: [
        dependency('owner/action', 'v1.2.3', actionSha, ['.github/workflows/ci.yml']),
        dependency('owner/reusable/.github/workflows/check.yml', 'v2.0.0', reusableSha, ['.github/workflows/ci.yml']),
      ],
    },
    dependabot: [
      'version: 2',
      'updates:',
      '  - package-ecosystem: "github-actions"',
      '    directory: "/"',
      '    schedule:',
      '      interval: "weekly"',
      '    open-pull-requests-limit: 3',
    ].join('\n'),
  };
}

test('full-SHA actions, remote reusable workflows, and repository-local actions satisfy policy', () => {
  assert.deepEqual(validateWorkflowActionPolicy(fixture()), []);
});

test('mutable, unreviewed, stale, malformed, docker, and uncontrolled update paths are rejected', () => {
  const cases = [
    (value) => { value.workflows['.github/workflows/ci.yml'] = value.workflows['.github/workflows/ci.yml'].replace(`${actionSha} # v1.2.3`, 'v1 # v1'); },
    (value) => { value.workflows['.github/workflows/ci.yml'] = value.workflows['.github/workflows/ci.yml'].replace('# v1.2.3', '# v1.2.4'); },
    (value) => { value.workflows['.github/workflows/ci.yml'] += `\n      - uses: owner/unreviewed@${actionSha} # v1.0.0`; },
    (value) => { value.provenance.dependencies[0].workflows = []; },
    (value) => { value.workflows['.github/workflows/ci.yml'] += '\n      - uses: docker://alpine:latest'; },
    (value) => { value.workflows['.github/workflows/ci.yml'] += '\n      - uses: ../outside'; },
    (value) => { value.workflows['.github/workflows/ci.yml'] += '\n      - uses: owner/action@${{ github.sha }}'; },
    (value) => { value.provenance.dependencies[0].commitUrl = 'https://example.invalid/commit'; },
    (value) => { value.dependabot = value.dependabot.replace('weekly', 'monthly'); },
    (value) => { value.dependabot += '\n    groups:\n      actions:\n        patterns: ["*"]'; },
    (value) => { value.dependabot = `${value.dependabot.replace('      interval: "weekly"\n', '')}\n  - package-ecosystem: "npm"\n    directory: "/"\n    schedule:\n      interval: "weekly"`; },
  ];
  for (const mutate of cases) {
    const value = fixture();
    mutate(value);
    assert.notDeepEqual(validateWorkflowActionPolicy(value), []);
  }
});
