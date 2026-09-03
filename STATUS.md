# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-09-03

## Current package and boundary state

```text
protected package:            cuda-js@0.1.0-alpha.17
implementation candidate:     cuda-js@0.1.0-alpha.18
public API schema:            1
host source model:            JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:          testing-unconfirmed / not-qualified
performance claims:           none beyond exact recorded evidence
active implementation:        #193 ordinary base-allocation alignment projection
first consumer:               CUDA-MCGS #125 public runtime adapter
```

CUDA-JS owns generic CUDA device/context/memory/compiler/artifact/module/function/operation/prepared-execution/provider mechanism and lower compatibility facts. CUDA-JS-Tensor owns Tensor mathematics/planning; CUDA-MCGS owns search semantics and selected search-profile policy; reusable NN/RNG/communication/I/O/media/ray/data semantics remain in their independent owners.

## Accepted alignment authority

PR #196 protected-integrated the accepted SPEC-0004 allocation-alignment addendum at `426e4eb9b0c73346b19e60c81ab686b9eb5be256`, tree `a2dd4aca91456f8544b14c1312ac36c03c396808`. The authority establishes exactly one generic lower fact: ordinary CUDA-JS base allocations have a minimum alignment of 256 bytes, owned by `runtime.memory` and projected through immutable `CUDA_JS_COMPATIBILITY`.

The contract does **not** add caller-selected allocation alignment, raw pointers, VMM/suballocation, a blanket guarantee for nonzero-offset views, native support promotion, or performance claims.

A subsequent accidental direct create/revert of a root `noop` file changed protected history only. Current protected `main@2d43d9a5e1d4391b27966f9fcd681a15df26d346` is byte-for-byte restored to the same authorized tree `a2dd4aca91456f8544b14c1312ac36c03c396808`, and its push `verify` and `node-compatibility` workflows pass. The event is retained as governance evidence rather than hidden by history rewriting.

## Alpha.18 implementation candidate

Draft PR #197 implements only the accepted projection:

- one memory-component owner constant for the 256-byte ordinary base-allocation minimum;
- `CUDA_JS_COMPATIBILITY.capabilities.deviceMemoryAllocationMinimumAlignmentBytes = 256` mechanically checked against that owner;
- an installed public compatibility consumer that admits 8-byte and 256-byte base requirements and rejects 512-byte requirements;
- prerelease identity advanced to `0.1.0-alpha.18` because the public compatibility product materially changes;
- existing `allocateDevice({ byteLength })`, view-offset semantics, native calls, lifecycle, errors, health and cleanup remain unchanged.

The red-first probe on PR #197 failed exactly because the memory component did not yet export the required lower owner; all earlier portable stages passed before F8 reached that falsifier. Production implementation then fills that demonstrated gap rather than widening the API.

## Completed lower-boundary refactor

The prior consumer-ownership audit remains complete:

- #178 — provider capability/admission truth is publicly consumable;
- #179 — cuBLASLt-specific borrower lifecycle is lower-owned without a generic provider lease;
- #180 — no universal preparation transaction; existing compiler/module/function/provider-plan/prepared-DAG resources remain the seam;
- #181 — no logical-work launch resolver; explicit geometry remains the public expert contract;
- #186 — prepared-DAG and Device-JS finite lower ceilings are projected through immutable compatibility records;
- CUDA-JS-Tensor #40/#44/#45 and CUDA-MCGS #193 completed their peer ownership audits.

The architecture umbrella #162 is closed completed. Future generic lower gaps must come from demonstrated consumer need.

## Durable architecture and evidence anchors

`DriverActor` remains the Worker/context/native-resource owner. **CJS-F1B** remains the generated CUDA ABI-fact and independent layout-evidence anchor; **CJS-F2W** remains the accepted **Windows x64** Driver/bootstrap anchor; **CJS-F7W** remains the retained Windows platform-hardening/property/lifecycle anchor. Historical native evidence stays exact to its recorded revisions/profiles and is not silently requalified by alpha.18 metadata.

## Downstream seam

CUDA-MCGS #122 is protected-accepted. CUDA-MCGS #125 must consume the alignment fact only after #197 is qualified and separately protected-integrated; it must not assume the native CUDA fact or add a private/native workaround. After that lower gate, #125 can continue implementing the public runtime adapter and route any additional demonstrated generic gap back to its natural lower owner.

## Qualification and issue-state policy

Portable/mock/package evidence proves only the paths it executes. Native Linux, additional hardware/provider cells, WSL/ARM64/Jetson/TCC/virtualization/MIG/ECC, performance and stability remain independent evidence work. Completed implementation tickets close rather than remaining open for unspecified future cells; dormant roadmap possibilities remain dormant until a real consumer/profile activates them.

Protected `STATUS.md` and `next_step.yaml` own the live execution seam. Issues own durable obligations, blocked gates and concrete evidence cells rather than duplicate live-SHA timelines.
