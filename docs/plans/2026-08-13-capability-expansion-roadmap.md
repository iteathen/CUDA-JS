# CUDA-JS Capability Expansion Roadmap

**Status:** Informational

**Disposition:** Current execution dependency map

**Originally:** 2026-08-13

**Reconciled:** 2026-08-25 against protected `main@118dec1574d650557ffa65f1bbb1d89e0970ceff`

## Purpose

Sequence accepted or proposal-backed generic CUDA-JS work without confusing architectural selection, implementation, qualification, and priority. The broader non-committed inventory is the [long-horizon capability candidate map](2026-08-25-long-horizon-capability-map.md); it cannot reorder this execution path or authorize implementation.

## Current dependency spine

```text
P0 active: accepted SPEC-0017 explicit device selection (#20)
  portable selector/target integration
  -> exact one-device default/explicit selection evidence
  -> native selected-device promotion when direct physical-host evidence exists

External evidence lane: native Linux reference qualification (#4)
  repository-side EXP-001/F1B/F3L-F8L chain complete
  -> contributor-run exact Ubuntu 24.04 x86-64 physical-NVIDIA evidence
  -> exact-cell review and promotion only after the unchanged chain passes

P1 after accepted bounds: smallest necessary SPEC-0024 multi-GPU subset
  finite selected runtimes and device-scoped ownership
  -> cross-device misuse rejection and terminal aggregate status
  -> topology/P2P/collectives only for independently justified profiles
```

Linux is the first native promotion platform; public and component contracts remain OS-neutral. Windows remains a maintained peer exact profile.

## Governing invariants

- one private context owner per selected device;
- raw device identifiers, native handles, pointers, streams, events, providers, and generated CUDA remain private;
- every resource, queue, staging area, cache, artifact, operation, and coordinator is finite and explicitly disposed;
- SPEC-0016 remains the sole submit/status/wait/close lifecycle authority;
- architecture, implementation, qualification, and priority remain independent;
- native and performance claims require exact independent evidence;
- generic core remains free of consumer/search/tensor/model/training policy.

## Current authority and implementation state

Implemented portable/software/package foundations include:

```text
SPEC-0010 typed relocatable device code
SPEC-0011 u64/i32/finite-only-f32 scalar arguments
SPEC-0012 typed Device LTO
SPEC-0013 restricted Device-JS
SPEC-0014 bounded long-lived publication mailbox first profile
SPEC-0016 opaque operation lifecycle
SPEC-0018 bounded capacity-two/private-stream scheduling first profile
SPEC-0019 bounded pinned staging and asynchronous transfer first profile
SPEC-0021 f64/f16/bf16 scalar ABI and contiguous typed views
SPEC-0022 accepted atomic-observation and release/acquire publication children
```

Accepted and dependency-ready:

```text
SPEC-0017 explicit device selection and selected-device target resolution
```

Proposal-only remainder:

```text
SPEC-0020 CUDA Graph realization and additional prepared node families (semantic kernel-DAG baseline implemented)
SPEC-0022 except its accepted atomic-observation/publication children
SPEC-0023 context-bound CUDA library adapters
SPEC-0024 multi-GPU orchestration
SPEC-0025 graphics interop
SPEC-0026 process-isolated execution
```

SPEC-0027 is accepted authority only for a separate future NN publish unit. It does not authorize NN code or dependencies in `cuda-js` core.

## External lane — qualify the reference-platform chain

Issue #4 no longer owns repository-side adapter or runner implementation. It is a contributor-operated evidence lane that may advance whenever a suitable native physical-NVIDIA host is available; it does not block accepted OS-neutral portable/software work.

1. Keep the completed platform diagnostics, compatibility admission, public facade, F3L-F8L source runners, and installed-package behavior aligned with the shared Linux Driver/compiler profiles.
2. Preserve `not-qualified` truth and fail closed outside the exact Linux x86-64 profile.
3. Run EXP-001/F2L and F3L-F8L on exact Ubuntu 24.04 x86-64, Node 26.7.0, CUDA 13.3, NVIDIA Driver, and GPU hardware.
4. Compare Driver, memory, execution, compiler/linker, package output, permissions, and teardown against independent native oracles.
5. Promote only the exact compatibility cell after the entire chain passes.

The currently available VM hosts cannot provide an accepted CUDA qualification environment. VM, emulated, WSL, container, hosted-CI, portable, or mock evidence cannot substitute for a native Ubuntu NVIDIA Driver/GPU run on directly exposed physical hardware.

## P0 — integrate accepted device selection

The Linux source/package runner path is coherent, so accepted SPEC-0017/#20 is the active dependency-ready packet:

- finite sanitized discovery snapshots and opaque selectors;
- exactly one selected device bound before context/resource creation;
- default compatibility behavior retained;
- selected architecture propagated through target and cache identity;
- stale, foreign, ambiguous, and cross-owner selection rejected before native work;
- native identifiers remain private;
- multi-device orchestration remains outside SPEC-0017.

Portable implementation does not prove distinct physical-device behavior. Native selected-device promotion waits for a controlled physical-GPU host; exact multi-device promotion needs at least two independently visible physical GPUs.

## P1 — accept only the needed multi-GPU subset

The first demonstrated consumer need is finite independent device-resident replicas with pre-ignition assignment and final aggregation after every per-device operation is terminal. Reassess SPEC-0024 around that subset before implementation.

Do not force P2 to include P2P, NCCL, shared graphs, automatic partitioning, migration, or multi-node execution. Those remain separate horizon candidates unless a concrete generic requirement justifies them.

## Other successor lanes

- The SPEC-0020 semantic kernel-DAG baseline is implemented over the accepted operation/scheduling owners; CUDA Graph realization and additional node families remain successor profiles.
- SPEC-0023 library adapters build on selected device, typed views, scheduling, and provider-specific evidence.
- SPEC-0025 graphics/external-resource interop builds on selected-device matching, typed views, and synchronization contracts.
- SPEC-0026 process isolation remains distinct from Worker ownership.
- Native SPEC-0021 scalar/view promotion, #28 benchmark methodology, other OS/GPU/toolkit profiles, and exact CUDA-MCGS compatible-pair evidence retain separate owners and gates.

## Acceptance discipline

```text
candidate inventory              -> no architecture or implementation authority
proposal researched/revised      -> no implementation authority
accepted specification           -> bounded implementation authority
portable implementation passes   -> implementation status may advance; native support does not
exact native capsule passes       -> only that exact profile may become qualified
benchmark passes                 -> only the named measured claim may advance
```

## Do not

- implement from this roadmap, a candidate row, or an issue body without accepted governing authority;
- let the long-horizon inventory displace active SPEC-0017 or the external issue #4 evidence lane;
- duplicate SPEC-0016 lifecycle;
- expose native device or provider identity;
- infer support across OS, GPU, Driver, toolkit, topology, or library profiles;
- add unbounded queues, pinned memory, pools, workspaces, caches, or coordinators;
- add MCGS, search, tensor, model, training, or application scheduling semantics to core;
- present Workers as process isolation, MIG/MPS discovery as administration, timing as overlap proof, or CPU/WebGPU emulation as CUDA compatibility.
