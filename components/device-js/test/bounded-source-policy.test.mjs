import assert from 'node:assert/strict';
import test from 'node:test';

import { DeviceJsError, translateDeviceProgram } from '../testing.mjs';

const SOURCE_BYTES_LIMIT = 4_194_304;
const AST_NODE_LIMIT = 1_048_576;

const identityFunctions = [{
  name: 'identity',
  kind: 'device',
  parameters: [{ name: 'x', type: 'u32' }],
  returns: 'u32',
}];

function identitySource(prefix = '') {
  return `${prefix}\nfunction identity(x) { return x; }\n`;
}

function expectDeviceCode(code, expectedDetails = {}) {
  return (error) => {
    assert(error instanceof DeviceJsError);
    assert.equal(error.code, code);
    for (const [key, value] of Object.entries(expectedDetails)) assert.equal(error.details?.[key], value);
    return true;
  };
}

test('Device-JS admits a finite source larger than the legacy 1 MiB guard', () => {
  const source = identitySource(`/*${'x'.repeat(1_100_000)}*/`);
  assert(Buffer.byteLength(source, 'utf8') > 1_048_576);
  assert(Buffer.byteLength(source, 'utf8') < SOURCE_BYTES_LIMIT);
  const translated = translateDeviceProgram({ source, functions: identityFunctions });
  assert.equal(translated.functions.length, 1);
  assert.equal(translated.functions[0].name, 'identity');
});

test('Device-JS still rejects source above the revised finite 4 MiB guard', () => {
  const source = identitySource(`/*${'x'.repeat(SOURCE_BYTES_LIMIT)}*/`);
  assert.throws(
    () => translateDeviceProgram({ source, functions: identityFunctions }),
    expectDeviceCode('DEVICE_JS_SOURCE_LIMIT', { maximum: SOURCE_BYTES_LIMIT }),
  );
});

test('Device-JS admits valid syntax materially above the legacy 20k AST-node guard', () => {
  const statements = Array.from({ length: 5_000 }, () => 'x = x + gpu.u32(1);').join('\n');
  const source = `function identity(x) {\n${statements}\nreturn x;\n}\n`;
  const translated = translateDeviceProgram({ source, functions: identityFunctions });
  assert.equal(translated.functions[0].name, 'identity');
});

test('Device-JS still rejects pathological compact syntax above the revised finite AST-node guard', () => {
  const literals = new Array(AST_NODE_LIMIT + 64).fill('0').join(',');
  const source = `function identity(x) { [${literals}]; return x; }`;
  assert(Buffer.byteLength(source, 'utf8') < SOURCE_BYTES_LIMIT);
  assert.throws(
    () => translateDeviceProgram({ source, functions: identityFunctions }),
    expectDeviceCode('DEVICE_JS_AST_LIMIT', { maximum: AST_NODE_LIMIT }),
  );
});
