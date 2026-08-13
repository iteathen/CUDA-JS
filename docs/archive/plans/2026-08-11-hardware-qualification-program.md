# CUDA-JS Hardware Qualification Program

**Status:** Proposal

**Date:** 2026-08-11

## Outcome and bounds

Create a durable program that turns direct CUDA hardware runs into consistent, reviewable support entries. The program owns qualification orchestration, evidence identity, public sanitization, registry promotion, requalification triggers, and test-host planning. Existing phase capsules continue to own CUDA correctness and cleanup.

Non-goals are benchmarking, production reliability certification, automatic support by compute-capability inference, exhaustive NVIDIA product enumeration, multi-GPU scheduling, MIG behavior, arbitrary virtual-GPU support, or running untrusted pull-request code on privileged GPU hosts.

Input authority is the accepted F2W through F8W contracts and evidence at `09e9ada6c1d032286e75b9972cd35b763b16dae1`, the retained Linux handoffs, and NVIDIA's current CUDA 13.3 documentation. A change to a runtime contract, evidence key, profile boundary, or upstream architecture set requires plan review rather than silent expansion.

## Adversarial assessment

The strongest failure mode is a broad “supported GPUs” table derived from vendor compatibility rather than CUDA-JS execution. Such a table would hide Driver mode, host ABI, exact Node FFI build, optional compiler providers, permissions, package installation, and teardown. It would also let one successful model stand in for a family.

Three approaches were considered:

1. A manually edited model list plus issue comments is easy to start but drifts, cannot enforce evidence requirements, and produces inconsistent submissions.
2. A permanent self-hosted GPU CI matrix gives strong repeatability but is expensive, creates a serious untrusted-code/security boundary, and cannot immediately cover consumer, data-center, embedded, and ARM64 devices.
3. A validated registry plus a contributor qualification kit, followed by curated dedicated runners, keeps current claims exact and provides an incremental route to repeatability.

The third approach is selected. The decisive falsifier is registry validation accepting a profile without direct hardware/oracle/cleanup evidence, or two engineers obtaining materially different result structure from the same commit/profile. Either requires a coherent schema or runner repair before promotion.

## System ownership

| Owner | Responsibility | Durable location |
|---|---|---|
| Hardware registry | Exact qualified profiles and architecture coverage | `conformance/hardware/registry.json` |
| Profile catalog | Required capsules, executable commands, missing native work | `conformance/hardware/profiles.json` |
| Qualification runner | Clean-commit gate, command execution, evidence hashing, sanitized summary | `conformance/hardware/qualification.mjs` |
| Human support list | Generated presentation of registry truth | `docs/HARDWARE_SUPPORT.md` |
| Phase capsules | Native C oracle, Node parity, permissions, lifecycle, packaging | EXP-012 and conformance F3–F8 |
| Public coordination | Hardware/platform contribution and test-host issues | GitHub issues and issue template |

Raw machine evidence remains ignored build output and issue/PR attachment material. It is not committed as a second support authority.

## Qualification record

Every promotable result identifies:

- source commit and tree, with a clean-worktree assertion;
- exact Node version, host OS/release, architecture/ABI, and profile classification;
- device-zero model and compute capability plus visible-device count;
- Driver, Driver API, toolkit/header, NVRTC, nvJitLink, and Driver-model identities where applicable;
- stable command case IDs, order, status, elapsed time, and log digest;
- required phase-evidence paths and SHA-256 digests;
- direct native-oracle agreement, permission denial/allow, installed-package execution, and terminal cleanup;
- privacy exclusions, claim limits, and promotion eligibility.

Durations are regression observations only. Logs remain local unless reviewed and sanitized. Public records exclude machine/account/path/serial/UUID/bus identifiers.

## Test sequence

The runner executes one dependency-ordered chain:

1. exact Node and clean-commit preflight;
2. device-zero and Driver inventory;
3. synthetic ABI and deterministic schema checks;
4. Driver/device/context C-oracle parity;
5. actor affinity, health, and teardown;
6. copied device-memory parity;
7. PTX module, packed launch, completion, and output parity;
8. NVRTC/nvJitLink artifact parity, cache integrity, and Driver handoff;
9. diagnostics, permissions, failure partitions, and repeated lifecycle balance;
10. clean package install, public-facade execution, aggregate close, and uninstall;
11. evidence indexing, hashing, sanitization, and promotion disposition.

The first failed case stops promotion. A repair reruns the smallest owning capsule, then the complete profile once.

## Hardware coverage strategy

Priority is based on architectural diversity and user reach, not product count:

- P0: additional Turing model, Ampere 8.0 and 8.6, Ada 8.9, Hopper 9.0, and Blackwell 12.0;
- P1: embedded Ampere 8.7, Blackwell 10.0/10.3/12.1, native Linux x64, WSL2, and ARM64 SBSA;
- P2: less common architecture variants and a separately accepted Jetson profile.

Within each architecture, seek at least one consumer/workstation and one data-center mode where products exist. WDDM and TCC are separate host/device profiles. Laptops, headless systems, cloud/virtualized GPUs, and watchdog-disabled data-center devices can reveal different resource and permission behavior and must not be collapsed into a desktop result.

## Supporting test systems

### Stage A — contributor kit

Ship the registry, profile planner, qualification command, issue form, privacy rules, and evidence review checklist. This immediately enables broad owner-operated testing without granting repository infrastructure access.

### Stage B — maintainer-attested reruns

For high-value or surprising submissions, arrange a second run on another machine with the same profile or the same GPU architecture. Compare record shape and semantic output, not elapsed time. A second run increases confidence but remains separately identified evidence.

### Stage C — dedicated resettable hosts

Build a small fleet with immutable or routinely reimaged system volumes:

- Windows 11 x64 WDDM consumer/workstation host;
- Windows Server or workstation TCC data-center host;
- native Ubuntu x64 host;
- Windows 11 x64 host with a controlled WSL2 guest;
- native ARM64 SBSA host;
- separately governed Jetson host if that profile is accepted.

Each host pins official Node archives and identifies Driver/toolkit/providers. Test accounts are non-administrative where possible. GPU state, processes, caches, contexts, and temporary package installations are inspected before and after each run.

### Stage D — controlled automation

Use self-hosted runner labels only after the fleet exists and its security model is accepted. Fork pull requests never execute automatically on persistent GPU hosts. A maintainer-approved dispatcher resolves an exact commit SHA, uses an ephemeral work directory or disposable image, runs the qualification command, uploads sanitized artifacts, and tears down the environment. Runner credentials have minimum repository scope and are rotated independently.

### Stage E — sponsored/cloud coverage

Use short-lived data-center instances for expensive Hopper/Blackwell and virtualization profiles. Record instance/GPU presentation mode without relying on cloud marketing names. Spot interruption is an infrastructure failure, not a framework result. Provider images are inputs, never support evidence by themselves.

## Promotion and requalification

A maintainer reviews the exact evidence and opens or accepts a registry PR. Promotion changes only the exact profile row. Architecture coverage may move from `seeking-evidence` to `qualified-one-model`; it never becomes a family-wide support claim without an explicitly defined aggregation policy.

Requalification is required after material changes to Node/module ABI, OS/ABI, Driver API or Driver mode, toolkit/header/providers, GPU architecture, generated schema/semantic overlay, permissions, device artifact/options, public package, resource ownership, failure semantics, or cleanup. Security fixes may invalidate all affected evidence even when ordinary output is unchanged.

Quarterly freshness checks are useful operationally, but calendar age alone does not invalidate an otherwise exact historical claim. The list should show both tested date and current release applicability once release policy exists.

## Acceptance and rollout

The initial program is accepted when:

- registry invariants reject inferred or incomplete support;
- the generated list matches the registry byte-for-byte;
- the Windows runner composes all accepted native phases without weakening them;
- incomplete platforms expose explicit missing capsules and cannot emit a promotable run;
- CI validates registry and document drift without requiring a GPU;
- the public issue form collects exact profile/evidence fields and privacy attestation;
- public campaign issues exist for broad GPU coverage and each materially distinct platform.

The initial program does not complete Linux, ARM64, WSL2, Jetson, TCC, virtualized, multi-GPU, MIG, performance, or production-stability qualification. Those are independently reviewable follow-on results.

## Cleanup and handoff

Qualification output stays under ignored `build/hardware-qualification/`. The runner owns command termination; phase capsules own native cleanup. Contributors retain raw bundles only through review or according to their own evidence policy, then remove or archive them securely. Repository branches and PRs follow protected-main review and exact-head merge rules.
