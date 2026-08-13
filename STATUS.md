# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-12

## Exact current baseline

Protected `main` at the start of this status reset is:

```text
0f622a667145c810bcc9afdc2630753dfa06a20f
```

That revision includes the accepted Windows F1–F9 baseline plus integrated portable/software follow-ups for:

- SPEC-0010 relocatable device-code PTX;
- SPEC-0011 `u64` / `i32` / `f32` scalar launch arguments;
- SPEC-0012 typed Device LTO-IR and homogeneous LTO linking.

Those three follow-ups retain their separately stated exact native promotion gates. Portable/software integration is not a native support claim.

For discovery continuity, the accepted foundation still includes `CJS-F1B`, Windows `CJS-F2W` through `CJS-F7W` and later accepted Windows slices, exact qualified Node 26.7.0 evidence, and the retained independent Linux x86-64 qualification path. Linux x86-64 portable/ABI evidence is not native Linux CUDA support.

The older detailed status narrative is preserved at exact revision `0f622a667145c810bcc9afdc2630753dfa06a20f` and indexed by [`docs/archive/2026-08-12-status-before-status-semantics-reset.md`](docs/archive/2026-08-12-status-before-status-semantics-reset.md).

## Status-language correction

Capability state now follows [`agent_files/general_foundation/STATUS_SEMANTICS.md`](agent_files/general_foundation/STATUS_SEMANTICS.md).

These dimensions are independent:

1. architectural disposition;
2. implementation status;
3. qualification/support status;
4. priority/scheduling status.

Legacy `no-support` wording is qualification/public-support language only unless an accepted architectural decision explicitly says `rejected`. Scope phrases such as `does not authorize` or `out of scope` remain local to the named contract/work package.

## Current execution baseline

SPEC-0005 remains the accepted current execution profile:

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1
max in-flight launches:       1
completion:                   private event + terminal polling
public launch resolution:     terminal completion/failure
```

SPEC-0015 clarifies that this was the deliberately narrow F5 proof boundary, not a permanent architectural ceiling.

### Submission/completion separation

```text
architectural disposition: planned
implementation status:       not implemented in accepted main
qualification status:        not qualified
priority:                    next execution-lifecycle capability
issue:                       #51
```

The intended first slice separates successful GPU submission from later completion while retaining one private stream and `maxInFlight = 1`. Production implementation requires a new accepted operation-lifecycle specification and the required experiment/evidence gate.

### Bounded multi-stream execution

```text
architectural disposition: planned
implementation status:       not implemented in accepted main
qualification status:        not qualified
priority:                    after submission/completion separation
issue:                       #40
```

The intended direction is a bounded CUDA-JS-owned private stream pool and opaque operations, not raw public CUDA stream/event handles. It must consume the operation lifecycle established by #51.

### Long-lived sideband

```text
architectural disposition: planned
implementation status:       portable experiment exists on unintegrated PR #50
qualification status:        not qualified
priority:                    after submission/completion separation
issue:                       #38
```

Issue #38 owns mailbox/sideband-specific semantics. Operation submission/completion lifecycle belongs to #51.

## Open unintegrated work

### PR #49 — restricted Device-JS

PR #49 is open and **not integrated into `main`** at this status revision. It must be reassessed against current authority/base, pass protected checks, merge, and receive exact `main` read-back before CUDA-JS may claim Device-JS is integrated.

### PR #50 — detached-operation / sideband experiment

PR #50 is open and **not integrated into `main`**. Its portable experiment remains useful evidence, but its operation-lifecycle portions must be reconciled with #51 so two owners do not emerge.

## Platform qualification

The exact accepted Windows x64 profile remains the native evidence baseline. Native Linux x64, WSL2, Linux ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization profiles, and other hardware/evidence axes retain their own qualification requirements.

A profile that is not currently qualified is not thereby architecturally rejected.

## Current blockers

- this working sandbox has no NVIDIA GPU/toolkit exposure for exact native execution evidence;
- native Linux CUDA qualification requires a suitable NVIDIA Linux host;
- submission/completion separation requires a new accepted lifecycle contract before production implementation;
- bounded multi-stream scheduling depends on that operation lifecycle;
- PR #49 and PR #50 remain unintegrated and must be reconciled after the status-semantics correction.

## Current next action

Follow `next_step.yaml` schema 23:

1. integrate the status-semantics/specification correction;
2. reconcile issue states that were changed using overloaded `no-support` / `not planned` reasoning;
3. restart #51 from assessment and current NVIDIA research;
4. only then proceed to #40's bounded multi-stream development cycle;
5. reassess PR #49 and PR #50 against the corrected authority and exact current base.
