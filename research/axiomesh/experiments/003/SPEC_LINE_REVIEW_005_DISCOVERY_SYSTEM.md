# AxiomeSH Draft 0.10 Third-Pass Review — Discovery-System Safety

**Status:** corrective audit  
**Scope:** Draft 0.10 and current Experiment 003 comparison/classification workflow  
**Objective:** identify remaining ways a formally correct pairwise comparison framework could still fail the actual AxiomeSH mission of *finding* structural isomorphisms across a corpus.

Draft 0.10 substantially fixes pairwise comparison safety. This pass asks a different question:

> Can the discovery system still hide or manufacture correspondences before the verifier ever sees a pair?

## 1. Candidate retrieval can cause false negatives

Pairwise label-blind comparison is insufficient if candidate pair generation uses domain/class labels as the only retrieval path.

A true cross-domain isomorph may never be compared.

**Correction:** distinguish:

```text
candidate retrieval / indexing
structural comparison
witness verification
```

Labels may accelerate retrieval, but qualification of the discovery system must include label-blind structural candidate generation or a measured recall guarantee on hidden-label cross-domain positives.

A structural fingerprint/hash may be used as a retrieval heuristic but is not proof of correspondence.

## 2. Structural fingerprints can create hidden semantic authority

A fingerprint/canonical hash that silently applies D/E reductions, ignores boundaries, or coarsens constraints can reintroduce the same defects as bad canonicalization.

**Correction:** every fingerprint/index declares:

```text
source target layer
N0/N1/D/E policy
roles included/excluded
collision policy
false-negative risk
```

Fingerprints are search indexes only. Final relation still requires the full witness protocol.

## 3. Vacuous structural classes can match anything

Allowing structured parameters is necessary, but it creates a new failure mode:

```text
class WholeObject(X)
```

where one parameter carries the entire instance and the class exposes no shared structure.

This would technically be erasure-safe and witnessable but useless for invariant discovery.

**Correction:** reusable class promotion requires a **non-vacuity burden**. The schema must expose a nontrivial common construction/invariant outside its free parameters.

At minimum:

- parameters cannot collectively encode the whole object while leaving only an identity wrapper;
- the schema must constrain/predict structural relationships shared by independent instances;
- held-out instances/negatives must demonstrate that membership is selective;
- description-length/compression/predictive-value metrics may be measured, but no single metric is constitutional yet.

## 4. Exact-decomposition round trips can cheat by carrying the source blob

Draft 0.10 requires a round trip, but a target factorization could store an opaque copy of the entire source as “provenance/residual” and reconstruct trivially.

That proves storage recoverability, not semantic decomposition.

**Correction:** an exact D factorization used as **semantic decomposition evidence** must reconstruct from the decomposed construction plus explicitly justified irreducible/residual information. An opaque backup copy of the source may be retained for provenance/recovery but is excluded from evidence that the decomposition exposed the semantics.

Qualification should distinguish:

```text
lossless archival round trip
semantic decomposition round trip
```

## 5. Discovery-policy family itself can be overfit

Freezing a pair-specific policy is not enough if the policy family was designed after seeing the benchmark set and encodes those expected analogies.

**Correction:** cross-domain discovery qualification needs held-out structures/classes and synthetic adversarial cases not used to design the policy family.

The policy family is evaluated for generalization, not only reproducibility.

## 6. Class promotion should demonstrate selectivity, not only positives

Draft 0.10 requires adversarial negatives, but the class contract should make the desired property explicit:

```text
class schema constrains instances enough to reject near misses
```

A class that accepts all held-out structures through permissive parameters is not useful even if every positive maps.

## 7. Corpus discovery result must expose coverage

A pairwise witness says nothing about whether all relevant corpus pairs/substructures were considered.

**Correction:** corpus-scale isomorphism search reports:

```text
corpus revision
candidate-generation policy
coverage/search bounds
number of objects/substructures indexed
candidate pairs generated
pairs verified
recall controls/known positives
resource limits
unsearched regions
```

Absence of a reported match outside complete coverage remains unknown.

## 8. Substructure extraction can bias class discovery

Before pair comparison, an agent may choose which subgraph/component of each source object to compare. Choosing substructures after seeing an analogy can manufacture a common core.

**Correction:** substructure/component extraction is itself a factorization/projection step with a witness, boundary cut, and residual. Qualification freezes or independently derives extraction rules and records the discarded context.

## 9. Provenance-only source copies must not leak into label-blind search

Archival source representations, human glosses, or registry mappings may be stored in the same bundle for recoverability. If the search agent can see them, they can leak expected semantic names back into decomposition/classification.

**Correction:** qualification bundles explicitly separate:

```text
semantic evidence available to discovery
archival/provenance payload excluded from discovery
scorer/reviewer-only material
```

Recoverability storage is not automatically discovery input.

## 10. Current correction set

The next amendment should add:

1. discovery/retrieval qualification, not just pairwise verification;
2. structural-index/fingerprint policy transparency;
3. non-vacuity/selectivity burden for reusable classes;
4. semantic versus archival round-trip distinction;
5. held-out generalization tests for comparison-policy families;
6. corpus coverage reporting;
7. witnessed substructure extraction;
8. strict separation of discovery evidence from archival/scorer payload.
