# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-09-03

## Current package and boundary state

```text
package candidate:            cuda-js@0.1.0-alpha.17
public API schema:            1
host source model:            JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:          testing-unconfirmed / not-qualified
performance claims:           none beyond exact recorded evidence
active lower gap:             #193 ordinary base-allocation alignment projection
cross-repository consumer:    CUDA-MCGS #125 public runtime adapter
```

CUDA-JS owns generic CUDA device/context/memory/compiler/artifact/module/function/operation/prepared-execution/provider mechanism and lower compatibility facts. CUDA-JS-Tensor owns Tensor mathematics/planning; CUDA-MCGS owns search semantics and selected search-profile policy; reusable NN/RNG/communication/I/O/media/ray/data semantics remain in their independent owners.

## Completed lower-boundary refactor

The protected alpha.17 line already completed the consumer-ownership audit that motivated #162:

- #178 — provider capability/admission truth is publicly consumable;
- #179 — cuBLASLt-specific borrower lifecycle is lower-owned without inventing a generic provider lease;
- #180 — no universal preparation transaction was justified; existing compiler/module/function/provider-plan/prepared-DAG resources remain the composition seam;
- #181 — no logical-work launch resolver was justified; explicit geometry remains the public expert contract while upper selected profiles own their physical-policy choices;
- #186 — prepared-DAG and Device-JS finite lower ceilings are projected through immutable `CUDA_JS_COMPATIBILITY` with drift falsifiers;
- CUDA-JS-Tensor #40/#44/#45 and CUDA-MCGS #193 completed their corresponding upper-boundary audits.

The architecture umbrella #162 is therefore closed completed. Future generic lower gaps must be opened only from demonstrated consumer need rather than from the umbrella.

## Existing generic substrate

The public/software/package substrate includes bounded device discovery/selection, device memory and contiguous typed views, module/function resources, explicit launch/completion, operation lifecycle, the accepted capacity-two scheduling profile, bounded async transfer, publication mailboxes, NVRTC/nvJitLink compilation and typed artifacts, restricted Device-JS, Device-JS leaf-library composition, dense numeric Device-JS, immutable prepared DAGs, and the bounded cuBLASLt f32 profile including prepared-DAG composition.

The public compatibility object exposes lower-owned prepared-DAG limits, Device-JS parameter limits, compiler output families, provider capability facts and other finite compatibility records. Those projections are not second validation owners.

## Durable architecture and evidence anchors

The issue-tracker cleanup does not erase established architecture/evidence provenance. `DriverActor` remains the Worker/context/native-resource owner. **CJS-F1B** remains the generated CUDA ABI-fact and independent layout-evidence anchor; **CJS-F2W** remains the accepted **Windows x64** Driver/bootstrap anchor; **CJS-F7W** remains the retained Windows platform-hardening/property/lifecycle anchor. Historical native evidence stays exact to its recorded revisions/profiles and is not silently requalified by current metadata changes.

## Current consumer-backed lower gap

CUDA-MCGS #122 is protected-accepted and its production adapter owner #125 is now dependency-ready except for demonstrated lower capability gaps. The first such gap is CUDA-JS #193: accepted MCGS resource requirements need to prove ordinary base-allocation alignment before partial realization, while alpha.17 exposes no public allocation-alignment guarantee.

Research resolved the lower contract to a minimum **256-byte base-allocation alignment** for the existing ordinary CUDA allocation path. The selected correction is an additive compatibility projection owned by `runtime.memory`; it does not add a caller-selected aligned allocator and does not confer 256-byte alignment on arbitrary nonzero-offset views.

Draft authority PR #194 exists for that exact bounded contract and remains unmerged pending its normal exact-head review/authorization gate. After protected authority/readback, implementation should project the single lower-owned fact with drift/package evidence, then CUDA-MCGS #125 can consume it through public contracts.

## External CUDA-NN ownership

**External CUDA-NN ownership** is governed by ADR-0007. Reusable NN/model/inference/autodiff/training semantics belong to `iteathen/cuda-nn`; the historical provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only. Those semantics **no longer belong to a future publish unit in this repository**. CUDA-JS remains the generic lower CUDA mechanism owner.

## Qualification and issue-state policy

Portable/mock/package evidence proves only the paths it executes. Existing exact Windows evidence remains exact to its recorded Node/Driver/toolkit/provider/GPU revisions. Native Linux, additional hardware/provider cells, WSL/ARM64/Jetson/TCC/virtualization/MIG/ECC, performance and stability remain independently qualified through their concrete evidence issues/campaigns.

The 2026-09-03 tracker review closed completed implementation tickets that were being held open only for unspecified future qualification and closed dormant provider/service/optimization possibilities as `not planned` until a real consumer/profile activates them. Roadmap possibilities remain documented; they are not active engineering backlog merely because they are conceivable.

Protected `STATUS.md` and `next_step.yaml` own the live execution seam. Issues own durable obligations, blocked gates and concrete evidence cells rather than duplicate live-SHA timelines.
