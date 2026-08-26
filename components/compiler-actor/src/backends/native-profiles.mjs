import { createHash } from 'node:crypto';
import { createReadStream, existsSync, realpathSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CompilerRuntimeError } from '../errors.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const WINDOWS_MANIFEST = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'win-x64', 'compiler-provider-manifest.json');
const LINUX_MANIFEST = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'linux-x64', 'compiler-provider-manifest.json');
const WINDOWS_DEFAULT_ROOT = 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3';
const LINUX_TOOLKIT_ROOT = '/usr/local/cuda-13.3';

function profileUnsupported(expected, platform, architecture) {
  return new CompilerRuntimeError(
    'COMPILER_PROFILE_UNSUPPORTED',
    'unsupported',
    `The native CompilerActor backend requires ${expected}.`,
    { platform, architecture },
  );
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

async function readProviderManifest(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function verifyFile(file, record, {
  exists,
  realpath,
  statFile,
  hashFile,
  caseInsensitive,
  kind,
}) {
  if (!exists(file)) {
    throw new CompilerRuntimeError(
      kind === 'header' ? 'COMPILER_HEADER_MISSING' : 'COMPILER_PROVIDER_MISSING',
      'unsupported',
      `Required compiler ${kind} ${record.file ?? record.name} is unavailable.`,
    );
  }
  const resolved = realpath(file);
  const samePath = caseInsensitive ? resolved.toLowerCase() === file.toLowerCase() : resolved === file;
  if (!samePath) {
    throw new CompilerRuntimeError(
      kind === 'header' ? 'COMPILER_HEADER_NONCANONICAL' : 'COMPILER_PROVIDER_NONCANONICAL',
      'unsupported',
      `Compiler ${kind} ${record.file ?? record.name} is not canonical.`,
    );
  }
  const info = await statFile(resolved);
  const digest = await hashFile(resolved);
  if ((record.byteLength !== undefined && info.size !== record.byteLength) || digest !== record.sha256) {
    throw new CompilerRuntimeError(
      kind === 'header' ? 'COMPILER_HEADER_IDENTITY' : 'COMPILER_PROVIDER_IDENTITY',
      'unsupported',
      `Compiler ${kind} ${record.file ?? record.name} differs from the accepted profile.`,
    );
  }
  return resolved;
}

async function verifiedProfile({
  backend,
  manifest,
  toolkitRoot,
  providerDirectory,
  includeDirectory,
  ccclRoot,
  claim,
  cleanupClaim,
  pathApi,
  exists,
  realpath,
  statFile,
  hashFile,
  caseInsensitive = false,
}) {
  const providerPaths = {};
  for (const [name, record] of Object.entries(manifest.providers)) {
    providerPaths[name] = await verifyFile(pathApi.join(providerDirectory, record.file), record, {
      exists, realpath, statFile, hashFile, caseInsensitive, kind: 'provider',
    });
  }
  for (const [name, record] of Object.entries(manifest.headers)) {
    const headerRecord = typeof record === 'string' ? { name, sha256: record } : { name, ...record };
    await verifyFile(pathApi.join(includeDirectory, name), headerRecord, {
      exists, realpath, statFile, hashFile, caseInsensitive, kind: 'header',
    });
  }
  return Object.freeze({
    backend,
    manifest,
    toolkitRoot,
    nvrtcPath: providerPaths.nvrtc,
    nvJitLinkPath: providerPaths.nvJitLink,
    includeRoot: includeDirectory,
    ccclRoot,
    claim,
    cleanupClaim,
  });
}

export async function resolveWindowsNativeProfile({
  platform = process.platform,
  architecture = process.arch,
  cudaPathV13_3 = process.env.CUDA_PATH_V13_3,
  cudaPath = process.env.CUDA_PATH,
  manifest,
  exists = existsSync,
  realpath = realpathSync.native,
  statFile = stat,
  hashFile = fileSha256,
} = {}) {
  if (platform !== 'win32' || architecture !== 'x64') throw profileUnsupported('Windows x64', platform, architecture);
  const acceptedManifest = manifest ?? await readProviderManifest(WINDOWS_MANIFEST);
  const expectedSuffix = path.win32.normalize('NVIDIA GPU Computing Toolkit\\CUDA\\v13.3').toLowerCase();
  const candidate = [cudaPathV13_3, cudaPath, WINDOWS_DEFAULT_ROOT]
    .filter(Boolean)
    .map((value) => path.win32.resolve(value))
    .find((value) => value.toLowerCase().endsWith(expectedSuffix) && exists(value));
  if (!candidate) throw new CompilerRuntimeError('COMPILER_TOOLKIT_MISSING', 'unsupported', 'The canonical CUDA 13.3 toolkit installation is unavailable.');
  const toolkitRoot = realpath(candidate);
  if (toolkitRoot.toLowerCase() !== candidate.toLowerCase()) {
    throw new CompilerRuntimeError('COMPILER_TOOLKIT_NONCANONICAL', 'unsupported', 'The CUDA 13.3 toolkit root is not canonical.');
  }
  return verifiedProfile({
    backend: 'windows-native',
    manifest: acceptedManifest,
    toolkitRoot,
    providerDirectory: path.win32.join(toolkitRoot, 'bin', 'x64'),
    includeDirectory: path.win32.join(toolkitRoot, 'include'),
    ccclRoot: path.win32.join(toolkitRoot, 'include', 'cccl'),
    claim: 'exact-windows-f6w-profile',
    cleanupClaim: 'proved-native-resources-and-libraries',
    pathApi: path.win32,
    exists,
    realpath,
    statFile,
    hashFile,
    caseInsensitive: true,
  });
}

export async function resolveLinuxNativeProfile({
  platform = process.platform,
  architecture = process.arch,
  manifest,
  exists = existsSync,
  realpath = realpathSync.native,
  statFile = stat,
  hashFile = fileSha256,
} = {}) {
  if (platform !== 'linux' || architecture !== 'x64') throw profileUnsupported('native Linux x86-64', platform, architecture);
  if (!exists(LINUX_TOOLKIT_ROOT)) throw new CompilerRuntimeError('COMPILER_TOOLKIT_MISSING', 'unsupported', 'The canonical CUDA 13.3 toolkit installation is unavailable.');
  const toolkitRoot = realpath(LINUX_TOOLKIT_ROOT);
  if (toolkitRoot !== LINUX_TOOLKIT_ROOT) {
    throw new CompilerRuntimeError('COMPILER_TOOLKIT_NONCANONICAL', 'unsupported', 'The CUDA 13.3 toolkit root is not canonical.');
  }
  const acceptedManifest = manifest ?? await readProviderManifest(LINUX_MANIFEST);
  const targetRoot = path.posix.join(toolkitRoot, 'targets', 'x86_64-linux');
  return verifiedProfile({
    backend: 'linux-native',
    manifest: acceptedManifest,
    toolkitRoot,
    providerDirectory: path.posix.join(targetRoot, 'lib'),
    includeDirectory: path.posix.join(targetRoot, 'include'),
    ccclRoot: path.posix.join(targetRoot, 'include', 'cccl'),
    claim: 'native-linux-f6l-profile-unqualified',
    cleanupClaim: 'proved-native-resources-and-libraries',
    pathApi: path.posix,
    exists,
    realpath,
    statFile,
    hashFile,
  });
}
