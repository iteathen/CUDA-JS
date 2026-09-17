# AxiomeSH Core Specification — Draft 0.11 Candidate

**Status:** experimental tightening produced by third-pass discovery-system review  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5 → Draft 0.6 → Draft 0.7 → Draft 0.8 → Draft 0.9 → Draft 0.10  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens them  
**Promotion:** experimental-branch authority only

Draft 0.10 makes pairwise structural comparison substantially safer. Draft 0.11 addresses the next layer: a system can have a perfect pairwise verifier and still fail AxiomeSH's purpose if candidate retrieval, substructure extraction, class parameterization, or policy design prevents true isomorphs from ever reaching that verifier.

No new logical operator is introduced.

The complete discovery pipeline is now:

```text
corpus/source structures
-> qualified substructure/factorization candidates
-> label-blind structural indexing/retrieval
-> frozen pairwise comparison policy
-> structural search
-> candidate witness/certificate
-> independent verification
-> class recognition
-> retained labels
```

---

## 1. Candidate retrieval is part of correctness

Labels may accelerate retrieval, but a discovery system MUST NOT depend on shared domain/class labels as the only path by which potentially isomorphic objects become candidate pairs.

Qualification therefore distinguishes:

```text
candidate generation / retrieval
pairwise structural comparison
witness verification
```

A system may use several retrieval channels, including labels, structural fingerprints, class indexes, or approximate embeddings, but cross-domain qualification must include a label-blind structural channel or a measured recall guarantee on hidden-label positives.

If a true relation is never proposed for comparison because candidate generation missed it, that is a discovery-system false negative even if the pairwise verifier is sound.

---

## 2. Structural fingerprints are heuristics, not evidence

A structural fingerprint/hash/index may be used to cheaply retrieve candidate structures.

Every such index declares:

```text
target layer
N0/N1 policy
D/E policy if any
included/excluded roles
boundary treatment
parameter treatment
collision behavior
known false-positive risk
known false-negative risk
version/revision
```

A fingerprint match is never an isomorphism witness.

A fingerprint mismatch is never proof of non-isomorphism unless the fingerprint is independently proven complete/injective for the declared comparison class.

Final correspondence still requires the Draft 0.10 witness protocol.

---

## 3. Reusable classes must be non-vacuous

Structured parameters are necessary, but they make a trivial class possible:

```text
Class(X) = "an arbitrary object supplied as parameter X"
```

Such a schema could match everything while exposing no invariant structure.

A reusable structural class therefore carries a **non-vacuity burden**.

A class is non-vacuous only if its non-parameterized schema/constraints expose a common construction that materially restricts membership.

At minimum:

- parameters MUST NOT collectively carry the whole instance while the schema adds only an identity wrapper;
- the schema MUST impose shared relations/invariants not supplied entirely by free parameters;
- held-out near-miss structures MUST be rejectable for structural reasons;
- membership SHOULD provide predictive/compositional value beyond restating the instance.

Description-length/compression/predictive-value metrics MAY be measured, but no single quantitative threshold is yet constitutional.

---

## 4. Semantic decomposition round trip is stronger than archival round trip

Draft 0.10 requires exact D decomposition to round-trip. Draft 0.11 distinguishes two forms.

### 4.1 Archival round trip

A representation may preserve an opaque copy of the source solely so the original bytes/structure can be recovered.

This is useful provenance/storage but proves nothing about semantic decomposition.

### 4.2 Semantic decomposition round trip

For an exact D edge to count as semantic-decomposition evidence, the source must reconstruct from:

```text
exposed decomposed construction
+ justified irreducible/model leaves
+ explicit transparent naming/serialization information
+ semantically necessary residuals
```

An opaque backup copy of the entire source is excluded from the evidence path.

A bundle may retain that archival copy, but it is marked non-evidential during decomposition/class discovery qualification.

---

## 5. Discovery-policy families require held-out generalization

Freezing one comparison policy before one scored pair is insufficient if the entire policy family was engineered after seeing every benchmark analogy it will be tested on.

Qualification of a general discovery system therefore includes:

- held-out structures not used to design the policy family;
- synthetic structures with no familiar labels;
- adversarial near-isomorphs;
- namespace-collision cases;
- alternative-factorization cases;
- newly generated class instances/negatives.

The policy family is evaluated for generalization rather than only benchmark memorization.

---

## 6. Class selectivity is part of promotion

A reusable class must accept its qualified positives and reject structurally meaningful near misses.

Promotion evidence therefore records at least:

```text
verified positive instances
held-out positive instances
verified near-miss negatives
boundary negatives
parameter-abuse negatives
known unresolved cases
```

A schema that accepts every held-out structure through permissive parameters fails selectivity/non-vacuity even if all positive mappings verify.

---

## 7. Corpus-scale discovery reports coverage

A pairwise witness establishes one relation. It does not establish that the corpus search found all relevant relations.

A corpus-scale discovery run records:

```text
corpus revision
object/substructure population considered
candidate-generation/index policy revision
comparison policy revision
coverage bounds
objects/substructures indexed
candidate pairs generated
pairs structurally searched
pairs independently verified
known-positive recall controls
known-negative precision controls
resource/time limits
unsearched/unindexed regions
```

Absence of a reported correspondence outside complete coverage is `UNKNOWN`, not evidence of non-isomorphism.

---

## 8. Substructure extraction is a witnessed transformation

A common-core search often begins by selecting components/subgraphs from larger source objects.

That selection can itself encode the expected analogy.

Any extraction used as qualification evidence is therefore one of:

- a source-given boundary/component;
- a predeclared generic extraction rule;
- a qualified D/projection factorization with explicit boundary cut/residual;
- a pair-specific exploratory hypothesis, which is not independent discovery evidence.

The extraction records:

```text
source object revision
selected substructure
boundary/cut relations
discarded residual
selection rule/provenance
whether selection was frozen before expected analogy unblinding
```

No common-core claim may hide the context discarded to obtain the core.

---

## 9. Discovery evidence is separated from archival/scorer payload

A native bundle may contain source glosses, historical encodings, recovery copies, registry hints, or expected results for stewardship.

Their mere co-location does not make them valid discovery evidence.

Qualification partitions bundle content into:

```text
discovery-visible semantic evidence
archival/provenance payload excluded from discovery
reviewer/scorer-only material
```

The partition itself is frozen/auditable.

A discovery agent MUST NOT read excluded source names, target class hints, opaque source backups, or scorer answers before the candidate structural result is frozen.

---

## 10. Class labels remain useful after qualification

Nothing in Draft 0.11 removes class/domain labels.

Once a class/schema is qualified, its label may be used for:

- retrieval acceleration;
- construction recipes;
- indexing;
- human review;
- candidate generation;
- reuse of qualified schema constraints.

But the system must retain at least one qualification path by which a new cross-domain instance can be discovered from structure without already carrying the class label.

This preserves the intended asymmetry:

```text
labels can accelerate known structure
labels cannot define unknown structure into existence
```

---

## 11. New qualification gates

### E1R — retrieval/discovery coverage audit

Verify label-blind or recall-qualified candidate generation, index transparency, and corpus coverage reporting.

### E1U — class non-vacuity/selectivity audit

Verify that parameters do not swallow the full instance and that the schema rejects meaningful held-out near misses.

### E1X — extraction/context audit

Verify that compared substructures/components were selected by source-given or frozen/qualified rules and that boundary-cut residuals are explicit.

### E1H — held-out policy-generalization audit

Verify the discovery-policy family on structures not used to design its rules/classes.

These gates join E1P–E1T and block promotion of a general structural-discovery/class system when applicable.

---

## 12. Discovery-system result discipline

The absence of a discovered match can mean several different things:

```text
pair was compared and certified non-isomorphic
pair was compared but no witness found
pair was never generated as a candidate
object/substructure was not indexed
relevant factorization was not available
resource limit prevented search
```

These states MUST remain distinct.

Only the first supports a certified negative under the declared policy.

---

## 13. Falsifiers

Revise Draft 0.11 if controlled evidence shows that:

- label-blind candidate generation adds material cost without improving discovery recall;
- non-vacuity/selectivity requirements reject useful classes without preventing trivial ones;
- semantic-versus-archival round-trip distinction adds no practical protection;
- held-out policy testing does not detect benchmark overfitting;
- substructure extraction witnesses add cost without preventing manufactured common cores;
- corpus coverage reporting does not change interpretation of negative discovery results.

Until such evidence appears, the governing principle is:

```text
finding the right pair is part of correctness
matching the pair is part of correctness
verifying the match is part of correctness
labels may accelerate all three only after structure remains independently recoverable
```
