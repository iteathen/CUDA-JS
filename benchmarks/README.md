# Benchmarks

**Status:** Informational

Benchmarks answer mechanism and regression questions only after correctness and lifecycle gates pass. The governing questions and promotion criteria are in [`../experiments/EXPERIMENT_MATRIX.md`](../experiments/EXPERIMENT_MATRIX.md), especially EXP-004, EXP-006, EXP-008, and EXP-009.

Required benchmark families:

- Node FFI named-symbol call shapes and generic-fallback controls;
- DriverActor single-command and batched RPC;
- context/stream/event operations;
- `cuLaunchKernelEx()` and compatibility launch with equivalent work;
- completion latency/CPU/backpressure;
- staged, pinned, mapped, and managed memory under equivalent transfer/synchronization semantics;
- NVRTC/nvJitLink/cache cold and warm paths;
- teardown and leak-stress cost.

Every report includes exact Node/build/flags, OS/ABI, Driver/toolkit/GPU, schema/artifact/profile, workload, warmup, synchronization, sample count, distributions, raw results, correctness guard, and checks not run.

Do not infer Fast-JIT use from speed alone. A strict JIT claim requires direct exact-profile mechanism evidence accepted by EXP-004.
