# Experiment 002 — Specification Expansion Findings

**Status:** active correction record  
**Triggered by:** attempt to render the full normalized Connect4 logical corpus  
**Result:** Draft 0.1 is insufficient for the intended experiment without hidden proposition semantics

## Correction

The first Experiment 002 render represented the Connect4 **research knowledge graph** but did not natively encode each claim's complete proposition. It attached each claim to an opaque proposition object and kept the proposition's meaning in source/oracle material.

That was a useful structural intermediate artifact, but it did not satisfy the intended requirement:

```text
Connect4 logic -> native AxiomeSH -> isolated agent -> actual logic
```

The experiment should have treated every failed formalization as pressure on the AxiomeSH specification rather than preserving Draft 0.1 unchanged.

## Concrete pressure discovered

The source corpus requires distinctions Draft 0.1 cannot express exactly without convention outside the payload.

### 1. Structural identity versus numeric value

Draft 0.1 uses bare numerals as alpha-renamable identities. The corpus contains load-bearing values such as:

```text
7
6
28
30
35
38
41
59
61
69
625
331955
1681808
3869237
```

These cannot be represented as ordinary Draft 0.1 atoms because their numeric value is semantic.

**Spec response:** exact literals `#n` and exact rationals `#p/q`.

### 2. Theory symbols versus anonymous object identity

The corpus needs stable distinctions among relations/concepts such as support, ownership, timing, quotient, terminality, subset, rank, WDL, composition, and game value.

Bare atoms are intentionally alpha-renamable in Draft 0.1, so using them as predicate/operator identity would make theory vocabulary disappear under ordinary isomorphism.

**Spec response:** semantic symbol tokens `^n` whose identity is stable within a theory.

### 3. Declarative implication versus operational rewrite

Many Connect4 claims are propositions of the form:

```text
guards => consequence
```

They are not instructions to mutate the represented corpus.

Draft 0.1 has `>` only as operational rewrite.

**Spec response:** declarative implication `=>`, kept distinct from `>`.

### 4. Explicit quantification

The corpus contains universal theorems, existential witness claims, and existential/universal move-choice semantics. Rewrite pattern variables do not fully specify declarative binding.

**Spec response:** universal `*?n term` and existential `+?n term` binders.

### 5. Equality and algebraic statements

The corpus includes formulas such as:

```text
N(t)=(W-1)H-ply+r+1
rank(B)=WH-pq+d
Y_cell=Y_line=28
38-10=28
```

Object identity is not sufficient for equality between derived terms and literal values.

**Spec response:** declarative equality `==` plus semantic-symbol applications for theory-owned arithmetic operations.

### 6. Classical negation versus negative matching

A negative application condition is not the same as a proposition asserting negation.

**Spec response:** preserve `!` for negative matching and add `~` for declarative negation.

### 7. Disjunction / alternatives

Some claims require true declarative alternatives rather than co-present conjunction or operational multiway successors.

**Spec response:** unordered choice `{ ... }`.

### 8. Scope multiplicity

Experiment 001 already exposed that Draft 0.1 did not state set-versus-multiset semantics for scope membership.

**Candidate response:** ordinary scopes canonicalize as sets; multiplicity must be represented explicitly when semantic.

### 9. Boundary-aware isomorphism

Experiment 001 exposed ambiguity when sibling scopes share identities through a parent.

**Spec response:** distinguish closed isomorphism from boundary-preserving isomorphism; boundary identities are fixed or mapped explicitly.

### 10. Variable aliasing and freshness

Draft 0.1 left distinct-variable injectivity unsettled and used RHS-only variables as implicit freshness.

**Spec response:** non-injective matching by default unless distinctness is explicit; RHS-only variables are invalid without explicit fresh allocation.

### 11. Reference scope

Experiment 001 found reference lifetime, shadowing, forward reference, and cycle behavior underspecified.

**Spec response:** lexical scope from definition point, ancestor visibility, no shadowing, no forward/cyclic references.

## Draft produced

The concrete result is:

`research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`

It is experimental branch material only. Draft 0.1 remains frozen as the authority used by Experiment 001.

## Experiment 002 consequence

The first `CONNECT4_LOGIC_002.axh` artifact is now classified as:

```text
structural graph prototype
```

not:

```text
complete native logical render
```

Experiment 002 is not complete until a replacement payload contains the proposition structure itself under the expanded candidate spec.

The scoring oracle for the replacement may map opaque semantic symbols to human-readable source concepts, but it MUST NOT supply theorem/formula structure absent from the AxiomeSH payload.

## Next qualification gate

For every normalized Connect4 claim `C4-R0001..C4-R0059`:

1. formalize the actual claim body into Draft 0.2 candidate structure;
2. encode numeric values as literals rather than identities;
3. preserve quantification, guards, implication, equality, alternatives, scope, epistemic status, and source relations;
4. record any remaining proposition that cannot be expressed without inventing unsupported premises;
5. treat each such failure as further specification evidence;
6. cold-decode the resulting native theory without supplying proposition text.

The experiment succeeds only when the source logic—not merely its metadata graph—is recoverable from the native payload.
