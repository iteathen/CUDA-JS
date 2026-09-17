# Experiment 003 — Structural Class Schema Contract 004

**Status:** candidate authority for class definitions under Draft 0.10  
**Spec:** `../../CORE_SPEC_DRAFT_0_10_CANDIDATE.md`  
**Supersedes for new qualification:** informal class-schema minimum in `STRUCTURAL_CLASS_CATALOG_003.md`

## Purpose

A class label must name a reconstructable parameterized structural schema, not an ontology assertion. This contract defines the minimum object required before a candidate class can be independently qualified.

## 1. Schema identity and revision

Every schema has:

```text
navigation/class label
schema revision identity
parent/superseded revision, if any
status: candidate / qualified / rejected / superseded
```

The navigation label may remain stable across research revisions. Qualification attaches to one immutable schema revision.

Changing any load-bearing field creates a new revision.

## 2. Required schema fields

A schema revision records:

```text
schema graph / native construction
internal object/edge roles
parameter slots and slot kinds
boundary/interface ports
rigid roles
mappable roles
excluded/non-evidential labels
admissible view policies
slot/port mapping modes and variance
native constraints/invariants
required D dependencies + exact revisions
required E/profile authority + exact revisions, if any
specialization conditions
composition/gluing rules
residual policy
comparison target layer
known exact/partial factorizations
known instances as hypotheses or verified witnesses
falsifiers
qualification evidence references
```

Constraints must be native/reconstructable or explicitly linked to qualified native dependencies. Prose alone is not class semantics.

## 3. Parameter slot kinds

A slot may be:

```text
identity
literal
relation
predicate/formula
rule/profile
substructure
boundary/port
```

Structured slots expose their own interface/constraint contract. A numeric handle naming a relation is not a substitute for mapping the relation structure when that relation is part of the class evidence.

## 4. Ports

Ports are the class interface to surrounding structure.

For each port record:

```text
role
kind
rigidity/mappability
multiplicity/cardinality if load-bearing
variance/mapping mode
required incident structure
compatibility/gluing conditions
```

Internal isomorphism without compatible port mapping is not compositional substitutability.

## 5. Parameterization discipline

For an existing schema revision, parameters are frozen before instance scoring.

A differing feature may not be converted into a parameter after seeing a failed match.

Adding/removing/changing a parameter produces a new schema revision.

For a newly discovered reusable class, parameterization requires either:

- evidence from at least two independent decomposed instances; or
- an independently specified construction law followed by held-out positive/negative tests.

## 6. Membership witness

A verified instance witness contains:

```text
schema revision
instance revision
selected factorization revision
view/authority policy
schema node/edge map
structured parameter assignments
port map
rigid roles preserved
constraints/invariants checked
relation strength: exact / strong embedding / weak embedding / specialization / ...
residual
independent verification result
```

A class label edge without this witness remains an annotation/hypothesis.

## 7. Class-class witness

A relation between schema revisions uses the same discipline.

Possible class-class relations include:

```text
specializes
factors into
composes from
strongly embeds
weakly embeds
homomorphic image
quotient/projection
definitionally equivalent
E-equivalent under profile
```

The witness includes schema maps, parameter/port maps, constraints, residuals, and exact dependency revisions.

## 8. Composition

A composition requires:

```text
component schema revisions
verified component witnesses
overlap/gluing map
port identifications
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is not proof of valid composition.

## 9. Alternative factorizations

A schema may have several exact or non-exact factorizations.

Record each as a node/edge in a factorization graph with:

```text
edge kind
round-trip status
loss/residual
applicability guards
D/E dependencies
```

Do not declare one canonical factorization without confluence/uniqueness evidence.

## 10. Promotion criteria

A candidate becomes a reusable qualified class only after:

1. at least one exact native schema construction exists;
2. all load-bearing fields in this contract are present;
3. decomposition dependencies are independently qualified;
4. at least two independently sourced verified instances exist, unless an independently specified construction law is tested on held-out instances;
5. mandatory adversarial controls pass;
6. label-blind discovery succeeds;
7. witness verification succeeds independently;
8. alternative-factorization and boundary/composition audits pass for the exercised surface;
9. no simpler existing class/factorization explains the same structure without loss.

A cross-domain class requires independently sourced domains.

## 11. Revision rule

A qualified revision is immutable.

Semantic changes create a successor revision. Prior witnesses remain evidence only for the revision they reference.

A successor may claim compatibility with an earlier revision only through an explicit verified class-class relation.

## 12. Current C1–C12 status

The C1–C12 / `^9101..^9112` labels from Experiment 003 remain **candidate navigation labels**.

They do not yet satisfy this contract as qualified immutable schemas.

Existing mappings in `STRUCTURAL_CLASS_REGISTRY_003.axh` remain witness-pending hypotheses and are excluded from blind discovery.
