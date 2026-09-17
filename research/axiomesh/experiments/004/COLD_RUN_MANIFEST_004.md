# Experiment 004 — Isolated Cold-Run Manifest

**Status:** frozen execution manifest  
**Purpose:** permit fresh isolated agents to execute Experiment 004 without seeing scorer assertions or reconstructing the campaign from chat history.

## Global isolation rule

Each cold run starts in a **fresh context** that has not seen:

- scorer assertions;
- author audits;
- previous cold outputs;
- expected mappings/results;
- structural-class registry/catalog unless the prompt explicitly permits it;
- human gloss naming intended analogies.

The fresh agent reads only the exact files named by the selected cold prompt.

The output is committed/frozen **before** any scorer assertion is opened.

A run contaminated by prior access is not cold evidence and must be rerun in a genuinely fresh context.

## Run groups

### RUN-A — raw structural semantics

Prompt:

`COLD_PHASE_A_PROMPT_004.md`

Covers:

```text
Q004-01 Q004-04 Q004-05 Q004-06 Q004-07 Q004-08
```

Hidden scorer file — DO NOT READ COLD:

`PHASE_A_ASSERTIONS_004.json`

### RUN-B — rewrite/event semantics

Prompt:

`COLD_PHASE_B_REWRITE_PROMPT_004.md`

Covers:

```text
Q004-02 Q004-03
```

Hidden scorer file:

`PHASE_B_REWRITE_ASSERTIONS_004.json`

### RUN-C1 — embedding/common-core/automorphism

Prompt:

`COLD_PHASE_C_PROMPT_004.md`

Covers:

```text
Q004-11 Q004-12 Q004-13
```

Hidden scorer file:

`PHASE_C_ASSERTIONS_004.json`

### RUN-C2 — negative/index policy

Prompt:

`COLD_PHASE_C_NEGATIVE_INDEX_PROMPT_004.md`

Covers:

```text
Q004-14 Q004-15
```

Hidden scorer file:

`PHASE_C_NEGATIVE_INDEX_ASSERTIONS_004.json`

### RUN-D09 — semantic decomposition coverage

Prompt:

`COLD_Q004_09_PROMPT.md`

Hidden scorer file:

`Q004_09_ASSERTIONS_004.json`

### RUN-D10 — extraction freeze

Prompt:

`COLD_Q004_10_PROMPT.md`

Hidden scorer file:

`Q004_10_ASSERTIONS_004.json`

### RUN-D16 — class non-vacuity

Prompt:

`COLD_Q004_16_PROMPT.md`

Hidden scorer file:

`Q004_16_ASSERTIONS_004.json`

### RUN-D17 — native policy/witness/result records

Prompt:

`COLD_Q004_17_PROMPT.md`

Hidden scorer file:

`Q004_17_ASSERTIONS_004.json`

### RUN-D18 — source ambiguity

Prompt:

`COLD_Q004_18_PROMPT.md`

Hidden scorer file:

`Q004_18_ASSERTIONS_004.json`

### RUN-D19 — novel-class induction

Prompt:

`COLD_Q004_19_PROMPT.md`

Hidden scorer file:

`Q004_19_ASSERTIONS_004.json`

### RUN-D20S — structural-only retrieval

Prompt:

`COLD_Q004_20_STRUCTURE_ONLY_PROMPT.md`

Hidden scorer file:

`Q004_20_ASSERTIONS_004.json`

The structural-only agent MUST NOT read `Q004_20_LABEL_ASSIST_004.axh`.

### RUN-D20L — label-assisted retrieval

Prompt:

`COLD_Q004_20_LABEL_ASSISTED_PROMPT.md`

Hidden scorer file:

`Q004_20_ASSERTIONS_004.json`

## Freeze / unblind procedure

For every run:

```text
fresh isolated context
-> read only prompt-permitted files
-> produce complete raw report
-> record ambiguities/difficulties
-> freeze/commit report
-> only then open hidden assertion file
-> score exact agreements/disagreements
-> classify every discrepancy
-> commit post-unblind review separately
```

Never edit the frozen cold output to make it agree with the scorer.

## Discrepancy classes

Use at least:

```text
decoder/search error
specification contradiction
specification ambiguity
representation ambiguity/insufficiency
protocol ambiguity/failure
information-isolation failure
namespace/identity error
reference/binder error
rewrite/event error
factorization/extraction leakage
comparison-policy leakage
witness/accounting error
verification error
index/search incompleteness
class-schema vacuity/overfit
source-ambiguity handling error
intended behavior / scorer defect
resource limit
```

## Campaign completion condition

Experiment 004 is not qualified when the fixtures exist.

It reaches its first qualification checkpoint only when all frozen cold runs above have:

- isolated outputs;
- post-freeze scoring;
- discrepancy classification;
- independent witness/certificate review where applicable.

No specification repair precedes discrepancy classification.
