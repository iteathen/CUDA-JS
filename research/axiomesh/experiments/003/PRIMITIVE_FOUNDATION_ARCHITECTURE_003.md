# Experiment 003 — Primitive Semantic Foundation Architecture

**Status:** active design authority for E1P/E1F construction on the experimental branch  
**Spec:** `../../CORE_SPEC_DRAFT_0_10_CANDIDATE.md`  
**Class contract:** `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`  
**Comparison protocol:** `STRUCTURAL_COMPARISON_PROTOCOL_003.md`

## Purpose

Build benchmark logics from common native semantic mechanisms rather than reproducing conventional operator names as unrelated predicates, while avoiding the opposite error of forcing all objects into one preferred decomposition or class.

The foundation path is:

```text
source semantics
-> one or more qualified/versioned factorizations
-> primitive/model leaves + native constructions
-> frozen-policy label-blind comparison
-> independently verified witness
-> structural-class/family recognition
-> retained domain/class labels
-> benchmark theorem/proof profile
```

Bad shortcuts remain:

```text
benchmark notation -> opaque symbol
```

and:

```text
benchmark notation -> expected class -> tailored decomposition
```

## Shared candidate substrate

Current lowest useful theory-level leaves include:

- explicitly represented object/world/state identities;
- atomic valuation/incidence facts;
- primitive one-step transition/accessibility/reduction edges;
- source-supplied algebraic operation facts/axioms;
- heap address/value incidence;
- finite proof-node/rule/child relations;
- explicit domain/type membership when supplied by the represented profile.

Each leaf still carries an irreducibility burden. “The source names it” does not make it primitive.

Leaf provenance records one of:

```text
observational/model input
stipulated source relation/axiom
implementation/environment fact
currently undecomposed candidate primitive
qualified representation primitive
```

Stable semantic IDs are theory/signature namespaced under Draft 0.10; raw numeric equality across independent bundles has no semantic force.

## Exact factorization rule

Every foundation decomposition edge records:

```text
source revision
target factorization revision
applicability guards
D dependency revisions
round-trip/reconstruction status
loss/residual if non-exact
recursive/fixed-point contract where applicable
```

A non-round-trippable projection is never called an exact factorization.

Recursive definitions must expose base/step and fixed-point authority rather than terminate in circular aliases.

## Structural-class layer

After construction, comparison follows `STRUCTURAL_COMPARISON_PROTOCOL_003.md` and schema definition follows `STRUCTURAL_CLASS_SCHEMA_CONTRACT_004.md`.

Class assignment follows a verified witness.

A direct label/registry edge is navigation metadata only.

A class parameter may itself be a relation, predicate/formula, rule/profile, substructure, or boundary—not merely a scalar symbol.

## Boundary and carrier-role rule

Each reusable construction identifies composition-relevant interfaces and any behavior-changing carrier role.

Record where applicable:

```text
input/source ports
output/target ports
relation/function/generator parameters
body/property parameters
state/model boundary
rigid namespace-qualified identities/literals
mappable schema slots
composition/gluing constraints
carrier role if behavior is not derivable from incidence/containment
open/closed-world completeness assumptions for absence-sensitive rules
```

Internal isomorphism does not imply substitutability.

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

Status: native foundation exists author-side; versioned schema and verified class witness pending.

---

# F1 — Finite index / fold / parity

For concrete finite hardness instances:

- materialize the finite index carrier;
- materialize indexed propositional atoms;
- expand or natively define the finite fold;
- reduce XOR/parity to explicit boolean/parity structure rather than host arithmetic;
- state combiner laws explicitly when fold order should be irrelevant.

Candidate class relation: C9 / `^9109` finite indexed fold.

Load-bearing structured parameters include:

```text
index structure
combiner relation/operation
identity/base
associativity/commutativity/order contract
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
- **explicit domain/generator** for universal/existential evaluation;
- capture-avoiding bound-body instantiation;
- equality substitution/congruence under the selected equality profile;
- sorted quantification as domain membership constraints unless evidence supports a stronger primitive.

No host unifier/substitution callback is semantic authority.

Current corrections:

- `*?n`/`+?n` remain compact surfaces, but binder ownership, quantifier kind, domain/generator, and guards are separate load-bearing structure;
- `@@` remains a candidate surface pending ordinary structural-rewrite factorization;
- `==` is not structural identity by default;
- quantifier default domains are permitted only when represented by the profile dependency.

Candidate class hypotheses:

- C1 universal generated-region evaluation;
- C2 existential generated-region evaluation;
- C10 bound-body instantiation with rewrite-factorization challenge;
- C11 functional graph application where a function model is actually represented.

Status: downstream FOL/HOL construction remains blocked on instantiation/primitive/factorization qualification.

---

# F3 — Possible worlds / epistemic satisfaction

Epistemic model structure:

```text
world carrier W
designated world(s) where needed
agent identities I
agent-indexed accessibility R_i
atomic valuation V
modal-frame/accessibility constraints
model boundary/completeness assumptions
```

Knowledge is derived from universal satisfaction over the accessibility-generated region.

Common knowledge is derived from:

```text
group accessibility construction
+ finite path/closure
+ universal satisfaction over reachable worlds
```

S4/S5 are constraints on accessibility, not properties of a `K` label.

Candidate mappings:

- knowledge -> C1;
- common knowledge -> C4 + C1.

These are parametric structural hypotheses until blind verified witnesses exist. Mapping accessibility into the same generator slot as a temporal relation does not prove epistemic and temporal relations are semantically equivalent.

Status: author-side foundation exists; class witnesses pending.

---

# F4 — Public announcement / predicate-selected model restriction

For Plaza-style public announcement semantics:

```text
W_phi   = worlds satisfying phi
R_i_phi = R_i restricted to W_phi × W_phi
V_phi   = valuation restricted to W_phi
```

Post-announcement evaluation occurs in the restricted model under the selected truthfulness/precondition convention.

Candidate composition:

```text
C5 restriction + pre/post satisfaction
```

The full operator is not exhausted by C5.

Status: author-side construction exists; composite/gluing and schema witnesses pending.

---

# F5 — Linear temporal traces

Model structure:

```text
trace positions/states
linear/discrete future relation
atomic valuation
trace boundary/completeness assumptions
```

Derived semantics:

```text
X A at t   iff A at the applicable immediate successor
F A at t   iff some future/reflexive-future position satisfies A
G A at t   iff every future/reflexive-future position satisfies A
A U B at t iff a future endpoint satisfies B and A holds on the preceding interval
```

Candidate hypotheses:

- `G` -> C1 with linear-future generator;
- `F` -> C2 with linear-future generator;
- `X` -> C3 / immediate-successor specialization;
- `U` -> endpoint-existence + interval-universal composition.

Linearity/discreteness/reflexivity remain in structure/parameters.

Status: author-side foundation exists for FL-011 surface; verified cross-domain witnesses pending.

---

# F6 — Branching transition systems / CTL

Model structure:

```text
state carrier
branching transition relation
atomic valuation
paths generated by repeated transitions
path/fairness/completeness profile where applicable
```

Representative constructions:

```text
EX A       some immediate transition successor satisfies A
EG A       some generated path satisfies A at every path position
E[A U B]   some generated path reaches B while A holds beforehand
```

`AG A` versus `~EF~A` is an E/profile equivalence where licensed, not N0/N1 normalization.

Candidate class/family mapping waits for a concrete native construction and frozen-policy witness.

Status: pending.

---

# F7 — Normative/deontic semantics

Do not construct a generic obligation class before selecting the represented semantics.

Candidate foundations include:

- ideal-world/accessibility;
- preference/ordering;
- selection-function;
- dyadic conditional obligation;
- defeasible rule structures.

FL-010 is precisely a case where decomposition choice is outcome-relevant.

`O`/permission remain source labels until one semantics is selected and decomposed.

Status: blocked; no class assignment allowed.

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

Hoare partial correctness is derived from transition semantics and pre/post satisfaction.

Candidate hypotheses:

- separating conjunction -> C6;
- Hoare validity -> candidate C7;
- C7 factorization -> precondition gate + C1 over transition-successor relation.

The frame rule requires explicit locality/disjointness authority.

Status: author-side foundation exists; concrete swap/locality and verified class witnesses pending.

---

# F9 — Higher-order function/predicate structure

A function-valued object must expose the chosen function model.

One extensional candidate is:

```text
function graph
+ input
+ output relation
+ functionality
+ required totality
+ codomain/type constraints
+ extensional equality where admitted
```

Candidate relation: C11 functional-graph application.

Factorization challenge:

```text
relation-image selection + uniqueness + optional totality/codomain
```

Lexical abstraction/instantiation provide binding/substitution structure, not mathematical function semantics by themselves.

Status: pending.

---

# F10 — Reduction paths / closure

Candidate primitive/model leaf:

```text
one-step reduction a -> b
```

Construct finite zero-or-more reachability through an explicit path/inductive definition with base/step semantics.

Church–Rosser then quantifies over two reduction paths from a common source and requires a common join reachable by further paths.

Candidate relation: C4 finite path/closure.

The one-step relation remains a structured class parameter and is not erased merely because another domain also instantiates C4.

Status: generic path foundation exists; concrete FL-018 reduction theory pending.

---

# Cross-domain isomorphism targets

These are blind-test hypotheses, not declarations:

- accessibility, temporal transition, CTL transition, and reduction as directed-relation substrates with different constraints;
- knowledge, globally, and universal-domain evaluation as possible C1 instances;
- eventually, EF-like forms, and existential-domain evaluation as possible C2 instances;
- common-knowledge closure and reduction closure as C4 instances with different step-relation parameters;
- public announcement and program execution as state/model transformations with different preservation laws;
- separation heap union and other resource compositions only when recomposition invariants actually match;
- proof derivations and execution/reduction paths only to the extent a verified common dependency schema exists.

The goal is the strongest correct common core with residuals, not the largest number of shared labels.

## Target-layer warning

A schema-level isomorphism among foundation definitions is not automatically an extensional/behavioral equivalence of the generated models.

Every comparison declares whether it targets:

```text
native representation
construction/schema
generated structure
profile denotation/behavior
proof/derivation behavior
```

Cross-layer conclusions require qualified D/E bridges.

## Alternative factorization policy

If a foundation admits multiple faithful decompositions:

- retain separate factorization nodes/revisions;
- record round-trip/loss status;
- do not choose one because it matches a desired domain;
- search materially distinct allowed pairs;
- report factorization-set completeness and dependence.

## Implementation rule

Every foundation module documents:

```text
source semantics preserved
revision/namespace
primitive/model leaves + provenance
native construction(s)
D applicability guards + round-trip status
recursive/fixed-point authority if used
alternative factorizations
N0/N1 behavior
candidate structural classes/families
ports/boundaries/carrier roles
structured parameters/rigid values
quantifier domains where relevant
absence/completeness assumptions where relevant
domain/source labels
alias expansion path
membership/class-class witness status
residual/specialization constraints
falsifiers
cold reconstruction cases
blind/near-isomorphic/boundary/namespace/policy-leak controls
```

No foundation is accepted because its equations are familiar.

No class is accepted because its label is familiar.

No analogy is accepted without a verified witness and explicit residuals.
