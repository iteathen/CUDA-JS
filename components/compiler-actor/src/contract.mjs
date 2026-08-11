import { createHash } from 'node:crypto';

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

const COMPILE_FIELDS = Object.freeze(['headers', 'name', 'options', 'source']);
const COMPILE_OPTION_FIELDS = Object.freeze(['architecture', 'deviceAsDefaultExecutionSpace', 'fmad', 'headerProfile', 'languageStandard']);
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
  if (!/^compute_[5-9][0-9]$/.test(architecture)) throw compilerError('COMPILER_ARCHITECTURE_INVALID', 'Compile architecture must use canonical compute_NN syntax from compute_50 through compute_99.');
  return architecture;
}

function smArchitecture(value) {
  const architecture = value ?? 'sm_75';
  if (!/^sm_[5-9][0-9]$/.test(architecture)) throw compilerError('LINKER_ARCHITECTURE_INVALID', 'Link architecture must use canonical sm_NN syntax from sm_50 through sm_99.');
  return architecture;
}

export function normalizeCompileOptions(value = {}, platform = process.platform) {
  if (!exactSubset(value, COMPILE_OPTION_FIELDS)) throw compilerError('COMPILER_OPTIONS_INVALID', 'Compile options contain unknown fields.');
  const architecture = computeArchitecture(value.architecture);
  const languageStandard = value.languageStandard ?? 'c++17';
  if (!['c++17', 'c++20'].includes(languageStandard)) throw compilerError('COMPILER_STANDARD_INVALID', 'languageStandard must be c++17 or c++20.');
  const headerProfile = value.headerProfile ?? 'none';
  if (!['none', 'cuda-cccl'].includes(headerProfile)) throw compilerError('COMPILER_HEADER_PROFILE_INVALID', 'headerProfile must be none or cuda-cccl.');
  const fmad = value.fmad ?? false;
  const deviceAsDefaultExecutionSpace = value.deviceAsDefaultExecutionSpace ?? false;
  if (typeof fmad !== 'boolean' || typeof deviceAsDefaultExecutionSpace !== 'boolean') throw compilerError('COMPILER_OPTIONS_INVALID', 'Compile boolean options must be booleans.');
  const native = [
    `--gpu-architecture=${architecture}`,
    `--std=${languageStandard}`,
    `--fmad=${fmad}`,
    ...(deviceAsDefaultExecutionSpace ? ['--device-as-default-execution-space'] : []),
    '--frandom-seed=0',
    '--no-cache',
    ...(platform === 'linux' ? ['--modify-stack-limit=false'] : []),
  ];
  return Object.freeze({ architecture, languageStandard, fmad, deviceAsDefaultExecutionSpace, headerProfile, native: Object.freeze(native) });
}

export function normalizeLinkOptions(value = {}) {
  if (!exactSubset(value, LINK_OPTION_FIELDS)) throw compilerError('LINKER_OPTIONS_INVALID', 'Link options contain unknown fields.');
  const architecture = smArchitecture(value.architecture);
  return Object.freeze({ architecture, native: Object.freeze([`-arch=${architecture}`]) });
}

export function normalizeCompileRequest(request, platform = process.platform) {
  if (!exactSubset(request, COMPILE_FIELDS) || !Object.hasOwn(request, 'source')) throw compilerError('COMPILER_REQUEST_INVALID', 'Compile request requires source and contains only source, name, headers, and options.');
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
    options: normalizeCompileOptions(request.options ?? {}, platform),
  });
}

function ordinaryBytes(value) { return value instanceof Uint8Array && !Buffer.isBuffer(value); }

function normalizePtxInput(value, index) {
  let bytes;
  let architecture = null;
  if (ordinaryBytes(value)) bytes = value;
  else if (plainObject(value) && value.format === 'ptx' && ordinaryBytes(value.bytes)) {
    const fields = Object.keys(value);
    if (fields.some((key) => !['format', 'bytes', 'byteLength', 'sha256', 'architecture'].includes(key))) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX artifact contains unknown fields.', { index });
    bytes = value.bytes;
    architecture = value.architecture ?? null;
    if (Object.hasOwn(value, 'byteLength') && value.byteLength !== bytes.byteLength) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX artifact length does not match bytes.', { index });
    if (Object.hasOwn(value, 'sha256') && value.sha256 !== sha256(bytes)) throw compilerError('LINKER_INPUT_INVALID', 'Typed PTX artifact digest does not match bytes.', { index });
  } else throw compilerError('LINKER_INPUT_INVALID', 'Link inputs must be ordinary PTX byte copies or typed PTX artifacts.', { index });
  if (bytes.byteLength < 1 || bytes.byteLength > LIMITS.totalInputBytes || bytes.includes(0)) throw compilerError('LINKER_INPUT_INVALID', 'PTX input is empty, oversized, or contains NUL.', { index });
  const copy = Uint8Array.from(bytes);
  return Object.freeze({ bytes: copy, byteLength: copy.byteLength, sha256: sha256(copy), architecture });
}

export function normalizeLinkRequest(request) {
  if (!exactSubset(request, LINK_FIELDS) || !Object.hasOwn(request, 'inputs') || !Array.isArray(request.inputs) || request.inputs.length < 1 || request.inputs.length > LIMITS.inputCount) {
    throw compilerError('LINKER_REQUEST_INVALID', 'Link request requires a bounded inputs array and optional typed options.');
  }
  const options = normalizeLinkOptions(request.options ?? {});
  const inputs = request.inputs.map(normalizePtxInput);
  const totalInputBytes = inputs.reduce((sum, input) => sum + input.byteLength, 0);
  if (totalInputBytes > LIMITS.totalInputBytes) throw compilerError('LINKER_INPUT_LIMIT', 'Total link input bytes exceed the limit.', { totalInputBytes });
  for (const input of inputs) {
    if (input.architecture && input.architecture.replace('compute_', 'sm_') !== options.architecture) throw compilerError('LINKER_ARCHITECTURE_MISMATCH', 'Typed PTX architecture does not match link architecture.');
  }
  return Object.freeze({ inputs: Object.freeze(inputs), totalInputBytes, options });
}

export function compileIdentity(request, provider) {
  const { headerProfiles, ...baseProvider } = provider.identity;
  const selectedHeaderProfile = request.options.headerProfile === 'cuda-cccl' ? headerProfiles?.cudaCccl : null;
  if (request.options.headerProfile === 'cuda-cccl' && !selectedHeaderProfile) throw compilerError('COMPILER_HEADER_PROFILE_UNAVAILABLE', 'The selected compiler header profile is unavailable.');
  const conflictingHeader = selectedHeaderProfile && request.headers.find((header) => selectedHeaderProfile.roots.some((root) => header.name === root || header.name.startsWith(`${root}/`)));
  if (conflictingHeader) throw compilerError('COMPILER_HEADER_PROFILE_CONFLICT', 'Caller headers cannot use a logical name owned by the selected compiler header profile.', { header: conflictingHeader.name });
  return {
    schemaVersion: 1,
    contractVersion: selectedHeaderProfile ? 'SPEC-0009-v1' : 'SPEC-0006-v1',
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
      output: 'ptx',
    },
  };
}

export function linkIdentity(request, provider) {
  const { headerProfiles, ...baseProvider } = provider.identity;
  return {
    schemaVersion: 1,
    contractVersion: 'SPEC-0006-v1',
    operation: 'link',
    platform: provider.platform,
    architecture: provider.architecture,
    node: provider.node,
    nodeAbi: provider.nodeAbi,
    provider: baseProvider,
    request: {
      inputs: request.inputs.map(({ byteLength, sha256: digest }) => ({ format: 'ptx', byteLength, sha256: digest })),
      options: request.options.native,
      output: 'cubin',
    },
  };
}
