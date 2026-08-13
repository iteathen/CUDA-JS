# CJS-F9 Atomic Interop Assessment and Execution Plan

**Status:** Informational

**Execution status:** CUDA-JS prerequisite complete; cross-repository reconciliation pending CUDA-MCGS

**Input revision:** `b85b98d`

**Issue:** `iteathen/CUDA-JS#32`

## Outcome and non-goals

Qualify the accepted public CUDA-JS package to compile and execute one opaque CUDA C++ kernel using device-scope release/acquire atomics, without importing CUDA-MCGS semantics. The cross-repository pair is integrated only after the independent CUDA-MCGS assessment.

Non-goals are graph/search contracts, scheduler selection, CUDA-MCGS source in this repository, ambient include paths, arbitrary library profiles, cancellation, concurrency, Linux promotion, performance claims, and registry publication.

## Assessment

The first native probe failed deterministically in NVRTC because `cuda/atomic` was unavailable. Aggregate close was graceful. The public Driver/memory/module/launch/completion surface is sufficient; only trusted header capability and its identity are missing.

Correctness, cache integrity, security, cleanup, and repository independence are hard gates. Startup cost and implementation size are optimizable. The strongest safe path is a manifest-verified virtual CCCL bundle selected by a typed compile option. Ambient include search is cheaper locally but unsound over cache, diagnostics, and replacement lifecycle.

## Focus packets

### CJS-F9-A — contract and provider identity

- **Owner/write surface:** SPEC-0009, this plan, compiler provider manifest, compiler contract and header-profile loader.
- **Expected effect:** exact path-free profile validation before cache lookup; no behavior change for the default profile.
- **Acceptance:** unit mutation cases and cache-key separation.
- **Falsifier:** ambient path dependency, incomplete digest, default cache/artifact behavior change, or public path leakage.
- **Rollback:** remove the additive option/profile and retain the verified issue as unsupported.

### CJS-F9-B — public native capability capsule

- **Dependency:** CJS-F9-A accepted locally.
- **Owner/write surface:** generic `conformance/f9`, thin runner, package/compatibility records.
- **Expected effect:** compile, launch, read, and terminally close one generic publication fixture.
- **Acceptance:** exact words, public path only, final evidence identity, graceful zero-residue close.
- **Falsifier:** compile/runtime mismatch, schedule-dependent expected value, timeout, cleanup uncertainty, or consumer terminology.
- **Rollback:** retain A as a compiler capability only and do not claim F9 native qualification.

### CJS-F9-C — cross-repository reconciliation

- **Dependency:** independent CUDA-MCGS assessment and its accepted package/adapter contract.
- **Owner/write surface:** no CUDA-MCGS code in CUDA-JS; exact compatible-pair evidence may be referenced from the CUDA-MCGS-owned capsule in `iteathen/UMCGS`.
- **Acceptance:** exact revisions/artifacts, one-way dependency, device-owned progress after ignition, independent internal conformance retained.
- **Falsifier:** deep imports, consumer schema in CUDA-JS, CPU search intermediates, or ambiguous compatibility identity.

## Validation and cleanup

Run the smallest unit cluster after A, native F9 after B, then documentation and the affected F6/F8 regressions. Preserve raw generated evidence only in ignored `build/` storage. Explicitly close all native/public resources, verify Worker exit and resource counts, inspect the exact diff, and leave the Git branch/worktree and issue state honest. Publication/issue closure requires exact remote integration and cross-pair completion; local success alone is insufficient.
