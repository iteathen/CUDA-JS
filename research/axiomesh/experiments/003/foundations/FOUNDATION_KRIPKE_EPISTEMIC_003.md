# Experiment 003 — Primitive Epistemic / Public-Announcement Foundation

**Status:** E1P candidate; author-side only  
**Native module:** `FOUNDATION_KRIPKE_EPISTEMIC_003.axh`  
**Dependencies:** `FOUNDATION_FORMULA_SAT_003.axh`, `FOUNDATION_FINITE_PATH_003.axh`

## Goal

Make epistemic operators transparent constructions over possible-world models rather than opaque names.

The initial Experiment 003 scaffold uses:

- `^523` as the source knowledge constructor;
- `^524` as the source common-knowledge constructor;
- `^586` as group membership.

In this foundation the first two are derived aliases. Their semantics are supplied by native structure.

## Primitive epistemic model leaves

| Symbol | Role |
|---|---|
| `^8600` | epistemic model identity marker |
| `^8601` | world belongs to model |
| `^8602` | agent belongs to model |
| `^8603` | model+agent owns an accessibility-relation identity |
| `^8500` | one-step edge of that accessibility relation, from shared path foundation |
| `^8701` | atomic valuation at model/world, from shared satisfaction foundation |
| `^586` | group membership supplied by the benchmark/model |

For each model+agent pair the accessibility-relation identity is constrained to be unique.

Accessibility edges are constrained to connect worlds in the associated model.

These are model facts. They are the primitive epistemic floor.

## Individual knowledge

The alias:

```text
(^523 agent formula)
```

is not primitive.

Its native satisfaction expansion is:

```text
Sat(M,w,K_i A)
iff
for every accessibility relation R owned by (M,i)
and every v with R(w,v),
Sat(M,v,A)
```

The actual module expresses both directions using `^8702` satisfaction and `^8500` relation edges.

No external modal evaluator is needed.

## S4/S5 profile ownership

This foundation defines generic Kripke knowledge/modal evaluation only.

S4/S5 are separate constraints on the primitive accessibility relation:

- reflexivity;
- transitivity;
- symmetry / Euclidean/equivalence conditions as required by the selected profile.

They must be represented as native relation laws. They are not inferred from the word “knowledge” or from a `^523` token.

## Common knowledge

The term:

```text
(^8604 M G)
```

constructs a group-accessibility relation identity.

Its one-step edges are defined exactly as the union of one-step accessibility edges of agents that are members of `G`.

The common-knowledge alias `^524` is then defined by universal satisfaction at every world reachable by an explicit finite path in that group relation.

The zero-edge path from the shared finite-path foundation makes the closure reflexive, so common knowledge includes the current world.

This exposes the standard reachability structure instead of assigning common knowledge its own opaque truth oracle.

## Public-announcement restriction

The generic derived announcement constructor is:

```text
(^8607 announcement_formula body_formula)
```

The updated model is a deterministic structural term:

```text
(^8605 M announcement_formula)
```

rather than a fresh opaque model identity.

Its structure is defined as:

```text
worlds:
  retain exactly worlds w of M where Sat(M,w,announcement_formula)

accessibility:
  retain the same agents
  map each old relation R to a restricted relation term
  (^8606 R M announcement_formula)
  whose edges survive only when both endpoint worlds survive

atomic valuation:
  retain old atomic truth only at surviving worlds
```

The announcement formula then satisfies:

```text
Sat(M,w,[!phi]A)
iff
Sat(M,w,phi) -> Sat(M|phi,w,A)
```

for the Plaza-style truthful public-announcement convention used by the initial foundation.

This makes the model transformation itself visible.

## Repeated announcements

Experiment 003's muddy-children scaffold contains a source-level repeated-update alias.

Draft 0.7 does not accept that alias as primitive semantics.

For concrete qualification instances, announcement depth must be frozen and the sequence must be represented as explicit nested `^8607` updates or an exactly defined native finite recursion over the update constructor.

A hidden host loop is not sufficient.

## Why this foundation is shared

The construction exposes relations that can be compared structurally with other domains:

- accessibility edges have the same primitive directed-relation shape as transition/reduction edges;
- common knowledge uses the same finite path machinery as reduction closure;
- public announcement is an explicit state/model transformation, allowing comparison with program-state transitions without pretending they obey the same laws.

## Reference semantics used for construction

The shape was checked against standard possible-world epistemic semantics and public-announcement logic:

- epistemic model `M=(W,V,{R_i})` with `K_i A` true when `A` holds at every `R_i`-accessible world;
- Plaza-style public announcement restricts the world set to `A`-satisfying worlds and restricts accessibility/valuation accordingly.

Useful external references during construction:

- Stanford Encyclopedia of Philosophy, *Epistemic Logic*;
- Stanford Encyclopedia of Philosophy, *Dynamic Semantics*;
- Stanford Encyclopedia of Philosophy, *Dynamic Epistemic Logic*, Public Announcement Logic appendix.

The native module remains the experiment authority; references are research support, not runtime semantics.

## Remaining qualification

Before FL-008/FL-009 can pass E1P/E3:

1. cold-reconstruct this foundation without the human gloss;
2. qualify shared finite-path semantics;
3. add explicit S4/S5 accessibility constraints for the chosen benchmarks;
4. freeze concrete muddy-children instances and unroll/define repeated announcements;
5. alias-erase `^523`/`^524`/announcement notation and verify the same obligations remain;
6. produce proof/countermodel objects from the expanded semantics.

## Falsifiers

Revise this foundation if:

- knowledge requires information not present in model/accessibility/valuation structure;
- path-based common knowledge fails to preserve the intended closure;
- public-announcement restriction loses a load-bearing relation/valuation distinction;
- cold agents require English names to use the construction;
- a smaller shared relational foundation represents the same semantics more directly.
