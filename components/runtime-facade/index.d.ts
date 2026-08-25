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
  maxPendingGpuOperations?: 1 | 2;
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

export interface DeviceCompileHeader { name: string; source: string; }

export interface DeviceCompileRequest {
  source: string;
  name?: string;
  headers?: readonly DeviceCompileHeader[];
  options?: DeviceCompileOptions;
  output?: 'ptx' | 'lto-ir';
}

export interface PtxArtifact {
  readonly format: 'ptx';
  readonly bytes: Uint8Array;
  readonly byteLength: number;
  readonly sha256: string;
  readonly architecture: string;
  readonly relocatableDeviceCode?: true;
}

export interface LtoIrArtifact {
  readonly format: 'lto-ir';
  readonly bytes: Uint8Array;
  readonly byteLength: number;
  readonly sha256: string;
  readonly architecture: string;
  readonly producer: Readonly<{ profile: string; nvrtcVersion: string }>;
}

export interface CubinArtifact {
  readonly format: 'cubin';
  readonly bytes: Uint8Array;
  readonly byteLength: number;
  readonly sha256: string;
  readonly architecture: string;
}

export type CudaArtifact = PtxArtifact | LtoIrArtifact | CubinArtifact;

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

export type FunctionParameterKind = 'device-memory' | 'publication-mailbox-host-to-device-u32' | 'publication-mailbox-device-to-host-u32' | 'u32' | 'u64' | 'i32' | 'f32' | 'f64' | 'f16' | 'bf16';
export interface FunctionParameter { readonly kind: FunctionParameterKind; }

export interface LaunchDimensions { x: number; y: number; z: number; }

export interface CudaDeviceMemory {
  readonly kind: 'device-memory';
  readonly byteLength: number;
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  write(bytes: Uint8Array, options?: { deviceOffset?: number }): Promise<Readonly<Record<string, unknown>>>;
  read(options: { deviceOffset?: number; byteLength: number }): Promise<Readonly<{ schemaVersion: 1; deviceOffset: number; byteLength: number; bytes: Uint8Array; usage: unknown }>>;
  writeAsync(bytes: Uint8Array, options?: { deviceOffset?: number; after?: CudaOperation | null }): Promise<CudaOperation>;
  readAsync(options: { deviceOffset?: number; byteLength: number; after?: CudaOperation | null }): Promise<CudaOperation>;
  copyFromAsync(source: CudaDeviceMemory, options: { destinationOffset?: number; sourceOffset?: number; byteLength: number; after?: CudaOperation | null }): Promise<CudaOperation>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export interface CudaPublicationMailbox {
  readonly kind: 'publication-mailbox';
  readonly generation: number;
  readonly lanes: readonly Readonly<{ name: string; direction: 'host-to-device' | 'device-to-host' }>[];
  readonly state: string;
  store(laneName: string, value: number): number;
  load(laneName: string): number;
  status(): Promise<Readonly<Record<string, unknown>>>;
  reset(): Promise<Readonly<Record<string, unknown>>>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export type CudaLaunchArgument = CudaDeviceMemory | Readonly<{ kind: 'publication-mailbox'; mailbox: CudaPublicationMailbox; lane: string }> | number | bigint;
export interface CudaLaunchOptions {
  grid: LaunchDimensions;
  block: LaunchDimensions;
  sharedMemoryBytes?: number;
  arguments: readonly CudaLaunchArgument[];
  after?: CudaOperation | null;
  accesses?: readonly Readonly<{
    argumentIndex: number;
    byteOffset: number;
    byteLength: number;
    mode: 'read' | 'write' | 'read-write' | 'atomic-observe-relaxed-device' | 'atomic-update-relaxed-device';
    dtype?: 'u32' | 'u64';
  }>[];
}

export type CudaOperationState = 'pending' | 'completed' | 'failed' | 'orphaned' | 'closed';

export interface CudaOperationStatus {
  readonly schemaVersion: 1;
  readonly status: 'pending' | 'completed' | 'failed' | 'orphaned';
  readonly kind?: 'host-to-device' | 'device-to-host' | 'device-to-device';
  readonly grid?: LaunchDimensions;
  readonly block?: LaunchDimensions;
  readonly sharedMemoryBytes?: number;
  readonly argumentKinds?: readonly FunctionParameterKind[];
  readonly pollCount: number;
  readonly elapsedMilliseconds: number;
  readonly operationSequence: number;
  readonly health: Readonly<Record<string, unknown>>;
  readonly failure?: Readonly<Record<string, unknown>>;
  readonly orphanReason?: string;
  readonly result?: Readonly<{ bytes: Uint8Array }>;
}

export interface CudaOperation {
  readonly kind: 'operation';
  readonly state: CudaOperationState | string;
  status(): Promise<CudaOperationStatus>;
  wait(): Promise<CudaOperationStatus>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export interface CudaFunction {
  readonly kind: 'function';
  readonly name: string;
  readonly parameters: readonly FunctionParameter[];
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  submit(options: CudaLaunchOptions): Promise<CudaOperation>;
  launch(options: CudaLaunchOptions): Promise<Readonly<Record<string, unknown>>>;
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
  createPublicationMailbox(options: { lanes: readonly Readonly<{ name: string; direction: 'host-to-device' | 'device-to-host' }>[] }): Promise<CudaPublicationMailbox>;
  loadModule(options: { format: 'ptx' | 'cubin'; bytes: Uint8Array }): Promise<CudaModule>;
  compile(request: DeviceCompileRequest): Promise<CompilerResult>;
  link(request: { inputs: readonly (Uint8Array | PtxArtifact | LtoIrArtifact)[]; options?: Readonly<Record<string, unknown>> }): Promise<CompilerResult>;
  invalidateCache(key: string): Promise<Readonly<Record<string, unknown>>>;
  close(): Promise<Readonly<{ schemaVersion: 1; graceful: boolean; restartRequired: boolean; state: string; compiler: unknown; driver: unknown }>>;
}

export type DeviceJsScalarType = 'bool' | 'u32' | 'i32' | 'u64' | 'f32';
export type DeviceJsPointerType = `ptr<${DeviceJsScalarType}>`;
export type DeviceJsMailboxType = 'mailbox<host-to-device,u32>' | 'mailbox<device-to-host,u32>';
export type DeviceJsType = DeviceJsScalarType | DeviceJsPointerType | DeviceJsMailboxType;

export interface DeviceJsParameter {
  name: string;
  type: DeviceJsType;
}

export interface DeviceJsFunction {
  name: string;
  kind: 'kernel' | 'device';
  parameters: readonly DeviceJsParameter[];
  returns: DeviceJsScalarType | 'void';
}

export interface DeviceJsCompileRequest {
  source: string;
  functions: readonly DeviceJsFunction[];
  compile?: DeviceCompileOptions;
}

export interface DeviceJsProgramDescriptor {
  readonly contract: 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1';
  readonly sha256: string;
  readonly parser: Readonly<{ name: 'acorn'; version: string }>;
  readonly functions: readonly Readonly<Record<string, unknown>>[];
  readonly kernels: readonly Readonly<{ name: string; functionName: string; parameters: readonly FunctionParameter[] }>[];
}

export interface DeviceJsCompileResult {
  readonly schemaVersion: 1;
  readonly deviceProgram: DeviceJsProgramDescriptor;
  readonly compiler: CompilerResult;
}

export const CUDA_JS_COMPATIBILITY: Readonly<Record<string, unknown>>;
export function inspectCudaHost(): Readonly<{ schemaVersion: 1; host: Readonly<Record<string, unknown>>; compatibility: typeof CUDA_JS_COMPATIBILITY }>;
export function openCudaRuntime(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;
export function compileDeviceProgram(runtime: CudaRuntime, request: DeviceJsCompileRequest): Promise<DeviceJsCompileResult>;
