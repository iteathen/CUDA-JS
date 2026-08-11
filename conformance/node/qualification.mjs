import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const registryPath = path.join(repositoryRoot, 'conformance', 'node', 'registry.json');

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  invariant(new Set(values).size === values.length, `${label} must be unique.`);
}

function normalizeGeneratedText(value) {
  return value.replace(/\r\n/g, '\n');
}

export function validateRegistry(registry, packageJson) {
  invariant(registry.schemaVersion === 1, 'Node support registry schemaVersion must be 1.');
  invariant(registry.supportDocument === 'docs/NODE_SUPPORT.md', 'Unexpected Node support-document owner.');
  invariant(packageJson.engines?.node === registry.packageEngine, 'Package engine and Node support registry disagree.');
  invariant(/^v\d+\.\d+\.\d+$/.test(registry.qualifiedVersion), 'A qualified exact Node version is required.');
  invariant(Number.isSafeInteger(registry.coordinationIssue) && registry.coordinationIssue > 0, 'Node coordination issue is required.');
  invariant(Array.isArray(registry.upstreamSources) && registry.upstreamSources.length >= 4, 'Official Node sources are required.');
  invariant(Array.isArray(registry.versions) && registry.versions.length >= 10, 'The exact Node matrix is incomplete.');

  unique(registry.upstreamSources.map((entry) => entry.id), 'Node source IDs');
  for (const source of registry.upstreamSources) {
    invariant(/^https:\/\/(nodejs\.org|github\.com\/nodejs\/node)\//.test(source.url), `${source.id} must use an official Node source.`);
  }

  unique(registry.versions.map((entry) => entry.version), 'Node versions');
  const qualified = registry.versions.filter((entry) => entry.cudaJsStatus === 'qualified-experimental');
  invariant(qualified.length === 1 && qualified[0].version === registry.qualifiedVersion, 'Only the exact qualified Node baseline may carry a support claim.');
  for (const entry of registry.versions) {
    invariant(/^v\d+\.\d+\.\d+$/.test(entry.version), `Invalid Node version ${entry.version}.`);
    invariant(/^\d+$/.test(entry.moduleAbi), `${entry.version} needs a numeric module ABI.`);
    invariant(typeof entry.ffiExpected === 'boolean', `${entry.version} needs an FFI expectation.`);
    invariant(['qualified-experimental', 'testing-unconfirmed', 'known-incompatible'].includes(entry.cudaJsStatus), `${entry.version} has an invalid CUDA-JS status.`);
    invariant(typeof entry.reason === 'string' && entry.reason.length > 0, `${entry.version} needs a reason.`);
    invariant(typeof entry.evidence === 'string' && entry.evidence.length > 0, `${entry.version} needs an evidence disposition.`);
    if (entry.cudaJsStatus === 'qualified-experimental') invariant(entry.version === registry.qualifiedVersion, 'Only the qualified baseline may carry a support claim.');
    if (entry.cudaJsStatus === 'testing-unconfirmed') invariant(entry.ffiExpected, `${entry.version} cannot operate as a candidate without the required FFI substrate.`);
    if (!entry.ffiExpected) invariant(entry.cudaJsStatus === 'known-incompatible', `${entry.version} must be known-incompatible without the required FFI substrate.`);
  }
}

export function renderSupportDocument(registry) {
  const lines = [
    '# CUDA-JS Node Version Support',
    '',
    '**Status:** Informational',
    '',
    `**Registry updated:** ${registry.updated}`,
    '',
    'This list is generated from [`conformance/node/registry.json`](../conformance/node/registry.json). CUDA-JS support is an exact Node-version and host-profile claim. Upstream LTS status, a matching module ABI, or a successful `node:ffi` import does not establish CUDA-JS support.',
    '',
    `The package admits Node ${registry.packageEngine} for testing. Only exact ${registry.qualifiedVersion} carries qualified evidence. [Issue #${registry.coordinationIssue}](https://github.com/iteathen/CUDA-JS/issues/${registry.coordinationIssue}) coordinates additional qualification.`,
    '',
    '## Exact version matrix',
    '',
    '| Node | Upstream phase | Module ABI | Required FFI probe | CUDA-JS status | Evidence disposition |',
    '|---|---|---:|---|---|---|',
  ];

  for (const entry of registry.versions) {
    lines.push(`| ${entry.version} | ${entry.upstreamPhase} | ${entry.moduleAbi} | ${entry.ffiExpected ? 'must be available' : 'must be unavailable'} | **${entry.cudaJsStatus.replaceAll('-', ' ')}** | ${entry.evidence}; ${entry.reason.replaceAll('-', ' ')} |`);
  }

  lines.push(
    '',
    '## What the automated probe proves',
    '',
    'For every listed exact release, CI verifies the version and module ABI, attempts `node:ffi` only through its required flag, checks the expected public exports, and—where FFI exists—checks permission denial without FFI authority and progression to ordinary loader handling with explicit authority.',
    '',
    'A passing FFI-capable release is allowed to operate as **testing unconfirmed** without an opt-in switch. That permits evidence collection but does not create a support claim. Releases without the required FFI substrate are **known incompatible**. Promotion still requires EXP-000 on each promoted host architecture and the complete native CUDA-JS hardware/profile chain on the same exact Node release.',
    '',
    '## Promotion and invalidation',
    '',
    '1. Add the exact official release to the machine registry with its expected module ABI and FFI disposition.',
    '2. Pass the committed probe on every official target architecture.',
    '3. Pass EXP-000 correctness, lifecycle, permissions, and cleanup on Windows x64 and native Linux x64.',
    '4. Pass the full native CUDA-JS qualification chain for every promoted CUDA host profile.',
    '5. Update package metadata, compatibility manifest, support list, evidence, and CI in one reviewed pull request.',
    '',
    'Any Node version, module ABI, FFI API/flag/permission behavior, platform emitter, Worker behavior, or package-compatibility change invalidates the affected evidence. CUDA-JS does not infer support across patch releases.',
    '',
    '## Official sources',
    '',
  );
  for (const source of registry.upstreamSources) lines.push(`- [${source.id}](${source.url}) — ${source.use}.`);
  lines.push('');
  return lines.join('\n');
}

function parseLastJson(stdout) {
  const line = stdout.trim().split(/\r?\n/).at(-1);
  if (!line) return null;
  try { return JSON.parse(line); } catch { return null; }
}

function child(args) {
  return spawnSync(process.execPath, args, { cwd: repositoryRoot, encoding: 'utf8' });
}

export function probeCurrentVersion(registry) {
  const expected = registry.versions.find((entry) => entry.version === process.version);
  invariant(expected, `Node ${process.version} is not present in the support registry.`);
  invariant(String(process.versions.modules) === expected.moduleAbi, `${process.version} module ABI mismatch.`);

  const importSource = [
    "try {",
    "  const ffi = await import('node:ffi');",
    "  console.log(JSON.stringify({ available: true, dynamicLibrary: typeof ffi.DynamicLibrary === 'function', getRawPointer: typeof ffi.getRawPointer === 'function', types: typeof ffi.types === 'object' && ffi.types !== null }));",
    "} catch (error) {",
    "  console.log(JSON.stringify({ available: false, code: typeof error?.code === 'string' ? error.code : 'UNKNOWN' }));",
    "}",
  ].join('\n');
  const flagged = child(['--experimental-ffi', '--input-type=module', '--eval', importSource]);
  const importRecord = parseLastJson(flagged.stdout);
  const ffiAvailable = flagged.status === 0 && importRecord?.available === true;
  invariant(ffiAvailable === expected.ffiExpected, `${process.version} FFI availability did not match the registry.`);

  let permission = { checked: false };
  if (expected.ffiExpected) {
    invariant(importRecord.dynamicLibrary && importRecord.getRawPointer && importRecord.types, `${process.version} is missing required node:ffi exports.`);
    const permissionSource = [
      "try {",
      "  const { DynamicLibrary } = await import('node:ffi');",
      "  new DynamicLibrary('cuda-js-deliberately-missing-permission-probe');",
      "  console.log(JSON.stringify({ code: 'UNEXPECTED_LOAD' }));",
      "} catch (error) {",
      "  console.log(JSON.stringify({ code: typeof error?.code === 'string' ? error.code : 'LOADER_ERROR', permission: typeof error?.permission === 'string' ? error.permission : null }));",
      "}",
    ].join('\n');
    const denied = child(['--permission', '--experimental-ffi', '--input-type=module', '--eval', permissionSource]);
    const allowed = child(['--permission', '--allow-ffi', '--experimental-ffi', '--input-type=module', '--eval', permissionSource]);
    const deniedRecord = parseLastJson(denied.stdout);
    const allowedRecord = parseLastJson(allowed.stdout);
    invariant(denied.status === 0 && deniedRecord?.code === 'ERR_ACCESS_DENIED', `${process.version} did not deny FFI without authority.`);
    invariant(allowed.status === 0 && allowedRecord?.code !== 'ERR_ACCESS_DENIED', `${process.version} did not reach ordinary loader handling with FFI authority.`);
    permission = { checked: true, deniedCode: deniedRecord.code, explicitAllowReachedLoader: true };
  }

  return {
    schemaVersion: 1,
    version: process.version,
    moduleAbi: String(process.versions.modules),
    platform: process.platform,
    architecture: process.arch,
    ffiAvailable,
    requiredExports: ffiAvailable ? ['DynamicLibrary', 'getRawPointer', 'types'] : [],
    permission,
    cudaJsStatus: expected.cudaJsStatus,
    reason: expected.reason,
    claimLimits: [
      'This probe validates only the exact Node substrate and permission behavior recorded here.',
      'Only exact Node v26.7.0 is currently qualified for CUDA-JS; other FFI-capable releases operate as testing-unconfirmed and a probe pass cannot promote them.',
    ],
  };
}

export async function execute(action) {
  const registry = JSON.parse(await readFile(registryPath, 'utf8'));
  const packageJson = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
  validateRegistry(registry, packageJson);
  const rendered = renderSupportDocument(registry);

  if (action === 'check') {
    const current = await readFile(path.join(repositoryRoot, registry.supportDocument), 'utf8');
    invariant(normalizeGeneratedText(current) === rendered, `${registry.supportDocument} is stale; run npm run node:render.`);
    console.log('Node support registry and generated support list passed.');
    return;
  }
  if (action === 'render') {
    await writeFile(path.join(repositoryRoot, registry.supportDocument), rendered);
    console.log(`Rendered ${registry.supportDocument}.`);
    return;
  }
  if (action === 'probe') {
    console.log(JSON.stringify(probeCurrentVersion(registry)));
    return;
  }
  throw new Error(`Unknown Node qualification action: ${action}`);
}
