# CUDA-JS components

This directory contains the runtime's implemented components. Application developers start with the [public facade](runtime-facade/README.md); the other components are internal owners.

- [CUDA context and native-resource ownership](driver-actor/README.md).
- [Opaque resource identity and lifecycle](resource-registry/README.md).
- [Device allocations and typed views](memory/README.md).
- [Bounded asynchronous copies](host-memory-transfer/README.md).
- [Host/device publication lanes](publication-mailbox/README.md).
- [Kernel submission, completion, and cleanup](execution/README.md).
- [Finite execution DAG normalization](prepared-execution/README.md).
- [Optional bounded native-library plans](cuda-library-adapters/README.md).
- [Target syntax and admission policy](cuda-target/README.md).
- [Device snapshots and opaque selection](device-selection/README.md).
- [Compilation, linking, and caching](compiler-actor/README.md).
- [Restricted JavaScript device programs](device-js/README.md).
- [Sanitized platform assessment](platform-diagnostics/README.md).
- [Public package API](runtime-facade/README.md).

Implementation and native qualification are separate. Consult the [capability map](../docs/CAPABILITIES.md) and [component specifications](../docs/specs/README.md) for limits and future profiles.
