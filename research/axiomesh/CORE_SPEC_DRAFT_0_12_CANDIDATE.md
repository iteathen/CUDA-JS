# AxiomeSH Core Specification — Draft 0.12 Candidate

**Status:** experimental tightening produced by fourth-pass core/discovery edge-case review  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5 → Draft 0.6 → Draft 0.7 → Draft 0.8 → Draft 0.9 → Draft 0.10 → Draft 0.11  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens them  
**Promotion:** experimental-branch authority only

Draft 0.12 adds no new logical operator.

It closes residual identity, reference, variable-ownership, indexing, extraction, witness-partition, and discovery-provenance gaps that could still distort isomorphism discovery even after Drafts 0.9–0.11.

---

## 1. Bare structural identities are namespaced

Draft 0.1's bare integer identities are alpha-renamable structural identities, not globally meaningful numbers.

Their semantic identity is relative to a structural namespace/owning native object or bundle scope.

Therefore:

```text
bare 7 in namespace A
!=
bare 7 in independent namespace B
```

unless an explicit shared-identity/import/port relation states otherwise.

### 1.1 Cross-document sharing

Two bundle documents share a bare structural identity only when the bundle structure establishes continuity, for example through:

- a shared structural namespace;
- an explicit import/export identity map;
- an interface/port mapping;
- a qualified bundle-partition witness proving the documents are partitions of one identity space.

Coincidental numeral spelling across independently scoped documents is not shared-object identity.

### 1.2 Alpha comparison

Local structural IDs may still alpha-rename under N1/view rules. Namespacing prevents accidental collision; it does not make local IDs rigid.

---

## 2. Reference resolution preserves structural sharing

References remain serialization/compression devices.

N0 reference resolution is structure-preserving substitution, not naïve textual copying.

If the referred term contains shared structural identities, repeated expansions preserve those identities and their incidence relationships.

A reference handle itself does not create a new semantic identity, alias class, or occurrence identity.

If distinct occurrences are semantically load-bearing, occurrence identities/counts must be represented explicitly in the referred/native structure rather than inferred from how many times a reference token appears.

---

## 3. Variable occurrences have explicit/recoverable owners

The surface `?n` is used in several roles. Every variable occurrence must have one reconstructable owner/role, such as:

```text
rewrite-pattern owner
lexical quantifier/abstraction binder owner
schema/pattern owner
```

A variable number is only a local serialization handle within that ownership relation.

N1 alpha-renaming may rename owned variables while preserving ownership/capture relations.

An occurrence whose owner cannot be determined in a context requiring a closed/qualified term is invalid rather than guessed.

This prevents pattern variables and logical/schema variables from becoming isomorphic merely because they share `?n` syntax.

---

## 4. Structural fingerprints use invariant guarantees

Draft 0.11's fingerprint rule is tightened.

A fingerprint mismatch can serve as a certified separating test only when the fingerprint has an independently qualified invariant property for the declared target layer/view:

```text
A R B  =>  f(A) = f(B)
```

where `R` is the structural relation being safely pruned, normally isomorphism under a specified view.

Then:

```text
f(A) != f(B)
```

certifies that `R` does not hold under that exact policy.

Injectivity is not required for mismatch pruning.

Equal fingerprints never prove a relation unless the fingerprint is separately proven complete in the required direction; ordinary hashes may collide and remain retrieval heuristics.

Fingerprint qualification is view/layer/version specific. An invariant qualified for V0 cannot be assumed valid for VS/VC.

---

## 5. Non-vacuity is constraint-based, not size-based

Draft 0.11's non-vacuity requirement is clarified.

A useful class may legitimately accept large relation/substructure parameters that carry most of the instance data.

The forbidden case is not “large parameters.” It is a schema that contributes no nontrivial reusable structural constraint beyond passing its parameters through.

A non-vacuous class:

- imposes relations/invariants among its parameters/ports;
- predicts or constrains structure not supplied merely by the parameter handles;
- rejects meaningful held-out near misses;
- provides reusable structural/compositional information beyond `Class(X)=X`.

Parameter byte share or description length alone does not determine vacuity.

---

## 6. Round-trip fidelity and decomposition coverage are separate

An exact semantic factorization needs a round trip, but round-trip fidelity alone does not prove that all source semantics were actually decomposed.

Every residual needed for reconstruction is classified, for example:

```text
qualified primitive/model leaf
source-domain parameter
boundary/context residual
transparent naming/serialization data
currently undecomposed residual
```

A `currently undecomposed residual` may preserve recoverability but does not count as decomposed semantic coverage.

Qualification therefore reports separately:

```text
round-trip fidelity
semantic-decomposition coverage
undecomposed residuals
```

An opaque source backup disguised as a residual is archival/recovery data, not decomposition evidence.

---

## 7. Blind discovery requires enforceable information isolation

Marking a resource non-evidential is insufficient if the discovery agent already saw it.

Qualification uses a fresh isolated agent/context or another enforceable information-flow boundary that prevents access before result freeze to:

- expected class/mapping answers;
- registry hypotheses forbidden by the protocol;
- human glosses used only for review;
- opaque source backups excluded from decomposition evidence;
- scorer-only residuals/certificates.

The qualification record states which resources were accessible to discovery and verifier stages.

This extends the cold-decoder isolation discipline to structural discovery.

---

## 8. Discovery recall is policy-relative

A candidate-generation false negative is defined relative to a frozen discovery target:

```text
target layer
view policy
D/E authority
factorization bounds
relation kind(s)
substructure/extraction policy
```

A pair not generated for a relation outside that declared target is not counted as a false negative for the run.

Recall/generalization measurements therefore name the target policy they measure.

---

## 9. Index/fingerprint qualification is view-specific

Every structural index/fingerprint states the exact view/role/factorization policy for which its invariance and recall properties were established.

Indexes are not automatically reusable across V0/VB/VS/VC.

If an index is used outside its qualified policy, it becomes a heuristic retrieval channel whose misses cannot support recall/completeness claims.

---

## 10. Substructure extraction kind is explicit

Selecting a substructure is itself a transformation.

An extraction declares whether it is:

```text
induced substructure
boundary-cut component
relation-filtered projection
quotient/projection
other explicitly defined extraction
```

For an induced extraction, every included relation/constraint among retained objects under the declared relation signature remains included.

Dropping a relation between retained objects is projection loss, not ordinary surrounding residual.

A strong/induced common-core claim cannot be based on a non-induced extraction unless the loss is explicitly outside the frozen comparison view.

---

## 11. Common-core/residual witnesses classify every structural item

A common-core witness must account for every load-bearing compared item under the frozen view.

Each item/relationship is classified as one of:

```text
mapped common structure
A-only residual
B-only residual
A boundary-cut incidence
B boundary-cut incidence
explicitly excluded-by-view structure
explicitly projected/collapsed structure
```

No load-bearing item may disappear merely because its ownership between core and residual is inconvenient.

This makes the decomposition:

```text
A = C + ΔA
B = C + ΔB
```

auditable rather than rhetorical.

---

## 12. Strong embedding reflects the frozen relation signature

A strong/induced embedding preserves **and reflects** every included relation/scope/constraint kind among mapped objects under the frozen view.

The relation signature/dimensions to be reflected are part of the predeclared comparison policy.

They cannot be narrowed after seeing extra target relations.

A weak embedding may permit extra target relations, but those remain explicit residual and the result must remain `WEAK_EMBEDDING`.

---

## 13. Search algorithms declare soundness/completeness status

A comparison/discovery engine declares, per policy/version:

```text
soundness status
completeness status
heuristic/approximate/probabilistic behavior
random seed when relevant
resource/search bounds
```

Heuristic or learned search may propose positive witnesses because independent verification protects soundness of accepted positives.

Negative/completeness claims require a complete search for the declared finite problem or a verified separating certificate.

---

## 14. Approximate retrieval scores are non-semantic

Learned embeddings, similarity scores, heuristic ranks, and approximate fingerprints may be used to prioritize candidate pairs.

They are retrieval metadata only.

They do not become native semantic relations, class constraints, or witness evidence unless a separate represented theory explicitly makes such a score part of the domain being modeled.

---

## 15. Class quality is multi-objective

Compression/description length may help detect vacuity, but AxiomeSH does not define “best class” as shortest description alone.

Class quality may include:

- exact semantic fidelity;
- selectivity/non-vacuity;
- residual fidelity;
- compositional usefulness;
- retrieval/discovery value;
- reconstruction/reasoning performance;
- lifecycle cost;
- robustness across domains/models.

Any optimization/ranking must state its metric. No single metric is constitutional yet.

---

## 16. Inferred class membership is derived knowledge with provenance

A source-supplied domain label and an inferred structural-class membership are distinct roles.

Every inferred membership records:

```text
class/schema revision
instance/factorization revision
view/authority policy
target layer
verified witness reference
qualification status
```

Later agents may use a qualified inferred label for retrieval/construction, but must be able to recover its evidence path.

Changing the source representation/schema revision does not silently preserve the inferred membership.

---

## 17. Multiple verified class memberships are allowed

A structure may validly instantiate several overlapping classes under different factorizations/views.

AxiomeSH does not impose single inheritance or one canonical class merely for organizational simplicity.

Preserve multiple verified memberships with their individual witnesses.

Any class-class hierarchy/equivalence relation remains a separate witnessed claim.

---

## 18. Novel-class discovery is a qualification target

Testing held-out instances of known classes is insufficient for AxiomeSH's intended discovery role.

Qualification should include structures whose correct reusable class/common-core hypothesis is absent from the current registry/catalog.

The system must be able to return:

```text
verified common core / factorization evidence
+ NEW_CANDIDATE_CLASS hypothesis
+ residuals/parameters/ports
```

rather than forcing the object into the nearest known class label.

New-class hypotheses remain unqualified until they satisfy the normal schema/non-vacuity/held-out/adversarial promotion path.

---

## 19. Additional qualification gates

Draft 0.12 tightens Draft 0.11 gates with:

### E1I — identity/reference/variable ownership audit

Verify structural namespaces, reference-preserved sharing, and variable ownership cannot collide across bundles/roles.

### E1K — index-invariant/search-engine audit

Verify fingerprint invariance claims, view specificity, and algorithm soundness/completeness metadata.

### E1COV — decomposition/common-core coverage audit

Verify undecomposed residuals and every core/residual/boundary/excluded item are explicitly classified.

### E1ISO — information-flow isolation audit

Verify discovery and verifier stages were isolated from excluded archival/scorer/registry information until allowed.

These join E1P–E1H and block dependent structural/class claims.

---

## 20. Falsifiers

Revise Draft 0.12 if evidence shows a simpler mechanism provides the same protection against:

- cross-document identity collisions;
- reference-expansion sharing errors;
- variable-role conflation;
- unsafe fingerprint pruning;
- vacuous parameterized classes;
- residual/source-backup decomposition cheating;
- information leakage into blind discovery;
- projection-biased substructure extraction;
- unclassified core/residual relations;
- embedding-signature adaptation;
- heuristic-search overclaiming;
- inferred-label provenance loss;
- snapping structurally novel objects into known labels.

Until then:

```text
identity is scoped
sharing is structural
variables have owners
indexes only retrieve
search limits stay visible
core/residual cuts are complete
class labels remain derived and evidenced
novel structure may remain novel
```
