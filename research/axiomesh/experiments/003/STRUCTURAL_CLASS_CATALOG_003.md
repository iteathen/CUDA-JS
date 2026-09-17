# Experiment 003 — Structural Class Catalog

**Status:** candidate class map derived from primitive-decomposition work  
**Spec:** `../../CORE_SPEC_DRAFT_0_8_CANDIDATE.md`  
**Authority:** classification aid only; primitive/native definitions remain semantic authority

## Rule

Classes are assigned only after decomposition.

The workflow is:

```text
source operator/object
-> primitive/native decomposition
-> canonical construction shape
-> class comparison
-> class/instance label
```

A class label does not prove equivalence. It records a candidate common structural form whose instance must still preserve all source constraints.

## C1 — Universal satisfaction over a generated region

Shape:

```text
origin
+ region generator / relation
+ body/property
-> body holds at every generated member
```

Known/candidate instances:

- individual knowledge over one agent accessibility image;
- LTL globally over the reflexive future region;
- CTL universal-always after the branching/path layer is made explicit;
- universal quantification over an explicitly generated domain, when represented semantically rather than only by binder syntax.

Important specializations:

- knowledge constrains the generator by agent-indexed accessibility;
- LTL globally constrains it to one linear trace/future order;
- CTL AG requires universal path/state generation, not merely one relation image.

These are therefore related shapes, not interchangeable operators.

## C2 — Existential satisfaction over a generated region

Shape:

```text
origin
+ region generator / relation
+ body/property
-> some generated member satisfies body
```

Known/candidate instances:

- LTL eventually;
- CTL EF after branching reachability is made explicit;
- existential quantification over a represented domain;
- reachability goals with a target predicate.

## C3 — Immediate-successor evaluation

Shape:

```text
origin
+ immediate-successor relation
+ body
-> body holds at the immediate successor
```

Known/candidate instances:

- LTL next;
- program/dynamic one-step postcondition checks where the program semantics supplies one deterministic step.

This class is distinct from arbitrary reachability.

## C4 — Finite path / reflexive-transitive closure

Shape:

```text
primitive one-step edge
+ zero-path witness
+ recursive path-step construction
-> reachable endpoint / explicit path witness
```

Known/candidate instances:

- common-knowledge reachability over unioned group accessibility edges;
- reduction closure in Church–Rosser;
- ordinary graph/state reachability;
- CTL finite reachability components.

The current native evidence is `foundations/FOUNDATION_FINITE_PATH_003.axh`.

## C5 — Predicate-selected structure restriction

Shape:

```text
source structure
+ selection predicate
-> substructure containing exactly selected members
+ restricted relations/valuation
```

Known/candidate instances:

- public-announcement model update;
- filtered state spaces or guarded quotient/restriction operations where source semantics actually require induced restriction.

Public announcement additionally carries the post-update evaluation convention, so the full operator is a composition of this class with satisfaction.

## C6 — Disjoint decomposition / recomposition

Shape:

```text
whole resource
-> exists compatible/disjoint parts
-> recomposition equals whole
-> sub-properties hold on parts
```

Known/candidate instances:

- separation-logic separating conjunction;
- resource/frame decomposition;
- potentially other ownership/resource compositions when the same disjoint-union semantics is genuinely present.

The class must not be generalized to arbitrary conjunction or ordinary graph composition.

## C7 — Transition-preservation judgment

Shape:

```text
precondition satisfaction
+ transition/program relation
-> every relevant successor satisfies postcondition
```

Known/candidate instances:

- Hoare partial-correctness validity;
- box-like program modalities under matching transition semantics;
- invariant preservation across a transition relation.

Deterministic versus nondeterministic transition semantics remain parameters/constraints.

## C8 — Finite locally validated derivation

Shape:

```text
finite dependency structure
+ local rule at each node
+ premise/child references
+ root conclusion
-> valid derivation/proof object
```

Known/candidate instances:

- constructive natural-deduction proof terms;
- classical natural deduction as a specialization adding classical rule authority;
- proof-property/meta-theorem benchmarks;
- potentially rewrite derivations when they share the same local-validity/dependency form.

A cached `derivable` label is an instance surface over existence of a valid object in this class, not the class semantics itself.

## C9 — Finite indexed fold

Shape:

```text
finite indexed family
+ base/identity
+ binary combining relation/operation
-> folded result
```

Known/candidate instances:

- finite conjunction/disjunction expansion;
- XOR/parity fold;
- finite aggregate constructions used by parameterized SAT benchmarks.

The combining operation remains a parameter. XOR and OR are not identified merely because both are folds.

## C10 — Bound-body instantiation

Shape:

```text
binder ownership
+ body
+ replacement argument
-> capture-avoiding replacement of owned occurrences
```

Current candidate surface:

```text
ABSTRACTION @@ ARGUMENT
```

Draft 0.8 does not assume `@@` is irreducible core syntax. This class records the semantic construction that the syntax currently names.

Known/candidate uses:

- quantifier instantiation;
- substitution into explicitly packaged bound bodies;
- beta-like structural substitution before a profile supplies mathematical lambda semantics.

## C11 — Functional graph application

Shape:

```text
function object / graph
+ input
+ functionality constraint
(+ totality/codomain constraints when required)
-> unique output relation
```

Known/candidate instances:

- higher-order function application under extensional graph semantics;
- source algebraic operations represented extensionally rather than as opaque host calls.

This is separate from C10: structural binder instantiation is not automatically mathematical function application.

## C12 — Well-founded propagation

Shape:

```text
relation
+ well-foundedness authority
+ property preserved from all predecessors to node
-> property for all nodes
```

Candidate instances:

- well-founded induction;
- recursive termination arguments when the same well-founded relation semantics is present.

This remains a candidate class until the Experiment 003 well-founded profile is decomposed concretely.

## Composite examples

### Knowledge

```text
agent-indexed accessibility leaf
+ shared satisfaction
+ C1 universal-over-generated-region
```

### Common knowledge

```text
union/group accessibility construction
+ C4 finite-path closure
+ C1 universal-over-generated-region
```

### LTL G

```text
linear trace/future-order structure
+ C1 universal-over-generated-region
```

### LTL F

```text
linear trace/future-order structure
+ C2 existential-over-generated-region
```

### LTL X

```text
discrete trace successor
+ C3 immediate-successor evaluation
```

### Public announcement

```text
shared satisfaction
+ C5 predicate-selected structure restriction
+ post-update satisfaction
```

### Separating conjunction

```text
heap/resource leaves
+ C6 disjoint decomposition/recomposition
+ recursive satisfaction on each part
```

### Hoare validity

```text
program transition leaf
+ satisfaction
+ C7 transition-preservation judgment
```

### Common reduction closure

```text
one-step reduction leaf
+ C4 finite-path closure
```

## Class creation rule

Do not create a new class because a benchmark introduces a new name.

Create a candidate class only when decomposed native structures reveal a reusable pattern not already captured by an existing class or composition of classes.

A candidate class becomes qualified only after:

1. at least one exact native construction exists;
2. its parameters/invariants are explicit;
3. class-label erasure preserves the construction;
4. at least one independent cold reconstruction succeeds;
5. cross-domain instances, if claimed, preserve their domain-specific constraints;
6. no simpler class/composition captures the same structure.

## Labels

Human class labels in this document are aids for review and construction.

Native class identities may be assigned later once the class boundaries stabilize. Numeric native IDs should not be allocated merely to make the catalog look complete.

The semantic authority remains the decomposed native structure until class identity itself is qualified.
