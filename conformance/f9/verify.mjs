import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { evidenceRoot } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F9 verification currently requires exact Windows native evidence.');
const native = JSON.parse(await readFile(path.join(evidenceRoot, 'native-windows.json'), 'utf8'));
assert.equal(native.status, 'pass');
assert.equal(native.observation.headerProfile, 'cuda-cccl');
assert.equal(native.observation.headerProfileIdentity.sha256, 'e9a5447d01afe22e7d15d2a4bb8c71a9f3a74175d9788781d51a8b61f3c2913c');
assert.deepEqual(native.observation.observedWords, native.observation.expectedWords);
assert.equal(native.observation.hostProducedIntermediateInputsAfterLaunch, 0);
assert.equal(native.observation.launch.status, 'completed');
assert.equal(native.observation.terminal.graceful, true);
assert.equal(native.observation.terminal.driver.resourceCounts.live, 0);
assert.equal(native.observation.terminal.driver.resourceCounts.orphaned, 0);
console.log('F9 verification passed: trusted CCCL identity, public atomic publication, device-closed launch, and terminal cleanup.');
