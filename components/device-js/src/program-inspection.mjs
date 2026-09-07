import { parse } from 'acorn';

function codeUnitCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function memberPath(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type !== 'MemberExpression' || node.computed || node.property?.type !== 'Identifier') return null;
  const object = memberPath(node.object);
  return object ? `${object}.${node.property.name}` : null;
}

function visit(value, helpers) {
  if (Array.isArray(value)) {
    for (const child of value) visit(child, helpers);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (value.type === 'CallExpression') {
    const path = memberPath(value.callee);
    if (path?.startsWith('gpu.')) helpers.add(path);
  }
  for (const [key, child] of Object.entries(value)) {
    if (['loc', 'start', 'end', 'range'].includes(key)) continue;
    visit(child, helpers);
  }
}

export function inspectValidatedDeviceProgramUsage(source, translated) {
  const ast = parse(source, { ecmaVersion: 2024, sourceType: 'script', locations: false, allowHashBang: false });
  const byName = new Map();
  for (const statement of ast.body) {
    if (statement?.type !== 'FunctionDeclaration' || statement.id?.type !== 'Identifier') continue;
    const helpers = new Set();
    visit(statement.body, helpers);
    byName.set(statement.id.name, Object.freeze([...helpers].sort(codeUnitCompare)));
  }
  return Object.freeze(translated.functions.map(({ name }) => Object.freeze({
    function: name,
    helpers: byName.get(name) ?? Object.freeze([]),
  })));
}
