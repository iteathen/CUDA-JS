# ADR-0003: Generated ABI Facts and Curated Semantic Overlays

**Status:** Accepted

**Date:** 2026-08-10

## Context

CUDA-JS must update efficiently when CUDA adds functions, types, enums, structs, API versions, and optional entry points. Parsing official headers can generate much of that information.

C prototypes do not completely describe safe JavaScript behavior. They often do not state in machine-readable form:

- pointer direction and length relationship;
- ownership and release function;
- context/thread affinity;
- whether a call can block the host;
- whether a result may report earlier asynchronous failure;
- callback restrictions;
- state invalidation and poisoning;
- resource parent/child relationships;
- safe JavaScript representation;
- capability/security exposure;
- compatibility and conformance obligations.

Treating header generation as complete semantics would make fast CUDA updates unsafe.

## Decision

CUDA-JS separates the binding model into four owned layers.

### 1. Generated source facts

Generated from official CUDA headers and target layout probes:

- function and base symbol names;
- return and parameter C types;
- typedef/alias graph;
- enum and constant values;
- opaque handle categories;
- struct/union fields, sizes, alignments, and offsets by target profile;
- pointer depth and qualifiers;
- callback function types;
- documented API-version aliases and deprecations where extractable;
- source toolkit/header identity and generator provenance.

Generated facts are reproducible artifacts, not manually edited authority.

### 2. Curated semantic overlays

Reviewed records keyed by stable function/type identifiers:

- public exposure policy;
- requested CUDA API version and optionality;
- argument direction, nullability, lengths, and bounds;
- handle/resource kind, parent, owner, release, and invalidation;
- context/thread requirements;
- host-blocking and asynchronous behavior;
- deferred-error and context-health implications;
- callback and reentrancy restrictions;
- safe JavaScript representation and capability permissions;
- cleanup, cancellation, and recovery behavior;
- conformance cases and evidence requirements;
- release tier: internal, experimental, supported, or denied.

Semantic overlays are reviewed authority. They cannot be replaced by generated guesses.

### 3. Normalized Runtime IR

A deterministic compiler combines facts, overlays, platform profile, and supported runtime policy into one normalized Runtime IR. The IR drives:

- Node FFI signature generation and Fast FFI/static-eligibility classification;
- trusted entry-point resolution;
- TypeScript declarations and safe facades;
- argument/result validation and call-frame layouts;
- opaque resource transitions;
- blocking/asynchronous routing;
- error normalization;
- conformance-case generation;
- capability and compatibility manifests;
- documentation and coverage reports.

### 4. Generated products

Generated products are always traceable to exact inputs:

- TypeScript/API declarations;
- internal binary or JSON schema packages;
- Node FFI call descriptors and ABI packer descriptors;
- static C oracle declarations;
- test cases and fixtures;
- coverage and unresolved-semantic reports;
- package compatibility manifests.

## Fail-closed rule

A function is not publicly generated when any required semantic field is unknown, contradictory, unsupported by the selected ABI, or untested for the platform profile.

Unknown functions may remain:

- cataloged but unavailable;
- internal to an experiment;
- denied explicitly;
- blocked pending review.

They may not silently inherit generic pointer or lifecycle behavior.

## Versioning and identity

The normalized identity includes every input that can change behavior, including:

- CUDA header/toolkit version and exact source hashes;
- generator version;
- overlay version and hash;
- Runtime IR schema version;
- target OS/architecture/ABI/data model;
- exact Node/FFI backend profile where relevant;
- requested CUDA API version and entry-point flags;
- host-call qualification and security profile;
- enabled capability set;
- compiler/linker providers and options for generated device artifacts.

Resolved native functions and process pointers are process-local and keyed by runtime epoch. Persistent package/device-code caches must not contain process addresses or assume Fast FFI qualification without exact-profile evidence.

## Update workflow

A CUDA update follows:

1. acquire official headers with provenance;
2. regenerate source facts and target layout probes;
3. produce a semantic and ABI diff;
4. classify new, changed, deprecated, and removed items;
5. update overlays only for material semantic changes or new public coverage;
6. run schema normalization and static consistency capsules;
7. run synthetic ABI cases for new signature classes;
8. run affected Driver/NVRTC/nvJitLink conformance on supported profiles;
9. review generated public/API/compatibility changes;
10. publish only coverage whose semantic and platform gates pass.

Unchanged generated facts and overlays reuse prior evidence by exact key.

## Public schema trust

The runtime loads only schemas/packages produced by the trusted CUDA-JS schema compiler or explicitly enabled development profiles. Ordinary applications cannot submit arbitrary function signatures and library names to manufacture native call authority.

A future plugin capability requires a separate security contract, allowlist/signature model, and review.

## Consequences

- CUDA API breadth can grow without hand-authoring every ABI declaration.
- Semantic review remains bounded to new or changed meaning.
- Generated bindings do not overclaim safety from C syntax.
- TypeScript, Node FFI/ABI descriptors, tests, docs, and compatibility manifests share one source of normalized truth.
- New CUDA versions can be supported incrementally and fail closed.
- The framework carries an explicit semantic-maintenance burden; this is accepted because the alternative is unsafe inference.

## Alternatives rejected

### Parse headers and expose everything automatically

Rejected because prototypes do not own enough lifecycle, asynchronous, error, or security meaning.

### Handwrite all bindings and semantics

Rejected because it makes CUDA-version updates slow, inconsistent, and difficult to audit for completeness.

### One monolithic schema edited by hand

Rejected because generated facts and human decisions would be indistinguishable, causing drift and noisy update reviews.

### Runtime reflection from symbols only

Rejected because native symbols do not provide complete type or semantic information.

## Validation

The schema system must prove:

- deterministic regeneration;
- exact source provenance;
- target layout agreement with compiled C probes;
- complete overlay coverage for every public function;
- no unresolved semantic field in supported packages;
- stable identifiers across non-semantic header movement;
- explicit compatibility diff and invalidation;
- generated TypeScript/call descriptors/oracles/tests agree with the Runtime IR;
- malformed or untrusted schema packages cannot expand native capability.

## Revisit triggers

Revisit if NVIDIA publishes a sufficiently complete machine-readable semantic API, if overlay maintenance becomes larger than direct binding maintenance, or if another language binding provides a legally and technically reusable normalized source of equivalent semantics.
