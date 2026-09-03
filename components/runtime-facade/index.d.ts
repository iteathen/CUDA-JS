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
  device?: CudaDeviceSelector;
}

export class CudaDeviceSelector {
  private constructor();
  readonly kind: 'cuda-device-selector';
}

export interface CudaDeviceArchitecture {
  readonly major: number;
  readonly minor: number;
  readonly class: string;
}

export interface CudaDeviceDescriptor {
  readonly schemaVersion: 1;
  readonly selector: CudaDeviceSelector;
  readonly architecture: CudaDeviceArchitecture;
}

export interface CudaDeviceSnapshot {
  readonly schemaVersion: 1;
  readonly deviceCount: number;
  readonly devices: readonly CudaDeviceDescriptor[];
}

export interface DeviceCompileOptions {
  architecture?: string;
  languageStandard?: 'c++17' | 'c++20';
  fmad?: boolean;
  deviceAsDefaultExecutionSpace?: boolean;
  headerProfile?: 'none' | 'cuda-cccl' | 'cuda-numeric' | 'cuda-device';
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

export type CudaDeviceViewDtype = 'u32' | 'u64' | 'i32' | 'f32' | 'f64' | 'f16' | 'bf16';
export type CudaDeviceViewAccess = 'read' | 'write' | 'read-write';
export interface CudaDeviceViewOptions {
  dtype: CudaDeviceViewDtype;
  elementCount: number;
  byteOffset?: number;
  access?: CudaDeviceViewAccess;
}

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
  view(options: CudaDeviceViewOptions): Promise<CudaDeviceView>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export interface CudaDeviceView {
  readonly kind: 'device-view';
  readonly dtype: CudaDeviceViewDtype;
  readonly byteOffset: number;
  readonly elementCount: number;
  readonly byteLength: number;
  readonly access: CudaDeviceViewAccess;
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
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

export type CudaLaunchArgument = CudaDeviceMemory | CudaDeviceView | Readonly<{ kind: 'publication-mailbox'; mailbox: CudaPublicationMailbox; lane: string }> | number | bigint;
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

export interface CudaPreparedBindingReference { readonly binding: string; }

export interface CudaPreparedKernelNode {
  id: string;
  kind?: 'kernel';
  after?: readonly string[];
  function: CudaFunction;
  grid: LaunchDimensions;
  block: LaunchDimensions;
  sharedMemoryBytes?: number;
  arguments: readonly (CudaPreparedBindingReference | number | bigint)[];
  accesses: readonly Readonly<{
    argumentIndex: number;
    byteOffset: number;
    byteLength: number;
    mode: 'read' | 'write' | 'read-write' | 'atomic-observe-relaxed-device' | 'atomic-update-relaxed-device';
    dtype?: 'u32' | 'u64';
  }>[];
}

export interface CudaPreparedCublasLtF32MatmulNode {
  id: string;
  kind: 'cublaslt-f32-matmul';
  after?: readonly string[];
  plan: CudaCublasLtMatmulPlan;
  a: CudaPreparedBindingReference;
  b: CudaPreparedBindingReference;
  c: CudaPreparedBindingReference;
  d: CudaPreparedBindingReference;
  alpha?: number | CudaPreparedBindingReference;
  beta?: number | CudaPreparedBindingReference;
  workspace?: CudaPreparedBindingReference | null;
}

export type CudaPreparedOperationNode = CudaPreparedKernelNode | CudaPreparedCublasLtF32MatmulNode;

export type CudaPreparedBindingValue = CudaDeviceMemory | CudaDeviceView | number | bigint;
export interface CudaPreparedBindingDescriptor { readonly name: string; readonly kind: FunctionParameterKind; }
export interface CudaPreparedSubmitOptions { after?: CudaOperation | null; }
export interface CudaPreparedSubmitRequest extends CudaPreparedSubmitOptions { bindings: Readonly<Record<string, CudaPreparedBindingValue>>; }

export type CudaOperationState = 'pending' | 'completed' | 'failed' | 'orphaned' | 'closed';

export interface CudaOperationStatus {
  readonly schemaVersion: 1;
  readonly status: 'pending' | 'completed' | 'failed' | 'orphaned';
  readonly kind?: 'host-to-device' | 'device-to-host' | 'device-to-device' | 'prepared-batch' | 'cublaslt-f32-matmul';
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
  readonly preparedSha256?: string;
  readonly nodeCount?: number;
  readonly edgeCount?: number;
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

export interface CudaPreparedOperationDag {
  readonly kind: 'prepared-operation-dag';
  readonly contract: 'SPEC-0020-prepared-kernel-dag-v1' | 'SPEC-0020-prepared-kernel-dag-v1+SPEC-0031-prepared-cublaslt-f32-matmul-node-v1';
  readonly sha256: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly bindings: readonly CudaPreparedBindingDescriptor[];
  readonly realization: 'semantic-single-stream';
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  submit(request: CudaPreparedSubmitRequest): Promise<CudaOperation>;
  submit(bindings: Readonly<Record<string, CudaPreparedBindingValue>>, options?: CudaPreparedSubmitOptions): Promise<CudaOperation>;
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

export interface CudaCublasLtF32MatmulPlanOptions {
  m: number;
  n: number;
  k: number;
  transposeA?: boolean;
  transposeB?: boolean;
  maxWorkspaceBytes?: number;
}

export interface CudaCublasLtF32MatmulSubmitOptions {
  a: CudaDeviceView;
  b: CudaDeviceView;
  c: CudaDeviceView;
  d: CudaDeviceView;
  alpha?: number;
  beta?: number;
  workspace?: CudaDeviceView | null;
  after?: CudaOperation | null;
}

export interface CudaCublasLtMatmulPlan {
  readonly kind: 'cublaslt-matmul-plan';
  readonly contract: 'SPEC-0029-cublaslt-f32-row-major-matmul-v1';
  readonly m: number;
  readonly n: number;
  readonly k: number;
  readonly transposeA: boolean;
  readonly transposeB: boolean;
  readonly maxWorkspaceBytes: number;
  readonly workspaceBytes: number;
  readonly requirements: Readonly<{ a: number; b: number; c: number; d: number }>;
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  submit(options: CudaCublasLtF32MatmulSubmitOptions): Promise<CudaOperation>;
  close(): Promise<Readonly<Record<string, unknown>>>;
}

export interface CudaCublasLt {
  readonly kind: 'cublaslt-adapter';
  readonly profile: 'cublaslt-f32-row-major-matmul-v1';
  readonly provider: Readonly<{ name: string; version: string; qualification: string; workspaceAlignmentBytes: number }>;
  readonly state: string;
  status(): Promise<Readonly<Record<string, unknown>>>;
  createF32MatmulPlan(options: CudaCublasLtF32MatmulPlanOptions): Promise<CudaCublasLtMatmulPlan>;
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
  prepareOperationDag(nodes: readonly CudaPreparedOperationNode[]): Promise<CudaPreparedOperationDag>;
  prepareOperationDag(options: { nodes: readonly CudaPreparedOperationNode[] }): Promise<CudaPreparedOperationDag>;
  openCublasLt(): Promise<CudaCublasLt>;
  compile(request: DeviceCompileRequest): Promise<CompilerResult>;
  link(request: { inputs: readonly (Uint8Array | PtxArtifact | LtoIrArtifact)[]; options?: Readonly<Record<string, unknown>> }): Promise<CompilerResult>;
  invalidateCache(key: string): Promise<Readonly<Record<string, unknown>>>;
  close(): Promise<Readonly<{ schemaVersion: 1; graceful: boolean; restartRequired: boolean; state: string; compiler: unknown; driver: unknown }>>;
}

export type DeviceJsScalarType = 'bool' | 'u32' | 'i32' | 'u64' | 'f32' | 'f64' | 'f16' | 'bf16';
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

export interface DeviceJsDeviceFunction extends Omit<DeviceJsFunction, 'kind'> {
  kind: 'device';
}

export type DeviceJsLibraryCompileOptions = Omit<DeviceCompileOptions, 'relocatableDeviceCode'>;

export interface DeviceJsCompileRequest {
  source: string;
  functions: readonly DeviceJsFunction[];
  compile?: DeviceCompileOptions;
  imports?: readonly DeviceJsImport[];
}

export interface DeviceJsLibraryExport {
  readonly name: string;
  readonly symbol: string;
  readonly parameters: readonly DeviceJsParameter[];
  readonly returns: DeviceJsScalarType | 'void';
}

export interface DeviceJsLibrary {
  readonly schemaVersion: 1;
  readonly contract: 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1+SPEC-0028-device-library-v1' | 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1+SPEC-0030-dense-numeric-v1+SPEC-0028-device-library-v1';
  readonly sha256: string;
  readonly format: 'ptx' | 'lto-ir';
  readonly architecture: string;
  readonly exports: readonly DeviceJsLibraryExport[];
  readonly artifact: PtxArtifact | LtoIrArtifact;
}

export interface DeviceJsLibraryCompileRequest {
  source: string;
  functions: readonly DeviceJsDeviceFunction[];
  exports: readonly string[];
  compile?: DeviceJsLibraryCompileOptions;
  output?: 'ptx' | 'lto-ir';
}

export interface DeviceJsLibraryCompileResult {
  readonly schemaVersion: 1;
  readonly library: DeviceJsLibrary;
  readonly compiler: CompilerResult;
}

export interface DeviceJsImport {
  readonly library: DeviceJsLibrary;
  readonly name: string;
  readonly as: string;
}

export interface DeviceJsProgramDescriptor {
  readonly contract: 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1' | 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1+SPEC-0028-device-library-v1' | 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1+SPEC-0030-dense-numeric-v1' | 'SPEC-0013-v1+SPEC-0022-atomic-observation-v1+SPEC-0022-device-publication-v1+SPEC-0014-publication-mailbox-v1+SPEC-0030-dense-numeric-v1+SPEC-0028-device-library-v1';
  readonly sha256: string;
  readonly parser: Readonly<{ name: 'acorn'; version: string }>;
  readonly functions: readonly Readonly<Record<string, unknown>>[];
  readonly kernels: readonly Readonly<{ name: string; functionName: string; parameters: readonly FunctionParameter[] }>[];
  readonly imports?: readonly Readonly<Record<string, unknown>>[];
}

export interface DeviceJsCompileResult {
  readonly schemaVersion: 1;
  readonly deviceProgram: DeviceJsProgramDescriptor;
  readonly compiler: CompilerResult;
  readonly linker?: CompilerResult;
}

export const CUDA_JS_COMPATIBILITY: Readonly<Record<string, unknown>>;
export function inspectCudaHost(): Readonly<{ schemaVersion: 1; host: Readonly<Record<string, unknown>>; compatibility: typeof CUDA_JS_COMPATIBILITY }>;
export function discoverCudaDevices(): Promise<CudaDeviceSnapshot>;
export function openCudaRuntime(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;
export function compileDeviceLibrary(runtime: CudaRuntime, request: DeviceJsLibraryCompileRequest): Promise<DeviceJsLibraryCompileResult>;
export function compileDeviceProgram(runtime: CudaRuntime, request: DeviceJsCompileRequest): Promise<DeviceJsCompileResult>;
