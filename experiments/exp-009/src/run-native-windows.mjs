import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ffi from 'node:ffi';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const exp = path.join(root, 'experiments', 'exp-009');
const out = path.join(root, 'build', 'exp-009', 'windows-x64');
const toolkit = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
const sourcePath = path.join(exp, 'fixtures', 'vector-add.cu.txt');
const oracleSource = path.join(exp, 'native', 'compiler-oracle.c');
const oracleExe = path.join(out, 'windows-compiler-oracle.exe');
const oraclePtx = path.join(out, 'oracle.ptx');
const oracleCubin = path.join(out, 'oracle.cubin');
const nodePtx = path.join(out, 'node.ptx');
const nodeCubin = path.join(out, 'node.cubin');
const nvrtcPath = path.join(toolkit, 'bin', 'x64', 'nvrtc64_130_0.dll');
const linkPath = path.join(toolkit, 'bin', 'x64', 'nvJitLink_130_0.dll');

assert.equal(process.platform, 'win32');
assert.equal(process.arch, 'x64');
assert.equal(process.version, 'v26.7.0');

function cString(value) { return Buffer.from(`${value}\0`, 'utf8'); }
function pointerTable(values) {
  const table = Buffer.alloc(values.length * 8);
  values.forEach((value, index) => table.writeBigUInt64LE(ffi.getRawPointer(value), index * 8));
  return table;
}
function readPointer(storage) { return storage.readBigUInt64LE(0); }
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: root, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`command failed (${result.status}): ${executable}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}
function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }

await mkdir(out, { recursive: true });
const vsDevCmd = [
  process.env.VSDEVCMD,
  'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
  'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
].filter(Boolean).find(existsSync);
assert(vsDevCmd, 'MSVC x64 tools were not found.');
for (const required of [sourcePath, oracleSource, nvrtcPath, linkPath]) assert(existsSync(required), `missing ${required}`);

const compileCommand = [
  `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
  `cl /nologo /std:c11 /O2 /W4 /WX /D_CRT_SECURE_NO_WARNINGS ${quote(oracleSource)} /I${quote(path.join(toolkit, 'include'))} ${quote(path.join(toolkit, 'lib', 'x64', 'nvrtc.lib'))} ${quote(path.join(toolkit, 'lib', 'x64', 'nvJitLink.lib'))} /Fo:${quote(path.join(out, 'windows-compiler-oracle.obj'))} /Fe:${quote(oracleExe)}`,
].join(' && ');
run(compileCommand, [], { shell: true });
const oracleText = run(oracleExe, [sourcePath, oraclePtx, oracleCubin]);

const nvrtcDefinitions = {
  nvrtcVersion: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcCreateProgram: { arguments: ['pointer', 'pointer', 'pointer', 'i32', 'pointer', 'pointer'], return: 'i32' },
  nvrtcDestroyProgram: { arguments: ['pointer'], return: 'i32' },
  nvrtcCompileProgram: { arguments: ['pointer', 'i32', 'pointer'], return: 'i32' },
  nvrtcGetPTXSize: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetPTX: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetProgramLogSize: { arguments: ['pointer', 'pointer'], return: 'i32' },
  nvrtcGetProgramLog: { arguments: ['pointer', 'pointer'], return: 'i32' },
};
const linkDefinitions = {
  nvJitLinkVersion: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkCreate_13_3: { arguments: ['pointer', 'u32', 'pointer'], return: 'i32' },
  __nvJitLinkDestroy_13_3: { arguments: ['pointer'], return: 'i32' },
  __nvJitLinkAddData_13_3: { arguments: ['pointer', 'i32', 'pointer', 'u64', 'pointer'], return: 'i32' },
  __nvJitLinkComplete_13_3: { arguments: ['pointer'], return: 'i32' },
  __nvJitLinkGetLinkedCubinSize_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
  __nvJitLinkGetLinkedCubin_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
};

let nvrtc;
let linker;
try {
  nvrtc = new ffi.DynamicLibrary(nvrtcPath);
  linker = new ffi.DynamicLibrary(linkPath);
  const nc = nvrtc.getFunctions(nvrtcDefinitions);
  const jl = linker.getFunctions(linkDefinitions);
  const nvrtcMajor = Buffer.alloc(4);
  const nvrtcMinor = Buffer.alloc(4);
  const linkMajor = Buffer.alloc(4);
  const linkMinor = Buffer.alloc(4);
  assert.equal(nc.nvrtcVersion(nvrtcMajor, nvrtcMinor), 0);
  assert.equal(jl.nvJitLinkVersion(linkMajor, linkMinor), 0);

  const source = cString(await readFile(sourcePath, 'utf8'));
  const programName = cString('vector-add.cu');
  const programStorage = Buffer.alloc(8);
  assert.equal(nc.nvrtcCreateProgram(programStorage, source, programName, 0, null, null), 0);
  const program = readPointer(programStorage);
  assert.notEqual(program, 0n);
  const compileOptions = [
    '--gpu-architecture=compute_75', '--std=c++17', '--fmad=false', '--frandom-seed=0', '--no-cache',
  ].map(cString);
  assert.equal(nc.nvrtcCompileProgram(program, compileOptions.length, pointerTable(compileOptions)), 0);
  const ptxSizeStorage = Buffer.alloc(8);
  assert.equal(nc.nvrtcGetPTXSize(program, ptxSizeStorage), 0);
  const ptxSizeWithNul = Number(ptxSizeStorage.readBigUInt64LE(0));
  const ptxWithNul = Buffer.alloc(ptxSizeWithNul);
  assert.equal(nc.nvrtcGetPTX(program, ptxWithNul), 0);
  assert.equal(ptxWithNul.at(-1), 0);
  const ptx = ptxWithNul.subarray(0, -1);
  assert.equal(nc.nvrtcDestroyProgram(programStorage), 0);
  assert.equal(readPointer(programStorage), 0n);

  const linkOptions = [cString('-arch=sm_75')];
  const linkStorage = Buffer.alloc(8);
  assert.equal(jl.__nvJitLinkCreate_13_3(linkStorage, linkOptions.length, pointerTable(linkOptions)), 0);
  const link = readPointer(linkStorage);
  assert.notEqual(link, 0n);
  assert.equal(jl.__nvJitLinkAddData_13_3(link, 2, ptxWithNul, BigInt(ptxWithNul.byteLength), cString('input-0.ptx')), 0);
  assert.equal(jl.__nvJitLinkComplete_13_3(link), 0);
  const cubinSizeStorage = Buffer.alloc(8);
  assert.equal(jl.__nvJitLinkGetLinkedCubinSize_13_3(link, cubinSizeStorage), 0);
  const cubin = Buffer.alloc(Number(cubinSizeStorage.readBigUInt64LE(0)));
  assert.equal(jl.__nvJitLinkGetLinkedCubin_13_3(link, cubin), 0);
  assert.equal(jl.__nvJitLinkDestroy_13_3(linkStorage), 0);
  assert.equal(readPointer(linkStorage), 0n);

  const cPtx = await readFile(oraclePtx);
  const cCubin = await readFile(oracleCubin);
  assert.deepEqual(ptx, cPtx, 'Node and independent C PTX differ');
  assert.deepEqual(cubin, cCubin, 'Node and independent C cubin differ');
  await writeFile(nodePtx, ptx);
  await writeFile(nodeCubin, cubin);
  const result = {
    schemaVersion: 1,
    experiment: 'EXP-009',
    status: 'pass',
    versions: {
      nvrtc: `${nvrtcMajor.readInt32LE(0)}.${nvrtcMinor.readInt32LE(0)}`,
      nvJitLink: `${linkMajor.readUInt32LE(0)}.${linkMinor.readUInt32LE(0)}`,
    },
    ptx: { byteLength: ptx.byteLength, sha256: sha256(ptx), exactCParity: true },
    cubin: { byteLength: cubin.byteLength, sha256: sha256(cubin), exactCParity: true },
    cleanup: { programDestroyed: true, linkDestroyed: true },
    oracleText,
    claimLimits: ['Exact Windows x64 provider profile only.', 'No native Linux provider or Driver claim.'],
  };
  await writeFile(path.join(out, 'evidence.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`EXP-009 passed: NVRTC ${result.versions.nvrtc}, nvJitLink ${result.versions.nvJitLink}, PTX ${result.ptx.sha256}, cubin ${result.cubin.sha256}`);
} finally {
  try { linker?.close(); } finally { nvrtc?.close(); }
}
