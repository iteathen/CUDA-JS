# ADR-0005: JavaScript-Authored, JIT/Native-Realized Runtime

**Status:** Accepted

**Date:** 2026-08-24

## Context

CUDA-JS is sometimes described as “pure JavaScript and JIT.” That shorthand points toward the current architecture but is ambiguous. It can be misread to mean that the repository contains no C/C++, that CUDA-JS invokes no native libraries, that every host call is JIT-dispatched, or that every device program is compiled at runtime. None of those statements accurately describes the current split.

The published runtime is maintained as JavaScript and ships no CUDA-JS-specific compiled host addon. At execution time it uses Node's native FFI substrate and NVIDIA's native Driver, NVRTC and nvJitLink libraries. Restricted Device-JS is translated by JavaScript into private generated CUDA C++ and may be compiled and linked into PTX/cubin. Consumers may also supply accepted low-level source/artifacts or load precompiled PTX/cubin. The repository additionally contains independent C/C++ ABI probes, native conformance oracles and generated fixtures that are evidence, not the runtime implementation.

Without one explicit classification, later work could either introduce a maintained native host implementation casually or remove valuable independent native evidence in pursuit of a misleading “pure JavaScript repository” claim.

## Decision

The canonical description of the current CUDA-JS core architecture is:

> **CUDA-JS is JavaScript-authored and JIT/native-realized.**

The terms have the following exact meaning.

### JavaScript-authored production runtime

The maintained production implementation shipped by the `cuda-js` core package is JavaScript/ESM, accompanied by declaration and data artifacts. CUDA-JS currently ships no project-specific compiled Node addon and no ahead-of-time per-CUDA-function wrapper library.

Node's built-in FFI remains a private backend. JavaScript owns the public facade, validation, actor protocols, capability identities, resource/lifecycle policy, Device-JS translation, compiler orchestration, errors, compatibility and teardown semantics.

### JIT/native realization

“Native-realized” includes native behavior deliberately reached through the owned JavaScript boundary:

- Node/V8's native runtime, FFI implementation, generated Fast API trampolines and permitted generic fallback;
- NVIDIA Driver, NVRTC, nvJitLink and other separately accepted native provider libraries;
- CUDA-JS-generated private CUDA C++ and the resulting PTX, LTO-IR, cubin or later accepted device artifacts;
- accepted consumer-supplied CUDA C++/PTX/binary inputs processed through bounded public contracts;
- GPU machine code loaded or produced for the selected device profile.

JIT is a capability, not a claim that every operation is JIT-dispatched. Host FFI profiles remain governed by ADR-0002. Device compilation is optional: a consumer may use NVRTC/nvJitLink or load accepted precompiled artifacts.

### C/C++ evidence and generated inputs

C/C++ may remain in conformance, experiment, schema-probe, generated-fixture or independent-oracle boundaries when it provides an independent native truth source. Such source:

- is not part of the shipped `cuda-js` runtime implementation;
- may not become a hidden production dependency or alternate public runtime;
- has an explicit evidence owner, exact toolchain/profile identity and cleanup disposition;
- remains independently comparable with the JavaScript path rather than duplicating its logic as the only oracle.

Private generated CUDA C++ is a deterministic transient compiler input owned by CUDA-JS lowering. It is not maintained consumer source, is not exposed as an ordinary public result and does not make the production runtime a C++ implementation.

### Drift gate

Do not use the unqualified phrase “pure JavaScript” as normative architecture language. Use “JavaScript-authored and JIT/native-realized,” followed by the relevant current package/profile limits.

A future CUDA-JS-maintained native host backend or compiled addon is not silently forbidden forever, but it changes this source architecture. It requires a measured gap, an accepted extending or replacement ADR, explicit package/distribution/security/ABI/lifecycle/compatibility ownership, independent qualification, and migration consequences before implementation. A consumer request, performance intuition or convenient native prototype is not sufficient authority.

## Consequences

- Documentation distinguishes maintained runtime source, native execution dependencies, generated device artifacts and independent evidence.
- The presence of C/C++ conformance/oracle files does not contradict the JavaScript-authored runtime claim.
- Generated CUDA C++ and JIT-produced artifacts remain private implementation details or typed artifacts under their owning contracts.
- Package validation continues to reject an accidental CUDA-JS-specific compiled addon in the current profile.
- JIT and native support claims remain exact-profile and capability-specific rather than inferred from the architecture label.
- Future native host implementation work must be deliberate and reviewable instead of entering through a local optimization or consumer-specific workaround.

## Alternatives considered

### Call CUDA-JS “pure JavaScript”

Rejected as the normative phrase. It collapses authored source, native dependencies, generated compiler inputs and repository evidence into one ambiguous claim.

### Call CUDA-JS a mixed JavaScript/C++ runtime

Rejected for the current production boundary. It incorrectly promotes independent probes/oracles and transient generated CUDA C++ into maintained runtime ownership.

### Prohibit every C/C++ file in the repository

Rejected. It would remove independent ABI/native oracles and make important conformance claims less trustworthy without changing the actual native execution stack.

### Freeze out every future native backend

Rejected. ADR-0002 already preserves a measured-gap path. The correct control is an explicit architectural decision and complete native lifecycle/packaging evidence, not an accidental permanent prohibition.

## Validation

The current profile requires:

- published-package inventory proving no CUDA-JS-specific compiled addon or native wrapper library is shipped;
- clear ownership and exclusion of repository C/C++ probes/oracles from package runtime files;
- deterministic Device-JS-to-private-CUDA-C++ lowering and bounded compiler/artifact identity;
- exact-profile evidence for every native provider, FFI/JIT claim and generated device artifact claim;
- documentation/static checks that preserve this ADR, its canonical phrase and the ADR-0002 host-binding distinction;
- an accepted replacement/extension before any maintained native host backend enters production.

## Relationship to prior decisions

This ADR extends ADR-0002. ADR-0002 remains authoritative for Node-FFI profiles, fast-JIT qualification and measured-gap revisit triggers. This ADR classifies the wider production-source, generated-device-code and native-evidence split without changing accepted low-level compilation/artifact contracts.
