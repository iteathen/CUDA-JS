# Performance, thermal observation and bounded-soak qualification

**Status:** Proposal

**Execution state:** Active

**Assessment depth:** Critical native performance/evidence work

**Original frozen input:** CUDA-JS protected `main@2135216b1a9fd88066a1c82b61ae533645eac9c2`, package `cuda-js@0.1.0-alpha.6`

**Reconciled input:** CUDA-JS protected `main@05008fb988558e909cb3802fa12a73d612e70bf0`, package `cuda-js@0.1.0-alpha.7`; final evidence is keyed to the later exact benchmark commit recorded below.

**Issue:** #28

## Outcome and ownership

Create one benchmark-owned, public-package observation boundary with versioned short and bounded-long profiles. It owns workload identity, cold/warm/workload/cooldown phases, independent correctness, read-only telemetry, latency/throughput distributions, raw-sample digests, invalid-run classification and terminal cleanup evidence. Runtime components continue to own execution/resource behavior; the hardware registry owns status projection. The benchmark creates no new runtime capability or product-performance/support claim.

The first exact profile is Windows x64, Node v26.7.0, NVIDIA GeForce GTX 1660 Ti `sm_75`, Driver 610.74/API 13030 and CUDA 13.3. Other devices, providers, platforms, ambient-normalized thermal capacity, indefinite soak, leak freedom and production stability are excluded.

## Adversarial assessment and selected path

A timing-only loop is too weak: it can pass while output is wrong, telemetry is missing, another workload dominates, throttling occurs or resources leak. Reusing correctness conformance as a benchmark is also wrong because it does not define representative phases, synchronization, samples or noise limits. A production telemetry component would be unnecessary architecture for an evidence-only need.

The selected LEGO boundary is therefore a fixed public Device-JS workload plus an independent benchmark harness. Every launch waits for terminal public completion; the host computes the output oracle separately; `nvidia-smi` is read only; raw records are bounded and hashed; excessive idle load, gaps, throttle bits, temperature, memory non-return, correctness failure or nonterminal cleanup invalidate rather than merely slow the result.

## Execution and evidence gates

1. Implement and unit-test strict profiles, telemetry parsing, statistics, canonical identity and invalidation sensitivity.
2. Commit the harness so native evidence runs from a clean exact source revision.
3. Run the 60-second presubmit profile. Diagnose the first divergence if invalid.
4. Run the 15-minute bounded-soak profile only after the short profile passes unchanged.
5. Preserve sanitized summaries and raw-sample digests; keep raw ignored evidence only through review.
6. Run `npm run verify`, documentation validation and exact-effect review; integrate only after required PR review/checks.

Issue closure requires both profiles to pass their predeclared gates on the exact profile and the integrated public summary to retain honest noise and claim limits. A failure or unavailable controlled window leaves the corresponding evidence leaf blocked; thresholds are not weakened to obtain a pass.

No command changes clocks, power limits, fans, persistence, compute mode, Driver mode, GPU assignment or host configuration. Before closure, generated builds, packages and raw telemetry are removed unless retained with an explicit review/recovery trigger.

## Multi-GPU disposition

This plan establishes one-device baselines only. Exactly one visible GPU is required so a result cannot accidentally inherit multi-GPU meaning. The benchmark now records and checks the public runtime's selected-device architecture, Driver API, compiler-provider identity and sanitized telemetry GPU/Driver identity.

Multi-GPU observations are a separate successor after SPEC-0017 explicit selection is integrated and at least two physical GPUs are available. The successor should use one selected runtime/context owner per GPU, report per-device and aggregate measurements, and begin with independent work replicas plus final terminal aggregation. CUDA-JS does not choose consumer partitioning or reduction policy; peer copies, staged copies, shared mutable state and collective libraries remain separately selected mechanisms with their own evidence.
