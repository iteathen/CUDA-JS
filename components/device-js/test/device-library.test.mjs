import assert from 'node:assert/strict';
import test from 'node:test';

import { DEVICE_JS_LIBRARY_CONTRACT, DeviceJsError, translateDeviceLibrary, translateDeviceProgram } from '../testing.mjs';

const libraryRequest = {
  source: `
function doubleValue(x) {
  return x + x;
}

function addThenDouble(x, y) {
  return doubleValue(x + y);
}
`,
  functions: [
    { name: 'doubleValue', kind: 'device', parameters: [{ name: 'x', type: 'u32' }], returns: 'u32' },
    { name: 'addThenDouble', kind: 'device', parameters: [{ name: 'x', type: 'u32' }, { name: 'y', type: 'u32' }], returns: 'u32' },
  ],
  exports: ['addThenDouble'],
};

function programRequest(alias, kernel) {
  return {
    source: `function ${kernel}(out) { out[gpu.u32(0)] = ${alias}(gpu.u32(2), gpu.u32(3)); }`,
    functions: [{ name: kernel, kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  };
}

function imported(library, alias = 'combine') {
  const exported = library.exports[0];
  return {
    name: alias,
    symbol: exported.symbol,
    parameters: exported.parameters,
    returns: exported.returns,
    librarySha256: library.sha256,
    exportName: exported.name,
    artifactSha256: 'a'.repeat(64),
    format: 'ptx',
    architecture: 'compute_75',
  };
}

test('Device-JS library exports deterministic collision-resistant device symbols without source leakage', () => {
  const first = translateDeviceLibrary(libraryRequest);
  const second = translateDeviceLibrary({ ...libraryRequest, functions: [...libraryRequest.functions].reverse() });
  assert.equal(first.contract, DEVICE_JS_LIBRARY_CONTRACT);
  assert.equal(first.sha256, second.sha256);
  assert.equal(first.generatedSource, second.generatedSource);
  assert.deepEqual(first.exports.map((entry) => entry.name), ['addThenDouble']);
  assert.equal(first.exports[0].symbol, `djs_lib_${first.sha256}_0`);
  assert.match(first.generatedSource, new RegExp(`extern "C" __device__ unsigned int ${first.exports[0].symbol}\\(`));
  assert.match(first.generatedSource, new RegExp(`djs_local_${first.sha256}_1`));
  assert.doesNotMatch(first.generatedSource, /addThenDouble|doubleValue/);
  assert.equal(Object.hasOwn(first, 'kernels'), false);
});

test('two unrelated Device-JS programs import one declared library export through explicit aliases', () => {
  const library = translateDeviceLibrary(libraryRequest);
  const firstImport = imported(library, 'combine');
  const secondImport = imported(library, 'merge');
  const first = translateDeviceProgram({ ...programRequest('combine', 'firstKernel'), imports: [firstImport] });
  const second = translateDeviceProgram({ ...programRequest('merge', 'secondKernel'), imports: [secondImport] });
  assert.equal(first.contract, DEVICE_JS_LIBRARY_CONTRACT);
  assert.equal(second.contract, DEVICE_JS_LIBRARY_CONTRACT);
  assert.notEqual(first.sha256, second.sha256);
  for (const program of [first, second]) {
    assert.equal(program.imports.length, 1);
    assert.match(program.generatedSource, new RegExp(`extern "C" __device__ unsigned int ${library.exports[0].symbol}\\(`));
    assert.match(program.generatedSource, new RegExp(`${library.exports[0].symbol}\\(`));
    assert.doesNotMatch(program.generatedSource, /addThenDouble|doubleValue/);
  }
});

test('library and import metadata fail closed without changing ordinary Device-JS output', () => {
  const library = translateDeviceLibrary(libraryRequest);
  const plain = {
    source: 'function plainKernel(out) { out[gpu.u32(0)] = gpu.u32(1); }',
    functions: [{ name: 'plainKernel', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' }],
  };
  const ordinary = translateDeviceProgram(plain);
  const explicitEmpty = translateDeviceProgram({ ...plain, imports: [] });
  assert.equal(explicitEmpty.sha256, ordinary.sha256);
  assert.equal(explicitEmpty.generatedSource, ordinary.generatedSource);

  assert.throws(() => translateDeviceLibrary({ ...libraryRequest, exports: ['missing'] }), (error) => error instanceof DeviceJsError && error.code === 'DEVICE_JS_EXPORT_UNKNOWN');
  assert.throws(() => translateDeviceLibrary({
    ...libraryRequest,
    functions: libraryRequest.functions.map((entry, index) => index === 0 ? { ...entry, kind: 'kernel', returns: 'void' } : entry),
  }), (error) => error instanceof DeviceJsError && error.code === 'DEVICE_JS_FUNCTION_KIND_INVALID');
  assert.throws(() => translateDeviceProgram({
    ...programRequest('combine', 'k'),
    imports: [{ ...imported(library), symbol: 'caller_selected_symbol' }],
  }), (error) => error instanceof DeviceJsError && error.code === 'DEVICE_JS_IMPORT_INVALID');
  assert.throws(() => translateDeviceProgram({
    source: 'function combine(out) { return; } function k(out) { return; }',
    functions: [
      { name: 'combine', kind: 'device', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' },
      { name: 'k', kind: 'kernel', parameters: [{ name: 'out', type: 'ptr<u32>' }], returns: 'void' },
    ],
    imports: [imported(library)],
  }), (error) => error instanceof DeviceJsError && error.code === 'DEVICE_JS_IMPORT_DUPLICATE');
});
