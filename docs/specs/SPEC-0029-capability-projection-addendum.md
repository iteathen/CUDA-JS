# SPEC-0029 Addendum: Public cuBLASLt capability projection

**Status:** Accepted

**Date:** 2026-09-03

**Owner:** `runtime.cuda-library-adapters`

**Parents:** accepted `SPEC-0023-context-bound-cuda-library-adapters.md` and `SPEC-0029-cublaslt-f32-matmul.md`

**Issue owner:** #178

## Outcome

Complete the existing bounded cuBLASLt public capability/admission surface without adding a provider registry, probe service, scheduler, executable abstraction, or consumer-specific policy.

For the accepted `cublaslt-f32-row-major-matmul-v1` child, the sanitized public provider declaration returned by `CudaRuntime.openCublasLt()` and `CudaCublasLt.status()` additionally reports:

```text
workspaceAlignmentBytes: 256
```

The value is a positive safe integer and is the single lower-authoritative workspace-offset alignment requirement for this admitted child profile. The selected plan continues to report its exact `workspaceBytes` separately. CUDA-JS continues to validate both ordinary and prepared-DAG workspace views against the same lower-owned alignment fact.

This is an additive projection of the alignment requirement already governed by SPEC-0029; it does not add a second workspace policy or permit callers to select an alignment.

## Admission and fallback classification

The existing public `CudaJsError.category` remains the consumer-neutral disposition surface. No second fallback enum or provider-code translation table is introduced.

For this child profile, ordinary inability to realize a valid request because the admitted provider/profile is unavailable or incompatible, or because no supported algorithm/candidate can satisfy the bounded request, is reported through the existing public category:

```text
unsupported
```

A semantic consumer may use `category === 'unsupported'` as evidence that an explicitly permitted semantically equivalent fallback may be considered. Consumers must not need to match `CUBLASLT_*`, native status values, DLL names, provider paths, or implementation-language details for that ordinary preference decision.

The following categories are intentionally not reclassified as ordinary preference fallback by this addendum:

- `validation` — the caller request or capability use is invalid;
- `backpressure` — an admitted lifecycle/concurrency boundary was reached;
- `provider` — an admitted provider violated or could not safely satisfy its contract;
- `restart-required` — cleanup/ownership truth is no longer safely recoverable in-process;
- driver/permission/internal terminal classes defined by their existing owners.

Issue #179 separately owns whether the current duplicate-open `backpressure` condition is the correct cuBLASLt child lifecycle. This addendum neither preserves nor removes that condition.

## Identity and compatibility

The provider declaration is finite and versioned by the existing `cublaslt-f32-row-major-matmul-v1` profile plus its sanitized provider qualification identity. `workspaceAlignmentBytes` is part of that public declaration and therefore part of the provider facts copied into SPEC-0031 prepared cuBLASLt semantic identity.

A future admitted child requiring a different workspace alignment must expose its own exact value under separately accepted authority and compatibility identity. Consumers may impose stricter allocation policy, but they may not replace the lower requirement with a copied CUDA-JS/provider constant.

The existing provider fields remain sanitized. No native handle, library path, export name, algorithm identifier, raw provider status, header path, or mutable provider option becomes public.

## Lifecycle

No lifecycle changes are authorized here. `openCublasLt()`, adapter ownership, plan ownership, operation leasing, prepared-DAG leasing, cancellation/failure behavior, and cleanup remain exactly under SPEC-0023, SPEC-0029, SPEC-0031, and the ordinary CUDA-JS resource/operation contracts.

In particular, this addendum does not authorize a global provider cache, generic provider lease API, shared handle registry, side-effect-free admission probe, hidden workspace allocation, or consumer-owned native resource.

## Required evidence

Portable/software qualification must prove at least:

- the public cuBLASLt provider declaration exposes exactly `workspaceAlignmentBytes: 256` for the accepted test profile;
- `CudaCublasLt.status()` reports the same value as the initially opened adapter capability;
- ordinary and prepared workspace validation consume the same lower-owned alignment constant;
- missing, noncanonical, and wrong-identity provider profiles retain public-facing `unsupported` classification rather than requiring consumer code matching;
- existing provider identity fields remain path-free and sanitized;
- the installed/public package path remains sufficient for consumers.

Native/provider support claims remain governed by SPEC-0029 and are not upgraded by portable evidence for this additive projection.

## Falsifiers

Rollback this addendum if the projection requires consumer vocabulary, native provider controls, a second error taxonomy, a second resource lifecycle, mutable capability state, unbounded facts, or a consumer-specific fallback decision inside CUDA-JS.

## Non-goals

Provider sharing/borrowing, generic leasing, Tensor selection policy, Tensor workspace planning, NN/search semantics, executable preparation, logical-work launch resolution, arbitrary cuBLASLt operations, performance policy, or a universal GPU/provider abstraction.
