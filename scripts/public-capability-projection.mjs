function requireMarkers(errors, label, text, markers) {
  if (typeof text !== 'string') {
    errors.push(`${label} public capability projection is unavailable`);
    return;
  }
  for (const marker of markers) {
    if (!text.includes(marker)) errors.push(`${label} is missing public capability marker: ${marker}`);
  }
}

function validateCapabilityTable(errors, text) {
  const header = '| Capability | Architecture | Implementation | Qualification | Priority | Profile / boundary |';
  const start = text.indexOf(header);
  if (start === -1) return;
  const rows = text.slice(start).split('\n').slice(2).filter((line) => line.startsWith('| '));
  const architecture = new Set(['planned', 'deferred', 'unselected', 'rejected', 'not-applicable']);
  const implementation = new Set(['not-implemented', 'experimental', 'partial', 'implemented']);
  const qualification = new Set(['not-qualified', 'testing-unconfirmed', 'qualified', 'known-incompatible', 'not-applicable']);
  for (const row of rows) {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 6) {
      errors.push(`docs/CAPABILITIES.md capability row has ${cells.length} columns instead of 6: ${row}`);
      continue;
    }
    const value = (cell) => cell.match(/^`([^`]+)`$/)?.[1];
    if (!architecture.has(value(cells[1]))) errors.push(`docs/CAPABILITIES.md has invalid architectural disposition for ${cells[0]}`);
    if (!implementation.has(value(cells[2]))) errors.push(`docs/CAPABILITIES.md has invalid implementation status for ${cells[0]}`);
    if (!qualification.has(value(cells[3]))) errors.push(`docs/CAPABILITIES.md has invalid qualification status for ${cells[0]}`);
    if (!/^(active|next|after:[^`]+|blocked:[^`]+|deferred)$/.test(value(cells[4]) ?? '')) errors.push(`docs/CAPABILITIES.md has invalid priority for ${cells[0]}`);
  }
}

const NN_COMPONENT_ANCHORS = [
  'nn.facade',
  'nn.tensor',
  'nn.operator',
  'nn.graph',
  'nn.autodiff',
  'nn.memory-plan',
  'nn.provider-registry',
  'nn.provider.cublaslt',
  'nn.provider.cudnn',
  'nn.provider.generated',
  'nn.execution-plan',
  'nn.training-state',
  'nn.checkpoint',
  'nn.conformance',
];

const EXPECTED_CORE_EXPORTS = {
  '.': {
    types: './components/runtime-facade/index.d.ts',
    import: './components/runtime-facade/index.mjs',
  },
  './compatibility': {
    types: './components/runtime-facade/compatibility.d.ts',
    import: './components/runtime-facade/compatibility.mjs',
  },
  './testing': {
    types: './components/runtime-facade/testing.d.ts',
    import: './components/runtime-facade/testing.mjs',
  },
};

function sortedRecord(value) {
  return Object.fromEntries(Object.entries(value ?? {}).sort(([left], [right]) => left.localeCompare(right)));
}

function validateNnAuthorityProjection(errors, packageJson, documents) {
  const exportKeys = Object.keys(packageJson.exports ?? {});
  if (exportKeys.some((key) => key === './nn' || key.startsWith('./nn/'))) {
    errors.push('package.json: generic core must not export ./nn or ./nn/*');
  }
  if (JSON.stringify(packageJson.exports) !== JSON.stringify(EXPECTED_CORE_EXPORTS)) {
    errors.push('package.json: core export surface changed during NN authority packet');
  }

  const productionDependencies = {
    dependencies: sortedRecord(packageJson.dependencies),
    optionalDependencies: sortedRecord(packageJson.optionalDependencies),
    peerDependencies: sortedRecord(packageJson.peerDependencies),
    bundleDependencies: packageJson.bundleDependencies ?? null,
    bundledDependencies: packageJson.bundledDependencies ?? null,
  };
  const expectedProductionDependencies = {
    dependencies: { acorn: '8.15.0' },
    optionalDependencies: {},
    peerDependencies: {},
    bundleDependencies: null,
    bundledDependencies: null,
  };
  if (JSON.stringify(productionDependencies) !== JSON.stringify(expectedProductionDependencies)) {
    errors.push('package.json: core production dependency surface changed during NN authority packet');
  }
  if (Object.hasOwn(packageJson, 'workspaces')) {
    errors.push('package.json: NN authority packet must not create a workspace');
  }
  if ((packageJson.files ?? []).some((entry) => /(?:^|\/)nn(?:\/|$)/i.test(entry))) {
    errors.push('package.json: generic core package files must not include an NN publish unit');
  }

  requireMarkers(errors, 'docs/decisions/ADR-0004-nn-extension-package-boundary.md', documents.nnDecision, [
    'It will be a separate publish unit, not a subpath of the existing `cuda-js` package.',
    'The registry package name remains unselected',
    'The existing `cuda-js` package, exports, dependencies, compatibility identity, and import behavior remain unchanged',
    'Neither document implements or qualifies NN behavior.',
  ]);
  requireMarkers(errors, 'docs/specs/SPEC-0027-nn-extension-foundation.md', documents.nnSpec, [
    'Authorize a separately packaged, optional',
    'separate future NN publish unit',
    'must not gain an `./nn` export, NN dependency',
    'No NN package, public API, provider, runtime behavior, or native support exists',
    'They do not create directories or authorize implementation',
    'This proves authority and core isolation only. It cannot prove NN behavior or native provider support.',
  ]);
  requireMarkers(errors, 'docs/PROJECT_CHARTER.md', documents.charter, [
    'separate future publish unit',
    'Every NN production boundary requires a separately accepted child specification.',
  ]);
  requireMarkers(errors, 'docs/architecture/NN_EXTENSION_BOUNDARY.md', documents.nnArchitecture, [
    '**Status:** Informational',
    '**Projection:** Accepted ADR-0004 and SPEC-0027',
    'separate publish unit in the same repository, not a `cuda-js/nn` subpath',
    'implementation status:    not-implemented',
    'qualification status:     not-qualified',
  ]);
  requireMarkers(errors, 'AGENTS.md', documents.agents, ['ADR-0004 and SPEC-0027', 'separate future publish unit']);
  requireMarkers(errors, 'agent_files/SYSTEM_REGISTRY.md', documents.registry, ['project.nn-extension', 'Accepted authority only; not implemented or qualified']);
  requireMarkers(errors, 'docs/CAPABILITIES.md', documents.capabilities, ['Optional separately packaged NN product', 'Accepted SPEC-0027 authority only']);
  requireMarkers(errors, 'STATUS.md', documents.status, ['Optional NN extension authority', '**Implementation status:** not implemented.', '**Qualification status:** not qualified.']);
  requireMarkers(errors, 'next_step.yaml', documents.nextStep, ['CJS-NN-AUTHORITY-71', 'separate publish unit']);

  for (const anchor of NN_COMPONENT_ANCHORS) {
    if (!documents.nnSpec.includes(`\`${anchor}\``)) errors.push(`SPEC-0027 is missing planned NN component anchor: ${anchor}`);
    if (!documents.registry.includes(`\`${anchor}\``)) errors.push(`agent_files/SYSTEM_REGISTRY.md is missing planned NN component anchor: ${anchor}`);
  }

  const expectedStatus = {
    'architectural disposition': 'planned',
    'implementation status': 'not-implemented',
    'qualification status': 'not-qualified',
  };
  for (const [label, expected] of Object.entries(expectedStatus)) {
    const actual = documents.nnSpec.match(new RegExp(`^${label}:\\s+([^\\s]+)$`, 'm'))?.[1];
    if (actual !== expected) errors.push(`SPEC-0027 NN ${label} must be ${expected}`);
  }

  const activeDocuments = {
    'AGENTS.md': documents.agents,
    'docs/PROJECT_CHARTER.md': documents.charter,
    'agent_files/SYSTEM_REGISTRY.md': documents.registry,
    'docs/CAPABILITIES.md': documents.capabilities,
    'docs/architecture/NN_EXTENSION_BOUNDARY.md': documents.nnArchitecture,
    'STATUS.md': documents.status,
    'next_step.yaml': documents.nextStep,
  };
  const samePackageClaims = [
    'The NN product will ship as a `cuda-js/nn` subpath in the existing package.',
    'The NN product is part of the existing `cuda-js` package.',
  ];
  for (const [label, text] of Object.entries(activeDocuments)) {
    for (const claim of samePackageClaims) {
      if (text.includes(claim)) errors.push(`${label} contains a forbidden same-package NN claim`);
    }
  }

  const authorityDocuments = {
    ...activeDocuments,
    'docs/decisions/ADR-0004-nn-extension-package-boundary.md': documents.nnDecision,
    'docs/specs/SPEC-0027-nn-extension-foundation.md': documents.nnSpec,
  };
  const selectedPackageIdentity = /\b(?:the )?NN (?:registry )?package (?:name|directory|workspace) is `[^`]+`/i;
  for (const [label, text] of Object.entries(authorityDocuments)) {
    if (selectedPackageIdentity.test(text)) {
      errors.push(`${label} contains a forbidden selected NN package identity`);
    }
  }
}

export function validatePublicCapabilityProjection({ packageJson, compatibility, extensions, documents }) {
  const errors = [];
  const expectedParameters = ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16'];

  if (compatibility.package?.name !== packageJson.name || compatibility.package?.version !== packageJson.version) {
    errors.push('package.json and packaging compatibility package identity differ');
  }
  if (JSON.stringify(compatibility.capabilities?.functionParameters) !== JSON.stringify(expectedParameters)) {
    errors.push('packaging compatibility scalar parameter projection is stale');
  }
  if (compatibility.capabilities?.typedDeviceViews !== 'contiguous-1d-component-foundation-no-public-facade-yet') {
    errors.push('packaging compatibility typed device-view projection is stale');
  }
  if (!compatibility.capabilities?.compilerOutputFormats?.includes('lto-ir')) {
    errors.push('packaging compatibility omits typed Device LTO output');
  }
  if (compatibility.capabilities?.gpuOperationLifecycle !== 'opaque-submit-status-wait-close-one-pending') {
    errors.push('packaging compatibility operation lifecycle is stale');
  }
  if (compatibility.capabilities?.deviceJsFrontend !== 'restricted-spec-0013-v1') {
    errors.push('packaging compatibility Device-JS projection is stale');
  }

  requireMarkers(errors, 'README.md', documents.readme, [
    packageJson.version,
    'SPEC-0010',
    'SPEC-0011',
    'SPEC-0012',
    'SPEC-0013',
    'SPEC-0016',
    'SPEC-0021',
    'SPEC-0027',
    'separate future publish unit',
    'compileDeviceProgram()',
    '`u64`/`i32`/`f32`',
    '`f64`/`f16`/`bf16`',
    'typed `lto-ir`',
    'one pending GPU operation',
  ]);
  requireMarkers(errors, 'docs/CAPABILITIES.md', documents.capabilities, [
    'SPEC-0010',
    'SPEC-0011',
    'SPEC-0012',
    'SPEC-0013',
    'SPEC-0016',
    'SPEC-0021',
    'SPEC-0027',
    'Optional separately packaged NN product',
    'compileDeviceProgram()',
    '`u64`',
    '`i32`',
    '`f32`',
    '`f64`',
    '`f16`',
    '`bf16`',
    '`lto-ir`',
    'contiguous 1D typed device views',
    '| Capability | Architecture | Implementation | Qualification | Priority |',
  ]);
  requireMarkers(errors, 'docs/INTEROP_WITH_CUDA_MCGS.md', documents.interop, [
    'Device-JS',
    'generated CUDA C++',
    'external-deletion test',
  ]);
  requireMarkers(errors, 'docs/HARDWARE_SUPPORT.md', documents.hardware, [
    '| Axis | Architecture | Implementation | Qualification | Priority |',
    'known incompatible',
    'not-qualified',
  ]);
  requireMarkers(errors, 'packaging/README.md', documents.packaging, [packageJson.version, 'SPEC-0021', 'SPEC-0027', 'separate future publish unit']);
  validateCapabilityTable(errors, documents.capabilities);
  validateNnAuthorityProjection(errors, packageJson, documents);

  const stalePatterns = [
    [/0\.1\.0-alpha\.2/, 'obsolete package version'],
    [/Device LTO is (?:\*\*)?planned/i, 'obsolete Device LTO implementation state'],
    [/not yet an accepted production capability/i, 'obsolete Device LTO authority state'],
    [/compiled or source device modules/i, 'obsolete CUDA-MCGS module ownership'],
    [/\bno-support\b|\*\*no support\*\*/i, 'deprecated aggregate support state'],
  ];
  for (const label of ['readme', 'capabilities', 'interop', 'hardware', 'packaging']) {
    const text = documents[label];
    for (const [pattern, meaning] of stalePatterns) {
      if (pattern.test(text)) errors.push(`${label} contains ${meaning}`);
    }
  }

  if (extensions.schemaVersion !== 2) errors.push('hardware extension registry must use status-dimension schema version 2');
  for (const axis of extensions.axes ?? []) {
    if (Object.hasOwn(axis, 'status') || Object.hasOwn(axis, 'publicDisposition')) {
      errors.push(`hardware axis ${axis.id} retains a legacy aggregate status`);
    }
    for (const field of ['architecturalDisposition', 'implementationStatus', 'qualificationStatus', 'priority']) {
      if (typeof axis[field] !== 'string' || axis[field].length === 0) errors.push(`hardware axis ${axis.id} is missing ${field}`);
    }
  }

  return errors;
}
