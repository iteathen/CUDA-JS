# Opaque resource registry

Owns opaque runtime resource identity, validation, leases, and dependency-ordered teardown. It has no CUDA or platform dependency. Failed or unproved disposal remains visible as failure/orphan state and cannot be reported as successful native cleanup.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
