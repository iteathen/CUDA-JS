# Device-JS External Deletion and CUDA-MCGS Compatible-Pair Continuation

**Status:** Proposal

**Date:** 2026-08-12

**CUDA-JS input baseline:** protected `main` `fe9ed78939d3876790291421cec367fde58a8310`, package `cuda-js@0.1.0-alpha.5`.

## Outcome

Complete the remaining cross-repository proof that CUDA-JS can remain consumer-neutral while CUDA-MCGS expresses a real GPU-resident search algorithm without maintained CUDA-specific implementation source.

This is the continuation of completed DJS-0/DJS-1 and CJS-F9-A/B. It does not reopen those completed work packages.

## Pair-0 — neutral Device-JS native proof

Complete NQ-DEVICE-JS / issue #43 DJS-2 from the native qualification plan. No CUDA-MCGS semantics may appear in this fixture.

**Gate:** exact public package path, independent oracle, native compiler/launch/result parity, and terminal cleanup.

## Pair-1 — external first-consumer deletion test

After Pair-0, use the CUDA-MCGS Connect Four semantic/reference evidence as the first external test:

- CUDA-MCGS owns Connect Four/search semantics and restricted Device-JS program source;
- CUDA-JS owns Device-JS validation, generic GPU helpers, CUDA lowering, compiler/linker artifacts, resource/operation/runtime mechanics;
- maintained CUDA-MCGS production-oriented source contains no required `.cu`, `.cuh`, hand-authored PTX, CUDA header/ABI/provider/Driver implementation;
- result and search-semantic behavior are compared against CUDA-MCGS's independent CUDA-free oracle and retained bounded GPU evidence;
- deleting CUDA-MCGS/Connect Four leaves CUDA-JS Device-JS/package tests coherent.

A missing generic GPU primitive is a CUDA-JS capability gap; do not add a consumer-local CUDA escape hatch.

## Pair-2 — exact package/adapter contract

CUDA-MCGS owns its public adapter/search-package semantics. CUDA-JS exposes only generic package/runtime capabilities.

Record an exact compatible-pair identity containing at least:

- exact CUDA-JS revision/package/compatibility identity;
- exact CUDA-MCGS revision/package/Search Program identity;
- selected accepted capability contracts and their versions;
- CUDA-JS-generated artifact/toolchain/profile identity where needed for execution provenance;
- finite resource/profile identity;
- conformance/evidence digest set.

No deep import or consumer schema enters CUDA-JS.

## Pair-3 — execution profile selection

A finite terminal search engine does **not** wait for sideband production merely because long-lived sessions are planned elsewhere.

If the selected compatible-pair profile requires live external root/control/observation while device work remains active, that profile additionally depends on an accepted/qualified generic CUDA-JS sideband capability from issue #38. Otherwise #38 remains independent.

Likewise RDC or Device LTO are not default compatible-pair blockers merely because they exist. The concrete Search Composer/realization must establish an actual need before making them pair dependencies, and each claimed native capability retains its own qualification gate.

## Pair-4 — F9-C compatible-pair evidence

The CUDA-JS F9 trusted-header/atomic-publication prerequisite is already complete. Remaining F9-C acceptance is cross-repository:

- one-way public dependency;
- exact compatible revisions/artifacts;
- active search progress remains device-owned after ignition;
- independent CUDA-JS and CUDA-MCGS conformance remains intact;
- teardown/resource evidence is terminal;
- no CUDA-MCGS/search meaning appears in CUDA-JS.

## Stop conditions

Stop and route the finding to the owning repository if:

- Device-JS cannot express the required algorithm without a consumer-local CUDA escape;
- a generic GPU primitive has no truthful CUDA-JS contract;
- CUDA-JS would need MCGS/domain semantics;
- CPU-produced intermediates become necessary for active search progress;
- compatibility identity or cleanup cannot be made exact;
- the selected live-session profile needs sideband semantics that are not yet accepted/qualified.
