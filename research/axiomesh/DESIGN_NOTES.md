# AxiomeSH Design Notes

**Status:** research notes, not accepted core semantics  
**Research direction:** Josh Oshiro

This document preserves the design reasoning that led from the original context-logic incubation to the first scoped-hypergraph rewrite specification.

It exists to keep hypotheses, constraints, and negative knowledge available across agent/context resets without promoting them into settled language semantics.

## 1. Problem framing

The project began from a practical observation: complex formal and optimization work can exceed human working-memory capacity even when the individual operations are understandable.

A capable agent can often perform many of the local operations but loses coherence when the representation requires it to repeatedly reconstruct:

- identity;
- scope;
- dependencies;
- exclusions;
- intermediate results;
- unresolved branches;
- structural correspondences;
- provenance;
- long-range constraints.

This motivates a distinction among four possible ceilings:

1. **representation ceiling** — the important structure is hard to see;
2. **working-state ceiling** — the structure is visible but cannot be retained coherently;
3. **search ceiling** — the state is clear but combinatorics remain too large;
4. **learned-operation ceiling** — the needed reasoning transformation is genuinely absent or unreliable.

AxiomeSH is primarily aimed at the first two. Structural quotienting and canonicalization may also reduce some search. It does not assume representation can remove genuine learned-operation limits.

## 2. Latent structural-reasoning hypothesis

A working hypothesis is:

> A transformer may possess considerably more latent structural-reasoning capability than is observable when it must operate through representations optimized for human communication.

Transformers already learn and manipulate implicit relations such as:

- implication;
- equivalence;
- hierarchy;
- temporal order;
- program state;
- mathematical transformation;
- causal association;
- constraint interaction.

Those relations exist internally in distributed learned representations, while the persistent external interface is usually words or human-designed formal notation.

AxiomeSH asks whether an external structural state can become a better coordinate system for those capabilities.

The relevant empirical question is whether the observed ceiling is approximately:

\[
\text{reasoning ceiling}
\]

or instead contains a substantial:

\[
\text{representation}+\text{bookkeeping ceiling}
\]

If an unchanged model can reliably solve synthesis/optimization tasks in AxiomeSH that it cannot solve in conventional notation under matched resources, that would be evidence for the latter.

## 3. Natural analog before translation

A major architectural decision is:

> **One semantic structure. No internal translation boundary.**

The early project should not be:

```text
source
-> formal language A
-> translator
-> agent language B
```

because then any result is confounded by:

- representation choice;
- decomposition choice;
- mapping choice;
- translation loss;
- compiler artifacts;
- model behavior.

Instead the intended path is:

```text
observed structure
-> canonical structural object
```

Normalization is unavoidable; semantic translation is not.

The first AxiomeSH form is both semantic representation and wire representation.

Later projections may include:

- human rendering;
- Lean/Coq/SMT adapters;
- graph/database storage;
- compact model transports;
- tokenizer-native encodings.

Those projections must remain downstream of the core.

## 4. Raw input and raw output

Initially:

```text
raw input -> AxiomeSH core -> raw output
```

For native operation:

```text
AxiomeSH -> agent -> AxiomeSH
```

This serves two purposes:

1. development remains attributable to the representation rather than adapters;
2. the final system retains an optimized path with no compulsory translation overhead.

The governing rule is:

> Nothing required for interoperability should become mandatory for native AxiomeSH operation.

## 5. “Fewest characters” is not the objective

A tokenizer does not charge characters uniformly, and an aggressively minified representation may increase interpretation cost.

The real target is useful structural work per total resource.

The project therefore distinguishes:

- byte count;
- character count;
- tokenizer cost;
- context occupancy;
- reconstruction accuracy;
- reasoning accuracy;
- synthesis yield;
- compute cost;
- retrieval cost;
- maintenance/migration cost.

A representation may be excellent archival compression and poor reasoning state.

## 6. Let the model reveal representational preference

Rather than infer the ideal agent language only from neural-network architecture, the model itself can participate in representation discovery.

Basic loop:

```text
Agent A receives X
-> produces compact C

Fresh Agent B receives C only
-> reconstructs X'
```

Require exact structural recovery:

\[
X'=X
\]

Then use fresh agents to reason over surviving encodings.

This creates two distinct fitness tests:

\[
F_{\text{storage}}(C)
=
\frac{\text{exact recoverability}}{\text{size}}
\]

and:

\[
F_{\text{reason}}(C)
=
\frac{\text{correct synthesis}}
{\text{context/compute cost}}
\]

The second is ultimately more important.

Failures should be fed back into the representation search:

```text
C0 + reconstruction/reasoning failure
-> C1
-> retest
```

This is selection on representations rather than conventional top-down language design.

## 7. Prevent pretrained-knowledge cheating

Cold reconstruction can appear successful when a compact label merely points to knowledge already stored in model weights.

For example, naming a familiar theorem is not self-contained compression.

Early test objects should therefore include:

- novel synthetic structures;
- modified familiar structures with one critical difference;
- cross-domain structures;
- adversarial near-isomorphs;
- generated structures with no established cultural label.

Modified familiar structures are especially valuable because they detect silent snapping back to a pretrained prototype.

## 8. Exactness pressure

“100% accurate extraction later” is an important pressure.

A representation that loses one small distinction may lose exactly the invariant required for later synthesis.

The basic experimental loop is:

```text
compress
-> cold reconstruct
-> compare
-> falsify
-> compress further
```

and separately:

```text
reason over compressed form
-> measure synthesis
```

“Approximately the same idea” is not sufficient for qualification when exact structure is available as an oracle.

## 9. Stakeholders and veto structure

The project should not optimize one participant by externalizing cost onto another.

Relevant constituencies include:

- source knowledge;
- ingest/extraction agents;
- reasoning/synthesis agents;
- verification/falsification agents;
- orchestration;
- persistent corpus;
- retrieval/context selection;
- tokenizer/model interface;
- inference/runtime infrastructure;
- current and future model families;
- migration/interoperability;
- downstream systems;
- human stewards;
- provenance/evidence;
- adversarial/error environment;
- represented domains.

These should not be treated as equal voters.

The useful distinction is:

### Governing principals

The project owner/governing authority defines mission and has genuine global authority.

### Primary beneficiary

The target synthesis-agent population has a functional empirical veto: if qualified agents cannot exploit the representation, the project fails.

### Protected interests

Semantic fidelity, structural correctness, canonical integrity, provenance, recoverability, and required domain distinctions are constitutional constraints rather than “votes.”

### Replaceable participants

Individual runtimes, tokenizers, models, databases, storage providers, ingest/checking agents, and orchestration components should not acquire architectural veto power merely because the current implementation depends on them.

A practical test for formal veto is:

\[
\text{mission-critical legitimate interest}
+
\text{credible inability to proceed without consent}
\]

Shutdown power without mission legitimacy is a dependency problem to engineer away.

Mission importance without agency is a constitutional constraint.

Both together constitute a genuine veto.

## 10. Target agent class

The project should not optimize for one model generation.

The target is a capability class:

> bounded-context reasoning agents capable of learning a compact representation, retrieving external knowledge, maintaining references across work units, and synthesizing structural relations across independently developed domains.

Current transformer models provide the first test population.

Future models must remain able to consume the corpus or migrate it without semantic loss.

## 11. Markov-like sufficient semantic state

The original incubation emphasized Markov-like transition chains.

The useful surviving concept is not that transformer computation is a literal Markov chain.

It is the search for a **semantically sufficient current state**.

If:

\[
S_{t+1}=F(S_t,o_t)
\]

is possible because \(S_t\) retains every distinction required for future valid reasoning, old textual history can be discarded.

If two histories produce the same \(S_t\) but support different valid continuations, then \(S_t\) was not sufficient.

AxiomeSH should therefore test the minimum state required to restore continuation equivalence.

The expected structure is likely richer than an ordinary chain because inference can involve:

- multiple antecedents;
- guards;
- quantifiers;
- dependency cones;
- alternative branches;
- higher-order relations.

This is one reason a sparse typed/guarded hypergraph is a stronger current candidate than a simple Markov chain.

## 12. Why graph rewriting became the leading hypothesis

The design requirements accumulated around:

- relational rather than lexical identity;
- arbitrary arity;
- explicit structure;
- composition;
- local transformation;
- recursive self-representation;
- isomorphism;
- invariant preservation;
- no translation layer.

A graph/hypergraph plus rewrite calculus fits these naturally.

It also unifies state and inference:

```text
what exists:       G
lawful reasoning:  G -> G'
```

A derivation can therefore be a rewrite history, and a theory can itself be represented structurally.

This convergence is evidence worth testing, not proof.

Previous project work has also used graphs, hypergraphs, dependency structures, and structural composition, so historical conceptual priming cannot be ruled out as a source of bias. The substrate must stand on qualification, not the aesthetic appeal of convergence.

## 13. Minimal primitive bias

The core should begin with fewer semantic primitives than feels comfortable.

Every primitive asserts that a distinction is universal enough to live beneath all represented domains.

The current candidate basis is approximately:

```text
opaque identity
ordered incidence
unordered scope
reference
pattern binding
negative application condition
rewrite
```

Even this set is provisional.

Conventional named operators should be represented structurally until evidence shows they deserve primitive status.

## 14. Identity and isomorphism

Lexical names should not define semantic identity.

Two differently labeled structures may be isomorphic.

Two similarly labeled structures may not be.

The project needs at least conceptual separation among:

- literal/canonical identity;
- structural isomorphism;
- projection-relative/behavior-preserving equivalence;
- proof/certificate identity;
- retrieval identity.

These may not collapse into one universal equivalence relation.

AxiomeSH should expose common cores and residuals rather than force false equivalence.

## 15. Composition as the central research problem

Local predicates or individually valid fragments do not guarantee globally realizable composition.

AxiomeSH therefore treats composition as a core problem rather than syntax sugar.

When a representation factors a structure, always ask:

```text
Are arbitrary combinations of the factors jointly realizable?
```

If not, the missing compatibility relation is load-bearing knowledge.

This is especially important for cross-domain synthesis: matching local shapes is insufficient if the composition laws differ.

## 16. Experimental comparison

A fair benchmark should compare:

- natural language;
- established formal logic;
- conventional structured representations;
- AxiomeSH candidates;

at matched context and compute budgets.

Metrics should include:

- valid novel synthesis;
- false correspondences;
- exact retained distinctions;
- number of useful source structures simultaneously active;
- reconstruction fidelity;
- handoff degradation;
- tokenizer cost;
- inference compute;
- robustness across model instances/families.

Expected advantage, if the core hypothesis is correct, is likely asymmetric:

```text
small isolated problem:
  conventional logic ~= AxiomeSH

medium multi-source corpus:
  AxiomeSH may outperform

large heterogeneous multi-session corpus:
  AxiomeSH has the largest opportunity
```

This is a prediction to test, not a result.

## 17. Falsifiers

The research direction should be weakened or abandoned if:

- graph/rewrite representation repeatedly needs artificial scaffolding that another exact substrate avoids;
- exact reconstruction fails without hidden natural-language assumptions;
- agents must mentally decompress AxiomeSH before every useful operation;
- synthesis is no better at matched context/compute;
- canonicalization destroys distinctions needed later;
- context savings disappear under real tokenizers;
- representation advantage vanishes after controlling for pretrained-language familiarity;
- cross-model migration requires model-specific hidden semantics;
- adapters become necessary for native correctness;
- apparent compression depends mainly on knowledge already stored in model weights.

## 18. Current research posture

Do not prematurely optimize:

- punctuation;
- tokenizer-specific IDs;
- human syntax;
- database schema;
- theorem-prover compatibility;
- transport format.

First stabilize the natural structural primitives, composition laws, identity/equivalence semantics, and rewrite behavior.

Then optimize serialization around that stable core.

The current compact principle is:

> **Discover the structure first. Optimize its transport later.**
