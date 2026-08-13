# CUDA DriverActor

**Status:** Accepted F5W internal experimental component

This component turns the accepted Windows bootstrap into a bounded asynchronous runtime owner. One Worker opens the canonical Windows CUDA Driver, selects device zero, creates one private context, owns all raw values in an opaque registry, and closes proved-terminal operations, modules, streams, and device allocations before the context and library.

The component surface is [`index.mjs`](index.mjs):

- `openDriverRuntime()` opens the Windows x64 backend on Node 26.1.0 or later; exact Node 26.7.0 remains the qualified evidence baseline while other operational releases remain testing-unconfirmed;
- `runtime.describe()` returns bounded Driver/device metadata, health, inventory, and an opaque context token;
- `runtime.contextStatus(token)` verifies on the owning Worker that the same private context remains current;
- `runtime.allocateDevice`, `memoryStatus`, `writeDevice`, `readDevice`, and `releaseMemory` provide the bounded synchronous copied-byte contract from SPEC-0004;
- `runtime.loadModule`, `moduleStatus`, `getFunction`, `functionStatus`, `releaseFunction`, and `releaseModule` provide the PTX/cubin and declared-schema contracts from SPEC-0005/0006;
- `runtime.submit`, `operationStatus`, `waitOperation`, and `releaseOperation` implement the SPEC-0016 one-pending-operation lifecycle;
- legacy `runtime.launch()` is host-side submit + repeated short status turns and preserves the SPEC-0005 terminal convenience shape without monopolizing the DriverActor command queue;
- `runtime.close()` performs bounded pending-operation terminal observation before dependency teardown and refuses a graceful cleanup claim when terminality remains unproved.

The Worker command protocol contains short submit/status/release/legacy-timeout turns; it does not expose a long-running `execution.launch` polling command. While one operation is pending, the execution owner admits only the exact operation-safe allowlist and runtime close. Callers cannot provide a library, symbol, signature, pointer, device ordinal, context flags, stream/event handle, or arbitrary operation name. Tokens contain no native address.

Any unexpected Worker exit or unproved operation terminality invalidates the runtime epoch, reports retained resources as inaccessible/orphaned where applicable, and requires restart without claiming cleanup.

[`testing.mjs`](testing.mjs) exposes the platform-neutral lifecycle mock and test-only fault controls. Mock success proves protocol/resource behavior only. Native SPEC-0016 and native Linux Driver support remain independently gated.

The governing contracts are [`SPEC-0003`](../../docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md), [`SPEC-0004`](../../docs/specs/SPEC-0004-device-memory-foundation.md), [`SPEC-0005`](../../docs/specs/SPEC-0005-module-launch-completion.md), and [`SPEC-0016`](../../docs/specs/SPEC-0016-operation-lifecycle.md).
