# Agent Documentation

The root [`AGENTS.md`](../AGENTS.md) is mandatory. This directory contains the compact CUDA-JS operating foundation and the project-specific native/JIT/runtime profile.

## Canonical files

- [`AGENTS.md`](AGENTS.md) — canonical working procedure and current documentation-only workstream.
- [`AI_RULES.md`](AI_RULES.md) — concise hard rules.
- [`DESIGN_ALIGNMENT_CARD.md`](DESIGN_ALIGNMENT_CARD.md) — compact design and integration gate.
- [`SYSTEM_REGISTRY.md`](SYSTEM_REGISTRY.md) — ownership and source-of-truth registry.
- [`VALIDATION_POLICY.md`](VALIDATION_POLICY.md) — evidence and completion requirements.
- [`application_specific/CUDA_JS_PROFILE.md`](application_specific/CUDA_JS_PROFILE.md) — native/JIT/runtime boundary.
- [`general_foundation/NO_PYTHON_POLICY.md`](general_foundation/NO_PYTHON_POLICY.md) — accepted ecosystem-wide prohibition on Python source, tooling, dependencies, tests, CI, generators, experiments, packaging, and temporary scripts.
- [`general_foundation/README.md`](general_foundation/README.md) — reusable engineering doctrine for planning, organization, reading, execution, testing, debugging, sanity checks, PRs, cleanup, tokens, documentation, and security.

## Project authority

Detailed product authority lives in:

- the charter and accepted ADRs;
- the target architecture and support matrix;
- the runtime contract map;
- the research/source register;
- the non-authoritative master plan and experiment protocols;
- current status and `next_step.yaml`.

Use [`../docs/FOUNDATION_INDEX.md`](../docs/FOUNDATION_INDEX.md) to verify completeness and discoverability.

Reusable engineering doctrine may be promoted from sibling repositories only through deliberate ownership and applicability review. Do not copy application-specific search rules into CUDA-JS, and do not maintain duplicate drifting authority merely to appear complete. The no-Python policy is a coordinated ecosystem invariant and must remain substantively aligned with the UMCGS copy.
