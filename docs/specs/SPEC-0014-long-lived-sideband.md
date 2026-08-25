# SPEC-0014: Publication Mailboxes for Long-Lived Operations

**Status:** Accepted

**Date:** 2026-08-12

**Accepted:** 2026-08-24 after SPEC-0018/SPEC-0019 integration and an exact Windows mapping prerequisite probe

## Outcome

Define the smallest consumer-neutral CUDA-JS contract for bounded host↔device control and observation while an accepted SPEC-0016 GPU operation remains pending.

SPEC-0014 **does not define a second operation lifecycle**. SPEC-0016 exclusively owns submission, status, wait, logical close, operation states, terminalization, execution leases, legacy `launch()` compatibility, pending-command gating, and runtime-close behavior. This specification adds only a bounded **publication mailbox** capability that a SPEC-0016 operation may lease and use.

The selected first mailbox design is backed by one internally allocated `SharedArrayBuffer` registered/mapped privately by CUDA-JS on qualified native profiles. Public callers receive only an opaque mailbox capability with bounded synchronous `store`/`load` methods. It exposes no backing store, CUDA stream, event, context, pointer, registration handle, or general concurrent-kernel API.

## Ownership

CUDA-JS owns mailbox allocation/registration, mapping, lane direction, generation, bounds, publication-ordering requirements, operation dependency leases, failure provenance, and teardown.

Consumers own the meaning of mailbox lanes and any cooperative stop/update protocol. CUDA-JS contains no MCGS, reroot, ranking, evaluator, game, model, or other consumer semantics.

Operation lifetime remains governed by SPEC-0016. A mailbox cannot redefine operation states, cancellation truth, terminalization, or close semantics.

## Relationship to SPEC-0016

The public operation shape remains the accepted SPEC-0016 surface:

```text
CudaFunction.submit(options) -> CudaOperation
CudaOperation.status()
CudaOperation.wait()
CudaOperation.close()
```

The accepted mailbox integration allows a launch request to bind one or more named lanes from opaque mailbox capabilities. Those mailbox dependencies are acquired before native submission and remain leased until SPEC-0016 terminalization proves the operation completed or failed.

Host publication is local JavaScript `Atomics` work and does not enqueue a DriverActor command. Operation status/wait/release and runtime close remain admitted while long-lived work is pending. Mailbox status/reset/release commands are also admitted so status can be observed and reset/close can return the mailbox owner's typed busy result instead of being masked by the generic pending-operation gate. SPEC-0018 capacity-two scheduling remains independently available but does not weaken mailbox single-device-writer ownership.

## Cancellation truth

SPEC-0016 remains authoritative:

- `operation.close()` while pending is busy, not cancellation;
- destroying an event or unregistering a mailbox does not prove a running kernel stopped;
- cooperative stop is a consumer-defined mailbox protocol;
- unproved owner/context loss is restart-required/orphaned rather than normal cleanup.

## Publication mailbox

A mailbox is a bounded nonempty set of at most 64 naturally aligned four-byte publication lanes over an internal `SharedArrayBuffer` retained strongly by both the facade and DriverActor for the registration lifetime. Lane names are unique bounded ASCII identifiers.

First candidate lane type:

```text
u32
```

Each lane declares exactly one direction:

```text
host-to-device
device-to-host
```

Each lane has one writer:

- host-to-device: host writes, device reads;
- device-to-host: device writes, host reads.

Cross-host/device read-modify-write is unavailable in v1.

The host side uses JavaScript `Atomics.load/store` on an `Int32Array` view while values are surfaced as unsigned 32-bit integers.

On the qualified native CUDA profile, CUDA-JS privately:

- obtain the stable SAB backing pointer through Node FFI;
- page-lock/register the backing range with `cuMemHostRegister`;
- request device mapping with `CU_MEMHOSTREGISTER_DEVICEMAP`;
- resolve the private device alias with `cuMemHostGetDevicePointer`;
- bind only an opaque mailbox capability through the owned launch-packing path;
- unregister with `cuMemHostUnregister` only after all operation leases terminate.

The SAB is not public API. The facade retains the backing store only to perform local `Atomics`; the mapped CUDA device pointer never crosses the DriverActor boundary.

## Public and launch surface

```text
runtime.createPublicationMailbox({ lanes }) -> CudaPublicationMailbox
mailbox.store(laneName, u32)                 // host-to-device only
mailbox.load(laneName) -> u32                // device-to-host only
mailbox.status()
mailbox.reset()
mailbox.close()
```

Every kernel mailbox parameter binds exactly one named lane. Function parameter kinds are direction-specific:

```text
publication-mailbox-host-to-device-u32
publication-mailbox-device-to-host-u32
```

The public launch argument is `{ kind: "publication-mailbox", mailbox, lane }`. CUDA-JS validates the mailbox generation, lane existence, and exact direction before submission. A mailbox may be leased by only one live GPU operation in the first profile, even when the scheduler capacity is two.

Device-JS represents these as distinct opaque types:

```text
mailbox<host-to-device,u32>
mailbox<device-to-host,u32>
```

They cannot be indexed, dereferenced, assigned, converted to `ptr<u32>`, or passed to ordinary atomic helpers. The only accepted operations are `gpu.mailbox.loadAcquireSystem(lane)` for host-to-device lanes and `gpu.mailbox.storeReleaseSystem(lane, value)` for device-to-host lanes. Both require the manifest-owned `cuda-cccl` header profile.

## Device publication semantics

Device code must use `cuda::atomic_ref<unsigned int, cuda::thread_scope_system>` acquire loads and release stores for mailbox lanes. V1 does not permit GPU RMW against host-visible mailbox lanes. Ordinary device-scope or relaxed helpers are not substitutes.

Native qualification must explicitly check the selected device's mapped-host-memory capability and every hardware/driver prerequisite required by the chosen publication semantics. Unsupported profiles fail closed rather than silently substituting weaker ordering.

## Generation and stale publication

Every mailbox resource begins at generation one and has a monotonically increasing safe-integer logical generation owned by CUDA-JS. Operation bindings capture that generation.

A mailbox reset/rebind is legal only with no live operation lease. Any command carrying an older captured generation fails before publication/read.

`reset()` is legal only with no live lease, atomically zeroes every lane, then increments the generation. Safe-integer exhaustion rejects terminally; silent wrap is forbidden. `close()` is also busy while leased.

Consumers that need multi-field coherent snapshots may reserve ordinary lane values for their own sequence protocol. CUDA-JS does not interpret those fields.

## Resource dependency

```text
runtime/context
  ├─ private execution stream
  ├─ mailbox
  └─ function/module/memory
       └─ SPEC-0016 operation leases every referenced dependency
```

A mailbox cannot unregister/reset while leased by a pending operation. Runtime close first follows SPEC-0016 terminalization rules; if terminality cannot be proved, mailbox/native cleanup is not claimed.

## Portable experiment requirement

EXP-013 is retained as a pure-JS mailbox falsifier. Its local `DetachedMockOperation` is only an experiment harness for independently progressing mock work; it is **not** a proposed production operation owner or public API now that SPEC-0016 is accepted.

The experiment must prove:

- mock work progresses independently of host status/wait polling;
- host-to-device and device-to-host lane direction is enforced;
- `Atomics` publication remains visible while work is pending;
- generation mismatch rejects stale commands;
- mailbox reset/close rejects while leased;
- pending operation close does not claim cancellation;
- terminal completion releases the mailbox lease;
- application event loop remains responsive;
- controlled mock failure releases only what terminality proves.

Those operation-lifecycle observations are corroborating evidence for mailbox composition with SPEC-0016, not competing lifecycle authority.

## Native qualification evidence

The Windows support claim requires all of the following on the exact promoted revision:

- exact generated Driver ABI for host registration/mapping/unregistration is reviewed;
- current context/device mapping prerequisites are verified;
- a live long-running CUDA kernel reads host-published lanes and publishes device-to-host lanes using system-scope load/store;
- host `Atomics.store/load` and GPU system-scope operations agree on exact publication values/generations;
- host publication remains responsive without operation polling because it uses local JavaScript `Atomics`;
- terminal event completion releases operation/mailbox/resource leases in SPEC-0016 order;
- close, device loss, mapping failure, stale generation, and restart-required paths are exercised;
- zero live/unproved resources remain after graceful completion;
- exact Node/Driver/toolkit/GPU/profile evidence is recorded.

## Capability prerequisites and failure truth

The first Windows profile requires `canMapHostMemory == 1`, unified addressing, Node/FFI stable `SharedArrayBuffer` backing-store access, naturally aligned u32 lanes, and the reviewed CUDA system-scope mapped-memory load/store guarantee. `hostNativeAtomicSupported == 0` is acceptable only because v1 has one writer per lane and no host/device RMW.

Registration or mapping failure is immediate and rolls back any acquired native state. Unregister failure leaves the mailbox orphaned/cleanup-unproved and prevents a graceful runtime-close claim. Unexpected Worker/context/device loss never fabricates unregister success. Watchdog safety is a conformance-fixture constraint, not a cancellation promise.

## Relationship to broader concurrency

This capability does not authorize public streams or broaden the number of independent kernels in flight. It consumes SPEC-0016's operation lifecycle and composes with the already accepted SPEC-0018 scheduler without changing that scheduler's capacity, hazard, dependency, or no-queue contracts.

## Non-goals

- a second operation lifecycle or `launchDetached()` API;
- search/reroot/ranking semantics;
- public raw pointers/streams/events;
- general mapped-memory replacement for device memory;
- host/device RMW atomics in v1;
- public or caller-provided shared-memory objects;
- forced per-kernel cancellation claims;
- multi-GPU/MIG;
- performance claims.
