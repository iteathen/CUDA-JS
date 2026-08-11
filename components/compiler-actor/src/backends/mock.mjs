import { createHash } from 'node:crypto';

export async function createBackend() {
  let closed = false;
  const resources = { programsCreated: 0, programsDestroyed: 0, linksCreated: 0, linksDestroyed: 0 };
  const provider = Object.freeze({
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    nodeAbi: process.versions.modules,
    identity: Object.freeze({ profile: 'portable-compiler-mock-v1', nvrtc: null, nvrtcBuiltins: null, nvJitLink: null }),
  });
  return {
    provider,
    resources,
    async compile(request) {
      resources.programsCreated += 1;
      const digest = createHash('sha256').update(request.source).digest('hex');
      resources.programsDestroyed += 1;
      return { bytes: Uint8Array.from(Buffer.from(`// portable mock PTX ${digest}\n`, 'ascii')), log: '' };
    },
    async link(request) {
      resources.linksCreated += 1;
      const hash = createHash('sha256');
      for (const input of request.inputs) hash.update(input.bytes);
      resources.linksDestroyed += 1;
      return { bytes: Uint8Array.from(hash.digest()), log: '' };
    },
    async close() { closed = true; },
    get closed() { return closed; },
  };
}
