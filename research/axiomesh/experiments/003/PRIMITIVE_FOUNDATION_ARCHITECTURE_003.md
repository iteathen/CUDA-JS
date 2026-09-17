# Experiment 003 — Primitive Semantic Foundation Architecture

**Status:** active design authority for E1P construction on the experimental branch  
**Spec:** `../../CORE_SPEC_DRAFT_0_8_CANDIDATE.md`

## Purpose

Build the benchmark logics from common structural foundations rather than reproducing conventional operator names as unrelated opaque predicates.

The foundation boundary is chosen by semantic mechanism:

```text
model/state substrate
-> primitive/native construction
-> structural-class recognition
-> named derived operator / domain instance
-> benchmark theorem
```

This is intentionally different from:

```text
benchmark notation
-> one semantic symbol per named operator
```

The ordering is load-bearing: **decompose first, classify second, name third**. A familiar label may guide retrieval, but it may not decide the decomposition.

## Shared primitive substrate

Across the benchmark families, the lowest useful theory-level leaves are:

- finite or explicitly represented object/world/state identities;
- atomic valuation/incidence facts;
- primitive one-step relations: transition, accessibility, reduction;
- source-supplied algebraic operations and axioms;
- heap address/value incidence;
- finite proof-node/rule/child relations;
- explicit domain/type membership where supplied by the profile.

Everything above those leaves should be constructed whenever its semantics are known.

## Structural-class layer

After a construction is decomposed, compare its canonical shape with the candidate class catalog in:

`STRUCTURAL_CLASS_CATALOG_003.md`

The class layer exists to retain useful labels while exposing common structure.

A domain object may be:

- an instance of one class;
- a constrained specialization of a class;
- a composition of several classes;
- evidence for a new candidate class.

Class assignment MUST follow decomposition. Do not choose a class because two operators have similar names or because an analogy is attractive.

Named domain aliases remain useful and SHOULD be retained when they help construction/retrieval. Their semantic path is:

```text
domain label
-> structural class / class composition
-> native construction
-> primitive model leaves
```

Both label-to-class and class-to-primitive erasure must preserve the relevant formal obligation.

## Foundation F0 — proof objects

A proof is a finite native structure, not a boolean theorem oracle.

Minimum structural roles:

```text
proof object
root node
node conclusion
node rule
node context / discharged assumption boundary where applicable
ordered or unordered child/premise nodes according to rule
```

Rule-specific validators determine whether a node is locally admissible. A whole proof is valid only when the root is locally valid and all referenced premise subproofs are valid down to assumptions/axioms.

This gives meta-theory something real to quantify over and provides the E5 review surface.

A derived `derivable(context, formula)` relation may be cached, but must mean existence of a valid native proof object, not an unexplained fact.

Structural-class candidate: finite locally validated derivation.

## Foundation F1 — finite index / fold / parity

For concrete finite hardness instances:

- materialize the finite index set;
- materialize indexed propositional atoms;
- expand conjunction/disjunction folds structurally for the measured instance, or provide a native recursive fold definition over the finite index relation;
- represent XOR/parity by an explicit boolean/parity construction whose truth can be reduced to primitive valuations/finite arithmetic structure.

A parity-aware proof rule may be retained as a derived lemma after equivalence to that construction is qualified.

Structural-class candidate: finite indexed fold, parameterized by the combining operation.

## Foundation F2 — first-order domain and equality

Leaves:

- domain elements;
- source predicate/function incidence;
- source function graph/operation facts;
- explicit sort/domain membership.

Construct:

- universal/existential reasoning from native binders and qualified structural instantiation;
- equality substitution/congruence as proof rules over native term structure;
- sorted quantification as ordinary quantification plus native membership guards unless evidence later justifies a core type primitive.

No external unifier/substitution callback is semantic authority.

Draft 0.8 additionally requires primitive-status audit of binder/quantifier/instantiation surfaces themselves before final core promotion. Compact syntax may remain even if the semantic construction is lower-level.

Structural-class candidates include universal/existential satisfaction over a generated domain and bound-body instantiation.

## Foundation F3 — possible worlds and epistemic satisfaction

An epistemic model contains:

```text
worlds W
actual/designated world w0 when needed
agent identities I
agent-indexed accessibility R_i ⊆ W×W
atomic valuation V at worlds
```

Atomic satisfaction is a primitive valuation lookup.

Knowledge is derived:

```text
Sat(M,w,K_i A)
iff
for every v with R_i(w,v), Sat(M,v,A)
```

Common knowledge is derived from reachability under the reflexive-transitive closure of the union of the relevant agents' accessibility relations, then universal satisfaction along that closure.

S4/S5 are structural constraints on accessibility relations; they are not properties attached magically to a `K` token.

Structural-class mapping:

- individual knowledge -> universal satisfaction over an accessibility-generated region;
- common knowledge -> group-relation construction + finite-path closure + universal satisfaction.

Reference basis:

- Stanford Encyclopedia of Philosophy, *Epistemic Logic* / possible-world accessibility semantics.
- Stanford Encyclopedia of Philosophy, *Dynamic Semantics* / epistemic model structure.

## Foundation F4 — public announcement update

For Plaza-style public announcement semantics, construct the post-announcement model by restriction:

```text
W_phi = { w in W | Sat(M,w,phi) }
R_i_phi = R_i restricted to W_phi × W_phi
V_phi = V restricted to W_phi
```

The announcement modality then evaluates its body in the restricted model, subject to the chosen truthfulness/precondition convention.

Repeated announcements compose explicit model transformations.

Structural-class mapping: predicate-selected structure restriction composed with post-update satisfaction.

Reference basis:

- Stanford Encyclopedia of Philosophy, *Dynamic Epistemic Logic*, Public Announcement Logic technical appendix.

## Foundation F5 — linear temporal traces

An LTL model/run exposes:

```text
positions/states along one discrete linear trace
successor relation
future ordering/reachability
atomic valuation at positions
```

Derived semantics:

```text
X A at t  iff A at successor(t)
F A at t  iff exists u >= t with A at u
G A at t  iff forall u >= t, A at u
A U B at t iff exists u >= t with B at u and A at every v from t before u
```

A profile may choose `X` + `U` as a smaller derived basis and define `F/G`, but the chosen construction must be explicit.

Structural-class mapping:

- X -> immediate-successor evaluation;
- F -> existential satisfaction over the reflexive future region;
- G -> universal satisfaction over the reflexive future region;
- U -> composed existential endpoint + universal interval condition, not collapsed to F/G merely for convenience.

Reference basis:

- Stanford Encyclopedia of Philosophy, *Temporal Logic*, sections on `X`, `U`, and LTL.

## Foundation F6 — branching transition systems / CTL

A CTL model exposes:

```text
states
transition relation
atomic valuation
paths generated by repeated transitions
```

Path quantification is over those generated paths.

Representative derived semantics:

```text
EX A: some successor/path-next state satisfies A
EG A: some generated path satisfies A at every position
E[A U B]: some generated path reaches B while A holds beforehand
```

Other operators are derived by duality/abbreviation only where the selected CTL semantics licenses it; in particular `AG A` and `not EF not A` should become visibly connected by the construction rather than independent tokens.

Structural-class mapping is expected to compose path generation/closure with universal or existential satisfaction, but must wait for the concrete CTL native construction before final classification.

Reference basis:

- Carnegie Mellon model-checking/CTL lecture material defining CTL over Kripke/transition structures.

## Foundation F7 — normative/deontic semantics

Do not define a generic obligation foundation before selecting the semantics.

Possible foundations include:

- ideal-world/accessibility semantics;
- preference/ordering semantics;
- selection-function semantics;
- dyadic conditional obligation;
- defeasible rule structures.

FL-010 must select one explicitly. Contrary-to-duty behavior is precisely where these choices matter.

Until then, `O`/permission are source notation only and E1P remains blocked.

Do not assign a structural class until the chosen semantics has been decomposed.

## Foundation F8 — heap/resource/program semantics

Represent heap as finite partial address→value structure.

Primitive facts:

- address/value incidence;
- program primitive state transitions/read/write operations.

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

Points-to is satisfaction by the appropriate singleton heap cell structure.

Hoare validity is derived from program-transition semantics and pre/post satisfaction. The frame rule is then a theorem/rule about preservation under disjoint extension, not a primitive name.

Structural-class mapping:

- separating conjunction -> disjoint decomposition/recomposition + sub-satisfaction;
- Hoare partial correctness -> transition-preservation judgment.

Reference basis:

- Reynolds/O'Hearn separation-logic semantics; Brookes, *A Semantics for Concurrent Separation Logic*.

## Foundation F9 — higher-order function/predicate structure

Do not treat mathematical application as an unexplained host operation.

A profile must expose the intended function model, for example extensionally as a graph relation plus:

```text
functionality
required totality on domain
codomain/type membership
extensional equality when the logic admits it
```

Application is then the structural relation selecting the graph output for an input.

Draft 0.5 abstraction and Draft 0.6 instantiation own binding/substitution structure; they do not by themselves assert mathematical function semantics.

Lambda/Pi syntax may remain a derived constructor only when its native formation/elimination behavior is represented.

Structural-class candidates: functional-graph application and bound-body instantiation, kept distinct.

## Foundation F10 — reduction paths / closure

Primitive leaf:

```text
one-step reduction a -> b
```

Construct zero-or-more reachability from explicit finite path structure or an equivalent native inductive definition:

```text
path p has first a
path p has last b
adjacent members follow one-step reduction
zero-length path witnesses reflexivity
```

Church–Rosser then quantifies over two such paths from the same source and requires a common target reachable by two further paths.

No opaque `twoheadrightarrow`/closure predicate may carry the missing semantics.

Structural-class mapping: finite path / reflexive-transitive closure.

## Foundation sharing / isomorphism targets

The point of decomposing these domains is to expose shared structure:

- epistemic accessibility, temporal transition, CTL transition, and reduction are all directed relations with different constraints/uses;
- knowledge, globally, and some quantified forms may share universal-over-generated-region structure while differing in region generation;
- eventually, EF-like forms, and existential domain queries may share existential-over-generated-region structure;
- common knowledge closure and reduction closure share finite path/reachability machinery;
- public announcement and program execution are state/model transformations but with different preservation laws;
- separation heap union and theory composition both require explicit compatibility/disjointness boundaries, but must not be unified unless their recomposition invariants actually match;
- proof trees and execution/reduction paths are finite dependency structures but may belong to different classes because proof nodes carry local rule validity while paths carry ordered transition adjacency.

These similarities should be represented through shared lower-level foundations and class labels where sound, rather than hidden by domain vocabulary or exaggerated into false equivalence.

## Implementation rule

A foundation module must document:

```text
primitive leaves
native construction
candidate structural class(es)
constructed relations/operators
domain/source labels
which aliases it normalizes
instance/class erasure path
falsifiers
cold qualification cases
```

No foundation is accepted merely because its equations are familiar. It must be encoded natively and independently reconstructed before downstream E3/E4 evidence depends on it.

No new structural class is accepted merely because a new source-domain name appears. Class creation follows observed decomposed shape.
