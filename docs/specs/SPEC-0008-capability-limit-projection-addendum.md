# SPEC-0008 Addendum: Finite lower capability-limit projection

**Status:** Accepted

**Date:** 2026-09-03

**Owner:** `runtime.facade` public compatibility product

**Parents:** accepted `SPEC-0008-package-public-facade.md`, `SPEC-0013-restricted-device-js.md`, and `SPEC-0020-prepared-batch-and-graph-execution.md`

**Issue owner:** #186

## Outcome

Project already-accepted finite lower compatibility ceilings through the existing immutable `CUDA_JS_COMPATIBILITY` public product so semantic planners can avoid copying CUDA-JS constants while CUDA-JS remains the final admission authority.

This addendum does not create, change or broaden any limit. It exposes only lower facts already enforced by their existing owners.

The additive public compatibility fields are:

```text
CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits = {
  nodes: 32,
  edges: 64,
  bindings: 64,
  predecessorsPerNode: 8
}

CUDA_JS_COMPATIBILITY.capabilities.deviceJsLimits = {
  parametersPerFunction: 64
}
```

The first record is the exact current `PREPARED_OPERATION_DAG_LIMITS` projection owned by SPEC-0020. The second is the exact current per-function Device-JS parameter ceiling owned by the accepted restricted Device-JS translator contract.

## Ownership and projection rule

The prepared-execution and Device-JS components remain the normative production owners of their limits. The compatibility record is a public materialized projection, not a second policy owner.

Repository conformance must fail if a projected value differs from its owning production constant. A limit change therefore requires changing the lower owner under its governing contract and reconciling the public projection in the same accepted transaction.

Upper consumers may use these fields for early planning, compatibility checks and deterministic identity where lower compatibility is material. They do not become CUDA-JS validity owners:

- every Device-JS request is still validated by the Device-JS owner;
- every prepared DAG is still validated by SPEC-0020 preparation;
- consumers may impose independently justified stricter semantic/resource limits;
- consumers must not relabel a lower ceiling as their own semantic maximum merely because they preflight against it.

## Public shape and lifecycle

`CUDA_JS_COMPATIBILITY` remains deeply frozen and side-effect free. Reading these fields performs no provider discovery, runtime creation, compilation, allocation, preparation or native work.

The package export shape is unchanged: callers use `cuda-js` or `cuda-js/compatibility`. No component/deep import is added or supported.

These records are compatibility facts only. They contain no device handle, selected-device identity, native/provider path, performance recommendation, consumer vocabulary or mutable state.

## Identity and compatibility

The numeric values are material compatibility facts for upper planners that choose to include them in their own physical-profile identity. CUDA-JS prepared/executable semantic identity remains owned by the existing lower contracts and is not changed by merely exposing the same limits publicly.

This is an additive prerelease compatibility projection under the existing public API schema. No new error category, resource kind or lifecycle is introduced.

## Required evidence

Portable/package qualification must prove:

- the public compatibility object exposes the exact two records above;
- both records and their parent compatibility object are immutable;
- the prepared projection equals `PREPARED_OPERATION_DAG_LIMITS` field-for-field;
- the Device-JS parameter projection equals the translator's single lower parameter-limit owner rather than an independently maintained test number;
- an installed consumer can read both fields through `cuda-js/compatibility` with no internal import;
- existing prepared-DAG and Device-JS boundary rejection remains unchanged.

No native qualification is required because this changes only side-effect-free compatibility metadata for already-implemented lower contracts. Existing native/support/performance claims do not change.

## Falsifiers

Reject or roll back this addendum if exposing the values requires moving lower validation ownership into the facade, creating duplicated mutable limit state, opening a runtime/provider, or adding consumer-specific semantics.

A future limit needed only by one consumer is not automatically entitled to public projection. Project lower facts only when an upper planner must otherwise copy a lower compatibility ceiling or unnecessarily perform expensive lower work solely to discover predictable incompatibility.

## Non-goals

No logical-work resolver, no launch-policy default, no preparation transaction, no universal GPU IR, no provider registry, no limit increase, no new Device-JS grammar, no CUDA Graph work, no native support/performance claim, and no CUDA-MCGS #122 activity.
