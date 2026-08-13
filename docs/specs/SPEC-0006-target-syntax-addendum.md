# SPEC-0006 Addendum: Canonical CUDA Target Syntax and Policy

**Status:** Accepted

**Date:** 2026-08-13

**Accepted after authority/research review on:** `5233a046c57813532a71763bb36cdba5894e43e0`

**Issue owner:** #65

## Outcome

Amend only the architecture-target grammar/policy portion of accepted SPEC-0006 so CUDA-JS can represent current CUDA target spellings such as `compute_120`, `sm_120`, `compute_120f`, and `sm_120a` without treating syntax acceptance as provider/toolkit/GPU qualification or replacing the old accidental two-digit ceiling with another accidental target-format ceiling.

This accepted addendum authorizes the bounded shared parser/policy implementation described below. It does not establish native support for any newly admitted target.

All other SPEC-0006 CompilerActor, provider, option, cache, artifact, lifecycle, security and cleanup rules remain unchanged.

## Problem

Accepted SPEC-0006 currently restricts architecture values to canonical lowercase two-digit compute capabilities from 50 through 99. Current repository hardware planning includes three-digit architecture codes, so the accepted grammar rejects them before provider/toolkit compatibility can even be evaluated.

CUDA 13.3 also already defines architecture variants with `f` and `a` suffixes. NVIDIA documents different compatibility behavior for unsuffixed, family-specific (`f`) and architecture-specific (`a`) targets. A numeric-only replacement grammar would therefore be stale immediately.

Duplicating target regexes in CompilerActor and Device-JS creates a second independent drift risk.

## Research basis

Primary CUDA 13.3 authority reviewed for this addendum:

- NVRTC supported compile targets: https://docs.nvidia.com/cuda/nvrtc/#supported-compile-options
- NVCC GPU architecture/code lists and compatibility: https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/
- CUDA hardware/profile registry in this repository: `conformance/hardware/registry.json`

Current CUDA 13.3 tools define examples including unsuffixed, `f`, and `a` forms such as `compute_100`, `compute_100f`, `compute_100a`, `sm_120`, `sm_120f`, and `sm_120a`. Tool-specific supported sets are not identical, which is why syntax, repository policy, provider acceptance, device compatibility, and qualification remain separate dimensions.

## Status dimensions

```text
architectural disposition: selected correction
implementation status:       authorized, not yet implemented in accepted main
qualification status:        existing qualified targets unchanged; newly admitted targets not-qualified
priority:                    active correctness/hardware-campaign unblocker
```

## One authoritative target owner

CUDA-JS must have one pure-JavaScript target parser/normalizer and one repository-owned admission policy consumed by:

- CompilerActor compile normalization;
- linker target normalization;
- Device-JS compile-option validation;
- hardware/profile validation where target spellings are checked;
- future selected-device target resolution under SPEC-0017 if that proposal is accepted.

No production owner may keep a competing architecture regex.

## Canonical syntax

The shared parser recognizes only:

```text
compute_<base><variant?>
sm_<base><variant?>
```

with:

```text
base    := [1-9][0-9]+
variant := "" | "f" | "a"
```

Rules:

- `<base>` contains at least two decimal digits;
- no sign or leading zero;
- only lowercase `compute_` / `sm_` prefixes;
- only lowercase optional `f` or `a` suffix;
- no whitespace, decimal point, alternate separator, extra suffix, or caller-defined extension;
- syntax is not capped at two or three digits; the finite policy controls present admission.

The parser does **not** derive compute-capability major/minor by assuming that future CUDA numeric codes always encode those facts in a fixed decimal position. It returns the canonical base code as an opaque decimal string plus the explicit variant. The repository policy owns semantic metadata for codes it admits.

A normalized target record is equivalent to:

```text
prefix:  compute | sm
base:    canonical decimal string
variant: none | family | architecture
suffix:  null | f | a
name:    exact canonical target string
```

Variant meanings follow CUDA's target compatibility model:

- no suffix: ordinary/non-architecture-specific target;
- `f`: family-specific target with the provider/toolchain compatibility semantics documented for that CUDA release;
- `a`: architecture-specific target whose assumptions may require the exact architecture.

CUDA-JS does not reimplement NVIDIA's compatibility relation from the suffix alone. Provider/device compatibility is separately checked and evidenced.

## Initial repository admission policy

The accepted initial policy admits exactly the unsuffixed target bases already owned by `conformance/hardware/registry.json`:

```text
75
80
86
87
88
89
90
100
103
110
120
121
```

For this first policy revision:

```text
admitted variants: none only
parsed but policy-rejected: f, a
```

Thus `compute_120` / `sm_120` become policy-admitted while `compute_120f`, `sm_120a`, and any other suffix variant remain structurally understood but fail closed until a separate reviewed policy addition has a concrete consumer/provider/device need.

A syntactically valid unknown base, including a future longer numeric code, is also policy-rejected before backend work until added through reviewed authority.

The policy registry records semantic metadata explicitly for each admitted base, including the current repository compute-capability label used by hardware qualification. Parser syntax never becomes the source of hardware-family truth.

## Compile/link relationship

Under existing SPEC-0006 public semantics:

- `compile()` accepts only policy-admitted `compute_...` targets;
- `link()` accepts only policy-admitted `sm_...` targets;
- a prefix mismatch fails before provider work;
- typed artifact compatibility uses normalized target records/policy metadata rather than duplicated string slicing/regex assumptions;
- target/policy changes remain part of compile/link/cache/artifact identity.

NVRTC or nvJitLink may support a different subset from the repository policy. A policy-admitted request still passes through exact provider capability/version validation before native compilation/linking. Provider rejection is an explicit unsupported/provider result, not permission to silently substitute a target.

## Device-JS integration

SPEC-0013/Device-JS consumes this same parser and policy. It cannot maintain its own target grammar.

Device-JS target acceptance changes compile identity exactly as CompilerActor acceptance does. A syntactically/policy-valid target does not acquire Device-JS native qualification by implication.

## Selected-device integration

If SPEC-0017 is later accepted, default target resolution consumes this same policy model.

The default selected-device target should choose the ordinary unsuffixed policy target matching the selected device's accepted compute-capability metadata unless a separately accepted profile explicitly requires an `f`/`a` target. Device discovery does not silently opt into architecture-specific compilation.

## Qualification separation

A target has independent states:

```text
syntactically valid
repository-policy admitted
compiler/linker provider accepted
selected GPU/device compatible
natively qualified by CUDA-JS for an exact profile
```

For example, admitting `sm_120` spelling/policy does not prove the installed provider accepts it, a local GPU is Blackwell, generated code is correct, or CUDA-JS supports all Blackwell devices.

Exact provider/toolkit/GPU promotion remains owned by #12/#22 and capability-specific native evidence.

## Portable conformance

Implementation must add one shared target owner and cover:

- every initially admitted unsuffixed base above for both allowed prefixes in its owning context;
- existing two-digit qualified `compute_75` / `sm_75` behavior unchanged;
- three-digit admitted targets including `100`, `103`, `110`, `120`, and `121`;
- structural parsing of representative `f`/`a` forms followed by deterministic policy rejection;
- a longer syntactically valid but policy-disallowed numeric base to prove syntax is not digit-capped;
- one-digit base, leading zero, sign, whitespace, uppercase, decimal-point, unknown suffix, duplicate suffix, and malformed prefix rejection;
- compile/link prefix mismatch;
- deterministic canonical record/serialization;
- CompilerActor, linker, Device-JS, facade/package and hardware-registry integration using the same owner;
- cache/identity change when target or target-policy version changes.

Mutation tests must fail if any consumer reintroduces a private permissive/stricter architecture regex instead of the shared owner.

## Native promotion evidence

For each newly qualified target/profile:

1. the exact installed compiler/linker provider accepts the normalized target under its documented supported set;
2. generated artifact target/identity agrees with an independent native oracle;
3. execution occurs only on a compatible exact GPU/profile;
4. existing compiler/cache/Driver lifecycle and terminal cleanup pass;
5. support state changes only for the exact qualified cell.

A provider-known-incompatible policy target remains visible as unsupported for that provider/profile rather than being removed from the generic repository policy if other accepted paths need it.

## Falsifiers / rollback

Do not implement this addendum by merely widening duplicated regexes. The parser, policy and consumer integration must be centralized.

Do not infer provider support from the parser or repository hardware registry.

Rollback is the accepted pre-addendum two-digit policy while newly represented architectures remain rejected before backend work.

## Non-goals

- automatically policy-admitting every syntactically valid future target;
- admitting `f`/`a` variants without a concrete reviewed profile;
- reproducing NVIDIA's complete target compatibility engine in JavaScript;
- architecture-family support claims from syntax alone;
- changing compiler provider discovery or arbitrary native options;
- changing Device-JS language semantics beyond target normalization;
- weakening exact cache/artifact identity or qualification gates.
