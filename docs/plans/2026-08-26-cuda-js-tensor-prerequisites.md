# CUDA-JS prerequisites for consumer-neutral tensor execution

**Status:** Proposal

**Execution state:** Active parent plan under explicit project-owner authority; each production child still requires its bounded accepted contract before implementation.

**Date:** 2026-08-26

**Exact input:** protected `main@0a7cf198dd3d4f07768133d167fc37f2e30cdcd3`, `cuda-js@0.1.0-alpha.8`

## Objective and authority

Supply four generic CUDA-JS mechanisms needed by CUDA-JS-Tensor without importing tensor, neural-network, training, search, or first-consumer semantics into `cuda-js`:

1. public typed bounded device views;
2. typed device-callable library composition;
3. prepared finite operation DAGs;
4. context-bound CUDA library adapters, beginning with a bounded cuBLASLt profile.

The project owner explicitly authorized implementation of broadly reusable primitives and selected CUDA-JS-Tensor as a separate public repository. `the_restaurant` integration is deferred and is not an input, dependency, write surface, or evidence source for this plan.

## Critical assessment

The strongest challenge is that the four needs could be mistaken for one tensor stack and create a generic facade over unrelated owners. They are instead independent lifecycle and compatibility boundaries: memory interpretation, compiler composition, execution preparation, and context-bound provider calls. Combining them would couple rollback, qualification, and evolution; implementing them through consumer workarounds would leak private CUDA-JS state.

Disposition: **proceed as four serial focus branches**, accepting and implementing one public contract at a time. Portable/software/package evidence may integrate independently. Native and performance promotion remain exact-profile gates.

## Shared invariants

- The published core remains application-neutral.
- Every raw address, context, stream, provider object, generated CUDA source, and actor token remains private.
- One DriverActor owns context-dependent resources and terminal cleanup.
- SPEC-0016/SPEC-0018 remain the operation lifecycle and scheduling owners.
- Convenience normalizes to one explicit finite contract; no ambient discovery or arbitrary native controls.
- Each branch remains coherent if CUDA-JS-Tensor is deleted.
- No branch claims native support or performance from portable mocks.

## Focus branches

| ID | Output | Status | Dependency | Acceptance / falsifier |
|---|---|---|---|---|
| `CJS-TENSOR-VIEW-001` | Public opaque contiguous typed-view capability | Active | Accepted SPEC-0021 component | Installed consumer can create, inspect, use and close a view through package exports; parent/view/operation leases and range/access failures are exact. Falsified by pointer/token escape, unbounded launch use, or cleanup ambiguity. |
| `CJS-DEVICE-LIB-002` | Typed device-callable module/library composition | Planned | SPEC-0010/SPEC-0012/SPEC-0013 | Two unrelated consumers compose declared device functions without CUDA source or private imports; exact header/module/compiler/cache identity and lifecycle fail closed. |
| `CJS-PREPARED-DAG-003` | Immutable finite prepared operation DAG baseline | Planned | SPEC-0016/SPEC-0018/SPEC-0019 | Ordinary-operation semantic parity, bounded nodes/edges/bindings/resources, one opaque operation per submit, and terminal invalidation/cleanup. CUDA Graph realization remains a qualified adapter. |
| `CJS-LIB-ADAPTER-004` | Context-bound provider framework and cuBLASLt first profile | Planned | Public views and operation lifecycle | Generic provider/handle/workspace/operation lifecycle is accepted first; cuBLASLt GEMM then matches an independent oracle without exposing tensor semantics or native handles. |

Only one shared contract changes at a time. A head, accepted contract, provider identity, or public package revision change invalidates affected downstream evidence.

## Current execution packet: `CJS-TENSOR-VIEW-001`

Owned operation: accept the SPEC-0021 public-surface addendum and wire the existing `DeviceViewManager` through DriverActor and `runtime.facade`.

Expected effects:

- `CudaDeviceMemory.view({ dtype, elementCount, byteOffset?, access? })` creates one opaque logical child;
- a `CudaDeviceView` exposes only immutable dtype/range/access facts plus status/close;
- existing `device-memory` pointer parameters accept a view through a private actor translation;
- view launch use requires an explicit access record, is bounded to the view range, and cannot exceed its declared access role;
- operation terminality retains both view and allocation leases;
- package/compatibility identity advances additively.

Non-goals: multidimensional layout, typed host arrays, tensor algebra, implicit kernel bounds, automatic access inference, native qualification, or library-provider implementation.

Rollback: retain the already implemented internal SPEC-0021 component without a public facade, package change, or execution binding.

Validation: component boundary/property/lifecycle tests, DriverActor protocol tests, execution rollback/terminality tests, facade/TypeScript/package consumers, docs validation, full portable verification, exact-head review, protected PR integration, and cleanup.

## Cleanup and continuation

Each branch deletes its merged source branch/worktree when safe, leaves no generated/native artifact, updates its issue and this plan, and advances `next_step.yaml` to exactly one dependency-ready successor. Native qualification debts remain on their existing hardware issues rather than blocking portable contract work.
