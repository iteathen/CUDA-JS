# Bounded module launch and completion

The internal `runtime.execution` component implements the accepted CJS-F5W control-plane contract. It copies and identities bounded PTX, validates exact function parameter schemas, packs naturally aligned launch parameters, leases every device-memory argument through terminal completion, and polls one private event without blocking the application loop.

The component has no direct Driver, FFI, or platform dependency. The DriverActor injects an exact Windows CUDA adapter or a portable orchestration mock. The mock proves policy, packing, lifetime, polling, timeout, and teardown behavior only; it does not interpret PTX or establish native Linux CUDA support.

Run `npm run f5:unit` for owner tests and `npm run f5:portable` for the platform-neutral integrated capsule.
