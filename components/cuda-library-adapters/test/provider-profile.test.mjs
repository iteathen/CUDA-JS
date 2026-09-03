import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { resolveWindowsCublasLtProfile } from '../../driver-actor/src/backends/native-profiles.mjs';

const root = 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v13.3';
const manifest = Object.freeze({
  profile: 'test-cublaslt',
  provider: Object.freeze({ file: 'cublasLt64_13.dll', byteLength: 20, sha256: 'provider' }),
  headers: Object.freeze({ 'cublasLt.h': Object.freeze({ byteLength: 10, sha256: 'header' }) }),
});
function fixture(overrides = {}) {
  return {
    cudaPathV13_3: root,
    cudaPath: null,
    manifest,
    exists: () => true,
    realpath: (value) => value,
    statFile: async (value) => ({ size: value.endsWith('.h') ? 10 : 20 }),
    hashFile: async (value) => value.endsWith('.h') ? 'header' : 'provider',
    ...overrides,
  };
}

function unsupported(code) {
  return (error) => error.code === code && error.category === 'unsupported';
}

test('cuBLASLt provider profile is exact, canonical, and path-free to callers', async () => {
  const profile = await resolveWindowsCublasLtProfile(fixture());
  assert.equal(profile.providerPath, path.win32.join(root, 'bin', 'x64', 'cublasLt64_13.dll'));
  assert.equal(profile.manifest, manifest);
});

test('missing, noncanonical, and wrong-identity provider profiles fail before native resource creation', async () => {
  await assert.rejects(resolveWindowsCublasLtProfile(fixture({ exists: () => false })), unsupported('CUBLASLT_PROVIDER_UNAVAILABLE'));
  await assert.rejects(resolveWindowsCublasLtProfile(fixture({ realpath: (value) => `${value}.redirected` })), unsupported('CUBLASLT_PROVIDER_NONCANONICAL'));
  await assert.rejects(resolveWindowsCublasLtProfile(fixture({ hashFile: async () => 'wrong' })), unsupported('CUBLASLT_PROVIDER_IDENTITY'));
});
