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
current source blocker:      #206 composable f32/f64 Device-JS tanh for a protected real Tensor consumer
parallel physical gate:      #32 exact CUDA-MCGS/CUDA-JS compatible-pair qualification
```

`package.json` owns package identity. `packaging/compatibility-manifest.json` owns the immutable public capability projection. **Exact protected branch/commit/tree identity is read from GitHub** when required; it is not maintained here as a self-referential live-SHA field.

The recorded protected CUDA-JS input for the current state transition remains `main@dd41ce0693c91aff867a9db9ad4f11b507eeb38b`, tree `b331ddc3cadb48003ba86d7b920e7b6cb34606a1`, as transaction provenance only. Live protected state is read from GitHub.

## Stable ownership

CUDA-JS owns generic Device-JS/compiler/runtime/provider/resource/lifecycle/compatibility mechanisms. CUDA-JS-Tensor owns generic Tensor mathematics/planning/item semantics. `cuda-nn` owns reusable NN/model semantics only when independently justified. CUDA-MCGS owns search/evaluator request/batch/scatter/publication lifecycle. Product/model/chess/head meaning stays downstream.

### Durable architecture/evidence anchors

These markers are retained provenance and governance anchors, not live support or work dashboards. `DriverActor` remains the Worker/context/native-resource owner. `CJS-F1B` remains the generated CUDA ABI-fact and independent layout-evidence anchor; `CJS-F2W` remains the accepted **Windows x64** Driver/bootstrap evidence anchor; `CJS-F7W` remains the retained Windows platform-hardening/property/lifecycle evidence anchor. Historical exact profiles do not silently requalify the current candidate.

### External CUDA-NN ownership

**External CUDA-NN ownership** remains governed by ADR-0007. Reusable NN/model/inference/autodiff/training semantics belong to independent `iteathen/cuda-nn`, while generic Tensor mathematics/planning belongs to CUDA-JS-Tensor. The historical bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only; those reusable NN semantics **no longer belong to a future publish unit in this repository**.

Current package capability includes the protected dense numeric profile and `SPEC-0030-erf-v1` same-kind f32/f64 `gpu.math.erf`. Portable/package evidence for erf does not promote native/provider numerical support.

## Current focus — #206 composable tanh child

Protected UCI-Arena-Vector PR #17 / merge `67b2512794c4389abdea22e7f353dac712f6c03d` freezes one exact LatticeKnight model and proves that current protected Tensor closes its prior erf/gather/concat gaps while exactly one model mathematical requirement remains uncovered: `unary:tanh`.

That consumer evidence is dependency-ready and source-actionable, so it outranks the currently hardware-blocked #32 physical qualification cell under the repository portfolio-readiness rule.

The accepted authority transaction defines a new `SPEC-0030-tanh-v1` child with:

- public `gpu.math.tanh(x)`;
- f32/f64 same-kind semantics only in the first profile;
- ordinary private `tanhf`/`tanh` lowering, never approximate `__tanhf` or an exp identity;
- canonical additive contract ordering that preserves all existing base/dense/dense+erf identities and adds dense+tanh plus dense+erf+tanh;
- typed library/import propagation of exact selected children;
- no Tensor/model/activation/search semantics and no native-support or performance promotion.

Implementation must preserve representative pre-tanh contract strings, semantic identities, generated names and generated CUDA bytes exactly. Unknown or forged child combinations fail closed.

## Parallel evidence gates

**#32 exact CUDA-MCGS compatible pair** remains valid P0 physical qualification but is not executable on repository-hosted portable CI alone. It requires a suitable physical NVIDIA environment and exact pair evidence. No tanh implementation result closes or broadens that physical support claim.

**#4 native Linux** remains separately blocked on a directly exposed physical NVIDIA/Linux host. **#68** remains external operational security evidence.

CUDA-JS #198 is closed not planned for the current path because protected CUDA-MCGS #125 completed without selecting that resident-payload capability. Reopen only on fresh concrete consumer evidence.

## Claim and integration limits

Portable/mock/package evidence cannot become native CUDA/provider support. Protected integration requires exact-head qualification, author/independent-review truth, exact base/tree validation and protected read-back. Standing user authorization remains active for this workstream; do not create an authorization-only stop when the technical invariants are satisfied.
