# Execution Capability Continuation

**Status:** Proposal

**Date:** 2026-08-12

**Input baseline:** protected `main` `fe9ed78939d3876790291421cec367fde58a8310`.

## Purpose

Track future generic CUDA-JS execution capabilities that are **not implemented production behavior on the baseline**. Each capability must consume existing accepted ownership rather than redefine it.

## EX-SIDEBAND — issue #38 / proposed SPEC-0014

Current state:

- SPEC-0016 now provides the generic opaque operation lifecycle that issue #38 originally lacked;
- proposed SPEC-0014 and EXP-013 provide bounded portable publication-mailbox evidence;
- no production mapped/pinned mailbox or long-lived sideband mechanism is accepted or natively qualified.

Remaining sequence:

1. reassess issue #38 against current SPEC-0016 rather than its original terminal-`launch()` assumptions;
2. decide the smallest consumer-neutral publication mechanism and exact host/device/system-scope synchronization semantics;
3. amend/replace SPEC-0014 as needed and accept a bounded production contract before implementation;
4. implement only the selected generic mailbox/control/observation ownership and lifecycle;
5. prove generation/stale ordering, pressure, security, operation interaction, device loss/watchdog, close/restart truth, and exact native Windows cleanup;
6. preserve the bounded terminal and ordinary opaque-operation profiles unchanged.

CUDA-MCGS/reroot/search/ranking meaning is forbidden here.

## EX-MULTISTREAM — issue #40

Current state: architecturally planned, not implemented or qualified.

Dependencies:

- SPEC-0016 lifecycle remains the sole operation owner;
- exact native SPEC-0016 evidence must make the first lifecycle trustworthy before widening concurrency;
- a separate bounded multi-stream specification must define stream ownership, admission/backpressure, ordering, lease interaction, errors, close, and compatibility.

The first multi-stream slice must expose no raw public stream/event handles and must not manufacture a second operation abstraction.

## EX-GRAPH-COOPERATIVE — issue #41 and later measured needs

CUDA Graphs, cooperative launch, persistent scheduling, or other mechanisms remain research/qualification candidates. They are selected only when a measured consumer/runtime requirement justifies them and they can preserve the existing public resource/operation contracts.

A mechanism experiment does not make it universal or production-supported.

## Optional future execution families

Async copy/compute overlap, specialized memory types, callback completion, process isolation, or a generic native/JIT gap backend each require their own triggered assessment and accepted contract. Do not scaffold them “for later.”

## Acceptance discipline

For every execution expansion:

- define the existing owner it consumes and the exact contract it adds;
- keep the application event loop nonblocking;
- preserve private native handles and context affinity;
- state finite queue/resource plans and deterministic backpressure;
- keep failure provenance and cleanup truthful;
- use exact native evidence before support/performance claims;
- run the existing F3–F9 regressions and capability-specific falsifiers.
