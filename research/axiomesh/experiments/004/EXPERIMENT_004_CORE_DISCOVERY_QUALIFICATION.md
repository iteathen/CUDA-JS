# AxiomeSH Experiment 004 — Core / Structural-Discovery Qualification

**Status:** frozen qualification campaign; construction in progress  
**Branch:** `experiment/axiomesh-native-reconstruction`  
**Authority:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md` + `../../CORE_SPEC_DRAFT_0_14_CANDIDATE.md`  
**Discovery protocol:** `../003/STRUCTURAL_DISCOVERY_PROTOCOL_006.md`  
**Pairwise protocol:** `../003/STRUCTURAL_COMPARISON_PROTOCOL_006.md`  
**Class-schema contract:** `../003/STRUCTURAL_CLASS_SCHEMA_CONTRACT_006.md`

## 1. Purpose

Experiment 004 stops specification expansion and attempts to falsify the current AxiomeSH core/discovery contracts directly.

The campaign is synthetic by design. Cases are chosen to remove dependence on familiar domain knowledge and expose failures in:

- identity and namespace handling;
- scope occurrence semantics;
- rewrite-event semantics;
- reference/binder hygiene;
- quantifier-domain completeness;
- factorization exactness;
- extraction independence;
- embedding/common-core accounting;
- witness multiplicity;
- negative/search discipline;
- structural indexing;
- class non-vacuity;
- native self-description;
- source ambiguity;
- novel-class induction;
- structural-only retrieval.

No new structural class or core token is introduced merely to make a case pass.

A failing case first produces a defect classification. Specification mutation is permitted only after the failure demonstrates insufficiency, ambiguity, or materially worse behavior in the current representation.

---

## 2. Frozen test inventory

The initial campaign contains exactly 20 targets.

```text
Q004-01  scope occurrence multiplicity
Q004-02  rewrite occurrence/multiset add-remove semantics
Q004-03  identical successor / distinct rewrite events
Q004-04  nested-boundary non-flattening
Q004-05  variable ownership, aliasing, repeated-variable and NAC binding
Q004-06  reference hygiene + repeated-use multiplicity
Q004-07  structural/stable-label namespace collision
Q004-08  same quantified body / different domain-generator
Q004-09  semantic D round trip versus source-copy/residual cheat
Q004-10  independent factorization/extraction freeze before pairing
Q004-11  strong versus weak embedding under frozen relation signature
Q004-12  complete common-core/residual/cut/excluded/projected accounting
Q004-13  multiple automorphism/mapping witnesses
Q004-14  certified negative versus incomplete-search no-witness
Q004-15  index/fingerprint invariant under multiple views
Q004-16  vacuous-class negative + large structured-parameter positive
Q004-17  native policy/witness/result self-representation
Q004-18  unresolved source-interpretation alternatives
Q004-19  structurally novel class induction with no registry label
Q004-20  structural-only retrieval versus label-assisted retrieval
```

Changing the meaning of a frozen case after seeing a result creates a new case revision; it does not rewrite the original evidence.

---

## 3. Qualification layers

Each case declares which of these it exercises:

```text
R0  native parse/reconstruction
R1  N0/N1 representation invariance
R2  D/extraction correctness
R3  pairwise structural relation
R4  witness/certificate verification
R5  structural-class recognition/induction
R6  corpus retrieval/discovery
```

A pass at one layer does not imply a pass at another.

---

## 4. Isolation and evidence partitions

Every cold/discovery run records accessible resources.

Resources are partitioned as:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

The blind agent/context MUST NOT have access before result freeze to:

- expected answers;
- hidden mappings;
- expected class labels;
- registry hypotheses prohibited by the protocol;
- human gloss identifying intended analogies;
- source backup/residual data explicitly excluded from semantic evidence.

A prompt saying “do not read” is insufficient if the same context already observed the material.

---

## 5. Native authority requirement

Load-bearing test policies, role declarations, witness/certificate structures, and result records must have native AxiomeSH representations for Q004-17 and for any case whose result depends on them.

Human Markdown/JSON is scorer/reviewer convenience only.

The suite therefore distinguishes:

```text
native test object / policy / witness
human audit description
hidden scorer assertion
```

---

## 6. Revision integrity

Every source object, policy, index, schema, witness, D/E dependency, and verification contract used for a qualification result records an immutable content revision.

Mutable file/class names are navigation handles only.

---

## 7. Expected-answer discipline

Expected answers live only in scorer-side assertions.

Cold prompts select targets using raw/native structure, object IDs, policy IDs, or structural predicates visible in the discovery bundle.

Prompts do not reveal:

- the expected mapping;
- expected common core;
- expected relation kind when that is what is being tested;
- expected residual partition;
- expected class identity.

After the result is frozen, scorer assertions may be opened for review.

---

## 8. Defect classification

A failed or ambiguous case is classified before any repair as one or more of:

```text
specification contradiction
specification ambiguity
native representation insufficiency
surface/serialization ambiguity
source-interpretation ambiguity
normalization-layer violation
namespace/identity defect
reference/binder hygiene defect
rewrite/event-semantics defect
factorization/extraction leakage
comparison-policy leakage
witness/accounting defect
verification defect
search/index incompleteness
class-schema vacuity/overfit
label/registry contamination
protocol/isolation failure
agent/search error
resource limit
intended behavior / bad scorer assumption
```

Repairs are evidence-driven, not convenience-driven.

---

## 9. Pass criteria by target

### Q004-01 — scope occurrence multiplicity

Two otherwise identical scopes differing only by one duplicate member occurrence must remain structurally distinguishable under the current occurrence-preserving semantics.

### Q004-02 — rewrite occurrence update

A selected LHS match removes the selected occurrences only; RHS adds its occurrences even when an isomorphic occurrence already exists, unless an explicit idempotent quotient/profile is selected.

### Q004-03 — rewrite event identity

Two distinct valid applications may yield structurally identical successor states while remaining distinct derivation/application events.

### Q004-04 — nested boundary

Scope nesting is load-bearing; flattening a nested member into its parent must not be N0/N1 equivalence.

### Q004-05 — variable ownership

Repeated variables bind consistently; distinct variables may alias by default; unowned/NAC-only variables are not guessed.

### Q004-06 — references

Reference resolution preserves identity sharing and binding hygiene while repeated reference uses preserve use-site occurrence multiplicity.

### Q004-07 — namespaces

Coincident bare IDs or `^n` labels in independent namespaces do not become shared identity. Mapped structural correspondence remains possible under the appropriate frozen view.

### Q004-08 — quantifier domain

Same binder/body with different domain/generator is not silently treated as the same quantified construction.

### Q004-09 — D round trip

An opaque source backup/residual may establish archival recoverability but does not count as semantic decomposition coverage.

### Q004-10 — independent freeze

A decomposition/extraction chosen only after seeing the peer/expected analogy is exploratory and cannot serve as blind qualification evidence.

### Q004-11 — embedding strength

Extra included target relations among mapped nodes block strong/induced embedding but may allow weak embedding with explicit residual.

### Q004-12 — common-core accounting

Every load-bearing item belongs to exactly one common/residual/cut/excluded/projected/transparent accounting role.

### Q004-13 — mapping multiplicity

Materially distinct automorphism/mapping witnesses remain separate unless an independently verified quotient proves them irrelevant.

### Q004-14 — negative discipline

Failed bounded search yields no-witness/unknown/resource-limit, not certified non-isomorphism, unless a complete search or verified separating certificate exists.

### Q004-15 — index invariant

A fingerprint mismatch prunes only under the exact view/layer/relation for which the necessary invariant was qualified.

### Q004-16 — class non-vacuity

`Class(X)=X`-style wrappers fail; large structured parameters remain admissible when a nontrivial reusable relation/invariant constrains them and rejects near misses.

### Q004-17 — native self-description

A fresh decoder can reconstruct the load-bearing comparison policy/witness/result from native structure without an authoritative human/JSON sidecar.

### Q004-18 — source ambiguity

Alternative faithful interpretations remain explicit; results are conditional rather than silently selecting the interpretation that matches best.

### Q004-19 — novel-class induction

A shared structural pattern absent from the registry may yield a `NEW_CANDIDATE_CLASS` hypothesis/common-core schema rather than being forced into C1–C12.

### Q004-20 — structural-only retrieval

A cross-domain positive hidden behind unrelated labels is surfaced by the mandatory structural-only candidate-generation path; label-assisted retrieval is measured separately.

---

## 10. Execution order

Run in dependency order rather than numeric convenience:

```text
Phase A — raw structural semantics
  Q004-01 Q004-04 Q004-05 Q004-06 Q004-07 Q004-08

Phase B — rewrite/factorization semantics
  Q004-02 Q004-03 Q004-09 Q004-10

Phase C — comparison/witness semantics
  Q004-11 Q004-12 Q004-13 Q004-14 Q004-15

Phase D — class/native-authority/discovery semantics
  Q004-16 Q004-17 Q004-18 Q004-19 Q004-20
```

A failure in a lower dependency blocks claims relying on it but does not require aborting unrelated independent cases.

---

## 11. Current execution state

```text
campaign frozen: YES
Draft 0.14 correction applied: YES
protocols 006 created: YES
case corpus construction: STARTED
hidden scorer assertions: PENDING
cold qualification runs: PENDING
independent review: PENDING
```

The next concrete artifact is the Phase A native case corpus plus hidden scorer assertions.
