# SPEC-0016: GPU Operation Submission and Completion Lifecycle

**Status:** Accepted

**Date:** 2026-08-12

**Accepted after portable evidence on:** `f49f2621ef741b54255aad0877c1baffbfc79d1d`

## Outcome

Separate successful GPU submission from later GPU completion while preserving the accepted one-DriverActor/one-private-context ownership model and the SPEC-0005 single-stream/single-flight baseline.

The first slice adds one opaque logical GPU operation. Submission returns only after the kernel has been submitted and a private completion event has been successfully recorded. Completion is observed later through short serialized DriverActor commands. The DriverActor remains one context-owning Worker; it is no longer retained inside one polling command for the lifetime of the GPU work.

This specification does **not** authorize multiple GPU operations in flight or multiple execution streams. Those remain a separately planned capability under issue #40 after this lifecycle is trustworthy.

This accepted specification authorizes only the bounded production integration described below. It does not establish native support before exact Windows qualification passes.

## Authority and relationship

This specification is additive to:

- SPEC-0003 DriverActor/resource ownership;
- SPEC-0004 device-memory ownership;
- SPEC-0005 module/launch/completion baseline;
- SPEC-0011 typed scalar launch arguments;
- SPEC-0015 execution-scope/status clarification.

SPEC-0005 remains the accepted currently implemented runtime behavior until the SPEC-0016 production work package is integrated. SPEC-0016 is now the authority for that bounded widening.

Issue ownership:

- #51 owns this operation lifecycle;
- #38 may consume it for sideband/mapped-publication work;
- #40 may consume it for multiple-in-flight/private-stream scheduling;
- neither successor may redefine operation lifetime, terminalization, lease, or deferred-error semantics independently.

## Status dimensions

```text
architectural disposition: selected
implementation status:       authorized, not yet implemented in accepted main
qualification status:        not qualified
priority:                    active execution-lifecycle work
```

These dimensions are independent under `STATUS_SEMANTICS.md`.

## Design invariants

- one DriverActor Worker owns one private context and all raw Driver resources;
- the Worker command queue remains serialized;
- one private nonblocking execution stream remains the only execution stream in this slice;
- at most one GPU operation may be `pending` in a runtime;
- no raw event, stream, context, pointer, or native handle crosses the DriverActor boundary;
- a pending GPU operation retains every function/device-memory lease needed by its launch;
- host waiting is not GPU progression and does not imply cancellation;
- freeing the command queue does **not** implicitly authorize arbitrary Driver interleaving;
- qualification/support claims remain exact-profile evidence, not architectural disposition.

## Why the lifecycle changes

Current `ExecutionManager.launch()` already establishes the required submission provenance sequence:

1. validate launch;
2. acquire function and memory leases;
3. create a private event;
4. submit `cuLaunchKernelEx` on the private stream;
5. record the event on that stream.

It then remains in the same Worker command while polling `cuEventQuery()` to terminality. Because DriverActor commands are serialized, that polling interval becomes a global same-actor exclusion interval.

The new lifecycle cuts the command at the existing provenance boundary: **successful event record**.

## Alternatives assessed

### Blocking synchronization on the DriverActor

Rejected. It preserves head-of-line blocking.

### Query CUDA from the application thread

Rejected. Raw event/context authority would escape the DriverActor.

### Second polling/context Worker

Rejected for the first slice. It adds cross-thread context-currentness, native-capability transfer, teardown, and failure-provenance complexity without necessity.

### Callback/host-function completion

Deferred. Callback/reentrancy/Node-FFI lifetime complexity is not justified before the simpler event-query model is proven.

### Selected: serialized DriverActor with short submit/query commands

The owning Worker remains serialized. Submission returns after event provenance exists. Later status calls are separate short commands. Facade `wait()` is repeated short status polling outside the DriverActor queue.

## Public capability direction

The accepted public shape is:

```text
CudaFunction.submit(options) -> CudaOperation

CudaOperation
  status() -> OperationStatus
  wait()   -> terminal OperationResult or failure
  close()  -> logical operation release after terminality
```

`CudaFunction.launch(options)` remains the terminal convenience API and must preserve SPEC-0005 behavior unless this specification explicitly says otherwise.

Minor naming refinements remain subject to package review only if they preserve this lifecycle exactly; they do not authorize semantic widening.

## Operation states

GPU operation state is exactly:

```text
pending
completed
failed
orphaned
```

`closed` is logical capability disposition, not GPU execution state.

- `pending`: launch submitted, event provenance established, execution leases retained.
- `completed`: event reported successful completion and terminalization succeeded.
- `failed`: terminal asynchronous failure observed and terminalization succeeded sufficiently to establish the failed record.
- `orphaned`: owner/context/cleanup loss prevents proof of native/resource terminality; restart is required and cleanup is not claimed.

## Submission boundary

`submit()` may resolve only after:

1. exact facade/function validation;
2. launch geometry/shared-memory validation;
3. argument count/kind/range validation;
4. function lease acquisition;
5. every device-memory execution lease acquisition, including repeated aliases;
6. parameter-buffer packing;
7. private event creation;
8. kernel submission on the existing private stream;
9. event record on that same stream;
10. logical operation registration.

The returned capability contains no native event/stream identity.

Failure before native submission releases leases and destroys an unused event. Successful launch followed by failure to establish event provenance remains restart-required because device work may exist without trustworthy completion observation.

## Private operation record

The execution owner retains private state equivalent to:

```text
operation/submission identity
state
function/module logical identity
launch grid/block/shared-memory summary
argument-kind summary
private completion-event token
function lease release authority
all memory lease release authorities
terminal result/failure observation
terminalization guard
```

The logical operation is not a public event wrapper. The native event remains private and must be destroyed at terminalization; retaining a completed logical operation must not keep the event or execution stream leased merely for result inspection.

## Status observation

`operation.status()` is one short DriverActor request.

For `pending`:

- query the private event once;
- CUDA success terminalizes `completed`;
- `CUDA_ERROR_NOT_READY` returns `pending` without releasing leases;
- another Driver error is recorded at its exact observation site and processed under the deferred-error rules below.

For an already terminal operation, status returns the stored terminal record without another CUDA query.

Polling does not drive GPU work and does not retain the DriverActor between calls.

## Terminalization

Terminalization order:

```text
terminal event/failure observation
  -> destroy private completion event
  -> release all device-memory execution leases
  -> release function lease
  -> store immutable terminal operation record
  -> mark operation completed/failed
  -> release the single-flight admission slot
```

Terminalization is idempotent. Repeated terminal status does not repeat native cleanup or lease release.

If required event/resource cleanup cannot be proved, the operation/runtime becomes orphaned/restart-required rather than reporting normal terminal cleanup.

Destroying an incomplete CUDA event is not used as cancellation: event destruction does not prove the kernel stopped using its resources.

## First-slice admission

```text
maxPendingGpuOperations = 1
privateExecutionStreams  = 1
```

A second submission while one operation is pending returns deterministic execution backpressure.

A terminal-but-not-yet-logically-closed operation does not consume the GPU admission slot because its execution resources already terminalized.

## Pending-operation command gate

**EXP-014 established the selected implementation direction.** The first slice does not need ResourceRegistry lease introspection or new per-memory conflict machinery merely to make early submission safe.

While one GPU operation is pending, DriverActor accepts only an explicit operation-safe command allowlist.

### Allowed in the first slice

- status/terminal observation of the pending operation;
- pending operation close request, which must report busy rather than cancellation;
- runtime close under the close protocol below;
- the internal legacy-launch timeout transition;
- exact test/diagnostic controls explicitly named by conformance.

### Blocked while pending

All other ordinary DriverActor commands fail before native work unless a later accepted capability explicitly adds them to the allowlist. This includes:

- another kernel submission;
- ordinary device-memory read/write, even for a currently unrelated allocation;
- memory/function/module release or mutation;
- arbitrary Driver diagnostics or operations merely because the Worker queue is available.

This conservative gate restores the global exclusion that SPEC-0005 previously obtained accidentally from its long-lived launch command, while still freeing the queue for the operation lifecycle itself.

Existing registry leases continue to fence actual dependency release. No ResourceRegistry or MemoryManager API widening is required for SPEC-0016 v1.

Later capabilities may deliberately widen interleaving:

- #38 may add specifically proven sideband/mailbox commands;
- #40 may add multiple independent operations/private streams and the resource-conflict model they require;
- copy/compute overlap or asynchronous transfer requires its own explicit memory/stream contract and native evidence.

CompilerActor operations remain independently owned by the separate CompilerActor Worker and are not serialized behind DriverActor GPU execution.

## Wait semantics

`CudaOperation.wait()` is facade-side repeated short `status()` polling with bounded polling cadence.

The explicit operation wait has no implicit GPU cancellation/deadline in the first slice. It resolves only when the operation becomes terminal and does not occupy the DriverActor between polls.

A caller abandoning the promise or composing it with JavaScript timing/abort logic changes only the caller's wait. It does not alter GPU ownership, state, event, or leases.

Any future host wait deadline must be described as a host wait result, never as kernel cancellation.

## Existing `launch()` compatibility

The terminal `CudaFunction.launch()` API remains bounded by the accepted `execution.maxCompletionMilliseconds` policy.

Intended internal behavior:

```text
submit
  -> repeated short status observations
  -> terminal success/failure
  -> auto-close logical operation
  -> return legacy terminal launch record
```

If the existing completion deadline expires first, `launch()` preserves SPEC-0005 restart-required truth: it does not release unproved execution leases and does not leave an unreachable hidden pending operation pretending normal ownership remains available.

An internal legacy-timeout transition may mark the runtime/epoch restart-required. It is not a public arbitrary-kernel cancellation API.

The new explicit `submit()` path itself has no implicit completion deadline; long-lived ownership is represented by the operation capability.

## Runtime close with pending operation

After runtime state becomes `closing`, no new ordinary commands are accepted. Close may therefore occupy the owning Worker while bounded-polling the sole pending operation under the existing completion safety policy.

- If the operation terminalizes within the accepted close/completion bound, terminalize it first, then perform normal dependency-safe teardown.
- If terminality cannot be proved within the bound, mark restart-required/orphaned and preserve operation/event/lease evidence. Do not run ordinary `closeAll()` through live work and claim cleanup.

## Deferred-error provenance

CUDA event, stream, and launch APIs may report errors originating from previous asynchronous launches.

CUDA-JS records separately:

- `observedAt`: exact Driver operation/request on which CUDA reported the failure;
- `causalOperation`: only when mechanism/evidence justifies attribution;
- existing sanitized native status/name/description and runtime health transition.

One pending operation minimizes ambiguity but does not authorize stronger causal claims than the Driver evidence provides. #40 must revisit this rule with multiple operations.

## Public result

A completed operation exposes bounded data equivalent to the existing terminal launch record: schema/status, logical function/module identity, launch dimensions/shared-memory summary, argument-kind summary, operation/submission identity, bounded observation metadata, and health snapshot.

Failure records expose only stable sanitized failure/provenance/health facts. No event, stream, pointer, module bytes, or parameter storage is returned.

## Operation close

`operation.close()`:

- reports busy while `pending` and never claims cancellation;
- after `completed` or `failed`, closes only the logical operation capability because private event/execution leases already terminalized;
- is idempotent at the public facade boundary;
- cannot turn an orphaned operation into a cleanup claim.

Unexpected DriverActor loss follows the existing runtime epoch/orphan rules.

## EXP-014 result

EXP-014 was the cheapest decisive portable experiment for this lifecycle shape.

On GitHub Actions Ubuntu 24.04 with official Node 26.7.0, protected PR #53 merge-ref run `31656331994` passed all stable experiment cases `OPL-001` through `OPL-015`, represented by nine grouped tests:

```text
tests 9
pass 9
fail 0
```

The passing cases prove only the JavaScript orchestration model:

- submit returns while independent mock work remains pending;
- mock work progresses without status polling;
- later status is a separate serialized-owner command;
- second submit backpressures;
- repeated function/memory leases are conserved;
- conservative pending-command gate rejects ordinary commands;
- pending close is not cancellation;
- terminalization/cleanup is idempotent;
- logical operation can outlive its mock event cleanup;
- runtime close either proves terminality or reports restart-required/orphaned state;
- legacy terminal-launch success/timeout behavior retains ownership truth;
- controlled failure and mock-owner loss remain distinguishable;
- application event loop remains responsive.

The first experiment run exposed a test-oracle defect: hosted Worker startup could exceed a fixed 20–30 ms assumption. The experiment was repaired by adding a test-only Worker readiness signal, then measuring independent progress during a no-host-command interval. Behavior assertions were not weakened.

EXP-014 does **not** prove CUDA launch asynchrony, event ordering, native deferred-error behavior, cleanup, overlap, or performance.

## Authorized production work package

This accepted specification authorizes only:

- durable operation state in `runtime.execution`;
- closed DriverActor commands for submit/status/logical release/legacy timeout;
- a pending-operation command gate at the DriverActor/execution ownership boundary;
- DriverRuntime operation methods;
- public opaque `CudaOperation` facade;
- compatibility implementation of terminal `launch()`;
- pending-aware DriverActor close;
- F3/F5/F8 portable/package conformance updates;
- **no** new CUDA Driver exports merely for lifecycle separation;
- **no** ResourceRegistry/MemoryManager API expansion solely for this slice.

Anything beyond this list requires a separate accepted capability contract.

## Native Windows promotion evidence

Before native support is claimed for the new operation surface on the accepted Windows profile:

1. an independent native oracle submits the same watchdog-safe delayed fixture and records its completion event;
2. public `submit()` returns while the event still reports not-ready;
3. the application event loop remains responsive;
4. status queries occur on later DriverActor turns with the private context still current;
5. final output is byte-identical to the independent oracle;
6. blocked pending commands fail before unsafe native work;
7. controlled asynchronous failure records conservative observation/health provenance;
8. existing terminal `launch()` output and timeout controls remain valid;
9. normal close terminalizes pending work before dependency teardown;
10. unproved close/timeout retains restart-required/orphan evidence;
11. event/function/module/memory/stream/context/library ownership balances after proved terminal execution;
12. no raw native capability crosses the public boundary.

## Falsifiers / rollback

Do not claim implementation/native completion if:

- short status queries cannot preserve context/currentness or error provenance;
- operation lifetime cannot own leases without raw-native escape;
- the pending command gate cannot prevent unproven interleaving cleanly;
- legacy `launch()` cannot preserve its timeout/cleanup truth;
- graceful close can race live work;
- native qualification later shows the intended submission boundary is not asynchronous on the exact profile.

Rollback is preservation of accepted SPEC-0005 terminal single-flight behavior.

## Non-goals

- multiple in-flight kernels or private stream pool (#40);
- mapped host/publication memory (#38);
- asynchronous copy/compute overlap;
- raw public streams/events;
- forced arbitrary-kernel cancellation;
- CUDA Graphs/cooperative launch;
- multi-GPU/MIG;
- consumer/search/model semantics;
- changing the default one-DriverActor/one-private-context ownership model.
