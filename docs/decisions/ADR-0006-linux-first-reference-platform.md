# ADR-0006: OS-Neutral Architecture with a Linux Reference Platform

**Status:** Accepted

**Date:** 2026-08-25

## Context

CUDA-JS established its first complete native package evidence on Windows x64 because that was the available CUDA host. That evidence remains useful, but availability accidentally became platform priority. The intended workloads are headless, long-running and often multi-GPU. Continuing to let the first Windows profile drive sequencing would make WDDM/watchdog behavior, one consumer GPU and local desktop tooling the center of a server-oriented runtime.

Most CUDA-JS owners are already OS-neutral JavaScript: actor protocols, resources, memory, execution, compiler contracts, Device-JS, errors, packaging and conformance semantics do not require an operating-system-shaped architecture. Native library discovery, loader behavior, permissions and exact evidence necessarily remain platform-specific. The initial native adapters and promotion evidence were Windows-only; availability must not turn those details into generic contracts.

## Decision

CUDA-JS adopts an **OS-neutral public and component architecture**, with **native Linux x86-64 as its reference implementation and primary qualification platform**.

“Reference implementation” determines implementation order, canonical operational guidance and the first qualification cell. It does not authorize Linux paths, distribution identity, loader behavior or deployment policy in public contracts or shared runtime owners. Platform dependencies remain thin injected adapters. Windows remains a peer adapter even though Linux is qualified first for the forward server-oriented path.

The first exact reference cell is:

```text
host:              native Linux, x86-64, glibc
distribution:      Ubuntu 24.04 LTS
Node baseline:     official Node v26.7.0
CUDA baseline:     pinned project CUDA 13.3 inputs/providers
qualification:     exact Driver/GPU/toolkit/provider/profile evidence only
```

The public architecture remains OS- and distribution-neutral. Ubuntu 24.04 is the first exact evidence cell, not an operating-system or distribution assumption embedded in generic runtime components.

Windows x64 remains a maintained peer adapter and exact-profile qualification lane. Its accepted F2W–F9 evidence is not invalidated, deleted or relabeled as Linux evidence. WSL remains a separate profile and cannot substitute for native Linux qualification.

## Execution order

1. Preserve OS-neutral contracts/shared behavior and the accepted Windows evidence.
2. Complete issue #4's canonical Linux DriverActor path through installed-package qualification.
3. Add the canonical Linux NVRTC/nvJitLink provider path as part of that dependency chain.
4. Expand to additional Linux x86-64 distributions under issue #17 only after the Ubuntu reference cell passes.
5. Integrate SPEC-0017 device selection through platform-neutral ports; Linux is its first native promotion target.
6. Qualify explicit selection and the first independent-replica multi-GPU profile on a controlled native Linux host with at least two independently visible physical GPUs.
7. Treat Windows, WSL, ARM64/SBSA, Jetson and other environments as separately qualified profiles rather than inferred support.

Performance issue #28 remains open after any Windows seed observation. Its first reference-platform profile must run on the accepted Linux cell; topology-aware performance requires SPEC-0017 plus a controlled 2+ GPU Linux host.

## Component consequences

- `runtime.facade` selects an injected platform adapter without changing public lifecycle semantics or exposing operating-system identity as consumer policy.
- `runtime.driver-actor` gains a canonical `libcuda.so.1` Linux adapter behind the existing Worker/context/resource contract.
- `runtime.compiler-actor` gains canonical Linux NVRTC/nvJitLink discovery behind the existing provider contract.
- Shared owners do not branch on distribution identity and branch on operating system only at the private adapter-selection seam.
- Linux-specific library discovery, permissions and loader behavior remain adapter-owned.
- Exact device, provider and platform identity remains evidence/compatibility data; no raw native identity crosses the public boundary.

## Multi-GPU consequences

The first native multi-GPU qualification host is Linux. One selected runtime/context/resource epoch owns one physical GPU. CUDA-JS supplies opaque selection and generic per-device mechanisms; consumers own partitioning and result meaning. Independent device-resident replicas with final terminal aggregation remain the first CUDA-MCGS profile. Peer access, collectives, MPS, MIG and shared mutable cross-device state are optional, separately selected and measured mechanisms.

## Alternatives considered

### Continue Windows-first and add Linux later

Rejected as the sequencing policy. It would keep the least representative available host at the center of server and multi-GPU decisions.

### Remove Windows support

Rejected. Existing exact Windows evidence is valid and the adapter remains useful. Reference priority and support retention are different decisions.

### Treat the transition as documentation-only

Rejected as a completion claim. Documentation selects direction, but Linux support requires real Driver/compiler adapters plus exact native/package evidence.

### Use WSL as the Linux reference

Rejected. WSL has a distinct Driver bridge, provider, permission and lifecycle profile and cannot prove native Linux behavior.

## Validation and promotion

The transition itself requires documentation, registry, plan and issue agreement. Native promotion requires the unmodified Ubuntu 24.04 readiness gate, independent C oracles, real Driver/compiler/GPU execution, installed-package consumers, permission controls, sanitized exact identity and terminal resource cleanup. A one-GPU host cannot qualify selecting between distinct devices or multi-GPU behavior.
