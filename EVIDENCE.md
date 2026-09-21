# Evidence status

This repository follows the shared [iteathen evidence and validation policy](https://github.com/iteathen/.github/blob/main/EVIDENCE_POLICY.md).

## Current posture

CUDA-JS is a public alpha runtime/toolchain. Portable schema/frontend/package checks are **INTERNAL-QUALIFICATION**. Native results for exact recorded Windows x64 profiles are **HARDWARE-MEASURED** when their provenance identifies the tested revision and physical environment.

The repository does not currently register independent third-party reproduction as evidence for its principal native claims.

## Registered claims

| Claim | Evidence class | Status |
| --- | --- | --- |
| `CJS-INT-001` — maintained portable/frontend/package checks pass for the tested revision | **INTERNAL-QUALIFICATION** | repository-controlled |
| `CJS-PROV-001` — committed CUDA 13.3 package/header/license provenance matches bytes reacquired from the recorded official NVIDIA package | **REFERENCE-GROUNDED** | PASS: package + 3 input hashes matched |
| `CJS-WIN-001` — exact recorded Windows x64 profiles demonstrate the native behaviors recorded by their qualification artifacts | **HARDWARE-MEASURED** | profile/revision scoped |
| `CJS-LINUX-001` — native Linux CUDA is qualified | **UNVALIDATED** | explicitly open |
| `CJS-EXT-001` — CUDA-JS native behavior has been independently reproduced by an external third party | **UNVALIDATED** | no external reproduction registered |

Machine-readable records: [`evidence/claims.json`](evidence/claims.json). Independent reproduction packets belong under [`evidence/external/`](evidence/external/README.md).

## What current evidence establishes

Internal evidence can establish schema/frontend/package behavior for the exact tested revision. The registered NVIDIA provenance result independently grounds the exact CUDA 13.3 source-package/header/license identity recorded in `schemas/cuda-13.3/provenance.json`. Hardware evidence can establish only the native operations, revision, Node/runtime, driver/toolchain, and hardware profile actually recorded.

## What it does not establish

The NVIDIA provenance result establishes source identity only. It does not establish ABI semantic completeness, runtime correctness, production support, general Linux qualification, universal Node-version compatibility, general performance superiority, or independent third-party reproduction.

## Path to stronger evidence

A stranger should be able to clone the exact revision on a documented machine and reproduce a minimal native path without a compiled Node addon. External packets should preserve device/driver/OS/Node/V8, exact command, operation exercised, raw output, failure behavior, and revision hashes.

Performance remains a separate claim requiring workload definition, baseline, raw measurements, and comparable semantics.

## Non-mutation rule

Evidence work may run CUDA-JS portable/native qualification and reproduction harnesses. It must not change runtime/provider semantics, ABI generation, public APIs, Device-JS semantics, or hot execution paths merely to make an evidence result pass.
