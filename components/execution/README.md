# Bounded module launch and completion

Owns bounded module/kernel submission, operation completion, access hazards, resource leases, and cleanup. It supports the one-operation default, an opt-in capacity-two profile, and prepared kernel/cuBLASLt execution. It does not expose public streams/events or establish CUDA Graph support.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
