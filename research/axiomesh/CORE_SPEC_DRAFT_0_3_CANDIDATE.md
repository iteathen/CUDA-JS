# AxiomeSH Core Specification — Draft 0.3 Candidate

**Status:** experimental tightening produced from Experiment 002 cold decode (#267)  
**Parent:** `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`  
**Form:** normative amendment; Draft 0.2 remains in force except where this document explicitly replaces it  
**Promotion:** experimental-branch authority only

Draft 0.3 closes two ambiguities exposed by the isolated Draft 0.2 decode:

1. variable-number reuse was not scoped precisely enough;
2. the native formula corpus used stable `^n` theory symbols but did not carry a native declaration of which semantic symbols belonged to the theory.

No human-facing naming mechanism is added. AxiomeSH remains agent-native and does not make English identifiers part of core semantics.

---

## 1. Authority and compatibility

A decoder for Draft 0.3 MUST read Draft 0.2 and this amendment.

If the two disagree, Draft 0.3 governs only the amended subjects below. All other Draft 0.2 rules remain unchanged.

Draft 0.2 artifacts remain frozen for reproducibility of Experiment 002 issue #267.

---

## 2. Lexical variable scope

Draft 0.2's phrase forbidding variable-number shadowing "within one serialized theory object" is replaced.

### 2.1 Binding is lexical

A binder:

```text
*?n term
+?n term
```

binds occurrences of `?n` only inside its own `term`.

A rewrite rule continues to own its rule-local pattern variables as specified by Draft 0.2.

### 2.2 Sibling reuse is legal

Disjoint sibling binders MAY reuse the same variable number:

```text
[
  *?0[A]
  +?0[B]
]
```

The two `?0` variables are distinct bound variables because neither binder is in the lexical scope of the other.

This directly resolves the Experiment 002 claim-1017 ambiguity.

### 2.3 Separate proposition reuse is legal

Different claim bodies, rules, open-question bodies, or other disjoint terms MAY reuse the same variable numbers.

Variable numbers are local serialization handles, not corpus-global identities.

### 2.4 Nested rebinding is forbidden in Draft 0.3

A binder MUST NOT bind `?n` when another binder for `?n` is still visible in an ancestor lexical scope.

Thus:

```text
*?0[
  +?0[A]
]
```

is invalid in Draft 0.3.

This restriction is for unambiguous cold reconstruction. A later version may permit alpha-safe shadowing if evidence justifies it.

### 2.5 Alpha equivalence

Consistent renaming of a bound variable within its lexical scope preserves meaning when capture is avoided.

---

## 3. Native theory signature

AxiomeSH theory vocabulary must be recoverable as native structure, not only from an external glossary.

Draft 0.3 reserves one core semantic marker:

```text
^0
```

`^0` is **not** a theory-owned semantic symbol. Inside a theory-signature document it has one fixed core meaning:

> the following scope enumerates the stable theory-owned semantic symbols available to the associated native theory body.

Canonical form:

```text
[
  (^0 [
    ^1
    ^2
    ^37
    ^900
  ])
]
```

The member scope is unordered.

### 3.1 Signature membership

A semantic symbol appearing in the theory body MUST occur in the native signature unless the symbol is core-reserved by the AxiomeSH specification.

An undeclared theory-owned semantic symbol is a qualification failure.

### 3.2 Symbol identity

Signature membership fixes symbol identity, not human meaning.

For example:

```text
^1120
```

remains exactly `^1120`. It is not alpha-renamable merely because a human glossary might call it `H0`.

### 3.3 No compulsory English labels

Draft 0.3 deliberately does **not** add strings or English identifiers to canonical core.

A human sidecar may say:

```text
^1120 -> H0
```

for review convenience, but that label:

- is not needed to parse or reason over the native theory;
- is not semantic authority;
- cannot change the theory;
- is excluded from cold qualification.

The formal meaning of theory symbols comes from their identity, incidence, formulas, axioms, constraints, and relations in the native theory.

This preserves the project invariant that human readability is not the optimization target.

### 3.4 Signature closure versus semantic completeness

A closed native signature means every theory-owned symbol is declared.

It does **not** mean every primitive symbol is definitionally reducible to other symbols. Primitive nonlogical vocabulary is permitted, as in ordinary formal theories.

The qualification question is therefore:

> Can an agent recover and reason over the theory without an undeclared or externally supplied semantic distinction?

not:

> Can the agent guess an English name for every primitive?

---

## 4. Native theory bundles

A Draft 0.3 theory may be supplied as multiple raw AxiomeSH documents when they are explicitly presented as one bundle:

```text
native signature document
+
native theory body document(s)
```

This is serialization partitioning only.

No translation, JSON envelope, English parser, or semantic adapter may intervene between the documents and the agent.

Concatenating the documents into one enclosing transport object MUST preserve the same theory.

A future canonical serializer may choose a single-file form after measurement.

---

## 5. Signature qualification rules

For a native theory bundle, qualification MUST check:

1. every `^n` used by the theory body is either declared in the native signature or core-reserved;
2. every declared symbol retains stable identity;
3. signature member order has no meaning;
4. no human glossary is required to reconstruct formula topology;
5. no human glossary supplies guards, literal values, quantifiers, implication direction, equality, negation, choice, claim relations, or proof status;
6. primitive symbols may remain intentionally opaque in human-language terms.

Unused declared symbols are permitted but SHOULD be reported because they increase representation cost.

---

## 6. Cold-decoder reporting discipline

A cold decoder MUST distinguish:

- **native formal recovery** — what follows from the signature and theory body;
- **human gloss** — optional names not supplied to the decoder;
- **semantic inference** — structural conclusions derived from formulas/relations.

A decoder MUST NOT mark a theory incomplete merely because it cannot translate `^n` into English.

It MUST mark a theory incomplete if a load-bearing symbol or distinction is absent from native input.

---

## 7. Experiment 002 consequence

The Draft 0.2 cold decode established that all 59 Connect4 claim bodies were structurally present and recoverable, but exposed:

- ambiguous wording about sibling variable-number reuse;
- absence of a native signature inventory.

Draft 0.3 closes both without adding a human-language translation layer.

Experiment 002 Draft 0.3 qualification therefore uses:

```text
CORE_SPEC_DRAFT_0_2_CANDIDATE.md
CORE_SPEC_DRAFT_0_3_CANDIDATE.md
SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh
CONNECT4_LOGIC_002_DRAFT_0_2.axh
```

The formula payload remains byte-identical to the Draft 0.2 qualified payload. Only the candidate specification and native signature surface change.

---

## 8. Falsifiers

This tightening should be rejected or revised if:

- lexical scoping still permits multiple parses;
- signature membership fails to expose a symbol the body depends on;
- agents require the human glossary to answer structural/formal questions;
- a string-label mechanism demonstrably improves native reasoning enough to justify its lifecycle cost;
- the separate signature document creates a mandatory translation boundary rather than a serialization boundary.

Until such evidence appears, theory symbols remain native opaque identities with explicit signature membership and no compulsory human labels.
