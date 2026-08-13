# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-12

## Current repository state

The protected baseline through the reconciled publication-mailbox experiment is:

```text
d91c025c6f27aa40cbac8081cee687b60de1dd1b
```

This SPEC-0016 integration branch adds the bounded portable/software operation-lifecycle implementation on top of that protected baseline. After protected merge, remote `main` read-back is required before claiming the integration as merged.

The repository state represented by this branch contains:

- the accepted Windows F1–F9 foundation;
- integrated portable/software SPEC-0010 RDC, SPEC-0011 extended scalar ABI, and SPEC-0012 Device LTO follow-ups, each retaining separate native promotion gates;
- integrated proposed SPEC-0014 + EXP-013 publication-mailbox evidence, explicitly consuming rather than redefining SPEC-0016;
- SPEC-0015 status/scope clarification;
- accepted SPEC-0016 and its bounded portable/software `CudaOperation` implementation.

For discovery continuity, the retained foundation still includes `CJS-F1B`, Windows `CJS-F2W` through `CJS-F7W` and later accepted Windows slices, exact Node 26.7.0 evidence, and the Linux x86-64 qualification path. Linux portable/ABI evidence is not native Linux CUDA support.

Native SPEC-0016 support remains **not qualified** until its exact Windows native evidence passes. Portable/mock success does not establish native CUDA ordering, cleanup, or support.

## Status semantics

Capability state follows [`agent_files/general_foundation/STATUS_SEMANTICS.md`](agent_files/general_foundation/STATUS_SEMANTICS.md). Architectural disposition, implementation, qualification/support, and priority are independent.

Legacy `no-support` wording is qualification/public-support language only unless accepted architecture explicitly says `rejected`.

## Execution baseline

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1
max pending GPU operations:   1
public terminal convenience:  CudaFunction.launch()
public operation lifecycle:   CudaFunction.submit() -> CudaOperation
```

### SPEC-0016 submission/completion lifecycle

```text
architectural disposition: selected
implementation status:       integrated on this branch
qualification status:        not qualified
priority:                    active native qualification
issue:                       #51
```

Implemented first slice:

- `CudaFunction.submit()` returns one opaque `CudaOperation` only after kernel submission and private completion-event record provenance exist;
- `CudaOperation.status()` performs one short serialized DriverActor event-query turn;
- `CudaOperation.wait()` performs repeated short status turns outside the DriverActor and does not itself impose the legacy launch deadline;
- `CudaOperation.close()` is logical release after terminality; pending close is busy and never claims cancellation;
- one private stream / one pending operation remains the limit;
- while pending, only operation status/release/legacy-timeout and bounded runtime close are admitted; ordinary Driver/memory/resource commands and another submit fail before native work;
- legacy `CudaFunction.launch()` is host-side submit + repeated short status turns and preserves the SPEC-0005 terminal result/timeout semantics without retaining the DriverActor inside one polling command;
- runtime close may bounded-poll the pending operation before dependency teardown; if terminality remains unproved, teardown is refused and restart-required/orphan truth is preserved;
- no raw event, stream, context, pointer, operation token, or native handle crosses the public facade.

EXP-014 remains the retained orchestration experiment. The production implementation has its own execution-owner, DriverActor, facade, package, and installed-consumer regression coverage.

### Bounded multi-stream execution

```text
architectural disposition: planned
implementation status:       not implemented
qualification status:        not qualified
priority:                    after trustworthy SPEC-0016 lifecycle
issue:                       #40
```

#40 must consume SPEC-0016 rather than create another operation lifecycle. Raw public CUDA streams/events remain outside the selected direction.

### Publication mailbox / long-lived sideband

```text
architectural disposition: proposal direction selected for experiment
implementation status:       EXP-013 portable experiment integrated; no production mailbox
qualification status:        not qualified
priority:                    after trustworthy SPEC-0016 lifecycle
issue:                       #38
```

SPEC-0014 owns mailbox/sideband-specific semantics only. SPEC-0016 exclusively owns operation state, terminalization, leases, close, and pending-command behavior.

## Open unintegrated work

- **PR #49 Device-JS** — open/unmerged and under repair; do not claim integration before protected merge + main read-back.

## Platform qualification

The exact accepted Windows x64 profile remains the native evidence baseline. SPEC-0010/0011/0012/0016 retain their own explicit native promotion gates. Native Linux x64, WSL2, Linux ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, multi-GPU, MIG, ECC, soak/performance, and other axes retain their own independent status/evidence.

A profile or capability that is not qualified is not thereby architecturally rejected.

## Current blockers / claim limits

- this environment has no NVIDIA GPU/toolkit exposure for exact native SPEC-0016 qualification;
- native Linux CUDA requires suitable NVIDIA Linux hardware/provider exposure;
- #40 remains gated on a trustworthy SPEC-0016 lifecycle rather than spec acceptance alone;
- #49 remains open and must not be represented as integrated;
- lower-authority unfinished plan records such as `next_step.yaml` are intentionally **not** reconciled in this PR-repair phase; they will be repaired in the later plan-reconciliation phase.

## Current remediation sequence

The owner-directed remediation sequence is:

```text
focused sanity
→ repair merged main
→ repair existing PRs
→ repair remaining unfinished plans
```

This status records current reality only and does not silently rewrite unfinished plans.
