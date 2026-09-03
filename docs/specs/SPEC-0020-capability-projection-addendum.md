# SPEC-0020 Addendum: Public prepared-DAG capability limits

**Status:** Accepted

**Date:** 2026-09-03

**Owner:** `runtime.prepared-execution`

**Parent:** accepted `SPEC-0020-prepared-batch-and-graph-execution.md`

**Issue owner:** #189

## Outcome

Project the already-accepted finite prepared-operation-DAG ceilings through the supported public CUDA-JS compatibility surface so semantic consumers can perform bounded admission/fallback planning without copying lower constants or deep-importing CUDA-JS internals.

This addendum introduces no new preparation transaction, executable object, scheduler, logical-work resolver, graph realization, semantic IR, or native mechanism. `runtime.prepared-execution` remains the sole validation and lifecycle owner.

## Public projection

The supported `cuda-js/compatibility` record additively exposes:

```text
CUDA_JS_COMPATIBILITY.capabilities.preparedOperationDagLimits = {
  nodes,
  edges,
  bindings,
  predecessorsPerNode
}
```

The values are the exact accepted SPEC-0020 limits used by prepared-DAG normalization/validation:

```text
nodes:               32
edges:               64
bindings:            64
predecessorsPerNode: 8
```

The projection is immutable public capability data. It is not a promise that every semantic consumer should use the full ceiling, nor authority for a consumer to redefine those values as its own limits.

The existing descriptive `capabilities.preparedOperationDags` field remains unchanged. This is an additive prerelease capability projection.

## Single-owner requirement

The public record must be mechanically derived from the same `PREPARED_OPERATION_DAG_LIMITS` value used by lower validation. Maintaining a second handwritten table in the compatibility manifest is forbidden.

Repository/package verification must fail if prepared-DAG validation limits and the public projection can diverge.

## Consumer use

A semantic consumer may use these values to decide whether an optional realization can be attempted while preserving an independently complete fallback. Examples include determining whether an optional provider workspace would add a binding beyond the lower prepared-DAG ceiling.

Consumers still own their semantic policy and any intentionally stricter independent bounds. CUDA-JS still owns final prepared-DAG validation. A consumer-side preflight based on this record never replaces lower validation.

## Identity and compatibility

These limits are lower capability facts. They may enter a consumer's physical/backend compatibility identity when that consumer's resolved realization materially depends on them; they do not enter unrelated mathematical or semantic identity merely because they are observable.

Changing an accepted prepared-DAG limit requires corresponding CUDA-JS authority/evidence and changes this public capability record on the same exact revision.

## Required evidence

Portable/package evidence must prove at least:

- the supported compatibility import exposes the exact four-field immutable record;
- the record equals `PREPARED_OPERATION_DAG_LIMITS` used by normalization;
- an installed-package consumer reads the record without a deep import;
- existing prepared-DAG conformance still enforces the same ceilings;
- the existing descriptive capability field remains unchanged;
- no consumer vocabulary enters CUDA-JS production or compatibility records.

## Non-goals

No `PreparedExecutable`, no new resource transaction, no automatic batching/splitting, no logical-work launch resolver, no CUDA Graph work, no provider policy, no Tensor/NN/search semantics, no performance claim, and no CUDA-MCGS #122 work.
