# AxiomeSH

**Status:** research incubation  
**Research direction:** Josh Oshiro  
**Current core hypothesis:** agent-native scoped hypergraph rewriting

AxiomeSH is an experimental structural knowledge representation for neural reasoning agents.

Its central question is:

> Can an agent reason, synthesize, and continue work more effectively when the external representation of knowledge is closer to the relational structure it must manipulate than to a language optimized for human communication?

AxiomeSH is not initially a shorter notation for existing logic. It is an attempt to discover a more direct structural substrate for agent reasoning.

The current leading hypothesis is:

\[
\boxed{\text{knowledge}=\text{relational structure}+\text{lawful structural transformation}}
\]

and therefore:

\[
\boxed{G \xrightarrow{R} G'}
\]

A fact is structure. A relation is structure. A state is structure. A rule is structure. A derivation is a rewrite history. An invariant is structure preserved across a specified class of rewrites. Rules and theories may themselves become first-class structures.

The graph-rewrite direction is a **research hypothesis, not a settled commitment**.

## Current documents

- [`CORE_SPEC_DRAFT_0_1.md`](./CORE_SPEC_DRAFT_0_1.md) — first explicit core specification.
- [`DESIGN_NOTES.md`](./DESIGN_NOTES.md) — current research rationale, constraints, hypotheses, and falsifiers.

This directory is the durable home for the AxiomeSH incubation work on the `research/axiomesh-context-logic` branch.

## Objective

AxiomeSH aims to maximize:

> **durable, correct agent synthesis per total lifecycle resource cost**

under non-negotiable preservation of:

- semantic fidelity;
- structural soundness;
- canonical integrity;
- load-bearing distinctions;
- required provenance;
- recoverability.

Character count and tokenizer cost matter, but they are costs rather than the objective.

A compact representation that makes reasoning harder is not a success.

A useful rough objective is:

\[
\max_R
\frac{S(R)}
{C_{\text{context}}+
 C_{\text{compute}}+
 C_{\text{retrieval}}+
 C_{\text{ingest}}+
 C_{\text{maintenance}}+
 C_{\text{migration}}}
\]

where \(S(R)\) is valid synthesis yield under representation \(R\).

## Raw core first

The initial architecture is deliberately:

```text
raw AxiomeSH -> agent -> raw AxiomeSH
```

During the core research phase:

\[
\boxed{\text{representation}=\text{interface}}
\]

There is no mandatory:

- English parser;
- English renderer;
- existing formal-logic translation;
- JSON envelope;
- model-specific adapter;
- database translation;
- compatibility layer.

This is intentional.

An early translation boundary would make failures hard to attribute and could hide exactly the isomorphic shapes AxiomeSH is intended to expose.

The project therefore starts with **one semantic structure**. Later serializers, renderers, theorem-language adapters, databases, model-specific encodings, and compatibility layers may project from that core, but they must not become peer semantic authorities.

The native fast path should remain possible:

```text
AxiomeSH -> native agent -> AxiomeSH
```

## Why structure and rewriting

The requirements accumulated independently around a representation that must support:

- arbitrary relational structure;
- higher-arity relations;
- explicit scope;
- composition;
- transformation;
- recursive self-representation;
- isomorphism and partial isomorphism;
- structural residuals;
- invariant preservation;
- exact continuation across context boundaries.

A small hypergraph/rewrite substrate is currently the strongest candidate because it can represent both what a structure **is** and what lawful reasoning **does to it** using the same substrate.

The intended direction is closer to:

\[
\text{valid inference}
=
\text{allowed structural transformation}
\]

than to privileging human-readable proposition manipulation as the fundamental operation.

This does not prove that graph rewriting is the correct basis. If important knowledge repeatedly requires awkward graph scaffolding while another exact representation gives a more direct natural analog, the graph-rewrite hypothesis should be generalized or rejected.

## Minimal current shape

The current draft starts with opaque atoms, ordered hyperedges, unordered scopes, pattern variables, local references, negative application conditions, and local rewrite rules.

Example structure:

```text
[
  (0 1 2)
  (3 2 4)
]
```

Example rewrite:

```text
[(0 ?0 ?1)] > [(1 ?0 ?1)]
```

Example guarded rewrite:

```text
[
  [(0 ?0) !(1 ?0)]
  >
  [(0 ?0)(2 ?0)]
]
```

This syntax is provisional.

The project should resist adding primitives merely because conventional logic has named operators for them. `AND`, `OR`, `TYPE`, `FORALL`, `EXISTS`, `JOIN`, `IMPLIES`, and similar concepts must earn primitive status if structural composition does not already express the needed semantics.

## Structural identity

AxiomeSH is interested in structural equality rather than textual equality.

Incidental differences such as atom spelling, reference numbering, whitespace, or unordered member presentation should not change semantic identity.

Load-bearing differences such as ordered incidence, scope boundaries, rewrite direction, shared identity, guards, or negative conditions must remain visible.

A central target operation is therefore:

\[
G_A \cong G_B
\]

or, when equivalence is only partial:

\[
G_A = C + \Delta_A
\]

\[
G_B = C + \Delta_B
\]

where \(C\) is the common structural core and the residuals remain explicit.

## Composition is central

AxiomeSH is not primarily a notation-compression project.

The important operation is composition.

The representation must let agents determine which independently derived structures can be combined, under which guards, while preserving required semantics.

The first hypothesis is that compatible structures may compose naturally through common scope and shared identity:

```text
[
  G1
  G2
]
```

but this remains a major research seam. Loss of correlation, scope, support, timing, provenance, or dependency information must not be hidden by an attractive coarse composition.

## The Markov / sufficient-state hypothesis

The branch began by investigating tokenized transition chains and Markov-like sufficient states.

That question remains useful but no longer determines the architecture.

The relevant hypothesis is:

> A current structural state may be made semantically sufficient for future reasoning so that irrelevant textual history can be discarded.

Formally, the desired situation is approximately:

\[
S_{t+1}=F(S_t,o_t)
\]

where \(S_t\) contains every nonlocal distinction needed for valid continuation.

This is not the claim that transformer reasoning is an ordinary first-order Markov chain.

If two histories map to the same compact state but permit different valid continuations, the quotient is unsound and the missing distinction must remain represented.

## Latent-capability hypothesis

A major motivation is the possibility that observed model limits partly reflect representation and bookkeeping limits rather than only missing reasoning operations.

A transformer may already possess strong local capabilities for:

- relational analogy;
- constraint propagation;
- decomposition;
- formal manipulation;
- optimization;
- invariant recognition;

while failing to coordinate them reliably across very large human-oriented representations.

AxiomeSH tests whether some of the burden can move from:

\[
\text{remember}+\text{interpret}+\text{reason}
\]

toward:

\[
\text{reason over explicit structure}
\]

without claiming that representation can eliminate genuine search, learning, or architectural limits.

## Let agents help discover the representation

AxiomeSH should not assume that humans can infer the representation most natural to neural agents.

One proposed discovery loop is:

```text
Agent A receives novel structure X
-> emits compact representation C

Fresh Agent B receives only C
-> reconstructs X'
```

Require:

\[
X'=X
\]

for every semantically relevant distinction.

Then test reasoning directly over \(C\).

The shortest exact encoding is not automatically the best reasoning encoding. A candidate must be judged both on recovery and on downstream synthesis under fixed resource budgets.

Synthetic and adversarial structures are required so that an agent cannot appear to compress information merely by pointing at knowledge already stored in model weights.

## Qualification

Initial comparisons should include:

1. cold exact reconstruction;
2. near-isomorph discrimination;
3. full isomorphism recognition;
4. partial isomorphism with exact residuals;
5. rewrite correctness;
6. long composition without scope/identity drift;
7. cross-context continuation;
8. novel synthesis;
9. performance under context pressure;
10. comparison against natural language and established formal representations at matched resource budgets.

AxiomeSH is interesting only if the representation produces measurable advantages where its design predicts them.

## Target agent

AxiomeSH is not defined around one vendor, tokenizer, or model generation.

The target is a capability class:

> bounded-context reasoning agents capable of learning a compact representation, maintaining structural references, retrieving external knowledge, and synthesizing relations across independently developed domains.

Current transformer models are the immediate experimental population. Their behavior matters to optimization, but they do not define core semantics.

## Ownership boundary

This research branch lives in CUDA-JS because it is the current generic incubation host.

AxiomeSH is **not** a CUDA-JS runtime responsibility and must not leak into maintained CUDA-JS APIs or implementation merely because the research branch lives here.

If AxiomeSH becomes independently load-bearing, it should move to a dedicated repository/package with its own authority and contracts.

## Current operating rule

> **Core semantics must never depend on a translation layer.**

The first job is to discover the structural core.

Transport optimization comes later.
