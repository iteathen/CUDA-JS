# CUDA DriverActor

Owns one runtime Worker, selected device/context, native Driver resources, and their teardown. It provides device-memory, module, execution, transfer, and mailbox operations behind opaque capabilities. Windows and Linux share implementation; native Linux qualification remains open.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
