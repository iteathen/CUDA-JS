# CUDA-JS Foundational Document Index

**Status:** Informational

## Purpose

This index defines the minimum documentation foundation that must exist and agree before CUDA-JS implementation or experiment execution can be authorized. Presence alone is insufficient: authority, ownership, status, links, current phase, and claim limits must be coherent.

## Mandatory operating foundation

| Concern | Authoritative document |
|---|---|
| Agent entry and authority order | [`../AGENTS.md`](../AGENTS.md) |
| Concise hard rules | [`../agent_files/AI_RULES.md`](../agent_files/AI_RULES.md) |
| Design hierarchy and alignment gate | [`../agent_files/DESIGN_ALIGNMENT_CARD.md`](../agent_files/DESIGN_ALIGNMENT_CARD.md) |
| Reusable planning/testing/cleanup/token/review doctrine | [`../agent_files/general_foundation/README.md`](../agent_files/general_foundation/README.md) and linked files |
| Canonical repository procedure | [`../agent_files/AGENTS.md`](../agent_files/AGENTS.md) |
| Ownership/source-of-truth registry | [`../agent_files/SYSTEM_REGISTRY.md`](../agent_files/SYSTEM_REGISTRY.md) |
| Validation and evidence policy | [`../agent_files/VALIDATION_POLICY.md`](../agent_files/VALIDATION_POLICY.md) |
| Native/JIT/runtime application profile | [`../agent_files/application_specific/CUDA_JS_PROFILE.md`](../agent_files/application_specific/CUDA_JS_PROFILE.md) |
| Contribution and change rules | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Current verified state | [`../STATUS.md`](../STATUS.md) |
| Current bounded next step | [`../next_step.yaml`](../next_step.yaml) |

## Mandatory product foundation

| Concern | Authoritative document set |
|---|---|
| Discoverable capability summary and current-vs-future classification | [`CAPABILITIES.md`](CAPABILITIES.md) — informational summary only; accepted ADRs/specifications remain authority |
| Mission and product boundary | [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md) |
| CUDA-JS/CUDA-MCGS repository and public-contract boundary | [`INTEROP_WITH_CUDA_MCGS.md`](INTEROP_WITH_CUDA_MCGS.md), [`decisions/ADR-0001-repository-boundary.md`](decisions/ADR-0001-repository-boundary.md) |
| Host-binding and production-source architecture | [`decisions/ADR-0002-node-ffi-first-host-binding.md`](decisions/ADR-0002-node-ffi-first-host-binding.md) and [`decisions/ADR-0005-javascript-authored-jit-native-realized.md`](decisions/ADR-0005-javascript-authored-jit-native-realized.md) |
| Generated ABI facts versus reviewed semantics | [`decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md`](decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md) |
| Optional NN product and core-package isolation | [`decisions/ADR-0004-nn-extension-package-boundary.md`](decisions/ADR-0004-nn-extension-package-boundary.md), [`specs/SPEC-0027-nn-extension-foundation.md`](specs/SPEC-0027-nn-extension-foundation.md), and [`architecture/NN_EXTENSION_BOUNDARY.md`](architecture/NN_EXTENSION_BOUNDARY.md) |
| Foundation assessment | [`architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md) |
| Framework and target architecture | [`architecture/FRAMEWORK_OVERVIEW.md`](architecture/FRAMEWORK_OVERVIEW.md), [`architecture/TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md) |
| Version-zero support bounds | [`architecture/V0_SUPPORT_MATRIX.md`](architecture/V0_SUPPORT_MATRIX.md) |
| Public/runtime contract map | [`specs/SPEC-0000-runtime-contract-map.md`](specs/SPEC-0000-runtime-contract-map.md) |
| Accepted CUDA schema compiler and Tier-0 ABI contract | [`specs/SPEC-0001-cuda-schema-compiler.md`](specs/SPEC-0001-cuda-schema-compiler.md) |
| Accepted Windows Driver bootstrap contract | [`specs/SPEC-0002-windows-driver-bootstrap.md`](specs/SPEC-0002-windows-driver-bootstrap.md) |
| Research and exact source provenance | [`research/README.md`](research/README.md), [`research/source-register.yaml`](research/source-register.yaml) |
| Non-authoritative sequencing | [`plans/2026-08-10-master-plan.md`](plans/2026-08-10-master-plan.md), [`plans/2026-08-10-focus-branch-map.json`](plans/2026-08-10-focus-branch-map.json) |
| Future empirical gates and claim limits | [`../experiments/EXPERIMENT_MATRIX.md`](../experiments/EXPERIMENT_MATRIX.md) and detailed experiment documents |
| Superseded design provenance | [`archive/README.md`](archive/README.md) |

## Repository-organization foundation

The reserved top-level areas each have a README defining ownership and preventing root-level or catch-all growth:

- [`../components/`](../components/README.md)
- [`../schemas/`](../schemas/README.md)
- [`../conformance/`](../conformance/README.md)
- [`../experiments/`](../experiments/README.md)
- [`../benchmarks/`](../benchmarks/README.md)
- [`../tests/`](../tests/README.md)
- [`../tools/`](../tools/README.md)
- [`../packaging/`](../packaging/README.md)
- [`../third_party/`](../third_party/README.md)

These remain owned boundaries; implementation is limited to the accepted phase contracts and exact qualified profiles recorded in status and the support matrix.

## Current phase gate

`CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, and Windows CJS-F3W through the CUDA-JS-owned portion of CJS-F9W are accepted on exact host, ABI, Driver, compiler, linker, GPU, oracle, cache, permission, actor-affinity, resource, package, consumer, install, byte-parity, atomic-publication, and cleanup evidence. The platform-neutral F3 through F8 capsules also pass without establishing native Linux CUDA support. The repository remains in an **active implementation phase**; the exact compatible-pair and CUDA-MCGS-owned adapter evidence are still pending. Linux `CJS-F2L / EXP-001` and native Linux F3L through F9L remain retained, deferred, and incomplete.

## Foundation completeness test

The foundation is considered present only when all of the following are true:

1. every mandatory file above exists and is discoverable from the root or documentation indexes;
2. accepted documents do not compete or contradict each other materially;
3. status and `next_step.yaml` describe the actual repository and authorization phase;
4. promoted EXP-000 evidence is independent by exact profile and clearly separated from F1B work and production components;
5. CUDA-MCGS-specific search semantics do not enter the generic runtime boundary;
6. raw pointers, private FFI/provider mechanisms, and accidental first-consumer limits do not leak into public contracts;
7. source provenance and superseded alternatives remain traceable;
8. documentation/static validation passes;
9. implementation source remains inside its accepted component, conformance, experiment, or tool boundary and no native binary is tracked.
10. the optional NN product remains a separate publish unit, generic core contains no NN export/dependency/semantics, and every NN implementation boundary has its own accepted child specification.
