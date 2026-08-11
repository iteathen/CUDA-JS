import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import compatibility from '../../packaging/compatibility-manifest.json' with { type: 'json' };
import packageJson from '../../package.json' with { type: 'json' };
import { evidenceRoot } from './evidence.mjs';

assert.equal(packageJson.name, compatibility.package.name);
assert.equal(packageJson.version, compatibility.package.version);
assert.equal(packageJson.engines.node, '>=26.1.0');
assert.equal(packageJson.private, false);
assert.equal(compatibility.node.minimumVersion, 'v26.1.0');
assert.equal(compatibility.node.version, 'v26.7.0');
assert.deepEqual(Object.keys(packageJson.exports).sort(), ['.', './compatibility', './testing']);
const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable-package.json'), 'utf8'));
assert.equal(portable.status, 'pass');
assert.equal(portable.package.version, packageJson.version);
assert.equal(portable.observations.firstConsumerDeletion, true);
assert.equal(portable.observations.secondInstance, true);
assert.equal(portable.observations.installed, portable.observations.uninstalled);
if (process.platform === 'win32') {
  const native = JSON.parse(await readFile(path.join(evidenceRoot, 'native-windows-package.json'), 'utf8'));
  assert.equal(native.status, 'pass');
  assert.equal(native.observation.checksum, 15_600_773);
  assert.equal(native.observation.graceful, true);
}
if (process.platform === 'linux') {
  const readiness = JSON.parse(await readFile(path.join(evidenceRoot, 'linux-readiness.json'), 'utf8'));
  assert.equal(readiness.status, 'backend-unavailable');
  assert.equal(readiness.observations.nativeOpenCode, 'CUDA_JS_LINUX_BACKEND_UNAVAILABLE');
}
console.log(`F8 verification passed for ${process.platform}-${process.arch}: exact package exports, install/uninstall, independent consumers, instance isolation, and ${process.platform === 'win32' ? 'native Windows facade execution' : 'retained native Linux qualification gates'}.`);
