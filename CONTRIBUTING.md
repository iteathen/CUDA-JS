# Contributing

CUDA-JS is public, pre-release, contract-first, and experiment-gated.

Before changing a material boundary, read:

- `AGENTS.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`;
- the owning accepted ADR and specification;
- the relevant assessment, target architecture, support matrix, master-plan work package, experiment, and source-register entries;
- exact Git and environment state.

## Current authorization

`CJS-F1A / EXP-000` remains a required regression capsule. `CJS-F1B` is accepted with pinned CUDA facts and independent native probes. Windows-only `CJS-F2W / EXP-012` through `CJS-F8W` are accepted on their bounded Driver, memory, execution, compiler, linker, cache, platform, permission, package, consumer, failure/stress, and cleanup evidence. Portable F3 through F8 controls pass without native Linux CUDA providers, but Linux `CJS-F2L / EXP-001` through F8L remain incomplete and contribution-ready; follow the retained conformance runbooks, coordinate through [issue #4](https://github.com/iteathen/CUDA-JS/issues/4), and do not claim Linux support without qualified native evidence.

Real Driver execution remains exact-profile-gated. Production runtime components, packages, and later work packages remain blocked until their platform-specific schema, native CUDA, lifecycle, and contract predecessors pass.

The public [Node support list](docs/NODE_SUPPORT.md) records exact evidence, not inferred support ranges. Only Node 26.7.0 is currently qualified for the accepted Windows profile; FFI-capable releases at or above Node 26.1.0 may operate as unconfirmed testing candidates, while verified releases without that substrate are known incompatible. The [hardware support list](docs/HARDWARE_SUPPORT.md) permits unconfirmed Windows hardware to run bounded qualification work without promoting support. Multi-GPU, MIG, virtualization, concurrent launch, performance/thermal/soak, ECC, version matrices, Windows TCC/server, and independent attestation remain unavailable until their public work issues complete.

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
npm run node:check
npm run hardware:check
npm run exp:000:build
npm run verify
npm run f7:portable
npm run f7  # qualified Windows x64 Driver/GPU/provider host only
npm run exp:012  # qualified Windows x64 Driver/GPU host only
npm run exp:001:prepare  # native Ubuntu 24.04 x86-64; GPU-free preparation plus readiness
```

On Windows, `npm run hardware:probe:hyperv` performs a read-only Hyper-V readiness inventory. It does not create or modify VMs, partition or assign a GPU, dismount a device, or change driver state. A negative readiness result documents no-support for that exact host; it does not characterize other hosts.

Node qualification submissions use the [Node qualification issue template](.github/ISSUE_TEMPLATE/node-qualification.yml). Hardware submissions use the [hardware qualification issue template](.github/ISSUE_TEMPLATE/hardware-qualification.yml). Support promotion requires an exact tested commit, sanitized evidence, the relevant public work issue, and maintainer review; passing only a portable probe never promotes native support.

Claims must state unavailable CUDA/Node/platform checks precisely.

## Publication

The repository is published at `iteathen/CUDA-JS`. Claim a specific change as published only after reading back its exact remote branch/tree. A local commit, workflow intention, or unverified push is not publication evidence.
