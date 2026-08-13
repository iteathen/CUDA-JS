# CUDA-JS public runtime facade

`runtime.facade` is the accepted CJS-F8 package boundary. Applications import `openCudaRuntime`, `inspectCudaHost`, `CUDA_JS_COMPATIBILITY`, and `CudaJsError` from `cuda-js`. Native actors and their tokens are not package exports.

The native entry requires Node 26.1.0 or later on Windows x64 and Node's experimental FFI flag. Unconfirmed Node and CUDA hardware profiles operate automatically as `testing-unconfirmed`; only the published exact evidence profile is qualified. The optional compiler is disabled by default so Driver-only use does not require CUDA Toolkit providers. Pass `compiler: true` for a cache-disabled compiler or provide accepted cache options.

Function capabilities expose both terminal `launch()` compatibility and the SPEC-0016 `submit()` path. `submit()` returns an opaque `CudaOperation` with `status()`, `wait()`, and `close()`. `wait()` polls through short serialized DriverActor turns and does not itself impose the legacy launch deadline; closing a pending operation reports busy rather than pretending cancellation. One pending operation remains the first-slice limit.

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

`cuda-js/testing` exposes `openCudaRuntimeForTesting()` for portable consumer orchestration only. It never proves native CUDA behavior. Native SPEC-0016 support, native Linux, and WSL remain independently gated by their exact evidence requirements.
