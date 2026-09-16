# Restricted Device-JS frontend

Translates a restricted, typed JavaScript subset into private CUDA compilation input. It supports device programs, typed device libraries, and accepted numeric/atomic/mailbox profiles. This is not arbitrary JavaScript execution on the GPU; native support remains specific to each recorded profile.

The [warp-32 profile](../../docs/specs/SPEC-0022-warp32-addendum.md) provides
`gpu.warp.width()`, `gpu.warp.laneId()` and
`gpu.warp.ballot(mask, predicate)`. They execute entirely on device. Ballot
requires explicitly coordinated participation and supplies no memory fence.
Warp-profile libraries carry the requirement into importing programs; a scalar
signature alone does not make a collective safe for independent single-thread use.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
