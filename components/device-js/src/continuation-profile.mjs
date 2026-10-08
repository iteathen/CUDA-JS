import { deviceJsError } from './errors.mjs';

export const CONTINUATION_SUFFIX = '+SPEC-0020-device-continuation-v1';
export const CONTINUATION_HELPER = 'gpu.execution.tailSelf';
export const CONTINUATION_EXECUTION_PROFILE = 'device-continuation-v1';

function memberPath(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type !== 'MemberExpression' || node.computed || node.property?.type !== 'Identifier') return null;
  const base = memberPath(node.object);
  return base ? `${base}.${node.property.name}` : null;
}

export function continuationFunctions(ast, functions) {
  const result = new Set();
  for (const declaration of ast.body) {
    if (declaration.type !== 'FunctionDeclaration') continue;
    const fn = functions.find((entry) => entry.name === declaration.id?.name);
    let calls = 0;
    function visit(node, loop = false, parent = null) {
      if (!node || typeof node !== 'object') return;
      const inLoop = loop || ['ForStatement', 'WhileStatement', 'DoWhileStatement'].includes(node.type);
      if (node.type === 'CallExpression' && memberPath(node.callee) === CONTINUATION_HELPER) {
        calls += 1;
        if (fn?.kind !== 'kernel' || inLoop || parent?.type !== 'ExpressionStatement' || node.arguments.length !== 0 || calls > 1) {
          throw deviceJsError('DEVICE_JS_CONTINUATION_INVALID', 'Tail continuation requires one standalone zero-argument call outside loops in a kernel.', { function: fn?.name ?? null });
        }
        result.add(fn.name);
      }
      for (const [key, child] of Object.entries(node)) {
        if (['loc', 'start', 'end', 'range'].includes(key)) continue;
        if (Array.isArray(child)) child.forEach((entry) => visit(entry, inLoop, node));
        else if (child && typeof child === 'object') visit(child, inLoop, node);
      }
    }
    visit(declaration.body);
  }
  return result;
}

export function continuationPreludeLines() {
  return [
    '#include <cuda_device_runtime_api.h>',
    '__device__ __forceinline__ void djs_tail_self() {',
    '  auto graph = cudaGetCurrentGraphExec();',
    '  if (graph == nullptr || cudaGraphLaunch(graph, cudaStreamGraphTailLaunch) != cudaSuccess) { __trap(); }',
    '}',
    '',
  ];
}
