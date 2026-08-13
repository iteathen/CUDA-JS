import assert from 'node:assert/strict';
import test from 'node:test';

import { DeviceJsError, translateDeviceProgram } from '../testing.mjs';

function expectCode(code) {
  return (error) => error instanceof DeviceJsError && error.code === code;
}

function withKernel(deviceSource, deviceFunctions) {
  return {
    source: `${deviceSource}\nfunction kernel() {}\n`,
    functions: [
      ...deviceFunctions,
      { name: 'kernel', kind: 'kernel', parameters: [], returns: 'void' },
    ],
  };
}

test('translation canonicalizes function order by raw code-unit order', () => {
  const source = `
function z() {}
function _a() {}
function A() {}
function $x() {}
function kernel() {}
`;
  const functions = [
    { name: '$x', kind: 'device', parameters: [], returns: 'void' },
    { name: 'A', kind: 'device', parameters: [], returns: 'void' },
    { name: '_a', kind: 'device', parameters: [], returns: 'void' },
    { name: 'z', kind: 'device', parameters: [], returns: 'void' },
    { name: 'kernel', kind: 'kernel', parameters: [], returns: 'void' },
  ];
  const first = translateDeviceProgram({ source, functions });
  const second = translateDeviceProgram({ source, functions: [...functions].reverse() });

  assert.deepEqual(first.functions.map((fn) => fn.name), ['$x', 'A', '_a', 'kernel', 'z']);
  assert.deepEqual(second.functions.map((fn) => fn.name), ['$x', 'A', '_a', 'kernel', 'z']);
  assert.equal(first.sha256, second.sha256);
  assert.equal(first.generatedSource, second.generatedSource);
});

test('non-void functions must definitely return on every accepted fallthrough path', () => {
  const incomplete = withKernel(`
function choose(flag) {
  if (flag) return gpu.u32(1);
}
`, [{ name: 'choose', kind: 'device', parameters: [{ name: 'flag', type: 'bool' }], returns: 'u32' }]);
  assert.throws(() => translateDeviceProgram(incomplete), expectCode('DEVICE_JS_RETURN_INCOMPLETE'));

  const complete = withKernel(`
function choose(flag) {
  if (flag) return gpu.u32(1);
  else return gpu.u32(2);
}
`, [{ name: 'choose', kind: 'device', parameters: [{ name: 'flag', type: 'bool' }], returns: 'u32' }]);
  assert.equal(translateDeviceProgram(complete).functions.find((fn) => fn.name === 'choose').returns, 'u32');
});

test('loops are conservatively not accepted as proof of a non-void return', () => {
  const request = withKernel(`
function spin() {
  while (true) return gpu.u32(1);
}
`, [{ name: 'spin', kind: 'device', parameters: [], returns: 'u32' }]);
  assert.throws(() => translateDeviceProgram(request), expectCode('DEVICE_JS_RETURN_INCOMPLETE'));
});

test('void synchronization helpers are accepted only as standalone expression statements', () => {
  const metadata = [{ name: 'kernel', kind: 'kernel', parameters: [], returns: 'void' }];
  assert.doesNotThrow(() => translateDeviceProgram({
    source: 'function kernel() { gpu.barrier.block(); gpu.fence.device(); }',
    functions: metadata,
  }));
  assert.throws(() => translateDeviceProgram({
    source: 'function kernel() { for (gpu.barrier.block(); false; ) {} }',
    functions: metadata,
  }), expectCode('DEVICE_JS_VOID_HELPER_CONTEXT'));
  assert.throws(() => translateDeviceProgram({
    source: 'function kernel() { for (; false; gpu.fence.device()) {} }',
    functions: metadata,
  }), expectCode('DEVICE_JS_VOID_HELPER_CONTEXT'));
});
