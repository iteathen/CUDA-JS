const FULL_SHA = /^[0-9a-f]{40}$/;
const RELEASE = /^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const REMOTE_SOURCE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/;
const USES_PREFIX = /^\s*(?:-\s*)?uses\s*:/;
const USES_LINE = /^\s*(?:-\s*)?uses\s*:\s*([^\s#]+)(?:\s+#\s*(\S(?:.*\S)?))?\s*$/;

const expectedPolicy = {
  remoteReferences: 'full-length-git-commit-sha',
  releaseComments: 'required-on-same-line',
  localReferences: 'allowed-within-current-repository-without-a-ref',
  remoteReusableWorkflows: 'same-policy-as-remote-actions',
  dockerReferences: 'prohibited',
};

function isRepositoryLocal(source) {
  if (!source.startsWith('./') || source.includes('@') || source.includes('\\')) return false;
  const segments = source.slice(2).split('/');
  return segments.length > 0 && segments.every((segment) => segment.length > 0 && segment !== '.' && segment !== '..');
}

function parseRemote(source) {
  const separator = source.lastIndexOf('@');
  if (separator <= 0 || separator === source.length - 1) return null;
  const action = source.slice(0, separator);
  const revision = source.slice(separator + 1);
  if (!REMOTE_SOURCE.test(action) || action.split('/').some((segment) => segment === '.' || segment === '..')) return null;
  return { action, revision, repository: action.split('/').slice(0, 2).join('/') };
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function sameStrings(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateProvenance(errors, provenance) {
  if (provenance?.schemaVersion !== 1) errors.push('action provenance must use schemaVersion 1');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(provenance?.reviewedAt ?? '')) {
    errors.push('action provenance must record reviewedAt as YYYY-MM-DD');
  }
  for (const [field, value] of Object.entries(expectedPolicy)) {
    if (provenance?.policy?.[field] !== value) errors.push(`action provenance policy.${field} must be ${value}`);
  }
  if (!Array.isArray(provenance?.dependencies)) {
    errors.push('action provenance dependencies must be an array');
    return new Map();
  }
  const sources = provenance.dependencies.map((dependency) => dependency?.source);
  if (!sameStrings(sources, sortedUnique(sources))) {
    errors.push('action provenance dependencies must be sorted by unique source');
  }

  const dependencies = new Map();
  for (const dependency of provenance.dependencies) {
    const label = dependency?.source ?? '<missing-source>';
    if (typeof dependency?.source !== 'string' || !REMOTE_SOURCE.test(dependency.source)) {
      errors.push(`action provenance has invalid source: ${label}`);
      continue;
    }
    if (dependencies.has(dependency.source)) errors.push(`action provenance duplicates source: ${dependency.source}`);
    dependencies.set(dependency.source, dependency);

    const repository = dependency.source.split('/').slice(0, 2).join('/');
    if (dependency.repository !== repository) errors.push(`action provenance repository differs from source: ${dependency.source}`);
    if (!RELEASE.test(dependency.release ?? '')) errors.push(`action provenance has invalid release for ${dependency.source}`);
    if (!FULL_SHA.test(dependency.commit ?? '')) errors.push(`action provenance has invalid full commit SHA for ${dependency.source}`);
    if (dependency.releaseUrl !== `https://github.com/${repository}/releases/tag/${dependency.release}`) {
      errors.push(`action provenance has invalid release URL for ${dependency.source}`);
    }
    if (dependency.commitUrl !== `https://github.com/${repository}/commit/${dependency.commit}`) {
      errors.push(`action provenance has invalid commit URL for ${dependency.source}`);
    }
    if (typeof dependency.license !== 'string' || dependency.license.length === 0) {
      errors.push(`action provenance is missing license identity for ${dependency.source}`);
    }
    if (dependency.licenseUrl !== `https://github.com/${repository}/blob/${dependency.commit}/LICENSE`) {
      errors.push(`action provenance has invalid immutable license URL for ${dependency.source}`);
    }
    if (!Array.isArray(dependency.workflows)
        || dependency.workflows.some((workflow) => typeof workflow !== 'string')
        || !sameStrings(dependency.workflows, sortedUnique(dependency.workflows))) {
      errors.push(`action provenance workflows must be sorted and unique for ${dependency.source}`);
    }
  }
  return dependencies;
}

function validateDependabot(errors, dependabot) {
  if (!/^version:\s*2\s*$/m.test(dependabot)) errors.push('Dependabot must use configuration version 2');
  const lines = dependabot.split(/\r?\n/);
  const entries = lines.flatMap((line, index) => {
    const match = line.match(/^(\s*)-\s+package-ecosystem:\s*["']([^"']+)["']\s*$/);
    return match ? [{ index, indent: match[1], ecosystem: match[2] }] : [];
  });
  const actionEntries = entries.filter((entry) => entry.ecosystem === 'github-actions');
  if (actionEntries.length !== 1) {
    errors.push('Dependabot must contain exactly one github-actions update entry');
    return;
  }
  const entry = actionEntries[0];
  const next = entries.find((candidate) => candidate.index > entry.index && candidate.indent === entry.indent);
  const block = lines.slice(entry.index, next?.index ?? lines.length).join('\n');
  const child = `${entry.indent}  `;
  const grandchild = `${child}  `;
  const requirements = [
    [new RegExp(`^${child}directory:\\s*["']\\/["']\\s*$`, 'm'), 'Dependabot github-actions updates must scan the repository root'],
    [new RegExp(`^${child}schedule:\\s*$`, 'm'), 'Dependabot github-actions updates must declare a schedule'],
    [new RegExp(`^${grandchild}interval:\\s*["']weekly["']\\s*$`, 'm'), 'Dependabot github-actions updates must use the reviewed weekly cadence'],
    [new RegExp(`^${child}open-pull-requests-limit:\\s*3\\s*$`, 'm'), 'Dependabot github-actions updates must retain the reviewed pull-request limit'],
  ];
  for (const [pattern, message] of requirements) if (!pattern.test(block)) errors.push(message);
  if (/^\s*groups\s*:/m.test(block)) {
    errors.push('Dependabot github-actions updates must remain independently reviewable instead of grouped');
  }
}

export function validateWorkflowActionPolicy({ workflows, provenance, dependabot }) {
  const errors = [];
  const dependencies = validateProvenance(errors, provenance);
  const observed = new Map();

  for (const [workflow, text] of Object.entries(workflows).sort(([left], [right]) => left.localeCompare(right))) {
    for (const [index, line] of text.split(/\r?\n/).entries()) {
      if (!USES_PREFIX.test(line)) continue;
      const match = line.match(USES_LINE);
      if (!match) {
        errors.push(`${workflow}:${index + 1} has a malformed or expression-based uses reference`);
        continue;
      }
      const [, source, comment] = match;
      if (source.startsWith('docker://')) {
        errors.push(`${workflow}:${index + 1} uses a prohibited docker action reference`);
        continue;
      }
      if (source.startsWith('.')) {
        if (!isRepositoryLocal(source)) errors.push(`${workflow}:${index + 1} has an invalid repository-local uses reference`);
        continue;
      }

      const remote = parseRemote(source);
      if (!remote) {
        errors.push(`${workflow}:${index + 1} has an invalid remote action or reusable-workflow reference`);
        continue;
      }
      if (!FULL_SHA.test(remote.revision)) {
        errors.push(`${workflow}:${index + 1} remote reference ${remote.action} must use a full immutable commit SHA`);
        continue;
      }
      const dependency = dependencies.get(remote.action);
      if (!dependency) {
        errors.push(`${workflow}:${index + 1} remote reference ${remote.action} lacks reviewed provenance`);
        continue;
      }
      if (remote.revision !== dependency.commit) {
        errors.push(`${workflow}:${index + 1} remote reference ${remote.action} differs from reviewed provenance`);
      }
      if (comment !== dependency.release) {
        errors.push(`${workflow}:${index + 1} remote reference ${remote.action} must carry same-line release comment ${dependency.release}`);
      }
      const uses = observed.get(remote.action) ?? [];
      uses.push(workflow);
      observed.set(remote.action, uses);
    }
  }

  for (const [source, dependency] of dependencies) {
    const actual = sortedUnique(observed.get(source) ?? []);
    if (!sameStrings(actual, dependency.workflows)) {
      errors.push(`action provenance workflow inventory differs for ${source}: expected ${JSON.stringify(actual)}`);
    }
  }
  validateDependabot(errors, dependabot);
  return errors;
}
