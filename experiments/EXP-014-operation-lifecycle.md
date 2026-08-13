# EXP-014 — Submission/Completion Operation Lifecycle

**Status:** Active bounded experiment — portable question passed

**Date:** 2026-08-12

## Question

Can CUDA-JS preserve one serialized Driver owner while allowing independently progressing device work to outlive the submission command, with exact operation state, resource leases, command interleaving, terminalization, legacy deadline behavior, and close truth?

This experiment answers only the host/lifecycle question needed by proposed SPEC-0016. It does not load CUDA and cannot establish native asynchronous execution, Driver ordering, performance, or support.

## Input authority

- protected `main` `d4ff83717ad53be4701898def7c9ba757a496731`;
- SPEC-0003 resource/DriverActor lifecycle;
- SPEC-0004 device memory;
- SPEC-0005 accepted terminal single-flight launch;
- SPEC-0015 scope/status clarification;
- proposed SPEC-0016 on the experiment branch;
- issue #51 restarted assessment/research/reassessment.

## Competing hypotheses

### H1 — durable operation with short serialized commands is sufficient

A submit command can return after provenance is established; an independently progressing device owner can continue while later short status commands observe it. Resource leases and terminalization can remain deterministic without another host Worker owning the CUDA context.

### H2 — polling command must remain alive

If operation progress, lease conservation, terminalization, or safe close requires the original host command to stay active, SPEC-0016's selected model is falsified.

### H3 — freeing the command queue requires a safe interleaving boundary

If early return implicitly makes arbitrary host/Driver operations legal while mock device work is pending, the lifecycle model is unsafe. The first slice must be able to admit only explicitly operation-safe commands and reject ordinary commands until terminality.

## Isolation

The experiment uses:

- one JavaScript **serialized owner queue** modeling DriverActor command ownership;
- one Node Worker per active mock device operation, modeling work that progresses independently of host polling;
- `SharedArrayBuffer` atomic words for mock device state/ticks only;
- a small experiment-owned lease ledger and memory fixture.

It does not reuse CUDA calls, raw pointers, streams/events, or production operation code. This independence is intentional: success proves the lifecycle state machine is coherent, not that CUDA behaves the same way.

## Mock device state

Shared state words:

```text
0: device state  (0 pending, 1 completed, 2 failed)
1: progress ticks
```

The Worker increments ticks on its own timer. It terminalizes after a configured tick count or publishes failure after a configured failure tick.

Host status calls only observe these words. They never tell the Worker to advance.

A test-only `ready` signal separates Worker startup latency from the independent-progress assertion. Readiness itself does not advance device work or travel through the serialized owner command queue.

## Resource and command model

Each submission acquires:

- one function lease;
- one lease per memory argument, including repeated aliases;
- one private mock-event lifetime owned by the operation.

While an operation is pending, the experiment's serialized owner allows only the first-slice operation commands:

```text
submit        -> reaches the single-flight gate and rejects busy when already pending
status        -> allowed
operation-close -> allowed only to report busy while pending
runtime-close -> allowed under close semantics
legacy-timeout -> internal compatibility transition
```

Ordinary memory read/write commands—including commands targeting unrelated mock memory—are blocked at the pending-operation gate before mutation. This intentionally models the conservative SPEC-0016 v1 direction: freeing the Worker queue does not automatically widen Driver concurrency.

Pending operation close rejects busy and makes no cancellation claim.

Terminal status observation destroys the mock event, releases leases exactly once, stores an immutable terminal record, and releases the single-flight admission slot.

## Stable cases

### OPL-001 — submit returns pending

Submit resolves while the mock device remains pending.

### OPL-002 — independent progress

After explicit test-only mock readiness, ticks advance during a period in which no status/wait command is issued.

### OPL-003 — later short status commands

The serialized owner processes a status request after submission and returns pending without retaining the queue between polls.

### OPL-004 — single-flight backpressure

A second submit while pending rejects deterministically.

### OPL-005 — lease conservation

Function and repeated-memory lease counts remain exact while pending and return to zero only after terminal observation.

### OPL-006 — conservative pending-command gate

Ordinary memory read/write commands reject while any operation is pending, including access to otherwise unrelated memory. After terminality those commands are usable again.

### OPL-007 — no false cancellation

Closing a pending operation rejects busy; the mock device continues progressing without host commands.

### OPL-008 — terminalization idempotence

First terminal status destroys the mock event/releases leases exactly once. Repeated status returns an equal terminal record without another cleanup action.

### OPL-009 — completed logical resource lifetime

A terminal operation may remain queryable after mock-event cleanup and may then close its logical capability independently.

### OPL-010 — graceful runtime close

Runtime close entered with pending work may occupy the serialized owner while waiting. If work completes within its configured close bound, resources terminalize before close reports graceful.

### OPL-011 — unproved close

If work remains pending beyond the close bound, close reports restart-required/orphaned state and does not claim execution leases were normally released. Test-only Worker termination may clean the harness process but cannot change the recorded product-model claim.

### OPL-012 — legacy terminal launch deadline

A compatibility helper built from submit + later status observations returns normal terminal output when within its bound. If its legacy completion bound expires, the mock runtime moves to restart-required/orphaned state rather than returning a hidden pending operation.

### OPL-013 — controlled device failure

Mock device failure becomes a stable failed terminal record and releases leases exactly once when terminal failure is observed.

### OPL-014 — unexpected mock-device owner loss

Unexpected Worker loss before terminal publication produces orphan/restart-required state and retains unproved lease accounting in the product model.

### OPL-015 — application-loop responsiveness

Timers on the application thread continue to turn while mock device work is pending.

## Result

Protected PR #53 merge-ref workflow run `31656331994` on Ubuntu 24.04 / official Node 26.7.0 passed all stable cases, represented by nine grouped tests:

```text
tests 9
pass 9
fail 0
```

The initial hosted run falsified only a fixed Worker-startup timing assumption. The oracle was repaired by waiting for a test-only ready signal, then measuring progress across a no-host-command interval. Core behavioral assertions were unchanged.

## Reassessment

The experiment supports H1 and the conservative form of H3:

- one serialized owner is sufficient for the portable lifecycle model;
- submission can outlive the owner command;
- status can be a later short command;
- polling is not device progression;
- the first slice can safely keep ordinary Driver operations globally blocked while pending;
- therefore SPEC-0016 v1 does not need new ResourceRegistry lease-count or MemoryManager conflict APIs solely for lifecycle separation.

Richer interleaving must be added deliberately by later accepted capabilities such as #38 or #40.

## Falsifiers retained for native/production phases

Do not accept/promote the production capability if later work shows any of the following:

- CUDA device progress requires the status poll mechanism;
- the event-record boundary cannot reliably establish submission provenance;
- short status queries cannot preserve context/currentness or failure provenance;
- pending-command gating cannot be enforced without unsafe gaps;
- pending close claims cancellation/cleanup;
- terminal status repeats cleanup;
- normal runtime close tears down dependencies before terminality;
- a timeout releases unproved leases while GPU work may still be running;
- owner/context loss is reported as graceful.

## Promotion

Passing EXP-014 permits reassessment of proposed SPEC-0016. It does **not** itself accept the spec or authorize production implementation.

After the durable experiment/proposal record is merged:

1. perform exact-head review;
2. promote SPEC-0016 to `Accepted` only through a separate reviewed authority change;
3. then begin the bounded production integration work package.

## Cleanup

Every test-created Worker finishes naturally or is explicitly terminated by the test harness. Test-only termination after an orphan case is harness cleanup, not evidence that a real CUDA operation could be safely cancelled or that native resources were released.
