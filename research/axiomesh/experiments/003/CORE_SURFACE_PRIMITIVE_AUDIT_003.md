# Experiment 003 — Candidate Core Surface / Primitive Audit

**Status:** active audit created after Draft 0.8 correction  
**Purpose:** prevent useful surface syntax from being mistaken for proven irreducible core structure

## Governing distinction

AxiomeSH may retain a convenient, canonical, named surface even when that surface decomposes into lower-level structure.

Therefore every candidate form is audited separately for:

```text
semantic distinction required?
convenient surface useful?
irreducible primitive actually demonstrated?
```

Those are three different questions.

## Strongest original primitive candidates

The following remain the strongest candidates for the irreducible substrate because the project began with them and most later forms can be represented as structure over them:

- structural identity;
- ordered incidence / hyperedge structure;
- explicit scope/boundary;
- pattern variable ownership for structural matching;
- structural rewrite;
- negative application condition as part of matching, subject to later audit;
- serialization references, as non-semantic compression.

Even these remain experimental rather than metaphysically privileged.

## Draft 0.2+ forms requiring primitive-status review

### Exact literal `#n`, `#p/q`

Required distinction: YES. Exact value must not collapse into alpha-renamable identity.

Primitive status: NOT ESTABLISHED.

Possible lower construction: structural numeral/rational object plus canonical value relations.

Reason to retain surface: very high compactness and exact-value clarity.

Current disposition: **retain canonical value shorthand; audit whether it needs irreducible token-class status.**

### Stable semantic symbol `^n`

Required distinction: YES. Stable theory/class/instance identities must be distinguishable from alpha-renamable local identities.

Primitive status: NOT ESTABLISHED.

Possible lower construction: ordinary structural identity plus explicit declaration/fixed-boundary role.

Reason to retain surface: efficient stable labels for classes, instances, relations, and retrieval.

Current disposition: **retain label surface; do not equate label token with compound semantics.**

### Declarative implication `A => B`

Required distinction: YES at the represented-theory level.

Primitive status: NOT ESTABLISHED.

Possible lower construction: ordinary relation object/class with antecedent and consequent roles, plus profile semantics.

Reason to retain surface: concise formula construction and conventional structural cue.

Current disposition: **retain as candidate canonical constructor/surface; audit reduction to relation structure before final core promotion.**

### Declarative equality `A == B`

Required distinction: YES wherever a theory asserts equality beyond shared object identity.

Primitive status: NOT ESTABLISHED.

Possible lower construction: equality-relation object plus explicit reflexivity/substitution/congruence authority.

Current disposition: **retain surface; equality proof semantics remain profile/theory-owned.**

### Declarative negation `~A`

Required distinction: YES, including distinction from match-level negative condition.

Primitive status: NOT ESTABLISHED.

Possible lower construction: profile-owned negation/falsity relation or structural complement construction, depending on logic.

Risk: classical, intuitionistic, paraconsistent, and other negations must not be silently collapsed.

Current disposition: **retain syntax as source/formula label; semantic laws are not primitive merely because `~` exists.**

### Choice `{...}`

Required distinction: YES for declarative alternative semantics.

Primitive status: NOT ESTABLISHED.

Possible lower construction: explicit alternative object with member relations and satisfaction rule.

Current disposition: **retain useful surface; audit whether braces are syntax for a structural class rather than irreducible core.**

### Universal / existential binders `*?n`, `+?n`

Required distinction: YES for quantified source formulas and owned variable scope.

Primitive status: PARTLY OPEN.

Possible lower construction: binder object + domain/generation relation + bound-body relation + universal/existential satisfaction class.

Important distinction: lexical variable ownership may be primitive enough to retain even if universal/existential meaning is a higher construction.

Current disposition: **separate binder ownership from quantifier semantics in the audit. Retain compact forms.**

### Lexical abstraction `\?n BODY`

Required distinction: YES for first-class bound bodies in current profiles.

Primitive status: NOT ESTABLISHED.

Possible lower construction: explicit binder identity, body relation, and occurrence ownership inside scope.

Current disposition: **retain as named/canonical bound-body surface while testing whether it is an instance of a lower structural binder class.**

### Structural instantiation `ABSTRACTION @@ ARGUMENT`

Required operation: YES if profiles manipulate bound native bodies without hidden host substitution.

Primitive status: ESPECIALLY UNESTABLISHED.

Possible lower construction: lawful structural rewrite over binder-owned occurrences with capture avoidance / alpha-renaming.

This is currently the highest-priority primitive-status challenge because substitution is exactly the kind of lawful structural transformation AxiomeSH was designed to expose.

Current disposition: **retain Draft 0.6 candidate syntax and focused tests as a useful named operation, but do not promote `@@` as irreducible core until rewrite-level decomposition is attempted and compared.**

## Formula-scope conjunction audit

Draft 0.2 gives co-present members in formula context conjunction semantics.

Required distinction: conjunction must be representable.

Primitive status of `scope == conjunction`: NOT ESTABLISHED.

Risk: this may overload a general structural boundary with one logical connective.

Alternative:

```text
scope remains boundary/container
conjunction is a structural class over required co-satisfaction of members
```

Current disposition: **retain existing semantics for Experiment 002 reproducibility, but audit before final core promotion.**

## Signature marker `^0`

Required distinction: bundle vocabulary closure is useful.

Primitive status: NO EVIDENCE that one reserved semantic symbol is irreducible.

Possible lower construction: ordinary theory-signature object linked to declared stable identities.

Current disposition: **retain Draft 0.3/0.4 serialization convention for experiments; treat as canonical bundle surface, not proven substrate primitive.**

## Promotion rule

No candidate syntax graduates to irreducible core merely because:

- multiple experiments use it;
- it is concise;
- it resembles a standard logical notation;
- removing it would make documents longer;
- agents already recognize it.

Promotion requires evidence that either:

1. faithful construction from lower primitives fails; or
2. the lower construction is materially worse in correctness, reconstruction, reasoning performance, canonicality, or lifecycle cost.

Otherwise the preferred disposition is:

```text
qualified lower construction
+ stable class/instance label
+ optional compact syntax
```

## Immediate test priorities

1. Express Draft 0.6 instantiation as an ordinary structural rewrite over explicit binder/occurrence structure and compare with `@@`.
2. Separate lexical binder ownership from universal/existential quantifier semantics.
3. Test formula-scope conjunction against an explicit co-satisfaction construction.
4. Test stable semantic labels as declared structural identities rather than a special token class.
5. Measure literal structural encoding versus `#` shorthand before disturbing the exact-value surface.

None of these audits invalidates prior experiment evidence. They determine what the eventual minimal core should be.
