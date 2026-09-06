import assert from 'node:assert/strict';
import test from 'node:test';

import { DeviceJsError, translateDeviceProgram } from '../testing.mjs';

const SOURCE_BYTES_LIMIT = 4_194_304;
const AST_NODE_LIMIT = 1_048_576;

const functions = [
  {
    name: 'identity',
    kind: 'device',
    parameters: [{ name: 'x', type: 'u32' }],
    returns: 'u32',
  },
  {
    name: 'entry',
    kind: 'kernel',
    parameters: [{ name: 'out', type: 'ptr<u32>' }],
    returns: 'void',
  },
];

function moduleSource(identityBody = 'return x;', prefix = '') {
  return `${prefix}\nfunction identity(x) {\n${identityBody}\n}\nfunction entry(out) {\n  let i = gpu.thread.globalX();\n  out[i] = identity(i);\n}\n`;
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
  const source = moduleSource('return x;', `/*${'x'.repeat(1_100_000)}*/`);
  assert(Buffer.byteLength(source, 'utf8') > 1_048_576);
  assert(Buffer.byteLength(source, 'utf8') < SOURCE_BYTES_LIMIT);
  const translated = translateDeviceProgram({ source, functions });
  assert.equal(translated.functions.length, 2);
  assert.equal(translated.kernels.length, 1);
  assert.equal(translated.kernels[0].name, 'entry');
});

test('Device-JS still rejects source above the revised finite 4 MiB guard', () => {
  const source = moduleSource('return x;', `/*${'x'.repeat(SOURCE_BYTES_LIMIT)}*/`);
  assert.throws(
    () => translateDeviceProgram({ source, functions }),
    expectDeviceCode('DEVICE_JS_SOURCE_LIMIT', { maximum: SOURCE_BYTES_LIMIT }),
  );
});

test('Device-JS admits valid syntax materially above the legacy 20k AST-node guard', () => {
  const statements = Array.from({ length: 5_000 }, () => 'x = x + gpu.u32(1);').join('\n');
  const source = moduleSource(`${statements}\nreturn x;`);
  const translated = translateDeviceProgram({ source, functions });
  assert.equal(translated.functions.length, 2);
  assert.equal(translated.kernels[0].name, 'entry');
});

test('Device-JS still rejects pathological compact syntax above the revised finite AST-node guard', () => {
  const literals = new Array(AST_NODE_LIMIT + 64).fill('0').join(',');
  const source = moduleSource(`[${literals}];\nreturn x;`);
  assert(Buffer.byteLength(source, 'utf8') < SOURCE_BYTES_LIMIT);
  assert.throws(
    () => translateDeviceProgram({ source, functions }),
    expectDeviceCode('DEVICE_JS_AST_LIMIT', { maximum: AST_NODE_LIMIT }),
  );
});
