# Experiment 003 — Candidate Core Surface / Primitive Audit

**Status:** active audit after Draft 0.9 isomorphism-safety review  
**Purpose:** preserve useful syntax/labels without mistaking them for proven irreducible structure or allowing them to contaminate structural comparison

## Governing distinction

For every candidate surface ask separately:

```text
semantic distinction required?
compact/canonical surface useful?
irreducible primitive demonstrated?
comparison/isomorphism role safe?
```

Those are four different questions.

A useful surface may remain indefinitely even if its semantics ultimately decompose into lower native structure.

## Strongest original primitive candidates

The strongest current substrate candidates remain:

- structural identity;
- ordered incidence / hyperedge structure;
- explicit scope/boundary;
- pattern-variable ownership for structural matching;
- structural rewrite;
- negative application condition, still subject to elimination audit;
- serialization references as non-semantic compression.

Even these are experimental, not metaphysically privileged.

Draft 0.9 adds a further requirement: if a primitive/surface affects isomorphism, its rigid/mappable/boundary role must be explicit under the selected comparison projection.

---

# Exact literal `#n`, `#p/q`

Required distinction: **YES.** Exact value must not collapse into alpha-renamable identity.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: structural numeral/rational object plus canonical value relations.

Reason to retain surface: high compactness and exact-value clarity.

Isomorphism rule:

- literals are rigid by default;
- a class schema may expose a literal position as a parameter slot;
- parameterizing a slot is not the same as alpha-renaming the literal.

Current disposition: **retain canonical value shorthand; audit irreducible token-class status separately from class-schema parameterization.**

---

# Stable semantic symbol `^n`

Required distinction: **YES.** Stable theory/class/instance identities must be distinguishable from local alpha-renamable identities.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: ordinary structural identity plus explicit declaration/role/boundary rigidity.

Reason to retain surface: efficient stable labels for relations, classes, instances, source vocabulary, retrieval, and dependency closure.

Isomorphism risk:

If every `^n` is rigid in every comparison, independently labelled isomorphic theories will fail to match.

Draft 0.9 correction:

- P0/PB comparisons keep stable symbols rigid;
- PS/PC comparisons may map explicitly selected semantic identities through a witness;
- mapping exists only inside the comparison result and does not rename either source theory;
- source/class labels may retrieve candidates but cannot prove a match.

Current disposition: **retain label surface; add explicit comparison-role/mapping discipline; primitive token-class status remains open.**

---

# Declarative implication `A => B`

Required distinction: **YES** at represented-theory/source-formula level.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: relation/formula object with antecedent/consequent roles plus profile semantics.

Important correction:

Draft 0.2 wording that implication “structurally entails” its consequent is too strong as a core statement. Draft 0.5 correctly establishes that proof laws are profile-owned.

Current disposition: **retain concise surface; treat its logical satisfaction/proof laws as profile/class owned; do not canonicalize theorem-equivalent formulas merely because `=>` exists.**

---

# Declarative equality `A == B`

Required distinction: **YES** where the represented theory asserts equality beyond shared object identity.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: equality-relation object plus profile authority for reflexivity/substitution/congruence/extensionality as applicable.

Isomorphism risk:

Structural identity, object-theory equality, propositional equivalence, extensional function equality, and observational equivalence must not collapse.

Current disposition: **retain surface; never use `==` as structural identity unless the selected profile explicitly licenses that interpretation.**

---

# Declarative negation `~A`

Required distinction: **YES**, especially distinct from match-level negative condition `!`.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: profile-owned falsity/negation relation or another selected semantic construction.

Correction:

Draft 0.2's phrase “classical negation” is superseded. `~` is a **declarative negation surface**. Classical, intuitionistic, paraconsistent, and other laws are profile-specific.

Current disposition: **retain surface; profile laws remain external to the token itself.**

---

# Choice `{...}`

Required distinction: **YES** for explicit declarative alternatives.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction: explicit alternative object + member relation + satisfaction rule.

Current disposition: **retain surface; audit whether it is a canonical class/profile constructor rather than irreducible syntax.**

---

# Universal / existential binders `*?n`, `+?n`

Required distinctions:

- lexical variable ownership: **YES**;
- universal/existential formula semantics: **YES** where used.

Primitive status: **PARTLY OPEN.**

Possible decomposition:

```text
binder ownership
+ bound body
+ domain/generator structure
+ universal/existential evaluation class
```

Isomorphism value:

This separation is important because universal/existential quantification may share structural families with modal/temporal generated-region evaluation without making the source constructs identical.

Current disposition: **retain compact forms; audit lexical binding separately from quantifier semantics.**

---

# `+?n` declarative existential versus operational freshness

Required distinctions: **BOTH required.**

Current legacy surface overload: **UNSAFE FOR NEW CANONICAL ARTIFACTS.**

Draft 0.2 lets `+?n` mean existential quantification or fresh identity allocation depending on rewrite-RHS context.

Risk:

The same serialized term class can change meaning from external position/context, which is hostile to label-independent structural comparison.

Draft 0.9 disposition:

- historical artifacts keep legacy decode behavior;
- new canonical artifacts must carry fresh allocation through an explicit native construction/role;
- new content must not rely solely on syntactic position to switch the meaning of `+?n`.

---

# Lexical abstraction `\?n BODY`

Required distinction: **YES** for first-class bound bodies in current profiles.

Primitive status: **NOT ESTABLISHED.**

Possible lower construction:

```text
explicit binder identity
+ body relation
+ occurrence ownership
+ scope/boundary
```

Current disposition: **retain as canonical named bound-body surface while comparing against lower explicit binder structure.**

A class/schema comparison must treat binder numbering as alpha-renamable but ownership as rigid structure.

---

# Structural instantiation `ABSTRACTION @@ ARGUMENT`

Required operation: **YES** if native profiles manipulate bound bodies without hidden host substitution.

Primitive status: **ESPECIALLY UNESTABLISHED.**

Possible lower construction: constrained structural rewrite over binder-owned occurrences with explicit capture avoidance/alpha-renaming.

Draft 0.9 correction:

- `@@` is demoted from “core structural term” to candidate named/canonical operation pending rewrite decomposition;
- Draft 0.6's optional canonicalizer reduction is superseded;
- reducing an instantiation is D/E transformation, not N0/N1 canonicalization;
- if a variable appears as the left operand, the abstraction-shape constraint must be natively represented/derivable.

Current disposition: **highest-priority primitive/class factorization challenge.**

---

# Formula-scope conjunction

Required distinction: conjunction/co-satisfaction must be representable.

Primitive status of `scope == conjunction`: **NOT ESTABLISHED and structurally risky.**

Risk:

`[]` already means structural scope/boundary. Draft 0.2 additionally gives it conjunction semantics “in formula context,” making meaning depend on external interpretation.

Draft 0.9 disposition:

```text
raw [] in new canonical artifacts = structural scope/boundary/container
conjunction/co-satisfaction = explicit class/profile construction
```

Frozen Experiment 002 artifacts retain legacy decode rules.

This audit is now a correctness issue, not merely primitive-minimization polish.

---

# Signature marker `^0`

Required distinction: bundle vocabulary/dependency closure is useful.

Primitive status: **NO EVIDENCE.**

Possible lower construction: theory-signature object linked to declared stable identities.

Draft 0.9 correction:

Signature exactness is layer-relative:

```text
Sig_surface(T)
Deps(T)
Sig_D(T)
```

An alias-expanded factorization may legitimately have a different surface signature from the compact source object.

Current disposition: **retain `^0` convention for experiments; do not treat it as proven substrate primitive or isomorphism evidence.**

---

# Scope multiplicity

Draft 0.2 ordinary scopes are set-like.

Required distinction: **source multiplicity may be load-bearing.**

Risk:

Canonical collapse of duplicate members can create false isomorphisms if the source contained semantically distinct occurrences not materialized as identities/counts.

Draft 0.9 disposition:

Multiplicity must be decided/preserved during decomposition before set-like scope canonicalization. If occurrences matter, encode occurrence identity/count explicitly.

---

# Canonicalization / normalization surface

Draft 0.9 separates:

```text
N0 serialization normalization
N1 alpha/boundary structural canonicalization
D definitional decomposition/expansion
E profile/theorem equivalence
```

Only N0/N1 are default canonicalization.

No candidate surface may gain semantic authority because a canonicalizer happens to reduce it.

---

# Promotion rule

No candidate syntax graduates to irreducible core merely because:

- multiple experiments use it;
- it is concise;
- it resembles standard notation;
- removing it makes artifacts longer;
- agents recognize it;
- a class catalog already names it.

Promotion requires evidence that either:

1. faithful construction from lower structure fails; or
2. the lower construction is materially worse in correctness, reconstruction, reasoning performance, canonicality, isomorphism discovery, or lifecycle cost.

Otherwise prefer:

```text
qualified lower construction
+ stable class/domain label
+ optional compact syntax
```

## Immediate test priorities

1. Express Draft 0.6 instantiation as ordinary structural rewrite over explicit binder/occurrence structure and compare with `@@`.
2. Separate lexical binder ownership from universal/existential evaluation semantics.
3. Replace/test legacy scope-as-conjunction with explicit co-satisfaction construction.
4. Replace/test legacy `+?n` freshness overloading with explicit fresh-allocation structure.
5. Test stable semantic labels as declared/mappable structural identities under P0 versus PS/PC comparison.
6. Measure structural numeral encoding versus `#` shorthand without disturbing rigid exact-value semantics.
7. Test `^0` exact surface signature against alias-expanded/factorized dependency signatures.

None of these audits invalidates prior frozen evidence. They determine the minimal substrate and safe comparison semantics of future AxiomeSH.
