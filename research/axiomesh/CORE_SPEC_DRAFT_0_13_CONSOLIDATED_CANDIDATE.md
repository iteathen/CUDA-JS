# AxiomeSH Core Specification — Draft 0.13 Consolidated Candidate

**Status:** experimental consolidated candidate after line-by-line review through both Draft 0.12 tracks  
**Historical lineage:** Draft 0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7 → 0.8 → 0.9 → 0.10 → 0.11 candidates → 0.12 candidates  
**Authority:** self-contained authority for new Draft 0.13 artifacts on `experiment/axiomesh-native-reconstruction`  
**Historical rule:** frozen older artifacts retain their recorded historical decode semantics  
**Promotion:** experimental-branch authority only until independently qualified

Draft 0.13 resolves the authority ambiguity created by parallel Draft 0.11/0.12 candidate tracks. It consolidates the surviving representation, decomposition, isomorphism, structural-class, retrieval, discovery, and qualification rules into one candidate authority for new artifacts.

A Draft 0.13 decoder does **not** need to replay earlier drafts. Earlier drafts remain historical evidence and frozen experiment inputs.

No new domain-logic primitive is introduced.

---

# 1. Mission and constitutional constraints

AxiomeSH is an agent-native structural knowledge representation intended to maximize:

```text
durable correct synthesis / total lifecycle cost
```

subject to:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- exact composition constraints;
- required provenance;
- recoverability.

The working substrate hypothesis remains:

```text
knowledge = scoped relational structure + lawful structural transformation
```

The native path remains:

```text
AxiomeSH -> agent -> AxiomeSH
```

No mandatory English, JSON, theorem-language, database, tokenizer-specific, or model-specific translation layer belongs to native semantics.

The scoped-hypergraph/rewrite substrate remains falsifiable.

---

# 2. Isomorphism/discovery constitution

AxiomeSH succeeds only if independently named structures can expose common shape without:

- missing a true correspondence because labels, IDs, syntax, namespaces, factorization, indexing, extraction, or serialization differ; or
- manufacturing a false correspondence by dropping, parameterizing, or projecting away a load-bearing distinction.

The governing discovery pipeline is:

```text
source semantics
-> independent qualified factorization/extraction set for each source
-> representation-only normalization
-> label-blind structural indexing/retrieval
-> frozen comparison policy
-> structural search
-> candidate witness/certificate
-> independent witness verification
-> relation/common-core/residual result
-> class recognition or new-class induction
-> retained useful labels
```

Labels are downstream retrieval/construction handles. They are not evidence for their own structural meaning.

Expected analogy, desired class, registry mapping, scorer answer, peer-object decomposition, or preferred factorization MUST NOT choose the decomposition/extraction/policy later cited as evidence.

---

# 3. Semantic revision and bundle authority

Every new canonical bundle identifies the applicable semantic revision/profile through explicit native bundle structure or an enclosing native corpus contract supplied with the artifact.

Revision/profile identity is required for decoding but is non-evidential for cross-domain matching unless revision metadata is explicitly included in the comparison view.

The manifest/bundle construction is ordinary native structure, not a new primitive merely for convenience.

Frozen historical artifacts retain their recorded historical revision.

---

# 4. Representation layers

## 4.1 Candidate irreducible substrate

Strongest current primitive candidates:

- opaque structural identity;
- ordered incidence/hyperedge;
- structural scope/boundary;
- binding ownership needed for structural matching;
- structural rewrite;
- negative structural match, still subject to elimination testing;
- transparent references as non-semantic compression.

Even these remain experimentally falsifiable.

## 4.2 Primitive/model leaves

A theory may supply leaves such as:

- object/world/state identities;
- atomic valuation/incidence facts;
- one-step transition/accessibility/reduction edges;
- heap address/value incidence;
- source algebraic operations/relations with explicit axioms;
- observations;
- stipulated source axioms.

A source name does not prove primitive status.

A load-bearing leaf SHOULD record one of:

```text
observational/model input
stipulated source axiom/relation
frozen implementation/environment fact
currently undecomposed candidate primitive
proven irreducible representation primitive
```

Hidden live environment state is not semantic authority.

## 4.3 Derived constructions and classes

Known compound semantics must expose faithful lower structure where available.

Examples:

```text
knowledge            -> accessibility + satisfaction
common knowledge     -> group relation + path closure + satisfaction
public announcement  -> predicate-selected restriction + post-update satisfaction
temporal operators   -> trace/position structure + satisfaction
CTL                   -> branching transitions + generated paths + satisfaction
separating *          -> disjoint resource decomposition + satisfaction
Hoare validity        -> transition + pre/post satisfaction
closure               -> explicit path/reduction structure
proof/derivability    -> proof objects + explicit rule authority
function application  -> represented function model
finite fold           -> indexed structure + combiner
```

## 4.4 Candidate compact surfaces

Available surfaces include:

```text
#n
#p/q
^n
A => B
A == B
~A
{ ... }
*?n BODY
+?n BODY
\?n BODY
ABSTRACTION @@ ARGUMENT
```

Availability does not establish irreducibility. A surface may ultimately be an irreducible primitive, canonical lower-structure surface, value shorthand, profile-owned constructor, class alias, or rejected redundancy.

---

# 5. Surface grammar

```text
id       := integer
literal  := #integer | #integer/integer
label    := ^integer
var      := ?integer
ref      := @integer

edge     := (term ...)
scope    := [term ...]
choice   := {term ...}
negmatch := !term
neg      := ~term
forall   := *var term
exists   := +var term
abstract := \var term
eq       := term == term
implies  := term => term
rule     := scope > scope
bind     := ref = term
instantiate := term @@ term

term     := id | literal | label | var | ref
          | edge | scope | choice | negmatch | neg
          | forall | exists | abstract | eq | implies
          | rule | bind | instantiate
```

Whitespace is non-semantic except as token separation. Mixed infix forms must be nested/parenthesized to admit one parse.

The grammar describes the transport surface, not final primitive classification.

---

# 6. Identity and namespaces

## 6.1 Structural identities

Bare integers are opaque structural identities.

Within one structural namespace:

```text
same structural identity = same object
```

Different structural IDs are distinct structural identities even if an object-theory equality formula relates them.

Bare spelling is non-semantic and may alpha-map where the frozen comparison policy permits.

Local structural IDs in independent namespaces do not collide merely because their numerals match.

Cross-document continuity requires a shared namespace, explicit import/export map, port map, or qualified partition witness.

## 6.2 Exact literals

`#n` and reduced `#p/q` denote exact values and are rigid by default.

Canonical rational rules:

- denominator nonzero;
- reduced to lowest terms;
- denominator positive;
- sign on numerator;
- negative zero canonicalizes to zero;
- floats are not canonical exact literals.

A class may expose a literal position as a predeclared parameter slot; that is parameterization, not alpha-renaming.

Literal token-class irreducibility remains open.

## 6.3 Stable labels

`^n` is stable inside its owning namespace.

Semantic identity is at least:

```text
(namespace, local label id)
```

unless a shared/global namespace is explicitly represented.

Therefore identical numeric labels in independent namespaces are not sameness evidence, and different numeric labels do not block a mapped-signature correspondence.

Class/schema labels and revisions obey the same namespace discipline.

---

# 7. Ordered incidence

`(A B C)` is one ordered incidence object.

Tuple position is load-bearing unless a qualified schema/definition says otherwise.

No position is universally privileged merely by being first.

A label-headed edge is a useful relation/application surface, but mathematical predicate/function semantics remain theory/class-owned.

Equivalent source conventions with different argument orders require an explicit role/schema mapping. Arbitrary tuple permutation is not isomorphism.

---

# 8. Scopes, occurrences, and carrier roles

`[ ... ]` is an unordered structural scope/boundary/container.

## 8.1 Occurrence-preserving default

For new Draft 0.13 artifacts, direct member order is non-semantic but member occurrence multiplicity is semantic by default.

```text
[X X]
```

contains two occurrences unless an explicit qualified quotient/profile establishes idempotent/set-like semantics.

## 8.2 Occurrence multiplicity versus identity

Multiplicity does not automatically make duplicate occurrences externally addressable identities.

If a specific occurrence must carry ports, provenance, persistent relations, or independent identity, reify it with an explicit structural identity/wrapper.

## 8.3 Raw scope has no imported domain meaning

Raw scope is not intrinsically:

- conjunction;
- mathematical extensional set;
- ordered list/sequence;
- idempotent collection;
- active execution state.

Those meanings require represented construction/profile structure.

## 8.4 Carrier roles

If two identical carriers behave differently because of grouping/state/quotation/module/execution role, that role must be recoverable from native structure/profile. Reader intent is not semantic authority.

---

# 9. Boundaries and ports

Crossing identity is a useful interface cue but not a full component contract.

Where composition matters, interfaces may include:

- exposed identities;
- port roles;
- direction/variance/mapping rules;
- cardinality constraints;
- ownership/support/timing constraints;
- gluing conditions.

Source/component ports are frozen independently before pairwise comparison. A comparison maps existing ports; it does not invent ports to improve a match.

---

# 10. References

References are non-semantic serialization compression.

## 10.1 Visibility/dependency

Sibling textual order inside an unordered serialization scope does not determine reference meaning.

Visible bindings are unique; shadowing is invalid. Reference dependency is acyclic unless a future explicit recursive-reference construct is separately defined.

## 10.2 Hygienic structure-preserving resolution

N0 reference resolution preserves:

- structural identities inside the referred term;
- lexical ownership/capture status;
- incidence/sharing relationships;
- use-site occurrence multiplicity.

Resolution is graph/DAG substitution, not naïve textual macro copying.

A referred term is closed relative to its binding environment or carries enough environment for capture-avoiding expansion.

## 10.3 Reference handle is not semantic identity

Repeated uses of one reference may create multiple member occurrences while preserving the identities inside the referred structure.

The reference handle itself does not identify those use-site occurrences.

After N0 resolution, reference-binding syntax is absent from semantic comparison structure.

---

# 11. Variables and binding

Variable numbers are local serialization handles with reconstructable owners/roles.

Possible owners include rewrite pattern, lexical quantifier/abstraction, and schema/pattern structure.

Rules:

- repeated same variable within one owner requires one binding;
- distinct variables may alias the same object unless explicit disequality/distinctness forbids it;
- disjoint sibling binders may reuse the same number;
- nested rebinding of a still-visible same-number binder remains invalid in this candidate;
- capture-avoiding alpha-renaming preserves structure;
- unowned variables in contexts requiring closed/qualified terms are invalid rather than guessed;
- NAC-only variables must already be positively bound or explicitly scoped by the matching profile.

A closed declarative proposition has no free variables. Open terms are allowed only where a containing schema/binder/pattern explicitly owns their interface.

---

# 12. Rewrite objects and execution

`[L] > [R]` represents a first-class rewrite object. Existence does not imply activation.

## 12.1 Activation profile

Active/inert status is owned by a represented execution profile/activation construction.

Historical direct-child activation is a legacy profile only when explicitly selected.

Serialized rule order never implies priority unless the execution profile represents priority/order.

## 12.2 Boundary-respecting matching

A rule matches only within its declared application boundary and does not flatten/cross nested scopes implicitly.

## 12.3 Occurrence-preserving default update

A match selects an instantiated LHS submultiset of occurrences.

Default successor:

```text
S' = (S multiset-minus matched(LHS)) multiset-plus instantiated(RHS)
```

with unmatched context retained.

If persistent identity of a particular occurrence matters, that occurrence is explicitly reified.

Idempotent/set update is a derived profile/quotient.

## 12.4 Variables/freshness

An ordinary RHS-only variable is invalid unless its value is supplied by explicit represented generation/freshness structure.

`+?n` is not overloaded as freshness solely by RHS position in new artifacts.

## 12.5 Negative application conditions

`!X` is structural absence within a declared match/application boundary under compatible bindings. It is not declarative falsity.

Open/closed-world completeness assumptions are load-bearing if absence is interpreted beyond represented structural absence.

## 12.6 Multiway semantics and application events

Absent explicit strategy/priority, every valid rule/match application is a legitimate successor event.

Distinct applications remain distinct derivation events even when successor states are structurally identical.

An application witness may record rule, match, binding, boundary, and successor relation. Event quotienting is explicit profile behavior.

Search/scheduling/pruning order is non-semantic unless represented.

---

# 13. Declarative surfaces

## 13.1 Implication

`A => B` is a declarative implication surface. It does not execute rewrite and does not choose a proof calculus.

## 13.2 Equality

`A == B` is object-theory equality, not structural identity. Pure structural comparison does not collapse nodes because an object formula asserts equality.

Any equality-induced quotient/collapse is an explicit semantic/projection transformation.

## 13.3 Negation

`~A` is declarative negation with profile-owned laws and is distinct from `!A` structural negative match.

## 13.4 Choice

`{A B ...}` is an unordered alternative surface. Alternative occurrence multiplicity is preserved unless the selected profile establishes idempotence. Choice is not operational multiway rewrite.

---

# 14. Quantification, bound bodies, and instantiation

## 14.1 Quantifier completeness

`*?n BODY` / `+?n BODY` preserve binder ownership and quantifier kind but are semantically complete only when domain/generator is determined.

A qualified quantified construction exposes:

```text
binder ownership
quantifier kind
domain/generator
body
sort/guard constraints if any
```

A profile-wide default domain is valid only when represented in native dependencies.

Same binder/body over different domains is not interchangeability.

## 14.2 Lexical abstraction

`\?n BODY` packages a bound body without asserting quantification. It does not intrinsically mean lambda/Pi/set-builder/etc. Primitive status remains open.

## 14.3 `@@`

`ABSTRACTION @@ ARGUMENT` names capture-avoiding bound-body instantiation.

It is a candidate surface/class, not a proven irreducible primitive, and must be compared against constrained structural rewrite over binder/occurrence ownership.

It is not generic mathematical function application.

## 14.4 Canonicalization

N0/N1 never silently reduce `@@`. Instantiation reduction is a recorded D/E transformation.

---

# 15. Domain mathematics remains theory structure

Raw scope is not a mathematical set, and core syntax does not hard-code arithmetic, set membership/subset/cardinality/union, type/sort, or mathematical function semantics.

Such structures remain theory/class constructions unless future evidence earns a more general primitive.

---

# 16. Claims, status, and proof authority

A claim body intended for native reasoning resolves to represented formula/structure, not only an opaque proposition ID whose meaning exists in a sidecar.

Research/epistemic status—hypothesis, empirical support, candidate, missing law, disproven, rejected, etc.—does not grant proof authority.

Representability is not proof.

---

# 17. Signatures, manifests, and bundle partitioning

## 17.1 Surface declaration closure

For one selected serialized bundle:

- every used local stable label is declared/imported or core-reserved;
- undeclared stable labels are invalid;
- a canonical compact surface signature may require exactly the used local labels;
- unused declarations make such a compact signature non-canonical but do not change body semantics.

Signature order is serialization-only.

## 17.2 Layer-relative signatures

Distinguish:

```text
Sig_surface(T)
Deps(T)
Sig_D(T)
```

Surface-signature equality is not isomorphism evidence.

Recursive dependency SCCs require explicit recursion/fixed-point authority.

## 17.3 `^0`

The historical `^0` signature marker remains a supported convention, not a proven primitive.

## 17.4 Multi-document partitioning

Splitting/concatenating is N0-transparent only with a witness preserving:

- stable-label namespace;
- local structural-ID namespace/renaming;
- reference namespace;
- binder ownership/visibility;
- activation boundaries;
- dependencies/imports;
- ports/boundaries;
- semantic ordering constraints.

Otherwise an explicit bridge is required.

---

# 18. Source fidelity, human gloss, and evidence isolation

## 18.1 Source fidelity

Source-to-native rendering preserves every distinction later required for proof, composition, or comparison. Nontrivial ingest keeps mapping/audit evidence.

## 18.2 Human gloss

Human names may aid review/retrieval but may not supply load-bearing native structure absent from the bundle.

## 18.3 Evidence partitions

Qualification partitions resources as:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

Blind stages use an actual fresh-context/tool-access boundary so excluded material is unavailable until result freeze.

An archival source backup can support recoverability but cannot count as semantic-decomposition evidence.

The audit records exactly which resources were accessible to decomposition, retrieval, comparison, and verification stages.

---

# 19. Normalization and transformation authority

## 19.1 N0 — serialization-transparent

May remove only transport-transparent differences such as whitespace, hygienic reference resolution, deterministic serialization order, and qualified transparent bundle partitioning.

N0 does not apply definitions, theorem/algebraic rules, substitution/beta reduction, class mappings, quotienting, or peer-object information.

## 19.2 N1 — source-local representation normalization

Under frozen source-local role policy, N1 may normalize local alpha IDs, bound-variable numbers, and unordered-member presentation.

It preserves ordered incidence, scope nesting, occurrence multiplicity, binding ownership, namespace-qualified labels, literals, positive/negative constraints, kind/direction, ports, quantifier domains, and model constraints.

A deterministic canonical graph labeling is a transport/index representation; it does not prove that only one isomorphism witness exists. Materially distinct mappings/automorphisms remain recoverable when needed.

## 19.3 D — qualified factorization/decomposition

Every D edge records:

```text
source/target revisions
transform kind
applicability guards
dependency revisions
source-target map
preservation obligations
information loss/abstraction
round-trip/compaction relation if exact
residual/provenance required for reconstruction
```

Kinds include exact definition, conservative refinement, abstraction, projection, quotient, approximation, and unresolved relation.

An exact D edge round-trips modulo N0/N1 and transparent surfaces.

### Semantic-decomposition coverage

Round-trip fidelity is separate from decomposition coverage.

Residual needed for reconstruction is classified as:

```text
qualified primitive/model leaf
source-domain parameter
boundary/context residual
transparent naming/serialization data
currently undecomposed residual
```

An opaque or re-encoded source backup does not count as exposed semantics. Undecomposed residual preserves recoverability but lowers decomposition coverage.

## 19.4 E — theory/profile equivalence

Every E edge records theory/profile revision, theorem/evidence revision, assumptions/context, side conditions, direction, and preservation scope.

The cited evidence must itself be qualified for the claim.

E is not silently used in structural discovery.

---

# 20. Recursive/fixed-point definitions

Recursive native definitions require whichever explicit authority is needed, including where relevant:

- base cases;
- step/recursive constructor;
- monotonicity or other existence condition;
- guardedness/productivity;
- well-foundedness;
- least/greatest/other fixed-point choice;
- uniqueness/admissibility theorem/profile.

Circular aliases alone are not semantic completion.

---

# 21. Factorization and extraction

Decomposition/extraction is a relation, not necessarily a function.

A source may have multiple faithful factorizations linked by exact definition, inverse/compaction, E-equivalence, refinement, projection/quotient, witnessed extraction, or unresolved alternative.

Unique canonical factorization requires convergence/uniqueness evidence.

## 21.1 Independent freeze

For blind discovery:

1. decompose/extract A without B or expected class mapping;
2. freeze A's factorization/extraction set, roles, ports, dependencies;
3. independently decompose/extract/freeze B;
4. only then pair them for comparison.

Pair-conditioned extraction/factorization is exploratory evidence only.

## 21.2 Extraction kinds

Every extraction states one of:

```text
induced substructure
boundary-cut component
relation-filtered projection
quotient/projection
other explicitly defined extraction
```

An induced extraction retains every included relation/constraint among retained objects under the frozen relation signature. Dropping one is projection loss.

## 21.3 Extraction universe/coverage

A corpus run freezes eligible extraction rules/universe and states whether enumeration is exhaustive, bounded-depth, bounded-cost, sampled, heuristic, or explicitly selected.

Coverage claims do not extend beyond that universe.

## 21.4 Factorization-set completeness

Every result says whether searched factorizations are complete under the declared D system, all currently qualified, bounded-depth/cost, or an explicit subset.

Incomplete factorization coverage cannot support a global negative.

---

# 22. Comparison policy: independent axes

Before blind search, freeze:

```text
target layer
view policy
included/excluded relation signature/dimensions
role-assignment rules
N0/N1 policy
allowed D factorizations
allowed E equivalences
factorization/extraction bounds
relation kinds sought
common-core objective if any
resource budget
```

## 22.1 Target layer

One of:

```text
serialized/native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A result at one layer does not imply another without a qualified D/E bridge.

## 22.2 View policy

```text
V0  closed structural view
VB  boundary/port-preserving view
VS  signature-mappable structural view
VC  class-schema/parameterized view
```

## 22.3 Transformation authority

Allowed N0/N1/D/E sets are explicit and frozen.

## 22.4 Relation kind

```text
ISOMORPHISM
STRONG_EMBEDDING
WEAK_EMBEDDING
SPECIALIZATION
HOMOMORPHISM
SIMULATION
BISIMULATION
QUOTIENT_OR_PROJECTION
COMMON_CORE
CERTIFIED_NON_ISOMORPHIC
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

View, transformation authority, target layer, relation signature, and relation kind are independent dimensions.

---

# 23. Comparison-role provenance

Role declarations record provenance:

```text
source-semantic role
pre-existing qualified-schema role
generic frozen comparison-policy role
pair-specific exploratory hypothesis
```

Only the first three are blind-qualification authority unless a supplied hypothesis is explicitly what the experiment tests.

Ports, mappability, parameter slots, excluded dimensions, or reflected relation kinds cannot be added post-hoc merely to improve a match.

---

# 24. View semantics

## V0

Local alpha identities may bijectively rename. Namespace-qualified stable labels and literals are rigid.

## VB

V0 plus witnessed mapping of independently frozen ports preserving roles/constraints.

## VS

Selected stable labels may map explicitly. Mapping injectivity/surjectivity/bijectivity is recorded. `ISOMORPHISM` requires relevant mapped-label correspondence to be bijective.

## VC

A specific immutable/versioned class schema supplies parameter slots, ports, rigid/mappable roles, allowed abstractions, relation signature, and residual policy.

Non-evidential label identities may be anonymized/mapped while their incidence remains intact. A relation node is not deleted merely because its human name is considered metadata.

Literal positions become parameters only if predeclared by the frozen schema revision.

---

# 25. Relation semantics

## Isomorphism

Bijective preservation **and reflection** of every included load-bearing structure/constraint under the frozen view/relation signature.

## Strong embedding

Injective preservation and reflection among mapped objects for the frozen included relation/scope/constraint signature.

## Weak embedding

Injective preservation of source structure while extra target relations remain explicit residual.

## Homomorphism

May identify source objects; collapsed distinctions are explicit.

## Simulation/bisimulation

Profile-defined relational correspondences; not isomorphism without separate structural bijection.

## Quotient/projection

Many-to-one abstraction with explicit information loss.

## Specialization

Schema/class relation plus explicit added constraints/residual; direction stated.

## Parametric structural correspondence

Mapping independent primitive/model leaves into common schema slots establishes structural correspondence parameterized by those leaves, not source-theory semantic equivalence without additional E evidence.

## Certified non-isomorphic

Requires complete search for the declared finite problem or a verified separating invariant/certificate.

Failure under incomplete search is `NO_WITNESS_FOUND`, `UNKNOWN`, or `RESOURCE_LIMIT`.

---

# 26. Structural classes

A structural class is an immutable/versioned, namespaced schema graph plus constraints—not a name bucket.

A qualified schema records, where applicable:

```text
schema namespace/identity/revision
labels
internal schema graph
structured parameter slots
ports/boundaries
rigid/mappable roles
positive constraints
negative constraints / NACs / disequalities
absence/completeness conditions
slot/port mapping modes
invariants
admissible target layers/views/relation kinds
required D/E dependencies + revisions
specialization conditions
composition/gluing rules
residual policy
known factorizations
falsifiers
qualification evidence
```

Material changes create a new schema revision. Old witnesses do not silently transfer.

## 26.1 Structured parameters

Parameters may be identity-, literal-, relation-, predicate/formula-, rule/profile-, substructure-, or port-valued. A witness maps their actual structure/interface, not merely a numeric handle.

## 26.2 No post-hoc parameterization

Schema graph, parameters, ports, mapping modes, constraints, and residual policy are frozen before instance scoring. Changes create a new candidate revision.

## 26.3 Non-vacuity/selectivity

A reusable class contributes nontrivial shared structural constraints/invariants outside arbitrary pass-through parameter handles and rejects meaningful held-out near misses.

Parameter size alone neither proves nor disproves non-vacuity.

## 26.4 Class-family claims

Specialization/factorization/composition/embedding/quotient/equivalence between classes requires its own verified schema witness.

---

# 27. Class recognition versus class induction

## Recognition

An already frozen qualified schema revision may test a new instance under VC.

## Induction

A new class cannot be evidence for its own discovery.

New-class workflow:

```text
verified common structure across independent instances or independently specified construction law
-> candidate schema induction
-> freeze schema revision
-> held-out positive/negative validation
-> possible promotion
```

Motivating examples alone do not qualify the class.

---

# 28. Class promotion and provenance

A reusable class requires either:

1. at least two independently sourced verified instances plus adversarial negatives; or
2. an independently specified construction schema/theorem tested on held-out positive/negative instances.

Cross-domain classes require independent domains.

Promotion additionally requires non-vacuity/selectivity, label-blind discovery, independent witness verification, factorization/boundary audits, policy generalization, and no simpler qualified factorization explaining the same structure without loss.

Source-supplied domain labels and inferred memberships are distinct roles.

An inferred class membership records schema revision, target layer, view/authority policy, factorization/extraction set, verified witness, and qualification status.

Multiple verified memberships may coexist; AxiomeSH imposes no single inheritance or forced canonical class.

---

# 29. Witnesses and independent verification

A candidate positive/partial witness records at least:

```text
object A/revision/factorization/extraction
object B/revision/factorization/extraction
target layer
view policy
included relation signature
N0/N1 policy
D/E authorities + revisions
relation kind
node/object correspondence
edge/incidence mapping
binding mapping
positive/negative constraint mapping
boundary/port mapping
semantic-label map if any
structured parameter map if any
rigid identities/literals held fixed
constraints/invariants checked
common core(s)
residual Delta_A / Delta_B
boundary-cut/gluing data
excluded-by-view structure
collapsed/projected distinctions
factorization/extraction completeness
search budget/completeness
optimality status
```

A fresh verifier checks this against frozen inputs/policy without expected domain/class answers.

Only verified witnesses become qualification evidence.

---

# 30. Common cores and residuals

Every load-bearing item under the frozen view is classified into exactly one accounting role:

```text
mapped common structure
A-only residual
B-only residual
A boundary-cut incidence
B boundary-cut incidence
excluded-by-view structure
explicitly projected/collapsed structure
```

This includes occurrences, positive edges, negative constraints, disequalities, guards, ports, quantifier/domain constraints, and activation/execution constraints.

The reconstruction contract is:

```text
A = glue(C, Delta_A, cut_A)
B = glue(C, Delta_B, cut_B)
```

A common-core result states whether its map is strong/induced or weak.

A smaller exact core is preferred to a larger false match.

## Maximum claims

“Maximum” requires a declared objective/partial order and optimality certificate or complete-search justification. Otherwise report maximal/non-dominated cores found and search bounds.

## Multiple mappings/automorphisms

Distinct verified mappings remain separate by default.

A deterministic canonical graph representative does not prove uniqueness of mapping.

Mappings may be quotient-collapsed only under an independently verified automorphism/equivalence showing irrelevance to the requested downstream operation.

---

# 31. Composition and joint realizability

Composition requires:

```text
component verified witnesses
overlap/gluing map
shared ports/identities
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is insufficient.

Correlation, support, timing, ownership, provenance, trust, and dependency remain represented whenever load-bearing.

---

# 32. Candidate retrieval and structural indexing

Finding the correct pair is part of discovery correctness.

Qualification separates candidate retrieval, pairwise comparison, and witness verification.

Labels may accelerate already-known structure, but a general cross-domain discovery system retains a label-blind structural path or independently demonstrated hidden-label recall guarantee.

## 32.1 Index declaration

Every structural/learned index records:

```text
index/model revision
target layer/view/relation target
N0/N1 policy
D/E policy
factorization/extraction depth
included/excluded roles
boundary/parameter/namespace treatment
collision behavior
false-positive risk
false-negative/pruning risk
training-data provenance if learned
supervision/objective if learned
known evaluation-corpus overlap
```

## 32.2 Fingerprint pruning

A fingerprint mismatch can certify separation only if an independently qualified necessary invariant is known for the exact frozen relation/view/layer:

```text
A R B => f(A) = f(B)
```

Equal fingerprints ordinarily prove nothing.

A fingerprint/index used outside its qualified policy is heuristic only; its misses cannot support completeness claims.

## 32.3 Approximate scores

Learned similarity/confidence/rank is retrieval metadata only and is excluded from structural witness semantics unless the score itself is part of the modeled domain.

---

# 33. Corpus discovery coverage

A corpus run freezes and reports:

```text
corpus revision
eligible object/component extraction universe
extraction enumeration mode/completeness
factorization bounds
index policy revisions
candidate thresholds
objects/components eligible/indexed
candidate pairs generated
pairs structurally searched
pairs independently verified
known-positive recall controls
known-negative precision controls
resource/time limits
unindexed/unsearched regions
```

Discovery result states remain distinct:

```text
VERIFIED_RELATION_FOUND
CANDIDATE_RETRIEVED_NO_VERIFIED_RELATION
PAIR_SEARCHED_NO_WITNESS
PAIR_CERTIFIED_NEGATIVE
PAIR_NOT_GENERATED
OBJECT_OR_COMPONENT_NOT_INDEXED
FACTORIZATION_NOT_AVAILABLE
UNKNOWN_RESOURCE_LIMIT
```

Absence of a reported relation outside complete coverage is `UNKNOWN`.

---

# 34. Information isolation and anti-cheating

Before blind discovery:

1. independently freeze each source factorization/extraction/role/port set;
2. withhold expected mappings, registry hypotheses, human analogy text, expected cores/residuals, scorer material, and archival source backups excluded from semantic evidence;
3. anonymize/permute non-evidential labels while preserving incidence;
4. randomize local identity/reference/presentation choices allowed by N0/N1.

The fresh discovery context/tool boundary cannot access excluded material until result freeze.

For learned indexes, training/supervision provenance is separately audited; hidden labels at inference do not erase training leakage.

Mandatory controls include:

- cross-domain positive;
- alpha/serialization positive;
- near-isomorphic negative;
- same-label/different-structure negative;
- same-interior/different-boundary negative;
- partial common-core pair;
- alternative-factorization pair;
- misleading/swapped-label pair;
- symmetry/automorphism pair;
- namespace-collision pair;
- post-hoc-policy-leak pair;
- certified-negative versus resource-limited no-witness;
- novel synthetic structures;
- modified familiar structures defeating pretrained prototype completion;
- legacy/current bridge pair;
- vacuous-parameter class negative;
- retrieval false-negative/coverage control;
- structurally novel class absent from the registry.

---

# 35. Held-out generalization

A policy family can overfit a benchmark set even when each pair policy is frozen.

Qualification separates development cases from sealed final holdouts and may generate fresh synthetic/adversarial cases after policy/schema design is frozen.

A repeatedly inspected holdout becomes development evidence and is replaced for final generalization scoring.

---

# 36. Search completeness and honesty

Every engine/run records:

```text
soundness status
completeness status
heuristic/probabilistic behavior
random seed if relevant
resource bound
factorization/extraction coverage
mapping-search coverage
optimality status
witness/certificate verification status
```

Heuristics may retrieve/prioritize and may propose candidate witnesses, but only independently verified witnesses support positive claims.

Unknown remains unknown.

---

# 37. Circular evidence prohibition

The target class/mapping hypothesis cannot justify the decomposition/extraction later cited as evidence for that same claim.

Qualification dependencies are acyclic with respect to the claim being established.

Allowed authority:

- already-qualified generic lower libraries;
- source axioms/model leaves;
- independently qualified schema definitions.

Forbidden target-claim authority:

- target registry mapping;
- target class-membership hypothesis;
- expected analogy;
- decomposition/extraction rule whose validity depends on target membership.

---

# 38. Proof systems and meta-theory

AxiomeSH does not select one global proof calculus.

Surface implication/negation/etc. do not grant classicality, explosion, modal rules, temporal induction, deontic distribution, frame rules, higher-order extensionality, choice, or other profile laws.

Proof-capable profiles represent premises, axioms, local inference rules, proof objects/dependencies, and required semantic foundations.

A cached `derivable` relation is acceptable only when tied to validated proof objects or explicit primitive proof authority.

Representability is not proof.

---

# 39. Qualification gates

Gate names are unique:

```text
E0     source fidelity
E1     native statement expressibility
E1P    primitive semantic decomposition
E1A    alias/factorization expansion
E1C    structural-class classification after witness
E1E    class/instance expansion
E1N    N0/N1 versus D/E audit
E1F    alternative-factorization audit
E1W    witnessed comparison audit
E1B    boundary/port/joint-realizability audit
E1L    label-blind/anti-cheating audit
E1M    multiple-mapping/maximal-core audit
E1Q    comparison-policy/relation-signature freeze audit
E1D    decomposition exactness/recursion/residual audit
E1S    namespace/bundle/manifest audit
E1H    reference/binder hygiene + occurrence/rewrite audit
E1V    independent witness/negative/optimality verification
E1T    target-layer/conclusion-scope audit
E1R    retrieval/discovery coverage audit
E1U    class non-vacuity/selectivity audit
E1X    extraction/context audit
E1G    held-out discovery-policy generalization audit
E1I    identity/variable-owner/namespace edge-case audit
E1K    index-invariant/search-engine audit
E1COV  decomposition/common-core item coverage audit
E1ISO  enforceable information-flow isolation audit
E2     isolated cold reconstruction
E3     proof-profile completeness
E4     proof execution
E5     independent proof review
```

A downstream claim may rely only on gates relevant to the relation it uses.

---

# 40. Historical compatibility

Frozen Draft 0.1–0.12 artifacts retain their recorded historical semantics and do not silently become Draft 0.13-qualified.

To participate in current qualification, a historical artifact requires current-semantics rerendering or an exact verified legacy-to-current bridge.

Potentially changed conventions include:

- formula-scope conjunction;
- set-like versus occurrence-preserving membership;
- set-like versus multiset rewrite update;
- existential/freshness overloading;
- direct-child rule activation;
- reference visibility/order/hygiene;
- identity/label namespaces;
- signature/document context;
- candidate surface versus primitive status;
- optional `@@` reduction;
- evidence-partition/discovery isolation rules.

Existing Experiment 003 `.axh` foundations/profiles/proof candidates authored under earlier conventions are historical author-side candidates until rerendered or bridged.

Historical Draft 0.5 E2 qualification remains evidence about that historical scaffold only.

---

# 41. Core-admission rule

Before permanently promoting a new syntax/operation to the irreducible substrate:

```text
candidate distinction
-> attempt faithful construction from existing primitives
-> test exactness / round trip / residual burden
-> test canonical identity and ambiguity
-> test isomorphism/discovery behavior
-> test qualified-agent reconstruction/reasoning cost
-> retain stable label/surface if useful
-> promote to core only if lower construction fails or is materially worse
```

Convenience, familiarity, repeated use, or a standard logical name does not prove irreducibility.

---

# 42. Falsifiers

Revise/reject this candidate if controlled evidence shows that its safeguards add material lifecycle/reasoning cost without preventing real false/missed correspondences, or if a simpler exact mechanism preserves the same semantic fidelity and discovery safety.

Specific falsification targets include:

- occurrence-preserving scope/rewrite semantics;
- independent factorization/extraction freeze;
- policy/relation-signature freeze;
- namespacing;
- exact semantic D round trips and residual audits;
- fixed-point contracts;
- explicit quantifier domains;
- schema/dependency versioning;
- independent witness verification;
- certified-negative discipline;
- factorization/retrieval coverage reporting;
- embedding-strength/target-layer distinction;
- circular-evidence prohibition;
- multiple-witness preservation;
- non-vacuity/selectivity controls;
- held-out discovery testing;
- enforceable evidence isolation.

---

# 43. Constitutional discipline

```text
preserve source semantics
-> independently decompose/extract as far as justified
-> preserve alternative exact factorizations
-> freeze roles/ports/relation signature/policy before pairing
-> normalize representation only
-> retrieve candidates without labels as the sole path
-> compare under explicit target layer + view + transformation authority
-> state relation kind independently
-> emit independently verifiable mapping/core/residual/gluing witness(es)
-> preserve negative constraints, multiplicity, and materially distinct mappings
-> recognize or induce classes only from verified witnessed structure
-> validate reusable classes on held-out/adversarial cases
-> retain useful labels afterward
```

The target is not a large ontology of familiar names.

The target is a small information-preserving substrate plus reusable, versioned structural classes whose labels help agents recognize constructions only **after the underlying shape has been exposed**.