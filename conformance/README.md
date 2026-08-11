# Conformance

Independent generic runtime conformance capsules.

Initial oracle order:

1. native C ABI/layout probes from pinned official headers;
2. direct C/CUDA reference behavior for Tier-0 Driver calls;
3. Node FFI differential results;
4. DriverActor/resource lifecycle and cleanup;
5. real memory/module/launch/completion/error capsules;
6. mock lifecycle/orchestration only within its declared limits.

Mocks, cross-compilation, and documentation checks cannot prove native CUDA support or performance.
