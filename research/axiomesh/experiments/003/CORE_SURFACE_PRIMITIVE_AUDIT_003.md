# Experiment 003 — Candidate Core Surface / Primitive Audit

**Status:** active audit aligned to Draft 0.11 consolidated semantics  
**Spec:** `../../CORE_SPEC_DRAFT_0_11_CONSOLIDATED_CANDIDATE.md`  
**Purpose:** preserve useful syntax/labels without mistaking them for proven irreducible structure or allowing them to contaminate structural comparison

## Governing questions

For every candidate surface ask separately:

```text
semantic distinction required?
compact/canonical surface useful?
irreducible primitive demonstrated?
comparison/isomorphism role safe?
namespace/target-layer behavior explicit?
occurrence/boundary semantics exact?
```

These are different questions.

A useful surface may remain indefinitely even when its semantics decompose into lower native structure.

---

# Strongest original substrate candidates

The strongest current substrate candidates remain:

- structural identity;
- ordered incidence/hyperedge structure;
- explicit scope/boundary;
- binding ownership for structural matching;
- structural rewrite;
- negative application condition, still subject to elimination audit;
- serialization references as non-semantic compression.

Even these remain experimental.

Draft 0.11 additionally requires information-preserving occurrence semantics, explicit activation/profile authority, hygienic references, namespace-safe labels, and label-independent witnessed comparison.

---

# Exact literal `#n`, `#p/q`

Required distinction: **YES.** Exact value must not collapse into alpha-renamable identity.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: structural numeral/rational object plus canonical value relations.

Reason to retain surface: compactness and exact-value clarity.

Current exact-literal contract:

- integer/rational value is rigid by default;
- rational denominator is nonzero;
- rational spelling is reduced/canonical;
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

Current identity rule:

```text
semantic identity = (namespace, local ^n)
```

unless a shared/global namespace is explicitly represented.

Therefore:

- identical numeric `^n` across independent namespaces is not sameness evidence;
- V0 keeps namespace-qualified labels rigid;
- VS/VC may search explicit mappings without mutating either theory;
- class/source labels may retrieve candidates but cannot prove matches.

Current disposition: **retain label surface; namespace/comparison role mandatory; primitive token-class status remains open.**

---

# Semantic-symbol-headed application `(^n ...)`

Required convenience: **YES/useful.**

Primitive status of application interpretation: **NOT ESTABLISHED.**

Risk:

Two symbol-headed edges can look like one “application class” while the underlying operations differ in ordered argument roles, arity, relation/function semantics, domain/codomain constraints, or namespace.

Current disposition:

- retain the surface;
- preserve ordered incidence;
- compare the represented operation/relation contract, not the head-token pattern;
- higher-order/function semantics require explicit native function/relation construction;
- tuple-position remapping requires qualified role/schema decomposition, not arbitrary permutation.

---

# Declarative implication `A => B`

Required distinction: **YES** at represented-theory/source-formula level.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: formula/relation object with antecedent/consequent roles plus profile semantics.

Current disposition: **retain concise surface; do not infer proof calculus or theorem equivalence from the token.**

---

# Declarative equality `A == B`

Required distinction: **YES** where a theory asserts equality beyond shared structural identity.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: equality relation + profile authority for reflexivity/substitution/congruence/extensionality.

Structural identity, object-theory equality, proposition equivalence, extensional equality, observational equivalence, and comparison isomorphism remain distinct.

Current disposition: **retain surface; never collapse structural nodes from `==` during pure structural comparison. Any collapse is explicit semantic/quotient authority.**

---

# Declarative negation `~A`

Required distinction: **YES**, especially distinct from match-level `!`.

Primitive status: **NOT ESTABLISHED.**

Current conceptual role: declarative negation surface.

Classical, intuitionistic, paraconsistent, and other laws remain profile-specific.

Current disposition: **retain surface; no global proof semantics.**

---

# Choice `{...}`

Required distinction: **YES** for explicit declarative alternatives.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: alternative object + member relation + satisfaction rule.

Draft 0.11 occurrence rule:

- alternative order is non-semantic;
- repeated alternatives remain separate occurrences by default;
- idempotence is a profile/class rule, not implicit duplicate collapse.

Current disposition: **retain useful surface; audit as canonical class/profile constructor versus irreducible syntax.**

---

# Universal / existential binders `*?n`, `+?n`

Required distinctions:

- lexical variable ownership: **YES**;
- universal/existential kind: **YES** where used;
- quantified domain/generator: **YES**;
- sort/guard constraints where applicable: **YES**.

Primitive status: **PARTLY OPEN.**

Required decomposition:

```text
binder ownership
+ quantifier kind
+ explicit/inherited native domain/generator
+ body
+ sort/guard constraints
+ universal/existential evaluation contract
```

A profile-wide default domain is valid only when represented as native dependency structure.

Current disposition: **retain compact forms; binding, quantifier kind, and generated-domain semantics are separately auditable components.**

---

# `+?n` existential versus operational freshness

Required distinctions: **BOTH required.**

Legacy overload: **UNSAFE FOR NEW ARTIFACTS.**

Historical Draft 0.2 artifacts may interpret RHS-position `+?n` as fresh allocation under their historical decoder.

Draft 0.11 requires explicit fresh-allocation/profile structure.

An ordinary RHS-only variable is invalid unless its value is supplied by explicit represented generation/freshness structure.

Current disposition: **legacy decode only; no position-only semantic switch.**

---

# Pattern variables and aliasing

Required semantics:

- repeated occurrence of the same variable requires one binding;
- distinct variables may alias the same object by default;
- distinctness requires explicit disequality/distinctness constraint;
- variables appearing only inside a negative application condition must already be bound positively or explicitly scoped/quantified by the matcher/profile.

These rules prevent hidden injectivity and hidden quantification.

Current disposition: **retain variable surface; ownership/aliasing constraints are load-bearing matcher semantics.**

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

---

# Structural instantiation `ABSTRACTION @@ ARGUMENT`

Required operation: **YES** if native profiles manipulate bound bodies without host substitution.

Primitive status: **ESPECIALLY UNESTABLISHED.**

Possible lower construction: constrained structural rewrite over binder-owned occurrences with explicit capture avoidance/alpha-renaming.

Current rules:

- `@@` is a candidate named construction, not assumed irreducible core;
- reducing it is D/E transformation, not N0/N1;
- abstraction-shape constraints must be native/derivable;
- exact lower factorization must round-trip to the compact surface or be labeled non-exact.

Current disposition: **highest-priority primitive/class factorization challenge.**

---

# Formula-scope conjunction

Required distinction: conjunction/co-satisfaction must be representable.

Primitive status of `scope == conjunction`: **NOT ESTABLISHED and unsafe as context-only semantics.**

For new Draft 0.11 artifacts:

```text
raw [] = structural scope/boundary/container
conjunction/co-satisfaction = explicit construction/profile role
```

Frozen historical artifacts retain their historical decoder.

---

# Scope/carrier roles generally

A scope may serve grouping, boundary, operational state, represented data, or bundle roles.

Reuse of one carrier is acceptable only when behavior-changing role is reconstructable from native structure/profile.

Current disposition: **carrier reuse allowed; invisible behavior-changing role is not.**

---

# Scope multiplicity / occurrence identity

Historical Draft 0.2 used set-like ordinary-scope membership.

That default is too lossy for an isomorphism substrate because upstream ingest would have to know in advance whether duplicate occurrences matter.

Draft 0.11 correction:

```text
scope order = non-semantic
scope occurrence multiplicity = semantic by default
set/idempotent membership = explicit quotient/profile
```

Two identical-looking child terms/scopes may therefore be two distinct occurrences.

If a theory proves duplicate irrelevance, that is a qualified quotient rather than default canonicalization.

Current disposition: **occurrence-preserving unordered membership for new Draft 0.11 artifacts; legacy set semantics remain historical only.**

---

# Rewrite occurrence semantics

Historical rewrite wording suppressed RHS structure already present in set-like state.

Draft 0.11 correction:

- matching is occurrence-preserving;
- nested boundaries are not crossed implicitly;
- duplicate RHS occurrences are not collapsed;
- set/idempotent update is an explicit profile/quotient;
- RHS-only variables have no implicit freshness;
- unmatched context persists;
- absent an explicit strategy, every valid rule/match application is a legitimate successor;
- serialization order does not imply rule priority.

Current disposition: **occurrence-preserving default; execution policy/profile explicit.**

---

# Rewrite activation / first-class rule objects

A first-class rewrite object may be represented as data without being active.

Historical direct-child activation is retained only as an explicit legacy execution profile.

For new Draft 0.11 reasoning bundles:

```text
rewrite object != activation authority
```

Activation is profile/construction-owned.

Current disposition: **remove hidden active/inert role from bare containment; preserve legacy behavior only under pinned historical profile.**

---

# Negative structural match `!X`

Required distinction from declarative negation: **YES.**

Primitive status: **OPEN.**

`!X` is structural absence relative to a declared match/application boundary and compatible bindings.

It does not imply semantic falsity in an incompletely represented model.

A theory using absence-as-falsity must expose a closed-world/completeness contract.

Current disposition: **retain candidate matcher surface; audit eliminability and preserve boundary/completeness assumptions.**

---

# Signature marker `^0`

Required distinction: bundle vocabulary/dependency closure is useful.

Primitive status: **NO EVIDENCE.**

Current signature distinctions:

```text
surface signature
dependency graph/closure
selected-factorization signature
```

Multi-document bundle partitioning is transparent only with namespace/binding/activation/boundary preservation.

Current disposition: **retain historical/canonical convention; not a proven primitive or isomorphism cue.**

---

# References `@n`

Semantic role: serialization/compression only.

Draft 0.11 rules:

- numbering/spelling is non-semantic;
- visibility does not depend on sibling textual order;
- dependency graph is acyclic;
- expansion is hygienic with respect to lexical binding/capture;
- repeated reference use does not identify use-site occurrences;
- N0 removes reference binding artifacts after resolution.

Current disposition: **serialization mechanism, not semantic primitive.**

---

# Stable class labels and schema revisions

Useful class labels are retained, but a mutable label is not the qualified semantic object.

Current rule:

```text
navigation label -> immutable schema revision -> verified witness
```

Changing schema ports, parameters, constraints, factorization, or residual policy creates a new revision.

Current C1–C12 handles remain unqualified navigation labels until exact schema revisions/witnesses exist.

---

# Canonicalization / normalization

Current layers:

```text
N0 serialization normalization
N1 source-local alpha/representation normalization
D qualified factorization/definition
E profile/theorem equivalence
```

Only N0/N1 are default pre-comparison normalization.

Reference hygiene, occurrence multiplicity, namespace-qualified rigid labels, negative constraints, ports, and quantifier domains survive N1.

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

1. Express `@@` as structural rewrite over explicit binder/occurrence structure and compare.
2. Separate lexical binding, quantifier kind, and quantified domain/generator.
3. Test explicit co-satisfaction against legacy scope-as-conjunction.
4. Test explicit fresh allocation against legacy `+?n` RHS overload.
5. Test stable labels as namespaced declared identities under rigid versus signature-mappable views.
6. Test semantic-symbol-headed application against explicit relation/function contracts.
7. Measure structural numeral encoding versus `#` shorthand without disturbing rigid value semantics.
8. Test `^0` signature surface against dependency/factorization manifests and multi-document partitioning.
9. Test `!` against lower matcher/constraint constructions and closed/open-world controls.
10. Qualify occurrence-preserving scope/rewrite semantics against adversarial duplicate/near-isomorph cases.
11. Qualify explicit active/inert rewrite-role representation against legacy direct-child activation.
12. Test reference hygiene with open/closed terms, sibling/descendant use, and capture adversaries.

These audits determine the minimal substrate and safe comparison semantics of future AxiomeSH without invalidating frozen historical evidence.