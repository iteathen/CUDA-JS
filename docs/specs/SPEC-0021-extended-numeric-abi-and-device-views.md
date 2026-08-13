# SPEC-0021: Extended Numeric ABI and Generic Device Views

**Status:** Proposal

**Date:** 2026-08-13

**Issue owners:** #39 and #88

## Outcome

Extend the closed kernel-argument ABI with `f64`, `f16` and `bf16`, and define generic typed bounded views over opaque CUDA-JS device allocations.

The numeric ABI and view contract share dtype authority but remain distinct layers:

- scalar launch arguments describe by-value kernel parameter packing;
- device views describe bounded interpretation/ranges over existing opaque device memory.

This specification does not create a tensor framework.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented for new scalar kinds/views
qualification status:        not-qualified
priority:                    after accepted contract review; views before library adapters
```

## Dependencies

This proposal extends SPEC-0004 and SPEC-0011. Device-JS may consume accepted dtype/view semantics, but cannot redefine them. CUDA library adapters in SPEC-0023 depend on the generic view contract.

## Closed dtype registry

The first extended registry is:

```text
existing: u32, u64, i32, f32
new:      f64, f16, bf16
```

Every dtype has exactly defined:

- storage width;
- natural alignment;
- host input representation;
- byte order;
- validation;
- conversion/rounding policy;
- NaN/Infinity/signed-zero/subnormal policy;
- deterministic packing;
- compatibility identity.

Arbitrary C/C++ types, structs/vectors by value and caller-supplied raw parameter buffers remain unavailable.

## Public scalar representation

### `f64`

Public input is a JavaScript `number`.

Packing uses IEEE-754 binary64 bytes in the platform-independent byte order already selected by the kernel-argument ABI. JavaScript `number` is the semantic input, but CUDA-JS explicitly owns packing and special-value policy rather than assuming host ABI layout.

### `f16`

Public input is a JavaScript `number` converted deterministically to IEEE-754 binary16 using round-to-nearest-even for finite values.

### `bf16`

Public input is a JavaScript `number` converted deterministically to bfloat16 using round-to-nearest-even for finite values.

Using `number` as the public input is an ergonomics choice, not a claim that JavaScript natively executes half/bfloat arithmetic. CUDA-JS defines conversion independently and validates it against native/reference oracles.

## Special values and conversion policy

For all floating scalar kinds:

- `+0` and `-0` remain distinguishable in packed bits;
- positive/negative infinity are preserved when representable;
- NaN input is accepted only under an explicit canonical-NaN packing rule; NaN payload preservation is not promised;
- finite overflow converts to signed infinity for `f16`/`bf16` under the selected IEEE-style conversion policy;
- normal/subnormal conversion follows round-to-nearest-even;
- no implicit saturation is performed;
- `undefined`, strings, bigint and objects reject;
- no fast-math/flush-to-zero device-execution promise follows from scalar packing.

Device arithmetic behavior remains governed by the compiled device program/provider profile. Packing correctness is separate from kernel arithmetic semantics.

## Mixed parameter layout

The accepted launch packer continues to compute natural alignment, offsets, total size and zero padding deterministically from the closed parameter schema.

Adding new kinds must not alter legacy layouts for existing signatures.

Every padding byte is deterministically zeroed. Size/alignment arithmetic is safe-integer checked.

## Generic device view

A device view is an opaque logical descriptor over one existing CUDA-JS device allocation.

Required fields are equivalent to:

```text
view contract/version
view identity
runtime/device/epoch identity
parent allocation capability + generation
dtype
byte offset
element count
logical byte span
access role
```

Optional finite metadata may include:

```text
rank
shape
strides
layout label from a closed registry
```

No native device address is exposed.

## Range arithmetic

Before creating/using a view CUDA-JS proves:

- dtype is accepted;
- offset/count/dimensions/strides are finite safe integers;
- multiplication/addition cannot overflow safe bounds;
- every reachable byte lies within the parent allocation;
- required alignment is satisfied;
- rank/dimension/stride counts are within configured finite limits;
- any layout label is accepted by the view contract.

Negative offsets/strides and arbitrary overlapping strided regions may be rejected in the first slice unless a later accepted profile defines them.

## View shape semantics

The generic view layer does not define broadcasting, tensor algebra, FFT semantics, sparse semantics or image interpretation.

A shape/stride descriptor means only a bounded index-to-byte mapping. Library/application adapters add their own semantic legality checks.

The first accepted profile should support contiguous one-dimensional views. Finite multidimensional positive-stride descriptors may be added in the same contract only when property tests make their range semantics total and unambiguous.

## Access roles and aliasing

A view declares an access role such as:

```text
read
write
read-write
```

The view itself does not globally prevent aliases. Scheduler/library owners use view ranges/access roles to detect or require ordering for hazards.

A view cannot grant write authority if the owning capability/profile marks the underlying range read-only.

## Lifecycle

A view is a child logical resource of its parent allocation.

- creation acquires/records parent-generation dependency;
- a stale/closed/wrong-runtime parent rejects before native work;
- view close releases only the logical view dependency;
- closing a view never frees the parent allocation by itself;
- parent allocation close is blocked while live leases/views/operations require it according to resource-registry policy;
- a view never extends a parent past an accepted closing/orphan boundary.

Operation/library use acquires the necessary parent/view lease through the owning execution contract.

## Compatibility identity

Numeric ABI identity changes when any of these change:

```text
dtype definitions
conversion/special-value policy
size/alignment/packing rules
```

View compatibility identity changes with:

```text
view contract version
dtype registry
range/layout semantics
access-role semantics
```

Artifact/provider caches that depend on these meanings include the relevant identities.

## Portable conformance

### Scalar ABI

- every mixed argument position and alignment partition;
- boundary finite values;
- signed zero;
- infinities;
- canonical NaN;
- normal/subnormal/tie rounding cases;
- overflow behavior;
- deterministic zero padding;
- legacy signature byte identity;
- invalid/ambiguous input rejection.

### Views

- offset/count boundary properties;
- alignment partitions;
- multidimensional range calculations where admitted;
- wrong-runtime/stale/closed parent;
- alias-range classification;
- parent-close/view-close behavior;
- deterministic descriptor identity;
- no native address leakage.

## Native promotion evidence

### Scalars

An independent native C/CUDA Driver oracle must consume mixed signatures covering every new kind and position, compare exact parameter bytes/offsets where observable, launch bounded fixtures and validate output/special-value behavior under the declared profile.

### Views

At least one independent native/library fixture consumes the same logical range semantics. It must prove correct offset/count interpretation, reject invalid/misaligned ranges before native work, retain allocation lifetime through use and close terminally.

Every profile records exact Node/ABI/Driver/toolkit/GPU/provider identity.

## Falsifiers / rollback

Do not accept this contract if new scalar kinds require raw caller buffers or if view range semantics cannot be proven without exposing pointers.

Rollback is SPEC-0011 scalar ABI plus raw opaque device-allocation bytes under SPEC-0004.

## Non-goals

- arbitrary ABI kinds or by-value structs/vectors;
- caller raw launch buffers;
- generic pointers;
- tensor algebra/autograd/broadcasting;
- library-specific FFT/sparse/image semantics;
- implying device arithmetic/fast-math behavior from host packing;
- raw device addresses.

## Primary references

- https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/structs.html
- https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH____HALF__ARITHMETIC.html
- https://docs.nvidia.com/cuda/cuda-math-api/cuda_math_api/group__CUDA__MATH____BFLOAT16__MISC.html
