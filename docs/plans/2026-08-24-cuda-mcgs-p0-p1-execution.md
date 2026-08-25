# CUDA-MCGS P0/P1 Execution Program

**Status:** Informational

**Operational state:** Active

**Started:** 2026-08-24T17:17:50.395-07:00 (`2026-08-25T00:17:50.395Z`)

**Integration owner:** CUDA-JS maintainer executing `agent/cuda-mcgs-p0-p1`

**Frozen input:** `origin/main` `1318baaeb18f613bdda5d281a733a8a973f3a8a3`

## Objective and authority

Complete the CUDA-JS issues labeled `cuda-mcgs:p0` and `cuda-mcgs:p1` before broad CUDA-MCGS implementation begins. The project-owner instruction authorizes the dependency-ready implementation and evidence program, but it does not authorize false native claims, consumer-specific CUDA-JS semantics, raw native authority, weakened tests, or fabricated cross-repository evidence.

The exact CUDA-MCGS compatible-pair closure in issue #32 necessarily consumes a bounded CUDA-MCGS artifact. That artifact is an integration input, not authorization for broader CUDA-MCGS production work.

## Global invariants

- CUDA-JS remains consumer-neutral and coherent if CUDA-MCGS is removed.
- Each LEGO component owns one contract and complete resource lifecycle; composition owns wiring.
- SPEC-0016 remains the sole operation submit/status/wait/close and terminalization owner.
- DriverActor owns private contexts, streams, events, native memory, and context-affine calls.
- ResourceRegistry owns opaque identity, generations, dependencies, leases, and terminal disposition.
- Memory owns placement/range/visibility/coherence contracts; execution owns operation scheduling and hazards.
- Device-JS owns its closed helper grammar and deterministic CUDA lowering; it never exposes CUDA syntax or enums.
- Every finite capacity, queue, stream, operation, transfer, mailbox, diagnostic, and artifact is bounded and identity-bearing.
- Exact native claims name the exact revision, Node/OS/ABI, Driver/toolkit/providers, GPU, command, oracle, and cleanup result.

## Dependency and focus-branch map

### `MCGS-P0-EVIDENCE-0016`

**Owner:** existing compiler, Device-JS, execution, and native conformance owners.

**Issues:** #35, #43, #51.

**Outcome:** reconcile the retained Windows qualification candidate onto the current LEGO-enforced baseline; prove typed RDC, source-only Device-JS, delayed submission/completion, deferred failure, and terminal cleanup on the exact current head.

**Acceptance:** focused portable/native capsules and repository validation pass; candidate artifacts are current-head evidence; issue state and durable status agree.

**Falsifier:** retained changes conflict semantically with current owners, or current-head native evidence does not reproduce.

**Rollback/safe stop:** retain the candidate commits as historical evidence and repair only the authoritative current owner; do not widen execution.

### `MCGS-P0-ATOMIC-0022`

**Owner:** `runtime.device-js`.

**Issue:** #87.

**Depends on:** accepted child scope derived from SPEC-0022; trusted CCCL/compiler path.

**Outcome:** add the smallest explicit scoped atomic load/store helper family required for independently meaningful device observations, with no snapshot guarantee.

**Acceptance:** exact helper/type/order/scope contract, pre-compiler rejection, deterministic lowering/identity, portable tests, independent Windows CUDA oracle, and balanced lifecycle.

**Falsifier:** semantics require raw CUDA escape, silently vary by profile, or cannot be independently qualified.

**Rollback:** preserve accepted SPEC-0013 add/CAS surface unchanged.

### `MCGS-P1-SCHED-0018`

**Owner:** `runtime.execution`, consuming DriverActor and ResourceRegistry public contracts.

**Issue:** #40.

**Depends on:** `MCGS-P0-EVIDENCE-0016`, `MCGS-P0-ATOMIC-0022`.

**Outcome:** finite private multi-operation scheduling, beginning with one long-lived producer and one short atomic observer over explicitly concurrency-safe shared memory.

**Acceptance:** accepted SPEC-0018, finite admission/backpressure, explicit dependency/hazard model, per-operation leases and failure attribution, native same/cross-stream oracle, terminal teardown, and no raw stream/event surface.

**Falsifier:** correctness depends on physical overlap, lifecycle duplicates SPEC-0016, or failure/resource ownership cannot remain attributable.

**Rollback:** preserve the accepted one-operation profile and remove the widened capability projection.

### `MCGS-P1-TRANSFER-0019`

**Owner:** memory placement/host-buffer component plus execution operation producer adapter.

**Issue:** #86.

**Depends on:** `MCGS-P1-SCHED-0018`.

**Outcome:** bounded pinned/registered host buffers and asynchronous transfer operations with explicit placement, snapshot, dependency, pressure, and cleanup semantics.

**Acceptance:** accepted SPEC-0019, independent native ABI/copy oracle, pageable baseline unchanged, bounded ring/backpressure tests, operation leases, and terminal unregister/free.

**Falsifier:** JavaScript/native buffer lifetime cannot be made exact or overlap requires raw pointer/stream exposure.

**Rollback:** preserve synchronous copied device-memory transfers.

### `MCGS-P1-SIDEBAND-0014`

**Owner:** sideband composition component consuming accepted operation and host-memory contracts.

**Issue:** #38.

**Depends on:** `MCGS-P1-SCHED-0018`, `MCGS-P1-TRANSFER-0019`.

**Outcome:** finite publication mailboxes for bounded host/device control and observation while a long-lived opaque operation is pending.

**Acceptance:** accepted SPEC-0014 revision, generation/single-writer/publication contract, exact system-scope native oracle, lifecycle leases, stale/failure/watchdog cases, and terminal cleanup.

**Falsifier:** mapped-memory coherence cannot be qualified on the selected profile or the capability requires a second operation lifecycle.

**Rollback:** retain EXP-013 as non-production evidence only.

### `MCGS-P0-PAIR-0009C`

**Owner:** cross-repository compatibility integration; no CUDA-JS component owns CUDA-MCGS semantics.

**Issue:** #32.

**Depends on:** all required P0/P1 capability profiles and one frozen bounded CUDA-MCGS package/artifact.

**Outcome:** exact compatible-pair identity, semantic-oracle parity, device-owned progress after ignition, and terminal cross-repository cleanup.

**Falsifier:** CUDA-JS requires consumer semantics/private coupling or the pair requires CPU-produced active-search intermediates.

**Rollback:** keep both repositories independently valid and leave the exact pair unqualified.

## Execution and reporting

Only one focus branch is active at a time. Each coherent operation is inspected immediately. Progress is reported to the owner at least every 15 minutes. Start/end timestamps, exact revisions, tests, native environment, generated state, issue/PR disposition, and cleanup are recorded before closure.

## Final closure

Completion requires:

- every P0/P1 issue closed with its implementation and qualification dimensions stated honestly;
- exact integrated head and remote read-back;
- complete portable and selected Windows native validation;
- no abandoned Worker, Driver/compiler resource, build artifact, cache, package, worktree, branch, PR, or temporary evidence;
- protected pre-existing work remains untouched or has an explicit retained disposition;
- this record contains the end timestamp and final evidence summary.
