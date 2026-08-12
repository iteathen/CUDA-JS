export type CudaJsErrorCategory =
  | 'validation'
  | 'unsupported'
  | 'permission'
  | 'pressure'
  | 'backpressure'
  | 'stale-resource'
  | 'closed-runtime'
  | 'immediate-driver'
  | 'deferred-driver'
  | 'provider'
  | 'restart-required'
  | 'internal';

export class CudaJsError extends Error {
  readonly code: string;
  readonly category: CudaJsErrorCategory | string;
  readonly operation: string | null;
  readonly details: Readonly<Record<string, unknown>>;
  readonly healthBefore: string | null;
  readonly healthAfter: string | null;
}

export interface MemoryPolicy {
  maxDeviceBytes?: number;
  maxAllocationBytes?: number;
  maxTransferBytes?: number;
}

export interface ExecutionPolicy {
  maxModuleBytes?: number;
  maxArguments?: number;
  maxCompletionMilliseconds?: number;
}

export interface DriverOptions {
  maxPending?: number;
  memory?: MemoryPolicy;
  execution?: ExecutionPolicy;
}

export interface CompilerOptions {
  cacheDirectory?: string;
  cacheMode?: 'read-write' | 'read-only' | 'disabled';
}

export interface OpenCudaRuntimeOptions {
  driver?: DriverOptions;
  compiler?: boolean | CompilerOptions;
}

export interface DeviceCompileOptions {
  architecture?: string;
  languageStandard?: 'c++17' | 'c++20';
  fmad?: boolean;
  deviceAsDefaultExecutionSpace?: boolean;
  headerProfile?: 'none' | 'cuda-cccl';
  relocatableDeviceCode?: boolean;
}

export interface DeviceCompileHeader {
  name: string;
  source: string;
}

export interface DeviceCompileRequest {
  source: string;
  name?: string;
  headers?: readonly DeviceCompileHeader[];
  options?: DeviceCompileOptions;
}

export interface CudaArtifact {
  readonly format: 'ptx' | 'cubin';
  readonly bytes: Uint8Array;
  readonly byteLength: number;
  readonly sha256: string;
  readonly architecture: string;
  readonly relocatableDeviceCode?: true;
}

export interface CompilerResult {
  readonly schemaVersion: 1;
  readonly operation: 'compile' | 'link';
  readonly artifact: CudaArtifact;
  readonly log: string;
  readonly cache: Readonly<{ key: string; status: string }>;
  readonly provider: Readonly<Record<string, unknown>>;
  readonly health: Readonly<{ current: string }>;
  readonly operationSequence: number;
}

export type FunctionParameterKind = 'device-memory' | 'u32' | 'u64' | 'i32' | 'f32';

export interface FunctionParameter {
  readonly kind: FunctionParameterKind;
}

export interface LaunchDimensions {
  x: number;
  y: number;
  z: number;
}

export interface CudaDeviceMemory {
  readonly kind: 'device-memory';
  readonly byteLength: number;
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  write(bytes: Uint8Array, options?: { deviceOffset?: number }): Promise<Readonly<Record<string, unknown>>>;
  read(options: { deviceOffset?: number; byteLength: number }): Promise<Readonly<{ schemaVersion: 1; deviceOffset: number; byteLength: number; bytes: Uint8Array; usage: unknown }>>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export type CudaLaunchArgument = CudaDeviceMemory | number | bigint;

export interface CudaFunction {
  readonly kind: 'function';
  readonly name: string;
  readonly parameters: readonly FunctionParameter[];
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  launch(options: { grid: LaunchDimensions; block: LaunchDimensions; sharedMemoryBytes?: number; arguments: readonly CudaLaunchArgument[] }): Promise<Readonly<Record<string, unknown>>>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export interface CudaModule {
  readonly kind: 'module';
  readonly format: 'ptx' | 'cubin';
  readonly byteLength: number;
  readonly sha256: string;
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  getFunction(options: { name: string; parameters: readonly FunctionParameter[] }): Promise<CudaFunction>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export interface CudaRuntime {
  readonly state: string;
  readonly health: string;
  readonly compilerEnabled: boolean;
  readonly terminalReport: Readonly<Record<string, unknown>> | null;
  describe(): Promise<Readonly<Record<string, unknown>>>;
  allocateDevice(options: { byteLength: number }): Promise<CudaDeviceMemory>;
  loadModule(options: { format: 'ptx' | 'cubin'; bytes: Uint8Array }): Promise<CudaModule>;
  compile(request: DeviceCompileRequest): Promise<CompilerResult>;
  link(request: { inputs: readonly (Uint8Array | CudaArtifact)[]; options?: Readonly<Record<string, unknown>> }): Promise<CompilerResult>;
  invalidateCache(key: string): Promise<Readonly<Record<string, unknown>>>;
  close(): Promise<Readonly<{ schemaVersion: 1; graceful: boolean; restartRequired: boolean; state: string; compiler: unknown; driver: unknown }>>;
}

export const CUDA_JS_COMPATIBILITY: Readonly<Record<string, unknown>>;
export function inspectCudaHost(): Readonly<{ schemaVersion: 1; host: Readonly<Record<string, unknown>>; compatibility: typeof CUDA_JS_COMPATIBILITY }>;
export function openCudaRuntime(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;
