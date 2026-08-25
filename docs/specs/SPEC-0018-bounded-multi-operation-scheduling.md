# SPEC-0018: Bounded Multi-Operation Scheduling

**Status:** Accepted

**Date:** 2026-08-13

**Reconciled:** 2026-08-22 for concurrent atomic observation

**Accepted:** 2026-08-24 after protected-main SPEC-0016 native qualification

**Issue owner:** #40

## Outcome

Extend accepted SPEC-0016 from one pending operation on one private stream to a finite set of opaque operations scheduled on DriverActor-owned private streams with explicit dependencies, bounded admission, resource-hazard control, conservative deferred-error attribution, and terminal cleanup.

The scheduler must also support a bounded **independent observer** pattern: one operation may sample independently meaningful atomic state from an allocation while another operation continues updating that same allocation, without inventing an artificial dependency merely because their ranges overlap.

SPEC-0016 remains the sole operation lifecycle authority. This specification may widen capacity and dependency semantics; it does not create a second submit/status/wait/close abstraction.

## Status dimensions

```text
architectural disposition: accepted
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    P1 implementation for CUDA-MCGS readiness
```

## Dependencies

This proposal consumes SPEC-0003, SPEC-0004, SPEC-0005, SPEC-0015 and SPEC-0016.

Concurrent atomic observation may consume accepted Device-JS atomic load/store semantics from SPEC-0022 when a Device-JS consumer is used. The scheduler itself remains language-neutral and does not own atomic helper syntax.

Downstream proposals include SPEC-0019 asynchronous transfer, SPEC-0020 prepared batches/graphs, SPEC-0023 CUDA library adapters, SPEC-0024 multi-GPU orchestration, SPEC-0025 graphics interop and application-layer execution plans.

The acceptance gate is satisfied by protected `main` revision
`9f13785e4d1d8d887099571a7a41be0b5b42f749`: its exact-revision F5 evidence proves
the SPEC-0016 pending/terminal lifecycle, delayed `CUDA_ERROR_NOT_READY`,
conservative deferred-failure containment, terminal event cleanup, and installed
public-facade execution. The first accepted widened profile is exactly two pending
operations on two private nonblocking streams, no admitted queue, at most one
explicit earlier-operation dependency per submission, and fail-closed ordinary
hazards. A caller may select the compatibility profile of one pending operation.

## Design invariants

- one DriverActor Worker owns one private CUDA context per runtime/device;
- all raw streams/events/context/native handles remain private;
- every public operation remains an opaque SPEC-0016-compatible capability;
- queues, streams, events, dependency edges, live leases and diagnostic records are finite and configured;
- no hidden unbounded work queue exists;
- dependencies are explicit and validated before native submission;
- resource conflicts are either proven ordered, explicitly admitted as concurrency-safe atomic observation, or rejected before native work;
- overlapping resource ranges do not by themselves prove a dependency when the declared access semantics are independently concurrency-safe;
- host polling observes progress but does not drive GPU dependency execution;
- supporting concurrent eligibility does not guarantee simultaneous physical execution; CUDA may serialize otherwise independent work according to device resources and scheduling;
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

Each operation declares a finite access set over opaque resources/views. The first accepted access vocabulary must distinguish ordinary conflicting access from explicitly concurrency-safe atomic observation rather than collapsing both into generic `read`/`write` overlap.

A minimal semantic partition is:

```text
ordinary read
ordinary write
ordinary read-write
atomic observation
atomic update
lifetime-only dependency
```

Exact public naming remains subject to accepted implementation design. The semantic distinction is normative: an atomic observation declaration is not a request for snapshot consistency, cross-field coherence, or a happens-before relation to unrelated locations.

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

A first multi-operation implementation may deliberately choose the smallest useful profile, such as one long-lived operation plus one short independent observer, before generalizing capacity. That bounded profile must still use the same SPEC-0016 lifecycle and cannot encode consumer-domain semantics.

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

**Absence of a dependency is meaningful.** For operations whose overlapping accesses are explicitly declared and validated as concurrency-safe atomic observation/update, CUDA-JS must not insert an ordering edge merely because both operations reference the same allocation or byte range. Doing so would change the requested execution semantics and can make a short observer wait behind a long-lived producer that is not expected to terminate soon.

CUDA remains free to schedule eligible independent work serially or concurrently. CUDA-JS promises only that it does not create an unnecessary semantic dependency; it does not promise overlap.

## Resource hazards

The scheduler must not equate different opaque operations with independence, but it must also not equate every overlapping range with a true data dependency.

At admission, each operation's declared/derived resource ranges and access roles are classified into one of three cases.

### 1. Ordinary conflicting access

Overlapping ordinary writes, write-after-read, read-after-write, workspace conflicts, resource close/rebind and alias/view overlap are hazards unless an explicit valid dependency orders them.

The first accepted design may choose either:

1. automatic dependency insertion only when the ordering is unambiguous and deterministic; or
2. fail-closed rejection requiring the caller/provider plan to supply an explicit dependency.

Whichever policy is selected becomes part of the contract/profile identity.

### 2. Concurrency-safe atomic observation/update

An overlap is not an ordering hazard when every concurrently accessed location in that overlap is covered by accepted atomic semantics and the caller declares that each observed datum is independently meaningful.

For this class:

- concurrent access is permitted without an inter-operation dependency;
- the observer may see an older or newer valid value for each independently observed location;
- no coherent multi-location snapshot is implied;
- no ordering between neighboring atomic locations is implied unless separately declared;
- CUDA-JS validates type/alignment/address-space/scope/order capability but does not interpret the consumer meaning of the values;
- the scheduler must not serialize the pair solely because their allocation/ranges overlap.

This is a generic memory-access capability, not a search/ranking/graph feature.

### 3. Compound/coherent publication

If two or more locations jointly define one fact and observing a mixture of versions could manufacture an invalid value, the caller must use an accepted coherent publication mechanism or explicit dependency. CUDA-JS must not infer such semantic dependency from field names or consumer identity.

Examples of generic mechanisms may include an accepted packed atomic unit, generation/sequence publication protocol, or operation dependency. Exact mechanisms belong to their owning memory/Device-JS contracts.

## Stream ownership and selection

Private streams are created and destroyed by DriverActor under one context. A bounded scheduler policy assigns admitted operations to eligible stream classes.

The public API may express policy-level requirements such as operation class, dependency or priority class only when accepted; it does not expose raw stream IDs or arbitrary CUDA stream flags/priorities.

Same-stream order is preserved by CUDA. Cross-stream order exists only where explicit dependencies/events establish it or where a separately accepted CUDA mechanism creates the required order.

Independent streams express eligibility for concurrency, not a guarantee of simultaneous residency or progress. Correctness must never depend on two kernels actually overlapping in time.

## Submission provenance

Each operation reaches `pending` only after its full SPEC-0016-compatible submission provenance is established, including required leases and completion observation mechanism.

If native work may have been submitted but dependable completion/dependency provenance cannot be established, affected work becomes restart-required/orphaned rather than being requeued or reported as cleanly rejected.

## Status and terminalization

`status()`, `wait()` and `close()` retain SPEC-0016 semantics.

Terminalization releases only resources whose completion/disposition is proved. A completed logical operation may remain inspectable without retaining its private completion event.

Dependency successors may become eligible when predecessor completion/order provenance is established according to the selected device-side mechanism; JavaScript does not need to observe each predecessor first.

An independent observer has no predecessor relationship to a long-lived producer merely because it samples the producer's atomically observable allocation. It terminalizes on its own completion event and leases the shared allocation for its own lifetime.

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
- ordinary overlapping resource hazard partitions;
- declared atomic observation/update overlap admitted without an artificial dependency;
- compound/coherent access still requiring its declared publication/order mechanism;
- repeated aliases/leases;
- operation terminalization under out-of-order completion;
- failure affecting one stream versus shared context health;
- close races and owner loss;
- serialized `maxPending=1` equivalence;
- public-record sanitization.

Mocks do not prove actual CUDA overlap, device atomic visibility, memory-order semantics or deferred-error causality.

## Native promotion evidence

For each promoted profile:

1. prove same-stream ordering against an independent native oracle;
2. prove cross-stream dependency ordering with explicit events;
3. use a mechanism-level fixture to prove actual concurrent progress for at least one eligible pair before claiming overlap;
4. prove an independent atomic observer can execute while a long-lived writer remains pending, read only valid atomically published values, and complete without waiting for producer terminality when hardware scheduling permits;
5. prove CUDA-JS inserts no hidden dependency for that declared concurrency-safe overlap;
6. prove a dependent pair cannot pass its event boundary early;
7. exercise recoverable submission rejection and controlled asynchronous failure;
8. verify affected/unaffected operation disposition is conservative;
9. prove resource leases prevent early release;
10. prove bounded close and terminal stream/event/context cleanup;
11. repeat through installed-package/public facade.

Timing alone is not sufficient evidence of overlap. Correctness of the observer fixture must remain valid even on a run where CUDA serializes the eligible kernels.

## Falsifiers / rollback

Do not accept this specification if finite dependency/hazard ownership cannot be represented without exposing native streams/events, if failure/cleanup becomes less truthful than SPEC-0016, or if admitting concurrency-safe atomic observation requires consumer-domain semantics in CUDA-JS.

Rollback is the accepted single-stream/single-pending SPEC-0016 profile.

## Non-goals

- unbounded queues;
- public streams/events;
- automatic application/domain scheduling policy;
- guaranteed overlap;
- arbitrary forced cancellation;
- transparent multi-device scheduling;
- weakening resource leases or health semantics;
- global snapshot consistency for independently observed atomic fields;
- inferring compound-field consistency requirements from consumer data structures.

## Primary references

- https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__STREAM.html
- https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html
- https://docs.nvidia.com/cuda/cuda-programming-guide/
