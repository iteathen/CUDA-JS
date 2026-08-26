import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { evidenceRoot, repositoryRoot, sha256 } from './evidence.mjs';

function quote(value) { return `"${String(value).replaceAll('"', '""')}"`; }

function run(executable, args = [], options = {}) {
  const result = spawnSync(executable, args, { cwd: repositoryRoot, encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error([`Command failed (${result.status}): ${executable} ${args.join(' ')}`, result.stdout, result.stderr].filter(Boolean).join('\n'));
  return result.stdout ?? '';
}

export async function buildAndRunDenseNumericOracle() {
  assert(['win32', 'linux'].includes(process.platform) && process.arch === 'x64', 'Dense numeric oracle requires native Windows or Linux x64.');
  if (process.platform === 'linux') assert.doesNotMatch(os.release(), /microsoft/i, 'Dense numeric Linux evidence does not accept WSL.');
  const sourceRelative = 'conformance/f8/native/dense-numeric-oracle.cu';
  const source = path.join(repositoryRoot, sourceRelative);
  const outputDirectory = path.join(path.dirname(evidenceRoot), 'native');
  const executable = path.join(outputDirectory, `dense-numeric-oracle${process.platform === 'win32' ? '.exe' : ''}`);
  await mkdir(outputDirectory, { recursive: true });

  let toolkitRoot;
  let nvcc;
  let build;
  if (process.platform === 'win32') {
    toolkitRoot = path.resolve(process.env.CUDA_PATH_V13_3 ?? process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
    nvcc = path.join(toolkitRoot, 'bin', 'nvcc.exe');
    const vsDevCmd = [
      process.env.VSDEVCMD,
      'C:\\Program Files\\Microsoft Visual Studio\\18\\Community\\Common7\\Tools\\VsDevCmd.bat',
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\Common7\\Tools\\VsDevCmd.bat',
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\BuildTools\\Common7\\Tools\\VsDevCmd.bat',
    ].filter(Boolean).find((candidate) => existsSync(candidate));
    assert(vsDevCmd, 'MSVC x64 tools were not found. Set VSDEVCMD to VsDevCmd.bat.');
    assert(existsSync(nvcc), `CUDA 13.3 nvcc is missing: ${nvcc}`);
    const command = [
      `call ${quote(vsDevCmd)} -arch=x64 -host_arch=x64 >nul`,
      `${quote(nvcc)} -arch=sm_75 --std=c++17 --fmad=false -Xcompiler /Zc:preprocessor ${quote(source)} -o ${quote(executable)}`,
    ].join(' && ');
    run(command, [], { shell: true });
    build = { command };
  } else {
    toolkitRoot = '/usr/local/cuda-13.3';
    nvcc = path.join(toolkitRoot, 'bin', 'nvcc');
    assert(existsSync(nvcc), `CUDA 13.3 nvcc is missing: ${nvcc}`);
    const version = run(nvcc, ['--version']).trim();
    assert.match(version, /release 13\.3,/u, 'Dense numeric oracle requires CUDA 13.3 nvcc.');
    const args = ['-arch=sm_75', '--std=c++17', '--fmad=false', source, '-o', executable];
    run(nvcc, args);
    build = { executable: nvcc, version, arguments: args };
  }

  const oraclePath = process.platform === 'win32'
    ? `${path.join(toolkitRoot, 'bin')};${process.env.Path ?? ''}`
    : process.env.PATH;
  const output = run(executable, [], { env: { ...process.env, Path: oraclePath, PATH: oraclePath } }).trim();
  const observation = JSON.parse(output.split(/\r?\n/u).at(-1));
  assert.deepEqual(observation, {
    f64Bits: ['4010000000000000', '0000000000000000', '8000000000000000'],
    f16Bits: [0x4400, 0x7fff],
    bf16Bits: [0xbf80, 0x7fff],
    words: [0, 3, 1, 0],
    cleanup: true,
  });
  return {
    sourceRelative,
    observation,
    build,
    artifacts: { sourceSha256: await sha256(source), executableSha256: await sha256(executable) },
  };
}
