# AxiomeSH Core Specification — Draft 0.10 Candidate

**Status:** experimental tightening produced by second-pass line review of Draft 0.9 and inherited Draft 0.1–0.8 rules  
**Parents:** Draft 0.2 → Draft 0.3 → Draft 0.4 → Draft 0.5 → Draft 0.6 → Draft 0.7 → Draft 0.8 → Draft 0.9  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens, scopes, or demotes them  
**Promotion:** experimental-branch authority only

Draft 0.10 does not add a new logical operator.

It tightens the machinery that determines whether two independently represented objects have the same structure. This is constitutional for AxiomeSH: if comparison policy, labels, namespaces, factorization choice, or incomplete search can manufacture or hide an isomorphism, the language fails its central purpose.

The governing sequence is now:

```text
source semantics
-> qualified factorization set
-> representation normalization
-> frozen comparison policy
-> label-blind structural search
-> candidate witness/certificate
-> independent witness verification
-> structural relation + common core/residuals
-> class recognition
-> retained labels
```

---

## 1. Three orthogonal comparison axes

Draft 0.9 mixed comparison projections, semantic authorities, and relation kinds. Draft 0.10 separates them.

Every comparison declaration has three independent parts.

### 1.1 View policy V

The view states which structural roles may map and which must remain rigid.

Candidate views:

```text
V0  closed structural view
VB  boundary/port-preserving view
VS  signature-mappable structural view
VC  class-schema/parameterized view
```

A view is not a result.

### 1.2 Transformation authority A

The authority states which transformations may be applied before or during comparison.

```text
N0-set  serialization-transparent normalization
N1-set  alpha/representation normalization
D-set   qualified definitional factorizations allowed
E-set   profile/theorem equivalences allowed
```

`E` is never implied merely because two structures are being compared.

### 1.3 Relation kind R

The relation kind is what the search establishes under the selected view/authority.

Candidate relation kinds include:

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

`BOUNDARY_PRESERVING_ISOMORPHISM` is therefore `R=ISOMORPHISM` under `V=VB`.

`MAPPED_SIGNATURE_ISOMORPHISM` is `R=ISOMORPHISM` under `V=VS`.

This prevents result vocabulary from silently changing the comparison rules.

---

## 2. Comparison policy is frozen before qualification search

A comparison can be biased even when labels are hidden if the evaluator chooses exactly which identities are mappable or exactly which differing literals become parameters after seeing the desired result.

For qualification:

1. freeze the allowed view family, role-assignment rules, admissible D/E authorities, and comparison objective before expected mappings/results are unblinded;
2. source-given interface/rigidity facts may be supplied because they are part of the represented object;
3. pair-specific mappings are normally outputs of search, not scorer-provided inputs;
4. a pair-specific hypothesis may guide exploratory work, but it is not independent qualification evidence.

Comparison-role declarations record provenance:

```text
source-semantic role
pre-existing qualified class-schema role
generic comparison-policy role
pair-specific hypothesis
```

Only the first three may serve as qualification authority unless the experiment explicitly tests a supplied mapping rather than discovery.

---

## 3. Stable semantic identities are namespaced

Draft 0.3 defines `^n` as stable inside a represented theory. Therefore raw numeric equality of `^n` across independent theory bundles does not establish semantic identity.

The semantic identity of a theory-local symbol is at least:

```text
(theory/signature namespace, local symbol id)
```

unless the symbol is explicitly declared in a shared/global namespace.

Consequences:

- `^42` in independent theory A is not automatically the same symbol as `^42` in theory B;
- coincidental numeric equality is not evidence of cross-domain sameness;
- coincidental numeric inequality is not evidence against a VS mapping;
- class-registry IDs and profile-local IDs inherit the same namespace discipline;
- exact literals such as `#42` remain global values, not theory-local labels.

A bundle must make the namespace owning stable symbols recoverable from native bundle structure or explicit bundle metadata whose semantics are part of the native representation contract.

---

## 4. Multi-document bundle partitioning is qualified, not assumed

Draft 0.3's claim that concatenating native bundle documents preserves the theory is tightened.

Partitioning/concatenation is N0-transparent only when a bundle-partition witness establishes preservation of:

- semantic-symbol namespace;
- local structural/reference namespaces;
- binder ownership/visibility;
- operational-rule containment and activation boundaries;
- dependency/import relationships;
- explicit ports/boundaries;
- any ordering constraint that the chosen serialization actually makes semantic.

If those conditions are not established, the partitioned and concatenated bundles are distinct representations requiring an explicit qualified bridge.

---

## 5. Exact D decomposition requires a round trip

A transformation is an **exact definitional decomposition** only if the source can be reconstructed from the target modulo declared N0/N1 equivalence and transparent naming surfaces.

An exact D edge records:

```text
source representation
target factorization
applicability guards/preconditions
definition/dependency version
source-to-target mapping
preservation obligations
reconstruction/compaction mapping
residual/provenance required for round trip
```

If information is intentionally discarded or the source cannot be reconstructed, the edge is instead classified as one of:

```text
refinement
abstraction
projection
quotient
approximation
```

and the loss is explicit.

No lossy edge may be used as if it established exact factorization or exact isomorphism.

---

## 6. Recursive definitions require explicit fixed-point authority

Definition transparency is not satisfied by a cycle of aliases that only refer to one another.

A definition dependency must either:

- terminate at lower qualified constructions/model leaves; or
- declare an explicit recursive contract, including where relevant:

```text
base case(s)
recursive/step constructor
guardedness/productivity condition
least/greatest/other fixed-point interpretation
uniqueness or admissibility authority
```

Finite-path closure, inductive proof objects, recursive formula satisfaction, and coinductive behavioral relations may therefore be native without full finite expansion, but their recursion semantics may not be hidden in a host evaluator.

---

## 7. Quantifier domains are explicit dependencies

A quantifier surface such as:

```text
*?n BODY
+?n BODY
```

preserves quantifier kind and lexical binding but is not semantically complete unless the quantified domain/generator is determined.

For new canonical quantified constructions, the native dependency path exposes:

```text
binder ownership
quantifier kind
domain/generator
body
sort/guard constraints if any
```

A profile-wide default domain is permitted only when that default is itself explicit native profile structure and is included in the comparison/factorization dependencies.

Two formulas with identical binder/body shape but different quantified domains are not structurally interchangeable merely because the compact surface text matches.

---

## 8. Carrier role must be recoverable when behavior depends on it

One structural carrier may support several uses, but behavior-changing roles may not exist only in the reader's head.

For example a scope may serve as:

- grouping/container;
- boundary/component;
- operational state/rewrite scope;
- represented/quoted data;
- bundle/module boundary.

If the role is uniquely recoverable from native containment/incidence, no extra tag is required.

If two identical native carriers would behave differently only because an external consumer calls one “state” and the other “data,” that role must be represented explicitly before the objects can be compared soundly.

Draft 0.9's ban on implicit scope-as-conjunction remains in force.

---

## 9. Structural absence is not semantic falsity

`!X` remains a negative structural match over the represented matching scope.

It means:

> no matching represented instance of `X` exists in that scope under the compatible binding.

It does not by itself establish that `X` is false in an incompletely represented world/model.

A theory that interprets absence as falsity must expose an applicable completeness/closed-world contract for the relevant relation/scope.

Comparison preserves absence-sensitive scope boundaries and completeness assumptions. Open partial knowledge and closed complete state are distinct when absence is load-bearing.

---

## 10. Schema parameters may be structured objects

Structural-class parameter slots are not limited to scalar identities or literals.

A slot may be declared as:

```text
identity-valued
literal-valued
relation-valued
predicate/formula-valued
rule/profile-valued
substructure-valued
boundary/port-valued
```

Each slot declares its admissible mapping mode, interface, and constraints.

A witness maps the structure of a relation/subgraph-valued parameter, not merely the numeric handle naming it.

This is required for classes such as evaluation-over-generated-region, where the region generator itself is a load-bearing relational parameter.

---

## 11. No post-hoc parameterization

A class schema cannot absorb a counterexample by turning every differing feature into a new parameter after seeing the pair being scored.

For an existing class qualification run, the following are frozen before instance scoring:

```text
schema graph
parameter slots
boundary ports
rigid/mappable roles
admissible mapping modes
invariants
residual policy
```

Changing any of these creates a new schema revision/candidate and requires requalification.

For a newly discovered class, a parameter is justified by either:

- at least two independently decomposed instances showing the varying role; or
- an independently specified construction law that is then tested on held-out/adversarial instances.

---

## 12. Class-class relations require witnesses

A claim that one class specializes, factors into, composes from, embeds into, or quotients another is itself a structural claim.

It requires a schema-level witness containing, as applicable:

```text
source schema revision
target schema revision
schema-node/edge map
parameter/port map
constraints preserved
extra constraints/residual
composition/gluing map
relation kind
view/authority policy
```

Class-family diagrams are therefore witnessed hypothesis graphs, not prose taxonomy.

---

## 13. Qualified schemas and dependencies are versioned/immutable

A witness is only meaningful relative to the exact definitions it used.

Once a class schema, foundation, proof profile, or decomposition rule is independently qualified at a revision, changing its semantics creates a new revision/identity or an explicit successor relation.

A witness records exact dependency revisions.

Old witnesses do not silently transfer to a changed schema.

Candidate labels may remain stable navigation handles, but they resolve to an explicit candidate revision; qualification status attaches to that revision, not to an eternally mutable name.

---

## 14. Discovery and witness verification are separate

A comparison agent may propose a witness. Qualification requires an independent verifier to check it against frozen inputs and the frozen comparison policy.

The verifier checks at least:

```text
factorization dependencies valid
mapping domain/codomain valid
incidence/order/scope/binding preservation
rigid roles preserved
port mapping valid
schema parameters valid
constraints/invariants satisfied
residuals complete
collapsed information reported
relation-kind conditions satisfied
no forbidden label/class-registry evidence used
```

Verification must not need the expected class/domain name.

A self-reported mapping is not qualification evidence until it passes verification.

---

## 15. Negative results and search limits are explicit

Failure to find an isomorphism is not proof of non-isomorphism.

Results distinguish:

```text
CERTIFIED_NON_ISOMORPHIC
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

`CERTIFIED_NON_ISOMORPHIC` requires either:

- complete search for the declared finite comparison problem; or
- a sound separating invariant/certificate whose validity is independently checkable.

Similarly:

- `maximum common core` requires an optimality certificate/exhaustive justification under a declared measure;
- otherwise report one or more maximal/non-dominated cores found under the search budget.

---

## 16. Factorization-set completeness scopes every result

A structural result records which factorization nodes were considered and how complete that set is:

```text
complete under declared factorization system
all currently qualified factorizations
bounded-depth subset
bounded-cost subset
explicit selected subset
```

A relationship established over one subset remains valid for that subset, but failure to find a relationship does not become a global negative unless factorization completeness is sufficient for that claim.

The result therefore includes:

```text
factorization-set id/revisions
completeness status
search budget/limits
```

---

## 17. Embedding strength is explicit

An embedding can preserve structure without reflecting all structure.

Draft 0.10 distinguishes:

### 17.1 Strong/induced embedding

A strong embedding preserves and reflects the declared incidence/relations among mapped objects under the selected view. Extra target relations among already-mapped objects violate strong embedding unless explicitly outside the compared relation signature.

### 17.2 Weak embedding

A weak embedding preserves required source relations but may permit extra target relations among mapped objects.

Those extra relations remain explicit target residual and block stronger claims.

### 17.3 Homomorphism

A homomorphism may also identify multiple source objects and is weaker still.

Relation kind is always reported explicitly.

---

## 18. Correspondence witnesses may be relational

Not every useful structural/behavioral correspondence is a function.

A profile may define simulation, bisimulation, observational relation, or another correspondence as a relation over objects/states.

Such a witness may be many-to-many when the declared relation requires it.

It is not an isomorphism unless a separate bijective structure-preserving-and-reflecting condition is proved.

---

## 19. Comparison target layer is explicit

AxiomeSH can compare several different things:

```text
serialized/native representation graph
construction/schema graph
generated finite structure
profile denotation/behavior
proof/derivation behavior
```

A structural isomorphism at one layer does not automatically imply equality/equivalence at another.

For example:

- two recursive schema graphs may be isomorphic while their parameterized denotations differ;
- two different schemas may be E-equivalent under a profile without being structurally isomorphic.

A bridge between layers is a qualified D/E authority with a witness.

Every result identifies its target layer.

---

## 20. Mapped opaque leaves yield parametric structural claims

When VS/VC maps independently named primitive/model leaves into common schema slots without a qualified semantic equivalence between those leaves, the result is a **parametric structural correspondence**.

It does not establish that the underlying domain relations have the same meaning.

Result wording distinguishes at least:

```text
structural/schema isomorphism under parameter mapping
source-theory semantic equivalence
```

The second requires additional profile/E evidence.

---

## 21. Reusable-class promotion requires independent evidence

A candidate class may be recorded after one exact decomposition, but it is not promoted as a reusable structural class merely because it can restate its motivating object.

Promotion requires either:

1. at least two independently sourced witnessed instances plus the mandatory adversarial negatives; or
2. an independently specified construction schema/theorem followed by held-out positive and negative instance tests.

A claimed **cross-domain** class requires instances from independent domains.

---

## 22. Circular evidence is prohibited

A class membership claim cannot be used to construct the decomposition that is then used to prove that same membership.

Qualification dependencies form an acyclic claim-dependency graph with respect to the claim being established.

Allowed:

- already-qualified generic lower construction libraries;
- source axioms/model leaves;
- independently qualified schema definitions.

Forbidden as proof authority for the target claim:

- the target registry mapping;
- the target class-membership hypothesis;
- expected analogy text;
- a decomposition rule whose validity itself depends on the target membership.

---

## 23. Projection exclusions scope the conclusion

A view may intentionally ignore dimensions such as provenance/retrieval metadata to compare semantic shape.

The result then makes no claim about the excluded dimensions.

Every view records:

```text
included structural dimensions
excluded dimensions
rigid dimensions
mappable dimensions
parameterized dimensions
```

If provenance, trust, evidence quality, security, timing, ownership, or another dimension is load-bearing for the requested task, it must be included or retained as residual/separate comparison dimension.

---

## 24. Semantic-symbol-headed application is a surface role

Draft 0.2's `(^n ...)` form remains useful canonical syntax.

The fact that two edges are both symbol-headed applications is not sufficient evidence that the applied operations are structurally or semantically equivalent.

Comparison examines, as applicable:

- symbol namespace/role;
- arity and ordered argument roles;
- parameter/port contracts;
- domain/codomain constraints;
- functional/relational semantics;
- qualified decomposition/class structure.

The application surface remains a label/constructor, not an equivalence theorem.

---

## 25. Legacy artifacts require an explicit current-semantics bridge

Frozen Draft 0.2–0.8 artifacts retain historical semantics for reproducibility.

They do not silently become Draft 0.10-qualified structures.

To use a legacy artifact in current class/isomorphism qualification, either:

- rerender it under current explicit-role semantics; or
- provide an exact legacy-to-current bridge recording every changed convention, including where relevant:
  - formula-scope conjunction;
  - existential/freshness overloading;
  - reference visibility/order;
  - signature/document context;
  - namespace qualification;
  - candidate surface versus primitive status.

Historical qualification remains valid for the historical claim it tested. It is not current isomorphism qualification.

---

## 26. Qualification gates added/tightened by Draft 0.10

Existing E1P/E1A/E1C/E1E/E1N/E1F/E1W/E1B/E1L/E1M remain, with these additions.

### E1Q — comparison-policy freeze audit

Verify that view roles, admissible mappings, D/E authorities, and scoring objective were fixed before expected mapping/result unblinding.

### E1D — decomposition exactness/recursion audit

Verify exact D round trips, applicability guards, dependency versions, and recursive fixed-point contracts.

### E1S — symbol/bundle namespace audit

Verify stable semantic identities and bundle partitions cannot collide or change meaning by serialization accident.

### E1V — witness/certificate verification

Independently verify positive mappings, common-core/residual completeness, negative certificates, and claimed optimality.

### E1T — target-layer/conclusion-scope audit

Verify that representation/schema/denotation/proof-level conclusions are not silently promoted across layers.

These gates block any structural-class promotion or E3/E4 claim that depends on the affected relation.

---

## 27. Structural comparison result record

A qualified comparison result records at minimum:

```text
object A + revision
object B + revision
target layer
view policy V
N0/N1 policy
D authority/factorization set
E authority/profile if any
factorization completeness status
relation kind R
mapping/correspondence witness
boundary/port map
parameter map
rigid/mappable/excluded roles
constraints/invariants checked
common core(s)
residual A/B
collapsed/projected distinctions
search budget
optimality status
certificate/witness verification result
```

This record is the evidence from which a class label may later be attached.

---

## 28. Structural-class registry consequence

The Experiment 003 registry remains navigation/hypothesis metadata.

Current `^9101..^9112` labels are candidate names, not immutable qualified class definitions.

Each registry mapping remains witness-pending until:

- the class schema revision exists;
- the instance factorization is qualified;
- policy is frozen label-blindly;
- a witness is produced;
- an independent verifier validates the witness;
- mandatory adversarial controls pass.

If a class schema changes, registry qualification status must reference the new revision explicitly.

---

## 29. Falsifiers

Revise Draft 0.10 if controlled evidence shows that any of the following protections add material cost without preventing real false/missed correspondences:

- policy freezing;
- semantic-symbol namespacing;
- exact D round trips;
- recursive-definition contracts;
- explicit quantifier domains;
- schema/dependency versioning;
- independent witness verification;
- negative-certificate distinction;
- factorization completeness reporting;
- embedding-strength distinction;
- target-layer distinction;
- circular-evidence prohibition.

A simpler mechanism is preferred whenever it preserves the same semantic fidelity and isomorphism safety.

Until then, the constitutional rule is:

```text
labels help find candidates
structures determine mappings
policies are frozen before scoring
witnesses are checked independently
unknown remains unknown
residuals remain visible
classes are conclusions, not premises
```
