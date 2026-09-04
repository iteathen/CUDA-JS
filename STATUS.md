# CUDA-JS Status

**Status:** Active operational state

**Updated:** 2026-09-04

## Current package and capability projection

```text
package:                     cuda-js@0.1.0-alpha.18
public API schema:           1
host source model:           JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:         testing-unconfirmed / not-qualified
production support:          no
performance claims:          none beyond exact recorded evidence
```

`package.json` owns package identity. `packaging/compatibility-manifest.json` owns the immutable current public capability/compatibility projection. Exact protected branch/commit/tree identity is read from GitHub when required; it is not maintained here as a self-referential live-SHA field.

The recorded protected input for the current governance transaction is `main@49a2f77d2c8364d67030fbc1c2e870e58e70d334`, tree `b67890e2499f04ab3b81b8f4a72dab38a5281c7e`. That value identifies the base from which this transaction was constructed; after integration it remains historical transaction provenance rather than pretending to be a self-updating current-main declaration.

## Protected alpha.18 state

#193 / PR #197 is protected-integrated. The ordinary CUDA-JS base-allocation minimum alignment is lower-owned by `runtime.memory` and projected through public immutable compatibility as 256 bytes. The existing `allocateDevice({ byteLength })` request shape, view-offset semantics, native calls, lifecycle, errors, health and cleanup remain unchanged.

Protected alpha.18 also retains the completed lower-boundary ownership work: provider capability/admission truth, bounded provider-specific borrower lifecycle, existing compiler/module/function/prepared-DAG composition rather than a universal preparation transaction, explicit expert launch geometry, and public finite compatibility ceilings. Generic Tensor mathematics remains in CUDA-JS-Tensor; reusable NN/model semantics remain in `iteathen/cuda-nn`; search semantics remain in CUDA-MCGS.

Latest protected push qualification for `49a2f77d2c8364d67030fbc1c2e870e58e70d334` passed required `verify`, `schema`, and `node-compatibility`; current-head CodeQL analysis also completed successfully. Historical native qualification remains exact-profile evidence and is not silently requalified by the alpha.18 package change.

### Durable architecture and evidence anchors

These are provenance/ownership anchors, not broader support claims. `DriverActor` remains the Worker/context/native-resource owner. `CJS-F1B` remains the generated CUDA ABI-fact and independent layout-evidence anchor; `CJS-F2W` remains the accepted **Windows x64** Driver/bootstrap anchor; `CJS-F7W` remains the retained Windows platform-hardening/property/lifecycle anchor. Their historical evidence remains exact to its recorded revisions and profiles.

### External CUDA-NN ownership

**External CUDA-NN ownership** remains governed by ADR-0007. Reusable NN/model/inference/autodiff/training semantics belong to independent `iteathen/cuda-nn`, while generic Tensor mathematics/planning belongs to CUDA-JS-Tensor. The historical bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` remains audit evidence only; those reusable NN semantics **no longer belong to a future publish unit in this repository**.

## Current focus — #156 recurrence prevention

**#156 — keep current-state declarations and issue obligations freshness-safe** is the active in-repository governance owner.

The demonstrated recurrence is broader than stale `STATUS.md`/`next_step.yaml`: high-authority agent entry points also accumulated dated implementation snapshots phrased as live state. This transaction therefore:

- removes live package/SHA/capability dashboards from durable agent procedure files;
- designates exact owners for package identity, public compatibility, execution seam, support evidence and issue obligations;
- records protected-input SHAs as transaction provenance rather than self-referential current-main facts;
- adds a mechanical current-state contract gate that checks package/compatibility/status/next-step agreement and rejects reintroduction of stale live-dashboard headings/fields;
- documents issue disposition rules and the requirement to reconcile designated state surfaces whenever the dependency-ready leaf materially changes.

No CUDA runtime, ABI, public API, native mechanism, or support claim changes under #156.

## Next dependency-ready work

After #156 is qualified, completely reviewed, freshly authorized and protected-integrated, **CUDA-MCGS #211 / PR #212 must itself be separately exact-head authorized, protected-integrated, and read back** before the cross-repository native qualification subject is frozen. That docs-only reconciliation owns the exact post-#125 CUDA-MCGS current-state seam and is not covered by authorization for this CUDA-JS transaction.

After both governance seams are protected and their resulting commits/trees are read back, the next P0 cross-repository seam is **CUDA-JS #32 — exact CUDA-MCGS/CUDA-JS compatible-pair qualification through the protected public adapter**.

CUDA-MCGS #125 / PR #210 is protected-integrated at the currently recorded consumer baseline `CUDA-MCGS main@67d16badb6dd65be9c96c4198b4451b1edb82f57`, tree `750a2a7ee7c519241c82e180cf84c76f3d5ee398`, and its production `integration.cuda-js` adapter consumes this protected alpha.18 peer through public contracts only. Portable adapter evidence is green but is not native compatible-pair evidence. The exact consumer revision for #32 will be the protected readback produced after #211/#212, not this pre-reconciliation baseline.

CUDA-JS #4 remains a parallel external evidence lane: the native Ubuntu 24.04 x86-64 runner/evidence chain is repository-complete but still requires a directly exposed physical NVIDIA GPU. VM, WSL, container, hosted-CI, mock, source-readiness, and portable results do not qualify that cell.

#157 remains an independent CUDA-JS-Tensor consumer lane. #68 remains an external operational security-evidence lane. Neither blocks #32.

## Open capability pressure

#198 records a demonstrated generic candidate gap for bounded host-written/device-read publication payloads while a long-lived operation remains pending. It is not silently assumed to block the first exact #32 pair. If the selected pair requires that behavior, #32 must stop and route the demonstrated generic requirement through #198 before any consumer-local workaround.

## Claim limits

Portable/mock/package evidence proves only the paths it executes. Native Linux, additional hardware/provider cells, WSL/ARM64/Jetson/TCC/virtualization/MIG/ECC, broad Node/Driver/toolkit matrices, performance, soak and production stability remain independent qualification work.

Issues own concrete actionable obligations, explicit blocked gates, or concrete evidence cells. Completed capabilities close rather than remaining open solely for unspecified future hardware cells; dormant possibilities remain roadmap/history until activated by a real consumer/profile/measurement.

No protected integration occurs without exact-head qualification, complete review and fresh exact-tuple authorization. After integration, read back the remote protected commit/tree and reconcile any execution-seam change before starting the next semantic/native transaction.
