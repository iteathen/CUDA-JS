# SPEC-0004 Addendum: Device-allocation base-alignment projection

**Status:** Accepted

**Date:** 2026-09-03

**Owner:** `runtime.memory` allocation contract with `runtime.facade` public compatibility projection

**Parents:** accepted `SPEC-0004-device-memory-foundation.md` and `SPEC-0008-package-public-facade.md`

**Issue owner:** #193

## Outcome

Expose one generic lower memory fact through the existing immutable `CUDA_JS_COMPATIBILITY` product: every ordinary CUDA-JS device allocation created through `runtime.allocateDevice({ byteLength })` has a base address aligned to at least 256 bytes.

The additive public compatibility field is:

```text
CUDA_JS_COMPATIBILITY.capabilities.deviceMemoryAllocationMinimumAlignmentBytes = 256
```

The value is a minimum base-address guarantee, not an exact address property and not a caller-selectable alignment request. It is owned by the generic device-memory allocation contract and projected by the facade only so upper consumers can prove predictable compatibility without native/private inspection.

## Lower authority

CUDA-JS F4 ordinary device memory is backed by the accepted Driver allocation path using the CUDA Driver API ordinary global-memory allocator. NVIDIA's CUDA Programming Guide states that addresses returned by Driver or Runtime API memory allocation routines are aligned to at least 256 bytes.

CUDA-JS therefore adopts 256 bytes as the portable semantic minimum for the already-authorized ordinary device-allocation profile. A future lower allocation mechanism may preserve this contract or must change/version the public compatibility fact under its own accepted authority before becoming a substitute implementation.

This addendum does not authorize VMM, pooled, pitched, managed, mapped, imported, external, peer, custom-suballocated, or other deferred memory profiles.

## Base allocation versus views

The guarantee applies only to the starting address of an ordinary base allocation returned by the existing allocation owner.

A view with a nonzero byte offset is not automatically 256-byte aligned. Its effective alignment depends on the base guarantee and the offset. CUDA-JS must not publish a blanket claim that arbitrary typed views or subranges retain 256-byte alignment.

Consumers that require alignment of an offset view remain responsible for proving the selected offset satisfies their required alignment using public view metadata and their own semantic/layout rules. No native address is exposed to support that proof.

## Ownership and projection rule

`runtime.memory` remains the normative owner of allocation meaning and the lower guarantee. `CUDA_JS_COMPATIBILITY` is a materialized, deeply frozen public projection, not a second memory-policy owner.

Repository conformance must fail if the compatibility manifest differs from the single lower-owned allocation-alignment fact. The numeric value must not be copied independently into consumer-specific tables, provider registries, or tests that become alternate policy owners.

Upper consumers may compare a positive power-of-two requested base alignment against this minimum guarantee for early admission. They do not become CUDA-JS memory-validity owners and they must not infer:

- a caller-selectable aligned allocator;
- exact pointer values;
- alignment greater than 256 bytes;
- arbitrary view/suballocation alignment;
- performance characteristics;
- a device- or provider-specific alignment recommendation.

## Public shape and lifecycle

`CUDA_JS_COMPATIBILITY` remains side-effect free and deeply frozen. Reading the alignment fact opens no runtime, CUDA library, device, context, allocation, compiler, provider, or native resource.

The public package entries remain unchanged: `cuda-js`, `cuda-js/compatibility`, and `cuda-js/testing`. No component/deep import is added or supported.

The allocation request and result shapes remain unchanged. In particular:

```text
runtime.allocateDevice({ byteLength })
```

continues to accept no alignment field. An upper consumer requiring more than the published minimum must reject that configuration or use a separately accepted future lower capability; it must not smuggle a private allocator into CUDA-JS or its own adapter.

## Identity and compatibility

The 256-byte value is a material public compatibility fact and therefore advances the prerelease package identity under the existing public API schema. It introduces no new resource kind, error category, operation lifecycle, native handle, or public address.

The fact is consumer-neutral. CUDA-MCGS #125 is the first demonstrated consumer, but deleting CUDA-MCGS leaves the CUDA-JS memory contract coherent and useful to any planner that needs to validate base-allocation alignment.

## Required evidence

Portable/package qualification must prove:

- the memory owner exports one immutable lower fact for the ordinary device-allocation minimum alignment;
- the public compatibility object projects that exact lower fact as `deviceMemoryAllocationMinimumAlignmentBytes`;
- the projected value is exactly 256 bytes for the accepted ordinary allocation profile;
- the compatibility object and capabilities record remain immutable;
- a public installed consumer importing only `cuda-js/compatibility` can prove 8-byte and 256-byte base requirements and reject 512-byte requirements;
- no `alignment` field is added to `allocateDevice()`;
- view APIs do not claim blanket 256-byte alignment for nonzero offsets;
- existing allocation/view lifecycle, quota, error, health and cleanup behavior is unchanged.

No new native execution evidence is required solely to project this lower contract because the ordinary allocation path is already implemented and this addendum does not change its native calls. Existing native/support evidence remains scoped to its recorded profiles and does not broaden from this metadata projection.

## Falsifiers

Reject or roll back this addendum if implementation requires any of the following:

- exposing a native address or handle;
- adding a caller-selected aligned allocation API without a separate demonstrated requirement;
- making a device view owner of base-allocation policy;
- copying 256 into multiple independent policy tables;
- claiming that nonzero-offset views are automatically 256-byte aligned;
- making the fact CUDA-MCGS-, tensor-, provider-, GPU-model-, or product-specific;
- opening a runtime/provider merely to read the compatibility value.

## Non-goals

No search-aware allocator, no tensor allocator, no arbitrary over-aligned allocator, no virtual-memory redesign, no pooled allocation, no alignment-sensitive performance promise, no raw pointers, no native-handle exposure, no MCGS resource policy, no view-layout semantics, no native support promotion, and no performance claim.
