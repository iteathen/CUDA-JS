import { createHash } from 'node:crypto';

import { CUDA_TARGET_BASES } from '../../../cuda-target/index.mjs';
import { providerTargetProfile } from '../contract.mjs';
import { combineCompilerCleanupFailures, CompilerRuntimeError } from '../errors.mjs';

const TARGET_CAPABILITIES = providerTargetProfile({
  revision: 'portable-compiler-mock-targets-v1',
  compile: CUDA_TARGET_BASES.map((base) => `compute_${base}`),
  link: CUDA_TARGET_BASES.map((base) => `sm_${base}`),
});

export async function createBackend() {
  let closed = false;
  let failureMode = 'none';
  let failLibraryClose = false;
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
      targetCapabilities: TARGET_CAPABILITIES,
      headerProfiles: Object.freeze({
        cudaCccl: Object.freeze({ profile: 'portable-mock-cuda-cccl-v1', algorithm: 'mock-only', roots: Object.freeze(['cuda', 'nv']), fileCount: 1, byteLength: 1, sha256: '0'.repeat(64) }),
      }),
    }),
  });
  function injectedDestroyFailure(kind, primaryFailure = null) {
    const compiler = kind === 'compile';
    const cleanupFailure = new CompilerRuntimeError(
      compiler ? 'COMPILER_INJECTED_DESTROY_FAILURE' : 'LINKER_INJECTED_DESTROY_FAILURE',
      'restart-required',
      compiler ? 'Injected compiler program destruction failure.' : 'Injected linker destruction failure.',
      { provider: 'portable-mock' },
      {
        operation: compiler ? 'mock.nvrtcDestroyProgram' : 'mock.nvJitLinkDestroy',
        healthBefore: 'healthy',
        healthAfter: 'restart-required',
      },
    );
    return combineCompilerCleanupFailures(primaryFailure, [cleanupFailure], {
      operation: cleanupFailure.operation,
      primaryOperation: compiler ? 'compiler.compile' : 'linker.link',
      inventory: resources,
    });
  }
  return {
    provider,
    resources,
    async prepareCompile() {},
    async compile(request) {
      if (failureMode === 'compile-create') throw new CompilerRuntimeError('COMPILER_INJECTED_CREATE_FAILURE', 'provider', 'Injected compiler program creation failure.');
      resources.programsCreated += 1;
      if (failureMode === 'compile-operation') {
        resources.programsDestroyed += 1;
        throw new CompilerRuntimeError('COMPILER_INJECTED_OPERATION_FAILURE', 'provider', 'Injected compiler operation failure.', {}, { operation: 'compiler.compile' });
      }
      if (failureMode === 'compile-operation-destroy') {
        throw injectedDestroyFailure('compile', new CompilerRuntimeError(
          'COMPILER_INJECTED_OPERATION_FAILURE',
          'provider',
          'Injected compiler operation failure.',
          { nativeStatus: 6 },
          { operation: 'compiler.compile' },
        ));
      }
      if (failureMode === 'compile-destroy') throw injectedDestroyFailure('compile');
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
        throw new CompilerRuntimeError('LINKER_INJECTED_OPERATION_FAILURE', 'provider', 'Injected linker operation failure.', {}, { operation: 'linker.link' });
      }
      if (failureMode === 'link-operation-destroy') {
        throw injectedDestroyFailure('link', new CompilerRuntimeError(
          'LINKER_INJECTED_OPERATION_FAILURE',
          'provider',
          'Injected linker operation failure.',
          { nativeStatus: 7 },
          { operation: 'linker.link' },
        ));
      }
      if (failureMode === 'link-destroy') throw injectedDestroyFailure('link');
      const hash = createHash('sha256').update(request.mode);
      for (const input of request.inputs) hash.update(input.bytes);
      resources.linksDestroyed += 1;
      return { bytes: Uint8Array.from(hash.digest()), log: '' };
    },
    setFailureMode(mode) {
      if (mode === 'close-libraries') failLibraryClose = true;
      else failureMode = mode;
    },
    async close() {
      if (failLibraryClose || failureMode === 'close-libraries') {
        const cleanupFailures = ['nvJitLink', 'nvrtc'].map((providerName) => new CompilerRuntimeError(
          'COMPILER_INJECTED_LIBRARY_CLOSE_FAILURE',
          'restart-required',
          'Injected compiler provider library close failure.',
          { provider: providerName },
          { operation: 'mock.library.close', healthBefore: 'healthy', healthAfter: 'restart-required' },
        ));
        throw combineCompilerCleanupFailures(null, cleanupFailures, {
          code: 'COMPILER_LIBRARY_CLOSE_FAILED',
          category: 'restart-required',
          message: 'One or more compiler provider libraries could not be closed.',
          operation: 'mock.library.close',
          inventory: resources,
        });
      }
      closed = true;
    },
    get closed() { return closed; },
  };
}
