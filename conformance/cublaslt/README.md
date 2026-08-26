# cuBLASLt conformance

**Status:** Accepted

This boundary independently qualifies the exact Windows x64 CUDA 13.3 cuBLASLt profile admitted by SPEC-0029.

`oracle.cpp` calls the CUDA Runtime and cuBLASLt directly. It proves the selected ABI layout, heuristic result, zero-workspace algorithm, numerical output, and direct native cleanup without importing CUDA-JS implementation code. `public-native.mjs` exercises the same matrices through the public CUDA-JS facade and ordinary operation lifecycle. `scripts/run-cublaslt.mjs native` builds and runs both paths under exact Node 26.7.0, compares their results, and writes ignored evidence beneath `build/conformance/cublaslt/`.

The evidence is bounded to the manifest-pinned CUDA 13.3 Windows x64 provider/header identity, the recorded GPU, contiguous row-major `f32` matmul, and the tested plan/lifecycle. It makes no Linux, broader cuBLASLt operation, algorithm stability, tensor, or performance claim.
