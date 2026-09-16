# Experiment 003 — Results

**Status:** 18-benchmark source corpus and native statement scaffold constructed; Drafts 0.5/0.6 produced; Draft 0.7 primitive-decomposition gate active; multiple shared primitive semantic foundations and first explicit proof-term candidate constructed; independent qualification and proof execution remain pending.

## Added benchmark surface

Experiment 003 contains 18 benchmark objects covering six broad domains:

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

## Specification pressure lineage

### Draft 0.5

Experiment 003 first exposed the need for first-class lexical abstraction:

```text
\?n term
```

Draft 0.5 also made proof-theory neutrality explicit.

### Draft 0.6

Construction of FOL/equality profiles exposed a second representation-general gap: a bound native body could be packaged but not capture-avoidably instantiated without hidden host substitution.

Draft 0.6 therefore proposes structural instantiation:

```text
ABSTRACTION @@ ARGUMENT
```

plus explicit abstraction-valued quantifier forms.

Focused author-side cases exist under `instantiation/`; independent cold qualification is still pending. FOL/HOL profiles remain blocked on that result.

### Draft 0.7

A semantic-decomposition review found that Draft 0.5 was too permissive if interpreted as allowing standard formal operators to become semantically complete merely by receiving stable `^n` names.

Draft 0.7 adds no new notation. It adds a stricter representation rule:

```text
named formal operator
-> native semantic construction
-> primitive model leaves
```

rather than:

```text
named formal operator
-> opaque semantic symbol
```

The existing benchmark payload is retained as a **statement/formalization scaffold**, not as primitive-semantic completion for modal, temporal, deontic, spatial, proof-meta, closure, or higher-order semantics.

See:

- `../../CORE_SPEC_DRAFT_0_7_CANDIDATE.md`
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md`
- `PRIMITIVE_FOUNDATION_ARCHITECTURE_003.md`

## Native statement bundle

Artifacts:

- `FORMAL_LOGIC_BENCHMARKS_003.axh`
- `SEMANTIC_SIGNATURE_003_DRAFT_0_5.axh`
- `FORMALIZATION_AUDIT_003.md`
- `SEMANTIC_GLOSS_003.json` — reviewer/scorer gloss only, forbidden during cold E2.

Author-side construction checks:

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

These counts prove structural closure of the scaffold, not primitive semantic sufficiency.

## Primitive semantic foundations now constructed

### Shared formula satisfaction

`foundations/FOUNDATION_FORMULA_SAT_003.axh`

Provides a shared recursive satisfaction surface for:

- atomic valuation;
- single/binary conjunction scopes;
- binary choice/disjunction;
- implication;
- declarative negation.

This prevents LTL, epistemic, and later semantic profiles from each inventing unrelated boolean evaluator symbols.

### Generic finite path construction

- `foundations/FOUNDATION_FINITE_PATH_003.axh`
- `foundations/FOUNDATION_FINITE_PATH_003.md`

Constructs zero-or-more reachability from:

- a primitive one-step relation edge;
- zero-path constructor;
- recursive path-step constructor;
- explicit path witness.

A compact reachability alias is defined by existence of such a witness and is therefore erasure-safe in principle.

This is intended to be shared by common knowledge, CTL/path reasoning, and reduction closure.

### Linear temporal trace foundation

- `foundations/FOUNDATION_LTL_TRACE_003.axh`
- `foundations/FOUNDATION_LTL_TRACE_003.md`
- `instances/FL_011_LTL_PRIMITIVE_003.axh`

The primitive temporal model uses one reflexive linear future-order relation plus trace positions/atomic valuation. Immediate successor is derived from the discrete order; `X`, `F`, and `G` are then defined through shared satisfaction rather than taken as primitives.

FL-011 now has a separate primitive-semantic obligation object; no proof has yet been claimed.

### Epistemic / public-announcement foundation

- `foundations/FOUNDATION_KRIPKE_EPISTEMIC_003.axh`
- `foundations/FOUNDATION_KRIPKE_EPISTEMIC_003.md`
- `profiles/PROFILE_EPISTEMIC_S5_RELATIONAL_003.axh`
- `profiles/PROFILE_EPISTEMIC_S5_RELATIONAL_003.md`

Primitive leaves are worlds, agents, accessibility-relation identities/edges, group membership, and atomic valuation.

Constructed semantics include:

- individual knowledge as universal satisfaction over accessible worlds;
- common knowledge as satisfaction over explicit finite paths in the union of group accessibility edges;
- public announcement as an explicit restricted-model construction;
- S5 authority as reflexive/symmetric/transitive accessibility structure, not opaque introspection axioms.

### Explicit proof-object foundation

- `foundations/FOUNDATION_PROOF_OBJECT_003.axh`
- `foundations/FOUNDATION_PROOF_OBJECT_003.md`

Proof authority is no longer modeled only as a boolean-like `derivable(context,formula)` relation.

The shared foundation now carries:

- native context construction and recursive membership;
- `concludes(profile,context,proof_term,formula)`;
- theoremhood as existence of a concrete proof term in the empty context.

The foundation supplies no primitive proof conclusions. Profiles must construct them from explicit rule-specific proof-term constructors.

### Constructive/classical natural-deduction proof terms

- `profiles/PROFILE_ND_CONSTRUCTIVE_BASE_003.axh`
- `profiles/PROFILE_ND_INTUITIONISTIC_PRIMITIVE_003.axh`
- `profiles/PROFILE_ND_CLASSICAL_PRIMITIVE_003.axh`

The constructive base explicitly defines proof constructors for assumption, implication introduction/elimination, negation, bottom, conjunction, disjunction, and case analysis.

The classical profile adds one classical-only proof constructor for double-negation elimination. The intuitionistic profile does not.

This gives the classical/constructive boundary a concrete structural location in the proof term rather than a hidden global proof mode.

### FL-001 Peirce proof-term candidate

- `proofs/FL_001_PEIRCE_PROOF_CANDIDATE_003.axh`
- `proofs/FL_001_PEIRCE_PROOF_CANDIDATE_003.md`

An explicit proof-term tree has been constructed for Peirce's law. Its only classical-only step is the DNE constructor.

This is **not yet an E4 proof claim**. The artifact is candidate proof data; independent validation must recursively establish every constructor against the native profile. The required negative control is that the same proof term fails under the intuitionistic profile when the DNE constructor is unavailable.

### Heap / separation foundation

- `foundations/FOUNDATION_HEAP_SEPARATION_003.axh`
- `foundations/FOUNDATION_HEAP_SEPARATION_003.md`

Primitive leaves are heap address/value incidence and concrete program-state transition.

Constructed semantics include:

- heap-cell functionality;
- disjointness as absence of a shared address;
- extensional disjoint heap union;
- points-to as singleton-heap satisfaction;
- separating conjunction as existential disjoint partition + subheap satisfaction;
- Hoare partial-correctness validity from program transition + pre/post satisfaction.

The frame rule is deliberately **not** primitive. It must be derived from explicit locality/disjointness conditions. Concrete swap transition semantics are still pending.

All foundations above are author-side candidates. Cold reconstruction, alias-erasure, and proof qualification are still required.

## Primitive-decomposition correction

The following conventional operators/concepts must not remain opaque when their semantics are constructible:

- finite AND/OR folds and parity/XOR;
- biconditional;
- epistemic `K_i`, common knowledge, public announcement;
- obligation/permission under the selected deontic semantics;
- LTL `G/F/X/U`;
- CTL `A/E`, `AG/EF`;
- separating conjunction, Hoare validity, frame rule;
- proof/derivable predicates;
- reflexive-transitive closure;
- higher-order application/lambda/Pi behavior where used by proof.

Their semantic mechanisms must be represented from lower-level relational/state structure. Named aliases may remain only when their native definitions are present and alias erasure preserves the obligation.

Admissible primitive leaves include source/model facts such as atomic valuations, domain identities, one-step transitions/accessibility/reduction edges, heap cell incidence, and source algebraic operations constrained by explicit axioms.

## New qualification gate

### E1P — primitive semantic decomposition

A benchmark/profile passes only if:

1. every derived formal operator used in the obligation has a native expansion;
2. primitive leaves are explicitly identified;
3. no host evaluator/substitution/prover callback supplies missing semantics;
4. aliases are erasure-safe;
5. concrete measured instances contain their finite/model structure;
6. meta-theorem proof relations connect to native proof objects.

### E1A — alias-erasure audit

Where named derived aliases remain for compactness, expand/remove them and verify the primitive-normal obligation is equivalent.

E1P/E1A block E3/E4.

## Readiness encoded in the initial scaffold

Each benchmark carries a raw `^9` readiness value so statement reconstruction cannot be mistaken for proof completion.

Current initial partition remains:

```text
^350  5
^351  3
^352  2
^353  8
```

Those classes predate Draft 0.7 and do not imply E1P completion.

## Source-fidelity cautions retained

- PHP, XOR parity, and muddy children remain parameterized families.
- Steamroller is not proof-scored until the exact premise set is imported.
- Chisholm remains a deontic consistency/profile probe and requires an explicit deontic semantics.
- the supplied Cantor formula is retained as supplied and is not silently substituted with the standard no-surjection formulation.
- well-founded induction requires explicit well-foundedness authority.
- Church–Rosser remains a property schema until a concrete reduction/inductive theory is supplied.

## Qualification state

```text
E0 source fidelity:
  18 benchmark intents copied: COMPLETE author-side
  source caveats made explicit: COMPLETE

E1 statement/native expressibility:
  18 benchmark envelopes rendered: COMPLETE author-side
  supplied explicit formula structures rendered: COMPLETE author-side
  exact statement-bundle signature: PASS author-side
  overall complete proof-problem input: PARTIAL

E1P primitive semantic decomposition:
  per-benchmark audit: COMPLETE
  shared formula satisfaction: CONSTRUCTED author-side
  finite path/reachability: CONSTRUCTED author-side
  explicit proof-object structure: CONSTRUCTED author-side
  primitive constructive/classical ND: CONSTRUCTED author-side
  LTL trace semantics: CONSTRUCTED author-side for FL-011 exercised surface
  epistemic/PAL semantics: CONSTRUCTED author-side candidate
  relational S5 constraints: CONSTRUCTED author-side candidate
  heap/separation/Hoare semantics: CONSTRUCTED author-side candidate
  deontic/HOL/FOL/parity/CTL foundations: PENDING
  independent foundation qualification: PENDING

E1A alias-erasure:
  protocol requirement: SPECIFIED
  executions: PENDING

Draft 0.6 structural instantiation:
  candidate + focused cases: COMPLETE author-side
  independent cold qualification: PENDING

E2 isolated cold reconstruction of statement bundle:
  protocol frozen: COMPLETE
  independent run: PENDING

E3 proof-profile completeness:
  primitive constructive ND candidate: EXISTS, unqualified
  primitive classical extension: EXISTS, unqualified
  FL-001 proof-term candidate: EXISTS, unvalidated
  epistemic S5 relational candidate: EXISTS, primitive foundation unqualified
  FOL/HOL: BLOCKED on Draft 0.6 cold qualification
  LTL: primitive semantic foundation exists; proof profile/proof still pending
  spatial: primitive heap/separation foundation exists; concrete swap/locality proof pending
  CTL/deontic/parity: primitive foundations pending

E4 proof execution:
  no independently validated proof yet

E5 independent proof review:
  PENDING
```

## Claims not yet allowed

Experiment 003 does not yet establish:

- that all 18 benchmarks are complete formal proof problems;
- that any author-side primitive foundation is independently correct;
- that the Peirce proof candidate is a validated E4 proof;
- that all 18 benchmarks are provable from the current native bundle;
- that AxiomeSH outperforms natural-language, TPTP, SMT-LIB, Lean/Coq/Isabelle, or another formal representation;
- that any current derived alias is optimal;
- that Draft 0.5/0.6/0.7 improve proof performance.

The required standard is now explicit: source-faithful statement + primitive semantic construction + alias erasure + explicit proof authority + cold reconstruction + proof execution + independent proof review.
