# Experiment 003 — Results

**Status:** 18-benchmark source corpus/native statement scaffold constructed; Drafts 0.5–0.9 produced; primitive-decomposition, factorization, label-blind witnessed-comparison, and structural-class gates active; several shared semantic foundations and one explicit proof-term candidate exist; independent qualification and proof execution remain pending.

## Added benchmark surface

Experiment 003 contains 18 benchmark objects across six broad domains:

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

Native structural IDs are `3001..3018` in source order `FL-001..FL-018`.

---

# Specification pressure lineage

## Draft 0.5 — bound-body surface

Added:

```text
\?n term
```

and made proof-theory neutrality explicit.

Current disposition: useful bound-body surface; irreducible primitive status not established.

## Draft 0.6 — structural instantiation surface

Added:

```text
ABSTRACTION @@ ARGUMENT
```

plus explicit abstraction-valued quantifier forms.

Focused author-side cases exist under `instantiation/`; independent cold qualification remains pending.

Draft 0.9 now demotes the claim that `@@` is already an irreducible core primitive. It remains a useful named construction while an ordinary structural-rewrite factorization is tested.

## Draft 0.7 — primitive semantic decomposition

Corrected the overly permissive idea that a conventional operator becomes native merely by receiving a stable `^n` name.

Required direction:

```text
named formal operator
-> native semantic construction
-> justified primitive/model leaves
```

The original 18-case payload is therefore a statement/formalization scaffold, not primitive-semantic completion for every logic.

## Draft 0.8 — structural classes and retained labels

Corrected the opposite risk: useful labels/surfaces should remain available even when their semantics decompose.

Required direction became:

```text
source concept
-> decomposition
-> native construction
-> structural class
-> retained class/domain label
```

## Draft 0.9 — isomorphism-safe factoring and witnessed comparison

A line-by-line review of Drafts 0.1–0.8 found that Draft 0.8 still left several dangerous gaps for the project's central isomorphism objective.

Draft 0.9 corrects them:

```text
source semantics
-> one or more qualified decompositions/factorizations
-> N0/N1 representation-only normalization
-> label-blind structural comparison under explicit projection
-> mapping/common-core/residual witness
-> structural-class recognition
-> retained useful labels
```

Key corrections:

- decomposition is a relation and may have multiple valid factorization nodes;
- a unique primitive-normal form is not assumed without confluence/uniqueness evidence;
- serialization normalization, structural alpha/boundary normalization, definitional expansion, and theorem/profile equivalence are separate layers;
- every isomorphism/class result names its comparison projection;
- semantic labels are rigid by default but may map only under an explicit witnessed projection;
- literals remain rigid, while class schemas may explicitly parameterize literal positions;
- class schemas require ports/boundaries, parameters, invariants, mappings, and residual policy;
- class membership requires a schema-to-instance witness;
- composite classes require gluing/joint-realizability witnesses;
- partial isomorphism returns a common core plus explicit residuals;
- class/domain labels are forbidden as discovery evidence during label-blind qualification;
- same interior/different boundary, near-isomorphic, partial, alternate-factorization, and misleading-label controls are mandatory;
- surface signatures are representation-layer facts, not semantic-isomorphism criteria;
- new canonical artifacts may not depend on context-only scope-as-conjunction or `+?n` existential/freshness overloading.

Corrective artifacts:

- `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`
- `SPEC_LINE_REVIEW_003_ISOMORPHISM.md`
- `STRUCTURAL_COMPARISON_PROTOCOL_003.md`
- updated `STRUCTURAL_CLASS_CATALOG_003.md`
- updated `STRUCTURAL_CLASS_REGISTRY_003.axh`
- `STRUCTURAL_CLASS_REGISTRY_003.md`

---

# Native statement bundle

Artifacts:

- `FORMAL_LOGIC_BENCHMARKS_003.axh`
- `SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh`
- `FORMALIZATION_AUDIT_003.md`
- `SEMANTIC_GLOSS_003.json` — reviewer/scorer gloss only, forbidden during cold E2.

Author-side construction checks remain:

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

These counts establish closure of that **surface scaffold**, not primitive semantic sufficiency or unique canonical decomposition.

---

# Structural-class correction

The catalog retains candidate labels C1–C12 / `^9101..^9112`, but no longer treats them as a flat ontology.

Current family/factorization hypotheses include:

```text
C1 universal evaluation
C2 existential evaluation
C3 immediate-successor evaluation
```

as possible specializations of a broader **evaluation over a generated region** family.

Additional hypotheses:

- C7 transition-preservation may factor as precondition gating + universal evaluation over transition successors;
- C10 bound-body instantiation may factor through constrained structural rewrite;
- C11 functional-graph application may factor through relation-image selection + uniqueness/totality constraints.

These labels are deliberately retained so agents can identify/retrieve candidate constructions while the class boundaries are tested.

## Registry correction

The original native registry used direct candidate source-to-class edges.

It now encodes each mapping as a separate **unqualified hypothesis object** with witness-pending status.

Direct class assertions are no longer structurally indistinguishable from qualified membership.

The registry is prohibited as input to label-blind discovery qualification.

---

# Candidate core-surface audit

`CORE_SURFACE_PRIMITIVE_AUDIT_003.md` separates:

```text
semantic distinction required?
compact/canonical surface useful?
irreducible primitive status demonstrated?
```

Current highest-risk surfaces/semantics:

1. Draft 0.6 `@@` — likely candidate for rewrite-level decomposition;
2. formula-scope conjunction — context-sensitive semantic overload;
3. `+?n` existential/freshness overload — context-sensitive semantic overload;
4. lexical abstraction — useful surface, lower binder/occurrence construction still to compare;
5. `^0` signature marker — serialization convention, not proven primitive;
6. stable `^n` token class — useful labels, but cross-domain comparison requires explicit mapped-signature projection;
7. exact literals — useful rigid-value shorthand, while class schemas may expose selected literal positions as parameters.

Historical experiment payloads keep their old decode rules. New Draft 0.9 canonical artifacts must make semantic role explicit enough for structural comparison.

---

# Primitive semantic foundations constructed author-side

## Shared formula satisfaction

`foundations/FOUNDATION_FORMULA_SAT_003.axh`

Provides recursive satisfaction for the exercised propositional constructors.

Draft 0.9 warning: formula-scope conjunction in this foundation is a candidate surface/profile construction and must not be generalized into an unmarked universal meaning of raw `[]`.

## Generic finite path construction

- `foundations/FOUNDATION_FINITE_PATH_003.axh`
- `foundations/FOUNDATION_FINITE_PATH_003.md`

Constructs zero-or-more reachability from a primitive one-step relation and explicit finite path witnesses.

Candidate class relation: C4 / `^9104`; witnessed cross-domain qualification pending.

## Linear temporal trace foundation

- `foundations/FOUNDATION_LTL_TRACE_003.axh`
- `foundations/FOUNDATION_LTL_TRACE_003.md`
- `instances/FL_011_LTL_PRIMITIVE_003.axh`

Uses a linear future-order model and derives `X/F/G` through satisfaction rather than primitive temporal tokens.

Candidate class/family mappings to F1/C1/C2/C3 are unqualified hypotheses pending label-blind witnesses.

## Epistemic / public-announcement foundation

- `foundations/FOUNDATION_KRIPKE_EPISTEMIC_003.axh`
- `foundations/FOUNDATION_KRIPKE_EPISTEMIC_003.md`
- `profiles/PROFILE_EPISTEMIC_S5_RELATIONAL_003.axh`
- `profiles/PROFILE_EPISTEMIC_S5_RELATIONAL_003.md`

Constructs knowledge, common knowledge, announcement restriction, and S5 relation constraints from worlds/accessibility/valuation/group structure.

Candidate class mappings remain witness-pending.

## Explicit proof-object foundation

- `foundations/FOUNDATION_PROOF_OBJECT_003.axh`
- `foundations/FOUNDATION_PROOF_OBJECT_003.md`

Provides explicit proof-term/context/conclusion structure rather than an unexplained theorem boolean.

Candidate class relation to C8 is unqualified.

## Constructive/classical natural-deduction proof terms

- `profiles/PROFILE_ND_CONSTRUCTIVE_BASE_003.axh`
- `profiles/PROFILE_ND_INTUITIONISTIC_PRIMITIVE_003.axh`
- `profiles/PROFILE_ND_CLASSICAL_PRIMITIVE_003.axh`

Constructive proof constructors are explicit; the classical profile adds a distinct DNE constructor.

## FL-001 Peirce proof-term candidate

- `proofs/FL_001_PEIRCE_PROOF_CANDIDATE_003.axh`
- `proofs/FL_001_PEIRCE_PROOF_CANDIDATE_003.md`

Explicit proof-term tree exists. Its only classical-only step is the DNE constructor.

This remains candidate proof data, not E4 proof evidence. Negative control under the intuitionistic profile remains required.

## Heap / separation foundation

- `foundations/FOUNDATION_HEAP_SEPARATION_003.axh`
- `foundations/FOUNDATION_HEAP_SEPARATION_003.md`

Constructs disjointness, union, points-to satisfaction, separating conjunction, and Hoare partial-correctness from heap/program-state structure.

C6/C7 mappings remain candidate and C7 has an explicit factorization challenge under Draft 0.9.

All current foundations remain author-side candidates pending independent cold reconstruction, factorization/label controls, and proof qualification.

---

# Qualification gates

```text
E0   source fidelity
E1   native statement expressibility
E1P  primitive semantic decomposition
E1A  alias/factorization expansion
E1C  structural-class classification after witness
E1E  class/instance expansion
E1N  normalization-layer audit
E1F  alternative-factorization audit
E1W  witnessed comparison/common-core/residual audit
E1B  boundary/port/joint-realizability audit
E1L  label-blind discovery audit
E2   isolated cold reconstruction
E3   proof-profile completeness
E4   proof execution
E5   independent proof review
```

E1P through E1L block any E3/E4 claim that depends on the relevant class/isomorphism relation.

---

# Qualification state

```text
E0 source fidelity:
  18 benchmark intents copied: COMPLETE author-side
  source caveats explicit: COMPLETE

E1 statement/native expressibility:
  18 benchmark envelopes rendered: COMPLETE author-side
  surface signature closure: PASS author-side
  complete proof-problem input: PARTIAL

E1P primitive semantic decomposition:
  per-benchmark audit: COMPLETE
  formula satisfaction: CONSTRUCTED author-side
  finite path/reachability: CONSTRUCTED author-side
  proof-object structure: CONSTRUCTED author-side
  constructive/classical ND: CONSTRUCTED author-side
  LTL exercised surface: CONSTRUCTED author-side
  epistemic/PAL/S5: CONSTRUCTED author-side candidate
  heap/separation/Hoare: CONSTRUCTED author-side candidate
  deontic/HOL/FOL/parity/CTL: PENDING
  independent foundation qualification: PENDING

E1A alias/factorization expansion:
  protocol concept: SPECIFIED
  executions: PENDING

E1C structural-class classification:
  catalog: CREATED / corrected for factorization families
  candidate native labels: RETAINED
  qualified membership witnesses: NONE YET

E1E class/instance expansion:
  protocol: SPECIFIED
  executions: PENDING

E1N normalization-layer audit:
  N0/N1/D/E distinction: SPECIFIED in Draft 0.9
  executions: PENDING

E1F alternative-factorization audit:
  protocol: SPECIFIED
  executions: PENDING

E1W witnessed comparison:
  protocol: CREATED
  qualified cross-domain witnesses: NONE YET

E1B boundary/composition audit:
  protocol: SPECIFIED
  executions: PENDING

E1L label-blind audit:
  registry exclusion/randomized-label control: SPECIFIED
  executions: PENDING

Candidate-core primitive audit:
  line-by-line Draft 0.1–0.8 review: COMPLETE
  corrective Draft 0.9: CREATED
  @@ rewrite-decomposition comparison: PENDING
  binder-vs-quantifier separation: PENDING
  formula-scope conjunction correction test: PENDING
  semantic-label mapping/role test: PENDING
  signature layer-relative test: PENDING

Draft 0.6 instantiation:
  candidate + focused cases: COMPLETE author-side
  independent cold qualification: PENDING

E2 cold reconstruction of statement bundle:
  protocol frozen: COMPLETE
  independent run: PENDING

E3 proof-profile completeness:
  constructive ND candidate: EXISTS, unqualified
  classical extension: EXISTS, unqualified
  FL-001 proof-term candidate: EXISTS, unvalidated
  epistemic S5 relational candidate: EXISTS, foundation unqualified
  FOL/HOL: BLOCKED on instantiation/primitive/factorization audits
  LTL: semantic foundation exists; proof still pending
  spatial: semantic foundation exists; concrete swap/locality proof pending
  CTL/deontic/parity: foundations pending

E4 proof execution:
  no independently validated proof yet

E5 independent proof review:
  PENDING
```

---

# Claims not yet allowed

Experiment 003 does not establish:

- that all 18 benchmarks are complete formal proof problems;
- that any author-side primitive foundation is independently correct;
- that any candidate structural class is qualified;
- that any source-to-class mapping in the registry is proven;
- that one unique primitive-normal factorization exists;
- that the Peirce proof candidate is a validated E4 proof;
- that all 18 benchmarks are provable from the current native bundle;
- that AxiomeSH outperforms natural-language, TPTP, SMT-LIB, Lean/Coq/Isabelle, or another representation;
- that any current derived alias/class is optimal;
- that every syntax form introduced since Draft 0.1 is irreducible core;
- that Draft 0.5–0.9 improve proof or synthesis performance.

The required standard is now:

```text
source-faithful statement
+ primitive semantic construction
+ alternative-factorization preservation
+ label-blind witnessed structural comparison
+ explicit boundaries/ports
+ common-core/residual recovery
+ structural-class recognition from witnesses
+ retained useful labels
+ explicit proof authority
+ cold reconstruction
+ proof execution
+ independent proof review
```
