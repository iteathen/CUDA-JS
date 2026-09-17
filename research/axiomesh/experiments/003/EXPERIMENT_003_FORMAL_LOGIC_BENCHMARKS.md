# Experiment 003 — Cross-Logic Proof Benchmark Campaign

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Candidate spec lineage:** Draft 0.5 → Draft 0.6 → Draft 0.7 → Draft 0.8 → Draft 0.9  
**Status:** benchmark corpus constructed; primitive decomposition, witnessed structural comparison, and structural-class qualification are mandatory before proof qualification

## Purpose

Experiment 003 tests whether AxiomeSH can represent and support agent reasoning across formal systems whose proof rules differ materially, rather than succeeding only on one structural research corpus.

The suite contains 18 benchmark families spanning:

- classical propositional logic;
- SAT/CNF hardness and parity;
- first-order logic and equality;
- modal/epistemic/deontic logic;
- temporal and program logic;
- intuitionistic/constructive logic;
- higher-order logic and type theory.

The primary risk is not syntax coverage. The risk is semantic disguise or structural contamination:

- familiar notation becoming opaque native IDs;
- labels deciding the class they are supposed to identify;
- a preferred decomposition manufacturing an apparent isomorphism;
- canonicalization silently applying semantic equivalences;
- boundary/residual constraints being discarded to make structures look alike.

Useful names remain after decomposition for retrieval/construction, but they are evidentially downstream of the structural result.

## Governing rules

For every benchmark:

```text
statement representation
!= primitive semantic construction
!= structural comparison/class witness
!= proof profile
!= proof
!= reviewed proof
```

The construction/discovery order is:

```text
source semantics
-> one or more qualified decompositions/factorizations
-> N0/N1 representation normalization
-> label-blind structural comparison
-> explicit mapping/common-core/residual witness
-> structural-class recognition
-> retained source/class labels
```

A named operator represented only as `^n` is not primitive-semantic completion.

A class/domain label may retrieve candidate objects but may not establish the relationship it names.

## Gates

### E0 — source fidelity

Preserve the supplied theorem/premises/domain/test intent without silently repairing under-specified or noncanonical statements.

### E1 — native statement expressibility

Represent every supplied load-bearing statement distinction natively, including formula structure, literals, binding, premises/goals, parameterization, profile identity, and readiness.

The existing `FORMAL_LOGIC_BENCHMARKS_003.axh` is primarily a statement/formalization scaffold.

### E1P — primitive semantic decomposition

Every conventional derived operator used by the proof obligation must be grounded in a native construction over currently admitted structural forms plus explicitly justified primitive/model leaves.

A compact alias may remain only if its native construction is available.

### E1A — alias expansion/erasure

For every retained derived alias, verify that expanding the alias reaches a qualified lower native construction without losing the obligation.

Draft 0.9 tightens this: the result is a **qualified factorization node**, not automatically a unique “primitive-normal form.”

### E1C — structural-class classification

After decomposition and structural comparison, classify an object as:

```text
exact instance
specialization
composition
embedding/common-core case
new candidate structural class
```

Classification follows a mapping witness. Source naming is not evidence.

### E1E — class/instance expansion

For retained class/domain labels, verify:

```text
source/domain label
-> class/schema instance
-> qualified native factorization
```

while retaining residual constraints and ports.

### E1N — normalization-layer audit

Verify that:

```text
N0 serialization normalization
N1 alpha/boundary structural normalization
D definitional expansion
E profile/theorem equivalence
```

remain separate.

N0/N1 must not silently perform D/E transformations.

### E1F — factorization audit

Record materially different qualified decompositions/factorizations.

Structural results must either:

- survive the alternative factorizations; or
- report their factorization dependence explicitly.

A preferred factorization may not be selected merely because it produces the expected analogy.

### E1W — witnessed structural comparison

Every isomorphism/class claim must carry a witness containing at least:

```text
comparison projection
selected factorizations
node/edge mapping
binding mapping
boundary/port mapping
semantic-label mapping if allowed
schema-parameter mapping
constraints checked
common core
residual A
residual B
```

A bare class edge/boolean result is insufficient.

### E1B — boundary/composition audit

Test external ports and joint realizability.

Same interior does not imply component substitutability.

Composite class claims require an explicit gluing/compatibility witness.

### E1L — label-blind audit

Hide or permute source/domain and class labels and rerun the structural discovery.

The witnessed structural relationship must remain unchanged except for corresponding identifier renaming.

`STRUCTURAL_CLASS_REGISTRY_003.axh` is explicitly forbidden as discovery evidence during this gate.

### E2 — cold reconstruction

A fresh decoder receives only applicable specs, native signatures, frozen cold prompt, and native benchmark bundle. It reconstructs benchmark objects and reports ambiguity/hidden dependency.

E2 statement reconstruction does not imply E1P/E1C/E1W.

### E3 — proof-profile completeness

Each benchmark receives a self-contained native proof/semantic profile sufficient to determine admissible proof steps from native foundations rather than model priors or opaque host operations.

### E4 — proof execution

A fresh agent produces the appropriate proof object, countermodel/non-derivability result, consistency result, witness/program, or parameterized result.

### E5 — independent proof review

Review every proof step against the supplied profile/foundations and record correctness, proof size, search effort, representation difficulty, factorization/class expansion, and semantic leakage.

## Specification pressure lineage

### Draft 0.5 — first-class lexical abstraction

Introduced the bound-body surface:

```text
\?n term
```

Its useful surface remains; irreducible primitive status is still open.

### Draft 0.6 — structural instantiation

Introduced:

```text
ABSTRACTION @@ ARGUMENT
```

Draft 0.9 demotes `@@` from assumed core status to candidate bound-body-instantiation surface until ordinary structural-rewrite decomposition is compared.

### Draft 0.7 — primitive semantic decomposition

Requires known compound operators to expose their native semantic construction rather than stop at a stable label.

### Draft 0.8 — structural classes and retained labels

Keeps useful labels while requiring decomposition before class recognition.

### Draft 0.9 — isomorphism-safe factoring and witnessed comparison

Corrects the remaining risks:

- decomposition is plural by default, not one mandatory normal form;
- normalization is separated from definitional/theorem equivalence;
- class schemas require ports/constraints;
- class membership requires a witness;
- partial isomorphism returns common core plus residuals;
- mapped semantic labels require explicit comparison projection;
- label-blind and boundary-negative controls are mandatory;
- context-only semantic overloads are prohibited in new canonical artifacts.

Artifacts:

- `../../CORE_SPEC_DRAFT_0_7_CANDIDATE.md`
- `../../CORE_SPEC_DRAFT_0_8_CANDIDATE.md`
- `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`
- `SPEC_LINE_REVIEW_003_ISOMORPHISM.md`
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md`
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md`
- `STRUCTURAL_CLASS_CATALOG_003.md`
- `STRUCTURAL_CLASS_REGISTRY_003.axh`
- `STRUCTURAL_CLASS_REGISTRY_003.md`
- `STRUCTURAL_COMPARISON_PROTOCOL_003.md`
- `CORE_SURFACE_PRIMITIVE_AUDIT_003.md`

## Primitive versus derived examples

Potential primitive/model leaves include:

- atomic proposition valuation;
- domain/object identities and source predicate facts;
- one-step accessibility/transition/reduction edges;
- heap address/value incidence;
- source algebraic operations constrained by explicit axioms.

A source-provided name is not enough to justify primitive status. Leaf provenance must identify whether it is observational input, stipulated source relation, implementation fact, undecomposed candidate, or qualified representation primitive.

Presumptively derived constructions include:

- finite AND/OR folds;
- XOR/parity evaluation;
- biconditional;
- epistemic knowledge/common knowledge;
- public-announcement update;
- deontic obligation/permission after choosing a semantics;
- LTL/CTL operators;
- separating conjunction/Hoare validity/frame rule;
- theorem/derivability predicates;
- reflexive-transitive closure;
- higher-order application/lambda/Pi behavior used by proofs.

These derived forms may retain compact names after their native constructions exist.

## Structural-class/factorization examples

Current candidate labels include C1–C12, but Draft 0.9 treats the catalog as a hypothesis lattice rather than a flat ontology.

Current factorization hypotheses include:

```text
C1 universal evaluation
C2 existential evaluation
C3 immediate-successor evaluation
```

as possible specializations of a broader evaluation-over-generated-region family.

Likewise:

- C7 transition preservation may factor through universal evaluation over transition successors;
- C10 bound-body instantiation may factor through constrained structural rewrite;
- C11 functional application may factor through relation-image selection + uniqueness/totality constraints.

The labels remain useful while those relationships are tested.

## Benchmark families

Native benchmark objects are `3001..3018`, corresponding in order to `FL-001..FL-018` in `SOURCE_BENCHMARKS_003.md`.

The initial native bundle preserves source statement structure/readiness. It is not a unique primitive-normal form for every logic.

## Source caveats retained as test data

- PHP, XOR parity, and muddy children require frozen concrete instances for measured runs.
- Steamroller requires exact premise import before proof scoring.
- Chisholm is profile-sensitive and cannot receive a generic obligation semantics by convenience.
- Cantor's supplied statement is preserved and not silently replaced by a different canonical theorem formulation.
- Well-founded induction requires explicit well-foundedness authority.
- Church–Rosser requires a concrete reduction/inductive theory.

## Foundation ownership

Work is organized by reusable semantic mechanism rather than benchmark name:

- proof objects and derivation trees;
- finite index/fold/parity;
- FOL domain/equality/binder instantiation;
- possible worlds/accessibility/satisfaction;
- public-announcement restriction/update;
- linear trace temporal semantics;
- branching transition/path semantics;
- selected normative/deontic semantics;
- heap/resource/program semantics;
- higher-order function/predicate/application structure;
- finite reduction paths/closure.

Shared relational shapes should share qualified structural classes/factorizations only when a witness preserves all residual constraints.

## Artifacts

- `SOURCE_BENCHMARKS_003.md` — frozen human/source intent.
- `FORMAL_LOGIC_BENCHMARKS_003.axh` — native statement/formalization scaffold.
- `SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh` — exact **surface** signature for that scaffold.
- `SEMANTIC_GLOSS_003.json` — reviewer/scorer names only.
- `COLD_RECONSTRUCTION_PROMPT_003.md` — E2 statement reconstruction protocol.
- `PROOF_EXECUTION_PROTOCOL_003.md` — E3-E5 protocol.
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md` — benchmark-by-benchmark decomposition disposition.
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md` — shared semantic foundation design.
- `STRUCTURAL_CLASS_CATALOG_003.md` — candidate class/factorization hypotheses.
- `STRUCTURAL_CLASS_REGISTRY_003.axh` — navigation hypothesis registry, excluded from label-blind discovery.
- `STRUCTURAL_COMPARISON_PROTOCOL_003.md` — witnessed comparison/isomorphism protocol.
- `CORE_SURFACE_PRIMITIVE_AUDIT_003.md` — candidate-core primitive/surface audit.
- `SPEC_LINE_REVIEW_003_ISOMORPHISM.md` — line-by-line lineage review and correction record.
- `RESULTS_003.md` — durable qualification state.

## Success condition

Experiment 003 does not pass because all 18 formulas parse, because familiar operators have native IDs, or because a classifier returns expected class labels.

The meaningful end state is:

```text
18 source-faithful problems
-> native statement reconstruction
-> primitive semantic decomposition
-> alternative-factorization preservation
-> label-blind witnessed structural comparison
-> common-core/residual recovery
-> structural-class recognition
-> retained useful domain/class labels
-> explicit native proof profiles
-> correct proof/counterresults
-> independent proof review
```

The central structural test is:

> Can AxiomeSH expose the strongest correct cross-domain correspondence while preserving every load-bearing difference needed to falsify that correspondence?
