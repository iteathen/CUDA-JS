# Experiment 003 — Structural Comparison Protocol 006

**Status:** frozen candidate pairwise qualification protocol for Draft 0.14  
**Spec base:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Qualification amendment:** `../../CORE_SPEC_DRAFT_0_14_CANDIDATE.md`  
**Supersedes for new qualification:** `STRUCTURAL_COMPARISON_PROTOCOL_005.md`

## Purpose

Establish structural relations without allowing labels, namespaces, factorization choice, extraction choice, adaptive policy, incomplete search, hidden scorer knowledge, source-interpretation choice, or sidecar-only comparison rules to decide the result.

Pairwise comparison begins only after source-side interpretation/factorization/extraction/roles/ports have been independently frozen.

Load-bearing policies, witnesses, certificates, and result records are native first-class structures or explicitly included qualified native dependencies.

---

## 1. Freeze comparison policy natively

Before expected mappings/results are available, freeze an immutable native comparison-policy object containing:

```text
policy namespace + immutable revision/content binding
target layer
view policy
included/excluded relation signature/dimensions
source-local role-assignment rules
source interpretation/fidelity alternatives admitted
N0/N1 rules
allowed D factorizations/dependencies + immutable revisions
allowed E equivalences/dependencies + immutable revisions
factorization/extraction search bounds
relation kinds sought
common-core objective/partial order if any
resource budget
```

Pair-specific exploratory hypotheses are permitted only when explicitly labeled as such and are not blind-discovery evidence.

The native policy record is semantic authority. Markdown/JSON descriptions may mirror it only.

---

## 2. Inputs

A blind run receives:

```text
source A + immutable revision/content binding
source B + immutable revision/content binding
selected or unresolved source-interpretation/fidelity alternatives
independently frozen factorization/extraction set A
independently frozen factorization/extraction set B
source-local structural namespaces
source-local stable-label namespaces
source-local comparison roles
source-local ports/boundaries
frozen native comparison policy
```

It does not receive:

- expected class/domain mapping;
- source-to-class registry hypotheses;
- human analogy text/gloss intended only for review;
- expected node/edge maps;
- expected common core/residuals;
- scorer certificates;
- peer-conditioned source interpretation/decomposition/extraction.

If source ambiguity is unresolved, the run is conditional on the interpretation pair being compared and the result records that condition.

---

## 3. Validate source-side preparation

Before pairwise search, check structurally:

- semantic revision/profile content-bound and pinned;
- structural namespace inheritance/resolution valid;
- stable-label namespaces resolvable;
- reference resolution hygienic;
- variable ownership reconstructable;
- occurrence multiplicity preserved;
- quantifier domain/generator present where required;
- source interpretation/fidelity alternative explicit where unresolved;
- ports/roles frozen independently;
- D edges qualified and correctly typed exact/refinement/projection/etc.;
- D round-trip and decomposition-coverage status recorded;
- E dependencies qualified with assumptions/side conditions;
- factorization/extraction completeness status recorded.

An invalid source preparation produces `UNKNOWN`/protocol failure rather than silently repairing the object during comparison.

---

## 4. N0

Apply only serialization-transparent operations permitted by Draft 0.13/0.14:

- whitespace/presentation normalization;
- hygienic structure-preserving reference resolution;
- deterministic unordered-member presentation;
- qualified transparent bundle partition normalization.

Reference resolution preserves structural identities, namespace inheritance, and lexical ownership while repeated reference use preserves occurrence multiplicity without granting occurrence identity to the reference handle.

No D/E/class/peer-object operation is N0.

---

## 5. N1

Using only frozen source-local role policy, alpha-normalize:

- local structural-ID numbering;
- bound-variable numbering;
- unordered-member presentation.

Preserve:

- ordered incidence;
- structural namespaces and inherited identity continuity;
- scope nesting;
- occurrence multiplicity;
- binding ownership;
- namespace-qualified stable labels;
- exact literals;
- positive and negative constraints;
- rule/formula kind and direction;
- ports;
- quantified domains/generators;
- activation/execution constraints;
- fresh-allocation namespace/event constraints where present;
- source/model constraints.

A deterministic canonical graph label is a representation aid, not proof of unique mapping. Automorphisms/materially distinct witnesses remain recoverable.

---

## 6. Label-blind comparison view

Consistently anonymize/map non-evidential label identities under the frozen view while preserving their incidence/role/provenance structure.

Do not delete relation/head nodes merely because their human name is non-evidential.

Rigid labels/literals remain rigid unless the frozen VS/VC policy explicitly permits mapping/parameterization.

Source-supplied labels and inferred structural-class labels remain distinct native provenance roles.

Record the anonymization/randomization map for reproducibility.

---

## 7. View semantics

### V0 — closed structural
Local alpha identities may bijectively rename; namespace-qualified stable labels/literals are rigid.

### VB — boundary/port
V0 plus witnessed mapping of independently frozen ports preserving roles/constraints.

### VS — signature-mappable
Selected stable labels may map. Record map injectivity/surjectivity/bijectivity. `ISOMORPHISM` requires a bijective relevant label map.

### VC — class-schema
A specific immutable content-bound schema revision supplies structured parameter slots, ports, rigid/mappable roles, relation signature, allowed abstractions, and residual policy. No slot/port is invented after scoring begins.

---

## 8. Relation kinds

Search/report one or more of:

```text
ISOMORPHISM
STRONG_EMBEDDING
WEAK_EMBEDDING
SPECIALIZATION
HOMOMORPHISM
SIMULATION
BISIMULATION
QUOTIENT_OR_PROJECTION
COMMON_CORE
CERTIFIED_NON_ISOMORPHIC
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

Definitions follow Draft 0.13.

Strong/induced relations reflect **all frozen included relation/scope/constraint kinds** among mapped objects. The relation signature may not be narrowed after seeing an inconvenient extra relation.

---

## 9. Structural search

For each allowed materially distinct source-interpretation/factorization/extraction pair:

1. search under the frozen view and relation signature;
2. preserve positive/negative constraints, multiplicity, ports, guards, domains, namespaces, and fresh-allocation constraints;
3. do not alter parameter/mappability rules to improve the result;
4. keep extraction/projection loss explicit;
5. record algorithm immutable revision, soundness/completeness/heuristic status, random seed if applicable, and resource bounds.

Heuristics may propose candidate maps. They cannot certify the final relation.

---

## 10. Native candidate witness

A positive/partial candidate witness is a native first-class object and records at least:

```text
witness namespace + immutable revision/content binding
A/B immutable revisions + interpretation/factorization/extraction ids
target layer
view + frozen relation signature
N0/N1 policy
D/E authorities + immutable revisions
relation kind
node/object correspondence
edge/incidence correspondence
binding mapping
positive-constraint mapping
negative/NAC/disequality mapping
port/boundary mapping
stable-label mapping if any
structured parameter mapping if any
rigid identities/literals held fixed
constraints/invariants checked
common core(s)
A/B residuals
A/B boundary-cut/gluing data
excluded-by-view items
projected/collapsed items
transparent serialization-only items
factorization/extraction completeness
search budget/completeness
optimality status
```

A candidate witness is not qualification evidence until independently verified structurally.

---

## 11. Complete item-accounting invariant

For `COMMON_CORE`/partial results, every load-bearing compared/source-retained item is classified exactly once as:

```text
mapped common structure
A-only residual
B-only residual
A boundary-cut incidence
B boundary-cut incidence
A excluded-by-view source structure
B excluded-by-view source structure
A explicitly projected/collapsed structure
B explicitly projected/collapsed structure
transparent serialization-only material
```

The accounting includes member occurrences, edges, negative constraints, guards, ports, quantifier/domain constraints, activation/execution constraints, namespace/freshness constraints, and provenance roles when included in the view.

Full-source reconstruction evidence is conceptually:

```text
A = reconstruct(C, residual_A, cut_A, excluded_A, projected_A, transparent_A)
B = reconstruct(C, residual_B, cut_B, excluded_B, projected_B, transparent_B)
```

A view-relative reconstruction may omit only dimensions explicitly excluded by the frozen view, while the evidence record still preserves their existence/exclusion reason.

---

## 12. Independent structural verification

A fresh verifier receives only:

```text
frozen source/factorization/extraction objects
frozen native comparison policy
native candidate witness/certificate
qualified dependencies needed to interpret those objects
```

It does not receive expected class/domain answers.

Verification is defined as checking explicit local structural obligations, not as a second unsupported opinion.

Verifier checks, as applicable:

```text
immutable revision/content bindings
source interpretation conditions
namespace ownership/inheritance
mapping domain/codomain
bijection/injection/relation-kind conditions
ordered incidence preservation/reflection
scope and occurrence preservation
binding ownership/capture conditions
positive constraints
negative/NAC/disequality constraints
strong/weak reflection obligations
port/parameter rules
quantifier domains/guards
fresh-allocation namespace/event constraints
absence/completeness assumptions
residual/cut/gluing/excluded/projected accounting
projection loss disclosure
D/E applicability and dependency revisions
factorization/extraction provenance
claimed optimality/negative certificate
```

Where feasible these checks SHOULD be deterministic/mechanical over the native structure.

An agent may execute the checker, but qualification rests on the represented obligations and their satisfaction.

Only verified witnesses/certificates become evidence.

---

## 13. Negative result discipline

No witness under incomplete/bounded search yields:

```text
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

`CERTIFIED_NON_ISOMORPHIC` requires either:

- complete search for the frozen finite comparison problem; or
- an independently verified native separating certificate/invariant.

Fingerprint mismatch is such a certificate only when the fingerprint is independently qualified as a necessary invariant for the exact frozen layer/view/relation target.

---

## 14. Common-core optimality

A **maximum** claim requires an explicit frozen measure/partial order plus complete-search or native optimality certificate.

Otherwise report maximal/non-dominated cores found, together with search bounds/completeness.

Common-core result states whether the mapping is strong/induced or weak.

---

## 15. Multiple mappings / automorphisms

Preserve distinct verified mappings by default, especially when they differ in ports, residuals, parameters, or downstream composition.

Canonical graph labeling does not collapse witness multiplicity.

Collapse mappings only through an independently verified automorphism/equivalence proving the distinction irrelevant to the requested downstream task.

---

## 16. Class-membership use

Class recognition occurs after structural evidence.

A native membership witness names:

```text
immutable content-bound schema revision
instance immutable revision/factorization
source/inferred label provenance roles
target layer/view/relation kind
schema positive/negative maps
structured parameter assignment
port mapping
constraints/invariants
residual/cut/excluded/projected accounting
verification result
```

A direct registry/class label is navigation metadata only.

Class induction for a new class is a separate workflow and may not use the candidate class as a premise for its own motivating decomposition.

---

## 17. Composition

Composition requires verified component witnesses, overlap/gluing maps, ports, compatibility constraints, joint-realizability evidence, and residual.

Shared identity alone is insufficient.

Fresh/local identities from independent namespaces are hygienically bridged/renamed as required; numeric spelling does not create a collision or merge.

---

## 18. Factorization and source-interpretation dependence

Repeat comparison over all materially distinct qualified interpretation/factorization/extraction pairs allowed by policy/budget.

Report:

```text
invariant over searched interpretation/factorization set
dependent but explained
unresolved due source ambiguity
unresolved due incomplete factorization/equivalence/search coverage
```

Never select only the interpretation/factorization pair producing the expected analogy.

---

## 19. Mandatory pairwise controls

At minimum:

1. cross-domain positive;
2. alpha/serialization positive;
3. near-isomorphic negative;
4. same-label/different-structure negative;
5. same-interior/different-boundary negative;
6. partial common-core pair;
7. alternate-factorization pair;
8. misleading/swapped-label pair;
9. symmetry/automorphism pair;
10. structural and stable-label namespace-collision pair;
11. post-hoc-policy-leak pair;
12. certified-negative versus incomplete-search control;
13. quantifier same-body/different-domain pair;
14. occurrence-multiplicity pair;
15. source-ambiguity alternative pair;
16. fresh-allocation namespace/collision pair;
17. legacy/current bridge pair where applicable.

---

## 20. Result record

Every run emits a native/reconstructable result record including:

```text
algorithm immutable revision
policy immutable revision
source/witness immutable revisions
soundness/completeness status
random seed if relevant
resource budget
interpretation/factorization/extraction coverage
mapping-search coverage
relation witness/certificate status
optimality status
verification-result reference
```

Unknown remains unknown.

The final question is:

> What is the strongest structural relation actually justified under the frozen interpretation/layer/view/relation-signature/authority, and can an independent structural checker reconstruct every obligation, mapping, exclusion, residual, and dependency that makes the claim valid?
