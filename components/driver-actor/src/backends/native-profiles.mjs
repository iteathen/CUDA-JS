import { createHash } from 'node:crypto';
import { createReadStream, existsSync, realpathSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DriverRuntimeError } from '../errors.mjs';

const LINUX_DRIVER_CANDIDATES = Object.freeze([
  '/usr/lib/x86_64-linux-gnu/libcuda.so.1',
  '/usr/lib64/libcuda.so.1',
]);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const WINDOWS_CUBLASLT_MANIFEST = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'win-x64', 'cublaslt-provider-manifest.json');
const WINDOWS_CUDA_ROOT = 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3';

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

export async function resolveWindowsCublasLtProfile({
  cudaPathV13_3 = process.env.CUDA_PATH_V13_3,
  cudaPath = process.env.CUDA_PATH,
  manifest,
  exists = existsSync,
  realpath = realpathSync.native,
  statFile = stat,
  hashFile = fileSha256,
} = {}) {
  const acceptedManifest = manifest ?? JSON.parse(await readFile(WINDOWS_CUBLASLT_MANIFEST, 'utf8'));
  const candidates = [cudaPathV13_3, cudaPath, WINDOWS_CUDA_ROOT].filter(Boolean).map((value) => path.win32.resolve(value));
  const expectedSuffix = path.win32.normalize('NVIDIA GPU Computing Toolkit\\CUDA\\v13.3').toLowerCase();
  const toolkitRoot = candidates.find((value) => value.toLowerCase().endsWith(expectedSuffix) && exists(value));
  if (!toolkitRoot) throw new DriverRuntimeError('CUBLASLT_PROVIDER_UNAVAILABLE', 'unsupported', 'The canonical CUDA 13.3 toolkit required by the admitted cuBLASLt profile is unavailable.');
  const providerPath = path.win32.join(toolkitRoot, 'bin', 'x64', acceptedManifest.provider.file);
  const headerPath = path.win32.join(toolkitRoot, 'include', 'cublasLt.h');
  for (const [kind, file, expected] of [['provider', providerPath, acceptedManifest.provider], ['header', headerPath, acceptedManifest.headers['cublasLt.h']]]) {
    if (!exists(file)) throw new DriverRuntimeError('CUBLASLT_PROVIDER_UNAVAILABLE', 'unsupported', `The admitted cuBLASLt ${kind} is unavailable.`);
    const resolved = realpath(file);
    if (resolved.toLowerCase() !== file.toLowerCase()) throw new DriverRuntimeError('CUBLASLT_PROVIDER_NONCANONICAL', 'unsupported', `The admitted cuBLASLt ${kind} path is not canonical.`);
    const info = await statFile(resolved);
    const digest = await hashFile(resolved);
    if (info.size !== expected.byteLength || digest !== expected.sha256) throw new DriverRuntimeError('CUBLASLT_PROVIDER_IDENTITY', 'unsupported', `The installed cuBLASLt ${kind} differs from the admitted exact profile.`);
  }
  return Object.freeze({ providerPath, manifest: acceptedManifest });
}

async function unavailableLinuxCublasLtProfile() {
  throw new DriverRuntimeError('CUBLASLT_PROFILE_UNAVAILABLE', 'unsupported', 'No exact native Linux cuBLASLt provider profile is admitted yet; portable contract support is unaffected.');
}

function profileUnsupported(expected, platform, architecture) {
  return new DriverRuntimeError(
    'DRIVER_PROFILE_UNSUPPORTED',
    'unsupported',
    `The native DriverActor backend requires ${expected}.`,
    { platform, architecture },
  );
}

export function resolveWindowsNativeProfile({
  platform = process.platform,
  architecture = process.arch,
  systemRoot = process.env.SystemRoot,
  exists = existsSync,
  realpath = realpathSync.native,
} = {}) {
  if (platform !== 'win32' || architecture !== 'x64') throw profileUnsupported('Windows x64', platform, architecture);
  if (!systemRoot) throw new DriverRuntimeError('DRIVER_SYSTEM_ROOT_MISSING', 'unsupported', 'SystemRoot is unavailable.');
  const expected = path.win32.resolve(systemRoot, 'System32', 'nvcuda.dll');
  if (!exists(expected)) throw new DriverRuntimeError('DRIVER_LIBRARY_MISSING', 'unsupported', 'The canonical Windows CUDA Driver is unavailable.');
  const resolved = realpath(expected);
  if (resolved.toLowerCase() !== expected.toLowerCase()) {
    throw new DriverRuntimeError('DRIVER_LIBRARY_NONCANONICAL', 'unsupported', 'The Windows CUDA Driver did not resolve to the canonical system path.');
  }
  return Object.freeze({
    backend: 'windows-native',
    driverPath: resolved,
    memoryClaim: 'exact-windows-f4w-profile',
    executionClaim: 'exact-windows-f5w-profile',
    cleanupClaim: 'proved-exact-windows-profile',
    resolveCublasLtProfile: resolveWindowsCublasLtProfile,
  });
}

export function resolveLinuxNativeProfile({
  platform = process.platform,
  architecture = process.arch,
  exists = existsSync,
  realpath = realpathSync.native,
} = {}) {
  if (platform !== 'linux' || architecture !== 'x64') throw profileUnsupported('native Linux x86-64', platform, architecture);
  const discovered = LINUX_DRIVER_CANDIDATES
    .filter((candidate) => exists(candidate))
    .map((candidate) => ({ candidate, resolved: realpath(candidate) }));
  if (discovered.length === 0) {
    throw new DriverRuntimeError('DRIVER_LIBRARY_MISSING', 'unsupported', 'A canonical native Linux libcuda.so.1 is unavailable.');
  }
  const identities = new Set(discovered.map(({ resolved }) => resolved));
  if (identities.size !== 1) {
    throw new DriverRuntimeError(
      'DRIVER_LIBRARY_AMBIGUOUS',
      'unsupported',
      'Canonical native Linux CUDA Driver locations resolve to different libraries.',
      { candidateCount: discovered.length, identityCount: identities.size },
    );
  }
  const driverPath = discovered[0].resolved;
  const acceptedDirectory = LINUX_DRIVER_CANDIDATES.some((candidate) => driverPath.startsWith(`${path.posix.dirname(candidate)}/`));
  if (!path.posix.isAbsolute(driverPath) || !acceptedDirectory || /(?:^|\/)stubs(?:\/|$)/i.test(driverPath)) {
    throw new DriverRuntimeError('DRIVER_LIBRARY_NONCANONICAL', 'unsupported', 'The native Linux CUDA Driver resolved outside the accepted runtime-library policy.');
  }
  return Object.freeze({
    backend: 'linux-native',
    driverPath,
    memoryClaim: 'native-linux-f4l-operational-unqualified',
    executionClaim: 'native-linux-f5l-operational-unqualified',
    cleanupClaim: 'proved-native-linux-profile-cleanup',
    resolveCublasLtProfile: unavailableLinuxCublasLtProfile,
  });
}
