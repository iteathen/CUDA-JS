# AxiomeSH Fourth-Pass Review — Core / Discovery Edge Cases

**Status:** corrective audit  
**Scope:** Draft 0.11 plus inherited raw-core rules not fully closed by Drafts 0.9–0.10  
**Objective:** identify residual edge cases that can still create accidental identity, false/missed isomorphism, or misleading discovery evidence.

This pass does not search for new logical features. It challenges the remaining *representation and discovery contracts*.

## 1. Bare structural identities need explicit namespace/scope

Draft 0.1 says atom spelling is alpha-renamable, but the lineage never fully defines the namespace of bare structural identities across independently serialized documents/bundle parts.

If two documents both contain bare identity `1`, concatenation must not accidentally assert shared object identity unless that sharing is intended.

**Correction:** every structural identity is interpreted relative to an explicit/recoverable structural namespace/owning scope. Cross-document identity sharing requires a declared import/port/shared-namespace relation or a bundle-partition witness proving intentional continuity.

Coincidental bare-number equality across independent namespaces is not semantic identity.

## 2. Reference expansion must preserve identity sharing, not textual copies

References are semantically transparent, but naïve macro expansion can duplicate a referenced structure in a way that changes shared identity/occurrence relations.

**Correction:** N0 reference resolution is structure-preserving substitution. Repeated references preserve every shared structural identity inside the referred term. If occurrence identity itself matters, it must already be explicit rather than supplied by the reference handle.

Reference handles never create semantic alias identity on their own.

## 3. Variable token role must have an owner

The same `?n` surface participates in rewrite-pattern variables and lexically bound formula/abstraction variables.

Draft 0.3 clarifies lexical binding, but the comparison model should not infer variable role merely from a reader's intent.

**Correction:** every variable occurrence has a reconstructable owner/role:

```text
rewrite-pattern owner
lexical binder owner
schema/pattern owner
```

Alpha normalization respects owner boundaries. An unowned variable in a context requiring a closed term is invalid rather than guessed.

## 4. Fingerprint mismatch criterion in Draft 0.11 is misstated

Draft 0.11 says a fingerprint mismatch may certify non-isomorphism if the fingerprint is “complete/injective.” Injectivity is stronger than necessary and “complete” is ambiguous.

The actual safe condition for mismatch pruning is an independently qualified **isomorphism invariant**:

```text
A ≅ B  =>  f(A) = f(B)
```

Then `f(A) != f(B)` is a separating certificate for the declared view/target layer.

Hash collisions make equal fingerprints non-probative but do not invalidate mismatch pruning when the invariant computation itself is exact.

**Correction:** replace the injective/completeness wording with invariant/sound-separation wording and record the exact view/layer under which the invariant is valid.

## 5. Non-vacuity must not ban legitimately large structured parameters

Draft 0.11 says parameters must not collectively carry the whole instance. That wording is too strong.

A useful schema such as universal evaluation may legitimately take a large relation and formula as parameters while adding a nontrivial invariant relation among them.

The real defect is a schema that contributes no constraining structure beyond passing parameters through.

**Correction:** non-vacuity is based on independent structural constraint/predictive power, not byte proportion. Parameters may contain most instance data if the schema imposes a nontrivial reusable relationship among them and rejects meaningful near misses.

## 6. Semantic residuals can still hide opaque source backups

Draft 0.11 excludes an explicit archival source copy, but a decomposition can cheat by placing the same opaque information into a field called “semantically necessary residual.”

**Correction:** residual information used by an exact semantic decomposition must itself be classified:

```text
irreducible/model leaf
source-domain parameter
boundary/context residual
currently undecomposed residual
```

A currently undecomposed residual preserves recoverability but cannot be counted as evidence that the hidden portion was semantically decomposed.

Semantic-decomposition coverage is reported separately from round-trip fidelity.

## 7. Discovery isolation must be operational, not only declarative

Marking fields `ARCHIVAL_ONLY` is insufficient if the same agent/context has already read the hidden glossary, registry, or expected mapping.

**Correction:** blind qualification uses a fresh isolated decoder/search context or another enforceable information-flow boundary. The audit records which files/resources were accessible before result freeze.

This extends the existing cold-decoder discipline to structural discovery.

## 8. Candidate-retrieval recall is policy-relative

Draft 0.11 speaks of a “true relation” being missed by candidate generation. The target relation only exists relative to a target layer, view, D/E authority set, factorization set, and relation kind.

**Correction:** recall/false-negative claims are always scoped to a frozen discovery target policy. A pair missed under one view is not automatically a global discovery failure if that relation was outside the declared target.

## 9. Structural index invariance must match the exact discovery target

A fingerprint that is invariant for V0 is not necessarily safe under VS/VC where semantic labels or schema parameters may map.

**Correction:** every index declares the comparison view/role policy for which its invariance/recall properties are qualified. Indexes cannot be reused across views by assumption.

## 10. Substructure search must distinguish induced and non-induced extraction

Selecting a node subset and dropping incident/internal relations can manufacture a cleaner common core.

**Correction:** extraction records whether it is:

```text
induced substructure
boundary-cut component
relation-filtered projection
other explicit projection
```

Dropped relations among retained nodes are projection loss, not ordinary residual context. A strong/induced common-core claim may only use extraction preserving the required internal relations.

## 11. “Common core” requires ownership of duplicated boundary facts

When A and B share a core C, relations crossing from C into each residual are explicitly retained. But the representation must avoid ambiguously counting a boundary relation as both core and residual or neither.

**Correction:** the witness partitions/matches every compared structural item into:

```text
common mapped structure
A-only residual
B-only residual
boundary-cut incidence associated with A residual
boundary-cut incidence associated with B residual
excluded-by-view structure
```

No load-bearing item is silently unclassified.

## 12. Relation signatures must define what strong embedding reflects

Draft 0.10 says strong embedding reflects “declared incidence/relations.” If that relation signature is selected after seeing the pair, extra target relations can be hidden.

**Correction:** the compared relation signature/dimensions are part of the frozen view policy. Strong/induced embedding reflects all included relation kinds, scopes, and constraints among mapped objects.

## 13. Search procedures need soundness/completeness labels

A structural search algorithm may be sound but incomplete, approximate, heuristic, or probabilistic.

**Correction:** every discovery/comparison engine declares:

```text
soundness status
completeness status
probabilistic/heuristic behavior
random seed when relevant
resource bounds
```

A heuristic can propose witnesses, but only independently verified witnesses support positive claims. Negative claims require complete search or a verified separating certificate.

## 14. Approximate learned retrieval must never affect witness semantics

Learned embeddings may be useful candidate indexes, but model confidence/similarity must not become a structural edge or class constraint unless represented and separately justified.

**Correction:** approximate retrieval scores are non-semantic search metadata and are excluded from pairwise witness evidence.

## 15. Class discovery needs minimum-description caution, not a mandated compression objective

Non-vacuity naturally suggests compression/minimum-description scoring, but optimizing only for compression can prefer over-general classes that erase useful residual distinctions.

**Correction:** description length is a measured diagnostic only. Class quality remains multi-objective: exactness, selectivity, residual fidelity, compositional usefulness, reconstruction/reasoning performance, and lifecycle cost.

## 16. Qualified class labels cannot silently become source semantics

Once a class label is attached to an object, later agents may treat it as a source fact and reason from it even when the label was only inferred under one view/factorization.

**Correction:** inferred class membership records its qualification provenance:

```text
schema revision
view/authority policy
target layer
factorization set
verified witness
status
```

It is derived knowledge, not an intrinsic source label. Source-supplied labels and inferred class labels remain distinct roles.

## 17. Multiple labels/classes may coexist without forced hierarchy

One object can validly instantiate several overlapping schemas under different factorizations/views.

**Correction:** do not force single inheritance or one canonical class. Preserve multiple verified class memberships with their witnesses. Class-class relationships require separate evidence.

## 18. Qualification corpus must contain structurally novel classes

Held-out instances of known class shapes test generalization within classes, but not discovery of a genuinely new structural class.

**Correction:** evaluation should include synthetic/independently sourced objects whose correct class/factorization is absent from the existing registry/catalog. The system must be able to return a witnessed new candidate class/common-core hypothesis instead of snapping to the nearest known label.

## Required correction

The next amendment should therefore add:

1. structural identity namespaces across documents;
2. structure-preserving reference resolution contract;
3. explicit variable ownership roles;
4. correct invariant-based fingerprint pruning semantics;
5. non-vacuity based on constraints rather than parameter byte share;
6. decomposition-coverage reporting for undecomposed residuals;
7. fresh-context information-flow isolation for blind discovery;
8. policy-relative recall/index qualification;
9. induced/projection-aware substructure extraction;
10. complete witness partitioning of core/residual/boundary/excluded items;
11. frozen relation signature for strong embeddings;
12. search soundness/completeness metadata;
13. approximate retrieval score exclusion from semantics;
14. derived-class provenance and multiple-membership preservation;
15. novel-class discovery controls.
