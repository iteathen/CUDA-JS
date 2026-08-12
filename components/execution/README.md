# Bounded module launch and completion

The internal `runtime.execution` component implements the accepted CJS-F5W control-plane contract and bounded follow-up SPEC-0011. It copies and identities bounded PTX/cubin, validates exact function parameter schemas, packs naturally aligned launch parameters, leases every device-memory argument through terminal completion, and polls one private event without blocking the application loop.

The closed public parameter-kind set is `device-memory`, `u32`, `u64`, `i32`, and `f32`. `u64` requires an exact JavaScript `bigint`; `i32` and `u32` use bounded integer `number` values; `f32` accepts finite numbers that do not overflow binary32. The packer uses 8-byte alignment for device pointers/`u64` and 4-byte alignment for the 32-bit kinds, with deterministic zero padding. It exposes no arbitrary C type or raw parameter-buffer contract.

The component has no direct Driver, FFI, or platform dependency. The DriverActor injects an exact Windows CUDA adapter or a portable orchestration mock. The mock proves policy, packing, lifetime, polling, timeout, and teardown behavior only; it does not interpret PTX or establish native Linux CUDA support.

Run `npm run f5:unit` for owner tests and `npm run f5:portable` for the platform-neutral integrated capsule.
