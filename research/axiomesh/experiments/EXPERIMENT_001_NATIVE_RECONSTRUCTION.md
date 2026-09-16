# Experiment 001 — Native Reconstruction

**Branch:** `experiment/axiomesh-native-reconstruction`  
**Parent research line:** `research/axiomesh-context-logic`  
**Status:** designed, not yet qualified  
**Purpose:** test whether the current AxiomeSH core can carry exact novel relational structure between isolated agents without relying on shared conversation state, English explanation, or pretrained recognition.

## Question

Can one agent encode a novel structural object directly in AxiomeSH such that a fresh isolated agent can reconstruct the same structure exactly and then reason over it correctly?

This is the first test because failure here invalidates stronger claims about context compression, cross-session continuation, or synthesis.

## Hypotheses

### H1 — exact cold reconstruction

Given a novel structure `X`, encoder agent `A` produces only AxiomeSH representation `C`. A fresh agent `B`, with no access to `X`, the encoder conversation, or hidden explanatory context, receives the core spec plus `C` and reconstructs `X'`.

Required:

```text
X' ≅ X
```

where equivalence is structural, not verbal similarity.

### H2 — distinction preservation

If `X2` differs from `X` by one load-bearing relation, scope boundary, incidence position, shared identity, or rewrite guard, the reconstruction must preserve that difference.

### H3 — direct reasoning

A fresh agent should be able to answer structural questions from `C` without first translating the entire object back into prose.

## Controls

Run the same source structures through at least three representations:

1. natural-language description;
2. conventional explicit structured notation chosen as a neutral baseline;
3. AxiomeSH Draft 0.1.

Keep semantic information constant. Do not give one representation extra facts.

Character count and token count are recorded but are not the success criterion.

## Test corpus

Use synthetic structures that are unlikely to exist in model pretraining.

Each case should be generated from opaque identities and arbitrary relations, then given a separate human-readable oracle only for scoring.

Initial families:

- unordered scoped hypergraphs;
- ordered hyperedges with near-permutation traps;
- repeated shared identities versus copied-but-distinct identities;
- nested scopes;
- guarded rewrite systems;
- multiway successor systems;
- isomorphic pairs under complete relabeling;
- near-isomorphic pairs with one changed incidence;
- structures containing repeated motifs suitable for references;
- structures whose correct interpretation depends on a negative application condition.

Avoid famous mathematical objects, standard puzzles, known graphs, or natural-language labels that could act as pointers into pretrained knowledge.

## Isolation requirement

The decoder/evaluator agent must not have access to:

- the original source object;
- the encoder transcript;
- the expected answer;
- this experiment's generation seed if that seed reveals structure;
- previous attempts on the same exact case;
- descriptive names that identify a known object.

The decoder may receive the frozen AxiomeSH core specification required to interpret the representation.

A same-context reconstruction is not qualification evidence.

## Encoder prompt shape

The encoder receives:

```text
Preserve every structurally meaningful distinction in the supplied object.
Encode it directly using the frozen AxiomeSH core.
Do not add English explanations.
Do not omit information merely to shorten the encoding.
Return only the AxiomeSH object.
```

A later compression phase may ask the encoder to reduce representation size, but only after exactness is established.

## Decoder tasks

For every case, the fresh decoder must:

1. reconstruct the complete structural object;
2. enumerate atoms and scopes;
3. enumerate ordered incidences;
4. identify shared identities;
5. identify all rewrite rules and guards;
6. list valid immediate rewrites for a supplied state when applicable;
7. distinguish the case from its adversarial near-isomorph;
8. identify an isomorphic relabeling when supplied one.

The reconstructed output should be converted into a canonical oracle form for scoring.

## Exactness scoring

Primary score is binary per case:

```text
PASS = reconstructed structure is canonically isomorphic to oracle
FAIL = any load-bearing distinction is missing, added, merged, reordered, rescoped, or reinterpreted
```

Also record error class:

```text
identity-loss
false-identity
edge-order-loss
scope-loss
scope-invention
relation-loss
relation-invention
guard-loss
guard-invention
rewrite-direction-error
reference-error
unsupported-semantic-assumption
other
```

Do not award partial semantic credit for the exact-reconstruction metric.

## Reasoning probes

After reconstruction, ask questions whose answers depend on exact structure rather than surface recognition.

Examples:

- Which two objects share the only common incident identity?
- Does swapping positions 2 and 3 in edge `E` preserve the represented object?
- Which rewrites are enabled in this exact scope?
- Are structures `A` and `B` isomorphic under relabeling?
- What is the smallest residual preventing `A` and `B` from being isomorphic?
- Can two independently represented fragments compose without identifying distinct atoms?

Reasoning results are scored separately from reconstruction.

## Representation-discovery subtest

Once baseline AxiomeSH exactness is measured, allow encoder agents to mutate the serialization while preserving core semantics.

For each candidate encoding `C_i`:

```text
X -> C_i -> fresh decoder -> X_i'
```

Reject any candidate for which:

```text
X_i' != X
```

among the frozen test corpus.

Surviving encodings are compared by:

- tokenizer cost;
- decoder exactness;
- reasoning accuracy;
- latency/compute where measurable;
- robustness across model instances;
- ambiguity/error profile.

The shortest encoding does not automatically win.

## Pretrained-knowledge contamination test

Include adversarial structures that resemble familiar objects but differ by one structurally decisive relation.

A decoder that silently repairs the object toward the familiar structure fails the case.

This tests whether the encoding actually carries the structure rather than merely triggering a pretrained concept.

## Initial falsifiers

The current Draft 0.1 substrate is challenged if any of the following persists after obvious syntax defects are removed:

- fresh decoders cannot reconstruct shared identity reliably;
- scope boundaries require extensive natural-language explanation;
- ordered hyperedge positions are repeatedly normalized away;
- negative application conditions are systematically misread;
- exact reconstruction requires expansion so verbose that conventional notation is consistently superior;
- agents must translate the whole representation into prose before reasoning correctly;
- graph/rewrite form creates systematic ambiguity that disappears under another equally exact substrate.

## Promotion rule

No result from this experiment changes the parent AxiomeSH specification automatically.

A proposed core change should include:

```text
observed failure or advantage
minimal responsible structural feature
candidate correction
counterexample set
retest result
impact on existing cases
```

Only then should the parent research branch be updated.

## First execution slice

Start small:

```text
12 synthetic source objects
4 plain relational structures
2 nested-scope structures
2 rewrite systems
2 isomorphic pairs
2 near-isomorphic adversarial pairs
```

For each, collect at least one independent cold decode before changing the syntax.

The first objective is not to prove AxiomeSH superior. It is to find the first place where the representation fails to preserve or expose structure.
