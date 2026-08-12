import { createHash } from 'node:crypto';

import { CompilerRuntimeError } from '../errors.mjs';

export async function createBackend() {
  let closed = false;
  let failureMode = 'none';
  const resources = { programsCreated: 0, programsDestroyed: 0, linksCreated: 0, linksDestroyed: 0 };
  const provider = Object.freeze({
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    nodeAbi: process.versions.modules,
    identity: Object.freeze({
      profile: 'portable-compiler-mock-v1',
      nvrtc: null,
      nvrtcBuiltins: null,
      nvJitLink: null,
      headerProfiles: Object.freeze({
        cudaCccl: Object.freeze({ profile: 'portable-mock-cuda-cccl-v1', algorithm: 'mock-only', roots: Object.freeze(['cuda', 'nv']), fileCount: 1, byteLength: 1, sha256: '0'.repeat(64) }),
      }),
    }),
  });
  return {
    provider,
    resources,
    async prepareCompile() {},
    async compile(request) {
      if (failureMode === 'compile-create') throw new CompilerRuntimeError('COMPILER_INJECTED_CREATE_FAILURE', 'provider', 'Injected compiler program creation failure.');
      resources.programsCreated += 1;
      if (failureMode === 'compile-operation') {
        resources.programsDestroyed += 1;
        throw new CompilerRuntimeError('COMPILER_INJECTED_OPERATION_FAILURE', 'provider', 'Injected compiler operation failure.');
      }
      if (failureMode === 'compile-destroy') throw new CompilerRuntimeError('COMPILER_INJECTED_DESTROY_FAILURE', 'restart-required', 'Injected compiler program destruction failure.', {}, { healthBefore: 'healthy', healthAfter: 'restart-required' });
      const digest = createHash('sha256').update(request.source).digest();
      resources.programsDestroyed += 1;
      if (request.output === 'lto-ir') return { bytes: Uint8Array.from(Buffer.concat([Buffer.from([0]), digest])), log: '' };
      return { bytes: Uint8Array.from(Buffer.from(`// portable mock PTX ${digest.toString('hex')}\n`, 'ascii')), log: '' };
    },
    async link(request) {
      if (failureMode === 'link-create') throw new CompilerRuntimeError('LINKER_INJECTED_CREATE_FAILURE', 'provider', 'Injected linker creation failure.');
      resources.linksCreated += 1;
      if (failureMode === 'link-operation') {
        resources.linksDestroyed += 1;
        throw new CompilerRuntimeError('LINKER_INJECTED_OPERATION_FAILURE', 'provider', 'Injected linker operation failure.');
      }
      if (failureMode === 'link-destroy') throw new CompilerRuntimeError('LINKER_INJECTED_DESTROY_FAILURE', 'restart-required', 'Injected linker destruction failure.', {}, { healthBefore: 'healthy', healthAfter: 'restart-required' });
      const hash = createHash('sha256').update(request.mode);
      for (const input of request.inputs) hash.update(input.bytes);
      resources.linksDestroyed += 1;
      return { bytes: Uint8Array.from(hash.digest()), log: '' };
    },
    setFailureMode(mode) { failureMode = mode; },
    async close() { closed = true; },
    get closed() { return closed; },
  };
}
