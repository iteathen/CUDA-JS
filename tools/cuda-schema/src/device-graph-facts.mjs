// Header-only compiler extraction. No generated native probe or executable source.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const [clang, header, output] = process.argv.slice(2);
assert(clang && header && output, 'Usage: node device-graph-facts.mjs clang.exe cuda.h output-directory');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const headerSha256 = hash(readFileSync(header));
assert.equal(headerSha256, '31df84e16179b6d97db4b3c0bae7697392a370b41983f4a8962f0e5a8069b577');
function run(args) {
  const result = spawnSync(clang, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
const version = run(['--version']).split(/\r?\n/)[0];
assert.equal(version, 'clang version 20.1.8');
const target = 'x86_64-pc-windows-msvc';
const base = [`--target=${target}`, '-x', 'c', '-std=c11', '-fsyntax-only', header];
const ast = JSON.parse(run([...base, '-Xclang', '-ast-dump=json']));
const layouts = run([...base, '-Xclang', '-fdump-record-layouts-complete']);
const selected = ['cuGraphCreate', 'cuGraphAddKernelNode_v2', 'cuGraphInstantiateWithFlags', 'cuGraphUpload', 'cuGraphLaunch', 'cuGraphExecDestroy', 'cuGraphDestroy'];
const functions = {};
const ffi = {};
function nativeType(type) {
  if (type.endsWith('*') || ['CUgraph', 'CUgraphNode', 'CUgraphExec', 'CUstream'].includes(type)) return 'pointer';
  if (type === 'unsigned int') return 'u32';
  if (['size_t', 'unsigned long long'].includes(type)) return 'u64';
  throw new Error(`Unreviewed graph ABI type: ${type}`);
}
for (const symbol of selected) {
  const declarations = ast.inner.filter((node) => node.kind === 'FunctionDecl' && node.name === symbol);
  assert(declarations.length > 0, `Missing exact graph declaration ${symbol}`);
  const signatures = declarations.map((node) => ({ returnType: node.type.qualType.split(' (')[0], parameters: node.inner.filter((child) => child.kind === 'ParmVarDecl').map((child) => ({ name: child.name, sourceType: child.type.qualType })) }));
  for (const signature of signatures) assert.deepEqual(signature, signatures[0], `Contradictory graph signature ${symbol}`);
  assert.equal(signatures[0].returnType, 'CUresult');
  functions[symbol] = { ...signatures[0], sourceLine: declarations[0].loc.line };
  ffi[symbol] = { arguments: signatures[0].parameters.map((parameter) => nativeType(parameter.sourceType)), return: 'i32' };
}
const record = ast.inner.find((node) => node.kind === 'RecordDecl' && node.name === 'CUDA_KERNEL_NODE_PARAMS_v2_st' && node.completeDefinition);
assert(record);
const layoutText = layouts.split('*** Dumping AST Record Layout').find((block) => block.includes('struct CUDA_KERNEL_NODE_PARAMS_v2_st\n') || block.includes('struct CUDA_KERNEL_NODE_PARAMS_v2_st\r\n'));
assert(layoutText);
const size = /\[sizeof=(\d+), align=(\d+)\]/.exec(layoutText);
assert(size);
const offsets = {};
for (const field of record.inner.filter((node) => node.kind === 'FieldDecl')) {
  const offset = new RegExp(`^\\s*(\\d+) \\|\\s+[^\\n]+\\b${field.name}\\r?$`, 'm').exec(layoutText);
  assert(offset, `Missing compiler field offset ${field.name}`);
  offsets[field.name] = Number(offset[1]);
}
const instantiateEnum = ast.inner.find((node) => node.kind === 'EnumDecl' && node.name === 'CUgraphInstantiate_flags_enum');
assert(instantiateEnum);
function integer(node) { if (node?.value !== undefined) return node.value; for (const child of node?.inner ?? []) { const value = integer(child); if (value !== undefined) return value; } }
const deviceFlag = instantiateEnum.inner.find((node) => node.name === 'CUDA_GRAPH_INSTANTIATE_FLAG_DEVICE_LAUNCH');
assert(deviceFlag);
const flags = { deviceLaunch: Number(integer(deviceFlag)) };
assert.equal(flags.deviceLaunch, 4);
const facts = { schemaVersion: 1, profile: 'cuda-13.3-win64-device-continuation-candidate', source: { headerSha256, compiler: version, target, llvmRelease: 'llvmorg-20.1.8', llvmArchiveSha256: 'f229769f11d6a6edc8ada599c0cda964b7dee6ab1a08c6cf9dd7f513e85b107f' }, functions, kernelNode: { type: record.name, size: Number(size[1]), alignment: Number(size[2]), offsets }, flags };
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'header-facts.json'), JSON.stringify(facts, null, 2) + '\n');
writeFileSync(path.join(output, 'ffi-definitions.mjs'), `/* Generated from pinned NVIDIA headers by device-graph-facts.mjs. */\nexport const deviceGraphFfiDefinitions = Object.freeze(${JSON.stringify(ffi, null, 2)});\nexport const deviceGraphKernelNodeLayout = Object.freeze(${JSON.stringify(facts.kernelNode, null, 2)});\nexport const deviceGraphFlags = Object.freeze(${JSON.stringify(flags)});\n`);
console.log(JSON.stringify({ functions: selected.length, kernelNode: facts.kernelNode, source: facts.source }));
