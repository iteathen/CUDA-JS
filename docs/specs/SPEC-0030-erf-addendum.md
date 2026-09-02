# SPEC-0030 Addendum: Floating error-function helper

**Status:** Accepted

**Date:** 2026-09-01

**Owner:** `runtime.device-js`

**Parent:** `SPEC-0030-device-js-dense-numeric-profile.md`

## Outcome

Add one bounded, consumer-neutral Device-JS error-function helper:

```text
gpu.math.erf(x)
```

The first profile accepts exactly `f32` and `f64` and returns the same scalar kind as its input. It does not add tensor, neural-network, model, search, chess, or application semantics to CUDA-JS.

This addendum was accepted through the repository-owner-authorized specification review and exact-head transport recorded in PRs #158 and #159. Acceptance authorizes only the bounded public semantics in this addendum; portable implementation evidence and native/support promotion remain separately gated below.

## Assessment and ownership

The existing accepted dense numeric profile already owns public floating math semantics and private CUDA lowering. Its translator has one visible unary-math owner for `sqrt`, `log`, and `exp`; CompilerActor remains the provider/header/cache owner. A separate error-function service, consumer-local CUDA source, deep import, native addon, FFI path, or approximation layer would duplicate those owners.

The narrow missing mechanism is therefore another operation in the existing Device-JS math family. The first consumer requires ordinary floating error-function semantics, not a GELU helper or a particular model identity.

CUDA 13.3 provider evidence also bounds the first honest type profile. NVIDIA supplies ordinary `erff(float)` and `erf(double)` functions and documents their signed-zero, infinity, and NaN behavior. Its mathematical-function accuracy table reports 2 ULP for both operations, but the CUDA Programming Guide defines those table values as maximum **observed** errors from extensive, non-exhaustive testing and explicitly states that they are not guaranteed bounds. CUDA extended floating types such as `__half` and `__nv_bfloat16` do not have native error/gamma functions; their generic math path is defined through conversion to `float` and conversion back. Because the current consumer requires `f32`, inventing either a public lower-precision conversion/rounding contract or a stronger provider-wide ULP guarantee would be speculative.

## Public semantics

For a typed scalar `x`:

```text
gpu.math.erf(x)
```

is the mathematical error function

```text
2 / sqrt(pi) * integral(exp(-(t*t)), t = 0..x)
```

realized by the exact admitted same-kind provider operation.

The accepted input/result table is:

| Input kind | Result kind | First profile |
|---|---|---|
| `f32` | `f32` | admitted |
| `f64` | `f64` | admitted |
| `f16` | — | rejected |
| `bf16` | — | rejected |
| integer / `bool` | — | rejected |

Special values are semantic requirements, not approximation hints:

- `erf(+0) = +0`;
- `erf(-0) = -0`;
- `erf(+Infinity) = +1`;
- `erf(-Infinity) = -1`;
- `erf(NaN)` returns NaN.

For finite inputs, `SPEC-0030-erf-v1` does **not** manufacture a provider-independent correctly-rounded, bit-identical, or global ULP ceiling that the selected provider does not guarantee. Finite rounding behavior is bound to the exact CompilerActor provider/toolkit/header/target compatibility profile and the same-kind ordinary error-function operation selected by this contract. Provider qualification records independently measure mathematical error for their test corpus and retain the observed result as evidence; NVIDIA's reported 2-ULP values are useful characterization for CUDA 13.3, not semantic authority for a guaranteed CUDA-JS maximum.

A future CUDA-JS profile may add a guaranteed numerical-error ceiling only through separately accepted authority and evidence capable of supporting that stronger claim. Consumers that require a stricter bound must select such a profile or reject before execution rather than infer one from provider documentation.

No tanh approximation, GELU identity, fast-math rewrite, implicit type widening/narrowing, or consumer-specific special case is authorized.

## Contract selection and compatibility identity

Adding a new public helper is a material language capability and must not be hidden inside the already accepted `SPEC-0030-dense-numeric-v1` identity.

A source unit that uses `gpu.math.erf` selects the existing dense profile plus one additive child identity:

```text
SPEC-0013-v1
+SPEC-0022-atomic-observation-v1
+SPEC-0022-device-publication-v1
+SPEC-0014-publication-mailbox-v1
+SPEC-0030-dense-numeric-v1
+SPEC-0030-erf-v1
```

A Device-JS library using the helper appends the existing `SPEC-0028-device-library-v1` composition contract after that child identity. Importing such a library propagates the exact `SPEC-0030-erf-v1` requirement into the consuming unit's compatibility/semantic identity even when the consuming source does not directly call `gpu.math.erf`.

Programs and libraries that do not use or transitively import this helper retain their exact pre-addendum contract strings, semantic identities, generated names, generated CUDA bytes, and cache separation. The implementation must never infer child capability from an artifact whose copied contract record does not declare it.

## Provider and private lowering

`runtime.device-js` owns the public helper name, arity, type rules, semantic child identity, deterministic lowering choice, and fail-closed diagnostics. `runtime.compiler-actor` remains the only owner of NVRTC/provider admission, target resolution, header snapshots, compilation, artifacts, cache identity, and native failure/cleanup.

The first accepted CUDA 13.3 realization may lower privately to the provider's ordinary floating error-function entry points:

- `f32` -> `erff`;
- `f64` -> `erf`.

Those CUDA names are private lowering details and never appear in the Device-JS public API or consumer metadata. The helper does not create a new public header profile or ambient toolkit dependency. Provider/toolkit identity and target admission remain exact CompilerActor inputs. A provider/target combination that cannot supply the accepted same-kind operation and special-value semantics must reject before execution rather than substitute another function or approximation.

## Bounds, failures, and lifecycle

All existing SPEC-0013/SPEC-0030 source, AST, function, parameter, import/export, target, and compilation bounds remain unchanged.

Translation rejects before native work when:

- arity is not exactly one;
- the operand is not `f32` or `f64`;
- `f16` or `bf16` is supplied under this first profile;
- an imported library's declared child contract and copied metadata disagree;
- an explicitly selected provider/header/target profile is incompatible with the required dense capability.

Device-JS remains pure preprocessing and owns no native resource. CompilerActor, DriverActor, and execution retain their existing provider, context, artifact, operation, completion, error, and teardown ownership.

## Required portable evidence

Before implementation can be called portable/software-qualified, evidence must prove at least:

- positive deterministic translation for `f32` and `f64` with same-kind results;
- negative arity and `bool`/integer/`f16`/`bf16` cases;
- exact child-contract selection for direct helper use;
- child-contract propagation and forged/mutated-contract rejection through typed Device-JS library composition;
- byte-identical contract, identity, generated names, and generated CUDA fixtures for representative legacy and existing dense programs/libraries that do not use `erf`;
- no tanh/GELU or consumer-specific approximation path can satisfy the helper tests;
- public installed-package use through ordinary CUDA-JS exports only;
- failure before native work for unsupported or contradictory provider/header/target inputs.

## Required native/provider evidence

Native promotion is separate from portable implementation. It requires one exact recorded provider packet naming package revision, CUDA toolkit/provider revision, target architecture, generated artifact identity, and execution environment.

An independently authored CUDA C++ parity oracle must cover representative finite positive/negative values, odd symmetry, values near zero and in the tails, both signed zeros, both infinities, and NaN using the same declared provider operation kind. Generated Device-JS results must match that independently compiled same-provider operation according to the exact dtype result. A separate high-precision mathematical oracle must characterize finite error for the retained corpus and report the observed ULP/error result without upgrading an observed maximum into a provider-wide guarantee. Signed-zero and infinity results must satisfy the exact special-value contract and NaN must remain NaN.

Evidence must use the installed public CUDA-JS path, include negative controls that would detect a tanh-style substitute or precision-changing conversion path, and end with the ordinary zero-resource terminal cleanup proof. A passing portable mock or generated-source inspection is not native support evidence.

## Non-goals

`f16`/`bf16` error-function semantics, GELU or activation helpers, tensor operations/shapes, model heads, search semantics, arbitrary CUDA math exposure, fast-math variants, provider-independent bit identity, a provider-independent finite ULP guarantee, public CUDA intrinsic/header names, new native owners, or performance claims.
