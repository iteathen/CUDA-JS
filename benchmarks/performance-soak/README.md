# Performance, thermal observation and bounded soak

**Status:** Experimental evidence harness

This benchmark family owns reproducible observations for CUDA-JS issue #28. It exercises the public `cuda-js` package surface with one fixed Device-JS xorshift workload, an independent host output oracle, terminal launch synchronization, read-only `nvidia-smi` telemetry, process-memory sampling and exact cleanup checks. It does not change clocks, power, fans, persistence, compute mode, Driver mode or GPU state.

The two versioned profiles in [`profiles.json`](profiles.json) deliberately separate a 60-second presubmit observation from a 15-minute bounded soak. Each run records cold setup, warmup, workload and cooldown phases; latency/throughput distributions; GPU utilization, memory, temperature, power, clocks and throttle masks; process memory; repeated correctness digests; terminal resource state; raw-sample digests; exact source/toolchain/device identity; invalid-run reasons and explicit claim limits.

These are deliberately **per-device** baselines: the first profiles require exactly one visible GPU and never infer multi-GPU behavior from multiple runtime instances. After accepted SPEC-0017 device selection is implemented and distinct physical devices are qualified, a separate topology-aware profile may run one selected runtime per device and report per-device plus aggregate observations. It must retain device-scoped artifact/resource/health identity and cannot silently discover-and-use-all devices, infer peer transfer, or turn aggregate throughput into a scaling claim.

## Commands

Use exact Node v26.7.0 with `--experimental-ffi`:

```text
npm run performance:check
npm run performance:short
npm run performance:soak
```

`performance:check` is CUDA-free and validates profiles, parsers, statistics, evidence identity and invalidation sensitivity. Native runs require a clean tracked worktree, exactly one visible GPU and the exact first Windows x64 qualification profile. Output is ignored under `build/performance-soak/<profile>/<run-id>/`.

## Evidence and invalidation

A run is invalid—not slow—when required telemetry is missing, sample gaps exceed the profile bound, the idle baseline is too busy, an unapproved throttle bit appears, temperature exceeds the declared observation ceiling, GPU memory does not return within the cooldown allowance, output differs from the host oracle, runtime resources are nonterminal, or the workload ends early. Invalid evidence never supports a regression, thermal, soak or stability claim.

The committed public summary may retain sanitized exact identities, distributions and raw-sample digests. Raw telemetry/latency files remain ignored review evidence and contain no host name, account name, GPU UUID, serial, PCI address, native handle, device address or process path. They are removed after review unless an explicit retention owner and trigger are recorded.

These profiles are mechanism observations for one device/Driver/toolkit/Node/OS/workload only. They do not establish product performance, performance portability, ambient-normalized thermal capacity, indefinite leak freedom, production stability or support for another profile.

The first natural multi-GPU consumer direction is independent work replicas with final aggregation after every device operation is terminal. Peer/staged transfer, shared mutable graphs and fine-grained cross-device synchronization remain separately selected and measured mechanisms rather than prerequisites for this baseline.
