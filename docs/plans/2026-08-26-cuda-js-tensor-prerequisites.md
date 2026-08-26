# CUDA-JS prerequisites for consumer-neutral tensor execution

**Status:** Proposal

**Execution state:** Active parent plan under explicit project-owner authority; each production child still requires its bounded accepted contract before implementation.

**Date:** 2026-08-26

**Exact input:** protected `main@20f831cc51766aee726313f7f78819b576d56307`, `cuda-js@0.1.0-alpha.15`; SPEC-0031 integrated on PR #146 and issue #145 is closed.

## Objective and authority

Supply five generic CUDA-JS mechanisms needed by CUDA-JS-Tensor without importing tensor, neural-network, training, search, or first-consumer semantics into `cuda-js`:

1. public typed bounded device views;
2. typed device-callable library composition;
3. prepared finite operation DAGs;
4. context-bound CUDA library adapters, beginning with a bounded cuBLASLt profile;
5. an additive dense numeric Device-JS profile for the already public `f64`/`f16`/`bf16` ABI kinds.

The project owner explicitly authorized implementation of broadly reusable primitives and selected CUDA-JS-Tensor as a separate public repository. `the_restaurant` integration is deferred and is not an input, dependency, write surface, or evidence source for this plan.

## Critical assessment

The strongest challenge is that the five needs could be mistaken for one tensor stack and create a generic facade over unrelated owners. They are instead independent lifecycle and compatibility boundaries: memory interpretation, compiler composition, execution preparation, context-bound provider calls, and dense device-language numerics. Combining them would couple rollback, qualification, and evolution; implementing them through consumer workarounds would leak private CUDA-JS state.

Disposition: **proceed as five serial capability branches plus one bounded integration child**, accepting and implementing one public contract at a time. Portable/software/package evidence may integrate independently. Native and performance promotion remain exact-profile gates.

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
| `CJS-PREPARED-DAG-003` | Immutable finite prepared operation DAG baseline | Integrated on PR #137; PR #143 / `main@3a29b65a4ae736923dbde432356a7aad31059fc0` closed #142 with native discovery-profile projection and exact installed-package parity; native CUDA Graph realization remains on #85 | Accepted SPEC-0020 semantic baseline over SPEC-0016/SPEC-0018/SPEC-0021 | Canonical bounded kernel DAGs cross the DriverActor boundary once, preserve ordinary-operation meaning, return one opaque operation per submit, and retain exact dependency/binding/lifecycle truth. Alpha.14 projects native discovery data to the exact identity profile and adds exact recorded-profile native parity; CUDA Graph realization remains proposal-only. |
| `CJS-LIB-ADAPTER-004` | Context-bound provider framework and cuBLASLt first profile | Integrated on PR #138 / `main@2da65ff2e4287450171c477031dd380a21fa095f`; issue #90 closed | Public views and operation lifecycle | Generic provider/handle/workspace/operation lifecycle is accepted first; cuBLASLt GEMM then matches an independent oracle without exposing tensor semantics or native handles. |
| `CJS-DEVICE-NUMERIC-005` | Additive dense numeric Device-JS profile | Integrated on PR #140 / `main@b78f3fc37e20381d950d3297861c877b71f15390`; issue #139 closed | SPEC-0013, SPEC-0021, SPEC-0028 and exact compiler header ownership | Legacy Device-JS bytes/identity remain exact; `f64`/`f16`/`bf16` pointers, locals, functions, kernel scalars, exact casts and special-value math compile through public contracts; two unrelated installed consumers and an independent native oracle pass. |
| `CJS-PREPARED-CUBLASLT-006` | Bounded fixed-plan cuBLASLt f32 node in semantic prepared DAGs | Integrated on PR #146 / `main@20f831cc51766aee726313f7f78819b576d56307`; issue #145 closed | SPEC-0020, SPEC-0023, SPEC-0029 | Installed public consumer composes kernel → cuBLASLt → kernel in one request/stream/event/operation, with derived library accesses, exact legacy kernel identity, plan/view/workspace leases, conservative partial failure, and zero cleanup residue. |

## Completed execution packet: `CJS-PREPARED-CUBLASLT-006`

Owned operation: compose one fixed SPEC-0029 plan node with accepted prepared kernel nodes while preserving the existing execution lifecycle and leaving tensor scheduling/policy in CUDA-JS-Tensor.

The execution owner retains topology, binding resolution, concrete hazards, the private stream, final event, whole-DAG operation, terminality, and restart-required partial-submission truth. The library owner retains plan/provider identity, f32 view and workspace validation, derived A/B/C-read/D-write/workspace-read-write ranges, and native enqueue. Their connection is a private initialization-time port for one accepted node family, not a public provider registry. Kernel-only contract and identity remain byte-for-byte unchanged.

Acceptance requires focused negative/lifecycle tests, clean installed-package portable replay, the exact Windows CUDA 13.3/cuBLASLt 13.5.1 mixed kernel/library fixture with independent SPEC-0029 numerical evidence, exact Node 26.7.0 full verification, author review of one frozen head, protected integration, and cleanup. No Linux, broader provider, CUDA Graph, tensor-core, batching, multi-GPU, or performance claim is inferred.

Integrated on protected main through PR #146 at `20f831cc51766aee726313f7f78819b576d56307`; issue #145 closed. Exact Node 26.7.0 full verification, the published-package portable surface, all GitHub checks, and the installed-package Windows CUDA 13.3/compute_75/GTX 1660 Ti/cuBLASLt 13.5.1 three-node mixed fixture passed. The fixture reported one `prepared-batch`, exact numerical output, graceful teardown, and zero live/orphaned resources. Complete author-side review used the documented sole-maintainer exception; no independent-review claim is made.

Only one shared contract changes at a time. A head, accepted contract, provider identity, or public package revision change invalidates affected downstream evidence.

## Completed execution packet: `CJS-PREPARED-DAG-003`

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

Integrated on protected main through PR #137. PR #143 / alpha.14 subsequently corrected native discovery-profile projection and proved exact installed-package semantic replay/result/cleanup parity on the recorded Windows profile. Issue #85 now owns optional CUDA Graph realization, later node/update profiles, broader native cells, and performance methodology rather than the completed semantic kernel-DAG baseline.

## Completed execution packet: `CJS-LIB-ADAPTER-004`

Owned operation: accept the generic context-bound provider framework and one concrete cuBLASLt f32 row-major matmul child without importing tensor, NN, training, or application policy.

Expected effects:

- optional provider discovery remains lazy and exact-profile pinned;
- one DriverActor-owned adapter owns provider/handle lifetime and immutable plans;
- plans consume allocation-owned typed views, finite semantic dimensions/transposes, and explicit bounded workspace;
- library work uses the existing scheduler, dependency/hazard rules, event terminality, opaque operation, and cleanup owner;
- the public surface exposes neither native paths, handles, descriptors, algorithms, enums, streams, events, nor arbitrary options;
- exact Windows ABI/numerical/public-lifecycle evidence is separated from portable/package evidence and Linux remains unqualified.

Non-goals: tensors, shapes/strides beyond the named contiguous profile, broadcasting, batches, mixed dtypes, epilogues, cuDNN, training, hidden workspace allocation, CUDA Graph realization, and performance claims.

Falsifier: eager provider dependency, a second scheduler/completion owner, public native controls, unbounded workspace, wrong-runtime/view admission, ambiguous partial-submission or cleanup truth, or a profile that cannot survive deletion of CUDA-JS-Tensor.

Rollback: retain accepted typed views, prepared execution, and ordinary kernels while removing the SPEC-0029 child; the accepted SPEC-0023 framework may remain only if another concrete finite child still falsifies it.

Validation: exact Node 26.7.0 portable contract/negative/package tests; selected provider/header identity; independent C++ ABI/layout/numerical oracle; public native parity and teardown on the same profile; missing/wrong-provider controls; full repository verification; exact-head author review; protected PR integration; issue and cleanup reconciliation.

Integrated on protected main through PR #138. Issue #90 is closed. The exact reviewed tree remains preserved by the protected squash merge; Linux, other providers/dtypes/layouts, tensor semantics and performance remain separately gated.

## Completed execution packet: `CJS-DEVICE-NUMERIC-005`

Owned operation: implement accepted SPEC-0030 as one additive Device-JS/compiler-profile change without importing tensor operations or application policy.

Expected effects:

- unchanged legacy Device-JS requests retain their exact contract, generated bytes and identity;
- dense requests admit `f64`, `f16` and `bf16` metadata, pointers, locals, device calls and kernel ABI kinds;
- exact constructors, casts, arithmetic, comparison, special constants, abs/NaN classification and explicit numeric versus NaN-propagating min/max lower through pinned CUDA 13.3 semantics;
- `cuda-numeric` and composite `cuda-device` virtual-header profiles are verified before cache lookup and compose naturally with scoped atomics;
- package declarations/compatibility and installed consumers expose the generic mechanism only;
- native qualification uses one exact public-path fixture, an independent oracle and terminal cleanup on the recorded Windows profile, without promoting Linux or performance.

Current evidence: focused compiler/translator tests, both unrelated installed portable consumers, documentation validation, the full exact-Node repository gate, F8 package verification, and complete non-independent author review pass on the frozen candidate tree. The installed-package Windows CUDA 13.3/compute_75/GTX 1660 Ti fixture matches a separately compiled CUDA C++ oracle for mixed `f64`/`f16`/`bf16` values, casts, arithmetic, signed zero, NaN propagation and math, with graceful CompilerActor/DriverActor teardown and zero live/orphaned resources. The oracle exposed and caused correction of operand-order-dependent signed-zero lowering before acceptance. Independent review was waived under the documented sole-maintainer exception. Protected PR #140 integrated the exact reviewed tree and closed issue #139.

Non-goals: tensor shapes/operations, executor generation, NN/training/search policy, new atomics, vectors, fast math, FP8, CUDA Graphs, arbitrary headers/options or broader support claims.

Falsifier: any changed legacy identity/byte fixture; ambient header discovery; implicit `f32` approximation presented as half/bfloat semantics; unbounded or consumer-owned CUDA; new-kind atomic admission; incompatible profile reaching CompilerActor; or native results without independent expected values and cleanup.

Rollback: remove the additive SPEC-0030 contract and numeric header profiles while retaining SPEC-0021 public ABI/views, legacy SPEC-0013 Device-JS and all integrated prerequisite branches.

Validation: focused translator/header/profile/facade/package tests; legacy golden identity/byte controls; two unrelated installed numerical consumers; exact Node 26.7.0 full verification; independent native mixed-dtype oracle/public fixture; exact-head author review; protected PR integration; issue and cleanup reconciliation.

## Cleanup and continuation

Each branch deletes its merged source branch/worktree when safe, leaves no generated/native artifact, updates its issue and this plan, and advances `next_step.yaml` to exactly one dependency-ready successor. Native qualification debts remain on their existing hardware issues rather than blocking portable contract work.
