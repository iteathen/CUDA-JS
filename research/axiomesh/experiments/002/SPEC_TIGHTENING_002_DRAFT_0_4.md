# Experiment 002 — Draft 0.4 Tightening from Issue #268

**Trigger:** Draft 0.3 cold qualification + post-decode review in CUDA-JS issue #268  
**Formula payload:** unchanged  
**Connect4 source:** read-only and unchanged  
**Purpose:** act only on recommendations supported by observed evidence

## Evidence accepted

The Draft 0.3 run established:

- native signature closure passed;
- lexical binder scoping passed;
- all 59 claim bodies reconstructed;
- the human sidecar was unnecessary for formula topology;
- one cold probe selected the wrong relation cluster even though the correct raw edges were present;
- the failure was associated with an English-labelled probe over intentionally opaque native vocabulary;
- the 541-member signature contained 11 unused declarations;
- dense one-line formulas were parseable but increased decoder effort.

## Actions taken

### 1. Keep lexical scoping unchanged

No new binder mechanism was justified. Draft 0.3 lexical rules remain authoritative for the candidate line.

### 2. Separate native/formal probes from human-gloss probes

Draft 0.4 requires cold formal probes to select targets using native/raw structure only. Human semantic naming occurs only after the cold result is frozen.

This directly addresses the derivative-chain selection miss without adding English strings to AxiomeSH core.

### 3. Add hidden regression authority for the derivative chain

`QUALIFICATION_ASSERTIONS_002_DRAFT_0_4.json` records the scorer-side expected `^304` chain while `COLD_DECODER_PROMPT_002_DRAFT_0_4.md` asks the decoder to discover the chain from native selectors without exposing the expected answer.

### 4. Make the canonical bundle signature exact

The 11 symbols found unused in issue #268 are removed from the Draft 0.4 bundle signature.

Draft 0.4 now distinguishes:

- exact canonical bundle signature = exact body working set;
- broader reusable vocabulary = separate resource, not the body signature.

The resulting signature contains 530 declared/used theory symbols with zero extras and zero omissions author-side.

### 5. Keep human glossary non-authoritative

No evidence justified strings or English labels as semantic primitives. The existing JSON glossary remains review/scoring metadata only.

### 6. Tighten canonical presentation without changing semantics

Draft 0.4 adds a presentation profile recommending one direct scope/choice member per line, consistent indentation, deterministic signature ordering, and visually contiguous infix propositions.

Whitespace remains semantically inert. This is explicitly a decoder-cost/serialization concern, not a new logical construct.

## Recommendations intentionally not promoted into semantics

- No new domain predicate/operator was added.
- No string/name primitive was added.
- No special derivative-chain semantic primitive was added.
- No new binder syntax was added.
- No claim body was rewritten based solely on the decoder's difficulty.

## New qualification target

The next regression must independently show:

```text
530 used theory symbols
530 declared theory symbols
0 used-but-undeclared
0 declared-but-unused
lexical binder regression PASS
59/59 formula reconstruction
raw-only structural probes PASS
^304 derivative-chain selector PASS
post-freeze human-gloss review reported separately
```

Only after that should Draft 0.4 be considered for promotion beyond the experiment branch.
