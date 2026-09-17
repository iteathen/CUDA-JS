# AxiomeSH

**Status:** research incubation  
**Research direction:** Josh Oshiro  
**Current experimental branch:** `experiment/axiomesh-native-reconstruction`  
**Current candidate authority for new artifacts:** `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`

AxiomeSH is an experimental agent-native structural knowledge representation.

Its central research question is:

> Can agents reason, retain, compare, and synthesize more effectively when persistent knowledge exposes the relational structure they must manipulate rather than primarily using forms optimized for human communication?

The project is not trying to create a numbered copy of existing logical notation. Its primary opportunity is to expose invariant/common structural shape across independently named domains while preserving exactly the residual distinctions that prevent false equivalence.

The leading hypothesis remains:

```text
knowledge = relational structure + lawful structural transformation
```

The scoped-hypergraph/rewrite substrate is a research hypothesis, not a settled commitment.

## Current authority and historical drafts

For **new** artifacts, use:

- `CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`

Draft 0.13 is self-contained. A new decoder does not need to replay the historical amendment chain.

Drafts 0.1–0.12 remain frozen design/experiment evidence. Older artifacts retain the semantics under which they were created and are not silently reinterpreted as Draft 0.13.

The historical lineage remains useful for provenance:

- Draft 0.1 — minimal scoped relational/rewrite substrate;
- 0.2–0.6 — exact values, stable labels, declarative surfaces, binding/abstraction/instantiation candidates;
- 0.7 — primitive semantic decomposition;
- 0.8 — retained labels and structural-class layer;
- 0.9–0.10 — witnessed comparison, plural factorizations, boundaries, policy freeze, namespaces, independent verification;
- 0.11–0.12 candidates — discovery/indexing coverage, class non-vacuity, information isolation, identity/reference/variable edge cases;
- 0.13 — consolidated current candidate.

`DESIGN_NOTES.md` preserves research rationale/falsifiers rather than overriding the current spec.

## Objective

AxiomeSH aims to maximize:

> **durable correct agent synthesis per total lifecycle resource cost**

while preserving:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- exact composition boundaries;
- required provenance;
- recoverability.

Token/character count is a cost, not the objective.

## Native path

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

No mandatory English parser, theorem-language translation, JSON envelope, database adapter, or model-specific semantic layer belongs in the native correctness path.

## Current structural-discovery discipline

```text
source semantics
-> independent qualified factorization/extraction per source
-> representation-only normalization
-> label-blind structural candidate retrieval
-> frozen comparison policy
-> structural search
-> candidate witness/certificate
-> independent verification
-> relation/common-core/residual result
-> class recognition OR new-class induction
-> retained useful labels
```

Labels are kept because they help agents retrieve and reconstruct higher-level objects. They are downstream of structural evidence and cannot choose the decomposition or mapping they later name.

## Isomorphism safety

AxiomeSH must avoid both:

- **false negatives:** related objects fail to meet because names, namespaces, serialization, factorization, extraction, or candidate retrieval differ;
- **false positives:** different objects collapse because constraints, multiplicity, boundaries, domains, residuals, relation signature, policy choices, or search incompleteness are hidden.

For partial correspondence, preserve:

```text
A = glue(C, Delta_A, cut_A)
B = glue(C, Delta_B, cut_B)
```

Every common/residual/boundary/excluded/projected item under the frozen view must be accounted for.

## Information-preserving current defaults

For new Draft 0.13 artifacts:

- raw `[]` is an unordered occurrence-preserving scope/boundary/container;
- raw scope is not implicitly conjunction, mathematical set, list, or active execution state;
- duplicate member occurrences are preserved unless an explicit quotient/profile establishes idempotence;
- rewrite update is occurrence/multiset preserving by default;
- distinct rewrite application events may remain distinct even when successor states are identical;
- active/inert rewrite status is execution-profile owned;
- rule serialization order is not priority;
- fresh allocation is explicit rather than inferred from `+?n` merely by RHS position;
- structural absence `!X` is boundary/completeness-sensitive and is not semantic falsity;
- quantifiers have represented/inherited domains or generators;
- object-theory equality is not structural identity.

## Identity / references / labels

Current discipline distinguishes:

```text
local structural identity + structural namespace
stable ^n label + owning semantic/schema namespace
exact literal value
```

Coincidental numeric equality across independent namespaces does not establish shared identity.

References are non-semantic compression. N0 reference resolution is hygienic/structure preserving: it preserves identities and binding ownership while repeated reference use preserves occurrence multiplicity without making the reference handle semantic occurrence identity.

Variables have reconstructable owners/roles. Distinct pattern variables may alias by default unless explicit distinctness is represented.

## Decomposition is plural

AxiomeSH does not assume one primitive-normal factorization.

Qualified factorization graphs preserve exact definitions, refinements, projections, E-equivalences, extraction relations, and unresolved alternatives.

Exact semantic decomposition reports round-trip fidelity **and** decomposition coverage; an opaque source copy or undecomposed residual cannot masquerade as exposed semantics.

A unique canonical factorization requires convergence/uniqueness evidence.

## Normalization is narrow

```text
N0  serialization-transparent normalization
N1  source-local alpha/representation normalization
D   qualified factorization/decomposition
E   profile/theorem equivalence
```

Only N0/N1 are ordinary pre-comparison normalization.

Theorem equivalence, substitution/beta reduction, class expansion, algebraic laws, quotienting, and lossy extraction are explicit D/E/projection operations.

## Comparison axes are separate

Every blind comparison freezes independently:

```text
target layer
view policy
included relation signature
source-local role/port policy
N0/N1 rules
allowed D/E authority
factorization/extraction bounds
relation kinds sought
objective if any
resource budget
```

Relation kinds include isomorphism, strong/weak embedding, specialization, homomorphism, simulation/bisimulation, quotient/projection, common core, certified negative, no-witness, unknown, and resource-limit results.

`NO_WITNESS_FOUND` is not `CERTIFIED_NON_ISOMORPHIC`.

## Structural classes

A reusable class is an immutable/versioned, namespaced schema graph with structured parameters, ports, positive/negative constraints, relation signature, dependencies, residual/composition policy, and independently verified membership evidence.

Large parameters are allowed; class non-vacuity is about reusable structural constraint/selectivity, not byte share.

Known-class recognition and new-class induction are distinct workflows.

One object may have multiple verified class memberships; AxiomeSH does not force single inheritance or one canonical label.

## Finding the pair is part of correctness

Candidate retrieval is distinct from pairwise structural search and witness verification.

Structural fingerprints, learned indexes, class labels, and source labels may all assist retrieval but are not correspondence evidence.

Fingerprint mismatch is safe pruning only when the fingerprint is a verified necessary invariant for the exact target layer/view/relation policy.

Learned index training/supervision provenance is part of qualification because hiding labels at inference does not erase training leakage.

Corpus runs report extraction/factorization/index coverage and distinguish pairs never generated from pairs actually searched.

## Discovery and verification are separate

Search agents propose candidate mappings/cores/classes/certificates.

Fresh verifiers independently check them against frozen inputs/policies without expected class/domain answers.

Unknown is preferable to unsupported equivalence or unsupported negative.

## Current Experiment 003 structural authorities

- `experiments/003/STRUCTURAL_DISCOVERY_PROTOCOL_005.md`
- `experiments/003/STRUCTURAL_COMPARISON_PROTOCOL_005.md`
- `experiments/003/STRUCTURAL_CLASS_SCHEMA_CONTRACT_005.md`
- `experiments/003/STRUCTURAL_CLASS_CATALOG_005.md`
- `experiments/003/RESULTS_003.md`

C1–C12 / `^9101..^9112` remain candidate navigation handles, not qualified class revisions.

## Historical artifact warning

Existing Experiment 003 `.axh` foundations/profiles/proofs were authored under earlier conventions and remain historical author-side candidates until rerendered under Draft 0.13 or connected by an exact independently verified legacy-to-current bridge.

Historical reproducibility is not current structural qualification.

## Ownership boundary

This research lives in CUDA-JS as an incubation host. AxiomeSH is not a CUDA-JS runtime responsibility. If it becomes independently load-bearing, it should move to a dedicated repository/package with its own authority/contracts.

## Current operating principle

> **Decompose without target-class bias. Freeze the rules. Find candidates structurally. Let structure determine the mapping. Verify independently. Keep every residual. Name the result afterward.**