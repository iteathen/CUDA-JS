# CUDA-JS Open-Issue Development Sweep — 2026-08-14

**Status:** Informational

**Frozen input:** protected `main` `334b903be827dedb5345608a34a6df444912fe1b`, `cuda-js@0.1.0-alpha.5`

**Owner instruction:** process every open issue through investigate → assess → research → reassess → plan → authorized implementation → test.

## Governing interpretation

For this repository, “implement” means implement the dependency-ready node authorized by accepted authority. It does not mean bypass a proposal-state specification, fabricate unavailable native evidence, mutate an unavailable external control plane, or weaken a failing test. When an issue is externally/hardware/authority blocked, the durable implementation of this cycle is a current researched disposition, plan, dependency, and exact exit gate that prevents drift.

Architecture, implementation, qualification/support, and priority remain independent dimensions.

## Research/reassessment basis

The sweep rechecked current primary NVIDIA sources for CUDA 13.3 device/context ownership, streams/events, half/bfloat conversion, Linux/ARM64/Tegra/WSL profiles, CUDA Graphs, pinned/asynchronous memory, cuBLAS/cuBLASLt, cuDNN, and NCCL. Those sources continue to support the repository’s finite opaque capability model, private native ownership, explicit lifecycle, exact-profile qualification, and refusal to infer one platform/provider/GPU from another.

Three immediate authority conclusions resulted:

- **SPEC-0017 / #20:** accepted for sanitized opaque device selection and selected-device target resolution; portable implementation authorized, native multi-device qualification separate.
- **SPEC-0021 / #39/#88:** accepted after repairing the proposal’s conflict with finite-only SPEC-0011 `f32`; new `f64`/`f16`/`bf16` plus contiguous 1D typed-view v1 are authorized for portable implementation.
- **SPEC-0018 / #40:** remains proposal-only. #51 records a passing Windows candidate but explicitly says the candidate commits/evidence were not published/integrated; widening concurrency waits for verifiable current protected-main native SPEC-0016 evidence.

## Every open issue: current cycle result

| Issue | Reassessed outcome / plan | Implemented or blocked result | Test / exit gate |
|---|---|---|---|
| #4 | Native Linux x64 remains an exact environment qualification lane. | No fake support; blocker retained. | F2L→F8L independent native oracle, package, cleanup on controlled Ubuntu x64 GPU host. |
| #12 | Additional GPU families require exact per-model evidence. | Campaign retained; no architecture-wide inference. | `hardware:qualify` and independent oracle per exact GPU/profile. |
| #13 | WSL2 remains distinct from native Linux/Windows. | Dedicated profile retained. | Exact WSL2 Driver/compiler/package/cleanup capsule. |
| #14 | ARM64-SBSA is a separate ABI/provider target. | No x64 reuse claim. | Native ARM64 Node/Driver/compiler/package/cleanup evidence. |
| #15 | Jetson/Tegra memory/deployment differs from generic SBSA/dGPU; shared DRAM is not a generic zero-copy claim. | Profile-design blocker retained. | Accepted exact JetPack/Node/provider profile then native chain. |
| #16 | Controlled GPU hosts cannot be created by source code alone. | Infrastructure blocker retained. | Maintainer-controlled resettable hosts with bounded credentials/dispatch. |
| #17 | Distro expansion follows #4’s first native Ubuntu baseline. | Dependency retained. | Full exact row per distro; no blanket Linux support. |
| #20 | Split single-device selection foundation from later multi-GPU orchestration. | **SPEC-0017 accepted**; SPEC-0024 remains proposal. | Portable selector/target tests, then controlled multi-GPU oracle for distinct-device selection. |
| #21 | Virtualization profiles remain mechanism-specific; known-incompatible evidence is not rejection. | Deferred exact profiles retained. | Vendor-supported guest/host F1–F8 evidence per mechanism. |
| #22 | Compatibility must be exact Node/Driver/toolkit/provider cells. | Matrix plan retained. | Full chain per cell plus invalidation/expiry discipline. |
| #24 | ECC is controlled-hardware/read-only reliability evidence. | Deferred blocker retained. | Exact ECC host diagnostics and conservative fault-response evidence. |
| #26 | Windows Server/TCC is separate from WDDM. | External host blocker retained. | Exact TCC/server service/timeout/native/package/cleanup evidence. |
| #27 | MIG remains a preconfigured-admin topology profile, not architecture rejection. | Deferred. | At least two preconfigured instances with isolation/cleanup evidence. |
| #28 | Performance/thermal/soak are observational dimensions, never correctness substitutes. | Methodology retained. | Reproducible cold/warm/soak samples + terminal census. |
| #29 | Contributor evidence is not independently attested. | Runner/attestation infrastructure remains external. | Verifiable source/runner/toolchain/result attestation and sanitization. |
| #32 | Direct CUDA UMCGS prototype is not CUDA-JS compatible-pair evidence. | Generic F9 ownership retained; no MCGS semantics imported. | Exact CUDA-JS + UMCGS public-path pair/oracle/cleanup record. |
| #35 | SPEC-0010 RDC is already portable/software implemented. | No duplicate implementation; native promotion remains open. | Exact NVRTC/nvJitLink linkable-definition/package/oracle evidence. |
| #38 | Production sideband depends on accepted host-memory and operation/scheduler ownership. | Proposal-only; no premature mapped-memory code. | Accepted dependencies then native publication/lifetime ordering evidence. |
| #39 | New floating ABI needed explicit additive semantics. | **SPEC-0021 accepted** preserving finite-only `f32`. | Portable byte/layout/RNE/special-value mutations, then independent native mixed-signature oracle. |
| #40 | Multi-operation/private-stream design remains technically viable but gated. | **SPEC-0018 stays Proposal** pending #51 publication evidence. | Publish current-head native SPEC-0016 evidence first; then reassess/accept and prove mechanism-level ordering/overlap. |
| #42 | SPEC-0012 Device LTO is already portable/software implemented. | No duplicate implementation. | Exact native provider/artifact/cache/cleanup promotion. |
| #43 | SPEC-0013 Device-JS is portable/software/package implemented. | Native DJS-2 remains open. | Generated-source compiler/launch/oracle/lifecycle evidence on exact profile. |
| #51 | Portable SPEC-0016 exists; historical Windows OSC-3 candidate passed but was not published/integrated. | Publication/evidence dependency recorded. | Recover/recreate exact current-main delayed-kernel NOT_READY/fault/cleanup capsule and publish it. |
| #64 | EXP-013 responsiveness oracle repair is already integrated. | No further code change identified. | Exact merged-head Windows x64 Node 26.7.0 focused EXP-013 + full F5 rerun. |
| #68 | Private vulnerability reporting is an external GitHub setting and workflow. | Connector cannot satisfy setting/read-back/reporter/advisory proof. | `enabled:true` read-back plus unaffiliated private report and maintainer advisory management proof. |
| #70 | NN master technical research remains useful, but same-package `cuda-js/nn` assumptions are superseded. | Current authority is same repo, **separate publish unit**, package/dir unselected. | Child specifications accepted in dependency order; master issue alone never authorizes production NN code. |
| #72 | `nn.tensor` is the first NN child authority dependency. | No tensor code in generic core before accepted child spec. | Accepted tensor/storage/view/alias/checkpoint contract then portable/native evidence. |
| #73 | Typed staged graph depends on #72. | Blocked by child-spec order. | Deterministic graph normalization/inference/provider-port conformance. |
| #74 | Staged reverse-mode autodiff depends on #72/#73. | Blocked. | Symbolic/hand/finite-difference references, then provider/GPU evidence. |
| #75 | cuBLASLt remains the preferred mature first GEMM provider, but requires tensor/graph plus generic provider/execution foundations. | Blocked; no early provider passthrough. | Independent C/cuBLASLt parity, workspace/lifecycle, exact provider evidence. |
| #76 | Generated NN operators belong in the optional product and consume Device-JS. | Blocked on tensor/graph/autodiff and generic primitives. | Independent numerical references, fused/unfused equivalence, cleanup. |
| #77 | Static liveness/arena planning remains the first NN memory strategy; allocator APIs are implementation mechanisms. | Blocked on tensor/graph/autodiff. | Deterministic interference/packing/pressure + native guard/equivalence. |
| #78 | NN transfer must consume generic pinned-memory/operation contracts instead of duplicating them. | Blocked by SPEC-0018/0019 gates. | Byte oracle, ownership, device-side dependencies, overlap mechanism, cleanup. |
| #79 | Whole training DAG submission matters more than raw stream count; CUDA Graph remains optimization over ordinary DAG. | Blocked by graph/autodiff/memory and SPEC-0018/0020. | Ordinary DAG parity first, then graph replay/update/lifecycle/performance. |
| #80 | Training runtime requires explicit state/RNG/checkpoint transaction semantics. | Blocked by prior NN contracts/providers/execution. | Independent multi-step SGD/checkpoint/failure-state reference. |
| #81 | cuDNN is later bounded model-breadth provider. | Blocked by generic provider + NN semantic contracts. | cuDNN/C + CPU parity, workspace/plan/lifecycle. |
| #82 | cuBLASDx/CUTLASS is optimization, not the first general GEMM authority. | Deferred until mature baseline exists. | Representative workload equivalence and measured benefit including compile/resource cost. |
| #83 | NN qualification is an end-to-end evidence owner, not a component shortcut. | Plan retained. | First FP32 MLP gradient/multi-step/convergence/checkpoint/lifecycle; later Linux/modern-GPU breadth. |
| #84 | NN scale-out follows strong single-GPU and generic multi-GPU. | Deferred. | Multi-rank global-batch reference, failure/restart, exact topology/performance. |
| #85 | Prepared batch/CUDA Graph depends on generalized operations. | SPEC-0020 remains proposal-only. | Portable semantic DAG equivalence, then native graph mechanism/oracle/cleanup. |
| #86 | Pinned host memory/async transfers depend on generalized operations. | SPEC-0019 remains proposal-only. | Exact byte oracle, bounded staging, mechanism-level overlap, cleanup. |
| #87 | Trusted Device-JS parallel primitives should be added only from concrete generic demand after dtype/view foundation. | SPEC-0022 remains proposal. | Portable lowering + independent shared/warp/atomic native oracles. |
| #88 | Generic views were narrowed to the smallest trustworthy reusable slice. | **SPEC-0021 accepted:** contiguous 1D typed views v1. | Boundary/property/lifecycle tests then independent native/library range fixture. |
| #89 | Trusted Device-JS is not a sandbox; service safety needs bounds, budgets, quotas, process isolation. | Deferred under SPEC-0022 + SPEC-0026. | Adversarial out-of-range/nontermination/resource/cache/diagnostic tests. |
| #90 | Generic CUDA library adapters belong under DriverActor/current context with finite public semantics. | SPEC-0023 proposal retained pending scheduler + views. | Generated ABI/native provider lifecycle and missing-provider controls. |
| #91 | cuSPARSE depends on generic library adapter, views, scheduler, transfer. | Blocked. | CPU sparse reference + native provider/workspace/lifecycle. |
| #92 | cuRAND trusted-header and host-generator profiles remain distinct. | Blocked on generic adapter; no broad passthrough. | Header provenance/cache + independent native sequence/lifecycle evidence. |
| #93 | cuFFT plans/workspaces/layout/normalization need explicit bounded semantics. | Blocked. | CPU DFT/native provider parity + plan/workspace cleanup. |
| #94 | Graphics interop requires device matching, typed views, scheduler, API-specific external ownership. | SPEC-0025 proposal retained. | One concrete API direct-resource mechanism + ordering/cleanup proof. |
| #95 | Process isolation can improve process containment but cannot promise universal GPU/driver isolation. | SPEC-0026 proposal retained; no service claim. | Normal parity plus crash/hang/malformed IPC/stale epoch/recovery evidence. |
| #96 | Expansion qualification composes already-ready capabilities; it cannot replace component oracles. | Plan retained. | One clean exact revision, per-capability capsules, terminal resource census. |
| #107 | Coordination issue created for this owner-requested sweep. | Owns status reconciliation only; grants no capability authority. | Close only after the sweep packet is published and remaining dependency-ready work is preserved in `next_step.yaml`. |

## Dependency-ready execution order

```text
1. SPEC-0021 portable/software implementation (#39/#88)
2. SPEC-0017 portable/software implementation (#20)
3. repair/publish current-head native SPEC-0016 evidence (#51)
4. reassess SPEC-0018 (#40) only after step 3
5. then SPEC-0019 / SPEC-0020 / SPEC-0023 and their consumers in dependency order
6. NN child authority begins at #72; production remains a separate future publish unit
```

Hardware/external-control lanes proceed independently whenever their exact environments exist. They do not block unrelated portable work, and portable work never becomes a native-support claim by inference.

## Sweep packet exit criteria

- every open issue has a current researched disposition;
- stale #71 current-focus state is removed but preserved as completed provenance;
- accepted/proposal boundaries are contradiction-free;
- dependency-ready implementation order is explicit;
- blocked issues name exact missing authority/environment/control facts;
- documentation and repository checks pass;
- protected-main state is read back after merge.
