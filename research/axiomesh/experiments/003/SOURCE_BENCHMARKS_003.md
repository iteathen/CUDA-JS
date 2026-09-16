# Experiment 003 — Formal Logic Benchmark Source Corpus

**Status:** frozen source-intent snapshot  
**Research direction:** Josh Oshiro  
**Purpose:** pressure AxiomeSH across proof domains beyond the Connect4 corpus

This file preserves the benchmark set supplied for Experiment 003. It is source/scorer material, not cold-decoder input.

The benchmark suite deliberately mixes object-level theorems, parameterized families, consistency probes, and meta-theorems. Those distinctions are part of the test and must not be flattened.

## IDs

| ID | Benchmark | Domain |
|---|---|---|
| FL-001 | Peirce's Law | Classical propositional logic |
| FL-002 | Pigeonhole Principle `PHP_n^{n+1}` | Propositional SAT / CNF hardness |
| FL-003 | Urquhart XOR parity constraints | Propositional hardness / modulo reasoning |
| FL-004 | Schubert's Steamroller / Pelletier #47 | Typed/multi-sorted first-order logic |
| FL-005 | Drinker Paradox | Classical first-order logic |
| FL-006 | Group inverse uniqueness | FOL with equality |
| FL-007 | Barber Paradox | FOL with bi-implication |
| FL-008 | Muddy Children | Dynamic epistemic logic / S5 |
| FL-009 | Wisest Wise Man | Multi-agent modal logic |
| FL-010 | Chisholm contrary-to-duty | Deontic / dyadic obligation logic |
| FL-011 | Request/Acknowledge safety+liveness | LTL |
| FL-012 | CTL state duality | CTL |
| FL-013 | Pointer swap / frame rule | Separation + dynamic logic |
| FL-014 | Glivenko double-negation embedding | Intuitionistic propositional logic |
| FL-015 | Disjunction property | Constructive / intuitionistic meta-logic |
| FL-016 | Cantor power-set benchmark | Higher-order logic |
| FL-017 | Well-founded induction | Second-order / typed higher-order logic |
| FL-018 | Church–Rosser confluence | Type theory / inductive reduction |

---

## FL-001 — Peirce's Law

Formula:

```text
(((P -> Q) -> P) -> P)
```

Tested distinctions:

- pure implication;
- classical validity boundary;
- relationship to double-negation elimination;
- rejection under ordinary intuitionistic proof rules.

Proof mode: theorem.

---

## FL-002 — Pigeonhole Principle

Formula family:

```text
(AND i=1..n+1 (OR j=1..n x[i,j]))
->
(OR j=1..n (OR 1<=i<k<=n+1 (x[i,j] AND x[k,j])))
```

Tested distinctions:

- indexed formula construction;
- bounded finite quantification/folds;
- combinatorial conflict detection;
- resolution-proof growth.

Proof mode: parameterized family. Initial measured instances: `n=3,4,5`; larger instances may be added when cost permits.

---

## FL-003 — Urquhart XOR parity constraints

Formula family:

```text
XOR_{e in E(G)} v_e = 1
```

for an expander graph `G`.

Tested distinctions:

- parity/XOR as theory structure;
- modulo-2 reasoning;
- extended-resolution versus ordinary-resolution behavior;
- graph-indexed variable families.

Proof mode: parameterized hardness family. A concrete graph instance must be frozen before measured proof comparison.

---

## FL-004 — Schubert's Steamroller / Pelletier #47

Source theorem intent:

> Formalize the wolf/fox/bird/caterpillar/snail/grain/plant predator-prey theory and derive that there exists an animal which eats an animal that eats grain.

Conclusion shape:

```text
exists x y z.
  Animal(x) & Animal(y) & Grain(z) & Eats(y,z) & Eats(x,y)
```

Tested distinctions:

- multi-sorted or explicitly sorted FOL;
- deep universal/existential nesting;
- unification search;
- sort hierarchy / category constraints.

Proof mode: theorem, but **exact premise import is required before proof scoring**. The English summary alone is not a complete formal problem.

Canonical external benchmark reference for later normalization:

`TPTP PUZ031-1 — Schubert's Steamroller / Pelletier 47`

`https://tptp.org/Seminars/TPTP/TPTPFiles/PUZ031-1.p.html`

Experiment 003 must not invent missing Steamroller axioms merely to make the proof run.

---

## FL-005 — Drinker Paradox

Formula:

```text
exists x. (P(x) -> forall y. P(y))
```

Tested distinctions:

- universal/existential scope;
- predicate-valued application;
- classical non-constructive existential reasoning.

Proof mode: theorem under a classical nonempty-domain profile.

---

## FL-006 — Group inverse uniqueness / left inverse consequence

Premises:

```text
forall x. x * e = x
forall x. x * inv(x) = e
forall x y z. (x*y)*z = x*(y*z)
```

Goal:

```text
forall x. inv(x) * x = e
```

Tested distinctions:

- equality substitution;
- associative term rewriting;
- congruence/paramodulation style reasoning;
- nested functional terms.

Proof mode: theorem.

---

## FL-007 — Barber Paradox

Formula:

```text
not exists x. forall y.
  (Shaves(x,y) <-> not Shaves(y,y))
```

Tested distinctions:

- self-reference;
- universal/existential interaction;
- bi-implication as theory structure;
- contradiction derivation.

Proof mode: theorem in classical FOL.

---

## FL-008 — Muddy Children

Source shape:

```text
AND_i K_i(OR_j m_j)
AND C_G(Axioms)
|- [! AND_i not K_i m_i]^k K_i m_i
```

Tested distinctions:

- individual knowledge `K_i`;
- common knowledge;
- group/indexed formulas;
- public-announcement update;
- repeated model update;
- `n`-agent scaling.

Proof mode: parameterized DEL family. Concrete `n`, muddy-count, and announcement-depth instances must be frozen for measured runs.

---

## FL-009 — Wisest Wise Man

Premises:

```text
K1 K2 not K3 P
K1(not K2 not P -> P)
```

Goal:

```text
K1 P
```

Tested distinctions:

- nested agent modalities;
- positive/negative introspection profile;
- modality elimination;
- S4/S5 profile sensitivity.

Proof mode: theorem only relative to the supplied modal frame/profile.

---

## FL-010 — Chisholm contrary-to-duty benchmark

Premises/source shape:

```text
O(p)
O(p -> q)
not p -> O(not q)
not p
```

Supplied probe target:

```text
bottom
```

Tested distinctions:

- obligation/permission vocabulary;
- contrary-to-duty conditionals;
- consistency versus explosive encoding;
- dyadic/defeasible deontic profile sensitivity.

Proof mode: **consistency/profile probe**, not an unconditional classical theorem. Experiment 003 must score the result against the explicitly supplied deontic profile rather than assume ordinary propositional explosion.

---

## FL-011 — LTL Request/Acknowledge Safety & Liveness

Premises:

```text
G(Req -> F Ack)
G(Ack -> X Release)
```

Goal:

```text
G(Req -> F Release)
```

Tested distinctions:

- globally;
- eventually;
- next;
- until/profile support;
- composition of safety/liveness obligations.

Proof mode: theorem relative to standard LTL semantics.

---

## FL-012 — CTL state duality

Formula:

```text
AG(P) <-> not EF(not P)
```

Tested distinctions:

- path quantification;
- state/path duality;
- nested negation;
- branching-time semantics.

Proof mode: theorem relative to standard CTL semantics.

---

## FL-013 — Pointer swap / frame-rule benchmark

Hoare/spatial target:

```text
{x |-> a * y |-> b}
swap(x,y)
{x |-> b * y |-> a}
```

Tested distinctions:

- points-to assertions;
- separating conjunction;
- magic wand / frame-rule vocabulary;
- state transition/program modality;
- alias/resource separation.

Proof mode: theorem relative to a supplied separation/dynamic-logic profile and concrete swap semantics.

---

## FL-014 — Glivenko double-negation benchmark

Formula:

```text
not not (P OR not P)
```

Tested distinctions:

- constructive negation;
- absence of unrestricted excluded middle;
- double-negation embedding;
- classical/intuitionistic profile separation.

Proof mode: theorem in IPL.

---

## FL-015 — Disjunction property

Meta-theorem:

```text
if |- A OR B
then |- A or |- B
```

Tested distinctions:

- theorem/proof relation as a first-class object;
- meta-level versus object-level formulas;
- proof extraction;
- Curry–Howard-style witness/program recovery.

Proof mode: meta-theorem / proof-property verification.

---

## FL-016 — Cantor power-set benchmark

Supplied formula:

```text
forall f : A -> (A -> Bool).
  not (exists g : A.
    forall S : A -> Bool.
      f(g) = S)
```

Tested distinctions:

- higher-order function types;
- quantification over function-valued terms;
- explicit application;
- lambda/lexical abstraction for a diagonal witness;
- diagonal reasoning.

Proof mode: higher-order theorem benchmark.

**Normalization warning:** the supplied formula is preserved as supplied. It is not silently replaced by the usual no-surjection statement. Before scoring a result as “Cantor's theorem”, Experiment 003 must normalize a canonical surjectivity formulation as a separate source decision.

---

## FL-017 — Well-founded induction

Supplied principle:

```text
forall P : A -> Prop.
  (forall x.
    ((forall y. R(y,x) -> P(y)) -> P(x)))
  ->
  forall x. P(x)
```

Tested distinctions:

- predicate quantification;
- higher-order application;
- recursive/well-founded relation reasoning;
- induction profile.

Proof mode: theorem/principle relative to an explicit well-foundedness premise/profile. The proof bundle must make that premise explicit rather than infer it from the benchmark title.

---

## FL-018 — Church–Rosser confluence

Property shape:

```text
forall a b c.
  (a ->>* b AND a ->>* c)
  ->
  exists d.
    (b ->>* d AND c ->>* d)
```

Tested distinctions:

- reflexive-transitive closure;
- inductive reduction;
- confluence/diamond reasoning;
- dependent-product / proof-term structure.

Proof mode: property schema until the reduction relation and its inductive theory are supplied. A standard Church–Rosser proof must bind this to the intended reduction system rather than treat arbitrary relations as confluent.

---

# Qualification discipline

The suite distinguishes:

```text
source fidelity
native expressibility
cold reconstruction
proof-profile completeness
proof execution
proof review
```

A theorem statement that is natively representable but lacks its complete premise/rule profile has **not** passed proof qualification.

Likewise, a source problem that is under-specified is not repaired by importing convenient assumptions silently.
