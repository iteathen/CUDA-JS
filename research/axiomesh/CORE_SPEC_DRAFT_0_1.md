# AxiomeSH Core Specification — Draft 0.1

**Status:** research draft  
**Scope:** native core only  
**Primary substrate hypothesis:** scoped hypergraph rewrite structure  
**Adapters:** prohibited from the core at this stage  
**Input/output:** raw AxiomeSH  
**Human readability:** not an optimization target

This document specifies the first explicit candidate core. It is intentionally provisional. Every primitive remains open to elimination, replacement, or generalization.

## 1. Purpose

AxiomeSH is an agent-native structural knowledge representation intended to maximize:

\[
\boxed{\text{durable correct synthesis}/\text{total lifecycle cost}}
\]

under non-negotiable preservation of semantic structure.

The primary research hypothesis is:

> A capable neural reasoning agent may operate more effectively over a representation whose external structure directly exposes relations, transformations, invariants, composition, and isomorphism than over formal systems designed principally for human use.

AxiomeSH is not initially a translation language, programming language, theorem syntax, compressed English, or human-facing notation.

The initial core is the representation itself:

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

No mandatory intermediate representation exists.

## 2. Design constitution

A candidate core design is inadmissible if it gains efficiency by violating any of the following.

### 2.1 Semantic fidelity

A represented structural distinction MUST NOT disappear merely because it is inconvenient, expensive, unfamiliar, or difficult for an agent.

### 2.2 Structural soundness

Core operations MUST have explicit structural semantics. No operation may acquire meaning from an undocumented convention.

### 2.3 Canonical integrity

Identity, equivalence, rewrite behavior, scope, and composition MUST remain stable under representation-preserving transformations.

### 2.4 Recoverability

Information required to distinguish structurally different objects MUST remain recoverable.

### 2.5 No hidden adapter semantics

The meaning of a core object MUST NOT depend on an English rendering, external logic language, current tokenizer, database schema, or model-specific translation.

### 2.6 Agent qualification

A representation that is formally elegant but demonstrably harms qualified agents' ability to reconstruct, distinguish, compose, or synthesize structure fails the project.

### 2.7 Architecture independence

Current transformer architecture is an experimental target, not part of AxiomeSH semantics.

## 3. Central model

The initial hypothesis is:

\[
\boxed{
\text{knowledge}
=
\text{scoped relational structure}
+
\text{lawful structural transformation}
}
\]

A fact is structure.

A state is structure.

A relation is structure.

A rule is structure.

A derivation is a sequence or network of structural rewrites.

A theory is structure containing structures and rewrites.

Rules themselves are first-class structures and may therefore eventually be inspected, related, compared, or rewritten.

## 4. Minimal core symbology

Draft 0.1 intentionally starts with a small symbol set.

| Form | Provisional meaning |
|---|---|
| `0 1 2 ...` | opaque atoms |
| `( ... )` | ordered incidence / hyperedge |
| `[ ... ]` | unordered scope / structural boundary |
| `>` | rewrite |
| `!` | negative structural match |
| `?n` | rewrite-pattern variable |
| `@n` | local structural reference |
| `@n=...` | reference binding |

Whitespace separates terms but otherwise carries no meaning.

There are deliberately no English identifiers in canonical core AxiomeSH.

Names may eventually exist in adapters or provenance systems, but they do not define core structure.

## 5. Deliberately absent operators

Draft 0.1 does not initially reserve dedicated core symbols for:

```text
AND
OR
IF
THEN
FORALL
EXISTS
TYPE
JOIN
SET
MEMBER
IMPLIES
EQUIVALENT
ISOMORPHIC
CAUSES
OWNS
REACHABLE
```

Most may be representable structurally.

For example, conjunction is initially represented by co-presence:

```text
[
  (0 1)
  (2 3)
]
```

rather than a privileged logical `AND`.

Alternatives may emerge from multiple permitted rewrites rather than a dedicated `OR`.

Identity is expressed by reusing the same object.

Typing is represented by relations in the structure rather than a privileged type keyword.

Quantification is initially approached through pattern variables and rewrite matching rather than importing `∀` and `∃`.

Any additional primitive MUST earn its place experimentally.

## 6. Atoms

An atom is an opaque identity:

```text
0
1
2
17
```

The numeral has no inherent semantic meaning.

Changing every atom ID consistently MUST NOT change structural meaning.

Thus:

```text
(0 1 2)
```

and:

```text
(7 4 9)
```

may represent the same abstract structure under an appropriate bijection.

Atom spelling is therefore not semantic.

Decimal notation is provisional and is not assumed to be token-optimal.

## 7. Ordered hyperedges

Parentheses create an ordered incidence structure:

```text
(0 1 2)
```

This is not formally defined as:

```text
relation0(subject1, object2)
```

The first position receives no privileged universal semantics.

It is a three-position ordered structural object.

For:

```text
(0 1 2 3)
```

all four positions are part of one relation.

Higher-arity relations are native. No binary-edge reduction is required.

Tuple position is significant:

```text
(0 1 2)
```

is not generally identical to:

```text
(0 2 1)
```

unless a represented structural law makes them equivalent.

## 8. Scopes

Square brackets form a scope:

```text
[
  (0 1 2)
  (3 2 4)
]
```

Membership inside a scope is unordered.

Therefore:

```text
[(0 1 2)(3 2 4)]
```

and:

```text
[(3 2 4)(0 1 2)]
```

have identical structural meaning.

A scope provisionally provides:

- structural grouping;
- local graph boundary;
- rewrite application boundary;
- state representation;
- recursive object.

These roles are intentionally unified initially rather than split into multiple constructs.

A scope may itself occur inside another structure.

## 9. Natural boundaries

AxiomeSH does not initially require an explicit interface declaration.

If an identity occurs both inside and outside a scope, that shared identity naturally forms part of its interface.

Conceptually:

\[
\partial S
=
\text{identities connecting }S\text{ to surrounding structure}
\]

This boundary is derived from structure rather than declared separately.

Whether that is sufficient for exact composition remains an open question.

## 10. Rewrite rules

The fundamental operational form is:

```text
[L] > [R]
```

Example:

```text
[(0 ?0 ?1)] > [(1 ?0 ?1)]
```

The left scope is a structural pattern.

The right scope is its replacement.

Rules are structures themselves.

A rule may therefore occur as an object within another structure.

## 11. Pattern variables

Variables are local to a rewrite rule:

```text
?0
?1
?2
```

Example:

```text
[
  [(0 ?0 ?1)(1 ?1 ?2)]
  >
  [(0 ?0 ?1)(1 ?1 ?2)(2 ?0 ?2)]

  (0 3 4)
  (1 4 5)
]
```

A valid application produces:

```text
[
  [(0 ?0 ?1)(1 ?1 ?2)]
  >
  [(0 ?0 ?1)(1 ?1 ?2)(2 ?0 ?2)]

  (0 3 4)
  (1 4 5)
  (2 3 5)
]
```

The rule itself remains because it was not part of the matched replacement region.

### 11.1 Variable identity

Repeated use of the same variable requires the same binding:

```text
(0 ?0 ?0)
```

Whether distinct variables must bind distinct structural objects is **unsettled**. Draft 0.1 treats injective matching as a candidate semantics to test, not a constitutional rule.

### 11.2 Fresh identities

A variable appearing only on the right side provisionally requests a fresh atom for each rule application.

Example:

```text
[(0 ?0)] > [(0 ?0)(1 ?0 ?1)]
```

where `?1` would receive a fresh identity.

This convention must be qualified against ambiguity with ordinary matching variables.

## 12. Rewrite semantics

Given a rule:

```text
[L] > [R]
```

inside scope \(S\), a candidate application:

1. finds a valid structural embedding of `L` into sibling structure in \(S\);
2. binds its variables;
3. validates negative patterns;
4. removes matched positive structures absent from `R`;
5. preserves matched structures reproduced in `R`;
6. adds instantiated RHS structures not already present;
7. preserves unmatched surrounding context;
8. allocates fresh identities for RHS-only variables under the provisional fresh-variable rule.

Rewrite application MUST NOT implicitly cross a nested scope boundary.

If nested structure is intended to participate, the rule must structurally address it.

## 13. Negative structural matching

Draft 0.1 provisionally reserves:

```text
!X
```

inside a left-hand pattern for:

> no matching structural instance of `X` exists in the same rewrite scope under the current compatible binding.

Example:

```text
[
  [(0 ?0) !(1 ?0)]
  >
  [(0 ?0)(2 ?0)]

  (0 3)
]
```

may add:

```text
(2 3)
```

only if:

```text
(1 3)
```

is absent from that scope.

`!` is therefore initially a negative application condition, not a claim of classical logical negation.

This primitive is specifically marked for attempted elimination during research.

## 14. Local rule activation

A rule occurring directly within a scope is active within that scope.

It does not silently propagate into descendant scopes.

Conceptually:

```text
[
  [A] > [B]

  [
    A
  ]
]
```

does not automatically rewrite the nested `A`.

The local rule would need to be structurally present there or explicitly address that nested scope.

This prevents invisible global semantics.

## 15. Multiway semantics

AxiomeSH does not initially impose rule priority or deterministic execution.

If state \(S\) admits three valid rule applications:

\[
S\rightarrow S_1
\]

\[
S\rightarrow S_2
\]

\[
S\rightarrow S_3
\]

then all three are legitimate successor structures.

The induced system therefore naturally forms a multiway transition structure.

No additional `OR` primitive is required for this case.

Rule ordering in the serialized stream MUST NOT imply priority.

Execution policy, pruning, strategy selection, and search order are outside the semantic core unless later evidence shows they require core representation.

## 16. Rules are first-class

Because a rewrite rule is itself structural:

```text
[L] > [R]
```

it can be:

- referenced;
- included inside another structure;
- compared;
- related to another rule;
- emitted by another rewrite;
- removed by another rewrite;
- eventually rewritten itself.

This permits AxiomeSH to represent transformations of reasoning systems using the same substrate.

No separate meta-language is assumed at Draft 0.1.

## 17. References

References exist only to avoid structural repetition.

```text
@0=[(0 1 2)(3 2 4)]
```

Later:

```text
(7 @0 9)
```

A reference MUST be semantically transparent.

Expanding every reference in a document must preserve meaning.

The reference number itself has no semantic identity.

`=` in:

```text
@0=...
```

is reference-binding syntax, not logical equality.

## 18. Identity

Draft 0.1 intentionally has no general equality operator.

Identity is represented by identity.

If two structures refer to the same object, they use the same atom or reference.

For example:

```text
(0 3 4)
(1 4 5)
```

shares object `4`.

No proposition saying `x = y` is required for ordinary identity.

Domain theories may still represent equality-like relations as ordinary structures when equality itself is being discussed.

## 19. Structural isomorphism

Isomorphism is initially a property of AxiomeSH structures rather than a primitive language operator.

Two scopes are structurally isomorphic when a bijection exists between their opaque identities while preserving:

- ordered incidence;
- scope nesting;
- scope membership;
- shared identity;
- rewrite direction;
- variable structure where applicable;
- negative-pattern structure.

Atom spelling and reference spelling are ignored.

The intended comparison unit is therefore not textual equality but structural equivalence.

Boundary-preserving isomorphism will also be required for compositional reasoning:

\[
G_1 \cong_B G_2
\]

where a specified external interface must remain fixed.

The final core representation of this operation remains open.

## 20. Composition

Initial structural composition should require no dedicated `JOIN` operator.

Two compatible structures provisionally compose by occupying a common scope and sharing identities where they are intended to coincide:

```text
[
  G1
  G2
]
```

Their intersection is induced by common identity.

Whether this is sufficient for all required composition forms is a major research question.

A representation that preserves each fragment separately while losing joint realizability is not exact composition.

## 21. Logic is not hard-coded

AxiomeSH Core is not initially identified with classical logic, intuitionistic logic, temporal logic, first-order logic, or another established logical system.

A logic may itself be represented as:

\[
\text{structures}
+
\text{rewrite rules}
+
\text{constraints}
\]

A valid inference under a theory is a valid transformation permitted by that theory.

This keeps the representation below particular logical traditions and allows logical systems themselves to become objects of structural comparison.

## 22. Derivations and proofs

Given:

\[
G_0\rightarrow G_1\rightarrow \dots \rightarrow G_n
\]

the rewrite history itself is a derivation object.

A proof system may therefore be represented as constraints on admissible rewrite histories.

AxiomeSH does not initially assume that every reachable state constitutes a theorem.

That interpretation belongs to the represented theory.

## 23. Invariants

An invariant is not initially a primitive keyword.

It is a structural property preserved across a specified class of transformations:

\[
I(G)=I(G')
\]

for permitted:

\[
G\rightarrow G'
\]

AxiomeSH's research objective includes discovering when independently sourced systems preserve structurally equivalent invariants.

## 24. Canonicalization requirements

AxiomeSH semantic identity MUST ignore:

- whitespace;
- local atom spelling under consistent bijection;
- reference numbering;
- ordering of members inside an unordered scope.

It MUST preserve:

- ordered tuple/hyperedge incidence;
- scope boundaries;
- shared identity;
- rewrite direction;
- variable relationships;
- structural absence conditions.

A concrete graph-canonicalization algorithm is deliberately not fixed in Draft 0.1.

Choosing one before the structural model stabilizes would be premature.

## 25. Raw I/O rule

During the core research phase:

\[
\boxed{\text{representation}=\text{interface}}
\]

Agents receive raw AxiomeSH and emit raw AxiomeSH.

No mandatory:

- English parser;
- pretty-printer;
- formal-logic compiler;
- model-specific encoding;
- JSON envelope;
- database translation;
- compatibility layer

may sit in the experimental reasoning path.

Later adapters MUST remain isolated.

## 26. Native fast-path invariant

The eventual architecture MUST preserve the possibility of:

```text
AxiomeSH -> native agent -> AxiomeSH
```

even after translation and interoperability systems are introduced.

An adapter may add capability.

It must never become necessary for native operation.

## 27. Optimization target

Draft 0.1 does not optimize raw character count, raw token count, visual elegance, or familiarity as primary objectives.

The target is closer to:

\[
\frac{
\text{recoverable + correctly composable structural information}
\times
\text{synthesis capability}
}{
\text{lifecycle resource cost}
}
\]

Raw token cost is one measured component of the denominator.

## 28. Initial experimental qualification

AxiomeSH should be compared against natural language and existing formal representations under equal resource budgets.

The first qualification suite should include:

1. **Cold reconstruction** — one agent encodes a novel structure; a fresh isolated agent must recover it exactly.
2. **Near-isomorph discrimination** — distinguish two structures differing by one load-bearing relationship.
3. **Isomorphism discovery** — recognize identical structure under unrelated atom assignments and presentation order.
4. **Partial isomorphism** — recover maximum common structure and exact residual differences.
5. **Rewrite correctness** — produce only structurally valid successors.
6. **Long composition** — preserve identities, constraints, and scope across many transformations.
7. **Cross-context continuation** — resume from raw AxiomeSH without human-language reconstruction.
8. **Synthesis** — derive valid structural relations not explicitly supplied.
9. **Context pressure** — measure how performance changes as simultaneously represented structural knowledge increases.
10. **Logic baseline** — compare against conventional logical/formal representations rather than only prose.

## 29. Representation-discovery experiment

Before aggressively optimizing syntax, agents should themselves be used to search representation space.

Given a novel structural object \(X\), ask an isolated agent to produce the smallest representation \(C\) it believes another fresh agent can exactly reconstruct.

Then:

\[
X\rightarrow C
\]

Fresh agent:

\[
C\rightarrow X'
\]

Require:

\[
X'=X
\]

Representations that survive reconstruction are then tested for reasoning quality.

The objective is not simply:

\[
\min |C|
\]

but approximately:

\[
\min |C|
\]

subject to:

\[
recover(C)=X
\]

and strong reasoning performance directly over \(C\).

Known structures, novel synthetic structures, modified familiar structures, cross-domain structures, and adversarial near-isomorphs should all be included to detect hidden reliance on pretrained model knowledge.

## 30. Major unresolved questions

Draft 0.1 intentionally leaves these open:

- Is ordered incidence `()` the correct primitive, or is its ordering too strong?
- Is `[]` sufficient as both scope and unordered collection?
- Is negative matching `!` genuinely primitive?
- Should distinct pattern variables require injective bindings?
- Can needed quantification emerge from graph matching?
- Does explicit equality ever deserve primitive status?
- Does cardinality deserve a primitive?
- Is there a natural structural representation of uncertainty/probability that belongs in the core?
- How should persistent global identity work without contaminating local compactness?
- What is the correct canonical structural form?
- What exact boundary is sufficient for lossless composition?
- Can theories, proofs, and operators be represented recursively without a separate meta-level?
- At what point does native graph rewriting become less efficient than another substrate?
- Which core features genuinely improve agent synthesis rather than merely making serialization compact?

None should be settled by convention alone.

## 31. Falsification condition

Graph rewriting is the current leading substrate hypothesis, not an article of faith.

It should be rejected or generalized if an important class of knowledge or inference repeatedly requires substantial artificial scaffolding that disappears under another comparably exact representation.

Concern is warranted if the common pattern becomes:

```text
natural phenomenon
-> awkward graph encoding
-> complex rewrite machinery
```

while a different primitive structure gives:

```text
natural phenomenon
-> direct representation
```

without sacrificing the constitutional requirements.

## 32. Compact Draft 0.1 grammar

The smallest current conception is:

```text
atom     := opaque integer identity

edge     := (term ...)

scope    := [term ...]

var      := ?integer

neg      := !term

rule     := scope > scope

ref      := @integer
bind     := @integer=term

term     := atom
          | edge
          | scope
          | rule
          | ref
```

Current semantic laws:

```text
scope members unordered
edge positions ordered
same identity means same object
different atom spelling has no intrinsic meaning
refs are transparent
rules operate only in their containing scope
patterns bind structurally
unmatched context persists
omitted matched structure is removed
new RHS structure is added
RHS-only variables provisionally create fresh identity
all valid rule/match applications are possible successors
no hidden priority
no hidden translation
```

The hypothesis underneath Draft 0.1 is:

\[
\boxed{\text{logic can be rendered as structure transforming structure}}
\]

The purpose of the research program is to determine whether that substrate gives neural agents a more direct, compact, durable, and synthesis-friendly environment than the human-derived logical representations in which they are presently trained.
