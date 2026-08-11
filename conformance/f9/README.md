# F9 trusted-header and atomic-publication conformance

This capsule owns CUDA-JS's generic prerequisite for the later CUDA-MCGS compatible pair. It selects the manifest-verified `cuda-cccl` compile profile, compiles one consumer-neutral `<cuda/atomic>` fixture through the public facade, launches it once, observes terminal output, and proves graceful resource closure.

Run on the exact qualified Windows toolchain:

```bash
npm run f9
```

Run the shared header-profile and cache/contract controls on any exact Node 26.7.0 host:

```bash
npm run f9:portable
```

Native Linux x64 CI additionally runs `npm run f9:linux-readiness`. That bounded probe searches only canonical CUDA 13.3 CCCL roots and records their path-free aggregate identity when present. It does not load NVRTC, compile `<cuda/atomic>`, launch a kernel, prove cleanup, create a Linux provider manifest, or establish Linux support. The current local environment cannot execute this Linux-only probe; its first authoritative result must come from the exact remote Ubuntu CI head.

Generated evidence stays under ignored `build/f9/`. The capsule does not import CUDA-MCGS, define search data, or claim graph/search correctness. Its native result is limited to the exact Node/Windows/CUDA/provider/header/Driver/GPU profile recorded in the evidence. The cross-repository compatible-pair result remains separately owned and revision-keyed.
