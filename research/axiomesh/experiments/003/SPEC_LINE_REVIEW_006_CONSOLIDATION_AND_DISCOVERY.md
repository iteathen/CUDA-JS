# AxiomeSH Draft 0.11 / Discovery-System Line Review 006

**Status:** corrective audit  
**Live-base reviewed:** `4cdf68a4bead0bec4024b0b423838de878d57baf`  
**Scope:** both Draft 0.11 candidates, Draft 0.10, discovery/comparison protocols, class-schema contract, primitive audit, and inherited semantics still used by Experiment 003  
**Objective:** identify remaining ways representation, decomposition, retrieval, mapping policy, occurrence semantics, or qualification procedure can create false/missed structural correspondences.

This review treats every current document as evidence rather than authority over its own correctness.

---

# 1. Specification-authority conflict

## 1.1 Two different Draft 0.11 authorities now exist

The branch contains:

- `CORE_SPEC_DRAFT_0_11_CANDIDATE.md` — discovery-system amendment over Draft 0.10;
- `CORE_SPEC_DRAFT_0_11_CONSOLIDATED_CANDIDATE.md` — self-contained consolidated semantics.

Both are useful, but the shared version number creates an immediate decoder-authority ambiguity.

**Correction:** neither should be silently overwritten. Freeze both as candidate evidence and issue one new self-contained consolidated Draft 0.12 that includes the discovery-system additions and all surviving core rules.

## 1.2 Historical amendment reconstruction remains unsafe

Any current spec that still says “read earlier drafts in order” preserves the original failure mode: missing one supersession changes semantics.

**Correction:** Draft 0.12 becomes the sole normative candidate for new artifacts. Historical drafts remain reproducibility evidence only.

---

# 2. Discovery-system review

## 2.1 Retrieval recall is part of correctness

The new discovery amendment correctly recognizes that pairwise verification cannot recover a pair never proposed.

Additional correction:

- a retrieval channel with known false-negative behavior MUST NOT be used to support corpus-completeness claims unless another channel/certificate covers the omitted region;
- a fingerprint mismatch is only pruning-safe if the fingerprint is proved necessary for the requested relation under the frozen policy.

## 2.2 Learned retrieval indexes can leak labels indirectly

Hiding labels at inference time does not make a learned index label-independent if its training data/objective encoded the same domain/class labels.

**Correction:** learned index declarations record model/index revision, training-data provenance, supervision source, and known overlap with qualification corpora. Held-out/synthetic qualification is mandatory for any learned channel used to make recall claims.

## 2.3 Eligible substructure universe must be explicit

“Objects/substructures indexed” is not meaningful unless the extraction universe is defined. A corpus may have exponentially/infinite many subgraphs/factorizations.

**Correction:** a corpus discovery run declares the eligible extraction grammar/rules and whether enumeration is exhaustive, bounded-depth, bounded-cost, sampled, or heuristic. Coverage claims are scoped to that universe.

## 2.4 Extraction must freeze independently, not pairwise

The current extraction-witness rule is good but still permits pair-specific extraction if labeled exploratory.

For blind qualification, extraction policy and source-side candidate components are frozen independently before counterpart exposure, just like decomposition.

Pair-conditioned extraction remains exploratory evidence only.

## 2.5 Semantic decomposition residual can still cheat

Excluding an opaque backup copy is necessary but not sufficient. A “residual” could carry the entire undecomposed compound semantics under another name.

**Correction:** semantic-decomposition evidence includes a residual audit. Residual content must be justified as irreducible/model/provenance information required for reconstruction; it may not contain an unexamined encoding of the compound construction being claimed decomposed.

## 2.6 Discovery evidence partition must be operationally isolated

Marking content `ARCHIVAL_ONLY` is insufficient if the discovery agent can still read it in context/files/search.

**Correction:** qualification uses an isolated fresh context/tool-access boundary in which excluded/reviewer material is actually unavailable until the discovery result is frozen.

## 2.7 Class non-vacuity cannot depend only on parameter size

A valid class may legitimately take a very large relation-valued parameter. Conversely, a tiny parameter may still encode an arbitrary object through an oracle-like handle.

**Correction:** non-vacuity is structural: the fixed schema must impose independently checkable shared invariants/relations and reject held-out near misses. Parameter byte size alone is neither necessary nor sufficient.

## 2.8 Holdout contamination across iterative design

A holdout repeatedly inspected after failures becomes training data.

**Correction:** qualification distinguishes development sets from sealed final holdouts, and may use freshly generated synthetic/adversarial cases for final generalization tests.

---

# 3. Gate-name collision

`CORE_SPEC_DRAFT_0_11_CONSOLIDATED_CANDIDATE.md` uses `E1H` for reference/binder hygiene + occurrence multiplicity.

`CORE_SPEC_DRAFT_0_11_CANDIDATE.md` uses `E1H` for held-out policy generalization.

This makes qualification state ambiguous.

**Correction:** Draft 0.12 assigns unique gates:

```text
E1H  reference/binder hygiene + occurrence semantics
E1G  held-out discovery-policy generalization
E1R  retrieval/coverage audit
E1U  class non-vacuity/selectivity audit
E1X  extraction/context audit
```

---

# 4. Occurrence-preserving scope semantics review

## 4.1 Occurrence identity versus occurrence multiplicity

Draft 0.11 correctly changes the information-preserving default from set-like to occurrence-preserving unordered membership.

However, duplicate identical members do not automatically have externally addressable identities.

**Correction:** distinguish:

```text
occurrence multiplicity
occurrence identity
```

A multiset can preserve two indistinguishable occurrences by count. If a specific occurrence must carry external relations/provenance/ports, it must be reified with an explicit identity/wrapper.

## 4.2 Rewrite retention is ambiguous for duplicate members

Wording such as “preserve explicitly retained matched occurrences” requires an LHS-to-RHS occurrence correspondence that may not exist for identical duplicate terms.

**Correction:** default occurrence rewrite is multiset subtraction/addition:

```text
S' = (S multiset-minus matched instantiated LHS) multiset-plus instantiated RHS
```

with unmatched context retained. If occurrence identity itself is load-bearing, the occurrence must be explicitly reified and then ordinary identity determines retention.

## 4.3 Distinct rule applications may reach the same successor

With occurrence-preserving matching, two different match/application events can produce structurally identical successor states.

Collapsing them loses derivation multiplicity/provenance and can matter to proofs, stochastic profiles, or search accounting.

**Correction:** a rewrite application has an application witness/event identity at the derivation layer. Successor-state equality does not imply application-event identity. An execution profile may quotient application events only explicitly.

## 4.4 Choice alternatives inherit occurrence discipline

Choice is unordered, but repeated alternatives are separate occurrences until a selected logic/profile establishes idempotence.

This must remain consistent with scope multiplicity.

---

# 5. Rewrite semantics / activation review

## 5.1 Active/inert rule role is now explicit — preserve that correction

A first-class rule object must not become active merely because it is syntactically present.

Draft 0.12 should make execution-profile ownership normative and keep direct-child activation only as a historical/explicit legacy profile.

## 5.2 Nested-boundary matching must be explicit

A rule cannot flatten/cross nested scopes unless the pattern/profile structurally addresses those scopes.

## 5.3 RHS-only variables remain invalid by default

No implicit freshness or hidden generator is allowed.

## 5.4 Rule order remains non-semantic

Serialization ordering cannot imply priority unless an execution profile explicitly represents priority/scheduling.

---

# 6. Variable / NAC review

## 6.1 Same variable versus different-variable aliasing

Retain:

- repeated same variable = same binding;
- distinct variables may bind the same object by default;
- disequality/distinctness must be explicit.

## 6.2 NAC-only variables are under-specified unless constrained

A variable occurring only inside `!X` must not silently introduce existential/universal matching semantics.

**Correction:** NAC-only variables must already be bound by positive pattern structure or explicitly scoped by the matching profile.

## 6.3 Absence requires completeness boundary

`!X` means no represented match in the declared boundary, not semantic falsity. Any absence-as-falsity use requires an explicit completeness/closed-world contract.

---

# 7. Reference review

## 7.1 Hygienic expansion is required

Reference resolution must preserve binder ownership/capture status.

## 7.2 Repeated reference use is not occurrence identity

Using `@0` twice is serialization sharing. It does not assert the two use-site occurrences are one occurrence.

## 7.3 Reference ordering is non-semantic

Keep the Draft 0.9 correction: sibling textual before/after ordering inside an unordered serialization scope does not affect reference meaning.

---

# 8. Identity and namespace review

## 8.1 Structural identities also require a namespace/owner when documents compose

Stable `^n` labels were correctly namespaced. Bare local structural IDs can also collide across separately serialized documents.

**Correction:** local structural identity belongs to a structural namespace/boundary. Transparent bundle concatenation must include capture-avoiding renaming/namespace preservation for local IDs as well as references/labels.

## 8.2 Repeated structural identity is the same object

Draft 0.12 should state explicitly:

```text
same structural identity within its namespace = same object
```

Different structural IDs remain distinct structural identities even if an object-theory equality formula relates them.

---

# 9. Literal review

Exact rational literal syntax needs complete canonical conditions:

- denominator nonzero;
- fraction reduced;
- denominator positive/sign on numerator;
- `#-0` canonicalizes to `#0`;
- no float spelling as exact literal.

Literal token-class irreducibility remains a separate audit.

---

# 10. Scope is not mathematical set/order/conjunction

Raw scope is an unordered occurrence-preserving structural container.

Therefore:

- mathematical set semantics require an explicit extensional-set construction/profile;
- ordered lists/sequences require explicit order/incidence structure;
- conjunction requires explicit co-satisfaction/profile structure;
- idempotence is a quotient/profile rule.

This prevents one carrier from silently importing several domain meanings.

---

# 11. Signatures / manifests review

## 11.1 Surface signature closure remains useful

For a selected serialized bundle:

- every used local stable label must be declared/imported or core-reserved;
- an undeclared stable label is invalid;
- an exact compact surface signature may contain exactly the used local labels;
- unused declarations make that compact signature non-canonical but do not change body semantics.

These are layer-local serialization rules, not cross-domain equality evidence.

## 11.2 Namespace identity itself must be native/stable

A namespace cannot depend on a filename/path/English convention that is absent from the bundle contract.

## 11.3 Manifest mechanism is still only specified abstractly

Draft 0.11 requires revision/profile pinning but no concrete native manifest construction exists yet.

**Correction:** define and qualify a manifest construction in Experiment 003 before first Draft 0.12 cold artifact. Do not promote a new core primitive merely for this; use ordinary native structure + stable labels.

---

# 12. D/E transformation review

## 12.1 Exact D residual audit

See 2.5. Round-trip alone is insufficient without showing the residual did not smuggle back the compound source.

## 12.2 E edges need evidence closure

An E-equivalence is only as strong as its proof/evidence object and assumptions.

**Correction:** E dependencies themselves are revisioned/qualified; an E edge cannot cite an unqualified theorem label as authority.

## 12.3 Fixed-point semantics need monotonicity/existence conditions where relevant

“Least/greatest fixed point” is not well-defined for every operator.

**Correction:** recursive/fixed-point contracts include whichever of monotonicity, guardedness, productivity, well-foundedness, continuity, or explicit profile theorem is required to establish existence/uniqueness/admissibility.

---

# 13. Class discovery versus class recognition

Draft 0.10/0.11 sometimes use class-schema comparison while also discussing discovery of a new class.

These are distinct workflows.

## 13.1 Recognition

A pre-existing immutable schema revision may be used under VC to test a new instance.

## 13.2 New-class induction

A new class cannot be used as a premise to discover itself.

Candidate induction should begin from verified pair/group common structure, produce a new candidate schema, freeze it, then validate on held-out/adversarial instances.

**Correction:** Draft 0.12 explicitly separates `CLASS_RECOGNITION` from `CLASS_INDUCTION` protocols.

---

# 14. Class schema review

## 14.1 Negative constraints are mandatory schema content

Schema contracts must map/check forbidden edges, NACs, disequalities, absence/completeness conditions, not only positive edges/invariants.

## 14.2 Class labels/schema revisions are namespaced

`^9101` is not a global class identity without its owning registry/schema namespace and exact revision.

## 14.3 Non-vacuity is structural/selective

See 2.7.

## 14.4 Class-family edges require witnesses

Retain current correction: specialization/factorization/composition between classes is itself a witnessed structural claim.

---

# 15. Comparison/relation review

## 15.1 View, transformation authority, target layer, relation kind remain orthogonal

Do not re-collapse these axes.

## 15.2 Strong versus weak common cores

A common core/result must state whether the mapped structure is induced/strong or weak. Extra target/source relations among mapped objects cannot silently disappear.

## 15.3 Certified negatives require proof/completeness

No-witness, resource-limit, and unknown remain separate from certified non-isomorphism.

## 15.4 Maximum/common-core completeness

“Maximum” requires a declared measure and optimality/complete-search certificate. Otherwise report maximal/non-dominated cores found and search bounds.

## 15.5 Mapping opaque leaves only proves parametric structural analogy

Without additional E evidence, mapping independent primitive leaves into common slots does not prove source-theory semantic equivalence.

---

# 16. Witness review

## 16.1 Independent witness verification remains mandatory

Search output is candidate evidence only.

## 16.2 Residual reconstruction must include cut/gluing data

`A=C+ΔA` shorthand is valid only when boundary-cut/attachment structure is recoverable.

## 16.3 Distinct witnesses preserved by default

“Materially distinct” must not be an undocumented heuristic. Preserve distinct verified mappings by default; quotient only through an independently verified automorphism/equivalence relevant to the downstream task.

---

# 17. Existing Experiment 003 artifacts changed semantic status

Several existing native foundations and proof candidates were authored under earlier scope/set/activation conventions.

They are still valuable historical author-side candidates, but **they are not automatically Draft 0.12-native foundations**.

Affected surfaces include at least:

- `FORMAL_LOGIC_BENCHMARKS_003.axh`;
- `FOUNDATION_FORMULA_SAT_003.axh`;
- finite-path/LTL/epistemic foundations;
- proof-object and ND profiles;
- heap/separation foundation;
- FL-001 proof candidate.

**Correction:** mark them historical/current-bridge-required. Either rerender under Draft 0.12 or attach an exact legacy-to-current bridge before using them as current structural-class/proof evidence.

The existing Draft 0.5 E2 cold reconstruction can still qualify the historical statement scaffold, but it cannot be cited as Draft 0.12 reconstruction evidence.

---

# 18. Protocol/reference synchronization

Current files point to different authorities (`Draft 0.10`, amendment-style `Draft 0.11`, consolidated Draft 0.11).

**Correction:** after Draft 0.12 is committed, update active protocol/schema/catalog/campaign/results docs to reference Draft 0.12. Historical files remain frozen rather than silently rewritten when they are themselves experiment inputs.

---

# 19. Required next qualification before more semantic expansion

Do not add another logic/domain primitive from Experiment 003 until the structural substrate corrections are tested.

Focused Draft 0.12 qualification should include:

1. duplicate scope occurrences versus explicit set quotient;
2. duplicate RHS rewrite occurrences;
3. two distinct rewrite matches producing the same successor but distinct application events;
4. nested boundary match/no implicit flattening;
5. same-variable binding and distinct-variable aliasing;
6. invalid NAC-only free variable;
7. NAC open/closed-world control;
8. hygienic reference expansion under binders;
9. repeated reference use preserving multiplicity but not occurrence identity;
10. active versus inert identical rewrite object under explicit execution profile;
11. no implicit rule priority from serialization order;
12. revision/namespace manifest reconstruction;
13. legacy-to-current bridge case;
14. exact D semantic round-trip versus archival-copy cheating;
15. independent A/B decomposition freeze versus pairwise co-adaptation;
16. same-label/different-structure and hidden-label/same-structure controls;
17. retrieval false-negative/coverage accounting;
18. vacuous parameter schema rejection;
19. class recognition versus new-class induction control;
20. certified non-isomorphic versus resource-limited no-witness control.

---

# Disposition

The project is now close to having the right constitutional shape, but the remaining defects are exactly the kind that can poison isomorphism discovery while leaving individual formulas looking correct.

The next normative artifact should be a **single Draft 0.12 consolidated candidate**, not another amendment chain, and it should incorporate both Draft 0.11 branches plus every correction above before any new class receives promotion.