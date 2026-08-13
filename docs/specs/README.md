# Specifications

**Status:** Informational

- [`SPEC-0000-runtime-contract-map.md`](SPEC-0000-runtime-contract-map.md) — proposal map of version-zero contract families, dependency order, hard requirements, and exclusions.
- [`SPEC-0001-cuda-schema-compiler.md`](SPEC-0001-cuda-schema-compiler.md) — accepted F1B contract for pinned header facts, reviewed Tier-0 semantics, normalized Runtime IR, generated products, and Linux x86-64 native ABI probes.
- [`SPEC-0002-windows-driver-bootstrap.md`](SPEC-0002-windows-driver-bootstrap.md) — accepted Windows-only F2W contract for canonical Driver discovery, generated bindings, procedure verification, independent MSVC parity, permissions, private context lifecycle, and cleanup.
- [`SPEC-0003-driver-actor-resource-lifecycle.md`](SPEC-0003-driver-actor-resource-lifecycle.md) — accepted Windows-first F3 contract for the async DriverActor, opaque registry, health/error state, graceful teardown, unexpected-loss behavior, and platform-neutral lifecycle mock.
- [`SPEC-0004-device-memory-foundation.md`](SPEC-0004-device-memory-foundation.md) — accepted Windows-first F4 contract for bounded device allocations, copied host transfers, quotas, leases, release, teardown, and portable memory lifecycle validation.
- [`SPEC-0005-module-launch-completion.md`](SPEC-0005-module-launch-completion.md) — accepted Windows-first F5 contract for bounded PTX modules, declared functions, packed launches, one private stream, event-polled completion, deferred-error attribution, and portable execution lifecycle validation.
- [`SPEC-0006-compiler-linker-cache.md`](SPEC-0006-compiler-linker-cache.md) — accepted Windows-first F6 contract for a separate CompilerActor, canonical NVRTC/nvJitLink providers, typed options, PTX/cubin artifacts, validated content-addressed cache, and DriverActor handoff.
- [`SPEC-0007-windows-platform-hardening.md`](SPEC-0007-windows-platform-hardening.md) — accepted Windows-first F7 contract for sanitized platform diagnostics, WDDM/TCC/watchdog facts, permission profiles, deterministic failure/property partitions, and repeated lifecycle stress with retained Linux/WSL handoffs.
- [`SPEC-0008-package-public-facade.md`](SPEC-0008-package-public-facade.md) — accepted Windows-first F8 contract for the no-addon package, safe public facade, compatibility policy, independent consumer, install/uninstall evidence, and portable Linux handoff.
- [`SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md`](SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md) — accepted bounded F9 contract for a manifest-verified CUDA CCCL virtual-header profile and generic atomic-publication capability, without consumer semantics.
- [`SPEC-0010-relocatable-device-code.md`](SPEC-0010-relocatable-device-code.md) — accepted bounded CompilerActor follow-up for typed NVRTC relocatable-device-code compilation and linkable PTX metadata while preserving the existing default compile/link path.
- [`SPEC-0011-scalar-kernel-arguments.md`](SPEC-0011-scalar-kernel-arguments.md) — accepted bounded execution follow-up adding closed `u64`, `i32`, and `f32` packed scalar argument kinds while preserving legacy launch behavior.
- [`SPEC-0012-device-lto.md`](SPEC-0012-device-lto.md) — accepted bounded CompilerActor follow-up adding typed LTO-IR compile output and homogeneous device-LTO linking without exposing raw nvJitLink controls.
- [`SPEC-0015-execution-scope-status-clarification.md`](SPEC-0015-execution-scope-status-clarification.md) — accepted clarification that SPEC-0005 single-flight exclusions are F5 scope/qualification boundaries, not architectural rejection; future submission/completion and bounded multi-stream capability families remain separately gated.

Numbers 0013 and 0014 are intentionally reserved by active, not-yet-integrated Device-JS and long-lived-sideband work. Their absence from this `main` index is not an authorization or rejection signal.

No production implementation is authorized merely because a function appears in generated schema or a capability is architecturally planned. Each public component requires accepted ownership, lifecycle, safety, compatibility, conformance, and experiment evidence.
