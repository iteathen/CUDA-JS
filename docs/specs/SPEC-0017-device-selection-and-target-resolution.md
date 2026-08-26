# SPEC-0017: Explicit Device Selection and Target Resolution

**Status:** Accepted

**Date:** 2026-08-13

**Accepted:** 2026-08-14 after adversarial contract review against protected `main` `334b903be827dedb5345608a34a6df444912fe1b` and current CUDA 13.3.1 Driver device/context semantics.

**Amended:** 2026-08-25 — the portable/software/package implementation selects `discoverCudaDevices()`, opaque `CudaDeviceSelector` capabilities, and `openCudaRuntime({ device })`; package identity advances to `cuda-js@0.1.0-alpha.8` while public API schema 1 remains additive. Native qualification remains separate.

**Issue owner:** #20

## Outcome

Define the consumer-neutral CUDA-JS contract for enumerating CUDA devices through sanitized opaque selector capabilities and creating one runtime bound to exactly one selected physical device. The contract also owns selected-device-driven compiler/link target resolution.

It does **not** expose `CUdevice`, CUDA ordinals, UUIDs, serials, PCI identifiers, contexts, pointers, provider paths or other native identifiers. It does not authorize multi-device orchestration inside one runtime/operation; that remains SPEC-0024.

## Status dimensions

```text
architectural disposition: selected
implementation status:       implemented in portable/software/package path
qualification status:        not-qualified
priority:                    native promotion after integration
```

Acceptance authorizes only the bounded implementation below. Native/public support still requires exact-profile evidence.

## Authority and dependencies

This specification is additive to SPEC-0002, SPEC-0003, SPEC-0006, SPEC-0007, SPEC-0008, SPEC-0013 and SPEC-0016. It preserves:

```text
one CudaRuntime
  -> one DriverActor Worker
  -> one private CUDA context
  -> one selected physical device
```

The first implementation widens **which** device a runtime owns, not how many devices it owns.

## Selected design after reassessment

The strongest credible alternatives were:

1. expose raw ordinal/device identity — rejected because it leaks native identity and becomes stale/ambiguous across visibility changes;
2. allow a live runtime to switch devices — rejected because context/resource ownership would become ambiguous;
3. use one sanitized discovery snapshot plus opaque selector capabilities — selected because it is finite, fail-closed and preserves one-context ownership;
4. defer all selection until multi-GPU — rejected because explicit single-device targeting and correct compiler target derivation are independently useful foundations.

Current CUDA Driver documentation independently supports finite device enumeration through `cuDeviceGetCount`/`cuDeviceGet`, while context ownership remains an explicit host-thread/current-context boundary. CUDA-JS owns the safer capability representation rather than exposing those native handles.

## Discovery snapshot

A discovery request returns one finite immutable snapshot containing only public-safe facts required for selection/compatibility, for example:

```text
snapshot identity
opaque selector capability
architecture / compute-capability class
bounded memory-capacity facts
accepted capability flags needed by CUDA-JS profiles
sanitized display label only when policy permits
```

The selector is opaque and scoped to the issuing discovery authority/snapshot. It must not encode a public raw ordinal, UUID, serial, PCI address, `CUdevice`, pointer or another stable machine identifier.

### Selector validity

Before native context/resource work, reject selectors that are malformed, stale, foreign, ambiguous, duplicated, outside the accepted snapshot or incompatible with the requested profile. Explicit selection never silently falls back to another device.

## Default compatibility behavior

Omitting a selector retains the current default-device compatibility path. After runtime creation, however, the selected device becomes a first-class compatibility/evidence fact. Public contracts must not promise that the default device is permanently native ordinal zero.

## DriverActor ownership

Enumeration/selection occurs behind the accepted private native boundary. The selected device is fixed before private context creation and before any context-owned resource exists. A runtime cannot change physical devices in place; selecting another device creates a distinct runtime/epoch.

All identities that could otherwise be confused across devices carry the runtime/device epoch internally. Cross-runtime/device use fails before native dispatch.

## Compiler/link target resolution

Default compiler/link targets derive from the selected device capability and accepted target policy rather than a hard-coded first architecture profile.

A resolved target record contains bounded facts equivalent to:

```text
selected architecture class
compile target
link target
target-policy version
resolution provenance
```

Rules:

- explicit accepted targets remain governed by SPEC-0006 and its target-syntax addendum;
- default targets must be compatible with the selected device plus provider/toolkit policy;
- changing device architecture or target policy changes compiler/link/cache compatibility identity;
- incompatible cached artifacts reject before load/launch;
- syntactic target admission is not toolkit/provider/device qualification.

## Compatibility and privacy

Exact compatibility/evidence identity includes the relevant CUDA-JS contract versions, Node/ABI/OS, Driver/providers, sanitized selected-device architecture/capability profile, context policy, target-resolution policy and compiled artifact target identities.

Stable private hardware identifiers may exist only in protected local qualification evidence when needed for correlation and are sanitized from public bundles.

## Failure and health

Enumeration/selection failures before context creation do not fabricate context-health transitions. After context creation, device-loss/deferred-error behavior remains governed by DriverActor health authority. A selector never revives a poisoned/lost runtime epoch.

## Portable implementation acceptance

The first production/software slice must prove without a GPU:

- zero/one/many synthetic snapshots;
- deterministic finite snapshot/selector ownership;
- stale, malformed, foreign, ambiguous and duplicate rejection;
- default versus explicit selection;
- selected-device propagation into target/cache identity;
- cross-runtime/device rejection;
- public sanitization/no native identifier leakage;
- unchanged legacy default-device behavior.

Mocks prove only orchestration and identity.

## Native promotion evidence

For each promoted exact profile:

1. compare enumerated capability facts with an independent native C Driver oracle;
2. create default and explicitly selected runtimes;
3. prove each private context is bound to the intended device;
4. compile/load/launch with the derived target and compare exact output;
5. prove target/cache separation across distinct accepted architecture profiles;
6. reject stale/foreign selectors before context/resource work;
7. close all resources terminally;
8. publish only sanitized device evidence.

A multi-device host is required to qualify selecting between distinct physical devices. A one-device host can prove only the exact one-device behavior.

## Falsifiers and rollback

Implementation stops if it requires public native identifiers, in-place live-runtime device switching, ambiguous target identity, or weaker context-thread ownership. Rollback is the accepted default-device runtime path.

## Non-goals

Multi-device ownership/orchestration, peer access/copies, automatic partitioning, MIG administration, GPU reset/mode changes, transparent migration/failover, NCCL/collectives or public raw device identifiers.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__DEVICE.html
- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__CTX.html
