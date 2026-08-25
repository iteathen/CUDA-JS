import { createHash } from 'node:crypto';

import { parse, version as acornVersion } from 'acorn';
import { CUDA_TARGET_POLICY_IDENTITY } from '../../cuda-target/index.mjs';

import { DEVICE_JS_CONTRACT as CONTRACT, isScopedAtomicHelper, isVoidHelper } from './contract-profile.mjs';
import { deviceJsError } from './errors.mjs';
import { translateDeviceProgram as translateRawDeviceProgram } from './translator.mjs';

const encoder = new TextEncoder();

function codeUnitCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function hashField(hash, label, bytes) {
  const labelBytes = encoder.encode(label);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(labelBytes.byteLength, 0);
  header.writeBigUInt64LE(BigInt(bytes.byteLength), 4);
  hash.update(header);
  hash.update(labelBytes);
  hash.update(bytes);
}

function canonicalMetadata(functions) {
  return functions.map((fn) => ({
    name: fn.name,
    kind: fn.kind,
    parameters: fn.parameters.map((parameter) => ({ name: parameter.name, type: parameter.type })),
    returns: fn.returns,
  }));
}

function programIdentity(source, functions, compile) {
  const hash = createHash('sha256');
  hashField(hash, 'contract', encoder.encode(CONTRACT));
  hashField(hash, 'parser', encoder.encode(`acorn@${acornVersion}`));
  hashField(hash, 'target-policy', encoder.encode(canonicalJson(CUDA_TARGET_POLICY_IDENTITY)));
  hashField(hash, 'source', encoder.encode(source));
  hashField(hash, 'functions', encoder.encode(canonicalJson(canonicalMetadata(functions))));
  hashField(hash, 'compile', encoder.encode(canonicalJson(compile)));
  return hash.digest('hex');
}

function parseAcceptedSource(source) {
  try {
    return parse(source, { ecmaVersion: 2024, sourceType: 'script', locations: true, allowHashBang: false });
  } catch (error) {
    const details = error?.loc ? { line: error.loc.line, column: error.loc.column } : {};
    throw deviceJsError('DEVICE_JS_SYNTAX_INVALID', 'Device-JS source is not valid accepted JavaScript syntax.', details);
  }
}

function definitelyReturns(statement) {
  if (!statement) return false;
  if (statement.type === 'ReturnStatement') return true;
  if (statement.type === 'BlockStatement') return statementListDefinitelyReturns(statement.body);
  if (statement.type === 'IfStatement') {
    return statement.alternate !== null
      && definitelyReturns(statement.consequent)
      && definitelyReturns(statement.alternate);
  }
  return false;
}

function statementListDefinitelyReturns(statements) {
  for (const statement of statements) if (definitelyReturns(statement)) return true;
  return false;
}

function memberPath(node) {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type !== 'MemberExpression' || node.computed || node.property?.type !== 'Identifier') return null;
  const object = memberPath(node.object);
  return object ? `${object}.${node.property.name}` : null;
}

function validateAdditionalContract(ast, functions) {
  let usesScopedAtomic = false;
  const declarations = new Map();
  for (const statement of ast.body) {
    if (statement?.type === 'FunctionDeclaration' && statement.id?.type === 'Identifier') {
      declarations.set(statement.id.name, statement);
    }
  }

  for (const fn of functions) {
    if (fn.returns === 'void') continue;
    const declaration = declarations.get(fn.name);
    if (!declaration || !statementListDefinitelyReturns(declaration.body.body)) {
      throw deviceJsError(
        'DEVICE_JS_RETURN_INCOMPLETE',
        'Non-void Device-JS functions must definitely return on every accepted fallthrough path.',
        { function: fn.name },
      );
    }
  }

  function visit(node, parent = null) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'CallExpression') {
      const path = memberPath(node.callee);
      usesScopedAtomic ||= isScopedAtomicHelper(path);
      if (isVoidHelper(path) && !(parent?.type === 'ExpressionStatement' && parent.expression === node)) {
        throw deviceJsError(
          'DEVICE_JS_VOID_HELPER_CONTEXT',
          'Void Device-JS helpers are allowed only as standalone expression statements.',
          { helper: path, line: node.loc?.start?.line ?? null, column: node.loc?.start?.column ?? null },
        );
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end', 'range'].includes(key)) continue;
      if (Array.isArray(value)) {
        for (const child of value) visit(child, node);
      } else if (value && typeof value === 'object') {
        visit(value, node);
      }
    }
  }
  visit(ast);
  return { usesScopedAtomic };
}

function cppType(type) {
  const scalar = new Map([
    ['void', 'void'],
    ['bool', 'bool'],
    ['u32', 'unsigned int'],
    ['i32', 'int'],
    ['u64', 'unsigned long long'],
    ['f32', 'float'],
  ]);
  if (scalar.has(type)) return scalar.get(type);
  const pointer = /^ptr<(bool|u32|i32|u64|f32)>$/.exec(type);
  if (!pointer) throw deviceJsError('DEVICE_JS_TYPE_INVALID', 'Canonical Device-JS function type is invalid.', { type });
  return `${cppType(pointer[1])}*`;
}

function generatedNameMap(functions) {
  const output = new Map();
  let device = 0;
  let kernel = 0;
  for (const fn of functions) {
    output.set(fn.name, fn.kind === 'device' ? `djs_device_${device++}` : `djs_kernel_${kernel++}`);
  }
  return output;
}

function extractDefinitions(source) {
  const lines = source.split('\n');
  const definitions = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.includes('{')) continue;
    const match = /\b(djs_(?:device|kernel)_\d+)\s*\(/.exec(line);
    if (!match) continue;
    let depth = 0;
    let end = index;
    for (; end < lines.length; end += 1) {
      for (const character of lines[end]) {
        if (character === '{') depth += 1;
        else if (character === '}') depth -= 1;
      }
      if (depth === 0 && end >= index) break;
    }
    if (depth !== 0) throw deviceJsError('DEVICE_JS_INTERNAL', 'Generated Device-JS definition braces are unbalanced.');
    definitions.set(match[1], lines.slice(index, end + 1).join('\n'));
    index = end;
  }
  return definitions;
}

function replaceGeneratedNames(text, replacements) {
  const ordered = [...replacements.entries()].sort(
    (left, right) => right[0].length - left[0].length || codeUnitCompare(left[0], right[0]),
  );
  const temporaries = new Map();
  let index = 0;
  for (const [oldName, newName] of ordered) {
    const temporary = `__DJS_CANON_${index++}__`;
    temporaries.set(temporary, newName);
    text = text.replaceAll(oldName, temporary);
  }
  for (const [temporary, newName] of temporaries) text = text.replaceAll(temporary, newName);
  return text;
}

function canonicalizeGeneratedSource(raw, sortedFunctions, { usesScopedAtomic }) {
  const rawNames = generatedNameMap(raw.functions);
  const canonicalNames = generatedNameMap(sortedFunctions);
  const replacements = new Map();
  for (const fn of raw.functions) replacements.set(rawNames.get(fn.name), canonicalNames.get(fn.name));

  const definitions = extractDefinitions(raw.generatedSource);
  const blocks = new Map();
  for (const fn of raw.functions) {
    const oldName = rawNames.get(fn.name);
    const block = definitions.get(oldName);
    if (!block) {
      throw deviceJsError('DEVICE_JS_INTERNAL', 'Generated Device-JS function definition is missing.', { function: fn.name });
    }
    blocks.set(fn.name, replaceGeneratedNames(block, replacements));
  }

  const lines = [`/* cuda-js Device-JS ${CONTRACT}; generated; do not edit */`];
  if (usesScopedAtomic) lines.push('#include <cuda/atomic>', '');
  for (const fn of sortedFunctions) {
    if (fn.kind !== 'device') continue;
    const parameters = fn.parameters
      .map((parameter, parameterIndex) => `${cppType(parameter.type)} p${parameterIndex}`)
      .join(', ');
    lines.push(`__device__ ${cppType(fn.returns)} ${canonicalNames.get(fn.name)}(${parameters});`);
  }
  if (sortedFunctions.some((fn) => fn.kind === 'device')) lines.push('');
  sortedFunctions.forEach((fn, index) => {
    lines.push(blocks.get(fn.name));
    if (index !== sortedFunctions.length - 1) lines.push('');
  });
  lines.push('');
  return lines.join('\n');
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Array.isArray(value) ? value : Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export function translateDeviceProgram(request) {
  const raw = translateRawDeviceProgram(request);
  const ast = parseAcceptedSource(request.source);
  const requirements = validateAdditionalContract(ast, raw.functions);

  const sortedFunctions = raw.functions
    .map((fn) => ({
      name: fn.name,
      kind: fn.kind,
      parameters: fn.parameters.map((parameter) => ({ name: parameter.name, type: parameter.type })),
      returns: fn.returns,
      ...(fn.kind === 'kernel'
        ? { launchParameters: fn.launchParameters.map((parameter) => ({ ...parameter })) }
        : {}),
    }))
    .sort((left, right) => codeUnitCompare(left.name, right.name));

  const canonicalNames = generatedNameMap(sortedFunctions);
  for (const fn of sortedFunctions) {
    if (fn.kind === 'kernel') fn.functionName = canonicalNames.get(fn.name);
  }

  const sha256 = programIdentity(request.source, sortedFunctions, raw.compile);
  const generatedSource = canonicalizeGeneratedSource(raw, sortedFunctions, requirements);
  const kernels = sortedFunctions
    .filter((fn) => fn.kind === 'kernel')
    .map((fn) => ({
      name: fn.name,
      functionName: fn.functionName,
      parameters: fn.launchParameters.map((parameter) => ({ ...parameter })),
    }));

  return deepFreeze({
    schemaVersion: 1,
    contract: CONTRACT,
    sha256,
    parser: { name: 'acorn', version: acornVersion },
    functions: sortedFunctions,
    kernels,
    compile: { ...raw.compile },
    generatedName: `device-js-${sha256.slice(0, 16)}.cu`,
    generatedSource,
  });
}
