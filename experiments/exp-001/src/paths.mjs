import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
export const experimentRoot = path.join(repositoryRoot, 'experiments', 'exp-001');
export const profilePath = path.join(experimentRoot, 'profile.json');
export const buildRoot = path.join(repositoryRoot, 'build', 'exp-001', 'linux-x64');
export const inputRoot = path.join(buildRoot, 'input');
export const extractedRoot = path.join(inputRoot, 'extracted');
export const nativeRoot = path.join(buildRoot, 'native');
export const evidenceRoot = path.join(buildRoot, 'evidence');
export const includeRoot = path.join(extractedRoot, 'usr', 'local', 'cuda-13.3', 'targets', 'x86_64-linux', 'include');
export const stubLibraryRoot = path.join(extractedRoot, 'usr', 'local', 'cuda-13.3', 'targets', 'x86_64-linux', 'lib', 'stubs');
export const nativeProbeSourcePath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'linux-x64', 'generated', 'native-abi-probe.c');
export const nativeLayoutsPath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'linux-x64', 'generated', 'native-layouts.json');
export const runtimeIrPath = path.join(repositoryRoot, 'schemas', 'cuda-13.3', 'linux-x64', 'generated', 'runtime-ir.json');
export const oracleSourcePath = path.join(experimentRoot, 'generated', 'oracle.c');
export const nativeProbeExecutablePath = path.join(nativeRoot, 'cuda-native-abi-probe');
export const oracleExecutablePath = path.join(nativeRoot, 'cuda-driver-oracle');
