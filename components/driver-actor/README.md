# CUDA DriverActor

The [device continuation candidate](../../docs/specs/SPEC-0020-device-continuation-addendum.md)
keeps its definition/executable, packed arguments and graph calls under this owner.
ExecutionManager owns one whole-chain operation and leases; a final single-thread
controller makes device self-tail decisions. Exact graph facts and curated
semantics live in `schemas/cuda-13.3/win-x64/device-graph/`. No graph handle is public.

Owns one runtime Worker, selected device/context, native Driver resources, and their teardown. It provides device-memory, module, execution, transfer, and mailbox operations behind opaque capabilities. Windows and Linux share implementation; native Linux qualification remains open.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
