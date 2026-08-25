import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';

import { DriverRuntimeError } from '../errors.mjs';

const LINUX_DRIVER_CANDIDATES = Object.freeze([
  '/usr/lib/x86_64-linux-gnu/libcuda.so.1',
  '/usr/lib64/libcuda.so.1',
]);

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
  });
}
