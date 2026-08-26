# Context-bound CUDA library adapters

`runtime.cuda-library-adapters` owns optional finite semantic adapters for CUDA libraries whose handles, descriptors, plans, streams, and device-memory operands must stay inside DriverActor.

The accepted first child is one opaque cuBLASLt `f32` row-major matrix-multiplication plan. It composes public typed device views with the existing execution scheduler and operation lifecycle. Provider discovery is lazy, native handles and algorithms remain private, workspace has an explicit finite ceiling and caller-owned view lease, and core runtime import/open remains independent of cuBLASLt availability.

SPEC-0031 lets the same fixed plan participate in a prepared DAG. The adapter remains the sole owner of plan semantics, f32 view/workspace validation, derived read/write ranges, and native library enqueue. The execution component supplies the private stream and remains the sole topology, hazard, whole-operation, event, failure, and cleanup owner. The connection is a private initialization-time port, not a public dynamic provider registry.

This component does not own tensors, shapes, broadcasting, neural-network policy, arbitrary provider calls, public streams/events, or hidden device allocation.
