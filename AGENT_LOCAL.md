# Repository context: CUDA-JS

Universal engineering and design guidance comes from the account-global `AGENTS.md` in `iteathen/.github`. This file contains only CUDA-JS-specific context.

## Mission and ownership

CUDA-JS is the generic Node/CUDA runtime and toolchain layer. It owns consumer-neutral Device-JS/compiler/artifact/module/function/runtime/provider/memory/operation/lifecycle/compatibility mechanisms and scalar Device-JS numeric helpers.

It does not own CUDA-MCGS/search policy, generic Tensor semantics, reusable NN/model semantics, or downstream product/domain semantics. CUDA-JS-Tensor owns generic Tensor mathematics/planning/item/workspace semantics.

## Local routing

- `package.json` — package identity.
- `packaging/compatibility-manifest.json` — public compatibility/capability projection.
- `STATUS.md` and `next_step.yaml` — current execution state and next seam.
- `docs/decisions/` and `docs/specs/` — accepted local authority.
- `docs/HARDWARE_SUPPORT.md`, `docs/NODE_SUPPORT.md`, and qualification registries — exact support evidence.

## Performance capability routing

Apply the account-global compute-synergy and regression doctrine to CUDA-JS hot paths. Optimize Node/V8-visible representations and invariants first when they can express the required mechanism cleanly. When a downstream consumer demonstrates that a native mechanism is materially superior and the same capability cannot realistically be obtained inside Node/V8, assess it here or in the natural CUDA-* lower-layer owner as a reusable consumer-neutral capability behind a public contract.

Do not create one-consumer arbitrary native call-throughs merely because native code benchmarks faster in isolation. The Node/JavaScript API remains the semantic, lifecycle, ownership, and failure boundary; generic native implementation details stay behind it and must earn their complexity through measured system-level benefit and reusable ownership.

## Local constraints

Maintained core runtime source is JavaScript/ESM. CUDA/native implementation details remain behind CUDA-JS-owned public contracts; consumers do not receive raw native handles, provider paths, or arbitrary native calls.

## Local validation

```bash
./scripts/verify-docs.sh
npm run verify
```
