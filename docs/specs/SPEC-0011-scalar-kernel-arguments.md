# SPEC-0011: Typed Scalar Kernel Arguments

**Status:** Accepted

**Date:** 2026-08-12

## Outcome

Extend the accepted packed kernel-argument ABI with three additional closed scalar kinds: `u64`, `i32`, and `f32`.

This is a bounded additive follow-up to SPEC-0005. It preserves the existing opaque `device-memory` and `u32` behavior, the sized launch buffer, private stream/event ownership, single-flight execution profile, resource leases, and failure/teardown semantics.

## Device ABI basis

CUDA Driver packed launch parameters must be placed at offsets satisfying each parameter type's device-code alignment. CUDA's documented basic type/alignment model gives:

- `unsigned long long`: 8 bytes, 8-byte alignment;
- `int`: 4 bytes, 4-byte alignment;
- `float`: 4 bytes, 4-byte alignment, IEEE-754 single precision.

CUDA-JS exposes semantic scalar kinds rather than C/C++ type spellings or arbitrary ABI descriptions.

## Public parameter kinds

The closed function-parameter schema becomes:

```text
device-memory
u32
u64
i32
f32
```

Unknown kinds continue to fail before native work.

## Value contracts

### `u32`

Unchanged: JavaScript integer in `[0, 2^32 - 1]`, packed little-endian in 4 bytes at 4-byte alignment.

### `u64`

- public launch value: JavaScript `bigint`;
- allowed range: `0n` through `0xffff_ffff_ffff_ffffn`;
- packed little-endian in 8 bytes at 8-byte alignment;
- JavaScript `number` is rejected even when numerically small, preventing loss of exactness and implicit representation changes;
- bigint values never enter public result/error records.

### `i32`

- public launch value: JavaScript integer;
- allowed range: `-2147483648` through `2147483647`;
- packed two's-complement little-endian in 4 bytes at 4-byte alignment.

### `f32`

- public launch value: JavaScript `number`;
- value must be finite;
- conversion uses IEEE-754 binary32 rounding as represented by Node's 4-byte float packing;
- if conversion overflows binary32 to non-finite, validation rejects before launch;
- `NaN`, positive/negative infinity, and non-number values are rejected in the first slice;
- signed zero and finite subnormal/underflow behavior follow binary32 encoding.

The finite-only first slice avoids ambiguous NaN payload/canonicalization evidence. A future capability may admit non-finite values only with an explicit bit-level contract.

## Layout

Each packed entry uses its natural width as alignment:

- `device-memory`: 8 / 8;
- `u64`: 8 / 8;
- `u32`: 4 / 4;
- `i32`: 4 / 4;
- `f32`: 4 / 4.

Padding remains zero-filled. Mixed signatures are laid out deterministically by the existing checked alignment algorithm.

## Public launch semantics

The internal DriverActor launch request continues to use exact `{ kind, value }` scalar records and `{ kind: "device-memory", ... }` memory records.

The public facade accepts scalar values directly according to the declared parameter schema and translates them into exact internal kind records. A scalar value can never satisfy a different declared kind merely because JavaScript could coerce it.

No raw pointer, arbitrary C type, native packer descriptor, byte buffer, or FFI schema becomes public.

## Portable conformance

Required without a GPU:

- legacy `device-memory` and `u32` layout/output remain unchanged;
- `u64` boundary values pack to exact expected bytes and number inputs reject;
- `i32` min/zero/max and out-of-range values partition correctly;
- `f32` representative exact/rounded/signed-zero values match Node binary32 bytes;
- NaN/infinity/binary32 overflow reject;
- mixed signatures have exact offsets, total size, and zero padding;
- exact argument count/kind checks remain fail-closed;
- facade translation preserves exact scalar kind;
- failure occurs before submit for invalid values;
- normal operation cleanup/lifecycle remains unchanged.

## Native Windows promotion evidence

Before support is claimed on the qualified Windows profile, an independent MSVC/CUDA oracle must declare a kernel with a mixed signature containing all accepted kinds and independently prove:

- `sizeof`/`alignof` expectations;
- packed offsets/total size parity;
- exact kernel-observed `u64`, `i32`, and representative `f32` results;
- legacy u32/device-memory output parity unchanged;
- invalid public inputs never reach native launch;
- terminal stream/event/module/function/memory/context cleanup remains balanced.

No native Linux/WSL claim follows without their independent qualification chains.

## Deferred kinds

`i64`, `f64`, half, bfloat16, FP8, vectors, structs by value, pointers other than opaque device-memory, and caller-defined ABI kinds remain unsupported until consumer demand and independent evidence justify them.

## Non-goals

- arbitrary C/C++ kernel signatures;
- automatic JavaScript numeric coercion;
- public parameter-buffer bytes;
- changing stream/concurrency semantics;
- CUDA-MCGS or domain-specific types;
- performance claims.
