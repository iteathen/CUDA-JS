# EXP-014 — Submission/Completion Operation Lifecycle

**Status:** Active bounded experiment

**Date:** 2026-08-12

## Question

Can CUDA-JS preserve one serialized Driver owner while allowing independently progressing device work to outlive the submission command, with exact operation state, resource leases, interleaving conflicts, terminalization, legacy deadline behavior, and close truth?

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

A submit command can return after provenance is established; an independently progressing device owner can continue while later short status commands observe it. Leases and conflict rules can remain deterministic without another host Worker owning the CUDA context.

### H2 — polling command must remain alive

If operation progress, lease conservation, terminalization, or safe close requires the original host command to stay active, SPEC-0016's selected model is falsified.

### H3 — early return makes ordinary memory operations unsafe/uncontrollable

If an execution lease cannot deterministically block host read/write/release operations while preserving later terminal cleanup, the selected interleaving model is insufficient.

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

## Resource model

Each submission acquires:

- one function lease;
- one lease per memory argument, including repeated aliases;
- one private mock-event lifetime owned by the operation.

A pending memory lease rejects ordinary host `read` and `write` in this experiment. Pending operation close rejects busy and makes no cancellation claim.

Terminal status observation destroys the mock event, releases leases exactly once, stores an immutable terminal record, and releases the single-flight admission slot.

## Required cases

### OPL-001 — submit returns pending

Submit resolves while the mock device state remains pending.

### OPL-002 — independent progress

Ticks advance during a period in which no status/wait command is issued.

### OPL-003 — later short status commands

The serialized owner processes a status request after submission and returns pending without retaining the queue between polls.

### OPL-004 — single-flight backpressure

A second submit while pending rejects deterministically.

### OPL-005 — lease conservation

Function and repeated-memory lease counts remain exact while pending and return to zero only after terminal observation.

### OPL-006 — memory transfer conflict

Ordinary host read/write of execution-leased memory rejects before mutation. Unleased memory remains usable.

### OPL-007 — no false cancellation

Closing a pending operation rejects busy; the mock device continues progressing.

### OPL-008 — terminalization idempotence

First terminal status destroys the mock event/releases leases exactly once. Repeated status returns byte-equivalent terminal data without another cleanup action.

### OPL-009 — completed logical resource lifetime

A terminal operation may remain queryable after native/mock-event cleanup and may then close its logical capability independently.

### OPL-010 — graceful runtime close

Runtime close entered with pending work may occupy the serialized owner while waiting. If work completes within its configured close bound, resources terminalize before close reports graceful.

### OPL-011 — unproved close

If work remains pending beyond the close bound, close reports restart-required/orphaned state and does not claim execution leases were normally released. Test-only Worker termination may then clean the harness process but cannot change the recorded product-model claim.

### OPL-012 — legacy terminal launch deadline

A compatibility helper built from submit + later status observations returns normal terminal output when within its bound. If its legacy completion bound expires, the mock runtime moves to restart-required/orphaned state rather than returning a hidden pending operation.

### OPL-013 — controlled device failure

Mock device failure becomes a stable failed terminal record and releases leases exactly once when terminal failure is observed.

### OPL-014 — unexpected mock-device owner loss

Unexpected Worker loss before terminal publication produces orphan/restart-required state and retains unproved lease accounting in the product model.

### OPL-015 — application-loop responsiveness

Timers on the application thread continue to turn while mock device work is pending.

## Falsifiers

Do not accept SPEC-0016 if the experiment shows any of the following:

- device progress requires status polling;
- submit cannot return before terminality;
- status requires holding the serialized owner continuously;
- a second submit enters despite the single-flight gate;
- repeated memory aliases lose lease count;
- host memory transfer can mutate execution-leased memory;
- pending close claims cancellation/cleanup;
- terminal status repeats cleanup;
- normal runtime close tears down dependencies before terminality;
- a timeout releases unproved leases while the operation may still be running;
- unexpected Worker loss is reported as graceful.

## Promotion

Passing EXP-014 permits reassessment of proposed SPEC-0016. It does **not** itself accept the spec or authorize production implementation.

After passing:

1. record exact experiment evidence in its README/result note;
2. reassess SPEC-0016 against any failures/repairs;
3. promote SPEC-0016 to `Accepted` only through a reviewed authority change;
4. then begin the bounded production integration work package.

## Cleanup

Every test-created Worker is explicitly completed or terminated by the test harness. Test-only termination after an orphan case is harness cleanup, not evidence that a real CUDA operation could be safely cancelled or that native resources were released.
