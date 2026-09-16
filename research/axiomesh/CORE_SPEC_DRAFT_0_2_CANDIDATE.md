# AxiomeSH Core Specification — Draft 0.2 Candidate

**Status:** experimental candidate produced by Experiment 002  
**Parent:** `CORE_SPEC_DRAFT_0_1.md`  
**Scope:** native core plus the minimum semantic forms required to encode real formal research  
**Promotion:** not parent-branch authority until independently qualified

Draft 0.2 exists because the Connect4 corpus exposed a genuine expressiveness gap in Draft 0.1. Draft 0.1 can represent identity, incidence, scope, matching, and rewrite topology, but it cannot natively distinguish an opaque object identity from an exact numeric value or a theory-level semantic symbol, and it does not provide a complete declarative proposition form for quantification, implication, equality, or classical negation.

The correction is deliberately small. AxiomeSH remains structurally native. The new forms are introduced only where the Experiment 002 source could not otherwise be represented without hiding meaning in an oracle.

---

## 1. Constitutional invariants retained from Draft 0.1

Draft 0.2 retains these requirements unchanged:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- recoverability;
- no mandatory translation layer;
- raw native AxiomeSH input/output;
- qualified-agent performance as an empirical gate;
- architecture independence;
- adapters must remain optional around the native path.

The central hypothesis remains:

```text
knowledge = relational structure + lawful structural transformation
```

and the native path remains:

```text
AxiomeSH -> agent -> AxiomeSH
```

---

## 2. Why Draft 0.1 was insufficient

Experiment 002 required exact representation of claims containing distinctions such as:

- object identity versus the literal integer `28`;
- a theory relation such as `supports` versus an arbitrary alpha-renamable atom;
- formulas such as `N(t)=(W-1)H-ply+r+1`;
- universally guarded implications;
- existential and universal game-choice semantics;
- exact equality and inequality claims;
- classical proposition negation distinct from a rewrite negative-application condition;
- empirical numeric observations and bounded scopes;
- set/cardinality/algebraic relations whose operators belong to a represented theory rather than to graph topology itself.

Representing these only as opaque proposition IDs preserves a knowledge graph about claims, but not the claims themselves. That is insufficient for a native logical corpus.

---

## 3. Three identity classes

Draft 0.2 separates three things that Draft 0.1 conflated.

### 3.1 Structural identity atoms

```text
0
1
2
```

A bare integer remains an opaque structural identity.

It is alpha-renamable under structural isomorphism.

Changing every bare identity consistently may preserve meaning.

### 3.2 Exact literals

```text
#0
#28
#625
#41
#1493/1000
```

`#` introduces an exact literal value.

A literal is **not** alpha-renamable.

`#28` means the exact integer twenty-eight, not an object whose spelling happens to be `28`.

A rational literal uses reduced `#p/q` form. Floating-point spellings are not canonical core values.

Negative values use the sign inside the literal:

```text
#-4
```

Draft 0.2 does not yet add strings to the semantic core. Human gloss remains optional external metadata unless a later experiment demonstrates a native need.

### 3.3 Semantic symbols

```text
^0
^1
^37
```

`^n` is a theory-level semantic symbol.

A semantic symbol is stable inside the represented theory and is not interchangeable with a bare structural identity.

A semantic symbol may denote a relation, function, proposition constructor, algebraic operation, domain constant, epistemic class, or another theory-owned semantic role.

AxiomeSH itself does not require English names for these symbols.

Two theories may be compared under an explicit symbol mapping, but ordinary structural alpha-renaming does not silently rename semantic symbols.

This is the minimum distinction required to represent a theory rather than only an unlabeled graph.

---

## 4. Application remains structural

An ordered edge whose first member is a semantic symbol is a semantic application:

```text
(^17 4 9)
```

This means application of semantic symbol `^17` to structural identities `4` and `9`.

Likewise:

```text
(^23 #7 #6)
```

applies `^23` to exact literals seven and six.

The generic edge construct remains valid and retains ordered incidence semantics. The first position is not globally privileged for all edges; it is privileged only when occupied by a semantic symbol because that token class explicitly requests application semantics.

Higher arity remains native.

No predicate/function distinction is required at the core parser level. That distinction belongs to the represented theory when needed.

---

## 5. Declarative formulas are distinct from operational rewrites

Draft 0.1 overloaded structural transformation as the only implication-like form. Experiment 002 requires declarative propositions that must not automatically execute as rewrites.

Draft 0.2 therefore separates:

```text
[L] > [R]
```

from:

```text
[L] => [R]
```

### 5.1 `>` — operational rewrite

`>` retains Draft 0.1 rewrite semantics: match a structural region and produce a successor structure.

### 5.2 `=>` — declarative implication

`=>` states that satisfaction of the left formula structurally entails the right formula in the represented theory.

It does not mutate a graph merely by appearing in a scope.

A theorem, axiom, conjecture, counterexample condition, or proof obligation may therefore be represented without turning every implication into executable state transition.

A theory may separately contain a bridge from declarative entailment to operational rewrite when that is itself valid.

---

## 6. Formula conjunction

A formula scope represents conjunction by co-presence:

```text
[
  (^1 ?0)
  (^2 ?0 ?1)
]
```

means both contained formulas are required within that formula context.

This preserves the Draft 0.1 principle that no dedicated `AND` token is necessary.

Scope remains a structural boundary as well as a conjunction carrier. A formula-consuming construct determines when the contained scope is interpreted conjunctively.

---

## 7. Explicit alternative / disjunction

Experiment 002 contains claims with true alternative semantics that must not be confused with unordered conjunction.

Draft 0.2 adds an unordered choice form:

```text
{
  [A]
  [B]
}
```

The braces contain alternatives.

A choice is satisfied when at least one member alternative is satisfied.

Member order is non-semantic.

This construct is declarative. Multiway rewrite successors remain operational alternatives and are not silently converted into formula disjunction.

---

## 8. Quantification

Pattern variables inside rewrite rules are not sufficient to represent all declarative theorem scopes.

Draft 0.2 adds explicit binders.

### 8.1 Universal

```text
*?0[
  ...
]
```

binds `?0` universally over the enclosed formula.

Multiple variables may be nested:

```text
*?0*?1[
  ...
]
```

### 8.2 Existential

```text
+?0[
  ...
]
```

binds `?0` existentially over the enclosed formula.

### 8.3 Binding scope

A binder owns occurrences of its variable only inside its enclosed term.

Nested reuse shadows only when explicitly permitted by a future scoping extension. Draft 0.2 candidate forbids variable-number shadowing within one serialized theory object to keep binding unambiguous.

Unbound variables are invalid in a closed declarative proposition.

Operational rewrite variables remain rule-local as in Draft 0.1.

---

## 9. Equality

Structural identity and propositional equality are different.

Draft 0.2 adds:

```text
A == B
```

as a declarative equality proposition.

This is required for literal/algebraic claims such as:

```text
(^rank ?B) == #35
```

or equality between two derived terms.

Reusing the same bare identity still expresses object identity directly and does not require `==`.

`==` does not replace structural identity.

---

## 10. Classical negation versus negative application condition

Draft 0.1 `!term` remains a **negative application condition** used by structural matching.

Draft 0.2 adds declarative classical negation:

```text
~term
```

The two are not interchangeable.

```text
!(^3 ?0)
```

means no matching instance is present for an operational match.

```text
~(^3 ?0)
```

is a proposition asserting negation inside the represented theory.

Whether a represented theory is classical, intuitionistic, paraconsistent, or otherwise determines what further laws govern `~`; AxiomeSH only preserves the distinction.

---

## 11. Arithmetic is theory structure, not core syntax

Draft 0.2 does **not** add built-in `+`, `-`, `*`, `max`, rank, cardinality, subset, union, or other domain mathematics.

Those operations are represented by semantic symbols and application:

```text
(^add #2 #3)
```

would be written with the theory's numeric symbol ID, for example:

```text
(^41 #2 #3)
```

The symbol's mathematical role is part of the represented theory/signature.

This keeps AxiomeSH below any one arithmetic or set theory while allowing exact formulas to be represented.

A corpus that needs arithmetic must therefore include the semantic symbol identities it uses and enough theory structure for the intended reasoning task.

---

## 12. Sets and cardinality are theory-level values

An unordered AxiomeSH scope is not automatically an extensional mathematical set.

If a represented theory needs sets, membership, subset, union, cardinality, antichains, or closure families, it must represent those concepts with semantic symbols and applications.

This prevents accidental identification of:

```text
structural scope == mathematical set
```

which Experiment 002 would otherwise make dangerously tempting.

---

## 13. Claim objects and proposition ownership

A claim may be represented as an ordinary structural object linked to an actual formula:

```text
[
  (^claim 1001)
  (^status 1001 ^deductive)
  (^body 1001 @0)
  @0=...formula...
]
```

The example names above are explanatory only; native payload uses semantic symbols.

The load-bearing rule is:

> A claim body intended to be natively recoverable MUST resolve to actual formula structure, not only to an opaque proposition placeholder whose meaning exists solely in an oracle.

An oracle may map semantic symbols to human gloss for scoring, but it must not contain proposition structure absent from the native payload.

---

## 14. Epistemic status is not entailment

Status such as:

- deductive exact;
- guarded exact;
- empirical support;
- hypothesis;
- candidate rule;
- missing law;
- disproven;
- rejected;
- deferred

may be represented using semantic symbols and relations.

Status does not alter the formula's internal structure and does not grant proof authority by itself.

A disproven proposition remains representable as a proposition object whose epistemic relation marks it as disproven. It must not silently become an active theorem.

This requirement is load-bearing for the Connect4 corpus.

---

## 15. Boundary-aware comparison

Experiment 001 exposed an ambiguity around sibling scopes that share identities through a parent.

Draft 0.2 makes the comparison mode explicit.

### 15.1 Closed isomorphism

Ordinary closed-structure isomorphism may rename all alpha-renamable structural identities while preserving incidence, scopes, rules, variables, semantic symbols, and literals.

### 15.2 Boundary-preserving isomorphism

When a scope is compared as a component of a surrounding structure, identities crossing its boundary are interface identities.

A boundary-preserving comparison MUST either:

1. fix each interface identity; or
2. receive an explicit boundary bijection.

It may not silently choose between those interpretations.

Semantic symbols and literals are fixed unless the comparison explicitly requests a theory/signature mapping.

---

## 16. Duplicate scope membership

Draft 0.1 did not specify whether unordered scopes are sets or multisets.

Draft 0.2 candidate chooses **set membership** for ordinary scopes:

> Two structurally identical sibling members in the same ordinary scope collapse to one member after canonicalization.

If multiplicity is semantically required, the represented theory must encode occurrence identities or a multiplicity/count relation explicitly.

This aligns with Draft 0.1 rewrite wording that adds RHS structure only when it is not already present.

This choice is experimental and must be challenged by later corpora.

---

## 17. Distinct-variable matching

Draft 0.1 left injectivity unsettled.

Draft 0.2 removes a hidden default:

> Different variables are **not required to bind distinct objects** unless an explicit disequality/distinctness formula or match guard requires it.

Repeated occurrences of the same variable still require the same binding.

This makes aliasing legal by default and forces distinctness to be stated when load-bearing.

---

## 18. Freshness

RHS-only rewrite variables were ambiguous in Draft 0.1.

Draft 0.2 removes implicit freshness from ordinary variables.

A variable appearing only on the RHS is invalid unless freshness is requested explicitly.

Fresh structural identity uses:

```text
+?0[ ... ]
```

inside the RHS creation context, with the existential binder interpreted operationally by that rewrite as allocation of a new identity not currently present in the application scope.

Because declarative existential and operational fresh allocation are different uses, a rewrite parser must know whether the binder occurs in formula position or RHS creation position.

This candidate rule exists to eliminate silent fresh-atom creation.

---

## 19. Reference semantics

Draft 0.2 fixes the minimum reference rules exposed by Experiment 001.

- A binding `@n=term` is visible from its point of definition to the end of its containing scope.
- Nested scopes may read bindings from ancestors.
- Shadowing an existing visible `@n` is invalid.
- Forward references are invalid.
- Cyclic and self references are invalid.
- Expansion of all references must terminate and preserve semantic structure.
- Reference identity is serialization identity only; two references expanding to isomorphic but separately bound terms do not become the same structural occurrence unless ordinary identity relations make them so.

References remain compression devices, not semantic entities.

---

## 20. Corrected grammar

Draft 0.1's compact grammar defined `var`, `neg`, and `bind` but omitted them from `term`. Draft 0.2 corrects that inconsistency and adds the Experiment 002 forms.

```text
id       := integer
literal  := #integer | #integer/integer
symbol   := ^integer
var      := ?integer
ref      := @integer

edge     := (term ...)
scope    := [term ...]
choice   := {term ...}
negmatch := !term
neg      := ~term
forall   := *var term
exists   := +var term
eq       := term == term
implies  := term => term
rule     := scope > scope
bind     := ref = term

term     := id
          | literal
          | symbol
          | var
          | ref
          | edge
          | scope
          | choice
          | negmatch
          | neg
          | forall
          | exists
          | eq
          | implies
          | rule
          | bind
```

Parser precedence is not inferred from whitespace. Serialized canonical form SHOULD parenthesize or structurally nest mixed infix constructs so there is only one parse.

---

## 21. Canonicalization additions

Canonical semantic identity now distinguishes:

```text
28   != #28
28   != ^28
#28  != ^28
```

because these are structural identity, literal value, and semantic symbol respectively.

Alpha-renaming may affect bare structural identities and locally bound variables where allowed.

It MUST NOT silently rename:

- literals;
- semantic symbols;
- rewrite direction;
- implication direction;
- quantifier kind;
- equality structure;
- negation kind;
- boundary interface assignments.

---

## 22. Connect4 pressure-test examples

These examples are schematic. Semantic symbol IDs are illustrative.

### 22.1 Guarded terminal consequence

```text
*?0*?1*?2[
  [
    (^100 ?0)
    (^101 ?0 ?1)
    (^102 ?0 ?2)
    (^103 ?2)
    (^104 ?1 ?2)
    ~(^105 ?0)
  ]
  =>
  [
    (^106 ?0 ?1 #1)
  ]
]
```

This can encode the logical shape of a guarded immediate-terminal claim without turning it into an executable rewrite.

### 22.2 Exact numeric invariant

```text
[
  (^200 ^standard7x6)
  =>
  [
    (^201 ^standard7x6) == #28
  ]
]
```

Literal `#28` cannot be alpha-renamed away.

### 22.3 Missing law as first-class object

```text
[
  (^300 11)
  (^301 11 ^missing)
  (^302 11 @0)
  @0=*?0[
    [ (^303 ?0) (^304 ?0) ]
    =>
    [ (^305 ?0) ]
  ]
]
```

The missing-law status and the proposition needing proof are separate structure.

---

## 23. Qualification requirement introduced by Experiment 002

A large real corpus qualifies Draft 0.2 only if a cold decoder can recover, without proposition oracles:

1. the actual formula structure of every claim;
2. all exact literals;
3. semantic symbol identity;
4. quantifier and implication structure;
5. guards and bounded scopes;
6. equality/negation distinctions;
7. epistemic status without promotion;
8. claim-to-claim relations;
9. unresolved proof obligations;
10. enough theory structure to answer structural research queries directly.

A sidecar may translate opaque semantic symbols into human-readable gloss for scoring, but it may not supply formula structure missing from the payload.

---

## 24. What remains provisional

Draft 0.2 still does not claim final answers for:

- the smallest sufficient theory-signature declaration system;
- whether strings belong anywhere in native core;
- whether explicit types improve agents enough to justify a primitive;
- whether choice `{}` is preferable to a purely relational alternative encoding;
- whether declarative `=>` should later reduce to a more general first-class relation object;
- whether quantifier glyphs are tokenizer-optimal;
- whether set-valued and arithmetic-heavy theories warrant standard libraries rather than repeated local theory definitions;
- whether proof objects require a dedicated boundary/interface construct;
- whether Draft 0.2's set-like scope multiplicity rule survives future domains.

These are now concrete experimental questions rather than hidden assumptions.

---

## 25. Falsification rule

Draft 0.2 is not accepted merely because it can encode the Connect4 corpus.

Reject or simplify any addition that:

- fails cold reconstruction;
- merely renames conventional syntax without improving agent reasoning or lifecycle cost;
- creates compulsory translation machinery;
- forces semantic distinctions into hidden sidecars;
- makes canonicalization intractable for the intended use without compensating reasoning gain;
- causes agents to reason worse than over a simpler exact representation.

The purpose of this candidate is to make Experiment 002 honest: the proposition itself must live in AxiomeSH, not only its position in a graph.
