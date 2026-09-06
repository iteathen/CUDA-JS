# CUDA-JS Status

**Status:** Active operational state

**Updated:** 2026-09-06

## Current package and capability projection

```text
package:                     cuda-js@0.1.0-alpha.18
public API schema:           1
host source model:           JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:         testing-unconfirmed / not-qualified
production support:          no
performance claims:          none beyond exact recorded evidence
current generic source gap:  none demonstrated by the frozen LatticeKnight lane
current downstream model seam: independent checkpoint-bound numerical oracle in UCI-Arena-Vector #3
current physical gate:       #32 exact CUDA-MCGS/CUDA-JS compatible-pair qualification
```

`package.json` owns package identity. `packaging/compatibility-manifest.json` owns the immutable public capability projection. Exact protected branch/commit/tree identity is read from GitHub when required; it is not maintained here as a self-referential live-SHA field.

## Current protected implementation provenance

The current protected bounded-admission transaction is CUDA-JS #213 / PR #216, merge `45a9ef15537b52d6fd7c615b7e596676dfd00587`, reviewed tree `8d25993380770b5616d0340b4b7fc369b5af603a`.

That transaction revised only the accepted finite admission guards required by the first real Tensor leaf:

- Device-JS source limit: 4 MiB;
- Device-JS AST-node limit: 1,048,576;
- CompilerActor source limit: 4 MiB;
- existing depth, function, parameter, import, type, call-graph, lifecycle and compatibility semantics remain unchanged.

Protected post-merge `verify` run `34020219808` and `node-compatibility` run `34020219809` succeeded; the required schema gate remained green on the same protected integration. This is portable/software/package admission evidence only. It does not promote native/provider or physical NVIDIA support.

The earlier protected tanh implementation transaction `d1a8edef5bd06c402a5c14c8945269f206520174`, reviewed tree `4e71779e19132fedbaa60bacee7db84b0692e1ae`, remains implementation provenance for public f32/f64 `gpu.math.tanh`. It is not the current protected-main identity and must not be confused with the later bounded-admission transaction.

## Stable ownership

CUDA-JS owns generic Device-JS/compiler/runtime/provider/resource/lifecycle/compatibility mechanisms. CUDA-JS-Tensor owns generic Tensor mathematics/planning/item semantics. `cuda-nn` owns reusable NN/model semantics only when independently justified. CUDA-MCGS owns search/evaluator request/batch/scatter/publication lifecycle. Product/model/chess/head meaning stays downstream.

### Durable architecture/evidence anchors

These markers are retained provenance and governance anchors, not live support or work dashboards. `DriverActor` remains the Worker/context/native-resource owner. `CJS-F1B` remains the generated CUDA ABI-fact and independent layout-evidence anchor; `CJS-F2W` remains the accepted Windows x64 Driver/bootstrap evidence anchor; `CJS-F7W` remains the retained Windows platform-hardening/property/lifecycle evidence anchor. Historical exact profiles do not silently requalify the current candidate.

### External CUDA-NN ownership

**External CUDA-NN ownership** remains governed by ADR-0007. Reusable NN/model/inference/autodiff/training semantics belong to independent `iteathen/cuda-nn`, while generic Tensor mathematics/planning belongs to `iteathen/CUDA-JS-Tensor`. The historical bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only; those reusable NN semantics **no longer belong to a future publish unit in this repository**.

## Protected Device-JS numeric children

The current package capability includes the protected dense numeric profile plus additive same-kind f32/f64 Device-JS children for:

- `SPEC-0030-erf-v1` → public `gpu.math.erf(x)`;
- `SPEC-0030-tanh-v1` → public `gpu.math.tanh(x)`; and
- canonical dense+erf+tanh contract/library composition when both helpers are semantically required.

The tanh implementation preserves pre-tanh base/dense/dense+erf identities, lowers privately through ordinary `tanhf`/`tanh`, rejects unsupported lower-precision/integer/bool use and forged child combinations, and introduces no Tensor/model/activation/search semantics. Portable/software/package evidence for erf or tanh does not promote native/provider numerical support.

CUDA-JS #206/#209 and the later #213/#216 bounded-admission correction are protected-complete. No remaining generic CUDA-JS source defect is demonstrated by the frozen first-model path.

## Completed downstream exact-pair handoff

CUDA-JS-Tensor PR #68 protected the exact lower dependency refresh as Tensor merge `0da2c70a0a10df908a33e842aa4ba3dbd7605c48`, selecting CUDA-JS `45a9ef15537b52d6fd7c615b7e596676dfd00587` without changing Tensor mathematics, TensorProgram/TensorPlan semantics or callable ABI. Tensor protected post-merge verify `34020688142` succeeded.

UCI-Arena-Vector PR #24 then protected the frozen LatticeKnight-4M FP32 TensorProgram/TensorPlan and public callable/resource gate as merge `ca3cce162a73a664a789f6a27a819097ec994bd6`, tree `2182527aa9cd058824d3658a549a2f8224d18db5`. Its protected post-merge `Repository quality` run `34023725885` and `Model Tensor Coverage` run `34023725845` succeeded.

The resulting consumer-neutral facts relevant to this repository are:

- the exact Tensor pair can compile the real generated Device-JS leaf through the public CUDA-JS bounded-admission path;
- no private lower override or Vector-maintained native path is required;
- no new generic CUDA-JS capability gap is demonstrated by that mapping.

The Tensor-owned callable workspace is 33,194,524 bytes per item; item capacity 2 remains below Tensor's selected 64 MiB ceiling, while capacity 3 fails closed at the Tensor-owned workspace-pressure boundary. Those are Tensor resource facts, not CUDA-JS resource policy.

Vector PR #25 and Tensor PR #69 subsequently reconciled their protected control state. The only remaining first-model correctness seam is the **independent checkpoint-bound policy/value numerical oracle owned by UCI-Arena-Vector #3**. Missing oracle evidence is not a CUDA-JS implementation defect and does not authorize speculative lower changes.

CUDA-MCGS #124 remains downstream of completed product numerical qualification and consumes only public generic callable/resource facts while retaining evaluator/search lifecycle ownership.

## Current CUDA-JS focus — #32 physical compatible pair

CUDA-JS #32, exact CUDA-MCGS/CUDA-JS physical compatible-pair qualification, remains valid P0 physical qualification and remains blocked on an accepted directly exposed NVIDIA environment. Hosted, portable, VM, mock, DevBridge orchestration or downstream package evidence cannot substitute for physical CUDA evidence.

Both repositories may move before that hardware run. Immediately before execution, re-read the live protected CUDA-MCGS and CUDA-JS heads/trees plus package/API/toolchain/environment identities and freeze only the tuple actually executed.

The next CUDA-JS-owned action is the existing #32 runner when an accepted physical NVIDIA environment is available. Until then this is an evidence/infrastructure blocker, not a source-code task. CUDA-JS #4 native Ubuntu qualification remains a separate directly exposed physical NVIDIA/Linux support cell. CUDA-JS #68 remains external operational security evidence.

DevBridge may improve the path to reproducible Linux/Windows guest execution and future physical-host orchestration, but DevBridge CI/VM results do not themselves satisfy CUDA-JS #32 or #4.

## Claim and integration limits

Portable/mock/package evidence cannot become native CUDA/provider support. Protected integration requires exact-head qualification, complete review, exact base/tree validation and protected read-back. Standing user authorization remains active for this workstream; do not create an authorization-only stop when the technical invariants are satisfied.
