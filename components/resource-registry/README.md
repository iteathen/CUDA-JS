# Opaque resource registry

**Status:** Accepted F3 internal component

This component owns runtime-scoped resource identity and lifecycle. It has no CUDA, FFI, Worker, platform, or consumer dependency.

The registry keeps values and disposer functions private while issuing frozen structured tokens containing runtime, epoch, kind, slot, generation, nonce, and issuance state. It rejects malformed, forged, wrong-runtime, wrong-kind, dead-epoch, stale, closing, closed, and orphaned capabilities before returning a private value.

Parents cannot close before children, and resources cannot close while leased. Registry-owned cascade teardown closes children before parents. Unexpected owner loss marks inaccessible resources orphaned without calling their disposers or claiming native cleanup.

The supported component surface is [`index.mjs`](index.mjs). Owner-local conformance is under [`test/`](test/).
