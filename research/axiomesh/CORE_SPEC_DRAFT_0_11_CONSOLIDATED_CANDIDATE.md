# AxiomeSH Core Specification — Draft 0.11 Consolidated Candidate

**Status:** experimental consolidated candidate after line-by-line review through Draft 0.10  
**Historical lineage:** Draft 0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7 → 0.8 → 0.9 → 0.10  
**Authority:** self-contained authority for new Draft 0.11 artifacts on `experiment/axiomesh-native-reconstruction`  
**Historical rule:** frozen older artifacts retain their recorded historical decode semantics  
**Promotion:** experimental-branch authority only until independently qualified

Draft 0.11 is consolidated because the amendment chain itself became a reconstruction risk. A new Draft 0.11 decoder needs this document, the native artifact/bundle, and any explicitly included theory/profile dependencies. It does not need to reconstruct current semantics by replaying Drafts 0.1–0.10.

Historical drafts remain evidence explaining why each current rule exists.

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

# 2. Isomorphism-safety constitution

AxiomeSH succeeds only if it can expose common structure across independently named domains without either:

- missing real correspondence because labels, IDs, syntax, serialization, namespace, factorization, or source convention differ; or
- manufacturing false correspondence by deleting a load-bearing distinction.

The governing discovery sequence is:

```text
source semantics
-> independent qualified factorization set for each source
-> representation-only normalization
-> frozen comparison policy
-> label-blind structural search
-> candidate witness/certificate
-> independent witness verification
-> structural relation + common core/residuals
-> structural-class recognition
-> retained useful labels
```

Labels are construction/retrieval handles. They are downstream of structural evidence.

Expected analogy, desired class, class registry, or preferred factorization MUST NOT choose the decomposition or mapping later presented as evidence.

---

# 3. Semantic revision and bundle authority

The same surface forms have had different historical meanings. Therefore every new canonical bundle MUST identify the applicable semantic revision/profile either:

- in an explicit native bundle manifest; or
- in an enclosing native corpus/bundle contract supplied as part of the artifact authority.

Revision/profile identity is required for unambiguous decoding but is non-evidential for cross-domain structural matching unless the requested comparison explicitly includes revision metadata.

Frozen historical artifacts retain their experiment-recorded revision.

---

# 4. Current representation layers

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

The following remain valid Draft 0.11 surfaces without being assumed irreducible:

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

Bare integers are opaque identities whose spelling is non-semantic.

They may alpha-map where the comparison policy permits.

## 6.2 Exact literals

`#n` and reduced `#p/q` are rigid exact values by default.

For rational literals:

- denominator MUST be nonzero;
- numerator/denominator are reduced to lowest terms;
- sign is canonicalized to the numerator;
- floating-point spellings are not canonical exact literals.

Literal token-class irreducibility remains open.

A class schema may expose a literal position as a parameter slot. That is parameterization, not literal renaming.

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

For new Draft 0.11 artifacts, direct scope membership is unordered but occurrence-preserving.

```text
[X X]
```

contains two occurrences unless an explicit qualified quotient/profile makes the relevant membership idempotent/set-like.

This is the information-preserving default.

Frozen historical artifacts may retain earlier set-like semantics.

Identical nested scopes are likewise distinct member occurrences unless an explicit identity/quotient equates them.

## 8.2 Scope is not implicit conjunction

Raw `[]` does not mean conjunction because an external reader calls it “formula context.”

Co-satisfaction/conjunction must be an explicit constructor/class/profile relation.

## 8.3 Carrier role must be recoverable

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

Reference dependencies must be acyclic.

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

Repeated occurrence of the **same** pattern/bound variable requires the same binding within its owner.

Different variables are allowed to bind the same structural object unless an explicit distinctness/disequality constraint requires otherwise.

Disjoint sibling binders may reuse the same number.

Nested rebinding of a still-visible same-number binder remains invalid in this candidate.

Capture-avoiding alpha-renaming preserves bound structure.

Rewrite-local pattern variables are owned by the represented rewrite/profile.

Declarative quantifier/abstraction surfaces own their lexical bodies.

A variable appearing only in a negative application condition MUST already be bound by positive pattern structure or be explicitly scoped/quantified by the matching profile. A NAC does not silently introduce a new existential/universal variable meaning.

Any ownership not reconstructable from native structure/profile is invalid.

---

# 12. Rewrite objects, activation, and occurrences

`[L] > [R]` represents a first-class rewrite object.

Rewrite objects may themselves be referenced, compared, nested, related, or transformed as data. Their existence does not alone imply activation.

## 12.1 Activation is profile-owned

The `>` token alone does not invisibly decide whether a represented rule is active or quoted/inert.

An execution profile/activation construction determines active rules.

The historical direct-child-active behavior remains a supported legacy profile when explicitly selected.

Serialized rule ordering MUST NOT imply priority unless a selected execution profile explicitly represents priority/order.

## 12.2 Boundary-respecting matching

A rule matches only within its declared application boundary.

It does not implicitly flatten or cross nested structural scopes. Participation of nested structure must be structurally addressed by the rule/profile.

## 12.3 Occurrence-preserving application

New Draft 0.11 rewrite application operates on occurrences:

1. select an occurrence-preserving LHS embedding within the declared application boundary;
2. bind pattern variables;
3. validate negative-match conditions against that boundary;
4. preserve explicitly retained matched occurrences;
5. remove matched occurrences not retained;
6. add instantiated RHS occurrences;
7. preserve unmatched context;
8. apply any explicit fresh-allocation construction/profile rule.

Duplicate RHS occurrences are not silently collapsed.

A set/idempotent rewrite profile may quotient duplicate occurrences only when that rule is explicit.

## 12.4 RHS-only variables

An ordinary variable appearing only on the RHS is invalid unless its value is supplied by an explicit represented construction such as fresh allocation or another profile-defined generator.

No implicit RHS-only freshness exists in Draft 0.11.

## 12.5 Fresh allocation

New Draft 0.11 artifacts do not overload declarative `+?n` as operational freshness solely by RHS position.

Fresh allocation is an explicit native execution-profile construction/constraint.

## 12.6 Negative match

`!X` is structural absence within a declared match/application boundary.

It is not declarative falsity.

Absence-sensitive semantics preserve the relevant boundary and completeness/open-vs-closed-world contract.

## 12.7 Multiway semantics

Absent an explicitly represented execution strategy/priority, every valid rule/match application is a legitimate successor.

Search order, pruning, scheduling, or serialization order is non-semantic unless the selected execution profile explicitly makes it semantic.

---

# 13. Declarative surfaces

## 13.1 Implication

`A => B` is a declarative implication-constructor surface. It does not execute rewrite and does not select a proof calculus.

## 13.2 Equality

`A == B` is an object-theory equality surface, not structural identity.

P0/V0-style structural comparison does not collapse two nodes because an object-theory formula asserts equality.

Any quotient/collapse using represented equality is a qualified semantic/projection transformation.

## 13.3 Negation

`~A` is a declarative negation surface whose laws are profile-owned.

It is distinct from `!A` negative structural match.

## 13.4 Choice

`{A B ...}` is an unordered alternative surface.

Alternative member order is non-semantic. Alternative occurrence multiplicity is preserved by default unless the selected alternative/profile semantics explicitly establishes idempotence.

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

# 15. Signatures, manifests, and partitioning

## 15.1 Layer-relative signatures

Distinguish:

```text
Sig_surface(T)
Deps(T)
Sig_D(T)
```

where `Deps(T)` is the native dependency graph/closure required to interpret the selected body and `Sig_D` belongs to a selected factorization.

Surface-signature equality is not structural-isomorphism evidence.

Recursive dependency SCCs are permitted when their fixed-point authority is explicit.

## 15.2 `^0`

The historical `^0` signature marker remains a supported serialization convention, not a proven primitive.

No comparison depends on invisible external knowledge that a file “is a signature document.”

## 15.3 Multi-document partitioning

Splitting/concatenating a bundle is N0-transparent only with a partition witness preserving:

- semantic-symbol namespace;
- local structural/reference namespaces;
- binder ownership/visibility;
- operational activation boundaries;
- dependency/import relationships;
- ports/boundaries;
- any semantic ordering constraints.

Otherwise partitioned and concatenated forms require an explicit bridge.

---

# 16. Source fidelity and human gloss

E0 source fidelity is a load-bearing precursor to all later decomposition/comparison work.

A source-to-native rendering must preserve every distinction later needed for proof, composition, or comparison. Where an ingest transformation is nontrivial, its mapping/audit is retained as evidence rather than assumed from the source label.

Human labels may aid review/retrieval but may not supply load-bearing structure absent from native input.

Cold reconstruction distinguishes:

```text
native formal recovery
human gloss mapping
semantic inference
```

---

# 17. Transformation authority

Draft 0.11 keeps N0/N1/D/E separate.

## 17.1 N0 — serialization-transparent normalization

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

## 17.2 N1 — local representation normalization

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

## 17.3 D — qualified factorization/decomposition

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

Lossy edges never masquerade as exact factorizations.

## 17.4 E — theory/profile equivalence

Every E edge records:

```text
profile/theory revision
theorem/rule/evidence
assumptions/context
side conditions
direction
preservation scope
```

E is not silently used in structural discovery.

---

# 18. Recursive definitions / fixed points

Recursive native definitions are valid only with explicit recursion authority, including where relevant:

```text
base cases
recursive/step constructor
guardedness/productivity
least/greatest/other fixed-point interpretation
uniqueness/admissibility authority
```

Circular aliases without such authority are not semantic completion.

---

# 19. Factorization graph and independent freeze

Decomposition is a relation, not necessarily a function.

A source may have multiple faithful factorizations linked by:

- exact definition;
- inverse/compaction;
- E-equivalence;
- refinement/specialization;
- projection/quotient;
- unresolved alternative.

Unique canonical decomposition requires convergence/uniqueness evidence.

## 19.1 Independent decomposition freeze

For discovery qualification:

1. decompose A without B/expected class mapping;
2. freeze A's factorization set, roles, ports, dependency revisions;
3. independently decompose/freeze B;
4. only then expose A and B to pairwise structural search.

Already-qualified generic lower libraries may be used. Target registry membership/expected counterpart may not justify the decomposition later cited as evidence.

## 19.2 Factorization completeness

Every result records which factorization subset was searched:

```text
complete under declared D system
all currently qualified nodes
bounded-depth subset
bounded-cost subset
explicit selected subset
```

Failure over an incomplete factorization subset is not a global negative.

---

# 20. Comparison policy: three orthogonal axes

Every run freezes three independent axes before discovery.

## 20.1 View policy V

```text
V0  closed structural view
VB  boundary/port-preserving view
VS  signature-mappable structural view
VC  class-schema/parameterized view
```

A view declares included/excluded/rigid/mappable/parameterized dimensions.

## 20.2 Transformation authority A

```text
N0-set
N1-set
D-set
E-set
```

Allowed transformations/dependencies are frozen before expected mapping unblinding.

## 20.3 Relation kind R

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

View and relation kind are not one axis.

Example:

```text
boundary-preserving isomorphism = V=VB, R=ISOMORPHISM
mapped-signature isomorphism    = V=VS, R=ISOMORPHISM
```

No total ranking among view policies is implied.

---

# 21. Policy freeze and role provenance

Before blind qualification freeze:

```text
target layer
view policy
role-assignment rules
N0/N1 rules
allowed D factorizations
allowed E equivalences
factorization search bounds
relation kinds sought
common-core optimization criterion if any
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

Ports and mappability cannot be added post-hoc merely to improve a match.

---

# 22. View semantics

## 22.1 V0

Local alpha identities may bijectively rename. Stable labels/literals are rigid.

## 22.2 VB

V0 plus witnessed mapping of independently frozen ports preserving roles/constraints.

## 22.3 VS

Selected stable semantic identities may map explicitly.

The map records injectivity/surjectivity/bijectivity.

An `ISOMORPHISM` under VS requires the relevant mapped stable-label correspondence to be bijective.

## 22.4 VC

A specific immutable/versioned class schema supplies parameter slots, ports, rigid/mappable roles, and allowed abstractions.

Non-evidential labels are anonymized/mapped while incidence remains intact.

A label/relation node is not deleted merely because humans regard its name as metadata if deleting it would remove load-bearing relation structure.

Literal positions become parameters only if predeclared by the frozen schema revision.

---

# 23. Target layer

Every result identifies one compared layer:

```text
serialized/native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A relation at one layer does not imply another without a qualified D/E bridge.

Mapping opaque leaves into common slots establishes parametric structural correspondence, not source-theory semantic equivalence unless additional E evidence exists.

---

# 24. Relation semantics

## 24.1 Isomorphism

Bijective preservation **and reflection** of all compared load-bearing structure under the frozen view.

## 24.2 Strong embedding

Injective preservation and reflection among mapped objects. Extra target relations among mapped objects violate strong embedding unless outside the compared signature/view.

## 24.3 Weak embedding

Injective preservation of source structure while explicit target residual relations may remain.

## 24.4 Homomorphism

May identify source objects; collapsed distinctions are reported.

## 24.5 Simulation/bisimulation

May be relational/many-to-many according to explicit profile semantics. They are not isomorphism without separate bijective structural proof.

## 24.6 Quotient/projection

Many-to-one abstraction with explicit information loss.

## 24.7 Specialization

A class/schema relation plus explicit additional constraints/residual; direction is stated.

## 24.8 Certified non-isomorphic

Requires complete search for the declared finite problem or a verified separating invariant/certificate.

Failure to find a witness under bounded/incomplete search is `NO_WITNESS_FOUND`, `UNKNOWN`, or `RESOURCE_LIMIT`.

---

# 25. Structural classes and schema versions

A structural class is a reusable **immutable/versioned schema graph plus constraints**.

A qualified schema includes, where applicable:

```text
schema definition identity/revision
labels
internal schema graph
structured parameter slots
ports/boundaries
rigid/mappable roles
positive and negative constraints
slot/port mapping modes
invariants
admissible relation kinds
required D/E dependencies + revisions
specialization conditions
composition/gluing rules
residual policy
known instances
expansion/erasure rules
alternative qualified factorizations
falsifiers
qualification evidence
```

Material schema changes create a new revision/identity or explicit successor relation.

Old witnesses do not silently transfer.

## 25.1 Structured parameters

Parameters may be identity-, literal-, relation-, predicate/formula-, rule/profile-, substructure-, or port-valued.

A witness maps parameter structure, not merely the label naming it.

## 25.2 No post-hoc parameterization

For an existing class run, schema graph, parameters, ports, mapping rules, constraints, and residual policy are frozen before instance scoring.

Changing them creates a new candidate revision.

A new parameter is justified by independent instances or an independently specified construction law and held-out/adversarial validation.

## 25.3 Class-family claims are witnessed

Class-to-class specialization, composition, factorization, embedding, quotient, or equivalence uses the same witnessed machinery as domain instances.

A class-family diagram is hypothesis metadata without those witnesses.

---

# 26. Class promotion

A candidate class may be recorded after one exact motivating decomposition but is not promoted as reusable merely because it restates that object.

Promotion requires either:

1. at least two independently sourced verified instances plus mandatory adversarial negatives; or
2. an independently specified construction schema/theorem followed by held-out positive/negative instance tests.

A claimed cross-domain class requires independently sourced domains.

---

# 27. Witnesses and independent verification

A candidate positive/partial witness records at least:

```text
object A/revision/factorization
object B/revision/factorization
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
factorization-set completeness
search budget
optimality status
```

A fresh verifier checks the witness against frozen inputs/policy without expected class/domain names.

Only independently verified witnesses become qualification evidence.

---

# 28. Common cores and residuals

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
- projected/collapsed distinctions.

A smaller exact core is preferred to a larger false match.

## 28.1 Maximum claims

A maximum common core requires:

- declared objective/partial order;
- optimality certificate or complete-search justification.

Otherwise report maximal/non-dominated cores found plus search bounds.

## 28.2 Multiple mappings

Distinct valid witnesses are preserved by default.

They may be quotient-collapsed only under an independently verified automorphism/equivalence proving irrelevance to the requested downstream operation.

---

# 29. Composition and joint realizability

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

# 30. Projection exclusions scope the conclusion

A view may intentionally exclude provenance/retrieval or another dimension.

The result then makes no claim about the excluded dimension.

Every view records:

```text
included dimensions
excluded dimensions
rigid dimensions
mappable dimensions
parameterized dimensions
```

If an excluded dimension matters to the requested task, it must be included or preserved as residual/separate comparison dimension.

---

# 31. Label-blind and anti-cheating qualification

Before pairwise discovery:

1. independently freeze each source factorization/role/port set;
2. remove from discovery input expected mappings, class registry hypotheses, human analogy text, scorer mappings, expected cores/residuals;
3. anonymize/permute non-evidential labels while preserving incidence;
4. randomize local identity/reference/presentation choices allowed by N0/N1.

Mandatory controls for reusable classes/comparison methods include:

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
- legacy/current bridge pair when historical artifacts participate.

No class is qualified from positive examples alone.

---

# 32. Search completeness and honesty

Every result records:

```text
search method
resource bound
factorization-set completeness
mapping-search completeness
optimality status
witness/certificate verification status
```

Heuristics may retrieve/prioritize candidates but cannot certify the final relation.

Approximate similarity is not a structural relation result.

Unknown remains unknown.

---

# 33. Circular evidence prohibition

The target class/mapping hypothesis cannot justify the decomposition later cited as evidence for that same claim.

Qualification dependencies are acyclic with respect to the claim being established.

Allowed:

- already-qualified generic lower libraries;
- source axioms/model leaves;
- independently qualified schema definitions.

Forbidden as authority for the target claim:

- target registry mapping;
- target class-membership hypothesis;
- expected analogy;
- decomposition rule whose validity depends on the target membership.

---

# 34. Proof systems and meta-theory

AxiomeSH does not select one global proof calculus.

Surface implication/negation/etc. do not grant classicality, explosion, modal rules, temporal induction, deontic distribution, frame rules, higher-order extensionality, choice, or other profile laws.

Proof-capable profiles represent premises, axioms, local inference rules, proof objects/dependencies, and required semantic foundations.

A cached `derivable` relation is acceptable only when tied to validated proof objects or explicit primitive proof authority.

Representability is not proof.

---

# 35. Qualification gates

Current gates:

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
E1D  decomposition exactness/recursion audit
E1S  namespace/bundle audit
E1H  reference/binder hygiene + occurrence-multiplicity audit
E1V  independent witness/negative/optimality verification
E1T  target-layer/conclusion-scope audit
E2   isolated cold reconstruction
E3   proof-profile completeness
E4   proof execution
E5   independent proof review
```

A downstream claim may rely only on gates relevant to the semantic relation it uses.

---

# 36. Legacy compatibility

Frozen Draft 0.1–0.10 artifacts retain their recorded historical semantics.

They do not silently become Draft 0.11-qualified structures.

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
- optional `@@` canonical reduction.

Historical reproducibility is not current structural qualification.

---

# 37. Falsifiers

Revise/reject this candidate if controlled evidence shows that protections such as:

- occurrence-preserving membership/rewrite;
- independent factorization freeze;
- policy freezing;
- symbol namespacing;
- exact D round trips;
- recursive fixed-point contracts;
- explicit quantifier domains;
- schema/dependency versioning;
- independent witness verification;
- negative-certificate distinction;
- factorization completeness reporting;
- embedding-strength distinction;
- target-layer distinction;
- circular-evidence prohibition;
- multiple-witness preservation

add material cost without preventing real false/missed correspondences.

A simpler exact mechanism is preferred whenever it preserves the same semantic fidelity and isomorphism safety.

---

# 38. Constitutional discipline

```text
preserve source semantics
-> independently decompose as far as justified
-> preserve alternative exact factorizations
-> freeze roles/ports/policy before pairing
-> normalize representation only
-> compare under explicit view + transformation authority
-> state relation kind independently
-> emit verifiable mapping/core/residual/gluing witness(es)
-> preserve negative constraints, multiplicity, and materially distinct mappings
-> classify structural classes only from verified witnessed structure
-> retain useful labels afterward
```

The target is not a large ontology of familiar names.

The target is a small information-preserving substrate plus reusable, versioned structural classes whose labels help agents recognize constructions **after the underlying shape has been exposed**.
