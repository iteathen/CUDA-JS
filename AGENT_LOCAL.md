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

## Local constraints

Maintained core runtime source is JavaScript/ESM. CUDA/native implementation details remain behind CUDA-JS-owned public contracts; consumers do not receive raw native handles, provider paths, or arbitrary native calls.

## Local validation

```bash
./scripts/verify-docs.sh
npm run verify
```
