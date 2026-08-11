import { openCompilerRuntime } from '../../components/compiler-actor/index.mjs';
import { openDriverRuntime } from '../../components/driver-actor/index.mjs';

const target = process.argv[2];
try {
  if (target === 'driver') {
    const runtime = await openDriverRuntime();
    const description = await runtime.describe();
    const terminal = await runtime.close();
    console.log(JSON.stringify({ ok: true, target, backend: description.runtime.backend, graceful: terminal.graceful, workerExitCode: terminal.workerExitCode }));
  } else if (target === 'compiler') {
    const runtime = await openCompilerRuntime({ cacheMode: 'disabled' });
    const status = await runtime.status();
    const terminal = await runtime.close();
    console.log(JSON.stringify({ ok: true, target, backend: status.runtime.backend, graceful: terminal.graceful, workerExitCode: terminal.workerExitCode }));
  } else {
    console.log(JSON.stringify({ ok: false, target, code: 'F7_PERMISSION_TARGET_INVALID', category: 'validation' }));
  }
} catch (error) {
  console.log(JSON.stringify({ ok: false, target, name: error?.name ?? 'Error', code: error?.code ?? 'UNKNOWN', category: error?.category ?? 'unknown' }));
}
