# CUDA-JS Status

**Status:** Active operational state

**Updated:** 2026-09-09

## Current package and support truth

```text
package:                     cuda-js@0.1.0-alpha.20
public API schema:           1
host source model:           JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:         testing-unconfirmed / not-qualified
production support:          no
performance claims:          none beyond exact recorded evidence
current generic source gap:  #251 lower Device-JS inspection stud implemented; protected integration pending
physical pair #32:          passed, reviewed and owner-approved; exact Windows profile only
```

`package.json` owns package identity. `packaging/compatibility-manifest.json` owns the public capability projection. The exact protected branch/commit/tree identity is read from GitHub when exact identity matters; this file does not own a self-updating live SHA.

Recorded design-governance provenance for this status transition remains protected `7e9221e71bd618bdc404299c3b707ca1ced37c6b`, tree `22c3e9eca3163feac1167942807ec383ed457149`. That tuple is provenance only, not a substitute for live read-back.

## Stable ownership

CUDA-JS owns consumer-neutral Device-JS, compiler, artifact, module/function, runtime, provider, memory/resource, operation/publication, lifecycle and compatibility mechanisms. CUDA-JS-Tensor owns generic Tensor mathematics/planning/item/workspace semantics. CUDA-MCGS owns evaluator/search/request/batch/scatter/publication/search-lifecycle semantics. Product/model/checkpoint/domain meaning remains downstream.

### Device-JS frontend inspection — #251

Issue #251 is the active producer correction demonstrated by CUDA-MCGS #124/#249: CUDA-JS already owned `gpu.atomic.cas` and the rest of the closed Device-JS language, but downstream composers lacked a public CUDA-free way to validate that language before compiler/native mutation.

`inspectDeviceProgram(request)` is now implemented on the #251 candidate as a pure public frontend surface. It uses the same authoritative Device-JS translation path as `compileDeviceProgram()`, supports public `DeviceJsImport` values, and returns only the immutable public `deviceProgram` descriptor. Compilation reuses the same internal inspection path so the public preflight and compile frontend cannot independently define helper/type semantics.

This capability makes no native/provider/hardware/performance claim. Its downstream deletion test is CUDA-MCGS #124 removing PR #249's CAS-specific strip/restore admission shim and shadow helper authority after this producer surface is protected.

### External CUDA-NN ownership

ADR-0007 keeps reusable NN/model/inference/autodiff/training semantics outside CUDA-JS in `iteathen/cuda-nn`. The bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only; those semantics **no longer belong to a future publish unit in this repository**.

### Durable architecture/evidence anchors

`DriverActor` remains the Worker/context/raw-resource owner. `CJS-F1B` remains the generated CUDA ABI-fact and independent layout-evidence anchor; `CJS-F2W` and `CJS-F7W` remain retained Windows x64 evidence/provenance anchors. These names are durable architecture/evidence markers, not live support or current-work dashboards.

### Cross-repository readiness rule

CUDA-JS owns only its **producer facts**: what public capability exists, its exact contract/compatibility identity, and what qualification supports it. A consuming repository owns whether those facts are sufficient for its own work.

Therefore CUDA-JS does **not** sequence CUDA-MCGS #124 behind UCI-Arena-Vector numerical qualification. Vector's independent checkpoint oracle remains Vector-owned product evidence. CUDA-MCGS independently owns the readiness and work ordering of its product-neutral evaluator/runtime composition. If either consumer demonstrates a genuinely consumer-neutral CUDA-JS defect, that defect routes back here without moving consumer policy into CUDA-JS.

## Accepted physical compatible pair — #32

The exact protected pair passed on Windows x64 / GTX 1660 Ti / driver 610.74 / CUDA 13.3 / Node 26.7.0. The [published review and evidence](https://github.com/iteathen/CUDA-MCGS/blob/main/docs/evidence/gate-32-2026-09-09/README.md) record all source/tree/package/API identities, one 4 × 256 launch, 4096 terminal bytes, Channel release/acquire publication and graceful cleanup. The project owner approved the review and gate completion.

This qualifies only the recorded pair. The later F8 verifier correction updates its stale alpha.18 expectation to alpha.19; its full Windows hardware run is separate from the protected pair evidence. Future materially changed pairs require fresh qualification. CUDA-JS #4 native Ubuntu qualification and #68 operational security evidence remain separate.

## Claim limits

Portable/mock/package evidence cannot become native CUDA/provider support. Protected integration requires exact-head qualification, complete review, exact base/tree validation and protected read-back. No downstream readiness claim is authoritative merely because it is repeated in this repository.

## Candidate #260 — public view relation

The [SPEC-0021 relation addendum](docs/specs/SPEC-0021-view-relation-addendum.md) proposes synchronous `inspectDeviceViewRelation(a, b)` with private parent/range validation and no native work. The alpha.20 candidate returns only same-range/overlap/disjoint; upper libraries retain alias policy. PR review and owner review precede integration. Existing #32 native qualification remains tied to its recorded alpha.19 pair.
