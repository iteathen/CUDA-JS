# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-26

## CUDA-MCGS prerequisite execution baseline

```text
protected main:     3a29b65a4ae736923dbde432356a7aad31059fc0
completed P0/P1:    #116 P0 / #118 SPEC-0018 / #119 SPEC-0019 / #120 SPEC-0014 / #125 device publication / #134 typed views / #136 Device-JS libraries / #137 prepared DAG / #138 cuBLASLt adapter / #140 dense numeric Device-JS / #143 native prepared-DAG projection
cross-repo gate:    #32 exact CUDA-JS/CUDA-MCGS pair; awaits a frozen CUDA-MCGS artifact
execution package:  cuda-js@0.1.0-alpha.14 integrated (native prepared-DAG identity projection and exact-profile evidence)
```

**Node 26.7.0** remains the exact Node qualification baseline.

## Production-source architecture

ADR-0005 records the canonical split: **CUDA-JS is JavaScript-authored and JIT/native-realized**. The published core runtime is maintained as JavaScript/ESM and currently ships no CUDA-JS-specific compiled addon. Node FFI, NVIDIA native providers, private generated CUDA C++ and produced device artifacts realize execution. Repository C/C++ probes, fixtures and native oracles remain independent evidence rather than shipped runtime implementation.

This wording does not claim that every host call or device artifact is JIT-produced. Precompiled artifacts remain valid, and host JIT claims remain exact-profile gated under ADR-0002. A future maintained native host backend requires an accepted measured-gap decision rather than entering as incidental drift.

## Reference-platform direction

ADR-0006 keeps the public/component architecture OS-neutral while making native Linux x86-64 the reference implementation and primary qualification platform. Ubuntu 24.04 LTS is the first exact qualification cell. The accepted Windows x64 evidence below remains valid as a peer exact profile, but it no longer determines forward platform priority. DriverActor and CompilerActor use shared native engines with thin Windows/Linux profiles. The Linux compiler profile is pinned to exact official Ubuntu packages and installed-file identities, and the repository now has one runner-ready EXP-001/F1B/F3L–F8L command/evidence chain. That chain has not run on a controlled native Linux NVIDIA host, so source completion is not a Linux support claim.

Issue #4 is now an external contributor-evidence lane rather than an active repository implementation blocker. Platform diagnostics, public-facade admission, and compatibility metadata admit native Linux x86-64 only as `testing-unconfirmed`, and the OS-neutral F4/F5 oracles plus F3–F8 runners are source-complete. The available VM hosts cannot currently expose an accepted CUDA qualification environment; VM, emulated, WSL, container, hosted-CI, portable, or mock results do not substitute for the unchanged chain on a native Ubuntu 24.04 host with a directly exposed physical NVIDIA GPU. Only that exact passing compatibility cell may be promoted, and issue #17 expands distributions only after it.

Accepted SPEC-0017 portable/software integration is complete on protected `main`. It establishes finite sanitized device snapshots, opaque selectors, exactly one selected device per runtime, and selected-device-driven target/cache identity without using native qualification as a portable-contract gate. Native selected-device promotion follows contributed physical-host evidence. Multi-GPU orchestration remains proposal-only under SPEC-0024, and topology or overlap qualification requires a controlled host with at least two independently visible physical GPUs; it is pursued only where it fits naturally.

The accepted secondary **Windows x64** foundation (`CJS-F1B`, `CJS-F2W`, `CJS-F3W` through `CJS-F7W`, and F8/F9), active reference **Linux x86-64** implementation/qualification path, and portable/software/package implementations include:

- SPEC-0010 typed relocatable device code;
- SPEC-0011 `u64`, `i32`, finite-only `f32` scalar arguments;
- SPEC-0012 typed Device LTO;
- SPEC-0013 restricted Device-JS;
- SPEC-0022 accepted relaxed device-scope `u32`/`u64` atomic-observation child;
- SPEC-0022 accepted device-scope `u32`/`u64` release/acquire publication child;
- SPEC-0016 opaque submission/completion with a one-pending compatibility default;
- SPEC-0018 exact opt-in capacity-two/two-private-stream/no-queue scheduling;
- SPEC-0019 exact two-internal-pinned-staging contiguous H2D/D2H/D2D profile;
- SPEC-0014 exact private mapped named-u32 publication mailbox profile;
- SPEC-0017 finite sanitized discovery, opaque explicit selection, one selected device per runtime, and selected-device compile/link target defaults;
- SPEC-0021 `f64`/`f16`/`bf16` scalar ABI in the public portable/software/package path;
- SPEC-0021 contiguous 1D generic typed-device-view range/lifecycle component and allocation-owned public facade, integrated on PR #134;
- SPEC-0028 typed Device-JS leaf-library composition, integrated on PR #136; native qualification remains open on issue #135;
- SPEC-0020 immutable kernel-only prepared DAGs, integrated on PR #137 with semantic single-stream replay and no CUDA Graph claim;
- SPEC-0023/SPEC-0029 optional context-owned cuBLASLt f32 row-major matmul candidate over typed views and the ordinary operation lifecycle;
- SPEC-0030 additive `f64`/`f16`/`bf16` Device-JS scalar computation and exact trusted numeric/device header profiles, integrated on PR #140;
- the SPEC-0006 target-syntax correction;
- the SPEC-0003 disposal-failure correction;
- immutable GitHub Actions provenance and public capability projection checks;
- ADR-0004 and SPEC-0027 optional NN product authority as a separate future publish unit.

Portable/software/package implementation and native qualification remain independent.

SPEC-0012 typed Device LTO is implemented and qualified on the exact recorded Windows x64 profile. PR #116 integrated the NQ-LTO independent-oracle capsule on protected `main@9f13785e4d1d8d887099571a7a41be0b5b42f749`; a current-head rerun from `main@2135216b1a9fd88066a1c82b61ae533645eac9c2` again passed byte-identical two-unit LTO-IR/cubin/output parity, fail-closed negative controls and terminal zero-live-resource cleanup. Linux, other devices/providers and LTO performance remain separately unqualified.

## 2026-08-14 open-issue sweep

The project owner requested every open issue be processed through investigate, assess, primary-source research, reassess, plan, authorized implementation and test. The durable per-issue result is `docs/plans/2026-08-14-open-issue-development-sweep.md`.

### Implemented portable foundation: SPEC-0017 / #20

```text
architectural disposition: selected
implementation status:       implemented in portable/software/package path
qualification status:        not-qualified
priority:                    integration, then contributor-run exact native evidence
```

SPEC-0017 implements `discoverCudaDevices()`, opaque process-local selectors, explicit/default `openCudaRuntime()` selection before context creation, selected-architecture compile/link defaults and cache separation, and public ordinal sanitization. It exposes no ordinal/UUID/serial/PCI/native handle. Portable mocks prove orchestration only; exact native default/explicit selection and distinct physical-device behavior remain unqualified. Multi-device orchestration remains SPEC-0024 and proposal-only.

### Implemented foundation: SPEC-0021 / #39/#88

```text
architectural disposition: selected
implementation status:       implemented in portable/software/package scalar path; contiguous 1D view component implemented
qualification status:        not-qualified
priority:                    integrate the public typed-view facade, then native/library evidence
```

SPEC-0021 preserves accepted finite-only `f32` and implements new `f64`, `f16`, and `bf16` scalar packing with deterministic width/alignment, round-to-nearest-even half/bfloat conversion, signed-zero/infinity behavior and canonical new-kind NaNs. Execution packing and DriverActor protocol admission share one execution-owned scalar-kind/value authority, preventing duplicate Worker/execution whitelists from drifting.

The same specification implements a generic contiguous 1D `device-view` component over opaque device allocations. Views use ResourceRegistry parent/child/generation/lease behavior, exact dtype/range/access semantics and half-open overlap classification without exposing native addresses. The active public packet adds only `CudaDeviceMemory.view(...) -> CudaDeviceView`: an allocation-owned opaque child usable wherever a `device-memory` kernel argument is accepted, with explicit per-launch access declarations constrained by the view range and access role. It does not add tensor shape, stride, algebra, host-array, pointer, conversion, or hardware-bound semantics.

The exact implementation-only head `7a22461fa84412b9350152291f58855f54dbe6f9` passed `verify` and `node-compatibility`, including F4/F5/F6 and the F8 public package/facade path. The fully reconciled implementation/documentation head must pass the same protected checks before merge. Native scalar ABI/launch and native view-consumer qualification remain open.

### Implemented and qualified first profiles: SPEC-0018 / #40, SPEC-0019 / #86, and SPEC-0014 / #38

```text
architectural disposition: selected
implementation status:       SPEC-0018, SPEC-0019, and SPEC-0014 merged
qualification status:        exact recorded Windows profile plus installed-package evidence
priority:                    consume from a bounded CUDA-MCGS artifact, then qualify exact pair #32
```

PR #116 and the scoped atomic child are merged and their issues closed. PR #118 merged SPEC-0018's exact capacity-two profile with two private nonblocking streams, one optional predecessor, declared hazard admission, no queue, conservative failure attribution, native independent atomic-observer evidence, and installed-package coverage. PR #119 merged SPEC-0019 at protected-main `3f3e142bfb6479c6ff5f6ce636b7c2354d81a34d` with exactly two lazy internal pinned staging blocks, snapshot H2D, terminal-result D2H, contiguous D2D, the same operation dependency/hazard lifecycle, an independent MSVC copy oracle, public H2D→kernel→D2H ordering evidence, installed-package coverage, and terminal cleanup. Issue #86 is closed. Caller registration outside the accepted publication-mailbox specialization, chunk queues, and overlap claims remain excluded.

### Integrated and qualified first profile: SPEC-0014 / #38

```text
architectural disposition: accepted exact first profile
implementation status:       merged on PR #120 at protected-main ed35718ea15ce7a878f67580e271aee5820948ee
qualification status:        portable, independent native, public native, and installed-package evidence pass
priority:                    preserve the exact profile while CUDA-MCGS supplies the #32 pair artifact
```

The accepted profile owns an opaque `runtime.publication-mailbox` component with at most 64 named naturally aligned u32 lanes over one internally allocated and strongly retained `SharedArrayBuffer`. Every lane has one immutable host-to-device or device-to-host direction. Each kernel argument binds one named lane through a direction-specific parameter kind; Device-JS supplies only system-scope acquire-load and release-store helpers. The backing store and mapped alias remain private, one live GPU operation may lease a mailbox, and reset/unregister is forbidden before terminality. The integrated implementation proves generation/stale handling, mapping rollback, unregister-failure orphan retention, lease backpressure, independent MSVC/Driver publication, public Device-JS/native publication from `41` to `42`, installed-package use, and zero-resource terminal cleanup on the exact recorded Windows profile.

## Execution baseline

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1 default / exactly 2 opt-in
max pending GPU operations:   1 default / exactly 2 opt-in
public operation lifecycle:   CudaFunction.submit() -> CudaOperation
public prepared lifecycle:    CudaRuntime.prepareOperationDag() -> CudaPreparedOperationDag
legacy terminal convenience:  CudaFunction.launch()
public launch kinds:          device-memory/u32/u64/i32/f32/f64/f16/bf16 + directional mailbox-u32
```

SPEC-0016 remains the sole operation lifecycle owner. Scheduler, transfer, graph, library, graphics, multi-GPU, sideband and future NN execution work must consume it rather than duplicate it.

## Device-JS

SPEC-0013, the accepted bounded SPEC-0022 scoped-atomic-observation and device-publication children, the SPEC-0014 mailbox child, and additive SPEC-0030 dense numeric profile are implemented. `acorn@8.15.0` is syntax-only parsing; CUDA-JS owns the accepted restricted language, typing, helper semantics, deterministic code-unit ordering, CUDA lowering, identity, diagnostics and CompilerActor handoff. Explicit `u32`/`u64` `loadRelaxedDevice` / `storeRelaxedDevice` helpers provide one-location device-scope relaxed semantics. `loadAcquireDevice` / `storeReleaseDevice` provide device-scope publication ordering when acquire observes the matching release; consumer generation, progress, payload and queue policy remain separate. Direction-specific `gpu.mailbox.loadAcquireSystem` / `storeReleaseSystem` helpers consume only opaque u32 mailbox lane types and lower through the manifest-owned `cuda-cccl` profile.

SPEC-0030 is integrated on protected main through PR #140 and issue #139 is closed. Dense requests add `f64`/`f16`/`bf16` pointers, locals, device functions, leaf libraries and kernel scalars plus exact casts, round-to-nearest half/bfloat arithmetic, special values and finite math helpers. CompilerActor owns the exact `cuda-numeric` and composite `cuda-device` profiles. Legacy Device-JS contract/identity/generated bytes remain exact. Two unrelated installed consumers pass, and the exact installed Windows CUDA 13.3/compute_75/GTX 1660 Ti launch matches a separately compiled CUDA C++ oracle with zero live/orphaned resources. Linux/other profiles, tensor operations/cores, fast math and performance remain unqualified or excluded.

Accepted SPEC-0028 is integrated on protected main. It adds device-function-only leaf libraries with explicit typed exports, deterministic identity-derived external symbols, explicit consumer-local import aliases, homogeneous copied RDC/LTO artifacts, and final cubin composition through the existing CompilerActor link owner. It adds no tensor/search semantics, native symbol controls, ambient registry, or native qualification claim.

Accepted SPEC-0020 is integrated on protected main through PR #137. Its first profile owns a pure canonical topology/identity component and one opaque public prepared-DAG capability for 1–32 immutable kernel nodes, at most 64 edges/bindings, fixed launch facts, fixed scalars or named bindings, and explicit accesses. Each replay validates concrete aliases before backend work, submits canonical topological order on one private stream, and returns one existing SPEC-0016 operation with one final event. PR #143 closed issue #142 by projecting the wider native discovery record to only the execution owner's eight validated launch limits; its installed-package native fixture proves semantic-replay result parity and terminal cleanup on the exact recorded Windows profile. CUDA Graph realization, transfer/library/mailbox nodes, broader native profiles, and performance remain separate.

Accepted SPEC-0023 plus SPEC-0029 is integrated on protected main through PR #138. It adds one lazy context-owned cuBLASLt adapter, immutable f32 row-major contiguous matmul plans, typed-view access/range enforcement, explicit bounded workspace, and submission through the existing operation scheduler. Exact Windows CUDA 13.3/cuBLASLt 13.5.1 provider identity, independent ABI/numerical oracle, public native parity, installed-package consumer, and cleanup evidence qualify only that recorded profile; Linux, other providers/dtypes/layouts, tensor semantics, and performance remain excluded.

## Proposal-only successor capabilities

The following remain proposal authority only and do not authorize production code:

```text
SPEC-0022 remaining Device-JS parallel + service profiles (scoped atomic-observation and device-publication children accepted)
unaccepted SPEC-0023 provider/operation children beyond SPEC-0029
SPEC-0024 multi-GPU orchestration
SPEC-0025 graphics interop
SPEC-0026 process-isolated execution
```

Their dependency order is retained in the capability-expansion roadmap and the 2026-08-14 sweep record.

## Optional NN extension authority

**Architectural disposition:** planned under accepted ADR-0004 and SPEC-0027.

**Implementation status:** not implemented.

**Qualification status:** not qualified.

The optional application-neutral NN product is authorized in this repository only as a **separate publish unit**. The published `cuda-js` core package, exports, dependencies, compatibility identity, source tree and import/provider-discovery behavior remain generic. The future NN package name and source directory remain unselected.

Issues #70 and #72-#84 contain useful research, but portions of their original text still assume a same-package `cuda-js/nn` shape. That assumption is superseded. Every `nn.*` production boundary requires a separately accepted child specification, beginning with tensor semantics (#72) and then graph/autodiff dependencies. No NN production implementation is implied by the master-program issue bodies.

## Open native/platform/external gates

These remain independently open because the exact environment/control is unavailable here, not because the architecture is rejected. Issue #4 is specifically a contributor-operated physical-hardware evidence lane and does not block accepted portable/software work:

- native Linux x64 #4 and distro expansion #17;
- additional GPU models #12;
- WSL2 #13;
- Linux ARM64/SBSA #14;
- Jetson #15;
- controlled GPU hosts #16 and independently attested runners #29;
- virtualization #21;
- compatibility matrix #22;
- ECC #24;
- Windows Server/TCC #26;
- MIG #27;
- performance/soak #28;
- exact CUDA-MCGS pair #32;
- native SPEC-0021 scalar/view-consumer qualification #39/#88;
- exact merged-head Windows F5 oracle revalidation #64;
- GitHub private vulnerability reporting end-to-end external control #68.

Not-qualified is not architectural rejection.

## Current forward order

```text
1. preserve OS-neutral contracts and the accepted Windows peer evidence
2. preserve the integrated alpha.14 native prepared-DAG identity projection and exact installed-package evidence without claiming CUDA Graph use
3. consume protected `main@3a29b65a4ae736923dbde432356a7aad31059fc0` from the CUDA-JS-Tensor SIMT executor
4. accept exact native evidence when contributors can run unchanged qualification chains on suitable physical-NVIDIA hosts, including 2+ physical-GPU behavior only where it fits naturally
```

Hardware/platform lanes may proceed whenever exact controlled environments exist and do not block unrelated portable work.

`next_step.yaml` is the machine-readable current focus. Plans organize work beneath accepted authority and never reopen completed implementation by implication.
