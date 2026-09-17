# Experiment 003 — Results

**Status:** 18-benchmark source corpus/historical statement scaffold constructed; Draft 0.13 is the current consolidated candidate for new artifacts; structural substrate/discovery/class safeguards are specified; focused Draft 0.13 qualification, current-semantic rerenders/bridges, proof execution, and independent review remain pending.

## Benchmark surface

Experiment 003 contains 18 benchmark families across six domains:

```text
propositional / structural            3
first-order / equality                4
epistemic / modal / deontic           3
temporal / dynamic / spatial          3
intuitionistic / constructive         2
higher-order / type-theoretic         3
                                      --
total                                18
```

Historical native scaffold IDs remain `3001..3018` in source order `FL-001..FL-018`.

Historical scaffold counts remain:

```text
benchmark objects:              18
theory-owned symbols used:     135
theory-owned symbols declared: 135
used but undeclared:              0
declared but unused:              0
premise attachments:             15
benchmarks with premises:         7
parameter attachments:            2
required-construct attachments:   3
lexical abstraction occurrences:  9
```

These prove closure of that historical serialization only. They do not prove Draft 0.13 semantics, primitive decomposition, class membership, proof validity, or discovery coverage.

---

# Current candidate authority

For **new** artifacts:

- `../../CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`

Historical Draft 0.1–0.12 artifacts remain frozen evidence under their recorded semantics.

Parallel Draft 0.11/0.12 candidate tracks are preserved as historical design evidence; Draft 0.13 resolves their authority ambiguity for new work.

Key current supporting artifacts:

- `SPEC_LINE_REVIEW_006_CONSOLIDATION_AND_DISCOVERY.md`
- `SPEC_LINE_REVIEW_007_DRAFT_0_12_CONSOLIDATION.md`
- `STRUCTURAL_DISCOVERY_PROTOCOL_005.md`
- `STRUCTURAL_COMPARISON_PROTOCOL_005.md`
- `STRUCTURAL_CLASS_SCHEMA_CONTRACT_005.md`
- `STRUCTURAL_CLASS_CATALOG_005.md`

Earlier 003/004 protocols/catalogs remain historical evidence.

---

# Major corrections now incorporated

## Information-preserving substrate

For new Draft 0.13 artifacts:

- raw scope is unordered **occurrence-preserving**, not an implicit set;
- raw scope is not implicitly conjunction/list/set/execution state;
- rewrite update uses multiset subtraction/addition by default;
- duplicate RHS occurrences are not silently collapsed;
- distinct rule/match applications can remain distinct derivation events even if they reach the same successor;
- active rule authority is profile-owned rather than hidden in bare containment;
- RHS-only variables have no implicit freshness;
- `+?n` freshness overload is legacy-only;
- nested structural boundaries are not flattened implicitly.

## Identity / binding / references

- bare structural IDs are namespace-relative;
- stable `^n` labels are namespace-relative;
- coincidental numeric equality across independent namespaces is non-semantic;
- reference resolution is hygienic/structure-preserving, not naïve text copying;
- repeated references preserve use-site multiplicity without making the reference handle semantic occurrence identity;
- every variable occurrence has a reconstructable owner;
- same variable repeats one binding;
- distinct variables may alias unless explicit distinctness is represented;
- NAC-only unbound variables are invalid;
- NAC absence remains boundary/completeness-sensitive structural absence, not semantic falsity.

## Decomposition / normalization

- N0 serialization, N1 source-local alpha normalization, D factorization, and E theorem/profile equivalence remain separate;
- exact D requires semantic round trip;
- decomposition coverage is reported separately from round-trip fidelity;
- opaque/re-encoded source backups do not count as decomposition evidence;
- undecomposed residual preserves recoverability but reduces semantic coverage;
- recursive/fixed-point definitions require explicit existence/admissibility authority;
- alternative factorizations remain plural unless convergence/uniqueness is qualified.

## Isomorphism/comparison

Pairwise comparison now freezes independently:

```text
target layer
view
included relation signature
source-local roles/ports
N0/N1 rules
allowed D/E authority
factorization/extraction bounds
relation kinds
common-core objective
resource budget
```

Relation kinds remain distinct:

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

- strong embedding reflects all frozen included relation/scope/constraint kinds;
- no-witness under incomplete search is not non-isomorphism;
- maximum-core claims require explicit objective + optimality/completeness certificate;
- common-core witnesses classify every included/residual/boundary/excluded/projected item;
- distinct valid mappings/automorphisms remain explicit by default;
- witness verification is independent from discovery.

## Structural classes

A reusable class is an immutable/versioned, namespaced schema graph with:

- structured parameter slots;
- ports/boundaries;
- positive and negative constraints;
- absence/completeness conditions;
- relation signature;
- target-layer/view/relation-kind contract;
- D/E dependencies;
- residual/composition policy;
- non-vacuity/selectivity evidence;
- verified instance/class-class witnesses.

Class recognition and new-class induction are separate.

C1–C12 / `^9101..^9112` remain candidate navigation labels only; none is yet a qualified reusable schema revision.

## Corpus discovery

Candidate generation is part of correctness.

Current protocol requires:

- frozen extraction universe/rules;
- independent source-side factorization/extraction before pairing;
- label-blind structural candidate path or demonstrated hidden-label recall;
- view-specific fingerprint invariance guarantees;
- learned-index training/supervision provenance;
- candidate-pair, search, verification, and unsearched-region coverage reporting;
- policy-relative recall/precision controls;
- fresh-context information isolation;
- sealed/fresh held-out generalization;
- structurally novel class cases absent from the registry.

Approximate retrieval scores remain non-semantic metadata.

---

# Historical Experiment 003 artifact status

The following remain valuable author-side/historical candidates but are **not automatically Draft 0.13-native** because they were produced under earlier conventions:

- `FORMAL_LOGIC_BENCHMARKS_003.axh`
- `foundations/FOUNDATION_FORMULA_SAT_003.axh`
- `foundations/FOUNDATION_FINITE_PATH_003.axh`
- `foundations/FOUNDATION_LTL_TRACE_003.axh`
- `foundations/FOUNDATION_KRIPKE_EPISTEMIC_003.axh`
- `foundations/FOUNDATION_PROOF_OBJECT_003.axh`
- `foundations/FOUNDATION_HEAP_SEPARATION_003.axh`
- natural-deduction profile `.axh` files
- `proofs/FL_001_PEIRCE_PROOF_CANDIDATE_003.axh`

Before current structural/proof qualification they require either:

```text
Draft 0.13 rerender
OR
exact independently verified legacy-to-current bridge
```

No mathematical/research content is discarded by this status correction.

The historical Draft 0.5 cold-reconstruction protocol remains a test of that historical scaffold only.

---

# Remaining semantic-foundation work

Author-side candidates exist for:

- propositional satisfaction;
- finite path/reachability;
- exercised LTL trace semantics;
- epistemic/common-knowledge/public-announcement/S5 relational semantics;
- explicit proof-object structure;
- constructive/classical ND proof constructors;
- Peirce proof term;
- heap/separation/Hoare partial correctness.

Substantially pending:

- finite index/parity;
- complete FOL/equality after binder/instantiation audits;
- CTL;
- explicit deontic semantics;
- HOL/function/type structure;
- Church–Rosser concrete reduction theory;
- concrete pointer-swap/locality semantics.

No new foundation should be promoted before the Draft 0.13 structural qualification cases below are exercised.

---

# Qualification gates

Unique current gate set:

```text
E0     source fidelity
E1     native statement expressibility
E1P    primitive semantic decomposition
E1A    alias/factorization expansion
E1C    structural-class classification after witness
E1E    class/instance expansion
E1N    N0/N1 versus D/E audit
E1F    alternative-factorization audit
E1W    witnessed comparison audit
E1B    boundary/port/joint-realizability audit
E1L    label-blind/anti-cheating audit
E1M    multiple-mapping/maximal-core audit
E1Q    comparison-policy/relation-signature freeze audit
E1D    decomposition exactness/recursion/residual audit
E1S    namespace/bundle/manifest audit
E1H    reference/binder hygiene + occurrence/rewrite audit
E1V    independent witness/negative/optimality verification
E1T    target-layer/conclusion-scope audit
E1R    retrieval/discovery coverage audit
E1U    class non-vacuity/selectivity audit
E1X    extraction/context audit
E1G    held-out discovery-policy generalization audit
E1I    identity/variable-owner/namespace edge-case audit
E1K    index-invariant/search-engine audit
E1COV  decomposition/common-core item coverage audit
E1ISO  enforceable information-flow isolation audit
E2     isolated cold reconstruction
E3     proof-profile completeness
E4     proof execution
E5     independent proof review
```

---

# Current qualification state

```text
E0:
  source intents/caveats: COMPLETE author-side

E1:
  historical 18-object scaffold: COMPLETE author-side
  Draft 0.13 current rerender: PENDING

E1P:
  benchmark decomposition audit: COMPLETE historical/research-side
  several foundation candidates: CONSTRUCTED historical author-side
  Draft 0.13-native rerenders/bridges: PENDING

E1A/E1N/E1F/E1B/E1M/E1Q/E1D/E1S/E1H/E1T:
  current rules specified
  focused executions: PENDING

E1C/E1E/E1U:
  Draft 0.13 schema contract/catalog: CREATED
  qualified immutable class revisions: NONE
  verified memberships/class-class witnesses: NONE

E1W/E1V:
  Draft 0.13 pairwise protocol: CREATED
  verified cross-domain witnesses: NONE

E1L/E1ISO:
  label/information isolation rules: SPECIFIED
  executions: PENDING

E1R/E1X/E1G/E1I/E1K/E1COV:
  discovery/edge-case contracts: SPECIFIED
  executions: PENDING

Draft 0.6 @@:
  historical focused cases: COMPLETE author-side
  lower structural-rewrite factorization comparison: PENDING
  current Draft 0.13 qualification: PENDING

E2:
  historical Draft 0.5 scaffold protocol: FROZEN
  independent historical run: PENDING
  Draft 0.13 cold protocol: NOT YET CREATED

E3:
  existing profile candidates: historical/unqualified
  Draft 0.13 rerender/bridge: PENDING

E4:
  independently validated current proofs: NONE

E5:
  PENDING
```

---

# Immediate Draft 0.13 focused qualification

Required before more semantic/class expansion:

1. duplicate scope occurrences vs explicit set quotient;
2. multiset rewrite + duplicate RHS;
3. distinct application events / identical successor;
4. nested boundary no-flattening;
5. variable same-binding / distinct-variable aliasing / explicit distinctness;
6. invalid NAC-only variable;
7. NAC open/closed-world boundary;
8. hygienic reference expansion under binders;
9. repeated reference use: multiplicity without occurrence identity;
10. active vs inert identical rule object;
11. no implicit rule priority;
12. structural-ID and stable-label namespace collisions;
13. same quantified body / different domains;
14. exact D semantic round-trip vs residual/source-copy cheating;
15. independent decomposition/extraction freeze vs co-adaptation;
16. strong vs weak embedding relation-signature control;
17. same-label/different-structure and hidden-label/same-structure controls;
18. learned-index label/training leakage;
19. retrieval false-negative / extraction-universe coverage;
20. vacuous parameter schema rejection;
21. class recognition vs novel-class induction;
22. certified negative vs resource-limited no-witness;
23. automorphism/multiple valid mappings;
24. common-core item-accounting completeness;
25. legacy-to-current bridge.

---

# Claims not yet allowed

Experiment 003 does not establish:

- that all 18 benchmarks are current-complete proof problems;
- that any historical foundation/proof is Draft 0.13-qualified;
- that any C1–C12 label is a qualified reusable class;
- that any registry mapping is proven;
- that candidate retrieval has acceptable recall/precision;
- that one unique factorization/core/mapping exists;
- that a no-witness result proves non-isomorphism;
- that a schema match proves source-theory semantic equivalence;
- that the Peirce candidate is an E4 proof;
- that all 18 benchmarks are provable;
- that AxiomeSH outperforms another representation;
- that every post-0.1 surface is irreducible core;
- that Draft 0.13 improves proof/synthesis performance.

The current standard is:

```text
source fidelity
+ information-preserving native construction
+ semantic decomposition with honest residual coverage
+ independent factorization/extraction freeze
+ qualified label-blind candidate retrieval
+ frozen-policy witnessed comparison
+ independent verification
+ explicit ports/gluing/common-core/residual accounting
+ honest search/coverage uncertainty
+ non-vacuous versioned class recognition/induction
+ retained useful labels with provenance
+ explicit proof authority
+ cold reconstruction
+ proof execution
+ independent review
```