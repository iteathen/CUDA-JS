import assert from 'node:assert/strict';
import test from 'node:test';

import { validatePublicCapabilityProjection } from './public-capability-projection.mjs';

const NN_COMPONENT_ANCHORS = [
  'nn.facade', 'nn.tensor', 'nn.operator', 'nn.graph', 'nn.autodiff', 'nn.memory-plan',
  'nn.provider-registry', 'nn.provider.cublaslt', 'nn.provider.cudnn', 'nn.provider.generated',
  'nn.execution-plan', 'nn.training-state', 'nn.checkpoint', 'nn.conformance',
];

function fixture() {
  const common = '0.1.0-alpha.7 SPEC-0010 SPEC-0011 SPEC-0012 SPEC-0013 SPEC-0014 SPEC-0016 SPEC-0019 SPEC-0027 separate future publish unit compileDeviceProgram() `u64`/`i32`/`f32` typed `lto-ir` one pending GPU operation `u64` `i32` `f32`';
  const capabilityTable = `${common} SPEC-0021 \`f64\` \`f16\` \`bf16\` contiguous 1D typed device views Internal pinned host staging and async transfer Publication mailbox Optional separately packaged NN product Accepted SPEC-0027 authority only\n| Capability | Architecture | Implementation | Qualification | Priority | Profile / boundary |\n|---|---|---|---|---|---|\n| Example | \`planned\` | \`implemented\` | \`not-qualified\` | \`active\` | exact profile |`;
  const nnAnchors = NN_COMPONENT_ANCHORS.map((anchor) => `\`${anchor}\``).join(' ');
  return {
    packageJson: {
      name: 'cuda-js',
      version: '0.1.0-alpha.7',
      exports: {
        '.': { types: './components/runtime-facade/index.d.ts', import: './components/runtime-facade/index.mjs' },
        './compatibility': { types: './components/runtime-facade/compatibility.d.ts', import: './components/runtime-facade/compatibility.mjs' },
        './testing': { types: './components/runtime-facade/testing.d.ts', import: './components/runtime-facade/testing.mjs' },
      },
      files: ['components/runtime-facade/'],
      dependencies: { acorn: '8.15.0' },
    },
    compatibility: {
      package: { name: 'cuda-js', version: '0.1.0-alpha.7' },
      capabilities: {
        functionParameters: ['device-memory', 'u32', 'u64', 'i32', 'f32', 'f64', 'f16', 'bf16', 'publication-mailbox-host-to-device-u32', 'publication-mailbox-device-to-host-u32'],
        typedDeviceViews: 'contiguous-1d-component-foundation-no-public-facade-yet',
        compilerOutputFormats: ['ptx', 'lto-ir'],
        gpuOperationLifecycle: 'opaque-submit-status-wait-close-one-pending',
        boundedMultiOperationScheduling: 'opt-in-capacity-two-two-private-streams-one-predecessor-no-queue',
        asyncTransfers: 'opt-in-capacity-two-internal-pinned-staging-contiguous-h2d-d2h-d2d',
        publicationMailboxes: 'private-mapped-named-u32-one-operation-lease-system-acquire-release',
        deviceJsFrontend: 'restricted-spec-0013-v1+spec-0022-atomic-observation-v1+spec-0022-device-publication-v1+spec-0014-publication-mailbox-v1',
      },
    },
    extensions: {
      schemaVersion: 2,
      axes: [{ id: 'axis', architecturalDisposition: 'planned', implementationStatus: 'not-implemented', qualificationStatus: 'not-qualified', priority: 'next' }],
    },
    documents: {
      readme: common,
      capabilities: capabilityTable,
      interop: 'Device-JS generated CUDA C++ external-deletion test',
      hardware: '| Axis | Architecture | Implementation | Qualification | Priority | known incompatible not-qualified',
      packaging: 'cuda-js 0.1.0-alpha.7 SPEC-0021 SPEC-0027 separate future publish unit',
      agents: 'ADR-0004 and SPEC-0027 separate future publish unit',
      charter: 'separate future publish unit Every NN production boundary requires a separately accepted child specification.',
      registry: `project.nn-extension Accepted authority only; not implemented or qualified ${nnAnchors}`,
      nnArchitecture: '**Status:** Informational **Projection:** Accepted ADR-0004 and SPEC-0027 separate publish unit in the same repository, not a `cuda-js/nn` subpath implementation status:    not-implemented qualification status:     not-qualified',
      status: 'Optional NN extension authority **Implementation status:** not implemented. **Qualification status:** not qualified.',
      nextStep: 'CJS-NN-AUTHORITY-71 separate publish unit',
      nnDecision: 'It will be a separate publish unit, not a subpath of the existing `cuda-js` package. The registry package name remains unselected. The existing `cuda-js` package, exports, dependencies, compatibility identity, and import behavior remain unchanged. Neither document implements or qualifies NN behavior.',
      nnSpec: `Authorize a separately packaged, optional product in a separate future NN publish unit. Core must not gain an \`./nn\` export, NN dependency. No NN package, public API, provider, runtime behavior, or native support exists. They do not create directories or authorize implementation. This proves authority and core isolation only. It cannot prove NN behavior or native provider support.\narchitectural disposition: planned\nimplementation status:    not-implemented\nqualification status:     not-qualified\n${nnAnchors}`,
    },
  };
}

test('current public capability projection satisfies independent fact owners', () => {
  assert.deepEqual(validatePublicCapabilityProjection(fixture()), []);
});

test('package, capability, interop, and status-dimension drift are independently rejected', () => {
  const cases = [
    (value) => { value.documents.readme = value.documents.readme.replace('0.1.0-alpha.7', '0.1.0-alpha.2'); },
    (value) => { value.compatibility.capabilities.functionParameters = ['device-memory', 'u32']; },
    (value) => { value.compatibility.capabilities.typedDeviceViews = 'missing'; },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('SPEC-0021', ''); },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('SPEC-0012', ''); },
    (value) => { value.documents.interop = value.documents.interop.replace('external-deletion test', 'consumer module test'); },
    (value) => { value.documents.capabilities = value.documents.capabilities.replace('`not-qualified`', '`unsupported`'); },
    (value) => { value.extensions.axes[0].publicDisposition = 'legacy'; },
    (value) => { delete value.extensions.axes[0].qualificationStatus; },
  ];
  for (const mutate of cases) {
    const value = fixture();
    mutate(value);
    assert.notDeepEqual(validatePublicCapabilityProjection(value), []);
  }
});

test('NN authority keeps the generic core separate and rejects false status', () => {
  const cases = [
    {
      mutate(value) { value.packageJson.exports['./nn'] = './nn/index.mjs'; },
      error: 'package.json: generic core must not export ./nn or ./nn/*',
    },
    {
      mutate(value) { value.packageJson.dependencies['nn-authority-fixture'] = '0.0.0'; },
      error: 'package.json: core production dependency surface changed during NN authority packet',
    },
    {
      mutate(value) { value.packageJson.workspaces = ['packages/*']; },
      error: 'package.json: NN authority packet must not create a workspace',
    },
    {
      mutate(value) { value.packageJson.files.push('nn/'); },
      error: 'package.json: generic core package files must not include an NN publish unit',
    },
    {
      mutate(value) { value.documents.charter += '\nThe NN product will ship as a `cuda-js/nn` subpath in the existing package.\n'; },
      error: 'docs/PROJECT_CHARTER.md contains a forbidden same-package NN claim',
    },
    {
      mutate(value) { value.documents.charter += '\nThe NN registry package name is `nn-authority-fixture`.\n'; },
      error: 'docs/PROJECT_CHARTER.md contains a forbidden selected NN package identity',
    },
    {
      mutate(value) { value.documents.nnSpec += '\nThe NN package directory is `packages/nn-authority-fixture`.\n'; },
      error: 'docs/specs/SPEC-0027-nn-extension-foundation.md contains a forbidden selected NN package identity',
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
      mutate(value) { value.documents.nnSpec = value.documents.nnSpec.replace('`nn.conformance`', ''); },
      error: 'SPEC-0027 is missing planned NN component anchor: nn.conformance',
    },
    {
      mutate(value) { value.documents.registry = value.documents.registry.replace('`nn.provider.cudnn`', ''); },
      error: 'agent_files/SYSTEM_REGISTRY.md is missing planned NN component anchor: nn.provider.cudnn',
    },
    {
      mutate(value) {
        value.documents.nnSpec = value.documents.nnSpec.replace(
          'implementation status:    not-implemented',
          'implementation status:    implemented',
        );
      },
      error: 'SPEC-0027 NN implementation status must be not-implemented',
    },
    {
      mutate(value) {
        value.documents.nnSpec = value.documents.nnSpec.replace(
          'qualification status:     not-qualified',
          'qualification status:     qualified',
        );
      },
      error: 'SPEC-0027 NN qualification status must be not-qualified',
    },
  ];

  for (const { mutate, error } of cases) {
    const value = fixture();
    mutate(value);
    assert.equal(validatePublicCapabilityProjection(value).includes(error), true, error);
  }
});

test('every planned NN component anchor is required by both spec and registry', () => {
  for (const anchor of NN_COMPONENT_ANCHORS) {
    for (const [document, error] of [
      ['nnSpec', `SPEC-0027 is missing planned NN component anchor: ${anchor}`],
      ['registry', `agent_files/SYSTEM_REGISTRY.md is missing planned NN component anchor: ${anchor}`],
    ]) {
      const value = fixture();
      value.documents[document] = value.documents[document].replace(`\`${anchor}\``, '');
      assert.equal(validatePublicCapabilityProjection(value).includes(error), true, error);
    }
  }
});
