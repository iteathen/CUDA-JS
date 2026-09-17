# Experiment 003 — Structural Class Registry Semantics

**Native registry:** `STRUCTURAL_CLASS_REGISTRY_003.axh`  
**Current spec:** `../../CORE_SPEC_DRAFT_0_10_CANDIDATE.md`  
**Current catalog:** `STRUCTURAL_CLASS_CATALOG_004.md`  
**Schema contract:** `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`  
**Status:** navigation/hypothesis metadata only; not current structural qualification evidence

The native registry keeps convenient labels for candidate classes and candidate source-to-class relationships. It is deliberately **not** structural-comparison evidence.

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

A mapping object has the historical Experiment 003 shape:

```text
(^9006 H KIND SOURCE CLASS)
(^9004 H ^9005)
```

Every current source-to-class mapping is witness-pending.

## Namespace rule

The numeric IDs in this registry are local to this Experiment 003 registry/theory namespace.

Raw equality such as `^9101 == ^9101` across unrelated native bundles does **not** establish that the class identities are shared unless the bundles explicitly share this namespace/dependency.

Cross-bundle comparison follows Draft 0.10 namespaced semantic identity and VS/VC mapping rules.

## Why direct class edges were removed

An earlier registry stored direct edges such as:

```text
SOURCE -> CLASS
```

Even with prose saying “candidate,” those edges could become accidental semantic evidence if loaded during class discovery.

The current form makes the assertion a separate hypothesis object with explicit unqualified status.

## Qualification boundary

The registry MUST NOT be supplied to label-blind discovery.

A mapping becomes qualified only against an immutable schema revision after `STRUCTURAL_COMPARISON_PROTOCOL_003.md` produces and independently verifies a witness containing at least:

```text
selected factorization revision
schema revision
view/transformation policy
schema mapping
structured parameter assignment
boundary/port mapping
constraints checked
common structure/residual
independent witness verification
```

Changing a schema revision does not silently preserve qualification.

## Current candidate class handles

```text
^9101  C1 universal evaluation over generated region
^9102  C2 existential evaluation over generated region
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

These are retained because stable names help agents retrieve and construct candidate objects.

They are not twelve proven independent classes. `STRUCTURAL_CLASS_CATALOG_004.md` records active factorization/family hypotheses, including the possibility that several handles are specializations or compositions of a smaller structural basis.

## Current disposition

`STRUCTURAL_CLASS_REGISTRY_003.axh` remains a historical/current navigation artifact. Do not expand it with new domain-to-class mappings until the source construction has been decomposed and inspected against the current class/factorization lattice.

Future qualified registry state should attach exact schema revisions and verified witness references rather than treating a mutable class label as the qualified semantic object.
