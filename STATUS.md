# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-24

## CUDA-MCGS prerequisite execution baseline

```text
protected main:     5653d5dffdb8b763232e8d6c6a0c1353d8678151
completed P0/P1:    #116 P0 / #118 SPEC-0018 scheduler
active P1:          #119 SPEC-0019 bounded asynchronous transfer
execution package:  cuda-js@0.1.0-alpha.6
```

**Node 26.7.0** remains the exact Node qualification baseline.

The accepted **Windows x64** foundation (`CJS-F1B`, `CJS-F2W`, `CJS-F3W` through `CJS-F7W`, and F8/F9), retained **Linux x86-64** preparation/qualification paths, and portable/software/package implementations include:

- SPEC-0010 typed relocatable device code;
- SPEC-0011 `u64`, `i32`, finite-only `f32` scalar arguments;
- SPEC-0012 typed Device LTO;
- SPEC-0013 restricted Device-JS;
- SPEC-0022 accepted relaxed device-scope `u32`/`u64` atomic-observation child;
- SPEC-0016 opaque submission/completion with a one-pending compatibility default;
- SPEC-0018 exact opt-in capacity-two/two-private-stream/no-queue scheduling;
- SPEC-0019 exact two-internal-pinned-staging contiguous H2D/D2H/D2D profile;
- SPEC-0021 `f64`/`f16`/`bf16` scalar ABI in the public portable/software/package path;
- SPEC-0021 contiguous 1D generic typed-device-view range/lifecycle component, with no public facade entry selected yet;
- the SPEC-0006 target-syntax correction;
- the SPEC-0003 disposal-failure correction;
- immutable GitHub Actions provenance and public capability projection checks;
- ADR-0004 and SPEC-0027 optional NN product authority as a separate future publish unit.

Portable/software/package implementation and native qualification remain independent.

## 2026-08-14 open-issue sweep

The project owner requested every open issue be processed through investigate, assess, primary-source research, reassess, plan, authorized implementation and test. The durable per-issue result is `docs/plans/2026-08-14-open-issue-development-sweep.md`.

### Accepted foundation: SPEC-0017 / #20

```text
architectural disposition: selected
implementation status:       authorized; portable/software integration next
qualification status:        not-qualified
priority:                    current dependency-ready implementation focus
```

SPEC-0017 accepts sanitized opaque device discovery/selection, exactly one selected physical device per runtime, and selected-device-driven compile/link target resolution. It exposes no ordinal/UUID/serial/PCI/native handle. Multi-device orchestration remains SPEC-0024 and proposal-only.

### Implemented foundation: SPEC-0021 / #39/#88

```text
architectural disposition: selected
implementation status:       implemented in portable/software/package scalar path; contiguous 1D view component implemented
qualification status:        not-qualified
priority:                    native evidence / downstream public-view consumer decision
```

SPEC-0021 preserves accepted finite-only `f32` and implements new `f64`, `f16`, and `bf16` scalar packing with deterministic width/alignment, round-to-nearest-even half/bfloat conversion, signed-zero/infinity behavior and canonical new-kind NaNs. Execution packing and DriverActor protocol admission share one execution-owned scalar-kind/value authority, preventing duplicate Worker/execution whitelists from drifting.

The same specification implements a generic contiguous 1D `device-view` component over opaque device allocations. Views use ResourceRegistry parent/child/generation/lease behavior, exact dtype/range/access semantics and half-open overlap classification without exposing native addresses. No root `cuda-js` view method/export has been invented because SPEC-0021 did not select public facade spelling; that remains a later accepted public-surface decision when a consumer requires it.

The exact implementation-only head `7a22461fa84412b9350152291f58855f54dbe6f9` passed `verify` and `node-compatibility`, including F4/F5/F6 and the F8 public package/facade path. The fully reconciled implementation/documentation head must pass the same protected checks before merge. Native scalar ABI/launch and native view-consumer qualification remain open.

### Implemented and qualified first profiles: SPEC-0018 / #40 and SPEC-0019 / #86

```text
architectural disposition: selected
implementation status:       SPEC-0018 and SPEC-0019 merged
qualification status:        exact recorded Windows profile plus installed-package evidence
priority:                    implement accepted dependent SPEC-0014/#38
```

PR #116 and the scoped atomic child are merged and their issues closed. PR #118 merged SPEC-0018's exact capacity-two profile with two private nonblocking streams, one optional predecessor, declared hazard admission, no queue, conservative failure attribution, native independent atomic-observer evidence, and installed-package coverage. PR #119 merged SPEC-0019 at protected-main `3f3e142bfb6479c6ff5f6ce636b7c2354d81a34d` with exactly two lazy internal pinned staging blocks, snapshot H2D, terminal-result D2H, contiguous D2D, the same operation dependency/hazard lifecycle, an independent MSVC copy oracle, public H2D→kernel→D2H ordering evidence, installed-package coverage, and terminal cleanup. Issue #86 is closed. Caller registration outside the accepted publication-mailbox specialization, chunk queues, and overlap claims remain excluded.

### Active accepted profile: SPEC-0014 / #38

```text
architectural disposition: accepted exact first profile
implementation status:       in progress on agent/cuda-mcgs-p1-mailbox
qualification status:        mapping prerequisite probe only; production evidence pending
priority:                    current CUDA-MCGS P1 dependency
```

The accepted profile owns an opaque `runtime.publication-mailbox` component with at most 64 named naturally aligned u32 lanes over one internally allocated and strongly retained `SharedArrayBuffer`. Every lane has one immutable host-to-device or device-to-host direction. Each kernel argument binds one named lane through a direction-specific parameter kind; Device-JS supplies only system-scope acquire-load and release-store helpers. The backing store and mapped alias remain private, one live GPU operation may lease a mailbox, and reset/unregister is forbidden before terminality.

## Execution baseline

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1 default / exactly 2 opt-in
max pending GPU operations:   1 default / exactly 2 opt-in
public operation lifecycle:   CudaFunction.submit() -> CudaOperation
legacy terminal convenience:  CudaFunction.launch()
public scalar launch kinds:   device-memory/u32/u64/i32/f32/f64/f16/bf16
```

SPEC-0016 remains the sole operation lifecycle owner. Scheduler, transfer, graph, library, graphics, multi-GPU, sideband and future NN execution work must consume it rather than duplicate it.

## Device-JS

SPEC-0013 and the accepted bounded SPEC-0022 scoped-atomic-observation child are implemented. `acorn@8.15.0` is syntax-only parsing; CUDA-JS owns the accepted restricted language, typing, helper semantics, deterministic code-unit ordering, CUDA lowering, identity, diagnostics and CompilerActor handoff. Explicit `u32`/`u64` `loadRelaxedDevice` / `storeRelaxedDevice` helpers consume the manifest-owned `cuda-cccl` profile and provide one-location device-scope relaxed semantics only. Broader Device-JS parallel/numeric/service widening remains governed by proposed SPEC-0022.

## Proposal-only successor capabilities

The following remain proposal authority only and do not authorize production code:

```text
SPEC-0020 prepared batches / CUDA Graph execution
SPEC-0022 remaining Device-JS parallel + service profiles (scoped atomic-observation child accepted)
SPEC-0023 context-bound CUDA library adapters
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

These remain independently open because the exact environment/control is unavailable here, not because the architecture is rejected:

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
- native LTO qualification #42;
- native SPEC-0021 scalar/view-consumer qualification #39/#88;
- exact merged-head Windows F5 oracle revalidation #64;
- GitHub private vulnerability reporting end-to-end external control #68.

Not-qualified is not architectural rejection.

## Current forward order

```text
1. implement and qualify accepted SPEC-0014 publication mailboxes (#38)
2. integrate/read back the exact #38 head
3. run the final integrated P0/P1 exact-head verification and cleanup
4. leave the exact CUDA-MCGS compatible-pair gate (#32) open until its frozen CUDA-MCGS artifact exists
```

Hardware/platform lanes may proceed whenever exact controlled environments exist and do not block unrelated portable work.

`next_step.yaml` is the machine-readable current focus. Plans organize work beneath accepted authority and never reopen completed implementation by implication.
