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

LEGO is the outer architectural discipline. It governs semantic ownership, universality, replaceability, scope containment, damage-limiting encapsulation, and cognitive/context containment. A brick is not correctly sized if one agent cannot load and actively reason about its complete authoritative working set—public contract, implementation, invariants, lifecycle/resource/failure rules, tests/conformance, and the immediate dependency and consumer interfaces needed to understand consequences—with substantial headroom for the task, evidence, and review. Merely fitting inside a model's maximum context window is not sufficient.

A LEGO is encapsulated composition, not necessarily an atomic leaf. A larger brick may recursively contain smaller internal bricks, each with a narrower coherent invariant, state machine, lifecycle, resource, failure domain, substitution boundary, or independently changing responsibility. The parent remains the external semantic owner and hides its child topology; consumers must not deep-import or wire private child bricks merely because they exist.

Choose LEGO boundaries using both **cohesion** and **full-attention fit**. Semantic/ontological ownership and lifecycle cohesion remain strong seam signals, followed by functional cohesion, stable dependency/substitution seams, independently owned failure/resource behavior, volatility, and execution locality. Context size is also a first-class architectural constraint: when a coherent component's authoritative working set exceeds one agent's full-attention envelope, recursively decompose it at the strongest real internal seam or narrow its scope. Context pressure is not permission for arbitrary file splitting; a valid split must protect a meaningful responsibility, lifecycle, resource/failure domain, substitution/change boundary, or independently testable invariant.

The same rule applies to very large functions. Split where independently meaningful invariants, state transitions, resources, failure domains, phases, or reasons to change separate. Do not split merely because the function is long. A mechanically large but semantically indivisible algorithm may remain one external semantic unit while using private pure helpers, explicit phases, tables, private state, or private child LEGOs to keep each reasoning unit inside full attention. A giant shared `context` passed among arbitrary helpers is not LEGO decomposition.

Stop recursive decomposition when another split would protect no independent ownership, lifecycle, substitution, failure/resource boundary, testing/change value, or attention boundary without introducing duplicated truth or cross-boundary internal knowledge. Avoid both monoliths and abstraction confetti.

An entering agent should be able to determine quickly what the brick owns, what it explicitly does not own, what enters and leaves, which invariants cannot be violated, what can replace it, what failures/resources it contains, and how to prove it still works. If establishing those facts requires repository archaeology across unrelated internals, the boundary is suspect.

## SOLID

Use single responsibilities, open/closed extension points, substitutable implementations, segregated interfaces, and dependency inversion inside each brick. Do not mechanically maximize interfaces; preserve coherent ownership.

## CUPID

Prefer code and contracts that are composable, Unix-like where appropriate, predictable, idiomatic, and domain-based. Developer joy comes from trustworthy boundaries and clear failure, not from hiding necessary complexity.

## KISS

Choose the simplest design that satisfies the complete lifecycle. A design is not simple if it exports complexity to callers, synchronization, memory, migration, failure recovery, cleanup, diagnostics, tests, or future integrations.

The ordering is deliberate: **LEGO chooses and contains the boundary; SOLID structures responsibilities and dependencies inside the brick; CUPID shapes the valid implementation; KISS removes remaining unjustified complexity.** A lower layer may not defeat a higher one.

## Domain-appropriate foundations

Foundational types, units, ranges, precision, schemas, identity, and resource limits must fit the real domain and likely expansion. Never encode an accidental limit merely because the first observed case was small.

## Maximum accurate generality

Be as general as can be stated truthfully and tested. Do not hard-code the first consumer, and do not claim universality beyond supported invariants and evidence.
