import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const experimentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const repositoryRoot = path.resolve(experimentRoot, '..', '..');
export const generatedRoot = path.join(experimentRoot, 'generated');
export const buildRoot = path.join(repositoryRoot, 'build', 'exp-000');
export const nativeRoot = path.join(buildRoot, 'native');
export const evidenceRoot = path.join(buildRoot, 'evidence');
export const runtimeIrPath = path.join(generatedRoot, 'runtime-ir.json');
export const nativeLibraryPath = path.join(
  nativeRoot,
  process.platform === 'win32' ? 'synthetic_abi.dll' : 'libsynthetic_abi.so',
);
export const oraclePath = path.join(
  nativeRoot,
  process.platform === 'win32' ? 'oracle.exe' : 'oracle',
);
