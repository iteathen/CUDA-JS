import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  DEVICE_JS_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_ERF_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_ERF_TANH_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_LIBRARY_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_TANH_CONTRACT,
  DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT,
  DEVICE_JS_LIBRARY_CONTRACT,
} from '../../device-js/src/contract-profile.mjs';

const declarationUrl = new URL('../index.d.ts', import.meta.url);

function literalUnion(text, typeName) {
  const escaped = typeName.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const match = new RegExp(`export type ${escaped} =([\\s\\S]*?);`, 'u').exec(text);
  assert(match, `missing ${typeName} declaration`);
  return [...match[1].matchAll(/'([^']+)'/gu)].map((entry) => entry[1]).sort();
}

test('public Device-JS declaration contract unions exactly match admitted runtime identities', async () => {
  const text = await readFile(declarationUrl, 'utf8');
  const libraryContracts = [
    DEVICE_JS_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT,
  ].sort();
  const programContracts = [
    DEVICE_JS_CONTRACT,
    DEVICE_JS_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_ERF_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_ERF_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_TANH_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_TANH_LIBRARY_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_ERF_TANH_CONTRACT,
    DEVICE_JS_DENSE_NUMERIC_ERF_TANH_LIBRARY_CONTRACT,
  ].sort();

  assert.deepEqual(literalUnion(text, 'DeviceJsLibraryContract'), libraryContracts);
  assert.deepEqual(literalUnion(text, 'DeviceJsProgramContract'), programContracts);
  assert.match(text, /readonly contract: DeviceJsLibraryContract;/u);
  assert.match(text, /readonly contract: DeviceJsProgramContract;/u);
  assert.doesNotMatch(text, /readonly contract:\s*string\s*;/u);
});
