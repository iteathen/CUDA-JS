# Testing Discipline

## Test the owned claim

Before writing or running a material test, identify the claim, authoritative oracle, exact subject/artifact/environment identity, expected case set, and invalidation conditions.

## Bank intents, then consolidate

Capture every material regression, boundary, counterexample, or risk as a test intent. During diagnosis use the smallest reproducer, then consolidate related intents into the canonical ownership-aligned capsule.

Share setup through table-driven, parameterized, property, metamorphic, generated, or conformance tests while preserving:

- stable case IDs;
- independent inputs and expected results;
- isolated mutable state;
- direct case selection;
- per-case pass/fail/skip reporting.

Do not create one permanent process launch, model load, native library, GPU initialization, or test file per example when one accurate capsule can cover them.

## Completeness

Derive coverage from invariants, partitions, boundaries, failure modes, lifecycle transitions, compatibility cases, and risk-triggered conditions—not raw test count or line coverage.

## Efficient execution

Run cheap static/unit checks first, then ownership capsules, integration, system, native/profile, and performance tiers. Reuse exact unchanged evidence only when identity and invalidation conditions still match.

## Failure loop

Freeze the first failing case, cluster failures by owner/root cause, repair coherently, rerun the smallest cluster, then the owning capsule once. Do not repeat unchanged runs for reassurance.
