# CUDA-JS System Registry

**Scope:** Canonical ownership and source-of-truth registry for the CUDA-JS repository.

This registry tells developers and agents where durable truth belongs. Update it in the same coherent change that creates, moves, supersedes, archives, or removes an ownership boundary.

## Registry rules

- One boundary has one stable owner and one authoritative location.
- Planned boundaries and reserved directories are not implementation authorization.
- A plan or experiment describes future work beneath accepted authority; it does not authorize code by itself.
- Public contracts never inherit private Node FFI, Worker, native-pointer, library-path, or provider-layout details accidentally.
- Product components require an accepted contract, README, ownership/lifecycle definition, validation owner, and registry entry before production code enters them.
- Cross-component dependencies point through declared public contracts; deep imports and circular dependencies are forbidden.
- Generated ABI facts and curated semantic/lifecycle overlays remain separate authorities.
- Archive material remains non-authoritative unless a new accepted decision explicitly promotes it.
- Temporary, generated, evidence, recovery, cleanup-debt, or handoff state has an owner and objective disposition trigger.

## Governance and documentation boundaries

| Boundary ID | Owns | Authoritative location | Status |
|---|---|---|---|
| `governance.entry` | Mandatory startup, authority order, hard project boundaries, current phase | [`../AGENTS.md`](../AGENTS.md) | Active |
| `governance.agent-procedure` | Repository-specific reasoning, work sizing, experiment discipline, cleanup | [`AGENTS.md`](AGENTS.md) and [`AI_RULES.md`](AI_RULES.md) | Active |
| `governance.design` | LEGO/SOLID/CUPID/KISS hierarchy, domain-appropriate foundations, value ordering | [`DESIGN_ALIGNMENT_CARD.md`](DESIGN_ALIGNMENT_CARD.md), [`general_foundation/PRINCIPLES.md`](general_foundation/PRINCIPLES.md), and [`general_foundation/ENGINEERING_JUDGMENT.md`](general_foundation/ENGINEERING_JUDGMENT.md) | Accepted |
| `governance.workflow` | Assessment, focus branches, plan execution, testing/debugging, sanity checks, PR integration, cleanup, token use, documentation and security | [`general_foundation/`](general_foundation/README.md) | Accepted |
| `governance.validation` | Evidence, exact-profile claims, completion and cleanup requirements | [`VALIDATION_POLICY.md`](VALIDATION_POLICY.md) | Active |
| `governance.runtime-profile` | CUDA-JS native/JIT/runtime-specific constraints | [`application_specific/CUDA_JS_PROFILE.md`](application_specific/CUDA_JS_PROFILE.md) | Active |
| `governance.registry` | Ownership and source-of-truth map | This file | Active |
| `project.foundation-index` | Complete foundational-document inventory and readiness test | [`../docs/FOUNDATION_INDEX.md`](../docs/FOUNDATION_INDEX.md) | Active |
| `project.charter` | Product mission, universal boundary, safety, resource rules | [`../docs/PROJECT_CHARTER.md`](../docs/PROJECT_CHARTER.md) | Accepted |
| `project.decisions` | Accepted cross-cutting architecture choices | [`../docs/decisions/`](../docs/decisions/README.md) | Active |
| `project.specifications` | Normative public/runtime contract proposals | [`../docs/specs/`](../docs/specs/README.md) | Proposal set |
| `project.architecture` | Explanatory architecture, assessment, support bounds | [`../docs/architecture/`](../docs/architecture/README.md) | Active/proposal set |
| `project.research` | Prior art, technical evidence, assumptions and source provenance | [`../docs/research/`](../docs/research/README.md) | Active |
| `project.plans` | Non-authoritative sequencing and focus-branch decomposition | [`../docs/plans/`](../docs/plans/README.md) | Active |
| `project.experiments` | Decision experiments and claim limits | [`../experiments/`](../experiments/README.md) | EXP-000 and Windows EXP-012 promoted; Linux EXP-001 prepared through the hardware boundary |
| `experiment.exp-000` | Synthetic ABI schema, generated C fixture/oracle/Runtime IR, private Node FFI Worker, packers, lifecycle and bounded calibration evidence | [`../experiments/exp-000/`](../experiments/exp-000/README.md) | Promoted on Windows x64 and native Linux x86-64 |
| `experiment.exp-001` | Native Linux official-input acquisition, ABI probe, C oracle, readiness diagnostics, real-Driver Node FFI smoke, and engineer handoff | [`../experiments/exp-001/`](../experiments/exp-001/README.md) | GPU-free preparation passes; Driver/GPU qualification deferred |
| `experiment.exp-012` | Windows Driver discovery, generated bindings, procedure verification, private context lifecycle, MSVC oracle, permission/negative controls, and cleanup evidence | [`../experiments/exp-012/`](../experiments/exp-012/README.md) | Accepted on exact Windows x64 profile |
| `project.interop` | Public boundary with UMCGS | [`../docs/INTEROP_WITH_UMCGS.md`](../docs/INTEROP_WITH_UMCGS.md) | Active |
| `project.archive` | Superseded design provenance | [`../docs/archive/`](../docs/archive/README.md) | Active, non-authoritative |
| `project.state` | Current phase and verified repository state | [`../STATUS.md`](../STATUS.md) | Active |
| `project.next-step` | One coherent current boundary | [`../next_step.yaml`](../next_step.yaml) | Active |
| `schema.header-facts` | Pinned official CUDA 13.3 provenance, selection, imported facts, target layouts, deterministic products, and Win64 compatibility bridge | [`../schemas/cuda-13.3/`](../schemas/cuda-13.3/) and [`../tools/cuda-schema/`](../tools/cuda-schema/README.md) | Accepted F1B internal plus F2W bridge |
| `schema.semantic-overlay` | Reviewed Tier-0 argument, lifecycle, safety, version, exposure, and conformance meaning | [`../schemas/cuda-13.3/tier-0/semantic-overlay.json`](../schemas/cuda-13.3/tier-0/semantic-overlay.json) | Accepted F1B private-experimental |

## Repository product areas

| Product area | Owns | Location | Current status |
|---|---|---|---|
| `components` | Future generic runtime components | [`../components/`](../components/README.md) | Reserved; no implementation authorized |
| `schemas` | Pinned CUDA facts, semantic overlays, Runtime IR and generated products | [`../schemas/`](../schemas/README.md) | F1B accepted; public production coverage not authorized |
| `conformance` | Future production synthetic/native/public-contract capsules | [`../conformance/`](../conformance/README.md) | Reserved; EXP-000 conformance remains experiment-owned |
| `experiments` | Bounded decision experiments and their generated fixtures/harnesses | [`../experiments/`](../experiments/README.md) | EXP-000 and Windows EXP-012 promoted; Linux EXP-001 prepared through the hardware boundary |
| `benchmarks` | Future reproducible mechanism/regression evidence | [`../benchmarks/`](../benchmarks/README.md) | Reserved |
| `packaging` | Future package, compatibility and release metadata | [`../packaging/`](../packaging/README.md) | Reserved |
| `tools` | Schema/code-generation and developer tools | [`../tools/`](../tools/README.md) | F1B importer/generator accepted internal tooling |
| `tests` | Future cross-component and end-to-end tests | [`../tests/`](../tests/README.md) | Reserved |
| `third-party` | Donor material with exact provenance and reuse decision | [`../third_party/`](../third_party/README.md) | Reserved |
| `scripts` | Thin validation and exact-toolchain experiment entry points | [`../scripts/`](../scripts/) | Active |

## Planned component anchors

These IDs organize future specifications. They do not authorize implementation.

| Planned boundary ID | Intended responsibility | Governing authority needed before code |
|---|---|---|
| `runtime.facade` | Safe asynchronous public API and capability negotiation | Accepted detailed public API specification |
| `runtime.driver-actor` | Thread-affine CUDA context and raw-resource ownership | Accepted actor/resource/lifecycle specification plus native evidence |
| `runtime.compiler-actor` | NVRTC/nvJitLink provider isolation and artifact production | Accepted compiler/link/cache specification plus provider evidence |
| `runtime.resource-registry` | Opaque capability identity, generation, state and parent/child leases | Accepted resource/lifecycle specification |
| `runtime.memory` | Placement, visibility, mapping, coherence, synchronization and lifetime | Accepted memory specification plus native conformance evidence |
| `runtime.module-launch` | Module/function identity, argument packing and launch | Accepted ABI/launch specification plus native parity evidence |
| `runtime.completion` | Stream/event completion, cancellation and deferred errors | Accepted completion/error-health specification plus native evidence |
| `schema.header-facts` | Pinned official-header import and normalized ABI facts | Accepted schema/import specification and native layout oracle |
| `schema.semantic-overlay` | Reviewed blocking, ownership, lifecycle, safety and version meaning | Accepted semantic-overlay specification |
| `backend.node-ffi` | Private Node host-call substrate | Windows F2W accepted; each additional platform requires independent qualification evidence |
| `interop.umcgs` | Public package/capability boundary consumed by UMCGS | Accepted CUDA-JS public contracts and compatible-pair specification |

## Changing the registry

A coherent registry change includes:

1. stable boundary ID and purpose;
2. owner and authoritative location;
3. public contract and dependency direction;
4. lifecycle and compatibility state;
5. validation/evidence owner;
6. migration, archive, cleanup, or supersession disposition;
7. corresponding index, status, plan, and caller updates where triggered.
