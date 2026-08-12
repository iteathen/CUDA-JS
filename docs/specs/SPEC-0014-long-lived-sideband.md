# SPEC-0014: Long-Lived Operations and Publication Mailboxes

**Status:** Proposal

**Date:** 2026-08-12

## Outcome

Define the smallest consumer-neutral CUDA-JS contract for device work that may remain active beyond the current bounded launch wait while bounded host control and read-only observation remain possible.

The selected first design combines:

1. an opaque **detached operation** resource whose launch submission returns after kernel submission and private completion-event recording rather than after terminal kernel completion; and
2. a bounded **publication mailbox** backed by a `SharedArrayBuffer` registered/mapped privately by CUDA-JS on qualified native profiles.

This proposal intentionally does not expose public CUDA streams/events/pointers and does not require general multi-kernel concurrency.

## Ownership

CUDA-JS owns operation lifetime, resource leases, mailbox registration/mapping, lane direction, generation, bounds, publication ordering requirements, health, failure provenance and teardown.

Consumers own the meaning of mailbox lanes and any cooperative stop/update protocol. CUDA-JS contains no MCGS, reroot, ranking, evaluator or game semantics.

## Detached operation

A future accepted execution profile may add:

```text
function.launchDetached(options) -> CudaOperation
operation.status() -> pending | completed | failed | restart-required
operation.wait() -> terminal completion record
operation.close() -> terminal release only
```

Submission owns these steps before returning:

- validate launch and arguments;
- acquire function/all memory/mailbox leases;
- create private event;
- submit kernel on the private execution stream;
- record private event after the launch;
- register the operation resource and its dependencies.

The submission command then returns while the kernel remains active.

`status()` performs one nonblocking private event query. `wait()` may implement bounded asynchronous status polling outside the device algorithm; host polling does not advance GPU work.

Leases remain held until terminal event completion or an explicitly restart-required owner-loss state. Closing/releasing leased dependencies while the operation is pending fails closed.

## Cancellation truth

CUDA-JS does not claim portable per-kernel forced cancellation of an arbitrary running CUDA kernel.

- `operation.close()` while pending is not cancellation and must fail/busy rather than claim termination.
- cooperative stop is a consumer-defined mailbox protocol.
- catastrophic runtime/context destruction is a separate restart-required disposition and cannot claim normal operation cleanup.

## Publication mailbox

A mailbox is a bounded set of naturally aligned publication lanes over a caller-visible `SharedArrayBuffer` retained strongly by CUDA-JS for the registration lifetime.

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

The host side uses JavaScript `Atomics.load/store` on an `Int32Array` view. Values are surfaced as unsigned 32-bit integers.

On a qualified native CUDA profile, CUDA-JS privately:

- obtains the stable SAB backing pointer through `node:ffi`;
- page-locks/registers the backing range with `cuMemHostRegister`;
- requests device mapping with `CU_MEMHOSTREGISTER_DEVICEMAP`;
- resolves the private device alias with `cuMemHostGetDevicePointer`;
- passes only an opaque mailbox capability into launch packing;
- unregisters with `cuMemHostUnregister` only after all operation leases terminate.

The SAB itself remains ordinary public JavaScript data; the CUDA device pointer never crosses the Worker boundary.

## Device publication semantics

Device code must use CUDA system-scope atomic load/store semantics for mailbox lanes. V1 does not permit GPU RMW against host-visible mailbox lanes.

The native qualification must explicitly check the selected device's mapped-host-memory capability and any relevant host-native-atomic attributes. The contract must fail unsupported when mapping requirements are not satisfied rather than silently substituting weaker memory semantics.

## Generation and stale publication

Every mailbox resource has a monotonically increasing logical generation owned by CUDA-JS. Operation bindings capture that generation.

A mailbox reset/rebind is legal only with no live operation lease. Any command carrying an older captured generation fails before publication/read.

Consumers that need multi-field coherent snapshots may reserve ordinary lane values for their own sequence protocol; CUDA-JS does not interpret those fields.

## Resource dependency

```text
runtime/context
  ├─ private execution stream
  ├─ mailbox
  └─ function/module/memory
       └─ detached operation leases all referenced resources
```

A mailbox cannot unregister while leased by a pending operation. A pending operation cannot be silently orphaned during graceful close; if terminality cannot be proved, runtime disposition is restart-required with retained orphan evidence.

## Portable experiment requirement

Before production native implementation, a pure-JS experiment must prove:

- detached operation returns while independent mock-device work continues;
- host publication does not drive mock-device progression;
- host-to-device and device-to-host lane direction is enforced;
- `Atomics` publication remains visible while the operation is pending;
- generation mismatch rejects stale commands;
- mailbox reset/unregister analog rejects while leased;
- operation close while pending does not claim cancellation;
- terminal completion releases leases and permits mailbox reset/close;
- application event loop remains responsive;
- deterministic cleanup after success and controlled mock failure.

## Native promotion evidence

Before this capability is accepted/supported on Windows:

- exact generated Driver ABI for host registration/mapping/unregistration is reviewed;
- current context/device mapping prerequisites are verified;
- a live long-running CUDA kernel reads host-published lanes and publishes device-to-host lanes using system-scope load/store;
- host `Atomics.store/load` and GPU system-scope operations agree on exact publication values/generations;
- same-runtime bounded commands execute while the kernel remains active;
- terminal event completion releases operation/resource leases;
- close, device loss, mapping failure, stale generation and restart-required paths are exercised;
- zero live/unproved resources remain after graceful completion;
- exact Node/Driver/toolkit/GPU/profile evidence is recorded.

## Relationship to broader concurrency

This capability does not authorize public streams or multiple independent kernels in flight. If a future implementation internally needs an auxiliary private stream, that remains an implementation detail unless a separate measured concurrency contract is accepted.

Issue #40's general multi-stream API is therefore not a prerequisite.

## Non-goals

- search/reroot/ranking semantics;
- public raw pointers/streams/events;
- general mapped-memory replacement for device memory;
- host/device RMW atomics in v1;
- arbitrary shared-memory objects;
- forced per-kernel cancellation claims;
- multi-GPU/MIG;
- performance claims.
