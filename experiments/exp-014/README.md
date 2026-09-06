# EXP-014: operation-lifecycle model

This retained CUDA-free experiment tests asynchronous submission and later observation through one serialized owner while an independent mock Worker progresses.

It covers bounded admission, resource leases, pending close, terminalization, timeout, failure, and orphan accounting. The model informed the accepted SPEC-0016 lifecycle; it is not a CUDA runtime.

## Run

With repository dependencies installed, run from the repository root:

```bash
npm run exp:014
```

Use the repository's exact Node qualification profile. A pass establishes only the JavaScript model's behavior, not native CUDA ordering, overlap, cleanup, or performance.

- [Experiment protocol](../EXP-014-operation-lifecycle.md).
- [Historical results](EVIDENCE_HISTORY.md).
- [Current operation contract](../../docs/specs/SPEC-0016-operation-lifecycle.md).
