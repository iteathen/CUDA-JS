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

A plan, issue, experiment, branch name, dependency-ready label, or historical exact SHA organizes work beneath accepted authority. Stop when a conflict changes ownership, public contracts, ABI, safety, resource/lifetime behavior, compatibility, evidence, or cleanup.

## Mandatory startup

1. Read this file, `agent_files/AI_RULES.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`.
2. Read `package.json` and `packaging/compatibility-manifest.json` for the current package/public capability projection.
3. Identify the exact work package, owning accepted ADR/specification, target paths, claim, and required evidence class.
4. Inspect the actual remote protected branch/commit/tree, issue/PR state, generated artifacts, environment capabilities, and unrelated work.
5. Establish the smallest coherent outcome, decisive falsifier, rollback/safe stop, qualification, cleanup, and handoff reserve.
6. Do not broaden implementation beyond the dependency-ready accepted boundary.

## Live-state routing

This file is durable process/ownership authority, **not a live SHA, package-version, or capability dashboard**.

- Read the exact protected branch/commit/tree from GitHub when exact identity matters. Do not encode a self-referential "current main SHA" here.
- `package.json` owns package identity. `packaging/compatibility-manifest.json` owns the immutable public compatibility/capability projection.
- `STATUS.md` and `next_step.yaml` own the current execution seam, active blocker class, and next coherent action.
- `docs/HARDWARE_SUPPORT.md`, `docs/NODE_SUPPORT.md`, qualification registries, and accepted evidence own support/qualification claims.
- Issues own durable obligations, explicit blocked gates, and concrete qualification/evidence cells. They are not live SHA dashboards or specifications.
- Historical exact SHAs, candidate states, and dated capability snapshots remain provenance only unless the current protected surfaces explicitly promote them.

If any higher-authority or designated current-state surface contradicts these owners, stop before semantic/native work and repair the authoritative source. `scripts/current-state-contract.mjs` is the mechanical recurrence gate for the designated current-state surfaces.

The repository is in an **active implementation phase** while current-state owners name executable work. This phrase describes process mode only; it does not promote any particular candidate, issue, package, or native profile.

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
- ADR-0007 assigns reusable NN/model/inference/autodiff/training semantics to independent `iteathen/cuda-nn`; generic Tensor mathematics/planning belongs to `iteathen/CUDA-JS-Tensor`. Historical ADR-0004/SPEC-0027 are provenance only and do not authorize `nn.*` production components here.
- The first consumer cannot define foundational schema, memory, launch, error, provider, compatibility, or lifetime contracts.
- Version zero is Node-FFI-first and ships no CUDA-JS project-specific compiled addon. A maintained native host backend requires a separately accepted measured-gap decision under ADR-0005.
- Maintained core runtime source is JavaScript/ESM; Node/native CUDA libraries and generated device artifacts realize execution. C/C++ probes/oracles are independent evidence, not package runtime.
- A `fast-jit-required` claim requires exact-profile qualification evidence; generic fallback remains allowed only where an accepted profile explicitly permits it.
- Generated header/ABI facts and curated semantic/lifecycle overlays are separate owners. Unknown or contradictory public semantics fail closed.
- Node FFI, native handles, provider paths, raw device addresses, and arbitrary native calls remain private. JavaScript receives opaque capabilities and bounded data.
- `cuGetProcAddress` may verify version/status/semantics, but v0 invokes only approved named exports unless a separately qualified capability says otherwise.
- NVRTC compiles device code, not the Node host bridge. Host binding and device compilation/linking have separate owners/cache identities.
- One DriverActor Worker owns one private context and every raw Driver resource for one runtime by default. Context-dependent work stays on that owner.
- Potentially blocking compile/link/native work never runs on the application event loop.
- Device, staged, pinned, mapped, managed, external and mock memory are distinct capabilities; none is marketed generically as zero-copy.
- Every library, actor, context, allocation, module, function, stream, event, operation, compiler/linker object, logical view, cache entry and artifact has one owner and terminal disposition.
- Errors distinguish validation, unsupported capability, pressure/backpressure, stale resource, immediate/deferred native failure, suspect/poisoned context, closed runtime, restart-required and orphan truth.
- Mocks validate only lifecycle/orchestration they execute; they do not prove native ABI, CUDA ordering/coherence, physical overlap, performance, platform support, or consumer semantics.
- Architectural disposition, implementation status, qualification/support status, and priority are independent. Follow `agent_files/general_foundation/STATUS_SEMANTICS.md`.
- No native/platform/performance claim exceeds exact independent evidence for the exact revision/profile.
- A generic lower-layer gap demonstrated by a consumer is fixed in CUDA-JS before any consumer-local native/private workaround.

## Durable evidence anchors

These names are durable provenance/evidence owners, not a current-state ledger:

- `CJS-F1A / EXP-000` — synthetic Node-FFI foundation and regression capsule.
- `CJS-F1B` — pinned CUDA ABI facts, generated products, and independent native layout evidence.
- `CJS-F2W / EXP-012` and Windows `CJS-F3W` through `CJS-F8W` — retained exact Windows native evidence families.
- `EXP-001` plus Linux F3L-F8L — native Linux x86-64 preparation/qualification chain; portable/readiness evidence is not Linux CUDA qualification.
- `CJS-F9` — trusted toolkit-header/compiler/publication evidence family.

Capability status comes from the accepted specification plus the current compatibility/evidence owners, not from old issue comments or this anchor list.

## Execution and Device-JS ownership

`SPEC-0005` is the legacy terminal-launch compatibility baseline. `SPEC-0016` owns operation submit/status/wait/close, terminalization, leases, pending-command gating and runtime-close semantics. Accepted successors compose that lifecycle rather than creating a second operation owner.

`SPEC-0013` owns restricted Device-JS authoring. Acorn is syntax parsing only; CUDA-JS owns admitted grammar, typing, helper semantics, deterministic lowering/identity/diagnostics and compiler handoff. Consumer generation, progress, queue, search, model and product policy remain outside CUDA-JS.

Use the current compatibility manifest and owning accepted specifications for exact parameter kinds, finite limits, scheduling profile, publication capabilities, prepared execution, library adapters, and native qualification status. Do not infer those facts from dated prose.

## Platform and external evidence gates

Native Linux CUDA, WSL2, ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, MIG, ECC, multi-GPU, graphics interop, broad version matrices, and performance/soak claims require independent exact environments and evidence.

CUDA-JS #4 is the native Ubuntu 24.04 x86-64 physical-NVIDIA qualification cell. CUDA-JS #32 is the exact CUDA-MCGS/CUDA-JS compatible-pair evidence owner. CUDA-JS #68 retains the unaffiliated private-vulnerability-reporting operational proof. None may be satisfied by relabeling portable/mock/neighboring-profile evidence.

The exact CUDA-MCGS pair must consume only public CUDA-JS contracts and remain coherent if CUDA-MCGS is removed. Generic Tensor gaps route to CUDA-JS-Tensor; reusable NN/model gaps route to cuda-nn.

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

No production source belongs in the repository root or an unowned catch-all directory. CUDA-NN source belongs in its independent repository.

## Validation

For portable/integration work, run the owning focused tests plus the current repository gates, including:

```bash
./scripts/verify-docs.sh
npm run verify
```

Run additional owning/native capsules when the changed boundary requires them. Native/support promotion additionally requires its exact capability runner/oracle/profile. Never replace missing native evidence with mocks.

Completion requires exact-effect inspection, evidence, cleanup, Git state, contradiction-free authority and honest claim limits.

## Publication state

The public `iteathen/CUDA-JS` repository exists. Publication/integration claims require remote read-back of the exact protected branch/tree. Local or candidate evidence is not a protected-main publication claim until the exact remote revision and required checks/evidence are read back.
