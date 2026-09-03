# CUDA-JS Long-Horizon Capability Candidate Map

**Status:** Informational

**Disposition:** Candidate inventory; not execution authority

**Recorded:** 2026-08-25

**Ownership reconciliation:** 2026-09-02

**Coordination:** [Issue #129](https://github.com/iteathen/CUDA-JS/issues/129), with protected document reconciliation on [#175](https://github.com/iteathen/CUDA-JS/issues/175)

## Purpose and non-authority

This map preserves credible future **CUDA-JS mechanism/provider** ideas without turning them into the current implementation queue. It is not an accepted specification, release promise, priority commitment, support claim, or authority for CUDA-JS to absorb an upper semantic product. An entry can be architecturally plausible while still being unselected, unimplemented, unqualified, and intentionally deferred.

The current execution path is owned by [`next_step.yaml`](../../next_step.yaml). This document does not duplicate or reorder that machine-readable state. Native Ubuntu qualification remains an independent contributor-evidence lane on #4, and current public truth remains [`CAPABILITIES.md`](../CAPABILITIES.md).

## Portfolio ownership split

CUDA-JS owns consumer-neutral runtime/compiler/device/memory/view/operation/synchronization/artifact/provider/resource-lifecycle mechanisms. Reusable meaning above those mechanisms belongs to the natural semantic repository:

- [`CUDA-JS-Tensor`](https://github.com/iteathen/CUDA-JS-Tensor) — generic Tensor mathematics/planning/execution, including future FFT, sparse and solver/factorization semantics;
- [`cuda-nn`](https://github.com/iteathen/cuda-nn) — reusable NN/model/inference/training semantics, including future cuDNN/TensorRT semantic eligibility/equivalence;
- [`CUDA-MCGS`](https://github.com/iteathen/CUDA-MCGS) — search/MCGS semantics;
- [`cuda-rng`](https://github.com/iteathen/cuda-rng) — provider-neutral RNG/distribution/reproducibility semantics;
- [`cuda-comm`](https://github.com/iteathen/cuda-comm) — provider-neutral collective/P2P/PGAS/RMA communication semantics;
- [`cuda-io`](https://github.com/iteathen/cuda-io) — GPU source/sink/storage-I/O semantics;
- [`cuda-media`](https://github.com/iteathen/cuda-media) — image/frame/video/codec-pipeline semantics;
- [`cuda-data`](https://github.com/iteathen/cuda-data) — columnar/table/dataframe semantics;
- [`cuda-ray`](https://github.com/iteathen/cuda-ray) — ray/geometry/traversal semantics;
- [`cuda-graph-analytics`](https://github.com/iteathen/cuda-graph-analytics) — graph representation/analytics semantics, explicitly distinct from CUDA-MCGS search.

A native/provider mechanism may remain CUDA-JS-owned while the semantics selecting and interpreting it live elsewhere. Provider availability never creates semantic implementation authority. Conversely, creation of a semantic repository does not move generic CUDA resource/lifecycle ownership upward.

Two naming traps are explicit:

- **CUDA Graphs** are CUDA execution mechanisms and remain CUDA-JS-owned; they do not belong to `cuda-graph-analytics`.
- graphics/external-memory/semaphore interop remains a CUDA-JS interoperability mechanism; it does not become `cuda-ray` or `cuda-media` ownership merely because a renderer/media consumer may use it.

## Status key

Each `State` cell records `architecture / implementation / qualification / priority` as independent dimensions.

- Architecture: `planned`, `deferred`, or `unselected`. Presence here does not automatically mean `planned`.
- Implementation: `implemented`, `partial`, or `not-implemented`.
- Qualification: `qualified`, `not-qualified`, or `not-applicable`; exact profile limits remain mandatory.
- Priority: `active`, `next`, `retained`, `horizon`, or an explicit dependency.
- Optional components do not enlarge the `cuda-js` core contract by implication.
- Implementation still requires an accepted owning contract, dependency readiness, bounded lifecycle/resources, public-surface review, exact evidence, and first-consumer deletion.

## Execution and dispatch

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-EXEC-01` | Operation-DAG submission | `planned / not-implemented / not-qualified / horizon` | Prepared-operation component; proposed SPEC-0020 after operation foundations. |
| `LH-EXEC-02` | Wider concurrent operations and multi-stream profiles | `planned / partial / qualified / horizon` | SPEC-0018 owns only the exact qualified capacity-two/two-private-stream profile. |
| `LH-EXEC-03` | CUDA Graph capture and replay | `planned / not-implemented / not-qualified / horizon` | CUDA-JS execution mechanism under proposed SPEC-0020; unrelated to `cuda-graph-analytics`. |
| `LH-EXEC-04` | Stream priorities | `unselected / not-implemented / not-qualified / horizon` | Execution scheduler with finite priority/fairness semantics. |
| `LH-EXEC-05` | Cooperative kernel launch | `unselected / not-implemented / not-qualified / horizon` | Execution plus occupancy/residency admission. |
| `LH-EXEC-06` | Completion notifications without public backoff polling | `unselected / partial / not-qualified / horizon` | SPEC-0016 owner; notification cannot silently advance consumer state. |
| `LH-EXEC-07` | Long-lived-operation signaling channel | `planned / partial / qualified / horizon` | SPEC-0014 mailbox and accepted SPEC-0022 publication primitives form the bounded first Windows profile. Upper Channel/search meaning remains consumer-owned. |
| `LH-EXEC-08` | Batched launch submission | `planned / not-implemented / not-qualified / horizon` | Prepared-operation component beneath the shared lifecycle. |
| `LH-EXEC-09` | MPS environment detection and qualification | `unselected / not-implemented / not-qualified / horizon` | Platform diagnostics; NVIDIA administration remains external. |

## Memory

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-MEM-01` | Bounded pinned-host memory profiles | `planned / implemented / qualified / retained` | SPEC-0019 exact private two-staging-block profile; caller-owned pinning is separate. |
| `LH-MEM-02` | Stream-ordered asynchronous H2D/D2H transfer | `planned / implemented / qualified / retained` | SPEC-0019 exact first profile; expansion remains bounded. |
| `LH-MEM-03` | Stream-ordered memory pools | `unselected / not-implemented / not-qualified / horizon` | Allocator pressure, stream, reuse, and teardown owner. |
| `LH-MEM-04` | Managed/unified memory | `unselected / not-implemented / not-qualified / horizon` | Distinct placement, migration, coherence, prefetch, and pressure capability. |
| `LH-MEM-05` | Operation-DAG buffer lifetime planning and arena reuse | `unselected / not-implemented / not-qualified / horizon` | Optional graph/compiler mechanism; Tensor/data/NN material planning stays above CUDA-JS. |
| `LH-MEM-06` | Caller-visible host-mapped memory | `planned / partial / not-qualified / horizon` | SPEC-0014 proves private mapped mailbox storage only. |
| `LH-MEM-07` | Peer-to-peer device memory access/copy | `planned / not-implemented / not-qualified / after:SPEC-0017` | Proposed SPEC-0024 topology and peer-access lifecycle; communication semantics remain `cuda-comm`. |
| `LH-MEM-08` | Texture and surface memory | `unselected / not-implemented / not-qualified / horizon` | Separate typed resource/view component. |
| `LH-MEM-09` | Constant-memory allocation/publication | `unselected / not-implemented / not-qualified / horizon` | Module/resource owner with symbol, size, ordering, and lifetime semantics. |
| `LH-MEM-10` | Shared-memory sizing introspection | `unselected / not-implemented / not-qualified / horizon` | Capability/launch-admission tooling. |
| `LH-MEM-11` | Explicit per-device budgets and admission control | `planned / partial / not-qualified / after:SPEC-0017` | Local quotas exist; aggregate device-scoped budgeting remains unselected. |

## Device-JS language

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-DJS-01` | `f16`/`bf16` scalar and buffer kinds | `planned / implemented / not-qualified / native-evidence` | SPEC-0021 portable/package scalar and typed-view kinds. |
| `LH-DJS-02` | `f64` scalar and buffer kind | `planned / implemented / not-qualified / native-evidence` | SPEC-0021 portable/package path. |
| `LH-DJS-03` | Fixed vector values | `unselected / not-implemented / not-qualified / horizon` | Restricted Device-JS type/lowering owner. |
| `LH-DJS-04` | Bounded struct/record values | `unselected / not-implemented / not-qualified / horizon` | Device-JS plus explicit ABI/layout authority. |
| `LH-DJS-05` | Fixed-size array values | `unselected / not-implemented / not-qualified / horizon` | Compile-time finite size and layout. |
| `LH-DJS-06` | Bounded byte-sequence helpers | `unselected / not-implemented / not-qualified / horizon` | Device-JS standard library; text encoding remains outside the primitive. |
| `LH-DJS-07` | Cross-module device-function calls | `planned / implemented / qualified / linux-evidence` | SPEC-0010 RDC and SPEC-0012 LTO are qualified on the recorded Windows profile only. |
| `LH-DJS-08` | Bounded compile-time specialization/generic authoring | `unselected / not-implemented / not-qualified / horizon` | Avoid unrestricted CUDA C++ template semantics. |
| `LH-DJS-09` | `switch`/`case` syntax | `unselected / not-implemented / not-qualified / horizon` | Restricted grammar/type/lowering owner. |

Dynamic parallelism and recursion are intentionally absent because they conflict with the present bounded, explicit resource model. Reconsideration would require new owner authority, not a roadmap checkbox.

## Optional math, algorithm, media, and provider mechanisms

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-LIB-01` | cuBLAS/cuBLASLt adapter | `planned / implemented / qualified / retained` | CUDA-JS provider mechanism under accepted SPEC-0023/SPEC-0029; Tensor/NN mathematical semantics remain external. |
| `LH-LIB-02` | cuDNN adapter | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #163 lower provider mechanism; NN semantic mapping belongs `cuda-nn` #11. |
| `LH-LIB-03` | cuFFT adapter | `planned / not-implemented / not-qualified / horizon` | CUDA-JS #93 lower provider mechanism; FFT mathematical semantics belong CUDA-JS-Tensor #41. |
| `LH-LIB-04` | cuRAND adapter | `planned / not-implemented / not-qualified / horizon` | CUDA-JS #92 lower provider mechanism; RNG/reproducibility/distribution semantics belong `cuda-rng` #3. |
| `LH-LIB-05` | cuSPARSE adapter | `planned / not-implemented / not-qualified / horizon` | CUDA-JS #91 lower provider mechanism; sparse Tensor/matrix semantics belong CUDA-JS-Tensor #42. |
| `LH-LIB-06` | cuSOLVER adapter | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #168 lower provider mechanism; solver/factorization/eigen/SVD semantics belong CUDA-JS-Tensor #43. |
| `LH-LIB-07` | Reusable sort/scan/reduce algorithms | `unselected / not-implemented / not-qualified / horizon` | Generic Device-JS algorithms component only when independently useful; table/graph/Tensor semantics remain external. |
| `LH-LIB-08` | Reusable block/warp primitives | `unselected / not-implemented / not-qualified / horizon` | Optional CUDA-JS standard-primitives component with no upper-domain vocabulary. |
| `LH-LIB-09` | NPP image/signal provider mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #172 lower provider lane; image/frame semantics belong `cuda-media` #3. |
| `LH-LIB-10` | nvJPEG image-codec provider mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #172 lower provider lane; image/codec semantics belong `cuda-media` #3. |
| `LH-LIB-11` | NVDEC/NVENC video provider mechanisms | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #172 lower provider lanes; decode/encode/frame-queue semantics belong `cuda-media` #3. |
| `LH-LIB-12` | TensorRT inference-engine provider mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #174 lower resource/provider lane; NN eligibility/fallback/equivalence belongs `cuda-nn` #18 after inference gate #2. |
| `LH-LIB-13` | OptiX ray-provider/compiler/resource mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #173 lower provider lane; ray/geometry/traversal semantics belong `cuda-ray` #3. |

No cuDF/libcudf or cuGraph provider is selected by this inventory. Columnar/table semantics live in `cuda-data`; graph-analysis semantics live in `cuda-graph-analytics`. Add a lower provider mechanism only when a concrete semantic profile proves that one is natural and consumer-neutral.

## Multi-GPU and scale-out

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-SCALE-01` | Enumeration, opaque selection, and one context owner per device | `planned / not-implemented / not-qualified / next-after:#4` | Accepted SPEC-0017/#20; remains generic CUDA-JS device ownership. |
| `LH-SCALE-02` | NCCL provider mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #164 lower provider; collective/P2P semantics belong `cuda-comm` #3. |
| `LH-SCALE-03` | Peer-access topology discovery | `planned / not-implemented / not-qualified / after:SPEC-0017` | Proposed SPEC-0024; output remains sanitized and finite. Communication topology policy stays `cuda-comm`/consumer-owned. |
| `LH-SCALE-04` | MIG discovery and isolation-aware ownership | `deferred / not-implemented / not-qualified / horizon` | Platform/device profile; CUDA-JS does not administer MIG. |
| `LH-SCALE-05` | Multi-node/distributed runtime mechanisms | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS may own only generic physical/device/runtime mechanisms; provider-neutral communication semantics belong `cuda-comm`; cluster orchestration remains external. |
| `LH-SCALE-06` | Cross-device event/dependency semantics | `planned / not-implemented / not-qualified / after:SPEC-0017` | Proposed SPEC-0024 coordinator; distinct from P2P and communication policy. |
| `LH-SCALE-07` | NVSHMEM provider mechanism for PGAS/RMA and GPU-initiated communication | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #169 lower mechanism; provider-neutral PGAS/RMA meaning belongs `cuda-comm` #3. |

The first CUDA-MCGS-relevant profile remains finite independent device-resident replicas with pre-ignition assignment and final aggregation after terminal per-device operations. Later MCGS use of `cuda-comm` does not move search semantics into either CUDA-JS or CUDA-COMM.

## Profiling, diagnostics, and resilience

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-OBS-01` | Public event-based timing | `unselected / partial / not-qualified / horizon` | Private events exist; public clock/synchronization/error semantics do not. |
| `LH-OBS-02` | Nsight Systems/Compute hooks | `unselected / not-implemented / not-qualified / horizon` | Optional observability component. |
| `LH-OBS-03` | Bounded device debug logging/`printf` | `unselected / not-implemented / not-qualified / horizon` | Development-only Device-JS/compiler profile. |
| `LH-OBS-04` | Live memory-usage reporting | `planned / partial / not-qualified / horizon` | Owned allocation/quota records exist; provider/global observations need a contract. |
| `LH-OBS-05` | Occupancy/launch-configuration advisor | `unselected / not-implemented / not-qualified / horizon` | Profile-specific advisory tooling, not execution authority. |
| `LH-OBS-06` | Fault-injection harness | `planned / partial / not-qualified / horizon` | Existing injected actor/resource controls can become a reusable harness. |
| `LH-OBS-07` | Structured host-side tracing | `unselected / not-implemented / not-qualified / horizon` | Optional adapter; cannot imply unobserved device-internal timing. |

## Platform and toolchain

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-PLAT-01` | Native Linux x86-64 parity | `planned / partial / not-qualified / active:#4` | OS-neutral architecture; exact Ubuntu 24.04 first cell. |
| `LH-PLAT-02` | Linux ARM64 SBSA and Jetson profiles | `planned / partial / not-qualified / horizon` | Separate ABI/provider/deployment profiles. |
| `LH-PLAT-03` | Multi-toolkit compatibility matrix | `unselected / not-implemented / not-qualified / horizon` | Exact generated/provider/native evidence per cell. |
| `LH-PLAT-04` | Driver/toolkit/provider detection and guidance | `planned / partial / not-qualified / active:#4` | Diagnostics and compatibility manifest; Linux admission is the immediate node. |
| `LH-PLAT-05` | Container qualification/reference images | `unselected / not-implemented / not-qualified / horizon` | Host Driver/device exposure remains external. |
| `LH-PLAT-06` | Non-conformant CPU/WebGPU API-shape emulator | `unselected / not-implemented / not-applicable / horizon` | Separate development tool, never a CUDA fallback claim. |

## Interoperability

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-INT-01` | Graphics resource interop | `planned / not-implemented / not-qualified / after:SPEC-0017` | CUDA-JS mechanism under proposed SPEC-0025; does not move to ray/media repos. |
| `LH-INT-02` | Native N-API coexistence contract | `unselected / not-implemented / not-qualified / horizon` | Embedding boundary with no raw capability leakage. |
| `LH-INT-03` | Cross-process CUDA memory IPC | `unselected / not-implemented / not-qualified / horizon` | Process/IPC mechanism with identity, lifetime, revocation, and failure ownership. |
| `LH-INT-04` | DLPack-style buffer/view exchange mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS may own only generic device-view/lifetime/synchronization mechanics; Tensor interchange semantics belong CUDA-JS-Tensor. |
| `LH-INT-05` | Larger-native-runtime embedding contract | `unselected / not-implemented / not-qualified / horizon` | Public composition boundary beyond CUDA-MCGS. |
| `LH-INT-06` | External-memory and external-semaphore contracts | `planned / not-implemented / not-qualified / after:SPEC-0017` | Consumer-neutral base for selected graphics/IPC profiles. |
| `LH-INT-07` | GPUDirect RDMA peer-memory registration/data-movement mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #171 lower mechanism; provider-neutral remote communication semantics belong `cuda-comm` #3. |

## Compilation and caching

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-COMP-01` | Persistent cross-run disk cache | `planned / partial / not-qualified / horizon` | Process-local identity exists; disk trust, locking, invalidation, quota, and cleanup remain. |
| `LH-COMP-02` | Ahead-of-time artifact preparation | `planned / partial / qualified / horizon` | Prepared PTX/cubin are accepted; first-class production workflow remains unselected. |
| `LH-COMP-03` | Sequential-kernel fusion assistant | `unselected / not-implemented / not-qualified / horizon` | Optional graph/compiler tooling; no consumer semantic policy in core. |
| `LH-COMP-04` | Static analysis for accepted raw CUDA inputs | `unselected / not-implemented / not-qualified / horizon` | Optional tooling; Device-JS remains the bounded authoring surface. |
| `LH-COMP-05` | Multi-architecture fat-binary generation | `unselected / not-implemented / not-qualified / horizon` | Finite targets and exact artifact/cache/package identity. |

## Errors, restart, and containment

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-ERR-01` | Poisoned-context teardown and fresh-owner restart orchestration | `planned / partial / not-qualified / horizon` | Actors report restart-required truth; consumer checkpoints/resubmission remain consumer-owned. |
| `LH-ERR-02` | Retryability classification and bounded opt-in retry | `unselected / not-implemented / not-qualified / horizon` | Arbitrary GPU operations are never replayed without declared idempotence. |
| `LH-ERR-03` | Richer typed error taxonomy | `planned / partial / qualified / horizon` | Current bounded profiles already distinguish validation/native/deferred/poison/restart categories. |
| `LH-ERR-04` | Completion deadlines and runaway-kernel containment | `planned / partial / not-qualified / horizon` | Wait timeouts exist; clean preemption is not promised. |

## Developer tooling

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-DEV-01` | Interactive Device-JS playground | `unselected / not-implemented / not-qualified / horizon` | Separate tool using public contracts. |
| `LH-DEV-02` | Editor syntax and inline diagnostics | `unselected / not-implemented / not-qualified / horizon` | Separate language tooling. |
| `LH-DEV-03` | Public ergonomic kernel unit-test harness | `planned / partial / not-qualified / horizon` | Existing conformance capsules are a base, not the public product. |
| `LH-DEV-04` | Generated TypeScript declarations from Device-JS signatures | `unselected / not-implemented / not-qualified / horizon` | Generated declarations do not replace runtime validation. |
| `LH-DEV-05` | Visual launch-configuration debugger | `unselected / not-implemented / not-qualified / horizon` | Separate tooling over public records. |

## Streaming and data movement

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-DATA-01` | Generic transfer/source-sink admission hooks for streaming consumers | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS candidate only for lower transfer/resource mechanics proven reusable; streaming source/sink semantics belong `cuda-io`. |
| `LH-DATA-02` | Bounded transfer/operation backpressure primitives | `planned / partial / not-qualified / horizon` | Finite actor queues/signaling are foundations; full pipeline/backpressure semantics belong natural upper owners such as `cuda-io`/`cuda-media`/`cuda-data`. |
| `LH-DATA-03` | GPUDirect Storage/cuFile direct-storage mechanism | `unselected / not-implemented / not-qualified / horizon` | CUDA-JS #170 lower mechanism; provider-neutral I/O semantics belong `cuda-io` #3. |
| `LH-DATA-04` | Transfer-adjacent compression/decompression primitives | `unselected / not-implemented / not-qualified / horizon` | Generic mechanism only if independently reusable; codec/data meaning stays with the natural semantic owner. |

## External semantic portfolios without selected CUDA-JS provider rows

The following integrated repositories intentionally do **not** create CUDA-JS provider work merely by existing:

- `cuda-data` owns columnar/table/dataframe semantics; no cuDF/libcudf provider is selected.
- `cuda-graph-analytics` owns graph representation/analytics semantics; no cuGraph provider is selected.

If a concrete profile later demonstrates a missing lower native/provider mechanism, create a bounded CUDA-JS issue/spec at that time rather than pre-authorizing a vendor surface now.

## Ecosystem and governance

| ID | Candidate | State | Natural owner / constraint |
|---|---|---|---|
| `LH-ECO-01` | Versioned third-party extension manifest/contract, with a registry only after multiple real extensions prove it | `unselected / not-implemented / not-qualified / horizon` | Extension ownership and compatibility precede ecosystem discovery. |
| `LH-ECO-02` | Semver-stable API and deprecation policy | `planned / not-implemented / not-applicable / after:alpha` | Versioned prerelease contracts exist; stability is not promised. |
| `LH-ECO-03` | Transparent native CUDA C++ benchmark suite | `planned / partial / not-qualified / horizon:#28` | Exact workloads, raw results, noise limits, and cleanup. |
| `LH-ECO-04` | Non-search example gallery | `unselected / not-implemented / not-applicable / horizon` | Public-contract examples only. |
| `LH-ECO-05` | Lightweight public capability/RFC process | `planned / partial / not-applicable / horizon` | This map is inventory; accepted specs and focused issues remain decisions. |

## Explicit exclusions

This map does not include Tensor mathematics, NN/model/training semantics, MCGS/search semantics, RNG/distribution policy, provider-neutral communication meaning, storage-I/O pipeline meaning, media semantics, columnar/dataframe semantics, ray/geometry semantics, graph-analytics semantics, downstream product policy, in-process untrusted-kernel sandbox claims, CUDA-JS administration of MPS/MIG, consumer checkpoint recovery, CPU/WebGPU substitution presented as CUDA compatibility, or transparent multi-node behavior in one runtime.

## Activation gate

A horizon candidate advances only when the machine-readable current path is not displaced without an explicit owner decision, a generic lower-layer need and natural owner are demonstrated, the upper semantic owner is separately identified, competing paths are assessed, an accepted specification owns the bounded lifecycle/public contract, dependencies are ready, exact evidence/cleanup plans exist, and first-consumer deletion proves that no upper-domain vocabulary became CUDA-JS authority.
