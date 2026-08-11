# Conformance

Independent generic runtime conformance capsules.

[`f3/`](f3/README.md) owns the accepted DriverActor/resource lifecycle capsule. [`f4/`](f4/README.md) owns bounded device-memory evidence. [`f5/`](f5/README.md) owns bounded PTX module/launch/completion evidence. [`f6/`](f6/README.md) owns compiler/linker/cache and PTX/cubin handoff evidence. [`f7/`](f7/README.md) owns platform hardening. [`f8/`](f8/README.md) owns package contents, clean install/uninstall, public-facade, independent-consumer, multi-instance, native Windows execution, and Linux readiness evidence. [`f9/`](f9/README.md) owns the manifest-verified CUDA CCCL profile and generic public atomic-publication capability. [`node/`](node/README.md) owns the exact Node version matrix and substrate probes. [`hardware/`](hardware/README.md) composes runtime owners into exact-profile qualification records, fail-closed extension axes, read-only Hyper-V readiness, and the generated public hardware list. All retain native Linux engineering handoffs and run portable logic without a Linux Driver; their native CUDA claims are currently Windows-only.

Initial oracle order:

1. native C ABI/layout probes from pinned official headers;
2. direct C/CUDA reference behavior for Tier-0 Driver calls;
3. Node FFI differential results;
4. DriverActor/resource lifecycle and cleanup;
5. real memory/module/launch/completion/error capsules;
6. mock lifecycle/orchestration only within its declared limits.

Mocks, cross-compilation, and documentation checks cannot prove native CUDA support or performance.
