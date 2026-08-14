# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-14

## Protected-main baseline entering the open-issue sweep

```text
main:    334b903be827dedb5345608a34a6df444912fe1b
package: cuda-js@0.1.0-alpha.5
```

The baseline contains the accepted Windows F1-F9 foundation and portable/software/package implementations of:

- SPEC-0010 typed relocatable device code;
- SPEC-0011 `u64`, `i32`, finite-only `f32` scalar arguments;
- SPEC-0012 typed Device LTO;
- SPEC-0013 restricted Device-JS;
- SPEC-0016 opaque one-pending-operation submission/completion;
- the SPEC-0006 target-syntax correction;
- the SPEC-0003 disposal-failure correction;
- immutable GitHub Actions provenance and public capability projection checks;
- ADR-0004/SPEC-0027 optional NN product authority as a separate future publish unit.

Portable/software implementation and native qualification remain independent.

## 2026-08-14 open-issue sweep

The project owner requested every open issue be processed through investigate, assess, primary-source research, reassess, plan, authorized implementation and test. The durable per-issue result is `docs/plans/2026-08-14-open-issue-development-sweep.md`.

### Accepted foundation: SPEC-0017 / #20

```text
architectural disposition: selected
implementation status:       authorized; portable/software integration next
qualification status:        not-qualified
priority:                    dependency-ready
```

SPEC-0017 now accepts sanitized opaque device discovery/selection, exactly one selected physical device per runtime, and selected-device-driven compile/link target resolution. It exposes no ordinal/UUID/serial/PCI/native handle. Multi-device orchestration remains SPEC-0024 and proposal-only.

### Accepted foundation: SPEC-0021 / #39/#88

```text
architectural disposition: selected
implementation status:       authorized; portable/software integration next
qualification status:        not-qualified
priority:                    current implementation focus
```

SPEC-0021 now accepts `f64`, `f16`, and `bf16` scalar packing plus contiguous one-dimensional generic typed device views. The proposal’s accidental conflict with SPEC-0011 was corrected: existing `f32` remains finite-only and continues rejecting NaN/infinity. New half/bfloat conversion is deterministic round-to-nearest-even with an explicit new-kind special-value bit contract.

### Still gated: SPEC-0018 / #40

```text
architectural disposition: planned
implementation status:       not-implemented
qualification status:        not-qualified
priority:                    blocked on published SPEC-0016 native evidence
```

Issue #51 records a successful Windows OSC-3 candidate that observed native NOT_READY and controlled deferred failure correctly, but also explicitly records that the candidate commits/evidence packet were not pushed/integrated on protected main. SPEC-0018 therefore remains proposal-only under its own widening gate. Multiple operations/private streams are not implemented in this sweep packet.

## Execution baseline

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1
max pending GPU operations:   1
public operation lifecycle:   CudaFunction.submit() -> CudaOperation
legacy terminal convenience:  CudaFunction.launch()
```

SPEC-0016 remains the sole operation lifecycle owner. Scheduler, transfer, graph, library, graphics, multi-GPU, sideband and future NN execution work must consume it rather than duplicate it.

## Device-JS

SPEC-0013 is accepted and implemented in portable/software/package paths. `acorn@8.15.0` is syntax-only parsing; CUDA-JS owns the accepted restricted language, typing, helper semantics, deterministic code-unit ordering, CUDA lowering, identity, diagnostics and CompilerActor handoff. Native DJS-2 promotion remains open under #43.

## Proposal-only successor capabilities

The following remain proposal authority only and do not authorize production code:

```text
SPEC-0014 long-lived sideband
SPEC-0018 bounded multi-operation scheduling
SPEC-0019 host memory and async transfer
SPEC-0020 prepared batches / CUDA Graph execution
SPEC-0022 Device-JS parallel + service profiles
SPEC-0023 context-bound CUDA library adapters
SPEC-0024 multi-GPU orchestration
SPEC-0025 graphics interop
SPEC-0026 process-isolated execution
```

Their dependency order is retained in the capability-expansion roadmap and the 2026-08-14 sweep record.

## Optional NN product

ADR-0004/SPEC-0027 authorize an optional application-neutral NN product in this repository only as a **separate future publish unit**. The published `cuda-js` core package, exports, dependencies, compatibility identity, source tree and import/provider-discovery behavior remain generic.

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
- native RDC/LTO/Device-JS/operations #35/#42/#43/#51;
- exact merged-head Windows F5 oracle revalidation #64;
- GitHub private vulnerability reporting end-to-end external control #68.

Not-qualified is not architectural rejection.

## Current forward order

```text
1. implement/test SPEC-0021 portable/software (#39/#88)
2. implement/test SPEC-0017 portable/software (#20)
3. publish/recreate exact current-head native SPEC-0016 evidence (#51)
4. reassess SPEC-0018 only after step 3
5. unlock SPEC-0019 / SPEC-0020 / SPEC-0023 and their consumers in dependency order
6. begin NN child-spec acceptance in dependency order without changing generic core
```

Hardware/platform lanes may proceed whenever exact controlled environments exist and do not block unrelated portable work.

`next_step.yaml` is the machine-readable current focus. Plans organize work beneath accepted authority and never reopen completed implementation by implication.
