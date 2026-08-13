# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-12

## Current implementation state

The latest implementation-bearing protected `main` baseline before this documentation-only plan reconciliation is:

```text
fe9ed78939d3876790291421cec367fde58a8310
```

Package identity is `cuda-js@0.1.0-alpha.5`.

That baseline contains:

- the accepted Windows F1–F9 foundation, including `CJS-F1B`, Windows `CJS-F2W` through `CJS-F7W`, exact Node 26.7.0 evidence, and retained Linux x86-64 qualification paths;
- portable/software implementations of SPEC-0010 typed RDC, SPEC-0011 `u64`/`i32`/`f32` scalar arguments, SPEC-0012 Device LTO, SPEC-0013 restricted Device-JS, and SPEC-0016 opaque GPU operations;
- proposed SPEC-0014 plus EXP-013 publication-mailbox evidence, without production mapped/sideband support;
- retained EXP-014 lifecycle orchestration evidence;
- a public facade that keeps DriverActor/CompilerActor/native capabilities private and exposes Device-JS only through the standalone `compileDeviceProgram()` helper.

Portable/software implementation and native qualification are separate. SPEC-0010/0011/0012/0013/0016 retain their exact native promotion gates.

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

Bounded multi-stream execution remains architecturally planned under issue #40 and unimplemented/unqualified. It must consume SPEC-0016 rather than define another lifecycle.

## Device-JS

SPEC-0013 is accepted and implemented in portable/software/package paths. `acorn@8.15.0` is a syntax-only parser adapter; CUDA-JS owns the accepted subset, typing, helper semantics, deterministic code-unit ordering, CUDA lowering, diagnostics, identity and compiler handoff.

Native DJS-2 evidence remains open under issue #43. The CUDA-MCGS external deletion/compatible-pair proof remains cross-repository future work.

## Sideband

SPEC-0014 remains a proposal. EXP-013 proves bounded portable publication-mailbox mechanics only. There is no production mapped/pinned sideband or arbitrary-duration live-operation support claim. Issue #38 must be reassessed against the now-implemented SPEC-0016 lifecycle before any production contract is accepted.

## Platform qualification

The exact accepted Windows x64 profile remains the native evidence baseline. Native Linux CUDA, WSL2, Linux ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, multi-GPU, MIG, ECC, soak/performance, and other axes remain independently qualified or unqualified according to their exact registries/evidence.

Not-qualified is not architectural rejection.

## Forward plans

Active plans now contain unfinished work only:

- [`docs/plans/2026-08-12-native-and-platform-qualification-continuation.md`](docs/plans/2026-08-12-native-and-platform-qualification-continuation.md);
- [`docs/plans/2026-08-12-execution-capability-continuation.md`](docs/plans/2026-08-12-execution-capability-continuation.md);
- [`docs/plans/2026-08-12-compatible-pair-continuation.md`](docs/plans/2026-08-12-compatible-pair-continuation.md).

The former master/focus/hardware/Node/F9/Device-JS plans are preserved unchanged under [`docs/archive/plans/`](docs/archive/plans/) and remain non-authoritative provenance. Their old active paths are explicit Superseded pointers.

[`next_step.yaml`](next_step.yaml) identifies the current dependency-ready focus. Plans organize work beneath accepted authority and do not reopen completed implementation.
