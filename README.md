# CUDA-JS

[![Documentation and verification](https://github.com/iteathen/CUDA-JS/actions/workflows/docs.yml/badge.svg)](https://github.com/iteathen/CUDA-JS/actions/workflows/docs.yml)
[![Node compatibility](https://github.com/iteathen/CUDA-JS/actions/workflows/node-compatibility.yml/badge.svg)](https://github.com/iteathen/CUDA-JS/actions/workflows/node-compatibility.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue)](LICENSE)

CUDA-JS is an experimental Node.js runtime and toolchain for a bounded subset of CUDA Driver, NVRTC, nvJitLink, and selected CUDA-library operations.

## Current reality

| Area | Status |
| --- | --- |
| Package identity | `cuda-js@0.1.0-alpha.16` source/package candidate |
| npm release | **Not published** |
| Production support | **No** — public alpha/testing only |
| Host implementation | JavaScript/ESM using Node 26's experimental `node:ffi` behind Worker-owned components |
| Native evidence | Exact Windows x64 evidence exists for recorded profiles; support remains capability/profile-specific |
| Native Linux CUDA | **Not yet qualified**; Linux x86-64 is the reference path, but the physical-NVIDIA evidence cell remains open |
| Generic concurrency | Bounded operation profiles only; no public unbounded stream/event or scheduling API |

Implemented capabilities include capability-checked device discovery/selection, explicit device-memory ownership and copies, module/function lookup, typed kernel arguments, bounded opaque GPU-operation lifecycles, NVRTC/nvJitLink compilation, artifact/cache identity, restricted Device-JS, prepared execution, and selected bounded CUDA-library composition. The exact status of each capability is recorded in [`docs/CAPABILITIES.md`](docs/CAPABILITIES.md).

CUDA-JS does **not** currently claim production readiness, native Linux CUDA qualification, generic public stream/event objects, multi-GPU/MIG support, managed/pool-memory support, CUDA Graph realization, process crash isolation, or broad performance/soak guarantees.

The Node host-call substrate is experimental upstream API. A Node FFI change can require CUDA-JS adaptation or requalification; the project does not treat that dependency as stable merely because current profiles pass.

## Verify what exists

Requirements: Node.js 26.1.0 or later. Clone the repository, then run the portable/package verification:

```bash
npm install
npm run verify
```

On a Windows machine with the required CUDA/toolchain environment, the deeper Windows qualification path is:

```bash
npm run verify:windows
```

A passing portable run is not native-GPU qualification. Exact Node and hardware evidence is tracked separately in [`docs/NODE_SUPPORT.md`](docs/NODE_SUPPORT.md) and [`docs/HARDWARE_SUPPORT.md`](docs/HARDWARE_SUPPORT.md).

Native Linux CUDA qualification is tracked in [issue #4](https://github.com/iteathen/CUDA-JS/issues/4). Missing physical Linux/GPU evidence is an evidence gap, not proof of a code defect.

## Public API boundary

CUDA-JS owns generic CUDA runtime/toolchain mechanics:

- CUDA device discovery and target resolution;
- Driver/toolkit capability and version negotiation;
- explicit context/resource/memory/module/function lifecycles;
- bounded launch/completion/error/teardown semantics;
- NVRTC/nvJitLink and device-artifact caching;
- restricted Device-JS lowering and selected generic library-provider integration.

CUDA-JS does **not** own MCGS, chess, tensor policy, models, training, application schedulers, or other consumer semantics. Consumers use public contracts rather than raw pointers, private FFI objects, Driver handles, or sibling-repository internals.

## Runtime shape

```text
application
    |
    v
CUDA-JS facade
    |
    +--> DriverActor Worker ----> CUDA Driver / GPU
    |
    +--> CompilerActor Worker --> NVRTC / nvJitLink / artifacts
```

The Workers own blocking native work and raw native resources. JavaScript callers receive opaque capabilities and bounded results. Resource lifetime is explicit; garbage collection is not the primary teardown mechanism.

Detailed architecture and rationale live in the accepted ADR/specification set rather than in this README. Start with [`docs/CAPABILITIES.md`](docs/CAPABILITIES.md), [`STATUS.md`](STATUS.md), and [`next_step.yaml`](next_step.yaml).

## Current development rule

Work follows the highest-risk unproven boundary required by the next real consumer:

- missing physical qualification stays an evidence/infrastructure task unless implementation is independently falsified;
- downstream consumers request consumer-neutral public capabilities rather than local/native escape paths;
- additional concurrency, optimization, or API breadth requires a dependency-ready consumer or measured bottleneck;
- once a boundary is sufficiently specified, a thin executable public-contract falsifier is preferred over more speculative architecture.

## Contributing and security

Read [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing behavior. Current work and accepted evidence are tracked in [`STATUS.md`](STATUS.md) and [`next_step.yaml`](next_step.yaml).

Report vulnerabilities privately according to [`SECURITY.md`](SECURITY.md); do not place exploit details, secrets, or sensitive logs in public issues.

CUDA-JS is licensed under [AGPL-3.0-or-later](LICENSE). Separate commercial terms may be available; see [`LICENSING.md`](LICENSING.md).
