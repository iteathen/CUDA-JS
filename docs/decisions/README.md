# Architectural Decisions

**Status:** Informational

Accepted ADRs remain immutable records. Later decisions may supersede or extend them while preserving history.

- [`ADR-0001-repository-boundary.md`](ADR-0001-repository-boundary.md) — CUDA-JS is an independent generic runtime repository; CUDA-MCGS is a public-contract consumer.
- [`ADR-0002-node-ffi-first-host-binding.md`](ADR-0002-node-ffi-first-host-binding.md) — use Node 26 built-in FFI as the baseline host-call substrate; ship no CUDA-JS project addon; treat strict hot-call JIT as a measured profile gate.
- [`ADR-0003-generated-abi-facts-and-semantic-overlays.md`](ADR-0003-generated-abi-facts-and-semantic-overlays.md) — separate machine-generated CUDA ABI facts from curated lifecycle/security/asynchrony semantics and fail closed on unknowns.
- [`ADR-0004-nn-extension-package-boundary.md`](ADR-0004-nn-extension-package-boundary.md) — keep generic `cuda-js` unchanged while authorizing an optional NN product as a separate future publish unit in the same repository.
- [`ADR-0005-javascript-authored-jit-native-realized.md`](ADR-0005-javascript-authored-jit-native-realized.md) — define the core as JavaScript-authored and JIT/native-realized, distinguish generated device code and independent C/C++ evidence from the shipped runtime, and gate any future maintained native host backend on a measured, accepted decision.
- [`ADR-0006-linux-first-reference-platform.md`](ADR-0006-linux-first-reference-platform.md) — make native Linux x86-64 the reference implementation and primary qualification platform, with Ubuntu 24.04 LTS as the first exact cell and Windows retained as a secondary qualified adapter.

The rejected native-bootstrap/AsmJit-first alternative is recorded in the [archive index](../archive/README.md) and is not current authority. Its detailed local provenance remains retained in the verified foundation artifact rather than the active documentation tree.
