# CUDA-JS Status

**Status:** Active operational state

**Updated:** 2026-09-05

## Current package and capability projection

```text
package:                     cuda-js@0.1.0-alpha.18
public API schema:           1
host source model:           JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:         testing-unconfirmed / not-qualified
production support:          no
performance claims:          none beyond exact recorded evidence
current source blocker:      none in the protected Vector tanh dependency lane
current dependency handoff:  CUDA-JS-Tensor #61 implements accepted unary:tanh through public CUDA-JS
parallel physical gate:      #32 exact CUDA-MCGS/CUDA-JS compatible-pair qualification
```

`package.json` owns package identity. `packaging/compatibility-manifest.json` owns the immutable public capability projection. **Exact protected branch/commit/tree identity is read from GitHub** when required; it is not maintained here as a self-referential live-SHA field.

The protected tanh implementation transaction is `d1a8edef5bd06c402a5c14c8945269f206520174`, reviewed tree `4e71779e19132fedbaa60bacee7db84b0692e1ae`. Those values are implementation provenance, not permanent compatibility or physical-qualification constants; this documentation reconciliation itself moves protected `main` after integration.

## Stable ownership

CUDA-JS owns generic Device-JS/compiler/runtime/provider/resource/lifecycle/compatibility mechanisms. CUDA-JS-Tensor owns generic Tensor mathematics/planning/item semantics. `cuda-nn` owns reusable NN/model semantics only when independently justified. CUDA-MCGS owns search/evaluator request/batch/scatter/publication lifecycle. Product/model/chess/head meaning stays downstream.

### Durable architecture/evidence anchors

These markers are retained provenance and governance anchors, not live support or work dashboards. `DriverActor` remains the Worker/context/native-resource owner. `CJS-F1B` remains the generated CUDA ABI-fact and independent layout-evidence anchor; `CJS-F2W` remains the accepted **Windows x64** Driver/bootstrap evidence anchor; `CJS-F7W` remains the retained Windows platform-hardening/property/lifecycle evidence anchor. Historical exact profiles do not silently requalify the current candidate.

### External CUDA-NN ownership

**External CUDA-NN ownership** remains governed by ADR-0007. Reusable NN/model/inference/autodiff/training semantics belong to independent `iteathen/cuda-nn`, while generic Tensor mathematics/planning belongs to CUDA-JS-Tensor. The historical bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only; those reusable NN semantics **no longer belong to a future publish unit in this repository**.

## Protected Device-JS numeric children

The current package capability includes the protected dense numeric profile plus additive same-kind f32/f64 Device-JS children for:

- `SPEC-0030-erf-v1` → public `gpu.math.erf(x)`;
- `SPEC-0030-tanh-v1` → public `gpu.math.tanh(x)`; and
- canonical dense+erf+tanh contract/library composition when both helpers are semantically required.

The tanh implementation preserves pre-tanh base/dense/dense+erf identities, lowers privately through ordinary `tanhf`/`tanh`, rejects unsupported lower-precision/integer/bool use and forged child combinations, and does not introduce Tensor/model/activation/search semantics. Portable/software/package evidence for erf or tanh does not promote native/provider numerical support.

CUDA-JS #206 and #209 are therefore protected-complete. There is no remaining generic CUDA-JS source gap demonstrated by the current frozen LatticeKnight model lane.

## Current actionable handoff — CUDA-JS-Tensor #61

Protected UCI-Arena-Vector PR #17 / merge `67b2512794c4389abdea22e7f353dac712f6c03d` freezes one exact LatticeKnight model and proves that, after protected Tensor erf/gather/concat support, the one remaining generic model mathematical requirement is `unary:tanh`.

CUDA-JS now supplies the required lower scalar mechanism. CUDA-JS-Tensor has accepted `SPEC-0011` for consumer-backed f32/f64 `unary:tanh` at protected merge `3f34e3153b75e5059a6473ee52c95c7b662a62ed`; Tensor issue #61 owns the next implementation/evidence step. That downstream Tensor work must consume public CUDA-JS only and does not authorize another CUDA-JS widening merely to accelerate completion.

After Tensor #61 is protected-qualified, UCI-Arena-Vector #3 should refresh its exact capability snapshot and continue to its already-demonstrated TensorProgram/TensorPlan workspace/resource and oracle gates. CUDA-MCGS #124 remains downstream of those generic callable/resource facts.

## Parallel evidence gates

**#32 exact CUDA-MCGS compatible pair** remains valid P0 physical qualification but is not executable on repository-hosted portable CI alone. Both CUDA-MCGS and CUDA-JS have moved since older recorded pair tuples, so any physical run must re-read both protected heads/trees/package/API identities immediately before execution and freeze only the exact tuple actually run. No tanh result closes or broadens that physical support claim.

**#4 native Linux** remains separately blocked on a directly exposed physical NVIDIA/Linux host. **#68** remains external operational security evidence.

CUDA-JS #198 is closed not planned for the current path because protected CUDA-MCGS #125 completed without selecting that resident-payload capability. Reopen only on fresh concrete consumer evidence.

## Claim and integration limits

Portable/mock/package evidence cannot become native CUDA/provider support. Protected integration requires exact-head qualification, author/independent-review truth, exact base/tree validation and protected read-back. Standing user authorization remains active for this workstream; do not create an authorization-only stop when the technical invariants are satisfied.
