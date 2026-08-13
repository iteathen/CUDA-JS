import assert from 'node:assert/strict';
import test from 'node:test';

import { validatePublicCapabilityProjection } from './public-capability-projection.mjs';

function fixture() {
  const common = '0.1.0-alpha.5 SPEC-0010 SPEC-0011 SPEC-0012 SPEC-0013 SPEC-0016 compileDeviceProgram() `u64`/`i32`/`f32` typed `lto-ir` one pending GPU operation `u64` `i32` `f32`';
  const capabilityTable = `${common}\n| Capability | Architecture | Implementation | Qualification | Priority | Profile / boundary |\n|---|---|---|---|---|---|\n| Example | \`planned\` | \`implemented\` | \`not-qualified\` | \`active\` | exact profile |`;
  return {
    packageJson: { name: 'cuda-js', version: '0.1.0-alpha.5' },
    compatibility: {
      package: { name: 'cuda-js', version: '0.1.0-alpha.5' },
      capabilities: {
        functionParameters: ['device-memory', 'u32', 'u64', 'i32', 'f32'],
        compilerOutputFormats: ['ptx', 'lto-ir'],
        gpuOperationLifecycle: 'opaque-submit-status-wait-close-one-pending',
        deviceJsFrontend: 'restricted-spec-0013-v1',
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
      packaging: 'cuda-js 0.1.0-alpha.5',
    },
  };
}

test('current public capability projection satisfies independent fact owners', () => {
  assert.deepEqual(validatePublicCapabilityProjection(fixture()), []);
});

test('package, capability, interop, and status-dimension drift are independently rejected', () => {
  const cases = [
    (value) => { value.documents.readme = value.documents.readme.replace('0.1.0-alpha.5', '0.1.0-alpha.2'); },
    (value) => { value.compatibility.capabilities.functionParameters = ['device-memory', 'u32']; },
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
