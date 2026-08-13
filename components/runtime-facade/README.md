# CUDA-JS public runtime facade

`runtime.facade` is the accepted CJS-F8 package boundary. Applications import `openCudaRuntime`, `compileDeviceProgram`, `inspectCudaHost`, `CUDA_JS_COMPATIBILITY`, and `CudaJsError` from `cuda-js`. Native actors and their tokens are not package exports.

The native entry requires Node 26.1.0 or later on Windows x64 and Node's experimental FFI flag. Unconfirmed Node and CUDA hardware profiles operate automatically as `testing-unconfirmed`; only the published exact evidence profile is qualified. The optional compiler is disabled by default so Driver-only use does not require CUDA Toolkit providers. Pass `compiler: true` for a cache-disabled compiler or provide accepted cache options.

`compileDeviceProgram(runtime, request)` is the optional SPEC-0013 authoring bridge. It consumes the separate `runtime.device-js` translator, passes only private generated CUDA source into the runtime's existing `compile()` port, and returns the bounded Device-JS descriptor plus the ordinary compiler result. It does not add Device-JS state to every runtime instance, expose generated CUDA/AST data, or create a second compiler/resource owner.

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
