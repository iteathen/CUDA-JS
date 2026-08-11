import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyFastEligibility, loadRuntimeIr, validateRuntimeIr } from '../src/runtime-ir.mjs';
import { runtimeIrPath } from '../src/paths.mjs';

const ir = await loadRuntimeIr(runtimeIrPath);

test('Runtime IR has stable unique cases and allowlisted FFI definitions', () => {
  assert.equal(validateRuntimeIr(ir), ir);
  assert.equal(new Set(ir.cases.map((entry) => entry.id)).size, ir.cases.length);
  assert.ok(ir.cases.length >= 60);
});

test('Win64 static Fast FFI classification separates three and four arguments', () => {
  const profile = { platform: 'win32', architecture: 'x64' };
  const three = classifyFastEligibility(ir.functions.cjs_args_integer_3, profile);
  const four = classifyFastEligibility(ir.functions.cjs_args_integer_4, profile);
  assert.equal(three.classification, 'fast-jit-candidate');
  assert.equal(three.directQualification, false);
  assert.equal(four.classification, 'generic-fallback');
  assert.equal(four.reason, 'win64-receiver-leaves-three-public-register-positions');
});

test('global argument cap fails closed', () => {
  const classification = classifyFastEligibility({ arguments: Array(9).fill('i32'), return: 'i32' });
  assert.equal(classification.classification, 'generic-fallback');
  assert.equal(classification.reason, 'node-fast-global-eight-argument-cap');
});
