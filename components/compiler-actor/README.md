# CompilerActor

Runs NVRTC and nvJitLink in a separate Worker, producing copied typed PTX, LTO-IR, or cubin artifacts and maintaining their cache identities. It implements bounded compilation/linking and verified header profiles. Windows has recorded native evidence; the Linux source path remains unqualified.

## Entry points

- [Component interface](index.mjs).
- [Runtime and platform requirements](../../README.md).
- [Capability map](../../docs/CAPABILITIES.md) and [specification index](../../docs/specs/README.md).
- [Conformance entry points](../../conformance/README.md).

Use the governing specifications for parameter, lifecycle, failure, and compatibility details. [Current status](../../STATUS.md) tracks outstanding implementation and qualification work.
