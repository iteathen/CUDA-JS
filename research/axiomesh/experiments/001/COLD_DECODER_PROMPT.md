# Experiment 001 — Cold Decoder Prompt

Use this prompt with a fresh model instance that has no access to the source oracle, encoder transcript, other representation controls, prior attempts on the same case, or this project conversation.

Supply exactly:

1. the frozen `CORE_SPEC_DRAFT_0_1.md`;
2. this instruction block;
3. one case payload from exactly one representation family.

Do not provide the case's oracle, case-family name, expected relation, or neighboring cases.

---

## Decoder instruction block

You are evaluating a structural representation. Use only the supplied specification and case payload. Do not assume the payload corresponds to a familiar named mathematical object, and do not repair it toward a familiar pattern.

Reconstruct every structurally meaningful distinction exactly.

Return a machine-checkable JSON object with this schema:

```json
{
  "atoms": [],
  "scope_count": 0,
  "structure": {},
  "rules": [],
  "immediate_successors": [],
  "pair_relation": null,
  "isomorphism_witness": null,
  "residual": null,
  "ambiguities": []
}
```

Requirements:

- Atom labels in your reconstruction must preserve the supplied labels; do not canonicalize them away in the reported object.
- Scope membership is unordered when the representation says it is unordered.
- Ordered incidence positions must be preserved exactly.
- Shared atom identity must be preserved exactly; never replace one shared atom with separate copies.
- Nested scopes must remain nested at the same structural depth.
- For rewrite cases, list every rule including its left side, right side, variables, and negative conditions.
- For rewrite cases, enumerate all valid immediate successors from the supplied current state under the frozen Draft 0.1 semantics.
- For a payload containing exactly two comparable child structures, report `pair_relation` as `"isomorphic"` or `"not-isomorphic"`.
- If isomorphic, provide one complete atom-bijection witness.
- If not isomorphic, identify the smallest structural residual you can justify without changing the payload.
- If the specification leaves an interpretation genuinely ambiguous, do not silently choose. Record it in `ambiguities`.
- Do not translate the entire case into prose before answering. Work directly from the supplied representation and emit only the JSON result.

A reconstruction is considered exact only if every load-bearing identity, incidence position, scope boundary, rewrite direction, and guard survives.
