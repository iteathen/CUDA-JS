# Experiment 003 — Primitive Decomposition Audit

**Status:** active E1P audit  
**Spec:** `CORE_SPEC_DRAFT_0_7_CANDIDATE.md`  
**Purpose:** prevent named logic operators from hiding semantics behind stable IDs

## Audit rule

For every benchmark:

```text
named notation
-> native semantic construction
-> primitive model leaves
```

A benchmark is not E1P-complete merely because its source formula is faithfully represented with `^n` symbols.

## Primitive leaves versus derived constructions

The following are presumptively valid primitive leaves when supplied by the source problem/model:

- atomic proposition valuation;
- object/domain membership;
- one-step state transition;
- agent-indexed accessibility edge;
- one-step reduction relation;
- heap address/value incidence;
- source algebraic operations constrained by explicit axioms;
- explicit source ordering/relation facts.

The following are presumptively derived and must not remain semantically opaque:

- `iff` when defined by implication structure;
- finite conjunction/disjunction folds;
- XOR/parity when its boolean/modulo semantics is part of the test;
- `K_i`, common knowledge, public announcement;
- obligation/permission under a selected deontic model;
- `G/F/X/U`, CTL `A/E`, `AG/EF`;
- separating conjunction, Hoare validity, frame rule;
- theorem/derivable predicates;
- reflexive-transitive closure;
- lambda/Pi/application where their semantic action is needed by the proof.

## Per-benchmark disposition

### FL-001 — Peirce

**Primitive-normal target:** formula variables + core implication.  
**Profile dependency:** classical proof authority, not a new formula primitive.  
**Current scaffold:** acceptable statement structure.  
**E1P:** near-ready; classical profile must expose rule authority rather than hide it behind named rules.

### FL-002 — Pigeonhole

**Primitive-normal target:** frozen finite index objects and explicit propositional variables/clauses or an exactly expanded finite conjunction/disjunction structure.  
**Do not hide:** indexed OR/AND folds behind opaque fold operators during measured proof execution.  
**Primitive leaves:** concrete index identities and atomic `x[i,j]` propositions.  
**E1P blocker:** concrete `n=3,4,5` expansions not yet frozen.

### FL-003 — Urquhart XOR parity

**Primitive-normal target:** concrete graph + edge-variable incidence + explicit parity semantics.  
**Do not hide:** XOR or mod-2 evaluation behind an unexplained predicate. A parity-aware proof system may retain derived parity lemmas only after equivalence to the native boolean/parity construction is explicit.  
**Primitive leaves:** concrete graph incidence and atomic edge variables.  
**E1P blocker:** graph fixtures and primitive parity construction.

### FL-004 — Steamroller

**Primitive-normal target:** exact FOL premise set, object/sort membership, atomic predicates such as `Eats`, and core quantifier/equality structure.  
**Primitive leaves:** source predicates and domain/sort facts.  
**Do not hide:** sort hierarchy or quantifier behavior in external typing callbacks.  
**E1P blocker:** exact TPTP premise import.

### FL-005 — Drinker

**Primitive-normal target:** predicate `P` as atomic leaf + explicit nonempty-domain authority + core quantifier/implication structure.  
**E1P blocker:** classical nonempty-domain profile must be explicit.

### FL-006 — Group inverse consequence

**Primitive-normal target:** group carrier, multiplication/inverse/identity as source algebraic leaves constrained by explicit group axioms; equality/substitution via native profile rules.  
**Do not hide:** congruence/paramodulation as magic operations; derived proof accelerators require native justification.  
**E1P blocker:** FOL/equality profile after Draft 0.6 qualification.

### FL-007 — Barber

**Primitive-normal target:** `Shaves` atomic relation + quantifiers/negation; biconditional expanded to its selected primitive implication/conjunction construction.  
**Do not hide:** `iff` as an unexplained semantic atom.  
**E1P blocker:** FOL profile and biconditional expansion rule.

### FL-008 — Muddy Children

**Primitive-normal target:** possible worlds, per-agent accessibility, muddy atomic valuation, group accessibility closure, public-announcement model restriction, repeated update sequence.  
**Derived:** `K_i`, common knowledge, announcement modality.  
**Primitive leaves:** worlds, accessibility edges, atomic muddy valuation.  
**E1P blocker:** concrete agent/muddy instance plus native DEL semantic foundation.

### FL-009 — Wisest Wise Man

**Primitive-normal target:** possible worlds + agent accessibility + recursively defined formula satisfaction.  
**Derived:** every `K_i` occurrence.  
**S4/S5:** structural constraints on accessibility (reflexive/transitive and, where S5, equivalence-like closure), not token properties.  
**E1P blocker:** selected modal profile and native Kripke semantic foundation.

### FL-010 — Chisholm

**Primitive-normal target:** must first select the intended deontic semantics.  
**Derived:** obligation/permission operators from that model.  
**Rejected shortcut:** opaque `O` with assumed KD45/defeasible behavior.  
**E1P blocker:** exact deontic profile choice; no unconditional semantics may be invented.

### FL-011 — LTL request/acknowledge

**Primitive-normal target:** trace, positions, successor/order/reachability, atomic state valuation, recursive satisfaction.  
**Derived:** `X`, `F`, `G`, `U`.  
**E1P blocker:** native LTL semantic foundation.

### FL-012 — CTL duality

**Primitive-normal target:** branching transition system, generated paths, path positions, atomic valuation, recursive state/path satisfaction.  
**Derived:** `A`, `E`, `G`, `F`, `AG`, `EF`.  
**E1P blocker:** native CTL semantic foundation.

### FL-013 — Pointer swap / separation logic

**Primitive-normal target:** heap/resource objects, address/value incidence, disjoint heap partition/union, program state transition/read/write semantics, assertion satisfaction.  
**Derived:** points-to assertion when representable from singleton heap incidence; separating conjunction; Hoare validity; frame rule.  
**E1P blocker:** concrete swap semantics and native heap/separation foundation.

### FL-014 — Glivenko

**Primitive-normal target:** core negation + disjunction construction; no classical completion rule.  
**E1P:** near-ready after intuitionistic profile review.

### FL-015 — Disjunction property

**Primitive-normal target:** explicit proof objects/derivation trees and admissible rule applications.  
**Rejected shortcut:** an opaque `provable(A)` predicate.  
**The meta-theorem quantifies over formulas/proofs, not over a hidden external prover result.**  
**E1P blocker:** native proof-object relation for the intuitionistic profile.

### FL-016 — Cantor

**Primitive-normal target:** function objects represented by graph/application structure with required totality/functionality/extensional conditions; predicate-valued sets/functions; abstraction for diagonal witness; explicit application.  
**Derived:** surface lambda/function application notation.  
**Primitive leaves:** domain identities and graph membership/incidence as chosen by HOL foundation.  
**E1P blocker:** canonical theorem normalization decision plus HOL semantic foundation.

### FL-017 — Well-founded induction

**Primitive-normal target:** predicate objects/application + relation `R` + explicit authority for well-foundedness.  
**Preferred concrete qualification:** native well-founded certificate/ranking/accessibility structure when an instance permits it.  
**Do not assume:** benchmark title alone makes `R` well-founded.  
**E1P blocker:** exact well-foundedness premise/profile and HOL/FOL binding support.

### FL-018 — Church–Rosser

**Primitive-normal target:** primitive one-step reduction relation; zero-or-more closure constructed from finite path/inductive step structure; confluence quantified over the resulting closure.  
**Derived:** reflexive-transitive-closure alias and any dependent proof constructor.  
**Primitive leaf:** one-step reduction supplied by the selected calculus.  
**E1P blocker:** concrete reduction system and native closure construction.

## Cross-domain foundation modules required

The remaining Experiment 003 work should be organized around reusable semantic foundations, not benchmark-specific opaque operators:

1. propositional proof-object foundation;
2. FOL domain/quantifier/equality foundation;
3. finite-index/fold/parity foundation;
4. possible-world/accessibility/satisfaction foundation;
5. public-announcement/model-restriction foundation;
6. trace/position temporal foundation;
7. branching transition/path foundation;
8. normative/deontic model foundation selected per benchmark;
9. heap/resource/program-state foundation;
10. higher-order function/predicate/application foundation;
11. proof-object/meta-theory foundation;
12. reduction-path/closure foundation.

These foundations should share lower-level structural machinery where their relational shapes coincide rather than reintroducing domain names as unrelated primitives.

## Qualification requirement

Before any benchmark is marked E3-complete, record:

```text
primitive leaves
native derived definitions
alias-erasure result
profile axioms/rules
proof obligation
```

A missing entry blocks E3/E4.
