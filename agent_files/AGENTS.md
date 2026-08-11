# CUDA-JS Canonical Agent Procedure

## Startup

1. Read root `AGENTS.md`, `AI_RULES.md`, `STATUS.md`, and `next_step.yaml`.
2. Read the owning accepted ADR/specification and exact work-package/experiment sections, then load only objectively triggered files under `general_foundation/`.
3. Separate verified facts, accepted authority, proposals, assumptions, experiments, and unsupported claims.
4. Inspect exact repository revision, environment, generated artifacts, and unrelated state.
5. Establish one coherent outcome, decisive falsifier, and validation/cleanup/handoff reserve.
6. Stop if the task would invent an unsupported ABI, semantic overlay, resource transition, JIT claim, or platform claim.

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

- Does the design remain coherent without UMCGS?
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

`CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, `CJS-F3W`, and Windows-only `CJS-F4W` are accepted. Keep pinned CUDA header facts, curated semantics, normalized Runtime IR, generated products, platform compatibility, and independent native C ABI/Driver/memory oracles as distinct owners. The F3/F4 control-plane capsules pass in native Linux CI, but Linux DriverActor and memory execution remain deferred and incomplete until `CJS-F2L / EXP-001` passes on a qualified native Driver/GPU environment. Windows F5 contract work may proceed; implementation still requires an accepted detailed specification.

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
