import { createHash } from 'node:crypto';
import { createReadStream, existsSync, realpathSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ffi from 'node:ffi';

import { LIMITS } from '../contract.mjs';
import { CompilerRuntimeError } from '../errors.mjs';
import { snapshotHeaderProfile } from '../header-profile.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const manifestPath = path.join(root, 'schemas', 'cuda-13.3', 'win-x64', 'compiler-provider-manifest.json');
const NVJITLINK_INPUT_PTX = 2;
const NVJITLINK_INPUT_LTOIR = 3;
const NVRTC_DEFINITIONS = Object.freeze({
  nvrtcGetErrorString: { arguments: ['i32'], return: 'pointer' },
  nvrtcVersion: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcCreateProgram: { arguments: ['pointer', 'pointer', 'pointer', 'i32', 'pointer', 'pointer'], return: 'i32' },
  nvrtcDestroyProgram: { arguments: ['pointer'], return: 'i32' },
  nvrtcCompileProgram: { arguments: ['pointer', 'i32', 'pointer'], return: 'i32' },
  nvrtcGetPTXSize: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetPTX: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetLTOIRSize: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetLTOIR: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetProgramLogSize: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetProgramLog: { arguments: ['pointer', 'pointer'], return: 'i32' },
});
const LINK_DEFINITIONS = Object.freeze({
  nvJitLinkVersion: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkCreate_13_3: { arguments: ['pointer', 'u32', 'pointer'], return: 'i32' },
  __nvJitLinkDestroy_13_3: { arguments: ['pointer'], return: 'i32' },
  __nvJitLinkAddData_13_3: { arguments: ['pointer', 'i32', 'pointer', 'u64', 'pointer'], return: 'i32' },
  __nvJitLinkComplete_13_3: { arguments: ['pointer'], return: 'i32' },
  __nvJitLinkGetLinkedCubinSize_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkGetLinkedCubin_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkGetErrorLogSize_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkGetErrorLog_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkGetInfoLogSize_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkGetInfoLog_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
});

function cString(value) { return Buffer.from(`${value}\0`, 'utf8'); }
function pointer(storage) { return storage.readBigUInt64LE(0); }
function pointerTable(buffers) {
  const table = Buffer.alloc(buffers.length * 8);
  buffers.forEach((buffer, index) => table.writeBigUInt64LE(ffi.getRawPointer(buffer), index * 8));
  return table;
}
function boundedSize(storage, label, { allowZero = false } = {}) {
  const value = storage.readBigUInt64LE(0);
  if (value > BigInt(LIMITS.artifactBytes) || (!allowZero && value === 0n)) throw new CompilerRuntimeError('COMPILER_NATIVE_SIZE_INVALID', 'native-compiler', `${label} returned an invalid size.`, { size: value.toString() });
  return Number(value);
}
async function fileSha256(file) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

async function canonicalToolkitRoot() {
  const candidates = [process.env.CUDA_PATH_V13_3, process.env.CUDA_PATH, 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3'].filter(Boolean);
  const expectedSuffix = path.normalize('NVIDIA GPU Computing Toolkit\\CUDA\\v13.3').toLowerCase();
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (!resolved.toLowerCase().endsWith(expectedSuffix) || !existsSync(resolved)) continue;
    return realpathSync.native(resolved);
  }
  throw new CompilerRuntimeError('COMPILER_TOOLKIT_MISSING', 'unsupported', 'The canonical CUDA 13.3 toolkit installation is unavailable.');
}

async function verifyProvider(rootPath, record) {
  const file = path.join(rootPath, 'bin', 'x64', record.file);
  if (!existsSync(file)) throw new CompilerRuntimeError('COMPILER_PROVIDER_MISSING', 'unsupported', `Required compiler provider ${record.file} is unavailable.`);
  const resolved = realpathSync.native(file);
  if (resolved.toLowerCase() !== file.toLowerCase()) throw new CompilerRuntimeError('COMPILER_PROVIDER_NONCANONICAL', 'unsupported', `Compiler provider ${record.file} is not canonical.`);
  const info = await stat(resolved);
  if (info.size !== record.byteLength || await fileSha256(resolved) !== record.sha256) throw new CompilerRuntimeError('COMPILER_PROVIDER_IDENTITY', 'unsupported', `Compiler provider ${record.file} differs from the accepted profile.`);
  return resolved;
}

export async function createBackend() {
  if (process.platform !== 'win32' || process.arch !== 'x64') throw new CompilerRuntimeError('COMPILER_PROFILE_UNSUPPORTED', 'unsupported', 'The native compiler backend requires Windows x64.');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const toolkitRoot = await canonicalToolkitRoot();
  const ccclRoot = path.join(toolkitRoot, 'include', 'cccl');
  const nvrtcPath = await verifyProvider(toolkitRoot, manifest.providers.nvrtc);
  await verifyProvider(toolkitRoot, manifest.providers.nvrtcBuiltins);
  const linkPath = await verifyProvider(toolkitRoot, manifest.providers.nvJitLink);
  for (const [name, expected] of Object.entries(manifest.headers)) {
    const header = path.join(toolkitRoot, 'include', name);
    if (!existsSync(header) || await fileSha256(header) !== expected) throw new CompilerRuntimeError('COMPILER_HEADER_IDENTITY', 'unsupported', `Compiler header ${name} differs from the accepted profile.`);
  }
  let nvrtcLibrary;
  let linkLibrary;
  let nvrtc;
  let linker;
  let closed = false;
  let cudaCccl = null;
  const resources = { programsCreated: 0, programsDestroyed: 0, linksCreated: 0, linksDestroyed: 0 };

  try {
    nvrtcLibrary = new ffi.DynamicLibrary(nvrtcPath);
    linkLibrary = new ffi.DynamicLibrary(linkPath);
    nvrtc = nvrtcLibrary.getFunctions(NVRTC_DEFINITIONS);
    linker = linkLibrary.getFunctions(LINK_DEFINITIONS);
    const nvrtcMajor = Buffer.alloc(4);
    const nvrtcMinor = Buffer.alloc(4);
    const linkMajor = Buffer.alloc(4);
    const linkMinor = Buffer.alloc(4);
    if (nvrtc.nvrtcVersion(nvrtcMajor, nvrtcMinor) !== 0 || linker.nvJitLinkVersion(linkMajor, linkMinor) !== 0) throw new CompilerRuntimeError('COMPILER_PROVIDER_VERSION', 'unsupported', 'Compiler provider version query failed.');
    const versions = { nvrtc: `${nvrtcMajor.readInt32LE(0)}.${nvrtcMinor.readInt32LE(0)}`, nvJitLink: `${linkMajor.readUInt32LE(0)}.${linkMinor.readUInt32LE(0)}` };
    if (versions.nvrtc !== manifest.providers.nvrtc.version || versions.nvJitLink !== manifest.providers.nvJitLink.version) throw new CompilerRuntimeError('COMPILER_PROVIDER_VERSION', 'unsupported', 'Compiler provider versions differ from the accepted profile.', versions);

    const provider = Object.freeze({
      platform: process.platform,
      architecture: process.arch,
      node: process.version,
      nodeAbi: process.versions.modules,
      identity: Object.freeze({
        profile: manifest.profile,
        nvrtc: Object.freeze({ version: versions.nvrtc, byteLength: manifest.providers.nvrtc.byteLength, sha256: manifest.providers.nvrtc.sha256 }),
        nvrtcBuiltins: Object.freeze({ version: manifest.providers.nvrtcBuiltins.version, byteLength: manifest.providers.nvrtcBuiltins.byteLength, sha256: manifest.providers.nvrtcBuiltins.sha256 }),
        nvJitLink: Object.freeze({ version: versions.nvJitLink, byteLength: manifest.providers.nvJitLink.byteLength, sha256: manifest.providers.nvJitLink.sha256 }),
        headerProfiles: Object.freeze({
          cudaCccl: Object.freeze({ ...manifest.headerProfiles.cudaCccl, roots: Object.freeze([...manifest.headerProfiles.cudaCccl.roots]) }),
        }),
      }),
    });

    function nvrtcMessage(status) {
      try {
        const value = nvrtc.nvrtcGetErrorString(status);
        return value ? ffi.toString(value) : null;
      } catch { return null; }
    }
    function compileLog(program) {
      const sizeStorage = Buffer.alloc(8);
      if (nvrtc.nvrtcGetProgramLogSize(program, sizeStorage) !== 0) return '';
      const size = boundedSize(sizeStorage, 'NVRTC log', { allowZero: true });
      if (size === 0) return '';
      if (size > LIMITS.logBytes) throw new CompilerRuntimeError('COMPILER_LOG_LIMIT', 'native-compiler', 'NVRTC log exceeds the public limit.', { size });
      const output = Buffer.alloc(size);
      if (nvrtc.nvrtcGetProgramLog(program, output) !== 0) return '';
      const end = output.at(-1) === 0 ? size - 1 : size;
      return output.toString('utf8', 0, end);
    }
    function linkLog(handle, kind) {
      const sizeFunction = kind === 'error' ? linker.__nvJitLinkGetErrorLogSize_13_3 : linker.__nvJitLinkGetInfoLogSize_13_3;
      const getFunction = kind === 'error' ? linker.__nvJitLinkGetErrorLog_13_3 : linker.__nvJitLinkGetInfoLog_13_3;
      const sizeStorage = Buffer.alloc(8);
      if (sizeFunction(handle, sizeStorage) !== 0) return '';
      const size = boundedSize(sizeStorage, `nvJitLink ${kind} log`, { allowZero: true });
      if (size === 0) return '';
      if (size > LIMITS.logBytes) throw new CompilerRuntimeError('LINKER_LOG_LIMIT', 'native-linker', 'nvJitLink log exceeds the public limit.', { kind, size });
      const output = Buffer.alloc(size);
      if (getFunction(handle, output) !== 0) return '';
      const end = output.at(-1) === 0 ? size - 1 : size;
      return output.toString('utf8', 0, end);
    }

    return {
      provider,
      resources,
      async prepareCompile(request) {
        if (request.options.headerProfile === 'none') return;
        if (request.options.headerProfile !== 'cuda-cccl') throw new CompilerRuntimeError('COMPILER_HEADER_PROFILE_UNAVAILABLE', 'unsupported', 'The selected compiler header profile is unavailable.');
        if (!cudaCccl) cudaCccl = await snapshotHeaderProfile(ccclRoot, manifest.headerProfiles.cudaCccl);
      },
      async compile(request) {
        const programStorage = Buffer.alloc(8);
        let created = false;
        let log = '';
        try {
          const source = cString(request.source);
          const name = cString(request.name);
          const profileHeaders = request.options.headerProfile === 'cuda-cccl' ? cudaCccl?.headers : [];
          if (request.options.headerProfile === 'cuda-cccl' && !profileHeaders) throw new CompilerRuntimeError('COMPILER_HEADER_PROFILE_UNAVAILABLE', 'unsupported', 'The selected compiler header profile was not prepared.');
          const headerSources = [...request.headers.map((header) => cString(header.source)), ...profileHeaders.map((header) => header.source)];
          const headerNames = [...request.headers.map((header) => cString(header.name)), ...profileHeaders.map((header) => cString(header.name))];
          const status = nvrtc.nvrtcCreateProgram(programStorage, source, name, headerSources.length, headerSources.length ? pointerTable(headerSources) : null, headerNames.length ? pointerTable(headerNames) : null);
          if (status !== 0) throw new CompilerRuntimeError('NVRTC_CREATE_FAILED', 'native-compiler', 'NVRTC program creation failed.', { nativeStatus: status, nativeMessage: nvrtcMessage(status) });
          created = true;
          resources.programsCreated += 1;
          const program = pointer(programStorage);
          const options = request.options.native.map(cString);
          const compileStatus = nvrtc.nvrtcCompileProgram(program, options.length, pointerTable(options));
          log = compileLog(program);
          if (compileStatus !== 0) throw new CompilerRuntimeError('NVRTC_COMPILE_FAILED', 'compile', 'NVRTC compilation failed.', { nativeStatus: compileStatus, nativeMessage: nvrtcMessage(compileStatus), log });
          const sizeStorage = Buffer.alloc(8);
          if (request.output === 'lto-ir') {
            const sizeStatus = nvrtc.nvrtcGetLTOIRSize(program, sizeStorage);
            if (sizeStatus !== 0) throw new CompilerRuntimeError('NVRTC_OUTPUT_FAILED', 'native-compiler', 'NVRTC LTO-IR size query failed.', { nativeStatus: sizeStatus, nativeMessage: nvrtcMessage(sizeStatus) });
            const size = boundedSize(sizeStorage, 'NVRTC LTO-IR');
            const output = Buffer.alloc(size);
            const outputStatus = nvrtc.nvrtcGetLTOIR(program, output);
            if (outputStatus !== 0) throw new CompilerRuntimeError('NVRTC_OUTPUT_FAILED', 'native-compiler', 'NVRTC LTO-IR extraction failed.', { nativeStatus: outputStatus, nativeMessage: nvrtcMessage(outputStatus) });
            return { bytes: Uint8Array.from(output), log };
          }
          const sizeStatus = nvrtc.nvrtcGetPTXSize(program, sizeStorage);
          if (sizeStatus !== 0) throw new CompilerRuntimeError('NVRTC_OUTPUT_FAILED', 'native-compiler', 'NVRTC PTX size query failed.', { nativeStatus: sizeStatus, nativeMessage: nvrtcMessage(sizeStatus) });
          const size = boundedSize(sizeStorage, 'NVRTC PTX');
          const output = Buffer.alloc(size);
          const outputStatus = nvrtc.nvrtcGetPTX(program, output);
          if (outputStatus !== 0 || output.at(-1) !== 0) throw new CompilerRuntimeError('NVRTC_OUTPUT_FAILED', 'native-compiler', 'NVRTC PTX extraction failed.', { nativeStatus: outputStatus, nativeMessage: nvrtcMessage(outputStatus) });
          return { bytes: Uint8Array.from(output.subarray(0, -1)), log };
        } finally {
          if (created) {
            const status = nvrtc.nvrtcDestroyProgram(programStorage);
            if (status !== 0 || pointer(programStorage) !== 0n) throw new CompilerRuntimeError('NVRTC_DESTROY_FAILED', 'restart-required', 'NVRTC program destruction failed.', { nativeStatus: status }, { healthBefore: 'healthy', healthAfter: 'restart-required' });
            resources.programsDestroyed += 1;
          }
        }
      },
      async link(request) {
        const linkStorage = Buffer.alloc(8);
        let created = false;
        try {
          const options = request.options.native.map(cString);
          const createStatus = linker.__nvJitLinkCreate_13_3(linkStorage, options.length, pointerTable(options));
          if (createStatus !== 0 || pointer(linkStorage) === 0n) throw new CompilerRuntimeError('NVJITLINK_CREATE_FAILED', 'native-linker', 'nvJitLink handle creation failed.', { nativeStatus: createStatus });
          created = true;
          resources.linksCreated += 1;
          const handle = pointer(linkStorage);
          for (let index = 0; index < request.inputs.length; index += 1) {
            const input = request.inputs[index];
            const inputType = input.format === 'lto-ir' ? NVJITLINK_INPUT_LTOIR : NVJITLINK_INPUT_PTX;
            const data = input.format === 'lto-ir' ? Buffer.from(input.bytes) : (() => {
              const withNul = Buffer.alloc(input.byteLength + 1);
              withNul.set(input.bytes);
              return withNul;
            })();
            const suffix = input.format === 'lto-ir' ? 'ltoir' : 'ptx';
            const status = linker.__nvJitLinkAddData_13_3(handle, inputType, data, BigInt(data.byteLength), cString(`input-${index}.${suffix}`));
            if (status !== 0) throw new CompilerRuntimeError('NVJITLINK_ADD_FAILED', 'link', `nvJitLink rejected a ${input.format} input.`, { nativeStatus: status, input: index, log: linkLog(handle, 'error') });
          }
          const completeStatus = linker.__nvJitLinkComplete_13_3(handle);
          const infoLog = linkLog(handle, 'info');
          const errorLog = linkLog(handle, 'error');
          if (completeStatus !== 0) throw new CompilerRuntimeError('NVJITLINK_COMPLETE_FAILED', 'link', 'nvJitLink failed to produce cubin.', { nativeStatus: completeStatus, log: errorLog });
          const sizeStorage = Buffer.alloc(8);
          const sizeStatus = linker.__nvJitLinkGetLinkedCubinSize_13_3(handle, sizeStorage);
          if (sizeStatus !== 0) throw new CompilerRuntimeError('NVJITLINK_OUTPUT_FAILED', 'native-linker', 'nvJitLink cubin size query failed.', { nativeStatus: sizeStatus });
          const output = Buffer.alloc(boundedSize(sizeStorage, 'nvJitLink cubin'));
          const outputStatus = linker.__nvJitLinkGetLinkedCubin_13_3(handle, output);
          if (outputStatus !== 0) throw new CompilerRuntimeError('NVJITLINK_OUTPUT_FAILED', 'native-linker', 'nvJitLink cubin extraction failed.', { nativeStatus: outputStatus });
          return { bytes: Uint8Array.from(output), log: [infoLog, errorLog].filter(Boolean).join('\n') };
        } finally {
          if (created) {
            const status = linker.__nvJitLinkDestroy_13_3(linkStorage);
            if (status !== 0 || pointer(linkStorage) !== 0n) throw new CompilerRuntimeError('NVJITLINK_DESTROY_FAILED', 'restart-required', 'nvJitLink handle destruction failed.', { nativeStatus: status }, { healthBefore: 'healthy', healthAfter: 'restart-required' });
            resources.linksDestroyed += 1;
          }
        }
      },
      async close() {
        if (closed) return;
        linkLibrary.close();
        nvrtcLibrary.close();
        closed = true;
      },
    };
  } catch (error) {
    try { linkLibrary?.close(); } finally { nvrtcLibrary?.close(); }
    throw error;
  }
}
