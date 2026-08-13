# SPEC-0017: Explicit Device Selection and Target Resolution

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #20

## Outcome

Define a consumer-neutral CUDA-JS contract for enumerating available CUDA devices through sanitized opaque selectors and creating one runtime bound to exactly one selected physical device, without exposing `CUdevice`, CUDA ordinals, UUIDs, serials, PCI identifiers, native pointers, contexts, or provider-private identifiers.

This specification also owns the relationship between the selected device and default compiler/link target resolution. It does not authorize multiple-device orchestration inside one logical operation; that remains SPEC-0024.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    before multi-GPU and graphics-device matching
```

## Authority and dependencies

This proposal is additive to SPEC-0002, SPEC-0003, SPEC-0006, SPEC-0007, SPEC-0008, SPEC-0013 and SPEC-0016.

It preserves the existing default ownership model:

```text
one CudaRuntime
  -> one DriverActor Worker
  -> one private CUDA context
  -> one selected physical device
```

The first implementation may widen **which** device the runtime owns; it does not widen the number of devices owned by one runtime.

## Public capability model

A device-discovery request returns a finite snapshot of sanitized descriptors. Each descriptor contains only bounded public facts needed for selection and compatibility, such as:

```text
snapshot identity
device selector capability
architecture/compute-capability class
bounded memory-capacity facts
selected capability flags needed by accepted CUDA-JS profiles
sanitized display label if policy permits
```

The selector is opaque. It must not encode or expose a raw ordinal, UUID, serial, PCI bus address, `CUdevice`, pointer, or another stable hardware identifier in ordinary public records.

### Selector validity

A selector is valid only for the discovery snapshot/runtime factory contract that issued it. CUDA-JS rejects before native work when the selector is:

- malformed;
- stale according to the selected generation/snapshot policy;
- foreign to another runtime/discovery authority;
- ambiguous;
- outside the accepted device set;
- incompatible with the requested capability profile.

Silent fallback to another device is forbidden after an explicit selector is supplied.

## Default selection

The existing default behavior remains available as an explicit compatibility profile. If no selector is supplied, CUDA-JS may choose the existing default-device policy, but the selected device becomes a first-class compatibility/evidence fact after runtime creation.

The public result must not imply that the default device is permanently device ordinal zero. Native ordinals remain implementation details.

## DriverActor ownership

Device enumeration and device selection occur through the accepted private native boundary. Context creation remains on the DriverActor owner thread.

The selected device identity is bound before creation of context-owned resources. A runtime cannot switch physical devices in place after context/resource creation. Changing devices requires a distinct runtime/epoch.

All resource identities that can be confused across devices include the runtime/device generation internally. Cross-runtime or cross-device resource use fails before native dispatch.

## Compiler and linker target resolution

Compiler and linker defaults must derive from the selected runtime/device capability rather than from a hard-coded first architecture profile.

Target resolution produces a bounded private/public-safe target record containing normalized facts such as:

```text
selected architecture class
compile target
link target
policy/profile version
resolution provenance
```

Rules:

- explicit accepted compile/link target requests remain subject to SPEC-0006 and later target-syntax authority;
- defaults must be compatible with the selected device and selected provider/toolkit policy;
- changing selected device architecture or target policy changes compile/link/cache compatibility identity;
- a cached artifact for an incompatible target/device profile is rejected before load/launch;
- device selection does not itself claim that every syntactically valid target is supported by the installed toolkit.

## Compatibility identity

At minimum, exact compatibility/evidence identity for a device-bound runtime includes:

```text
CUDA-JS contract versions
Node/ABI/OS profile
Driver/provider identities
sanitized selected-device architecture/capability profile
context policy
target-resolution policy
compiled artifact target identities
```

Stable private hardware identifiers may be retained only in protected local evidence if required for qualification correlation and must be sanitized from public bundles according to the validation policy.

## Failure and health

Enumeration/selection failures are classified without inventing context health transitions when no context exists.

After context creation, device-loss/deferred-error behavior remains governed by existing DriverActor health authority. A selector cannot be reused to imply recovery of a poisoned or lost runtime epoch.

## Portable conformance

Portable tests must cover:

- zero/one/many synthetic device snapshots;
- deterministic selector generation within the declared model;
- stale, malformed, foreign, ambiguous and duplicated selectors;
- default versus explicit selection;
- selected-device propagation into target/cache identity;
- cross-runtime/device resource rejection;
- public-record sanitization;
- no raw ordinal/UUID/PCI/native-handle leakage.

Mocks prove only selection/identity orchestration.

## Native promotion evidence

For each promoted exact profile:

1. enumerate the native device set and compare sanitized capability facts with an independent native C oracle;
2. create the default runtime and an explicitly selected runtime;
3. prove each context is bound to the intended device through private/native oracle evidence;
4. compile/load/launch a bounded fixture using the derived target and compare exact output;
5. prove cache/artifact separation across distinct accepted architecture/target profiles;
6. reject a stale/foreign selector before native context/resource work;
7. close all context/library/stream/event/module/memory resources terminally;
8. publish only sanitized device evidence.

A multi-device machine is required to qualify explicit selection between distinct physical devices. A one-device host may prove API behavior only for that exact one-device profile.

## Security and privacy

Ordinary public APIs and evidence do not expose:

- CUDA device ordinals as stable identities;
- GPU UUIDs or serial numbers;
- PCI domain/bus/device identifiers;
- raw `CUdevice`, context, pointer, stream, event, or provider handles.

The selector is a capability for selection, not a globally stable machine identifier.

## Falsifiers / rollback

Do not accept or implement this proposal if the design requires public native identifiers, in-place device switching of a live runtime, ambiguous artifact targeting, or weakening context-thread ownership.

Rollback is the accepted single default-device runtime behavior.

## Non-goals

- multiple devices owned by one operation/runtime coordinator;
- peer access/copies;
- automatic workload partitioning;
- MIG administration or identity policy;
- GPU reset/mode changes;
- transparent migration/failover;
- NCCL/collectives;
- public raw device identifiers.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__DEVICE.html
- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__CTX.html
- https://docs.nvidia.com/cuda/cuda-driver-api/
