# Experiment 002 — Draft 0.4 Canonical Signature Audit

**Theory body:** `CONNECT4_LOGIC_002_DRAFT_0_2.axh`  
**Signature:** `SEMANTIC_SIGNATURE_002_DRAFT_0_4.axh`  
**Spec amendment:** `../../CORE_SPEC_DRAFT_0_4_CANDIDATE.md`  
**Source logic:** unchanged from the independently decoded Draft 0.2 payload

## Result

Draft 0.4 changes the bundle-signature rule from “closed, unused declarations permitted” to an exact canonical working-set signature:

```text
canonical signature = every theory-owned ^n used by the body, and no others
```

Author-side comparison against the frozen Experiment 002 body gives:

```text
theory-owned symbols used by body: 530
declared in Draft 0.4 signature:    530
used but undeclared:                  0
declared but unused:                  0
core-reserved signature marker:      ^0
```

The 11 Draft 0.3 declarations removed as unused are:

```text
^10
^11
^12
^1204
^1304
^1306
^1307
^1309
^1310
^1339
^1344
```

These removals do not change any claim body, relation, guard, scope, status, open question, literal, quantifier, or other proposition semantics.

## Canonicalization effect

Draft 0.4 also requires increasing numeric symbol-ID order for canonical signature serialization. The new signature is sorted accordingly.

The numeric ordering is serialization-only and does not imply semantic proximity or precedence among theory symbols.

## Qualification consequence

The next cold regression should require all of the following simultaneously:

- exactly 530 declared theory-owned symbols;
- zero used-but-undeclared symbols;
- zero declared-but-unused symbols;
- no human glossary needed for native formula reconstruction.

A broader theory-family vocabulary may exist separately, but it is not the canonical self-contained bundle signature tested here.
