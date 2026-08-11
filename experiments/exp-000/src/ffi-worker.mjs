import { randomUUID } from 'node:crypto';
import { parentPort, workerData } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';
import ffi from 'node:ffi';

import {
  caseById,
  classifyFastEligibility,
  definitionsFromIr,
  loadRuntimeIr,
  toFfiValue,
  toPublicValue,
} from './runtime-ir.mjs';
import { alignedBuffer, packLayout, packPointerTable, readScalar, writeScalar } from './packers.mjs';

if (!parentPort) throw new Error('EXP-000 FFI owner must run in a Worker.');

const ir = await loadRuntimeIr(workerData.runtimeIrPath);
const library = new ffi.DynamicLibrary(workerData.nativeLibraryPath);
const functions = library.getFunctions(definitionsFromIr(ir));
const runtimeId = randomUUID();
const resources = [];
let libraryOpen = true;
let shuttingDown = false;

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function ensureOpen() {
  if (!libraryOpen) throw codedError('CJS_LIBRARY_CLOSED', 'The EXP-000 native library is closed.');
}

function allocateRaw(size) {
  ensureOpen();
  const output = Buffer.alloc(8);
  const status = functions.cjs_alloc_bytes(BigInt(size), output);
  if (status !== 0) throw codedError('CJS_NATIVE_ALLOC', `Synthetic allocation failed with status ${status}.`);
  const pointer = readScalar(output, 0, 'pointer');
  if (pointer === 0n) throw codedError('CJS_NATIVE_ALLOC', 'Synthetic allocation returned a null pointer.');
  return pointer;
}

function releaseRaw(pointer) {
  const status = functions.cjs_free_bytes(pointer);
  if (status !== 0) throw codedError('CJS_NATIVE_FREE', `Synthetic release failed with status ${status}.`);
}

function createResource(kind, pointer, metadata = {}) {
  const slot = resources.length;
  const resource = { kind, pointer, generation: 1, state: 'live', metadata };
  resources.push(resource);
  return { runtimeId, kind, slot, generation: resource.generation };
}

function resolveResource(token, kind) {
  if (!token || typeof token !== 'object') throw codedError('CJS_INVALID_TOKEN', 'A resource token is required.');
  if (token.runtimeId !== runtimeId) throw codedError('CJS_CROSS_RUNTIME', 'The resource belongs to another runtime.');
  if (token.kind !== kind) throw codedError('CJS_WRONG_KIND', `Expected ${kind}; received ${token.kind}.`);
  if (!Number.isInteger(token.slot) || token.slot < 0 || token.slot >= resources.length) {
    throw codedError('CJS_INVALID_SLOT', 'The resource slot is invalid.');
  }
  const resource = resources[token.slot];
  if (resource.kind !== token.kind) throw codedError('CJS_WRONG_KIND', 'The resource kind does not match its slot.');
  if (resource.generation !== token.generation || resource.state !== 'live') {
    throw codedError('CJS_STALE_RESOURCE', 'The resource token is stale or closed.');
  }
  return resource;
}

function inventory() {
  const byState = {};
  for (const resource of resources) byState[resource.state] = (byState[resource.state] ?? 0) + 1;
  return {
    runtimeId,
    library: libraryOpen ? 'open' : 'closed',
    totalSlots: resources.length,
    byState,
    nativeLiveAllocations: libraryOpen ? functions.cjs_live_allocations().toString() : 'unavailable-after-close',
  };
}

function releaseResource(token) {
  const resource = resolveResource(token, 'allocation');
  resource.state = 'closing';
  releaseRaw(resource.pointer);
  resource.pointer = 0n;
  resource.state = 'closed';
  resource.generation++;
  return { state: resource.state, slot: token.slot, nextGeneration: resource.generation };
}

function closeResources() {
  const dispositions = [];
  for (let slot = resources.length - 1; slot >= 0; slot--) {
    const resource = resources[slot];
    if (resource.state !== 'live') continue;
    if (resource.kind === 'allocation') releaseRaw(resource.pointer);
    resource.pointer = 0n;
    resource.state = 'closed';
    resource.generation++;
    dispositions.push({ slot, kind: resource.kind, disposition: resource.kind === 'allocation' ? 'released' : 'invalidated' });
  }
  return dispositions;
}

function executeDirect(entry) {
  const signature = ir.functions[entry.symbol];
  const args = entry.values.map((value, index) => toFfiValue(signature.sourceArguments[index], value));
  return toPublicValue(functions[entry.symbol](...args));
}

function executePointer(entry) {
  switch (entry.runner) {
    case 'pointer-input': {
      const storage = Buffer.alloc(4);
      writeScalar(storage, 0, 'i32', -123456789);
      return functions.cjs_read_i32(storage);
    }
    case 'pointer-output': {
      const storage = Buffer.alloc(8);
      const status = functions.cjs_write_i64(storage, -9007199254740993n);
      return { status, value: readScalar(storage, 0, 'i64').toString() };
    }
    case 'nullable-pointer':
      return { nullValue: functions.cjs_nullable_i32(null, 77), presentValue: functions.cjs_nullable_i32(Buffer.from([42, 0, 0, 0]), 77) };
    case 'stable-pointer-output': {
      const storage = Buffer.alloc(8);
      const status = functions.cjs_get_stable(storage);
      const pointer = readScalar(storage, 0, 'pointer');
      return { status, nonzero: pointer !== 0n, checksum: functions.cjs_checksum_stable(pointer).toString() };
    }
    case 'allocation-output': {
      const pointer = allocateRaw(32);
      try {
        return { bytes: [...ffi.toBuffer(pointer, 32, true)], liveDuring: functions.cjs_live_allocations().toString() };
      } finally {
        releaseRaw(pointer);
      }
    }
    case 'array-count': {
      const values = [-4, 10, 20, 34];
      const storage = Buffer.alloc(values.length * 4);
      values.forEach((value, index) => writeScalar(storage, index * 4, 'i32', value));
      return functions.cjs_sum_i32(storage, BigInt(values.length)).toString();
    }
    case 'array-of-pointers': {
      const values = [-4, 10, 20, 34].map((value) => {
        const storage = Buffer.alloc(4);
        writeScalar(storage, 0, 'i32', value);
        return storage;
      });
      const table = packPointerTable(values.map((value) => ffi.getRawPointer(value)));
      return functions.cjs_sum_i32_ptrs(table, BigInt(values.length)).toString();
    }
    case 'void-table-inout': {
      const values = [-4, 10, 20, 34].map((value) => {
        const storage = Buffer.alloc(4);
        writeScalar(storage, 0, 'i32', value);
        return storage;
      });
      const input = packPointerTable(values.map((value) => ffi.getRawPointer(value)));
      const output = Buffer.alloc(input.length);
      const status = functions.cjs_reverse_ptr_table(input, output, BigInt(values.length));
      const sum = functions.cjs_sum_i32_ptrs(output, BigInt(values.length));
      return { status, sum: sum.toString() };
    }
    case 'buffer-mutate': {
      const storage = Buffer.from([1, 2, 3, 4, 5]);
      const checksum = functions.cjs_xor_bytes(storage, BigInt(storage.length), 0x5a);
      return { checksum: checksum.toString(), bytes: [...storage] };
    }
    case 'offset-alignment': {
      const storage = Buffer.alloc(24);
      const alignedStatus = functions.cjs_write_u64_at(storage, 24n, 8n, 0x1122334455667788n);
      const misalignedStatus = functions.cjs_write_u64_at(storage, 24n, 4n, 1n);
      const boundsStatus = functions.cjs_write_u64_at(storage, 24n, 20n, 1n);
      return {
        alignedStatus,
        misalignedStatus,
        boundsStatus,
        value: readScalar(storage, 8, 'u64').toString(),
      };
    }
    default: throw new Error(`Unknown pointer runner: ${entry.runner}`);
  }
}

function executeStructure(entry) {
  switch (entry.runner) {
    case 'struct-simple': {
      const input = packLayout(ir, 'simple', { a: -9, b: 0x1122334455667788n, c: 3.25 });
      const output = Buffer.alloc(ir.layouts.simple.size);
      const status = functions.cjs_transform_simple(input, output);
      return { status, checksum: functions.cjs_checksum_simple(output).toString() };
    }
    case 'struct-nested': {
      const input = packLayout(ir, 'nested', {
        tag: 5,
        inner: { a: -9, b: 0x1122334455667788n, c: 3.25 },
        values: [7, 11, 13],
      });
      return functions.cjs_checksum_nested(input).toString();
    }
    case 'struct-tagged': {
      const input = packLayout(ir, 'tagged', { tag: 1, value: { kind: 'i64', value: -1234567890123n } });
      return functions.cjs_checksum_tagged(input).toString();
    }
    case 'struct-pointer': {
      const target = Buffer.from([1, 2, 3, 4]);
      const input = packLayout(ir, 'pointerStruct', {
        pointer: ffi.getRawPointer(target),
        length: target.length,
        cookie: 0x0123456789abcdefn,
      });
      return functions.cjs_checksum_pointer_struct(input).toString();
    }
    case 'struct-aligned16': {
      const inputStorage = alignedBuffer(ir.layouts.aligned16.size, 16, ffi.getRawPointer);
      const outputStorage = alignedBuffer(ir.layouts.aligned16.size, 16, ffi.getRawPointer);
      packLayout(ir, 'aligned16', {
        lo: 0x0123456789abcdefn,
        hi: 0xfedcba9876543210n,
      }, { buffer: inputStorage.view });
      const status = functions.cjs_transform_aligned16(inputStorage.view, outputStorage.view);
      return {
        status,
        checksum: functions.cjs_checksum_aligned16(outputStorage.view).toString(),
        inputAligned: ffi.getRawPointer(inputStorage.view) % 16n === 0n,
        outputAligned: ffi.getRawPointer(outputStorage.view) % 16n === 0n,
      };
    }
    default: throw new Error(`Unknown structure runner: ${entry.runner}`);
  }
}

function executeLifecycle(entry, payload) {
  switch (entry.runner) {
    case 'resolver-only': {
      const pointer = functions.cjs_resolve_hidden();
      const publicCallableConstructors = Object.keys(ffi).filter((name) => /pointer|function|callable/i.test(name));
      return {
        pointerObserved: typeof pointer === 'bigint' && pointer !== 0n,
        arbitraryPointerCallableAvailable: false,
        publicCallableConstructors,
      };
    }
    case 'callback-same-thread': {
      let invocations = 0;
      const pointer = library.registerCallback(
        { arguments: ['i32'], return: 'i32' },
        (value) => {
          invocations++;
          return value * 2;
        },
      );
      try {
        return {
          value: functions.cjs_call_callback_i32(pointer, 21),
          invocations,
          owner: 'ffi-worker-system-thread',
        };
      } finally {
        library.unregisterCallback(pointer);
      }
    }
    case 'blocking-worker':
      return functions.cjs_sleep_ms(payload?.milliseconds ?? 150);
    default:
      throw codedError('CJS_DEDICATED_LIFECYCLE_COMMAND', `${entry.id} uses a dedicated lifecycle command.`);
  }
}

function executeCase(id, payload) {
  ensureOpen();
  const entry = caseById(ir, id);
  if (entry.runner === 'direct') return executeDirect(entry);
  if (entry.category === 'pointer') return executePointer(entry);
  if (entry.category === 'structure') return executeStructure(entry);
  if (entry.category === 'lifecycle') return executeLifecycle(entry, payload);
  throw new Error(`No execution owner for ${entry.id}.`);
}

function layoutReport() {
  ensureOpen();
  return Object.fromEntries(Object.entries(ir.layouts).map(([name, layout]) => [name, {
    size: Number(functions.cjs_layout_query(layout.id, 0)),
    alignment: Number(functions.cjs_layout_query(layout.id, 1)),
    fields: Object.fromEntries(layout.fields.map((field, index) => [
      field.name,
      Number(functions.cjs_layout_query(layout.id, index + 2)),
    ])),
  }]));
}

async function handle(command, payload) {
  switch (command) {
    case 'execute': return executeCase(payload.caseId, payload);
    case 'layout-report': return layoutReport();
    case 'inventory': return inventory();
    case 'allocate': {
      const size = payload.size;
      if (!Number.isInteger(size) || size <= 0 || size > 1048576) throw codedError('CJS_INVALID_SIZE', 'Allocation size is invalid.');
      return createResource('allocation', allocateRaw(size), { size });
    }
    case 'copy-allocation': {
      const resource = resolveResource(payload.token, 'allocation');
      return [...ffi.toBuffer(resource.pointer, resource.metadata.size, true)];
    }
    case 'release': return releaseResource(payload.token);
    case 'foreign-view-probe': {
      const pointer = allocateRaw(8);
      try {
        const copy = ffi.toBuffer(pointer, 8, true);
        const view = ffi.toBuffer(pointer, 8, false);
        view[0] ^= 0xff;
        return { copy: [...copy], afterMutation: [...ffi.toBuffer(pointer, 8, true)] };
      } finally {
        releaseRaw(pointer);
      }
    }
    case 'hold-stable': {
      const output = Buffer.alloc(8);
      const status = functions.cjs_get_stable(output);
      if (status !== 0) throw codedError('CJS_NATIVE_STABLE', `Stable pointer request failed with ${status}.`);
      return createResource('library-object', readScalar(output, 0, 'pointer'));
    }
    case 'library-close-probe': {
      ensureOpen();
      const wrapper = functions.cjs_zero_i32;
      library.close();
      library.close();
      libraryOpen = false;
      let rejected = false;
      let error = null;
      try {
        wrapper();
      } catch (cause) {
        rejected = true;
        error = { name: cause.name, code: cause.code ?? null, message: cause.message };
      }
      return { doubleClose: 'no-op', staleWrapperRejected: rejected, error };
    }
    case 'benchmark': {
      const entry = caseById(ir, payload.caseId);
      if (entry.runner !== 'direct') throw codedError('CJS_BENCHMARK_CASE', 'Only generated direct cases may be benchmarked.');
      const iterations = payload.iterations;
      if (!Number.isInteger(iterations) || iterations < 1 || iterations > 1000000) throw codedError('CJS_BENCHMARK_ITERATIONS', 'Benchmark iterations are out of bounds.');
      const signature = ir.functions[entry.symbol];
      const args = entry.values.map((value, index) => toFfiValue(signature.sourceArguments[index], value));
      const fn = functions[entry.symbol];
      const started = performance.now();
      let result;
      for (let index = 0; index < iterations; index++) result = fn(...args);
      const elapsedNanoseconds = Math.round((performance.now() - started) * 1e6);
      return { elapsedNanoseconds, iterations, terminalValue: toPublicValue(result) };
    }
    case 'shutdown': {
      if (shuttingDown) throw codedError('CJS_RUNTIME_CLOSING', 'The runtime is already shutting down.');
      shuttingDown = true;
      const before = inventory();
      const dispositions = libraryOpen ? closeResources() : [];
      const nativeLiveAfterResources = libraryOpen ? functions.cjs_live_allocations().toString() : 'unavailable-after-close';
      if (libraryOpen) {
        library.close();
        libraryOpen = false;
      }
      return { before, dispositions, nativeLiveAfterResources, library: 'closed' };
    }
    default: throw codedError('CJS_UNKNOWN_COMMAND', `Unknown worker command: ${command}`);
  }
}

const fastEligibility = Object.fromEntries(Object.entries(ir.functions).map(([symbol, signature]) => [
  symbol,
  classifyFastEligibility(signature),
]));

parentPort.postMessage({
  type: 'ready',
  runtimeId,
  profile: { node: process.version, platform: process.platform, architecture: process.arch },
  fastEligibility,
});

parentPort.on('message', async ({ id, command, payload }) => {
  try {
    const result = await handle(command, payload ?? {});
    parentPort.postMessage({ type: 'response', id, ok: true, result: toPublicValue(result) });
    if (command === 'shutdown') parentPort.close();
  } catch (error) {
    parentPort.postMessage({
      type: 'response',
      id,
      ok: false,
      error: { name: error.name, message: error.message, code: error.code ?? null },
    });
  }
});
