# Context-bound CUDA library adapters

`runtime.cuda-library-adapters` owns optional finite semantic adapters for CUDA libraries whose handles, descriptors, plans, streams, and device-memory operands must stay inside DriverActor.

The accepted first child is one opaque cuBLASLt `f32` row-major matrix-multiplication plan. It composes public typed device views with the existing execution scheduler and operation lifecycle. Provider discovery is lazy, native handles and algorithms remain private, workspace has an explicit finite ceiling and caller-owned view lease, and core runtime import/open remains independent of cuBLASLt availability.

This component does not own tensors, shapes, broadcasting, neural-network policy, arbitrary provider calls, public streams/events, or hidden device allocation.
