# Experiment 003 — Structural Class Schema Contract 006

**Status:** frozen candidate class-schema contract for Draft 0.14 qualification  
**Spec base:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Qualification amendment:** `../../CORE_SPEC_DRAFT_0_14_CANDIDATE.md`  
**Discovery protocol:** `STRUCTURAL_DISCOVERY_PROTOCOL_006.md`  
**Pairwise protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_006.md`  
**Supersedes for new qualification:** `STRUCTURAL_CLASS_SCHEMA_CONTRACT_005.md`

## Purpose

A structural-class label names a reconstructable, selective, non-vacuous, immutable/content-bound schema graph—not an ontology assertion and not a wrapper around an arbitrary instance.

Class semantics remain downstream of verified structural evidence.

Load-bearing schema, witness, policy, and result objects must be representable natively; prose/JSON may mirror but not replace them.

---

## 1. Schema identity / namespace / immutable content revision

Every schema revision records:

```text
owning namespace
navigation/class label
immutable schema revision identity
immutable content/integrity binding
parent/superseded revision if any
status: candidate / qualified / rejected / superseded
```

Raw numeric label equality outside the owning namespace has no semantic force.

Changing any load-bearing schema field creates a new immutable revision/content identity.

Existing witnesses remain evidence only for the exact revision/content they name.

A mutable navigation label may point to a latest candidate revision but is not itself the qualified semantic object.

A successor may claim compatibility/equivalence with an earlier revision only through an independently verified class-class witness.

---

## 2. Required native schema fields

A schema revision records, where applicable:

```text
schema graph / native construction
internal object/edge/occurrence roles
structured parameter slots + slot kinds
boundary/interface ports
rigid roles
mappable roles
excluded/non-evidential labels
label provenance roles
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
fresh-allocation namespace/event assumptions if freshness is involved
required D dependencies + exact immutable revisions
required E/profile authority + exact immutable revisions
recursive/fixed-point authority if applicable
specialization conditions
composition/gluing rules
residual/cut/excluded/projected accounting policy
known exact/non-exact factorizations
known instance hypotheses / verified witnesses
source-interpretation conditions if applicable
non-vacuity/selectivity rationale
discovery/index representation if any
falsifiers
qualification-evidence references
```

Load-bearing fields are native/reconstructable or explicitly linked to qualified native dependencies.

Human prose is not a substitute for schema semantics.

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

## 4. Ports and namespace behavior

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
namespace/import/export behavior
```

Ports used in blind qualification are source/schema-local and frozen before instance pairing.

Internal isomorphism without a compatible port map is not compositional substitutability.

Nested scopes inherit the enclosing structural identity namespace unless an explicit local namespace is declared. A class schema may not infer a local/global identity merge from numeral spelling.

---

## 5. Parameterization discipline

For an existing schema revision, parameters/ports/constraints/residual policy/relation signature are frozen before instance scoring.

A feature may not be turned into a parameter after a failed match merely to save the class.

Changing parameterization creates a new immutable schema revision.

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

## 7. Native membership witness

A verified instance witness is a native first-class object containing:

```text
witness namespace + immutable revision/content binding
schema namespace/revision/content binding
instance namespace/revision/content binding
selected source interpretation if conditional
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
fresh-allocation namespace/event mapping if applicable
constraints/invariants checked
residual + boundary-cut/gluing data
excluded/projected structure
factorization/extraction completeness
independent structural verification result
```

A class-label edge without this witness remains annotation/hypothesis metadata.

---

## 8. Class-class witness

Relations between schema revisions use the same native witnessed discipline.

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

Witness records exact immutable schema revisions, schema maps, parameter/port maps, positive/negative constraints, residuals, relation signature, target layer, and exact dependency revisions.

A class-family diagram has no authority without those witnesses.

---

## 9. Composition

A class composition requires:

```text
component immutable schema revisions
verified component witnesses
overlap/gluing map
port identifications
namespace/import/export handling
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is insufficient.

Correlation/support/timing/ownership/trust/provenance constraints remain represented whenever load-bearing.

Locally fresh identities from independent namespaces may be hygienically alpha-renamed during qualified composition; accidental numeral equality never merges them.

---

## 10. Alternative factorizations

A schema may have several exact/non-exact factorizations.

For each record:

```text
edge kind
immutable transform/dependency revisions
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

## 12. Mandatory structural-only discovery path

A qualified reusable class MUST have at least one candidate-generation path by which an unlabeled new instance can reach pairwise comparison using only discovery-visible native structural evidence plus qualified structural transformations/indexes.

Qualified labels may accelerate later retrieval but cannot replace the structural-only path for AxiomeSH representation qualification.

Any class fingerprint/index records:

```text
index/model immutable revision/content binding
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
Use an already frozen immutable schema revision to test a new instance.

### Induction
Start from independently verified structural evidence/common cores or an independently specified construction law, induce a **candidate** schema, freeze an immutable revision, then test on held-out/adversarial cases.

The motivating instances alone do not qualify the induced class.

Source ambiguity remains explicit: a class membership conditional on one source interpretation is not silently promoted to all interpretations.

---

## 14. Promotion criteria

A candidate becomes a reusable qualified class only after:

1. exact native schema construction exists;
2. schema/policy/witness/result authority is native/reconstructable;
3. immutable content-bound revision identity exists;
4. load-bearing fields in this contract are present;
5. decomposition/profile dependencies are independently qualified;
6. at least two independently sourced verified instances exist, unless an independently specified construction is held-out tested;
7. non-vacuity/selectivity passes;
8. positive and mandatory adversarial negative controls pass;
9. mandatory structural-only discovery/recall controls pass;
10. membership witnesses verify structurally and independently;
11. alternative-factorization and boundary/composition audits pass for the exercised surface;
12. held-out policy/schema generalization passes;
13. namespace/occurrence/negative-constraint/fresh-allocation semantics pass when applicable;
14. source-ambiguity conditions are preserved;
15. no simpler existing qualified class/factorization explains the same structure without loss.

A cross-domain class requires independent domains.

---

## 15. Multiple memberships

One object may instantiate several qualified schemas under different target layers/views/factorizations/interpretations.

Preserve multiple memberships with separate witnesses.

Do not force single inheritance or one canonical class merely for organization.

---

## 16. Label provenance

Every label attachment has a native/reconstructable provenance role distinguishing at least:

```text
source-supplied label
inferred structural-class label
retrieval alias
human gloss
```

An inferred membership label is derived knowledge and records:

```text
immutable schema revision/content binding
instance immutable revision/factorization/extraction
target layer/view/authority
verified witness
qualification status
```

A later source/schema revision does not silently inherit the membership.

A later agent must not treat inferred classification as source authority.

---

## 17. Current C1–C12 status

Experiment 003 labels C1–C12 / `^9101..^9112` remain candidate navigation handles in their registry namespace.

They are not yet qualified immutable schema revisions.

Existing registry mappings remain witness-pending hypotheses and are excluded from blind discovery.

Draft 0.14 freezes addition of new structural classes until the focused synthetic qualification suite demonstrates a need.
