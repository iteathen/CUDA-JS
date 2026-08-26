import { normalizeLinkRequest } from '../../compiler-actor/index.mjs';
import { inspectCudaTarget, pairedCudaTarget } from '../../cuda-target/index.mjs';
import { DEVICE_JS_DENSE_NUMERIC_LIBRARY_CONTRACT, DEVICE_JS_LIBRARY_CONTRACT, translateDeviceLibrary, translateDeviceProgram } from '../../device-js/index.mjs';

import { freezePublic, publicError } from './errors.mjs';
import { inspectRuntimeCompileTarget } from './runtime.mjs';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const SHA256 = /^[a-f0-9]{64}$/;
const IMPORT_LIMIT = 64;
const LIBRARY_LIMIT = 32;
const DEVICE_JS_LIBRARY_CONTRACTS = new Set([DEVICE_JS_LIBRARY_CONTRACT, DEVICE_JS_DENSE_NUMERIC_LIBRARY_CONTRACT]);

function fail(code, message, details = {}) {
  throw Object.assign(new Error(message), { code, category: 'validation', details });
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function assertRuntime(runtime, operation) {
  if (!runtime || typeof runtime.compile !== 'function' || typeof runtime.link !== 'function') fail('DEVICE_JS_RUNTIME_INVALID', `${operation} requires an open compiler-enabled CUDA-JS runtime.`);
}

function bindRuntimeCompileTarget(runtime, compile, operation) {
  if (compile !== undefined && !plainObject(compile)) fail('DEVICE_JS_COMPILE_OPTIONS_INVALID', 'Device-JS compile options must be an ordinary object.');
  const selected = inspectRuntimeCompileTarget(runtime, operation);
  const target = inspectCudaTarget(selected, { expectedPrefix: 'compute' });
  if (!target.ok) fail('DEVICE_JS_RUNTIME_TARGET_INVALID', 'The selected CUDA-JS runtime did not expose a valid compile target.', { operation });
  if (compile?.architecture !== undefined && compile.architecture !== target.target.name) {
    fail('DEVICE_JS_COMPILE_TARGET_CONFLICT', 'Device-JS compilation cannot override the selected runtime target.', {
      requested: compile.architecture,
      selected: target.target.name,
    });
  }
  return Object.freeze({ ...(compile ?? {}), architecture: target.target.name });
}

function assertCompositionOwnsRdc(compile) {
  if (plainObject(compile) && Object.hasOwn(compile, 'relocatableDeviceCode')) fail('DEVICE_JS_LIBRARY_COMPILE_CONFLICT', 'Device-JS library composition owns relocatable-device-code selection.');
}

function compilationRequest(translated, output) {
  const { relocatableDeviceCode: _derived, ...base } = translated.compile;
  return {
    source: translated.generatedSource,
    name: translated.generatedName,
    options: output === 'ptx' ? { ...base, relocatableDeviceCode: true } : base,
    output,
  };
}

function publicArtifact(input) {
  if (input.format === 'lto-ir') return Object.freeze({
    format: 'lto-ir',
    bytes: Uint8Array.from(input.bytes),
    byteLength: input.byteLength,
    sha256: input.sha256,
    architecture: input.architecture,
    producer: Object.freeze({ profile: input.producer.profile, nvrtcVersion: input.producer.nvrtcVersion }),
  });
  return Object.freeze({
    format: 'ptx',
    bytes: Uint8Array.from(input.bytes),
    byteLength: input.byteLength,
    sha256: input.sha256,
    architecture: input.architecture,
    ...(input.relocatableDeviceCode ? { relocatableDeviceCode: true } : {}),
  });
}

function validateExport(entry, librarySha256, index) {
  if (!exactFields(entry, ['name', 'parameters', 'returns', 'symbol']) || typeof entry.name !== 'string' || !IDENTIFIER.test(entry.name)
      || entry.symbol !== `djs_lib_${librarySha256}_${index}` || !Array.isArray(entry.parameters) || entry.parameters.length > 64
      || typeof entry.returns !== 'string') fail('DEVICE_JS_LIBRARY_INVALID', 'Device-JS library export metadata is invalid.', { exportIndex: index });
  for (const parameter of entry.parameters) {
    if (!exactFields(parameter, ['name', 'type']) || typeof parameter.name !== 'string' || !IDENTIFIER.test(parameter.name) || typeof parameter.type !== 'string') fail('DEVICE_JS_LIBRARY_INVALID', 'Device-JS library export parameter metadata is invalid.', { exportIndex: index });
  }
  return Object.freeze({
    name: entry.name,
    symbol: entry.symbol,
    parameters: Object.freeze(entry.parameters.map((parameter) => Object.freeze({ name: parameter.name, type: parameter.type }))),
    returns: entry.returns,
  });
}

function validateLibrary(value, targetArchitecture) {
  if (!exactFields(value, ['architecture', 'artifact', 'contract', 'exports', 'format', 'schemaVersion', 'sha256'])
      || value.schemaVersion !== 1 || !DEVICE_JS_LIBRARY_CONTRACTS.has(value.contract) || typeof value.sha256 !== 'string' || !SHA256.test(value.sha256)
      || !['ptx', 'lto-ir'].includes(value.format) || typeof value.architecture !== 'string'
      || !Array.isArray(value.exports) || value.exports.length < 1 || value.exports.length > 64) fail('DEVICE_JS_LIBRARY_INVALID', 'Device-JS library record is invalid.');
  const exports = value.exports.map((entry, index) => validateExport(entry, value.sha256, index));
  for (let index = 1; index < exports.length; index += 1) {
    if (exports[index - 1].name >= exports[index].name) fail('DEVICE_JS_LIBRARY_INVALID', 'Device-JS library exports must use unique canonical name order.', { exportIndex: index });
  }
  const normalized = normalizeLinkRequest({ inputs: [value.artifact], options: { architecture: pairedCudaTarget(targetArchitecture, 'sm') } });
  const artifact = normalized.inputs[0];
  if (artifact.format !== value.format || artifact.architecture !== value.architecture || value.architecture !== targetArchitecture || (artifact.format === 'ptx' && !artifact.relocatableDeviceCode)) fail('DEVICE_JS_LIBRARY_INVALID', 'Device-JS library artifact format, target, or relocatable identity is invalid.');
  return Object.freeze({
    schemaVersion: 1,
    contract: value.contract,
    sha256: value.sha256,
    format: value.format,
    architecture: value.architecture,
    exports: Object.freeze(exports),
    artifact: publicArtifact(artifact),
  });
}

function libraryFingerprint(library) {
  return JSON.stringify({
    schemaVersion: library.schemaVersion,
    contract: library.contract,
    sha256: library.sha256,
    format: library.format,
    architecture: library.architecture,
    artifactSha256: library.artifact.sha256,
    exports: library.exports.map((entry) => ({
      name: entry.name,
      symbol: entry.symbol,
      parameters: entry.parameters.map((parameter) => ({ name: parameter.name, type: parameter.type })),
      returns: entry.returns,
    })),
  });
}

function normalizeImports(value, targetArchitecture) {
  if (!Array.isArray(value) || value.length < 1 || value.length > IMPORT_LIMIT) fail('DEVICE_JS_IMPORTS_INVALID', 'Composed Device-JS imports must be a nonempty bounded array.');
  const aliases = new Set();
  const libraries = new Map();
  const artifactOwners = new Map();
  const imports = value.map((entry, index) => {
    if (!exactFields(entry, ['as', 'library', 'name']) || typeof entry.as !== 'string' || !IDENTIFIER.test(entry.as) || entry.as === 'gpu'
        || typeof entry.name !== 'string' || !IDENTIFIER.test(entry.name)) fail('DEVICE_JS_IMPORT_INVALID', 'Device-JS public import requires exact library/name/as fields.', { importIndex: index });
    if (aliases.has(entry.as)) fail('DEVICE_JS_IMPORT_DUPLICATE', 'Device-JS import aliases must be unique.', { importIndex: index, name: entry.as });
    aliases.add(entry.as);
    const library = validateLibrary(entry.library, targetArchitecture);
    const existing = libraries.get(library.sha256);
    const fingerprint = libraryFingerprint(library);
    if (existing && existing.fingerprint !== fingerprint) fail('DEVICE_JS_LIBRARY_CONFLICT', 'One Device-JS library identity maps to contradictory artifacts.');
    const artifactOwner = artifactOwners.get(library.artifact.sha256);
    if (artifactOwner && artifactOwner !== library.sha256) fail('DEVICE_JS_LIBRARY_CONFLICT', 'Distinct Device-JS library identities cannot reuse one artifact digest.');
    artifactOwners.set(library.artifact.sha256, library.sha256);
    if (!existing) {
      if (libraries.size >= LIBRARY_LIMIT) fail('DEVICE_JS_LIBRARY_LIMIT', 'Composed Device-JS program exceeds the distinct library limit.');
      libraries.set(library.sha256, { library, fingerprint });
    }
    const exported = library.exports.find((candidate) => candidate.name === entry.name);
    if (!exported) fail('DEVICE_JS_IMPORT_UNKNOWN', 'Device-JS import selects an unknown library export.', { importIndex: index, name: entry.name });
    return Object.freeze({
      name: entry.as,
      symbol: exported.symbol,
      parameters: exported.parameters,
      returns: exported.returns,
      librarySha256: library.sha256,
      libraryContract: library.contract,
      exportName: exported.name,
      artifactSha256: library.artifact.sha256,
      format: library.format,
      architecture: library.architecture,
    });
  });
  const orderedLibraries = [...libraries.values()].map((entry) => entry.library).sort((left, right) => left.sha256 < right.sha256 ? -1 : left.sha256 > right.sha256 ? 1 : 0);
  const snapshots = normalizeLinkRequest({
    inputs: orderedLibraries.map((library) => library.artifact),
    options: { architecture: pairedCudaTarget(targetArchitecture, 'sm') },
  }).inputs.map(publicArtifact);
  return Object.freeze({ imports: Object.freeze(imports), artifacts: Object.freeze(snapshots), format: snapshots[0].format });
}

function publicProgram(translated) {
  return {
    contract: translated.contract,
    sha256: translated.sha256,
    parser: translated.parser,
    functions: translated.functions,
    kernels: translated.kernels,
    ...(translated.imports ? { imports: translated.imports } : {}),
  };
}

export async function compileDeviceLibrary(runtime, request) {
  try {
    assertRuntime(runtime, 'compileDeviceLibrary');
    if (!plainObject(request) || Object.keys(request).some((key) => !['compile', 'exports', 'functions', 'output', 'source'].includes(key))) fail('DEVICE_JS_LIBRARY_REQUEST_INVALID', 'Device-JS library request contains unknown fields.');
    const output = request.output ?? 'ptx';
    if (!['ptx', 'lto-ir'].includes(output)) fail('DEVICE_JS_LIBRARY_OUTPUT_INVALID', 'Device-JS library output must be ptx or lto-ir.');
    assertCompositionOwnsRdc(request.compile);
    const compile = bindRuntimeCompileTarget(runtime, request.compile, 'compileDeviceLibrary');
    const translated = translateDeviceLibrary({ source: request.source, functions: request.functions, exports: request.exports, compile });
    const compiler = await runtime.compile(compilationRequest(translated, output));
    const library = {
      schemaVersion: 1,
      contract: translated.contract,
      sha256: translated.sha256,
      format: compiler.artifact.format,
      architecture: compiler.artifact.architecture,
      exports: translated.exports,
      artifact: compiler.artifact,
    };
    validateLibrary(library, translated.compile.architecture);
    return freezePublic({ schemaVersion: 1, library, compiler });
  } catch (error) {
    throw publicError(error, 'device-js.library.compile');
  }
}

export async function compileDeviceProgram(runtime, request) {
  try {
    assertRuntime(runtime, 'compileDeviceProgram');
    const hasImports = plainObject(request) && Array.isArray(request.imports) && request.imports.length > 0;
    if (!hasImports) {
      if (!plainObject(request)) fail('DEVICE_JS_REQUEST_INVALID', 'Device-JS request must be an ordinary object.');
      const compile = bindRuntimeCompileTarget(runtime, request.compile, 'compileDeviceProgram');
      const translated = translateDeviceProgram({ ...request, compile });
      const compiler = await runtime.compile({ source: translated.generatedSource, name: translated.generatedName, options: translated.compile });
      return freezePublic({ schemaVersion: 1, deviceProgram: publicProgram(translated), compiler });
    }
    if (!plainObject(request) || Object.keys(request).some((key) => !['compile', 'functions', 'imports', 'source'].includes(key))) fail('DEVICE_JS_REQUEST_INVALID', 'Composed Device-JS request contains unknown fields.');
    assertCompositionOwnsRdc(request.compile);
    const compile = bindRuntimeCompileTarget(runtime, request.compile, 'compileDeviceProgram');
    const target = inspectCudaTarget(compile.architecture, { expectedPrefix: 'compute' });
    const normalized = normalizeImports(request.imports, target.target.name);
    const translated = translateDeviceProgram({ source: request.source, functions: request.functions, imports: normalized.imports, compile });
    const compiler = await runtime.compile(compilationRequest(translated, normalized.format));
    const linker = await runtime.link({ inputs: [compiler.artifact, ...normalized.artifacts], options: { architecture: pairedCudaTarget(translated.compile.architecture, 'sm') } });
    return freezePublic({ schemaVersion: 1, deviceProgram: publicProgram(translated), compiler, linker });
  } catch (error) {
    throw publicError(error, 'device-js.compile');
  }
}
