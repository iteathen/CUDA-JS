# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-13

## Current implementation state

The latest implementation-bearing protected `main` baseline before the documentation-only capability authority work is:

```text
fe9ed78939d3876790291421cec367fde58a8310
```

The capability-authority proposal corpus is integrated on protected `main` at:

```text
5233a046c57813532a71763bb36cdba5894e43e0
```

Package identity is `cuda-js@0.1.0-alpha.5`.

The implementation baseline contains:

- the accepted Windows F1–F9 foundation, including `CJS-F1B`, Windows `CJS-F2W` through `CJS-F7W`, exact Node 26.7.0 evidence, and retained Linux x86-64 qualification paths;
- portable/software implementations of SPEC-0010 typed RDC, SPEC-0011 `u64`/`i32`/`f32` scalar arguments, SPEC-0012 Device LTO, SPEC-0013 restricted Device-JS, and SPEC-0016 opaque GPU operations;
- proposed SPEC-0014 plus EXP-013 publication-mailbox evidence, without production mapped/sideband support;
- retained EXP-014 lifecycle orchestration evidence;
- a public facade that keeps DriverActor/CompilerActor/native capabilities private and exposes Device-JS only through the standalone `compileDeviceProgram()` helper.

Portable/software implementation and native qualification are separate. SPEC-0010/0011/0012/0013/0016 retain their exact native promotion gates.

## 2026-08-13 capability authority expansion

The open capability tracker had begun referring to `SPEC-0017` through `SPEC-0026` and a capability-expansion roadmap before those files existed on protected main. PR #97 repaired that ownership gap by adding the following **proposal-only** contracts:

```text
SPEC-0017 device selection and target resolution
SPEC-0018 bounded multi-operation scheduling
SPEC-0019 host memory and async transfer
SPEC-0020 prepared batch and CUDA Graph execution
SPEC-0021 extended numeric ABI and generic device views
SPEC-0022 Device-JS parallel and service profiles
SPEC-0023 context-bound CUDA library adapters
SPEC-0024 multi-GPU orchestration
SPEC-0025 graphics interop
SPEC-0026 process-isolated execution
```

Proposal presence does not authorize their production implementation. Each must be separately reviewed and accepted before its implementation dimension may advance.

## Accepted P0 authority corrections

Two contradictions in already-accepted authority have now been resolved at the specification level:

### SPEC-0006 target-syntax addendum — issue #65

**Architectural disposition:** selected correction.  
**Implementation status:** authorized, not yet implemented.  
**Qualification status:** existing qualified targets unchanged; newly represented targets remain not-qualified.

The accepted addendum requires one shared target parser/policy owner across CompilerActor, linker, Device-JS and target validation. It can structurally represent current numeric, family-specific (`f`) and architecture-specific (`a`) CUDA target forms, but the initial repository policy admits only the reviewed unsuffixed target bases already owned by the hardware registry. Parser/policy admission, provider/toolkit acceptance, device compatibility and CUDA-JS native qualification remain separate facts.

### SPEC-0003 disposal-failure addendum — issue #66

**Architectural disposition:** selected correction.  
**Implementation status:** authorized, not yet implemented.  
**Qualification status:** portable defect reproduced; destructive native cleanup partitions remain independently qualified.

The accepted addendum keeps `RESOURCE_DISPOSE_FAILED` as registry context while preserving the underlying semantic category, observation operation and health transition directly. Failed disposal leaves the logical resource orphaned/unusable, unstructured disposer failure becomes restart-required, repeated close does not repeat native disposal by default, and rollback/cascade cleanup retains bounded primary + cleanup failure truth.

These two corrections are now dependency-ready implementation work. Acceptance does not itself fix the code or claim native negative-path/Blackwell support.

## Execution baseline

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1
max pending GPU operations:   1
public operation lifecycle:   CudaFunction.submit() -> CudaOperation
legacy terminal convenience:  CudaFunction.launch()
```

SPEC-0016 is implemented in software/portable paths. Direct submit backpressures while another operation is pending; legacy terminal `launch()` preserves serialized compatibility above the actor. Native SPEC-0016 qualification remains open under issue #51.

Bounded multi-stream execution remains architecturally planned under issue #40 and proposed SPEC-0018. It is not implemented or qualified and must consume SPEC-0016 rather than define another lifecycle.

## Device-JS

SPEC-0013 is accepted and implemented in portable/software/package paths. `acorn@8.15.0` is a syntax-only parser adapter; CUDA-JS owns the accepted subset, typing, helper semantics, deterministic code-unit ordering, CUDA lowering, diagnostics, identity and compiler handoff.

Native DJS-2 evidence remains open under issue #43. Proposed SPEC-0022 may later widen trusted generic GPU primitives and, separately, define a service-safe profile. Neither proposal changes the current trusted-source Device-JS support state.

The CUDA-MCGS external deletion/compatible-pair proof remains cross-repository future work.

## Sideband

SPEC-0014 remains a proposal. EXP-013 proves bounded portable publication-mailbox mechanics only. There is no production mapped/pinned sideband or arbitrary-duration live-operation support claim. Issue #38 must consume the accepted operation lifecycle and, if selected, accepted SPEC-0019 host-registration/mapping ownership before production sideband acceptance.

## Platform qualification

The exact accepted Windows x64 profile remains the native evidence baseline. Native Linux CUDA, WSL2, Linux ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, multi-GPU, MIG, ECC, soak/performance, and other axes remain independently qualified or unqualified according to their exact registries/evidence.

Not-qualified is not architectural rejection.

## NN extension authority gap

Issues #70–#84 describe an optional NN training extension, but the currently accepted project charter still states that CUDA-JS does not own tensor/model semantics. The first NN work package must therefore reconcile durable charter/component/package/spec authority as required by #71 before NN production implementation. Generic core capability proposals do not silently authorize tensor/autodiff/training code.

## Forward plans

Active plans contain unfinished work only:

- [`docs/plans/2026-08-12-native-and-platform-qualification-continuation.md`](docs/plans/2026-08-12-native-and-platform-qualification-continuation.md);
- [`docs/plans/2026-08-12-execution-capability-continuation.md`](docs/plans/2026-08-12-execution-capability-continuation.md);
- [`docs/plans/2026-08-12-compatible-pair-continuation.md`](docs/plans/2026-08-12-compatible-pair-continuation.md);
- [`docs/plans/2026-08-13-capability-expansion-roadmap.md`](docs/plans/2026-08-13-capability-expansion-roadmap.md).

The former master/focus/hardware/Node/F9/Device-JS plans are preserved unchanged under [`docs/archive/plans/`](docs/archive/plans/) and remain non-authoritative provenance. Their old active paths are explicit Superseded pointers.

[`next_step.yaml`](next_step.yaml) identifies the current dependency-ready focus. Plans organize work beneath accepted authority and do not reopen completed implementation.
