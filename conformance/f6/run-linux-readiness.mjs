import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, realpathSync } from 'node:fs';
import { mkdir, open, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import ffi from 'node:ffi';

import { normalizeCompileOptions } from '../../components/compiler-actor/testing.mjs';
import { repositoryRoot } from './evidence.mjs';

assert.equal(process.platform, 'linux', 'F6 Linux readiness requires native Linux.');
assert.equal(process.arch, 'x64', 'F6 Linux readiness requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F6 Linux readiness requires exact Node v26.7.0.');

const roots = [
  '/usr/local/cuda-13.3/targets/x86_64-linux/lib',
  '/usr/local/cuda-13.3/lib64',
  '/usr/lib/x86_64-linux-gnu',
];
const names = {
  nvrtc: ['libnvrtc.so.13', 'libnvrtc.so.13.3', 'libnvrtc.so'],
  nvJitLink: ['libnvJitLink.so.13', 'libnvJitLink.so.13.3', 'libnvJitLink.so'],
};

async function sha256(file) {
  const hash = createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = createReadStream(file);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });
  return hash.digest('hex');
}

async function elfIdentity(file) {
  const handle = await open(file, 'r');
  try {
    const header = Buffer.alloc(20);
    const { bytesRead } = await handle.read(header, 0, header.byteLength, 0);
    const elf = bytesRead === 20 && header.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]));
    return { elf, class: header[4], endianness: header[5], machine: header.readUInt16LE(18), x86_64: elf && header[4] === 2 && header[5] === 1 && header.readUInt16LE(18) === 62 };
  } finally {
    await handle.close();
  }
}

async function discover(kind) {
  for (const root of roots) {
    for (const name of names[kind]) {
      const candidate = path.join(root, name);
      if (!existsSync(candidate)) continue;
      const resolved = realpathSync.native(candidate);
      const identity = await elfIdentity(resolved);
      return { found: true, candidate, resolved, identity, sha256: await sha256(resolved) };
    }
  }
  return { found: false, searched: roots.flatMap((root) => names[kind].map((name) => path.join(root, name))) };
}

const providers = { nvrtc: await discover('nvrtc'), nvJitLink: await discover('nvJitLink') };
let probe = { attempted: false, status: 'providers-missing' };
if (providers.nvrtc.found && providers.nvJitLink.found && providers.nvrtc.identity.x86_64 && providers.nvJitLink.identity.x86_64) {
  let nvrtcLibrary;
  let linkLibrary;
  try {
    nvrtcLibrary = new ffi.DynamicLibrary(providers.nvrtc.resolved);
    linkLibrary = new ffi.DynamicLibrary(providers.nvJitLink.resolved);
    const nvrtc = nvrtcLibrary.getFunctions({ nvrtcVersion: { arguments: ['pointer', 'pointer'], return: 'i32' } });
    const linker = linkLibrary.getFunctions({
      nvJitLinkVersion: { arguments: ['pointer', 'pointer'], return: 'i32' },
      __nvJitLinkCreate_13_3: { arguments: ['pointer', 'u32', 'pointer'], return: 'i32' },
      __nvJitLinkDestroy_13_3: { arguments: ['pointer'], return: 'i32' },
      __nvJitLinkAddData_13_3: { arguments: ['pointer', 'i32', 'pointer', 'u64', 'pointer'], return: 'i32' },
      __nvJitLinkComplete_13_3: { arguments: ['pointer'], return: 'i32' },
      __nvJitLinkGetLinkedCubinSize_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
      __nvJitLinkGetLinkedCubin_13_3: { arguments: ['pointer', 'pointer'], return: 'i32' },
    });
    const nvrtcMajor = Buffer.alloc(4);
    const nvrtcMinor = Buffer.alloc(4);
    const linkMajor = Buffer.alloc(4);
    const linkMinor = Buffer.alloc(4);
    const nvrtcStatus = nvrtc.nvrtcVersion(nvrtcMajor, nvrtcMinor);
    const linkStatus = linker.nvJitLinkVersion(linkMajor, linkMinor);
    probe = {
      attempted: true,
      status: nvrtcStatus === 0 && linkStatus === 0 ? 'ready' : 'version-query-failed',
      nativeStatus: { nvrtc: nvrtcStatus, nvJitLink: linkStatus },
      versions: { nvrtc: `${nvrtcMajor.readInt32LE(0)}.${nvrtcMinor.readInt32LE(0)}`, nvJitLink: `${linkMajor.readUInt32LE(0)}.${linkMinor.readUInt32LE(0)}` },
      requiredExportsBound: nvrtcStatus === 0 && linkStatus === 0,
    };
  } catch (error) {
    probe = { attempted: true, status: 'load-or-export-failed', error: { code: error.code ?? null, message: error.message } };
  } finally {
    try { linkLibrary?.close(); } finally { nvrtcLibrary?.close(); }
  }
}

const compileOptions = normalizeCompileOptions({}, 'linux').native;
assert.equal(compileOptions.at(-1), '--modify-stack-limit=false');
const ready = probe.status === 'ready' && probe.versions.nvrtc === '13.3' && probe.versions.nvJitLink === '13.3';
const record = {
  schemaVersion: 1,
  workPackage: 'CJS-F6L',
  capsule: 'native-linux-compiler-provider-readiness',
  status: ready ? 'ready' : 'not-ready',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, nodeAbi: process.versions.modules, platform: process.platform, architecture: process.arch, kernel: os.release(), osVersion: os.version() },
  canonicalRoots: roots,
  providers,
  probe,
  compileOptions,
  next: ready ? 'Run the independent C and Node compile/link parity capsule before support promotion.' : 'Install or expose the exact CUDA 13.3 x86-64 toolkit providers, then rerun without broadening discovery.',
  claimLimits: ['Readiness only.', 'No compile, link, Driver, GPU, cleanup, or Linux support claim.'],
};
const target = path.join(repositoryRoot, 'build', 'f6', 'linux-x64', 'evidence', 'readiness.json');
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(record, null, 2)}\n`);
console.log(`F6 Linux provider readiness: ${record.status}. Evidence: ${path.relative(repositoryRoot, target)}`);
