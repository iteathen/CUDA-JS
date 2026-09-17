# AxiomeSH Core Specification — Draft 0.10 Consolidated Candidate

**Status:** experimental consolidated candidate after line-by-line review through Draft 0.9  
**Historical lineage:** Draft 0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 0.6 → 0.7 → 0.8 → 0.9  
**Authority:** self-contained authority for **new Draft 0.10 artifacts on the experimental branch**  
**Historical rule:** frozen older artifacts retain the decode semantics of the revision under which they were produced  
**Promotion:** not accepted parent-branch authority until independently qualified

Draft 0.10 is deliberately consolidated rather than another narrow amendment.

The amendment chain had accumulated enough superseded statements that requiring a fresh agent to reconstruct current semantics from nine documents became a correctness risk.

For new Draft 0.10 artifacts, this document is the semantic authority. Earlier drafts are historical evidence and experiment inputs, not required normative dependencies.

---

# 1. Purpose and constitutional objective

AxiomeSH is an agent-native structural knowledge representation intended to maximize:

```text
durable correct synthesis / total lifecycle cost
```

subject to non-negotiable preservation of:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- composition constraints;
- required provenance;
- recoverability.

The primary hypothesis remains:

```text
knowledge = scoped relational structure + lawful structural transformation
```

The native path remains:

```text
AxiomeSH -> agent -> AxiomeSH
```

No mandatory English, JSON, theorem-language, database, tokenizer-specific, or model-specific translation layer is part of native semantics.

The graph/scoped-hypergraph rewrite substrate remains a research hypothesis, not an article of faith.

---

# 2. Isomorphism-safety constitution

AxiomeSH's central research value depends on exposing common structure across independently named domains without either:

- missing a real correspondence because labels, IDs, syntax, serialization, or factorization differ; or
- manufacturing a false correspondence by erasing a load-bearing distinction.

The governing order is:

```text
source semantics
-> independently constructed qualified decomposition/factorization set
-> representation-only normalization
-> label-independent structural comparison under explicit projection
-> independently verifiable mapping/core/residual witness(es)
-> structural relation result
-> structural-class recognition
-> retained useful labels
```

A source label, class label, expected analogy, conventional notation, or desired result MUST NOT determine the decomposition or structural result it is later used to name.

Useful labels are retained because they improve retrieval and construction. They are evidentially downstream of structure.

---

# 3. Current representation layers

Draft 0.10 distinguishes four kinds of mechanism.

## 3.1 Candidate irreducible structural substrate

The strongest current candidates are:

- opaque structural identity;
- ordered incidence / hyperedge structure;
- explicit structural scope/boundary;
- pattern/binding ownership needed for structural matching;
- structural rewrite;
- negative structural match, still subject to elimination testing;
- transparent local references as non-semantic compression.

Even these remain experimentally falsifiable.

## 3.2 Primitive/model leaves

A represented theory may supply model leaves such as:

- object/world/state identities;
- atomic valuation/incidence facts;
- one-step transition/accessibility/reduction edges;
- heap address/value incidence;
- source algebraic operations/relations with explicit axioms;
- observational facts;
- stipulated source axioms.

A source-provided name does not by itself prove primitive status.

Every leaf SHOULD record one of:

```text
observational/model input
stipulated source axiom/relation
frozen implementation/environment fact
currently undecomposed candidate primitive
proven irreducible representation primitive
```

A load-bearing environment fact must be imported/frozen into the qualification bundle. Hidden live environment state is not semantic authority.

## 3.3 Derived native constructions / structural classes

A compound semantic object whose meaning is constructible from lower structure must expose that construction.

Examples include:

- knowledge from accessibility + satisfaction;
- common knowledge from group-relation closure + satisfaction;
- public announcement from predicate-selected model restriction;
- temporal operators from trace/position structure;
- CTL path/state operators from branching transitions and generated paths;
- separating conjunction from disjoint heap partition;
- Hoare validity from transition semantics + pre/post satisfaction;
- closure from explicit path/reduction structure;
- proof/derivability from proof objects and admissible local rules;
- functional application from a represented function model;
- finite folds from indexed structure.

A derived construction may receive a stable class/domain label and compact surface.

## 3.4 Candidate compact surfaces / serialization shorthands

The following remain available in Draft 0.10 but are **not thereby proven irreducible**:

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

Each may ultimately be classified as:

```text
irreducible representation primitive
canonical surface for lower native construction
serialization/value shorthand
profile-owned derived constructor
qualified structural-class alias
rejected/redundant
```

---

# 4. Minimal structural syntax

Draft 0.10 retains the following raw forms.

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

This grammar states available surface forms, not final primitive classification.

Whitespace is non-semantic except as token separation.

Mixed infix forms MUST be nested/parenthesized sufficiently to admit only one parse.

---

# 5. Identity classes

## 5.1 Opaque structural identities

A bare integer is an opaque structural identity.

```text
0
1
42
```

Its spelling is not semantic. It may alpha-rename when the selected structural comparison permits it.

## 5.2 Exact literals

```text
#0
#28
#-4
#1493/1000
```

A literal is an exact value surface and is rigid by default.

A rational literal uses reduced form.

Literal token-class irreducibility remains unproven; a structural value representation may later subsume it.

A class schema may expose a literal position as a parameter slot. That is parameterization, not literal alpha-renaming.

## 5.3 Stable semantic/class/domain labels

```text
^1
^37
^9101
```

A `^n` label is a stable identity inside its declared theory/bundle.

It is rigid by default for source fidelity.

It may be mapped only under an explicit comparison projection/witness.

A label may identify:

- a primitive model relation/constant;
- a structural class;
- a domain instance;
- a derived constructor;
- a profile/rule;
- a retrieval/provenance handle.

The label is not compound semantics by itself.

---

# 6. Ordered incidence

```text
(A B C)
```

is one ordered incidence object.

All positions are load-bearing unless a represented definition/schema states otherwise.

The first position receives no universal relation/function meaning merely from being first.

A label-headed edge may be used as a compact application/relation surface, but mathematical predicate/function semantics still belong to the represented theory/class.

Arbitrary tuple-position permutation is not part of structural isomorphism.

If independent source conventions encode equivalent roles in different positions, a qualified decomposition or schema-port mapping must expose that role correspondence explicitly.

---

# 7. Scopes and occurrence semantics

```text
[
  X
  Y
]
```

creates an unordered structural scope/boundary/container.

## 7.1 Occurrence-preserving membership

For **new Draft 0.10 artifacts**, scope membership is unordered but occurrence-preserving.

Therefore:

```text
[X X]
```

contains two member occurrences unless an explicit quotient/profile states that the relevant membership is idempotent/set-like.

This is an information-preserving default.

Historical Draft 0.2–0.9 artifacts may retain their historical set-like scope semantics where applicable.

## 7.2 Scope is not implicit conjunction

Raw `[]` does not acquire conjunction semantics merely because an external consumer calls its context a formula.

If co-satisfaction/conjunction is intended, that role must be represented explicitly by a qualified constructor/class/profile.

## 7.3 Scope roles

A scope may participate in grouping, state, rewrite boundary, recursive object, or another role, but any load-bearing role not derivable from represented structure/profile must be explicit.

Two syntactically identical scopes are not assumed semantically interchangeable if their represented roles/ports/constraints differ.

---

# 8. Boundaries and ports

Crossing identity provides a natural boundary cue, but it is not a complete component interface specification.

For compositional/class comparison, an interface may contain:

- exposed identities;
- port roles;
- direction/variance/mapping constraints;
- cardinality constraints;
- ownership/support/timing constraints;
- required gluing relations.

Port declarations used for qualification must be source/component-local and frozen before pairwise comparison.

A pairwise comparison maps already-declared/derived ports; it does not invent ports merely to make two components compatible.

---

# 9. References

References are serialization/compression devices only.

```text
@0=TERM
```

binds a local reference whose number has no semantic identity.

## 9.1 Order-independent visibility

Within a serialization scope, reference dependency does not depend on sibling textual order.

A binding may be used throughout its containing serialization scope and descendants unless a stricter explicit reference scope is represented.

Reference bindings visible in one ancestry must be unique; shadowing remains invalid.

The dependency graph must be acyclic. Self/cyclic reference dependencies are invalid.

## 9.2 Hygienic expansion

Reference expansion MUST preserve lexical binding ownership.

A referenced term is either:

- closed relative to its binding environment; or
- expanded with its lexical environment/capture-avoidance preserved explicitly.

Expansion must not capture a formerly free variable or detach a formerly bound occurrence.

## 9.3 Occurrence semantics

Using one reference at multiple sites is serialization sharing only.

Expansion does not assert identity of the resulting member occurrences except for identities explicitly represented inside the referenced structure.

After N0 reference resolution, reference-binding syntax is absent from semantic comparison structure.

---

# 10. Pattern variables and lexical binding

Variable numbers are local handles, not corpus-global identities.

Bound-variable alpha-renaming preserves structure when capture is avoided.

Disjoint sibling binders may reuse the same variable number.

Nested rebinding of a still-visible same-number binder remains invalid in this candidate to simplify exact ownership reconstruction.

Rewrite-local pattern variables are owned by the rewrite pattern/profile.

Declarative quantifier/abstraction surfaces own their lexical bodies.

Any compact syntax whose ownership cannot be reconstructed unambiguously fails qualification.

---

# 11. Rewrite objects and execution profiles

```text
[L] > [R]
```

represents an operational rewrite object/pattern.

## 11.1 Rewrite versus activation

A rewrite object is first-class structure.

Whether a rewrite is active is controlled by a represented execution profile/activation construction.

The historical **direct-child-active** rule may be used as an explicit legacy execution profile, but activation is not an invisible property of the `>` token alone in new Draft 0.10 canonical reasoning bundles.

This permits active and inert/quoted rewrite objects without artificial semantic ambiguity.

## 11.2 Occurrence-preserving rewrite behavior

New Draft 0.10 rewrite semantics operate on structural occurrences.

A rule application:

1. selects a valid occurrence-preserving embedding of the positive LHS pattern into the declared application boundary;
2. binds pattern variables;
3. validates negative-match conditions against that boundary;
4. preserves matched occurrences explicitly corresponding to retained RHS occurrences;
5. removes matched occurrences not retained;
6. adds RHS occurrences requested by the instantiated rule;
7. preserves unmatched surrounding context;
8. applies any explicit fresh-allocation construction required by the execution profile.

Duplicate RHS occurrences are not silently collapsed.

A set/idempotent rewrite profile may quotient duplicates only when that rule is explicit.

## 11.3 Fresh allocation

`+?n` is not reused implicitly for operational fresh allocation in new canonical artifacts.

A rewrite requiring a new identity must carry an explicit native freshness/allocation role/constraint in its execution profile.

Historical payloads using the Draft 0.2 RHS convention remain decodable under their pinned historical revision.

## 11.4 Negative application conditions

`!X` is a negative structural-match surface, not declarative negation.

Its semantics are relative to the represented match/application boundary and current compatible variable binding.

NAC boundaries and absence constraints are load-bearing during comparison.

Primitive status of `!` remains open.

---

# 12. Declarative formula surfaces

## 12.1 Implication

```text
A => B
```

is a declarative implication-constructor surface.

It does not execute a rewrite.

It does not select classical, intuitionistic, paraconsistent, modal, or another proof calculus.

Exact satisfaction/inference laws belong to the selected profile/class.

## 12.2 Equality

```text
A == B
```

is an object-theory equality surface, distinct from structural identity.

Structural comparison does not collapse two nodes merely because a represented formula asserts `A == B`.

Using represented equality to quotient/collapse structure is a PE/PQ transformation and requires an explicit witness/profile.

## 12.3 Declarative negation

```text
~A
```

is a declarative negation surface.

Its logical laws are profile-owned.

It is distinct from `!A` negative structural match.

## 12.4 Choice / alternative

```text
{
  A
  B
}
```

is a compact unordered alternative surface.

Its exact logical/satisfaction rules belong to the selected profile/class.

Choice is not identified with operational multiway rewrite successors merely because both expose alternatives.

---

# 13. Quantification, bound bodies, and instantiation

## 13.1 Quantifier surfaces

```text
*?n BODY
+?n BODY
```

retain compact universal/existential formula roles and lexical ownership.

For structural decomposition, distinguish:

```text
binder ownership
domain/generator structure
universal/existential satisfaction semantics
```

Universal/existential semantics may instantiate broader structural classes such as evaluation over generated regions.

## 13.2 Lexical abstraction surface

```text
\?n BODY
```

packages a first-class bound body without itself asserting universal/existential quantification.

It does not intrinsically mean lambda, Pi, set comprehension, or another mathematical constructor.

Primitive status remains open pending comparison with explicit binder/body/occurrence structure.

## 13.3 Structural instantiation surface

```text
ABSTRACTION @@ ARGUMENT
```

names capture-avoiding bound-body instantiation.

It is **not currently an irreducible core primitive**.

Its semantics must be compared against an explicit structural-rewrite construction over binder ownership/occurrence structure.

Instantiation is not generic mathematical function application.

## 13.4 Capture avoidance

Any qualified instantiation construction preserves binder ownership and alpha-renames inner binders when needed to avoid capture.

No hidden host substitution callback is semantic authority.

## 13.5 No optional canonical reduction

N0/N1 canonicalization never silently or optionally reduces `@@`.

Any instantiation reduction is an explicit D/E transformation with a witness.

---

# 14. Theory signatures and bundle manifests

A bundle must make its used stable vocabulary recoverable without a human glossary.

## 14.1 Layer-relative signatures

Distinguish:

```text
Sig_surface(T)
  labels appearing in selected serialization

Deps(T)
  native dependency/definition graph needed to interpret the body

Sig_D(T)
  labels present in a selected factorization/decomposition
```

Exact surface-signature closure is useful for a selected serialized bundle.

It is not a semantic-isomorphism criterion.

Dependency closure may contain recursive strongly connected components; it is not assumed to be a simple acyclic expansion list.

## 14.2 `^0` convention

The historical `^0` signature marker remains a supported serialization convention for existing experiments.

Its existence does not prove irreducible primitive status.

New bundles may represent signatures as ordinary native manifest structure.

No comparison may depend on invisible knowledge that an unlabeled file happens to be a signature document.

## 14.3 Semantic revision/profile pinning

Every new canonical bundle MUST identify the applicable AxiomeSH semantic revision/profile either:

- inside an explicit native bundle manifest; or
- in an enclosing native corpus/bundle contract supplied with the artifact.

The revision label is required for unambiguous historical decoding but is non-evidential for cross-domain structural matching unless the requested projection explicitly compares revision metadata.

Historical frozen artifacts retain their recorded revision by experiment authority.

---

# 15. Human gloss and labels

Human-readable names may be supplied as review/retrieval metadata.

They MUST NOT supply formula structure, constraints, quantifier scope, literal values, relation direction, class membership, proof status, or other load-bearing semantics absent from the native bundle.

A cold formal reconstruction test separates:

```text
native recovery
human gloss mapping
semantic inference
```

Class/domain labels may help retrieve candidate pairs, but final structural correspondence must survive label-blind qualification.

---

# 16. Transformation layers

Draft 0.10 uses four explicitly distinct layers.

## 16.1 N0 — serialization normalization

N0 removes only transport-transparent differences:

- whitespace/presentation;
- transparent reference spelling/numbering after hygienic resolution;
- deterministic serialization order that carries no semantics.

N0 does not apply definitions, theorem rules, algebraic laws, substitution, beta reduction, class mappings, or quotienting.

## 16.2 N1 — local structural alpha normalization

N1 normalizes only source-local representation choices already declared alpha-equivalent:

- local opaque identity numbering;
- bound-variable numbering;
- unordered member presentation.

It preserves:

- rigid labels/literals;
- ordered incidence;
- scope/boundary nesting;
- occurrence multiplicity;
- binding ownership;
- rewrite/formula kind/direction;
- negative constraints;
- ports;
- all represented model constraints.

N1 role declarations are source-local/provenance-bearing and frozen before pairwise comparison.

A boundary or semantic-symbol mapping between two objects is never N1.

## 16.3 D — qualified decomposition/definition/factorization

A D edge records:

```text
source representation
target factorization
transform kind
definition/dependency used
direction
assumptions/side conditions
preservation contract
information abstracted/collapsed if any
residual/provenance required for reconstruction
inverse/compaction relation if known
```

Transform kinds include at least:

```text
exact_definition
conservative_refinement
abstraction_projection
lossy_projection
unresolved_factorization_relation
```

A lossy projection is never treated as exact decomposition.

## 16.4 E — profile/theory equivalence

An E edge records:

```text
profile/theory
theorem/rule/evidence
assumptions/context
side conditions
direction
preservation scope
```

Examples include theorem equivalence, algebraic laws, logical duality, beta/eta rules, extensionality, and derived proof-rule admissibility.

E is not silently used during structural-isomorphism discovery.

---

# 17. Decomposition/factorization graph

Decomposition is a relation, not necessarily a function.

A source object may have multiple faithful factorizations.

The factorization graph may contain:

- exact definition edges;
- compaction/inverse edges;
- E-equivalence edges;
- specialization/refinement edges;
- abstraction/projection edges;
- unresolved alternatives.

A unique canonical decomposition is declared only after appropriate convergence/uniqueness evidence.

## 17.1 Independent decomposition freeze

For structural-discovery qualification:

1. each source object is decomposed independently;
2. its factorization set and role/port declarations are frozen;
3. the counterpart object and expected class mapping are then exposed to comparison.

This prevents pairwise co-adaptation.

A decomposer may use already-qualified generic construction libraries, but not source-to-class registry mappings or expected counterpart mappings as authority.

## 17.2 Factorization invariance

A claimed relation should survive replacement by another already-qualified exact factorization, or the result must explicitly report factorization dependence.

No implementation may choose only the factorization that produces the desired analogy.

---

# 18. Comparison projections

Projection and relation kind are independent axes.

Every comparison states both.

## 18.1 P0 — closed structural projection

Local opaque identities may alpha-map bijectively.

Rigid labels/literals remain fixed.

All load-bearing structure is preserved.

## 18.2 PB — boundary/port projection

P0 plus explicit port/boundary policy.

Ports are fixed or mapped by a witnessed port correspondence preserving roles/constraints.

## 18.3 PS — mapped-signature projection

Selected stable semantic identities may map under an explicit source-role-preserving mapping.

The mapping records injectivity/surjectivity/bijection properties.

A relation result calling itself **isomorphism** requires the relevant mapped signature correspondence to be bijective.

Non-bijective symbol maps yield the appropriate weaker relation result.

## 18.4 PC — class/schema projection

A qualified class schema exposes parameter slots, ports, rigid/mappable roles, and permitted abstractions.

Non-evidential labels are anonymized/mapped while their incidence roles remain intact.

Pure annotation edges may be excluded only when explicitly declared semantically non-evidential.

Rigid literals/constants become parameters only where the schema explicitly exposes them as slots.

## 18.5 PE — profile-specific semantic projection

PE permits explicit E-equivalence use.

PE is semantic/behavioral equivalence unless structural isomorphism is separately witnessed after the transformation.

## 18.6 PQ — quotient/projection view

PQ permits explicit many-to-one abstraction/quotient.

Information loss/collapsed distinctions are recorded.

PQ never turns a quotient into an isomorphism claim.

---

# 19. Structural relation kinds

The projection answers **what may map**.

The relation kind answers **what kind of map was established**.

Candidate relation kinds include:

```text
ISOMORPHISM
INDUCED_EMBEDDING
EMBEDDING
STRUCTURAL_HOMOMORPHISM
QUOTIENT_OR_PROJECTION
SPECIALIZATION
COMMON_CORE_WITH_RESIDUALS
NON_ISOMORPHIC
UNRESOLVED_NO_WITNESS_OR_INCOMPLETE_SEARCH
```

## 19.1 Isomorphism

A bijection over the compared structural objects preserving all required incidence, occurrence multiplicity, boundaries, bindings, positive/negative constraints, and rigid roles under the selected projection.

## 19.2 Induced embedding

An injective embedding in which relations/constraints among mapped target nodes are exactly those permitted by the source/core under the projection.

## 19.3 Embedding

An injective structure-preserving map. Additional target structure among/around mapped nodes is retained as residual.

## 19.4 Homomorphism

A relation-preserving map that may collapse distinctions.

Collapsed distinctions are recorded.

## 19.5 Quotient/projection

A declared many-to-one abstraction with explicit loss.

## 19.6 Specialization

A class/schema instance plus explicit additional constraints/residual structure. Direction is stated.

## 19.7 Non-isomorphic

`NON_ISOMORPHIC` requires an exhaustive/proof-producing negative result under the declared finite comparison problem or an independently checkable obstruction certificate.

Failure to find a witness under bounded/heuristic search is `UNRESOLVED`, not proof of non-isomorphism.

---

# 20. Comparison-role declarations

Relevant identities/relations may be classified as:

```text
local-alpha identity
rigid source/model identity
rigid exact literal
boundary/interface port
schema parameter slot
derived alias label
structural-class label
source/domain instance label
provenance/retrieval-only label
candidate mappable semantic identity
```

Role declarations:

- are native or supplied by an explicit comparison specification;
- carry provenance;
- are frozen source-locally before pairwise search when used for discovery qualification;
- cannot be assigned merely because a counterpart makes the mapping convenient.

Pair-specific mapping eligibility introduced after pairing is explicitly marked as a hypothesis and is part of the witness, not hidden preprocessing.

---

# 21. Structural classes

A structural class is a reusable **versioned schema graph plus constraints**, not an OO-style name bucket.

A qualified class definition includes, where applicable:

```text
immutable class-definition identity/version
human/native labels
schema graph/internal structure
parameter slots
boundary/interface ports
rigid versus mappable roles
positive and negative constraints
slot/port mapping rules
invariants
admissible map kinds
required decomposition dependencies
specialization conditions
composition/gluing rules
residual policy
known domain instances
expansion/erasure rule
alternative qualified factorizations
falsifiers
qualification evidence
```

A stable class label resolves to a specific immutable/versioned definition.

A material schema change creates a new definition/version plus an explicit relation to the previous definition.

## 21.1 Class discovery

Class discovery follows decomposition and witnessed comparison.

A class label is not evidence for its own membership.

## 21.2 Class-family lattice

Before creating a new class, test whether the construction is:

- a parameterization;
- specialization;
- composition;
- constrained projection;
- homomorphic/quotient image;
- alternate factorization of an existing class/family.

The catalog is a hypothesis lattice, not a flat ontology.

---

# 22. Class-membership witnesses

A direct `instance -> class` edge is a navigation hypothesis unless accompanied by a validated witness.

A witness records:

```text
instance
immutable class/schema definition
selected instance factorization
projection
required relation kind
schema node/edge/negative-constraint mapping
parameter assignment
port/boundary assignment
rigid identities preserved
invariants/constraints checked
residual structure
```

Exact instance, specialization, embedding, and homomorphic image remain distinct.

Class-to-class specialization/composition/factorization claims require the same witnessed machinery.

---

# 23. Witness validation

A witness emitted by a search agent is not self-validating.

Qualification requires an independent checker/reviewer that verifies the witness directly against:

- the frozen compared structures/factorizations;
- the selected projection;
- declared roles/ports;
- all positive and negative constraints;
- claimed map kind;
- residual/gluing data.

A failed witness does not establish the relation.

---

# 24. Common cores and residuals

For partial correspondence:

```text
A = glue(C, ΔA, cutA)
B = glue(C, ΔB, cutB)
```

The shorthand:

```text
A = C + ΔA
B = C + ΔB
```

is allowed only when the gluing/cut structure is recoverable.

Residuals include:

- unmatched nodes/edges/occurrences;
- relations crossing from common core to residual;
- unmatched ports;
- negative constraints/NACs/disequalities;
- guards/side conditions;
- collapsed/projected distinctions where applicable.

A precise smaller common core is preferred to a larger false correspondence.

## 24.1 Maximal versus maximum

A maximum common core claim requires:

- an explicit optimization measure/partial order;
- a search-completeness/certificate condition.

Otherwise preserve candidate/non-dominated maximal cores and report the search bound.

## 24.2 Multiple valid mappings

Distinct valid witnesses are preserved by default.

They may be quotiented only under an explicit automorphism/equivalence proof that the distinction is irrelevant to the requested downstream operation.

---

# 25. Composition and joint realizability

Internal matches do not prove composability.

A composite class/object requires:

```text
component witnesses
overlap/gluing map
shared ports/identities
compatibility constraints
joint-realizability evidence
composition residual
```

Shared identity alone is insufficient.

Hidden correlation, support, timing, ownership, provenance, or dependency constraints must remain represented.

---

# 26. Label-blind discovery and anti-cheating controls

Class/isomorphism qualification excludes as discovery evidence:

- expected source-to-class mappings;
- class registry hypotheses;
- human glosses naming the expected analogy;
- expected node maps/common cores/residuals.

Before pairwise search:

1. each source decomposition/factorization set is frozen independently;
2. non-evidential labels are hidden, anonymized, or permuted while structural incidence remains intact;
3. local IDs/references/presentation are randomized as allowed by N0/N1.

The structural result must remain invariant up to the corresponding witness renaming.

Qualification includes:

- cross-domain positive;
- alpha/serialization positive;
- near-isomorphic negative;
- same-label/different-structure negative;
- same-interior/different-boundary negative;
- partial common-core pair;
- alternative-factorization pair;
- misleading/swapped-label pair;
- symmetry/automorphism pair;
- novel synthetic structures;
- modified familiar structures designed to defeat pretrained-prototype completion.

No reusable class is qualified from positive examples alone.

---

# 27. Search completeness and result honesty

Heuristics may retrieve or prioritize candidates.

They do not determine final truth.

A relation result states:

```text
search method
resource bound
completeness status
witness/certificate status
```

`NO_WITNESS_FOUND` under incomplete search remains unresolved.

Approximate similarity scores may guide search but are not structural relation results.

---

# 28. Proof systems and meta-theory

AxiomeSH does not select one global logic.

Core formula surfaces do not grant:

- classical reasoning;
- explosion;
- excluded middle;
- modal necessitation/introspection;
- temporal induction;
- deontic distribution;
- separation frame rules;
- higher-order extensionality/choice;
- any other profile law.

A proof-capable profile represents:

- premises/axioms;
- inference rules;
- proof objects/derivation dependencies;
- required semantic foundations.

A cached `derivable` relation is acceptable only when tied to existence/validation of a native proof object or explicit primitive proof authority supplied by the profile.

Representability is not proof.

---

# 29. Qualification gates

The current candidate qualification stack is:

```text
E0   source fidelity
E1   native statement expressibility
E1P  primitive semantic decomposition
E1A  alias/factorization expansion audit
E1C  structural-class classification after witness
E1E  class/instance expansion audit
E1N  N0/N1 versus D/E normalization audit
E1F  alternative-factorization audit
E1W  witnessed structural-comparison audit
E1B  boundary/port/joint-realizability audit
E1L  label-blind/anti-cheating audit
E1M  mapping multiplicity/maximal-core audit
E1H  reference/binder hygiene and occurrence-multiplicity audit
E1V  witness validation/search-completeness audit
E2   isolated cold reconstruction
E3   proof-profile completeness
E4   proof execution
E5   independent proof review
```

A downstream claim may rely only on gates relevant to the semantic relation it uses.

A class/isomorphism result is not qualified until its relevant E1P–E1V gates pass.

---

# 30. Historical compatibility

Frozen Draft 0.1–0.9 experiment artifacts remain evidence and retain their recorded historical decode semantics.

Draft 0.10 does not silently reinterpret those payloads.

When a historical artifact is rerendered or migrated to Draft 0.10, the migration is a witnessed transformation that records any changed surface/occurrence/activation semantics.

In particular:

- historical scope-as-conjunction rules are not imported into new raw `[]` semantics;
- historical set-like scope membership is not silently converted to occurrence-preserving membership without a migration witness;
- historical `+?n` fresh allocation remains a legacy rule only;
- historical direct-child rule activation remains a legacy execution profile;
- historical optional `@@` canonical reduction is not used in Draft 0.10 N0/N1.

---

# 31. Falsifiers

Revise or reject this candidate if controlled evidence shows that:

- occurrence-preserving scope/rewrite semantics materially harm agents without protecting real distinctions;
- multiple factorization preservation adds cost without preventing representation-choice errors;
- witness validation adds no correctness benefit and materially obstructs synthesis;
- boundary/port modeling is redundant because native incidence always recovers composition unambiguously;
- label-blind controls suppress legitimate rigid model information rather than merely names;
- the N0/N1/D/E separation is not reconstructable in practice;
- decomposition/class schemas require artificial scaffolding that a different exact substrate avoids;
- a simpler exact comparison framework provides equal or better isomorphism discovery with lower lifecycle cost;
- agents must mentally decompress the structure into conventional notation before reasoning;
- cross-domain synthesis gains disappear under matched-resource controls.

---

# 32. Current constitutional discipline

```text
preserve source semantics
-> independently decompose as far as justified
-> preserve alternative exact factorizations
-> normalize representation only
-> freeze roles/ports before pairing
-> compare under explicit projection
-> state relation kind separately
-> emit verifiable mapping/core/residual/gluing witness(es)
-> preserve negative constraints and materially distinct mappings
-> classify structural classes only from witnessed structure
-> retain useful labels afterward
```

The target is not a large ontology of familiar names.

The target is a small information-preserving substrate plus reusable, versioned structural classes whose labels help agents recognize constructions **after the underlying shape has been exposed**.
