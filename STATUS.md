# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-09-03

## Current package and boundary state

```text
package candidate:            cuda-js@0.1.0-alpha.17
public API schema:            1
host source model:            JavaScript/ESM, Worker-owned Node FFI
exact Node evidence baseline: Node 26.7.0
native Linux x86-64:          testing-unconfirmed / not-qualified
performance claims:           none beyond exact recorded evidence
```

The current alpha.17 packet completes the lower CUDA boundary needed by the active Tensor refactor without adding a universal GPU IR, launch resolver, executable-preparation transaction, provider registry, or consumer-specific semantics.

Completed refactor decisions and mechanisms are:

- **#178 provider capability/admission truth:** the existing SPEC-0023/SPEC-0029 provider model remains the owner; cuBLASLt workspace alignment is projected as a public lower fact and ordinary unavailable/incompatible cases use the public `unsupported` category.
- **#179 cuBLASLt lifecycle:** CUDA-JS owns one underlying runtime/provider resource and independent public borrower children. No generic provider-sharing lifecycle was introduced because materially different providers do not share one coherent handle/teardown model.
- **#180 executable preparation:** no new `PreparedExecutable`, `GpuProgram`, or universal preparation transaction is justified. Compiler/artifact/module/function/provider/prepared-DAG resources remain independently composable LEGO pieces.
- **#181 launch resolution:** explicit grid/block geometry remains the canonical public expert contract. Physical topology selected by Tensor, MCGS, or another upper profile stays upper-owned while CUDA-JS owns launch validity and device limits.
- **#186 finite compatibility projection:** alpha.17 exposes the already-owned SPEC-0020 prepared-DAG limits and Device-JS per-function parameter ceiling through immutable `CUDA_JS_COMPATIBILITY` records, with drift tests tying the public projection to the lower owners.

The relevant additive compatibility fields are:

```text
capabilities.preparedOperationDagLimits = {
  nodes: 32,
  edges: 64,
  bindings: 64,
  predecessorsPerNode: 8
}

capabilities.deviceJsLimits = {
  parametersPerFunction: 64
}
```

These values are public compatibility facts, not a second validation owner. Device-JS and prepared execution continue to validate every actual request.

## Existing generic CUDA-JS substrate

The current public/software/package substrate includes bounded device discovery/selection, device memory and typed views, module/function resources, explicit launch/completion, the SPEC-0016 operation lifecycle, the exact capacity-two SPEC-0018 scheduling profile, bounded async transfer, publication mailboxes, NVRTC/nvJitLink compilation and typed artifacts, restricted Device-JS, Device-JS leaf-library composition, dense numeric Device-JS, immutable prepared DAGs, and the bounded cuBLASLt f32 row-major profile including prepared-DAG composition.

CUDA-JS remains consumer-neutral. Tensor mathematics/planning belong to CUDA-JS-Tensor; reusable NN semantics belong to cuda-nn; search semantics belong to CUDA-MCGS; RNG/communication/I/O/media/data/ray/graph-analysis semantics remain in their independent owners.

## Durable architecture and evidence anchors

The refactor does not erase established architecture/evidence provenance. `DriverActor` remains the Worker/context/native-resource owner. **CJS-F1B** remains the generated CUDA ABI-fact and independent layout-evidence anchor; **CJS-F2W** remains the accepted Windows Driver/bootstrap anchor; **CJS-F7W** remains the retained Windows platform-hardening/property/lifecycle anchor. The accepted historical **Windows x64** qualification evidence remains exact to its recorded revisions and profiles rather than being requalified by alpha.17 metadata changes.

## External CUDA-NN ownership

ADR-0007 assigns reusable NN/model/inference/autodiff/training semantics to the independent CUDA-NN repository. The historical bootstrap provenance anchor `iteathen/cuda-nn@7d7854697049db38e4a0670b80df9d600cd442c3` is retained for auditability; newer cuda-nn revisions supersede it for live implementation state. Those reusable NN semantics **no longer belong to a future publish unit in this repository**. Historical ADR-0004/SPEC-0027 remain provenance only and do not authorize new `nn.*` CUDA-JS production components.

## Qualification limits

Portable/mock/package evidence proves only the code paths it executes. Existing exact Windows evidence remains exact to its recorded Node/Driver/toolkit/provider/GPU revisions and is not silently requalified merely because alpha.17 adds side-effect-free compatibility metadata. Native Linux, other GPUs/providers, broader topology, multi-GPU, performance, strict-JIT and process-isolation claims remain independently gated.

The repository-side Ubuntu 24.04 native runner chain remains available for contributor evidence, but hosted CI, VMs, WSL, containers and portable mocks do not substitute for a directly exposed physical NVIDIA host where native qualification is required.

## Current cross-repository seam

After alpha.17 protected integration, the next dependency-ready refactor is **CUDA-JS-Tensor #45**. Tensor should consume the public prepared/Device-JS limit projection, remove copied lower ceilings where there is no independent Tensor rationale, preserve Tensor-selected `blockSize` and logical-work-to-grid mapping, preserve its accepted `ptx | lto-ir` artifact-family control, and continue composing the existing public compile/module/function/prepared-DAG bricks.

After Tensor #45, Tensor #40 performs final execution-ownership reconciliation. CUDA-MCGS #193 follows that reconciliation. CUDA-MCGS #125 remains independently blocked by its existing prerequisites. No CUDA-MCGS search semantics are authorized by this status document.

Detailed historical evidence and capability provenance remain in the accepted specifications, ADRs, issues/PRs, `docs/CAPABILITIES.md`, support documents, and qualification artifacts rather than being duplicated here.
