# EXP-014 — Operation Lifecycle Runner

**Status:** Active bounded experiment

Detailed protocol: [`../EXP-014-operation-lifecycle.md`](../EXP-014-operation-lifecycle.md).

## Purpose

Validate the host/lifecycle shape proposed by SPEC-0016 before production execution code changes.

The experiment uses one serialized JavaScript owner queue and an independent Node Worker as a mock device. Submission returns while the Worker is still progressing. Later status calls are separate short owner commands.

The capsule covers stable cases `OPL-001` through `OPL-015`:

- early submit return;
- independent progress;
- later status observation;
- single-flight backpressure;
- repeated resource leases;
- conservative pending-command blocking;
- no false pending close/cancellation;
- idempotent terminalization;
- logical operation lifetime after native/mock cleanup;
- graceful close after bounded terminalization;
- restart-required/orphan close when terminality is unproved;
- legacy terminal-launch deadline behavior;
- controlled device failure;
- unexpected mock-device loss;
- Node event-loop responsiveness.

## Run

```bash
npm run exp:014
```

or directly:

```bash
node --test experiments/exp-014/test/operation-lifecycle.test.mjs
```

## Claim limit

A passing result proves only that the proposed ownership/state/interleaving model is coherent in JavaScript. It does not prove CUDA launch asynchrony, event ordering, deferred-error behavior, native cleanup, overlap, or performance.

Native qualification remains separately required after SPEC-0016 acceptance and production integration.

## Cleanup

Every mock-device Worker finishes naturally or is explicitly terminated by the harness. In orphan/restart-required tests, harness termination is process hygiene only; the recorded model deliberately retains unproved logical event/lease ownership and does not reinterpret termination as safe CUDA cancellation.
