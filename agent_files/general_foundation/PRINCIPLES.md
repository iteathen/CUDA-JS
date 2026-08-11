# Engineering Principles

## Hierarchy

```text
truth and accepted authority
  → purpose, bounds, tolerances, and value ordering
  → domain-appropriate foundations
  → LEGO boundaries
  → SOLID internals
  → CUPID composability and clarity
  → KISS implementation
  → exact evidence, integration, cleanup, and evolution
```

A lower principle cannot excuse violating a higher one.

## LEGO

Treat system and component boundaries as replaceable bricks with explicit contracts, injected dependencies, stable identities, and no hidden assumptions. A brick owns its full lifecycle and can be tested independently through its public surface.

## SOLID

Use single responsibilities, open/closed extension points, substitutable implementations, segregated interfaces, and dependency inversion inside each brick. Do not mechanically maximize interfaces; preserve coherent ownership.

## CUPID

Prefer code and contracts that are composable, Unix-like where appropriate, predictable, idiomatic, and domain-based. Developer joy comes from trustworthy boundaries and clear failure, not from hiding necessary complexity.

## KISS

Choose the simplest design that satisfies the complete lifecycle. A design is not simple if it exports complexity to callers, synchronization, memory, migration, failure recovery, cleanup, diagnostics, tests, or future integrations.

## Domain-appropriate foundations

Foundational types, units, ranges, precision, schemas, identity, and resource limits must fit the real domain and likely expansion. Never encode an accidental limit merely because the first observed case was small.

## Maximum accurate generality

Be as general as can be stated truthfully and tested. Do not hard-code the first consumer, and do not claim universality beyond supported invariants and evidence.
