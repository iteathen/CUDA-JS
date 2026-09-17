# Experiment 003 — Structural Class Schema Contract 004

**Status:** candidate authority for class definitions under Draft 0.12  
**Spec:** `../../CORE_SPEC_DRAFT_0_12_CANDIDATE.md`  
**Discovery protocol:** `STRUCTURAL_DISCOVERY_PROTOCOL_004.md`  
**Pairwise protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`  
**Supersedes for new qualification:** informal class-schema minimum in `STRUCTURAL_CLASS_CATALOG_003.md`

## Purpose

A class label must name a reconstructable, selective, non-vacuous parameterized structural schema—not an ontology assertion and not an identity wrapper around an arbitrary instance.

## 1. Schema identity and revision

Every schema has:

```text
navigation/class label + namespace
schema revision identity
parent/superseded revision, if any
status: candidate / qualified / rejected / superseded
```

Qualification attaches to one immutable schema revision. Changing any load-bearing field creates a new revision.

## 2. Required schema fields

A schema revision records:

```text
schema graph / native construction
structural namespace(s)
internal object/edge roles
parameter slots and slot kinds
boundary/interface ports
rigid roles
mappable roles
excluded/non-evidential labels
admissible view policies
relation signature reflected by strong embeddings
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
non-vacuity/selectivity rationale
discovery/index representation, if any
falsifiers
qualification evidence references
```

Constraints must be native/reconstructable or linked to qualified native dependencies. Prose alone is not class semantics.

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

Structured slots expose their own interface/constraint contract. A numeric handle naming a relation is not a substitute for mapping its structure when that relation is class evidence.

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

## 6. Non-vacuity / selectivity

A reusable class must expose a nontrivial reusable relationship among its parameters/ports.

Invalid/vacuous pattern:

```text
Class(X) where the schema contributes no constraint beyond returning/naming X
```

Large structured parameters are allowed. They may contain most instance data when the schema still imposes shared structural relations/invariants among them.

Promotion requires:

- schema relations/invariants not supplied entirely by the fact that parameter handles exist;
- held-out near misses rejected for structural reasons;
- evidence that the schema constrains/predicts composition or structure beyond restating the instance;
- parameter-abuse controls showing the class cannot accept arbitrary objects by treating every difference as free input.

Description length/compression may be measured but does not alone determine vacuity or class quality.

## 7. Membership witness

A verified instance witness contains:

```text
schema revision
instance revision
selected factorization revision
target layer
view/authority policy
schema node/edge map
structured parameter assignments
port map
rigid roles preserved
constraints/invariants checked
relation strength
complete common/residual/boundary/excluded item partition
independent verification result
```

A class label edge without this witness remains an annotation/hypothesis.

## 8. Class-class witness

A relation between schema revisions uses the same discipline.

Possible relations include:

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

The witness includes schema maps, parameter/port maps, constraints, residuals, frozen relation signature, and exact dependency revisions.

## 9. Composition

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

## 10. Alternative factorizations

A schema may have several exact or non-exact factorizations.

Record each with:

```text
edge kind
round-trip fidelity
semantic-decomposition coverage
undecomposed residuals
loss/residual
applicability guards
D/E dependencies
```

An opaque source backup or opaque residual may preserve recoverability but does not count as decomposed semantics.

Do not declare one canonical factorization without confluence/uniqueness evidence.

## 11. Discovery requirement

A qualified reusable class must have at least one structural candidate-generation path by which an unlabeled new instance can enter comparison.

Qualified labels may accelerate retrieval, but shared labels cannot be the only discovery mechanism for cross-domain instances.

If a class defines a fingerprint/index, record its target layer/view, normalization/factorization policy, boundary treatment, namespace behavior, exact invariant guarantee if any, collision behavior, and known recall risk.

Approximate retrieval scores remain non-semantic metadata.

## 12. Promotion criteria

A candidate becomes a reusable qualified class only after:

1. at least one native schema construction exists with semantic-decomposition coverage stated;
2. all load-bearing fields in this contract are present;
3. decomposition dependencies are independently qualified;
4. at least two independently sourced verified instances exist, unless an independently specified construction law is tested on held-out instances;
5. non-vacuity/selectivity passes;
6. mandatory adversarial controls pass;
7. label-blind discovery/recall controls pass under enforceable isolation;
8. witness verification succeeds independently;
9. alternative-factorization and boundary/composition audits pass for the exercised surface;
10. policy-generalization is tested on held-out/synthetic structures;
11. structurally novel-class controls show the system can avoid snapping everything to known labels;
12. no simpler existing class/factorization explains the same structure without loss.

A cross-domain class requires independently sourced domains.

## 13. Revision rule

A qualified revision is immutable.

Semantic changes create a successor revision. Prior witnesses remain evidence only for the revision they reference.

A successor may claim compatibility with an earlier revision only through an explicit verified class-class relation.

## 14. Multiple memberships

An instance may have multiple verified class memberships under different qualified factorizations/views.

Do not force single inheritance or one canonical class. Preserve each membership and its provenance/witness independently.

## 15. Current C1–C12 status

The C1–C12 / `^9101..^9112` labels from Experiment 003 remain **candidate navigation labels** in the Experiment 003 registry namespace.

They do not yet satisfy this contract as qualified immutable schemas.

Existing mappings in `STRUCTURAL_CLASS_REGISTRY_003.axh` remain witness-pending hypotheses and are excluded from blind discovery.
