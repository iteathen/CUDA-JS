# CUDA DriverActor

**Status:** Accepted F4W internal experimental component

This component turns the accepted Windows bootstrap into a bounded asynchronous runtime owner. One Worker opens the canonical Windows CUDA Driver, selects device zero, creates one private context, owns all raw values in an opaque registry, and closes device allocations before the context and library.

The component surface is [`index.mjs`](index.mjs):

- `openDriverRuntime()` opens the exact Windows x64 Node 26.7.0 profile;
- `runtime.describe()` returns bounded Driver/device metadata, health, inventory, and an opaque context token;
- `runtime.contextStatus(token)` verifies on the owning Worker that the same private context remains current;
- `runtime.allocateDevice`, `memoryStatus`, `writeDevice`, `readDevice`, and `releaseMemory` provide the bounded synchronous copied-byte contract from SPEC-0004;
- `runtime.close()` performs idempotent graceful teardown and returns a terminal report.

Callers cannot provide a library, symbol, signature, pointer, device ordinal, context flags, or operation name. Tokens contain no native address. Any unexpected Worker exit invalidates the runtime epoch, reports the last known resources as inaccessible, and requires restart without claiming cleanup.

[`testing.mjs`](testing.mjs) exposes the platform-neutral lifecycle mock and test-only fault controls. Mock success proves protocol/resource behavior only. Native Linux Driver support remains independently gated.

The governing contracts are [`SPEC-0003`](../../docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md) and [`SPEC-0004`](../../docs/specs/SPEC-0004-device-memory-foundation.md).
