# SPEC-0030 Addendum: Floating hyperbolic-tangent helper

**Status:** Accepted

**Date:** 2026-09-05

**Owner:** `runtime.device-js`

**Parent:** `SPEC-0030-device-js-dense-numeric-profile.md`

**Issue:** #206

## Outcome

Add one bounded consumer-neutral Device-JS floating helper:

```text
gpu.math.tanh(x)
```

The first profile accepts exactly `f32` and `f64` and returns the same scalar kind. It is a generic floating mathematical primitive required by a protected real Tensor consumer; it does not add Tensor, neural-network, activation-layer, model, evaluator, search, chess or product semantics to CUDA-JS.

## Consumer evidence and ownership

Protected `iteathen/UCI-Arena-Vector#3` / PR #17 freezes one exact LatticeKnight model and proves that current protected CUDA-JS-Tensor closes its prior `erf`, static-gather and ordered-concat gaps while the frozen value head still requires exactly `unary:tanh`. A product-local exp identity, private CUDA source or native inference path would duplicate lower ownership and alter the frozen model without an accepted numerical equivalence result.

`runtime.device-js` already owns typed floating helpers, deterministic private CUDA lowering and Device-JS semantic compatibility. The smallest reusable lower mechanism is therefore `gpu.math.tanh`; CUDA-JS-Tensor separately owns whether/how Tensor exposes `unary:tanh`.

## Public semantics

For typed scalar `x`, `gpu.math.tanh(x)` computes the ordinary hyperbolic tangent using the admitted same-kind provider operation.

| Input kind | Result kind | First profile |
|---|---|---|
| `f32` | `f32` | admitted |
| `f64` | `f64` | admitted |
| `f16` | — | rejected |
| `bf16` | — | rejected |
| integer / `bool` | — | rejected |

Special-value requirements:

- `tanh(+0) = +0`;
- `tanh(-0) = -0`;
- `tanh(+Infinity) = +1`;
- `tanh(-Infinity) = -1`;
- `tanh(NaN)` returns NaN.

For finite inputs this child does not manufacture provider-independent bit identity, correctly-rounded semantics or a global ULP guarantee. Finite behavior remains bound to the exact CompilerActor provider/toolkit/header/target profile and the selected same-kind ordinary operation. Consumers needing stronger numerical guarantees must supply separately accepted evidence rather than infer them.

The first profile deliberately does not admit CUDA half/bfloat16 tanh functions even where the selected toolkit exposes them. No current dependency-ready consumer requires those public semantics, and admitting their rounding/target profile would be speculative breadth.

No exp-based identity, fast `__tanhf`, approximation helper, fast-math rewrite, implicit widening/narrowing or consumer-specific substitution satisfies this contract.

## Contract selection and compatibility identity

`tanh` is an additive child of the accepted dense numeric profile. Existing contract strings must remain byte-for-byte exact when the child is unused.

Define child suffix:

```text
SPEC-0030-tanh-v1
```

The exact numeric selections are:

```text
base                         existing DEVICE_JS_CONTRACT
base+dense                   existing SPEC-0030-dense-numeric-v1 contract
base+dense+erf               existing SPEC-0030-erf-v1 contract, unchanged
base+dense+tanh              +SPEC-0030-tanh-v1
base+dense+erf+tanh          +SPEC-0030-erf-v1+SPEC-0030-tanh-v1
```

Canonical child order is `erf` then `tanh` when both are present. A Device-JS library appends the existing `SPEC-0028-device-library-v1` only after all selected numeric child suffixes.

Importing a typed library propagates every declared numeric child into the consuming unit. A direct source using `erf` plus an imported tanh library, an imported erf library plus direct tanh, or one library containing both must select the same canonical dense+erf+tanh semantic contract. Unknown, duplicated, reordered, forged or metadata-contradictory child combinations reject rather than being normalized from untrusted artifact strings.

Existing base, dense, dense+erf and corresponding library contracts, semantic identities, generated names, generated CUDA bytes and cache separation remain exact.

## Provider/private lowering

The accepted ordinary CUDA realization is private:

- `f32` -> `tanhf`;
- `f64` -> `tanh`.

The approximate intrinsic `__tanhf` is not an accepted realization. CUDA symbol/header names remain private implementation detail and never appear in ordinary consumer metadata.

CompilerActor remains the sole owner of provider admission, target resolution, manifest/header verification, compilation, artifacts, cache identity and native failure/cleanup. A selected provider/target incapable of the accepted same-kind behavior rejects before execution rather than substituting an approximation.

## Bounds, failure and lifecycle

All existing SPEC-0013/SPEC-0030 source, AST, function, parameter, import/export, target and compilation bounds remain unchanged.

Translation rejects before native work when:

- arity is not exactly one;
- operand is not f32/f64;
- f16/bf16/integer/bool is supplied;
- a library child contract/typed metadata combination is unknown or contradictory;
- selected provider/header/target is incompatible with the required dense numeric profile.

Device-JS preprocessing owns no native resource; CompilerActor/DriverActor/execution lifecycle remains unchanged.

## Required portable evidence

Before implementation is portable/software-qualified, permanent evidence must prove:

- deterministic f32/f64 direct lowering and same-kind result;
- wrong arity and bool/integer/f16/bf16 rejection;
- exact dense+tanh selection;
- exact dense+erf+tanh selection for direct and transitive library combinations;
- forged/mutated/unknown child combinations reject;
- no exp identity, `__tanhf` or other approximation can satisfy the helper tests;
- installed public-package compilation through ordinary exports only;
- representative pre-tanh base/dense/erf identities and generated bytes remain exact.

## Native/provider evidence

Native/provider promotion is separate. It requires an exact provider/target/toolkit/device packet and an independently compiled same-provider `tanhf`/`tanh` oracle covering finite positive/negative values, near-zero values, tails, both signed zeros, infinities and NaN, plus terminal resource cleanup. Any finite error characterization is evidence for that exact corpus/profile, not a provider-wide CUDA-JS guarantee.

## Non-goals

Lower-precision tanh, activation/layer/model APIs, GELU, Tensor semantics, approximation/fast-math profiles, provider-independent ULP guarantees, raw CUDA names, new native owners, native support promotion or performance claims.
