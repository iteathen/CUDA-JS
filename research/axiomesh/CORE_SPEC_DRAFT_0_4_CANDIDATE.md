# AxiomeSH Core Specification — Draft 0.4 Candidate

**Status:** experimental tightening produced from Experiment 002 Draft 0.3 cold qualification/review (#268)  
**Parents:** `CORE_SPEC_DRAFT_0_2_CANDIDATE.md`, then `CORE_SPEC_DRAFT_0_3_CANDIDATE.md`  
**Form:** normative amendment; earlier candidate rules remain in force except where this document explicitly tightens them  
**Promotion:** experimental-branch authority only

Draft 0.4 adds no new logical primitive. It tightens qualification, bundle-signature exactness, and canonical presentation after the Draft 0.3 cold run showed that the native theory was structurally recoverable but one English-labelled probe caused a decoder-selection error even though the required raw relation edges were present.

---

## 1. Authority and compatibility

A Draft 0.4 decoder reads Draft 0.2, Draft 0.3, and this amendment in that order.

Draft 0.4 changes only the subjects named below:

- bundle-local signature exactness;
- separation of native/formal qualification from human-gloss qualification;
- cold-result freezing;
- regression-probe discipline;
- canonical presentation profile.

Draft 0.3 lexical variable scope remains unchanged.

No English string or human identifier is added to canonical core.

---

## 2. Canonical bundle signature is exact

Draft 0.3 required every theory-owned semantic symbol used by a theory body to appear in the native `^0` signature, while permitting unused declarations.

Draft 0.4 distinguishes a **canonical self-contained theory bundle signature** from a broader reusable vocabulary inventory.

For a native theory body `T`, define:

```text
Sig(T) = { ^n | ^n occurs in T and ^n is not core-reserved }
```

A canonical self-contained bundle signature MUST enumerate exactly `Sig(T)`.

Therefore:

```text
used and undeclared  -> invalid bundle
unused and declared  -> non-canonical bundle signature
exactly used         -> canonical closed bundle signature
```

Extra declarations do not change the meaning of the theory body, but they fail the canonical compact-bundle qualification because they add representation cost without contributing to that bundle.

### 2.1 Reusable theory-family vocabularies

A project MAY maintain a broader reusable vocabulary resource containing symbols not used by one particular body.

Such a resource is not the canonical `^0` signature for that body and does not substitute for bundle closure.

This keeps library breadth separate from the exact native working set supplied to an agent.

### 2.2 Canonical signature ordering

Signature member order remains semantically irrelevant.

For canonical serialization only, `^n` members MUST be emitted in increasing numeric symbol-ID order. This provides deterministic diffs and removes avoidable ordering entropy without making numeric proximity semantic.

---

## 3. Native qualification and human gloss are separate measurements

AxiomeSH is agent-native. A cold formal qualification must therefore be answerable from native structure alone.

Draft 0.4 defines two distinct channels.

### 3.1 Native/formal qualification

A native/formal probe MUST identify its target using only information present in the cold bundle, for example:

- raw claim/object identity;
- raw semantic-symbol identity;
- literal values;
- formula shape;
- relation topology;
- status/layer identity;
- explicit structural selectors.

A native/formal probe MUST NOT depend on an English concept name whose mapping to `^n` is intentionally withheld from the decoder.

If the target is described only as an external human gloss, the question is not a pure native/formal probe.

### 3.2 Human-gloss qualification

After the native/formal result is frozen, a separate review MAY provide a non-authoritative human glossary or source documentation and ask the decoder to map raw theory objects to human terminology.

This phase measures semantic naming/review interoperability, not native formula recovery.

A human-gloss miss MUST NOT retroactively change a correct raw reconstruction.

A wrong raw structural answer remains a native/formal failure even if a later glossary explains the intended concept.

### 3.3 No glossary authority

A human glossary may never supply formula structure, guards, literals, quantifiers, implication direction, equality, negation, choices, status, claim relations, or other load-bearing semantics missing from native input.

---

## 4. Cold result must be frozen before unblinding

When a qualification contains both cold decode and reference-backed review:

1. complete the cold native/formal report;
2. record its exact answers, ambiguities, and difficulties;
3. mark that result frozen;
4. only then open glossaries, source prose, audits, issues, or expected answers;
5. classify discrepancies without rewriting the frozen result.

The review classification SHOULD distinguish at least:

```text
decoder error
specification ambiguity
representation ambiguity/difficulty
native-signature insufficiency
human-gloss-only limitation
experiment-protocol issue
no defect / intended behavior
```

This prevents reference material from contaminating qualification evidence.

---

## 5. Regression probes must be natively selectable

A regression test SHOULD separate:

```text
prompt selector
expected answer
```

The prompt selector is visible to the cold decoder and MUST be expressible in native/raw terms.

The expected answer belongs to scorer/audit material hidden from the cold decoder.

A prompt MUST NOT reveal the expected raw edge merely to make a regression pass.

### 5.1 Experiment 002 derivative-chain regression

Issue #268 exposed one decoder-selection miss: the body and relation graph were reconstructed, but an English-labelled “derivative chain” probe selected the wrong nearby relation cluster.

The Experiment 002 scorer therefore records the exact expected native chain:

```text
(^5 1058 ^304 1057)
(^5 1059 ^304 1058)
```

The cold prompt must select this chain structurally, without showing those expected edges.

This is an experiment-specific regression fixture, not a new AxiomeSH semantic rule.

---

## 6. Canonical presentation profile

Whitespace remains semantically inert. A parser MUST NOT derive meaning from indentation or line breaks.

However, representation geometry affects decoder effort. A canonical **presentation** serializer therefore SHOULD expose direct structural boundaries consistently.

For human/agent-facing canonical presentation:

1. each direct member of a multi-member scope SHOULD begin on its own line;
2. each choice alternative SHOULD begin on its own line;
3. nested scopes/choices SHOULD be indented one level relative to their owner;
4. a direct infix proposition such as `A == B` or `A => B` SHOULD remain visually contiguous as one member, even when its operands are internally multiline;
5. claim/object blocks SHOULD be separated from sibling claim/object blocks by one blank line;
6. native signature members SHOULD follow the deterministic ordering rule in section 2.2;
7. formatting MUST NOT introduce a new grouping meaning or alter canonical semantic identity.

This profile is a serialization/decoder-cost rule, not a logical primitive.

Existing semantically valid payloads remain valid even when not rendered in this presentation profile. Presentation conformance should be measured separately from semantic conformance until sufficient evidence exists to make a stronger canonical-surface requirement.

---

## 7. Primitive semantic symbols remain allowed

Draft 0.4 does not require every `^n` to have an intrinsic English name or a definitional expansion.

A primitive theory symbol is complete for native formal reasoning when:

- its identity is stable;
- it is declared in the exact bundle signature;
- every load-bearing use is present in native structure;
- no external glossary is needed to recover formula topology or structural relations.

Human naming is a separate review concern.

---

## 8. Experiment 002 tightened bundle

For the Draft 0.4 regression, the formula payload remains byte-identical to the independently decoded Draft 0.2 formula payload:

```text
CONNECT4_LOGIC_002_DRAFT_0_2.axh
```

The canonical bundle signature is tightened to the exact 530 theory-owned symbols actually used by that payload:

```text
SEMANTIC_SIGNATURE_002_DRAFT_0_4.axh
```

The 11 unused Draft 0.3 declarations are intentionally removed:

```text
^10 ^11 ^12 ^1204 ^1304 ^1306 ^1307 ^1309 ^1310 ^1339 ^1344
```

This changes no proposition meaning.

---

## 9. Qualification gates for Draft 0.4

A Draft 0.4 Experiment 002 regression passes only if:

1. the bundle signature equals the exact used theory-symbol set;
2. there are zero used-but-undeclared symbols;
3. there are zero declared-but-unused symbols in the canonical bundle signature;
4. Draft 0.3 lexical binder rules still qualify, including claim `1017` sibling reuse;
5. all 59 claim bodies reconstruct without opaque proposition placeholders;
6. the raw structural probes remain correct;
7. the derivative-chain regression selects the `^304` chain among `1057..1059` rather than a semantically nearby relation cluster;
8. any post-freeze human-gloss review is reported separately from native/formal recovery.

---

## 10. Falsifiers

Revise this tightening if evidence shows that:

- exact bundle signatures materially harm useful theory reuse without compensating context/qualification benefit;
- a broader signature materially improves reasoning enough to justify its unused-symbol cost;
- native-only selectors are insufficient to test the formal property being claimed;
- the presentation profile increases rather than decreases decoder effort;
- human gloss is demonstrably required for a load-bearing formal operation rather than only for human naming/review;
- the freeze/unblind split prevents useful independent evidence rather than protecting it.

Until such evidence appears, canonical bundle state is exact, native/formal probes are native-selectable, human gloss remains post-freeze and non-authoritative, and presentation is optimized without changing semantics.
