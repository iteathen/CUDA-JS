# Bounded device memory

The internal `runtime.memory` component implements the accepted CJS-F4 contract. It validates one exact policy, accounts for reserved device bytes, validates every byte range before backend invocation, stores private allocations behind opaque registry capabilities, fences transfers with leases, and releases children before their context.

The component has no direct CUDA, FFI, Worker, or platform dependency. The DriverActor injects either the exact Windows CUDA adapter or a portable owned-byte mock. Only copied `Uint8Array` values cross the actor boundary; native addresses and host staging storage remain private.

Run `npm run f4:unit` for owner tests and `npm run f4:portable` for the platform-neutral integrated capsule.
