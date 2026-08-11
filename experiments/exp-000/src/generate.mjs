import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const generatorPath = fileURLToPath(import.meta.url);
const experimentRoot = path.resolve(path.dirname(generatorPath), '..');
const schemaPath = path.join(experimentRoot, 'case-schema.json');
const generatedRoot = path.join(experimentRoot, 'generated');
const checkOnly = process.argv.includes('--check');

const schemaBytes = await readFile(schemaPath);
const generatorBytes = await readFile(generatorPath);
const schema = JSON.parse(schemaBytes);
const schemaSha256 = createHash('sha256').update(schemaBytes).digest('hex');
const generatorSha256 = createHash('sha256').update(generatorBytes).digest('hex');

const typeFacts = {
  i8: { c: 'int8_t', ffi: 'i8' },
  u8: { c: 'uint8_t', ffi: 'u8' },
  i16: { c: 'int16_t', ffi: 'i16' },
  u16: { c: 'uint16_t', ffi: 'u16' },
  i32: { c: 'int32_t', ffi: 'i32' },
  u32: { c: 'uint32_t', ffi: 'u32' },
  i64: { c: 'int64_t', ffi: 'i64' },
  u64: { c: 'uint64_t', ffi: 'u64' },
  f32: { c: 'float', ffi: 'f32' },
  f64: { c: 'double', ffi: 'f64' },
  size: { c: 'size_t', ffi: 'u64' },
  intptr: { c: 'intptr_t', ffi: 'i64' },
  uintptr: { c: 'uintptr_t', ffi: 'u64' },
  handle: { c: 'uintptr_t', ffi: 'u64' },
  pointer: { c: 'void*', ffi: 'pointer' },
  void: { c: 'void', ffi: 'void' },
};

function assertSchema() {
  if (schema.schemaVersion !== 1) throw new Error(`Unsupported schema version: ${schema.schemaVersion}`);
  const ids = new Set();
  for (const group of ['scalarCases', 'pointerCases', 'structureCases', 'lifecycleCases']) {
    for (const entry of schema[group]) {
      if (ids.has(entry.id)) throw new Error(`Duplicate case id: ${entry.id}`);
      ids.add(entry.id);
    }
  }
  for (const scalar of schema.scalarCases) {
    if (!(scalar.type in typeFacts)) throw new Error(`Unknown scalar type: ${scalar.type}`);
  }
}

assertSchema();

function integerArguments(count) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'i64',
    value: String(index + 1),
    weight: String(index + 1),
  }));
}

function floatingArguments(count) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'f64',
    value: index + 1.25,
    weight: index + 1,
  }));
}

function mixedArguments(count) {
  return Array.from({ length: count }, (_, index) => index % 2 === 0
    ? { type: 'i32', value: index + 2, weight: index + 1 }
    : { type: 'f64', value: index + 1.5, weight: index + 1 });
}

const envelopeCases = [];
for (const count of schema.argumentEnvelopes.integerCounts) {
  const args = integerArguments(count);
  envelopeCases.push({
    id: `args.integer.${count}`,
    symbol: `cjs_args_integer_${count}`,
    category: 'argument-envelope',
    runner: 'direct',
    arguments: args.map(({ type }) => type),
    returnType: 'i64',
    values: args.map(({ value }) => value),
    expected: args.reduce((sum, arg) => sum + BigInt(arg.value) * BigInt(arg.weight), 0n).toString(),
    weights: args.map(({ weight }) => weight),
  });
}
for (const count of schema.argumentEnvelopes.floatingCounts) {
  const args = floatingArguments(count);
  envelopeCases.push({
    id: `args.floating.${count}`,
    symbol: `cjs_args_floating_${count}`,
    category: 'argument-envelope',
    runner: 'direct',
    arguments: args.map(({ type }) => type),
    returnType: 'f64',
    values: args.map(({ value }) => value),
    expected: args.reduce((sum, arg) => sum + arg.value * arg.weight, 0),
    weights: args.map(({ weight }) => weight),
  });
}
for (const count of schema.argumentEnvelopes.mixedCounts) {
  const args = mixedArguments(count);
  envelopeCases.push({
    id: `args.mixed.${count}`,
    symbol: `cjs_args_mixed_${count}`,
    category: 'argument-envelope',
    runner: 'direct',
    arguments: args.map(({ type }) => type),
    returnType: 'f64',
    values: args.map(({ value }) => value),
    expected: args.reduce((sum, arg) => sum + Number(arg.value) * Number(arg.weight), 0),
    weights: args.map(({ weight }) => weight),
  });
}

const scalarRuntimeCases = schema.scalarCases.map((entry) => ({
  ...entry,
  category: 'scalar',
  runner: 'direct',
  arguments: entry.input === null ? [] : [entry.type],
  returnType: entry.type,
  values: entry.input === null ? [] : [entry.input],
}));

const pointerFunctions = {
  cjs_read_i32: { arguments: ['pointer'], returnType: 'i32' },
  cjs_write_i64: { arguments: ['pointer', 'i64'], returnType: 'i32' },
  cjs_nullable_i32: { arguments: ['pointer', 'i32'], returnType: 'i32' },
  cjs_get_stable: { arguments: ['pointer'], returnType: 'i32' },
  cjs_checksum_stable: { arguments: ['pointer'], returnType: 'u64' },
  cjs_alloc_bytes: { arguments: ['size', 'pointer'], returnType: 'i32' },
  cjs_free_bytes: { arguments: ['pointer'], returnType: 'i32' },
  cjs_live_allocations: { arguments: [], returnType: 'size' },
  cjs_sum_i32: { arguments: ['pointer', 'size'], returnType: 'i64' },
  cjs_sum_i32_ptrs: { arguments: ['pointer', 'size'], returnType: 'i64' },
  cjs_reverse_ptr_table: { arguments: ['pointer', 'pointer', 'size'], returnType: 'i32' },
  cjs_xor_bytes: { arguments: ['pointer', 'size', 'u8'], returnType: 'u64' },
  cjs_write_u64_at: { arguments: ['pointer', 'size', 'size', 'u64'], returnType: 'i32' },
};

const structureFunctions = {
  cjs_transform_simple: { arguments: ['pointer', 'pointer'], returnType: 'i32' },
  cjs_checksum_simple: { arguments: ['pointer'], returnType: 'u64' },
  cjs_checksum_nested: { arguments: ['pointer'], returnType: 'u64' },
  cjs_checksum_tagged: { arguments: ['pointer'], returnType: 'u64' },
  cjs_checksum_pointer_struct: { arguments: ['pointer'], returnType: 'u64' },
  cjs_transform_aligned16: { arguments: ['pointer', 'pointer'], returnType: 'i32' },
  cjs_checksum_aligned16: { arguments: ['pointer'], returnType: 'u64' },
  cjs_layout_query: { arguments: ['u32', 'u32'], returnType: 'size' },
};

const lifecycleFunctions = {
  cjs_resolve_hidden: { arguments: [], returnType: 'pointer' },
  cjs_call_callback_i32: { arguments: ['pointer', 'i32'], returnType: 'i32' },
  cjs_sleep_ms: { arguments: ['u32'], returnType: 'u32' },
};

const functionEntries = new Map();
for (const entry of [...scalarRuntimeCases, ...envelopeCases]) {
  functionEntries.set(entry.symbol, {
    arguments: entry.arguments,
    returnType: entry.returnType,
    caseIds: [entry.id],
  });
}
for (const group of [pointerFunctions, structureFunctions, lifecycleFunctions]) {
  for (const [symbol, signature] of Object.entries(group)) {
    functionEntries.set(symbol, { ...signature, caseIds: [] });
  }
}
for (const entry of [...schema.pointerCases, ...schema.structureCases, ...schema.lifecycleCases]) {
  const fn = functionEntries.get(entry.symbol);
  if (!fn) throw new Error(`No signature declared for ${entry.symbol}`);
  fn.caseIds.push(entry.id);
}

const runtimeIr = {
  schemaVersion: 1,
  id: schema.id,
  schemaSha256,
  generatorSha256,
  sourceIdentity: schema.sourceIdentity,
  generatedBy: 'experiments/exp-000/src/generate.mjs',
  abi: {
    byteOrder: 'little-endian',
    pointerBits: 64,
    sizeBits: 64,
    supportedProfiles: ['win32-x64-msvc', 'linux-x64-sysv', 'linux-arm64-aapcs64'],
  },
  types: typeFacts,
  layouts: schema.layouts,
  functions: Object.fromEntries([...functionEntries].map(([symbol, fn]) => [symbol, {
    arguments: fn.arguments.map((type) => typeFacts[type].ffi),
    return: typeFacts[fn.returnType].ffi,
    sourceArguments: fn.arguments,
    sourceReturn: fn.returnType,
    caseIds: fn.caseIds,
  }])),
  cases: [
    ...scalarRuntimeCases,
    ...envelopeCases,
    ...schema.pointerCases.map((entry) => ({ ...entry, category: 'pointer' })),
    ...schema.structureCases.map((entry) => ({ ...entry, category: 'structure' })),
    ...schema.lifecycleCases.map((entry) => ({ ...entry, category: 'lifecycle' })),
  ],
};

function cArgumentList(types) {
  if (types.length === 0) return 'void';
  return types.map((type, index) => `${typeFacts[type].c} a${index + 1}`).join(', ');
}

function scalarDeclaration(entry) {
  return `CJS_EXPORT ${typeFacts[entry.returnType].c} ${entry.symbol}(${cArgumentList(entry.arguments)});`;
}

function scalarDefinition(entry) {
  const returnType = typeFacts[entry.returnType].c;
  const args = cArgumentList(entry.arguments);
  if (entry.id === 'scalar.zero.i32') return `${returnType} ${entry.symbol}(${args}) { return INT32_C(324508639); }`;
  if (entry.id === 'scalar.f32.transform') return `${returnType} ${entry.symbol}(${args}) { return a1 * 1.5f + 0.25f; }`;
  if (entry.id === 'scalar.f64.transform') return `${returnType} ${entry.symbol}(${args}) { return a1 * 1.5 + 0.25; }`;
  if (entry.id === 'scalar.opaque-handle.transform') {
    return `${returnType} ${entry.symbol}(${args}) { return (a1 << 32) | UINT64_C(0x9abcdef0); }`;
  }
  return `${returnType} ${entry.symbol}(${args}) { return a1; }`;
}

function envelopeDefinition(entry) {
  const returnType = typeFacts[entry.returnType].c;
  const args = cArgumentList(entry.arguments);
  const terms = entry.weights.map((weight, index) => `(${returnType})a${index + 1} * (${returnType})${weight}`).join(' + ');
  return `${returnType} ${entry.symbol}(${args}) { return ${terms}; }`;
}

const declarations = [...scalarRuntimeCases, ...envelopeCases].map(scalarDeclaration).join('\n');
const definitions = [
  ...scalarRuntimeCases.map(scalarDefinition),
  ...envelopeCases.map(envelopeDefinition),
].join('\n\n');

const header = `/* Generated from case-schema.json (${schemaSha256}) by generator ${generatorSha256}. Do not edit. */
#ifndef CJS_EXP_000_SYNTHETIC_ABI_H
#define CJS_EXP_000_SYNTHETIC_ABI_H

#include <stddef.h>
#include <stdint.h>

#if defined(_WIN32)
#define CJS_EXPORT __declspec(dllexport)
#define CJS_ALIGN16 __declspec(align(16))
#else
#define CJS_EXPORT __attribute__((visibility("default")))
#define CJS_ALIGN16 __attribute__((aligned(16)))
#endif

#if defined(__cplusplus)
extern "C" {
#endif

typedef struct cjs_simple {
  int32_t a;
  uint64_t b;
  double c;
} cjs_simple;

typedef struct cjs_nested {
  uint8_t tag;
  cjs_simple inner;
  uint32_t values[3];
} cjs_nested;

typedef union cjs_union16 {
  int64_t i64;
  double f64;
  uint8_t bytes[16];
} cjs_union16;

typedef struct cjs_tagged {
  uint32_t tag;
  cjs_union16 value;
} cjs_tagged;

typedef struct cjs_pointer_struct {
  void* pointer;
  size_t length;
  uint64_t cookie;
} cjs_pointer_struct;

typedef struct CJS_ALIGN16 cjs_aligned16 {
  uint64_t lo;
  uint64_t hi;
} cjs_aligned16;

${declarations}

CJS_EXPORT int32_t cjs_read_i32(const int32_t* value);
CJS_EXPORT int32_t cjs_write_i64(int64_t* output, int64_t value);
CJS_EXPORT int32_t cjs_nullable_i32(const int32_t* value, int32_t fallback);
CJS_EXPORT int32_t cjs_get_stable(void** output);
CJS_EXPORT uint64_t cjs_checksum_stable(const void* value);
CJS_EXPORT int32_t cjs_alloc_bytes(size_t size, void** output);
CJS_EXPORT int32_t cjs_free_bytes(void* value);
CJS_EXPORT size_t cjs_live_allocations(void);
CJS_EXPORT int64_t cjs_sum_i32(const int32_t* values, size_t count);
CJS_EXPORT int64_t cjs_sum_i32_ptrs(const int32_t* const* values, size_t count);
CJS_EXPORT int32_t cjs_reverse_ptr_table(void* const* input, void** output, size_t count);
CJS_EXPORT uint64_t cjs_xor_bytes(uint8_t* values, size_t count, uint8_t mask);
CJS_EXPORT int32_t cjs_write_u64_at(void* storage, size_t length, size_t offset, uint64_t value);

CJS_EXPORT int32_t cjs_transform_simple(const cjs_simple* input, cjs_simple* output);
CJS_EXPORT uint64_t cjs_checksum_simple(const cjs_simple* value);
CJS_EXPORT uint64_t cjs_checksum_nested(const cjs_nested* value);
CJS_EXPORT uint64_t cjs_checksum_tagged(const cjs_tagged* value);
CJS_EXPORT uint64_t cjs_checksum_pointer_struct(const cjs_pointer_struct* value);
CJS_EXPORT int32_t cjs_transform_aligned16(const cjs_aligned16* input, cjs_aligned16* output);
CJS_EXPORT uint64_t cjs_checksum_aligned16(const cjs_aligned16* value);
CJS_EXPORT size_t cjs_layout_query(uint32_t layout, uint32_t item);

CJS_EXPORT void* cjs_resolve_hidden(void);
CJS_EXPORT int32_t cjs_call_callback_i32(void* callback, int32_t value);
CJS_EXPORT uint32_t cjs_sleep_ms(uint32_t milliseconds);

#if defined(__cplusplus)
}
#endif

#endif
`;

const source = `/* Generated from case-schema.json (${schemaSha256}) by generator ${generatorSha256}. Do not edit. */
#if !defined(_WIN32) && !defined(_POSIX_C_SOURCE)
#define _POSIX_C_SOURCE 200809L
#endif

#include "synthetic_abi.h"

#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#include <windows.h>
#define CJS_ALIGNOF(T) __alignof(T)
#else
#include <time.h>
#define CJS_ALIGNOF(T) _Alignof(T)
#endif

${definitions}

typedef struct cjs_stable {
  int32_t value;
  uint64_t cookie;
} cjs_stable;

static cjs_stable stable_value = { INT32_C(-77), UINT64_C(0x1122334455667788) };
static size_t live_allocations = 0;

int32_t cjs_read_i32(const int32_t* value) { return value == NULL ? INT32_MIN : *value; }

int32_t cjs_write_i64(int64_t* output, int64_t value) {
  if (output == NULL) return -1;
  *output = value;
  return 0;
}

int32_t cjs_nullable_i32(const int32_t* value, int32_t fallback) {
  return value == NULL ? fallback : *value;
}

int32_t cjs_get_stable(void** output) {
  if (output == NULL) return -1;
  *output = &stable_value;
  return 0;
}

uint64_t cjs_checksum_stable(const void* value) {
  const cjs_stable* stable = (const cjs_stable*)value;
  if (stable == NULL) return 0;
  return stable->cookie ^ (uint64_t)(uint32_t)stable->value;
}

int32_t cjs_alloc_bytes(size_t size, void** output) {
  uint8_t* bytes;
  size_t index;
  if (output == NULL || size == 0 || size > 1048576) return -1;
  bytes = (uint8_t*)malloc(size);
  if (bytes == NULL) return -2;
  for (index = 0; index < size; index++) bytes[index] = (uint8_t)((index * 17 + 3) & 0xff);
  *output = bytes;
  live_allocations++;
  return 0;
}

int32_t cjs_free_bytes(void* value) {
  if (value == NULL || live_allocations == 0) return -1;
  free(value);
  live_allocations--;
  return 0;
}

size_t cjs_live_allocations(void) { return live_allocations; }

int64_t cjs_sum_i32(const int32_t* values, size_t count) {
  int64_t sum = 0;
  size_t index;
  if (values == NULL && count != 0) return INT64_MIN;
  for (index = 0; index < count; index++) sum += values[index];
  return sum;
}

int64_t cjs_sum_i32_ptrs(const int32_t* const* values, size_t count) {
  int64_t sum = 0;
  size_t index;
  if (values == NULL && count != 0) return INT64_MIN;
  for (index = 0; index < count; index++) {
    if (values[index] == NULL) return INT64_MIN;
    sum += *values[index];
  }
  return sum;
}

int32_t cjs_reverse_ptr_table(void* const* input, void** output, size_t count) {
  size_t index;
  if ((input == NULL || output == NULL) && count != 0) return -1;
  for (index = 0; index < count; index++) output[index] = input[count - index - 1];
  return 0;
}

uint64_t cjs_xor_bytes(uint8_t* values, size_t count, uint8_t mask) {
  uint64_t checksum = 1469598103934665603ULL;
  size_t index;
  if (values == NULL && count != 0) return 0;
  for (index = 0; index < count; index++) {
    values[index] ^= mask;
    checksum ^= values[index];
    checksum *= 1099511628211ULL;
  }
  return checksum;
}

int32_t cjs_write_u64_at(void* storage, size_t length, size_t offset, uint64_t value) {
  if (storage == NULL || offset > length || length - offset < sizeof(value)) return -1;
  if ((offset % CJS_ALIGNOF(uint64_t)) != 0) return -2;
  memcpy((uint8_t*)storage + offset, &value, sizeof(value));
  return 0;
}

uint64_t cjs_checksum_simple(const cjs_simple* value) {
  if (value == NULL) return 0;
  return (uint64_t)(uint32_t)value->a ^ value->b ^ (uint64_t)(value->c * 1024.0);
}

int32_t cjs_transform_simple(const cjs_simple* input, cjs_simple* output) {
  if (input == NULL || output == NULL) return -1;
  output->a = input->a + 7;
  output->b = input->b ^ UINT64_C(0x0102030405060708);
  output->c = input->c * 2.0;
  return 0;
}

uint64_t cjs_checksum_nested(const cjs_nested* value) {
  if (value == NULL) return 0;
  return (uint64_t)value->tag + cjs_checksum_simple(&value->inner)
    + value->values[0] * UINT64_C(3) + value->values[1] * UINT64_C(5)
    + value->values[2] * UINT64_C(7);
}

uint64_t cjs_checksum_tagged(const cjs_tagged* value) {
  uint64_t bits = 0;
  if (value == NULL) return 0;
  if (value->tag == 1) return (uint64_t)value->value.i64 ^ UINT64_C(0x1111111111111111);
  if (value->tag == 2) {
    memcpy(&bits, &value->value.f64, sizeof(bits));
    return bits ^ UINT64_C(0x2222222222222222);
  }
  memcpy(&bits, value->value.bytes, sizeof(bits));
  return bits ^ UINT64_C(0x3333333333333333);
}

uint64_t cjs_checksum_pointer_struct(const cjs_pointer_struct* value) {
  if (value == NULL) return 0;
  return value->cookie ^ (uint64_t)value->length ^ (value->pointer == NULL ? 0 : UINT64_C(0x8000000000000000));
}

int32_t cjs_transform_aligned16(const cjs_aligned16* input, cjs_aligned16* output) {
  if (input == NULL || output == NULL) return -1;
  output->lo = input->hi ^ UINT64_C(0xaaaaaaaaaaaaaaaa);
  output->hi = input->lo ^ UINT64_C(0x5555555555555555);
  return 0;
}

uint64_t cjs_checksum_aligned16(const cjs_aligned16* value) {
  return value == NULL ? 0 : value->lo ^ value->hi;
}

size_t cjs_layout_query(uint32_t layout, uint32_t item) {
  switch (layout) {
    case 1:
      switch (item) { case 0: return sizeof(cjs_simple); case 1: return CJS_ALIGNOF(cjs_simple); case 2: return offsetof(cjs_simple, a); case 3: return offsetof(cjs_simple, b); case 4: return offsetof(cjs_simple, c); default: return SIZE_MAX; }
    case 2:
      switch (item) { case 0: return sizeof(cjs_nested); case 1: return CJS_ALIGNOF(cjs_nested); case 2: return offsetof(cjs_nested, tag); case 3: return offsetof(cjs_nested, inner); case 4: return offsetof(cjs_nested, values); default: return SIZE_MAX; }
    case 3:
      switch (item) { case 0: return sizeof(cjs_tagged); case 1: return CJS_ALIGNOF(cjs_tagged); case 2: return offsetof(cjs_tagged, tag); case 3: return offsetof(cjs_tagged, value); default: return SIZE_MAX; }
    case 4:
      switch (item) { case 0: return sizeof(cjs_pointer_struct); case 1: return CJS_ALIGNOF(cjs_pointer_struct); case 2: return offsetof(cjs_pointer_struct, pointer); case 3: return offsetof(cjs_pointer_struct, length); case 4: return offsetof(cjs_pointer_struct, cookie); default: return SIZE_MAX; }
    case 5:
      switch (item) { case 0: return sizeof(cjs_aligned16); case 1: return CJS_ALIGNOF(cjs_aligned16); case 2: return offsetof(cjs_aligned16, lo); case 3: return offsetof(cjs_aligned16, hi); default: return SIZE_MAX; }
    default: return SIZE_MAX;
  }
}

static int32_t cjs_hidden_add(int32_t left, int32_t right) { return left + right + 17; }
void* cjs_resolve_hidden(void) { return (void*)&cjs_hidden_add; }

typedef int32_t (*cjs_callback_i32)(int32_t value);
int32_t cjs_call_callback_i32(void* callback, int32_t value) {
  if (callback == NULL) return INT32_MIN;
  return ((cjs_callback_i32)callback)(value) + 3;
}

uint32_t cjs_sleep_ms(uint32_t milliseconds) {
#if defined(_WIN32)
  Sleep(milliseconds);
#else
  struct timespec request;
  request.tv_sec = milliseconds / 1000;
  request.tv_nsec = (long)(milliseconds % 1000) * 1000000L;
  nanosleep(&request, NULL);
#endif
  return milliseconds;
}
`;

function cLiteral(value, type) {
  if (type === 'i64' || type === 'intptr') return `INT64_C(${value})`;
  if (type === 'u64' || type === 'size' || type === 'uintptr' || type === 'handle') return `UINT64_C(${value})`;
  if (type === 'f32') return `${Number(value)}f`;
  if (type === 'f64') return `${Number(value)}`;
  return `${value}`;
}

function oracleCaseLine(entry) {
  const args = entry.values.map((value, index) => cLiteral(value, entry.arguments[index])).join(', ');
  const expression = `${entry.symbol}(${args})`;
  if (entry.returnType === 'f32' || entry.returnType === 'f64') {
    return `  printf("CASE ${entry.id} f64 %.17g\\n", (double)${expression});`;
  }
  if (entry.returnType === 'i8' || entry.returnType === 'i16' || entry.returnType === 'i32' || entry.returnType === 'i64' || entry.returnType === 'intptr') {
    return `  printf("CASE ${entry.id} i64 %" PRId64 "\\n", (int64_t)${expression});`;
  }
  return `  printf("CASE ${entry.id} u64 %" PRIu64 "\\n", (uint64_t)${expression});`;
}

const oracleScalarLines = [...scalarRuntimeCases, ...envelopeCases].map(oracleCaseLine).join('\n');
const oracleLayoutLines = Object.entries(schema.layouts).map(([name, layout]) => {
  const fieldLines = layout.fields.map((field, index) => `  printf("FIELD ${name} ${field.name} %zu\\n", cjs_layout_query(${layout.id}, ${index + 2}));`).join('\n');
  return `  printf("LAYOUT ${name} %zu %zu\\n", cjs_layout_query(${layout.id}, 0), cjs_layout_query(${layout.id}, 1));\n${fieldLines}`;
}).join('\n');

const oracle = `/* Generated direct-C oracle from case-schema.json (${schemaSha256}) by generator ${generatorSha256}. Do not edit. */
#include "synthetic_abi.h"

#include <inttypes.h>
#include <stdio.h>
#include <string.h>

static int32_t oracle_callback(int32_t value) { return value * 2; }

int main(void) {
  uint16_t endian = 1;
  int32_t pointer_value = -123456789;
  int64_t output_value = 0;
  int32_t array_values[] = { 10, -20, 30, 40 };
  uint8_t bytes[] = { 1, 2, 3, 4, 5 };
  cjs_simple simple_in = { -9, UINT64_C(0x1122334455667788), 3.25 };
  cjs_simple simple_out;
  cjs_nested nested = { 5, { -9, UINT64_C(0x1122334455667788), 3.25 }, { 7, 11, 13 } };
  cjs_tagged tagged;
  cjs_aligned16 aligned_in = { UINT64_C(0x0123456789abcdef), UINT64_C(0xfedcba9876543210) };
  cjs_aligned16 aligned_out;

  memset(&tagged, 0, sizeof(tagged));
  tagged.tag = 1;
  tagged.value.i64 = INT64_C(-1234567890123);

  printf("ENV pointerSize %zu\\n", sizeof(void*));
  printf("ENV sizeSize %zu\\n", sizeof(size_t));
  printf("ENV littleEndian %u\\n", *((uint8_t*)&endian) == 1 ? 1u : 0u);
${oracleScalarLines}
${oracleLayoutLines}
  printf("CASE pointer.input.i32 i64 %" PRId64 "\\n", (int64_t)cjs_read_i32(&pointer_value));
  cjs_write_i64(&output_value, INT64_C(-9007199254740993));
  printf("CASE pointer.output.i64 i64 %" PRId64 "\\n", output_value);
  printf("CASE pointer.nullable.i32 i64 %" PRId64 "\\n", (int64_t)cjs_nullable_i32(NULL, 77));
  printf("CASE pointer.array.count i64 %" PRId64 "\\n", cjs_sum_i32(array_values, 4));
  printf("CASE pointer.buffer.mutate u64 %" PRIu64 "\\n", cjs_xor_bytes(bytes, 5, 0x5a));
  cjs_transform_simple(&simple_in, &simple_out);
  printf("CASE struct.simple.transform u64 %" PRIu64 "\\n", cjs_checksum_simple(&simple_out));
  printf("CASE struct.nested.checksum u64 %" PRIu64 "\\n", cjs_checksum_nested(&nested));
  printf("CASE struct.union.discriminated u64 %" PRIu64 "\\n", cjs_checksum_tagged(&tagged));
  cjs_transform_aligned16(&aligned_in, &aligned_out);
  printf("CASE struct.aligned16.transform u64 %" PRIu64 "\\n", cjs_checksum_aligned16(&aligned_out));
  printf("CASE lifecycle.callback.same-thread i64 %" PRId64 "\\n", (int64_t)cjs_call_callback_i32((void*)&oracle_callback, 21));
  printf("CLEANUP liveAllocations %zu\\n", cjs_live_allocations());
  return 0;
}
`;

const products = new Map([
  ['runtime-ir.json', `${JSON.stringify(runtimeIr, null, 2)}\n`],
  ['synthetic_abi.h', header],
  ['synthetic_abi.c', source],
  ['oracle.c', oracle],
]);

await mkdir(generatedRoot, { recursive: true });
let mismatches = 0;
for (const [name, content] of products) {
  const target = path.join(generatedRoot, name);
  if (checkOnly) {
    let existing = null;
    try {
      existing = await readFile(target, 'utf8');
    } catch {
      // Report through the common mismatch path.
    }
    if (existing !== content) {
      console.error(`Generated product is stale: ${path.relative(experimentRoot, target)}`);
      mismatches++;
    }
  } else {
    await writeFile(target, content);
    console.log(`generated ${path.relative(experimentRoot, target)}`);
  }
}

if (mismatches > 0) process.exit(1);
