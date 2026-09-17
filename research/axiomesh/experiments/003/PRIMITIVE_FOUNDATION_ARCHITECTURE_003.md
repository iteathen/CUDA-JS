# Experiment 003 — Primitive Semantic Foundation Architecture

**Status:** active design authority for E1P/E1F construction on the experimental branch  
**Spec:** `../../CORE_SPEC_DRAFT_0_9_CANDIDATE.md`  
**Comparison protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`

## Purpose

Build benchmark logics from common native semantic mechanisms rather than reproducing conventional operator names as unrelated predicates, while avoiding the opposite error of forcing all objects into one preferred decomposition.

The foundation path is:

```text
source semantics
-> one or more qualified factorizations
-> primitive/model leaves + native constructions
-> label-blind witnessed comparison
-> structural-class/family recognition
-> retained domain/class labels
-> benchmark theorem/proof profile
```

This differs from both bad extremes:

```text
benchmark notation -> opaque symbol
```

and:

```text
benchmark notation -> preselected class -> forced decomposition
```

The ordering is load-bearing: **decompose without target-class bias; compare; then classify/name.**

## Shared candidate substrate

Across benchmark families, current lowest useful theory-level leaves include:

- explicitly represented object/world/state identities;
- atomic valuation/incidence facts;
- primitive one-step transition/accessibility/reduction edges;
- source-supplied algebraic operation facts/axioms;
- heap address/value incidence;
- finite proof-node/rule/child relations;
- explicit domain/type membership when supplied by the represented profile.

Each leaf still carries an irreducibility burden. “The source names it” does not by itself make it primitive.

Leaf provenance should distinguish:

```text
observational/model input
stipulated source relation/axiom
implementation/environment fact
currently undecomposed candidate primitive
qualified representation primitive
```

## Structural-class/factorization layer

After native construction, compare through `STRUCTURAL_COMPARISON_PROTOCOL_003.md`.

A domain object may be:

- an exact instance of a schema;
- a specialization with explicit residual constraints;
- a composition with an explicit gluing witness;
- an embedding/common-core case;
- evidence for a new candidate class;
- representable through several alternative qualified factorizations.

Class assignment MUST follow a mapping witness.

A direct label edge or registry entry is navigation metadata only.

## Boundary rule

Each reusable foundation/classification must identify the external interfaces relevant to composition.

At minimum record where applicable:

```text
input/source ports
output/target ports
relation/function parameters
body/property parameters
state/model boundary
rigid identities/literals
mappable schema slots
composition/gluing constraints
```

Internal isomorphism does not establish compositional substitutability.

---

# F0 — Proof objects / finite locally validated dependency structures

A proof is a finite native dependency structure, not a boolean theorem oracle.

Minimum roles:

```text
proof object
root/result node
node conclusion
node rule/validator
node context/discharge boundary
child/premise dependencies
```

A whole proof is valid only if the root and all referenced subproofs validate under the represented profile.

A cached `derivable(context, formula)` label may name existence of a valid proof object but cannot replace it for proof-property qualification.

Candidate class relation: C8 / `^9108` finite locally validated derivation.

Status: native foundation exists author-side; class-membership witness pending.

---

# F1 — Finite index / fold / parity

For concrete finite hardness instances:

- materialize the finite index carrier;
- materialize indexed propositional atoms;
- expand or natively define the finite fold;
- reduce XOR/parity to explicit boolean/parity structure rather than host arithmetic;
- state combiner laws explicitly when fold order should be irrelevant.

Candidate class relation: C9 / `^9109` finite indexed fold.

Important residual parameters:

```text
combiner identity
associativity/commutativity requirements
index ordering semantics
parity/modulus structure
```

XOR and OR are not identified merely because both instantiate a fold.

Status: foundation pending.

---

# F2 — First-order domain / equality / binding

Candidate leaves:

- domain elements;
- source predicate incidence;
- source function graph/operation facts;
- sort/domain membership.

Construct:

- lexical binder ownership;
- domain-generated universal/existential evaluation;
- capture-avoiding bound-body instantiation;
- equality substitution/congruence under the selected equality profile;
- sorted quantification as domain membership constraints unless evidence supports a stronger primitive.

No host unifier/substitution callback is semantic authority.

Draft 0.9 correction:

- `*?n`/`+?n` are useful compact surfaces but lexical binding and quantifier semantics are separately auditable;
- `@@` remains a candidate bound-body-instantiation surface until ordinary structural-rewrite factorization is tested;
- `==` is not structural identity by default.

Candidate family relations:

- F1/C1 universal generated-region evaluation;
- F1/C2 existential generated-region evaluation;
- C10 bound-body instantiation, with rewrite-factorization hypothesis;
- C11 functional graph application for function-valued terms where appropriate.

Status: FOL/HOL downstream construction remains blocked on instantiation/primitive/factorization qualification.

---

# F3 — Possible worlds / epistemic satisfaction

Epistemic model structure:

```text
world carrier W
designated world(s) where needed
agent identities I
agent-indexed accessibility R_i
atomic valuation V
```

Knowledge is derived from universal satisfaction over the accessibility-generated region.

Common knowledge is derived from:

```text
group accessibility construction
+ finite path/closure
+ universal satisfaction over reachable worlds
```

S4/S5 are constraints on accessibility, not magic properties of a `K` token.

Candidate class/family hypotheses:

- knowledge -> F1/C1 universal generated-region evaluation;
- common knowledge -> C4 finite path + F1/C1.

Required residuals/ports include agent identity, accessibility relation identity, modal-frame constraints, and world/model boundary.

Status: native author-side foundation exists; label-blind class witnesses pending.

---

# F4 — Public announcement / predicate-selected model restriction

For Plaza-style public announcement semantics:

```text
W_phi  = worlds satisfying phi
R_i_phi = R_i restricted to W_phi × W_phi
V_phi  = valuation restricted to W_phi
```

Post-announcement evaluation occurs in the restricted model under the chosen precondition/truthfulness convention.

Candidate classification:

```text
C5 predicate-selected structure restriction
+ post-update satisfaction
```

The full public-announcement operator is composite and cannot be reduced to C5 alone.

Status: native author-side foundation exists; composite/gluing witness pending.

---

# F5 — Linear temporal traces

Model structure:

```text
trace positions/states
linear/discrete future relation
atomic valuation
```

Derived semantics:

```text
X A at t  iff A at the immediate successor
F A at t  iff some future/reflexive-future position satisfies A
G A at t  iff every future/reflexive-future position satisfies A
A U B at t iff a future endpoint satisfies B and A holds on the preceding interval
```

Candidate family hypotheses:

- `G` -> F1/C1 universal evaluation over linear future region;
- `F` -> F1/C2 existential evaluation over linear future region;
- `X` -> F1/C3 immediate-successor specialization;
- `U` -> composition of endpoint-existence + interval-universal conditions, not collapsed merely because F/G are available.

The linearity/discreteness/reflexivity choices remain structural residuals/parameters.

Status: native author-side foundation exists for exercised FL-011 surface; cross-domain class witnesses pending.

---

# F6 — Branching transition systems / CTL

Model structure:

```text
state carrier
branching transition relation
atomic valuation
paths generated by repeated transitions
```

Path/state quantification must remain explicit.

Representative constructions:

```text
EX A       some immediate transition successor satisfies A
EG A       some generated path satisfies A at every path position
E[A U B]   some generated path reaches B while A holds beforehand
```

`AG A` and `~EF~A` may be semantically related under the selected CTL profile, but theorem/duality equivalence is an E-layer relation, not N0/N1 canonicalization.

Candidate family hypothesis: path generation/closure composed with F1/C1/C2 generated-region evaluation.

Status: concrete native foundation pending; no class mapping is qualified yet.

---

# F7 — Normative/deontic semantics

Do not construct a generic obligation class before selecting the represented semantics.

Candidate semantic foundations include:

- ideal-world/accessibility;
- preference/ordering;
- selection function;
- dyadic conditional obligation;
- defeasible rule structures.

FL-010 is precisely a test where choosing the wrong decomposition changes the result.

`O`/permission remain source labels only until one semantics is explicitly selected and decomposed.

Status: blocked; no class assignment allowed yet.

---

# F8 — Heap/resource/program semantics

Represent heap as finite partial address→value structure.

Candidate leaves:

- address/value incidence;
- concrete program-state transitions/read/write operations.

Derived separation semantics:

```text
Sat(heap, P * Q)
iff
exists h1,h2:
  disjoint(h1,h2)
  union(h1,h2)=heap
  Sat(h1,P)
  Sat(h2,Q)
```

Points-to uses singleton-heap satisfaction.

Hoare partial correctness is derived from program-transition semantics and pre/post satisfaction.

Candidate class hypotheses:

- separating conjunction -> C6 disjoint decomposition/recomposition + recursive satisfaction;
- Hoare validity -> candidate C7 transition preservation;
- Draft 0.9 factorization challenge: C7 may be precondition gating + F1/C1 universal evaluation over transition successors.

The frame rule is derived only with explicit locality/disjointness conditions.

Status: native author-side heap/separation foundation exists; concrete swap/locality and class witnesses pending.

---

# F9 — Higher-order function/predicate structure

A function-valued object must expose the selected mathematical function model rather than invoke a host function call.

One candidate extensional construction is:

```text
function graph
+ input
+ output relation
+ functionality
+ required totality
+ codomain/type constraints
+ extensional equality where admitted
```

Candidate class relation: C11 / `^9111` functional-graph application.

Draft 0.9 factorization hypothesis:

```text
relation-image selection
+ uniqueness
+ optional totality/codomain constraints
```

is a possible lower factorization of C11.

Lexical abstraction/instantiation supply binding/substitution structure, not mathematical function semantics by themselves.

Status: HOL/function foundation pending.

---

# F10 — Reduction paths / closure

Primitive/model leaf candidate:

```text
one-step reduction a -> b
```

Construct finite zero-or-more reachability through explicit path structure.

Church–Rosser then quantifies over two reduction paths from a common source and requires a common join reachable by further paths.

Candidate class relation: C4 / `^9104` finite path/closure.

The one-step reduction relation is a class parameter/port and cannot be erased merely because other domains also use C4.

Status: generic finite-path foundation exists; concrete reduction theory for FL-018 pending.

---

# Cross-domain isomorphism targets

These are **hypotheses to test under label-blind witnessed comparison**, not semantic declarations.

Candidate shared shapes include:

- epistemic accessibility, temporal transition, CTL transition, and reduction as directed-relation substrates with different constraints;
- knowledge, globally, and universal domain evaluation as possible F1/C1 specializations;
- eventually, EF-like forms, and existential domain evaluation as possible F1/C2 specializations;
- common-knowledge closure and reduction closure as C4 instances with different step-relation parameters;
- public announcement and program execution as state/model transformations with different preservation laws;
- separation heap union and other resource compositions as potential disjoint-recomposition structures only when the invariants really match;
- proof trees and execution/reduction paths as finite dependency structures with materially different local validators/order constraints unless a stronger common schema is witnessed.

The goal is to expose the **strongest correct common core**, not to maximize the number of operators sharing a label.

## Alternative factorization policy

If a foundation admits multiple faithful decompositions:

- retain them as separate factorization nodes;
- record qualified transformations/equivalences between them;
- do not select one solely because it matches another domain;
- run structural comparison across materially distinct factorization pairs;
- report factorization dependence if the structural relationship changes.

## Implementation rule

Every foundation module must document:

```text
source semantics preserved
primitive/model leaves + provenance
native construction(s)
alternative factorizations
N0/N1 normalization behavior
candidate structural class/family relations
ports/boundaries
parameters/rigid values
constructed relations/operators
domain/source labels
alias expansion path
class-membership witness status
residual/specialization constraints
falsifiers
cold reconstruction cases
label-blind/near-isomorphic/boundary controls
```

No foundation is accepted because its equations are familiar.

No structural class is accepted because its label is familiar.

No cross-domain analogy is accepted without the witness and residuals needed to falsify it.
