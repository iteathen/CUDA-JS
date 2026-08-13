# Node and Extended CUDA Qualification Program

**Status:** Proposal

**Date:** 2026-08-11

**Status-semantics clarification:** 2026-08-12

## Outcome and non-goals

This work publishes an exact Node version support list, directly checks positive and negative Node substrate expectations, records a verified negative Hyper-V profile, and makes every previously omitted hardware or operational axis independently testable and publicly coordinated.

It does not widen the accepted runtime. In particular, it does not itself add device selection, multiple in-flight launches, MIG control, ECC control, telemetry mutation, virtual-machine configuration, TCC switching, GPU reset, or production-performance claims. Those changes require separately accepted runtime or infrastructure contracts and exact hardware evidence where applicable.

**That scope sentence is not an architectural rejection of those capabilities.** This plan is a qualification program. Its support/evidence status cannot decide architectural disposition or implementation priority. Capability state must follow `agent_files/general_foundation/STATUS_SEMANTICS.md`.

Input authority at creation was protected `main` at `0ae02ed2b9d1f23593a12e1144c8867942eb6bca`, accepted ADR-0002 and SPEC-0005 through SPEC-0008, the validation policy, and the project owner's explicit request to address these omissions.

## Adversarial assessment

The strongest failure is an informational probe being mistaken for support **or support wording being mistaken for architecture**.

Qualification uses these evidence dispositions:

1. **Qualified experimental:** the exact Node/hardware/profile chain passed all required native evidence.
2. **Testing unconfirmed:** a lower-level probe passed and operation is allowed, but the full chain did not establish support.
3. **Not qualified:** the required support evidence is incomplete or absent.
4. **Known incompatible:** a required capability is absent or the vendor excludes the exact named profile.

These are qualification/support states only. They do not mean `planned`, `deferred`, `unselected`, or `rejected` architecturally.

The historical shorthand `no-support` used by the original extension registry and generated hardware page meant **no current support claim**. It is deprecated because it was later misread as architectural rejection. Existing historical uses must not be interpreted that way.

Matching module ABI, Node major/minor, GPU family, virtualization brand, Driver family, or successful import never promotes support. An incomplete extended axis exposes no promotable command chain, so neither a contributor nor automation can accidentally emit a qualified result.

The decisive falsifiers are a non-26.7 Node row inheriting support without full evidence, an FFI-capable candidate being blocked only for lacking evidence, an FFI-unavailable release passing its expected-negative probe, an extension axis exposing unsafe promotable commands before its evidence gates, a Hyper-V result containing VM/device identifiers or performing mutation, generated documentation disagreeing with its registry, or an agent using qualification state as an architectural decision.

## Ownership

| Boundary | Owner | Validation |
|---|---|---|
| Exact Node support truth | `conformance/node/registry.json` | `npm run node:check` |
| Node probe | `conformance/node/qualification.mjs` | exact-version CI matrix |
| Human Node list | `docs/NODE_SUPPORT.md` | generated-document agreement |
| Extended hardware qualification axes | `conformance/hardware/extensions.json` | hardware registry tests |
| Capability architectural/implementation/priority state | owning accepted decision/spec/`next_step.yaml` | authority and status-semantics review |
| Hyper-V negative/readiness probe | `conformance/hardware/hyperv-readiness.mjs` | pure classification tests plus read-only Windows run |
| Human hardware list | `docs/HARDWARE_SUPPORT.md` | generated-document agreement |
| Public coordination | linked issues | issue/PR read-back |

## Node test system

The matrix tests every published exact release row. It includes the current Node 22 and 24 LTS representatives, the final Node 25 release, Node 26.0.0 before FFI, every Node 26 release from 26.1.0 through 26.7.0, and both security patch releases in that interval.

For each exact binary the probe checks:

- process version and module ABI;
- whether `--experimental-ffi` is recognized and `node:ffi` imports;
- the required `DynamicLibrary`, `getRawPointer`, and `types` exports;
- denial under the permission model without FFI authority;
- progression to ordinary loader handling with explicit FFI authority.

The matrix separates support from operation. Node 26.1 through 26.6 pass the substrate probe and may operate as testing-unconfirmed without an opt-in; Node 26.7 alone carries qualified evidence. Promotion requires EXP-000 correctness/lifecycle on Windows x64 and native Linux x64, then the complete native CUDA-JS chain for each promoted CUDA profile.

## Extended hardware qualification axes

The sections below define **qualification work**, not architecture policy. Each axis's architectural disposition, implementation status, qualification status, and priority must be tracked independently.

### Multi-GPU

Qualification requires an accepted device-selection contract, at least two physical GPUs, separate context/resource ownership, cross-device rejection, independent oracles, and two-context cleanup. Public evidence omits UUID, serial, and bus identifiers.

### MIG

Qualification requires administrator-preconfigured instances and an accepted instance identity/isolation contract. Tests never change MIG configuration. Cross-instance capability rejection is a hard gate.

### Virtualization and Hyper-V

GPU-P, DDA, cloud passthrough, vendor vGPU, and WSL2 are separate profiles. The exact Windows 11 Pro/GTX 1660 Ti host tested on 2026-08-11 is a verified **incompatible current profile** for the tested Hyper-V route: the read-only inventory reports no partitionable GPU and no assigned partition, and Microsoft's support boundary excludes the client-host class. This negative result does not architecturally reject virtualization on other supported profiles. The probe never changes VM or device state.

### Concurrent launch

The accepted SPEC-0005 runtime remains one launch in flight on one private stream. A portable regression characterizes simultaneous public submissions as ordered serialized queue behavior with terminal cleanup.

Under current owner direction, bounded multiple-in-flight execution is **architecturally planned**, not rejected. Submission/completion lifecycle separation is tracked by #51; bounded private multi-stream execution is tracked by #40 after that foundation. Both remain unimplemented/unqualified on accepted `main` until their separate contracts and evidence pass. A native overlap mechanism oracle remains required for any overlap claim; timing alone is insufficient.

### Performance, thermal observation, and soak

Short presubmit regression observations and long controlled soak runs are separate. Both require fixed fixtures, cold/warm phases, raw-sample digests, read-only telemetry, correctness checks, cooldown, and terminal resource census. Tests never change clocks, power, fans, or persistence. Passing a ceiling is not a performance claim.

### ECC

ECC profiles record read-only capability and mode, then define conservative health transitions for corrected, uncorrected, retirement, and unknown states. Tests never toggle ECC, reset devices, or inject destructive faults. Lack of current qualification does not by itself select or reject a future ECC runtime/reporting capability.

### Driver/toolkit/provider matrix

Each cell is keyed by exact Node, module ABI, OS/ABI, Driver package/API, toolkit/header, NVRTC, nvJitLink, GPU, artifact/options, permissions, and source tree. Cells are explicitly passed, failed, skipped, not-qualified, or known-incompatible; ranges are never inferred.

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

Cheap checks run first: registry invariants, generated documentation, negative classification, and Node probe. Portable and native Windows regressions follow. Hardware-specific qualification cannot run until its environment and contract are present.

All task-created build evidence remains ignored. Node archives, probe logs, Hyper-V records, test packages, and raw telemetry are retained only through review or their declared evidence period. No VM, device mode, partition, ECC state, power state, or host configuration is changed. Remote branches, PRs, issues, checks, and protection settings receive exact post-operation read-back.
