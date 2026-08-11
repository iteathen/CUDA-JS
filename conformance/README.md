# Conformance

Independent generic runtime conformance capsules.

[`f3/`](f3/README.md) owns the accepted DriverActor/resource lifecycle capsule. [`f4/`](f4/README.md) owns bounded device-memory evidence and the retained native Linux engineering handoff. Both run portable logic on Windows and native Linux; their native CUDA claim is currently Windows-only.

Initial oracle order:

1. native C ABI/layout probes from pinned official headers;
2. direct C/CUDA reference behavior for Tier-0 Driver calls;
3. Node FFI differential results;
4. DriverActor/resource lifecycle and cleanup;
5. real memory/module/launch/completion/error capsules;
6. mock lifecycle/orchestration only within its declared limits.

Mocks, cross-compilation, and documentation checks cannot prove native CUDA support or performance.
