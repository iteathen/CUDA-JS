# SPEC-0031: Prepared cuBLASLt f32 matmul node

**Status:** Accepted

**Version:** SPEC-0031-v1

**Date:** 2026-08-26

**Issue owner:** #145

## Outcome

Add one bounded `cublaslt-f32-matmul` node family to the existing SPEC-0020 semantic prepared-operation DAG. This child composes the accepted SPEC-0029 plan with kernel nodes under one DriverActor request, one private stream, one final event, and one ordinary whole-DAG operation. It does not add tensor semantics, a second scheduler, CUDA Graph realization, or public native control.

## Contract

A public node contains exactly:

```text
id
kind = "cublaslt-f32-matmul"
after? = bounded predecessor IDs
plan = one same-runtime CudaCublasLtMatmulPlan
a/b/c/d = named binding references
alpha/beta? = finite f32 values or named f32 binding references
workspace? = one named binding reference exactly when the fixed plan requires workspace
```

The plan is fixed for the prepared capability lifetime. Its public SPEC-0029 contract, dimensions, transpose choices, workspace ceiling/requirement, operand element requirements, and sanitized provider identity enter prepared semantic identity. A/B/C/D and workspace bindings retain the existing `device-memory` binding kind so one typed view can be shared naturally with adjacent kernel nodes. At submission each library operand must resolve to a same-runtime device view; A/B/C/D must be contiguous `f32` views with sufficient elements and compatible read/write roles. Workspace must be a sufficiently large read-write view at a 256-byte-aligned offset.

The library owner derives these accesses from the fixed plan:

```text
A/B/C: read
D:     write
workspace when present: read-write
```

The caller cannot supply or weaken library-node accesses. Concrete ranges join the existing SPEC-0018 unordered-conflict, external predecessor, lease, backpressure, and failure checks before native submission.

Alpha defaults to f32 `1`; beta defaults to f32 `0`. Fixed values use exact packed f32 identity. Named scalar values are validated on every replay.

## Bounds and lifecycle

The existing ceilings remain unchanged: one through 32 total nodes, at most 64 edges, at most 64 named bindings, and at most eight predecessors per node. Kernel-only DAGs retain the exact `SPEC-0020-prepared-kernel-dag-v1` contract, canonical identity, public descriptors, and generated command bytes. A DAG containing this child uses:

```text
SPEC-0020-prepared-kernel-dag-v1+SPEC-0031-prepared-cublaslt-f32-matmul-node-v1
```

Preparation leases every referenced plan. Submission leases the prepared capability and concrete bindings through terminal completion. Canonical topological order is enqueued on the execution owner's one private stream. The adapter owner performs each library enqueue on that supplied stream. One final event and one opaque `prepared-batch` operation cover the entire sequence. A failure after any node may have entered the stream is restart-required under the existing conservative partial-submission rule.

The node-family port is private and installed exactly during DriverActor composition. It is not a dynamic public registry and does not admit arbitrary library calls.

## Evidence and claim limits

Portable and installed-package tests must cover mixed kernel → cuBLASLt → kernel submission, numerical output, replay identity, fixed/named scalars, plan and view leases, workspace rules, cross-runtime/stale/wrong-type rejection, concrete hazards, partial submission, and terminal cleanup. Native qualification requires the public installed-package path on one exact admitted provider/device profile plus independent SPEC-0029 numerical evidence.

Passing semantic replay does not prove CUDA Graph use or performance. Exact Windows evidence does not qualify Linux, other providers, other dtypes/layouts, tensor cores, batched GEMM, epilogues, multi-GPU execution, or any broader node family.

## Non-goals

- tensor shapes, broadcasting, fusion, batching, autograd, NN or search policy;
- arbitrary provider nodes or user-defined enqueue callbacks;
- public streams, events, handles, algorithms, descriptors, pointers or provider paths;
- mutable plans/topology or hidden workspace allocation;
- CUDA Graph realization or a performance claim.

## Falsifier and rollback

Reject this profile if it changes kernel-only identity, creates a second lifecycle/scheduler, accepts caller-written library accesses, permits an unleased plan/view/workspace, leaks native state, or cannot report partial submission conservatively.

Rollback removes only the SPEC-0031 node family and package projection. SPEC-0020 kernel-only DAGs and ordinary SPEC-0029 operations remain unchanged.
