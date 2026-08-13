# CUDA Target Policy

**Status:** Internal production component under accepted SPEC-0006 target-syntax addendum.

## Owns

- canonical CUDA target syntax parsing;
- the finite repository-owned admitted target-base policy;
- normalized target records and target-policy identity;
- pairing a parsed target between `compute_` and `sm_` namespaces without guessing hardware support.

## Does not own

- NVRTC/nvJitLink provider support;
- selected-GPU compatibility or native qualification;
- GPU enumeration/device selection;
- compiler/linker invocation;
- Device-JS language semantics;
- public raw CUDA/native identifiers.

## Contract

The parser recognizes numeric CUDA target bases with optional current `f`/`a` variants. The initial policy admits only unsuffixed bases already represented by the hardware qualification registry. Syntax, policy admission, provider acceptance, selected-device compatibility, and native support remain independent.

CompilerActor, linker, Device-JS, and target/profile validation must consume this owner rather than maintain competing architecture regexes.

This component is package-internal; it is not exported as a public `cuda-js` subpath.
