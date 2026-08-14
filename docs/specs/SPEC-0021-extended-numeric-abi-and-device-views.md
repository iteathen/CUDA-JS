# SPEC-0021: Extended Numeric ABI and Generic Device Views

**Status:** Accepted

**Date:** 2026-08-13

**Accepted:** 2026-08-14 after adversarial contract review against protected `main` `334b903be827dedb5345608a34a6df444912fe1b`, accepted SPEC-0011, and current CUDA 13.3 half/bfloat semantics.

**Issue owners:** #39 and #88

## Outcome

Extend the closed kernel-argument ABI with `f64`, `f16` and `bf16`, and define generic typed bounded one-dimensional views over existing opaque CUDA-JS device allocations.

Scalar launch arguments and device views share one dtype authority but remain separate layers:

- scalar arguments describe by-value kernel parameter packing;
- device views describe a bounded typed interpretation/range over opaque device memory.

This contract does not create tensor algebra, broadcasting, model semantics or a raw-pointer API.

## Status dimensions

```text
architectural disposition: selected
implementation status:       authorized; not yet integrated at acceptance
qualification status:        not-qualified
priority:                    dependency-ready foundation
```

## Accepted correction to the proposal

The proposal said its special-value rules applied to “all floating scalar kinds,” which contradicted accepted SPEC-0011: current `f32` is deliberately finite-only and rejects NaN/infinity. The accepted contract resolves that conflict instead of silently widening old behavior.

**Legacy `f32` remains exactly SPEC-0011 finite-only.** The explicit NaN/infinity bit contract below applies only to the newly added `f64`, `f16`, and `bf16` kinds. A later accepted revision may widen `f32` explicitly, but this specification does not.

The first accepted device-view profile is deliberately contiguous 1D. Multidimensional positive-stride descriptors remain a later widening after total range semantics/property evidence exists. This keeps the foundational view primitive small and reusable.

## Authority and dependencies

This specification extends SPEC-0004 and SPEC-0011. Device-JS and CUDA library adapters may consume these meanings but cannot redefine them. SPEC-0023 depends on the generic view contract.

## Closed dtype registry

```text
existing: device-memory, u32, u64, i32, f32
new:      f64, f16, bf16
```

New scalar ABI facts:

```text
f64:  8 bytes, natural alignment 8
f16:  2 bytes, natural alignment 2
bf16: 2 bytes, natural alignment 2
```

These meanings do not authorize arbitrary C/C++ types, wrapper structs, vectors, raw parameter buffers or generic pointers.

## Public scalar representation

All three new kinds accept a JavaScript `number` and use CUDA-JS-owned deterministic packing.

### `f64`

- encode IEEE-754 binary64 in 8 little-endian bytes;
- preserve finite values, signed zero and signed infinity;
- every JavaScript NaN canonicalizes to positive quiet NaN bits `0x7ff8000000000000`;
- no JavaScript-engine NaN payload is preserved.

### `f16`

- convert binary64 input to IEEE-754 binary16 using round-to-nearest, ties-to-even;
- preserve signed zero and infinity;
- finite overflow becomes signed infinity;
- finite underflow produces the correctly rounded subnormal or signed zero;
- every JavaScript NaN canonicalizes to `0x7e00`.

### `bf16`

- convert binary64 input to bfloat16 using round-to-nearest, ties-to-even;
- preserve signed zero and infinity;
- finite overflow becomes signed infinity;
- finite underflow produces the correctly rounded subnormal or signed zero;
- every JavaScript NaN canonicalizes to `0x7fc0`.

Current CUDA Math API documentation uses round-to-nearest-even for half/bfloat operations/conversions. CUDA-JS nevertheless owns host packing independently so provider/GPU conversion behavior cannot redefine the public ABI.

Non-number values reject. No implicit string, bigint, object or symbol coercion occurs.

## Legacy `f32`

SPEC-0011 remains authoritative without change:

- JavaScript `number` only;
- finite only;
- binary32 overflow rejects;
- NaN and ±infinity reject;
- signed zero and finite subnormal/underflow behavior remain unchanged.

Legacy parameter layouts and bytes must remain byte-identical.

## Mixed parameter layout

The existing packer continues checked natural alignment, safe-integer arithmetic and deterministic zero padding. Adding 2-byte and 8-byte kinds must not alter offsets/bytes for unchanged legacy signatures.

## Generic device view v1

A v1 view is a contiguous one-dimensional logical descriptor over one live opaque CUDA-JS device allocation. Public-safe fields are equivalent to:

```text
view contract/version
opaque view identity
runtime/device/epoch identity
opaque parent allocation identity/generation
dtype
byte offset
element count
logical byte span
access role
```

Accepted dtypes for view v1 are the scalar storage dtypes owned by this registry (`u32`, `u64`, `i32`, `f32`, `f64`, `f16`, `bf16`) where the selected consumer/provider supports them. `device-memory` is not a view element dtype.

Access role is one of:

```text
read
write
read-write
```

A view never exposes a native address.

## View range semantics

Before view creation/use CUDA-JS proves:

- dtype accepted;
- offset/count finite safe integers;
- offset non-negative and count non-negative;
- multiplication/addition cannot exceed the safe-integer domain;
- logical byte span lies wholly inside the parent allocation;
- offset satisfies dtype alignment;
- parent runtime/device/epoch/generation is live and compatible;
- requested write authority does not exceed parent/profile authority.

Zero-element views are allowed only when offset itself is within the closed allocation boundary and no reachable byte exists. This makes empty slices composable without permitting an out-of-range sentinel offset.

Multidimensional shape/stride/layout semantics are **not** part of v1 and require an accepted follow-up revision rather than accidental interpretation here.

## Aliasing and hazards

Views may overlap; the view component describes exact byte ranges/access roles but does not invent global scheduling semantics. Scheduler/library owners consume those facts to prove ordering or reject hazards. A view cannot grant capabilities absent from its parent.

## Lifecycle

A view is a logical child/dependency of its parent allocation.

- creation records/acquires the parent generation dependency;
- stale/closed/wrong-runtime parent rejects before native work;
- closing a view releases only its logical dependency;
- closing a view never frees the parent;
- parent release remains blocked while accepted live view/operation leases require it;
- an orphaned/closing parent cannot be extended back into a live allocation by a view.

## Compatibility identity

Numeric ABI identity changes with dtype definition, conversion/special-value policy, canonical NaN bits, width/alignment or packing rules. View identity changes with contract version, dtype registry, range/access semantics and parent generation.

Caches/providers that depend on these meanings include the relevant identity rather than inferring compatibility from names alone.

## Portable implementation acceptance

### Scalar ABI

Required cases:

- all new kinds in every alignment position;
- representative finite values and exact expected bytes;
- signed zero and infinities;
- exact canonical NaN bytes for new kinds;
- largest/smallest normal/subnormal boundaries;
- halfway/tie cases of both signs for f16/bf16;
- overflow and underflow;
- deterministic zero padding;
- legacy `device-memory`/`u32`/`u64`/`i32`/`f32` byte identity;
- invalid type rejection;
- mutation controls for width/alignment/offset/padding/rounding/NaN policy.

### Views

Required cases:

- zero/tail/full/subrange boundaries;
- dtype alignment;
- safe-integer overflow rejection;
- stale/closed/wrong-runtime parent rejection;
- overlap classification using exact byte ranges;
- read/write/read-write role normalization;
- parent-close/view-close lifetime behavior;
- deterministic descriptor identity;
- no native address leakage.

Mocks prove orchestration/range/lifecycle only.

## Native promotion evidence

### Scalars

An independent native C/CUDA Driver oracle must consume mixed signatures containing every new kind/position, independently confirm ABI/layout expectations, launch bounded fixtures and compare exact values/bytes. It must include canonical NaN, signed-zero, subnormal, tie, overflow and infinity cases without reusing production conversion code.

### Views

At least one independent native/library fixture must consume the same offset/count semantics, prove exact byte interpretation, reject invalid/misaligned ranges before native work, retain parent lifetime through use and close terminally.

Every promotion records exact Node/ABI/OS/Driver/toolkit/GPU/provider identity. No portable pass becomes a native support claim.

## Falsifiers and rollback

Stop implementation if new scalar kinds require caller raw buffers/provider-specific host conversion or if view safety requires pointer exposure. Rollback is accepted SPEC-0011 plus opaque allocation bytes under SPEC-0004.

## Non-goals

Arbitrary ABI kinds; structs/vectors by value; raw launch buffers; generic pointers; multidimensional views in v1; tensor algebra/autograd/broadcasting; FFT/sparse/image semantics; preserving JS NaN payloads; deriving device arithmetic/fast-math behavior from host packing; raw device addresses.

## Primary references

- https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH____HALF__ARITHMETIC.html
- https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH____BFLOAT16__ARITHMETIC.html
- https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH____BFLOAT16__MISC.html
