# Bounded device memory

Owns bounded device allocations, byte-range validation, copied transfers, and allocation-owned typed views. Resources have explicit lifetimes and leases. Views are contiguous one-dimensional capabilities, not tensors or a general strided-memory interface.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
