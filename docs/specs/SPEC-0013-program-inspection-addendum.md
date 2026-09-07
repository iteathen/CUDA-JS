# SPEC-0013 Addendum: Pure Program Inspection and Public Helper Profile

**Status:** Accepted

**Date:** 2026-09-07

**Issue owner:** #251

## Outcome and authority

Add one CUDA-free public inspection operation for the accepted restricted Device-JS frontend:

```text
inspectDeviceProgram(request) -> DeviceJsInspectionResult
```

This addendum is authoritative together with SPEC-0013 and its public-surface addendum. It corrects a consumer-boundary defect demonstrated by CUDA-MCGS #124/#249: downstream composers must be able to fail closed on Device-JS semantics without maintaining a second helper/type catalog merely because compilation otherwise requires an open CUDA-JS runtime.

## Ownership

CUDA-JS exclusively owns Device-JS syntax, types, helper spelling/signatures, parser/frontend semantics, deterministic lowering, compile-profile validation, program identity and the public helper-profile classification defined here.

Consumers own their semantic source generation and may impose stricter domain policy, but they must not reinterpret CUDA-JS source spelling, maintain an independent list of supported Device-JS helpers, or create private/native fallbacks when the selected lower profile rejects the program.

## Pure inspection contract

`inspectDeviceProgram(request)`:

- accepts the same public Device-JS program request shape as `compileDeviceProgram()`, including public `DeviceJsImport` values;
- opens no CUDA runtime, DriverActor, CompilerActor, provider, context, allocation, module, function or GPU operation;
- invokes the same authoritative Device-JS translation/validation path used before compilation;
- preserves every explicit compile-profile requirement from the accepted child contracts; inspection does not infer away a required `cuda-cccl`, `cuda-numeric` or `cuda-device` profile;
- validates source, metadata, calls, helpers, types, imports, return completeness, recursion, compile options and deterministic identities before returning;
- returns immutable bounded public facts only;
- never returns generated CUDA source, parser ASTs, private provider paths, raw handles/pointers, native artifacts or CompilerActor internals.

`compileDeviceProgram()` and `inspectDeviceProgram()` must share the same internal program-inspection/translation path so the two public operations cannot define independent Device-JS language semantics.

## Result shape

The inspection result contains:

1. the ordinary public `deviceProgram` descriptor produced by the validated request; and
2. an `inspection` record containing:
   - the normalized public compile options selected by the frontend; and
   - `publicHelperUsage`, in canonical function order.

Each `publicHelperUsage` row contains the exact public Device-JS source spelling of the selected **public helper profile** used directly by that function.

The public helper profile is intentionally narrower than every `gpu.*` value helper. It contains helpers whose use contributes GPU execution-index, atomic/publication, synchronization or fence semantics:

- thread/block/grid index helpers;
- `gpu.atomic.add` and `gpu.atomic.cas`;
- scoped Device-JS atomic load/store helpers;
- publication-mailbox load/store helpers;
- block barrier and device fence helpers.

Scalar constructors, exact casts, special-value helpers and value-local math helpers are excluded from this profile. Their validity remains fully CUDA-JS-owned and is still checked by inspection; exclusion only prevents consumers from treating the profile as a redundant complete Device-JS language catalog.

Unknown or invalid helpers never enter `publicHelperUsage` because the authoritative translation must succeed first.

## Determinism and identity

Function rows and helper names use raw JavaScript/Unicode code-unit ordering. Repeated inspection of identical inputs returns identical immutable public facts.

The returned `deviceProgram.sha256` remains the ordinary Device-JS program identity and therefore includes normalized compile/target inputs under existing SPEC-0013 authority. A consumer must not treat an inspection identity produced for one compile target as the identity of a later compilation for another target. The helper profile is a semantic projection of the already validated source, not a replacement program identity.

## Consumer use

A downstream composer may:

- select its own declared lower public requirements and derive the corresponding public CUDA-JS compile options through its adapter;
- call `inspectDeviceProgram()` with that exact request before any native allocation/ignition;
- compare the returned lower-owned public helper profile with its own source/package declaration if it chooses to retain such metadata;
- fail closed if the lower frontend rejects the source or selected compile profile.

A consumer must not reconstruct helper support by source substring matching or a private helper allowlist. A lower compile-profile omission remains observable: for example, device release/acquire helpers still fail inspection without the accepted CCCL-capable profile.

## Package and qualification

This is an additive prerelease public API change. The package identity advances to `cuda-js@0.1.0-alpha.19`; public API schema version remains 1.

Portable/package conformance must prove:

- runtime-free deterministic inspection;
- base `gpu.atomic.cas` acceptance through CUDA-JS authority;
- lower-owned unknown-helper rejection;
- exact public helper-profile projection without scalar-constructor leakage;
- explicit release/acquire compile-profile rejection and acceptance;
- equality of inspected and compiled public `deviceProgram` facts when the exact compile target/options match;
- public DeviceJsImport inspection; and
- no generated/native/private detail leakage.

This evidence does not qualify native CUDA execution, any provider/GPU profile, performance, CUDA-MCGS search/evaluator correctness or downstream product behavior.
