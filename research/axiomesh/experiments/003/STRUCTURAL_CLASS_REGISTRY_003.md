# Experiment 003 — Structural Class Registry Semantics

**Native registry:** `STRUCTURAL_CLASS_REGISTRY_003.axh`  
**Spec:** `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`  
**Status:** navigation/hypothesis metadata only

The native registry keeps stable labels for candidate classes and candidate source-to-class relationships. It is deliberately **not** structural-comparison evidence.

## Native relations

```text
^9000  candidate-class declaration
^9001  candidate instance-of hypothesis kind
^9002  candidate composed-of hypothesis kind
^9003  candidate specialization-of hypothesis kind
^9004  hypothesis-status attachment
^9005  unqualified / witness-pending status
^9006  class-mapping hypothesis object
```

A mapping object has the shape:

```text
(^9006 H KIND SOURCE CLASS)
(^9004 H ^9005)
```

Every current source-to-class mapping is explicitly witness-pending.

## Why direct class edges were removed

The earlier registry stored direct edges such as:

```text
SOURCE -> CLASS
```

Even with prose saying “candidate,” those edges could become accidental semantic evidence if the registry were loaded during class discovery.

The current form makes the assertion itself a separate hypothesis object with an explicit unqualified status.

## Qualification boundary

The registry MUST NOT be supplied to label-blind class/isomorphism discovery.

A mapping becomes qualified only after `STRUCTURAL_COMPARISON_PROTOCOL_003.md` produces and independently reviews a witness containing:

```text
selected factorization
schema mapping
parameter assignment
boundary/port mapping
constraints checked
common structure
residual structure
comparison projection
```

At that point the registry may attach a future qualified status and witness reference. Until then, all current mapping objects remain search/navigation hints only.

## Current class labels

```text
^9101  C1 universal satisfaction over generated region
^9102  C2 existential satisfaction over generated region
^9103  C3 immediate-successor evaluation
^9104  C4 finite path / reflexive-transitive closure
^9105  C5 predicate-selected structure restriction
^9106  C6 disjoint decomposition / recomposition
^9107  C7 transition-preservation judgment
^9108  C8 finite locally validated derivation
^9109  C9 finite indexed fold
^9110  C10 bound-body instantiation
^9111  C11 functional-graph application
^9112  C12 well-founded propagation
```

These labels are retained because stable names are useful for construction and retrieval. Draft 0.9 does not assume the twelve labels correspond to twelve independent classes; several have explicit factorization/family hypotheses in `STRUCTURAL_CLASS_CATALOG_003.md`.
