# AxiomeSH Core Specification — Draft 0.14 Candidate

**Status:** frozen qualification amendment produced from the final-pass review of Draft 0.13  
**Base authority:** `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Form:** normative amendment; Draft 0.13 remains in force except where this document tightens it  
**Promotion:** experimental-branch authority only until independently qualified  
**Freeze rule:** no new domain operator, structural class, or irreducible primitive is to be added before the focused synthetic qualification suite is exercised unless a test itself demonstrates an expressiveness defect

Draft 0.14 adds **no new logical operator and no new structural class**.

It closes the remaining authority/self-containment gaps found after the line-by-line review through Draft 0.13 and then freezes specification growth so the current representation can be falsified rather than extended speculatively.

The governing sequence remains:

```text
source evidence / interpretations
-> independently qualified factorization and extraction sets
-> representation-only normalization
-> label-blind structural candidate retrieval
-> frozen native comparison policy
-> structural search
-> native candidate witness / certificate
-> structural verification
-> witnessed relation / common core / residual result
-> class recognition or new-class hypothesis
-> retained labels with provenance
```

---

## 1. Authority and scope

For new Draft 0.14 qualification artifacts, read:

1. `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`;
2. this amendment.

If the documents disagree on a subject explicitly amended below, Draft 0.14 governs that subject.

Historical artifacts retain the semantics under which they were produced and require an explicit current-semantics bridge or rerender before they count as Draft 0.14 structural qualification evidence.

Draft 0.14 is intentionally a **qualification freeze**, not another feature expansion.

---

## 2. A structural-only candidate-generation path is mandatory

Draft 0.13 allowed a label-blind structural path **or** an independently demonstrated hidden-label recall guarantee.

For qualification of the AxiomeSH **representation hypothesis**, that alternative is too weak.

A general representation/discovery qualification MUST include at least one candidate-generation path whose available inputs are limited to:

- discovery-visible native AxiomeSH structure;
- qualified N0/N1 normalization;
- qualified structural D factorizations/extractions allowed by the frozen policy;
- structural indexes/fingerprints whose inputs and invariance claims are themselves native/qualified;
- resource/search policy.

It MUST NOT require as semantic authority:

- source-domain names;
- human gloss;
- existing class labels for the unknown instance;
- registry mappings;
- expected analogies;
- scorer answers.

Label-assisted, class-assisted, and learned semantic retrieval MAY run in parallel as acceleration channels and SHOULD be measured separately.

A learned structural retriever may participate in the structural-only path only when training/supervision contamination is controlled through genuinely novel/synthetic held-out structures and the retriever does not require source/class labels to establish its retrieval semantics.

The qualification question is therefore not merely:

```text
can some retrieval system find the pair?
```

but also:

```text
can native structural evidence itself make the pair discoverable?
```

---

## 3. Load-bearing policies, schemas, witnesses, and results are native first-class structure

No load-bearing isomorphism/discovery semantics may live only in an English, JSON, database, host-language, or evaluator sidecar.

For qualification, the following must be representable as ordinary native AxiomeSH structure or as explicitly included qualified native dependencies:

```text
comparison policy
role / namespace declaration
factorization / extraction edge
structural index declaration
mapping / correspondence witness
common-core / residual accounting witness
negative / separating certificate
optimality certificate when claimed
class schema revision
class-membership witness
class-class witness
discovery result record
verification result record
```

Human-readable reports MAY mirror these objects for review.

Those reports are non-authoritative when they contain information not reconstructable from the native object/dependency bundle.

This requirement does **not** introduce new core syntax. Policies, witnesses, schemas, certificates, and result records are higher-order native structures over the same substrate.

### 3.1 Native self-description burden

A native comparison object must expose enough structure to recover all load-bearing choices, including as applicable:

```text
target layer
included/excluded relation signature
view policy
rigid/mappable/parameterized roles
ports/boundaries
N0/N1 rules
allowed D/E authorities and exact revisions
factorization/extraction bounds
relation kinds sought
objective / optimization criterion
resource budget
```

A structural witness likewise exposes its mapping/correspondence and every checked obligation rather than only asserting `MATCH` or a class label.

---

## 4. Source ambiguity is represented, not silently resolved

`source semantics` is not assumed to be uniquely determined when the source is ambiguous, incomplete, inconsistent, or genuinely admits several faithful readings.

An unresolved source may therefore carry a native/source-fidelity interpretation set:

```text
source object
+ interpretation/formalization alternatives
+ provenance/evidence for each alternative
+ constraints shared by all alternatives
+ distinctions on which alternatives disagree
+ status: resolved / unresolved / conditional
```

A comparison or proof result that depends on one alternative is conditional on that alternative unless source authority later resolves the ambiguity.

Qualification MUST NOT silently pick the source interpretation that creates the cleanest class match.

Source fidelity means preserving ambiguity when ambiguity is present; it does not mean inventing one exact meaning for an under-specified source.

---

## 5. Qualified revision identities are immutably content-bound

A qualified schema/profile/policy/index/source/factorization rule/verification contract revision MUST resolve to exact immutable content.

Acceptable authority may include, for example:

- content digest bound to the native artifact;
- immutable repository/blob/object revision;
- another equivalent integrity binding represented by the artifact authority.

A mutable navigation label MAY point to a current/latest revision, but a witness or qualification result pins the immutable revision it actually used.

Therefore:

```text
same navigation label
!=
same qualified semantic revision
```

unless the immutable content identity also matches or an explicit successor/equivalence witness relates the revisions.

Old witnesses do not silently qualify changed content.

---

## 6. Structural-identity namespace inheritance

Draft 0.13 names structural identities by owning namespace. Draft 0.14 makes nested inheritance explicit.

### 6.1 Default nested behavior

A nested scope inherits its enclosing structural identity namespace by default.

Thus when an inner and outer structure use the same bare structural identity under one inherited namespace, they intentionally refer to the same object.

This preserves natural boundary sharing from the original scoped-structure model.

### 6.2 Explicit local namespaces

If a nested construct introduces a distinct local structural namespace, that fact MUST be explicit/recoverable.

Any relationship between local and enclosing identities requires a hygienic import/export/port/renaming bridge.

### 6.3 Independent top-level documents

Independent top-level documents/bundles do not share structural identity merely because bare numeral spellings match.

Cross-document identity continuity requires explicit shared namespace, import/export mapping, port relation, or qualified partition witness.

---

## 7. Fresh allocation has a minimum structural contract

Draft 0.13 correctly rejects implicit RHS-only freshness but leaves the allocation mechanism profile-owned.

Any native fresh-allocation construction used in qualified work MUST expose at least:

```text
allocation namespace
pre-application occupied-identity set / membership authority
fresh result identity
constraint: result was not occupied in that namespace before the event
allocation/application event identity when concurrent or independent allocations are load-bearing
```

The result may be represented with whatever lower native construction the profile qualifies; no dedicated `fresh` core token is introduced here.

### 7.1 Independent allocations

Two allocations in independent namespaces may serialize with the same local numeral and remain distinct.

When independently generated structures are later composed/imported, local fresh identities MAY be capture-avoidably alpha-renamed under an explicit hygienic namespace bridge.

### 7.2 Same-namespace concurrency

If two allocation events operate in one namespace and simultaneity/order is load-bearing, the profile must represent enough event/occupancy structure to prevent both from satisfying freshness by accidentally selecting the same identity.

---

## 8. Witness verification is structural obligation checking

Independent verification is not merely a second agent agreeing with the first.

A verifier validates explicit local obligations induced by the frozen policy and claimed relation.

Where feasible, those checks SHOULD be deterministic/mechanical over native structure.

For an isomorphism/common-core/class-membership witness, verification includes as applicable:

```text
revision/content bindings
namespace ownership
mapping domain/codomain
bijection/injection/relation-kind conditions
ordered-incidence preservation/reflection
scope and occurrence preservation
binding ownership / capture conditions
positive constraints
negative constraints / NACs / disequalities
quantifier domains / guards
port/boundary compatibility
parameter assignments
residual/cut/excluded/projected item accounting
D/E dependency applicability
factorization/extraction provenance
search/optimality/negative-certificate obligations
```

An agent may execute these checks, but qualification rests on the represented obligations and their satisfaction, not on the verifier's unsupported conclusion.

---

## 9. Label attachment has native provenance roles

Source labels and inferred labels are different semantic/provenance roles and MUST be recoverable as such.

A label attachment records a native role equivalent to categories such as:

```text
SOURCE_SUPPLIED
INFERRED_STRUCTURAL_CLASS
RETRIEVAL_ALIAS
HUMAN_GLOSS
```

The names above are explanatory only; native payloads may use stable IDs.

An inferred structural-class label additionally records:

```text
schema revision
instance/factorization revision
target layer
view/authority policy
verified witness reference
qualification status
```

A later agent MUST NOT silently promote an inferred membership into a source-supplied fact.

Human gloss remains non-authoritative for load-bearing formal structure.

---

## 10. Common-core evidence decomposition is complete

Draft 0.13's `A = glue(C, Delta_A, cut_A)` shorthand is tightened so excluded/projected material cannot disappear from the evidence record.

For each source, the comparison evidence partitions every load-bearing item under the applicable accounting universe into exactly one role such as:

```text
mapped common structure
source-only residual
boundary-cut incidence
explicitly excluded-by-view source structure
explicit projection/quotient loss
transparent serialization-only material
```

The full source reconstruction contract is therefore conceptually:

```text
A = reconstruct(C, residual_A, cut_A, excluded_A, projected_A, transparent_A)
B = reconstruct(C, residual_B, cut_B, excluded_B, projected_B, transparent_B)
```

where only truly serialization-transparent material may disappear under N0 without semantic accounting.

A reconstruction **under the frozen comparison view** may omit dimensions explicitly excluded by that view, but the evidence record still preserves their existence and exclusion reason.

Projected/collapsed information is never relabeled as ordinary residual merely to strengthen the common-core claim.

---

## 11. Specification-growth freeze

After this amendment, specification growth pauses for falsification.

Until the focused synthetic qualification suite is run:

- do not add a new structural class merely because another named domain object appears;
- do not add another core token merely because a test is awkward;
- do not introduce a new comparison relation kind merely to make a failing case pass;
- do not repair a failing case by post-hoc parameterization or view changes.

A test may justify a spec change only when the failure is classified and evidence shows an existing representation rule is insufficient, ambiguous, or materially worse than a proposed correction.

The immediate objective is now:

```text
falsify Draft 0.13 + 0.14
before expanding it
```

---

## 12. Focused qualification targets

The first frozen synthetic suite MUST include at least the following cases:

1. scope occurrence multiplicity;
2. rewrite occurrence/multiset addition and removal;
3. identical successor state produced by distinct rewrite events;
4. nested-boundary non-flattening;
5. variable ownership, legal aliasing, and NAC binding;
6. reference hygiene and repeated-use occurrence multiplicity;
7. structural-ID and stable-label namespace collisions;
8. identical quantified body with different domains/generators;
9. exact semantic D round trip versus opaque-source/residual cheating;
10. independent factorization/extraction freeze before pairing;
11. strong versus weak embedding under a frozen relation signature;
12. complete common-core/residual/cut/excluded/projected accounting;
13. multiple automorphism/mapping witnesses;
14. certified negative versus incomplete-search no-witness;
15. fingerprint/invariant pruning under multiple views;
16. vacuous-class negative and large structured-parameter positive;
17. native self-representation of policy/witness/result structures;
18. unresolved source-interpretation alternatives;
19. structurally novel candidate-class induction with no registry label;
20. structural-only retrieval versus label-assisted retrieval.

Expected answers and scorer mappings are withheld from blind discovery/verification stages.

No new structural class is to be promoted from these cases until its class/schema promotion burden is independently met.

---

## 13. New qualification gates

Draft 0.14 tightens the existing gate set with the following explicit checks.

### E1NR — native-record authority audit

Verify that every load-bearing policy/schema/witness/certificate/result used by qualification is native/reconstructable rather than sidecar-authoritative.

### E1AMB — source-ambiguity audit

Verify unresolved source interpretations remain explicit and results are conditional on selected interpretations rather than silently repaired.

### E1REV — immutable-revision audit

Verify every qualified dependency/witness pins immutable content identity.

### E1FR — fresh-allocation namespace audit

Verify freshness is relative to an explicit allocation namespace/occupancy state and concurrent/independent allocations cannot collide silently.

These join the existing Draft 0.13 qualification gates and block dependent claims where applicable.

---

## 14. Falsifiers

Revise Draft 0.14 if controlled evidence shows that any added restriction is unnecessary or harmful without preventing a real false/missed correspondence, including:

- mandatory structural-only candidate retrieval for representation qualification;
- native first-class policy/witness authority;
- explicit source-ambiguity alternatives;
- immutable revision/content binding;
- nested namespace inheritance;
- minimum fresh-allocation contract;
- structural obligation-based verification;
- label-provenance roles;
- complete excluded/projected common-core accounting.

A simpler mechanism is preferred whenever it preserves the same correctness and discovery safety.

Until qualification evidence says otherwise, the frozen discipline is:

```text
structure must be able to find structure
policies and witnesses are native structure too
ambiguity stays ambiguous
revisions are immutable evidence
freshness is namespace-relative
verification checks obligations
labels keep provenance
nothing disappears from the common-core accounting
and specification growth stops until tests force it
```
