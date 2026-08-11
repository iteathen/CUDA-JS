# Tools

Reusable schema import, normalization, semantic diff, packer/type/test generation, native ABI probes, path discovery, artifact/cache inspection, benchmark, and conformance orchestration.

The accepted F1B tool boundary is a pinned-Clang header importer plus native layout-probe generator for the Tier-0 CUDA profile. Runtime header scraping is prohibited.

[`cuda-schema/`](cuda-schema/README.md) is the accepted internal F1B implementation. The thin root entry point is `scripts/run-f1b.mjs`.
