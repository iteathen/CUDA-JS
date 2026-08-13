# SPEC-0016: GPU Operation Submission and Completion Lifecycle

**Status:** Proposal

**Date:** 2026-08-12

**Assessed base:** `d4ff83717ad53be4701898def7c9ba757a496731`

## Outcome

Separate successful GPU submission from later GPU completion while preserving the accepted one-DriverActor/one-private-context ownership model and the existing SPEC-0005 single-stream/single-flight baseline.

The first slice adds one opaque logical **GPU operation** resource. A submission command returns after the launch has been accepted and a private completion event has been successfully recorded. Completion is observed later through short DriverActor commands. The DriverActor remains intentionally serialized; it is no longer retained inside one polling command for the lifetime of the GPU work.

This specification does **not** authorize multiple GPU operations in flight or multiple execution streams. Those remain a separately planned capability under issue #40 after this lifecycle is proven.

Production implementation is not authorized while this document remains `Proposal`. EXP-014 must first validate the portable lifecycle/interleaving model, followed by review and explicit acceptance of this specification.

## Authority and relationship

This proposal is additive to:

- SPEC-0003 DriverActor/resource ownership;
- SPEC-0004 device-memory ownership;
- SPEC-0005 module/launch/completion baseline;
- SPEC-0011 typed scalar launch arguments;
- SPEC-0015 execution-scope/status clarification.

SPEC-0005 remains the accepted runtime behavior until this proposal is accepted and implemented.

Issue ownership:

- #51 owns this operation lifecycle;
- #38 may later consume it for sideband/mapped-publication work;
- #40 may later consume it for multiple-in-flight/private-stream scheduling;
- neither successor may redefine operation lifetime, terminalization, lease, or deferred-error semantics independently.

## Design invariants

- one DriverActor Worker owns one private context and all raw Driver resources;
- the Worker command queue remains serialized;
- one private nonblocking execution stream remains the only execution stream in this slice;
- at most one GPU operation may be `pending` in a runtime;
- no raw event, stream, context, pointer, or native handle crosses the DriverActor boundary;
- a pending GPU operation owns every resource lease needed by the submitted launch;
- host waiting is not GPU progression and does not imply cancellation;
- qualification/support claims remain exact-profile evidence, not architectural disposition.

## Why the lifecycle must change

Current `ExecutionManager.launch()` already establishes the correct submission provenance sequence:

1. validate launch;
2. acquire function and memory leases;
3. create a private event;
4. submit `cuLaunchKernelEx` on the private stream;
5. record the event on that stream.

It then remains in the same Worker command while polling `cuEventQuery()` to terminality. Because DriverActor commands are serialized, the polling interval accidentally becomes a global same-actor exclusion interval.

The new lifecycle cuts the command at the existing provenance boundary: **successful event record**.

## Candidate alternatives and disposition

### Blocking event synchronization on the DriverActor

Rejected. It preserves head-of-line blocking and weakens later control/observation evolution.

### Native event queries from the application thread

Rejected. Raw event/context authority would cross the DriverActor boundary.

### Second context-owning/polling Worker

Rejected for the first slice. It creates cross-thread context-currentness, native-capability transfer, teardown, and error-provenance complexity without necessity.

### Native callback/host-function completion

Deferred. Callback/reentrancy/Node-FFI lifetime complexity is not justified before event-query operations are proven.

### Serialized DriverActor with short submit/query commands

Selected. It preserves one owner and one context while allowing device work to outlive the submission command.

## Public capability direction

The intended public shape is:

```text
CudaFunction.submit(options) -> CudaOperation

CudaOperation
  status() -> OperationStatus
  wait()   -> terminal OperationResult or failure
  close()  -> logical operation release after terminality
```

`CudaFunction.launch(options)` remains the terminal convenience API defined by the accepted package surface and must preserve SPEC-0005 behavior unless this specification explicitly says otherwise.

Final public names may be adjusted during acceptance if package review finds a clearer spelling, but the lifecycle semantics in this document are the authority target.

## Operation states

Logical operation state is exactly:

```text
pending
completed
failed
orphaned
```

`closed` is a public capability/resource disposition rather than a GPU execution state.

### pending

The launch was submitted, completion-event provenance was established, and referenced leases remain held.

### completed

The private event reported successful completion and terminalization completed successfully.

### failed

A terminal asynchronous failure was observed and terminalization completed sufficiently to release the execution leases. Runtime health may remain poisoned/suspect according to the underlying Driver error.

### orphaned

Owner/context loss or cleanup failure prevents proof of the operation's terminal native/resource disposition. The runtime requires restart and must not claim the resources were freed.

## Submission boundary

`submit()` may resolve only after all of the following succeed:

1. exact public/facade validation;
2. function capability validation;
3. launch geometry/shared-memory validation;
4. argument count/kind/range validation;
5. function lease acquisition;
6. every device-memory execution lease acquisition, including repeated aliases;
7. parameter-buffer packing;
8. private event creation;
9. kernel submission on the existing private stream;
10. event record on that same stream;
11. logical operation-resource registration.

The returned operation capability contains no native event or stream identity.

A failure before native submission releases leases and destroys any created unused event. A successful launch followed by failure to record the completion event remains `restart-required`: GPU work may exist without trustworthy completion provenance.

## Private operation record

The execution owner retains private state equivalent to:

```text
operation token
submission request/sequence identity
state
function/module identity for result reporting
launch grid/block/shared-memory summary
argument-kind summary
private event resource token
function lease release authority
device-memory lease release authorities
terminal result or bounded failure observation
terminalization guard
```

This record is internal implementation data. Callers receive only the opaque operation capability and bounded status/result records.

The logical operation should be a context-owned resource rather than a stream child. Its private event remains a stream child. After terminal event cleanup, retaining a completed logical operation must not unnecessarily keep the stream or native event alive.

## Status observation

`operation.status()` is a short DriverActor request.

When the operation is `pending`:

- query its private event once;
- CUDA success terminalizes the operation as `completed`;
- `CUDA_ERROR_NOT_READY` returns `pending` without mutation of leases;
- another Driver error is recorded at the exact observation site and is processed under the deferred-error rules below.

When already terminal, status returns the stored terminal record without another CUDA query.

Status polling does not drive GPU work and does not hold the DriverActor between calls.

## Terminalization

Successful terminalization order is:

```text
terminal event/failure observation
  -> destroy private completion event
  -> release all device-memory execution leases
  -> release function lease
  -> store immutable terminal operation record
  -> mark operation completed/failed
  -> release the single-flight admission slot
```

Terminalization is idempotent. Repeated terminal `status()` calls return the same bounded record and do not repeat native cleanup or lease release.

If event destruction or another required terminal cleanup step cannot be proved, the runtime/operation becomes restart-required/orphaned rather than reporting a normal terminal cleanup claim.

NVIDIA permits destroying an incomplete event asynchronously; CUDA-JS deliberately does **not** use that permission to implement pending-operation close, because destruction of the event does not prove that the kernel stopped using the function/memory resources.

## First-slice admission

```text
maxPendingGpuOperations = 1
privateExecutionStreams = 1
```

A second submit while the existing operation is pending fails with deterministic execution backpressure.

A terminal-but-not-yet-closed operation does not consume the GPU admission slot because its native execution/resources have already terminalized.

## Interleaving contract while an operation is pending

Submission returning early does not make all Driver commands concurrency-safe.

### Allowed in the first slice

- status/terminal observation of the pending operation;
- terminal logical operation release;
- runtime close under the close protocol below;
- exact test/diagnostic hooks required by conformance and explicitly allowed by the owner.

### Not implicitly allowed

Unless a later accepted capability says otherwise, pending execution rejects commands that would create unproven synchronization, memory mutation, native-resource mutation, or ambiguous execution interaction, including:

- another kernel submission;
- ordinary host-to-device or device-to-host transfer on an allocation currently execution-leased;
- release of a leased allocation/function/module dependency;
- arbitrary new Driver work merely because the command queue is available.

CompilerActor operations remain independently owned by the separate CompilerActor Worker and are not serialized behind DriverActor GPU execution.

## Device-memory execution conflict

The accepted ResourceRegistry lease mechanism currently prevents close/free while an allocation is leased, but it does not itself prevent `MemoryManager.read()` or `write()` from acquiring another lease and performing a transfer.

The operation implementation therefore requires an internal conflict query owned by the resource/lifetime boundary. Preferred implementation is a bounded internal `leaseCount()`/equivalent registry capability used by MemoryManager before transfer acquisition.

Because DriverActor commands remain serialized, checking an existing execution lease and acquiring the transfer lease occur without another command interleaving between them.

In this slice, any existing lease on an allocation when an ordinary read/write begins is sufficient to reject the transfer as busy. Later concurrent-execution work may define richer range/access modes only under a separate accepted contract.

## Wait semantics

`CudaOperation.wait()` is a facade-side asynchronous convenience built from repeated short `status()` calls with bounded polling cadence.

First-slice `wait()` has no built-in GPU cancellation or execution deadline. It resolves only when the operation becomes terminal and does not occupy the DriverActor between polls.

A caller may stop awaiting or compose the promise with its own JavaScript timing/abort mechanism; that changes only the caller's wait and does not alter operation ownership, state, or leases.

A future bounded wait option requires explicit semantics. A host wait deadline must never be presented as kernel cancellation.

## Existing `launch()` compatibility and completion deadline

The existing terminal `CudaFunction.launch()` behavior remains bounded by the accepted `execution.maxCompletionMilliseconds` policy.

The intended implementation is internally equivalent to:

```text
submit
  -> repeated short status observations
  -> terminal success/failure
  -> auto-close logical operation
  -> return legacy terminal launch record
```

If the existing completion deadline expires before terminality, `launch()` preserves SPEC-0005's restart-required behavior: the runtime does not release the still-unproved operation leases and does not return an unreachable hidden pending operation as if normal ownership remained available to the caller.

An internal legacy-timeout transition may be used to mark the owning runtime/epoch restart-required. It is not a public arbitrary-kernel cancellation API.

The new explicit `submit()` path has no such implicit completion deadline; long-lived ownership is represented by the operation capability itself.

## Runtime close with a pending operation

`runtime.close()` is allowed to consume the existing bounded completion policy because the runtime has entered the closing state and no new work is accepted.

If one operation is pending:

1. close repeatedly observes that operation on the owning Worker;
2. if it terminalizes within the accepted close/completion deadline, close proceeds with ordinary dependency-safe teardown;
3. if terminality cannot be proved within that bound, the runtime becomes restart-required and preserves operation/event/lease orphan evidence instead of invoking ordinary close-all and claiming cleanup.

This close-only bounded polling may occupy the DriverActor because no further commands are accepted after closing begins.

## Deferred-error provenance

Current CUDA documentation notes that event, stream, and launch APIs may report errors originating from previous asynchronous launches.

CUDA-JS records separately:

- `observedAt`: the exact Driver operation/request where CUDA reported the error;
- `causalOperation`: only when the evidence/mechanism justifies attribution;
- runtime health transition and native status/name/description under the existing sanitized error contract.

With one pending operation, ambiguity is deliberately minimized but not erased by assertion. SPEC-0016 must not state stronger causality than the Driver evidence supports.

A later multiple-in-flight profile under #40 must revisit this rule explicitly.

## Public operation result

A completed operation exposes bounded data equivalent to the existing terminal launch record:

```text
schemaVersion
status: completed
function/module logical identity
launch grid/block/shared-memory summary
argument-kind summary
submission/operation sequence identity
observed poll/status count where retained
bounded elapsed host-observation information where meaningful
health snapshot
```

A failed status/result contains only stable sanitized failure identity/provenance and health facts. No event/stream/native address/parameter bytes/module bytes are returned.

## Operation close

`operation.close()`:

- rejects/busy while `pending`;
- never claims cancellation;
- after `completed` or `failed`, closes only the logical operation resource because the private event and execution leases already terminalized;
- is idempotent at the public facade boundary.

Unexpected DriverActor loss marks outstanding operation capabilities orphaned/restart-required through the runtime epoch rules.

## EXP-014 prerequisite

Before this specification may become `Accepted`, EXP-014 must prove the host/lifecycle model without CUDA:

- independently progressing mock-device work outlives submit;
- status requests are separate short serialized-owner commands;
- polling is not required for device progress;
- second submit backpressures;
- function/repeated-memory leases remain held;
- host read/write conflicts reject while execution-leased;
- pending close cannot claim cancellation;
- successful terminal observation releases resources exactly once;
- repeated terminal status is stable;
- runtime close either proves terminality or reports restart-required/orphaned state;
- legacy terminal-launch deadline behavior does not leak hidden ownership;
- controlled failure/owner loss remains honest;
- Node event loop remains responsive.

Mocks establish orchestration/lifetime semantics only.

## Production implementation after acceptance

The first implementation work package is bounded to:

- private operation-resource state in `runtime.execution`;
- closed DriverActor commands for submit/status/release and legacy-timeout handling;
- DriverRuntime operation methods;
- public opaque `CudaOperation` facade;
- internal resource lease/conflict inspection needed by MemoryManager;
- compatibility implementation of terminal `launch()`;
- pending-aware DriverActor close;
- F3/F4/F5/F8 portable/package conformance updates;
- no new CUDA Driver exports merely for lifecycle separation.

## Native Windows promotion evidence

Before native support is claimed for the new operation surface on the accepted Windows profile:

1. an independent native oracle submits the same watchdog-safe delayed fixture and records its completion event;
2. public `submit()` returns while the native event still reports not-ready;
3. the application event loop remains responsive;
4. status queries occur on later DriverActor turns with the private context still current;
5. final output is byte-identical to the independent oracle;
6. execution-leased host transfer/release conflicts fail before unsafe native work;
7. controlled asynchronous failure records conservative observation/health provenance;
8. existing terminal `launch()` output and timeout controls remain valid;
9. normal pending close waits/terminalizes before dependency teardown;
10. an unproved close/timeout retains restart-required/orphan evidence;
11. event/function/module/memory/stream/context/library ownership balances after proved terminal execution;
12. no raw native capability crosses the public boundary.

## Falsifiers / rollback

Do not promote this capability if:

- short status queries cannot preserve context/currentness or error provenance;
- operation lifetime cannot own leases without raw-native escape;
- pending memory conflicts cannot be enforced cleanly;
- compatibility `launch()` cannot preserve its bounded timeout/cleanup truth;
- graceful close can race a live operation;
- a portable mock requires host polling to advance device work;
- native qualification later shows the intended submission boundary is not asynchronous on the exact profile.

Rollback is preservation of accepted SPEC-0005 terminal single-flight behavior.

## Non-goals

- multiple in-flight kernels or private stream pool (#40);
- mapped host/publication memory (#38);
- raw public streams/events;
- forced arbitrary-kernel cancellation;
- CUDA Graphs/cooperative launch;
- multi-GPU/MIG;
- consumer/search/model semantics;
- changing the default one-DriverActor/one-private-context ownership model.
