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
| Ecosystem language exclusion | [`../agent_files/general_foundation/NO_PYTHON_POLICY.md`](../agent_files/general_foundation/NO_PYTHON_POLICY.md) |
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
| Mission and product boundary | [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md) |
| CUDA-JS/UMCGS repository and public-contract boundary | [`INTEROP_WITH_UMCGS.md`](INTEROP_WITH_UMCGS.md), [`decisions/ADR-0001-repository-boundary.md`](decisions/ADR-0001-repository-boundary.md) |
| Host-binding baseline | [`decisions/ADR-0002-node-ffi-first-host-binding.md`](decisions/ADR-0002-node-ffi-first-host-binding.md) |
| Generated ABI facts versus reviewed semantics | [`decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md`](decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md) |
| Foundation assessment | [`architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md) |
| Framework and target architecture | [`architecture/FRAMEWORK_OVERVIEW.md`](architecture/FRAMEWORK_OVERVIEW.md), [`architecture/TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md) |
| Version-zero support bounds | [`architecture/V0_SUPPORT_MATRIX.md`](architecture/V0_SUPPORT_MATRIX.md) |
| Public/runtime contract map | [`specs/SPEC-0000-runtime-contract-map.md`](specs/SPEC-0000-runtime-contract-map.md) |
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

These are ownership reservations, not permission to add implementation.

## Current phase gate

The repository is in a **documentation-only foundation phase**. Experiment descriptions are planning artifacts. No C, C++, JavaScript, TypeScript, Rust, native library, generated binding, runtime implementation, experiment harness, benchmark implementation, or production package is authorized until the project owner explicitly advances the phase and the applicable accepted contract/evidence preconditions are satisfied.

The no-Python policy is permanent across phases unless the project owner explicitly changes the accepted ecosystem policy. Advancing from documentation to experiments or implementation does not authorize Python source, tooling, dependencies, tests, CI, generators, packaging, installers, release work, or temporary scripts.

## Foundation completeness test

The foundation is considered present only when all of the following are true:

1. every mandatory file above exists and is discoverable from the root or documentation indexes;
2. accepted documents do not compete or contradict each other materially;
3. status and `next_step.yaml` describe the actual repository and authorization phase;
4. planned experiments and components are clearly non-authoritative and non-executed;
5. UMCGS-specific search semantics do not enter the generic runtime boundary;
6. raw pointers, private FFI/provider mechanisms, and accidental first-consumer limits do not leak into public contracts;
7. source provenance and superseded alternatives remain traceable;
8. documentation/static validation passes;
9. no unauthorized implementation source or generated binary is present;
10. no Python source, project metadata, interpreter/package-manager invocation, ordinary-use dependency, generated product, or Python-backed project workflow is introduced.
