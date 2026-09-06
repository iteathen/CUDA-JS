# EXP-001: native Linux CUDA Driver qualification

This experiment compares Node FFI Driver behavior with an independent C oracle on an exact native Ubuntu 24.04 x86-64 NVIDIA profile.

**Native Linux qualification is incomplete.** Source preparation can pass without a usable GPU; that is not Driver or GPU qualification.

Start with the [complete runbook](RUNBOOK.md) for Node 26.7.0, CUDA-header/toolchain, Driver/device, network, and native-host requirements. It provides preparation and smoke commands, expected evidence, failure interpretation, and contribution instructions.

WSL, VM/emulated, container, hosted-CI, and mock results do not satisfy the current physical-native qualification gate. See [hardware qualification](../../conformance/hardware/README.md) for the accepted environment boundary.

- [Exact profile](profile.json).
- [Experiment contract](../EXP-001-node-ffi-cuda-smoke.md).
- [Linux qualification issue](https://github.com/iteathen/CUDA-JS/issues/4).
