# EXP-013: publication-mailbox model

This CUDA-free experiment tests bounded atomic publication lanes, one-writer direction, generation checks, and leases while a Node Worker makes independent progress.

Its `DetachedMockOperation` is test scaffolding. The accepted production operation lifecycle belongs to SPEC-0016; the experiment does not provide a competing runtime API.

The model covers host/device-direction checks, active observation and control, stale generations, busy close/reset while leased, and release after completion. It does not load CUDA or establish native mapping, memory ordering, or performance.

Use the [mailbox specification](../../docs/specs/SPEC-0014-long-lived-sideband.md) for the production contract and [the experiment files](./) for its implementation. [Current status](../../STATUS.md) identifies remaining native work.
