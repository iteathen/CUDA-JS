# SPEC-0006 Addendum: Canonical CUDA Target Syntax and Policy

**Status:** Proposal

**Date:** 2026-08-13

**Issue owner:** #65

## Outcome

Amend only the architecture-target grammar/policy portion of accepted SPEC-0006 so CUDA-JS can represent current three-digit CUDA target spellings such as `compute_120` / `sm_120` without treating syntax acceptance as native toolkit/GPU qualification or replacing the old accidental two-digit ceiling with a new accidental three-digit ceiling.

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

Accepted numeric syntactic forms after this addendum is accepted:

```text
compute_<code>
sm_<code>
```

where `<code>` is a canonical decimal compute-capability code matching the semantic rule:

```text
[1-9][0-9]+
```

That is: at least two decimal digits, no sign, no leading zero, lowercase prefix only, and no whitespace or alternate separators. Syntax is deliberately not capped at three digits; the finite repository-owned policy allowlist below determines which concrete targets are admitted now.

The parser interprets the final decimal digit as the minor capability and all preceding digits as the major capability:

```text
75   -> 7.5
89   -> 8.9
100  -> 10.0
103  -> 10.3
120  -> 12.0
121  -> 12.1
1000 -> 100.0   (syntactically representable, not policy-admitted unless later reviewed)
```

This parsing rule is syntax only. If NVIDIA later introduces a materially different canonical target form, such as a non-numeric suffix with distinct semantics, that is a reviewed grammar/semantic addition rather than something guessed by this parser.

## Policy allowlist

Syntactic validity does not automatically make a target admissible.

A separate repository-owned target policy/registry selects the exact codes CUDA-JS currently admits for compile/link/profile planning. Unknown or policy-disallowed codes fail before backend/native work.

The first policy update must include only codes already required by the hardware support/qualification program or another accepted capability contract. Future numeric architecture codes are added through a reviewed policy update, without changing the generic numeric parser merely because the number of digits grows.

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
- a longer syntactically valid but policy-disallowed numeric code to prove syntax is not accidentally digit-capped;
- compile/link prefix mismatch;
- one-digit code, leading zero, sign, whitespace, uppercase, decimal-point and malformed forms;
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

Do not accept an implementation that merely widens duplicated regexes. The implementation must centralize syntax parsing/normalization and keep the finite target policy separate.

Rollback is the accepted two-digit SPEC-0006 target policy while three-digit architectures remain rejected before backend work.

## Non-goals

- automatically policy-admitting every syntactically valid numeric target;
- guessing future non-numeric CUDA target suffix semantics;
- architecture-family support claims from syntax alone;
- changing compiler provider discovery or native options;
- changing Device-JS language semantics beyond target normalization;
- weakening exact cache/artifact identity.
