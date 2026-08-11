# CUDA-JS Version-Zero Support Matrix

**Status:** Proposal

**Date:** 2026-08-10

This matrix defines planned qualification profiles, not current working support. A profile becomes supported only after its required capsules, packaging, teardown, and exact-version evidence pass.

## Node profiles

| Profile | Host-call substrate | V0 disposition |
|---|---|---|
| Node 26.7 exact | experimental `node:ffi`; Fast FFI where eligible | first qualification profile |
| Other Node 26 minors | separate exact-profile qualification | unsupported until tested |
| Node 22/24 | no built-in `node:ffi` baseline | excluded from no-addon v0 |
| Electron/embedded Node | distinct build/permission/FFI profile | excluded until an owner and matrix exist |

Node must be launched with `--experimental-ffi` and, when using the permission model, `--allow-ffi`. Node FFI remains experimental; CUDA-JS pins exact supported Node builds for pre-release work.

## Host platforms

| Platform | Architecture / ABI | Planned status | Required evidence |
|---|---|---|---|
| Windows 11 | x86-64 Win64 | active primary | F2W bootstrap through F6W compiler/linker/cache and PTX/cubin execution accepted; broader memory, concurrency, packaging, and public stability remain staged |
| Linux glibc | x86-64 SysV | GPU-free schema plus F3–F6 control plane complete; native Driver/compiler qualification deferred | run retained F2L readiness and Node/C Driver/provider/context/permission/teardown smoke on a qualified native NVIDIA host, then complete the documented native DriverActor/compiler stages |
| Linux glibc | ARM64 AAPCS64/SBSA | third | loader/FFI/layout/cache/context/Driver capsules |
| WSL2 | x86-64 | compatibility | Linux semantics plus environment diagnostics |
| Linux musl | x86-64/ARM64 | deferred | separate Node/libffi/loader/package decision |
| Windows ARM64 | ARM64 | deferred | CUDA/toolkit/Node qualification environment |
| macOS | any | unsupported | no current CUDA deployment target |
| 32-bit hosts | any | unsupported | outside foundational data model |

Cross-compilation can prove artifact shape, but native execution is required for support.

## CUDA profiles

| Profile | Planned role |
|---|---|
| CUDA Driver/Toolkit 13.3 documentation and headers | current primary schema and conformance profile |
| CUDA 12.9 / selected latest 12.x | previous-major compatibility target after current profile passes |
| newer preview/developer releases | canary discovery only; no support claim |
| older toolkits/drivers | deferred until v0 contracts stabilize and a consumer requires them |

Driver-only use must not require toolkit libraries. NVRTC and nvJitLink are separately discovered optional providers.

## Host-call profiles

| Profile | Rule | Status |
|---|---|---|
| `portable-bootstrap` | Node FFI generic fallback permitted for cold/setup/diagnostic/compile/link/teardown calls | required |
| `fast-jit-candidate` | exact Node/platform/signature is source-derived as Fast FFI eligible; correctness and benchmark evidence retained | experimental after EXP-000/004 |
| `fast-jit-required` | support claim requires a reliable direct qualification mechanism and fails when unavailable | blocked pending EXP-004 |
| generic project gap backend | small schema-driven callable-from-pointer/JIT/bootstrap backend only after a measured mandatory gap | deferred EXP-011 and new ADR |
| handwritten or AOT per-CUDA-function wrappers | creates duplicate signature authority and defeats schema/JIT direction | prohibited |

The selected v0 baseline ships no CUDA-JS-specific native addon. That is a baseline decision, not permission to leave a mandatory capability unsolved: EXP-011 may propose a small **generic** backend only when upstream Node, exact named exports, batching, or operation redesign cannot satisfy an accepted gate.

No call is advertised as guaranteed JIT-dispatched merely because its signature looks eligible or benchmarks quickly.

### Node 26.7 source-derived Fast FFI envelopes

These are planning facts to be re-derived and tested by EXP-000/004 for each exact Node build:

| Platform | Current source envelope | Consequence |
|---|---|---|
| Linux x86-64 SysV | global cap 8; up to 6 integer/pointer arguments and 8 FP arguments, with additional buffer/mixed restrictions | `cuLaunchKernelEx` can be a candidate; legacy `cuLaunchKernel` is generic |
| Linux/Windows ARM64 | global cap 8; up to 7 integer/pointer arguments and 8 FP arguments, with additional buffer/mixed restrictions | `cuLaunchKernelEx` can be a candidate after exact-profile proof |
| Windows x86-64 Win64 | current register-only emitter supports at most 3 public scalar arguments and no fast buffer argument | four-argument `cuLaunchKernelEx` is expected to use fallback; low-arity prepared/graph launches remain candidates |

The public API does not expose a supported callable-from-arbitrary-pointer constructor. `cuGetProcAddress` is therefore a version/status/semantics verifier in the baseline, not the invocation mechanism.

## Context and isolation profiles

| Profile | V0 disposition |
|---|---|
| one private context per DriverActor Worker | accepted Windows F6W baseline; execution/memory children close first, graceful close is proven, unexpected Worker loss is restart-required until recovery is proven |
| multiple independent DriverActors/contexts | after single-actor lifecycle passes |
| primary-context interop | later compatibility profile |
| shared context across Workers | excluded pending explicit design |
| borrowed external context | excluded from safe v0 |
| child-process isolation | optional P2 experiment after in-process correctness |

## Memory profiles

| Capability | V0 disposition |
|---|---|
| device-local allocation and synchronous copied JS bytes | accepted Windows F4W; portable policy/control plane passes Linux CI; native Linux Driver memory remains incomplete |
| bounded PTX module, declared function, one private stream, packed launch, event completion | accepted Windows F5W; portable orchestration passes Linux CI; native Linux Driver launch remains incomplete |
| bounded cubin module handoff from CompilerActor | accepted Windows F6W; exact PTX/cubin output parity and execution pass; native Linux providers and Driver launch remain incomplete |
| pinned host staging | after bounded lifetime/pressure experiment |
| mapped host control windows | optional, small, explicit synchronization |
| managed memory | opt-in experiment; no universal zero-copy claim |
| raw foreign-memory view | internal/unsafe only with resource lease |
| VMM, pools, IPC, external semaphores/memory | deferred |

## Launch and repeated-execution profiles

| Capability | V0 disposition |
|---|---|
| `cuLaunchKernelEx` with generated `CUlaunchConfig` and parameter table | preferred ordinary launch where capability/layout probes pass |
| legacy `cuLaunchKernel` | compatibility path; expected generic FFI due to large host signature |
| CUDA Graph instantiate/update/`cuGraphLaunch` | post-core optimization for prepared repeated work; low host-call arity is attractive, but graph lifetime/thread-safety must pass separate capsules |
| CUDA-managed host callbacks | excluded from safe v0 because callback-thread and CUDA reentrancy rules conflict |

Graphs are not a prerequisite for the first real-kernel slice. They become a performance profile after modules, arguments, streams/events, completion, and teardown are correct.


## Compiler-provider profiles

| Profile | V0 disposition |
|---|---|
| NVRTC in CompilerActor Worker with `--modify-stack-limit=false` on Linux | accepted Windows F6W; mandatory generated Linux rule retained pending native qualification |
| GPU-free NVRTC compile-only qualification | accepted on exact Windows profile and required independently of module-load/launch evidence on every additional platform |
| nvJitLink in CompilerActor Worker | accepted Windows F6W for bounded PTX-to-cubin composition; each additional platform requires independent provider/resource/cache evidence |
| child-process compiler provider | required alternative when a provider cannot satisfy the accepted process-global side-effect envelope or when stronger crash containment is selected |
| implicit process-wide stack-limit mutation | prohibited in the default in-process profile |

A Worker isolates JavaScript execution and blocking from the main event loop, but it does not isolate process-global native state. Provider manifests and EXP-009 must account for that distinction.

## Device-code profiles

| Capability | V0 disposition |
|---|---|
| load precompiled PTX/cubin | accepted Windows F6W; fatbin remains outside the bounded module contract |
| NVRTC source to PTX | accepted optional Windows F6W provider; other platforms require independent qualification |
| nvJitLink PTX composition to cubin | accepted optional Windows F6W provider; LTO remains deferred |
| runtime host-code compilation | out of scope; NVRTC is device-only |

## Release maturity

- **Foundation accepted:** architecture, schemas, experiments, and support matrix coherent; no native claim.
- **Alpha:** Windows x86-64 exact Node/Driver vertical slice; explicit incomplete Linux profile.
- **Beta:** Windows x86-64 production capsules plus any independently completed Linux/ARM64 profiles; package/update/teardown/security evidence; JIT claims limited to proven profiles.
- **Public release:** Node FFI maturity/support policy accepted, previous-major CUDA compatibility proven, second unrelated consumer passes, no material debt.
