import assert from 'node:assert/strict';
import { open, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import ffi from 'node:ffi';

import { resolveLinuxNativeProfile } from '../../components/compiler-actor/src/backends/native-profiles.mjs';
import { normalizeCompileOptions } from '../../components/compiler-actor/testing.mjs';
import { repositoryRoot } from './evidence.mjs';

assert.equal(process.platform, 'linux', 'F6 Linux readiness requires native Linux.');
assert.equal(process.arch, 'x64', 'F6 Linux readiness requires x86-64.');
assert.equal(process.version, 'v26.7.0', 'F6 Linux readiness requires exact Node v26.7.0.');

async function elfIdentity(file) {
  const handle = await open(file, 'r');
  try {
    const header = Buffer.alloc(20);
    const { bytesRead } = await handle.read(header, 0, header.byteLength, 0);
    const elf = bytesRead === 20 && header.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]));
    return {
      elf,
      class: header[4],
      endianness: header[5],
      machine: header.readUInt16LE(18),
      x86_64: elf && header[4] === 2 && header[5] === 1 && header.readUInt16LE(18) === 62,
    };
  } finally {
    await handle.close();
  }
}

let profile;
let probe;
let failure = null;
try {
  profile = await resolveLinuxNativeProfile();
  const identities = {
    nvrtc: await elfIdentity(profile.nvrtcPath),
    nvJitLink: await elfIdentity(profile.nvJitLinkPath),
  };
  assert(identities.nvrtc.x86_64 && identities.nvJitLink.x86_64, 'Manifest-pinned compiler providers must be x86-64 ELF files.');
  let nvrtcLibrary;
  let linkLibrary;
  try {
    nvrtcLibrary = new ffi.DynamicLibrary(profile.nvrtcPath);
    linkLibrary = new ffi.DynamicLibrary(profile.nvJitLinkPath);
    const nvrtc = nvrtcLibrary.getFunctions({ nvrtcVersion: { arguments: ['pointer', 'pointer'], return: 'i32' } });
    const linker = linkLibrary.getFunctions({ nvJitLinkVersion: { arguments: ['pointer', 'pointer'], return: 'i32' } });
    const nvrtcMajor = Buffer.alloc(4);
    const nvrtcMinor = Buffer.alloc(4);
    const linkMajor = Buffer.alloc(4);
    const linkMinor = Buffer.alloc(4);
    const nativeStatus = {
      nvrtc: nvrtc.nvrtcVersion(nvrtcMajor, nvrtcMinor),
      nvJitLink: linker.nvJitLinkVersion(linkMajor, linkMinor),
    };
    const versions = {
      nvrtc: `${nvrtcMajor.readInt32LE(0)}.${nvrtcMinor.readInt32LE(0)}`,
      nvJitLink: `${linkMajor.readUInt32LE(0)}.${linkMinor.readUInt32LE(0)}`,
    };
    probe = {
      attempted: true,
      status: nativeStatus.nvrtc === 0
        && nativeStatus.nvJitLink === 0
        && versions.nvrtc === profile.manifest.providers.nvrtc.version
        && versions.nvJitLink === profile.manifest.providers.nvJitLink.version
        ? 'ready'
        : 'version-query-failed',
      nativeStatus,
      versions,
      identities,
      librariesClosed: false,
    };
  } finally {
    try { linkLibrary?.close(); } finally { nvrtcLibrary?.close(); }
    if (probe) probe.librariesClosed = true;
  }
} catch (error) {
  failure = { code: error.code ?? 'COMPILER_READINESS_FAILED', category: error.category ?? 'unsupported', message: error.message };
  probe = { attempted: false, status: 'not-ready' };
}

const compileOptions = normalizeCompileOptions({}, 'linux').native;
assert.equal(compileOptions.at(-1), '--modify-stack-limit=false');
const ready = probe.status === 'ready' && probe.librariesClosed === true;
const record = {
  schemaVersion: 2,
  workPackage: 'CJS-F6L',
  capsule: 'native-linux-exact-compiler-provider-readiness',
  status: ready ? 'ready' : 'not-ready',
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    nodeAbi: process.versions.modules,
    platform: process.platform,
    architecture: process.arch,
    kernel: os.release(),
    osVersion: os.version(),
  },
  canonicalToolkitRoot: '/usr/local/cuda-13.3',
  providerProfile: profile ? {
    profile: profile.manifest.profile,
    providers: profile.manifest.providers,
    headerProfiles: profile.manifest.headerProfiles,
  } : null,
  probe,
  ...(failure ? { failure } : {}),
  compileOptions,
  next: ready
    ? 'Run the independent C and public CompilerActor compile/link parity capsule before support promotion.'
    : 'Install the exact manifest-pinned Ubuntu 24.04 CUDA 13.3 packages, then rerun without broadening discovery.',
  claimLimits: ['Exact manifest/readiness only.', 'No compile, link, Driver, GPU, package, performance, or Linux support claim.'],
};
const target = path.join(repositoryRoot, 'build', 'f6', 'linux-x64', 'evidence', 'readiness.json');
await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(record, null, 2)}\n`);
console.log(`F6 Linux exact provider readiness: ${record.status}. Evidence: ${path.relative(repositoryRoot, target)}`);
if (!ready) process.exitCode = 2;
