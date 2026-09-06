import assert from 'node:assert/strict';
import test from 'node:test';

import { translateDeviceProgram } from '../testing.mjs';

const BASE = 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';
const DENSE_TANH = `${BASE}+SPEC-0030-dense-numeric-v1+SPEC-0030-tanh-v1`;

test('expected failure before #206 implementation: gpu.math.tanh lowers through the accepted dense plus tanh child', () => {
  const translated = translateDeviceProgram({
    source: 'function k(out, x) { out[gpu.u32(0)] = gpu.math.tanh(x); }',
    functions: [{ name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<f32>' }, { name: 'x', type: 'f32' }], returns: 'void' }],
  });
  assert.equal(translated.contract, DENSE_TANH);
  assert.match(translated.generatedSource, /tanhf\(p1\)/u);
});
