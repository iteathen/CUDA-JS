# CUDA-MCGS Interoperability Boundary

**Status:** Proposal

CUDA-MCGS, currently housed in the `iteathen/UMCGS` repository, is a one-way public-contract consumer of CUDA-JS. This document describes the intended compatible-pair boundary; it does not claim that the external deletion test or an exact pair has passed.

<!-- CUDA-JS:BEGIN GENERATED CUDA-MCGS INTEROP -->
| Boundary | Governance projection |
|---|---|
| Status | compatible-pair-pending |
| External consumer owns | semantic Device-JS program; domain oracle; finite resource plan |
| CUDA-JS owns | Device-JS validation; CUDA C++ lowering; private generated CUDA; compilation and linking; artifact identity and cache; runtime execution and lifecycle |
| Production authoring boundary | consumer-authored CUDA or PTX is not required |
| Cross-repository deletion test | required |
| Exact compatible pair | pending |
<!-- CUDA-JS:END GENERATED CUDA-MCGS INTEROP -->

## Ownership

CUDA-MCGS owns:

- search/domain semantics and its independent CUDA-free oracle;
- finite search-resource meaning and result interpretation;
- canonical restricted Device-JS program source for the production-oriented GPU algorithm;
- its adapter/package contract and selected compatible CUDA-JS capability requirements.

CUDA-JS owns:

- the accepted restricted Device-JS grammar, typing, helper semantics, validation, diagnostics, and deterministic identity;
- private CUDA C++ generation, CUDA headers/intrinsics, NVRTC/nvJitLink options, compilation, artifacts, cache identity, ABI mechanics, and target policy;
- opaque memory/module/function/operation capabilities, launch/completion, errors, health, and teardown;
- generic conformance that remains coherent after CUDA-MCGS is deleted.

The intended production boundary does not require CUDA-MCGS to maintain `.cu`, `.cuh`, hand-authored PTX, CUDA headers, native options, Driver calls, or CUDA-specific synchronization syntax. Direct CUDA C++ and PTX remain valid lower-level CUDA-JS capabilities for unrelated consumers and independent evidence; they are not the selected CUDA-MCGS production-authoring boundary.

## External deletion and compatible-pair gates

Cross-repository completion requires, in order:

1. CUDA-JS's consumer-neutral Device-JS native fixture passes through the public package path with an independent oracle and terminal cleanup.
2. CUDA-MCGS expresses the selected production-oriented device algorithm as restricted Device-JS while CUDA-JS owns all CUDA realization; deleting CUDA-MCGS still leaves CUDA-JS conformance coherent.
3. CUDA-MCGS's independent semantic oracle agrees with the pair result, and no CUDA-MCGS/search meaning enters CUDA-JS.
4. One compatible-pair record pins the exact CUDA-JS revision/package/compatibility identity, CUDA-MCGS revision/package/program identity, selected contract versions, generated artifact/toolchain/profile identity, finite resource profile, evidence digests, and terminal disposition.

The pair is currently pending. Portable Device-JS/package tests, the CUDA-JS-owned F9 atomic prerequisite, and candidate native results do not by themselves establish this cross-repository proof.

## Repository placement

The CUDA-MCGS adapter belongs to `iteathen/UMCGS` unless it later acquires an independent lifecycle or multiple independent producers. CUDA-JS never imports CUDA-MCGS source or schemas.

See [`ADR-0001`](decisions/ADR-0001-repository-boundary.md), accepted [`SPEC-0013`](specs/SPEC-0013-restricted-device-js.md), and the active [compatible-pair continuation](plans/2026-08-12-compatible-pair-continuation.md).
