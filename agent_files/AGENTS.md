# CUDA-JS Canonical Agent Procedure

## Startup

1. Read root `AGENTS.md`, `AI_RULES.md`, `STATUS.md`, and `next_step.yaml`.
2. Read the owning accepted ADR/specification and exact work-package/experiment sections, then load only objectively triggered files under `general_foundation/`.
3. Separate verified facts, accepted authority, proposals, assumptions, experiments, and unsupported claims.
4. Inspect exact repository revision, environment, generated artifacts, and unrelated state.
5. Establish one coherent outcome, decisive falsifier, and validation/cleanup/handoff reserve.
6. Stop if the task would invent an unsupported ABI, semantic overlay, resource transition, JIT claim, or platform claim.

## Portfolio readiness gate

Before selecting, expanding, reviewing, or closing meaningful work, ask: **what is the highest-risk unproven boundary currently preventing the next real composed capability?**

Unless accepted CUDA-JS authority or the actual dependency graph requires a different order, prioritize:

1. security/correctness boundary defects;
2. missing foundational CUDA-JS capabilities required by dependency-ready consumers;
3. missing qualification/evidence/infrastructure for implemented required capabilities;
4. missing thin vertical composition proof through public contracts;
5. measured performance/concurrency bottlenecks required by real consumers;
6. convenience/API expansion;
7. community/presentation polish.

Keep architectural disposition, implementation status, qualification/support status, and priority separate. A missing physical GPU/host/CI environment is an evidence or qualification-infrastructure gap unless the implementation is independently falsified; do not invent a code fix for absent evidence. Qualification infrastructure is product infrastructure when a support claim depends on it.

Cross-repository needs enter CUDA-JS only as consumer-neutral public capability requirements with explicit consumer acceptance criteria. A downstream native workaround, deep import, or awkward escape path is evidence to classify a possible missing CUDA-JS capability before implementation, not permission to import consumer policy here.

Specifications protect ownership and authorize executable work; they are not an end state. Once a boundary is sufficiently specified, prefer the thinnest meaningful public-contract vertical falsifier over additional speculative layering. Do not promote multi-streaming, concurrency, optimization, or API breadth merely because a theoretical ceiling exists; require a dependency-ready consumer or measured bottleneck.

PR/closure evidence must state which blocker class changed, the exact evidence supporting that transition, what remains unproven, and what downstream capability is newly unblocked.

## Public surface gate

Public entry points must make executable truth easier to find than architecture rationale.

- README order is current executable/validatable state → run/verify commands → unsupported/unqualified limits → concise boundary → architecture/roadmap links.
- State a current limit directly. Do not add paragraphs explaining why it is not the architectural ceiling; that rationale belongs in ADR/specification documents.
- Keep support claims adjacent to exact evidence limits. Portable/package tests, mock evidence, and neighboring profiles do not become native qualification through wording.
- New process, compatibility, migration, abstraction, or concurrency machinery must name a present consumer, persisted/deployed state, safety/recovery reason, or measured bottleneck. Future possibility alone is not implementation permission.
- Before 1.0, compatibility shims require a real external/deployed/persisted beneficiary or concrete recovery need; otherwise prefer the clean break.
- Do not let README capability prose become another generated status ledger. Link `docs/CAPABILITIES.md`, `STATUS.md`, and `next_step.yaml` for detail.

## Design hierarchy

```text
platform truth and accepted authority
  → purpose, support bounds, and capability profile
  → generated ABI facts plus reviewed semantics
  → LEGO component/public-contract ownership
  → SOLID internal responsibilities
  → simplest sufficient total lifecycle
  → independent conformance and measured performance
```

## Required adversarial questions

- Does the design remain coherent without CUDA-MCGS?
- Is an accepted document being applied outside its scope?
- Is a C prototype being mistaken for ownership, blocking, asynchronous, error, or cleanup semantics?
- Is `node:ffi` being mistaken for a safety or lifetime model?
- Is Fast FFI being claimed without exact qualification evidence?
- Does a required API need arbitrary function-pointer invocation that the public Node API does not provide?
- Can raw native/device pointers or arbitrary schemas escape the safe boundary?
- Does context-dependent work stay on one owning Worker thread?
- Can a deferred CUDA error be attributed and the context transitioned conservatively?
- Is “zero-copy” hiding migration, coherence, pinning, page faults, synchronization, or lifetime?
- Does the cache/evidence key include all Node/ABI/schema/Driver/toolkit/GPU/artifact/options inputs?
- Can a mock pass while native behavior is wrong?
- Is API breadth being added before the lifecycle vertical slice is trustworthy?

## Current workstream

`CJS-F1A / EXP-000` is promoted after independent Windows x64 and native Linux x86-64 qualification. Preserve its exact-profile evidence and generated-product regression checks.

`CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, `CJS-F3W`, `CJS-F4W`, `CJS-F5W`, `CJS-F6W / EXP-009`, `CJS-F7W`, `CJS-F8W`, and the CUDA-JS-owned `CJS-F9-A/B` prerequisite are accepted. Keep pinned CUDA header facts, curated semantics, normalized Runtime IR, generated products, package compatibility, and independent native C ABI/Driver/memory/execution/compiler oracles as distinct owners. ADR-0006 requires OS-neutral public/component architecture and makes native Linux x86-64 the reference implementation and primary qualification path. The complete EXP-001/F1B/F3L-F8L native Linux command and evidence-validation source chain is runner-ready. Platform diagnostics, the public facade, and alpha.8 compatibility metadata source-admit native Linux x86-64 only as `testing-unconfirmed`; Linux remains unqualified until a contributor runs the unchanged Ubuntu 24.04 Driver/compiler/GPU/package chain on a native directly exposed physical NVIDIA GPU. VM/emulated/WSL/container/hosted-CI evidence does not qualify that cell. Issue #4 is an external evidence lane and does not block the active accepted SPEC-0017 portable/software integration. Windows remains a maintained peer adapter/profile. Exact CUDA-MCGS compatible-pair completion requires the independently owned CUDA-MCGS package/adapter in `iteathen/CUDA-MCGS` and frozen-pair evidence.

## Testing and repair

- Write expected native results before observing JavaScript results.
- Freeze one failing signature/layout/lifecycle case and first divergence.
- Cluster by schema fact, semantic overlay, packer, Node FFI signature, actor affinity, native API, or cleanup owner.
- Repair the authoritative owner coherently.
- Rerun the smallest cluster, then the owning capsule once.
- Preserve raw logs/artifacts externally and keep active evidence bounded.
- Do not repeat unchanged runs for reassurance.

## Cleanup

Every generated file, native probe, library, context, Worker, cache, log, benchmark, and branch has an explicit disposition. Protect user/pre-existing work and archived rationale. Explicit close is primary; finalizers do not prove cleanup.
