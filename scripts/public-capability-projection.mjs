function requireMarkers(errors, label, text, markers) {
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

export function validatePublicCapabilityProjection({ packageJson, compatibility, extensions, documents }) {
  const errors = [];
  const expectedParameters = ['device-memory', 'u32', 'u64', 'i32', 'f32'];

  if (compatibility.package?.name !== packageJson.name || compatibility.package?.version !== packageJson.version) {
    errors.push('package.json and packaging compatibility package identity differ');
  }
  if (JSON.stringify(compatibility.capabilities?.functionParameters) !== JSON.stringify(expectedParameters)) {
    errors.push('packaging compatibility scalar parameter projection is stale');
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
    'compileDeviceProgram()',
    '`u64`/`i32`/`f32`',
    'typed `lto-ir`',
    'one pending GPU operation',
  ]);
  requireMarkers(errors, 'docs/CAPABILITIES.md', documents.capabilities, [
    'SPEC-0010',
    'SPEC-0011',
    'SPEC-0012',
    'SPEC-0013',
    'SPEC-0016',
    'compileDeviceProgram()',
    '`u64`',
    '`i32`',
    '`f32`',
    '`lto-ir`',
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
  requireMarkers(errors, 'packaging/README.md', documents.packaging, [packageJson.version]);
  validateCapabilityTable(errors, documents.capabilities);

  const stalePatterns = [
    [/0\.1\.0-alpha\.2/, 'obsolete package version'],
    [/Device LTO is (?:\*\*)?planned/i, 'obsolete Device LTO implementation state'],
    [/not yet an accepted production capability/i, 'obsolete Device LTO authority state'],
    [/compiled or source device modules/i, 'obsolete CUDA-MCGS module ownership'],
    [/\bno-support\b|\*\*no support\*\*/i, 'deprecated aggregate support state'],
  ];
  for (const [label, text] of Object.entries(documents)) {
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
