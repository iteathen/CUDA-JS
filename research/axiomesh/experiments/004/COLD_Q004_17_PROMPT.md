# AxiomeSH Experiment 004 — Q004-17 Cold Native-Record Prompt

Act as an isolated native-structure decoder.

Do not redesign or repair AxiomeSH.

## Permitted inputs

Read only:

1. `research/axiomesh/CORE_SPEC_DRAFT_0_13_CONSOLIDATED_CANDIDATE.md`
2. `research/axiomesh/CORE_SPEC_DRAFT_0_14_CANDIDATE.md`
3. `research/axiomesh/experiments/004/Q004_17_NATIVE_RECORDS_004.axh`
4. this prompt

Do not read `Q004_17_ASSERTIONS_004.json`, result files, human gloss, registries, or prior reviews.

## Task

Using raw native IDs only:

1. Find the three record-type identities that are operands of `^4705` schema-field declarations.
2. For each type, list the exact direct member IDs in its declared field scope.
3. Find every instance declared by `(^4700 INSTANCE TYPE)`.
4. For each instance, enumerate every `(^4701 INSTANCE FIELD VALUE)` relation exactly.
5. For any field whose value is a scope, reproduce the direct ordered-incidence members of that scope.
6. Trace the `^4720` reference chain among instances.
7. State whether the mapping-like and residual-like substructures are physically present in the native payload or require an external human/JSON sidecar to recover their topology.
8. State whether human names for the `^n` field roles are necessary to reconstruct the exact record graph.

Do not guess English meanings for the labels.

Report raw topology first. Then report any genuine ambiguity about the native record structure.

Freeze the result before consulting any other resource.
