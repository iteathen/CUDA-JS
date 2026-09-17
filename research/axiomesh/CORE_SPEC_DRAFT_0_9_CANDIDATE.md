# AxiomeSH Core Specification — Draft 0.9 Candidate

**Status:** experimental tightening produced by line-by-line isomorphism review of Drafts 0.1–0.8  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5 → Draft 0.6 → Draft 0.7 → Draft 0.8  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens or demotes them  
**Promotion:** experimental-branch authority only

Draft 0.9 makes isomorphism safety constitutional.

AxiomeSH's central value depends on finding common structure across independently named domains without either:

- missing the correspondence because labels or serialization differ; or
- manufacturing a false correspondence by erasing a load-bearing distinction.

The governing order is therefore:

```text
source semantics
-> one or more qualified decompositions/factorizations
-> representation-only normalization
-> label-independent structural comparison
-> explicit mapping/factorization witness
-> exact/common-core/residual result
-> structural-class recognition
-> retained useful labels
```

A source label, class label, conventional notation, or preferred decomposition MUST NOT determine the structural result it is later used to name.

---

## 1. Authority and corrected subjects

A Draft 0.9 decoder/reviewer reads Drafts 0.2–0.8 and then this amendment.

Draft 0.9 changes or clarifies:

- canonicalization/normalization layers;
- decomposition/factorization multiplicity;
- comparison projections;
- semantic-label treatment during cross-domain comparison;
- structural-class schema requirements;
- class-membership and isomorphism witnesses;
- boundary/port semantics;
- exact versus partial structural correspondence;
- class composition/gluing;
- signature exactness by representation layer;
- label-blind qualification;
- treatment of context-sensitive formula surfaces;
- primitive-status interpretation of Draft 0.2–0.6 syntax.

Draft 0.9 does not remove useful labels or compact syntax.

---

## 2. Four distinct transformation layers

The word “canonicalize” MUST NOT be used for all transformations that happen to preserve some notion of meaning.

Draft 0.9 separates four layers.

### 2.1 N0 — serialization normalization

N0 removes only transport/presentation differences known to be semantically transparent, such as:

- whitespace;
- permitted presentation line breaks;
- reference numbering after transparent reference expansion;
- deterministic ordering used only for serialization.

N0 MUST NOT apply theorem rules, definitional expansions, algebraic laws, logical equivalences, substitution, beta-style reduction, or class mappings.

### 2.2 N1 — structural alpha/boundary canonicalization

N1 normalizes representation choices that are structurally alpha-equivalent under the selected comparison projection, including where permitted:

- local opaque identity renaming;
- bound-variable numbering;
- unordered-scope member presentation;
- boundary identifiers under an explicitly supplied boundary bijection.

N1 preserves all rigid identities, literals, scope boundaries, ordered incidence, operational/declarative direction, binding ownership, multiplicity that has been explicitly represented, and all load-bearing constraints.

### 2.3 D — qualified definitional decomposition/expansion

D expands a named derived construction into a lower-level native construction using an explicit qualified definition.

Examples include:

- knowledge -> accessibility + universal satisfaction;
- `G` -> future-region generation + universal satisfaction;
- closure -> explicit finite-path construction;
- a compact class alias -> its schema instance.

D is not ordinary canonicalization.

Each D step MUST identify the definition/dependency that licenses it.

### 2.4 E — profile-specific semantic/proof equivalence

E covers transformations justified by a represented theory or proof profile, for example:

- a theorem equivalence;
- algebraic commutativity/associativity;
- beta/eta laws of a selected calculus;
- logical dualities;
- extensional equality;
- admissible derived proof rules.

E MUST NOT be used silently during structural-isomorphism discovery.

A comparison that uses E must name the profile and equivalence witness.

### 2.5 No optional canonical semantics

Two implementations MUST NOT disagree on semantic identity because one “may” perform an extra reduction during canonicalization.

In particular, Draft 0.6's permission for a canonicalizer to optionally reduce `@@` is superseded.

Instantiation reduction, if used, is a named D/E transformation with a witness; it is not optional N0/N1 behavior.

---

## 3. Decomposition is a relation, not necessarily a function

Draft 0.7/0.8 language such as “the primitive-normal form” is tightened.

A source object may have more than one faithful decomposition or factorization.

The default semantic model is therefore:

```text
source object
-> D1
-> D2
-> ...
```

where each `Di` is a qualified decomposition/factorization node.

AxiomeSH MUST NOT choose one factorization merely because it makes a desired class/isomorphism easier to see.

### 3.1 Factorization graph

When multiple decompositions are known, their relationships SHOULD be represented as a factorization graph whose edges identify:

- definitional expansion;
- inverse/compaction relation where valid;
- proven equivalence;
- specialization;
- refinement;
- unresolved alternative.

### 3.2 Canonical decomposition requires evidence

A unique canonical decomposition may be declared only after evidence establishes an appropriate uniqueness/confluence property for the declared decomposition system.

Absent such evidence, preserve multiple qualified factorizations or preserve an explicit equivalence witness between them.

### 3.3 Alternative-factorization invariance

A structural relationship claimed between two source objects must not disappear merely because either object is expressed through another already-qualified factorization.

If the relationship changes, the comparison must report the factorization dependence instead of silently selecting a preferred answer.

---

## 4. Comparison projections are explicit

There is no single universal “isomorphic” relation.

Every structural comparison MUST state a projection/mapping policy.

Draft 0.9 defines the following candidate projections.

### 4.1 P0 — closed structural isomorphism

P0 compares closed structures while:

- alpha-renaming local opaque identities where allowed;
- preserving literals;
- preserving stable semantic identities;
- preserving incidence, scope, binding, rewrite/formula direction, and represented constraints.

P0 is the strictest ordinary structural comparison.

### 4.2 PB — boundary-preserving isomorphism

PB is P0 plus an explicit boundary/port policy.

The comparison MUST either:

- fix each boundary port identity/role; or
- provide an explicit boundary bijection preserving the port roles and constraints.

An identical interior with an incompatible boundary is not a PB isomorphism.

### 4.3 PS — mapped-signature isomorphism

PS allows selected stable semantic identities from independent theories to map to one another.

The mapping MUST be explicit and witnessed.

It MUST preserve the structural role and all constraints attached to the mapped symbols.

A PS mapping does not rename or mutate either source theory. It exists only inside the comparison witness.

### 4.4 PC — structural-class/schema comparison

PC compares objects after qualified derived labels are expanded or ignored as evidence and after declared class parameter slots are exposed.

PC may abstract selected rigid source constants/literals into **schema parameters** only when the class schema explicitly declares those positions as parameters.

This is parameterization, not literal alpha-renaming.

### 4.5 PE — profile-specific semantic equivalence

PE may use represented theorem/profile equivalences beyond pure structure.

PE is not an isomorphism result unless the resulting relation is separately shown to preserve the structural requirements of the claimed isomorphism class.

### 4.6 Comparison result identifies its projection

A result such as “isomorphic,” “specialization,” or “common core” is invalid if the projection is omitted.

---

## 5. Comparison roles for identities and labels

Stable labels are useful, but a comparison must know how each identity participates.

A comparison bundle SHOULD be able to classify relevant identities by roles such as:

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

These roles are comparison metadata expressed in native structure or an explicitly included comparison specification; they are not inferred from English names.

### 5.1 Labels may retrieve candidates but may not prove matches

Domain/class labels MAY be used to retrieve likely candidate pairs for efficiency.

The final structural correspondence MUST remain valid when those labels are removed, hidden, or permuted according to the qualification protocol.

### 5.2 Rigid by default

A literal or stable semantic identity is rigid by default.

It becomes mappable/parameterized only under an explicit projection/schema rule.

This prevents accidental false isomorphism through overly aggressive renaming.

---

## 6. Structural-class schemas require explicit interfaces

Draft 0.8's “parameterized construction pattern” is tightened.

A structural class is a reusable **schema graph** plus constraints.

A class specification SHOULD include:

```text
class identity/label
schema graph
internal structure
parameter slots
boundary/interface ports
rigid versus mappable roles
slot/port constraints
invariants
admissible mappings
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

The class label is not part of the evidence that an object matches the schema.

### 6.1 Ports are load-bearing

Ports expose the way an instance composes with surrounding structure.

Two instances with isomorphic interiors but incompatible ports are not interchangeable class instances for compositional purposes.

### 6.2 Parameter constraints remain inside the structure

Generator shape, ordering, accessibility properties, ownership/disjointness conditions, stopping conditions, totality, uniqueness, or other load-bearing restrictions MUST remain in the schema/instance construction.

They may not be moved to prose metadata merely to make two objects look more alike.

---

## 7. Class membership requires a witness

A bare edge saying that object `X` belongs to class `C` is a hypothesis/annotation, not qualification evidence.

A qualified class-membership witness must identify at least:

```text
instance X
class/schema C
selected decomposition/factorization of X
schema-node/edge mapping
parameter mapping
boundary/port mapping
rigid identities preserved
constraints/invariants checked
unmatched residual structure
```

### 7.1 Exact instance

An exact class instance has a witness covering the schema with no unexplained load-bearing residual.

### 7.2 Specialization

A specialization has the class witness plus explicit extra constraints/residual structure.

The residual is preserved rather than discarded.

### 7.3 Composition of classes

A composite instance carries multiple class witnesses plus an explicit gluing/overlap map and compatibility constraints.

Shared identity alone is not a sufficient composition proof.

### 7.4 Hypothesis registries are not discovery evidence

A registry of candidate class labels/mappings MAY exist for navigation and experiment planning.

Such a registry MUST be excluded from label-blind class-discovery qualification and MUST NOT be counted as a witness.

---

## 8. Isomorphism and partial-isomorphism results are witnessed

A comparison should return a structured result, not only a boolean.

Candidate result classes include:

```text
EXACT_ISOMORPHISM
BOUNDARY_PRESERVING_ISOMORPHISM
MAPPED_SIGNATURE_ISOMORPHISM
SPECIALIZATION / EMBEDDING
COMMON_CORE_WITH_RESIDUALS
NON_ISOMORPHIC_UNDER_PROJECTION
UNRESOLVED_FACTORING_OR_EQUIVALENCE
```

A witness records at least:

```text
comparison projection
selected factorization(s)
node/edge mapping
boundary mapping
semantic-label mapping if any
parameter mapping
constraints checked
common core C
residual A
residual B
```

### 8.1 Residuals are first-class

For partial correspondence:

```text
A = C + ΔA
B = C + ΔB
```

`ΔA` and `ΔB` MUST remain explicit.

AxiomeSH must prefer a precise common core plus residuals over a larger but false equivalence.

### 8.2 Maximum common structure is projection-relative

“Maximum common core” is meaningful only under a specified projection, boundary policy, and decomposition set.

The result must record those assumptions.

---

## 9. Label-blind discovery is mandatory for qualification

Any structural-class/isomorphism mechanism intended to support cross-domain synthesis MUST pass a label-blind control.

At minimum rerun the comparison with:

- source/domain labels hidden or permuted;
- class labels hidden or permuted;
- local identity numbering randomized;
- unordered presentation reordered.

The witnessed structural relationship must remain unchanged except for the corresponding renaming of witness identifiers.

If changing a label changes the structural answer, the mechanism is contaminated by the ontology it is supposed to discover.

---

## 10. Adversarial class qualification

Every proposed reusable structural class SHOULD be tested with all of the following.

### 10.1 Cross-domain positive

Different domain vocabulary, same qualified structural schema.

Expected: match with an explicit witness.

### 10.2 Serialization/renaming positive

Same object under unrelated local identities, references, presentation order, and formatting.

Expected: match.

### 10.3 Near-isomorphic negative

One load-bearing relation/constraint differs.

Expected: no exact match; preferably recover the common core and residual.

### 10.4 Boundary negative

Same internal structure, incompatible external ports/gluing constraints.

Expected: interior match may be reported, PB/substitutability match must fail.

### 10.5 Partial pair

Large common core plus meaningful independent residuals.

Expected: recover `C`, `ΔA`, and `ΔB`.

### 10.6 Alternative-factorization pair

Same source object or known-equivalent objects presented through different qualified decompositions.

Expected: structural relationship survives or factorization dependence is reported explicitly.

### 10.7 Misleading-label pair

Labels are swapped or deliberately suggest the wrong class.

Expected: structural result unchanged.

No class is qualified from positive examples alone.

---

## 11. Signature exactness is representation-layer relative

Draft 0.4's exact-signature requirement is retained for a specified serialized bundle, but it is not a semantic-isomorphism criterion.

Distinguish:

```text
Sig_surface(T)
  labels appearing in the selected serialized body

Deps(T)
  native dependency/definition closure required to interpret that body

Sig_D(T)
  labels remaining/introduced in a selected qualified decomposition D
```

Two equivalent/factor-related structures may have different surface signatures.

Signature equality or numeric symbol equality MUST NOT be used as evidence of cross-domain structural equality unless the selected comparison projection requires it.

---

## 12. Surface syntax does not determine primitive status

Draft 0.8's audit rule is strengthened.

The following remain useful candidate surfaces:

```text
#n
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

Their availability does not establish irreducibility.

Each may ultimately be classified as:

```text
irreducible representation primitive
canonical surface for a lower native construction
serialization/value shorthand
profile-owned derived constructor
qualified structural-class alias
rejected/redundant
```

### 12.1 `@@` demotion pending proof

Draft 0.6's statement that `@@` is a core structural term is demoted to **candidate surface/operation** status.

Its semantic class is capture-avoiding bound-body instantiation.

Before core promotion, compare it against an explicit structural-rewrite construction over binder/occurrence ownership.

### 12.2 Lexical abstraction

`\?n BODY` remains a useful first-class bound-body surface.

Primitive status remains open pending comparison against explicit binder/body/occurrence structure.

### 12.3 Implication/equality/negation/choice

These forms remain convenient declarative surfaces.

Their full logical semantics are profile/class owned; the token alone is not proof authority.

Draft 0.2's phrase “classical negation” is superseded by **declarative negation surface**.

---

## 13. Context-only semantic overloading is prohibited for new canonical artifacts

A canonical structure used for isomorphism discovery must not depend on an unrepresented external context to decide what a term means.

### 13.1 Scope is not implicitly conjunction in Draft 0.9 artifacts

For new Draft 0.9 canonical artifacts:

```text
[ ... ]
```

is a structural scope/boundary/container.

If co-satisfaction/conjunction is intended, the formula/class/profile structure must make that role explicit.

Frozen Draft 0.2–0.8 artifacts retain their historical decode rules for reproducibility.

### 13.2 Existential versus fresh allocation

New canonical artifacts MUST NOT rely solely on syntactic position to change `+?n` from declarative existential quantification into fresh-identity allocation.

Fresh allocation must have an explicit native construction/role in the operational rule representation.

Legacy Draft 0.2 behavior remains readable for frozen artifacts.

### 13.3 Active operational context

If a rule is active because of structural location, that nesting/location is load-bearing and must survive normalization/comparison.

---

## 14. Multiplicity must be decided before set-like scope canonicalization

Draft 0.2's ordinary-scope set semantics remain available, but only after decomposition has preserved any source multiplicity that matters.

If two source occurrences are semantically distinct, encode their occurrence identity/count before they enter a set-like scope.

A canonicalizer MUST NOT conclude that repeated source occurrences are irrelevant merely because their final member structures are isomorphic.

---

## 15. Class-family minimality and factorization

The structural-class catalog is a hypothesis lattice, not a flat ontology.

Before creating a new class, test whether the candidate is:

- a parameterization of an existing class;
- a specialization;
- a composition;
- a constrained projection;
- the same class under a different factorization.

Current hypotheses requiring explicit test include:

```text
universal-over-region
existential-over-region
immediate-successor evaluation
```

as possible specializations of a broader **evaluation over a generated region** family with quantifier/cardinality constraints.

Likewise:

```text
transition-preservation
```

may factor as precondition gating plus universal evaluation over transition-generated successors.

And:

```text
functional-graph application
```

may factor as relation-image selection plus uniqueness/totality constraints.

These are hypotheses to test, not mandated mergers.

---

## 16. Composition/joint realizability is part of class semantics

A class composition is valid only when its gluing map is jointly realizable under all component constraints.

The following is insufficient:

```text
put C1 and C2 in one scope
share matching identities
```

Qualification must establish that the combined constraints admit the claimed composition and that no hidden correlation/support/timing/ownership constraint was lost.

This requirement generalizes the original Draft 0.1 composition warning.

---

## 17. Primitive/model leaf provenance

A model leaf is not justified merely because a source notation presents it as primitive.

A leaf SHOULD record which category applies:

```text
observational/model input
stipulated source axiom/relation
implementation/environment fact
currently undecomposed candidate primitive
proven irreducible representation primitive
```

A familiar named compound concept does not become a primitive leaf merely because it arrived from an external benchmark.

---

## 18. Qualification gates added by Draft 0.9

Draft 0.9 adds the following gates to E1P/E1A/E1C/E1E.

### E1N — normalization-layer audit

Verify that N0/N1 normalization does not perform unrecorded D/E transformations.

### E1F — factorization audit

Record alternative qualified decompositions and show that class/isomorphism results are invariant or explicitly factorization-dependent.

### E1W — witnessed comparison

Every claimed structural relationship must carry the mapping/core/residual witness required by Section 8.

### E1B — boundary/composition audit

Test exposed ports and joint realizability; interior similarity alone is insufficient.

### E1L — label-blind audit

Hide/permutate source and class labels and rerun the discovery result.

These gates block structural-class promotion and any E3/E4 claim depending on the class relation.

---

## 19. Experiment 003 consequence

The current structural class catalog and native class registry are candidate hypotheses only.

In particular:

- direct `domain-label -> class-label` edges are navigation/classification hypotheses, not membership witnesses;
- the registry MUST be excluded from label-blind structural discovery inputs;
- current classes must be upgraded to schema/port/constraint definitions before qualification;
- current mappings must gain explicit witnesses or remain marked unqualified;
- class-family factorization hypotheses must be tested before expanding the registry further.

No additional domain operator should receive a new class identity until its primitive/native decomposition has been inspected against the existing factorization lattice.

---

## 20. Falsifiers

Revise Draft 0.9 if controlled evidence shows that:

- preserving multiple qualified factorizations creates material reasoning cost without protecting any real correspondence;
- explicit witnesses add no correctness benefit and materially obstruct synthesis;
- label-blind qualification removes useful structural information that should actually be modeled as a rigid parameter;
- boundary/port modeling proves redundant because the same composition information is always recoverable unambiguously from native incidence;
- residual-first partial comparison consistently performs worse than a different exact method without preventing false equivalences;
- the N0/N1/D/E separation cannot be reconstructed reliably by qualified agents;
- a simpler comparison framework provides equal or better isomorphism discovery with the same semantic fidelity.

Until such evidence appears, isomorphism safety has priority over class-catalog convenience.

The constitutional discipline is:

```text
preserve source semantics
-> decompose without target-class bias
-> preserve alternative factorizations
-> normalize representation only
-> compare under an explicit projection
-> produce a mapping/core/residual witness
-> classify only from that witness
-> retain labels afterward
```
