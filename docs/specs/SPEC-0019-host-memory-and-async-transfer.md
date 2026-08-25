# SPEC-0019: Host Memory and Asynchronous Transfer

**Status:** Accepted

**Date:** 2026-08-13

**Issue owner:** #86

**Accepted:** 2026-08-24 after exact SPEC-0018 capacity-two qualification

## Outcome

Define bounded pinned/registered host-memory ownership and asynchronous host↔device/device↔device transfer operations that compose with SPEC-0016/SPEC-0018 without weakening the accepted copied-pageable baseline.

This specification distinguishes host-memory capabilities explicitly. It does not market all host/device exchange as zero-copy and does not make mapped memory the default data path.

## Status dimensions

```text
architectural disposition: accepted
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    P1 implementation for CUDA-MCGS readiness
```

## Dependencies

This specification consumes accepted SPEC-0003, SPEC-0004, SPEC-0016 and SPEC-0018.

The first accepted profile is deliberately closed: two internal pinned staging
blocks, each bounded by `maxTransferBytes`; snapshot H2D, terminal-result D2H,
and D2D contiguous copies; no chunk queue; and the exact SPEC-0018 capacity-two
operation envelope. Caller-owned registration, transfer/detach ownership,
mapped memory, 2D/3D copies, and exposed logical staging slots remain later
profiles.

SPEC-0014 publication mailboxes may later consume the registered/mapped host-memory ownership defined here. SPEC-0023 library adapters and higher-level consumers may use transfer operations but do not redefine their lifetime.

## Memory capability classes

CUDA-JS must represent these as distinct capabilities:

```text
pageable snapshot bytes
internal pinned staging
explicitly registered host memory
mapped host/publication memory
device memory
```

Managed/unified memory is not part of this specification.

Each capability has one owner, byte capacity, alignment, generation, quota reservation, lease state and terminal disposition. Public JavaScript receives no native host pointer or mapped device pointer.

## Pageable snapshot baseline

The existing copied host-byte path remains an explicit compatibility profile.

For host-to-device writes, CUDA-JS snapshots caller-visible bytes before asynchronous/native ownership can outlive the call. For device-to-host reads, returned bytes become caller-owned only after completion is proved.

This profile may be synchronous and is not advertised as overlap-capable.

## Internal pinned staging

The first performance profile uses DriverActor-owned page-locked staging rather than exposing native-backed JavaScript views.

A staging pool/ring declares finite limits:

```text
block count
block capacity
aggregate pinned bytes
alignment
max transfer bytes/chunks
reuse/wipe policy
```

Repeated transfers reuse a bounded pool rather than pinning/unpinning every batch. Exhaustion returns deterministic pressure/backpressure.

Pinned-memory quota is a correctness/resource boundary because page-locked memory consumes constrained host resources.

## Explicit host registration

A later profile may register caller-owned backing stores only when exact Node backing-store lifetime and native registration semantics are accepted.

Requirements:

- eligible backing-store classes are closed and versioned;
- strong retention lasts for the entire native registration lifetime;
- byte offset/length/alignment/range are validated before native work;
- detach/resizing/mutation semantics are explicit;
- registration cannot outlive its runtime/process epoch;
- arbitrary numeric host pointers are never accepted;
- unregister failure preserves pressure/orphan truth.

SharedArrayBuffer mapping for SPEC-0014 is a specialized consumer of this ownership, not a generic promise that all registered memory is safely device-visible.

## Transfer operation model

Asynchronous transfers use the accepted opaque operation lifecycle.

Selected operation families may include:

```text
host-to-device
device-to-host
device-to-device
selected 2D/3D copies after separate bounded shape acceptance
```

Submission becomes pending only after:

1. source/destination capability and range validation;
2. host/device leases;
3. snapshot/ownership preparation;
4. staging reservation if required;
5. private stream selection under SPEC-0018;
6. native async-copy submission;
7. completion provenance/event registration;
8. logical operation registration.

No D2H result is exposed before terminality.

## Host byte ownership modes

Public ingress must name an ownership mode instead of relying on implicit Worker/structured-clone behavior.

### `snapshot`

Caller retains the original buffer. CUDA-JS owns a copied snapshot for the operation lifetime.

### `transfer`

A later accepted profile may consume an eligible transferable `ArrayBuffer`/view. Detachment timing, failed-admission rollback and unsupported backing-store behavior must be exact. SharedArrayBuffer and pooled Buffer storage do not silently enter this mode.

### reusable logical staging slot

A performance-oriented API may expose an opaque logical slot capability. Slot state prevents refill/reuse while an associated native transfer remains pending. The slot is not a native pointer.

## Dependency ordering

SPEC-0018 owns operation dependencies and private stream/event scheduling.

Typical accepted relationships include:

```text
H2D transfer -> compute operation
compute operation -> D2H transfer
D2D transfer -> dependent compute
```

Host waiting between nodes is not required where device-side dependency ordering is established.

A pinned transfer is only **eligible** for overlap. CUDA-JS does not guarantee simultaneous progress on every device/profile/workload.

## Ranges, aliasing and views

All byte arithmetic is safe-integer checked before native work.

Transfers may consume generic bounded device views once their owning contract is accepted. No implicit dtype conversion, reshaping, packing or interpretation occurs.

Non-contiguous or overlapping requests reject unless a separately accepted pack/unpack/2D/3D profile defines exact semantics.

## Failure and cleanup

- abandoning a wait is not cancellation;
- a staging slot remains leased until completion is proved;
- a registered/pinned block is not reported free until native free/unregister succeeds;
- context/device loss may orphan associated transfers and staging/native registrations;
- runtime close stops admission then follows operation terminalization before releasing staging/native memory;
- Worker/process loss records inaccessible/orphaned resources without fabricating cleanup.

## Portable conformance

Portable tests must cover:

- snapshot mutation isolation;
- transferable ownership state machine where enabled;
- staging pool/ring state transitions;
- quota and deterministic backpressure;
- chunk/tail boundary arithmetic;
- H2D→compute and compute→D2H dependency models;
- no early slot reuse/result exposure;
- registration generation/stale handling;
- close/orphan inventory;
- explicit pageable fallback classification;
- public sanitization.

## Native promotion evidence

For every promoted exact direction/profile:

1. compare exact bytes with an independent native C oracle;
2. exercise boundary sizes including zero/minimum/tail/chunk/maximum;
3. prove source snapshot mutation cannot change submitted data;
4. prove pinned allocations/registrations remain valid through completion;
5. prove device-side dependency ordering for H2D→kernel and kernel→D2H;
6. prove at least one overlap-capable fixture through a mechanism oracle before claiming overlap;
7. exercise pressure, copy failure, free/unregister failure and close paths;
8. prove staging/events/streams/allocations/context terminal cleanup;
9. record exact Node/Driver/toolkit/GPU/profile identity.

## Performance evidence

Performance claims require methodology comparing at least:

- copied-pageable synchronous baseline;
- snapshot + warm pinned staging;
- transfer ownership + pinned staging if implemented;
- cold pin/register versus warm reuse;
- sustained repeated transfers;
- host/Worker copy counts;
- H2D/D2H bandwidth;
- eligible copy/compute overlap;
- pinned-memory budget effects.

## Falsifiers / rollback

Do not accept a profile that depends on unbounded pinning, exposes native pointers, cannot retain Node backing stores safely, or claims overlap from timing alone.

Rollback is the accepted copied-pageable synchronous memory path.

## Non-goals

- managed/unified memory;
- arbitrary foreign host-pointer registration;
- generic native-backed JS views;
- universal zero-copy claims;
- implicit dtype conversion/packing;
- guaranteed overlap;
- forced cancellation of submitted transfers.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__MEM.html
- https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html
- https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/understanding-memory.html
