# Experiment 002 — Cold Decoder Protocol

You are an isolated AxiomeSH decoder. This is qualification, not design.

## Allowed files

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_1.md`
2. `research/axiomesh/experiments/002/COLD_DECODER_PROMPT_002.md`
3. `research/axiomesh/experiments/002/CONNECT4_LOGIC_002.axh`

Do **not** read or search for:

- `ATOM_ORACLE_002.json`;
- `SOURCE_CONNECT4_LOGIC_002.md`;
- `SOURCE_RELATIONS_002.json`;
- `RESULTS_002.md`;
- Experiment 001 oracle/results/issues;
- Connect4 repository files;
- commit diffs or issues that expose atom meanings or expected answers.

Do not mutate the repository.

## Objective

Determine what the native AxiomeSH object communicates structurally to a fresh agent without English atom labels.

Do not guess what opaque atoms mean. Report structural facts only.

## Required reconstruction

Return a machine-readable reconstruction containing:

1. every atom used by the corpus;
2. every ordered edge exactly as represented;
3. the outer scope and its unordered-member semantics;
4. the set of claim-like hub atoms discoverable from repeated structural roles;
5. their one-to-one status-like attachments;
6. their one-to-one primary-layer-like attachments;
7. their proposition-like attachments and proposition-to-concept incidence;
8. all 4-ary relation edges among hub atoms and non-hub targets;
9. guard-like, scope-like, and disposition-like attachments;
10. the layer-to-layer flow subgraph.

Do not use source names such as `C4-R0011`, `missing_law`, `supports`, or `geometry` unless those names are present in the allowed AxiomeSH payload. They are not expected to be.

## Structural probes

Answer these using atom IDs only.

### P1 — corpus cardinality

How many distinct hub atoms participate as the second position of an edge whose first position is `1`?

### P2 — status partition

Group those hub atoms by the third-position atom in their `(1 hub status)` edge. Report the size of every group.

### P3 — sparse exceptional groups

Which hub atoms belong to status atoms `207`, `208`, and `209`?

### P4 — central composition-like node

For hub atom `1011`:

- list every incoming and outgoing 4-ary edge whose first atom is `4`;
- preserve the middle relation atom exactly;
- do not interpret relation semantics.

### P5 — refinement chain

Starting at hub `1043`, follow all outgoing relation edges. Identify any target that is also connected to `1043` through a different hub by a two-step path.

### P6 — selection bridge

For hub `1052`, enumerate all outgoing relation edges and targets. Then list every hub that has an outgoing relation edge targeting `1052`.

### P7 — geometry chain

Trace the directed claim-to-claim subgraph among `1057`, `1058`, `1059`, `1002`, `1012`, and `1050` using only 4-ary relation edges.

### P8 — negative-knowledge preservation

For each hub attached to status `208` or `209`, list its outgoing claim-relation edges. Confirm that none of those hubs has been structurally merged with the target it constrains/depends on.

### P9 — guards/scopes

Report all hub atoms with first-position-`6` attachments and all hub atoms with first-position-`7` attachments. Preserve multiplicity.

### P10 — structural bottleneck

Ignoring atom meanings, identify the hub or hubs that appear most structurally central to unresolved dependencies by considering:

- incoming/outgoing claim relation degree;
- membership in sparse status classes;
- paths from multiple primary layers.

This is an exploratory graph inference. State the structural evidence, not a semantic interpretation.

## Output discipline

Separate:

- exact reconstruction;
- derived graph facts;
- exploratory structural inference;
- specification ambiguities.

If Draft 0.1 leaves any aspect ambiguous, report it rather than repairing the representation.

Do not compare against an oracle. Do not translate the corpus into prose before operating on it.