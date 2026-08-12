# EXP-013 — Detached Operation + Shared Publication Mailbox

**Status:** Active bounded experiment

## Question

Can CUDA-JS model the host-visible semantics required by SPEC-0014 before any CUDA host-registration/mapping claim exists?

Specifically, can one opaque operation return while independently progressing work continues, exchange bounded atomic publication words through a `SharedArrayBuffer`, enforce one-writer lane direction and generation safety, retain mailbox leases through terminality, and fail honestly on attempted close/cancellation?

## Isolation

This experiment is pure JavaScript and uses a Node Worker as the **mock device**. It does not load CUDA, register host memory, create a CUDA context, launch a GPU kernel, or establish native support/performance.

The Worker exists only to prove the host/control/lifecycle contract can function without making host polling responsible for work progression.

## Model

- publication lanes are `u32` words over one `SharedArrayBuffer`;
- lane direction is `host-to-device` or `device-to-host`;
- host API uses `Atomics.load/store`;
- mock-device API in the Worker uses the same atomic cells from the opposite side;
- mailbox generation is captured by each operation;
- operation holds one mailbox lease until Worker terminality;
- operation status is nonblocking;
- pending close reports busy rather than claiming cancellation;
- mailbox reset/close rejects while leased.

## Fixture

The mock device increments one device-to-host observation lane independently. A host-to-device multiplier lane changes how quickly the observation grows. A host-to-device stop lane cooperatively terminates the mock device.

The host test:

1. starts the detached operation and immediately gets an operation object;
2. proves the observation changes before any status/wait call;
3. updates the multiplier while work remains active;
4. reads observation while work is active;
5. verifies stale-generation and lane-direction rejections;
6. verifies pending operation/mailbox close cannot claim cancellation/cleanup;
7. publishes cooperative stop;
8. waits terminally;
9. verifies lease release permits reset/close.

## Promotion/disposition

Success promotes only the **portable semantic shape** into further SPEC-0014/native planning. Native production remains blocked on the exact CUDA mapping/publication evidence listed in the spec.

If the experiment requires host polling to progress work, permits publication direction violations, cannot conserve leases, or cannot separate pending close from cancellation, the selected design is falsified before native work.
