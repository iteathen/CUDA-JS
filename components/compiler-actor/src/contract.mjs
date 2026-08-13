import { createHash } from 'node:crypto';

import { inspectCudaTarget, pairedCudaTarget } from '../../cuda-target/index.mjs';
import { compilerError } from './errors.mjs';

export const LIMITS = Object.freeze({
  sourceBytes: 1_048_576,
  headerCount: 32,
  headerBytes: 262_144,
  totalHeaderBytes: 1_048_576,
  inputCount: 32,
  totalInputBytes: 67_108_864,
  artifactBytes: 67_108_864,
  logBytes: 1_048_576,
});

const PROHIBITED_PUBLIC_KEYS = new Set(['cacheDirectory', 'native', 'path', 'source']);
const ABSOLUTE_PATH = /(?:^|[\s'\"])(?:[a-zA-Z]:[\\/]|\\\\|\/[^/\s])/;

const COMPILE_FIELDS = Object.freeze(['headers', 'name', 'options', 'output', 'source']);
const COMPILE_OPTION_FIELDS = Object.freeze(['architecture', 'deviceAsDefaultExecutionSpace', 'fmad', 'headerProfile', 'languageStandard', 'relocatableDeviceCode']);
const LINK_FIELDS = Object.freeze(['inputs', 'options']);
const LINK_OPTION_FIELDS = Object.freeze(['architecture']);
const encoder = new TextEncoder();

export function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function assertCompilerPublicRecord(value, { maxDepth = 12, maxNodes = 2_000, maxByteLength = LIMITS.artifactBytes } = {}) {
  let nodes = 0;
  const visit = (current, depth) => {
    nodes += 1;
    if (nodes > maxNodes || depth > maxDepth) throw compilerError('COMPILER_RESULT_BOUNDS', 'Compiler result exceeds public record bounds.');
    if (current === null || typeof current === 'boolean') return;
    if (typeof current === 'number') {
      if (!Number.isSafeInteger(current)) throw compilerError('COMPILER_RESULT_NUMBER', 'Compiler result contains a non-safe number.');
      return;
    }
    if (typeof current === 'string') {
      if (current.length > LIMITS.logBytes) throw compilerError('COMPILER_RESULT_STRING', 'Compiler result contains an oversized string.');
      if (ABSOLUTE_PATH.test(current)) throw compilerError('COMPILER_RESULT_PATH', 'Compiler result contains an absolute path.');
      return;
    }
    if (typeof current === 'bigint' || typeof current === 'function' || typeof current === 'symbol' || current === undefined) {
      throw compilerError('COMPILER_RESULT_NATIVE_VALUE', 'Compiler result contains a prohibited native or executable value.');
    }
    if (current instanceof Uint8Array && !Buffer.isBuffer(current)) {
      if (current.byteLength > maxByteLength) throw compilerError('COMPILER_RESULT_BOUNDS', 'Compiler result contains an oversized byte copy.');
      return;
    }
    if (ArrayBuffer.isView(current) || current instanceof ArrayBuffer || current instanceof SharedArrayBuffer) {
      throw compilerError('COMPILER_RESULT_NATIVE_VALUE', 'Compiler result contains raw storage.');
    }
    if (Array.isArray(current)) {
      for (const item of current) visit(item, depth + 1);
      return;
    }
    if (!plainObject(current)) throw compilerError('COMPILER_RESULT_OBJECT', 'Compiler result contains a non-plain object.');
    for (const [key, item] of Object.entries(current)) {
      if (key.length > 128 || PROHIBITED_PUBLIC_KEYS.has(key)) throw compilerError('COMPILER_RESULT_KEY', 'Compiler result contains a prohibited key.');
      visit(item, depth + 1);
    }
  };
  visit(value, 0);
  return value;
}

function exactSubset(value, allowed) {
  return plainObject(value) && Object.keys(value).every((key) => allowed.includes(key));
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function utf8Length(value) { return encoder.encode(value).byteLength; }
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

function logicalName(value, fallback) {
  const name = value ?? fallback;
  if (typeof name !== 'string' || name.length < 1 || utf8Length(name) > 128 || !/^[\x20-\x7e]+$/.test(name) || /[\\/]/.test(name) || name.includes('\0')) {
    throw compilerError('COMPILER_NAME_INVALID', 'Logical program and header names must be bounded printable ASCII without path separators.');
  }
  return name;
}

function sourceText(value, maximum, code, label) {
  if (typeof value !== 'string' || value.length < 1 || value.includes('\0')) throw compilerError(code, `${label} must be a nonempty string without NUL.`);
  const bytes = utf8Length(value);
  if (bytes > maximum) throw compilerError(code, `${label} exceeds its UTF-8 byte limit.`, { byteLength: bytes, maximum });
  return { value, byteLength: bytes };
}

function computeArchitecture(value) {
  const architecture = value ?? 'compute_75';
  const target = inspectCudaTarget(architecture, { expectedPrefix: 'compute' });
  if (!target.ok) throw compilerError('COMPILER_ARCHITECTURE_INVALID', 'Compile architecture is not admitted by the canonical CUDA target policy.', { architecture: typeof architecture === 'string' ? architecture : null, reason: target.reason });
  return target.target.name;
}

function smArchitecture(value) {
  const architecture = value ?? 'sm_75';
  const target = inspectCudaTarget(architecture, { expectedPrefix: 'sm' });
  if (!target.ok) throw compilerError('LINKER_ARCHITECTURE_INVALID', 'Link architecture is not admitted by the canonical CUDA target policy.', { architecture: typeof architecture === 'string' ? architecture : null, reason: target.reason });
  return target.target.name;
}

function compileOutput(value) {
  const output = value ?? 'ptx';
  if (!['ptx', 'lto-ir'].includes(output)) throw compilerError('COMPILER_OUTPUT_INVALID', 'Compile output must be ptx or lto-ir.');
  return output;
}

export function normalizeCompileOptions(value = {}, platform = process.platform, output = 'ptx') {
  if (!exactSubset(value, COMPILE_OPTION_FIELDS)) throw compilerError('COMPILER_OPTIONS_INVALID', 'Compile options contain unknown fields.');
  if (output === 'lto-ir' && Object.hasOwn(value, 'relocatableDeviceCode')) throw compilerError('COMPILER_OUTPUT_CONFLICT', 'LTO-IR output determines relocatable-device-code semantics; relocatableDeviceCode must be omitted.');
  const architecture = computeArchitecture(value.architecture);
  const languageStandard = value.languageStandard ?? 'c++17';
  if (!['c++17', 'c++20'].includes(languageStandard)) throw compilerError('COMPILER_STANDARD_INVALID', 'languageStandard must be c++17 or c++20.');
  const headerProfile = value.headerProfile ?? 'none';
  if (!['none', 'cuda-cccl'].includes(headerProfile)) throw compilerError('COMPILER_HEADER_PROFILE_INVALID', 'headerProfile must be none or cuda-cccl.');
  const fmad = value.fmad ?? false;
  const deviceAsDefaultExecutionSpace = value.deviceAsDefaultExecutionSpace ?? false;
  const relocatableDeviceCode = output === 'ptx' ? value.relocatableDeviceCode ?? false : false;
  if (typeof fmad !== 'boolean' || typeof deviceAsDefaultExecutionSpace !== 'boolean' || typeof relocatableDeviceCode !== 'boolean') throw compilerError('COMPILER_OPTIONS_INVALID', 'Compile boolean options must be booleans.');
  const native = [
    `--gpu-architecture=${architecture}`,
    `--std=${languageStandard}`,
    `--fmad=${fmad}`,
    ...(deviceAsDefaultExecutionSpace ? ['--device-as-default-execution-space'] : []),
    ...(relocatableDeviceCode ? ['--relocatable-device-code=true'] : []),
    ...(output === 'lto-ir' ? ['--dlink-time-opt'] : []),
    '--frandom-seed=0',
    '--no-cache',
    ...(platform === 'linux' ? ['--modify-stack-limit=false'] : []),
  ];
  return Object.freeze({ architecture, languageStandard, fmad, deviceAsDefaultExecutionSpace, headerProfile, relocatableDeviceCode, native: Object.freeze(native) });
}

export function normalizeLinkOptions(value = {}, mode = 'ptx') {
  if (!exactSubset(value, LINK_OPTION_FIELDS)) throw compilerError('LINKER_OPTIONS_INVALID', 'Link options contain unknown fields.');
  if (!['ptx', 'lto'].includes(mode)) throw compilerError('LINKER_MODE_INVALID', 'Internal link mode is invalid.');
  const architecture = smArchitecture(value.architecture);
  return Object.freeze({ architecture, mode, native: Object.freeze([`-arch=${architecture}`, ...(mode === 'lto' ? ['-lto'] : [])]) });
}

export function normalizeCompileRequest(request, platform = process.platform) {
  if (!exactSubset(request, COMPILE_FIELDS) || !Object.hasOwn(request, 'source')) throw compilerError('COMPILER_REQUEST_INVALID', 'Compile request requires source and contains only source, name, headers, options, and output.');
  const output = compileOutput(request.output);
  const source = sourceText(request.source, LIMITS.sourceBytes, 'COMPILER_SOURCE_INVALID', 'Source');
  const name = logicalName(request.name, 'program.cu');
  const headers = request.headers ?? [];
  if (!Array.isArray(headers) || headers.length > LIMITS.headerCount) throw compilerError('COMPILER_HEADERS_INVALID', 'Headers must be a bounded array.');
  let totalHeaderBytes = 0;
  const names = new Set();
  const normalizedHeaders = headers.map((header) => {
    if (!plainObject(header) || Object.keys(header).sort().join('\0') !== 'name\0source') throw compilerError('COMPILER_HEADER_INVALID', 'Every header requires exactly name and source.');
    const headerName = logicalName(header.name);
    if (names.has(headerName)) throw compilerError('COMPILER_HEADER_DUPLICATE', 'Header names must be unique.', { name: headerName });
    names.add(headerName);
    const headerSource = sourceText(header.source, LIMITS.headerBytes, 'COMPILER_HEADER_INVALID', 'Header source');
    totalHeaderBytes += headerSource.byteLength;
    return Object.freeze({ name: headerName, source: headerSource.value, byteLength: headerSource.byteLength, sha256: sha256(encoder.encode(headerSource.value)) });
  }).sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  if (totalHeaderBytes > LIMITS.totalHeaderBytes) throw compilerError('COMPILER_HEADERS_LIMIT', 'Total header bytes exceed the limit.', { totalHeaderBytes });
  return Object.freeze({
    source: source.value,
    sourceByteLength: source.byteLength,
    sourceSha256: sha256(encoder.encode(source.value)),
    name,
    headers: Object.freeze(normalizedHeaders),
    output,
    options: normalizeCompileOptions(request.options ?? {}, platform, output),
  });
}

function ordinaryBytes(value) { return value instanceof Uint8Array && !Buffer.isBuffer(value); }

function normalizePtxInput(value, index) {
  let bytes;
  let architecture = null;
  let relocatableDeviceCode = false;
  if (ordinaryBytes(value)) bytes = value;
  else if (plainObject(value) && value.format === 'ptx' && ordinaryBytes(value.bytes)) {
    const fields = Object.keys(value);
    if (fields.some((key) => !['format', 'bytes', 'byteLength', 'sha256', 'architecture', 'relocatableDeviceCode'].includes(key))) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX artifact contains unknown fields.', { index });
    bytes = value.bytes;
    architecture = value.architecture == null ? null : computeArchitecture(value.architecture);
    if (Object.hasOwn(value, 'relocatableDeviceCode')) {
      if (value.relocatableDeviceCode !== true) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX relocatableDeviceCode marker, when present, must be true.', { index });
      relocatableDeviceCode = true;
    }
    if (Object.hasOwn(value, 'byteLength') && value.byteLength !== bytes.byteLength) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX artifact length does not match bytes.', { index });
    if (Object.hasOwn(value, 'sha256') && value.sha256 !== sha256(bytes)) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX artifact digest does not match bytes.', { index });
  } else throw compilerError('LINKER_INPUT_INVALID', 'Link inputs must be ordinary PTX byte copies or typed PTX/LTO-IR artifacts.', { index });
  if (bytes.byteLength < 1 || bytes.byteLength > LIMITS.totalInputBytes || bytes.includes(0)) throw compilerError('LINKER_INPUT_INVALID', 'PTX input is empty, oversized, or contains NUL.', { index });
  const copy = Uint8Array.from(bytes);
  return Object.freeze({ format: 'ptx', bytes: copy, byteLength: copy.byteLength, sha256: sha256(copy), architecture, relocatableDeviceCode });
}

function normalizeProducer(value, index) {
  if (!exactFields(value, ['nvrtcVersion', 'profile'])) throw compilerError('LINKER_LTO_PRODUCER_INVALID', 'LTO-IR producer metadata is invalid.', { index });
  if (typeof value.profile !== 'string' || value.profile.length < 1 || value.profile.length > 256 || !/^[\x20-\x7e]+$/.test(value.profile)) throw compilerError('LINKER_LTO_PRODUCER_INVALID', 'LTO-IR producer profile is invalid.', { index });
  if (typeof value.nvrtcVersion !== 'string' || !/^[0-9]+\.[0-9]+$/.test(value.nvrtcVersion)) throw compilerError('LINKER_LTO_PRODUCER_INVALID', 'LTO-IR producer NVRTC version must use MAJOR.MINOR.', { index });
  const [major, minor] = value.nvrtcVersion.split('.').map(Number);
  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor)) throw compilerError('LINKER_LTO_PRODUCER_INVALID', 'LTO-IR producer NVRTC version is invalid.', { index });
  return Object.freeze({ profile: value.profile, nvrtcVersion: value.nvrtcVersion, major, minor });
}

function normalizeLtoInput(value, index) {
  if (!plainObject(value) || value.format !== 'lto-ir' || !ordinaryBytes(value.bytes)) throw compilerError('LINKER_INPUT_INVALID', 'LTO-IR inputs must be typed CUDA-JS artifacts.', { index });
  if (!exactSubset(value, ['format', 'bytes', 'byteLength', 'sha256', 'architecture', 'producer']) || !Object.hasOwn(value, 'byteLength') || !Object.hasOwn(value, 'sha256') || !Object.hasOwn(value, 'architecture') || !Object.hasOwn(value, 'producer')) {
    throw compilerError('LINKER_INPUT_INVALID', 'Typed LTO-IR artifact fields are invalid.', { index });
  }
  const bytes = value.bytes;
  if (bytes.byteLength < 1 || bytes.byteLength > LIMITS.totalInputBytes) throw compilerError('LINKER_INPUT_INVALID', 'LTO-IR input is empty or oversized.', { index });
  if (value.byteLength !== bytes.byteLength) throw compilerError('LINKER_INPUT_INVALID', 'Typed LTO-IR artifact length does not match bytes.', { index });
  if (value.sha256 !== sha256(bytes)) throw compilerError('LINKER_INPUT_INVALID', 'Typed LTO-IR artifact digest does not match bytes.', { index });
  const architecture = computeArchitecture(value.architecture);
  const producer = normalizeProducer(value.producer, index);
  const copy = Uint8Array.from(bytes);
  return Object.freeze({ format: 'lto-ir', bytes: copy, byteLength: copy.byteLength, sha256: value.sha256, architecture, producer });
}

function normalizeLinkInput(value, index) {
  if (plainObject(value) && value.format === 'lto-ir') return normalizeLtoInput(value, index);
  return normalizePtxInput(value, index);
}

export function normalizeLinkRequest(request) {
  if (!exactSubset(request, LINK_FIELDS) || !Object.hasOwn(request, 'inputs') || !Array.isArray(request.inputs) || request.inputs.length < 1 || request.inputs.length > LIMITS.inputCount) {
    throw compilerError('LINKER_REQUEST_INVALID', 'Link request requires a bounded inputs array and optional typed options.');
  }
  const inputs = request.inputs.map(normalizeLinkInput);
  const formats = new Set(inputs.map((input) => input.format));
  if (formats.size !== 1) throw compilerError('LINKER_INPUT_FORMAT_MIXED', 'PTX and LTO-IR inputs cannot be mixed in one link request.');
  const mode = inputs[0].format === 'lto-ir' ? 'lto' : 'ptx';
  const options = normalizeLinkOptions(request.options ?? {}, mode);
  const totalInputBytes = inputs.reduce((sum, input) => sum + input.byteLength, 0);
  if (totalInputBytes > LIMITS.totalInputBytes) throw compilerError('LINKER_INPUT_LIMIT', 'Total link input bytes exceed the limit.', { totalInputBytes });
  for (const input of inputs) {
    if (input.architecture && pairedCudaTarget(input.architecture, 'sm') !== options.architecture) throw compilerError('LINKER_ARCHITECTURE_MISMATCH', `Typed ${input.format} architecture does not match link architecture.`);
  }
  if (mode === 'lto') {
    const majors = new Set(inputs.map((input) => input.producer.major));
    if (majors.size !== 1) throw compilerError('LINKER_LTO_INCOMPATIBLE', 'LTO-IR inputs must have the same producer major version.');
  }
  return Object.freeze({ inputs: Object.freeze(inputs), totalInputBytes, mode, options });
}

export function validateLtoCompatibility(request, provider) {
  if (request.mode !== 'lto') return;
  const active = provider.identity.nvJitLink?.version ?? null;
  if (active === null) return;
  if (typeof active !== 'string' || !/^[0-9]+\.[0-9]+$/.test(active)) throw compilerError('LINKER_PROVIDER_VERSION_INVALID', 'Active nvJitLink provider version is invalid.');
  const [linkMajor, linkMinor] = active.split('.').map(Number);
  for (let index = 0; index < request.inputs.length; index += 1) {
    const producer = request.inputs[index].producer;
    if (producer.major !== linkMajor || producer.minor > linkMinor) {
      throw compilerError('LINKER_LTO_INCOMPATIBLE', 'LTO-IR producer is incompatible with the active nvJitLink provider.', { index, producerVersion: producer.nvrtcVersion, linkerVersion: active });
    }
  }
}

export function compileIdentity(request, provider) {
  const { headerProfiles, ...baseProvider } = provider.identity;
  const selectedHeaderProfile = request.options.headerProfile === 'cuda-cccl' ? headerProfiles?.cudaCccl : null;
  if (request.options.headerProfile === 'cuda-cccl' && !selectedHeaderProfile) throw compilerError('COMPILER_HEADER_PROFILE_UNAVAILABLE', 'The selected compiler header profile is unavailable.');
  const conflictingHeader = selectedHeaderProfile && request.headers.find((header) => selectedHeaderProfile.roots.some((root) => header.name === root || header.name.startsWith(`${root}/`)));
  if (conflictingHeader) throw compilerError('COMPILER_HEADER_PROFILE_CONFLICT', 'Caller headers cannot use a logical name owned by the selected compiler header profile.', { header: conflictingHeader.name });
  return {
    schemaVersion: 1,
    contractVersion: request.output === 'lto-ir' ? 'SPEC-0012-v1' : request.options.relocatableDeviceCode ? 'SPEC-0010-v1' : selectedHeaderProfile ? 'SPEC-0009-v1' : 'SPEC-0006-v1',
    operation: 'compile',
    platform: provider.platform,
    architecture: provider.architecture,
    node: provider.node,
    nodeAbi: provider.nodeAbi,
    provider: selectedHeaderProfile ? { ...baseProvider, headerProfile: selectedHeaderProfile } : baseProvider,
    request: {
      source: { byteLength: request.sourceByteLength, sha256: request.sourceSha256 },
      name: request.name,
      headers: request.headers.map(({ name, byteLength, sha256: digest }) => ({ name, byteLength, sha256: digest })),
      options: request.options.native,
      ...(selectedHeaderProfile ? { headerProfile: request.options.headerProfile } : {}),
      ...(request.options.relocatableDeviceCode ? { relocatableDeviceCode: true } : {}),
      output: request.output,
    },
  };
}

export function linkIdentity(request, provider) {
  validateLtoCompatibility(request, provider);
  const { headerProfiles, ...baseProvider } = provider.identity;
  return {
    schemaVersion: 1,
    contractVersion: request.mode === 'lto' ? 'SPEC-0012-v1' : 'SPEC-0006-v1',
    operation: 'link',
    platform: provider.platform,
    architecture: provider.architecture,
    node: provider.node,
    nodeAbi: provider.nodeAbi,
    provider: baseProvider,
    request: {
      inputs: request.inputs.map((input) => input.format === 'lto-ir'
        ? { format: 'lto-ir', byteLength: input.byteLength, sha256: input.sha256, architecture: input.architecture, producer: { profile: input.producer.profile, nvrtcVersion: input.producer.nvrtcVersion } }
        : { format: 'ptx', byteLength: input.byteLength, sha256: input.sha256, ...(input.relocatableDeviceCode ? { relocatableDeviceCode: true } : {}) }),
      mode: request.mode,
      options: request.options.native,
      output: 'cubin',
    },
  };
}
