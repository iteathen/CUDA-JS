# Node and Extended CUDA Qualification Program

**Status:** Proposal

**Date:** 2026-08-11

## Outcome and non-goals

This work publishes an exact Node version support list, directly checks positive and negative Node substrate expectations, records a verified negative Hyper-V profile, and makes every previously omitted hardware or operational axis independently testable and publicly coordinated.

It does not widen the accepted runtime. In particular, it does not add device selection, multiple in-flight launches, MIG control, ECC control, telemetry mutation, virtual-machine configuration, TCC switching, GPU reset, or production-performance claims. Those changes require separately accepted runtime or infrastructure contracts and exact hardware evidence.

Input authority is protected `main` at `0ae02ed2b9d1f23593a12e1144c8867942eb6bca`, accepted ADR-0002 and SPEC-0005 through SPEC-0008, the validation policy, and the project owner's explicit request to address these omissions.

## Adversarial assessment

The strongest failure is an informational probe being mistaken for support. The design therefore has three distinct dispositions:

1. **Qualified experimental:** the exact Node/hardware/profile chain passed all required native evidence.
2. **No support with candidate evidence:** a lower-level probe passed, but the full chain did not.
3. **Verified no support:** a required capability is absent or the vendor excludes the exact host profile.

Matching module ABI, Node major/minor, GPU family, virtualization brand, Driver family, or successful import never promotes support. An incomplete extended axis exposes no command chain, so neither a contributor nor automation can accidentally emit a promotable result.

The decisive falsifiers are a non-26.7 Node row becoming supported without full evidence, an FFI-unavailable release passing its expected-negative probe, an extension axis exposing commands while no-support, a Hyper-V result containing VM/device identifiers or performing mutation, or generated documentation disagreeing with either registry.

## Ownership

| Boundary | Owner | Validation |
|---|---|---|
| Exact Node support truth | `conformance/node/registry.json` | `npm run node:check` |
| Node probe | `conformance/node/qualification.mjs` | exact-version CI matrix |
| Human Node list | `docs/NODE_SUPPORT.md` | generated-document agreement |
| Extended hardware axes | `conformance/hardware/extensions.json` | hardware registry tests |
| Hyper-V negative/readiness probe | `conformance/hardware/hyperv-readiness.mjs` | pure classification tests plus read-only Windows run |
| Human hardware list | `docs/HARDWARE_SUPPORT.md` | generated-document agreement |
| Public coordination | issues #20–#29 | issue/PR read-back |

## Node test system

The matrix tests every published exact release row. It includes the current Node 22 and 24 LTS representatives, the final Node 25 release, Node 26.0.0 before FFI, every Node 26 release from 26.1.0 through 26.7.0, and both security patch releases in that interval.

For each exact binary the probe checks:

- process version and module ABI;
- whether `--experimental-ffi` is recognized and `node:ffi` imports;
- the required `DynamicLibrary`, `getRawPointer`, and `types` exports;
- denial under the permission model without FFI authority;
- progression to ordinary loader handling with explicit FFI authority.

The matrix is intentionally stricter about support than capability. Node 26.1 through 26.6 may pass the substrate probe but remain no-support. Promotion requires EXP-000 correctness/lifecycle on Windows x64 and native Linux x64, then the complete native CUDA-JS chain for each promoted CUDA profile.

## Extended hardware qualification axes

### Multi-GPU

Requires an accepted device-selection contract, at least two physical GPUs, separate context/resource ownership, cross-device rejection, independent oracles, and two-context cleanup. Public evidence omits UUID, serial, and bus identifiers.

### MIG

Requires administrator-preconfigured instances and an accepted instance identity/isolation contract. Tests never change MIG configuration. Cross-instance capability rejection is a hard gate.

### Virtualization and Hyper-V

GPU-P, DDA, cloud passthrough, vendor vGPU, and WSL2 are separate profiles. The current Windows 11 Pro/GTX 1660 Ti host is verified no-support: the read-only inventory reports no partitionable GPU and no assigned partition, and Microsoft's support boundary excludes the client-host class. The probe never changes VM or device state.

### Concurrent launch

The accepted runtime remains one launch in flight on one private stream. A portable regression characterizes simultaneous public submissions as ordered serialized queue behavior with terminal cleanup. True multiple-in-flight work requires a new operation/stream/event/error/cancellation/teardown contract and a native overlap mechanism oracle; timing alone is insufficient.

### Performance, thermal observation, and soak

Short presubmit regression observations and long controlled soak runs are separate. Both require fixed fixtures, cold/warm phases, raw-sample digests, read-only telemetry, correctness checks, cooldown, and terminal resource census. Tests never change clocks, power, fans, or persistence. Passing a ceiling is not a performance claim.

### ECC

ECC profiles record read-only capability and mode, then define conservative health transitions for corrected, uncorrected, retirement, and unknown states. Tests never toggle ECC, reset devices, or inject destructive faults.

### Driver/toolkit/provider matrix

Each cell is keyed by exact Node, module ABI, OS/ABI, Driver package/API, toolkit/header, NVRTC, nvJitLink, GPU, artifact/options, permissions, and source tree. Cells are explicitly passed, failed, skipped, or no-support; ranges are never inferred.

### Windows Server/TCC

TCC is distinct from WDDM. A qualified profile requires an administrator-preconfigured supported host, CUDA-reported TCC facts, full native/package evidence, headless/session cases, and terminal cleanup. Tests never switch Driver or compute mode.

### Independent attestation

Maintainer-controlled runners accept only approved exact commit SHAs, use ephemeral workspaces or disposable images, minimize credentials, attest inputs/commands/digests, and retain private raw logs separately from sanitized summaries. Persistent GPU runners never execute untrusted fork code automatically.

## Supporting systems and rollout

1. Run portable registries and Node probes in hosted CI.
2. Run read-only host readiness on owner-controlled machines.
3. Use contributor evidence only as candidate evidence.
4. Rerun first-in-class profiles on a maintainer-controlled resettable host.
5. Add signed attestations after runner image, key, revocation, and incident procedures are accepted.
6. Schedule expensive data-center, MIG, ECC, TCC, virtualization, and soak work only on suitable sponsored or controlled systems.

## Validation and cleanup

Cheap checks run first: registry invariants, generated documentation, negative classification, and Node probe. Portable and native Windows regressions follow. Hardware-specific axes cannot run until their environment and contract are present.

All task-created build evidence remains ignored. Node archives, probe logs, Hyper-V records, test packages, and raw telemetry are retained only through review or their declared evidence period. No VM, device mode, partition, ECC state, power state, or host configuration is changed. Remote branches, PRs, issues, checks, and protection settings receive exact post-operation read-back.
