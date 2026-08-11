import manifest from '../../packaging/compatibility-manifest.json' with { type: 'json' };

function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Array.isArray(value) ? value : Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export const CUDA_JS_COMPATIBILITY = freeze(manifest);
