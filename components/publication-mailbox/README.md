# Publication mailbox

`runtime.publication-mailbox` owns accepted SPEC-0014 named u32 lanes over one private registered/mapped `SharedArrayBuffer`. It owns schema, generation, strong backing-store retention, single-operation leasing, private device-lane aliases, reset, unregister, and cleanup truth.

The public facade exposes only an opaque mailbox with direction-checked synchronous `store`/`load` methods. Device-JS owns the separate system-scope acquire/release lowering. Execution owns operation terminalization and retains the mailbox lease through the existing SPEC-0016 lifecycle.

The first profile has at most 64 lanes, one writer per lane, no RMW, no public storage or pointers, no second operation lifecycle, and no multi-device or performance claim.
