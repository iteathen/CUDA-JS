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

A LEGO is encapsulated composition, not necessarily an atomic leaf. A larger brick may recursively contain smaller internal bricks, each with a narrower coherent invariant, state machine, lifecycle, resource, failure domain, or substitution boundary. The parent remains the external semantic owner and hides its child topology; consumers must not deep-import or wire private child bricks merely because they exist.

Choose LEGO boundaries primarily by semantic/ontological ownership and lifecycle cohesion, then functional cohesion, stable dependency/substitution seams, and independently owned failure/resource behavior. File count, line count, method count, and agent context size do not create architecture. Context pressure is a diagnostic: it may reveal that one supposed brick hides several unrelated responsibilities, or it may mean a genuinely indivisible responsibility needs private helpers or a better internal representation rather than a new public boundary.

The same rule applies to very large functions. Split where independently meaningful invariants, state transitions, resources, failure domains, or reasons to change separate. Do not split merely because the function is long. A mechanically large but semantically indivisible algorithm may remain one unit while using private pure helpers, explicit phases, tables, or a private state object. A giant shared `context` passed among arbitrary helpers is not LEGO decomposition.

Stop recursive decomposition when another split would protect no independent ownership, lifecycle, substitution, failure/resource boundary, testing value, or change boundary. Avoid both monoliths and abstraction confetti.

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
