# Experiment 002 — Draft 0.3 Native Signature Audit

**Artifact:** `SEMANTIC_SIGNATURE_002_DRAFT_0_3.axh`  
**Core marker:** `^0`  
**Status:** author-side construction audit; independent closure check pending

## Declared theory-owned symbol set

The native signature declares exactly the union:

```text
^1..^12
^200..^210
^300..^311
^700..^707
^1000..^1497
```

Total theory-owned declarations:

```text
12 + 11 + 12 + 8 + 498 = 541
```

`^0` is core-reserved by Draft 0.3 and is not counted as theory-owned.

## Construction source

The declared set is the complete stable semantic-symbol inventory previously maintained in the Draft 0.2 reviewer glossary:

- metadata carriers;
- epistemic statuses;
- claim relation types;
- logical layers;
- domain/theory symbols.

The JSON glossary remains historical/reviewer metadata. Draft 0.3 cold qualification does not expose it.

## Intended closure property

For the associated formula payload:

`CONNECT4_LOGIC_002_DRAFT_0_2.axh`

every theory-owned semantic symbol used by the payload should be a member of the native signature.

The cold regression protocol requires the isolated decoder to verify this directly and report:

```text
undeclared used symbols
declared but unused symbols
```

Author-side construction does not substitute for that independent scan.

## Human-name boundary

The native signature intentionally carries identity membership only.

It does not encode English labels.

That is deliberate:

```text
formal signature closure != human naming dictionary
```

A primitive `^n` symbol can be formally valid without a human-readable name. The cold decoder is expected to reason using raw stable IDs and formula structure.
