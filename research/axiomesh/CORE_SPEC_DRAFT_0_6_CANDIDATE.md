# AxiomeSH Core Specification — Draft 0.6 Candidate

**Status:** experimental expansion produced by Experiment 003 E3 proof-profile construction  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly extends them  
**Promotion:** experimental-branch authority only

Draft 0.6 closes one representation-general gap exposed after Draft 0.5 made lexical abstraction first-class: native proof profiles need to instantiate a bound structural body without delegating capture-avoiding substitution to hidden host semantics.

The new operation is structural instantiation. It is intentionally narrower than mathematical function application.

---

## 1. Authority and compatibility

A Draft 0.6 decoder reads Draft 0.2, Draft 0.3, Draft 0.4, Draft 0.5, and this amendment in that order.

Draft 0.6 changes only:

- first-class structural instantiation of lexical abstractions;
- first-class abstraction operands for universal/existential formula constructors;
- canonical equivalence between compact binder syntax and abstraction-valued binder structure.

Draft 0.3 lexical-scope rules remain authoritative.

Draft 0.5's distinction between generic structural abstraction and theory-owned lambda/Pi/set constructors remains authoritative.

---

## 2. Structural instantiation

Draft 0.6 adds:

```text
ABSTRACTION @@ ARGUMENT
```

as a core structural term.

The left operand MUST resolve to a Draft 0.5 lexical abstraction:

```text
\?n BODY
```

The result is `BODY` with the occurrences bound by that abstraction replaced by `ARGUMENT`, using capture-avoiding substitution.

Example:

```text
(\?0[(^17 ?0)]) @@ 42
```

has structural result:

```text
[(^17 42)]
```

The identity `42` above is illustrative structural identity, not literal `#42`.

### 2.1 Structural operation, not object-logic inference

`@@` performs syntax/structure instantiation only.

It does not assert:

- beta conversion for every represented lambda calculus;
- mathematical function application;
- equality between an arbitrary function term and its result;
- quantifier elimination;
- proof admissibility.

A theory/profile may use structural instantiation inside its own proof rules where valid.

### 2.2 Left operand validity

If the left operand is not a lexical abstraction, the instantiation term is invalid for canonical Draft 0.6 evaluation.

A variable may appear as the left operand when its binding is constrained by surrounding native structure to an abstraction term. The proof/profile using it owns that constraint.

---

## 3. Capture avoidance

For:

```text
(\?n BODY) @@ ARG
```

substitution replaces exactly the occurrences of `?n` owned by the outer abstraction.

It does not replace occurrences owned by another binder.

Before insertion, any inner binder whose variable could capture a free variable of `ARG` MUST be alpha-renamed to a fresh local variable number.

Alpha-renaming follows Draft 0.3 lexical equivalence and does not change semantic identity.

Because Draft 0.3 forbids nested rebinding of an already-visible variable number, ownership is always lexically decidable.

### 3.1 No dependence on serialized variable number

The semantic result depends on binder ownership, not on the numeric spelling of the bound variable.

Thus alpha-equivalent abstractions produce alpha-equivalent instantiation results.

---

## 4. Structural recursion of instantiation

Instantiation traverses the native term structure recursively.

It preserves token classes and substitutes only the abstraction-owned variable occurrences inside:

- ordered incidence edges;
- unordered scopes;
- choices;
- declarative negation;
- negative-match terms where such a term is being manipulated as structure;
- equality terms;
- implications;
- operational rules when they are first-class represented terms;
- nested semantic applications;
- nested quantifiers and abstractions, subject to lexical ownership/capture avoidance;
- reference-expanded structure.

It does not alter:

- exact literals;
- semantic-symbol identity;
- unrelated structural identities;
- rewrite/implication direction;
- quantifier kind;
- choice versus conjunction structure.

References are expanded according to the existing reference rules before canonical instantiation identity is assessed.

---

## 5. Quantifiers expose abstraction-valued structure

Draft 0.2 introduced compact formula binders:

```text
*?n BODY
+?n BODY
```

Draft 0.6 also permits the explicit abstraction-operand forms:

```text
*(ABSTRACTION)
+(ABSTRACTION)
```

The operand MUST resolve to a lexical abstraction.

The following pairs have the same structural meaning in formula position:

```text
*?0 BODY
*(\?0 BODY)
```

and:

```text
+?0 BODY
+(\?0 BODY)
```

The compact form remains valid and may remain preferable for source statements.

The explicit form exists so proof rules and higher-order/meta-theory can quantify over a bound body as one first-class abstraction object instead of reconstructing it through a hidden syntax convention.

### 5.1 Context-sensitive existential/freshness distinction remains

Draft 0.2's operational fresh-allocation use of `+?n` in rewrite RHS creation context remains distinct from declarative existential quantification.

The explicit `+(ABSTRACTION)` form is declarative only.

---

## 6. Grammar extension

Draft 0.6 adds:

```text
instantiate := term "@@" term
forall_abs  := "*(" term ")"
exists_abs  := "+(" term ")"
```

and adds these forms to `term` where appropriate.

The operand of `forall_abs` and `exists_abs` must resolve to an abstraction term.

`@@` MUST be structurally nested/parenthesized when surrounding syntax could admit more than one parse. Whitespace does not determine precedence.

---

## 7. Canonicalization

Canonical semantic identity MUST treat:

```text
*?n BODY
```

and:

```text
*(\?n BODY)
```

as the same binder structure after alpha normalization.

The same applies to existential formula binders.

An implementation MAY serialize the compact form while retaining the abstraction-valued internal structure.

A canonicalizer evaluating a closed instantiation term MAY reduce it to its capture-avoiding result. A qualification artifact must state whether it compares pre-reduction syntax, normalized structural result, or both.

---

## 8. Proof-profile use

Draft 0.6 is motivated by proof-rule schemas, but does not privilege a proof calculus.

A FOL profile can now represent the structural core of universal instantiation using an abstraction-valued quantified body and `@@`, while a higher-order profile can use the same operation to express substitution of an explicitly packaged body.

The admissibility of such a proof step still belongs to the profile.

This preserves:

```text
core owns structural binding/instantiation
profile owns logical inference
```

rather than making every logic reimplement capture-avoiding native-term substitution.

---

## 9. No generic hidden application

Draft 0.5 stated that a variable in edge-head position does not silently become a function application.

Draft 0.6 retains that rule.

`@@` applies only to lexical abstractions as structural bodies.

Arbitrary higher-order function application remains explicit theory structure unless a future experiment demonstrates a more general representation need.

---

## 10. Qualification requirements

Draft 0.6 is qualified only if experiments demonstrate all of the following:

1. alpha-equivalent abstractions instantiate to alpha-equivalent results;
2. capture avoidance is reconstructed correctly by a cold decoder;
3. nested unrelated binders are preserved;
4. FOL quantifier-rule profiles can state instantiation without hidden substitution callbacks;
5. higher-order benchmarks can use the same structural operation without forcing lambda semantics into core;
6. the operation does not create a second quoted-AST representation;
7. proof review can verify instantiated conclusions against the native source formula.

---

## 11. Falsifiers

Revise or reject this candidate if:

- proof profiles can express binder elimination equally exactly using Draft 0.5 without hidden semantics;
- `@@` creates parser or ownership ambiguity;
- capture avoidance requires non-native information;
- explicit abstraction-operand quantifiers create a second semantic representation rather than exposing the existing one;
- a more general structural operation subsumes this one with lower lifecycle/reasoning cost;
- agents reason materially worse with the extra form.

Draft 0.6 is not promoted merely because it makes proof-profile notation convenient. Its burden is to prove that native binder manipulation becomes exact, self-contained, and reusable across independent logics.
