# Experiment 003 — Results

**Status:** 18-benchmark source corpus and native statement scaffold constructed; Drafts 0.5/0.6 produced; Draft 0.7 primitive-decomposition gate added; independent E2 reconstruction and all proof execution remain pending.

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

Construction of FOL/equality profiles then exposed a second representation-general gap: a bound native body could be packaged but not capture-avoidably instantiated without hidden host substitution.

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

The existing benchmark payload is therefore retained as a **statement/formalization scaffold**, not as primitive-semantic completion for modal, temporal, deontic, spatial, proof-meta, closure, or higher-order semantics.

See:

- `../../CORE_SPEC_DRAFT_0_7_CANDIDATE.md`
- `PRIMITIVE_DECOMPOSITION_AUDIT_003.md`

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

Experiment 003 now inserts:

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

The suite does not silently repair source problems:

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
  primitive semantic foundations: PENDING / PARTIAL
  advanced modal/temporal/deontic/spatial/HOL operators: NOT YET QUALIFIED

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
  classical propositional candidate: EXISTS, requires Draft 0.7 decomposition review
  intuitionistic propositional candidate: EXISTS, requires Draft 0.7 decomposition review
  FOL/HOL: BLOCKED on Draft 0.6 cold qualification
  modal/temporal/spatial/deontic: BLOCKED on primitive semantic foundations

E4 proof execution:
  PENDING

E5 independent proof review:
  PENDING
```

## Claims not yet allowed

Experiment 003 does not yet establish:

- that all 18 benchmarks are complete formal proof problems;
- that named modal/temporal/deontic/spatial/HOL symbols are semantically sufficient by themselves;
- that all 18 benchmarks are provable from the current native bundle;
- that AxiomeSH outperforms natural-language, TPTP, SMT-LIB, Lean/Coq/Isabelle, or another formal representation;
- that any current derived alias is optimal;
- that Draft 0.5/0.6/0.7 improve proof performance.

The required standard is now explicit: source-faithful statement + primitive semantic construction + explicit proof authority + cold reconstruction + proof execution + independent proof review.
