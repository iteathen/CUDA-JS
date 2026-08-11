/* Generated from case-schema.json (ca1d62de244edf48c148ddf649749818d8a5f9810c3e06ea79b7475f7e7db80c) by generator 98d89cd86d6e3daaef6d31fd8a5a1728fe2c633badfff47a7ed98e974adc00b2. Do not edit. */
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

int32_t cjs_zero_i32(void) { return INT32_C(324508639); }

int8_t cjs_identity_i8(int8_t a1) { return a1; }

uint8_t cjs_identity_u8(uint8_t a1) { return a1; }

int16_t cjs_identity_i16(int16_t a1) { return a1; }

uint16_t cjs_identity_u16(uint16_t a1) { return a1; }

int32_t cjs_identity_i32(int32_t a1) { return a1; }

uint32_t cjs_identity_u32(uint32_t a1) { return a1; }

int64_t cjs_identity_i64(int64_t a1) { return a1; }

uint64_t cjs_identity_u64(uint64_t a1) { return a1; }

float cjs_transform_f32(float a1) { return a1 * 1.5f + 0.25f; }

double cjs_transform_f64(double a1) { return a1 * 1.5 + 0.25; }

size_t cjs_identity_size(size_t a1) { return a1; }

intptr_t cjs_identity_intptr(intptr_t a1) { return a1; }

uintptr_t cjs_identity_uintptr(uintptr_t a1) { return a1; }

uintptr_t cjs_transform_handle(uintptr_t a1) { return (a1 << 32) | UINT64_C(0x9abcdef0); }

int64_t cjs_args_integer_1(int64_t a1) { return (int64_t)a1 * (int64_t)1; }

int64_t cjs_args_integer_2(int64_t a1, int64_t a2) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2; }

int64_t cjs_args_integer_3(int64_t a1, int64_t a2, int64_t a3) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3; }

int64_t cjs_args_integer_4(int64_t a1, int64_t a2, int64_t a3, int64_t a4) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3 + (int64_t)a4 * (int64_t)4; }

int64_t cjs_args_integer_5(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3 + (int64_t)a4 * (int64_t)4 + (int64_t)a5 * (int64_t)5; }

int64_t cjs_args_integer_6(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3 + (int64_t)a4 * (int64_t)4 + (int64_t)a5 * (int64_t)5 + (int64_t)a6 * (int64_t)6; }

int64_t cjs_args_integer_7(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6, int64_t a7) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3 + (int64_t)a4 * (int64_t)4 + (int64_t)a5 * (int64_t)5 + (int64_t)a6 * (int64_t)6 + (int64_t)a7 * (int64_t)7; }

int64_t cjs_args_integer_8(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6, int64_t a7, int64_t a8) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3 + (int64_t)a4 * (int64_t)4 + (int64_t)a5 * (int64_t)5 + (int64_t)a6 * (int64_t)6 + (int64_t)a7 * (int64_t)7 + (int64_t)a8 * (int64_t)8; }

int64_t cjs_args_integer_9(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6, int64_t a7, int64_t a8, int64_t a9) { return (int64_t)a1 * (int64_t)1 + (int64_t)a2 * (int64_t)2 + (int64_t)a3 * (int64_t)3 + (int64_t)a4 * (int64_t)4 + (int64_t)a5 * (int64_t)5 + (int64_t)a6 * (int64_t)6 + (int64_t)a7 * (int64_t)7 + (int64_t)a8 * (int64_t)8 + (int64_t)a9 * (int64_t)9; }

double cjs_args_floating_1(double a1) { return (double)a1 * (double)1; }

double cjs_args_floating_2(double a1, double a2) { return (double)a1 * (double)1 + (double)a2 * (double)2; }

double cjs_args_floating_3(double a1, double a2, double a3) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3; }

double cjs_args_floating_4(double a1, double a2, double a3, double a4) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4; }

double cjs_args_floating_5(double a1, double a2, double a3, double a4, double a5) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5; }

double cjs_args_floating_6(double a1, double a2, double a3, double a4, double a5, double a6) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6; }

double cjs_args_floating_7(double a1, double a2, double a3, double a4, double a5, double a6, double a7) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6 + (double)a7 * (double)7; }

double cjs_args_floating_8(double a1, double a2, double a3, double a4, double a5, double a6, double a7, double a8) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6 + (double)a7 * (double)7 + (double)a8 * (double)8; }

double cjs_args_floating_9(double a1, double a2, double a3, double a4, double a5, double a6, double a7, double a8, double a9) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6 + (double)a7 * (double)7 + (double)a8 * (double)8 + (double)a9 * (double)9; }

double cjs_args_mixed_1(int32_t a1) { return (double)a1 * (double)1; }

double cjs_args_mixed_2(int32_t a1, double a2) { return (double)a1 * (double)1 + (double)a2 * (double)2; }

double cjs_args_mixed_3(int32_t a1, double a2, int32_t a3) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3; }

double cjs_args_mixed_4(int32_t a1, double a2, int32_t a3, double a4) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4; }

double cjs_args_mixed_5(int32_t a1, double a2, int32_t a3, double a4, int32_t a5) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5; }

double cjs_args_mixed_6(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6; }

double cjs_args_mixed_7(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6, int32_t a7) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6 + (double)a7 * (double)7; }

double cjs_args_mixed_8(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6, int32_t a7, double a8) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6 + (double)a7 * (double)7 + (double)a8 * (double)8; }

double cjs_args_mixed_9(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6, int32_t a7, double a8, int32_t a9) { return (double)a1 * (double)1 + (double)a2 * (double)2 + (double)a3 * (double)3 + (double)a4 * (double)4 + (double)a5 * (double)5 + (double)a6 * (double)6 + (double)a7 * (double)7 + (double)a8 * (double)8 + (double)a9 * (double)9; }

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
