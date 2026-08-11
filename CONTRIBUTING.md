# Contributing

CUDA-JS is public, pre-release, contract-first, and experiment-gated.

## Easy ways to help

The lowest-friction contributions are:

- reproducible bug reports with exact Node, operating-system, CUDA, Driver, and GPU identity;
- native Linux qualification evidence following the retained runbooks;
- documentation corrections and missing negative cases;
- focused tests that expose one contract violation without widening the public API;
- design proposals that keep CUDA-JS independent of any one consumer, including CUDA-MCGS.

Use the repository issue forms before investing in a large change. Maintainers may narrow, defer, or reject work that lacks an accepted owner, contract, test oracle, cleanup plan, or supported environment. There is no response-time or merge guarantee.

Before changing a material boundary, read:

- `AGENTS.md`, `agent_files/AGENTS.md`, `STATUS.md`, and `next_step.yaml`;
- the owning accepted ADR and specification;
- the relevant assessment, target architecture, support matrix, master-plan work package, experiment, and source-register entries;
- exact Git and environment state.

## Current authorization

`CJS-F1A / EXP-000` remains a required regression capsule. `CJS-F1B` is accepted with pinned CUDA facts and independent native probes. Windows-only `CJS-F2W / EXP-012` through `CJS-F8W` and the bounded Windows F9 prerequisite are accepted on their declared Driver, memory, execution, compiler, linker, cache, platform, permission, package, consumer, atomic-publication, failure/stress, and cleanup evidence. Portable controls pass without native Linux CUDA providers, but native Linux `CJS-F2L / EXP-001` through F9L remain incomplete and contribution-ready; follow the retained conformance runbooks, coordinate through [issue #4](https://github.com/iteathen/CUDA-JS/issues/4), and do not claim Linux support without qualified native evidence.

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

## Pull-request workflow

1. Open or reference an issue that identifies the owning boundary and exact problem.
2. Branch from current `main` and keep one coherent ownership-sized change.
3. Update the governing specification or plan when public meaning changes.
4. Add stable positive, negative, lifecycle, and cleanup evidence proportional to the claim.
5. Run the required portable checks and every native capsule available on the exact claimed profile.
6. Use the pull-request template, list checks not run, and disclose any Linux/native gap explicitly.

Do not include generated build output, credentials, machine-specific paths, CUDA Toolkit files, NVIDIA binaries, or third-party code without exact provenance and compatible licensing.

## Contribution license grant

CUDA-JS uses an AGPL open-source license plus a separately negotiated commercial-license path. To preserve both options, by submitting a contribution you represent that you have the right to submit it and agree that:

1. the contribution may be distributed under `AGPL-3.0-or-later`;
2. you grant the CUDA-JS project owner a perpetual, worldwide, non-exclusive, royalty-free, irrevocable copyright license to use, reproduce, modify, prepare derivative works of, publicly display, publicly perform, sublicense, relicense, and distribute the contribution;
3. you grant the CUDA-JS project owner and downstream recipients a perpetual, worldwide, royalty-free patent license for patent claims you can license that are necessarily infringed by your contribution alone or in combination with CUDA-JS; and
4. you retain ownership of your contribution and receive no payment or commercial-license revenue right unless a separate written agreement says otherwise.

Mark the contribution-license checkbox in the pull-request template. The maintainer may request a separate signed contributor agreement before accepting a material contribution. If you cannot agree to these terms, do not submit code; an issue describing the problem or idea is welcome.

## Publication

The repository is published at `iteathen/CUDA-JS`. Claim a specific change as published only after reading back its exact remote branch/tree. A local commit, workflow intention, or unverified push is not publication evidence.
