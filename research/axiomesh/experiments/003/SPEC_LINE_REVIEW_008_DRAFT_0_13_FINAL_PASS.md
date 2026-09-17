# AxiomeSH Draft 0.13 Final-Pass Review — Native Discovery Authority

**Status:** corrective audit  
**Scope:** `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md` and Protocol 005 artifacts  
**Objective:** find residual defects after consolidation before structural qualification begins

Draft 0.13 is substantially coherent. This pass found a smaller set of remaining authority/self-containment issues rather than another broad redesign.

## 1. Label-blind structural retrieval must be mandatory for representation qualification

Draft 0.13 allows either:

```text
label-blind structural path
OR
independently demonstrated hidden-label recall guarantee
```

for a general discovery system.

That second branch is too permissive for the **AxiomeSH representation hypothesis**. A learned retriever trained on semantic/class labels could achieve hidden-label recall while the native structural representation contributes little to discovery.

Such a retriever may be useful operationally, but it cannot substitute for evidence that AxiomeSH itself exposes the correspondence.

**Correction:**

- representation/discovery qualification requires at least one candidate-generation path whose inputs are only discovery-visible native structure plus qualified structural transformations/indexes;
- label-assisted/learned semantic retrieval may run additionally and be measured as acceleration;
- learned structural retrieval is allowed on the structural path only when its training contamination is controlled with synthetic/novel held-out structures and the path does not require source/class labels as semantic authority.

## 2. Comparison policies and witnesses must themselves be native first-class structures

Draft 0.13 specifies detailed witness/policy fields but does not explicitly require the load-bearing policy/witness to be representable natively.

If the actual relation depends on an English/JSON sidecar that says which roles are rigid, which labels may map, which ports correspond, or which residuals exist, AxiomeSH has reintroduced a semantic translation layer exactly at the isomorphism boundary.

**Correction:**

For qualification, load-bearing representations of:

```text
comparison policy
role/namespace declarations
factorization/extraction edge
mapping/correspondence witness
negative/optimality certificate
class schema revision
class membership/class-class witness
discovery result record
```

must be expressible as ordinary native AxiomeSH structure or an explicitly qualified native dependency.

Human Markdown/JSON reports may mirror those objects for review but are non-authoritative.

No new core syntax is required; these are higher-order native structures/classes over the existing substrate.

## 3. Source ambiguity must remain explicit

The pipeline begins with “source semantics,” but real source material may be ambiguous, incomplete, or admit multiple faithful formalizations.

Choosing one silently before structural comparison can manufacture or hide isomorphism just as surely as choosing one convenient later factorization.

**Correction:** unresolved source ambiguity is represented as:

```text
source interpretation/fidelity alternatives
+ provenance/evidence for each
+ unresolved/conditional status
```

Comparisons/results are conditional on the selected interpretation(s) unless source authority later resolves them.

Source fidelity does not mean inventing one precise meaning for an under-specified source.

## 4. Revision identity must bind immutable content

Draft 0.13 correctly requires immutable schema/dependency revisions but does not state how a revision identity is prevented from being silently rebound to changed content.

**Correction:** a qualified revision identifier must resolve immutably to exact native content, for example through a content digest, immutable repository object/revision, or equivalent integrity binding represented by the artifact authority.

A mutable navigation label may point to the latest revision, but witnesses pin the immutable content revision.

This applies to schemas, profiles, D/E rules, indexes, policies, sources, and verification contracts.

## 5. Structural-identity namespace inheritance should be explicit

Draft 0.13 says identities are namespaced and documents do not collide, but it does not explicitly state the normal nested-scope inheritance needed by Draft 0.1-style boundary sharing.

**Correction:** nested scopes inherit their enclosing structural identity space by default. Therefore the same bare identity across an inner/outer boundary intentionally denotes the same object.

A nested/local identity namespace, if ever introduced, must be explicit and hygienically bridged.

Independent top-level documents/bundles do not share identity space without a qualified sharing/import/partition relation.

## 6. Fresh allocation needs a minimum namespace contract

Draft 0.13 correctly removes implicit RHS freshness but leaves freshness entirely profile-owned.

Without a minimum contract, two independently applied fresh-allocation rules could allocate the same bare ID and later collide during composition.

**Correction:** any fresh-allocation construction identifies:

```text
allocation namespace
pre-application occupied identities
fresh identity result
constraint: result not previously occupied in that namespace
application/event identity when simultaneous/independent allocations matter
```

Composition/import may alpha-rename locally fresh identities hygienically when namespaces are independent.

This is a construction contract, not necessarily a new core token.

## 7. Native witness verification should be structural, not merely another opinion

Draft 0.13 separates discovery and verification, but an agent verifier could simply repeat the same conceptual mistake.

**Correction:** verification is defined as checking explicit local structural obligations of the witness under frozen policy/dependencies. Where feasible these checks should be deterministic/mechanical over native structure.

An agent may execute the verifier, but validity is grounded in the represented mapping/constraint checks rather than agreement with the discoverer's conclusion.

## 8. Source versus inferred label roles need native distinction

Draft 0.13 states that source labels and inferred class labels are distinct, but this role distinction should itself be recoverable from the native object, otherwise later agents may treat inferred classification as source authority.

**Correction:** label attachment records native provenance role:

```text
SOURCE_SUPPLIED
INFERRED_STRUCTURAL_CLASS
RETRIEVAL_ALIAS
HUMAN_GLOSS
```

plus witness/revision for inferred labels.

These role names are explanatory; native payload may use stable IDs.

## 9. Common-core reconstruction must include excluded/projected structures in the evidence record

Draft 0.13 item accounting lists excluded/projected categories but the `A = glue(C, Delta_A, cut_A)` shorthand can still be read as if `Delta` alone contains everything outside the core.

**Correction:** define the evidence decomposition explicitly as including residual, cut, excluded-view, and projection-loss partitions. Reconstruction of full source uses all source-retained categories; reconstruction under the selected view may omit only dimensions explicitly excluded by that view.

## 10. Qualification should start now rather than add more speculative class vocabulary

The current spec has enough safeguards to begin falsification. Further class/operator expansion before exercising them risks another design-only loop.

**Correction / execution priority:** freeze Draft 0.14 after the above corrections, then run focused synthetic qualification for:

1. scope occurrence multiplicity;
2. rewrite multiset addition/removal;
3. same successor from distinct rewrite events;
4. nested-boundary non-flattening;
5. variable ownership/aliasing/NAC binding;
6. reference hygiene + repeated-use multiplicity;
7. structural and stable-label namespace collision;
8. quantifier same-body/different-domain;
9. semantic D round trip versus source-copy/residual cheat;
10. independent factorization/extraction freeze;
11. strong/weak embedding under frozen relation signature;
12. complete common-core item accounting;
13. multiple automorphism witnesses;
14. certified negative versus incomplete search;
15. index invariant pruning under multiple views;
16. vacuous-class negative plus large structured-parameter positive;
17. native policy/witness self-representation;
18. source ambiguity alternatives;
19. structurally novel class induction with no registry label;
20. label-blind retrieval versus label-assisted retrieval.

No new structural class should be added until these tests force one.
