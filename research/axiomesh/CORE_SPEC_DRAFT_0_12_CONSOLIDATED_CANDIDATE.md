# AxiomeSH Core Specification — Draft 0.12 Consolidated Candidate

**Status:** experimental consolidated candidate after line-by-line review through both Draft 0.11 candidate tracks  
**Historical lineage:** Draft 0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7 → 0.8 → 0.9 → 0.10 → 0.11 candidates  
**Authority:** self-contained authority for new Draft 0.12 artifacts on `experiment/axiomesh-native-reconstruction`  
**Historical rule:** frozen older artifacts retain their recorded historical decode semantics  
**Promotion:** experimental-branch authority only until independently qualified

Draft 0.12 resolves the authority ambiguity created by parallel Draft 0.11 candidate documents. It consolidates the surviving core semantics, pairwise-comparison safeguards, structural-class rules, and corpus-discovery safeguards into one normative candidate for new artifacts.

A new Draft 0.12 decoder does not need to replay Drafts 0.1–0.11. Historical drafts remain evidence explaining how the current rules were reached.

No new domain logic primitive is introduced.

---

# 1. Purpose

AxiomeSH is an agent-native structural knowledge representation intended to maximize:

```text
durable correct synthesis / total lifecycle cost
```

while preserving:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- composition constraints;
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

No mandatory English, JSON, theorem-language, database, tokenizer-specific, or model-specific translation layer is part of native semantics.

The scoped-hypergraph/rewrite substrate remains falsifiable.

---

# 2. Isomorphism/discovery constitution

AxiomeSH succeeds only if it can expose common structure across independently named domains without either:

- missing real correspondence because labels, IDs, syntax, serialization, namespace, factorization, candidate retrieval, or source convention differ; or
- manufacturing false correspondence by deleting or parameterizing away a load-bearing distinction.

The governing discovery sequence is:

```text
source semantics
-> independent qualified factorization/extraction set for each source
-> representation-only normalization
-> label-blind candidate retrieval/indexing
-> frozen comparison policy
-> structural search
-> candidate witness/certificate
-> independent witness verification
-> structural relation + common core/residuals
-> structural-class recognition or class induction
-> retained useful labels
```

Labels are construction/retrieval handles. They are evidentially downstream of structural evidence.

Expected analogy, desired class, class registry, scorer answer, or preferred factorization MUST NOT choose the decomposition, extraction, mapping policy, or relation later presented as evidence.

---

# 3. Semantic revision and bundle authority

Every new canonical bundle MUST identify the applicable AxiomeSH semantic revision/profile either:

- in an explicit native bundle manifest; or
- in an enclosing native corpus/bundle contract supplied as part of the artifact authority.

Revision/profile identity is required for unambiguous decoding but is non-evidential for cross-domain structural matching unless the requested comparison explicitly includes revision metadata.

Frozen historical artifacts retain their experiment-recorded revision.

The concrete manifest construction is theory/bundle structure, not a new core primitive, and must itself be qualified before Draft 0.12 cold bundles depend on it.

---

# 4. Representation layers

## 4.1 Candidate irreducible substrate

The strongest current primitive candidates are:

- opaque structural identity;
- ordered incidence/hyperedge structure;
- structural scope/boundary;
- binding ownership needed for structural matching;
- structural rewrite;
- negative structural match, still subject to elimination testing;
- transparent references as non-semantic compression.

Even these remain experimentally falsifiable.

## 4.2 Primitive/model leaves

A represented theory may supply leaves such as:

- object/world/state identities;
- atomic valuation/incidence facts;
- one-step transition/accessibility/reduction edges;
- heap address/value incidence;
- source algebraic operations/relations with explicit axioms;
- observations;
- stipulated source axioms.

A source name does not prove primitive status.

A leaf SHOULD be classified as one of:

```text
observational/model input
stipulated source axiom/relation
frozen implementation/environment fact
currently undecomposed candidate primitive
proven irreducible representation primitive
```

A load-bearing environment fact must be frozen/imported into the qualification bundle.

## 4.3 Derived native constructions / structural classes

Known compound semantics must be decomposed where faithful lower structure exists.

Examples:

- knowledge -> accessibility + satisfaction;
- common knowledge -> group relation + path closure + satisfaction;
- public announcement -> selected-model restriction + post-update satisfaction;
- temporal operators -> trace/position structure + satisfaction;
- CTL -> branching transition/path structure + satisfaction;
- separating conjunction -> disjoint heap decomposition + recursive satisfaction;
- Hoare validity -> transition relation + pre/post satisfaction;
- closure -> explicit path/reduction construction;
- proof/derivability -> proof objects + explicit rule authority;
- mathematical function application -> represented function model;
- finite folds -> indexed structure + combining operation.

## 4.4 Candidate compact surfaces

The following remain valid Draft 0.12 surfaces without being assumed irreducible:

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

Possible eventual dispositions:

```text
irreducible representation primitive
canonical surface for lower native construction
serialization/value shorthand
profile-owned derived constructor
qualified structural-class alias
rejected/redundant
```

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

term     := id
          | literal
          | label
          | var
          | ref
          | edge
          | scope
          | choice
          | negmatch
          | neg
          | forall
          | exists
          | abstract
          | eq
          | implies
          | rule
          | bind
          | instantiate
```

This grammar states available surfaces, not primitive classification.

Whitespace is non-semantic except as token separation. Mixed infix forms MUST be structurally nested/parenthesized to admit one parse.

---

# 6. Identity classes and namespaces

## 6.1 Opaque structural identities

Bare integers are opaque structural identities.

Within one structural namespace:

```text
same structural identity = same object
```

Different structural IDs are distinct structural identities even if an object-theory equality later relates them.

Bare-ID spelling is non-semantic and may alpha-map where the frozen comparison policy permits.

When separately serialized documents compose, local structural-ID namespaces MUST be preserved or capture-avoidably renamed by a qualified bundle-partition bridge. Coincidental numeric equality across independent local-ID namespaces is not identity.

## 6.2 Exact literals

`#n` and `#p/q` denote exact values and are rigid by default.

For rational literals:

- denominator MUST be nonzero;
- numerator/denominator are reduced to lowest terms;
- denominator is positive and sign is carried by numerator;
- negative zero canonicalizes to zero;
- floating-point spellings are not canonical exact literals.

Literal token-class irreducibility remains open.

A class schema may expose a literal position as a parameter slot. That is parameterization, not literal alpha-renaming.

## 6.3 Stable labels

`^n` is stable inside its owning namespace.

Across independent theory bundles, raw numeric equality does not establish semantic identity.

A stable semantic identity is at least:

```text
(namespace, local symbol id)
```

unless a shared/global namespace is explicitly represented.

Consequences:

- same numeric `^n` in independent namespaces is not sameness evidence;
- different numeric labels are not evidence against a mapped-signature correspondence;
- exact literals remain global values, not theory-local labels.

A bundle must make the namespace owning stable labels recoverable from native bundle structure or explicit native bundle metadata.

Class/schema labels and revisions obey the same namespace discipline.

---

# 7. Ordered incidence

`(A B C)` is one ordered incidence object.

Tuple position is load-bearing unless a represented schema/definition states otherwise.

No universal semantics is attached to the first position merely because it is first.

A label-headed edge is a useful relation/application surface, but mathematical predicate/function meaning remains theory/class-owned.

If two source conventions encode equivalent roles in different positions, a qualified decomposition/schema mapping must expose that role correspondence. Arbitrary tuple permutation is not structural isomorphism.

---

# 8. Scopes, occurrences, and carrier roles

`[ ... ]` creates an unordered structural scope/boundary/container.

## 8.1 Occurrence-preserving membership

For new Draft 0.12 artifacts, direct scope membership is unordered but occurrence-preserving.

```text
[X X]
```

contains two member occurrences unless an explicit qualified quotient/profile makes the relevant membership idempotent/set-like.

The default preserves information.

Frozen historical artifacts may retain earlier set-like semantics.

## 8.2 Occurrence multiplicity versus occurrence identity

Multiplicity and externally addressable occurrence identity are distinct.

Two identical members may be represented as multiplicity-two without becoming separately addressable objects.

If a specific occurrence must carry external relations, provenance, ports, or persistent identity, that occurrence must be reified with an explicit structural identity/wrapper.

Identical nested scopes are likewise separate member occurrences by count unless explicit identity/quotient structure says otherwise.

## 8.3 Scope is not conjunction, set, or sequence by default

Raw `[]` does not mean:

- logical conjunction;
- mathematical extensional set;
- ordered list/sequence;
- idempotent collection.

Those meanings require explicit constructions/profile semantics.

An ordered collection must carry explicit order/incidence structure.

## 8.4 Carrier role must be recoverable

A scope may act as grouping, component boundary, operational state, quoted data, module boundary, etc.

If behavior-changing role is not uniquely recoverable from native containment/incidence/profile, it must be represented explicitly.

Identical carriers do not get different behavior from an unrepresented reader convention.

---

# 9. Boundaries and ports

Crossing identity is a natural interface cue but not a complete interface contract.

Where composition matters, a component/class interface may contain:

- exposed identities;
- port roles;
- direction/variance/mapping rules;
- cardinality constraints;
- ownership/support/timing constraints;
- required gluing relations.

Source/component ports are derived/declared independently before pairwise comparison.

Pairwise comparison maps existing ports; it does not invent ports to force compatibility.

---

# 10. References

References are non-semantic compression.

## 10.1 Visibility and dependency

Reference meaning does not depend on sibling textual order inside an unordered serialization scope.

A binding is visible through its containing serialization scope and descendants unless a stricter explicit reference scope is represented.

Visible bindings are unique; shadowing is invalid.

Reference dependencies must be acyclic unless a future explicit recursive-reference construct is separately defined.

## 10.2 Hygienic expansion

Reference resolution preserves lexical ownership.

A referenced term is either closed relative to its binding environment or carries enough lexical environment for capture-avoiding expansion.

Expansion must not capture formerly free variables or detach formerly bound occurrences.

## 10.3 Occurrence semantics

Repeated uses of one reference are serialization sharing only. They do not identify the use-site occurrences except through identities explicitly present in the referenced term.

After N0 resolution, reference-binding syntax is absent from semantic comparison structure.

---

# 11. Variables and binding

Variable numbers are local handles.

Repeated occurrence of the same pattern/bound variable requires the same binding within its owner.

Different variables may bind the same structural object unless explicit distinctness/disequality requires otherwise.

Disjoint sibling binders may reuse the same number.

Nested rebinding of a still-visible same-number binder remains invalid in this candidate.

Capture-avoiding alpha-renaming preserves bound structure.

Rewrite-local pattern variables are owned by the represented rewrite/profile.

Declarative quantifier/abstraction surfaces own their lexical bodies.

A variable appearing only inside a negative application condition MUST already be bound by positive pattern structure or be explicitly scoped/quantified by the matching profile. A NAC does not silently introduce quantification.

A closed declarative proposition has no free variables. Open terms are permitted only where a containing schema/binder/pattern explicitly owns their free-variable interface.

---

# 12. Rewrite objects, activation, and occurrence semantics

`[L] > [R]` represents a first-class rewrite object.

Rewrite objects may be referenced, compared, nested, related, or transformed as data. Their existence does not alone imply activation.

## 12.1 Activation is profile-owned

An execution profile/activation construction determines active rules.

The historical direct-child-active behavior remains a supported legacy profile when explicitly selected.

Serialized rule ordering MUST NOT imply priority unless the execution profile explicitly represents priority/order.

## 12.2 Boundary-respecting matching

A rule matches only within its declared application boundary.

It does not implicitly flatten or cross nested structural scopes. Participation of nested structure must be structurally addressed by the rule/profile.

## 12.3 Default multiset rewrite semantics

Within the declared application boundary, a match selects an instantiated LHS **submultiset of member occurrences**.

The default successor is:

```text
S' = (S multiset-minus matched(LHS)) multiset-plus instantiated(RHS)
```

with unmatched context retained.

This avoids hidden set/idempotent semantics and avoids requiring an arbitrary correspondence between indistinguishable duplicate LHS/RHS occurrences.

If persistent identity of a specific occurrence is load-bearing, the occurrence must be explicitly reified; ordinary structural identity then determines persistence.

A set/idempotent rewrite profile may quotient duplicates only explicitly.

## 12.4 RHS-only variables

An ordinary variable appearing only on the RHS is invalid unless its value is supplied by explicit represented structure such as fresh allocation or another profile-defined generator.

No implicit RHS-only freshness exists.

## 12.5 Fresh allocation

New Draft 0.12 artifacts do not overload declarative `+?n` as operational freshness solely by RHS position.

Fresh allocation is an explicit native execution-profile construction/constraint.

## 12.6 Negative match

`!X` is structural absence within a declared match/application boundary under compatible bindings.

It is not declarative falsity.

Absence-sensitive semantics preserve the relevant boundary and completeness/open-vs-closed-world contract.

## 12.7 Multiway semantics and application events

Absent an explicitly represented execution strategy/priority, every valid rule/match application is a legitimate successor event.

Distinct match/application events remain distinct derivation events even when they produce structurally identical successor states.

A derivation/application witness records the rule, match, bindings, boundary, and successor relation as needed by the selected execution/proof profile.

An execution profile may quotient equivalent application events only explicitly.

Search order, pruning, scheduling, or serialization order is non-semantic unless explicitly represented.

---

# 13. Declarative surfaces

## 13.1 Implication

`A => B` is a declarative implication-constructor surface. It does not execute rewrite and does not select a proof calculus.

## 13.2 Equality

`A == B` is an object-theory equality surface, not structural identity.

Pure structural comparison does not collapse two nodes because an object-theory formula asserts equality.

Any quotient/collapse using represented equality is a qualified semantic/projection transformation.

## 13.3 Negation

`~A` is a declarative negation surface whose laws are profile-owned.

It is distinct from `!A` negative structural match.

## 13.4 Choice

`{A B ...}` is an unordered alternative surface.

Alternative member order is non-semantic. Alternative occurrence multiplicity is preserved by default unless the selected profile establishes idempotence.

Exact satisfaction/proof laws are profile/class-owned.

Choice is not operational multiway rewrite merely because both expose alternatives.

---

# 14. Quantifiers, bound bodies, and instantiation

## 14.1 Quantifier completeness

`*?n BODY` / `+?n BODY` preserve binder ownership and quantifier kind but are semantically complete only when the domain/generator is determined.

New canonical quantified constructions expose:

```text
binder ownership
quantifier kind
domain/generator
body
sort/guard constraints if any
```

A profile-wide default domain is valid only when explicitly represented in the dependency graph.

Identical binder/body text over different domains is not structural interchangeability.

## 14.2 Lexical abstraction

`\?n BODY` packages a first-class bound body without asserting universal/existential quantification.

It does not intrinsically mean lambda/Pi/set-builder/etc.

Primitive status remains open.

## 14.3 `@@` instantiation

`ABSTRACTION @@ ARGUMENT` names capture-avoiding bound-body instantiation.

It remains a candidate surface/structural class, not a proven irreducible primitive.

It must be compared against constrained structural rewrite over explicit binder/occurrence ownership.

It is not generic mathematical function application.

## 14.4 Capture avoidance

Any qualified instantiation construction preserves binder ownership and alpha-renames inner binders when needed to avoid capture.

No hidden host substitution callback is semantic authority.

## 14.5 No optional canonical reduction

N0/N1 never silently reduce `@@`.

Instantiation reduction is a recorded D/E transformation with a witness.

---

# 15. Domain mathematics remains theory structure

Raw scopes are not mathematical sets, and core syntax does not hard-code domain arithmetic/set operations.

Arithmetic, set membership, subset, cardinality, union, type/sort relations, function semantics, etc. remain represented theory/class structure unless a later experiment earns a more general primitive.

A compact label may name such a construction only when its native semantics/dependencies are available at the qualification level required by the task.

---

# 16. Claims, status, and proof authority

A claim body intended for native reasoning MUST resolve to actual represented structure, not only an opaque proposition ID whose formula exists in a sidecar.

Epistemic/research status such as hypothesis, empirical support, candidate rule, missing law, disproven, or rejected does not grant entailment/proof authority.

Representability is not proof.

Proof authority comes from explicit profile axioms/rules/proof objects or another represented primitive proof authority.

---

# 17. Signatures, manifests, and partitioning

## 17.1 Surface declaration closure

For a selected serialized bundle:

- every used local stable label is declared/imported or explicitly core-reserved;
- an undeclared stable label is invalid;
- a canonical compact surface signature MAY require exactly the used local labels;
- unused declarations make that compact signature non-canonical but do not change the body semantics.

Deterministic signature order is serialization-only.

## 17.2 Layer-relative signatures

Distinguish:

```text
Sig_surface(T)
Deps(T)
Sig_D(T)
```

where `Deps(T)` is the native dependency graph/closure required to interpret the selected body and `Sig_D` belongs to a selected factorization.

Surface-signature equality is not structural-isomorphism evidence.

Recursive dependency SCCs are permitted when their recursion/fixed-point authority is explicit.

## 17.3 `^0`

The historical `^0` signature marker remains a supported serialization convention, not a proven primitive.

No comparison depends on invisible external knowledge that a file “is a signature document.”

## 17.4 Multi-document partitioning

Splitting/concatenating a bundle is N0-transparent only with a partition witness preserving:

- stable-label namespace;
- local structural-ID namespaces/renaming;
- reference namespaces;
- binder ownership/visibility;
- operational activation boundaries;
- dependency/import relationships;
- ports/boundaries;
- any semantic ordering constraints.

Otherwise partitioned and concatenated forms require an explicit bridge.

---

# 18. Source fidelity, human gloss, and evidence partitions

## 18.1 Source fidelity

Source-to-native rendering must preserve every distinction later needed for proof, composition, or comparison.

Where ingest is nontrivial, its mapping/audit is retained as evidence rather than inferred from the source label.

## 18.2 Human gloss

Human labels may aid review/retrieval but may not supply load-bearing structure absent from native input.

Cold reconstruction distinguishes:

```text
native formal recovery
human gloss mapping
semantic inference
```

## 18.3 Qualification evidence partition

A stewardship bundle may contain more information than a blind discovery agent is allowed to see.

Qualification partitions content into:

```text
DISCOVERY_VISIBLE
ARCHIVAL_ONLY
REVIEWER_SCORER_ONLY
```

The partition is frozen/auditable.

Blind qualification uses an actual isolation boundary: excluded/scorer material is not available in the fresh context/tools until the discovery result is frozen.

An opaque archival source backup may support recoverability but cannot count as semantic-decomposition evidence.

---

# 19. Transformation authority

N0/N1/D/E remain separate.

## 19.1 N0 — serialization-transparent normalization

Allowed:

- whitespace/presentation;
- hygienic reference resolution;
- deterministic serialization ordering;
- qualified transparent bundle partition normalization.

Not allowed:

- definitional expansion;
- theorem/algebraic rules;
- substitution/beta reduction;
- class mappings;
- quotienting;
- peer-object information.

## 19.2 N1 — local representation normalization

Allowed only under frozen source-local role policy:

- local alpha identity renaming;
- bound-variable numbering;
- unordered-member presentation.

Must preserve:

- ordered incidence;
- scope/boundary nesting;
- occurrence multiplicity;
- binding ownership;
- namespace-qualified stable labels;
- exact literals;
- positive and negative constraints;
- operational/declarative kind/direction;
- ports;
- quantified domains/generators;
- source/model constraints.

Peer-object mappings are not N1.

## 19.3 D — qualified factorization/decomposition

Every D edge records:

```text
source revision
target factorization revision
transform kind
applicability guards/preconditions
definition/dependency revision
source-target map
preservation obligations
information loss/abstraction if any
round-trip reconstruction/compaction relation if exact
residual/provenance required for reconstruction
```

Transform kinds include:

```text
exact_definition
conservative_refinement
abstraction
projection
quotient
approximation
unresolved_relation
```

Exact D requires source round-trip modulo N0/N1 and declared transparent surfaces.

## 19.4 Semantic versus archival round trip

A semantic-decomposition round trip reconstructs the source from:

```text
exposed decomposed construction
+ justified irreducible/model leaves
+ transparent naming/serialization information
+ semantically necessary audited residual
```

An opaque source copy—or a residual that merely re-encodes the compound source without decomposition—does not count as semantic-decomposition evidence.

Residuals used to justify exact semantic decomposition are independently audited for that condition.

## 19.5 E — theory/profile equivalence

Every E edge records:

```text
profile/theory revision
theorem/rule/evidence revision
assumptions/context
side conditions
direction
preservation scope
```

The cited proof/evidence dependency must itself be qualified for the claim being made.

E is not silently used in structural discovery.

---

# 20. Recursive definitions / fixed points

Recursive native definitions are valid only with explicit recursion authority, including where relevant:

```text
base cases
recursive/step constructor
monotonicity or other existence condition
guardedness/productivity
well-foundedness where used
least/greatest/other fixed-point interpretation
uniqueness/admissibility authority
```

The required conditions depend on the selected profile. Circular aliases without such authority are not semantic completion.

---

# 21. Factorization and extraction graph

Decomposition/extraction is a relation, not necessarily a function.

A source may have multiple faithful factorizations linked by:

- exact definition;
- inverse/compaction;
- E-equivalence;
- refinement/specialization;
- projection/quotient;
- witnessed substructure extraction;
- unresolved alternative.

Unique canonical decomposition requires convergence/uniqueness evidence.

## 21.1 Independent freeze before pairing

For blind structural discovery:

1. decompose/extract A without B or the expected class mapping;
2. freeze A's factorization/extraction set, roles, ports, dependencies;
3. independently decompose/extract and freeze B;
4. only then expose A and B to pairwise structural search.

Already-qualified generic lower libraries may be used. Target registry membership/expected counterpart may not justify the decomposition later cited as evidence.

Pair-conditioned extraction/factorization remains exploratory hypothesis evidence only.

## 21.2 Extraction witness

An extracted component/substructure records:

```text
source revision
extraction rule/revision
selected substructure
boundary/cut relations
discarded residual/context
factorization dependencies
freeze/unblinding timing
```

A common-core claim cannot hide context discarded to obtain the compared components.

## 21.3 Eligible extraction universe and coverage

A corpus run declares the extraction universe/rules and whether candidate enumeration is:

```text
exhaustive
bounded depth
bounded cost
sampled
heuristic
explicit selected subset
```

Coverage claims are scoped to that declared universe.

## 21.4 Factorization completeness

Every result records which factorization subset was searched:

```text
complete under declared D system
all currently qualified nodes
bounded-depth subset
bounded-cost subset
explicit selected subset
```

Failure over an incomplete set is not a global negative.

---

# 22. Comparison policy: orthogonal axes

Every run freezes independent axes before discovery.

## 22.1 Target layer

```text
serialized/native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A relation at one layer does not imply another without a qualified D/E bridge.

## 22.2 View policy V

```text
V0  closed structural view
VB  boundary/port-preserving view
VS  signature-mappable structural view
VC  class-schema/parameterized view
```

A view declares included/excluded/rigid/mappable/parameterized dimensions.

## 22.3 Transformation authority A

```text
N0-set
N1-set
D-set
E-set
```

Allowed transformations/dependencies are frozen before expected mapping unblinding.

## 22.4 Relation kind R

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

View, transformation authority, target layer, and relation kind are distinct.

No total ranking among views is implied.

---

# 23. Policy freeze and role provenance

Before blind qualification freeze:

```text
target layer
view policy
role-assignment rules
N0/N1 rules
allowed D factorizations
allowed E equivalences
factorization/extraction search bounds
relation kinds sought
common-core objective if any
resource budget
```

Comparison-role declarations record provenance:

```text
source-semantic role
pre-existing qualified schema role
generic comparison-policy role
pair-specific exploratory hypothesis
```

Only the first three are blind-qualification authority unless the experiment explicitly tests a supplied hypothesis.

Ports, mappability, parameter slots, and excluded dimensions cannot be added post-hoc merely to improve a match.

---

# 24. View semantics

## 24.1 V0

Local alpha identities may bijectively rename. Namespace-qualified stable labels/literals are rigid.

## 24.2 VB

V0 plus witnessed mapping of independently frozen ports preserving roles/constraints.

## 24.3 VS

Selected stable semantic identities may map explicitly.

The map records injectivity/surjectivity/bijectivity.

An `ISOMORPHISM` under VS requires the relevant mapped stable-label correspondence to be bijective.

## 24.4 VC

A specific immutable/versioned class schema supplies parameter slots, ports, rigid/mappable roles, allowed abstractions, and residual policy.

Non-evidential label identities may be anonymized/mapped while their incidence structure remains intact.

A label/relation node is not deleted merely because humans call its name metadata if deleting it would remove load-bearing relation structure.

Literal positions become parameters only if predeclared by the frozen schema revision.

---

# 25. Relation semantics

## 25.1 Isomorphism

Bijective preservation and reflection of all compared load-bearing structure under the frozen view.

## 25.2 Strong embedding

Injective preservation and reflection among mapped objects. Extra target relations among mapped objects violate strong embedding unless outside the compared view/signature.

## 25.3 Weak embedding

Injective preservation of source structure while explicit target residual relations may remain.

## 25.4 Homomorphism

May identify source objects; collapsed distinctions are reported.

## 25.5 Simulation/bisimulation

May be relational/many-to-many according to explicit profile semantics. They are not isomorphism without separate bijective structural proof.

## 25.6 Quotient/projection

Many-to-one abstraction with explicit information loss.

## 25.7 Specialization

A class/schema relation plus explicit additional constraints/residual; direction is stated.

## 25.8 Parametric structural correspondence

Mapping independently named opaque/model leaves into common schema slots establishes structural/schema correspondence parameterized by those leaves.

It does not establish source-theory semantic equivalence without additional E evidence.

## 25.9 Certified non-isomorphic

Requires complete search for the declared finite problem or a verified separating invariant/certificate.

Failure to find a witness under bounded/incomplete search is `NO_WITNESS_FOUND`, `UNKNOWN`, or `RESOURCE_LIMIT`.

---

# 26. Structural classes and schema versions

A structural class is a reusable immutable/versioned schema graph plus constraints.

A qualified schema includes, where applicable:

```text
schema definition namespace/identity/revision
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
admissible view policies/relation kinds
required D/E dependencies + revisions
specialization conditions
composition/gluing rules
residual policy
comparison target layer
known factorizations
falsifiers
qualification evidence
```

Material schema changes create a new revision/identity or explicit successor relation. Old witnesses do not silently transfer.

## 26.1 Structured parameters

Parameters may be identity-, literal-, relation-, predicate/formula-, rule/profile-, substructure-, or port-valued.

A witness maps parameter structure, not merely the label naming it.

## 26.2 No post-hoc parameterization

For an existing class run, schema graph, parameters, ports, mapping rules, constraints, and residual policy are frozen before instance scoring.

Changing them creates a new candidate revision.

A new parameter is justified by independent instances or an independently specified construction law and held-out/adversarial validation.

## 26.3 Non-vacuity/selectivity

A reusable class must expose nontrivial shared construction outside its free parameters.

Parameters may be structurally large; size alone is not the test.

The fixed schema must impose independently checkable shared relations/invariants and reject meaningful held-out near misses.

A parameter that is only an oracle-like handle to the whole instance does not establish a useful class.

## 26.4 Class-family claims are witnessed

Class-to-class specialization, composition, factorization, embedding, quotient, or equivalence uses the same witnessed machinery as domain instances.

A class-family diagram is hypothesis metadata without those witnesses.

---

# 27. Class recognition versus class induction

## 27.1 Recognition

A pre-existing immutable schema revision may be used under VC to test a new instance.

The schema/parameters/ports are frozen before scoring the instance.

## 27.2 New-class induction

A new class cannot be used as a premise to discover itself.

Candidate induction proceeds from verified pair/group common structure or an independently specified construction law:

```text
verified structural relations
-> candidate schema induction
-> freeze candidate schema revision
-> held-out positive/negative validation
-> possible promotion
```

The motivating examples alone do not qualify the class.

---

# 28. Class promotion

A candidate class may be recorded after one exact motivating decomposition but is not promoted as reusable merely because it restates that object.

Promotion requires either:

1. at least two independently sourced verified instances plus mandatory adversarial negatives; or
2. an independently specified construction schema/theorem followed by held-out positive/negative instance tests.

A claimed cross-domain class requires independently sourced domains.

Promotion additionally requires non-vacuity/selectivity, label-blind discovery/recall controls, independent witness verification, boundary/factorization audits, and no simpler qualified class/factorization explaining the same structure without loss.

---

# 29. Witnesses and independent verification

A candidate positive/partial witness records at least:

```text
object A/revision/factorization/extraction
object B/revision/factorization/extraction
target layer
view policy
N0/N1 policy
D/E authorities + revisions
relation kind
node/object correspondence
edge/incidence mapping
binding mapping
positive and negative constraint mapping
boundary/port mapping
semantic-label mapping if any
structured parameter mapping if any
rigid identities/literals held fixed
constraints/invariants checked
common core(s)
residual Delta_A
residual Delta_B
boundary-cut/gluing data
collapsed/projected distinctions
factorization/extraction-set completeness
search budget
optimality status
```

A fresh verifier checks the witness against frozen inputs/policy without expected class/domain names.

Only independently verified witnesses become qualification evidence.

---

# 30. Common cores and residuals

A partial relation records enough structure to reconstruct the compared factorizations:

```text
A = glue(C, Delta_A, cut_A)
B = glue(C, Delta_B, cut_B)
```

Residuals include:

- unmatched nodes/edges/occurrences;
- boundary-cut relations;
- unmatched ports;
- negative constraints/NACs/disequalities;
- guards/side conditions;
- projected/collapsed distinctions;
- discarded extraction context where relevant.

A smaller exact core is preferred to a larger false match.

A common-core result states whether the map is strong/induced or weak.

## 30.1 Maximum claims

A maximum common core requires:

- declared objective/partial order;
- optimality certificate or complete-search justification.

Otherwise report maximal/non-dominated cores found plus search bounds.

## 30.2 Multiple mappings

Distinct valid witnesses are preserved by default.

They may be quotient-collapsed only under an independently verified automorphism/equivalence proving irrelevance to the requested downstream operation.

---

# 31. Composition and joint realizability

Class/object composition requires:

```text
component verified witnesses
overlap/gluing map
shared ports/identities
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is insufficient.

Correlation, support, timing, ownership, provenance, trust, and dependency dimensions remain represented whenever load-bearing.

---

# 32. Candidate retrieval / corpus discovery

Pairwise verification is insufficient if the correct pairs never reach it.

Qualification distinguishes:

```text
candidate generation/retrieval
pairwise structural search
witness verification
```

Labels may accelerate candidate retrieval after qualification, but a general cross-domain discovery system must retain a label-blind structural path or an independently demonstrated hidden-label recall guarantee.

## 32.1 Structural fingerprint/index declaration

Every retrieval index declares:

```text
index/model revision
target layer
N0/N1 policy
D/E policy
factorization/extraction depth
included/excluded roles
boundary treatment
parameter treatment
namespace handling
collision behavior
false-positive risk
false-negative/pruning risk
training-data/supervision provenance if learned
known overlap with qualification corpora
```

A fingerprint match is never a structural witness.

A fingerprint mismatch may prune only when the fingerprint is proved necessary for the requested relation under the frozen policy; otherwise any resulting coverage limitation remains explicit.

## 32.2 Corpus-scale coverage

A discovery run records:

```text
corpus revision
eligible extraction universe/rules
extraction-enumeration completeness
objects/components eligible
objects/components indexed
factorizations considered
candidate pairs generated
pairs structurally searched
pairs independently verified
known-positive recall controls
known-negative precision controls
resource/time limits
unindexed/unsearched regions
```

Absence of a reported relation outside complete coverage is `UNKNOWN`.

## 32.3 Discovery result states

Keep distinct:

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

They do not collapse into “no match.”

---

# 33. Label-blind / anti-cheating qualification

Before pairwise discovery:

1. independently freeze each source factorization/extraction/role/port set;
2. remove from discovery input expected mappings, registry hypotheses, human analogy text, scorer mappings, expected cores/residuals;
3. anonymize/permute non-evidential labels while preserving incidence;
4. randomize local identity/reference/presentation choices allowed by N0/N1.

For learned retrieval indexes, training/supervision contamination is separately audited; hidden labels at inference do not erase training leakage.

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
- certified-negative versus resource-limited no-witness control;
- novel synthetic structures;
- modified familiar structures designed to defeat pretrained prototype completion;
- legacy/current bridge pair when historical artifacts participate;
- vacuous-parameter class negative;
- retrieval false-negative/coverage control.

No class/discovery system is qualified from positive examples alone.

---

# 34. Held-out generalization

A comparison/discovery policy family can overfit the benchmark set even if every pair-specific policy is frozen.

Qualification distinguishes development cases from sealed final holdouts and may use freshly generated synthetic/adversarial cases.

A holdout repeatedly inspected after failures becomes development evidence and is replaced for final generalization scoring.

---

# 35. Search completeness and honesty

Every result records:

```text
search method
resource bound
factorization/extraction completeness
mapping-search completeness
optimality status
witness/certificate verification status
```

Heuristics may retrieve/prioritize candidates but cannot certify the final relation.

Approximate similarity is not a structural relation result.

Unknown remains unknown.

---

# 36. Circular evidence prohibition

The target class/mapping hypothesis cannot justify the decomposition/extraction later cited as evidence for that same claim.

Qualification dependencies are acyclic with respect to the claim being established.

Allowed:

- already-qualified generic lower libraries;
- source axioms/model leaves;
- independently qualified schema definitions.

Forbidden as authority for the target claim:

- target registry mapping;
- target class-membership hypothesis;
- expected analogy;
- decomposition/extraction rule whose validity depends on target membership.

---

# 37. Proof systems and meta-theory

AxiomeSH does not select one global proof calculus.

Surface implication/negation/etc. do not grant classicality, explosion, modal rules, temporal induction, deontic distribution, frame rules, higher-order extensionality, choice, or other profile laws.

Proof-capable profiles represent premises, axioms, local inference rules, proof objects/dependencies, and required semantic foundations.

A cached `derivable` relation is acceptable only when tied to validated proof objects or explicit primitive proof authority.

Representability is not proof.

---

# 38. Qualification gates

Current gates are uniquely named:

```text
E0   source fidelity
E1   native statement expressibility
E1P  primitive semantic decomposition
E1A  alias/factorization expansion
E1C  structural-class classification after witness
E1E  class/instance expansion
E1N  N0/N1 versus D/E audit
E1F  alternative-factorization audit
E1W  witnessed comparison audit
E1B  boundary/port/joint-realizability audit
E1L  label-blind/anti-cheating audit
E1M  multiple-mapping/maximal-core audit
E1Q  comparison-policy freeze audit
E1D  decomposition exactness/recursion/residual audit
E1S  namespace/bundle/manifest audit
E1H  reference/binder hygiene + occurrence/rewrite semantics audit
E1V  independent witness/negative/optimality verification
E1T  target-layer/conclusion-scope audit
E1R  retrieval/discovery coverage audit
E1U  class non-vacuity/selectivity audit
E1X  extraction/context audit
E1G  held-out discovery-policy generalization audit
E2   isolated cold reconstruction
E3   proof-profile completeness
E4   proof execution
E5   independent proof review
```

A downstream claim may rely only on gates relevant to the semantic relation it uses.

---

# 39. Historical compatibility

Frozen Draft 0.1–0.11 artifacts retain their recorded historical semantics.

They do not silently become Draft 0.12-qualified structures.

To participate in current qualification, a historical artifact requires either:

- current-semantics rerendering; or
- an exact verified legacy-to-current bridge recording changed conventions.

Potential changed conventions include:

- formula-scope conjunction;
- set-like versus occurrence-preserving scope membership;
- set-like versus occurrence-preserving rewrite addition/removal;
- existential/freshness overloading;
- direct-child rule activation;
- reference visibility/order/hygiene;
- signature/document context;
- namespace qualification;
- candidate surface versus primitive status;
- optional `@@` canonical reduction;
- retrieval/discovery evidence partitions.

Historical reproducibility is not current structural qualification.

Existing Experiment 003 `.axh` foundations/proof candidates authored under earlier conventions are historical author-side candidates until rerendered or bridged.

---

# 40. Core-admission rule

Before permanently promoting a new syntax/operation to the irreducible substrate:

```text
candidate distinction
-> attempt faithful construction from existing primitives
-> test exactness / round trip / residual burden
-> test canonical identity and ambiguity
-> test isomorphism-discovery behavior
-> test qualified-agent reconstruction/reasoning cost
-> retain stable label/surface if useful
-> promote to core only if lower construction fails or is materially worse
```

Convenience, familiarity, or repeated use alone does not prove irreducibility.

---

# 41. Falsifiers

Revise/reject this candidate if controlled evidence shows that protections such as:

- occurrence-preserving membership/rewrite;
- independent factorization/extraction freeze;
- policy freezing;
- stable-label namespacing;
- exact D round trips/residual audit;
- recursive fixed-point contracts;
- explicit quantifier domains;
- schema/dependency versioning;
- independent witness verification;
- negative-certificate distinction;
- factorization/retrieval coverage reporting;
- embedding-strength distinction;
- target-layer distinction;
- circular-evidence prohibition;
- multiple-witness preservation;
- non-vacuity/selectivity controls;
- held-out discovery testing

add material lifecycle/reasoning cost without preventing real false/missed correspondences.

A simpler exact mechanism is preferred whenever it preserves the same semantic fidelity and isomorphism/discovery safety.

---

# 42. Constitutional discipline

```text
preserve source semantics
-> independently decompose/extract as far as justified
-> preserve alternative exact factorizations
-> freeze roles/ports/policy before pairing
-> normalize representation only
-> retrieve candidates without label dependence as the sole path
-> compare under explicit target layer + view + transformation authority
-> state relation kind independently
-> emit independently verifiable mapping/core/residual/gluing witness(es)
-> preserve negative constraints, multiplicity, and materially distinct mappings
-> classify or induce structural classes only from verified witnessed structure
-> validate classes on held-out/adversarial cases
-> retain useful labels afterward
```

The target is not a large ontology of familiar names.

The target is a small information-preserving substrate plus reusable, versioned structural classes whose labels help agents recognize constructions **after the underlying shape has been exposed**.