import assert from 'node:assert/strict';
import test from 'node:test';

import { validatePublicCapabilityProjection } from './public-capability-projection.mjs';

const HISTORICAL_NN_COMPONENT_ANCHORS = [
  'nn.facade', 'nn.tensor', 'nn.operator', 'nn.graph', 'nn.autodiff', 'nn.memory-plan',
  'nn.provider-registry', 'nn.provider.cublaslt', 'nn.provider.cudnn', 'nn.provider.generated',
  'nn.execution-plan', 'nn.training-state', 'nn.checkpoint', 'nn.conformance',
];

function fixture() {
  const readme = '0.1.0-alpha.16 docs/CAPABILITIES.md Not published Production support Native Linux CUDA npm run verify npm run verify:windows experimental `node:ffi` Node-FFI-first EXP-000 CJS-F1B CJS-F2W Windows x64';
  const capabilityBase = '0.1.0-alpha.16 SPEC-0010 SPEC-0011 SPEC-0012 SPEC-0013 SPEC-0014 SPEC-0016 SPEC-0017 SPEC-0019 SPEC-0020 SPEC-0023 SPEC-0027 SPEC-0028 SPEC-0029 SPEC-0030 SPEC-0031 ADR-0007 compileDeviceProgram() compileDeviceLibrary() discoverCudaDevices() `u64`/`i32`/`f32` typed `lto-ir` one pending GPU operation `u64` `i32` `f32`';
  const capabilityTable = `${capabilityBase} SPEC-0021 \`f64\` \`f16\` \`bf16\` contiguous 1D typed device views typed Device-JS library composition Internal pinned host staging and async transfer Publication mailbox Optional CUDA library adapters External CUDA-NN ownership iteathen/cuda-nn\n| Capability | Architecture | Implementation | Qualification | Priority | Profile / boundary |\n|---|---|---|---|---|---|\n| Example | \`planned\` | \`implemented\` | \`not-qualified\` | \`active\` | exact profile |\n| External CUDA-NN semantic consumer | \`external\` | \`owner-bootstrap-integrated\` | \`not-qualified\` | \`independent\` | external owner |`;
  const historicalAnchors = HISTORICAL_NN_COMPONENT_ANCHORS.map((anchor) => `\`${anchor}\``).join(' ');
  return {
    packageJson: {
      name: 'cuda-js',
      version: '0.1.0-alpha.16',
      exports: {
        '.': { types: './components/runtime-facade/index.d.ts', import: './components/runtime-facade/index.mjs' },
        './compatibility': { types: './components/runtime-facade/compatibility.d.ts', import: './components/runtime-facade/compatibility.mjs' },
        './testing': { types: './components/runtime-facade/testing.d.ts', import: './components/runtime-facade/testing.mjs' },
      },
      files: ['components/runtime-facade/', 'components/prepared-execution/', 'components/cuda-library-adapters/'],
      dependencies: { acorn: '8.15.0' },
    },
    compatibility: {
      package: { name: 'cuda-js', version: '0.1.0-alpha.16' },
      capabilities: {
        deviceSelection: 'finite-sanitized-snapshot-opaque-process-local-selector-one-device-per-runtime-selected-targets',
        functionParameters: ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16', 'publication-mailbox-host-to-device-u32', 'publication-mailbox-device-to-host-u32'],
        typedDeviceViews: 'allocation-owned-contiguous-1d-opaque-capability-explicit-launch-access',
        compilerOutputFormats: ['ptx', 'lto-ir'],
        gpuOperationLifecycle: 'opaque-submit-status-wait-close-one-pending',
        boundedMultiOperationScheduling: 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue',
        asyncTransfers: 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d',
        publicationMailboxes: 'private-mapped-named-u32-one-operation-lease-system-acquire-release',
        preparedOperationDags: 'bounded-kernel-cublaslt-f32-dag-immutable-bindings-derived-library-access-single-stream-semantic-replay',
        cublasLtF32Matmul: 'optional-row-major-contiguous-typed-views-explicit-bounded-workspace',
        deviceJsFrontend: 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1+spec-0022-device-publication-v1+spec-0014-publication-mailbox-v1',
        deviceJsDenseNumeric: 'f64-f16-bf16-exact-casts-special-values-manifest-verified-headers',
        deviceJsLibraries: 'typed-leaf-libraries-explicit-aliased-imports-selected-runtime-target-rdc-or-lto-final-cubin',
      },
    },
    extensions: {
      schemaVersion: 2,
      axes: [{ id: 'axis', architecturalDisposition: 'planned', implementationStatus: 'not-implemented', qualificationStatus: 'not-qualified', priority: 'next' }],
    },
    documents: {
      readme,
      capabilities: capabilityTable,
      interop: 'Device-JS generated CUDA C++ external-deletion test',
      hardware: '| Axis | Architecture | Implementation | Qualification | Priority | known incompatible not-qualified',
      packaging: 'cuda-js 0.1.0-alpha.16 SPEC-0020 SPEC-0021 ADR-0007 iteathen/cuda-nn iteathen/CUDA-JS-Tensor',
      agents: 'ADR-0007 assigns reusable NN semantics to iteathen/cuda-nn and generic Tensor semantics to CUDA-JS-Tensor',
      charter: 'ADR-0007 iteathen/cuda-nn iteathen/CUDA-JS-Tensor historical records no longer authorize `nn.*` production components here',
      registry: 'project.cuda-nn-boundary external.cuda-nn ADR-0007',
      nnArchitecture: '**Status:** Informational **Current projection:** Accepted ADR-0007 iteathen/cuda-nn CUDA-JS-Tensor cuda-nn production API:    not-authorized Historical projection: **Projection:** Accepted ADR-0004 and SPEC-0027 separate publish unit historical implementation status: not-implemented historical qualification status: not-qualified',
      status: '## External CUDA-NN ownership iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3 Reusable NN semantics no longer belong to a future publish unit in this repository.',
      nextStep: '"cuda_nn" CJS-CUDA-NN-EXTERNAL ADR-0007',
      nnDecision: 'It will be a separate publish unit, not a subpath of the existing `cuda-js` package. The registry package name remains unselected. The existing `cuda-js` package, exports, dependencies, compatibility identity, and import behavior remain unchanged. Neither document implements or qualifies NN behavior.',
      nnSpec: `Authorize a separately packaged, optional product in a separate future NN publish unit. Core must not gain an \`./nn\` export, NN dependency. No NN package, public API, provider, runtime behavior, or native support exists. They do not create directories or authorize implementation. This proves authority and core isolation only. It cannot prove NN behavior or native provider support.\narchitectural disposition: planned\nimplementation status:    not-implemented\nqualification status:     not-qualified\n${historicalAnchors}`,
    },
  };
}

test('current public capability projection satisfies independent fact owners', () => {
  assert.deepEqual(validatePublicCapabilityProjection(fixture()), []);
});

test('README keeps concise evidence anchors while exhaustive capability markers remain independently owned', () => {
  const readmeValue = fixture();
  readmeValue.documents.readme = readmeValue.documents.readme.replace('npm run verify:windows', '');
  assert.equal(
    validatePublicCapabilityProjection(readmeValue).includes('README.md is missing public capability marker: npm run verify:windows'),
    true,
  );

  const capabilityValue = fixture();
  capabilityValue.documents.capabilities = capabilityValue.documents.capabilities.replace('SPEC-0021', '');
  assert.equal(
    validatePublicCapabilityProjection(capabilityValue).includes('docs/CAPABILITIES.md is missing public capability marker: SPEC-0021'),
    true,
  );
});

test('package, capability, interop, and status-dimension drift are independently rejected', () => {
  const cases = [
    (value) => { value.documents.readme = value.documents.readme.replace('0.1.0-alpha.16', '0.1.0-alpha.2'); },
    (value) => { value.compatibility.capabilities.functionParameters = ['device-memory', 'u32']; },
    (value) => { value.compatibility.capabilities.deviceSelection = 'missing'; },
    (value) => { value.compatibility.capabilities.typedDeviceViews = 'missing'; },
    (value) => { value.compatibility.capabilities.deviceJsLibraries = 'missing'; },
    (value) => { value.compatibility.capabilities.deviceJsDenseNumeric = 'missing'; },
    (value) => { value.compatibility.capabilities.preparedOperationDags = 'missing'; },
    (value) => { value.compatibility.capabilities.cublasLtF32Matmul = 'missing'; },
    (value) => { value.packageJson.files = value.packageJson.files.filter((entry) => entry !== 'components/prepared-execution/'); },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('SPEC-0021', ''); },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('SPEC-0012', ''); },
    (value) => { value.documents.interop = value.documents.interop.replace('external-deletion test', 'consumer module test'); },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('`not-qualified`', '`unsupported`'); },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('`owner-bootstrap-integrated`', '`unknown-external-state`'); },
    (value) => { value.extensions.axes[0].publicDisposition = 'legacy'; },
    (value) => { delete value.extensions.axes[0].qualificationStatus; },
  ];
  for (const mutate of cases) {
    const value = fixture();
    mutate(value);
    assert.notDeepEqual(validatePublicCapabilityProjection(value), []);
  }
});

test('CUDA-NN extraction keeps generic core separate and current ownership external', () => {
  const cases = [
    {
      mutate(value) { value.packageJson.exports['./nn'] = './nn/index.mjs'; },
      error: 'package.json: generic core must not export ./nn or ./nn/*',
    },
    {
      mutate(value) { value.packageJson.dependencies['nn-authority-fixture'] = '0.0.0'; },
      error: 'package.json: core production dependency surface changed during NN ownership projection',
    },
    {
      mutate(value) { value.packageJson.workspaces = ['packages/*']; },
      error: 'package.json: CUDA-JS must not create an NN workspace',
    },
    {
      mutate(value) { value.packageJson.files.push('nn/'); },
      error: 'package.json: generic core package files must not include an NN publish unit',
    },
    {
      mutate(value) { value.documents.charter += '\nThe NN product will ship as a `cuda-js/nn` subpath in the existing package.\n'; },
      error: 'docs/PROJECT_CHARTER.md contains obsolete active NN placement claim: The NN product will ship as a `cuda-js/nn` subpath in the existing package.',
    },
    {
      mutate(value) { value.documents.registry += '\nproject.nn-extension\n'; },
      error: 'agent_files/SYSTEM_REGISTRY.md retains obsolete project.nn-extension owner',
    },
    {
      mutate(value) { value.documents.registry += '\n`nn.provider.cudnn`\n'; },
      error: 'agent_files/SYSTEM_REGISTRY.md retains obsolete CUDA-JS NN component anchor: nn.provider.cudnn',
    },
    {
      mutate(value) { value.documents.registry = value.documents.registry.replace('external.cuda-nn', ''); },
      error: 'agent_files/SYSTEM_REGISTRY.md is missing public capability marker: external.cuda-nn',
    },
    {
      mutate(value) { value.documents.nnArchitecture = value.documents.nnArchitecture.replace('**Current projection:** Accepted ADR-0007', ''); },
      error: 'docs/architecture/NN_EXTENSION_BOUNDARY.md is missing public capability marker: **Current projection:** Accepted ADR-0007',
    },
    {
      mutate(value) { value.documents.packaging = value.documents.packaging.replace('iteathen/cuda-nn', ''); },
      error: 'packaging/README.md is missing public capability marker: iteathen/cuda-nn',
    },
    {
      mutate(value) {
        value.documents.nnDecision = value.documents.nnDecision.replace(
          'It will be a separate publish unit, not a subpath of the existing `cuda-js` package.',
          '',
        );
      },
      error: 'docs/decisions/ADR-0004-nn-extension-package-boundary.md is missing public capability marker: It will be a separate publish unit, not a subpath of the existing `cuda-js` package.',
    },
    {
      mutate(value) {
        value.documents.nnSpec = value.documents.nnSpec.replace(
          'implementation status:    not-implemented',
          'implementation status:    implemented',
        );
      },
      error: 'SPEC-0027 historical NN implementation status must remain not-implemented',
    },
  ];

  for (const { mutate, error } of cases) {
    const value = fixture();
    mutate(value);
    assert.equal(validatePublicCapabilityProjection(value).includes(error), true, error);
  }
});

test('historical NN anchors stay in SPEC-0027 but are forbidden in the current CUDA-JS registry', () => {
  for (const anchor of HISTORICAL_NN_COMPONENT_ANCHORS) {
    const missingHistorical = fixture();
    missingHistorical.documents.nnSpec = missingHistorical.documents.nnSpec.replace(`\`${anchor}\``, '');
    assert.equal(
      validatePublicCapabilityProjection(missingHistorical).includes(`SPEC-0027 historical provenance is missing planned NN component anchor: ${anchor}`),
      true,
    );

    const leakedCurrent = fixture();
    leakedCurrent.documents.registry += ` \`${anchor}\``;
    assert.equal(
      validatePublicCapabilityProjection(leakedCurrent).includes(`agent_files/SYSTEM_REGISTRY.md retains obsolete CUDA-JS NN component anchor: ${anchor}`),
      true,
    );
  }
});
