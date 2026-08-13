# SPEC-0018: Bounded Multi-Operation Scheduling

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #40

## Outcome

Extend accepted SPEC-0016 from one pending operation on one private stream to a finite set of opaque operations scheduled on DriverActor-owned private streams with explicit dependencies, bounded admission, resource-hazard control, conservative deferred-error attribution, and terminal cleanup.

SPEC-0016 remains the sole operation lifecycle authority. This specification may widen capacity and dependency semantics; it does not create a second submit/status/wait/close abstraction.

## Status dimensions

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    after trustworthy SPEC-0016 integration/evidence
```

## Dependencies

This proposal consumes SPEC-0003, SPEC-0004, SPEC-0005, SPEC-0015 and SPEC-0016.

Downstream proposals include SPEC-0019 asynchronous transfer, SPEC-0020 prepared batches/graphs, SPEC-0023 CUDA library adapters, SPEC-0024 multi-GPU orchestration, SPEC-0025 graphics interop and application-layer execution plans.

## Design invariants

- one DriverActor Worker owns one private CUDA context per runtime/device;
- all raw streams/events/context/native handles remain private;
- every public operation remains an opaque SPEC-0016-compatible capability;
- queues, streams, events, dependency edges, live leases and diagnostic records are finite and configured;
- no hidden unbounded work queue exists;
- dependencies are explicit and validated before native submission;
- resource conflicts are either proven ordered or rejected before native work;
- host polling observes progress but does not drive GPU dependency execution;
- support/overlap/performance claims require exact native mechanism evidence.

## Operation classes

The generalized operation envelope may represent selected bounded families such as:

```text
kernel
transfer
library
prepared-batch
graph
external-resource synchronization
```

The common envelope owns lifecycle/provenance fields only. Kernel-only fields such as grid/block/shared memory are optional type-specific metadata and must not become mandatory for every operation.

Each operation declares a finite access set over opaque resources/views:

```text
read
write
read-write
lifetime-only dependency
```

Native addresses remain private.

## Capacity and backpressure

A scheduling profile declares exact bounds, for example:

```text
max pending operations
max queued/admitted operations
private stream count
private event count
max dependency edges per operation
max aggregate live dependency edges
optional stream/priority classes
```

Capacity exhaustion returns deterministic typed backpressure before unsafe native work. The runtime does not silently buffer an unlimited queue.

A lower-capacity profile, including `maxPendingGpuOperations = 1`, remains a valid compatibility mode.

## Dependency model

An operation may depend on zero or more earlier opaque operations from the same runtime/device epoch.

Before native work CUDA-JS validates:

- same runtime/device/epoch ownership;
- dependency existence and non-stale state;
- finite edge count;
- acyclicity of any submitted command DAG;
- dependency compatibility with operation class;
- all referenced resources remain live/leaseable;
- no impossible or contradictory ordering.

Dependencies lower privately to same-stream order or DriverActor-owned event record/wait operations.

Public callers never receive raw CUDA events.

## Resource hazards

The scheduler must not equate different opaque operations with independence.

At admission, each operation's declared/derived resource ranges and access roles are checked for hazards. The first accepted design may choose either:

1. automatic dependency insertion only when the ordering is unambiguous and deterministic; or
2. fail-closed rejection requiring the caller/provider plan to supply an explicit dependency.

Whichever policy is selected becomes part of the contract/profile identity.

Required hazards include overlapping writes, write-after-read, read-after-write, workspace conflicts, resource close/rebind and alias/view overlap as defined by their owning contracts.

## Stream ownership and selection

Private streams are created and destroyed by DriverActor under one context. A bounded scheduler policy assigns admitted operations to eligible stream classes.

The public API may express policy-level requirements such as operation class, dependency or priority class only when accepted; it does not expose raw stream IDs or arbitrary CUDA stream flags/priorities.

Same-stream order is preserved by CUDA. Cross-stream order exists only where explicit dependencies/events establish it.

## Submission provenance

Each operation reaches `pending` only after its full SPEC-0016-compatible submission provenance is established, including required leases and completion observation mechanism.

If native work may have been submitted but dependable completion/dependency provenance cannot be established, affected work becomes restart-required/orphaned rather than being requeued or reported as cleanly rejected.

## Status and terminalization

`status()`, `wait()` and `close()` retain SPEC-0016 semantics.

Terminalization releases only resources whose completion/disposition is proved. A completed logical operation may remain inspectable without retaining its private completion event.

Dependency successors may become eligible when predecessor completion/order provenance is established according to the selected device-side mechanism; JavaScript does not need to observe each predecessor first.

## Deferred errors and health

CUDA APIs may surface earlier asynchronous failures. With multiple operations, causal attribution is weaker than the SPEC-0016 single-flight case.

Every error record separates:

```text
observedAt
known affected stream/context boundary
causal operation, only if mechanism proves it
healthBefore / healthAfter
operations/resources with proven, possible, or no affected relationship
```

A stream or context may become suspect/poisoned conservatively. CUDA-JS must not blame an arbitrary operation merely because it was most recently submitted.

## Close behavior

Runtime close:

1. stops new admission;
2. preserves the accepted operation/dependency graph and leases;
3. observes/terminalizes active work within the configured bounded close policy;
4. destroys operation events/streams and child resources only when safe;
5. reports orphan/restart-required state when terminality cannot be proved.

Closing a resource referenced by pending operations remains busy or closing according to its owner contract. Scheduler capacity does not weaken child-before-parent teardown.

## Portable conformance

Portable tests must cover:

- bounded admission and deterministic backpressure;
- same-stream order model;
- cross-stream dependency DAG ordering;
- acyclicity and invalid dependency rejection;
- overlapping resource hazard partitions;
- repeated aliases/leases;
- operation terminalization under out-of-order completion;
- failure affecting one stream versus shared context health;
- close races and owner loss;
- serialized `maxPending=1` equivalence;
- public-record sanitization.

Mocks do not prove actual CUDA overlap or deferred-error causality.

## Native promotion evidence

For each promoted profile:

1. prove same-stream ordering against an independent native oracle;
2. prove cross-stream dependency ordering with explicit events;
3. use a mechanism-level fixture to prove actual concurrent progress for at least one eligible pair before claiming overlap;
4. prove a dependent pair cannot pass its event boundary early;
5. exercise recoverable submission rejection and controlled asynchronous failure;
6. verify affected/unaffected operation disposition is conservative;
7. prove resource leases prevent early release;
8. prove bounded close and terminal stream/event/context cleanup;
9. repeat through installed-package/public facade.

Timing alone is not sufficient evidence of overlap.

## Falsifiers / rollback

Do not accept this specification if finite dependency/hazard ownership cannot be represented without exposing native streams/events or if failure/cleanup becomes less truthful than SPEC-0016.

Rollback is the accepted single-stream/single-pending SPEC-0016 profile.

## Non-goals

- unbounded queues;
- public streams/events;
- automatic application/domain scheduling policy;
- guaranteed overlap;
- arbitrary forced cancellation;
- transparent multi-device scheduling;
- weakening resource leases or health semantics.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__STREAM.html
- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__EVENT.html
- https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html
