import { translateDeviceProgram } from '../../device-js/index.mjs';

import { freezePublic, publicError } from './errors.mjs';

export async function compileDeviceProgram(runtime, request) {
  try {
    if (!runtime || typeof runtime.compile !== 'function') throw Object.assign(new Error('compileDeviceProgram requires an open CUDA-JS runtime.'), { code: 'DEVICE_JS_RUNTIME_INVALID', category: 'validation', details: {} });
    const translated = translateDeviceProgram(request);
    const compiler = await runtime.compile({
      source: translated.generatedSource,
      name: translated.generatedName,
      options: translated.compile,
    });
    return freezePublic({
      schemaVersion: 1,
      deviceProgram: {
        contract: translated.contract,
        sha256: translated.sha256,
        parser: translated.parser,
        functions: translated.functions,
        kernels: translated.kernels,
      },
      compiler,
    });
  } catch (error) {
    throw publicError(error, 'device-js.compile');
  }
}
