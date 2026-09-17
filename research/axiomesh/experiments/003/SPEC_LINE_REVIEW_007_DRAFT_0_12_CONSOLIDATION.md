# AxiomeSH Draft 0.12 Consolidation Line Review 007

**Status:** corrective audit  
**Live branch reviewed:** `experiment/axiomesh-native-reconstruction` after Draft 0.12/discovery/class-catalog work  
**Scope:** both Draft 0.12 candidate tracks, active comparison/discovery protocols, class catalog/contract, primitive audit, and Experiment 003 status documents  
**Objective:** close remaining specification contradictions and subtle isomorphism/discovery failure modes before any further semantic/class expansion.

---

# 1. Duplicate Draft 0.12 authority

Two Draft 0.12 documents now exist:

- `CORE_SPEC_DRAFT_0_12_CANDIDATE.md` — edge-case amendment over the historical chain;
- `CORE_SPEC_DRAFT_0_12_CONSOLIDATED_CANDIDATE.md` — self-contained consolidated candidate.

Both contain valid corrections. Shared numbering leaves a decoder unable to know which is authoritative.

**Correction:** preserve both as historical candidate evidence and issue one Draft 0.13 consolidated authority containing the union of valid rules. Active protocols/docs then point to Draft 0.13.

---

# 2. Discovery-system additions that must enter the consolidated spec

The amendment-style Draft 0.11/0.12 line correctly adds safeguards not fully present in the first consolidated candidate:

- retrieval/candidate generation is part of correctness;
- structural fingerprints are retrieval heuristics unless a view-specific invariant justifies mismatch pruning;
- learned index training provenance matters;
- class non-vacuity/selectivity is structural, not byte-size based;
- semantic round-trip coverage differs from archival round trip;
- residuals can preserve recoverability without counting as decomposed coverage;
- substructure extraction has explicit kind and context residual;
- blind discovery needs actual information isolation;
- discovery recall is policy-relative;
- corpus coverage/extraction universe must be reported;
- inferred memberships carry provenance and multiple memberships may coexist;
- novel-class discovery must be tested rather than only known-class recognition.

These become normative in Draft 0.13.

---

# 3. Relation-signature freeze remains necessary

Strong/induced embedding reflects the included relation/scope/constraint signature.

The exact relation signature/dimensions must be frozen with the view policy before mapping search. It cannot be narrowed after extra target relations are observed.

Draft 0.13 should list this explicitly in policy freeze and witness fields.

---

# 4. Common-core item accounting

Every load-bearing item under the frozen view must end in exactly one accounting category:

```text
mapped common structure
A-only residual
B-only residual
A boundary-cut incidence
B boundary-cut incidence
excluded-by-view structure
explicitly projected/collapsed structure
```

No item may disappear because its ownership is awkward.

This accounting applies to:

- positive edges/incidence;
- member occurrences/multiplicity;
- negative constraints/NACs;
- disequalities;
- guards;
- ports;
- quantifier/domain constraints;
- activation/execution constraints.

---

# 5. Canonical graph labeling versus mapping multiplicity

A deterministic N1 canonical labeling can help equality/indexing, but a single canonical representative must not be mistaken for evidence that only one isomorphism/mapping exists.

A symmetric object may admit many valid witnesses.

**Correction:** if canonical labeling is used, retain enough source-to-canonical/automorphism information to reconstruct materially distinct mappings when the downstream task needs them. Canonical transport representation is distinct from mapping multiplicity.

---

# 6. Occurrence-preserving rewrite semantics

The consolidated spec should use multiset subtraction/addition for default rule application:

```text
S' = (S multiset-minus matched(LHS)) multiset-plus instantiated(RHS)
```

This avoids an arbitrary LHS/RHS duplicate-occurrence correspondence.

If a specific occurrence needs persistent identity, reify that occurrence explicitly.

Distinct rule/match application events may produce the same successor state and remain distinct derivation events unless a profile explicitly quotients them.

---

# 7. Source labels versus inferred labels

A source-supplied label and an inferred structural-class membership are different semantic/provenance roles.

An inferred label records:

```text
schema revision
target layer
view/authority policy
factorization/extraction set
verified witness
qualification status
```

Changing the source/schema revision does not silently preserve that inferred membership.

---

# 8. Class recognition versus class induction

These must be separate workflows.

**Recognition:** an already frozen qualified schema revision is used to test a new instance.

**Induction:** verified common structure from independent instances produces a *new candidate schema*, which is frozen and then validated on held-out/adversarial data.

The candidate class cannot be used as authority to decompose the same motivating instance and then cited as evidence for itself.

---

# 9. Learned index contamination

An index can be label-dependent through training even when labels are hidden at inference.

Qualification of learned retrieval records:

```text
model/index revision
training corpus provenance
supervision/objective
known overlap with evaluation corpus
label/class information used during training
```

Final recall/generalization uses sealed/fresh held-out or synthetic cases not used to tune the index/policy family.

---

# 10. Holdout lifecycle

A repeatedly inspected holdout becomes development data.

A final generalization claim requires a sealed holdout or freshly generated adversarial/synthetic cases after policy/schema design is frozen.

---

# 11. Extraction-universe completeness

Corpus “coverage” is meaningless without defining which substructures/components could have been candidates.

A run freezes the eligible extraction grammar/rules and states whether enumeration is:

```text
exhaustive
bounded-depth
bounded-cost
sampled
heuristic
```

No corpus-complete negative claim extends beyond that universe.

---

# 12. Semantic-decomposition residual cheating

Round trip can still cheat if a field called “residual” contains the whole undecomposed source.

Every residual used in semantic-decomposition evidence is classified:

```text
qualified primitive/model leaf
source-domain parameter
boundary/context residual
transparent naming/serialization data
currently undecomposed residual
```

A currently undecomposed residual preserves recoverability but reduces decomposition coverage and cannot count as exposed semantics.

---

# 13. Namespace discipline

Stable `^n` labels and bare structural IDs are namespace-relative.

Class/schema labels/revisions are also namespaced.

Transparent bundle concatenation must preserve/rename:

- structural-ID namespace;
- stable-label namespace;
- reference namespace;
- binder ownership;
- activation boundaries;
- ports/imports.

Coincidental numeric equality across independent namespaces never establishes identity.

---

# 14. Reference hygiene

N0 reference resolution is graph/DAG substitution, not naïve textual copy.

It preserves:

- structural identities inside the referenced term;
- lexical binding ownership/capture status;
- use-site occurrence multiplicity without granting semantic occurrence identity to the reference handle.

Repeated reference use can increase member occurrence count while preserving the identities inside the referred structure.

---

# 15. Quantifier/domain completeness

Quantifier surfaces are not semantically complete without a represented domain/generator (or explicitly represented profile-wide default), plus sort/guard constraints where applicable.

This remains load-bearing for cross-domain comparison with generated-region classes.

---

# 16. Raw scope carrier meaning

Draft 0.13 must state plainly:

```text
raw scope = unordered occurrence-preserving structural container/boundary
```

It is not inherently:

- conjunction;
- mathematical set;
- ordered sequence;
- idempotent collection;
- active execution state.

Each additional meaning is explicit profile/class structure.

---

# 17. Rule activation

First-class rewrite object and active rewrite authority remain separate.

Direct-child activation survives only as an explicit legacy/current execution profile, not hidden core behavior.

Rule serialization order is never priority unless explicitly represented.

---

# 18. Search-engine result honesty

Each engine/run records:

```text
soundness status
completeness status
heuristic/probabilistic behavior
random seed if relevant
resource bounds
factorization/extraction coverage
mapping-search coverage
```

`CERTIFIED_NON_ISOMORPHIC` requires complete search or independently verified separating certificate.

Fingerprint mismatch can certify separation only under an independently qualified necessary invariant for the exact view/layer/relation target.

---

# 19. Active Experiment 003 foundations are historical candidates under new semantics

Many `.axh` foundations/profiles/proofs were authored under earlier conventions:

- formula-scope conjunction;
- set-like scope semantics;
- earlier activation/reference assumptions;
- older signature/revision rules.

They remain valuable evidence but are not automatically Draft 0.13-qualified foundations.

Current structural/proof use requires:

- rerendering under current semantics; or
- exact verified legacy-to-current bridge.

The historical Draft 0.5 E2 cold reconstruction still tests that historical scaffold only.

---

# 20. Gate naming must remain collision-free

Use unique meanings in Draft 0.13:

```text
E1H    reference/binder hygiene + occurrence/rewrite semantics
E1G    held-out discovery-policy generalization
E1R    retrieval/discovery coverage
E1U    class non-vacuity/selectivity
E1X    extraction/context
E1I    identity/variable ownership/namespace edge cases
E1K    index-invariant/search-engine qualification
E1COV  decomposition/common-core coverage
E1ISO  enforceable information-flow isolation
```

No gate acronym is reused for a different contract.

---

# 21. Protocol/doc reference drift

Active files currently point to different Draft 0.10/0.11/0.12 authorities.

Once Draft 0.13 is committed, active protocol/class/campaign/results documents must point to it. Historical experiment inputs remain frozen rather than rewritten.

---

# 22. Immediate structural qualification before new semantic expansion

Before adding another logic/domain primitive/class, run focused cases covering:

1. duplicate scope occurrence versus explicit set quotient;
2. duplicate RHS rewrite multiplicity;
3. different application events / same successor;
4. nested-boundary no-flattening;
5. same-variable versus distinct-variable aliasing;
6. invalid NAC-only unbound variable;
7. open/closed-world NAC control;
8. hygienic references under binders;
9. repeated reference use and occurrence multiplicity;
10. active versus inert identical rule object;
11. no implicit rule priority;
12. structural/stable-label namespace collision;
13. quantifier same body/different domains;
14. semantic D round-trip versus residual/source-copy cheating;
15. independent decomposition/extraction freeze versus co-adaptation;
16. strong versus weak embedding relation-signature control;
17. same-label/different-structure and hidden-label/same-structure controls;
18. learned-index label-leak control;
19. retrieval false-negative/coverage accounting;
20. vacuous parameter class rejection;
21. class recognition versus new-class induction;
22. certified negative versus resource-limited no-witness;
23. symmetry/automorphism with multiple valid mappings;
24. common-core item-accounting completeness;
25. legacy/current bridge.

---

# Disposition

The current direction is structurally sound only if these safeguards are treated as semantics/qualification contracts rather than optional testing bureaucracy.

The next authority should be one **Draft 0.13 consolidated candidate** that merges the two Draft 0.12 tracks and eliminates the current authority ambiguity.