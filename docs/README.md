# Documentation Index

**Status:** Informational

- [`CAPABILITIES.md`](CAPABILITIES.md) — full discoverable CUDA-JS capability map: accepted behavior, current qualification limits, planned/deferred capability families, concurrency, GPU residency, memory lifetime, runtime compilation, fault isolation, and common classification corrections.
- [`capability-status.json`](capability-status.json) — non-shipped machine-readable documentation/governance projection for independent capability dimensions, public export inventory, and CUDA-MCGS interop ownership.
- [`PUBLIC_REPOSITORY.md`](PUBLIC_REPOSITORY.md) — public-repository security/CI posture, hardening assessment, security-reporting state, and remaining GitHub-settings follow-up.
- [`../SECURITY.md`](../SECURITY.md) — canonical public security-reporting policy and native/executable trust boundaries.
- [`SPONSORSHIP.md`](SPONSORSHIP.md) — low-maintenance GitHub Sponsors setup, funding purpose, and no-reward tier text.

## Authority

- [`FOUNDATION_INDEX.md`](FOUNDATION_INDEX.md)
- [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md)
- [`decisions/README.md`](decisions/README.md)
- [`specs/README.md`](specs/README.md)
- [`specs/SPEC-0000-runtime-contract-map.md`](specs/SPEC-0000-runtime-contract-map.md)
- [`specs/SPEC-0001-cuda-schema-compiler.md`](specs/SPEC-0001-cuda-schema-compiler.md)
- [`specs/SPEC-0002-windows-driver-bootstrap.md`](specs/SPEC-0002-windows-driver-bootstrap.md)
- [`specs/SPEC-0010-relocatable-device-code.md`](specs/SPEC-0010-relocatable-device-code.md)
- [`specs/SPEC-0011-scalar-kernel-arguments.md`](specs/SPEC-0011-scalar-kernel-arguments.md)
- [`specs/SPEC-0012-device-lto.md`](specs/SPEC-0012-device-lto.md)
- [`specs/SPEC-0013-restricted-device-js.md`](specs/SPEC-0013-restricted-device-js.md)
- [`specs/SPEC-0016-operation-lifecycle.md`](specs/SPEC-0016-operation-lifecycle.md)
- [`INTEROP_WITH_CUDA_MCGS.md`](INTEROP_WITH_CUDA_MCGS.md)

## Research and assessment

- [`research/README.md`](research/README.md)
- [`research/2026-08-10-node-ffi-cuda-landscape.md`](research/2026-08-10-node-ffi-cuda-landscape.md)
- [`research/2026-08-10-technical-assumption-audit.md`](research/2026-08-10-technical-assumption-audit.md)
- [`research/source-register.yaml`](research/source-register.yaml)
- [`architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md`](architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md)

## Architecture and plan

- [`HARDWARE_SUPPORT.md`](HARDWARE_SUPPORT.md) — generated exact-profile hardware support list and qualification entry point.
- [`NODE_SUPPORT.md`](NODE_SUPPORT.md) — generated exact-version Node support, testing-unconfirmed candidates, and known-incompatible releases.
- [`architecture/README.md`](architecture/README.md)
- [`architecture/TARGET_ARCHITECTURE.md`](architecture/TARGET_ARCHITECTURE.md)
- [`architecture/V0_SUPPORT_MATRIX.md`](architecture/V0_SUPPORT_MATRIX.md)
- [`architecture/FRAMEWORK_OVERVIEW.md`](architecture/FRAMEWORK_OVERVIEW.md)
- [`plans/README.md`](plans/README.md)
- [`plans/2026-08-12-native-and-platform-qualification-continuation.md`](plans/2026-08-12-native-and-platform-qualification-continuation.md)
- [`plans/2026-08-12-execution-capability-continuation.md`](plans/2026-08-12-execution-capability-continuation.md)
- [`plans/2026-08-12-compatible-pair-continuation.md`](plans/2026-08-12-compatible-pair-continuation.md)
- [`plans/2026-08-13-capability-expansion-roadmap.md`](plans/2026-08-13-capability-expansion-roadmap.md)

## Experiments and history

- [`../experiments/README.md`](../experiments/README.md)
- [`../experiments/EXPERIMENT_MATRIX.md`](../experiments/EXPERIMENT_MATRIX.md)
- [`../experiments/EXP-000-node-ffi-synthetic-abi.md`](../experiments/EXP-000-node-ffi-synthetic-abi.md)
- [`../experiments/EXP-001-node-ffi-cuda-smoke.md`](../experiments/EXP-001-node-ffi-cuda-smoke.md)
- [`../experiments/EXP-012-windows-node-ffi-cuda-smoke.md`](../experiments/EXP-012-windows-node-ffi-cuda-smoke.md)
- [`archive/README.md`](archive/README.md)
- [`archive/plans/`](archive/plans/) — completed master/focus/qualification plans retained as non-authoritative history.

Research, proposals, plans, and experiments remain beneath accepted charter, ADRs, and specifications. `CAPABILITIES.md` and `PUBLIC_REPOSITORY.md` are discoverability/operational summaries and do not widen support or implementation authority. `CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, and Windows CJS-F3W through the CUDA-JS-owned portion of CJS-F9W are accepted on exact evidence. The F3 through F8 portable control/package path passes without establishing native Linux CUDA support. The F9 exact compatible-pair and CUDA-MCGS-owned adapter evidence remain pending; Linux `CJS-F2L / EXP-001` through F9L remain retained, deferred, and incomplete.
