# Architectural Decisions

**Status:** Informational

Accepted ADRs remain immutable records. Later decisions may supersede or extend them while preserving history.

- [`ADR-0001-repository-boundary.md`](ADR-0001-repository-boundary.md) — CUDA-JS is an independent generic runtime repository; CUDA-MCGS is a public-contract consumer.
- [`ADR-0002-node-ffi-first-host-binding.md`](ADR-0002-node-ffi-first-host-binding.md) — use Node 26 built-in FFI as the baseline host-call substrate; ship no CUDA-JS project addon; treat strict hot-call JIT as a measured profile gate.
- [`ADR-0003-generated-abi-facts-and-semantic-overlays.md`](ADR-0003-generated-abi-facts-and-semantic-overlays.md) — separate machine-generated CUDA ABI facts from curated lifecycle/security/asynchrony semantics and fail closed on unknowns.

The rejected native-bootstrap/AsmJit-first alternative is recorded in the [archive index](../archive/README.md) and is not current authority. Its detailed local provenance remains retained in the verified foundation artifact rather than the active documentation tree.
