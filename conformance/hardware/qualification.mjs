import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectCudaTarget } from '../../components/cuda-target/index.mjs';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const registryPath = path.join(repositoryRoot, 'conformance', 'hardware', 'registry.json');
export const profilesPath = path.join(repositoryRoot, 'conformance', 'hardware', 'profiles.json');
export const extensionsPath = path.join(repositoryRoot, 'conformance', 'hardware', 'extensions.json');

const requiredCoverage = ['CJS-F2W', 'CJS-F3W', 'CJS-F4W', 'CJS-F5W', 'CJS-F6W', 'CJS-F7W', 'CJS-F8W'];
const profileStatuses = new Set(['runner-ready', 'facade-source-ready', 'driver-compiler-source-ready', 'adapter-incomplete', 'schema-and-adapter-incomplete', 'contract-required']);
const architectureStatuses = new Set(['qualified-one-model', 'seeking-evidence']);
const architecturalDispositions = new Set(['planned', 'deferred', 'unselected', 'rejected', 'not-applicable']);
const implementationStatuses = new Set(['not-implemented', 'experimental', 'partial', 'implemented']);
const qualificationStatuses = new Set(['not-qualified', 'testing-unconfirmed', 'qualified', 'known-incompatible', 'not-applicable']);
const requiredExtensionAxes = ['multi-gpu', 'mig', 'virtualization', 'concurrent-launch', 'performance-thermal-soak', 'ecc', 'driver-toolkit-matrix', 'windows-tcc-server', 'independent-attestation'];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function loadJson(target) {
  return JSON.parse(await readFile(target, 'utf8'));
}

function unique(values, label) {
  invariant(new Set(values).size === values.length, `${label} must be unique.`);
}

function safeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function statusLabel(value) {
  return value.replaceAll('-', ' ');
}

export function validateRegistry(registry, profiles, extensions) {
  invariant(registry.schemaVersion === 1, 'Hardware registry schemaVersion must be 1.');
  invariant(profiles.schemaVersion === 1, 'Qualification profiles schemaVersion must be 1.');
  invariant(registry.supportDocument === 'docs/HARDWARE_SUPPORT.md', 'Unexpected support-document owner.');
  invariant(Array.isArray(registry.upstreamSources) && registry.upstreamSources.length >= 4, 'Primary upstream sources are required.');
  invariant(Array.isArray(registry.coordinationIssues) && registry.coordinationIssues.length > 0, 'Public coordination issues are required.');
  invariant(Array.isArray(registry.architectureCoverage) && registry.architectureCoverage.length > 0, 'Architecture coverage is required.');
  invariant(Array.isArray(registry.qualifiedProfiles) && registry.qualifiedProfiles.length > 0, 'At least one directly qualified profile is required.');
  invariant(Array.isArray(profiles.profiles) && profiles.profiles.length > 0, 'Qualification profiles are required.');
  invariant(extensions?.schemaVersion === 2, 'Hardware extension schemaVersion must be 2.');
  invariant(Array.isArray(extensions.upstreamSources) && extensions.upstreamSources.length >= 3, 'Extended-profile upstream sources are required.');
  invariant(Array.isArray(extensions.axes), 'Hardware extension axes are required.');

  unique(registry.upstreamSources.map((source) => source.id), 'Upstream source IDs');
  for (const source of registry.upstreamSources) {
    invariant(/^https:\/\/(docs\.nvidia\.com|developer\.nvidia\.com)\//.test(source.url), `Upstream source ${source.id} must be an official NVIDIA URL.`);
    invariant(typeof source.use === 'string' && source.use.length > 0, `Upstream source ${source.id} needs a use.`);
  }
  unique(registry.coordinationIssues.map((issue) => issue.number), 'Coordination issue numbers');
  for (const issue of registry.coordinationIssues) {
    invariant(Number.isSafeInteger(issue.number) && issue.number > 0, 'Coordination issues need positive integer numbers.');
    invariant(typeof issue.scope === 'string' && issue.scope.length > 0, `Coordination issue #${issue.number} needs a scope.`);
  }

  unique(registry.architectureCoverage.map((entry) => entry.computeCapability), 'Compute capabilities');
  unique(registry.architectureCoverage.map((entry) => entry.toolkit13_3Target), 'CUDA 13.3 architecture targets');
  const capabilities = new Set(registry.architectureCoverage.map((entry) => entry.computeCapability));
  for (const entry of registry.architectureCoverage) {
    invariant(/^\d+\.\d+$/.test(entry.computeCapability), `Invalid compute capability ${entry.computeCapability}.`);
    const target = inspectCudaTarget(entry.toolkit13_3Target, { expectedPrefix: 'sm' });
    invariant(target.ok, `Invalid or unadmitted CUDA target ${entry.toolkit13_3Target}.`);
    invariant(target.policy.computeCapability === entry.computeCapability, `CUDA target ${entry.toolkit13_3Target} policy metadata does not match compute capability ${entry.computeCapability}.`);
    invariant(/^P[0-2]$/.test(entry.priority), `Invalid priority for ${entry.computeCapability}.`);
    invariant(architectureStatuses.has(entry.status), `Invalid architecture status for ${entry.computeCapability}.`);
  }

  unique(registry.qualifiedProfiles.map((entry) => entry.id), 'Qualified profile IDs');
  for (const entry of registry.qualifiedProfiles) {
    invariant(entry.status === 'qualified-experimental', `${entry.id} has an unsupported qualification status.`);
    invariant(capabilities.has(entry.hardware?.computeCapability), `${entry.id} references an unknown compute capability.`);
    invariant(entry.runtime?.node === 'v26.7.0', `${entry.id} must identify exact Node v26.7.0.`);
    invariant(entry.evidence?.directHardware === true, `${entry.id} lacks direct-hardware evidence.`);
    invariant(entry.evidence?.independentNativeOracle === true, `${entry.id} lacks an independent native oracle.`);
    invariant(entry.evidence?.cleanTree === true, `${entry.id} was not tested from a clean tree.`);
    invariant(entry.evidence?.terminalCleanup === true, `${entry.id} lacks terminal cleanup evidence.`);
    invariant(/^[0-9a-f]{40}$/.test(entry.evidence?.sourceCommit ?? ''), `${entry.id} has an invalid source commit.`);
    invariant(/^[0-9a-f]{40}$/.test(entry.evidence?.integratedCommit ?? ''), `${entry.id} has an invalid integrated commit.`);
    for (const capsule of requiredCoverage) invariant(entry.coverage?.[capsule] === 'pass', `${entry.id} lacks passing ${capsule} evidence.`);
  }

  unique(profiles.profiles.map((profile) => profile.id), 'Qualification profile IDs');
  unique(profiles.profiles.map((profile) => `${profile.host.platform}/${profile.host.architecture}/${profile.host.environment}`), 'Qualification host selectors');
  for (const profile of profiles.profiles) {
    invariant(profileStatuses.has(profile.status), `Invalid status for ${profile.id}.`);
    invariant(profile.requiredNode === 'v26.7.0', `${profile.id} must pin Node v26.7.0.`);
    invariant(Array.isArray(profile.requiredCapsules) && profile.requiredCapsules.length > 0, `${profile.id} needs required capsules.`);
    invariant(Array.isArray(profile.commands), `${profile.id} needs a commands array.`);
    invariant(Array.isArray(profile.evidenceFiles), `${profile.id} needs an evidenceFiles array.`);
    invariant(Array.isArray(profile.missingCapsules), `${profile.id} needs a missingCapsules array.`);
    if (profile.status === 'runner-ready') {
      invariant(profile.commands.length > 0, `${profile.id} is runner-ready without commands.`);
      invariant(profile.evidenceFiles.length > 0, `${profile.id} is runner-ready without evidence files.`);
      invariant(profile.missingCapsules.length === 0, `${profile.id} is runner-ready with missing capsules.`);
      for (const command of profile.commands) {
        invariant(Array.isArray(command) && command.length >= 1, `${profile.id} has an invalid command.`);
        invariant(command[0].startsWith('scripts/') && command[0].endsWith('.mjs'), `${profile.id} commands must use repository entry points.`);
      }
    } else {
      invariant(profile.commands.length === 0, `${profile.id} must not expose a promotable command chain while incomplete.`);
      invariant(profile.missingCapsules.length > 0, `${profile.id} must state its missing capsules.`);
    }
  }

  const sm75 = registry.architectureCoverage.find((entry) => entry.computeCapability === '7.5');
  invariant(sm75?.status === 'qualified-one-model', 'The accepted Turing evidence must remain represented without broadening it to all models.');
  invariant(registry.qualifiedProfiles.every((entry) => entry.claimLimits?.length >= 2), 'Every qualified profile needs explicit claim limits.');

  unique(extensions.axes.map((entry) => entry.id), 'Hardware extension axis IDs');
  invariant(requiredExtensionAxes.every((id) => extensions.axes.some((entry) => entry.id === id)), 'The hardware extension matrix is incomplete.');
  for (const entry of extensions.axes) {
    invariant(!Object.hasOwn(entry, 'status') && !Object.hasOwn(entry, 'publicDisposition'), `${entry.id} must use independent capability dimensions rather than a legacy aggregate status.`);
    invariant(architecturalDispositions.has(entry.architecturalDisposition), `Invalid architectural disposition for ${entry.id}.`);
    invariant(implementationStatuses.has(entry.implementationStatus), `Invalid implementation status for ${entry.id}.`);
    invariant(qualificationStatuses.has(entry.qualificationStatus), `Invalid qualification status for ${entry.id}.`);
    invariant(typeof entry.priority === 'string' && entry.priority.length > 0, `${entry.id} needs an explicit priority.`);
    invariant(Number.isSafeInteger(entry.coordinationIssue) && entry.coordinationIssue > 0, `${entry.id} needs a public coordination issue.`);
    invariant(Array.isArray(entry.requiredEnvironment) && entry.requiredEnvironment.length > 0, `${entry.id} needs an exact environment contract.`);
    invariant(Array.isArray(entry.requiredEvidence) && entry.requiredEvidence.length > 0, `${entry.id} needs evidence requirements.`);
    invariant(Array.isArray(entry.safetyRules) && entry.safetyRules.length > 0, `${entry.id} needs safety rules.`);
    invariant(Array.isArray(entry.commands) && entry.commands.length === 0, `${entry.id} must not expose a promotable command chain before an accepted runner-ready qualification packet exists.`);
  }
  unique(extensions.upstreamSources.map((source) => source.id), 'Extended-profile upstream source IDs');
  for (const source of extensions.upstreamSources) {
    invariant(/^https:\/\/learn\.microsoft\.com\//.test(source.url), `Extended-profile source ${source.id} must be an official Microsoft URL.`);
    invariant(typeof source.use === 'string' && source.use.length > 0, `Extended-profile source ${source.id} needs a use.`);
  }
  const hyperv = extensions.axes.find((entry) => entry.id === 'virtualization')?.knownIncompatibleProfiles?.[0];
  invariant(hyperv?.qualificationStatus === 'known-incompatible', 'The exact current Hyper-V negative profile must be known-incompatible.');
  invariant(hyperv?.observed?.partitionableGpuCount === 0, 'The current Hyper-V negative profile must record zero partitionable GPUs.');
  invariant(hyperv?.reasons?.includes('client-host-vendor-unsupported'), 'The current Hyper-V negative profile needs its vendor support reason.');
}

export function renderSupportDocument(registry, profiles, extensions) {
  const lines = [
    '# CUDA-JS Hardware Support',
    '',
    '**Status:** Informational',
    '',
    `**Registry updated:** ${registry.updated}`,
    '',
    'This is the published hardware support list for CUDA-JS. It is generated from [`conformance/hardware/registry.json`](../conformance/hardware/registry.json). A CUDA-capable product is not automatically supported by CUDA-JS: support is recorded only for an exact profile that passed direct hardware execution, independent native-oracle comparison, permissions, packaging, and terminal cleanup.',
    '',
    'ADR-0006 keeps public/component architecture OS-neutral and makes native Linux x86-64 the reference implementation and primary qualification path, beginning with one exact Ubuntu 24.04 LTS cell. Shared Driver/compiler engines, thin Linux profiles, diagnostics, testing-only public-facade admission, compatibility metadata, and exact F3L/F6L runner source are implemented, but F4/F5/F7/F8 native runners and the exact installed-package chain remain incomplete. Source admission is not a support claim. The accepted Windows x64 result remains valid as a maintained peer profile.',
    '',
    'CUDA-JS is in public testing. Unconfirmed Windows x64 CUDA hardware may operate without a compatibility opt-in when the required runtime substrate and safety checks pass. Operation is reported as `testing-unconfirmed` and never promotes support automatically.',
    '',
    '## Directly qualified hardware',
    '',
    '| GPU | Compute capability | Host profile | Node | Driver / API | Toolkit | Qualified surface | Evidence |',
    '|---|---:|---|---|---|---|---|---|',
  ];

  for (const entry of registry.qualifiedProfiles) {
    const prs = entry.evidence.pullRequests.map((number) => `[#${number}](https://github.com/iteathen/CUDA-JS/pull/${number})`).join(', ');
    lines.push(`| ${safeCell(entry.hardware.model)} | ${safeCell(entry.hardware.computeCapability)} | ${safeCell(entry.host.profile)} (${safeCell(entry.host.driverModel)}) | ${safeCell(entry.runtime.node)} | ${safeCell(entry.cuda.driverPackage)} / ${safeCell(entry.cuda.driverApi)} | ${safeCell(entry.cuda.toolkit)} | F2W–F8W experimental | ${prs}; integrated \`${entry.evidence.integratedCommit.slice(0, 12)}\` |`);
  }

  lines.push(
    '',
    'The listed result qualifies only the recorded model and exact software/host identity. It does not qualify every device with the same compute capability.',
    '',
    '## Public qualification calls',
    '',
  );
  for (const issue of registry.coordinationIssues) {
    lines.push(`- [Issue #${issue.number}](https://github.com/iteathen/CUDA-JS/issues/${issue.number}) — ${safeCell(issue.scope)}.`);
  }

  lines.push(
    '',
    '## Architecture test coverage',
    '',
    'CUDA 13.3 compiler targets define the candidate set below. “Seeking evidence” means CUDA-JS has no support claim for that target yet.',
    '',
    '| Compute capability | Family | CUDA 13.3 target | Priority | CUDA-JS status |',
    '|---:|---|---|---:|---|',
  );
  for (const entry of registry.architectureCoverage) {
    lines.push(`| ${safeCell(entry.computeCapability)} | ${safeCell(entry.family)} | \`${safeCell(entry.toolkit13_3Target)}\` | ${safeCell(entry.priority)} | ${safeCell(statusLabel(entry.status))} |`);
  }

  lines.push(
    '',
    '## Host and processor profiles',
    '',
    '| Profile | Current runner state | Promotion target | Missing native work |',
    '|---|---|---|---|',
  );
  for (const profile of profiles.profiles) {
    const missing = profile.missingCapsules.length === 0 ? 'none' : profile.missingCapsules.join('; ');
    lines.push(`| \`${safeCell(profile.id)}\` | ${safeCell(statusLabel(profile.status))} | ${safeCell(statusLabel(profile.promotionTarget))} | ${safeCell(missing)} |`);
  }

  lines.push(
    '',
    'Windows x64 is the only native profile currently qualified and is retained as peer evidence. Native Linux x64 is the reference priority; its Driver/compiler source adapters exist, but exact native evidence and the facade/package chain remain incomplete. WSL2 x64, Linux ARM64 SBSA, and Jetson ARM64 remain separate profiles because their ABI, loader, Driver/provider, packaging, permission, or deployment boundaries differ.',
    '',
    '## Extended qualification axes',
    '',
    'Every axis below records architecture, implementation, qualification, and priority independently. All listed axes remain not-qualified; empty command chains are intentional because no axis yet has an accepted runner-ready qualification packet.',
    '',
    '| Axis | Architecture | Implementation | Qualification | Priority | Current boundary | Work issue |',
    '|---|---|---|---|---|---|---|',
  );
  for (const entry of extensions.axes) {
    lines.push(`| ${safeCell(entry.id)} | ${safeCell(statusLabel(entry.architecturalDisposition))} | ${safeCell(statusLabel(entry.implementationStatus))} | **${safeCell(statusLabel(entry.qualificationStatus))}** | ${safeCell(statusLabel(entry.priority))} | ${safeCell(entry.currentBoundary)} | [#${entry.coordinationIssue}](https://github.com/iteathen/CUDA-JS/issues/${entry.coordinationIssue}) |`);
  }

  const hyperv = extensions.axes.find((entry) => entry.id === 'virtualization').knownIncompatibleProfiles[0];
  lines.push(
    '',
    '### Verified negative virtualization profile',
    '',
    `The exact ${safeCell(hyperv.host)} / ${safeCell(hyperv.hardware)} Hyper-V profile is **known incompatible**. The read-only probe found ${hyperv.observed.partitionableGpuCount} partitionable GPUs and ${hyperv.observed.assignedGpuPartitionAdapterCount} assigned GPU partitions; Microsoft also excludes the client-host class from the supported DDA/GPU-P deployment profile. The broader virtualization capability remains architecturally deferred and not-qualified; no VM or device state was changed.`,
    '',
    '## How hardware is added',
    '',
    '1. Start with [`conformance/hardware/README.md`](../conformance/hardware/README.md) and select an exact profile.',
    '2. Run `npm run hardware:plan` to see whether that profile has a complete runner.',
    '3. On a runner-ready profile, use exact Node 26.7.0 from a clean tested commit and run `npm run hardware:qualify`.',
    '4. Review the generated public summary and evidence index. Keep host names, account names, filesystem paths, serial numbers, UUIDs, and bus identifiers out of public uploads.',
    '5. Open a hardware qualification issue, attach the sanitized result, and link the exact source commit.',
    '6. Promotion requires maintainer review and a registry PR. Evidence from one profile never silently promotes another.',
    '',
    '## Upstream candidate references',
    '',
  );
  for (const source of registry.upstreamSources) lines.push(`- [${safeCell(source.id)}](${source.url}) — ${safeCell(source.use)}.`);

  lines.push('', '### Extended-profile references', '');
  for (const source of extensions.upstreamSources) lines.push(`- [${safeCell(source.id)}](${source.url}) — ${safeCell(source.use)}.`);

  lines.push(
    '',
    '## Claim limits',
    '',
    '- Portable, mock, schema-generation, package-import, and readiness checks do not prove native CUDA support.',
    '- Successful operation on unconfirmed hardware is test evidence, not a support claim.',
    '- A Driver-only pass does not prove memory, execution, compiler/linker, installed-package, performance, or production behavior.',
    '- CUDA-JS currently selects device zero and admits one pending GPU operation. Multi-GPU, MIG, virtualization, concurrent launch, performance/thermal/soak, ECC, TCC/server, version-matrix, and attested-runner axes remain not-qualified; their architectural and implementation dispositions are recorded separately.',
    '- Driver/toolkit, Node, OS, ABI, provider, schema, permission, artifact, resource-lifecycle, or GPU changes can invalidate evidence.',
    '',
    'The operational build-out and dedicated test-host design are in [`docs/plans/2026-08-11-hardware-qualification-program.md`](plans/2026-08-11-hardware-qualification-program.md). The Node matrix, verified-negative profiles, and extended qualification contracts are maintained in [`docs/plans/2026-08-11-node-and-extended-qualification.md`](plans/2026-08-11-node-and-extended-qualification.md).',
    '',
  );
  return lines.join('\n');
}

export function generatedDocumentMatches(current, rendered) {
  return current.replace(/\r\n/g, '\n') === rendered;
}

async function detectEnvironment() {
  if (process.platform !== 'linux') return 'native';
  const release = os.release().toLowerCase();
  let version = '';
  try { version = (await readFile('/proc/version', 'utf8')).toLowerCase(); } catch {}
  return release.includes('microsoft') || version.includes('microsoft') ? 'wsl2' : 'native';
}

async function currentProfile(profiles, requested) {
  if (requested) return profiles.profiles.find((profile) => profile.id === requested);
  const environment = await detectEnvironment();
  const matches = profiles.profiles.filter((profile) =>
    profile.host.platform === process.platform
    && profile.host.architecture === process.arch
    && (profile.host.environment === environment || (environment === 'native' && profile.host.environment.startsWith('native-'))));
  return matches.length === 1 ? matches[0] : undefined;
}

async function sha256(target) {
  return createHash('sha256').update(await readFile(target)).digest('hex');
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
}

function git(args) {
  const result = run('git', args);
  if (result.error) throw result.error;
  invariant(result.status === 0, `git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}

function queryDeviceZero() {
  const result = run('nvidia-smi', ['--query-gpu=name,driver_version,compute_cap', '--format=csv,noheader,nounits']);
  if (result.error) throw new Error(`nvidia-smi is required for hardware qualification: ${result.error.message}`);
  invariant(result.status === 0, `nvidia-smi failed: ${result.stderr.trim()}`);
  const rows = result.stdout.trim().split(/\r?\n/).filter(Boolean);
  invariant(rows.length > 0, 'nvidia-smi reported no visible GPU.');
  const [model, driverVersion, computeCapability] = rows[0].split(',').map((value) => value.trim());
  invariant(model && driverVersion && /^\d+\.\d+$/.test(computeCapability ?? ''), 'nvidia-smi returned an unexpected device-zero record.');
  return { model, driverVersion, computeCapability, visibleDeviceCount: rows.length };
}

function timestampId(date = new Date()) {
  return date.toISOString().replaceAll(':', '').replaceAll('-', '').replace(/\.\d{3}Z$/, 'Z');
}

async function writeJson(target, value) {
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
}

async function summarizeProfileEvidence(profile, device) {
  if (profile.id !== 'windows-native-x64') return null;
  const exp012Build = await loadJson(path.join(repositoryRoot, 'build', 'exp-012', 'windows-x64', 'evidence', 'build.json'));
  const exp012Smoke = await loadJson(path.join(repositoryRoot, 'build', 'exp-012', 'windows-x64', 'evidence', 'smoke.json'));
  const f5CapabilityOracle = await loadJson(path.join(repositoryRoot, 'build', 'f5', 'win32-x64', 'evidence', 'capability-oracle-build.json'));
  const f5Capabilities = await loadJson(path.join(repositoryRoot, 'build', 'f5', 'win32-x64', 'evidence', 'native-windows-capabilities.json'));
  const f6 = await loadJson(path.join(repositoryRoot, 'build', 'f6', 'win32-x64', 'evidence', 'native-windows.json'));
  const f6CapabilityOracle = await loadJson(path.join(repositoryRoot, 'build', 'f6', 'win32-x64', 'evidence', 'capability-oracle-build.json'));
  const f6Capabilities = await loadJson(path.join(repositoryRoot, 'build', 'f6', 'win32-x64', 'evidence', 'native-windows-capabilities.json'));
  const f7 = await loadJson(path.join(repositoryRoot, 'build', 'f7', 'win32-x64', 'evidence', 'native-windows.json'));
  const f8 = await loadJson(path.join(repositoryRoot, 'build', 'f8', 'win32-x64', 'evidence', 'native-windows-package.json'));
  for (const [name, record] of Object.entries({ exp012Build, exp012Smoke, f5CapabilityOracle, f5Capabilities, f6, f6CapabilityOracle, f6Capabilities, f7, f8 })) {
    invariant(record.status === 'pass', `${name} evidence is not passing.`);
  }
  const diagnostic = f7.observations.driverCycles[0];
  const computeCapability = `${diagnostic.attributes.computeCapabilityMajor}.${diagnostic.attributes.computeCapabilityMinor}`;
  invariant(computeCapability === device.computeCapability, 'Driver diagnostics and nvidia-smi disagree on device-zero compute capability.');
  invariant(exp012Smoke.result.cuda.driverVersion.value === diagnostic.assessment.cuda.driverApiVersion, 'EXP-012 and F7 disagree on the Driver API version.');
  invariant(f8.observation.checksum === 15_600_773, 'Installed-package vector checksum is not the accepted oracle value.');
  invariant(f8.observation.graceful === true && f8.observation.workerExitCode === 0, 'Installed-package cleanup is not terminal.');
  invariant(f5CapabilityOracle.oracle.DELAY_FIRST_QUERY?.[0] === 600, 'Independent operation oracle did not observe CUDA_ERROR_NOT_READY.');
  invariant(f5Capabilities.observations.scalarCases?.length === 3, 'Native scalar boundary evidence is incomplete.');
  invariant(f5Capabilities.observations.operation?.first?.status === 'pending' && f5Capabilities.observations.operation?.completed?.status === 'completed', 'Native opaque-operation lifecycle evidence is incomplete.');
  invariant(f5Capabilities.observations.deferredFailure?.failure?.nativeStatus === 719 && f5Capabilities.observations.deferredFailure?.failure?.observedAt?.driverCall === 'cuEventQuery', 'Deferred native failure provenance is incomplete.');
  invariant(f5Capabilities.observations.terminal?.graceful === true && f5Capabilities.observations.pendingRuntimeClose?.graceful === true && f5Capabilities.observations.postFaultTerminal?.graceful === true, 'Native operation cleanup evidence is incomplete.');
  invariant(f6CapabilityOracle.oracle.PROGRAMS_CREATED === f6CapabilityOracle.oracle.PROGRAMS_DESTROYED && f6CapabilityOracle.oracle.LINKS_CREATED === f6CapabilityOracle.oracle.LINKS_DESTROYED && f6CapabilityOracle.oracle.DRIVER_CLEANUP === 'proved', 'Independent RDC/LTO oracle cleanup is incomplete.');
  invariant(f6Capabilities.observations.launches?.length === 2 && f6Capabilities.observations.launches.every((entry) => entry.exactIndependentOracleParity === true), 'Native RDC/LTO output parity is incomplete.');
  invariant(f6Capabilities.observations.terminal?.graceful === true && f6Capabilities.observations.terminal?.driver?.resourceCounts?.live === 0, 'Native RDC/LTO terminal cleanup is incomplete.');
  invariant(f8.deviceJsObservation?.sourceOnly === true && f8.deviceJsObservation?.structuredIntegerBitwise === true && f8.deviceJsObservation?.dataDependentWhile === true && f8.deviceJsObservation?.globalIndex === true, 'Installed-package Device-JS semantic evidence is incomplete.');
  invariant(f8.deviceJsObservation?.exactU64 === 'ffffffffffffffff' && f8.deviceJsObservation?.atomicCasUniqueFlags === true && f8.deviceJsObservation?.rejectionBeforeCompilerResources === true, 'Installed-package Device-JS typed/atomic/rejection evidence is incomplete.');
  invariant(f8.deviceJsObservation?.graceful === true && f8.deviceJsObservation?.driverResourceCounts?.live === 0, 'Installed-package Device-JS cleanup is incomplete.');

  return {
    cuda: {
      driverPackage: device.driverVersion,
      driverApi: diagnostic.assessment.cuda.driverApiVersion,
      toolkit: exp012Build.toolkit.version,
      header: exp012Build.toolkit.cudartVersion,
      headerSha256: exp012Build.toolkit.headerSha256,
      driverModel: diagnostic.assessment.cuda.driverModel,
      watchdog: diagnostic.assessment.cuda.watchdog,
      computeMode: diagnostic.assessment.cuda.computeMode,
    },
    compilerProviders: {
      profile: f6.observations.provider.profile,
      nvrtc: f6.observations.provider.nvrtc.version,
      nvrtcBuiltins: f6.observations.provider.nvrtcBuiltins.version,
      nvJitLink: f6.observations.provider.nvJitLink.version,
    },
    observations: {
      installedPackage: `${f8.package.name}@${f8.package.version}`,
      installedPackageSha256: f8.package.sha256,
      vectorChecksum: f8.observation.checksum,
      compilerArtifacts: f6.oracle,
      nativeCapabilities: {
        scalarBoundaryCases: f5Capabilities.observations.scalarCases.length,
        operationFirstStatus: f5Capabilities.observations.operation.first.status,
        operationTerminalStatus: f5Capabilities.observations.operation.completed.status,
        deferredFailureNativeStatus: f5Capabilities.observations.deferredFailure.failure.nativeStatus,
        rdcExactOracleParity: f6Capabilities.observations.launches.find((entry) => entry.capability === 'rdc').exactIndependentOracleParity,
        ltoExactOracleParity: f6Capabilities.observations.launches.find((entry) => entry.capability === 'lto').exactIndependentOracleParity,
        deviceJsSourceOnly: f8.deviceJsObservation.sourceOnly,
        deviceJsProgram: f8.deviceJsObservation.deviceProgram,
      },
      permissionControls: 'DriverActor and CompilerActor denial/allow passed',
      terminalCleanup: true,
    },
  };
}

async function runQualification(profile, registry) {
  invariant(profile, 'No qualification profile matches this host. Pass --profile=<id> to inspect an explicit profile.');
  invariant(profile.status === 'runner-ready', `${profile.id} is not runner-ready. Missing: ${profile.missingCapsules.join('; ')}`);
  invariant(process.version === profile.requiredNode, `${profile.id} requires ${profile.requiredNode}; current Node is ${process.version}.`);
  invariant(process.platform === profile.host.platform && process.arch === profile.host.architecture, `${profile.id} does not match ${process.platform}-${process.arch}.`);
  invariant(git(['status', '--porcelain']).length === 0, 'Hardware qualification requires a clean Git worktree.');

  const sourceCommit = git(['rev-parse', 'HEAD']);
  const sourceTree = git(['rev-parse', 'HEAD^{tree}']);
  const device = queryDeviceZero();
  invariant(registry.architectureCoverage.some((entry) => entry.computeCapability === device.computeCapability), `Device-zero compute capability ${device.computeCapability} is not in the candidate registry.`);

  const runId = timestampId();
  const outputRoot = path.join(repositoryRoot, 'build', 'hardware-qualification', profile.id, runId);
  const logsRoot = path.join(outputRoot, 'logs');
  await mkdir(logsRoot, { recursive: true });
  const commandResults = [];
  let allPassed = true;

  for (const [index, args] of profile.commands.entries()) {
    const startedAt = new Date();
    const result = run(process.execPath, args, { env: { ...process.env, CUDA_JS_NODE: process.execPath } });
    const finishedAt = new Date();
    const logName = `${String(index + 1).padStart(2, '0')}-${path.basename(args[0], '.mjs')}.log`;
    const logPath = path.join(logsRoot, logName);
    const log = [`$ ${process.execPath} ${args.join(' ')}`, '', result.stdout ?? '', result.stderr ?? ''].join('\n');
    await writeFile(logPath, log);
    const status = result.status ?? 1;
    commandResults.push({
      caseId: `HQ-${String(index + 1).padStart(2, '0')}`,
      command: ['node', ...args],
      status,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      elapsedMs: finishedAt.getTime() - startedAt.getTime(),
      log: `logs/${logName}`,
      logSha256: await sha256(logPath),
    });
    if (status !== 0) {
      allPassed = false;
      break;
    }
  }

  const evidence = [];
  let profileSummary = null;
  let evidenceFailure = null;
  if (allPassed) {
    try {
      for (const relative of profile.evidenceFiles) {
        const target = path.join(repositoryRoot, relative);
        invariant(existsSync(target), `Required evidence is missing after the run: ${relative}`);
        evidence.push({ path: relative, sha256: await sha256(target) });
      }
      profileSummary = await summarizeProfileEvidence(profile, device);
    } catch (error) {
      evidenceFailure = {
        kind: 'evidence-validation',
        message: error instanceof Error ? error.message : String(error),
      };
      allPassed = false;
    }
  }
  git(['update-index', '--refresh']);
  const finishedCleanTree = git(['status', '--porcelain']).length === 0;
  allPassed = allPassed && finishedCleanTree;
  const failedCommand = commandResults.find((entry) => entry.status !== 0);
  const failure = failedCommand
    ? { kind: 'command', caseId: failedCommand.caseId, status: failedCommand.status }
    : evidenceFailure ?? (!finishedCleanTree ? { kind: 'worktree-changed' } : null);

  const result = {
    schemaVersion: 1,
    runId,
    profile: profile.id,
    status: allPassed ? 'pass' : 'fail',
    promotionEligible: allPassed,
    failure,
    startedFrom: { sourceCommit, sourceTree, cleanTree: true },
    finishedCleanTree,
    environment: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch,
      operatingSystemRelease: os.release(),
    },
    deviceZero: device,
    profileSummary,
    commands: commandResults,
    evidence,
    privacyReviewRequired: true,
    excludedPublicIdentifiers: ['host name', 'account name', 'filesystem paths', 'serial number', 'UUID', 'PCI bus identifier'],
    claimLimits: [
      'A passing bundle qualifies only the exact recorded profile after maintainer evidence review and registry integration.',
      'The bundle is not a performance, production-stability, multi-GPU, MIG, or cross-platform claim.',
    ],
  };
  await writeJson(path.join(outputRoot, 'qualification.json'), result);
  await writeJson(path.join(outputRoot, 'public-summary.json'), {
    schemaVersion: result.schemaVersion,
    runId: result.runId,
    profile: result.profile,
    status: result.status,
    promotionEligible: result.promotionEligible,
    failure: result.failure ? {
      kind: result.failure.kind,
      ...(result.failure.caseId ? { caseId: result.failure.caseId, status: result.failure.status } : {}),
    } : null,
    startedFrom: result.startedFrom,
    finishedCleanTree: result.finishedCleanTree,
    environment: result.environment,
    deviceZero: result.deviceZero,
    profileSummary: result.profileSummary,
    commands: result.commands.map(({ caseId, command, status, elapsedMs, logSha256 }) => ({ caseId, command, status, elapsedMs, logSha256 })),
    evidence: result.evidence,
    claimLimits: result.claimLimits,
  });
  console.log(`Hardware qualification ${result.status}: ${path.relative(repositoryRoot, outputRoot)}`);
  if (!allPassed) process.exitCode = 1;
}

export async function execute(action, args = process.argv.slice(3)) {
  const registry = await loadJson(registryPath);
  const profiles = await loadJson(profilesPath);
  const extensions = await loadJson(extensionsPath);
  validateRegistry(registry, profiles, extensions);
  const rendered = renderSupportDocument(registry, profiles, extensions);
  const requestedProfile = args.find((arg) => arg.startsWith('--profile='))?.slice('--profile='.length);

  if (action === 'check') {
    const current = await readFile(path.join(repositoryRoot, registry.supportDocument), 'utf8');
    invariant(generatedDocumentMatches(current, rendered), `${registry.supportDocument} is stale; run npm run hardware:render.`);
    console.log('Hardware registry, qualification profiles, and generated support list passed.');
    return;
  }
  if (action === 'render') {
    await writeFile(path.join(repositoryRoot, registry.supportDocument), rendered);
    console.log(`Rendered ${registry.supportDocument}.`);
    return;
  }
  if (action === 'plan') {
    const profile = await currentProfile(profiles, requestedProfile);
    invariant(profile, 'No unique qualification profile matches this host. Pass --profile=<id>.');
    console.log(JSON.stringify({ id: profile.id, status: profile.status, requiredCapsules: profile.requiredCapsules, missingCapsules: profile.missingCapsules }, null, 2));
    return;
  }
  if (action === 'qualify') {
    await runQualification(await currentProfile(profiles, requestedProfile), registry);
    return;
  }
  throw new Error(`Unknown hardware qualification action: ${action}`);
}
