# Experiment 003 — Draft 0.5 Specification Pressure

## Result

The 18 cross-logic benchmarks do **not** justify promoting each conventional logic operator into AxiomeSH core.

Most required constructs fit the existing model:

```text
formula/state term
+
stable theory symbol
+
native profile rules
```

Knowledge, temporal operators, obligation, XOR, separating conjunction, proof predicates, types, closure relations, and similar operators can therefore remain theory-owned while their formulas remain structurally explicit.

## Genuine core gap

Higher-order and dependent structures require a lexical bound body that is neither universal nor existential quantification.

Examples include:

- lambda-like diagonal witnesses;
- dependent products / Pi-like types;
- index folds/comprehensions;
- theory-level builders taking a bound expression.

Encoding those as an ordinary edge such as `(^lambda ?0 BODY)` would leave the binding of `?0` as an undocumented convention. Encoding them using `*?0` or `+?0` would assert the wrong semantics.

Draft 0.5 therefore adds exactly one new generic form:

```text
\?0 BODY
```

It owns lexical binding only. The consuming theory symbol determines whether the abstraction is used as lambda, Pi, set-builder, fold, or another constructor.

## Proof-theory pressure

Peirce's Law and Glivenko/disjunction-property benchmarks cannot share a hidden global classical proof calculus.

The candidate therefore tightens a rule already implicit in Draft 0.2:

```text
native formula operator != globally admitted inference rule
```

`=>` and `~` preserve formula structure. Classical, intuitionistic, modal, temporal, deontic, spatial, equality, induction, and higher-order inference laws belong to native proof profiles.

This is a semantic-boundary clarification, not another syntax primitive.

## Decisions not to add primitives yet

### Types/sorts

Kept theory-owned. Typed quantification can be represented using native sort/type guards, and dependent type constructors can consume lexical abstractions. Experiment 003 will measure whether this is adequate.

### Higher-order application

Kept theory-owned and explicit through a declared application operator. Variable-headed application is not silently parsed as semantic-symbol application.

### Modal/epistemic/deontic operators

Kept theory-owned over first-class formula terms.

### Temporal/path operators

Kept theory-owned. No core `G/F/X/U/A/E` tokens.

### Separation/program logic

Kept theory-owned. No core separating-conjunction, magic-wand, Hoare, or program-modality syntax.

### Proof judgments

Kept theory-owned. No global turnstile is added. Proof objects are ordinary relational structures linked to rule/profile objects.

### XOR/modulo/cardinality/closure

Kept theory-owned, consistent with Draft 0.2 arithmetic/set discipline.

## Source problems that must not drive bogus core changes

Several supplied benchmarks are intentionally or accidentally incomplete as proof problems:

- Steamroller lacks the exact premise set in the supplied summary;
- PHP/XOR/muddy children are parameterized families needing concrete instances;
- Chisholm is profile-sensitive and must not be scored under naive classical explosion;
- the supplied Cantor formula is preserved but requires a separate canonical-surjectivity normalization before it is scored as the standard Cantor theorem;
- well-founded induction needs explicit well-foundedness authority;
- Church–Rosser needs a concrete reduction relation/inductive theory.

Those are benchmark-normalization/proof-profile gaps, not evidence for random syntax growth.

## Falsification targets

Draft 0.5 should be revised if cold/proof runs show that:

- lexical abstraction is ambiguous or unused;
- explicit application causes systematic higher-order reasoning failures;
- theory-level typing loses distinctions needed for sound proof checking;
- modal/temporal/spatial theory symbols require hidden human semantics;
- proof-profile modules cannot prevent cross-logic rule leakage;
- agent proof performance degrades materially because the structural forms are too indirect.
