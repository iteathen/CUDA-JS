# AxiomeSH Core Specification — Draft 0.7 Candidate

**Status:** experimental tightening produced by Experiment 003 semantic-decomposition review  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5 → Draft 0.6  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens them  
**Promotion:** experimental-branch authority only

Draft 0.7 corrects an overly permissive reading of Draft 0.5. A named formal operator is not made native merely by assigning it a stable `^n` symbol. Whenever the operator's semantics can be constructed from more primitive relational/state structure already available to the theory, the native representation must expose that construction.

The objective is not to transliterate established logic notation into numbered predicates. The objective is to expose the underlying relational shape on which the logic depends.

---

## 1. Governing decomposition invariant

For formal-logic and proof-system work, the default direction is:

```text
named operator
-> semantic definition
-> relational/state construction
-> primitive model leaves
```

not:

```text
named operator
-> opaque semantic symbol
```

A stable semantic symbol may still name a derived construction for compact serialization, indexing, or review, but the named construction is not semantically complete until its native definition is present in the same qualified theory bundle or an explicitly included native dependency bundle.

A human name, conventional notation, or theorem-prover primitive is never sufficient evidence that an operator should be primitive in AxiomeSH.

---

## 2. Primitive floor

Draft 0.7 distinguishes three layers.

### 2.1 Core structural primitives

These are the representation-general forms already admitted by the candidate core, including where applicable:

- structural identities;
- exact literals;
- stable semantic-symbol identity;
- ordered incidence;
- scopes;
- choice;
- lexical binding;
- declarative implication/equality/negation;
- operational rewrite;
- first-class lexical abstraction;
- capture-avoiding structural instantiation.

Their continued admission remains subject to the existing experimental falsifiers.

### 2.2 Primitive model leaves

A theory may contain irreducible leaves supplied by the problem/model, such as:

- an atomic proposition valuation;
- an object/domain identity;
- a primitive one-step state transition;
- an agent accessibility edge;
- a one-step reduction edge;
- a base algebraic operation explicitly axiomatized by the source problem;
- a heap cell/address/value incidence;
- an externally supplied order/relation or observation.

A model leaf is admissible only when its semantics are genuinely part of the input model or source axioms rather than a hidden abbreviation for a known compound logical construction.

### 2.3 Derived semantic constructions

Operators whose meaning is constructible from core forms plus model leaves must be represented by native definitions over those structures.

Examples include, subject to the chosen profile:

- knowledge from accessibility + satisfaction;
- common knowledge from group accessibility closure;
- public announcement from model restriction;
- temporal `G/F/X/U` from trace/position structure;
- CTL path/state modalities from branching transition/path structure;
- separation conjunction from disjoint heap partition;
- Hoare validity from program transition + pre/post satisfaction;
- reflexive-transitive closure from finite path/reduction structure;
- proof/derivability from native proof objects and admissible rules;
- biconditional from two implications when the profile defines it that way;
- finite folds such as indexed conjunction/disjunction from explicit finite structure.

A derived construction may have a compact alias, but the alias is not an irreducible semantic leaf.

---

## 3. Irreducible-leaf burden

Before leaving a theory symbol opaque, the author must answer:

1. Is this relation/operator supplied directly by the source model, or is it normally defined from more primitive structure?
2. Would replacing it with its semantic definition expose distinctions needed for proof, composition, countermodels, or cross-domain isomorphism?
3. Is opacity being retained only for convenience, familiarity, compactness, or implementation ease?
4. Can a cold agent erase the name and still recover the operation from native structure?

If the answer to (1) is "normally defined" and a faithful decomposition is available, opacity requires explicit experimental justification.

Convenience alone is not justification.

---

## 4. Definitional transparency

A compact named operator is permitted only as a transparent derived surface.

A qualified bundle that uses such an alias must contain enough native structure to determine its expansion without an external glossary, host callback, parser special case, or undocumented convention.

The expansion may be represented by ordinary native rules/relations appropriate to the theory, but it must preserve the distinction between:

```text
definition / normalization
```

and:

```text
object-logic theorem inference
```

A proof must not become valid merely because a definitional alias exists.

---

## 5. Alias-erasure criterion

For every derived named operator used in a proof-qualified benchmark, qualification must be able to perform the following conceptual test:

```text
bundle with named aliases
-> expand/erase derived aliases
-> primitive-normal native bundle
```

The primitive-normal bundle must preserve the formal obligation and all load-bearing semantics.

A proof result depending on semantics that disappear when the alias is erased is not primitive-qualified.

This does not require every stored artifact to duplicate the fully expanded form. It requires the expansion to be native, exact, and available.

---

## 6. Satisfaction/evaluation is not a magic escape hatch

A theory may use a satisfaction relation while defining semantics, but a generic opaque `satisfies(model, state, formula)` relation cannot be used to hide every logical operator behind an external evaluator.

For proof qualification, satisfaction must itself be structurally defined recursively for the formula constructors exercised by the profile, down to primitive atomic valuation/model leaves.

Thus, schematically:

```text
Sat(w, atom)          <- atomic valuation leaf
Sat(w, A => B)        <- profile-specific implication semantics/proof relation
Sat(w, K_i A)         <- accessibility + Sat on reachable worlds
Sat(trace,t,G A)      <- ordering/reachability + Sat at future positions
```

The exact definitions are profile-owned, but the recursion may not be a hidden host operation.

---

## 7. Proof rules must expose their semantic owner

A proof profile may contain derived inference rules for efficiency, but each such rule must be either:

- primitive authority explicitly supplied by the logic profile/source; or
- derived from lower-level native semantic/proof structure with an auditable justification.

A rule named after a conventional theorem-prover operation is not self-justifying.

Optimization rules may remain as cached/derived proof lemmas after their equivalence or admissibility is established.

---

## 8. Domain-specific requirements exposed by Experiment 003

Draft 0.7 supersedes any reading of Draft 0.5 that allowed the following to remain semantically opaque merely because they were theory-owned symbols.

### 8.1 Epistemic / modal

Individual knowledge must reduce to the selected possible-world/accessibility semantics or another explicitly chosen native semantics.

For Kripke-style semantics, a `K_i A` alias is derived from:

- current world;
- agent-indexed accessibility relation;
- universal coverage of accessible worlds;
- native satisfaction of `A` in those worlds.

S4/S5 properties are constraints on accessibility structure, not magical properties of a `K` token.

Common knowledge must expose the applicable group-reachability/closure construction.

### 8.2 Dynamic epistemic public announcement

A public announcement is not ordinary implication.

For public-announcement semantics it must expose:

- the pre-update epistemic model;
- the announcement formula;
- the submodel/restriction retaining exactly worlds satisfying the announcement;
- restricted accessibility/valuation structure;
- post-update evaluation.

Repeated announcements compose state/model transformations explicitly.

### 8.3 Temporal logic

LTL operators must be grounded in trace/position structure.

At minimum the relevant profile must expose:

- positions/states;
- successor or ordering/reachability;
- atomic valuation;
- recursive formula satisfaction.

`X`, `F`, `G`, and `U` are then derived from that structure rather than opaque temporal predicates.

### 8.4 Branching-time logic

CTL path/state operators must be grounded in a branching transition system and path construction. `A` and `E` quantify over structurally represented paths generated by the transition relation. `AG`/`EF` are derived compositions, not primitive names.

### 8.5 Deontic logic

There is no profile-independent primitive meaning of obligation.

A benchmark must first select the deontic semantics being tested—e.g. accessibility/ideal-world, preference/selection, dyadic conditional, defeasible rule structure, or another explicit model. `O`/permission aliases are then constructed from that model.

This is especially load-bearing for contrary-to-duty benchmarks.

### 8.6 Separation / program logic

Separating conjunction must expose resource/heap partition, disjointness, and assertion satisfaction over subheaps.

Points-to structure should expose address/value/resource incidence.

A Hoare/program modality must expose program/state-transition semantics. The frame rule must be represented as a derived rule over disjoint preserved resources, not as an unexplained primitive theorem-prover rule.

### 8.7 Higher-order logic and function structure

A function-valued object must expose enough structure for the profile's intended semantics—e.g. graph/application relation plus totality/functionality/extensional conditions where relevant.

Higher-order application must not be a magic host call. Draft 0.5/0.6 abstraction and instantiation provide structural binding/substitution, while any mathematical function semantics remain native theory structure.

### 8.8 Proof/meta-theory

A primitive `provable(A)` token is insufficient for proof-property benchmarks.

Derivability must be connected to native proof objects/derivation trees whose steps reference explicit admissible rules and earlier premises.

The intuitionistic disjunction-property benchmark therefore tests proof-object structure, not merely a boolean theorem predicate.

### 8.9 Reflexive-transitive closure / confluence

A closure alias must expand to native finite-path/zero-or-more-step structure over the supplied one-step relation or another explicitly defined inductive closure.

Church–Rosser cannot assume confluence from a `closure` token; the one-step reduction system remains the primitive source relation.

---

## 9. Parameterized benchmark families

A parameterized family may use higher-level generation structure at the source/family layer, but a measured proof instance must expose the concrete finite obligation being proved.

For example:

- a concrete pigeonhole instance should contain the actual indexed finite formula/clauses or a natively expanded equivalent;
- XOR hardness instances must freeze the graph and parity constraints;
- muddy-children runs must freeze agent count, muddy count/model, and announcement sequence.

A hidden external generator is not part of a self-contained proof bundle.

---

## 10. Qualification gates added by Draft 0.7

Experiment 003 inserts a primitive-decomposition gate between statement expressibility and proof-profile completion.

### E1P — primitive semantic decomposition

A benchmark/profile passes E1P only when:

1. every conventional derived logic operator used by the proof obligation has a native semantic expansion;
2. primitive model leaves are explicitly identified;
3. no host evaluator or opaque operator supplies missing semantics;
4. named aliases are erasure-safe;
5. concrete proof instances contain their required finite/model structure;
6. proof/meta-theory relations connect to native proof objects rather than opaque theorem predicates.

E1P failure blocks E3/E4 proof claims.

### E1A — alias-erasure audit

For profiles using derived aliases, an audit must verify that expanding/removing those aliases leaves an equivalent primitive-normal obligation.

---

## 11. Current Experiment 003 consequence

The existing `FORMAL_LOGIC_BENCHMARKS_003.axh` is retained as a statement/formalization scaffold and source-fidelity artifact.

Its use of symbols for modal, temporal, deontic, spatial, proof, closure, and higher-order concepts does **not** by itself satisfy E1P.

Existing classical and intuitionistic profile candidates must also be reviewed under the same rule: any named rule/operator is admissible only to the extent that its authority or derivation is explicit in native structure.

No remaining E3 module may be considered complete merely because it assigns native IDs to conventional logic rules.

---

## 12. Design objective

The standard for Experiment 003 is:

```text
preserve source theorem
+ expose semantic mechanism
+ minimize opaque leaves
+ keep proof authority explicit
+ retain native reconstructability
```

The intended benefit is structural comparability across logics. Two operators with different names but the same underlying relational construction should become visibly similar; two operators with similar notation but different semantics should remain structurally different.

That is a primary AxiomeSH objective, not optional prettification.

---

## 13. Falsifiers

Revise Draft 0.7 if controlled evidence shows that:

- primitive-normal expansion systematically destroys reasoning performance without yielding compensating correctness/synthesis benefit;
- a supposed derived operator cannot actually be represented without a hidden semantic evaluator;
- the primitive/derived boundary becomes less reconstructable than the named formalism;
- alias erasure changes theorem meaning despite a claimed exact definition;
- a proposed model leaf is shown to conceal a load-bearing compound construction;
- a simpler representation exposes the same semantic mechanism with lower lifecycle/reasoning cost.

Performance may justify retained derived aliases or compiled caches after equivalence is qualified. It does not justify making their semantics opaque.