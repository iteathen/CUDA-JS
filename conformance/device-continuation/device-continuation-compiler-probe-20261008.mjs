import { compileDeviceProgram, openCudaRuntime } from 'cuda-js';
const runtime = await openCudaRuntime({ compiler: true });
try {
  const result = await compileDeviceProgram(runtime, {
    source: 'function step(state) { state[gpu.u32(0)] = state[gpu.u32(0)] + gpu.u32(1); if (state[gpu.u32(0)] < gpu.u32(8)) { gpu.execution.tailSelf(); } }',
    functions: [{ name: 'step', kind: 'kernel', parameters: [{ name: 'state', type: 'ptr<u32>' }], returns: 'void' }],
  });
  const text = new TextDecoder().decode(result.compiler.artifact.bytes);
  console.log(JSON.stringify({ compiled: true, format: result.compiler.artifact.format, executionProfile: result.deviceProgram.kernels[0].executionProfile, externalDeviceSymbols: [...text.matchAll(/\.extern\s+\.func\s+(?:\([^)]*\)\s*)?([A-Za-z_$][\w$]*)/g)].map((match) => match[1]) }));
  const linked = await runtime.link({ inputs: [result.compiler.artifact], options: { architecture: 'sm_75' } });
  console.log(JSON.stringify({ linkedWithoutRuntimeArchive: true, format: linked.artifact.format }));
} catch (error) {
  console.log(JSON.stringify({ compiled: false, code: error.code, category: error.category, details: error.details }));
  process.exitCode = 1;
} finally {
  const terminal = await runtime.close();
  console.log(JSON.stringify({ graceful: terminal.graceful, driver: terminal.driver?.resourceCounts, compiler: terminal.compiler?.resourceCounts }));
}
