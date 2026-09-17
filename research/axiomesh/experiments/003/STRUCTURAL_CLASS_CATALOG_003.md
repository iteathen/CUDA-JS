# Experiment 003 — Structural Class Catalog

**Status:** candidate class/factorization map derived from primitive-decomposition work  
**Spec:** `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`  
**Comparison protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`  
**Native registry:** `STRUCTURAL_CLASS_REGISTRY_003.axh`  
**Authority:** classification aid only; primitive/native definitions and witnessed mappings remain semantic authority

## Rule

Classes are assigned only after decomposition and witnessed comparison.

The workflow is:

```text
source operator/object
-> one or more qualified native decompositions
-> N0/N1 representation normalization
-> label-blind structural comparison
-> explicit mapping/common-core/residual witness
-> class comparison
-> class/instance label
```

A class label does not prove equivalence. It records a candidate reusable structural form whose instance must still preserve all source constraints, boundary ports, and residuals.

`STRUCTURAL_CLASS_REGISTRY_003.axh` is a navigation/hypothesis artifact and MUST NOT be supplied as evidence to label-blind discovery.

## Native candidate identities

The current registry retains stable candidate IDs for discussion and retrieval:

| Catalog class | Native class ID | Human construction label |
|---|---:|---|
| C1 | `^9101` | universal satisfaction over generated region |
| C2 | `^9102` | existential satisfaction over generated region |
| C3 | `^9103` | immediate-successor evaluation |
| C4 | `^9104` | finite path / reflexive-transitive closure |
| C5 | `^9105` | predicate-selected structure restriction |
| C6 | `^9106` | disjoint decomposition / recomposition |
| C7 | `^9107` | transition-preservation judgment |
| C8 | `^9108` | finite locally validated derivation |
| C9 | `^9109` | finite indexed fold |
| C10 | `^9110` | bound-body instantiation |
| C11 | `^9111` | functional-graph application |
| C12 | `^9112` | well-founded propagation |

The IDs are not evidence that all twelve represent irreducible or even independent classes. Draft 0.9 specifically requires class-family/factorization testing before promotion.

## Class-schema minimum

Every class that advances beyond hypothesis status must carry:

```text
schema graph
parameter slots
boundary/interface ports
rigid versus mappable roles
invariants and constraints
admissible mappings
required decomposition dependencies
specialization rules
composition/gluing rules
residual policy
known instances
alternative qualified factorizations
membership-witness format
qualification evidence
```

The current catalog records hypotheses toward that form. It is not a qualified ontology.

---

# Family F1 — Evaluation over a generated region

This is the strongest current **family hypothesis** connecting C1, C2, and C3.

Generic shape:

```text
origin
+ region generator
+ membership/reachability condition
+ body/property
+ evaluation mode/cardinality condition
-> evaluation result
```

Candidate ports/parameters:

```text
origin
region-generator relation/construction
body/property
satisfaction/evaluation relation
evaluation mode
boundary policy
```

The family does **not** erase generator constraints. Linear future order, agent-indexed accessibility, branching-path generation, and arbitrary domain membership remain load-bearing parameters.

## C1 / `^9101` — Universal satisfaction over a generated region

Specialization:

```text
F1 evaluation mode = universal
```

Shape:

```text
for every member produced by the region generator,
body/property holds
```

Known/candidate instances:

- individual knowledge over one agent accessibility image;
- LTL globally over a reflexive future region;
- CTL universal-always after branching/path structure is explicit;
- universal quantification over an explicitly generated domain.

Required residual/specialization constraints include:

- epistemic: agent-indexed accessibility and selected modal-frame constraints;
- LTL: one linear trace/future order;
- CTL AG: universal branching/path structure, not merely one relation image;
- quantification: represented domain/generator and binder ownership.

**Status:** candidate specialization of F1; cross-domain witness not yet qualified.

## C2 / `^9102` — Existential satisfaction over a generated region

Specialization:

```text
F1 evaluation mode = existential
```

Known/candidate instances:

- LTL eventually;
- CTL EF after branching reachability is explicit;
- existential quantification over a represented domain;
- reachability goals with a target predicate.

**Status:** candidate specialization of F1; cross-domain witness not yet qualified.

## C3 / `^9103` — Immediate-successor evaluation

Candidate specialization:

```text
F1 region = immediate-successor image
region cardinality/selection = exactly the applicable next position/state
```

Known/candidate instances:

- LTL next;
- deterministic one-step postcondition checks where the program semantics supplies exactly one next state.

Important negative:

A nondeterministic program-next modality is not automatically C3. It may instead require C1/C2 over the transition successor region.

**Status:** candidate specialization of F1 rather than presumed independent class. Qualification must test whether retaining C3 adds structure not captured by the F1 specialization.

---

# C4 / `^9104` — Finite path / reflexive-transitive closure

Shape:

```text
primitive one-step edge
+ zero-path witness
+ recursive path-step construction
-> explicit finite path witness / reachable endpoint
```

Candidate ports/parameters:

```text
source endpoint
target endpoint
primitive step relation
path witness
step-constraint profile
```

Known/candidate instances:

- common-knowledge reachability over unioned group accessibility edges;
- reduction closure in Church–Rosser;
- ordinary graph/state reachability;
- finite CTL reachability components.

Current native evidence:

`foundations/FOUNDATION_FINITE_PATH_003.axh`

Boundary warning:

The step relation is a parameter/port and MUST NOT be erased merely because two instances use path closure.

**Status:** native construction exists author-side; independent reconstruction and cross-domain witness pending.

---

# C5 / `^9105` — Predicate-selected structure restriction

Shape:

```text
source structure
+ selection predicate
-> induced/restricted substructure
+ restricted relations/valuation
```

Candidate ports/parameters:

```text
source structure
selected member predicate
relations subject to restriction
valuation/state carried through restriction
result structure
```

Known/candidate instances:

- public-announcement model update;
- filtered state spaces;
- induced restrictions/quotients only when source semantics really require that construction.

Public announcement is a **composition**:

```text
shared satisfaction
+ C5 restriction
+ post-update satisfaction
```

It is not exhausted by C5 alone.

**Status:** epistemic restriction construction exists author-side; class witness pending.

---

# C6 / `^9106` — Disjoint decomposition / recomposition

Shape:

```text
whole resource
-> exists compatible/disjoint parts
-> recomposition equals whole
-> sub-properties hold on parts
```

Candidate ports/parameters:

```text
whole resource
left/right part
compatibility/disjointness relation
recomposition relation
sub-property/satisfaction relation
```

Known/candidate instances:

- separation-logic separating conjunction;
- resource/frame decomposition;
- other ownership/resource compositions only when the same disjoint-recomposition semantics is present.

Negative control:

Ordinary conjunction, arbitrary graph composition, and mere co-presence are not C6.

**Status:** heap/separation construction exists author-side; class witness and boundary negative controls pending.

---

# C7 / `^9107` — Transition-preservation judgment

Current shape:

```text
precondition satisfaction
+ transition/program relation
-> every relevant successor satisfies postcondition
```

Known/candidate instances:

- Hoare partial-correctness validity;
- box-like program modalities under matching transition semantics;
- invariant preservation over a transition relation.

## Factorization hypothesis

C7 may not be an independent class. It may factor as:

```text
precondition gate
+ F1/C1 universal evaluation over the transition-generated successor region
```

with termination/partial-correctness semantics carried as an additional constraint.

Deterministic versus nondeterministic transition semantics remain load-bearing.

**Status:** keep `^9107` as a useful candidate label while testing the factorization above. Do not promote it as an independent class until the residual after F1 factorization is understood.

---

# C8 / `^9108` — Finite locally validated dependency/derivation structure

Shape:

```text
finite dependency structure
+ local validation rule at each node
+ premise/child references
+ distinguished root/result
-> valid global derivation/object
```

Candidate ports/parameters:

```text
root/result
node set
child/dependency relation
local validator/rule relation
context/boundary data
```

Known/candidate instances:

- constructive natural-deduction proof terms;
- classical natural deduction as specialization adding classical authority;
- proof-property/meta-theorem benchmarks;
- rewrite derivations when they actually share the same local-validity/dependency form.

A cached `derivable` label is an instance surface over existence of a valid object in this class, not the class semantics itself.

**Status:** proof-object construction exists author-side; cross-form derivation-class witness pending.

---

# C9 / `^9109` — Finite indexed fold

Shape:

```text
finite indexed family
+ base/identity
+ binary combining relation/operation
-> folded result
```

Candidate ports/parameters:

```text
finite index structure
element/value relation
combiner
identity/base
order/associativity requirements where relevant
result
```

Known/candidate instances:

- finite conjunction/disjunction expansion;
- XOR/parity fold;
- finite aggregate constructions used by parameterized SAT benchmarks.

The combiner and its algebraic laws are parameters. XOR, OR, AND, addition, and other folds are not identified merely because all are folds.

**Status:** candidate family; parity/finite-index foundation pending.

---

# C10 / `^9110` — Bound-body instantiation

Shape:

```text
binder ownership
+ body
+ replacement argument
-> capture-avoiding replacement of owned occurrences
```

Current surface:

```text
ABSTRACTION @@ ARGUMENT
```

Known/candidate uses:

- quantifier instantiation;
- substitution into explicitly packaged bound bodies;
- beta-like structural substitution before a profile supplies mathematical lambda semantics.

## Factorization hypothesis

C10 may itself be a specialization of ordinary structural rewrite over explicit binder/occurrence ownership.

Draft 0.9 therefore does not assume C10 is an irreducible class or that `@@` is a core primitive.

**Status:** keep the label as a useful construction handle; rewrite-level decomposition comparison is mandatory before class/core promotion.

---

# C11 / `^9111` — Functional graph application

Current shape:

```text
function object/graph
+ input
+ functionality constraint
(+ totality/codomain constraints when required)
-> unique output relation
```

Known/candidate instances:

- higher-order function application under extensional graph semantics;
- source algebraic operations represented extensionally rather than by host calls.

## Factorization hypothesis

C11 may factor into:

```text
relation-image selection
+ uniqueness constraint
+ optional totality/codomain constraints
```

It is distinct from C10 unless a specific represented calculus proves a relationship.

**Status:** candidate label retained; HOL/function foundation pending.

---

# C12 / `^9112` — Well-founded propagation

Shape:

```text
relation
+ well-foundedness authority
+ property preserved from all predecessors to node
-> property for all nodes
```

Candidate ports/parameters:

```text
carrier/domain
predecessor relation
well-foundedness witness/authority
property/bound body
local predecessor-to-node rule
```

Candidate instances:

- well-founded induction;
- recursive termination arguments when the same relation semantics is present.

**Status:** candidate class pending concrete well-founded decomposition/profile.

---

# Composite examples

These examples are classification hypotheses, not accepted equivalences.

## Knowledge

```text
agent-indexed accessibility leaf
+ shared satisfaction
+ F1/C1 universal-over-generated-region
```

Residual/constraints:

```text
agent identity
accessibility relation identity
modal-frame constraints, if any
world/model boundary
```

## Common knowledge

```text
group/union accessibility construction
+ C4 finite-path closure
+ F1/C1 universal-over-generated-region
```

## LTL G

```text
linear future-order structure
+ F1/C1 universal-over-generated-region
```

## LTL F

```text
linear future-order structure
+ F1/C2 existential-over-generated-region
```

## LTL X

```text
discrete immediate-successor structure
+ F1/C3 immediate-successor evaluation
```

## Public announcement

```text
shared satisfaction
+ C5 predicate-selected restriction
+ post-update satisfaction
```

## Separating conjunction

```text
heap/resource leaves
+ C6 disjoint decomposition/recomposition
+ recursive satisfaction on each part
```

## Hoare validity

```text
program-transition leaf
+ precondition gate
+ candidate C7
```

with the additional hypothesis that C7 factors through F1/C1 over transition successors.

## Reduction closure

```text
one-step reduction leaf
+ C4 finite-path closure
```

---

# Membership and comparison evidence

A class mapping is not qualified until a witness records:

```text
instance
selected factorization
class/schema
schema-node/edge map
parameter assignment
boundary/port assignment
rigid values held fixed
constraints checked
common matched structure
specialization residual
```

Composite membership additionally requires a gluing/joint-realizability witness.

A direct mapping in `STRUCTURAL_CLASS_REGISTRY_003.axh` is only a hypothesis/index until such a witness exists.

---

# Class creation rule

Do not create a new class because a benchmark introduces a new name.

Before adding a class label:

1. decompose the source semantics without access to a target class label where practical;
2. compare against existing schemas/factorizations label-blindly;
3. test instance/specialization/composition explanations;
4. preserve residual constraints;
5. create a new candidate class only when no simpler class/factorization captures the structure faithfully.

A candidate class becomes qualified only after:

1. at least one exact native construction exists;
2. parameters, invariants, and ports are explicit;
3. a membership-witness format is supplied;
4. class-label erasure preserves the construction;
5. at least one independent cold reconstruction succeeds;
6. adversarial positive/negative/boundary/partial/factorization/label controls pass;
7. cross-domain instances, if claimed, preserve their domain-specific residual constraints;
8. no simpler class or composition captures the same structure.

## Labels

Human class labels and native candidate IDs are aids for review, construction, retrieval, and candidate search.

They are downstream of structural evidence.

A discovery result must survive hiding or permuting the class/domain labels. The semantic authority remains the decomposed native structure and its witness.
