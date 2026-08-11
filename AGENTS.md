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

A plan or experiment organizes work beneath accepted authority. Stop when a conflict changes ownership, public contracts, ABI, safety, resource/lifetime behavior, compatibility, evidence, or cleanup.

## Mandatory startup

1. Read this file, `agent_files/AI_RULES.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`.
2. Identify the exact work package, experiment, contract, target paths, and claim.
3. Read the owning accepted ADR/specification and only objectively triggered supporting doctrine under `agent_files/general_foundation/`.
4. Inspect exact Git state, generated artifacts, environment capabilities, and unrelated work.
5. Establish the smallest coherent outcome, decisive falsifier, and validation/cleanup/handoff reserve.
6. Do not broaden implementation beyond the dependency-ready boundary.

## Non-negotiable boundaries

- CUDA-JS is a generic Node/CUDA runtime. It contains no MCGS, minimax, graph-search, game, tensor, model, or evaluator semantics.
- The first consumer cannot define foundational schema, memory, launch, error, or lifetime contracts.
- Version zero is Node-FFI-first and ships no CUDA-JS project-specific compiled addon.
- Custom AsmJit/register stubs are a deferred measured-gap option, not the baseline.
- Generated header facts and curated semantic overlays are separate owners. Unknown public semantics fail closed.
- Node FFI and raw memory remain private; JavaScript receives opaque capabilities and bounded data.
- `cuGetProcAddress` verifies version/status/semantics; v0 invokes approved named exports and does not assume arbitrary pfn calls.
- A `fast-jit-required` claim requires exact-profile qualification evidence; generic fallback is allowed only in a declared cold/bootstrap profile.
- NVRTC compiles device code, not the Node host bridge. Host binding and device compilation/linking use separate owners and cache identities.
- One DriverActor Worker owns one private context and every raw Driver resource by default.
- Potentially blocking compilation, linking, or broad native work cannot run on the application event loop.
- Device, staged, pinned, mapped, managed, and mock memory are distinct capabilities; none is marketed generically as zero-copy.
- Every library, actor, context, allocation, module, function, stream, event, operation, compiler/linker object, view, cache entry, and artifact has one owner and terminal disposition.
- Errors distinguish validation, unsupported capability, immediate failure, deferred failure, cancellation, pressure, stale resource, suspect/poisoned context, closed runtime, and restart-required state.
- Mocks validate lifecycle/orchestration only; they do not prove native ABI, CUDA ordering, performance, or consumer semantics.
- No support/performance/platform claim exceeds exact native evidence.

## Current phase gate

The repository is in an **active implementation phase** with `CJS-F1A`, `CJS-F1B`, and the Windows-only `CJS-F2W / EXP-012` bootstrap accepted. Windows `CJS-F3W` contract work is dependency-ready. Linux `CJS-F2L / EXP-001` now reaches the real-Driver/GPU boundary with executable preparation, readiness, and smoke tooling; final native qualification remains deferred and independently gated. EXP-000 remains the mandatory exact Node 26.7.0 Windows x64/native Linux x86-64 regression capsule.

F1B authorizes pinned official-header provenance, deterministic import, generated ABI facts, the separately reviewed Tier-0 semantic overlay, normalized Runtime IR products, and independent native C ABI probes. SPEC-0002 authorizes only the accepted bounded Windows Driver bootstrap. Linux GPU-free preparation may follow `experiments/exp-001/README.md`; Linux Driver execution remains deferred on a qualified native CUDA/GPU profile. Production DriverActor/resource code requires a new accepted F3W specification; memory, module/launch/completion, compiler/cache, packaging, and consumer interop remain blocked on their documented Windows predecessors.

Do not create implementation scaffolding “for later,” imply Linux support from Windows evidence, or advance beyond the dependency-ready Windows boundary.

## Reasoning and experiment gate

Node FFI safety, ABI packing, Fast FFI qualification, context/thread affinity, asynchronous completion, memory views, error poisoning, device compilation, cache identity, native security, and teardown are critical boundaries.

Before changing one:

- identify accepted authority and the unresolved empirical question;
- state hard gates and competing paths;
- use the cheapest decisive experiment;
- define an independent oracle and complete evidence identity;
- define failure interpretation, rollback, and cleanup;
- avoid implementation beyond what the experiment can decide.

## Repository organization

```text
components/    generic runtime components after contract acceptance
schemas/       generated facts, semantic overlays, Runtime IR, generated products
conformance/   synthetic/native/public-contract capsules
experiments/   disposable decision experiments
benchmarks/    reproducible mechanism and regression evidence
packaging/     package/compatibility/release metadata
tools/         schema/code-generation and developer tools
tests/         cross-component/end-to-end tests only
third_party/   donor material with exact provenance
```

No production source belongs in the repository root. Do not create unowned catch-all directories.

## Validation

For the current phase:

```bash
./scripts/verify-docs.sh
npm run exp:000:build
npm run verify
npm run exp:012
```

Experiment branches add their own commands. Completion requires exact-effect inspection, evidence, cleanup, Git state, and honest claim limits.

## Publication state

The private `iteathen/CUDA-JS` repository exists. Publication claims require remote read-back of the exact branch and tree being claimed. Local EXP-000 evidence is not a publication claim until the exact remote branch/tree and its native CI result are read back.
