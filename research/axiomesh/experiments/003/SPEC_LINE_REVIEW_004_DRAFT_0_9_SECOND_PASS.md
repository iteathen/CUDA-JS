# AxiomeSH Draft 0.9 Second-Pass Line Review

**Status:** corrective audit  
**Input authority:** live `experiment/axiomesh-native-reconstruction` at `513b5497abeb0e2ce9c93724fcdeb3d450122254`  
**Scope:** line-by-line semantic review of `CORE_SPEC_DRAFT_0_9_CANDIDATE.md` plus cross-check against Drafts 0.1–0.8  
**Objective:** find remaining failure modes capable of creating false isomorphisms, missed isomorphisms, decomposition bias, hidden context, or unverifiable class membership.

This review treats Draft 0.9 as a candidate, not authority over its own correctness.

---

## A. Authority / revision model

### A1. Draft 0.9 omits Draft 0.1 from its decoder chain

Draft 0.9 says a decoder reads Drafts 0.2–0.8, but Draft 0.2 is only an amendment and does not restate all base semantics for edge, scope, rewrite, reference, matching, and activation.

**Correction:** a historical Draft 0.9 decoder must read Draft 0.1 through Draft 0.9 in order.

### A2. The amendment chain itself is now a correctness risk

Nine layered documents contain superseded statements such as:

- scope-as-conjunction;
- context-sensitive `+?n` freshness;
- point-of-definition reference visibility;
- optional `@@` canonical reduction;
- candidate surfaces described as core primitives.

A fresh agent can miss one supersession and construct a different semantic object.

**Correction:** create a self-contained consolidated current candidate. Historical drafts remain frozen evidence only.

### A3. Applicable semantic revision is not structurally pinned

The same surface syntax can mean different things under historical and current rules. A raw artifact therefore needs an explicit applicable semantic revision/profile or an enclosing bundle contract that is itself native and supplied.

**Correction:** every new canonical bundle identifies its semantic revision/profile. Revision identity is a label/contract, not evidence for structural correspondence.

---

## B. N0 / N1 / D / E transformation layers

### B1. Reference expansion is not yet hygienic

Draft 0.9 fixes textual-order dependence, but transparent reference expansion can still alter variable capture if a referenced term contains free/bound variables and is expanded under a different binder environment.

**Correction:** reference expansion preserves lexical ownership. Either referenced terms are closed relative to the binding site or the reference carries the lexical environment needed for capture-avoiding hygienic expansion.

### B2. Reference expansion must preserve occurrence semantics

Inlining the same reference at two use sites must not accidentally assert identity of the two structural occurrences beyond identities explicitly present inside the referenced term.

**Correction:** references are DAG/serialization sharing only; occurrence sharing is non-semantic unless represented independently.

### B3. N1 role policy can itself become target-biased

Draft 0.9 says N1 operates under an already selected local-role policy but does not require that policy to be frozen independently of the comparison target.

**Correction:** comparison-role declarations are source-local, provenance-bearing, and frozen before pairwise structural search. Pair-specific role reinterpretation is part of the witness/projection, not N1.

### B4. E-equivalence lacks explicit assumptions/side conditions

A theorem/profile equivalence can be valid only under premises, types, domains, side conditions, or local context.

**Correction:** every E edge records profile, assumptions/context, side conditions, direction, proof/evidence object, and preservation scope.

### B5. D-edge exactness needs explicit kind

Draft 0.9 records a preservation contract, but downstream tooling needs a rigid distinction among exact definition, conservative refinement, abstraction/projection, and lossy transformation.

**Correction:** D/factorization edges carry an exact transformation kind; only exact/conservative reversible relationships participate in factorization-invariance claims without qualification.

---

## C. Decomposition/factorization discipline

### C1. Pairwise co-adaptation is still possible

A decomposer can see both objects and choose mutually convenient factorizations even without seeing a class label.

**Correction:** for discovery qualification, decompose each source independently, freeze its factorization set, then expose the pair to comparison.

### C2. Construction libraries can leak expected analogies

Generic qualified classes may be used during decomposition, but source-to-class registry mappings or expected counterparts must not steer decomposition.

**Correction:** freeze decompositions with candidate source-to-class mappings withheld; class recognition occurs afterward.

### C3. Class/construction definitions need immutable version identity

A stable label such as `^9101` cannot silently change schema over time without corrupting old membership claims.

**Correction:** a qualified class label resolves to an immutable/versioned schema definition. Material schema changes create a new definition/version plus an explicit relation to the old one.

---

## D. Projection and relation-kind model

### D1. Projection and relation kind are still partially conflated

Draft 0.9 lists both projections (`P0`, `PB`, `PS`, `PC`, `PE`, `PQ`) and result labels such as `BOUNDARY_PRESERVING_ISOMORPHISM` and `MAPPED_SIGNATURE_ISOMORPHISM`.

Boundary/signature policy is one axis; map kind is another.

**Correction:** every result has two independent fields:

```text
projection
relation_kind
```

where `relation_kind` is one of isomorphism, induced embedding, embedding, homomorphism, quotient/projection, specialization, common-core relation, non-isomorphic, or unresolved.

### D2. No ranking among projections

A boundary-preserving isomorphism and a mapped-signature isomorphism are not competing strengths in one total order. They answer different questions.

**Correction:** never “prefer” projection types. Compare only within the requested projection or report a matrix of results.

### D3. PS isomorphism requires bijective mapped-signature correspondence

An explicit semantic-symbol mapping is insufficient to justify a mapped-signature **isomorphism** if the selected symbol correspondence is not bijective over the compared role set.

**Correction:** PS records map cardinality/injectivity/surjectivity. Non-bijective maps are reported under the appropriate weaker relation kind.

### D4. PC label removal can destroy structure

A semantic label may be the head/role node of an incidence edge. “Removing” it can remove the relation itself.

**Correction:** label blindness anonymizes or maps non-evidential identities while preserving incidence/role structure. Only pure annotation edges explicitly declared non-semantic may be excluded.

### D5. Failure to find a mapping is not proof of non-isomorphism

Search may be incomplete, resource-bounded, or heuristic.

**Correction:** `NON_ISOMORPHIC` requires an exhaustive/proof-producing negative result under the declared finite comparison problem or an independently checkable obstruction certificate. Search exhaustion/resource limits return `UNRESOLVED/NO_WITNESS_FOUND`.

### D6. “Maximum common core” requires search completeness

A candidate core found under a heuristic cannot be called maximum merely because no larger core was found.

**Correction:** maximum claims record optimization measure and completeness certificate. Otherwise report candidate/maximal cores with the known search bound.

---

## E. Identity, label, and comparison-role safety

### E1. “Candidate mappable semantic identity” is itself a hypothesis

Marking an identity mappable after seeing the desired counterpart can manufacture an isomorphism.

**Correction:** mapping eligibility is either source-local and frozen before comparison or explicitly introduced as a pair-specific hypothesis in the witness and subjected to adversarial controls.

### E2. Port declarations can also be target-biased

Ports are essential, but choosing ports after seeing a target can force compatible interfaces.

**Correction:** source/component ports are derived or declared independently before pairwise comparison. Pair-specific boundary correspondences map existing ports; they do not create them.

### E3. Rigid labels and source vocabulary remain separate from structural evidence

Labels used for retrieval may remain present, but their lexical/numeric identity is never class-membership evidence unless the projection explicitly treats that identity as rigid model content.

---

## F. Structural-class schema correctness

### F1. Class schema identity must include versioned definition

See C3. Membership to a mutable label is not durable evidence.

### F2. Negative constraints are part of the schema

NACs, forbidden edges, disequalities, exclusion conditions, and absence constraints can distinguish near-isomorphic objects.

**Correction:** class schemas and witnesses explicitly map/check negative as well as positive constraints.

### F3. Exact class membership needs map-kind semantics

A schema with optional, variadic, or residual-permitted structure cannot use the same witness contract as exact isomorphism.

**Correction:** class membership states its required map kind and residual policy. Exact instance, specialization, embedding, and homomorphic image remain distinct.

### F4. Class hierarchy/factorization edges also need witnesses

Saying C7 factors through C1 is itself a structural claim.

**Correction:** class-to-class specialization/composition/factorization is qualified by the same witnessed-comparison machinery as domain instances.

---

## G. Witness correctness

### G1. A witness is not self-validating

An agent can emit a plausible but wrong node map.

**Correction:** every comparison/class witness is independently checkable against the two frozen structures and projection. Qualification includes a separate witness-validation pass/certificate checker.

### G2. Residual reconstruction needs a gluing map

`A = C + ΔA` is incomplete unless the cut relations and attachment map are known.

**Correction:** residual output contains boundary-cut relations and gluing/attachment information sufficient to reconstruct the original compared structure under the selected factorization.

### G3. Negative constraints survive into residuals

Unmatched absence/disequality/guard constraints incident on the common core are residual structure, not ignorable metadata.

### G4. “Materially distinct mappings” needs a safe default

Materiality cannot be an undocumented heuristic.

**Correction:** preserve distinct valid witnesses by default. Collapse only under an explicit automorphism/equivalence quotient whose irrelevance to the requested downstream operation is witnessed.

---

## H. Label-blind / anti-cheating qualification

### H1. Decomposition must be frozen before counterpart exposure

See C1.

### H2. Familiar structure can still trigger pretrained prototypes

Label hiding alone does not prevent an agent from recognizing a textbook graph/formula and snapping to known semantics.

**Correction:** class/isomorphism qualification includes novel synthetic structures, modified familiar structures, and adversarial near-isomorphs with the same generic skeleton.

### H3. Same-label/different-structure negatives are required

Misleading-label tests should include both swapped labels and identical labels attached to structurally different objects.

---

## I. Scope, multiplicity, and rewrite occurrence semantics

### I1. Set-like scope semantics remains too lossy as the new default

Draft 0.9 preserves Draft 0.2 set semantics after an ingest warning. That still requires upstream code to anticipate every case where multiplicity matters.

For isomorphism discovery the safer information-preserving default is occurrence-preserving unordered membership.

**Correction:** new consolidated semantics use unordered **occurrence-preserving/multiset** scope membership. Idempotent/set semantics are a derived quotient/profile rule. Frozen Draft 0.2–0.9 artifacts retain historical set-like decoding where applicable.

### I2. Rewrite “add if not already present” inherits unsafe set semantics

Draft 0.1 rewrite behavior suppresses duplicate RHS structure.

**Correction:** new canonical rewrite semantics operate on structural occurrences. Idempotent addition/removal is explicit when a theory/profile chooses set-like semantics.

### I3. Duplicate nested scopes must remain distinguishable

Two identical-looking child scopes can be distinct occurrences even when their internal atoms are isomorphic. Occurrence identity/multiplicity is therefore structural unless explicitly quotiented.

---

## J. Reference hygiene

### J1. Order-independent reference resolution is correct but incomplete

Add the B1/B2 hygiene rules to the current spec and comparison protocol.

---

## K. Operational-role clarity

### K1. Active-rule role remains structurally contextual

Direct containment is explicit structure, so it is not hidden in the same way as “formula context.” However, a first-class inert rule placed directly in an active scope cannot be represented without an additional wrapper/role.

**Correction:** new consolidated semantics distinguish rule object from rule activation. Activation may be derived from an explicit active-rule relation/class or a declared execution profile. Legacy direct-containment activation remains readable for historical artifacts.

This removes artificial quotation scaffolding and makes active/inert rule role directly comparable.

### K2. Negative application condition scope is load-bearing

NAC absence is relative to a declared match/application boundary. Witnesses preserve that boundary and the negative condition.

---

## L. Bundle and dependency semantics

### L1. Spec/profile revision must be self-identifying

See A3.

### L2. Dependency closure may be recursive

`Deps(T)` can contain mutually recursive definitions. Treat it as a dependency graph/SCC closure, not an assumed acyclic expansion sequence.

### L3. Load-bearing environment facts must be imported

An “implementation/environment fact” is not self-contained unless its value/relation is frozen or explicitly imported into the native bundle used for qualification.

---

## M. Equality and semantic equivalence

### M1. Object-theory equality must not collapse structural nodes under P0/PB/PS/PC

A statement `A == B` is a formula/constraint, not structural identity.

**Correction:** node collapse due to represented equality is PE/PQ behavior and must be witnessed; pure structural isomorphism preserves the distinct nodes unless they are structurally identical by identity.

---

## N. Consolidation requirement

The amendment chain has reached the point where another narrow amendment would increase semantic risk.

**Correction:** Draft 0.10 should be a self-contained consolidated candidate that:

- incorporates the surviving base semantics from Draft 0.1;
- incorporates every valid correction through Draft 0.9;
- removes context-only overloads for new artifacts;
- makes occurrence-preserving scope/rewrite semantics the information-preserving default;
- separates projection from relation kind;
- pins semantic revision/profile;
- requires independent decomposition freeze and witness verification;
- keeps useful labels/classes as downstream construction aids;
- preserves historical drafts only as frozen experiment evidence.

---

## Disposition

Draft 0.9 is a major improvement but is not yet safe enough to serve as the sole isomorphism authority.

The remaining corrections are structural, not cosmetic. They directly protect against false positives, false negatives, and representation-choice dependence.
