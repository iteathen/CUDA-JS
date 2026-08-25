# CUDA-JS Agent Entry Point

Read this file before changing the repository.

## Authority order

1. Explicit current project-owner instruction.
2. This file and `agent_files/AGENTS.md`.
3. Accepted ADRs under `docs/decisions/`.
4. Accepted specifications under `docs/specs/`.
5. The accepted project charter.
6. Application-specific agent guidance and validation policy.
7. Architecture proposals and research notes.
8. Plans, experiments, status packets, and summaries.
9. Archived or superseded material.

A plan, issue, experiment, branch name, or dependency-ready label organizes work beneath accepted authority. Stop when a conflict changes ownership, public contracts, ABI, safety, resource/lifetime behavior, compatibility, evidence, or cleanup.

## Mandatory startup

1. Read this file, `agent_files/AI_RULES.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`.
2. Identify the exact work package, experiment, contract, target paths, and claim.
3. Read the owning accepted ADR/specification and only objectively triggered supporting doctrine under `agent_files/general_foundation/`.
4. Inspect exact Git state, generated artifacts, environment capabilities, and unrelated work.
5. Establish the smallest coherent outcome, decisive falsifier, and validation/cleanup/handoff reserve.
6. Do not broaden implementation beyond the dependency-ready accepted boundary.

## Design hierarchy

```text
platform truth and accepted authority
  -> purpose, support bounds and contextual value ordering
  -> domain-appropriate ranges / identities / schemas / lifecycles
  -> LEGO component and public-contract boundaries
  -> SOLID internal responsibilities
  -> CUPID composability and developer clarity
  -> KISS after the total lifecycle is sound
  -> independent evidence, cleanup and evolution
```

Correctness, safety, lifecycle truth, recoverability and compatibility are gates; performance and simplicity cannot buy them away.

## Non-negotiable boundaries

- The published `cuda-js` package is a generic Node/CUDA runtime/toolchain. It contains no MCGS, minimax, graph-search, game, tensor, model, training, optimizer, evaluator, or application scheduler semantics.
- **ADR-0004 and SPEC-0027** authorize an optional application-neutral NN product only as a **separate future publish unit in the same repository**. Its package name and directory remain unselected. Every `nn.*` production boundary requires its own accepted child specification.
- The first consumer cannot define foundational schema, memory, launch, error, or lifetime contracts.
- Version zero is Node-FFI-first and ships no CUDA-JS project-specific compiled addon. Custom AsmJit/register stubs remain a deferred measured-gap option.
- The canonical source-architecture description is **JavaScript-authored and JIT/native-realized**. Maintained core runtime source is JavaScript; Node/native CUDA libraries and generated device artifacts realize execution; C/C++ probes/oracles remain independent evidence rather than package runtime. Do not use unqualified “pure JavaScript” as normative wording or introduce a maintained native host backend without an accepted measured-gap decision under ADR-0005.
- A `fast-jit-required` claim requires exact-profile qualification evidence; generic fallback is allowed only in a declared cold/bootstrap profile.
- Generated header/ABI facts and curated semantic/lifecycle overlays are separate owners. Unknown public semantics fail closed.
- Node FFI and raw native/device memory remain private. JavaScript receives opaque capabilities and bounded data.
- `cuGetProcAddress` may verify version/status/semantics, but v0 invokes only approved named exports unless a separately qualified capability says otherwise.
- NVRTC compiles device code, not the Node host bridge. Host binding and device compilation/linking have separate owners/cache identities.
- One DriverActor Worker owns one private context and every raw Driver resource by default. Context-dependent work stays on that owner.
- Potentially blocking compile/link/native work never runs on the application event loop.
- Device, staged, pinned, mapped, managed, external and mock memory are distinct capabilities; none is marketed generically as zero-copy.
- Every library, actor, context, allocation, module, function, stream, event, operation, compiler/linker object, logical view, cache entry and artifact has one owner and terminal disposition.
- Errors distinguish validation, unsupported capability, pressure/backpressure, stale resource, immediate/deferred native failure, suspect/poisoned context, closed runtime and restart-required/orphan truth.
- Mocks validate only the lifecycle/orchestration they execute; they do not prove native ABI, CUDA ordering, overlap, performance, platform support or consumer semantics.
- Architectural disposition, implementation status, qualification/support status and priority are independent. Follow `agent_files/general_foundation/STATUS_SEMANTICS.md`.
- No native/platform/performance claim exceeds exact independent evidence for the exact revision/profile.

## Current accepted implementation baseline

Protected `main` immediately before issue #123 is:

```text
2135216b1a9fd88066a1c82b61ae533645eac9c2
cuda-js@0.1.0-alpha.6
```

Issue #123's accepted device-publication branch advances the additive prerelease identity to `cuda-js@0.1.0-alpha.7` without changing public API schema version 1.

The repository is in an **active implementation phase**. Accepted and implemented portable/software/package paths include the historical Windows foundation plus current generic capabilities.

Durable historical anchors retained for validation and provenance:

- `CJS-F1A / EXP-000` is the accepted synthetic Node-FFI foundation and remains a regression capsule.
- `CJS-F1B` owns pinned header facts, generated ABI products and independent native layout probes.
- `CJS-F2W / EXP-012` is the accepted Windows Driver bootstrap/native-smoke foundation.
- Windows `CJS-F3W` through `CJS-F7W` and `CJS-F8W` remain accepted historical implementation/evidence owners.
- `EXP-001` remains the native Linux x86-64 preparation/qualification handoff; its portable preparation is not Linux Driver support.

Current accepted portable/software/package capabilities additionally include:

```text
SPEC-0010 typed relocatable device code
SPEC-0011 u64 / i32 / finite-only f32 scalar arguments
SPEC-0012 typed Device LTO
SPEC-0013 restricted Device-JS
SPEC-0022 bounded scoped-atomic-observation and device-publication children
SPEC-0016 opaque one-pending-operation lifecycle
SPEC-0006 target-syntax correction
SPEC-0003 disposal-failure correction
```

Exact native promotion gates for additive capabilities remain independent unless their exact evidence is integrated and published.

## 2026-08-14 foundation authority

The open-issue sweep reviewed the first dependency-ready expansion contracts against current authority and primary CUDA 13.3 documentation.

- `SPEC-0017` is **Accepted**: sanitized opaque device discovery/selection, one selected device per runtime, and selected-device-driven target resolution. Production portable/software implementation is authorized; native/multi-device qualification remains open.
- `SPEC-0021` is **Accepted**: new `f64`/`f16`/`bf16` packed scalar kinds plus contiguous one-dimensional generic typed device views. Accepted SPEC-0011 finite-only `f32` behavior is preserved. Production portable/software implementation is authorized; native promotion remains open.
- `SPEC-0018` remains **Proposal**. Its own gate requires trustworthy published native SPEC-0016 lifecycle evidence. Issue #51 records a passing Windows candidate, but the exact candidate commits/evidence were not integrated on protected main; do not widen to multi-operation/multi-stream production code until that gap is repaired.

`SPEC-0020`, the unaccepted remainder of `SPEC-0022`, and `SPEC-0023` through `SPEC-0026` remain proposal-only. Their presence or roadmap position is not implementation permission.

## Execution and Device-JS gates

`SPEC-0005` remains the legacy terminal-launch compatibility baseline. `SPEC-0016` owns submit/status/wait/close, terminalization, leases, pending-command gating and runtime-close semantics. Successors must consume that lifecycle rather than duplicate it.

Current execution profile remains one DriverActor/context, one private stream and at most one pending GPU operation until an accepted successor changes it.

`SPEC-0013` owns the restricted trusted-source Device-JS authoring boundary. `acorn@8.15.0` is syntax parsing only; CUDA-JS owns accepted grammar, typing, helper semantics, deterministic lowering/identity/diagnostics and compiler handoff. The accepted SPEC-0022 children expose only fixed `u32`/`u64` relaxed-observation and device-scope release/acquire publication helpers; consumer generation, progress, payload and queue policy stay outside CUDA-JS. Generated CUDA remains private.

EXP-013 is bounded publication-mailbox experiment evidence only. EXP-014 is retained JavaScript orchestration evidence only. Neither creates native support or production sideband/scheduler authority.

## Platform and external gates

Native Linux CUDA, WSL2, ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, MIG, ECC, multi-GPU, graphics interop and broad performance/soak claims require independent exact environments and evidence.

Issue #64 still requires exact merged-head Windows Node 26.7.0 F5 revalidation. Issue #68 requires GitHub private-vulnerability-reporting control-plane mutation/read-back and reporter/advisory-flow proof; source changes alone cannot satisfy it.

The exact CUDA-MCGS compatible pair remains cross-repository work. Generic CUDA-JS contracts must remain coherent if CUDA-MCGS is removed.

## Reasoning and experiment gate

Before changing Node FFI safety, ABI packing, context affinity, asynchronous completion, memory visibility, error poisoning, compiler semantics, cache identity, native security or teardown:

- identify accepted authority and the unresolved empirical question;
- state hard gates and strongest competing paths;
- use the cheapest decisive experiment when a fact is missing;
- define an independent oracle and complete evidence identity;
- define failure interpretation, rollback and cleanup;
- avoid implementation beyond what the experiment/evidence can decide.

## Repository organization

```text
components/    accepted generic runtime components
schemas/       generated facts, semantic overlays, Runtime IR, generated products
conformance/   synthetic/native/public-contract capsules
experiments/   bounded decision experiments
benchmarks/    reproducible mechanism/regression evidence
packaging/     package/compatibility/release metadata
tools/         schema/code-generation and developer tools
tests/         cross-component/end-to-end tests only
third_party/   donor material with exact provenance
```

No production source belongs in the repository root or an unowned catch-all directory.

## Validation

For current portable/integration work, run the owning focused tests plus:

```bash
./scripts/verify-docs.sh
npm run exp:000:build
npm run exp:014
npm run verify
npm run exp:012
npm run f3
```

Native/support promotion additionally requires its exact capability runner/oracle/profile. Do not replace missing native evidence with mocks.

Completion requires exact-effect inspection, evidence, cleanup, Git state, contradiction-free authority and honest claim limits.

## Publication state

The public `iteathen/CUDA-JS` repository exists. Publication/integration claims require remote read-back of the exact protected branch/tree. Local or candidate evidence is not a protected-main publication claim until the exact remote revision and its required checks/evidence are read back.
