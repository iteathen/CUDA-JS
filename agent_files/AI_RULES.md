# CUDA-JS AI Rules

**Scope:** Hard rules for automated agents. Linked doctrine provides the method.

## Non-negotiable LEGO isolation, naming, and transient topology

These are architecture gates, not style preferences, and apply before implementation or acceptance.

- **Complete module isolation:** every LEGO module is self-contained. Internal logic, types, state, and names describe only that module's owned domain and local contract. Never reference an external module/repository/product/provider name, foreign object type, or neighbor-specific context merely because it is connected today. External identity belongs in composition or in the adapter that intrinsically owns that integration.
- **Agnostic interface naming:** inputs, outputs, ports, events, properties, commands, queries, DTOs, callbacks, and public types describe local data, intent, or action, never the identity of the current upstream source or downstream target. A domain identity is valid inside the component that owns that domain; it is a leak when copied into another generic brick.
- **Transient topology:** treat every external connection as temporary. Replacing, removing, isolating, or rewiring a neighbor must not require internal logic or vocabulary changes. Composition owns relationships and lifecycle wiring; components do not discover neighbors or branch on product/repository/provider identity.
- **Rewiring test:** mentally replace the current neighbor with another conforming implementation or remove it. If internal names become false, foreign types surface, or topology-specific branches are required, redesign the boundary.
- **No abstraction theater:** do not create a port, interface, event bus, registry, or generic wrapper merely to appear modular. A boundary exists only for real ownership, substitution, lifecycle, failure, or testing value. Direct private calls inside one brick are preferred when there is no genuine boundary.
- **Single authority remains explicit:** neutral naming must not create `common`, `shared`, `generic`, `manager`, callback, or registry dumping grounds with competing semantic ownership.

Any violation above is an architecture defect and a stop condition, not a naming nit to defer.

1. Read root `AGENTS.md` before changing the repository.
2. Follow the authority order and report material contradictions rather than choosing silently.
3. `CJS-F1A / EXP-000`, `CJS-F1B`, Windows-only `CJS-F2W / EXP-012`, Windows CJS-F3W through CJS-F8W, and the CUDA-JS-owned CJS-F9 trusted-header/atomic-publication prerequisite are durable exact-evidence anchors; ADR-0006 makes native Linux x86-64 the reference and primary qualification path, but portable/package controls are not Linux Driver support and Linux qualification remains incomplete until exact physical evidence passes. Windows remains a secondary maintained profile, and no exact CUDA-MCGS pair exists before independent compatible-pair evidence passes.
4. A plan, experiment protocol, reserved directory, or dependency-ready boundary is not implementation permission.
5. Work by semantic ownership boundary, not arbitrary file count.
6. For substantial or critical work, complete a proportional adversarial assessment before planning.
7. Compare at least the strongest credible candidate paths; do not defend the first plausible idea after evidence exposes a better one.
8. Rank values contextually after purpose, bounds, and failure tolerance are known. Correctness and safety gates cannot be traded away for speed.
9. Apply LEGO at public/component boundaries, SOLID internally, CUPID for composability and developer clarity, and KISS only after sound fundamentals are preserved.
10. Do not encode accidental first-consumer limits in foundational schemas, ranges, identifiers, layouts, or capability models.
11. Keep the published `cuda-js` core generic. ADR-0007 assigns reusable NN/model/inference/autodiff/training semantics to the independent `iteathen/cuda-nn` repository, while generic Tensor mathematics/planning belongs to `iteathen/CUDA-JS-Tensor`. Historical ADR-0004/SPEC-0027 are provenance only and do not authorize a CUDA-JS `nn.*` production unit.
12. Do not expose raw pointers, arbitrary executable schemas, unchecked native capabilities, or private provider details through ordinary public contracts.
13. Generated ABI facts and curated semantic/lifecycle overlays must have separate owners and independently reviewable diffs.
14. Unknown or contradictory public semantics fail closed.
15. State ownership, identity, bounds, lifetime, failure, cancellation, cleanup, compatibility, and evidence before implementation.
16. Treat Node FFI, Fast FFI, CUDA ABI, context affinity, memory visibility, asynchronous completion, deferred errors, compiler side effects, and teardown as critical boundaries.
17. No native/platform/performance claim exceeds exact-profile evidence.
18. Mocks prove only the behavior they actually exercise; they do not prove native ABI, CUDA ordering, device closure, or performance.
19. Before a material operation, state expected effects, cheapest decisive falsifier, rollback/safe stop, cleanup, and revision triggers.
20. Inspect actual effects immediately after each material operation before continuing.
21. Do not retry unchanged failed commands, builds, workflows, or tests without a changed hypothesis, input, environment, or transport.
22. Do not weaken tests, thresholds, assertions, safety checks, or cleanup safeguards to obtain a pass.
23. Bank material test intents and consolidate related cases into ownership-aligned capsules with stable case identities.
24. Diagnose from the first divergence; repair the authoritative owner, not the nearest symptom.
25. A clean diff, green check, or successful command is evidence, not proof of semantic correctness or cleanup.
26. Cleanup means explicit disposition, not automatic deletion.
27. Never destroy user work, accepted authority, evidence, provenance, recovery state, shared resources, or protected branches without exact authorization.
28. Archive historically useful stale material with date, reason, successor, and removal context.
29. Review PRs against the exact head, complete diff, current base, authority, evidence, discussion, and cleanup state.
30. Merge only the exact accepted head; verify resulting target SHA/tree and branch/resource disposition afterward.
31. Organize the repository as though it is already large. No production source belongs in the root or an unowned catch-all directory.
32. Components require a public/internal boundary, manifest/README, dependency direction, lifecycle owner, validation owner, and registry entry.
33. Use focus branches for work that exceeds one focused session or spans independent semantic owners; keep one parent integration spine.
34. Apply token use as backpressure, not as an excuse to omit authority, reasoning, evidence, cleanup, review, or handoff.
35. Preserve enough context for validation, integration, cleanup, and one bounded recovery cycle.
36. Search and route before broad reading; load only applicable authority, but complete semantic closure around triggered boundaries.
37. Do not repeatedly reread unchanged authority; record exact revisions and consume accepted outputs as contracts.
38. Record genuine blockers and the next coherent action in `next_step.yaml`.
39. Do not claim publication until exact remote state is read back.
40. Do not claim completion while stale authority, contradictory plan state, invalidated evidence, unsafe residue, or unresolved ownership remains.
41. Treat architectural disposition, implementation status, qualification/support status, and priority as independent dimensions. Never infer one from another; follow `general_foundation/STATUS_SEMANTICS.md`.
42. `unsupported`, `not-qualified`, and legacy `no-support` are qualification/public-support statements unless accepted authority explicitly records an architectural rejection. `does not authorize`, `out of scope`, and slice exclusions remain local to their named contract/work package.
43. When legacy or generated wording collapses status dimensions, report and correct the authoritative source before using that wording to plan, close/reopen issues, or alter implementation scope.
44. Preserve ADR-0005's **JavaScript-authored and JIT/native-realized** split. Do not use unqualified “pure JavaScript” as normative wording, treat C/C++ probes/oracles as shipped runtime, expose private generated CUDA source, or introduce a maintained native host backend without an accepted measured-gap architecture/package/lifecycle decision.
45. Durable agent files are not live SHA/package/capability dashboards. Read exact protected commit/tree identity from the remote repository, route package identity to `package.json`, public compatibility to `packaging/compatibility-manifest.json`, and the execution seam to `STATUS.md` + `next_step.yaml`. Treat dated exact SHAs and candidate snapshots as provenance unless the designated current-state owners explicitly promote them.
