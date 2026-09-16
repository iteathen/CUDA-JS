# AxiomeSH Core Specification — Draft 0.5 Candidate

**Status:** experimental expansion produced by cross-logic benchmark pressure  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens or extends them  
**Promotion:** experimental-branch authority only

Draft 0.5 is driven by Experiment 003, which adds classical, first-order, epistemic, temporal, constructive, higher-order, and type-theoretic proof benchmarks. Most of those domains can already be represented by theory-owned semantic symbols applied to first-class formula terms. One representation-general gap remains: a theory needs a first-class way to package a term with a lexically bound variable without asserting universal or existential quantification. Draft 0.5 adds that single primitive and tightens proof-system boundaries so classical, intuitionistic, modal, temporal, deontic, spatial, and higher-order theories can coexist without silently inheriting one global proof calculus.

---

## 1. Authority and compatibility

A Draft 0.5 decoder reads Draft 0.2, Draft 0.3, Draft 0.4, and this amendment in that order.

Draft 0.5 changes only:

- first-class lexical abstraction;
- proof-theory neutrality and logic-profile ownership;
- higher-order application discipline;
- treatment of types, modalities, programs, and proof objects as theory structure;
- the distinction between statement expressibility and proof qualification.

Draft 0.3 lexical-scope rules and Draft 0.4 exact-signature/qualification rules remain authoritative.

---

## 2. Formula terms are first-class terms

Draft 0.2 already makes implication, equality, negation, quantification, choice, scopes, and rules members of `term`.

Draft 0.5 makes the consequence explicit:

> A formula term MAY occur as an argument of a theory-owned semantic application.

Therefore a theory may represent operators over formulas without new core syntax, including:

- individual knowledge and common knowledge;
- public-announcement and dynamic modalities;
- obligation and permission;
- temporal `G/F/X/U`-like operators;
- branching-time path/state operators;
- separation-logic connectives;
- theorem/proof predicates;
- set builders, closures, and other formula-valued constructors.

The semantic laws of those operators belong to the native theory/profile that declares them.

---

## 3. Core implication and negation do not select a global proof calculus

Draft 0.2 introduced `=>` and `~`. Draft 0.5 tightens their proof-theoretic interpretation.

`A => B` preserves an object-level implication relationship in the represented theory. `~A` preserves declarative negation. Their mere presence does **not** globally grant:

- law of excluded middle;
- Peirce's law;
- double-negation elimination;
- explosion;
- modal necessitation;
- S4/S5 introspection;
- temporal induction;
- deontic distribution;
- separation-logic frame rules;
- higher-order extensionality;
- choice principles.

Those are properties of a declared logic profile, axiom set, inference system, or proof object.

This is load-bearing for benchmarks that intentionally separate classical and intuitionistic validity.

---

## 4. First-class lexical abstraction

Universal and existential binders assert quantification. Higher-order and type-theoretic structures also need a bound body that is *not itself a quantifier*.

Draft 0.5 adds:

```text
\?n term
```

as a **lexical abstraction term**.

Examples:

```text
\?0[(^17 ?0)]
```

```text
(^41 \?0[(^42 ?0)])
```

The first example is an abstraction over `?0`. The second passes that abstraction as an argument to theory symbol `^41`.

### 4.1 Scope

An abstraction binds occurrences of its variable only inside its body.

All Draft 0.3 lexical rules apply:

- sibling abstractions/binders may reuse a number when scopes are disjoint;
- separate terms may reuse variable numbers;
- nested rebinding of a still-visible same variable number is invalid;
- capture-free alpha-renaming preserves meaning.

### 4.2 No built-in lambda semantics

`\?n term` means only **bound body as first-class structure**.

It does not by itself mean lambda abstraction, dependent product, set comprehension, pattern abstraction, or any other mathematical constructor.

A theory-owned semantic symbol supplies that role, e.g. schematically:

```text
(^lambda \?0 BODY)
(^pi TYPE \?0 RESULT_TYPE)
(^setof \?0 PREDICATE)
```

where the names are explanatory only and the native theory uses declared `^n` symbols.

This keeps one representation-general binding primitive instead of adding a separate core primitive for every formalism.

---

## 5. Grammar extension

Draft 0.5 adds one production to Draft 0.2's grammar:

```text
abstract := \\var term
```

and adds `abstract` to `term`:

```text
term := ...
      | abstract
```

Canonical presentation SHOULD keep the binder token adjacent to its variable and indent a multiline body according to Draft 0.4.

---

## 6. Higher-order application is explicit theory structure

A semantic-symbol-headed edge already has application semantics:

```text
(^17 A B)
```

A variable in operator position does not silently acquire semantic-symbol application semantics.

A higher-order theory that applies variable-valued functions or predicates MUST declare an application relation/operator in its native signature, for example schematically:

```text
(^apply ?f ?x)
```

This keeps higher-order application visible rather than depending on a hidden parser convention.

The application operator is theory-owned, not core-reserved.

---

## 7. Sorts and types remain theory structure for this candidate

Experiment 003 requires multi-sorted FOL, function types, predicate types, polymorphic-style predicates, and dependent function types.

Draft 0.5 does **not** add a core `TYPE` primitive.

A theory may represent:

- sort membership;
- type ascription;
- function types;
- predicate types;
- dependent products;
- subtype/domain guards;

using declared semantic symbols and first-class abstractions.

For example, a typed universal may be represented as a universal variable plus a native sort/type guard, while a dependent product may use a theory-owned constructor consuming an abstraction.

If repeated benchmarks show that this representation is materially harder, larger, or less reliable than a core type relation, that becomes evidence for a later change. Draft 0.5 does not assume that result in advance.

---

## 8. Modal, temporal, deontic, spatial, and dynamic operators remain theory-owned

No core primitives are added for `K`, common knowledge, public announcement, obligation, permission, `G/F/X/U`, `A/E`, separating conjunction, magic wand, Hoare triples, or program modalities.

They are theory-owned operators over formula/state terms.

Operational rewrite `>` remains distinct from an object-logic dynamic modality. A theory may relate the two when valid, but the core does not identify them automatically.

This prevents one modal/temporal semantics from contaminating another.

---

## 9. Proof judgments and proof objects are native theory structure

AxiomeSH does not gain a privileged global turnstile in Draft 0.5.

A proof-capable bundle may declare native symbols for concepts such as:

- axiom;
- premise;
- inference rule;
- theorem/derivable judgment;
- proof step;
- proof object;
- witness;
- extracted program;
- proof dependency.

A derivation may therefore be represented as ordinary scoped relational structure whose steps reference rules and earlier steps.

The benchmark must distinguish:

```text
formula is representable
```

from:

```text
formula is derivable under the supplied native proof profile
```

Representability is not proof.

---

## 10. Native logic profiles

A proof result is self-contained only when the native bundle supplies enough profile structure to determine which inference laws are admissible.

A benchmark MAY deliberately omit a complete profile while testing statement expressibility. Such a case must be marked **not proof-qualified** rather than treated as a failed theorem or silently solved using external assumptions.

For proof qualification, the bundle must identify or contain the axioms/rules needed to distinguish the target logic, including where relevant:

- classical versus intuitionistic implication/negation;
- FOL equality/substitution laws;
- modal frame axioms and introspection;
- dynamic epistemic update rules;
- temporal/path semantics;
- deontic contrary-to-duty handling;
- separation/frame rules;
- higher-order beta/application/extensionality laws;
- induction or well-foundedness principles;
- inductive closure/reduction rules.

These rules remain theory structure unless later evidence shows a representation-general core need.

---

## 11. Meta-theorems are first-class research objects

Some benchmarks are not ordinary object-level theorems. Examples include the intuitionistic disjunction property and proof-extraction claims.

A theory may state propositions about its own theorem/proof relation using ordinary semantic applications and quantification over formula/proof terms.

Such a meta-theorem must remain distinguishable from the object formula it discusses.

---

## 12. Benchmark qualification levels

Experiment 003 introduces explicit gates:

### E0 — source fidelity

The benchmark statement, premises, parameters, intended logic domain, and tested distinctions are copied without silent repair.

### E1 — native expressibility

The complete supplied statement/premise structure is representable without opaque proposition placeholders or hidden sidecar semantics.

### E2 — native reconstruction

A cold decoder reconstructs the benchmark structures, signature, binding, and stated proof obligations.

### E3 — proof-profile completeness

The native bundle contains enough axioms/rules/profile structure to determine validity without importing a different logic from model priors.

### E4 — proof execution

A fresh agent produces a derivation/proof object, countermodel, consistency result, or explicit non-derivability result appropriate to the benchmark.

### E5 — proof review

A separate review checks each proof step against the native profile and records proof size, search/decoder difficulty, and any representation-induced failure.

A benchmark may pass E1/E2 while remaining pending at E3/E4. That is not equivalent to proving the theorem.

---

## 13. Experiment 003 pressure surface

The initial suite contains 18 benchmark families spanning:

- classical propositional implication;
- pigeonhole and parity hardness;
- multi-sorted FOL and equality;
- self-reference and quantifier scope;
- multi-agent epistemic and dynamic updates;
- deontic contrary-to-duty reasoning;
- LTL/CTL;
- separation/program logic;
- intuitionistic negation and meta-theorems;
- higher-order quantification;
- first-class abstraction;
- predicate quantification;
- well-founded induction;
- reflexive-transitive closure and confluence;
- dependent-product structure.

The suite is intentionally broader than Connect4. It exists to force the next genuine representation boundary rather than optimize only for one domain.

---

## 14. Known benchmark-source cautions

The benchmark suite preserves supplied statements exactly enough to expose source ambiguity rather than silently correcting it.

In particular:

- parameterized families such as pigeonhole, XOR parity, and muddy children need concrete instances for measured proof runs;
- Schubert's Steamroller requires the exact premise set before proof scoring, not only its English summary;
- contrary-to-duty consistency depends on the exact deontic profile rather than ordinary classical explosion;
- the supplied Cantor statement is retained as supplied, while a canonical surjectivity formulation should be separately normalized before claiming a standard Cantor proof result;
- Church–Rosser requires a specified reduction relation/inductive theory before its confluence property becomes a proof target rather than a bare schema.

These are benchmark-normalization issues, not permission to invent missing premises.

---

## 15. Falsifiers

Revise Draft 0.5 if evidence shows that:

- first-class abstraction is unnecessary because existing structure performs equally well without hidden binding conventions;
- `\?n term` creates parse/binding ambiguity that cannot be removed cleanly;
- theory-owned type/sort structure repeatedly fails where a core type relation succeeds materially better;
- theory-owned modal/temporal/spatial operators require hidden semantics to reconstruct formulas;
- proof-profile separation cannot prevent classical rules from leaking into constructive benchmarks;
- explicit higher-order application is materially worse than a cleaner general application structure;
- the expanded representation improves expressibility but degrades agent proof performance enough to negate its value.

Draft 0.5 is a pressure-test candidate, not a declaration that these choices are final.