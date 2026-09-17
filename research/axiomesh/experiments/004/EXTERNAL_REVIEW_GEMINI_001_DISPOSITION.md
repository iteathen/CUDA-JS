# AxiomeSH Experiment 004 — External Review 001 Disposition

**Source:** isolated Gemini review relayed by project owner  
**Reviewed authority:** Draft 0.13 consolidated candidate + Draft 0.14 amendment  
**Status:** reviewer findings assessed as evidence, not authority  
**Purpose:** preserve accepted, rejected, and modified findings before any spec mutation

## Disposition summary

The external review found several real specification defects, but three recommendations would incorrectly collapse the distinction between **surface syntax** and **irreducible primitive semantics** or would impose a canonical factorization that AxiomeSH explicitly does not assume.

Accepted corrections are applied in the next amendment. Rejected recommendations remain recorded so they are not rediscovered and applied uncritically later.

## Finding dispositions

### F1 — generic reference binding inside `term`

**Disposition: ACCEPT. Severity retained: BLOCKER.**

The grammar currently permits `bind := ref = term` wherever a semantic `term` may occur, including inside ordered incidence. Because bindings are N0 transport directives and disappear after hygienic resolution, allowing one to occupy an edge position can change apparent tuple arity between serialized and semantic structure.

Correction direction:

```text
term       := semantic term only
scope_item := term | ref_binding_directive
scope      := [scope_item ...]
edge       := (term ...)
```

A binding directive occupies no semantic member occurrence after N0 and is forbidden as an ordered-edge/choice/formula operand.

No new primitive is required.

### F2 — structural identity versus removable member occurrence

**Disposition: ACCEPT WITH CORRECTION TO REVIEWER'S PROPOSED WORDING.**

The real distinction is:

```text
structural identity
!=
member occurrence referring to that identity
```

Rewrite multiset subtraction removes selected **member occurrences**. It does not implicitly destroy the structural identity or cascade-delete other incidences that mention it.

The reviewer's phrase “unless all occurrences are removed” is rejected: an identity can remain referenced by ordered incidences/ports/other scopes even if no direct member occurrence remains in one rewritten scope.

Global object deletion, garbage collection, or cascading incidence removal is separate explicit/profile behavior.

### F3 — outer RHS scope: splice boundary versus nested scope object

**Disposition: ACCEPT. Severity retained: HIGH.**

For `scope > scope`, the outer LHS/RHS scopes are rule-side pattern/replacement containers. They are not themselves inserted/matched as nested scope nodes.

Default application consumes selected direct LHS member occurrences and splices instantiated direct RHS members into the application scope.

A literal nested scope is represented as a member scope, e.g. `[[ ... ]]` on the corresponding side.

This same distinction applies to LHS matching.

### F4 — declarative surfaces do not bind variables

**Disposition: ACCEPT AS CLARIFICATION, NOT AS A BAN ON ALL OPEN FORMULAS.**

`=>`, `==`, `~`, and `{...}` do not introduce variable ownership or implicit quantification.

A variable in such a construction must inherit an explicit owner from a quantifier, abstraction, schema/pattern interface, or another represented binder contract.

A standalone closed proposition containing an otherwise unowned variable is invalid. Explicitly open schema/formula terms remain legal when their interface owns those variables.

### F5 — `@@` appears in grammar therefore is prematurely primitive

**Disposition: REJECT.**

Draft 0.13 Section 5 explicitly says the grammar is the **transport surface, not primitive classification**. Section 4.4 and Section 14.3 explicitly classify `@@` as a candidate compact surface/construction whose irreducibility is unproven.

Removing a useful surface from the grammar would conflate “parseable native syntax” with “irreducible substrate primitive,” the same category error the project is trying to avoid.

No change to `@@` grammar admission is required. A clarifying sentence may make the distinction harder to misread.

### F6 — no dedicated compact syntax for fresh allocation

**Disposition: REJECT AS A SPEC DEFECT.**

Draft 0.14 deliberately defines freshness as a native construction contract rather than adding a dedicated core token. A profile can represent allocation using ordinary native structure/stable labels after its lower construction is qualified.

Lack of shorthand is an ergonomics question, not an expressiveness failure. Adding `new(...)`, `+!`, or another token before qualification would violate the decomposition-first/core-admission discipline.

A shorthand may be considered later if measured cost justifies it; it is not required now.

### F7 — D-factorization residual versus pairwise common-core residual

**Disposition: ACCEPT. Severity: HIGH for verification/reconstruction claims.**

Two separate stages must be explicit:

```text
source/raw A --D/extraction--> comparison-stage A_c
comparison-stage A_c <-> common core C + pairwise residual/cut/exclusion/projection accounting
```

Pairwise accounting reconstructs the **comparison-stage object under its declared view**, not automatically the original source.

Full-source reconstruction additionally follows the source-local D/extraction record. If that transform is non-exact, full source reconstruction is not claimed; its loss remains explicit.

Source-local transformation residuals and pairwise residuals must have distinct roles/names.

### F8 — fingerprint invariance across D factorizations

**Disposition: ACCEPT RISK, REJECT PROPOSED SINGLE CANONICAL POST-D FIX.**

The review correctly identifies that a fingerprint qualified on one representation/factorization stage cannot be used to prune another stage by assumption.

However AxiomeSH does not assume a single canonical post-D factorization. Therefore the correction is:

- every index/fingerprint pins the exact representation stage/factorization node or factorization set it indexes;
- its necessary-invariant theorem is qualified for that exact layer/view/relation/D policy;
- a raw-structure fingerprint remains legal when its invariant is proved for the raw relation being pruned;
- cross-factorization retrieval may index multiple qualified factorization nodes or use a separately proved factorization-invariant fingerprint;
- otherwise the fingerprint is heuristic only and its misses cannot support completeness/negative claims.

### F9 — exact surface signature conflicts with label mapping

**Disposition: REJECT.**

`Sig_surface(T)` is intentionally a representation-layer declaration inventory. Namespace-local stable labels do **not** alpha-rename under N1. VS mapping is a later comparison-policy operation and does not mutate the source bundle's surface signature.

Draft 0.13 already states that surface-signature equality is not isomorphism evidence.

A VS-compatible retrieval projection/index may abstract selected labels explicitly, but `Sig_surface` itself must remain source-faithful.

## Additional defects found while reassessing the external review

### A1 — infix parse/grouping contract is underspecified

**Severity: HIGH.**

The recursive grammar admits `==`, `=>`, and `@@` as `term` while saying mixed infix forms must be “nested/parenthesized.” Parentheses already denote ordered incidence, so there is no clearly defined non-semantic grouping syntax or full precedence/associativity contract.

Inputs such as:

```text
A => B == C
A @@ B @@ C
A == B == C
```

can therefore admit implementation-dependent parses unless rejected or governed explicitly.

Correction direction: define deterministic precedence/associativity/non-associativity for infix surfaces and require explicit serialization grouping only where the grammar provides a transparent grouping mechanism. Do not use semantic scope/edge structure merely as accidental parser parentheses.

### A2 — NAC placement/first-class role needs an explicit inert-versus-evaluated contract

**Severity: MEDIUM.**

`!term` is admitted as a generic term while its semantic effect is defined as a matching negative application condition. The spec must state whether a `!term` outside a matcher is an inert first-class NAC object, invalid, or immediately interpreted against some boundary.

Correction direction: `!term` always denotes a negative-match-condition object; it is **evaluated** only by an explicit matcher/pattern profile that supplies the application boundary/bindings. Outside such a context it is represented data/condition structure, not an implicit query against surrounding scope.

This parallels first-class rewrite objects whose existence does not imply activation.

### A3 — unqualified “simpler factorization/class” language lacks a metric

**Severity: MEDIUM.**

Promotion rules use the idea that no “simpler” existing qualified factorization should explain the structure without loss, but simplicity is not globally defined.

Correction direction: minimality claims require a declared measure/partial order. Absent one, record competing exact lower factorizations and do not reject a candidate solely on an unqualified simplicity judgment.

### A4 — canonical serialization claims need algorithm/version scoping

**Severity: MEDIUM.**

N1 permits alpha normalization and deterministic unordered-member presentation, but canonical labeling of symmetric graphs can have multiple valid witnesses. If an implementation emits a canonical serialization/hash, the algorithm/version and invariance contract must be explicit; comparison correctness cannot depend on one incidental tie-break.

This does not require one mandated canonicalization algorithm.

## Qualification additions implied by this review

Add focused controls for:

1. reference-binding placement / ordered-edge arity preservation;
2. rule-side splice boundary versus literal nested scope;
3. closed declarative term with unowned variable versus explicitly open owned variable;
4. two-stage D-residual versus pairwise-residual reconstruction/accounting;
5. fingerprint/index use across multiple qualified factorization stages;
6. infix parse determinism and rejection of ambiguous chains;
7. inert first-class NAC object versus matcher evaluation context;
8. canonical serialization/hash invariance without collapsing automorphism witnesses.

These supplement the existing frozen Experiment 004 targets; they do not justify a new primitive/class.

## Governing conclusion

The external review materially improved the specification, but it is not accepted wholesale.

The corrections preserve the project's central discipline:

```text
useful surface syntax may remain
!=
primitive semantic authority
```

and:

```text
no single canonical factorization is assumed merely to make indexing convenient
```

The next amendment should be minimal, preserve Draft 0.14's no-feature-growth freeze, and modify only deterministic semantics/grammar/qualification boundaries demonstrated above.