# CUDA Schema Tool

**Status:** Accepted F1B internal tooling

This tool owns deterministic acquisition verification, Clang AST import, target-layout probe generation, semantic-overlay validation, Runtime IR normalization, generated products, static checks, and native mutation controls for the accepted Tier-0 schema contract.

It never loads the CUDA Driver and never accepts application-provided schemas or library names. Official packages, extracted headers, raw AST, probe executables, and raw evidence remain under ignored `build/f1b/`.

Commands are exposed through `scripts/run-f1b.mjs` and the root package scripts. Native generation requires the exact Linux x86-64/Clang profile in `schemas/cuda-13.3/provenance.json`; static product checks are cross-platform.
