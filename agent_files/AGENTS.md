# CUDA-JS Canonical Agent Procedure

## Startup

1. Read root `AGENTS.md`, `agent_files/AI_RULES.md`, `STATUS.md`, and `next_step.yaml`.
2. Read `package.json` and `packaging/compatibility-manifest.json` before relying on a package/capability claim.
3. Read the owning accepted ADR/specification and exact work-package/experiment sections, then load only objectively triggered files under `general_foundation/`.
4. Separate verified facts, accepted authority, proposals, assumptions, experiments, and unsupported claims.
5. Inspect the exact remote repository revision, environment, generated artifacts, issue/PR state, and unrelated work.
6. Establish one coherent outcome, decisive falsifier, rollback/safe stop, validation/cleanup/handoff reserve.
7. Stop if the task would invent an unsupported ABI, semantic overlay, resource transition, JIT claim, platform claim, or second owner.

## Current-state discipline

Do not use this procedure as a live workstream or SHA dashboard.

- Exact protected commit/tree identity comes from remote GitHub read-back.
- `package.json` plus `packaging/compatibility-manifest.json` own current package/public compatibility projection.
- `STATUS.md` plus `next_step.yaml` own the active execution seam and blocker class.
- Hardware/Node support documents and qualification registries own exact-profile evidence claims.
- Issues own durable obligations and concrete evidence cells, not current package/branch identity.

A dated branch, PR, issue comment, plan, or experiment result is historical evidence unless the designated current-state/authority surfaces explicitly promote it. If designated surfaces disagree, stop and repair the authoritative owner before continuing semantic/native work. The repository documentation gate runs `scripts/current-state-contract.mjs` to catch mechanically detectable drift.

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

Keep architectural disposition, implementation status, qualification/support status, and priority separate. A missing physical GPU/host/CI environment is an evidence or qualification-infrastructure gap unless implementation is independently falsified; do not invent a code fix for absent evidence.

Cross-repository needs enter CUDA-JS only as consumer-neutral public capability requirements with explicit consumer acceptance criteria. A downstream native workaround, deep import, or awkward escape path is evidence to classify a possible missing CUDA-JS capability before implementation, not permission to import consumer policy here.

Specifications protect ownership and authorize executable work; they are not an end state. Once a boundary is sufficiently specified, prefer the thinnest meaningful public-contract vertical falsifier over additional speculative layering. Do not add concurrency, optimization, or API breadth merely because CUDA can support it; require a dependency-ready consumer or measured bottleneck.

PR/closure evidence must state which blocker class changed, the exact evidence supporting that transition, what remains unproven, and what downstream capability is newly unblocked.

## Public surface gate

Public entry points must make executable truth easier to find than architecture rationale.

- README order is current executable/validatable state -> run/verify commands -> unsupported/unqualified limits -> concise boundary -> architecture/roadmap links.
- State current limits directly; detailed rationale belongs in ADR/specification documents.
- Keep support claims adjacent to exact evidence limits. Portable/package tests, mock evidence, and neighboring profiles do not become native qualification through wording.
- New process, compatibility, migration, abstraction, or concurrency machinery must name a present consumer, persisted/deployed state, safety/recovery reason, or measured bottleneck.
- Before 1.0, compatibility shims require a real external/deployed/persisted beneficiary or concrete recovery need; otherwise prefer the clean break.
- Do not let README or agent prose become another generated status ledger.

## AI-assisted development accountability

- AI-generated code, prose, analysis, and model review are working material, never authority, an independent oracle, or validation evidence.
- The contributor or maintainer remains accountable for every correctness, ABI, lifecycle, provenance, security, compatibility, support, and qualification claim.
- Apply the same tests, exact-profile evidence, review, provenance, and cleanup gates regardless of implementation method.

## Design hierarchy

```text
platform truth and accepted authority
  -> purpose, support bounds, and capability profile
  -> generated ABI facts plus reviewed semantics
  -> LEGO component/public-contract ownership
  -> SOLID internal responsibilities
  -> simplest sufficient total lifecycle
  -> independent conformance and measured performance
```

## Required adversarial questions

- Does the design remain coherent without the current first consumer?
- Is an accepted document being applied outside its scope?
- Is a C prototype being mistaken for ownership, blocking, asynchronous, error, or cleanup semantics?
- Is `node:ffi` being mistaken for a safety or lifetime model?
- Can raw native/device pointers or arbitrary executable schemas escape the safe boundary?
- Does context-dependent work stay on one owning Worker thread?
- Can deferred CUDA errors be attributed and health transitioned conservatively?
- Is “zero-copy” hiding migration, coherence, pinning, page faults, synchronization, or lifetime?
- Does cache/evidence identity include every material Node/ABI/schema/Driver/toolkit/GPU/artifact/options input?
- Can a mock pass while native behavior is wrong?
- Is API breadth being added before the lifecycle vertical slice is trustworthy?
- Does a requested consumer feature expose a missing generic lower capability that belongs here instead?

## Durable work/evidence anchors

`CJS-F1A / EXP-000`, `CJS-F1B`, the Windows F2W-F8W families, `EXP-001`/Linux qualification families, and `CJS-F9` remain provenance/evidence anchors. Their historical exact profiles do not define current package or support state. Read the accepted specifications and current compatibility/support projections for current facts.

ADR-0006 keeps public/component architecture OS-neutral and makes native Linux x86-64 the reference qualification path. CUDA-JS #4 is the physical Ubuntu/NVIDIA evidence cell. Windows remains a maintained exact peer profile. CUDA-JS #32 owns the exact CUDA-MCGS compatible-pair evidence. These evidence gates remain distinct.

## Testing and repair

- Write expected native results before observing JavaScript results.
- Freeze one failing signature/layout/lifecycle case and first divergence.
- Cluster by authoritative owner: schema fact, semantic overlay, packer, Node FFI signature, actor affinity, native API, or cleanup.
- Repair the owner coherently.
- Rerun the smallest cluster, then the owning capsule once.
- Preserve raw logs/artifacts externally and keep active evidence bounded.
- Do not repeat unchanged runs for reassurance.

## Cleanup

Every generated file, native probe, library, context, Worker, cache, log, benchmark, branch, issue, and PR has an explicit disposition. Protect user/pre-existing work and archived rationale. Explicit close is primary; finalizers do not prove cleanup.
