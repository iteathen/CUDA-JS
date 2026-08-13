# Opaque resource registry

**Status:** Accepted F3 internal component

This component owns runtime-scoped resource identity and lifecycle. It has no CUDA, FFI, Worker, platform, or consumer dependency.

The registry keeps values and disposer functions private while issuing frozen structured tokens containing runtime, epoch, kind, slot, generation, nonce, and issuance state. It rejects malformed, forged, wrong-runtime, wrong-kind, dead-epoch, stale, closing, closed, and orphaned capabilities before returning a private value.

Parents cannot close before children, and resources cannot close while leased. Registry-owned cascade teardown closes children before parents. Unexpected owner loss marks inaccessible resources orphaned without calling their disposers or claiming native cleanup.

If a disposer fails, the registry stores one immutable, sanitized `RESOURCE_DISPOSE_FAILED` record while preserving an accepted structured cause's category, observation operation, and health transition. Unstructured disposer exceptions are conservatively `restart-required`. Repeated close returns the stored failure without retrying native work, including after the epoch is marked dead once the exact runtime, epoch, kind, generation, and nonce have been revalidated. Cascades retain bounded failure evidence and mark resources skipped after poisoned or unproved cleanup as orphaned/unproved.

Inventory reports always retain exact totals in `resourceCount` and full state totals in `counts`, while the resource-record array is bounded and `resourcesTruncated` reports its omitted-record count. When truncation is necessary, records are selected deterministically, with failed and orphaned resources retained before ordinary live or closed resources. Cascade disposition/error/skip arrays are likewise bounded with total and truncation fields so large ownership graphs remain inside the DriverActor public-record envelope without being mistaken for complete record lists; the first unsafe failure remains retained even when it occurs beyond the ordinary error-record cap.

The supported component surface is [`index.mjs`](index.mjs). Owner-local conformance is under [`test/`](test/).
