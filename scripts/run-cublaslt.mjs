import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const action = process.argv[2] ?? 'portable';
const node = process.env.CUDA_JS_NODE ?? process.execPath;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).\n${result.stdout}\n${result.stderr}`);
  return result.stdout?.trim() ?? '';
}

if (!['portable', 'native'].includes(action)) throw new Error(`Unknown cuBLASLt validation action: ${action}`);
run(node, ['--experimental-ffi', '--test', 'components/cuda-library-adapters/test/public-cublaslt.test.mjs', 'components/cuda-library-adapters/test/provider-profile.test.mjs', 'components/cuda-library-adapters/test/capability-projection.test.mjs', 'components/cuda-library-adapters/test/borrower-lifecycle.test.mjs'], { stdio: 'inherit' });
if (action === 'portable') process.exit(0);
assert.equal(process.version, 'v26.7.0', 'Native cuBLASLt qualification requires exact Node v26.7.0.');
assert.equal(process.platform, 'win32');
assert.equal(process.arch, 'x64');
const toolkitRoot = process.env.CUDA_PATH_V13_3 ?? process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3';
const vsDevCmd = [process.env.VSDEVCMD, 'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat', 'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat', 'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat'].filter(Boolean).find((candidate) => existsSync(candidate));
assert(vsDevCmd, 'MSVC x64 tools are unavailable.');
const includeDirectory = path.join(toolkitRoot, 'include');
const cublasLibrary = path.join(toolkitRoot, 'lib', 'x64', 'cublasLt.lib');
const runtimeLibrary = path.join(toolkitRoot, 'lib', 'x64', 'cudart.lib');
assert(existsSync(cublasLibrary) && existsSync(runtimeLibrary), 'CUDA 13.3 cuBLASLt/runtime import libraries are unavailable.');
const outputRoot = path.join(root, 'build', 'conformance', 'cublaslt');
await mkdir(outputRoot, { recursive: true });
const executable = path.join(outputRoot, 'cublaslt-oracle.exe');
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const object = path.join(outputRoot, 'cublaslt-oracle.obj');
const compile = [`call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`, `cl /nologo /std:c++17 /EHsc /O2 /W4 /WX /wd4505 ${quote(path.join(root, 'conformance', 'cublaslt', 'oracle.cpp'))} /I${quote(includeDirectory)} ${quote(cublasLibrary)} ${quote(runtimeLibrary)} /Fo:${quote(object)} /Fe:${quote(executable)}`].join(' && ');
run(compile, [], { shell: true, stdio: 'inherit' });
const oracle = JSON.parse(run(executable, []));
const publicRecord = JSON.parse(run(node, ['--experimental-ffi', path.join(root, 'conformance', 'cublaslt', 'public-native.mjs')]).split(/\r?\n/).at(-1));
const manifest = JSON.parse(await readFile(path.join(root, 'schemas', 'cuda-13.3', 'win-x64', 'cublaslt-provider-manifest.json'), 'utf8'));
assert.equal(String(oracle.version), manifest.provider.version);
assert.deepEqual({ sizeofAlgorithm: oracle.sizeofAlgorithm, sizeofHeuristic: oracle.sizeofHeuristic, workspaceOffset: oracle.workspaceOffset, stateOffset: oracle.stateOffset, wavesOffset: oracle.wavesOffset }, { sizeofAlgorithm: 64, sizeofHeuristic: 96, workspaceOffset: 64, stateOffset: 72, wavesOffset: 76 });
assert.deepEqual(oracle.output, [58, 64, 139, 154]);
assert.deepEqual(publicRecord.output, oracle.output);
assert.equal(publicRecord.workspaceBytes, oracle.workspaceBytes);
assert.equal(publicRecord.status, 'completed');
const evidence = { schemaVersion: 1, status: 'pass', node: process.version, platform: process.platform, architecture: process.arch, providerProfile: manifest.profile, oracle, publicRecord };
await writeFile(path.join(outputRoot, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Exact cuBLASLt ABI/numerical/public-lifecycle qualification passed; evidence: ${path.join(outputRoot, 'evidence.json')}`);
