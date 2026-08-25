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
| `governance.public-security` | Public vulnerability-reporting entry point, public native/executable trust-boundary guidance, secret/incident handling | [`../SECURITY.md`](../SECURITY.md), governed by [`general_foundation/SECURITY.md`](general_foundation/SECURITY.md) | Active |
| `project.public-repository` | Public-repository CI trust model, immutable Action provenance/update policy, hardening assessment, security-setting state, and source-controlled public hygiene | [`../docs/PUBLIC_REPOSITORY.md`](../docs/PUBLIC_REPOSITORY.md), [`../.github/actions-provenance.json`](../.github/actions-provenance.json), and [`../scripts/verify-public-repository.mjs`](../scripts/verify-public-repository.mjs) | Active informational/validation boundary |
| `project.foundation-index` | Complete foundational-document inventory and readiness test | [`../docs/FOUNDATION_INDEX.md`](../docs/FOUNDATION_INDEX.md) | Active |
| `project.charter` | Product mission, universal boundary, safety, resource rules | [`../docs/PROJECT_CHARTER.md`](../docs/PROJECT_CHARTER.md) | Accepted |
| `project.source-architecture` | JavaScript-authored core runtime, JIT/native realization, C/C++ evidence boundary, and measured-gap native-backend drift gate | [`../docs/decisions/ADR-0005-javascript-authored-jit-native-realized.md`](../docs/decisions/ADR-0005-javascript-authored-jit-native-realized.md) | Accepted |
| `project.nn-extension` | Optional NN product boundary, separate-publish-unit isolation, planned component ownership, and child-specification gate | [`../docs/decisions/ADR-0004-nn-extension-package-boundary.md`](../docs/decisions/ADR-0004-nn-extension-package-boundary.md) and [`../docs/specs/SPEC-0027-nn-extension-foundation.md`](../docs/specs/SPEC-0027-nn-extension-foundation.md) | Accepted authority only; not implemented or qualified |
| `project.decisions` | Accepted cross-cutting architecture choices | [`../docs/decisions/`](../docs/decisions/README.md) | Active |
| `project.specifications` | Normative public/runtime contract set | [`../docs/specs/`](../docs/specs/README.md) | Mixed accepted/proposal set; each specification's explicit status governs |
| `project.architecture` | Explanatory architecture, assessment, support bounds | [`../docs/architecture/`](../docs/architecture/README.md) | Active/proposal set |
| `project.research` | Prior art, technical evidence, assumptions and source provenance | [`../docs/research/`](../docs/research/README.md) | Active |
| `project.plans` | Non-authoritative sequencing and focus-branch decomposition | [`../docs/plans/`](../docs/plans/README.md) | Active |
| `project.experiments` | Decision experiments and claim limits | [`../experiments/`](../experiments/README.md) | EXP-000 and Windows EXP-012 promoted; Linux EXP-001 prepared through the hardware boundary |
| `experiment.exp-000` | Synthetic ABI schema, generated C fixture/oracle/Runtime IR, private Node FFI Worker, packers, lifecycle and bounded calibration evidence | [`../experiments/exp-000/`](../experiments/exp-000/README.md) | Promoted on Windows x64 and native Linux x86-64 |
| `experiment.exp-001` | Native Linux official-input acquisition, ABI probe, C oracle, readiness diagnostics, real-Driver Node FFI smoke, and engineer handoff | [`../experiments/exp-001/`](../experiments/exp-001/README.md) | GPU-free preparation passes; Driver/GPU qualification deferred |
| `experiment.exp-009` | NVRTC compile, nvJitLink composition, deterministic PTX/cubin parity, provider lifecycle, and direct MSVC oracle | [`../experiments/exp-009/`](../experiments/exp-009/README.md) | Promoted on exact Windows x64 CUDA 13.3 profile; native Linux providers deferred |
| `experiment.exp-012` | Windows Driver discovery, generated bindings, procedure verification, private context lifecycle, MSVC oracle, permission/negative controls, and cleanup evidence | [`../experiments/exp-012/`](../experiments/exp-012/README.md) | Accepted on exact Windows x64 profile |
| `project.interop` | Public boundary with CUDA-MCGS (`iteathen/UMCGS`) | [`../docs/INTEROP_WITH_CUDA_MCGS.md`](../docs/INTEROP_WITH_CUDA_MCGS.md) | Active |
| `project.archive` | Superseded design provenance | [`../docs/archive/`](../docs/archive/README.md) | Active, non-authoritative |
| `project.state` | Current phase and verified repository state | [`../STATUS.md`](../STATUS.md) | Active |
| `project.next-step` | One coherent current boundary | [`../next_step.yaml`](../next_step.yaml) | Active |
| `schema.header-facts` | Pinned official CUDA 13.3 provenance, selection, imported facts, target layouts, deterministic products, and Win64 compatibility bridge | [`../schemas/cuda-13.3/`](../schemas/cuda-13.3/) and [`../tools/cuda-schema/`](../tools/cuda-schema/README.md) | Accepted F1B/F5 internal plus Windows bridge |
| `schema.semantic-overlay` | Reviewed Tier-0 argument, lifecycle, safety, version, exposure, and conformance meaning | [`../schemas/cuda-13.3/tier-0/semantic-overlay.json`](../schemas/cuda-13.3/tier-0/semantic-overlay.json) | Accepted through F8W private-experimental backend |
| `runtime.driver-actor` | Bounded async command protocol, one Worker-owned context, memory/execution adapters, permission inheritance, health, and graceful/unexpected-loss lifecycle | [`../components/driver-actor/`](../components/driver-actor/README.md) | Accepted Windows F7W internal experimental; Linux native Driver blocked on F2L |
| `runtime.resource-registry` | Opaque capability identity, generation, state, dependencies, leases, close ordering, and orphan inventory | [`../components/resource-registry/`](../components/resource-registry/README.md) | Accepted F3 internal experimental |
| `conformance.f3` | Platform-neutral actor/resource lifecycle and exact Windows native context-affinity/cleanup evidence | [`../conformance/f3/`](../conformance/f3/README.md) | Accepted on Windows; control plane also passes native Linux x86-64 |
| `runtime.memory` | Exact device-byte policy, quota ledger, ranges, copied transfers, opaque allocation lifecycle, and backend injection | [`../components/memory/`](../components/memory/README.md) | Accepted Windows F4W internal experimental; portable logic passes native Linux CI |
| `conformance.f4` | Portable copied-memory/control-plane evidence, independent MSVC parity, native Windows cleanup, and Linux handoff | [`../conformance/f4/`](../conformance/f4/README.md) | Accepted Windows F4W; native Linux CUDA incomplete |
| `runtime.execution` | Bounded PTX/cubin identity, declared functions, packed arguments, memory leases, a one-stream default plus exact capacity-two private scheduler, and terminal completion | [`../components/execution/`](../components/execution/README.md) | Accepted exact Windows SPEC-0018 profile; portable logic ready for Linux adapter |
| `runtime.host-memory-transfer` | Two bounded internal pinned staging blocks and contiguous snapshot H2D, terminal-result D2H, and D2D operation production | [`../components/host-memory-transfer/`](../components/host-memory-transfer/README.md) | Accepted exact Windows SPEC-0019 first profile; general caller registration/mapping deferred |
| `runtime.publication-mailbox` | Named u32 lane schema, private SAB registration/mapping, generation, exclusive operation lease, reset, and unregister truth | [`../components/publication-mailbox/`](../components/publication-mailbox/README.md) | Accepted and integrated SPEC-0014 first profile; exact Windows and installed-package qualification pass |
| `conformance.f5` | Portable launch/completion/loss evidence, independent MSVC vector parity, native Windows cleanup, and Linux handoff | [`../conformance/f5/`](../conformance/f5/README.md) | Accepted Windows F5W; native Linux CUDA incomplete |
| `runtime.compiler-actor` | Typed NVRTC/nvJitLink Worker, canonical provider identity, manifest-verified optional toolkit headers, copied PTX/cubin artifacts, validated cache, health, and lifecycle | [`../components/compiler-actor/`](../components/compiler-actor/README.md) | Accepted Windows F9 prerequisite internal experimental; native Linux providers incomplete |
| `runtime.cuda-target` | Canonical CUDA target syntax, reviewed repository admission metadata, pairing, and stable policy identity | [`../components/cuda-target/`](../components/cuda-target/README.md) | Accepted SPEC-0006 target-policy revision 1 internal owner; provider/device/native qualification remains separate |
| `runtime.device-js` | Restricted Device-JS syntax/type/helper semantics, deterministic identity, and private CUDA C++ lowering through a syntax-only parser adapter | [`../components/device-js/`](../components/device-js/README.md) | Accepted SPEC-0013 portable/software implementation; native Device-JS qualification pending |
| `conformance.f6` | Portable compiler/cache/lifecycle evidence, independent MSVC artifact parity, PTX/cubin Windows execution, and Linux handoff | [`../conformance/f6/`](../conformance/f6/README.md) | Accepted Windows F6W; native Linux CUDA incomplete |
| `runtime.platform-diagnostics` | Sanitized host classification, exact Windows CUDA device-mode/watchdog assessment, permission disposition, and fail-closed support reasons | [`../components/platform-diagnostics/`](../components/platform-diagnostics/README.md) | Accepted Windows F7W internal experimental; Linux/WSL classification only |
| `conformance.f7` | Platform classification, sanitized boundaries, permission denial/allow, failure/property partitions, repeated lifecycle stress, Windows native diagnostics, and Linux/WSL handoff | [`../conformance/f7/`](../conformance/f7/README.md) | Accepted Windows F7W; native Linux/ARM64/WSL CUDA incomplete |
| `runtime.facade` | Safe package API, private resource capabilities, stable errors, optional compiler ownership, standalone Device-JS helper, known-incompatible preflight, unconfirmed testing operation, and aggregate close | [`../components/runtime-facade/`](../components/runtime-facade/README.md) | Public Windows testing alpha; exact F8W evidence retained; mock-only portable consumer entry |
| `packaging.compatibility` | Exact package/API/Node/platform/capability/migration and evidence-invalidation identity | [`../packaging/compatibility-manifest.json`](../packaging/compatibility-manifest.json) | Accepted F8W; registry publication guarded |
| `conformance.f8` | Tarball contents, clean install/uninstall, first-consumer deletion, independent consumers, instance isolation, installed Windows execution, and Linux readiness | [`../conformance/f8/`](../conformance/f8/README.md) | Accepted Windows F8W; native Linux/ARM64/WSL CUDA incomplete |
| `conformance.f9` | Manifest-verified CUDA CCCL header profile, public-facade atomic publication, device-closed terminal launch, and cleanup | [`../conformance/f9/`](../conformance/f9/README.md) | Accepted exact Windows CUDA-JS prerequisite; cross-repository pair pending CUDA-MCGS |
| `conformance.node` | Exact Node release registry, FFI/permission probes, testing-unconfirmed/known-incompatible rows, and generated Node support list | [`../conformance/node/`](../conformance/node/README.md) and [`../docs/NODE_SUPPORT.md`](../docs/NODE_SUPPORT.md) | Active; exact Node 26.7.0 qualified, later FFI-capable rows testing-unconfirmed, missing-substrate rows known-incompatible |
| `conformance.hardware` | Exact-profile support registry, independent architecture/implementation/qualification/priority dimensions, qualification orchestration, read-only Hyper-V readiness, evidence indexing/sanitization, and generated public hardware list | [`../conformance/hardware/`](../conformance/hardware/README.md) and [`../docs/HARDWARE_SUPPORT.md`](../docs/HARDWARE_SUPPORT.md) | Active; one accepted Windows x64 GPU profile, one exact Hyper-V profile known-incompatible, broader axes not-qualified |

## Repository product areas

| Product area | Owns | Location | Current status |
|---|---|---|---|
| `components` | Generic runtime components with accepted ownership contracts | [`../components/`](../components/README.md) | F8 public facade over accepted internal Driver, compiler, Device-JS, diagnostics, resource, memory, and execution owners |
| `schemas` | Pinned CUDA facts, semantic overlays, Runtime IR and generated products | [`../schemas/`](../schemas/README.md) | F1B accepted; public production coverage not authorized |
| `conformance` | Production synthetic/native/public-contract capsules plus exact Node and hardware qualification | [`../conformance/`](../conformance/README.md) | F3 lifecycle through F8 package/public-facade accepted on Windows; exact Node/hardware registries active; portable/readiness controls run in Linux CI |
| `experiments` | Bounded decision experiments and their generated fixtures/harnesses | [`../experiments/`](../experiments/README.md) | EXP-000, Windows EXP-009, and Windows EXP-012 promoted; Linux EXP-001 prepared through the hardware boundary |
| `benchmarks` | Future reproducible mechanism/regression evidence | [`../benchmarks/`](../benchmarks/README.md) | Reserved |
| `packaging` | No-addon package, compatibility and release metadata | [`../packaging/`](../packaging/README.md) | F8 package/compatibility accepted; registry release guarded |
| `optional-nn-product` | Future separately published application-neutral NN training product | Location unselected; authority in [`../docs/decisions/ADR-0004-nn-extension-package-boundary.md`](../docs/decisions/ADR-0004-nn-extension-package-boundary.md) and [`../docs/specs/SPEC-0027-nn-extension-foundation.md`](../docs/specs/SPEC-0027-nn-extension-foundation.md) | Accepted product boundary; not implemented or qualified |
| `tools` | Schema/code-generation and developer tools | [`../tools/`](../tools/README.md) | F1B importer/generator accepted internal tooling |
| `tests` | Cross-component and end-to-end test ownership | [`../tests/`](../tests/README.md) | F9 generic prerequisite active; exact compatible pair pending CUDA-MCGS |
| `third-party` | Donor material with exact provenance and reuse decision | [`../third_party/`](../third_party/README.md) | Reserved |
| `scripts` | Thin validation and exact-toolchain experiment entry points | [`../scripts/`](../scripts/) | Active |

## Component anchors

These IDs organize implemented and future specifications. Status in the governing authority and rows above determines implementation authorization.

| Planned boundary ID | Intended responsibility | Governing authority needed before code |
|---|---|---|
| `runtime.facade` | Safe asynchronous public API and capability negotiation | Accepted SPEC-0008 plus F8 package, consumer, native Windows, and portable Linux evidence |
| `runtime.driver-actor` | Thread-affine CUDA context and raw-resource ownership | Accepted SPEC-0003 plus exact Windows native evidence; Linux native execution still requires F2L |
| `runtime.compiler-actor` | NVRTC/nvJitLink provider isolation, manifest-verified toolkit header profiles, validated cache, and artifact production | Accepted SPEC-0006/SPEC-0009 plus Windows EXP-009/F6W/F9 evidence; native Linux requires independent qualification |
| `runtime.cuda-target` | CUDA target syntax, repository admission policy, explicit compute-capability metadata, and policy identity | Accepted SPEC-0006 target-syntax addendum plus portable ownership/integration conformance |
| `runtime.device-js` | Restricted consumer-neutral JavaScript syntax/type/helper validation and deterministic private CUDA C++ lowering | Accepted SPEC-0013 plus portable translator, package-consumer, and later exact native promotion evidence |
| `runtime.resource-registry` | Opaque capability identity, generation, state and parent/child leases | Accepted SPEC-0003 and F3 conformance |
| `runtime.memory` | Bounded synchronous device allocation, copied transfers, quota, ranges, and lifetime | Accepted SPEC-0004 plus Windows F4W native conformance; later memory kinds need new contracts |
| `runtime.execution` | PTX/cubin module/function identity, packed launch, bounded access hazards/dependencies, memory leases, private stream/event completion, and terminality | Accepted SPEC-0005/SPEC-0016/SPEC-0018 plus exact native and installed-package conformance |
| `runtime.device-selection` | Sanitized opaque device enumeration/selection and selected-device target resolution | Accepted SPEC-0017 before production code; exact multi-device native evidence before support promotion |
| `runtime.operation-scheduler` | Finite multiple in-flight operations, private streams, dependencies, hazards and backpressure | `runtime.execution` implementation of accepted SPEC-0018; exact first profile is capacity two, two streams, no queue and one predecessor |
| `runtime.host-memory-transfer` | Internal pinned host staging and asynchronous transfer operations | Accepted/implemented SPEC-0019 first profile plus SPEC-0018 operation/dependency authority; caller registration/mapping remains later |
| `runtime.publication-mailbox` | Opaque named u32 host/device publication lanes, private SAB registration/mapping, generation, local host Atomics, and operation leases | Accepted/integrated SPEC-0014 first profile with exact Windows native and installed-package qualification |
| `runtime.prepared-execution` | Immutable prepared operation DAGs and optional private CUDA Graph realization | Accepted SPEC-0020 plus accepted SPEC-0018; provider/transfer nodes require their own accepted contracts |
| `runtime.device-view` | Closed dtype registry plus generic typed bounded views over opaque device allocations | Accepted SPEC-0021; library/application semantics remain separate |
| `runtime.device-js-parallel` | Trusted-source shared/local/warp/atomic/numeric Device-JS primitives | Accepted trusted portion of SPEC-0022 plus prerequisite dtype/view contracts |
| `runtime.device-js-service` | Bounded adversarial Device-JS admission with bounds, work budgets, quotas and tenant controls | Accepted service portion of SPEC-0022 plus accepted SPEC-0026 process isolation |
| `runtime.cuda-library-adapters` | Context-bound optional CUDA provider framework, generated ABI/semantic overlays, handles/plans/workspaces/operations | Accepted SPEC-0023 plus accepted scheduler/view dependencies |
| `runtime.multi-gpu` | Finite coordinator over selected per-device runtimes, peer/staged copies and cross-device dependencies | Accepted SPEC-0024 plus accepted SPEC-0017 and operation/memory dependencies |
| `runtime.graphics-interop` | Opaque API-specific external memory/resource imports and synchronization with exact device matching | Accepted SPEC-0025 plus accepted selection/scheduler/view dependencies and one concrete graphics profile |
| `backend.process-isolated` | Child-process Driver/compiler backends, bounded IPC, process epochs and supervised recovery | Accepted SPEC-0026 plus capability-specific native containment evidence |
| `runtime.platform-diagnostics` | Sanitized host/device classification and fail-closed profile assessment | Accepted SPEC-0007 plus exact Windows permission/device/stress evidence; every additional native profile requires independent qualification |
| `runtime.module-launch` | Module/function identity, argument packing and launch | Accepted ABI/launch specification plus native parity evidence |
| `runtime.completion` | Stream/event completion, cancellation and deferred errors | Accepted completion/error-health specification plus native evidence |
| `schema.header-facts` | Pinned official-header import and normalized ABI facts | Accepted schema/import specification and native layout oracle |
| `schema.semantic-overlay` | Reviewed blocking, ownership, lifecycle, safety and version meaning | Accepted semantic-overlay specification |
| `backend.node-ffi` | Private Node host-call substrate | Windows F2W accepted; each additional platform requires independent qualification evidence |
| `interop.cuda-mcgs` | Public package/capability boundary consumed by CUDA-MCGS (`iteathen/UMCGS`) | Accepted CUDA-JS public/header-profile contracts; exact compatible-pair evidence pending CUDA-MCGS integration |
| `nn.facade` | Finite optional NN public facade and capability negotiation | Accepted SPEC-0027 plus a separately accepted facade/package child specification |
| `nn.tensor` | Logical dtype, shape, layout, role, mutability, alias, and storage-view semantics | Accepted SPEC-0027 plus a separately accepted tensor child specification |
| `nn.operator` | Finite versioned operator schemas, typing, effects, forward meaning, and derivative-rule linkage | Accepted SPEC-0027 plus a separately accepted operator child specification |
| `nn.graph` | Provider-neutral typed staged graph and stable graph identity | Accepted SPEC-0027 plus accepted tensor and graph child specifications |
| `nn.autodiff` | Reverse-mode transformation, saved values, residuals, and rematerialization policy | Accepted SPEC-0027 plus accepted graph/operator/autodiff child specifications |
| `nn.memory-plan` | NN liveness, donation/alias, arena, residual, and bounded-workspace planning | Accepted SPEC-0027 plus accepted tensor/graph/autodiff/memory-plan child specifications and public core memory ports |
| `nn.provider-registry` | Finite provider capabilities, selection, identity, and distinct provider-unavailable/profile-incompatible/request-unsupported results | Accepted SPEC-0027 plus a separately accepted provider-registry child specification |
| `nn.provider.cublaslt` | Bounded NN GEMM plans over a generic current-device/stream/memory adapter | Accepted SPEC-0027 plus accepted generic library-adapter and cuBLASLt provider child specifications with exact native evidence |
| `nn.provider.cudnn` | Bounded cuDNN graph/operator plans over a generic context-bound adapter | Accepted SPEC-0027 plus accepted operator/tensor, generic library-adapter, and cuDNN provider child specifications with exact native evidence |
| `nn.provider.generated` | NN-specific lowering/source plans and logical association of typed artifacts returned by accepted core compiler contracts | Accepted SPEC-0027 plus accepted graph/compiler-provider child specifications; core retains compiler-provider/cache/output-byte ownership |
| `nn.execution-plan` | Immutable provider-neutral compiled training-step orchestration | Accepted SPEC-0027 plus accepted graph/memory/provider/execution-plan child specifications and public operation ports |
| `nn.training-state` | Optimizer, RNG, loss-scale, parameter, gradient, and persistent state semantics | Accepted SPEC-0027 plus a separately accepted training-state child specification |
| `nn.checkpoint` | Versioned logical state serialization, integrity, restore, and migration | Accepted SPEC-0027 plus a separately accepted checkpoint child specification |
| `nn.conformance` | Portable, package, numerical, native, lifecycle, and performance evidence partitions | Accepted SPEC-0027 plus a separately accepted mock/public conformance child specification |

## Changing the registry

A coherent registry change includes:

1. stable boundary ID and purpose;
2. owner and authoritative location;
3. public contract and dependency direction;
4. lifecycle and compatibility state;
5. validation/evidence owner;
6. migration, archive, cleanup, or supersession disposition;
7. corresponding index, status, plan, and caller updates where triggered.
