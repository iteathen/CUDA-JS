# Restricted Device-JS frontend

Translates a restricted, typed JavaScript subset into private CUDA compilation input. It supports device programs, typed device libraries, and accepted numeric/atomic/mailbox profiles. This is not arbitrary JavaScript execution on the GPU; native support remains specific to each recorded profile.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
