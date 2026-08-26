# SPEC-0029: Bounded cuBLASLt f32 Row-Major Matmul

**Status:** Accepted

**Date:** 2026-08-26

**Parent:** accepted SPEC-0023 context-bound CUDA library adapter framework

**Issue owner:** #90

## Outcome

Admit one optional, finite cuBLASLt profile that submits `D = alpha * op(A) * op(B) + beta * C` through the existing CUDA-JS operation lifecycle. The profile is a generic matrix primitive, not a tensor or neural-network abstraction.

## Contract

`CudaRuntime.openCublasLt()` lazily requests one opaque adapter for the selected runtime/device/context. `CudaCublasLt.createF32MatmulPlan()` accepts exactly:

```text
m, n, k: integers in [1, 2^31-1]
transposeA, transposeB: booleans, default false
maxWorkspaceBytes: integer in [0, 256 MiB], default 0
```

The immutable plan reports the exact `f32` element counts for A, B, C, and D plus the selected workspace requirement. Matrices are contiguous row-major device views. A, B, and C require read authority; D requires write authority. Submission accepts finite host `alpha` and `beta`, defaulting to 1 and 0. A nonzero selected workspace requires one explicit read-write device view with sufficient bytes and a 256-byte-aligned offset.

Larger views are admitted by leasing only the exact prefix required by the plan. Batch, arbitrary strides, mixed dtypes, epilogues, bias, native algorithms, native descriptor attributes, native handles, caller provider paths, and hidden workspace allocation are excluded.

## Ownership and execution

The adapter is a context child inside DriverActor. Plans are adapter children. Each submission leases its plan, all view capabilities, backing allocations, and optional workspace until the ordinary opaque operation is terminal.

The existing execution owner selects a private stream, enforces dependency/hazard admission, creates the final event, observes completion, and owns failure terminality. This profile does not create another scheduler, stream API, event API, or completion type.

The first profile allows one open cuBLASLt adapter per runtime. Provider import/runtime use remains unaffected until `openCublasLt()` is called.

## Provider and ABI profile

The admitted native Windows profile is the exact CUDA 13.3 installation described by `schemas/cuda-13.3/win-x64/cublaslt-provider-manifest.json`:

- canonical `cublasLt64_13.dll` identity and runtime version 13.5.1;
- pinned `cublasLt.h` identity;
- fourteen selected exports only;
- generated FFI facts and independently compiled C++ layout/call oracle;
- no bundled NVIDIA binary or caller-selected path.

Native Linux provider admission remains unavailable until an exact official-package manifest and physical-host oracle run exist. Portable mock behavior proves contract orchestration only.

## Error and cleanup

Missing, noncanonical, wrong-version, wrong-identity, or wrong-export providers fail at lazy adapter open without changing ordinary runtime availability. Invalid shapes, dtypes, access roles, ranges, workspaces, resource ownership, dependencies, and hazards fail before native submission.

Plan descriptors close before the cuBLASLt handle and provider library; the provider closes before Driver context teardown. In-flight work prevents plan/view/workspace release. Cleanup failure is restart-required and may not be presented as successful disposal.

## Evidence

Acceptance requires:

1. portable public-facade numerical, transpose, workspace, negative, lease, and cleanup cases;
2. installed-package mock consumer evidence with no internal import;
3. exact provider/header identity verification before handle creation;
4. independent C++ agreement on algorithm/heuristic layouts, provider version, zero-workspace selection, and numerical output;
5. public Node 26.7.0 native output parity and terminal cleanup on the same exact device/provider profile;
6. provider-absence/wrong-identity controls without core-runtime regression.

No performance claim is made. A performance profile requires a separate reproducible workload, warmup, algorithm/workspace policy, comparison, and raw evidence.

## Falsifiers

Rollback this child while retaining SPEC-0023 if it requires public native controls, tensor semantics, eager provider loading, a second operation lifecycle, hidden unbounded allocation, or cleanup claims unsupported by owning-system evidence.

## Primary references

- https://docs.nvidia.com/cuda/cublas/
- https://docs.nvidia.com/cuda/cublas/#cublasltmatmul
- https://docs.nvidia.com/cuda/cublas/#cublasltmatmulalgogetheuristic
