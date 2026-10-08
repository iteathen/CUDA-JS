# SPEC-0020 child: Device-owned tail continuation

**Status:** Proposal

**Implementation authorization:** Explicit current project-owner instruction.

**Qualification:** Candidate evidence only; not integrated or support-qualified.

This additive kernel-only profile preserves the accepted finite semantic DAG and
its existing 32-node, 64-edge and 64-binding ceilings. It supplies one device-owned
continuation mechanism and no search, tensor, model or application scheduling.

`runtime.submitDeviceContinuation({nodes, bindings, continuationNode, after?})`
returns the existing opaque SPEC-0016 operation. The finite immutable body DAG has
one final controller with grid/block 1x1x1 which depends directly or transitively
on every other node, preserving the existing eight-predecessor-per-node bound. Its
closed Device-JS helper `gpu.execution.tailSelf()` queues at most one tail of the
current graph. The helper is kernel-only, void, zero-argument, and may appear once
outside loops in a controller. Continue/stop decisions belong to consumer code.

Known continuation kernels reject ordinary submissions before native work. Raw
graph handles, node/stream handles, native flags, pointers and arbitrary native
controls remain private. Only exact qualified device/provider profiles may use
the mechanism; unsupported profiles reject before graph mutation.

DriverActor owns graph definition/executable, stable packed arguments and every
native call. CompilerActor owns any required trusted headers/device-runtime
archive, provider identity and linking. Maintained source is JavaScript/Device-JS;
private compiler translation and NVIDIA implementation remain opaque.

One operation leases its graph/functions/modules/bindings through the entire tail
chain. Its event records after the initial host graph launch and terminalizes only
after all tails finish. One external graph launch drives the complete chain; host
status/wait only observe terminality. Pending close is busy, never cancellation.
The profile also admits the existing opaque SPEC-0014 mailbox lanes as named
bindings, with one mailbox operation lease through the whole tail chain, exact
direction/generation validation and system-scope acquire/release helper semantics.
Pending mailbox reset/close remains busy. Consumer cooperative stop protocols and
publication meaning remain outside CUDA-JS. Ordinary prepared DAG mailbox
admission remains unchanged.

Construction rollback releases only proved-owned resources. Partial submission
or event provenance loss requires restart and retained unproved leases. Tail
failure must surface as operation failure, never completed truncated execution.
Graph executable/definition cleanup precedes dependent function/module release;
failed cleanup remains unproved. Existing error/health/orphan semantics apply.

Required evidence: closed helper/controller admission; portable lifetime/error
and cleanup cases; compiler/provider identity; compiler-parsed pinned-header ABI
facts; finite physical counter and dependent-body equivalence; one-host-launch
mechanism accounting; whole-chain event terminality; installed public package and
graceful cleanup. WDDM duration remains unqualified until exact bounded soak.
Bounded kernels alone do not establish watchdog safety. No watchdog changes,
unbounded kernel, consumer native implementation or CPU continuation fallback.
