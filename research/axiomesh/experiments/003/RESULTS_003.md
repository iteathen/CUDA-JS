# Experiment 003 — Results

**Status:** 18-benchmark source corpus and native Draft 0.5 benchmark bundle constructed; author-side structural audit complete; independent E2 reconstruction pending; exact premise/profile modules and proof execution pending.

## Added benchmark surface

Experiment 003 now contains 18 benchmark objects covering six broad domains:

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

## Candidate-spec pressure

The suite produced Draft 0.5.

One new core form was added:

```text
\?n term
```

This is generic lexical abstraction only. It does not itself mean lambda, Pi, set-builder, fold, or another theory constructor.

The following were deliberately kept theory-owned:

- types/sorts;
- higher-order application;
- modal/epistemic/deontic operators;
- temporal/path operators;
- separation/program operators;
- proof/theorem predicates;
- XOR/parity;
- closure/well-foundedness;
- lambda/Pi constructors.

Draft 0.5 also makes proof-theory neutrality explicit so classical rules cannot silently become global core semantics.

## Native bundle

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

`^0` is core-reserved and therefore is not counted among the 135 theory-owned symbols.

## Readiness encoded natively

Each benchmark carries a raw `^9` readiness value so statement reconstruction cannot be mistaken for proof completion.

The four readiness classes are:

```text
^350  statement structurally ready for the next profile step
^351  concrete parameter instance(s) still required
^352  exact premises/reduction relation still required
^353  native logic/profile semantics still required
```

These names are reviewer gloss only; the identities themselves are native.

Current partition:

```text
^350  5
^351  3
^352  2
^353  8
```

## Source-fidelity cautions retained

The suite does not silently repair source problems:

- PHP, XOR parity, and muddy children remain parameterized families.
- Steamroller is not proof-scored until the exact premise set is imported.
- Chisholm remains a deontic consistency/profile probe.
- the supplied Cantor formula is retained as supplied and is not silently substituted with the standard no-surjection formulation.
- well-founded induction requires explicit well-foundedness authority.
- Church–Rosser remains a property schema until a concrete reduction/inductive theory is supplied.

The Steamroller object currently records its conclusion plus an explicit dependency on the not-yet-imported exact axiom set. It is therefore **not E1-complete at the premise-body level**. Likewise, property/family objects whose concrete instance or reduction theory is absent are not promoted to complete proof problems.

## Qualification state

```text
E0 source fidelity:
  18 benchmark intents copied: COMPLETE author-side
  source caveats made explicit: COMPLETE

E1 native expressibility:
  18 benchmark envelopes rendered: COMPLETE author-side
  supplied explicit formula structures rendered: COMPLETE author-side
  exact Draft 0.5 signature: PASS author-side
  lexical abstraction exercised: YES
  proof-system distinctions represented: YES as profile/readiness structure
  complete premise/body expansion for every named standard benchmark: NOT YET
  overall E1 proof-problem completeness: PARTIAL

E2 isolated cold reconstruction:
  protocol frozen: COMPLETE
  independent run: PENDING

E3 proof-profile completeness:
  protocol defined: COMPLETE
  logic-specific native profile modules: PENDING

E4 proof execution:
  PENDING

E5 independent proof review:
  PENDING
```

## Claims not yet allowed

Experiment 003 does not yet establish:

- that all 18 benchmarks are complete formal proof problems;
- that all 18 benchmarks are provable from the current native bundle;
- that AxiomeSH outperforms natural-language, TPTP, SMT-LIB, Lean/Coq/Isabelle, or another formal representation;
- that theory-level typing/modal/temporal/spatial constructs are optimal;
- that Draft 0.5 abstraction improves proof performance;
- that the supplied benchmark formulations are all canonical statements of the named textbook theorems.

Those require exact source/profile completion plus E2-E5 evidence.
