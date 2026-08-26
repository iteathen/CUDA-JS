# CUDA-JS prerequisites for consumer-neutral tensor execution

**Status:** Proposal

**Execution state:** Active parent plan under explicit project-owner authority; each production child still requires its bounded accepted contract before implementation.

**Date:** 2026-08-26

**Exact input:** protected `main@9726898d728fc6e1f1baabb5a1ddc67808549e84`, `cuda-js@0.1.0-alpha.10`

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
| `CJS-DEVICE-LIB-002` | Typed device-callable module/library composition | Integrated on PR #136 / `main@9726898d728fc6e1f1baabb5a1ddc67808549e84`; native qualification remains on #135 | SPEC-0010/SPEC-0012/SPEC-0013/SPEC-0028 | Two unrelated consumers compose declared device functions without CUDA source or private imports; exact header/module/compiler/cache identity and lifecycle fail closed. |
| `CJS-PREPARED-DAG-003` | Immutable finite prepared operation DAG baseline | Active / issue #85 | Accepted SPEC-0020 semantic baseline over SPEC-0016/SPEC-0018/SPEC-0021 | Canonical bounded kernel DAGs cross the DriverActor boundary once, preserve ordinary-operation meaning, return one opaque operation per submit, and retain exact dependency/binding/lifecycle truth. CUDA Graph realization remains proposal-only. |
| `CJS-LIB-ADAPTER-004` | Context-bound provider framework and cuBLASLt first profile | Planned | Public views and operation lifecycle | Generic provider/handle/workspace/operation lifecycle is accepted first; cuBLASLt GEMM then matches an independent oracle without exposing tensor semantics or native handles. |

Only one shared contract changes at a time. A head, accepted contract, provider identity, or public package revision change invalidates affected downstream evidence.

## Current execution packet: `CJS-PREPARED-DAG-003`

Owned operation: implement the accepted SPEC-0020 semantic prepared-kernel DAG baseline through one pure topology/identity owner and the existing execution/DriverActor lifecycle boundary.

Expected effects:

- preparation normalizes one finite immutable kernel DAG with deterministic identity and exact binding schema;
- all device-memory/view arguments carry explicit access declarations and unordered ordinary hazards fail before native work;
- one public submit becomes one DriverActor request, one private-stream sequence, one final completion event, and one SPEC-0016 operation;
- prepared resources lease function dependencies; submitted operations lease prepared and concrete binding resources through terminality;
- replay, stale/cross-runtime bindings, cycles, limits, partial submission, close, and owner-loss paths fail conservatively;
- CUDA Graph and additional operation node families remain later profiles rather than contaminating the semantic baseline.

Non-goals: tensors, NN/search policy, host or device-copy nodes, library/provider nodes, publication mailboxes, public streams/events, CUDA Graph calls, mutable topology, native qualification, or performance claims.

Rollback: retain ordinary accepted SPEC-0016/SPEC-0018 operation submission without prepared objects.

Validation: pure topology/identity controls, execution/DriverActor protocol and one-round-trip orchestration, ordinary-launch trace parity, replay/binding/hazard/lifecycle negatives, facade/TypeScript installed consumer, docs/full portable verification, exact-head review, protected PR integration, and cleanup.

## Cleanup and continuation

Each branch deletes its merged source branch/worktree when safe, leaves no generated/native artifact, updates its issue and this plan, and advances `next_step.yaml` to exactly one dependency-ready successor. Native qualification debts remain on their existing hardware issues rather than blocking portable contract work.
