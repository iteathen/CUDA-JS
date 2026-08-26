import type { CudaDeviceSnapshot, CudaRuntime, OpenCudaRuntimeOptions } from './index.mjs';

/** Portable lifecycle and orchestration mock only; never native CUDA evidence. */
export function openCudaRuntimeForTesting(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;

/** Portable selector/orchestration mock only; never native CUDA evidence. */
export function discoverCudaDevicesForTesting(devices?: readonly Readonly<{ nativeDevice: number; computeCapabilityMajor: number; computeCapabilityMinor: number }>[] ): Promise<CudaDeviceSnapshot>;
