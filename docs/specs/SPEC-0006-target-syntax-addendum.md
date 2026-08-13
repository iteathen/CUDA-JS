# SPEC-0006 Addendum: Canonical CUDA Target Syntax and Policy

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #65

## Outcome

Amend only the architecture-target grammar/policy portion of accepted SPEC-0006 so CUDA-JS can represent current three-digit CUDA target spellings such as `compute_120` / `sm_120` without treating syntax acceptance as native toolkit/GPU qualification.

All other SPEC-0006 CompilerActor, provider, option, cache, artifact, lifecycle, security and cleanup rules remain unchanged.

## Problem

Accepted SPEC-0006 currently states that architecture values are canonical lowercase two-digit compute capabilities from 50 through 99. Current repository hardware planning includes three-digit architecture codes, so the accepted grammar would reject them before provider/toolkit compatibility can even be evaluated.

Duplicating target regexes in CompilerActor and Device-JS also creates drift risk.

## Status dimensions

```text
architectural disposition: planned correction
implementation status:       existing implementation still uses old two-digit restriction
qualification status:        not-qualified for newly admitted targets
priority:                    active authority repair
```

## Canonical target parser

CUDA-JS must have one authoritative pure-JavaScript target parser/normalizer consumed by compiler, linker, Device-JS and hardware/profile validation.

Accepted syntactic forms after this addendum is accepted:

```text
compute_<code>
sm_<code>
```

where `<code>` is a canonical decimal compute-capability code with:

- two or three digits;
- no sign;
- no leading zero;
- lowercase prefix only;
- no whitespace or alternate separators.

The parser interprets the final decimal digit as the minor capability and all preceding digits as the major capability:

```text
75  -> 7.5
89  -> 8.9
100 -> 10.0
103 -> 10.3
120 -> 12.0
121 -> 12.1
```

This parsing rule is syntax only.

## Policy allowlist

Syntactic validity does not automatically make a target admissible.

A separate repository-owned target policy/registry selects the exact codes CUDA-JS currently admits for compile/link/profile planning. Unknown or policy-disallowed codes fail before backend/native work.

The first policy update must include only codes already required by the hardware support/qualification program or another accepted capability contract. Future architecture codes are added through a reviewed policy update rather than by widening a regex again.

## Compile/link relationship

`compile()` accepts only `compute_<code>` and `link()` accepts only `sm_<code>` under the shared parser/policy.

When a typed compile artifact is supplied to linking, architecture compatibility is checked from parsed semantic target facts rather than string slicing/regex assumptions.

Changing target code/policy continues to affect compile/link/cache/artifact identity exactly as required by SPEC-0006.

## Device-JS integration

SPEC-0013/Device-JS must consume the same target parser/normalizer rather than maintain an independent target regex.

Device-JS syntax acceptance for a target does not claim the target has native Device-JS evidence.

## Selected-device integration

If SPEC-0017 is later accepted, default target resolution consumes the same parsed target model and policy. Explicit device selection therefore does not create a second target grammar.

## Qualification separation

A target can be:

```text
syntactically valid
policy admitted
provider/toolkit accepted
GPU/device compatible
natively qualified by CUDA-JS
```

These are separate facts.

Accepting `sm_120` spelling does not prove:

- the installed NVRTC/nvJitLink accepts that target;
- the current GPU has that architecture;
- generated code executes correctly;
- CUDA-JS supports Blackwell generally.

Exact provider/toolkit/GPU promotion remains owned by #12/#22 and capability-specific native evidence.

## Portable conformance

Tests must cover:

- accepted two-digit targets used by current baseline;
- admitted three-digit targets from the hardware registry;
- compile/link prefix mismatch;
- leading zero, sign, whitespace, uppercase, decimal-point and malformed forms;
- syntactically valid but policy-disallowed codes;
- deterministic normalization;
- compiler/linker/Device-JS reuse of the same owner;
- cache/identity changes when target changes.

## Native promotion evidence

For each new target actually promoted:

1. the exact installed compiler/linker provider must accept the normalized target;
2. output artifact architecture/identity must match an independent native oracle;
3. execution must occur only on a compatible exact GPU/profile;
4. cleanup and existing compiler/Driver conformance must pass;
5. support state changes only for that exact qualified cell.

## Falsifiers / rollback

Do not accept an implementation that simply changes the duplicated regexes to `\d{2,3}` without a shared parser and policy allowlist.

Rollback is the accepted two-digit SPEC-0006 target policy while three-digit architectures remain rejected before backend work.

## Non-goals

- automatically accepting every future numeric target;
- architecture-family support claims from syntax alone;
- changing compiler provider discovery or native options;
- changing Device-JS language semantics beyond target normalization;
- weakening exact cache/artifact identity.
