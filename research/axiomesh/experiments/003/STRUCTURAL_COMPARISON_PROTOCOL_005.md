# Experiment 003 — Structural Comparison Protocol 005

**Status:** candidate pairwise qualification protocol  
**Spec:** `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`  
**Supersedes for new qualification:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`

## Purpose

Establish structural relations without allowing labels, namespaces, factorization choice, extraction choice, adaptive policy, incomplete search, or hidden scorer knowledge to decide the result.

Pairwise comparison begins only after source-side factorization/extraction/roles/ports have been independently frozen.

---

## 1. Freeze comparison policy

Before expected mappings/results are available, freeze:

```text
target layer
view policy
included/excluded relation signature/dimensions
source-local role-assignment rules
N0/N1 rules
allowed D factorizations/dependencies
allowed E equivalences/dependencies
factorization/extraction search bounds
relation kinds sought
common-core objective/partial order if any
resource budget
```

Pair-specific exploratory hypotheses are permitted only when explicitly labeled as such and are not blind-discovery evidence.

---

## 2. Inputs

A blind run receives:

```text
source A + revision
source B + revision
independently frozen factorization/extraction set A
independently frozen factorization/extraction set B
source-local stable-label namespaces
source-local comparison roles
source-local ports/boundaries
frozen comparison policy
```

It does not receive:

- expected class/domain mapping;
- source-to-class registry hypotheses;
- human analogy text/gloss intended only for review;
- expected node/edge maps;
- expected common core/residuals;
- scorer certificates;
- peer-conditioned source decomposition/extraction.

---

## 3. Validate source-side preparation

Before pairwise search, check:

- semantic revision/profile pinned;
- structural and stable-label namespaces resolvable;
- reference resolution hygienic;
- variable ownership reconstructable;
- occurrence multiplicity preserved;
- quantifier domain/generator present where required;
- ports/roles frozen independently;
- D edges qualified and correctly typed exact/refinement/projection/etc.;
- E dependencies qualified with assumptions/side conditions;
- factorization/extraction completeness status recorded.

An invalid source preparation produces `UNKNOWN`/protocol failure rather than silently repairing the object during comparison.

---

## 4. N0

Apply only serialization-transparent operations permitted by Draft 0.13:

- whitespace/presentation normalization;
- hygienic reference resolution;
- deterministic unordered-member presentation;
- qualified transparent bundle partition normalization.

Reference resolution preserves structural identities and lexical ownership while repeated reference use preserves occurrence multiplicity without granting occurrence identity to the reference handle.

No D/E/class/peer-object operation is N0.

---

## 5. N1

Using only frozen source-local role policy, alpha-normalize:

- local structural-ID numbering;
- bound-variable numbering;
- unordered-member presentation.

Preserve:

- ordered incidence;
- structural namespaces;
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
- source/model constraints.

A deterministic canonical graph label is a representation aid, not proof of unique mapping. Automorphisms/materially distinct witnesses remain recoverable.

---

## 6. Label-blind comparison view

Consistently anonymize/map non-evidential label identities under the frozen view while preserving their incidence/role structure.

Do not delete relation/head nodes merely because their human name is non-evidential.

Rigid labels/literals remain rigid unless the frozen VS/VC policy explicitly permits mapping/parameterization.

Record the anonymization/randomization map for reproducibility.

---

## 7. View semantics

### V0 — closed structural
Local alpha identities may bijectively rename; namespace-qualified stable labels/literals are rigid.

### VB — boundary/port
V0 plus witnessed mapping of frozen ports preserving role/constraints.

### VS — signature-mappable
Selected stable labels may map. Record map injectivity/surjectivity/bijectivity. `ISOMORPHISM` requires a bijective relevant label map.

### VC — class-schema
A specific immutable schema revision supplies structured parameter slots, ports, rigid/mappable roles, relation signature, allowed abstractions, and residual policy. No slot/port is invented after scoring begins.

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

For each allowed materially distinct factorization/extraction pair:

1. search under the frozen view and relation signature;
2. preserve positive/negative constraints, multiplicity, ports, guards, and domains;
3. do not alter parameter/mappability rules to improve the result;
4. keep extraction loss explicit;
5. record algorithm soundness/completeness/heuristic status, random seed if applicable, and resource bounds.

Heuristics may propose candidate maps. They cannot certify the final relation.

---

## 10. Candidate witness

A positive/partial candidate witness records:

```text
A/B revisions + factorization/extraction ids
target layer
view + frozen relation signature
N0/N1 policy
D/E authorities + revisions
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
factorization/extraction completeness
search budget/completeness
optimality status
```

A candidate witness is not qualification evidence until independently verified.

---

## 11. Item-accounting invariant

For `COMMON_CORE`/partial results, every load-bearing item under the frozen view is classified exactly once as:

```text
mapped common structure
A-only residual
B-only residual
A boundary-cut incidence
B boundary-cut incidence
excluded-by-view structure
explicitly projected/collapsed structure
```

The accounting includes member occurrences, edges, negative constraints, guards, ports, quantifier/domain constraints, and activation/execution constraints.

Reconstruction target:

```text
A = glue(C, Delta_A, cut_A)
B = glue(C, Delta_B, cut_B)
```

---

## 12. Independent verification

A fresh verifier receives only:

```text
frozen source/factorization objects
frozen comparison policy
candidate witness/certificate
```

plus dependencies required to interpret those objects.

It does not receive expected class/domain answers.

Verifier checks:

- revision/namespace correctness;
- mapping domain/codomain;
- ordered incidence/scope/binding preservation;
- occurrence multiplicity;
- positive and negative constraints;
- strong/weak reflection obligations;
- port/parameter rules;
- domains/guards;
- absence/completeness assumptions;
- residual/cut/gluing completeness;
- projection loss disclosure;
- claimed relation kind;
- claimed optimality/negative certificate.

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
- an independently verified separating certificate/invariant.

Fingerprint mismatch is such a certificate only when the fingerprint is independently qualified as a necessary invariant for the exact frozen layer/view/relation target.

---

## 14. Common-core optimality

A **maximum** claim requires an explicit measure/partial order plus complete-search or optimality certificate.

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

A membership witness names:

```text
immutable schema revision
instance revision/factorization
target layer/view/relation kind
schema positive/negative maps
structured parameter assignment
port mapping
constraints/invariants
residual
verification result
```

A direct registry/class label is navigation metadata only.

Class induction for a new class is a separate workflow and may not use the candidate class as a premise for its own motivating decomposition.

---

## 17. Composition

Composition requires verified component witnesses, overlap/gluing maps, ports, compatibility constraints, joint-realizability evidence, and residual.

Shared identity alone is insufficient.

---

## 18. Factorization dependence

Repeat comparison over all materially distinct qualified factorization/extraction pairs allowed by policy/budget.

Report:

```text
invariant over searched set
dependent but explained
unresolved due incomplete factorization/equivalence/search coverage
```

Never select only the pair producing the expected analogy.

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
10. namespace-collision pair;
11. post-hoc-policy-leak pair;
12. certified-negative versus incomplete-search control;
13. quantifier same-body/different-domain pair;
14. occurrence-multiplicity pair;
15. legacy/current bridge pair where applicable.

---

## 20. Result record

Every run records:

```text
algorithm revision
soundness/completeness status
random seed if relevant
resource budget
factorization/extraction coverage
mapping-search coverage
relation witness/certificate status
optimality status
```

Unknown remains unknown.

The final question is:

> What is the strongest structural relation actually justified under the frozen layer/view/relation signature/authority, and can an independent checker reconstruct why?