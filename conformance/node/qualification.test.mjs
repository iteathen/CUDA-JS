import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { probeCurrentVersion, registryPath, renderSupportDocument, repositoryRoot, validateRegistry } from './qualification.mjs';

async function fixtures() {
  return {
    registry: JSON.parse(await readFile(registryPath, 'utf8')),
    packageJson: JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8')),
  };
}

test('only exact Node 26.7.0 is qualified while the package admits testing candidates', async () => {
  const { registry, packageJson } = await fixtures();
  assert.doesNotThrow(() => validateRegistry(registry, packageJson));
  assert.deepEqual(registry.versions.filter((entry) => entry.cudaJsStatus === 'qualified-experimental').map((entry) => entry.version), ['v26.7.0']);
  assert.equal(packageJson.engines.node, '>=26.1.0');
  assert.match(renderSupportDocument(registry), /v24\.19\.0.*known incompatible/);
  assert.match(renderSupportDocument(registry), /v26\.6\.0.*testing unconfirmed/);
});

test('an FFI-capable candidate can operate but cannot inherit qualified evidence', async () => {
  const { registry, packageJson } = await fixtures();
  registry.versions.find((entry) => entry.version === 'v26.6.0').cudaJsStatus = 'qualified-experimental';
  assert.throws(() => validateRegistry(registry, packageJson), /Only the exact qualified Node baseline|Only the qualified baseline/);
});

test('a Node release without the required FFI substrate cannot be supported', async () => {
  const { registry, packageJson } = await fixtures();
  registry.versions.find((entry) => entry.version === 'v24.19.0').cudaJsStatus = 'qualified-experimental';
  assert.throws(() => validateRegistry(registry, packageJson), /Only the exact qualified Node baseline|Only the qualified baseline|known-incompatible/);
});

test('the current exact Node substrate and permission behavior match the registry', async () => {
  const { registry } = await fixtures();
  const report = probeCurrentVersion(registry);
  assert.equal(report.version, 'v26.7.0');
  assert.equal(report.ffiAvailable, true);
  assert.equal(report.permission.deniedCode, 'ERR_ACCESS_DENIED');
  assert.equal(report.permission.explicitAllowReachedLoader, true);
});
