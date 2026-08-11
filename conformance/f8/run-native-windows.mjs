import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { consumersRoot, evidenceRoot, packageRoot, repositoryRoot, sourceIdentity, writeEvidence } from './evidence.mjs';

assert.equal(process.platform, 'win32', 'F8W native package conformance requires Windows.');
assert.equal(process.arch, 'x64', 'F8W native package conformance requires Windows x64.');
assert.equal(process.version, 'v26.7.0', 'F8W native package conformance requires exact Node v26.7.0.');
const node = process.env.CUDA_JS_F8_NODE ?? process.execPath;
const npmCli = process.env.CUDA_JS_F8_NPM_CLI;
assert(npmCli && existsSync(npmCli), 'F8W native package conformance requires the selected npm CLI.');

function runNode(args, cwd) {
  const result = spawnSync(node, args, { cwd, encoding: 'utf8', env: { ...process.env, CUDA_JS_F8_NODE: node, CUDA_JS_F8_NPM_CLI: npmCli } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed (${result.status}): ${node} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

const portable = JSON.parse(await readFile(path.join(evidenceRoot, 'portable-package.json'), 'utf8'));
assert.equal(portable.status, 'pass');
const tarball = path.join(packageRoot, portable.package.filename);
assert(existsSync(tarball), 'Run F8 portable packaging before native package conformance.');
const directory = path.join(consumersRoot, 'consumer-native-windows');
await rm(directory, { recursive: true, force: true });
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, 'package.json'), `${JSON.stringify({ name: 'cuda-js-native-windows-consumer', version: '1.0.0', private: true, type: 'module' }, null, 2)}\n`);
await cp(path.join(repositoryRoot, 'conformance', 'f8', 'fixtures', 'consumer-native-windows.mjs'), path.join(directory, 'consumer.mjs'));
await cp(path.join(repositoryRoot, 'conformance', 'f5', 'fixtures', 'vector-add.ptx.txt'), path.join(directory, 'vector-add.ptx.txt'));
runNode([npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', tarball], directory);
const installed = path.join(directory, 'node_modules', 'cuda-js');
assert(existsSync(installed));
const output = runNode(['--experimental-ffi', 'consumer.mjs'], directory);
const observation = JSON.parse(output.split(/\r?\n/).at(-1));
assert.equal(observation.checksum, 15_600_773);
assert.equal(observation.graceful, true);
runNode([npmCli, 'uninstall', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', 'cuda-js'], directory);
assert(!existsSync(installed));

const target = await writeEvidence('native-windows-package.json', {
  schemaVersion: 1,
  workPackage: 'CJS-F8W',
  capsule: 'installed-package-native-windows-vector-consumer',
  status: 'pass',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, architecture: process.arch },
  sources: await sourceIdentity([
    'docs/specs/SPEC-0008-package-public-facade.md',
    'components/runtime-facade/src/runtime.mjs',
    'conformance/f8/fixtures/consumer-native-windows.mjs',
    'conformance/f5/fixtures/vector-add.ptx.txt',
  ]),
  package: portable.package,
  observation,
  claimLimits: ['Exact installed Windows x64 Node 26.7.0 package and accepted Driver/GPU profile only.', 'Existing F5 independent native C evidence remains the output oracle.', 'No Linux, performance, strict-JIT, process-isolation, registry-release, or production-stability claim.'],
});
console.log(`F8W installed-package native consumer passed with checksum ${observation.checksum}; evidence: ${target}`);
