# Experiment 002 — Results

**Status:** first render reclassified as incomplete; specification expanded; complete native logical rerender pending.

## Source integrity

Source repository `iteathen/Connect4` was used read-only.

Frozen source commit:

`0e5e29e4ca4fd3941bdcffe70a52b66348705589`

No Connect4 files, branches, issues, claims, or research artifacts were modified by this experiment.

The copied logical source is retained locally in this experiment as:

- `SOURCE_CONNECT4_LOGIC_002.md` — normalized statements, guards/scopes, measurements, and open seams;
- `SOURCE_RELATIONS_002.json` — source claim-relation graph.

## First render disposition

Initial native payload:

`CONNECT4_LOGIC_002.axh`

Initial scoring sidecar:

`ATOM_ORACLE_002.json`

The first payload successfully encoded the **research graph surrounding the claims**:

- 59 claim identities;
- 59 statuses;
- 59 primary-layer attachments;
- 137 source claim-relation edges;
- 23 explicit guards;
- 19 bounded-scope attachments;
- two deferred dispositions;
- eight central layer-flow edges;
- proposition-to-concept incidence structure.

However, each full claim body was represented by an opaque proposition object (`5001..5059`) whose actual source meaning remained in external source/oracle material.

Therefore the first render is now classified as:

```text
structural graph prototype
```

and **not** as:

```text
complete native logical render
```

The earlier statement that the first render was complete was incorrect for the intended Experiment 002 objective.

## Why this is a specification result

The failure was not merely a conversion omission. Draft 0.1 lacked several distinctions required to encode the actual Connect4 propositions without hidden convention.

Concrete pressure included:

- numeric values versus alpha-renamable identities;
- stable theory symbols versus anonymous graph atoms;
- declarative implication versus operational rewrite;
- explicit universal and existential binding;
- propositional equality;
- classical negation versus negative application condition;
- declarative alternatives;
- exact reference semantics;
- boundary-preserving comparison;
- variable aliasing/freshness rules;
- scope multiplicity.

These findings are recorded in:

`SPEC_EXPANSION_002.md`

and produced the experimental candidate:

`research/axiomesh/CORE_SPEC_DRAFT_0_2_CANDIDATE.md`

## Draft 0.2 candidate additions

The candidate introduces the minimum forms currently justified by evidence:

```text
bare n      structural identity, alpha-renamable
#n          exact literal
#p/q        exact rational literal
^n          stable theory semantic symbol
[L] > [R]  operational rewrite
L => R      declarative implication
*?n term    universal binder
+?n term    existential binder / explicit freshness in RHS creation context
A == B      declarative equality
~term       declarative negation
!term       negative application condition
{...}       unordered declarative alternatives
```

It also corrects Draft 0.1's grammar closure, reference scope, boundary-aware isomorphism, duplicate-member semantics, and hidden variable-injectivity/freshness defaults.

## What remains valid from the first render

The first render remains useful evidence that the Draft 0.1 substrate can compactly preserve the normalized research topology.

The following author-side checks remain valid for that **graph prototype**:

- source claims: 59 (`C4-R0001..C4-R0059`);
- claim hubs: 59;
- status partition reproduced exactly;
- claim-relation topology preserved for the copied normalized graph;
- general composition gap `R0011`, line-hit realizability refinement `R0043`, and optimal-selection bridge `R0052` remain separate objects;
- derivative geometry and game-semantic lift remain structurally separated;
- negative/rejected/deferred evidence is not merged into positive proof authority.

These results do not qualify proposition-body recovery.

## Compression observation withdrawn as a language result

The first source snapshot was about 21.7 KB and the first `.axh` graph about 8.1 KB.

This ratio is not evidence of logical compression because proposition bodies were externalized. It must not be cited as an AxiomeSH compression result.

Any future size comparison must include all native theory structure needed to recover the actual claims.

## New completion criterion

Experiment 002 is complete only when all 59 normalized Connect4 claims have native formula structure under the candidate spec or a later evidence-driven expansion.

For every claim, the replacement render must preserve where applicable:

- variables and their binding;
- quantifier kind;
- antecedent/guard structure;
- consequence structure;
- exact numeric values;
- equality and negation;
- alternatives;
- algebraic/set-valued operations as theory symbols;
- empirical measurement values and bounded scope;
- epistemic status;
- source claim-to-claim relations.

A scorer may translate semantic symbol IDs to human gloss, but must not contain proposition structure absent from the native payload.

## Current qualification state

```text
Experiment 001 / Draft 0.1 synthetic structural reconstruction: passed on exercised surface
Experiment 002 first Connect4 graph prototype: structurally qualified as graph only
Experiment 002 Draft 0.1 full logical expressibility: failed
Draft 0.2 candidate spec expansion: produced
Experiment 002 complete Draft 0.2 Connect4 logical rerender: pending
Independent cold decode of complete logical rerender: pending
Native continuation/synthesis test: pending
```

The next artifact must be a replacement Connect4 theory payload, not another metadata-only graph.
