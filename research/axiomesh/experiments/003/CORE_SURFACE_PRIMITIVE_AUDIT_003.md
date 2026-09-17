# Experiment 003 — Candidate Core Surface / Primitive Audit

**Status:** active audit after Draft 0.10 second-pass isomorphism review  
**Purpose:** preserve useful syntax/labels without mistaking them for proven irreducible structure or allowing them to contaminate structural comparison

## Governing questions

For every candidate surface ask separately:

```text
semantic distinction required?
compact/canonical surface useful?
irreducible primitive demonstrated?
comparison/isomorphism role safe?
namespace/target-layer behavior explicit?
```

These are different questions.

A useful surface may remain indefinitely even when its semantics decompose into lower native structure.

## Strongest original substrate candidates

The strongest current substrate candidates remain:

- structural identity;
- ordered incidence/hyperedge structure;
- explicit scope/boundary;
- pattern-variable ownership for structural matching;
- structural rewrite;
- negative application condition, still subject to elimination audit;
- serialization references as non-semantic compression.

Even these remain experimental.

Draft 0.10 adds that any surface affecting comparison must have explicit namespace, rigidity/mappability, boundary, and target-layer behavior under the frozen comparison policy.

---

# Exact literal `#n`, `#p/q`

Required distinction: **YES.** Exact value must not collapse into alpha-renamable identity.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: structural numeral/rational object plus canonical value relations.

Reason to retain surface: compactness and exact-value clarity.

Comparison rule:

- literals are rigid by default;
- a predeclared class schema may expose a literal position as a parameter slot;
- parameterization is not literal alpha-renaming;
- post-hoc conversion of a failed literal match into a parameter is forbidden.

Current disposition: **retain canonical value shorthand; audit token-class irreducibility separately.**

---

# Stable semantic symbol `^n`

Required distinction: **YES.** Stable theory/class/instance labels must differ from local alpha identities.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: ordinary structural identity plus explicit declaration/namespace/rigidity role.

Reason to retain surface: efficient labels for relations, classes, source vocabulary, retrieval, and dependencies.

Draft 0.10 correction:

```text
semantic identity = (theory/signature namespace, local ^n)
```

unless a shared/global namespace is explicitly represented.

Therefore:

- identical numeric `^n` across independent namespaces is not evidence of sameness;
- P0/V0-style comparison keeps namespace-qualified semantic identities rigid;
- VS/VC may search for explicit mappings without mutating either theory;
- source/class labels may retrieve candidates but cannot prove matches.

Current disposition: **retain label surface; namespace and comparison role are mandatory; primitive token-class status remains open.**

---

# Semantic-symbol-headed application `(^n ...)`

Required convenience: **YES/useful.** Ordered semantic application is compact and reconstructable.

Primitive status of the application interpretation: **NOT ESTABLISHED.**

Risk:

Two symbol-headed edges can look like the same “application class” while the underlying operations differ in arity contract, argument roles, function/relation semantics, domain/codomain constraints, or theory namespace.

Current disposition:

- retain the surface;
- compare the represented operation/relation contract, not merely the head-token pattern;
- higher-order/function semantics still require explicit function/relation construction;
- symbol-headed shape alone is not class or semantic-equivalence evidence.

---

# Declarative implication `A => B`

Required distinction: **YES** at represented-theory/source-formula level.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: formula/relation object with antecedent/consequent roles plus profile semantics.

Draft 0.2 wording that implication “structurally entails” the consequent is too strong as a universal core claim. Draft 0.5 correctly places proof laws in profiles.

Current disposition: **retain concise surface; do not infer a proof calculus or theorem equivalence from the token.**

---

# Declarative equality `A == B`

Required distinction: **YES** where a theory asserts equality beyond shared object identity.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: equality-relation object plus profile authority for reflexivity/substitution/congruence/extensionality.

Structural identity, object-theory equality, proposition equivalence, extensional function equality, observational equivalence, and comparison isomorphism remain distinct.

Current disposition: **retain surface; never use it as structural identity without explicit profile authority.**

---

# Declarative negation `~A`

Required distinction: **YES**, especially distinct from match-level `!`.

Primitive status: **NOT ESTABLISHED.**

Current conceptual role: **declarative negation surface**.

Classical, intuitionistic, paraconsistent, and other laws remain profile-specific.

Current disposition: **retain surface; no global proof semantics.**

---

# Choice `{...}`

Required distinction: **YES** for explicit declarative alternatives.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: alternative object + member relation + satisfaction rule.

Current disposition: **retain useful surface; audit as canonical class/profile constructor versus irreducible syntax.**

---

# Universal / existential binders `*?n`, `+?n`

Required distinctions:

- lexical variable ownership: **YES**;
- universal/existential quantifier kind: **YES** where used;
- quantified domain/generator: **YES and previously under-specified**.

Primitive status: **PARTLY OPEN.**

Required decomposition for current canonical semantics:

```text
binder ownership
+ quantifier kind
+ explicit/inherited native domain or generator
+ body
+ sort/guard constraints
+ universal/existential evaluation contract
```

A profile-wide default domain is acceptable only when it is native dependency structure.

Current disposition: **retain compact forms; binder ownership, quantifier semantics, and domain generation are separate auditable components.**

---

# `+?n` existential versus operational freshness

Required distinctions: **BOTH required.**

Legacy overload: **UNSAFE FOR NEW CANONICAL ARTIFACTS.**

Historical Draft 0.2 artifacts may interpret RHS-position `+?n` as fresh allocation. New artifacts require explicit freshness construction/role.

Current disposition: **legacy decode only; do not rely on syntactic position to switch semantics.**

---

# Lexical abstraction `\?n BODY`

Required distinction: **YES** for first-class bound bodies.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction:

```text
binder identity
+ body relation
+ occurrence ownership
+ scope/boundary
```

Current disposition: **retain canonical bound-body surface; compare against lower explicit binder structure before primitive promotion.**

Binder numbering is alpha; ownership is load-bearing.

---

# Structural instantiation `ABSTRACTION @@ ARGUMENT`

Required operation: **YES** if native profiles manipulate bound bodies without host substitution.

Primitive status: **ESPECIALLY UNESTABLISHED.**

Possible lower construction: constrained structural rewrite over binder-owned occurrences with explicit capture avoidance/alpha-renaming.

Current rules:

- `@@` is a candidate named construction, not assumed irreducible core;
- reducing it is D/E transformation, not N0/N1 canonicalization;
- abstraction-shape constraints must be native/derivable;
- an exact lower factorization must round-trip to the compact surface or be labeled non-exact.

Current disposition: **highest-priority primitive/class factorization challenge.**

---

# Formula-scope conjunction

Required distinction: conjunction/co-satisfaction must be representable.

Primitive status of `scope == conjunction`: **NOT ESTABLISHED and unsafe as context-only semantics.**

For new current-semantics artifacts:

```text
raw [] = structural scope/boundary/container
conjunction/co-satisfaction = explicit construction/profile role
```

Frozen legacy artifacts retain their historical decoder.

---

# Scope/carrier roles generally

A scope can serve grouping, boundary, operational-state/rewrite, represented-data, or bundle roles.

Reuse of one carrier is acceptable only when behavior-changing role is reconstructable from native containment/incidence.

If two identical carriers would behave differently only because an external reader calls one “state” and one “data,” the role must be made explicit.

Current disposition: **carrier reuse allowed; invisible behavior-changing role is not.**

---

# Negative structural match `!X`

Required distinction from declarative negation: **YES.**

Primitive status: **OPEN.**

`!X` is a structural absence condition over a matching scope.

It does not imply semantic falsity in an incompletely represented model.

A theory using absence-as-falsity must expose a closed-world/completeness contract.

Current disposition: **retain candidate matcher surface; audit eliminability and preserve completeness assumptions in comparison.**

---

# Signature marker `^0`

Required distinction: bundle vocabulary/dependency closure is useful.

Primitive status: **NO EVIDENCE.**

Current signature distinctions:

```text
surface signature
dependency closure
selected-factorization signature
```

Multi-document bundle partitioning is transparent only with namespace/binding/activation/boundary preservation.

Current disposition: **retain legacy/canonical experiment convention; not a proven substrate primitive or isomorphism cue.**

---

# References `@n`

Semantic role: serialization/compression only.

Current rules:

- reference numbering/spelling is non-semantic;
- visibility in new unordered serialization scopes is not based on sibling textual order;
- dependency graph must be acyclic unless a future explicit recursive-reference semantics is introduced;
- N0 expansion removes reference-binding artifacts from semantic comparison while preserving sharing.

Current disposition: **serialization mechanism, not semantic primitive.**

---

# Scope multiplicity

Ordinary scopes remain set-like in the current legacy/candidate surface.

Source multiplicity may nevertheless be load-bearing.

Decomposition must preserve occurrence identity/count before set-like canonicalization when multiplicity matters.

A canonicalizer may not infer that duplicate source occurrences are irrelevant merely because expanded member structures are isomorphic.

---

# Stable class labels and schema revisions

Useful class labels are retained, but a mutable label is not the qualified semantic object.

Current Draft 0.10 rule:

```text
navigation label -> exact immutable schema revision -> verified witness
```

Changing schema ports, parameters, constraints, factorization, or residual policy creates a new revision.

Current C1–C12 handles remain unqualified navigation labels.

---

# Canonicalization / normalization

Current layers:

```text
N0 serialization normalization
N1 alpha/representation normalization
D qualified definitional factorization/expansion
E profile/theorem equivalence
```

Only N0/N1 are default pre-comparison normalization.

No candidate surface gains semantic authority because a canonicalizer happens to reduce it.

---

# Promotion rule

No candidate syntax graduates to irreducible core merely because:

- several experiments use it;
- it is concise;
- it resembles standard notation;
- agents recognize it;
- a class catalog names it;
- removing it makes artifacts longer.

Promotion requires evidence that either:

1. faithful construction from lower structure fails; or
2. the lower construction is materially worse in correctness, reconstruction, reasoning performance, canonicality, isomorphism discovery, or lifecycle cost.

Otherwise prefer:

```text
qualified lower construction
+ stable namespaced class/domain label
+ optional compact surface
```

## Immediate test priorities

1. Express Draft 0.6 instantiation as structural rewrite over explicit binder/occurrence structure and compare with `@@`.
2. Separate lexical binding, quantifier kind, and quantified domain/generator.
3. Replace/test legacy scope-as-conjunction with explicit co-satisfaction construction.
4. Replace/test legacy `+?n` freshness overloading with explicit fresh-allocation structure.
5. Test stable semantic labels as namespaced declared identities under rigid versus signature-mappable views.
6. Test semantic-symbol-headed application against explicit relation/function contracts.
7. Measure structural numeral encoding versus `#` shorthand without disturbing rigid value semantics.
8. Test `^0` surface signature against dependency/factorization signatures and multi-document bundle partitioning.
9. Test `!` against lower matcher/constraint constructions and closed/open-world controls.

These audits determine the minimal substrate and safe comparison semantics of future AxiomeSH without invalidating frozen historical evidence.
