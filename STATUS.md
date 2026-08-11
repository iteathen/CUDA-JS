# CUDA-JS Status

**Status:** Informational

**Updated:** 2026-08-10

## Current phase

The private `iteathen/CUDA-JS` repository exists and now carries the reviewed documentation foundation. The foundation was restored from verified artifact `CJS-FND-77090a9`, then reconciled with the current repository state. No production runtime implementation, native fixture, generated binding, experiment harness, benchmark implementation, or package has been accepted.

The project owner has explicitly held the repository in a **documentation-only phase**. Experiment protocols and dependency-ready boundaries remain planning material; they do not authorize `EXP-000`, `EXP-001`, schema import, ABI probes, Node FFI code, CUDA Driver work, or any other implementation.

## Accepted

- CUDA-JS is an independent generic runtime repository; UMCGS is a public-contract consumer.
- Version zero uses Node 26 built-in FFI as its private host-call substrate and ships no CUDA-JS project addon.
- Custom AsmJit/register-stub work is not the baseline; it is retained only as a measured-gap experiment.
- Exact generated ABI facts and curated semantic overlays are separate owners; unknown public semantics fail closed.
- Node FFI named-symbol binding is the v0 invocation mechanism; `cuGetProcAddress` verifies version/status/semantics but arbitrary returned-pointer invocation is not assumed.
- One DriverActor Worker owns one private CUDA context and all raw resources by default.
- A separate CompilerActor owns NVRTC/nvJitLink and device-artifact cache activity; the default Linux NVRTC profile disables process-wide stack-limit modification, with child-process compilation reserved for providers that cannot meet the in-process side-effect contract.
- JavaScript receives opaque tokens and bounded values, not unrestricted native/device pointers or arbitrary schemas.
- Memory placement, CPU/GPU visibility, mapping, coherence, synchronization, migration, and lifetime are explicit per capability.
- Completion is actor-side event/stream observation; CUDA host callbacks do not invoke JavaScript in v0.
- Immediate/deferred/recoverable/suspect/poisoned/restart-required failures are distinct.
- Strict JIT support is claimed only after exact-profile qualification; generic fallback is permitted only in declared cold/bootstrap profiles.
- Native mocks do not prove CUDA correctness, ordering, performance, or consumer semantics.

## Current support target

1. Linux x86-64, exact Node 26 profile, current NVIDIA Driver/CUDA 13.3 schema.
2. Windows x86-64 after the Linux vertical slice.
3. Linux ARM64 SBSA after x86-64 contracts stabilize.
4. WSL2 as a Linux-compatibility profile with explicit diagnostics.

Node 22/24, macOS, 32-bit hosts, arbitrary foreign contexts, unrestricted callbacks, graphs/VMM/external interop, and broad CUDA Runtime API coverage are outside v0.

## Immediate next boundary

- verify and maintain the complete foundational-document set and ownership registry;
- reconcile stale local-bootstrap/publication language with the actual private GitHub repository;
- keep architecture, specifications, research, plan, experiment protocols, status, and next step internally consistent;
- keep UMCGS interoperability public-contract-only and free of private CUDA-JS implementation details;
- do not execute experiments or add implementation until the project owner explicitly advances the phase.

## Open gates

- branch protection and durable remote read-back policy for future foundational changes;
- exact Node 26 FFI support policy and Fast FFI qualification mechanism;
- Clang importer, Runtime IR, semantic overlay, and native ABI probes;
- named-symbol/`cuGetProcAddress` compatibility rule;
- DriverActor affinity, resource registry, errors/health, and teardown;
- memory, launch/completion, compiler/linker/cache, platform, packaging, and second-consumer experiments;
- official CUDA header redistribution/provenance decision;
- UMCGS public interop contract after CUDA-JS public contracts stabilize.

## Environment and evidence limitation

No Node FFI, Fast FFI, CUDA ABI, context, memory, launch, completion, compiler, platform, or performance result is claimed. Those claims require exact future experiment authorization and exact-profile native evidence. Documentation/static validation is the only active validation class in this phase.
