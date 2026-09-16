# Experiment 002 — Results

**Status:** first native render complete; author-side structural qualification complete; independent cold decode pending.

## Source integrity

Source repository `iteathen/Connect4` was used read-only.

Frozen source commit:

`0e5e29e4ca4fd3941bdcffe70a52b66348705589`

No Connect4 files, branches, issues, claims or research artifacts were modified by this experiment.

The copied logical source is retained locally in this experiment as:

- `SOURCE_CONNECT4_LOGIC_002.md` — normalized statements, guards/scopes and open seams;
- `SOURCE_RELATIONS_002.json` — source claim-relation graph.

## Render artifact

Native payload:

`CONNECT4_LOGIC_002.axh`

Scoring/oracle sidecar (not part of native decoder input):

`ATOM_ORACLE_002.json`

The payload is raw Draft 0.1 AxiomeSH: one outer unordered scope containing ordered incidence edges only. It contains no English labels or comments.

## Author-side structural checks

### Claim coverage

- Source claims: **59** (`C4-R0001..C4-R0059`).
- Native claim hub atoms: **59** (`1001..1059`).
- Status attachments: **59**.
- Primary-layer attachments: **59**.
- Proposition attachments: **59** (`5001..5059`).
- Source claim-relation edges represented: **137**.
- Deferred-disposition attachments: **2** (`R0010`, `R0034`).
- Explicit guard attachments: **23**.
- Explicit bounded-scope attachments: **19**.
- Layer-flow edges: **8**.

### Status partition

The frozen source partitions into:

| Status | Count |
|---|---:|
| research_model | 1 |
| deductive_exact | 10 |
| guarded_exact | 7 |
| accepted_contract | 4 |
| empirically_supported | 25 |
| hypothesis | 2 |
| candidate_rule | 2 |
| missing_law | 3 |
| disproven | 4 |
| rejected | 1 |
| **total** | **59** |

The native status partition preserves those counts exactly.

Sparse negative/open groups are deliberately easy to audit structurally:

- status atom `207` (three hubs): `1011`, `1043`, `1052`;
- status atom `208` (four hubs): `1017`, `1031`, `1037`, `1055`;
- status atom `209` (one hub): `1041`.

No negative result is structurally merged with the mechanism or target that it constrains.

## High-value relation checks

### General composition gap

Hub `1011` retains its exact local prerequisites as outgoing relation edges to `1003`, `1004`, and `1005`.

It is separately connected from later research by dependency/support/refinement/constraining edges. The representation therefore preserves the distinction between the original missing law and evidence/candidates that narrow it.

### Line-hit realizability refinement

Hub `1043` has exactly these source-level outgoing relations:

- derived from `1042`;
- refines `1011`;
- constrains `1008`.

This preserves the fact that the direct line-product recurrence gap is a concrete refinement of the general composition gap, not a separate unrelated problem.

### Optimal-selection bridge

Hub `1052` has outgoing relations:

- refines `1011`;
- depends on `1014`;
- depends on `1018`;
- bridges `1049`;
- bridges `1050`;
- bridges `1051`.

Incoming source relations to `1052` are preserved from:

- `1049` — constrains;
- `1051` — constrains;
- `1053` — supports;
- `1054` — supports;
- `1055` — constrains.

Thus the structural-28, terminal-28, maximal-delay, cross-board upper-bound and counterexample objects remain distinct while sharing one explicit missing bridge.

### Derivative chain

The native graph retains:

- `1057 -> 1002` (supports) and `1057 -> 1012` (constrains);
- `1058 -> 1057` (derived_from), `1058 -> 1002` (supports), `1058 -> 1012` and `1058 -> 1011` (constrains);
- `1059 -> 1058` (derived_from), `1059 -> 1002` and `1059 -> 1050` (supports), `1059 -> 1012` (constrains);
- `1002 -> 1012` (supports);
- `1050 -> 1002` (derived_from), `1050 -> 1012` and `1050 -> 1053` (supports), and `1050 -> 1049` (not-identical-to).

This preserves the source's crucial separation: closed linear geometry does not automatically close game semantics.

## Native semantic-density observation

The current source prose snapshot is about 21.7 KB while the native `.axh` graph is about 8.1 KB. This is **not** yet a valid compression win claim because the AxiomeSH payload currently represents proposition identity and structural concept incidence rather than reproducing every English sentence intrinsically. The sidecar/source files remain necessary for human scoring.

Accordingly, Experiment 002 does not count the byte ratio as evidence of superiority.

## What this render does preserve intrinsically

Without English labels, the payload itself carries:

- stable distinction among 59 claim objects;
- epistemic-class partition;
- primary logical-layer partition;
- source dependency/support/constrain/refine/bridge topology;
- proposition-to-concept incidence fingerprints;
- guard multiplicity and identity;
- bounded-scope identity;
- deferred disposition;
- central research-flow topology;
- negative/open results as first-class structural objects.

This is sufficient for an isolated decoder to reconstruct and query the research graph as structure.

## Important limitation discovered by construction

A claim's full natural-language proposition is not yet compiled into a complete executable rewrite calculus. Each proposition is represented as a first-class opaque proposition object plus structural concept incidence, with source text held in the experiment snapshot/oracle.

This distinction is intentional and must not be hidden:

`lossless research graph render != complete theorem compiler`

The experiment therefore tests whether the existing research knowledge graph can become a native agent state before testing whether every theorem can itself be executed as an AxiomeSH rewrite.

A later pass may promote exact claims into executable rewrite structures only when their variables, domains, guards and consequence semantics can be represented without inventing premises absent from the source.

## Independent test

`COLD_DECODER_PROMPT_002.md` freezes the isolation protocol. The cold decoder receives only:

- Draft 0.1 core spec;
- the cold prompt;
- `CONNECT4_LOGIC_002.axh`.

It must not receive the atom oracle, copied source, relation oracle, this result file, Connect4 material, or issues/diffs exposing expected answers.

Until that fresh run is completed, the current result is **author-side structural qualification only**, not cold-decoder evidence.