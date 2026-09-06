# EXP-009: Windows compiler and linker parity

This retained experiment checks CUDA 13.3 NVRTC/nvJitLink artifact parity against an independent MSVC C oracle.

The baseline compiles a tracked vector kernel to PTX, links it to cubin, compares artifacts, and checks native-handle cleanup. It qualifies only its recorded Windows x64 environment; it does not establish Linux or performance support.

For current prerequisites and compiler qualification commands, use [F6 conformance](../../conformance/f6/README.md). The baseline entry point is [run-native-windows.mjs](src/run-native-windows.mjs); generated artifacts remain in ignored build storage.

Relocatable code and Device LTO are governed by the [accepted specifications](../../docs/specs/README.md) and current F6 suites. The earlier [LTO assessment](../../docs/research/2026-08-11-lto-support-assessment.md) is retained design history.
