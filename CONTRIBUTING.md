# Contributing

CUDA-JS is private, pre-release, contract-first, and experiment-gated.

Before changing a material boundary, read:

- `AGENTS.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`;
- the owning accepted ADR and specification;
- the relevant assessment, target architecture, support matrix, master-plan work package, experiment, and source-register entries;
- exact Git and environment state.

## Current authorization

The current phase is documentation only. Contributors may improve foundational authority, architecture, specifications, research provenance, plans, experiment protocols, organization, indexes, and validation of those documents.

No code-bearing experiment, native fixture, generated binding, schema importer, runtime component, benchmark implementation, production package, or implementation workflow is authorized until the project owner explicitly advances the phase. Future experiment documents describe gates; they are not permission to execute them.

## Binding rules

- Do not add a CUDA-JS project-specific compiled addon to the baseline.
- Do not handwrite per-CUDA-function production wrappers.
- Generate ABI facts and Node FFI definitions from pinned official headers.
- Maintain lifecycle/security/blocking/error meaning in a separately reviewed semantic overlay.
- Bind only allowlisted named exports through the private Node FFI adapter.
- Use `cuGetProcAddress` for version/status/semantics verification; do not assume arbitrary pfn invocation.
- Keep all Node FFI libraries, functions, raw pointers, and foreign views private.
- Do not claim a call used Fast FFI without exact-profile mechanism evidence.
- Do not let fallback happen under a `fast-jit-required` claim.
- Use one DriverActor Worker per private context in v0.
- Keep blocking compiler/linker work in a separate CompilerActor.
- No CUDA-managed-thread callback may invoke JavaScript.

## Schema and resource rules

- Generated facts and semantic overlays have distinct owners and diffs.
- Unknown/contradictory semantics fail closed.
- Public resources contain runtime/kind/slot/generation/state identity, never native addresses.
- Explicit disposal is authoritative; finalizers are diagnostics/last-resort requests.
- Children close before parents; in-flight leases fence release.
- Memory kinds state placement, visibility, mapping, coherence, synchronization, migration, bounds, and lifetime.
- Cache/evidence identity includes every material Node, ABI, schema, Driver/toolkit, GPU, compiler/linker, artifact, option, and profile input.

## Experiments and tests

Each experiment states question, exact profile, independent oracle, cheapest falsifier, promotion/rejection criteria, raw evidence location, and cleanup.

Use focused capsules and mutation/negative controls. Do not repeat unchanged tests for reassurance. Performance may guide architecture only after semantic and lifecycle parity.

## Required current validation

```bash
./scripts/verify-docs.sh
```

Code-bearing work adds its experiment-specific commands. Claims must state unavailable CUDA/Node/platform checks precisely.

## Publication

The repository is private at `iteathen/CUDA-JS`. Claim publication only after reading back the exact remote branch/tree. A local commit, bundle, workflow intention, or unverified push is not publication evidence.
