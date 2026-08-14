# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-13

## Current implementation state

The exact protected-`main` input baseline for this implementation packet is:

```text
7ba8e07db76f2b18dd97d344698bd2d90a41c9de
```

The capability-authority proposal corpus is integrated on protected `main` at:

```text
5233a046c57813532a71763bb36cdba5894e43e0
```

Package identity is `cuda-js@0.1.0-alpha.5`.

The implementation baseline contains:

- the accepted Windows F1–F9 foundation, including `CJS-F1B`, Windows `CJS-F2W` through `CJS-F7W`, exact Node 26.7.0 evidence, and retained Linux x86-64 qualification paths;
- portable/software implementations of SPEC-0010 typed RDC, SPEC-0011 `u64`/`i32`/`f32` scalar arguments, SPEC-0012 Device LTO, SPEC-0013 restricted Device-JS, and SPEC-0016 opaque GPU operations;
- the SPEC-0006 target-syntax correction in portable/software paths: one package-internal CUDA target syntax/admission-policy owner consumed by CompilerActor, linker, Device-JS, hardware validation, cache identity, and installed-package conformance;
- proposed SPEC-0014 plus EXP-013 publication-mailbox evidence, without production mapped/sideband support;
- retained EXP-014 lifecycle orchestration evidence;
- a public facade that keeps DriverActor/CompilerActor/native capabilities private and exposes Device-JS only through the standalone `compileDeviceProgram()` helper.

Portable/software implementation and native qualification are separate. SPEC-0010/0011/0012/0013/0016 retain their exact native promotion gates.

## 2026-08-13 capability authority expansion

The open capability tracker had begun referring to `SPEC-0017` through `SPEC-0026` and a capability-expansion roadmap before those files existed on protected main. PR #97 repaired that ownership gap by adding the following **proposal-only** contracts:

```text
SPEC-0017 device selection and target resolution
SPEC-0018 bounded multi-operation scheduling
SPEC-0019 host memory and async transfer
SPEC-0020 prepared batch and CUDA Graph execution
SPEC-0021 extended numeric ABI and generic device views
SPEC-0022 Device-JS parallel and service profiles
SPEC-0023 context-bound CUDA library adapters
SPEC-0024 multi-GPU orchestration
SPEC-0025 graphics interop
SPEC-0026 process-isolated execution
```

Proposal presence does not authorize their production implementation. Each must be separately reviewed and accepted before its implementation dimension may advance.

## Accepted P0 authority corrections

Two contradictions in already-accepted authority are implemented as separate implementation packets:

### SPEC-0006 target-syntax addendum — issue #65

**Architectural disposition:** planned correction.

**Implementation status:** implemented in portable/software and package paths.

**Qualification status:** existing qualified targets unchanged; newly represented targets remain not-qualified.

The implementation provides one shared target parser/policy owner across CompilerActor, linker, Device-JS and hardware target validation. It structurally represents current numeric, family-specific (`f`) and architecture-specific (`a`) CUDA target forms, while policy revision 1 admits only the reviewed unsuffixed target bases already owned by the hardware registry. Target-policy identity participates in compiler/linker cache identity and both Device-JS identity layers. The internal owner is included in the installed package without becoming a public export. Parser/policy admission, provider/toolkit acceptance, device compatibility and CUDA-JS native qualification remain separate facts.

### SPEC-0003 disposal-failure addendum — issue #66

**Architectural disposition:** planned correction.

**Implementation status:** implemented in portable/software paths.

**Qualification status:** portable defect reproduced; destructive native cleanup partitions remain unqualified pending independent exact-profile evidence.

The implementation keeps `RESOURCE_DISPOSE_FAILED` as registry context while preserving the underlying semantic category, observation operation and health transition directly. Failed disposal leaves the logical resource orphaned/unusable, unstructured disposer failure becomes restart-required, repeated close does not repeat native disposal by default, and rollback/cascade cleanup retains bounded primary + cleanup failure truth. DriverActor transport and facade projection preserve the bounded failure envelope and apply the resulting admission state.

Both accepted P0 corrections are implemented in portable/software paths. Destructive native cleanup failures were not induced in this environment and remain explicitly unqualified; this correction does not claim new native negative-path or Blackwell support.

## Public capability projection — issue #67

**Documentation status:** reconciled in this implementation packet.

**Validation status:** package identity and the duplicated RDC/scalar/LTO/Device-JS/operation/interop facts are checked by the documentation gate.

**Qualification effect:** none; documentation reconciliation does not broaden native support.

The public README and capability map now separate architecture, implementation, qualification and priority; describe the accepted portable/package RDC, scalar, Device-LTO, Device-JS and opaque-operation surfaces; and retain each capability's exact native gate. CUDA-MCGS interop now keeps consumer semantics in canonical Device-JS while CUDA-JS owns validation, CUDA lowering, compilation and runtime mechanics. The generated hardware matrix uses the same independent status dimensions and retains an exact `known-incompatible` Hyper-V profile without turning that evidence into architectural rejection.

`scripts/public-capability-projection.mjs` validates those duplicated projections against `package.json`, the package compatibility manifest, accepted capability markers and the hardware registry. `scripts/verify-docs.sh` runs focused mutation tests so obsolete version/capability/ownership or aggregate-status language fails CI.

## EXP-013 responsiveness oracle — issue #64

**Architectural effect:** none; SPEC-0014 remains a proposal and SPEC-0016 remains the sole operation-lifecycle owner.

**Implementation status:** the EXP-013 test oracle is repaired in this packet by replacing the Windows-fragile 1 ms callback-count threshold with one bounded application-turn observation and an explicit timeout negative control.

**Qualification status:** focused exact-Node and F5 portable evidence passes. The exact Windows Node 26.7.0 F5 capsule must be rerun on the merged head before issue #64 closes; earlier candidate evidence is retained but does not qualify a later head automatically.

The Worker readiness handshake, independently progressing mock work, mailbox directions/generation/leases, pending-close truth, failure cleanup and 10-second outer bounds are unchanged. This repair changes no production mailbox, DriverActor, runtime, CUDA, or support behavior.

## Immutable GitHub Actions — issue #69

**Security disposition:** source-controlled supply-chain hardening implemented in this packet.

**Runtime/support effect:** none; package behavior, native qualification and exact Node/toolchain gates are unchanged.

The `verify` and `node-compatibility` workflows pin every remote Action to a reviewed full commit SHA with a same-line release comment. `.github/actions-provenance.json` owns exact release, commit, license and workflow-usage facts, and `docs/PUBLIC_REPOSITORY.md` carries the validator-checked human-readable projection. Remote reusable workflows follow the same full-SHA rule; normalized repository-local `./...` references are explicitly allowed; Docker references are prohibited.

The repository validator and focused mutation tests reject tags/branches/short SHAs, expression-based or malformed references, undeclared dependencies, commit/comment/provenance mismatches, stale workflow inventories, and drift from the weekly three-PR Dependabot update path. Dependency pull requests remain proposals: an upstream release/commit and its provenance must be reviewed before the protected checks can pass.

Issue #68 remains a separate external-control gate. Source files cannot prove the private vulnerability reporting setting, an unaffiliated reporter's Security-tab entry point, or maintainer advisory management.

## Execution baseline

```text
DriverActor Workers:          1 per runtime
private CUDA contexts:        1 per runtime
private execution streams:    1
max pending GPU operations:   1
public operation lifecycle:   CudaFunction.submit() -> CudaOperation
legacy terminal convenience:  CudaFunction.launch()
```

SPEC-0016 is implemented in software/portable paths. Direct submit backpressures while another operation is pending; legacy terminal `launch()` preserves serialized compatibility above the actor. Native SPEC-0016 qualification remains open under issue #51.

Bounded multi-stream execution remains architecturally planned under issue #40 and proposed SPEC-0018. It is not implemented or qualified and must consume SPEC-0016 rather than define another lifecycle.

## Device-JS

SPEC-0013 is accepted and implemented in portable/software/package paths. `acorn@8.15.0` is a syntax-only parser adapter; CUDA-JS owns the accepted subset, typing, helper semantics, deterministic code-unit ordering, CUDA lowering, diagnostics, identity and compiler handoff.

Native DJS-2 evidence remains open under issue #43. Proposed SPEC-0022 may later widen trusted generic GPU primitives and, separately, define a service-safe profile. Neither proposal changes the current trusted-source Device-JS support state.

The CUDA-MCGS external deletion/compatible-pair proof remains cross-repository future work.

## Sideband

SPEC-0014 remains a proposal. EXP-013 proves bounded portable publication-mailbox mechanics only. There is no production mapped/pinned sideband or arbitrary-duration live-operation support claim. Issue #38 must consume the accepted operation lifecycle and, if selected, accepted SPEC-0019 host-registration/mapping ownership before production sideband acceptance.

## Platform qualification

The exact accepted Windows x64 profile remains the native evidence baseline. Native Linux CUDA, WSL2, Linux ARM64/SBSA, Jetson, additional GPU models, Windows Server/TCC, virtualization, multi-GPU, MIG, ECC, soak/performance, and other axes remain independently qualified or unqualified according to their exact registries/evidence.

Not-qualified is not architectural rejection.

## Optional NN extension authority — issue #71

**Architectural disposition:** planned under accepted ADR-0004 and SPEC-0027.

**Implementation status:** not implemented.

**Qualification status:** not qualified.

The CUDA-JS project now authorizes an optional application-neutral NN training product as a separate future publish unit in this repository. The published `cuda-js` package, exports, dependencies, compatibility identity, source tree, import behavior, and existing discovery behavior remain unchanged; no NN-shaped/eager provider discovery is added. The NN registry package name and repository directory remain unselected. SPEC-0027 records planned `nn.*` ownership anchors only; every production boundary still requires a separately accepted child specification, and no tensor, graph, autodiff, provider, training, checkpoint, or conformance implementation is implied.

cuBLAS/cuDNN handles and all provider work over DriverActor-owned device/context/stream/memory resources remain under a future accepted generic adapter; cuBLASLt's distinct handle semantics do not relax current-device or execution-resource ownership. No NN-shaped commands or semantics enter DriverActor, CompilerActor, generic memory, execution, or Device-JS core. This authority packet changes no package behavior or native support claim.

## Forward plans

Active plans contain unfinished work only:

- [`docs/plans/2026-08-12-native-and-platform-qualification-continuation.md`](docs/plans/2026-08-12-native-and-platform-qualification-continuation.md);
- [`docs/plans/2026-08-12-execution-capability-continuation.md`](docs/plans/2026-08-12-execution-capability-continuation.md);
- [`docs/plans/2026-08-12-compatible-pair-continuation.md`](docs/plans/2026-08-12-compatible-pair-continuation.md);
- [`docs/plans/2026-08-13-capability-expansion-roadmap.md`](docs/plans/2026-08-13-capability-expansion-roadmap.md).

The former master/focus/hardware/Node/F9/Device-JS plans are preserved unchanged under [`docs/archive/plans/`](docs/archive/plans/) and remain non-authoritative provenance. Their old active paths are explicit Superseded pointers.

[`next_step.yaml`](next_step.yaml) identifies the current dependency-ready focus. Plans organize work beneath accepted authority and do not reopen completed implementation.
