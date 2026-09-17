# AxiomeSH Draft 0.9 Second-Pass Line Review — Isomorphism Safety

**Status:** corrective audit after the first Draft 0.1–0.8 line review  
**Scope:** Draft 0.9 plus every historical rule still inherited from Drafts 0.1–0.8  
**Objective:** find residual ways representation choice, labels, namespaces, decomposition choice, comparison policy, or search incompleteness can create false/missed structural correspondences.

Draft 0.9 fixed the largest defects from the first review. This pass treats Draft 0.9 itself as non-authoritative evidence and looks for defects introduced or left unresolved by that correction.

## Governing standard

The target is not merely that a claimed mapping can be written down. It is that the strongest justified structural relationship is recoverable independently of incidental representation choices, without allowing the comparison setup itself to encode the expected answer.

The required separation is:

```text
source semantics
-> qualified factorization set
-> representation normalization
-> predeclared comparison policy
-> blind structural search
-> independently checkable witness/certificate
-> relation result + common core/residuals
-> class recognition
-> labels
```

---

## 1. Comparison axes are still partially conflated

Draft 0.9 lists P0/PB/PS/PC/PE/PQ as “projections,” while its result taxonomy separately lists boundary/mapped isomorphism, embedding, homomorphism, quotient, etc.

This mixes three independent dimensions:

```text
comparison view/projection
allowed definitional/equivalence authority
relation kind found
```

For example, boundary preservation is a comparison policy, while embedding is a relation kind. A mapped-signature isomorphism is simply an isomorphism under a signature-mapping policy. Profile-specific semantic equivalence is an E authority, not the same kind of thing as a structural projection.

**Correction:** separate the axes.

Candidate view policies:

```text
V0 closed structural view
VB boundary/port-preserving view
VS signature-mappable structural view
VC class-schema/parameterized view
```

Optional transformation authorities are separately declared:

```text
D-set: allowed qualified definitional factorizations
E-set/profile: allowed semantic equivalences
```

Relation kinds are separately reported:

```text
ISOMORPHISM
STRONG/INDUCED_EMBEDDING
WEAK_EMBEDDING
SPECIALIZATION
HOMOMORPHISM
BISIMULATION/SIMULATION when defined by a profile
QUOTIENT/PROJECTION
COMMON_CORE
CERTIFIED_NON_ISOMORPHIC
UNKNOWN/RESOURCE_LIMIT
```

This prevents a result label from silently changing the comparison policy.

---

## 2. Projection and role declarations can leak the expected answer

Draft 0.9 correctly makes mappings explicit, but a pair-specific comparison policy can itself be chosen after seeing the desired analogy. Declaring exactly the differing constants as “schema parameters” or exactly the differing `^n` identities as mappable can manufacture a match.

**Correction:** for qualification, freeze the comparison-policy family and role-assignment rules before unblinding the expected pair/result. Pair-specific mappings are outputs of search unless they are source-given interface facts.

A role declaration must carry provenance:

```text
source-semantic role
class-schema role fixed before instance scoring
generic comparison-policy role
pair-specific hypothesis (not qualification authority)
```

Pair-specific hypotheses may guide exploratory search but cannot count as independent evidence.

---

## 3. Post-hoc class parameters can absorb every difference

Draft 0.9 allows class schemas to parameterize literals/constants. Without a creation discipline, a class can be generalized after seeing each counterexample until every residual becomes a parameter.

**Correction:** parameter slots, port roles, and admissible mapping modes of an existing class are immutable for a qualification run. Adding a slot creates a new schema version/candidate and invalidates prior qualification until rerun.

For a newly discovered class, parameterization must be justified from multiple decomposed instances or an independently specified construction law and then tested on held-out/adversarial instances.

---

## 4. Stable semantic-symbol IDs are only theory-local

Draft 0.3 says `^n` is stable **inside the represented theory**. Therefore raw equality of `^42` across two independent theory bundles cannot imply semantic identity.

Draft 0.9 says stable semantic identities are rigid by default but does not fully specify their namespace.

**Correction:** canonical semantic identity is at least:

```text
(theory/signature namespace, local semantic-symbol id)
```

unless a symbol is explicitly declared to belong to a shared/global namespace.

Coincidental numeric equality across independent theory namespaces is neither evidence of sameness nor a reason to block a VS mapping.

The same namespace discipline applies to class labels and bundle-local registry IDs.

---

## 5. Multi-document bundle equivalence remains underspecified

Draft 0.3 says concatenating bundle documents must preserve the same theory. That is not unconditional.

Concatenation can change meaning if it changes:

- reference namespace/collision behavior;
- binder visibility;
- signature namespace;
- operational-rule containment;
- explicit boundary/port structure;
- dependency ordering where a serializer requires it.

**Correction:** serialization partitioning is transparent only when a bundle-partition witness shows these roles are preserved. Otherwise the multi-document and concatenated forms are distinct representations requiring a qualified N0/D bridge.

---

## 6. Exact decomposition needs a round-trip criterion

Draft 0.9 requires a preservation contract but permits a decomposition edge without an inverse.

That is insufficient to distinguish exact factorization from a projection/refinement.

**Correction:** an edge called **exact definitional decomposition** must support reconstruction of the source representation modulo N0/N1 and declared transparent aliases, or provide an equivalent injective reconstruction witness.

A D edge records:

```text
applicability guards/preconditions
source
factorization target
preservation obligations
source-to-target map
reconstruction/compaction map when exact
residual/lost information when not exact
```

If reconstruction is impossible, classify the edge as projection/refinement/abstraction rather than exact decomposition.

---

## 7. Definition graphs can hide circular semantics

Two aliases can appear “definitionally transparent” while only defining each other.

Recursive constructions such as paths are legitimate, but they require explicit inductive/coinductive or fixed-point semantics.

**Correction:** definition/dependency closure must either:

- terminate at lower qualified leaves/constructions; or
- contain an explicit guarded recursive/fixed-point contract with base cases and uniqueness/least/greatest-fixed-point authority as appropriate.

Opaque definition cycles do not satisfy decomposition.

---

## 8. Quantifier domains remain a hidden semantic dependency

`*?n BODY` and `+?n BODY` preserve binder kind but do not by themselves say what domain is quantified over.

This can cause false matches between two superficially identical quantified formulas whose domains differ.

**Correction:** new canonical quantified constructions must expose or inherit through explicit native profile structure:

```text
binder ownership
quantifier kind
domain/generator
body
applicable guards/sorts
```

A profile-wide default domain is allowed only when that default is itself represented and part of the dependency/witness.

---

## 9. Scope role remains broader than conjunction

Draft 0.9 fixes implicit formula conjunction, but historical scope still carries grouping, boundary, rewrite-application, state, and recursive-object roles.

If two identical raw scopes behave differently because one is an active state/rewrite container and one is quoted data, comparison can still be wrong unless that role is structurally recoverable.

**Correction:** any role that changes behavior and is not uniquely determined by native containment must be explicit in the construction/profile. Carrier shape alone is not semantic identity.

---

## 10. Negative absence needs an information-closure contract

`!X` means no matching represented structure exists in the relevant matching scope. That is a structural absence test, not logical negation.

A downstream theory must not reinterpret absence as “false in the world” unless the relevant model/scope is declared complete for that relation.

**Correction:** comparisons preserve the scope/completeness assumptions of absence-sensitive constructions. Open-world partial knowledge and closed complete state are not interchangeable merely because the present positive edges match.

---

## 11. Class-schema parameters may be structures, not only scalar identities

Many useful classes take a relation, generator, predicate, proof profile, or subgraph as a parameter. Treating parameters only as constants/literals is too weak and encourages hidden semantics.

**Correction:** schema slots may be identity-, literal-, relation-, predicate-, rule-, or substructure-valued, with explicit interface/variance/constraint contracts. The witness maps the complete slot structure, not only a numeric handle.

---

## 12. Class-class relations also require witnesses

Draft 0.9 requires instance-to-class witnesses but only discusses class-family factorization informally.

Statements such as:

```text
C3 specializes family F
C7 = gate + C1
C11 = relation-image + uniqueness
```

are themselves structural claims.

**Correction:** class-to-class specialization, factorization, composition, quotient, or equivalence requires the same kind of schema mapping/gluing/residual witness as instance membership.

---

## 13. Class definitions and witnesses need version/immutability discipline

A stable class label is dangerous if its schema can change while old witnesses continue to point at it.

**Correction:** every qualified schema/foundation/profile used by a witness is immutable at that version. A semantic change creates a new version/identity or an explicit successor relation. Witnesses record exact dependency versions. A changed candidate schema invalidates or supersedes old qualification; it does not silently inherit it.

Candidate registry labels may remain convenient, but their current schema revision must be explicit.

---

## 14. Witnesses must themselves be independently verifiable

A mapping witness is not evidence merely because an agent emitted it.

**Correction:** define a verifier contract that checks a witness against frozen source/factorization objects and the declared policy without consulting class/domain labels or expected answers.

Discovery and verification are separate stages:

```text
search -> candidate witness -> independent witness verification
```

No class/isomorphism qualification passes only on self-reported witness text.

---

## 15. “Non-isomorphic” cannot mean “search found no mapping”

The current result taxonomy risks overclaiming failure to find a witness as proof of non-isomorphism.

**Correction:** distinguish:

```text
CERTIFIED_NON_ISOMORPHIC_UNDER_POLICY
NO_WITNESS_FOUND
UNKNOWN
RESOURCE_LIMIT
```

A certified negative requires a sound separating invariant/certificate or complete search for the declared finite comparison problem. Otherwise the result is unknown/no-witness, not non-isomorphic.

Likewise, “maximum common core” requires an optimality certificate or exhaustive justification under the stated measure; otherwise report maximal/non-dominated cores found.

---

## 16. Factorization completeness is never silently assumed

A comparison over the currently known factorization graph may miss a relationship exposed by a later valid decomposition.

**Correction:** every result records the factorization set searched and its completeness status:

```text
complete under declared decomposition system
known-qualified subset only
bounded-depth/bounded-cost subset
```

Global claims are forbidden when only a subset was considered.

---

## 17. Strong versus weak embeddings are different

A structure-preserving injection may allow extra relations among mapped target objects, while an induced/strong embedding reflects absence as well as presence.

Draft 0.9's common-core rule leans toward induced matching while its embedding definition is weaker.

**Correction:** report mapping strength explicitly:

```text
strong/induced embedding
weak embedding
homomorphism
```

A common core must state whether it is induced under the comparison policy. Extra relations among mapped objects cannot disappear silently; when weak embedding is allowed they remain explicit residuals and block stronger claims.

---

## 18. Relational correspondences are not always functions

Behavioral equivalences such as simulation/bisimulation may require a relation rather than a single-valued map.

**Correction:** the witness model permits general correspondence relations where the declared profile requires them. These are not isomorphisms unless a bijective structure-preserving/reflection condition is separately satisfied.

This prevents forcing every useful cross-domain relationship into a function-shaped mapping.

---

## 19. Intensional schema isomorphism is not extensional semantic equivalence

A finite recursive/inductive AxiomeSH schema may denote an infinite or large generated model.

Two schema graphs can be isomorphic while their parameterized/generated denotations differ, and two different schemas can generate equivalent denotations.

**Correction:** every comparison identifies its target layer:

```text
serialized/native representation
construction/schema graph
generated finite structure
profile denotation/behavior
```

A structural result at one layer does not automatically promote to another. Bridges between layers are D/E authorities with witnesses.

---

## 20. Mapped opaque leaves support parametric analogy, not automatic semantic equivalence

VS/PC may map independently named primitive/model relations into the same schema slots. If those leaves are not definitionally related, the result establishes a structural correspondence **parameterized by those leaves**.

It does not prove the underlying domain relations mean the same thing.

**Correction:** result language distinguishes:

```text
schema/parametric structural isomorphism
source-theory semantic equivalence
```

The latter requires additional E/profile evidence.

---

## 21. Class promotion needs independent evidence, not one motivating instance

A reusable class inferred from one object can simply restate that object.

**Correction:** a candidate class may be recorded from one decomposition, but promotion as reusable requires either:

- at least two independently sourced structurally witnessed instances plus adversarial negatives; or
- an independently specified construction theorem/profile whose schema is then tested on held-out instances.

Cross-domain class claims require independent domains by definition.

---

## 22. Class discovery must prevent circular decomposition

A decomposition must not use the target class definition/membership as a premise and then be cited as evidence that the object belongs to that class.

**Correction:** witness dependency graphs are acyclic with respect to the claim being qualified. Generic already-qualified lower construction libraries are allowed; the target membership/class-registry hypothesis is not.

---

## 23. Provenance/retrieval projections must not overstate conclusions

A comparison may deliberately ignore provenance/retrieval metadata to find semantic shape. That is valid, but the result then says nothing about provenance equivalence, trust, evidence quality, or source authority.

**Correction:** every projection records excluded dimensions; conclusions are scoped to included structure. Excluded load-bearing governance/provenance facts remain residual or a separate comparison dimension when required by the task.

---

## 24. Semantic-symbol-headed application remains only a surface convention

Draft 0.2 privileges the first position of an edge when it is `^n`. That is useful syntax, but the fact that two edges are both “applications” is weak structural evidence.

**Correction:** class/isomorphism discovery compares the represented relation/function contract, arguments/ports, arity, constraints, and decomposition. The application surface itself does not establish function/predicate equivalence.

---

## 25. Legacy artifacts cannot silently qualify under new semantics

Frozen Draft 0.2–0.8 artifacts contain context-sensitive scope conjunction, existential/freshness overloading, old reference visibility, and other superseded conventions.

**Correction:** they remain valid evidence under their historical decoder. To use them in Draft 0.10 isomorphism/class qualification, either:

- rerender them under current explicit-role semantics; or
- include an exact legacy-to-current D/N bridge whose differences are recorded.

Historical reproducibility is not current qualification.

---

# Required corrective amendment

The next normative amendment should therefore:

1. orthogonalize comparison view, transformation authority, and relation kind;
2. prevent adaptive/pair-specific projection leakage;
3. namespace stable semantic identities;
4. require exact-decomposition round trips and applicability guards;
5. require guarded semantics for recursive definition cycles;
6. expose quantifier domains;
7. make behavioral carrier roles explicit when needed;
8. preserve open/closed-world assumptions around absence;
9. permit relation/substructure-valued schema parameters;
10. witness class-class relations and version schemas/dependencies;
11. independently verify witnesses;
12. distinguish certified negatives from failed search;
13. scope results to the factorization set searched;
14. distinguish strong/weak embeddings and relational correspondences;
15. separate representation/schema isomorphism from denotational equivalence;
16. scope opaque-leaf mappings to parametric structural analogy;
17. raise reusable-class promotion evidence;
18. forbid circular class/decomposition evidence;
19. scope conclusions to included projection dimensions;
20. require explicit current-semantics bridges for legacy artifacts.
