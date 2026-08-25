# Bounded asynchronous host transfer

`runtime.host-memory-transfer` owns the accepted SPEC-0019 internal pinned-staging profile. It composes the memory range/lease port with the SPEC-0018 operation scheduler and does not own a second operation lifecycle.

The profile has exactly two lazily allocated DriverActor-owned page-locked blocks, each `maxTransferBytes` bytes. H2D snapshots input before native ownership, D2H exposes copied bytes only in a terminal operation result, and D2D leases both ranges. Exhaustion is typed backpressure; blocks are wiped before reuse and freed during dependency-safe runtime teardown. No public native pointer, registered caller buffer, mapped memory, chunk queue, or raw stream/event is exposed.

Run `npm run f5:unit`, `npm run f5:portable`, and the exact F5/F8 Windows native capsules.
