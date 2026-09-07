# CUDA-JS Status

**Status:** Active operational state

**Updated:** 2026-09-06

## Current package and support truth

```text
package:                     cuda-js@0.1.0-alpha.18
public API schema:           1
host source model:           JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:         testing-unconfirmed / not-qualified
production support:          no
performance claims:          none beyond exact recorded evidence
current generic source gap:  none demonstrated by the protected consumer-neutral lanes
current physical gate:       #32 exact CUDA-MCGS/CUDA-JS compatible-pair qualification
```

`package.json` owns package identity. `packaging/compatibility-manifest.json` owns the public capability projection. The exact protected branch/commit/tree identity is read from GitHub when exact identity matters; this file does not own a self-updating live SHA.

Recorded design-governance provenance for this status transition is protected `7e9221e71bd618bdc404299c3b707ca1ced37c6b`, tree `22c3e9eca3163feac1167942807ec383ed457149`. That tuple is provenance only, not a substitute for live read-back.

## Stable ownership

CUDA-JS owns consumer-neutral Device-JS, compiler, artifact, module/function, runtime, provider, memory/resource, operation/publication, lifecycle and compatibility mechanisms. CUDA-JS-Tensor owns generic Tensor mathematics/planning/item/workspace semantics. CUDA-MCGS owns evaluator/search/request/batch/scatter/publication/search-lifecycle semantics. Product/model/checkpoint/domain meaning remains downstream.

### External CUDA-NN ownership

ADR-0007 keeps reusable NN/model/inference/autodiff/training semantics outside CUDA-JS in `iteathen/cuda-nn`. The bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only; those semantics **no longer belong to a future publish unit in this repository**.

### Durable architecture/evidence anchors

`DriverActor` remains the Worker/context/raw-resource owner. `CJS-F1B` remains the generated CUDA ABI-fact and independent layout-evidence anchor; `CJS-F2W` and `CJS-F7W` remain retained Windows x64 evidence/provenance anchors. These names are durable architecture/evidence markers, not live support or current-work dashboards.

### Cross-repository readiness rule

CUDA-JS owns only its **producer facts**: what public capability exists, its exact contract/compatibility identity, and what qualification supports it. A consuming repository owns whether those facts are sufficient for its own work.

Therefore CUDA-JS does **not** sequence CUDA-MCGS #124 behind UCI-Arena-Vector numerical qualification. Vector's independent checkpoint oracle remains Vector-owned product evidence. CUDA-MCGS independently owns the readiness and work ordering of its product-neutral evaluator/runtime composition. If either consumer demonstrates a genuinely consumer-neutral CUDA-JS defect, that defect routes back here without moving consumer policy into CUDA-JS.

This correction changes governance/current-state ownership only; it does not add or remove a public CUDA-JS capability.

## Current CUDA-JS focus — #32 physical compatible pair

CUDA-JS #32 remains the current CUDA-JS-owned execution seam. The runner is ready and portable-qualified, but exact physical qualification is blocked on an accepted directly exposed NVIDIA environment. Hosted, VM, mock, package, Tensor or downstream product evidence cannot substitute for that physical evidence.

Immediately before a hardware run, read the live protected CUDA-JS and CUDA-MCGS heads/trees plus package/API/toolchain/environment identities and freeze only the tuple actually executed. A failure that demonstrates a generic lower defect belongs here; absence of hardware does not.

CUDA-JS #4 native Ubuntu qualification remains a separate physical support cell. CUDA-JS #68 remains external operational security evidence.

## Claim limits

Portable/mock/package evidence cannot become native CUDA/provider support. Protected integration requires exact-head qualification, complete review, exact base/tree validation and protected read-back. No downstream readiness claim is authoritative merely because it is repeated in this repository.
