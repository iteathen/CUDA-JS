# CUDA-JS public runtime facade

`runtime.facade` is the accepted CJS-F8 package boundary. Applications import `openCudaRuntime`, `compileDeviceProgram`, `inspectCudaHost`, `CUDA_JS_COMPATIBILITY`, and `CudaJsError` from `cuda-js`. Native actors and their tokens are not package exports.

The native entry requires Node 26.1.0 or later on Windows x64 and Node's experimental FFI flag. Unconfirmed Node and CUDA hardware profiles operate automatically as `testing-unconfirmed`; only the published exact evidence profile is qualified. The optional compiler is disabled by default so Driver-only use does not require CUDA Toolkit providers. Pass `compiler: true` for a cache-disabled compiler or provide accepted cache options.

`compileDeviceProgram(runtime, request)` is the optional SPEC-0013 authoring bridge. It consumes the separate `runtime.device-js` translator, passes only private generated CUDA source into the runtime's existing `compile()` port, and returns the bounded Device-JS descriptor plus the ordinary compiler result. It does not add Device-JS state to every runtime instance, expose generated CUDA/AST data, or create a second compiler/resource owner.

Resource close failures retain the accepted bounded disposal category, native observation name, and health transition. A resource whose disposer ran and failed becomes orphaned/unusable, and repeated `close()` returns the stored failure without retrying native disposal. Poisoned or restart-required outcomes immediately constrain subsequent admission. Runtime-open rollback and aggregate close reports retain sanitized primary/cleanup divergence without exposing actor tokens, provider paths, or native capabilities.

```js
import { openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime({ compiler: false });
try {
  const memory = await runtime.allocateDevice({ byteLength: 4096 });
  await memory.write(new Uint8Array(4096));
  const copy = await memory.read({ byteLength: 4096 });
  await memory.close();
  console.log(copy.bytes.byteLength);
} finally {
  const terminal = await runtime.close();
  if (!terminal.graceful) throw new Error('CUDA-JS cleanup is unproved; restart the process.');
}
```

`cuda-js/testing` exposes `openCudaRuntimeForTesting()` for portable consumer orchestration only. It never proves native CUDA behavior. Native Linux and WSL imports fail with stable backend-unavailable errors while their retained runbooks remain independently completable.

The current scalar and operation surface is explicit. Given copied `ptxBytes` for a matching kernel:

```js
const module = await runtime.loadModule({ format: 'ptx', bytes: ptxBytes });
try {
  const fn = await module.getFunction({
    name: 'typed_kernel',
    parameters: [{ kind: 'device-memory' }, { kind: 'u64' }, { kind: 'i32' }, { kind: 'f32' }],
  });
  const memory = await runtime.allocateDevice({ byteLength: 4096 });
  try {
    const operation = await fn.submit({
      grid: { x: 1, y: 1, z: 1 },
      block: { x: 64, y: 1, z: 1 },
      arguments: [memory, 0xffff_ffff_ffff_ffffn, -2, 1.5],
    });
    try {
      const result = await operation.wait();
    } finally {
      await operation.close();
    }
  } finally {
    await memory.close();
    await fn.close();
  }
} finally {
  await module.close();
}
```

Only one operation may be pending in a runtime in SPEC-0016 v1. `fn.launch(...)` remains the terminal compatibility convenience. The added scalar and operation contracts are implemented in portable/software/package paths and retain separate native qualification gates.

Typed RDC, Device LTO, and Device-JS use the same optional CompilerActor owner:

```js
import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';

const runtime = await openCudaRuntime({ compiler: true });
try {
  const rdc = await runtime.compile({
    source: 'extern "C" __global__ void kernel() {}',
    options: { relocatableDeviceCode: true },
  });
  const lto = await runtime.compile({
    source: 'extern "C" __global__ void kernel() {}',
    output: 'lto-ir',
  });
  const program = await compileDeviceProgram(runtime, {
    source: 'function fill(output) { const i = gpu.thread.globalX(); output[i] = gpu.u32(7); }',
    functions: [{ name: 'fill', kind: 'kernel', parameters: [{ name: 'output', type: 'ptr<u32>' }], returns: 'void' }],
  });
} finally {
  const terminal = await runtime.close();
  if (!terminal.graceful) throw new Error('CUDA-JS cleanup is unproved; restart the process.');
}
```

PTX remains the default compiler output. LTO linking accepts homogeneous typed LTO-IR artifacts only, and generated CUDA source remains private. Full executable installed-package examples live in [`conformance/f8/fixtures/consumer-memory.mjs`](../../conformance/f8/fixtures/consumer-memory.mjs) and [`conformance/f8/fixtures/consumer-compiler.mjs`](../../conformance/f8/fixtures/consumer-compiler.mjs).
