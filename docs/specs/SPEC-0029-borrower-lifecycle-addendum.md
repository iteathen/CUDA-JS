# SPEC-0029 Addendum: Runtime-owned cuBLASLt borrower lifecycle

**Status:** Accepted

**Date:** 2026-09-03

**Owner:** `runtime.cuda-library-adapters`

**Parents:** accepted `SPEC-0023-context-bound-cuda-library-adapters.md`, `SPEC-0029-cublaslt-f32-matmul.md`, and `SPEC-0029-capability-projection-addendum.md`

**Issue owner:** #179

## Outcome

Correct the accepted cuBLASLt child so independent users of one `CudaRuntime` do not have to coordinate ownership or destruction of its one admitted native provider handle.

This addendum is intentionally **cuBLASLt-child-specific**. It does not create a generic provider lease API, provider registry, sharing enum, service locator, or lifecycle imposed on future CUDA library providers.

For `cublaslt-f32-row-major-matmul-v1`, one healthy runtime owns at most one underlying cuBLASLt provider handle at a time. Each call to `CudaRuntime.openCublasLt()` returns a distinct opaque public adapter capability borrowing that runtime-owned provider resource:

- the first borrower lazily creates the admitted provider/handle;
- later borrowers reuse that same underlying provider/handle without another native open;
- one borrower closing does not invalidate another borrower;
- the underlying provider/handle closes only after the last borrower closes successfully;
- after a successful final close, a later `openCublasLt()` may create a fresh provider/handle in the same healthy runtime.

`CUBLASLT_ADAPTER_ALREADY_OPEN` is no longer an ordinary public result of repeated `openCublasLt()` calls for this child.

## Resource graph and identity

The private DriverActor ownership graph is:

```text
runtime / selected device / context
  -> one cublaslt-adapter provider resource
     -> one or more cublaslt-borrow resources
        -> zero or more immutable cublaslt-matmul-plan resources
           -> ordinary operation leases
```

Each public `CudaCublasLt` object maps to exactly one private borrower capability. A plan is a child of the borrower that created it, while retaining the underlying provider identity required by SPEC-0029/SPEC-0031.

Borrow count and borrower identity are lifecycle facts only. They do not enter matrix semantics, provider compatibility identity, plan semantic identity, prepared-DAG identity, numerical results, or cache/artifact identity.

The public `CudaCublasLt` shape, provider/profile facts, plan contract, and operation contract remain otherwise unchanged.

## Borrower lifecycle

A borrower may create plans and inspect the existing bounded provider/profile facts. It never receives the native provider handle or authority to destroy it directly.

Closing a borrower:

1. rejects while that borrower still owns live plans;
2. closes only that borrower when other borrowers remain;
3. on the final borrower, closes the borrower first and then attempts the underlying provider/handle close;
4. reports success only if every required final-release effect is proved.

Plans owned by another borrower do not prevent an otherwise child-free borrower from closing. They continue to retain their own borrower and therefore retain the underlying provider resource.

Repeated close of a terminal public borrower remains deterministic under the existing public resource contract.

## Failure, owner loss, and reacquisition

Underlying provider cleanup failure on final release remains the accepted SPEC-0029 cleanup failure: cleanup is unproved, runtime health becomes `restart-required`, and a fresh borrower may not treat that provider state as clean in the same runtime epoch.

The existing resource-disposal and DriverActor owner-loss contracts remain authoritative:

- failed native destroy/library close preserves structured failure provenance;
- the underlying provider resource becomes orphaned/unproved rather than reusable;
- unexpected Worker/process loss makes provider, borrower and plan resources inaccessible/orphaned without fabricated cleanup;
- a healthy successful final close is required before same-runtime reacquisition can create a fresh underlying provider resource.

A borrower-registration failure after a newly created provider resource must either roll that provider resource back successfully or report restart-required cleanup uncertainty. Borrow creation against an already-live provider has no new native ownership to roll back.

## Concurrency and handle-state restrictions

This addendum does not make a general claim that CUDA library handles are freely shareable across threads or streams.

The accepted cuBLASLt child remains safe only inside its existing bounded owner:

- all host-side provider calls occur on the single DriverActor Worker command sequence;
- the public child exposes no mutable native handle configuration;
- plans are immutable;
- operation admission, streams, dependencies, hazards, completion, and failure remain owned by SPEC-0016/SPEC-0018/SPEC-0020/SPEC-0031 execution;
- no borrower receives a native handle or bypasses those owners.

A future provider with different handle/thread/collective semantics must define its own accepted child lifecycle. In particular, provider families whose correct use requires per-thread handles, rank/device-bound communicators, collective teardown, or asynchronous communicator finalization are not evidence for this borrower model.

## Required evidence

Portable/software/package qualification must prove at least:

- two or more public borrowers can coexist on one runtime while exactly one underlying mock/provider resource is opened;
- borrowers are distinct capabilities with the same admitted provider/profile facts;
- closing one borrower leaves another usable;
- a borrower with live plans cannot close, while a child-free sibling borrower can close;
- plans retain the borrower/provider chain through execution and prepared execution;
- the last borrower triggers exactly one underlying provider close;
- successful final close permits a later clean reacquisition and exactly one new underlying provider open;
- injected final provider-close failure is restart-required/unproved and cannot lead to a fresh clean borrow in that runtime epoch;
- owner-loss/orphan behavior remains consistent with the generic resource/DriverActor contracts;
- installed/public package consumers need no shared `WeakMap`, native handle, or private import.

Existing exact SPEC-0029 native ABI/numerical evidence remains evidence for the one underlying provider/handle. Portable borrower evidence does not create a new native concurrency, performance, thread-safety, or broader-provider claim.

## Falsifiers

Rollback this addendum if correct cuBLASLt borrowing requires public native handle state, cross-runtime sharing, a second operation lifecycle, consumer-specific reference counting, hidden provider selection, or unsafe concurrent mutation of provider state.

Do not generalize this lifecycle to another provider merely because both expose a native handle. Future provider children must independently prove their resource identity, concurrency, teardown, failure, and deletion semantics.

## Non-goals

Generic `ProviderLease`, provider registries, provider sharing enums, cross-runtime/process sharing, eager provider creation, Tensor/NN/search policy, hidden workspace allocation, new matmul operations, CUDA Graph work, performance tuning, or any change to CUDA-MCGS #122.