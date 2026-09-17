# AxiomeSH Draft 0.1–0.8 Line Review — Isomorphism Safety

**Status:** corrective audit  
**Scope:** `CORE_SPEC_DRAFT_0_1.md` through `CORE_SPEC_DRAFT_0_8_CANDIDATE.md`  
**Review objective:** find every specification statement in the current lineage that can cause false isomorphisms, missed isomorphisms, decomposition bias, hidden semantic dependence, or premature core growth.

This review treats the historical drafts as evidence and preserves them for reproducibility. Corrections belong in the next amendment rather than rewriting the old experiment inputs.

## Governing correctness target

AxiomeSH must make structural correspondence discoverable without allowing names, serialization choices, decomposition choices, or convenience syntax to determine the answer.

The required order is stricter than Draft 0.8 currently states:

```text
source semantics
-> one or more qualified decompositions
-> representation-only normalization
-> label-independent structural comparison
-> explicit mapping/factorization witness
-> exact/common-core/residual result
-> structural-class recognition
-> retained useful labels
```

A class label is a conclusion and retrieval handle. It is never evidence for its own class membership.

---

# Draft 0.1 review

## Purpose / constitution

### Sound

The following original requirements remain load-bearing:

- semantic fidelity;
- explicit structural semantics;
- canonical integrity;
- recoverability;
- no hidden adapter semantics;
- agent qualification;
- architecture independence.

The original statement that relations, rules, derivations, theories, and invariants should be representable in one structural substrate is aligned with isomorphism discovery.

### Problem: canonical integrity is underspecified

Draft 0.1 requires identity/equivalence to remain stable but does not separate:

- serialization normalization;
- alpha/boundary structural canonicalization;
- definitional expansion;
- theorem-level semantic equivalence.

If those are allowed to collapse into one operation, a canonicalizer can create or destroy an apparent isomorphism.

**Correction:** define separate normalization/equivalence layers and require every comparison result to name which layer/projection it uses.

## Minimal symbology / absent operators

### Problem: co-presence example risks promoting scope to conjunction

Draft 0.1 gives co-presence inside `[]` as an initial representation of conjunction while `[]` is also a general structural boundary. Draft 0.2 later turns this into context-sensitive formula conjunction.

The same raw shape must not acquire different semantics merely because an external consumer decides it is in “formula context.” That hides a load-bearing role outside the structure.

**Correction:** ordinary scope is a structural boundary/container. A conjunction interpretation must be carried by an explicit construction/class/profile role. Legacy Draft 0.2 payloads remain reproducible, but new canonical material must not depend on unmarked context-only conjunction.

## Scopes

### Problem: too many roles are provisionally unified

Draft 0.1 lets one scope act as grouping, graph boundary, rewrite boundary, state representation, and recursive object. Reuse of one carrier is acceptable only if the role relevant to semantics is reconstructable from surrounding structure.

**Risk:** two textually/graphically identical scopes can compare equal even though one is an active rewrite state and another is quoted/data structure.

**Correction:** comparison must preserve the structurally determined role and operational nesting. If role is not inferable from structure, it must be explicit.

## Natural boundaries

### Problem: crossing identity alone is not a sufficient interface model

Draft 0.1 derives a boundary from identities occurring inside and outside a scope. That is useful, but it does not specify:

- which exposed identities are input/output/parameter ports;
- whether a port is rigid or mappable;
- boundary cardinality/variance constraints;
- whether two internal isomorphisms induce compatible external composition.

**Correction:** structural-class schemas and component comparison require explicit interface/port sets and a boundary mapping witness. Shared identity remains one way to realize a port, not the entire interface semantics.

## Rewrites / local activation

### Problem: active-versus-represented rule role is context-sensitive

A rule directly inside a scope is active there, while a rule may also be first-class data. This is safe only because nesting is structural; comparison must not erase the nesting that determines activation.

**Correction:** operational context is load-bearing structure and cannot be removed by class projection/canonicalization.

## Fresh RHS variables

Draft 0.1's implicit RHS-only freshness was correctly superseded by Draft 0.2. No further reliance on the old convention is allowed.

## Negative matching

Draft 0.1 already marks `!` for attempted elimination. Primitive status remains unproven. Matching absence and declarative negation must remain distinct classes/roles.

## Multiway semantics

The “all valid successors” rule is structurally useful. Search/execution policy must remain non-semantic unless explicitly represented.

## References

Reference transparency is correct. References must be removed before structural comparison without changing sharing semantics; reference spelling can never serve as an isomorphism cue.

## Identity / isomorphism

### Problem: isomorphism relation is too coarse

Draft 0.1 defines closed structural isomorphism but only gestures at boundary-preserving isomorphism. It lacks:

- comparison projection;
- explicit symbol/literal mapping policy;
- mapping witness;
- embeddings/specializations;
- maximum/common-core + residual output;
- multiple valid decompositions.

**Correction:** comparison must return a witnessed relation under an explicit projection, not a bare boolean.

## Composition

### Problem: common-scope/shared-identity composition is insufficient

Draft 0.1 already warns about joint realizability but does not make a compatibility/gluing witness mandatory.

**Correction:** class composition requires an explicit gluing map plus all compatibility constraints needed for joint realization. Two locally matching parts do not compose merely because their identities can be unified.

## Canonicalization

### Problem: serialization canonicalization and semantic equivalence are not separated

Ignoring whitespace, atom spelling, reference numbering, and unordered-member order is appropriate. Applying theorem/definition rewrites, algebraic equivalences, beta/substitution, or class-label expansion is a different operation.

**Correction:** default canonicalization removes only representation noise and alpha-renamable choices. All stronger transformations require explicit qualified rewrite/equivalence witnesses.

---

# Draft 0.2 review

## Three identity classes

### Problem: fixed semantic labels can hide cross-domain isomorphism

`^n` is stable and not alpha-renamable, which is correct for source fidelity. However, ordinary structural comparison with all `^n` rigid will miss isomorphisms between independently labeled theories.

Draft 0.2 mentions an “explicit symbol mapping” but does not define its validity or witness.

**Correction:** distinguish semantic identity from comparison projection. Closed comparison keeps labels rigid; mapped-signature/class comparison may map selected semantic identities only through an explicit role-preserving bijection/witness.

### Problem: literals need schema-parameter treatment

Exact literals should be rigid by default. But a structural class may abstract a literal position into a parameter slot. This is not literal renaming and must not be confused with it.

**Correction:** class schemas may parameterize a literal position explicitly; instance comparison records the parameter values as residual/arguments rather than silently alpha-renaming values.

## Semantic-symbol-headed application

### Problem: application role can become semantic shortcut

A `^n` head receives application semantics by token class. This remains useful surface structure, but class discovery must compare the expanded role/relations rather than conclude equivalence because two nodes both have “application” shape.

**Correction:** application is a surface/structural role; mathematical predicate/function semantics remain supplied by the theory/class construction.

## Declarative implication

### Problem: wording overstates core semantics

Draft 0.2 says `A => B` means satisfaction of the left “structurally entails” the right. Draft 0.5 later correctly says the token does not select a proof calculus.

**Correction:** treat `=>` as a stable declarative implication constructor/surface whose exact satisfaction/inference laws are profile-owned. Do not use core wording that implies one global entailment semantics.

## Formula conjunction

### Critical problem: context-only semantic overloading

Draft 0.2 gives ordinary `[]` conjunction semantics when consumed “in formula context.” This makes semantic role depend on an external/contextual interpretation not present in the scope itself.

This can create both false positives and false negatives during isomorphism discovery.

**Correction:** for new artifacts, raw scope means structural boundary/container only. A conjunction construction must be explicit in native structure or carried by a qualified class/profile wrapper. Preserve legacy decode rules only for frozen Draft 0.2 artifacts.

## Choice `{...}`

The alternative/disjunction distinction is required, but irreducible primitive status is not established. Keep the compact surface while requiring an erasure-safe structural-class/profile definition.

## Quantifiers

### Problem: lexical ownership and quantifier semantics are conflated

`*?n`/`+?n` package both binding and universal/existential semantics.

**Correction:** retain compact surfaces, but decompose into:

- lexical binder ownership;
- domain/generator relation;
- universal/existential satisfaction class/profile semantics.

This is necessary for cross-domain matching with modal/temporal generated-region quantification.

## Equality

### Problem: one `==` surface can conceal multiple equality notions

Structural identity, object-theory equality, extensional function equality, proposition equivalence, and observational equivalence are not one relation.

**Correction:** retain `==` only as a profile-selected equality surface. Comparison/canonicalization may not use it as structural identity unless the profile explicitly proves that identification.

## Negation

### Problem: “classical negation” is incorrect at core level

Draft 0.5 later says the proof theory may be intuitionistic, paraconsistent, etc.

**Correction:** rename the conceptual role to “declarative negation surface.” Its laws are profile-owned. The token remains distinct from negative match.

## Duplicate scope membership

### Problem: set canonicalization can erase source multiplicity

Draft 0.2 makes ordinary scope membership set-like. That is acceptable only after the source decomposition has established multiplicity as irrelevant or encoded occurrence identity/count explicitly.

**Correction:** ingest/decomposition must preserve source multiplicity before ordinary-scope canonicalization. A comparison may never infer “duplicate means irrelevant” from serialization alone.

## Freshness

### Critical problem: `+?n` is overloaded by context

The same surface denotes declarative existential quantification or operational fresh allocation depending on rewrite-RHS context.

**Correction:** frozen payloads retain legacy behavior, but new canonical artifacts must represent freshness with an explicit construction/role rather than depending only on position to change the meaning of `+?n`.

## Boundary-aware comparison

The distinction between closed and boundary-preserving comparison is correct, but the boundary bijection must become a first-class comparison witness and must preserve port roles/constraints, not merely identity cardinality.

## Canonicalization additions

### Problem: “semantic symbols are not renamed” conflicts with cross-theory comparison unless layers are separated

Correct for semantic identity; incomplete for structural comparison.

**Correction:** distinguish canonical semantic identity from a mapped comparison projection. Mapping a label for comparison does not mutate the theory or its canonical identity.

---

# Draft 0.3 review

## Lexical scope

The lexical-scope tightening is sound. Alpha-equivalence should remain a representation-only equivalence with capture avoidance.

## `^0` signature marker

### Problem: reserved marker is convenient surface, not proven primitive

Draft 0.8 correctly reopens this question.

**Correction:** retain `^0` for frozen/canonical experiment serialization, but treat a signature as ordinary native structure for final primitive-status analysis.

## Signature closure

### Problem: closure is surface-relative

Declaring every used `^n` is useful for a serialized bundle, but derived-alias expansion or an alternative decomposition changes the set of used labels without changing the represented semantics.

**Correction:** distinguish surface signature, dependency closure, and comparison/decomposition signature. Exactness belongs to a layer, not to semantic identity in the abstract.

## Symbol meaning

The statement that identity/incidence/formulas/axioms/constraints determine meaning is directionally correct. However, fixed symbol identity cannot be evidence for cross-domain similarity.

**Correction:** label-blind/mapped comparison is required for class discovery.

## Multi-document bundles

### Problem: concatenation equivalence lacks namespace/boundary conditions

Concatenation preserves theory only if scope/reference namespaces, binding visibility, dependency ordering, and bundle boundaries remain equivalent.

**Correction:** bundle composition requires explicit partition-preservation conditions rather than an unconditional concatenation claim.

---

# Draft 0.4 review

## Exact bundle signature

### Problem: `Sig(T)` is tied to the surface syntax

A bundle with a transparent alias and its alias-erased expansion can have different `Sig(T)` sets while representing the same object.

**Correction:** define:

```text
surface signature
native dependency closure
signature of a selected decomposition/factorization
```

and never use surface-signature equality as evidence of structural isomorphism.

## Native/formal probes

Raw-ID probes are appropriate for cold reconstruction. They are **not** appropriate evidence for label-independent isomorphism discovery.

**Correction:** keep reconstruction qualification separate from structural-discovery qualification, which must include label permutation/removal controls.

## Canonical presentation

Presentation normalization is safe only if it remains explicitly non-semantic. Keep this separation.

## Primitive semantic symbols

Draft 0.4's allowance for opaque primitives is superseded by the stronger decomposition burden in Draft 0.7. Model leaves may remain opaque only with explicit source/model justification.

---

# Draft 0.5 review

## Formula terms as first-class

Sound and useful.

## Theory-owned advanced operators

### Problem: “theory-owned” was too permissive

Draft 0.7 correctly fixes the possibility of hiding known compound semantics behind `^n` operators.

**Correction:** advanced operator labels remain useful surfaces only after decomposition/class mapping.

## Implication/negation proof neutrality

Sound. This also confirms that `=>`/`~` are not themselves complete logical semantics.

## Lexical abstraction

### Problem: introduced as a primitive before decomposition attempt

A first-class bound body is required; a new irreducible token may not be.

**Correction:** retain `\?n BODY` as a canonical bound-body surface and candidate structural class. Test explicit binder/body/occurrence construction before core promotion.

## Higher-order application

### Problem: theory-owned `apply` can still be opaque

Draft 0.7/0.8 correctly require function graph/application semantics or another explicit function model.

**Correction:** application labels map to a qualified function-application class/instance; host application cannot be semantic authority.

## Types / proof profiles / meta-theory

The separation of profile-owned semantics from core is sound. Class discovery must nevertheless compare the decomposed profile structures label-blindly rather than compare profile names.

---

# Draft 0.6 review

## `@@` structural instantiation

### Critical problem: premature core promotion

Capture-avoiding substitution may be representable as an ordinary constrained structural rewrite over explicit binder/occurrence ownership.

**Correction:** retain `@@` as a named/canonical bound-body-instantiation surface and focused test target; primitive status remains unqualified until rewrite-level decomposition is attempted and compared.

## Variable left operand

### Problem: type/shape constraint is externalized

Draft 0.6 allows a variable left operand if surrounding structure constrains it to an abstraction. A verifier must have an explicit native witness/constraint for that classification.

**Correction:** no hidden “resolves to abstraction” judgment. The operand-shape/class constraint must be represented or derivable natively.

## Capture avoidance

The semantic requirement is correct and should become part of the bound-body-instantiation class invariants.

## Quantifier explicit forms

The compact/explicit equivalence is a useful serialization equivalence only after lexical binder ownership and quantifier semantics are separated. Do not use it to prove that quantifier syntax itself is primitive.

## Context-sensitive existential/freshness

The legacy overload remains unsafe for new canonical content. See Draft 0.2 correction.

## Canonicalization

### Critical problem: optional reduction destroys canonical uniqueness

Draft 0.6 says a canonicalizer **MAY** reduce a closed instantiation. Two canonicalizers can therefore produce different “canonical” objects.

**Correction:** structural canonicalization never optionally performs semantic/definitional reduction. Instantiation reduction is a separately named qualified transformation. If a comparison uses post-instantiation normal form, that choice must be explicit and witnessed.

## “Core owns structural binding/instantiation”

Binding ownership may prove representation-general; instantiation syntax has not. This claim is demoted to candidate status.

---

# Draft 0.7 review

## Primitive floor

### Problem: candidate surfaces are listed as if already admitted primitives

The list includes literals, semantic symbols, choice, implication/equality/negation, abstraction, and instantiation. Draft 0.8 later correctly reopens their primitive status.

**Correction:** read the list as “currently available candidate surfaces,” not proven irreducible primitives.

## Alias erasure / primitive-normal form

### Critical problem: assumes one preferred normal form

A source object may have more than one faithful decomposition/factorization. Forcing one chosen expansion can make isomorphism depend on decomposition choice.

**Correction:** maintain a decomposition/factorization graph. A unique normal form may be used only when convergence/canonicity has been qualified. Otherwise preserve all qualified decompositions or their equivalence witnesses.

## Satisfaction recursion

Sound as a prohibition on hidden evaluators. However, there may be multiple equivalent satisfaction constructions/proof calculi.

**Correction:** do not make one implementation the unique structural identity unless equivalence is established.

## Primitive leaves

### Problem: “source/model supplied” alone is not enough

A source may itself package a compound derived notion as a primitive name.

**Correction:** source provenance is necessary but not sufficient. The irreducible-leaf burden still applies; record whether a leaf is observational input, stipulated axiom, or decomposable derived source construct.

## E1P/E1A

Useful, but alias erasure must become decomposition-set/factorization qualification rather than a mandatory path to one primitive-normal serialization.

---

# Draft 0.8 review

## Decompose -> canonicalize -> compare

### Critical problem: “canonicalize” is undefined at exactly the dangerous point

If canonicalization performs theorem-equivalent rewrites or preferred decomposition, it can manufacture the class being sought.

**Correction:** only representation normalization and alpha/boundary canonicalization occur before structural comparison by default. Definitional expansion is a separately witnessed transformation.

## Structural class definition

### Critical problem: no explicit interface/port schema or membership witness

A reusable class cannot be just an informal “parameterized pattern.” It needs:

- internal schema structure;
- typed/role-constrained parameter slots;
- exposed boundary ports;
- rigid versus mappable identities;
- invariants and admissible mappings;
- optional residual policy;
- decomposition dependencies.

**Correction:** class membership is valid only with an explicit mapping witness from class schema/ports into the instance structure.

## Labels

### Problem: labels are said to help detection of isomorphisms

Labels may help retrieve candidate pairs, but they must not participate in proof of structural correspondence.

**Correction:** structural discovery qualification is label-blind. Re-run with domain/class labels removed or permuted; the witnessed relationship must be unchanged.

## Instance / specialization / composition

### Problem: categories are informal and can collapse distinctions

**Correction:**

- exact instance: schema maps with no unexplained residual;
- specialization: schema maps plus explicit additional constraints/residual;
- composition: multiple schema witnesses plus explicit gluing/compatibility map;
- embedding/common core: partial injective mapping plus residual structures.

## Two-stage erasure

### Problem: still assumes a singular primitive-normal form

**Correction:** erasure yields a qualified decomposition node in a factorization graph. If multiple nodes are valid, preserve them until a proven equivalence/confluence relation justifies collapse.

## Construction specification

Add required fields:

```text
boundary/ports
rigidity/mappability roles
membership witness format
residual semantics
alternative decompositions
comparison projection
provenance of each primitive leaf
```

## Cross-domain synthesis

The examples are useful hypotheses. They must be tested through label-blind mappings and near-isomorphic negatives rather than accepted from semantic familiarity.

## Qualification gates

E1C/E1E are insufficient alone. Add:

- witnessed structural comparison;
- label-blind control;
- boundary negative control;
- near-isomorphic negative control;
- alternative-factorization invariance;
- common-core/residual recovery.

---

# Cross-cutting corrections required

## 1. Distinguish five relations that the current lineage partially conflates

```text
serialization equivalence
alpha/structural isomorphism
boundary-preserving structural isomorphism
mapped-signature/class-schema isomorphism
profile-specific semantic/behavioral equivalence
```

No one relation may silently stand in for another.

## 2. Decomposition is a relation, not necessarily a function

Do not assume:

```text
source -> one canonical primitive-normal form
```

Default to:

```text
source -> {qualified decompositions/factorizations}
```

with native witnesses connecting equivalent factorizations where known.

## 3. Every isomorphism/class result requires a witness

At minimum record:

```text
comparison projection
node/edge/port mapping
parameter mapping
rigid identities preserved
constraints checked
common core
residual A
residual B
```

A bare class label or boolean result is not sufficient evidence.

## 4. Boundary and composition are constitutional

Internal isomorphism does not imply component substitutability. Exposed ports and gluing constraints are part of the compared object whenever composition matters.

## 5. Labels are useful but evidentially downstream

Labels can:

- retrieve candidate structures;
- name classes;
- preserve source vocabulary;
- guide construction after a class is qualified.

They cannot:

- choose the decomposition;
- establish class membership;
- establish isomorphism;
- erase residual constraints.

## 6. Partial isomorphism is a first-class result

The comparison result should support:

```text
exact isomorphism
boundary-preserving isomorphism
specialization/embedding
common core + residuals
non-isomorphic under projection
unresolved because decomposition/equivalence is incomplete
```

## 7. Class catalog must be a hypothesis lattice, not a flat ontology

Several current candidate classes may factor into broader families or compositions. In particular:

- universal/existential/immediate-successor evaluation likely share a generated-region evaluation family with different quantifier/cardinality constraints;
- transition-preservation is plausibly a composition of precondition gating plus universal evaluation over transition successors;
- functional-graph application is relation-image selection plus uniqueness/totality constraints;
- bound-body instantiation may be a constrained rewrite class rather than a separate irreducible operation.

Do not collapse them yet; record these as factorization hypotheses and test them structurally.

## 8. Adversarial qualification is mandatory

For every proposed class/comparison procedure include:

```text
cross-domain positive pair
renaming/serialization positive pair
near-isomorphic negative pair
same-interior/different-boundary negative pair
partial-isomorphism pair
alternative-factorization pair
misleading/swapped-label pair
```

A class system that passes only positive examples is not qualified for AxiomeSH's central use.

---

# Disposition

The historical drafts remain frozen evidence.

The next normative amendment must:

1. make the comparison projection explicit;
2. separate normalization layers;
3. make decompositions/factorizations plural by default;
4. require class/isomorphism witnesses;
5. make boundaries/ports part of class schemas;
6. make common-core/residual output first-class;
7. require label-blind qualification;
8. make signatures layer-relative;
9. prohibit new context-only semantic overloads;
10. demote unproven post-0.1 syntax from assumed primitive status while retaining useful labels/surfaces.
