import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const experimentRoot = path.join(repositoryRoot, 'experiments', 'exp-012');
export const buildRoot = path.join(repositoryRoot, 'build', 'exp-012', 'windows-x64');
export const nativeRoot = path.join(buildRoot, 'native');
export const evidenceRoot = path.join(buildRoot, 'evidence');
export const compatibilityManifestPath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'win-x64', 'compatibility-manifest.json');
export const sharedGeneratedRoot = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'linux-x64', 'generated');
export const nativeProbeSourcePath = path.join(sharedGeneratedRoot, 'native-abi-probe.c');
export const oracleSourcePath = path.join(experimentRoot, 'generated', 'oracle.c');
export const oracleExecutablePath = path.join(nativeRoot, 'cuda-driver-oracle.exe');
export const nativeProbeExecutablePath = path.join(nativeRoot, 'cuda-native-abi-probe.exe');
export const toolkitRoot = path.resolve(process.env.CUDA_PATH ?? 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3');
export const toolkitIncludePath = path.join(toolkitRoot, 'include');
export const toolkitImportLibraryPath = path.join(toolkitRoot, 'lib', 'x64', 'cuda.lib');
export const toolkitVersionPath = path.join(toolkitRoot, 'version.json');
export const driverPath = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'nvcuda.dll');
