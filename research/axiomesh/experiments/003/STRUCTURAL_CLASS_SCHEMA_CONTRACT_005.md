# Experiment 003 — Structural Class Schema Contract 005

**Status:** candidate authority for class definitions under Draft 0.13  
**Spec:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Discovery protocol:** `STRUCTURAL_DISCOVERY_PROTOCOL_005.md`  
**Pairwise protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_005.md`  
**Supersedes for new qualification:** `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`

## Purpose

A structural-class label names a reconstructable, selective, non-vacuous, immutable/versioned schema graph—not an ontology assertion and not a wrapper around an arbitrary instance.

Class semantics remain downstream of verified structural evidence.

---

## 1. Schema identity / namespace / revision

Every schema revision records:

```text
owning namespace
navigation/class label
immutable schema revision identity
parent/superseded revision if any
status: candidate / qualified / rejected / superseded
```

Raw numeric label equality outside the owning namespace has no semantic force.

Changing any load-bearing schema field creates a new revision. Existing witnesses remain evidence only for the exact revision they name.

A successor may claim compatibility/equivalence with an earlier revision only through an independently verified class-class witness.

---

## 2. Required schema fields

A schema revision records, where applicable:

```text
schema graph / native construction
internal object/edge/occurrence roles
structured parameter slots + slot kinds
boundary/interface ports
rigid roles
mappable roles
excluded/non-evidential labels
admissible target layers
admissible view policies
admissible relation kinds
included relation/scope/constraint signature
slot/port mapping modes + variance
positive native constraints/invariants
negative constraints / NACs / disequalities
absence/completeness assumptions
occurrence/multiplicity semantics
activation/execution assumptions if rules are involved
quantified domains/generators if quantifiers are involved
required D dependencies + exact revisions
required E/profile authority + exact revisions
recursive/fixed-point authority if applicable
specialization conditions
composition/gluing rules
residual policy
known exact/non-exact factorizations
known instance hypotheses / verified witnesses
non-vacuity/selectivity rationale
discovery/index representation if any
falsifiers
qualification-evidence references
```

Load-bearing fields are native/reconstructable or explicitly linked to qualified native dependencies. Prose is not a substitute for schema semantics.

---

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

A structured slot exposes its own interface/constraint contract.

A numeric label naming a relation/substructure does not replace mapping its structure when that structure is evidence for class membership.

Parameters may be structurally large. Size alone is neither evidence for nor against non-vacuity.

---

## 4. Ports

For every load-bearing port record:

```text
role
kind
rigidity/mappability
multiplicity/cardinality
variance/mapping mode
required incident structure
compatibility/gluing conditions
source/provenance of port declaration
```

Ports used in blind qualification are source/schema-local and frozen before instance pairing.

Internal isomorphism without a compatible port map is not compositional substitutability.

---

## 5. Parameterization discipline

For an existing schema revision, parameters/ports/constraints/residual policy/relation signature are frozen before instance scoring.

A feature may not be turned into a parameter after a failed match merely to save the class.

Changing parameterization creates a new schema revision.

For a newly induced class, parameterization requires either:

- evidence from at least two independent decomposed instances; or
- an independently specified construction law followed by held-out positive/negative tests.

The candidate class may not be used as authority to produce the decomposition cited as evidence for itself.

---

## 6. Non-vacuity / selectivity

A reusable class must impose nontrivial shared structure beyond pass-through parameter handles.

Invalid/vacuous shape:

```text
Class(X) where X is effectively the entire instance and the schema adds no reusable structural constraint
```

A non-vacuous class:

- imposes independently checkable relations/invariants among parameters/ports;
- predicts/constrains structure not supplied solely by opaque parameter handles;
- rejects meaningful held-out near misses;
- provides reusable compositional/retrieval/reasoning value beyond restating the object.

Parameter byte share or description length may be diagnostic but is not the constitutional test.

---

## 7. Membership witness

A verified instance witness contains:

```text
schema namespace/revision
instance namespace/revision
selected factorization/extraction revision
target layer
view / transformation authority / relation kind
schema node/edge/occurrence map
positive-constraint map
negative/NAC/disequality map
structured parameter assignments
port map
rigid roles preserved
quantified-domain/guard mapping if applicable
activation/execution mapping if applicable
constraints/invariants checked
residual + boundary-cut/gluing data
excluded/projected structure
factorization/extraction completeness
independent verification result
```

A direct class-label edge without this witness remains annotation/hypothesis metadata.

---

## 8. Class-class witness

Relations between schema revisions use the same witnessed discipline.

Possible relation kinds include:

```text
specializes
factors into
composes from
strongly embeds
weakly embeds
homomorphic image
simulation/bisimulation where defined
quotient/projection
definitionally equivalent
E-equivalent under profile
```

Witness records schema maps, parameter/port maps, positive/negative constraints, residuals, relation signature, target layer, and exact dependency revisions.

A class-family diagram has no authority without those witnesses.

---

## 9. Composition

A class composition requires:

```text
component schema revisions
verified component witnesses
overlap/gluing map
port identifications
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is insufficient.

Correlation/support/timing/ownership/trust/provenance constraints remain represented whenever load-bearing.

---

## 10. Alternative factorizations

A schema may have several exact/non-exact factorizations.

For each record:

```text
edge kind
semantic versus archival round-trip status
decomposition coverage
loss/residual classification
applicability guards
D/E dependency revisions
```

An opaque source backup—or a residual that merely re-encodes the undecomposed class—does not count as semantic decomposition evidence.

Do not declare one canonical factorization without convergence/uniqueness evidence.

---

## 11. Recursive/fixed-point schemas

Where a schema is recursive, record the authority needed for its denotation, including where relevant:

```text
base cases
recursive/step constructors
monotonicity/existence conditions
guardedness/productivity
well-foundedness
least/greatest/other fixed-point choice
uniqueness/admissibility evidence
```

Circular aliases alone are invalid.

---

## 12. Discovery requirement

A qualified reusable class has at least one structural candidate-generation path by which an unlabeled new instance can reach pairwise comparison.

Qualified labels may accelerate later retrieval but cannot be the only cross-domain discovery path.

Any class fingerprint/index records:

```text
index/model revision
target layer/view/relation target
normalization/factorization/extraction policy
boundary/parameter/namespace treatment
invariance/pruning guarantee if any
collision/false-negative risk
training-data/supervision provenance if learned
```

A fingerprint is retrieval metadata, not membership evidence.

---

## 13. Recognition versus induction

### Recognition
Use an already frozen schema revision to test a new instance.

### Induction
Start from independently verified structural evidence/common cores or an independently specified construction law, induce a **candidate** schema, freeze it, then test on held-out/adversarial cases.

The motivating instances alone do not qualify the induced class.

---

## 14. Promotion criteria

A candidate becomes a reusable qualified class only after:

1. exact native schema construction exists;
2. load-bearing fields in this contract are present;
3. decomposition/profile dependencies are independently qualified;
4. at least two independently sourced verified instances exist, unless an independently specified construction is held-out tested;
5. non-vacuity/selectivity passes;
6. positive and mandatory adversarial negative controls pass;
7. label-blind discovery/recall controls pass;
8. membership witnesses verify independently;
9. alternative-factorization and boundary/composition audits pass for the exercised surface;
10. held-out policy/schema generalization passes;
11. namespace/occurrence/negative-constraint semantics pass;
12. no simpler existing qualified class/factorization explains the same structure without loss.

A cross-domain class requires independent domains.

---

## 15. Multiple memberships

One object may instantiate several qualified schemas under different target layers/views/factorizations.

Preserve multiple memberships with separate witnesses.

Do not force single inheritance or one canonical class merely for organization.

---

## 16. Inferred-label provenance

An inferred membership label is derived knowledge, distinct from source vocabulary.

Record:

```text
schema revision
instance revision/factorization/extraction
target layer/view/authority
verified witness
qualification status
```

A later source/schema revision does not silently inherit the membership.

---

## 17. Current C1–C12 status

Experiment 003 labels C1–C12 / `^9101..^9112` remain candidate navigation handles in their registry namespace.

They are not yet qualified immutable schema revisions.

Existing registry mappings remain witness-pending hypotheses and are excluded from blind discovery.