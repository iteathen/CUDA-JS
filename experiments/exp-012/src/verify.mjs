import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot } from './paths.mjs';

const build = JSON.parse(await readFile(path.join(evidenceRoot, 'build.json'), 'utf8'));
const smoke = JSON.parse(await readFile(path.join(evidenceRoot, 'smoke.json'), 'utf8'));
assert.equal(build.status, 'pass');
assert.equal(smoke.status, 'pass');
assert.equal(build.experiment, 'EXP-012');
assert.equal(smoke.experiment, 'EXP-012');
assert.equal(build.node.version, 'v26.7.0');
assert.equal(build.toolkit.headerSha256, '31df84e16179b6d97db4b3c0bae7697392a370b41983f4a8962f0e5a8069b577');
assert.equal(smoke.driver.sha256, build.driver.sha256);
assert.equal(smoke.result.boundSymbols.length, 12);
assert.equal(smoke.result.cuda.procAddress.entries.length, 12);
assert.equal(smoke.result.cleanup.contextDestroyed, true);
assert.equal(smoke.result.cleanup.currentNull, true);
assert.equal(smoke.result.cleanup.libraryClosed, true);
assert.equal(smoke.result.cleanup.staleWrapperRejected, true);
assert.equal(smoke.result.workerExitCode, 0);
assert.equal(smoke.permission.denied.record.ok, false);
assert.equal(smoke.permission.allowed.record.ok, true);
assert.equal(smoke.rawPointerBoundary, 'no pointer values cross the Worker boundary');
console.log('EXP-012 verification passed: Windows ABI, 12 exports/queries, C-oracle parity, permissions, context teardown, library invalidation, and Worker exit.');
