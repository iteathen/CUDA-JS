# Sanity Checking

## Freeze and declare scope

Freeze the exact revision/artifact and declare the check as `full`, `bounded`, or `sampled`. Never call sampled or silently incomplete coverage system-wide.

## Build a semantic coverage map

Map owners, public contracts, schemas, generated products, callers, end-to-end paths, resources, state/lifetime, errors, cleanup, compatibility, security, performance, tests, documentation, and external dependencies.

Split into review packets small enough for one focused session and full attention. Split by semantic ownership and consequence, not equal line/file count.

## Interrogate each material unit

- purpose and governing specification;
- owner/LEGO boundary;
- inputs, outputs, effects, callers, dependencies;
- state, identity, units, ranges, lifetime;
- design-principle alignment;
- ordering, concurrency, resources, pressure;
- failure, cancellation, recovery, cleanup;
- counterexamples and decisive evidence;
- wider integration and compatibility consequences.

Apply specialist modules when triggered: native/ABI/JIT, generated code, GPU/concurrency, finite memory, security, persistence, compatibility, performance, destructive behavior, diagnostics, and cleanup.

## Reconcile

Passing leaf packets do not prove system coherence. Reconcile producer/consumer boundaries, end-to-end paths, cross-cutting concerns, contradictions, lifecycle, resources, findings, and claim limits against one final revision.
