# EXP-014 — Operation Lifecycle Runner

**Status:** Retained bounded experiment — portable question passed

Detailed protocol: [`../EXP-014-operation-lifecycle.md`](../EXP-014-operation-lifecycle.md).

## Purpose

Validate the host/lifecycle shape that was proposed by SPEC-0016 before production execution code changed.

The experiment uses one serialized JavaScript owner queue and an independent Node Worker as a mock device. Submission returns while the Worker is still progressing. Later status calls are separate short owner commands.

SPEC-0016 is now accepted and its bounded portable/software/package implementation is integrated. It exclusively owns production submission/status/wait/close behavior, operation state, pending-command admission, legacy `launch()` compatibility, and runtime-close semantics. This retained experiment supplies regression evidence and an independently progressing mock-work harness only; it does not authorize or redefine production behavior.

The capsule covers stable cases `OPL-001` through `OPL-015`:

- early submit return;
- independent progress;
- later status observation;
- single-flight backpressure;
- repeated resource leases;
- conservative pending-command blocking;
- no false pending close/cancellation;
- idempotent terminalization;
- logical operation lifetime after event/mock cleanup;
- graceful close after bounded terminalization;
- restart-required/orphan close when terminality is unproved;
- legacy terminal-launch deadline behavior;
- controlled device failure;
- unexpected mock-device loss;
- Node event-loop responsiveness.

## Portable result

Protected PR #53 merge-ref workflow run `31656331994` executed the experiment on Ubuntu 24.04 with official Node 26.7.0.

```text
OPL-001 through OPL-015: pass
grouped tests:              9
pass:                       9
fail:                       0
```

The same `verify` run also passed the repository documentation/source-boundary checks, EXP-000 correctness/lifecycle, F3–F9 portable/readiness capsules, hardware registry checks, Node qualification checks, schema generation, and evidence artifact publication. The branch's separate `node-compatibility` workflow also passed.

The first hosted experiment run exposed a test-oracle defect rather than a lifecycle defect: a newly spawned Node Worker did not reliably begin ticking inside a fixed 20–30 ms window. The test was repaired by adding a **test-only Worker readiness signal** and then measuring progress across a period with no host status command. The core assertions—independent progress, no false cancellation, exact leases, backpressure, close/orphan truth—were not weakened.

## Reassessment result

EXP-014 supports the simplest first-slice interleaving model:

- one serialized owner;
- one pending operation;
- short submit/status commands;
- a strict pending-operation command allowlist;
- ordinary Driver/memory commands blocked globally while work is pending;
- no ResourceRegistry/MemoryManager API widening merely to separate submission from completion.

Richer concurrent access belongs to later accepted capability contracts such as #38 or #40.

## Run

```bash
npm run exp:014
```

or directly:

```bash
node --test experiments/exp-014/test/operation-lifecycle.test.mjs
```

## Claim limit

This passing result proves only that the ownership/state/interleaving model under consideration at the time was coherent in JavaScript. It does not prove CUDA launch asynchrony, event ordering, deferred-error behavior, native cleanup, overlap, performance, or native support.

The result was evidence used to reassess SPEC-0016; it did not by itself accept that specification or authorize production implementation. Accepted SPEC-0016, not EXP-014, is the current production authority.

## Cleanup

Every mock-device Worker finishes naturally or is explicitly terminated by the harness. In orphan/restart-required tests, harness termination is process hygiene only; the recorded model deliberately retains unproved logical event/lease ownership and does not reinterpret termination as safe CUDA cancellation.
