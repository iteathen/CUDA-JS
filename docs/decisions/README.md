# Architectural Decisions

**Status:** Informational

Accepted ADRs remain immutable records. Later decisions may supersede or extend them while preserving history.

- [`ADR-0001-repository-boundary.md`](ADR-0001-repository-boundary.md) — CUDA-JS is an independent generic runtime repository; CUDA-MCGS is a public-contract consumer.
- [`ADR-0002-node-ffi-first-host-binding.md`](ADR-0002-node-ffi-first-host-binding.md) — use Node 26 built-in FFI as the baseline host-call substrate; ship no CUDA-JS project addon; treat strict hot-call JIT as a measured profile gate.
- [`ADR-0003-generated-abi-facts-and-semantic-overlays.md`](ADR-0003-generated-abi-facts-and-semantic-overlays.md) — separate machine-generated CUDA ABI facts from curated lifecycle/security/asynchrony semantics and fail closed on unknowns.
- [`ADR-0004-nn-extension-package-boundary.md`](ADR-0004-nn-extension-package-boundary.md) — historical accepted isolation decision that kept a future NN product separate from `cuda-js` core while placing it in this repository; its same-repository placement is superseded by ADR-0007.
- [`ADR-0005-javascript-authored-jit-native-realized.md`](ADR-0005-javascript-authored-jit-native-realized.md) — define the core as JavaScript-authored and JIT/native-realized, distinguish generated device code and independent C/C++ evidence from the shipped runtime, and gate any future maintained native host backend on a measured, accepted decision.
- [`ADR-0006-linux-first-reference-platform.md`](ADR-0006-linux-first-reference-platform.md) — keep public/component architecture OS-neutral while using native Linux x86-64 as the reference implementation and primary qualification platform; Ubuntu 24.04 LTS is the first exact cell and Windows remains a qualified peer adapter.
- [`ADR-0007-extract-cuda-nn-semantic-product.md`](ADR-0007-extract-cuda-nn-semantic-product.md) — exercise ADR-0004's split trigger and assign reusable NN semantics to independent `iteathen/cuda-nn`; CUDA-JS remains the generic runtime/provider owner and CUDA-JS-Tensor owns generic Tensor semantics.
- [`ADR-0008-semantic-library-boundary.md`](ADR-0008-semantic-library-boundary.md) — generalize the mechanism-vs-semantic split across the CUDA portfolio: CUDA-JS owns consumer-neutral CUDA/provider/resource mechanisms while independent semantic libraries own Tensor, NN, search, RNG, communication, I/O, media, data, ray and graph-analytics meaning.

The rejected native-bootstrap/AsmJit-first alternative is recorded in the [archive index](../archive/README.md) and is not current authority. Its detailed local provenance remains retained in the verified foundation artifact rather than the active documentation tree.
