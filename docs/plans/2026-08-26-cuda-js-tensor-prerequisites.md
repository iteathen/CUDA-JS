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
| `CJS-TENSOR-VIEW-001` | Public opaque contiguous typed-view capability | Integrated on PR #134 / `main@991330ffda926e052c857cd6a3f5bdcc37f47034` | Accepted SPEC-0021 component | Installed consumer can create, inspect, use and close a view through package exports; parent/view/operation leases and range/access failures are exact. Falsified by pointer/token escape, unbounded launch use, or cleanup ambiguity. |
| `CJS-DEVICE-LIB-002` | Typed device-callable module/library composition | Active / issue #135 | SPEC-0010/SPEC-0012/SPEC-0013/SPEC-0028 | Two unrelated consumers compose declared device functions without CUDA source or private imports; exact header/module/compiler/cache identity and lifecycle fail closed. |
| `CJS-PREPARED-DAG-003` | Immutable finite prepared operation DAG baseline | Planned | SPEC-0016/SPEC-0018/SPEC-0019 | Ordinary-operation semantic parity, bounded nodes/edges/bindings/resources, one opaque operation per submit, and terminal invalidation/cleanup. CUDA Graph realization remains a qualified adapter. |
| `CJS-LIB-ADAPTER-004` | Context-bound provider framework and cuBLASLt first profile | Planned | Public views and operation lifecycle | Generic provider/handle/workspace/operation lifecycle is accepted first; cuBLASLt GEMM then matches an independent oracle without exposing tensor semantics or native handles. |

Only one shared contract changes at a time. A head, accepted contract, provider identity, or public package revision change invalidates affected downstream evidence.

## Current execution packet: `CJS-DEVICE-LIB-002`

Owned operation: implement accepted SPEC-0028 as a pure Device-JS semantic/library layer orchestrated through the existing CompilerActor compile/link facade.

Expected effects:

- `compileDeviceLibrary()` compiles device-only Device-JS source to one copied typed RDC or LTO library record;
- export symbols derive deterministically from semantic identity and cannot be supplied by callers;
- `compileDeviceProgram()` accepts bounded explicit aliased imports, snapshots and validates libraries before compiling the program unit, and returns the final cubin linker result;
- existing CompilerActor artifact/provider/cache/failure/cleanup ownership is reused unchanged;
- the no-import Device-JS path remains byte-for-byte compatible;
- package/compatibility identity advances additively.

Non-goals: tensors, NN/search policy, arbitrary CUDA/native symbols or flags, nested libraries, dynamic loading, overloads, native qualification, or performance claims.

Rollback: retain existing direct CUDA artifact linking and single-unit Device-JS without the new library/import facade.

Validation: Device-JS semantic/identity/mutation tests, CompilerActor PTX/LTO orchestration, facade/TypeScript and two unrelated package consumers, docs validation, full portable verification, exact-head review, protected PR integration, and cleanup.

## Cleanup and continuation

Each branch deletes its merged source branch/worktree when safe, leaves no generated/native artifact, updates its issue and this plan, and advances `next_step.yaml` to exactly one dependency-ready successor. Native qualification debts remain on their existing hardware issues rather than blocking portable contract work.
