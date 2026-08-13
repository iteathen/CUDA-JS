# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-12

## Current accepted baseline

This status transition is based on protected `main`:

```text
f49f2621ef741b54255aad0877c1baffbfc79d1d
```

That baseline contains:

- the accepted Windows F1–F9 foundation;
- integrated portable/software SPEC-0010 RDC, SPEC-0011 extended scalar ABI, and SPEC-0012 Device LTO follow-ups, each retaining separate native promotion gates;
- SPEC-0015 status/scope clarification;
- durable EXP-014 portable evidence and proposed SPEC-0016.

The current authority change accepts SPEC-0016 and authorizes its bounded production integration. Native SPEC-0016 support remains **not qualified** until its exact Windows native evidence passes.

For discovery continuity, the accepted foundation still includes `CJS-F1B`, Windows `CJS-F2W` through `CJS-F7W` and later accepted Windows slices, exact Node 26.7.0 evidence, and the retained Linux x86-64 qualification path. Linux portable/ABI evidence is not native Linux CUDA support.

## Status semantics

Capability state follows [`agent_files/general_foundation/STATUS_SEMANTICS.md`](agent_files/general_foundation/STATUS_SEMANTICS.md). Architectural disposition, implementation, qualification/support, and priority are independent.

Legacy `no-support` wording is qualification/public-support language only unless accepted architecture explicitly says `rejected`.

## Execution baseline and next widening

### Currently implemented baseline — SPEC-0005

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1
max pending GPU operations:   1
public launch behavior:       terminal launch-and-wait
```

### SPEC-0016 submission/completion lifecycle

```text
architectural disposition: selected
implementation status:       accepted/authorized, implementation pending
qualification status:        not qualified
priority:                    active
issue:                       #51
```

Accepted first slice:

- one opaque `CudaOperation` lifecycle;
- submission returns only after private completion-event provenance exists;
- later status uses short serialized DriverActor turns;
- explicit operation wait does not occupy DriverActor between polls;
- one private stream / one pending operation remains the limit;
- while pending, only an explicit operation-safe DriverActor command allowlist is admitted;
- ordinary Driver/memory/resource commands remain blocked until terminality unless a later accepted capability widens the allowlist;
- existing terminal `launch()` compatibility and timeout/restart-required truth must be preserved;
- close terminalizes pending work before dependency teardown or reports orphan/restart-required state.

EXP-014 passed all OPL-001 through OPL-015 portable lifecycle cases on the protected PR #53 merge-ref run. That is orchestration evidence only, not native CUDA qualification.

### Bounded multi-stream execution

```text
architectural disposition: planned
implementation status:       not implemented
qualification status:        not qualified
priority:                    after trustworthy SPEC-0016 implementation
issue:                       #40
```

#40 must consume SPEC-0016 rather than create another operation lifecycle. Raw public CUDA streams/events remain outside the selected direction.

### Long-lived sideband

```text
architectural disposition: planned
implementation status:       portable experiment exists on open PR #50
qualification status:        not qualified
priority:                    after SPEC-0016 lifecycle
issue:                       #38
```

#38 owns mailbox/sideband-specific semantics only. Its operation-lifecycle portions must be reconciled with SPEC-0016 before integration.

## Open unintegrated work

- **PR #49 Device-JS** — open/unmerged; do not claim integration before protected merge + main read-back.
- **PR #50 sideband prototype** — open/unmerged; reassess against accepted SPEC-0016 before integration.

## Platform qualification

The exact accepted Windows x64 profile remains the native evidence baseline. Native Linux x64, WSL2, Linux ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, multi-GPU, MIG, ECC, soak/performance, and other axes retain their own independent status/evidence.

A profile that is not qualified is not thereby architecturally rejected.

## Current blockers / claim limits

- this sandbox has no NVIDIA GPU/toolkit exposure for exact native SPEC-0016 qualification;
- native Linux CUDA requires suitable NVIDIA Linux hardware/provider exposure;
- #40 implementation remains gated on a trustworthy SPEC-0016 operation implementation, not merely spec acceptance;
- #49/#50 remain open and must not be represented as integrated.

## Current next action

Follow `next_step.yaml` schema 24:

1. implement the exact accepted SPEC-0016 portable/software work package;
2. preserve SPEC-0005 legacy `launch()` behavior and all existing regressions;
3. merge only after complete author-side exact-head review and protected checks;
4. leave #51 open for exact native Windows qualification if the software slice passes;
5. only after the operation lifecycle is trustworthy, restart #40's bounded multi-stream cycle.
