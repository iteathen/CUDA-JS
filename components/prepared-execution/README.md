# Prepared operation DAG semantics

`runtime.prepared-execution` is the pure semantic owner for the accepted SPEC-0020 prepared-kernel DAG baseline. It canonicalizes a finite immutable topology, exact executable/launch/access facts, named binding kinds, execution-profile facts, and deterministic identity. It owns no resource token, runtime state, native submission, stream, event, CUDA Graph object, or operation lifecycle.

The first profile is intentionally narrow and reusable: one through 32 kernel nodes, at most 64 dependency edges, and at most 64 named bindings. Every device-memory parameter has one explicit access declaration. Ordinary conflicts must be ordered by a path when concrete bindings alias; compatible atomic access may remain unordered under the existing scheduler contract. `runtime.execution` owns that concrete validation, all leases, one-command submission, one final completion event, and the single SPEC-0016 operation returned for the whole DAG.

CUDA Graph realization and transfer/library/mailbox node families remain separate successor profiles. Portable normalization and mock orchestration do not qualify native behavior or performance.

Run the component test with exact Node 26.7.0:

```text
node --test components/prepared-execution/test/prepared-operation-dag.test.mjs
```
