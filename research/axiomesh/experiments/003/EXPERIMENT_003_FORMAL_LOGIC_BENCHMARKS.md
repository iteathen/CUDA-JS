# Experiment 003 — Cross-Logic Proof Benchmark Campaign

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Candidate spec lineage:** Draft 0.5 → Draft 0.6 → Draft 0.7 → Draft 0.8 → Draft 0.9 → Draft 0.10  
**Status:** benchmark corpus/scaffold constructed; primitive decomposition and isomorphism-safe qualification are mandatory before proof claims

## Purpose

Experiment 003 tests whether AxiomeSH can support agent reasoning across 18 benchmark families spanning propositional, first-order/equality, epistemic/modal/deontic, temporal/dynamic/spatial, intuitionistic/constructive, and higher-order/type-theoretic domains.

The primary risk is no longer syntax coverage. It is structural contamination:

- opaque names hiding compound semantics;
- labels or registry hints deciding the class they later “discover”;
- a preferred decomposition manufacturing an analogy;
- post-hoc parameterization absorbing every difference;
- namespace collisions making unrelated symbols appear identical;
- canonicalization silently applying semantic equivalence;
- incomplete search being reported as non-isomorphism;
- schema-level similarity being promoted to source-theory semantic equivalence;
- boundary/residual constraints disappearing to produce a cleaner match.

Useful labels remain because they help retrieval and construction, but they are evidentially downstream of structure.

## Governing pipeline

```text
source semantics
-> qualified/versioned factorization set
-> N0/N1 representation normalization
-> frozen comparison policy
-> label-blind structural search
-> candidate witness/certificate
-> independent witness verification
-> relation/common-core/residual result
-> structural-class recognition
-> retained labels
-> explicit proof profile
-> proof/counterresult
-> independent proof review
```

For every benchmark:

```text
statement representation
!= semantic construction
!= structural-class relationship
!= proof profile
!= proof
!= reviewed proof
```

## Qualification gates

### E0 — source fidelity

Preserve the supplied theorem/premises/domain/test intent without silent repair.

### E1 — native statement expressibility

Represent all supplied load-bearing statement distinctions natively. `FORMAL_LOGIC_BENCHMARKS_003.axh` is primarily this statement/formalization scaffold.

### E1P — primitive semantic decomposition

Ground conventional derived operators in native construction plus justified primitive/model leaves.

### E1A — alias/factorization expansion

Retained aliases must reach qualified lower constructions. Expansion produces a factorization node; uniqueness is not assumed.

### E1C — structural-class classification

Classification follows structural evidence and a verified membership witness. Source vocabulary is not membership evidence.

### E1E — class/instance expansion

Retained class/domain labels must expand through a versioned schema/factorization without losing residual constraints or ports.

### E1N — normalization-layer audit

Keep N0/N1 separate from D definitions and E theorem/profile equivalences.

### E1F — factorization audit

Preserve materially distinct qualified factorizations or report dependence/incompleteness explicitly.

### E1W — witnessed comparison

Every structural relationship carries the mapping/correspondence, boundaries, parameters, constraints, common core, residuals, factorization set, and relation kind.

### E1B — boundary/composition audit

Test ports, gluing, compatibility, and joint realizability.

### E1L — label-blind audit

Hide/permute non-evidential source/class labels. The structural answer must survive.

### E1M — mapping multiplicity audit

Preserve materially distinct witnesses/maximal cores or justify their automorphism/equivalence quotient.

### E1Q — comparison-policy freeze audit

Freeze view, role rules, D/E authorities, factorization bounds, target layer, and scoring objective before expected mappings/results are unblinded.

### E1D — decomposition exactness/recursion audit

Exact D edges must round-trip. Recursive definitions require explicit base/step/fixed-point authority.

### E1S — symbol/bundle namespace audit

Stable semantic labels are namespace-qualified. Multi-document partitioning must preserve namespaces/binding/activation/boundaries.

### E1V — independent witness/certificate verification

Discovery and verification are separate. A mapping or negative certificate must be independently checkable against frozen inputs/policy.

### E1T — target-layer/conclusion-scope audit

Do not promote representation/schema similarity into denotational/source-theory equivalence without a qualified bridge.

### E2 — cold reconstruction

A fresh decoder reconstructs benchmark objects from the permitted native bundle/specs. E2 does not imply the structural gates above.

### E3 — proof-profile completeness

Supply complete native semantic/proof authority for the benchmark.

### E4 — proof execution

Produce the appropriate proof object, countermodel/non-derivability result, consistency result, extracted witness/program, or bounded result.

### E5 — independent proof review

Check every proof step and all representation/factorization dependencies.

## Specification pressure lineage

### Draft 0.5

Added first-class bound-body surface:

```text
\?n term
```

Useful surface retained; primitive status open.

### Draft 0.6

Added:

```text
ABSTRACTION @@ ARGUMENT
```

Useful construction surface retained; Draft 0.9/0.10 require comparison against constrained structural rewrite before primitive promotion.

### Draft 0.7

Required decomposition of known compound operators instead of stopping at stable labels.

### Draft 0.8

Retained useful labels and introduced structural-class recognition after decomposition.

### Draft 0.9

Made isomorphism safety constitutional: plural factorizations, explicit comparison projections, witnessed common-core/residual results, boundaries/ports, label-blind controls, and demotion of unproven surface syntax from assumed primitive status.

### Draft 0.10

Second-pass line review found and corrected remaining comparison defects:

- view policy, transformation authority, and relation kind are separate axes;
- comparison policy cannot adapt after seeing the expected answer;
- stable `^n` identities are theory/signature namespaced;
- exact decompositions require round trips and guards;
- recursive definition cycles require fixed-point authority;
- quantifier domains/generators are explicit dependencies;
- behavior-changing carrier roles and absence-completeness assumptions are preserved;
- schema parameters may be structured objects and cannot be added post hoc;
- class-class relations require witnesses;
- qualified schema/dependency revisions are immutable/versioned;
- discovery and witness verification are separate;
- “no witness found” is not “non-isomorphic”;
- factorization-set completeness scopes negative/global claims;
- strong/weak embedding and relational correspondences are distinct;
- representation/schema isomorphism is separated from denotational equivalence;
- mapping opaque leaves yields parametric structural analogy, not automatic semantic equivalence;
- class promotion requires independent/held-out evidence;
- circular class/decomposition evidence is prohibited;
- legacy artifacts require rerendering or exact current-semantics bridges for new structural qualification.

Primary corrective artifacts:

- `../../CORE_SPEC_DRAFT_0_10_CANDIDATE.md`
- `SPEC_LINE_REVIEW_003_ISOMORPHISM.md`
- `SPEC_LINE_REVIEW_004_ISOMORPHISM_SECOND_PASS.md`
- `STRUCTURAL_COMPARISON_PROTOCOL_003.md`
- `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`
- `STRUCTURAL_CLASS_CATALOG_004.md`
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md`
- `CORE_SURFACE_PRIMITIVE_AUDIT_003.md`

## Current benchmark bundle

Native benchmark objects remain `3001..3018`, corresponding to `FL-001..FL-018` in `SOURCE_BENCHMARKS_003.md`.

Artifacts:

- `SOURCE_BENCHMARKS_003.md` — frozen source intent;
- `FORMAL_LOGIC_BENCHMARKS_003.axh` — statement/formalization scaffold;
- `SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh` — exact **surface** signature for that historical scaffold;
- `SEMANTIC_GLOSS_003.json` — reviewer/scorer names only;
- `COLD_RECONSTRUCTION_PROMPT_003.md` — E2 protocol;
- `PROOF_EXECUTION_PROTOCOL_003.md` — E3-E5 protocol;
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md` — benchmark decomposition disposition;
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md` — shared semantic foundations;
- `STRUCTURAL_CLASS_CATALOG_004.md` — current candidate class/factorization catalog;
- `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md` — class revision/witness contract;
- `STRUCTURAL_CLASS_REGISTRY_003.axh` — historical/current navigation hypotheses only, forbidden as blind discovery evidence;
- `STRUCTURAL_COMPARISON_PROTOCOL_003.md` — current comparison protocol;
- `RESULTS_003.md` — durable qualification state.

## Source caveats

Still retained:

- PHP, XOR parity, and muddy children require frozen concrete instances for measured runs;
- Steamroller requires exact premise import;
- Chisholm requires an explicitly selected deontic semantics;
- the supplied Cantor statement is not silently replaced by a different theorem statement;
- well-founded induction requires explicit well-foundedness authority;
- Church–Rosser requires a concrete reduction/inductive theory.

## Success condition

Experiment 003 does not pass because formulas parse, operators have numeric IDs, or a classifier returns expected labels.

The end state is:

```text
18 source-faithful problems
-> native reconstruction
-> semantic decomposition
-> factorization preservation
-> frozen-policy label-blind comparison
-> independently verified mappings/certificates
-> common-core/residual recovery
-> versioned structural-class recognition
-> retained useful labels
-> complete native proof profiles
-> correct proof/counterresults
-> independent proof review
```

The central structural question is:

> Can AxiomeSH recover the strongest justified cross-domain correspondence without labels, policy choices, factorization choices, search limits, or hidden semantics deciding the answer?
