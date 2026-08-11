/* Generated direct-C oracle from case-schema.json (ca1d62de244edf48c148ddf649749818d8a5f9810c3e06ea79b7475f7e7db80c) by generator 0465e314eecaba2274d915baf4275c0cf7c179f796bb92afab315383da406f66. Do not edit. */
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

  printf("ENV pointerSize %zu\n", sizeof(void*));
  printf("ENV sizeSize %zu\n", sizeof(size_t));
  printf("ENV littleEndian %u\n", *((uint8_t*)&endian) == 1 ? 1u : 0u);
  printf("CASE scalar.zero.i32 i64 %" PRId64 "\n", (int64_t)cjs_zero_i32());
  printf("CASE scalar.i8.identity i64 %" PRId64 "\n", (int64_t)cjs_identity_i8(-101));
  printf("CASE scalar.u8.identity u64 %" PRIu64 "\n", (uint64_t)cjs_identity_u8(233));
  printf("CASE scalar.i16.identity i64 %" PRId64 "\n", (int64_t)cjs_identity_i16(-30001));
  printf("CASE scalar.u16.identity u64 %" PRIu64 "\n", (uint64_t)cjs_identity_u16(60001));
  printf("CASE scalar.i32.identity i64 %" PRId64 "\n", (int64_t)cjs_identity_i32(-2000000001));
  printf("CASE scalar.u32.identity u64 %" PRIu64 "\n", (uint64_t)cjs_identity_u32(4000000001));
  printf("CASE scalar.i64.identity i64 %" PRId64 "\n", (int64_t)cjs_identity_i64(INT64_C(-9007199254740993)));
  printf("CASE scalar.u64.identity u64 %" PRIu64 "\n", (uint64_t)cjs_identity_u64(UINT64_C(18446744073709551557)));
  printf("CASE scalar.f32.transform f64 %.17g\n", (double)cjs_transform_f32(10.5f));
  printf("CASE scalar.f64.transform f64 %.17g\n", (double)cjs_transform_f64(-12.25));
  printf("CASE scalar.size.identity u64 %" PRIu64 "\n", (uint64_t)cjs_identity_size(UINT64_C(4294967311)));
  printf("CASE scalar.intptr.identity i64 %" PRId64 "\n", (int64_t)cjs_identity_intptr(INT64_C(-4294967311)));
  printf("CASE scalar.uintptr.identity u64 %" PRIu64 "\n", (uint64_t)cjs_identity_uintptr(UINT64_C(4294967311)));
  printf("CASE scalar.opaque-handle.transform u64 %" PRIu64 "\n", (uint64_t)cjs_transform_handle(UINT64_C(305419896)));
  printf("CASE args.integer.1 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_1(INT64_C(1)));
  printf("CASE args.integer.2 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_2(INT64_C(1), INT64_C(2)));
  printf("CASE args.integer.3 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_3(INT64_C(1), INT64_C(2), INT64_C(3)));
  printf("CASE args.integer.4 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_4(INT64_C(1), INT64_C(2), INT64_C(3), INT64_C(4)));
  printf("CASE args.integer.5 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_5(INT64_C(1), INT64_C(2), INT64_C(3), INT64_C(4), INT64_C(5)));
  printf("CASE args.integer.6 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_6(INT64_C(1), INT64_C(2), INT64_C(3), INT64_C(4), INT64_C(5), INT64_C(6)));
  printf("CASE args.integer.7 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_7(INT64_C(1), INT64_C(2), INT64_C(3), INT64_C(4), INT64_C(5), INT64_C(6), INT64_C(7)));
  printf("CASE args.integer.8 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_8(INT64_C(1), INT64_C(2), INT64_C(3), INT64_C(4), INT64_C(5), INT64_C(6), INT64_C(7), INT64_C(8)));
  printf("CASE args.integer.9 i64 %" PRId64 "\n", (int64_t)cjs_args_integer_9(INT64_C(1), INT64_C(2), INT64_C(3), INT64_C(4), INT64_C(5), INT64_C(6), INT64_C(7), INT64_C(8), INT64_C(9)));
  printf("CASE args.floating.1 f64 %.17g\n", (double)cjs_args_floating_1(1.25));
  printf("CASE args.floating.2 f64 %.17g\n", (double)cjs_args_floating_2(1.25, 2.25));
  printf("CASE args.floating.3 f64 %.17g\n", (double)cjs_args_floating_3(1.25, 2.25, 3.25));
  printf("CASE args.floating.4 f64 %.17g\n", (double)cjs_args_floating_4(1.25, 2.25, 3.25, 4.25));
  printf("CASE args.floating.5 f64 %.17g\n", (double)cjs_args_floating_5(1.25, 2.25, 3.25, 4.25, 5.25));
  printf("CASE args.floating.6 f64 %.17g\n", (double)cjs_args_floating_6(1.25, 2.25, 3.25, 4.25, 5.25, 6.25));
  printf("CASE args.floating.7 f64 %.17g\n", (double)cjs_args_floating_7(1.25, 2.25, 3.25, 4.25, 5.25, 6.25, 7.25));
  printf("CASE args.floating.8 f64 %.17g\n", (double)cjs_args_floating_8(1.25, 2.25, 3.25, 4.25, 5.25, 6.25, 7.25, 8.25));
  printf("CASE args.floating.9 f64 %.17g\n", (double)cjs_args_floating_9(1.25, 2.25, 3.25, 4.25, 5.25, 6.25, 7.25, 8.25, 9.25));
  printf("CASE args.mixed.1 f64 %.17g\n", (double)cjs_args_mixed_1(2));
  printf("CASE args.mixed.2 f64 %.17g\n", (double)cjs_args_mixed_2(2, 2.5));
  printf("CASE args.mixed.3 f64 %.17g\n", (double)cjs_args_mixed_3(2, 2.5, 4));
  printf("CASE args.mixed.4 f64 %.17g\n", (double)cjs_args_mixed_4(2, 2.5, 4, 4.5));
  printf("CASE args.mixed.5 f64 %.17g\n", (double)cjs_args_mixed_5(2, 2.5, 4, 4.5, 6));
  printf("CASE args.mixed.6 f64 %.17g\n", (double)cjs_args_mixed_6(2, 2.5, 4, 4.5, 6, 6.5));
  printf("CASE args.mixed.7 f64 %.17g\n", (double)cjs_args_mixed_7(2, 2.5, 4, 4.5, 6, 6.5, 8));
  printf("CASE args.mixed.8 f64 %.17g\n", (double)cjs_args_mixed_8(2, 2.5, 4, 4.5, 6, 6.5, 8, 8.5));
  printf("CASE args.mixed.9 f64 %.17g\n", (double)cjs_args_mixed_9(2, 2.5, 4, 4.5, 6, 6.5, 8, 8.5, 10));
  printf("LAYOUT simple %zu %zu\n", cjs_layout_query(1, 0), cjs_layout_query(1, 1));
  printf("FIELD simple a %zu\n", cjs_layout_query(1, 2));
  printf("FIELD simple b %zu\n", cjs_layout_query(1, 3));
  printf("FIELD simple c %zu\n", cjs_layout_query(1, 4));
  printf("LAYOUT nested %zu %zu\n", cjs_layout_query(2, 0), cjs_layout_query(2, 1));
  printf("FIELD nested tag %zu\n", cjs_layout_query(2, 2));
  printf("FIELD nested inner %zu\n", cjs_layout_query(2, 3));
  printf("FIELD nested values %zu\n", cjs_layout_query(2, 4));
  printf("LAYOUT tagged %zu %zu\n", cjs_layout_query(3, 0), cjs_layout_query(3, 1));
  printf("FIELD tagged tag %zu\n", cjs_layout_query(3, 2));
  printf("FIELD tagged value %zu\n", cjs_layout_query(3, 3));
  printf("LAYOUT pointerStruct %zu %zu\n", cjs_layout_query(4, 0), cjs_layout_query(4, 1));
  printf("FIELD pointerStruct pointer %zu\n", cjs_layout_query(4, 2));
  printf("FIELD pointerStruct length %zu\n", cjs_layout_query(4, 3));
  printf("FIELD pointerStruct cookie %zu\n", cjs_layout_query(4, 4));
  printf("LAYOUT aligned16 %zu %zu\n", cjs_layout_query(5, 0), cjs_layout_query(5, 1));
  printf("FIELD aligned16 lo %zu\n", cjs_layout_query(5, 2));
  printf("FIELD aligned16 hi %zu\n", cjs_layout_query(5, 3));
  printf("CASE pointer.input.i32 i64 %" PRId64 "\n", (int64_t)cjs_read_i32(&pointer_value));
  cjs_write_i64(&output_value, INT64_C(-9007199254740993));
  printf("CASE pointer.output.i64 i64 %" PRId64 "\n", output_value);
  printf("CASE pointer.nullable.i32 i64 %" PRId64 "\n", (int64_t)cjs_nullable_i32(NULL, 77));
  printf("CASE pointer.array.count i64 %" PRId64 "\n", cjs_sum_i32(array_values, 4));
  printf("CASE pointer.buffer.mutate u64 %" PRIu64 "\n", cjs_xor_bytes(bytes, 5, 0x5a));
  cjs_transform_simple(&simple_in, &simple_out);
  printf("CASE struct.simple.transform u64 %" PRIu64 "\n", cjs_checksum_simple(&simple_out));
  printf("CASE struct.nested.checksum u64 %" PRIu64 "\n", cjs_checksum_nested(&nested));
  printf("CASE struct.union.discriminated u64 %" PRIu64 "\n", cjs_checksum_tagged(&tagged));
  cjs_transform_aligned16(&aligned_in, &aligned_out);
  printf("CASE struct.aligned16.transform u64 %" PRIu64 "\n", cjs_checksum_aligned16(&aligned_out));
  printf("CASE lifecycle.callback.same-thread i64 %" PRId64 "\n", (int64_t)cjs_call_callback_i32((void*)&oracle_callback, 21));
  printf("CLEANUP liveAllocations %zu\n", cjs_live_allocations());
  return 0;
}
