import type { CudaRuntime, OpenCudaRuntimeOptions } from './index.mjs';

/** Portable lifecycle and orchestration mock only; never native CUDA evidence. */
export function openCudaRuntimeForTesting(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;
