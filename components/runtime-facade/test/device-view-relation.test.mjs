import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectDeviceViewRelation as relation, CudaJsError } from '../index.mjs';
import { openCudaRuntimeForTesting } from '../testing.mjs';
import { openCudaRuntimeWithAdapters } from '../src/runtime.mjs';
import { openMockDriverRuntime } from '../../driver-actor/testing.mjs';

const code = (expected) => (error) => error instanceof CudaJsError && error.code === expected;

test('view relations cover byte ranges, symmetry, distinct allocations and empty ranges', async (t) => {
  const runtime = await openCudaRuntimeForTesting();
  t.after(() => runtime.close());
  const memory = await runtime.allocateDevice({ byteLength: 64 });
  const other = await runtime.allocateDevice({ byteLength: 64 });
  const make = (offset, count, allocation = memory, dtype = 'u32', access = 'read-write') => allocation.view({ dtype, byteOffset: offset, elementCount: count, access });
  const a = await make(8, 4);
  const cases = [
    [a, a, 'same-range'],
    [a, await make(8, 8, memory, 'f16', 'read'), 'same-range'],
    [a, await make(24, 2), 'disjoint'],
    [a, await make(0, 2), 'disjoint'],
    [a, await make(16, 4), 'overlap'],
    [a, await make(12, 1), 'overlap'],
    [a, await make(0, 16), 'overlap'],
    [a, await make(8, 4, other), 'disjoint'],
    [a, await make(12, 0), 'disjoint'],
    [await make(64, 0), await make(64, 0), 'same-range'],
    [await make(8, 0), await make(12, 0), 'disjoint'],
    [await make(8, 0), await make(8, 0, other), 'disjoint'],
  ];
  for (const [left, right, expected] of cases) {
    assert.equal(relation(left, right), expected);
    assert.equal(relation(right, left), expected);
    assert.equal(typeof relation(left, right), 'string');
    assert.deepEqual(Reflect.ownKeys(left), []);
  }
});

test('relation rejects forged, cross-runtime, closing, closed and stale capabilities', async (t) => {
  const runtime = await openCudaRuntimeForTesting();
  const foreignRuntime = await openCudaRuntimeForTesting();
  t.after(async () => { await runtime.close(); await foreignRuntime.close(); });
  const memory = await runtime.allocateDevice({ byteLength: 32 });
  const a = await memory.view({ dtype: 'u32', elementCount: 4 });
  const foreignMemory = await foreignRuntime.allocateDevice({ byteLength: 32 });
  const foreign = await foreignMemory.view({ dtype: 'u32', elementCount: 4 });
  for (const invalid of [null, undefined, {}, new Proxy(a, {}), Object.create(Object.getPrototypeOf(a))]) {
    assert.throws(() => relation(invalid, a), code('CUDA_JS_RESOURCE_INVALID'));
    assert.throws(() => relation(a, invalid), code('CUDA_JS_RESOURCE_INVALID'));
  }
  assert.throws(() => relation(a, memory), code('CUDA_JS_RESOURCE_KIND'));
  assert.throws(() => relation(a, foreign), code('CUDA_JS_RESOURCE_OWNER'));
  assert.throws(() => relation(foreign, a), code('CUDA_JS_RESOURCE_OWNER'));
  const parentClose = memory.close();
  assert.throws(() => relation(a, a), code('CUDA_JS_RESOURCE_CLOSING'));
  await assert.rejects(parentClose, code('RESOURCE_HAS_CHILDREN'));
  assert.equal(relation(a, a), 'same-range'); // rejected close remains retryable
  const close = a.close();
  assert.throws(() => relation(a, a), code('CUDA_JS_RESOURCE_CLOSING'));
  await close;
  const replacement = await memory.view({ dtype: 'u32', elementCount: 4 });
  assert.throws(() => relation(a, replacement), code('CUDA_JS_RESOURCE_CLOSED'));
  const runtimeClose = runtime.close();
  assert.throws(() => relation(replacement, replacement), code('CUDA_JS_RUNTIME_CLOSED'));
  await runtimeClose;
  assert.throws(() => relation(replacement, replacement), code('CUDA_JS_RESOURCE_CLOSED'));
});

test('relation performs zero actor calls and fails closed after observed owner loss', async (t) => {
  let calls = 0;
  let lost = false;
  const runtime = await openCudaRuntimeWithAdapters({}, {
    openDriver: async (options) => {
      const { runtime: driver } = await openMockDriverRuntime(options);
      return new Proxy(driver, { get(target, key) {
        if (key === 'health' && lost) return 'restart-required';
        const value = Reflect.get(target, key, target);
        return typeof value === 'function' ? (...args) => { calls++; return value.apply(target, args); } : value;
      } });
    },
  }, () => ({ status: 'mock-only' }));
  t.after(() => runtime.close());
  const memory = await runtime.allocateDevice({ byteLength: 32 });
  const a = await memory.view({ dtype: 'u32', elementCount: 4 });
  const b = await memory.view({ dtype: 'u32', byteOffset: 8, elementCount: 4 });
  const before = calls;
  for (let i = 0; i < 100; i++) assert.equal(relation(a, b), 'overlap');
  assert.equal(calls, before);
  lost = true;
  assert.throws(() => relation(a, b), code('CUDA_JS_RUNTIME_CLOSED'));
  assert.equal(calls, before);
});
