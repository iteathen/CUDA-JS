# Contributing

CUDA-JS is public, pre-release, contract-first, and experiment-gated.

Before changing a material boundary, read:

- `AGENTS.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`;
- the owning accepted ADR and specification;
- the relevant assessment, target architecture, support matrix, master-plan work package, experiment, and source-register entries;
- exact Git and environment state.

## Current authorization

`CJS-F1A / EXP-000` remains a required regression capsule. `CJS-F1B` is accepted with pinned CUDA header import, generated ABI facts, reviewed Tier-0 semantics, normalized Runtime IR products, and independent native C ABI probes. Windows-only `CJS-F2W / EXP-012` is accepted and may feed Windows F3 contract work. Linux `CJS-F2L / EXP-001` includes working GPU-free preparation and a real-Driver smoke runner, but remains incomplete and contribution-ready; follow [`experiments/exp-001/README.md`](experiments/exp-001/README.md), coordinate through [issue #4](https://github.com/iteathen/CUDA-JS/issues/4), and do not claim Linux Driver support without its qualified native evidence.

Real Driver execution remains exact-profile-gated. Production runtime components, packages, and later work packages remain blocked until their platform-specific schema, native CUDA, lifecycle, and contract predecessors pass.

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
npm run exp:000:build
npm run verify
npm run exp:012  # qualified Windows x64 Driver/GPU host only
npm run exp:001:prepare  # native Ubuntu 24.04 x86-64; GPU-free preparation plus readiness
```

Claims must state unavailable CUDA/Node/platform checks precisely.

## Publication

The repository is published at `iteathen/CUDA-JS`. Claim a specific change as published only after reading back its exact remote branch/tree. A local commit, workflow intention, or unverified push is not publication evidence.
