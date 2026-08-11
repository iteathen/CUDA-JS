# CUDA-JS Node-FFI-First Experiment Matrix

**Status:** Accepted

**Date:** 2026-08-10

**Current authorization:** EXP-000 is promoted on independent Windows x64 and native Linux x86-64 evidence. F1B schema/ABI preparation, Windows EXP-012, Windows CJS-F3W through CJS-F8W, and Windows EXP-009 are accepted. The F3 through F8 platform-neutral/package capsules pass without native Linux providers. Native Linux EXP-001 and Linux DriverActor/compiler execution remain incomplete, hardware-deferred, and independently gated.

Every result records exact Node build/flags, OS/ISA/ABI, schema/header/generator, source/artifact, configuration, fixture, command, and cleanup identity. CUDA Driver/toolkit/GPU identity is required when CUDA is involved and explicitly `not applicable` for GPU-free experiments. Performance is not correctness evidence.

## EXP-000 — Node FFI synthetic ABI qualification

**Question:** Can official Node 26.7.0 builds correctly represent the scalar, pointer, out-parameter, pointer-to-pointer, structure-storage, argument-count, library-lifetime, and Worker-ownership patterns CUDA-JS needs without CUDA or a project addon?

**Cases:** generated dependency-free C library; 0–9 scalar arguments; x86-64/ARM64/Win64 register-envelope shapes; pointer/out/pointer-table cases; nested/aligned structures passed through byte storage; resolver-only non-exported function pointer; library close; Worker shutdown; blocking native function on the Worker.

**Oracles:** direct C executable, native size/alignment/offset report, exact result bytes, pinned Node source eligibility model, cleanup inventory, and separate benchmark samples.

**Promotion:** deterministic generated definitions/packers; exact native parity; fail-closed unsupported shapes; raw pointers remain private; responsive main loop; terminal cleanup; generic versus candidate-fast classification is explicit.

**Falsifier:** ordinary CUDA-style ABI shapes cannot be represented safely, Worker/library lifetimes cannot be fenced, or a mandatory host-call/JIT requirement needs a capability absent from public Node FFI.

**Detailed protocol:** [`EXP-000-node-ffi-synthetic-abi.md`](EXP-000-node-ffi-synthetic-abi.md).

## EXP-001 — prepared, hardware-deferred native Linux Node FFI CUDA smoke

**Question:** Can exact supported Node 26 builds load the Driver/NVRTC/nvJitLink libraries and correctly execute the Tier-0 named-symbol subset without a CUDA-JS addon?

**Cases:** pinned official input acquisition; native ABI comparison; independent C-oracle compilation; Node/platform/WSL/library/device/Driver readiness; `cuInit`, driver/device queries, error strings, all selected exports/procedure queries, private context create/current/destroy, permission behavior, and terminal cleanup.

**Promotion:** exact native parity, precise missing-library/flag diagnostics, no leaked library/context state.

**Falsifier:** required exported symbol cannot be bound, pointer/out packing differs, or lifecycle cannot be fenced.

**Disposition:** The GPU-free build/ABI/oracle/readiness capsule passes on native Ubuntu 24.04 x86-64. The retained final runner and human handoff in [`exp-001/`](exp-001/README.md) await a qualified native Linux x86-64 NVIDIA Driver/GPU environment and public contribution. It does not block the accepted Windows path and cannot consume Windows or WSL results as native Linux evidence.

## EXP-002 — exported symbol versus `cuGetProcAddress`

**Question:** Can version/status/stream semantics be verified while invoking only schema-approved named exports?

**Cases:** base/versioned/PTDS families, requested API versions/flags, query statuses, pointer comparison where meaningful, old/new drivers.

**Promotion:** deterministic rule mapping verified query to exact export; unsupported families fail closed.

**Falsifier:** required capability exists only behind arbitrary pfn invocation or semantics cannot be matched safely.

## EXP-003 — ABI and structure conformance

**Question:** Do generated scalar/handle/structure/out-parameter/pointer-table packers match native C layout on every target profile?

**Oracle:** compiled probe generated from the same pinned official headers but independent of JavaScript packer implementation.

**Promotion:** exact size/alignment/offset/value parity and mutation sensitivity.

**Falsifier:** ambiguous typedef/layout or hand-entered offsets needed for ordinary Tier-0 coverage.

## EXP-004 — Fast FFI and actor RPC overhead

**Question:** Which call shapes are actually suitable for hot use, and can strict JIT qualification be made truthful?

**Measure:** direct Node FFI, generic-fallback shapes, worker round trip, batched commands, cheap Driver query, `cuLaunchKernelEx`, compatibility launch, representative kernel work.

**Promotion:** exact-profile mechanism evidence; explicit hot/cold classification; reliable qualification mechanism for any `fast-jit-required` claim.

**Falsifier:** no reliable qualification, hidden fallback defeats the claim, or RPC dominates representative work without a safe batching remedy.

## EXP-005 — DriverActor context affinity

**Question:** Does one Worker reliably own current-context state across async turns, errors, shutdown, and multiple streams?

**Promotion:** all context-dependent operations occur on the owning thread; explicit close and graceful worker shutdown release in dependency order; unexpected Worker loss invalidates the runtime epoch and reports restart-required/orphaned state without claiming inaccessible native resources were released.

**Falsifier:** context currentness leaks across threads or cannot be restored deterministically.

**Disposition:** accepted for Windows F3W. Repeated native context turns remain current only on the owning Worker; graceful teardown is terminal. The mock capsule covers unexpected Worker loss because deliberately terminating the native in-process owner could strand Driver state until process restart.

## EXP-006 — completion strategy

Compare adaptive `cuEventQuery`, `cuStreamQuery`, bounded worker blocking, and any later safe notification mechanism.

**Measure:** latency distribution, CPU use, throughput, queue pressure, main-loop delay, shutdown, and deferred-error observation.

**Promotion:** bounded responsive strategy with deterministic terminal records.

## EXP-007 — deferred errors and context health

Inject invalid input, launch failure, asynchronous illegal access, teardown after failure, and device-loss/restart boundaries where feasible.

**Promotion:** correct provenance and conservative recoverable/suspect/poisoned/restart-required transitions.

**Current limit:** F3 validates error-record shape, provenance retention, monotonic health, and restart-required Worker-loss behavior through the lifecycle backend. It has no native asynchronous launch/completion operation, so real deferred-error attribution remains unproven and must be supplied by later native execution work.

## EXP-008 — memory and foreign-view lifetime

Test device-local copies, pinned staging, mapped windows, managed memory, GC pressure, in-flight leases, zero-copy foreign views, release ordering, context teardown, quotas, and stale generations.

**Promotion:** no use-after-free; every memory-kind contract states placement/visibility/coherence/synchronization/lifetime honestly.

**Disposition:** the bounded synchronous device-allocation and copied-byte partition is accepted for Windows F4W with exact Node/MSVC parity, quotas, ranges, leases, stale generations, and teardown. Native Linux memory remains blocked on F2L/F3L with a retained human handoff. Pinned, mapped, managed, asynchronous, and foreign-view partitions remain unexecuted and require later contracts; F4W does not promote them.

## EXP-009 — NVRTC/nvJitLink pipeline and cache

Compile, log, emit, link, load, launch, cache, corrupt, invalidate, and cleanly reproduce PTX/cubin/LTO artifacts where supported. Run a GPU-free NVRTC compile capsule separately from Driver module-load/launch. On Linux compare the accepted `-modify-stack-limit=false` profile with an instrumented process-limit observation; route any provider with unavoidable process-global effects to the child-process compiler profile.

**Promotion:** complete deterministic key and equivalent clean-room result; no unexpected process-global mutation and no half-live compiler/link/module state.

**Disposition:** promoted for the exact Windows x64 CUDA 13.3 profile. Independent MSVC and production Node FFI calls emit byte-identical PTX and cubin across clean runs; the validated cache rejects corruption; both artifacts execute through the DriverActor with identical output. Portable cache/lifecycle and Linux option fixtures are retained, while native Linux providers remain unqualified.

**Detailed protocol:** [`exp-009/README.md`](exp-009/README.md).

## EXP-010 — process isolation profile

After in-process correctness, measure daemon IPC/copies/deployment/lifecycle against crash and poisoned-context containment.

**Promotion:** only if containment benefit exceeds total-system cost for a real consumer profile.

**F8 disposition:** not triggered. Accepted in-process Workers satisfy the current responsiveness and lifecycle contract; no consumer has established a mandatory crash-containment gap. Worker loss remains restart-required.

## EXP-011 — arbitrary-pointer/custom-JIT gap

Triggered only if a required API cannot be invoked through named exports or a hard performance/JIT target fails.

Compare:

- upstream Node callable-from-pointer/fast-required capability;
- exact custom Node build;
- narrowly scoped custom JIT/backend;
- tiny native bootstrap;
- unsupported capability.

**Promotion:** a separately accepted decision showing decisive benefit and complete ABI/W^X/security/platform/lifetime cost. Custom AsmJit is not the default answer.

**F8 disposition:** not triggered. Accepted operations use named exports, no measured mandatory gap remains, and `fast-jit-required` is explicitly unsupported.

## EXP-012 — Windows Node FFI CUDA smoke

**Question:** Can official Node 26.7.0 load the canonical Windows Driver, bind the generated Tier-0 exports, verify procedure versions/status, and maintain a private Worker-owned context with exact MSVC C-oracle parity and terminal cleanup?

**Cases:** hash-identical official Windows header; native Win64 ABI probe; all 12 exports and procedure queries; Driver/device/attribute/error results; permission and negative controls; context create/current/clear/restore/destroy; library invalidation and Worker exit.

**Promotion:** accepted for the exact Windows x64 Node 26.7.0, CUDA 13.3, Driver 610.74, GTX 1660 Ti profile. It supplied the native prerequisite consumed by accepted Windows F3W and does not authorize later memory or execution work by itself.

**Falsifier:** any header/layout/export/result/status/permission/context/cleanup disagreement with the independent oracle, any raw pointer crossing the Worker boundary, or any Linux inference.

**Detailed protocol:** [`EXP-012-windows-node-ffi-cuda-smoke.md`](EXP-012-windows-node-ffi-cuda-smoke.md).
