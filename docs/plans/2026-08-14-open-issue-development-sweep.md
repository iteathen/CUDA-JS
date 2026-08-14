# CUDA-JS Open-Issue Development Sweep — 2026-08-14

**Status:** Active execution record beneath accepted authority

**Frozen input:** protected `main` `334b903be827dedb5345608a34a6df444912fe1b`, `cuda-js@0.1.0-alpha.5`

**Owner instruction:** process every open issue through investigate → assess → research → reassess → plan → authorized implementation → test.

## Governing interpretation

“Implement” means implement the **dependency-ready, accepted-authority node** for that issue. It does not mean bypass an unaccepted specification, fabricate unavailable native evidence, mutate external infrastructure through an unavailable control plane, or weaken a test to close an issue. For a blocked issue, the implemented outcome of this cycle is the durable researched disposition/plan/blocker that keeps later work from drifting.

Architecture, implementation, qualification/support and priority remain independent dimensions.

## Cross-cutting research/reassessment

Primary sources checked against the current 2026-08-14 baseline include:

- CUDA 13.3.1 Driver device management and contexts: https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__DEVICE.html and https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__CTX.html
- CUDA streams/events/asynchronous execution: https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__STREAM.html and https://docs.nvidia.com/cuda/cuda-driver-api/group__CUDA__EVENT.html
- CUDA 13.3 half/bfloat semantics: https://docs.nvidia.com/cuda/cuda-math-api/
- CUDA 13.3 Linux distribution/architecture support: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/
- CUDA on Tegra memory/profile differences: https://docs.nvidia.com/cuda/cuda-for-tegra-appnote/
- WSL CUDA deployment: https://docs.nvidia.com/cuda/wsl-user-guide/
- CUDA Graphs: https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html
- pinned/asynchronous memory: https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/understanding-memory.html and https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html
- cuBLAS/cuBLASLt: https://docs.nvidia.com/cuda/cublas/
- cuDNN Backend/Graph: https://docs.nvidia.com/deeplearning/cudnn/backend/latest/
- NCCL: https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/

The research continues to support the repository’s existing design direction: finite opaque capabilities, private context/stream/event/provider ownership, explicit lifecycle, exact profile qualification, and no inference from one platform/GPU/provider to another.

## Foundation decisions produced by this sweep

### SPEC-0017 / #20

Adversarial review selected the existing opaque-snapshot/device-selector design. Raw ordinals or stable hardware identifiers remain rejected; a live runtime cannot switch devices. SPEC-0017 is accepted in the current authority packet. Portable implementation is now authorized; native multi-device qualification remains separate.

### SPEC-0018 / #40

The design remains sound, but its own widening gate is not satisfied on protected main. #51 records a passing Windows candidate (`f2ff9cce...` plus follow-up local result commit) but explicitly states those candidate commits/evidence were not pushed/integrated. Therefore SPEC-0018 remains a proposal. No production multi-stream scheduler is implemented in this sweep packet.

### SPEC-0021 / #39/#88

Adversarial review found one authority contradiction: the proposal’s “all floating kinds” NaN/infinity wording conflicted with accepted SPEC-0011 finite-only `f32`. The accepted revision preserves `f32` exactly and scopes the new explicit special-value contract to `f64`/`f16`/`bf16`. Device-view v1 is narrowed to contiguous 1D ranges. SPEC-0021 is accepted in the current authority packet; portable implementation is now authorized.

## Issue-by-issue cycle result

| Issue | Investigate / assess | Research / reassess | Plan | Implemented in this cycle | Test / exit |
|---|---|---|---|---|---|
| #4 Linux x64 | Native Driver→package chain still lacks a qualified GPU host. | CUDA 13.3 continues to list Ubuntu 24.04 x86_64 as a validated profile; distro support does not prove CUDA-JS support. | Preserve F2L→F8L runbook and run only on exact controlled host. | Blocker/control state refreshed; no fake Linux support. | Exact native oracle + installed package + terminal cleanup required. |
| #12 hardware campaign | Broad GPU architecture coverage remains qualification work. | Vendor architecture/toolkit compatibility is insufficient for framework promotion. | Acquire exact hosts, run standardized qualification capsule per model/profile. | Dependency retained; no inferred architecture-wide support. | `hardware:qualify` + independent oracle per exact profile. |
| #13 WSL2 | Distinct Windows-host/Linux-user-space Driver bridge. | NVIDIA WSL guidance remains a separate deployment mechanism, not native Linux/Windows equivalence. | Run dedicated WSL2 profile after exact host is available. | Blocker retained. | Full WSL2 F2–F8 exact evidence. |
| #14 Linux ARM64 SBSA | Separate ABI/provider target. | CUDA 13.3 explicitly lists ARM64-SBSA distributions separately. | Keep independent ABI generation/oracles; do not reuse x64 claims. | Blocker retained. | Native ARM64 Node/Driver/compiler/package/cleanup capsule. |
| #15 Jetson | Profile differs from generic SBSA and dGPU. | Current Tegra docs confirm shared SoC DRAM has distinct caching/access semantics; “same physical DRAM” is not generic zero-copy. | Define exact JetPack/Ubuntu/Node/provider profile before support work. | Research disposition reinforced; no zero-copy inference. | Accepted Jetson profile then exact F1–F8 native evidence. |
| #16 controlled hosts | Source cannot manufacture controlled GPU infrastructure. | Qualification trust requires maintained/resettable host identity and safe dispatch. | Acquire/sponsor hosts; keep persistent runners from unreviewed fork code. | Infrastructure blocker retained. | Runner ownership/image/credential/reset evidence. |
| #17 Linux distro matrix | Depends on #4 native Ubuntu baseline. | CUDA 13.3 supports multiple distro/version cells, but each has distinct loader/glibc/toolchain facts. | Finish #4 first, then exact rows per distro. | Dependency retained. | Complete exact profile capsule per promoted distro. |
| #20 device selection / multi-GPU | Device selection foundation and later orchestration were conflated in one issue. | Driver API directly supports finite enumeration; privacy/lifecycle still require opaque selectors. | Accept SPEC-0017 now; leave SPEC-0024 multi-GPU downstream. | **SPEC-0017 accepted** in this packet. | Portable selector/target tests next; multi-GPU native evidence later. |
| #21 virtualization | Prior exact Hyper-V path is known-incompatible, not architecturally rejected. | Virtualization mechanisms differ in Driver presentation/reset/permissions. | Keep separate GPU-P/DDA/cloud/vGPU profiles. | Deferred disposition retained. | Vendor-supported exact guest/host native capsule. |
| #22 compatibility matrix | Exact Node/Driver/toolkit/provider combinations remain sparse. | Driver/toolkit compatibility does not establish Node-FFI/package correctness. | Matrix only exact tested cells; automate invalidation. | Plan retained. | Independent full-chain pass per cell. |
| #24 ECC | Requires ECC-capable controlled hardware; no code-only proof. | ECC mode/error state is hardware/Driver evidence, not a generic API assumption. | Read-only capability/reporting profile; never toggle/inject destructively. | Deferred blocker retained. | Exact ECC host diagnostics + conservative fault-response evidence. |
| #26 Windows Server/TCC | Current qualified Windows baseline is WDDM. | TCC/headless/service behavior is a separate profile. | Test only on admin-preconfigured controlled host; repo never changes mode. | Blocker retained. | F1–F8 + service/timeout/cleanup exact evidence. |
| #27 MIG | No MIG support claim; administratively configured instances only. | MIG identities/topology/lifecycle differ from physical multi-GPU. | Wait for MIG-capable controlled hardware and accepted profile. | Deferred disposition retained. | At least two preconfigured instances with isolation/cleanup evidence. |
| #28 performance/soak | Correctness and performance remain separate. | Timing alone cannot prove concurrency or correctness; thermal/power are observational facts. | Reproducible cold/warm/soak methodology on controlled hosts. | Plan retained; no performance claim added. | Raw-sample digests + terminal census; failures block support, speed never grants it. |
| #29 runner attestations | Contributor bundles are not independently attested. | Trust requires approved source SHA, runner image, credentials, sanitization, signing/attestation lifecycle. | Build resettable maintainer-controlled dispatcher/attestation path. | Infrastructure design remains current; external setup required. | Third-party-verifiable sanitized attestation. |
| #32 UMCGS compatible pair | CUDA-only prototype is not CUDA-JS evidence. | Atomic publication and one-launch lifecycle remain generic; exact pair requires independent consumer revision. | Preserve F9 generic owner; freeze exact CUDA-JS+UMCGS pair only when both sides are publishable. | Blocker retained; no MCGS semantics imported. | Exact compatible-pair public-path oracle and cleanup. |
| #35 RDC | Accepted SPEC-0010 is already portable/software implemented. | Current issue is native promotion, not missing architecture. | Do not rewrite; run exact NVRTC/nvJitLink RDC oracle on qualified host. | Status preserved as implemented/unqualified. | Native linkable-definition/public-package evidence. |
| #38 sideband | Production mailbox still lacks accepted mapped/registered-host-memory foundation. | Event/operation lifetime must remain SPEC-0016/0018-owned; mapping/coherence is separate. | Revisit after accepted/implemented host-memory contract and scheduler dependency. | Proposal-only; no production sideband scaffolding. | Native publication ordering/generation/lifetime evidence after dependencies. |
| #39 f64/f16/bf16 | Proposal was nearly sound but conflicted with SPEC-0011 `f32`. | CUDA half/bfloat docs support RNE; explicit host packing remains framework-owned. | Preserve finite-only `f32`; add exact new-kind bit contracts. | **SPEC-0021 accepted**; implementation authorized. | Portable byte/mutation suite, then independent native mixed-signature oracle. |
| #40 multi-operation scheduling | Design sound but explicitly gated on trustworthy published SPEC-0016 native evidence. | #51 candidate native run passed but its exact commits/evidence never reached protected main. | Repair #51 publication first; then acceptance review of SPEC-0018. | Kept proposal-only; no unsafe scheduler implementation. | Gate: published exact native SPEC-0016 evidence + protected checks. |
| #42 Device LTO | Accepted SPEC-0012 already portable/software implemented. | Remaining work is native provider/artifact promotion. | Do not duplicate compiler work. | Status preserved. | Exact NVRTC/nvJitLink LTO oracle/cache/cleanup evidence. |
| #43 Device-JS | Accepted SPEC-0013 already portable/software/package implemented. | Restricted-language design remains appropriate; native generated-source execution is the open gate. | Run DJS-2 native consumer-neutral fixtures on qualified host. | Status preserved. | Native compiler/launch/oracle/lifecycle + unsupported syntax controls. |
| #51 operations | Portable SPEC-0016 implemented; provenance repair integrated. | Candidate Windows OSC-3 passed including NOT_READY and controlled trap, but candidate evidence commits were not published. | Recover/recreate exact evidence on current main or publish verifiable equivalent; do not infer. | Publication blocker recorded; downstream #40 remains gated. | Protected-main exact Windows promotion capsule. |
| #64 EXP-013 timer oracle | Repair is implemented; issue only lacks merged-head exact Windows F5 rerun. | Timer-count threshold was invalid on Windows; replacement application-turn oracle is sound. | Rerun focused EXP-013 + F5 on exact current head. | No further code change. | Exact Windows Node 26.7 F5 required before close. |
| #68 private vuln reporting | Source policy exists but GitHub setting/control path is external. | Current connector lacks private-vulnerability-reporting setting mutation/read-back and reporter/advisory flow. | Maintainer enables setting, read-backs, verifies unaffiliated report + advisory management. | Exact external blocker retained. | GitHub setting `enabled:true` + end-to-end private report proof. |
| #70 NN master program | Architecture authority changed after issue was written: same repo, **separate future publish unit**, not `cuda-js/nn` same package. | Provider/context/autodiff research remains useful; packaging assumptions are stale. | Reconcile program language, then accept child specs in dependency order. | Program remains open; stale same-package assumptions flagged. | First exit is accepted child authority, not NN implementation claims. |
| #72 NN tensors | Concept is dependency-ready only after a child spec is accepted. | Logical tensor vs physical storage split remains sound; generic core must stay tensor-free. | Draft/review `nn.tensor` child spec under SPEC-0027; select future package identity separately. | No production tensor code before child acceptance. | Portable shape/dtype/view/alias/checkpoint semantics then native storage evidence. |
| #73 NN graph | Depends #72 child authority. | Typed staged SSA/ANF-style graph remains preferable to dynamic eager mutation for deterministic transforms/planning. | Accept only after #72 contract; keep provider/native details out of semantic IR. | Blocked by child-spec order. | Deterministic graph normalization/inference/provider-port tests. |
| #74 NN autodiff | Depends #72/#73. | Staged reverse-mode + explicit residual/rematerialization remains sound. | Child spec after graph semantics are fixed. | Blocked by dependencies. | Symbolic/hand/finite-difference JS references then GPU provider evidence. |
| #75 cuBLASLt NN provider | Depends tensor/graph + generic library/execution foundations. | cuBLASLt remains the mature first GEMM provider; context/current-device ownership must remain private. | Wait for #72/#73 plus accepted generic provider/operation contracts. | No provider code early. | Independent C/cuBLASLt parity + exact provider/workspace/cleanup. |
| #76 generated NN operators | Depends tensor/graph/autodiff and Device-JS primitives. | Device-JS remains correct compiler-owned path; NN semantics stay in optional product. | Accept provider child contract after prerequisites. | Blocked. | Generated-vs-independent reference, fused/unfused equivalence, cleanup. |
| #77 NN memory planner | Depends tensor/graph/autodiff. | Static liveness/arenas remain preferable first step; `cudaMallocAsync` is optional implementation mechanism, not semantics. | Child spec after residual/alias rules exist. | Blocked. | Deterministic packing/interference/pressure + native guard/equivalence tests. |
| #78 NN transfer path | Depends tensors and generalized operations/host-memory. | Pinned memory is required for genuine async host-device transfers; copy-count and lifetime need explicit ownership. | Consume generic SPEC-0019/0018 rather than duplicate them. | Blocked by generic proposal gates. | Byte oracle, ownership transfer, dependency, overlap mechanism, cleanup. |
| #79 NN execution/graphs | Depends graph/autodiff/memory + generalized operations. | Whole DAG submission matters more than raw stream count; CUDA Graph is optimization over ordinary DAG baseline. | Wait for SPEC-0018/0020 and NN child specs. | Blocked. | Ordinary DAG parity first, then graph replay/update/lifecycle/perf. |
| #80 NN training runtime | Depends tensor/graph/autodiff/providers/memory/execution. | Explicit staged state/RNG/checkpoint transaction model remains sound. | Child spec after prerequisites; SGD first. | Blocked. | CPU reference multi-step/checkpoint/failed-update state evidence. |
| #81 cuDNN NN provider | Later model-breadth provider. | cuDNN Backend/Graph remains appropriate for bounded convolution/normalization/attention plans. | Wait for generic provider framework + NN semantic contracts. | Blocked. | Independent cuDNN/C + CPU parity, workspace/plan/cleanup. |
| #82 cuBLASDx/CUTLASS | Optimization provider, not foundation. | Device-resident/fusion value is workload-specific and must beat/simplify mature baseline. | Defer until cuBLASLt/generated baseline and exact header/license/profile research. | Deferred. | Representative workload equivalence + measured benefit. |
| #83 NN qualification | End-to-end evidence owner, not component implementation owner. | Gradient correctness, convergence, checkpoint, lifecycle and benchmarks must remain distinct gates. | Activate after first complete single-GPU chain exists. | Plan retained. | FP32 MLP independent oracle/convergence/checkpoint first, then Linux/modern GPU. |
| #84 NN scale-out | Deferred after strong single-GPU qualification and generic multi-GPU. | NCCL is stream-ordered, topology-aware and appropriate later; one GPU/process remains the clearest first failure boundary. | Wait for #83 + #20/SPEC-0024. | Deferred. | Multi-rank global-batch reference, failure/restart, exact topology/perf. |
| #85 prepared/CUDA Graph | SPEC-0020 proposal; depends generalized operations. | Semantic prepared batch should precede CUDA Graph realization. | Keep proposal until SPEC-0018 accepted/implemented. | No production code. | Portable DAG equivalence then native graph mechanism/oracle/cleanup. |
| #86 host memory/async transfer | SPEC-0019 proposal; depends generalized operations. | Pinned memory/quota/lifetime and async copy completion are separate from copied baseline. | Keep proposal until SPEC-0018 accepted. | No production code. | Exact byte oracle, bounded staging, mechanism overlap, cleanup. |
| #87 Device-JS parallel primitives | Trusted-source widening under SPEC-0022 proposal. | Add only concrete generic primitives after dtype/view authority; do not turn Device-JS into domain library. | Reassess after SPEC-0021 implementation and concrete consumer fixture. | Proposal retained. | Portable lowering + independent native shared/warp/atomic oracles. |
| #88 typed device views | Proposal conflict corrected and v1 narrowed to contiguous 1D. | Exact range/access facts are enough foundation; tensor/library semantics remain downstream. | Implement v1 under accepted SPEC-0021. | **Authority accepted; code next dependency-ready packet.** | Property/lifecycle tests then independent native/library range fixture. |
| #89 Device-JS service profile | Trusted Device-JS is not a sandbox. | Service safety requires bounds/work budgets/quotas/process isolation/threat model together. | Wait for SPEC-0022 trusted primitives + SPEC-0026 process isolation. | Deferred. | Malicious bounds/nontermination/resource/cache/diagnostic cases. |
| #90 generic CUDA library adapters | SPEC-0023 proposal; depends generalized operations + views. | Context-bound handles/plans/workspaces belong under DriverActor-owned context; public API stays finite. | Reassess after SPEC-0018 and SPEC-0021 implementation. | Proposal retained. | Generated ABI/native provider lifecycle and missing-provider controls. |
| #91 cuSPARSE | Depends #90/#88/#40/#86. | Sparse descriptors need typed finite semantics; no raw native passthrough. | Wait for dependencies, then select minimal CSR/operation profile. | Blocked. | CPU sparse references + native provider/workspace/lifecycle. |
| #92 cuRAND | Depends #90; Device-JS helpers later. | Trusted header closure and host generator are distinct profiles; reproducibility is provider/profile-specific. | Wait for generic library adapter authority. | Blocked. | Header provenance/cache + independent native sequence/lifecycle evidence. |
| #93 cuFFT | Depends #90/#88/#40/#86. | Plan/workspace/layout/normalization are explicit semantics. | Wait for dependencies; select bounded 1D/2D profile later. | Blocked. | CPU DFT/native provider parity + plan/workspace cleanup. |
| #94 graphics interop | SPEC-0025 proposal; depends device selection/scheduler/views. | Device matching + external resource ownership/synchronization must be API-specific. | Implement #20/SPEC-0017 and other foundations first; choose one first API later. | Proposal retained. | Independent graphics producer/consumer direct-resource mechanism + cleanup. |
| #95 process isolation | SPEC-0026 proposal; partially independent write surface. | Child process improves process containment but cannot promise Driver/firmware immunity. | A bounded prototype may be researched, production waits on accepted contract. | Proposal retained; no service claim. | Normal parity + crash/hang/malformed IPC/stale epoch/recovery evidence. |
| #96 expansion qualification | Composition owner only after component readiness. | End-to-end campaign must not substitute for component oracles. | Activate per capability once runner-ready exact profiles exist. | Plan retained. | One clean exact revision, per-capability capsule, terminal resource census. |
| #107 sweep coordination | Created to own this current cross-issue cycle and prevent undocumented status drift. | It grants no implementation authority. | Close after sweep packet is published and issue-level dispositions are durable. | Coordination record created. | Protected checks + remote read-back + remaining work in `next_step.yaml`. |

## Dependency-ready execution order after this authority packet

```text
1. CAP-D / SPEC-0021 (#39/#88): portable numeric ABI + contiguous 1D views
2. CAP-B / SPEC-0017 (#20): portable selector snapshot + target-resolution foundation
3. repair/publish #51 exact native SPEC-0016 evidence on current protected main
4. reassess/accept SPEC-0018 (#40) only after step 3
5. then SPEC-0019 / SPEC-0020 / SPEC-0023 and their consumers in dependency order
6. NN child specifications begin with #72 only after stale same-package assumptions are reconciled; production NN remains separate publish unit
```

Hardware/external-control lanes proceed independently whenever their exact environment exists. They must not block portable authority/code work that does not depend on them, and portable work must not be misreported as native support.

## Sweep exit criteria

This sweep coordination packet is complete when:

- every issue above has a current researched disposition;
- stale #71 control state is removed;
- accepted/proposal boundaries are contradiction-free;
- the first dependency-ready implementation packet is named;
- blocked issues name the exact missing external/hardware/authority fact;
- repository checks pass on the authority packet;
- protected-main state is read back after merge.
