# Prepared operation DAG semantics

`runtime.prepared-execution` is the pure semantic owner for the accepted SPEC-0020 prepared-kernel DAG baseline and bounded SPEC-0031 cuBLASLt child. It canonicalizes a finite immutable topology, exact executable/plan/launch/access facts, named binding kinds, execution-profile facts, and deterministic identity. It owns no resource token, runtime state, native submission, stream, event, CUDA Graph object, or operation lifecycle.

The profile remains narrow and reusable: one through 32 kernel or accepted cuBLASLt f32 nodes, at most 64 dependency edges, and at most 64 named bindings. Every kernel device-memory parameter has one explicit access declaration; cuBLASLt accesses are derived from its fixed plan. Ordinary conflicts must be ordered by a path when concrete bindings alias; compatible kernel atomic access may remain unordered under the existing scheduler contract. `runtime.execution` owns that concrete validation, all leases, one-command submission, one final completion event, and the single SPEC-0016 operation returned for the whole DAG. Kernel-only normalized identity is unchanged; a mixed DAG selects the additive SPEC-0031 contract.

CUDA Graph realization and transfer/mailbox/other-library node families remain separate successor profiles. Portable normalization and mock orchestration do not qualify native behavior or performance.

Run the component test with exact Node 26.7.0:

```text
node --test components/prepared-execution/test/prepared-operation-dag.test.mjs
```
