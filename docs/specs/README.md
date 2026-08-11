# Specifications

**Status:** Informational

- [`SPEC-0000-runtime-contract-map.md`](SPEC-0000-runtime-contract-map.md) — proposal map of version-zero contract families, dependency order, hard requirements, and exclusions.
- [`SPEC-0001-cuda-schema-compiler.md`](SPEC-0001-cuda-schema-compiler.md) — accepted F1B contract for pinned header facts, reviewed Tier-0 semantics, normalized Runtime IR, generated products, and Linux x86-64 native ABI probes.
- [`SPEC-0002-windows-driver-bootstrap.md`](SPEC-0002-windows-driver-bootstrap.md) — accepted Windows-only F2W contract for canonical Driver discovery, generated bindings, procedure verification, independent MSVC parity, permissions, private context lifecycle, and cleanup.
- [`SPEC-0003-driver-actor-resource-lifecycle.md`](SPEC-0003-driver-actor-resource-lifecycle.md) — accepted Windows-first F3 contract for the async DriverActor, opaque registry, health/error state, graceful teardown, unexpected-loss behavior, and platform-neutral lifecycle mock.
- [`SPEC-0004-device-memory-foundation.md`](SPEC-0004-device-memory-foundation.md) — accepted Windows-first F4 contract for bounded device allocations, copied host transfers, quotas, leases, release, teardown, and portable memory lifecycle validation.
- [`SPEC-0005-module-launch-completion.md`](SPEC-0005-module-launch-completion.md) — accepted Windows-first F5 contract for bounded PTX modules, declared functions, packed launches, one private stream, event-polled completion, deferred-error attribution, and portable execution lifecycle validation.
- [`SPEC-0006-compiler-linker-cache.md`](SPEC-0006-compiler-linker-cache.md) — accepted Windows-first F6 contract for a separate CompilerActor, canonical NVRTC/nvJitLink providers, typed options, PTX/cubin artifacts, validated content-addressed cache, and DriverActor handoff.

No production implementation is authorized merely because a function appears in generated schema. Each public component requires accepted ownership, lifecycle, safety, compatibility, conformance, and experiment evidence.
