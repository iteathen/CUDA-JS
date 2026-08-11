/* Generated from case-schema.json (ca1d62de244edf48c148ddf649749818d8a5f9810c3e06ea79b7475f7e7db80c) by generator 0465e314eecaba2274d915baf4275c0cf7c179f796bb92afab315383da406f66. Do not edit. */
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

CJS_EXPORT int32_t cjs_zero_i32(void);
CJS_EXPORT int8_t cjs_identity_i8(int8_t a1);
CJS_EXPORT uint8_t cjs_identity_u8(uint8_t a1);
CJS_EXPORT int16_t cjs_identity_i16(int16_t a1);
CJS_EXPORT uint16_t cjs_identity_u16(uint16_t a1);
CJS_EXPORT int32_t cjs_identity_i32(int32_t a1);
CJS_EXPORT uint32_t cjs_identity_u32(uint32_t a1);
CJS_EXPORT int64_t cjs_identity_i64(int64_t a1);
CJS_EXPORT uint64_t cjs_identity_u64(uint64_t a1);
CJS_EXPORT float cjs_transform_f32(float a1);
CJS_EXPORT double cjs_transform_f64(double a1);
CJS_EXPORT size_t cjs_identity_size(size_t a1);
CJS_EXPORT intptr_t cjs_identity_intptr(intptr_t a1);
CJS_EXPORT uintptr_t cjs_identity_uintptr(uintptr_t a1);
CJS_EXPORT uintptr_t cjs_transform_handle(uintptr_t a1);
CJS_EXPORT int64_t cjs_args_integer_1(int64_t a1);
CJS_EXPORT int64_t cjs_args_integer_2(int64_t a1, int64_t a2);
CJS_EXPORT int64_t cjs_args_integer_3(int64_t a1, int64_t a2, int64_t a3);
CJS_EXPORT int64_t cjs_args_integer_4(int64_t a1, int64_t a2, int64_t a3, int64_t a4);
CJS_EXPORT int64_t cjs_args_integer_5(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5);
CJS_EXPORT int64_t cjs_args_integer_6(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6);
CJS_EXPORT int64_t cjs_args_integer_7(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6, int64_t a7);
CJS_EXPORT int64_t cjs_args_integer_8(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6, int64_t a7, int64_t a8);
CJS_EXPORT int64_t cjs_args_integer_9(int64_t a1, int64_t a2, int64_t a3, int64_t a4, int64_t a5, int64_t a6, int64_t a7, int64_t a8, int64_t a9);
CJS_EXPORT double cjs_args_floating_1(double a1);
CJS_EXPORT double cjs_args_floating_2(double a1, double a2);
CJS_EXPORT double cjs_args_floating_3(double a1, double a2, double a3);
CJS_EXPORT double cjs_args_floating_4(double a1, double a2, double a3, double a4);
CJS_EXPORT double cjs_args_floating_5(double a1, double a2, double a3, double a4, double a5);
CJS_EXPORT double cjs_args_floating_6(double a1, double a2, double a3, double a4, double a5, double a6);
CJS_EXPORT double cjs_args_floating_7(double a1, double a2, double a3, double a4, double a5, double a6, double a7);
CJS_EXPORT double cjs_args_floating_8(double a1, double a2, double a3, double a4, double a5, double a6, double a7, double a8);
CJS_EXPORT double cjs_args_floating_9(double a1, double a2, double a3, double a4, double a5, double a6, double a7, double a8, double a9);
CJS_EXPORT double cjs_args_mixed_1(int32_t a1);
CJS_EXPORT double cjs_args_mixed_2(int32_t a1, double a2);
CJS_EXPORT double cjs_args_mixed_3(int32_t a1, double a2, int32_t a3);
CJS_EXPORT double cjs_args_mixed_4(int32_t a1, double a2, int32_t a3, double a4);
CJS_EXPORT double cjs_args_mixed_5(int32_t a1, double a2, int32_t a3, double a4, int32_t a5);
CJS_EXPORT double cjs_args_mixed_6(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6);
CJS_EXPORT double cjs_args_mixed_7(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6, int32_t a7);
CJS_EXPORT double cjs_args_mixed_8(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6, int32_t a7, double a8);
CJS_EXPORT double cjs_args_mixed_9(int32_t a1, double a2, int32_t a3, double a4, int32_t a5, double a6, int32_t a7, double a8, int32_t a9);

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
