import { createHash } from 'node:crypto';

import { parse, version as acornVersion } from 'acorn';
import { CUDA_TARGET_POLICY_IDENTITY, inspectCudaTarget } from '../../cuda-target/index.mjs';

import { DEVICE_JS_CONTRACT as CONTRACT, devicePointerAtomicHelper } from './contract-profile.mjs';
import { DeviceJsError, deviceJsError } from './errors.mjs';

const SOURCE_LIMIT = 1_048_576;
const FUNCTION_LIMIT = 64;
const PARAMETER_LIMIT = 64;
const AST_NODE_LIMIT = 20_000;
const AST_DEPTH_LIMIT = 128;
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const SCALARS = new Set(['bool', 'u32', 'i32', 'u64', 'f32']);
const NUMERIC = new Set(['u32', 'i32', 'u64', 'f32']);
const INTEGER = new Set(['u32', 'i32', 'u64']);
const KERNEL_SCALARS = new Set(['u32', 'i32', 'u64', 'f32']);
const COMPILE_FIELDS = new Set(['architecture', 'languageStandard', 'fmad', 'deviceAsDefaultExecutionSpace', 'headerProfile', 'relocatableDeviceCode']);
const encoder = new TextEncoder();

const CUDA_TYPES = Object.freeze({
  bool: 'bool',
  u32: 'unsigned int',
  i32: 'int',
  u64: 'unsigned long long',
  f32: 'float',
});

function fail(code, message, node = null, details = {}) {
  const location = node?.loc?.start ? { line: node.loc.start.line, column: node.loc.start.column } : {};
  throw deviceJsError(code, message, { ...location, ...details });
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactSubset(value, allowed) {
  return plainObject(value) && Object.keys(value).every((key) => allowed.has(key));
}

function assertIdentifier(value, label) {
  if (typeof value !== 'string' || !IDENTIFIER.test(value) || value === 'gpu') throw deviceJsError('DEVICE_JS_IDENTIFIER_INVALID', `${label} must be a plain JavaScript identifier other than gpu.`, { value: typeof value === 'string' ? value : null });
  return value;
}

function parseType(value, { allowVoid = false, allowPointer = true } = {}) {
  if (allowVoid && value === 'void') return Object.freeze({ kind: 'void', text: 'void' });
  if (SCALARS.has(value)) return Object.freeze({ kind: 'scalar', scalar: value, text: value });
  const match = allowPointer && typeof value === 'string' ? /^ptr<(bool|u32|i32|u64|f32)>$/.exec(value) : null;
  if (match) return Object.freeze({ kind: 'pointer', scalar: match[1], text: value });
  const mailbox = typeof value === 'string' ? /^mailbox<(host-to-device|device-to-host),u32>$/.exec(value) : null;
  if (mailbox) return Object.freeze({ kind: 'mailbox', direction: mailbox[1], scalar: 'u32', text: value });
  throw deviceJsError('DEVICE_JS_TYPE_INVALID', 'Device-JS type is unsupported.', { type: typeof value === 'string' ? value : null });
}

function sameType(left, right) {
  return left.kind === right.kind && left.text === right.text;
}

function cppType(type) {
  if (type.kind === 'void') return 'void';
  if (type.kind === 'pointer') return `${CUDA_TYPES[type.scalar]}*`;
  if (type.kind === 'mailbox') return 'unsigned int*';
  return CUDA_TYPES[type.scalar];
}

function abiKind(type) {
  if (type.kind === 'pointer') return 'device-memory';
  if (type.kind === 'mailbox') return `publication-mailbox-${type.direction}-u32`;
  if (type.kind === 'scalar' && KERNEL_SCALARS.has(type.scalar)) return type.scalar;
  return null;
}

function normalizeCompile(value = {}) {
  if (!exactSubset(value, COMPILE_FIELDS)) throw deviceJsError('DEVICE_JS_COMPILE_OPTIONS_INVALID', 'Device-JS compile options contain unknown fields.');
  const architecture = value.architecture ?? 'compute_75';
  const languageStandard = value.languageStandard ?? 'c++17';
  const fmad = value.fmad ?? false;
  const deviceAsDefaultExecutionSpace = value.deviceAsDefaultExecutionSpace ?? false;
  const headerProfile = value.headerProfile ?? 'none';
  const relocatableDeviceCode = value.relocatableDeviceCode ?? false;
  const target = inspectCudaTarget(architecture, { expectedPrefix: 'compute' });
  if (!target.ok) throw deviceJsError('DEVICE_JS_COMPILE_OPTIONS_INVALID', 'Device-JS architecture is not admitted by the canonical CUDA target policy.', { architecture: typeof architecture === 'string' ? architecture : null, reason: target.reason });
  if (!['c++17', 'c++20'].includes(languageStandard)) throw deviceJsError('DEVICE_JS_COMPILE_OPTIONS_INVALID', 'Device-JS languageStandard must be c++17 or c++20.');
  if (!['none', 'cuda-cccl'].includes(headerProfile)) throw deviceJsError('DEVICE_JS_COMPILE_OPTIONS_INVALID', 'Device-JS headerProfile must be none or cuda-cccl.');
  if (typeof fmad !== 'boolean' || typeof deviceAsDefaultExecutionSpace !== 'boolean' || typeof relocatableDeviceCode !== 'boolean') throw deviceJsError('DEVICE_JS_COMPILE_OPTIONS_INVALID', 'Device-JS compile boolean options must be booleans.');
  return Object.freeze({ architecture, languageStandard, fmad, deviceAsDefaultExecutionSpace, headerProfile, relocatableDeviceCode });
}

function normalizeFunctions(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > FUNCTION_LIMIT) throw deviceJsError('DEVICE_JS_FUNCTIONS_INVALID', 'functions must be a nonempty bounded array.');
  const names = new Set();
  const functions = value.map((entry) => {
    if (!plainObject(entry) || Object.keys(entry).some((key) => !['name', 'kind', 'parameters', 'returns'].includes(key)) || !Object.hasOwn(entry, 'name') || !Object.hasOwn(entry, 'kind') || !Object.hasOwn(entry, 'parameters') || !Object.hasOwn(entry, 'returns')) {
      throw deviceJsError('DEVICE_JS_FUNCTION_INVALID', 'Each function metadata record requires exactly supported fields.');
    }
    const name = assertIdentifier(entry.name, 'Function name');
    if (names.has(name)) throw deviceJsError('DEVICE_JS_FUNCTION_DUPLICATE', 'Device-JS function names must be unique.', { name });
    names.add(name);
    if (!['kernel', 'device'].includes(entry.kind)) throw deviceJsError('DEVICE_JS_FUNCTION_KIND_INVALID', 'Function kind must be kernel or device.', { name });
    if (!Array.isArray(entry.parameters) || entry.parameters.length > PARAMETER_LIMIT) throw deviceJsError('DEVICE_JS_PARAMETERS_INVALID', 'Function parameters must be a bounded array.', { name });
    const parameterNames = new Set();
    const parameters = entry.parameters.map((parameter) => {
      if (!plainObject(parameter) || Object.keys(parameter).sort().join('\0') !== 'name\0type') throw deviceJsError('DEVICE_JS_PARAMETER_INVALID', 'Each Device-JS parameter requires exactly name and type.', { function: name });
      const parameterName = assertIdentifier(parameter.name, 'Parameter name');
      if (parameterNames.has(parameterName)) throw deviceJsError('DEVICE_JS_PARAMETER_DUPLICATE', 'Function parameter names must be unique.', { function: name, parameter: parameterName });
      parameterNames.add(parameterName);
      const type = parseType(parameter.type);
      if (entry.kind === 'kernel' && type.kind === 'scalar' && !KERNEL_SCALARS.has(type.scalar)) throw deviceJsError('DEVICE_JS_KERNEL_ABI_UNSUPPORTED', 'Kernel scalar parameter is not representable by the accepted launch ABI.', { function: name, parameter: parameterName, type: type.text });
      return Object.freeze({ name: parameterName, type });
    });
    const returns = parseType(entry.returns, { allowVoid: true, allowPointer: false });
    if (entry.kind === 'kernel' && returns.kind !== 'void') throw deviceJsError('DEVICE_JS_KERNEL_RETURN_INVALID', 'Device-JS kernels must return void.', { function: name });
    return Object.freeze({ name, kind: entry.kind, parameters: Object.freeze(parameters), returns });
  });
  if (!functions.some((entry) => entry.kind === 'kernel')) throw deviceJsError('DEVICE_JS_KERNEL_REQUIRED', 'A Device-JS module requires at least one kernel.');
  return Object.freeze([...functions].sort((a, b) => a.name.localeCompare(b.name)));
}

function canonicalMetadata(functions) {
  return functions.map((fn) => ({
    name: fn.name,
    kind: fn.kind,
    parameters: fn.parameters.map((parameter) => ({ name: parameter.name, type: parameter.type.text })),
    returns: fn.returns.text,
  }));
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

function parseSource(source) {
  let ast;
  try {
    ast = parse(source, { ecmaVersion: 2024, sourceType: 'script', locations: true, allowHashBang: false });
  } catch (error) {
    const details = error?.loc ? { line: error.loc.line, column: error.loc.column } : {};
    throw deviceJsError('DEVICE_JS_SYNTAX_INVALID', 'Device-JS source is not valid accepted JavaScript syntax.', details);
  }
  let nodes = 0;
  function visit(value, depth) {
    if (depth > AST_DEPTH_LIMIT) throw deviceJsError('DEVICE_JS_AST_LIMIT', 'Device-JS AST nesting exceeds the limit.', { maximum: AST_DEPTH_LIMIT });
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (!value || typeof value !== 'object') return;
    if (typeof value.type === 'string') {
      nodes += 1;
      if (nodes > AST_NODE_LIMIT) throw deviceJsError('DEVICE_JS_AST_LIMIT', 'Device-JS AST node count exceeds the limit.', { maximum: AST_NODE_LIMIT });
    }
    for (const [key, item] of Object.entries(value)) {
      if (['loc', 'start', 'end', 'range'].includes(key)) continue;
      visit(item, depth + 1);
    }
  }
  visit(ast, 0);
  return ast;
}

class Scope {
  constructor(parent = null) {
    this.parent = parent;
    this.values = new Map();
  }

  declare(name, record, node) {
    if (name === 'gpu') fail('DEVICE_JS_IDENTIFIER_INVALID', 'gpu is reserved for the Device-JS helper namespace.', node);
    if (this.values.has(name)) fail('DEVICE_JS_BINDING_DUPLICATE', 'Binding is already declared in this scope.', node, { name });
    this.values.set(name, record);
  }

  resolve(name, node) {
    if (this.values.has(name)) return this.values.get(name);
    if (this.parent) return this.parent.resolve(name, node);
    fail('DEVICE_JS_IDENTIFIER_UNKNOWN', 'Identifier is not declared in Device-JS scope.', node, { name });
  }
}

function numericConstant(node) {
  if (node?.type === 'Literal') {
    if (typeof node.value === 'number') return { kind: 'number', value: node.value };
    if (typeof node.value === 'bigint' || typeof node.bigint === 'string') return { kind: 'bigint', value: typeof node.value === 'bigint' ? node.value : BigInt(node.bigint) };
    if (typeof node.value === 'boolean') return { kind: 'boolean', value: node.value };
  }
  if (node?.type === 'UnaryExpression' && node.operator === '-' && node.prefix === true) {
    const inner = numericConstant(node.argument);
    if (inner?.kind === 'number') return { kind: 'number', value: -inner.value };
    if (inner?.kind === 'bigint') return { kind: 'bigint', value: -inner.value };
  }
  return null;
}

function f32Literal(value, node) {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isFinite(Math.fround(value))) fail('DEVICE_JS_LITERAL_RANGE', 'f32 literal is not finite binary32.', node);
  const rounded = Math.fround(value);
  if (Object.is(rounded, -0)) return '-0.0f';
  if (Number.isInteger(rounded)) return `${rounded}.0f`;
  return `${Number(rounded).toPrecision(9)}f`;
}

function castLiteral(target, node) {
  const constant = numericConstant(node);
  if (!constant) return null;
  if (target === 'bool') {
    if (constant.kind !== 'boolean') fail('DEVICE_JS_LITERAL_TYPE', 'gpu.bool literal must be boolean.', node);
    return { code: constant.value ? 'true' : 'false', type: parseType('bool') };
  }
  if (target === 'u32') {
    if (constant.kind !== 'number' || !Number.isInteger(constant.value) || constant.value < 0 || constant.value > 0xffff_ffff) fail('DEVICE_JS_LITERAL_RANGE', 'u32 literal is out of range.', node);
    return { code: `${constant.value}u`, type: parseType('u32') };
  }
  if (target === 'i32') {
    if (constant.kind !== 'number' || !Number.isInteger(constant.value) || constant.value < -0x8000_0000 || constant.value > 0x7fff_ffff) fail('DEVICE_JS_LITERAL_RANGE', 'i32 literal is out of range.', node);
    return { code: `${constant.value}`, type: parseType('i32') };
  }
  if (target === 'u64') {
    let value;
    if (constant.kind === 'bigint') value = constant.value;
    else if (constant.kind === 'number' && Number.isSafeInteger(constant.value)) value = BigInt(constant.value);
    else fail('DEVICE_JS_LITERAL_TYPE', 'u64 literal must be BigInt or a safe integer.', node);
    if (value < 0n || value > 0xffff_ffff_ffff_ffffn) fail('DEVICE_JS_LITERAL_RANGE', 'u64 literal is out of range.', node);
    return { code: `${value}ULL`, type: parseType('u64') };
  }
  if (target === 'f32') {
    if (constant.kind !== 'number') fail('DEVICE_JS_LITERAL_TYPE', 'f32 literal must be numeric.', node);
    return { code: f32Literal(constant.value, node), type: parseType('f32') };
  }
  return null;
}

function helperPath(node) {
  const parts = [];
  let current = node;
  while (current?.type === 'MemberExpression' && current.computed === false && current.property?.type === 'Identifier') {
    parts.unshift(current.property.name);
    current = current.object;
  }
  if (current?.type !== 'Identifier') return null;
  parts.unshift(current.name);
  return parts.join('.');
}

function isNumberType(type) { return type.kind === 'scalar' && NUMERIC.has(type.scalar); }
function isIntegerType(type) { return type.kind === 'scalar' && INTEGER.has(type.scalar); }
function boolType() { return parseType('bool'); }

class FunctionEmitter {
  constructor(fn, ast, functions, generatedNames, compile) {
    this.fn = fn;
    this.ast = ast;
    this.functions = functions;
    this.generatedNames = generatedNames;
    this.compile = compile;
    this.localCounter = 0;
    this.loopDepth = 0;
    this.calls = new Set();
    this.usesScopedAtomic = false;
    this.root = new Scope();
    fn.parameters.forEach((parameter, index) => {
      this.root.declare(parameter.name, { type: parameter.type, mutable: true, code: `p${index}`, parameter: true }, ast.params[index]);
    });
  }

  expression(node, scope = this.root) {
    if (!node) fail('DEVICE_JS_EXPRESSION_INVALID', 'Missing Device-JS expression.', node);
    if (node.type === 'Identifier') {
      const binding = scope.resolve(node.name, node);
      return { code: binding.code, type: binding.type, lvalue: true, mutable: binding.mutable, binding };
    }
    if (node.type === 'Literal') {
      if (typeof node.value === 'boolean') return { code: node.value ? 'true' : 'false', type: boolType() };
      fail('DEVICE_JS_LITERAL_REQUIRES_CAST', 'Numeric and BigInt literals require an explicit gpu scalar constructor.', node);
    }
    if (node.type === 'MemberExpression') return this.pointerIndex(node, scope);
    if (node.type === 'AssignmentExpression') return this.assignment(node, scope);
    if (node.type === 'UpdateExpression') return this.update(node, scope);
    if (node.type === 'UnaryExpression') return this.unary(node, scope);
    if (node.type === 'BinaryExpression') return this.binary(node, scope);
    if (node.type === 'LogicalExpression') return this.logical(node, scope);
    if (node.type === 'CallExpression') return this.call(node, scope);
    fail('DEVICE_JS_EXPRESSION_UNSUPPORTED', 'Expression syntax is unsupported in Device-JS v0.', node, { type: node.type });
  }

  pointerIndex(node, scope) {
    if (!node.computed || node.object.type !== 'Identifier') fail('DEVICE_JS_POINTER_ACCESS_INVALID', 'Only computed indexing on a declared pointer identifier is supported.', node);
    const pointer = scope.resolve(node.object.name, node.object);
    if (pointer.type.kind !== 'pointer') fail('DEVICE_JS_POINTER_ACCESS_INVALID', 'Indexed value must be a declared Device-JS pointer.', node.object);
    const index = this.expression(node.property, scope);
    if (!isIntegerType(index.type)) fail('DEVICE_JS_POINTER_INDEX_INVALID', 'Pointer index must have an integer Device-JS type.', node.property);
    return { code: `${pointer.code}[${index.code}]`, type: parseType(pointer.type.scalar), lvalue: true, mutable: true, pointer };
  }

  assignment(node, scope) {
    const left = this.expression(node.left, scope);
    if (!left.lvalue || !left.mutable) fail('DEVICE_JS_ASSIGNMENT_TARGET', 'Assignment target is not mutable.', node.left);
    const right = this.expression(node.right, scope);
    if (!sameType(left.type, right.type)) fail('DEVICE_JS_TYPE_MISMATCH', 'Assignment operands must have identical Device-JS types.', node, { left: left.type.text, right: right.type.text });
    const operators = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);
    if (!operators.has(node.operator)) fail('DEVICE_JS_ASSIGNMENT_OPERATOR', 'Assignment operator is unsupported.', node, { operator: node.operator });
    if (node.operator !== '=' && !isNumberType(left.type)) fail('DEVICE_JS_OPERATOR_TYPE', 'Compound assignment requires numeric operands.', node);
    if (['%=', '&=', '|=', '^=', '<<=', '>>='].includes(node.operator) && !isIntegerType(left.type)) fail('DEVICE_JS_OPERATOR_TYPE', 'Integer compound operator requires integer operands.', node);
    return { code: `(${left.code} ${node.operator} ${right.code})`, type: left.type };
  }

  update(node, scope) {
    if (!['++', '--'].includes(node.operator) || node.argument.type !== 'Identifier') fail('DEVICE_JS_UPDATE_UNSUPPORTED', 'Only ++/-- on integer locals are supported.', node);
    const value = scope.resolve(node.argument.name, node.argument);
    if (!value.mutable || value.parameter || !isIntegerType(value.type)) fail('DEVICE_JS_UPDATE_UNSUPPORTED', '++/-- requires a mutable integer local.', node.argument);
    return { code: node.prefix ? `(${node.operator}${value.code})` : `(${value.code}${node.operator})`, type: value.type };
  }

  unary(node, scope) {
    if (node.prefix !== true || !['!', '~', '-'].includes(node.operator)) fail('DEVICE_JS_UNARY_UNSUPPORTED', 'Unary operator is unsupported.', node, { operator: node.operator });
    const argument = this.expression(node.argument, scope);
    if (node.operator === '!') {
      if (argument.type.text !== 'bool') fail('DEVICE_JS_OPERATOR_TYPE', '! requires bool.', node);
      return { code: `(!${argument.code})`, type: boolType() };
    }
    if (node.operator === '~') {
      if (!isIntegerType(argument.type)) fail('DEVICE_JS_OPERATOR_TYPE', '~ requires integer.', node);
      return { code: `(~${argument.code})`, type: argument.type };
    }
    if (!['i32', 'f32'].includes(argument.type.text)) fail('DEVICE_JS_OPERATOR_TYPE', 'Unary - requires i32 or f32.', node);
    return { code: `(-${argument.code})`, type: argument.type };
  }

  binary(node, scope) {
    const left = this.expression(node.left, scope);
    const right = this.expression(node.right, scope);
    const arithmetic = new Set(['+', '-', '*', '/', '%']);
    const bitwise = new Set(['&', '|', '^', '<<', '>>']);
    const comparison = new Set(['<', '<=', '>', '>=', '===', '!==']);
    if (arithmetic.has(node.operator)) {
      if (!sameType(left.type, right.type) || !isNumberType(left.type)) fail('DEVICE_JS_OPERATOR_TYPE', 'Arithmetic operands must have the same numeric Device-JS type.', node);
      if (node.operator === '%' && !isIntegerType(left.type)) fail('DEVICE_JS_OPERATOR_TYPE', '% requires integer operands.', node);
      return { code: `(${left.code} ${node.operator} ${right.code})`, type: left.type };
    }
    if (bitwise.has(node.operator)) {
      if (!isIntegerType(left.type) || !isIntegerType(right.type)) fail('DEVICE_JS_OPERATOR_TYPE', 'Bitwise operands must be integer Device-JS values.', node);
      if (!['<<', '>>'].includes(node.operator) && !sameType(left.type, right.type)) fail('DEVICE_JS_OPERATOR_TYPE', 'Bitwise operands must have identical types.', node);
      return { code: `(${left.code} ${node.operator} ${right.code})`, type: left.type };
    }
    if (comparison.has(node.operator)) {
      if (!sameType(left.type, right.type) || (!isNumberType(left.type) && left.type.text !== 'bool')) fail('DEVICE_JS_OPERATOR_TYPE', 'Comparison operands must have identical scalar Device-JS types.', node);
      const operator = node.operator === '===' ? '==' : node.operator === '!==' ? '!=' : node.operator;
      return { code: `(${left.code} ${operator} ${right.code})`, type: boolType() };
    }
    fail('DEVICE_JS_BINARY_UNSUPPORTED', 'Binary operator is unsupported.', node, { operator: node.operator });
  }

  logical(node, scope) {
    if (!['&&', '||'].includes(node.operator)) fail('DEVICE_JS_LOGICAL_UNSUPPORTED', 'Logical operator is unsupported.', node);
    const left = this.expression(node.left, scope);
    const right = this.expression(node.right, scope);
    if (left.type.text !== 'bool' || right.type.text !== 'bool') fail('DEVICE_JS_OPERATOR_TYPE', 'Logical operands must be bool.', node);
    return { code: `(${left.code} ${node.operator} ${right.code})`, type: boolType() };
  }

  call(node, scope) {
    if (node.optional) fail('DEVICE_JS_CALL_UNSUPPORTED', 'Optional calls are unsupported.', node);
    if (node.callee.type === 'Identifier') {
      const target = this.functions.get(node.callee.name);
      if (!target) fail('DEVICE_JS_CALL_UNKNOWN', 'Call target is not a declared Device-JS function.', node.callee, { name: node.callee.name });
      if (target.kind !== 'device') fail('DEVICE_JS_KERNEL_CALL_FORBIDDEN', 'Device-JS kernels cannot be called from device source.', node.callee, { name: target.name });
      if (node.arguments.length !== target.parameters.length || node.arguments.some((arg) => arg.type === 'SpreadElement')) fail('DEVICE_JS_CALL_ARGUMENTS', 'Device function call argument count must match exactly.', node);
      const args = node.arguments.map((argument, index) => {
        const value = this.expression(argument, scope);
        if (!sameType(value.type, target.parameters[index].type)) fail('DEVICE_JS_TYPE_MISMATCH', 'Device function call argument type mismatch.', argument, { expected: target.parameters[index].type.text, actual: value.type.text });
        return value.code;
      });
      this.calls.add(target.name);
      return { code: `${this.generatedNames.get(target.name)}(${args.join(', ')})`, type: target.returns };
    }
    const path = helperPath(node.callee);
    if (!path?.startsWith('gpu.')) fail('DEVICE_JS_CALL_UNSUPPORTED', 'Only declared device functions and fixed gpu helpers are callable.', node.callee);
    return this.helperCall(path, node.arguments, node, scope);
  }

  helperCall(path, args, node, scope) {
    const scalar = /^gpu\.(bool|u32|i32|u64|f32)$/.exec(path);
    if (scalar) {
      if (args.length !== 1 || args[0].type === 'SpreadElement') fail('DEVICE_JS_HELPER_ARGUMENTS', 'Scalar constructor requires exactly one argument.', node);
      const literal = castLiteral(scalar[1], args[0]);
      if (literal) return literal;
      const value = this.expression(args[0], scope);
      if (value.type.kind !== 'scalar') fail('DEVICE_JS_CAST_TYPE', 'Scalar constructor accepts only scalar values.', args[0]);
      return { code: `static_cast<${CUDA_TYPES[scalar[1]]}>(${value.code})`, type: parseType(scalar[1]) };
    }

    const indexHelpers = Object.freeze({
      'gpu.thread.x': 'threadIdx.x',
      'gpu.thread.y': 'threadIdx.y',
      'gpu.thread.z': 'threadIdx.z',
      'gpu.block.x': 'blockIdx.x',
      'gpu.block.y': 'blockIdx.y',
      'gpu.block.z': 'blockIdx.z',
      'gpu.blockDim.x': 'blockDim.x',
      'gpu.blockDim.y': 'blockDim.y',
      'gpu.blockDim.z': 'blockDim.z',
      'gpu.gridDim.x': 'gridDim.x',
      'gpu.gridDim.y': 'gridDim.y',
      'gpu.gridDim.z': 'gridDim.z',
      'gpu.thread.globalX': '((blockIdx.x * blockDim.x) + threadIdx.x)',
    });
    if (Object.hasOwn(indexHelpers, path)) {
      if (args.length !== 0) fail('DEVICE_JS_HELPER_ARGUMENTS', 'Execution-index helper takes no arguments.', node);
      return { code: `static_cast<unsigned int>(${indexHelpers[path]})`, type: parseType('u32') };
    }

    if (path === 'gpu.atomic.add' || path === 'gpu.atomic.cas') {
      const expected = path.endsWith('.add') ? 3 : 4;
      if (args.length !== expected) fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} has an invalid argument count.`, node);
      const pointer = this.expression(args[0], scope);
      const index = this.expression(args[1], scope);
      if (pointer.type.kind !== 'pointer' || !isIntegerType(index.type)) fail('DEVICE_JS_ATOMIC_TYPE', 'Atomic helper requires pointer and integer index.', node);
      const pointee = parseType(pointer.type.scalar);
      const allowed = path.endsWith('.add') ? new Set(['u32', 'i32', 'u64', 'f32']) : new Set(['u32', 'u64']);
      if (!allowed.has(pointer.type.scalar)) fail('DEVICE_JS_ATOMIC_TYPE', 'Atomic helper does not support this pointee type.', node, { type: pointer.type.text });
      const values = args.slice(2).map((arg) => this.expression(arg, scope));
      for (const value of values) if (!sameType(value.type, pointee)) fail('DEVICE_JS_ATOMIC_TYPE', 'Atomic value type must match pointer pointee.', node);
      const address = `&(${pointer.code}[${index.code}])`;
      const code = path.endsWith('.add')
        ? `atomicAdd(${address}, ${values[0].code})`
        : `atomicCAS(${address}, ${values[0].code}, ${values[1].code})`;
      return { code, type: pointee };
    }

    if (path === 'gpu.mailbox.loadAcquireSystem' || path === 'gpu.mailbox.storeReleaseSystem') {
      const store = path === 'gpu.mailbox.storeReleaseSystem';
      if (args.length !== (store ? 2 : 1)) fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} has an invalid argument count.`, node);
      if (this.compile.headerProfile !== 'cuda-cccl') {
        fail('DEVICE_JS_ATOMIC_PROFILE_REQUIRED', `${path} requires compile.headerProfile "cuda-cccl".`, node, { headerProfile: this.compile.headerProfile });
      }
      const lane = this.expression(args[0], scope);
      const expectedDirection = store ? 'device-to-host' : 'host-to-device';
      if (lane.type.kind !== 'mailbox' || lane.type.direction !== expectedDirection) {
        fail('DEVICE_JS_MAILBOX_DIRECTION', 'Mailbox helper requires the exact direction-specific opaque u32 lane type.', node, { expectedDirection, actualType: lane.type.text });
      }
      const reference = `cuda::atomic_ref<unsigned int, cuda::thread_scope_system>(*${lane.code})`;
      this.usesScopedAtomic = true;
      if (!store) return { code: `${reference}.load(cuda::memory_order_acquire)`, type: parseType('u32') };
      const value = this.expression(args[1], scope);
      if (value.type.text !== 'u32') fail('DEVICE_JS_ATOMIC_TYPE', 'Mailbox release store value must be u32.', args[1]);
      return { code: `${reference}.store(${value.code}, cuda::memory_order_release)`, type: parseType('void', { allowVoid: true }) };
    }

    const pointerAtomic = devicePointerAtomicHelper(path);
    if (pointerAtomic) {
      const store = pointerAtomic.operation === 'store';
      if (args.length !== (store ? 3 : 2)) fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} has an invalid argument count.`, node);
      if (this.compile.headerProfile !== 'cuda-cccl') {
        fail('DEVICE_JS_ATOMIC_PROFILE_REQUIRED', `${path} requires compile.headerProfile "cuda-cccl".`, node, { headerProfile: this.compile.headerProfile });
      }
      const pointer = this.expression(args[0], scope);
      const index = this.expression(args[1], scope);
      if (pointer.type.kind !== 'pointer' || !isIntegerType(index.type)) fail('DEVICE_JS_ATOMIC_TYPE', 'Scoped atomic helper requires a pointer and integer index.', node);
      if (!['u32', 'u64'].includes(pointer.type.scalar)) fail('DEVICE_JS_ATOMIC_TYPE', 'Scoped atomic helper supports only ptr<u32> and ptr<u64>.', node, { type: pointer.type.text });
      const pointee = parseType(pointer.type.scalar);
      const address = `${pointer.code}[${index.code}]`;
      const reference = `cuda::atomic_ref<${CUDA_TYPES[pointer.type.scalar]}, cuda::thread_scope_device>(${address})`;
      this.usesScopedAtomic = true;
      if (!store) return { code: `${reference}.load(cuda::memory_order_${pointerAtomic.order})`, type: pointee };
      const value = this.expression(args[2], scope);
      if (!sameType(value.type, pointee)) fail('DEVICE_JS_ATOMIC_TYPE', 'Scoped atomic store value type must match pointer pointee.', args[2]);
      return { code: `${reference}.store(${value.code}, cuda::memory_order_${pointerAtomic.order})`, type: parseType('void', { allowVoid: true }) };
    }

    if (path === 'gpu.barrier.block' || path === 'gpu.fence.device') {
      if (args.length !== 0) fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} takes no arguments.`, node);
      return { code: path === 'gpu.barrier.block' ? '__syncthreads()' : '__threadfence()', type: parseType('void', { allowVoid: true }) };
    }

    const unaryMath = Object.freeze({
      'gpu.math.sqrt': 'sqrtf',
      'gpu.math.log': 'logf',
      'gpu.math.exp': 'expf',
    });
    if (Object.hasOwn(unaryMath, path)) {
      if (args.length !== 1) fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} requires one argument.`, node);
      const value = this.expression(args[0], scope);
      if (value.type.text !== 'f32') fail('DEVICE_JS_MATH_TYPE', `${path} requires f32.`, node);
      return { code: `${unaryMath[path]}(${value.code})`, type: value.type };
    }

    if (path === 'gpu.math.min' || path === 'gpu.math.max') {
      if (args.length !== 2) fail('DEVICE_JS_HELPER_ARGUMENTS', `${path} requires two arguments.`, node);
      const left = this.expression(args[0], scope);
      const right = this.expression(args[1], scope);
      if (!sameType(left.type, right.type) || !isNumberType(left.type)) fail('DEVICE_JS_MATH_TYPE', `${path} requires matching numeric operands.`, node);
      const fn = left.type.text === 'f32' ? (path.endsWith('.min') ? 'fminf' : 'fmaxf') : (path.endsWith('.min') ? 'min' : 'max');
      return { code: `${fn}(${left.code}, ${right.code})`, type: left.type };
    }

    fail('DEVICE_JS_HELPER_UNKNOWN', 'GPU helper is not part of Device-JS v0.', node, { helper: path });
  }

  variableDeclaration(node, scope, inline = false) {
    if (!['let', 'const'].includes(node.kind) || node.declarations.length !== 1) fail('DEVICE_JS_DECLARATION_UNSUPPORTED', 'Device-JS declarations require one let/const declarator.', node);
    const declaration = node.declarations[0];
    if (declaration.id.type !== 'Identifier' || declaration.init === null) fail('DEVICE_JS_DECLARATION_UNSUPPORTED', 'Device-JS local declarations require an identifier and initializer.', declaration);
    assertIdentifier(declaration.id.name, 'Local variable');
    const value = this.expression(declaration.init, scope);
    if (value.type.kind === 'void' || value.type.kind === 'pointer') fail('DEVICE_JS_DECLARATION_TYPE', 'Device-JS local declarations currently require scalar initializers.', declaration.init);
    const codeName = `v${this.localCounter++}`;
    scope.declare(declaration.id.name, { type: value.type, mutable: node.kind === 'let', code: codeName, parameter: false }, declaration.id);
    const prefix = node.kind === 'const' ? 'const ' : '';
    const code = `${prefix}${cppType(value.type)} ${codeName} = ${value.code}`;
    return inline ? code : `${code};`;
  }

  statementLines(node, scope, indent = 1) {
    const pad = '  '.repeat(indent);
    if (node.type === 'BlockStatement') return this.blockLines(node, scope, indent, true);
    if (node.type === 'VariableDeclaration') return [`${pad}${this.variableDeclaration(node, scope)}`];
    if (node.type === 'ExpressionStatement') {
      if (!['AssignmentExpression', 'UpdateExpression', 'CallExpression'].includes(node.expression.type)) fail('DEVICE_JS_EXPRESSION_STATEMENT_UNSUPPORTED', 'Expression statement must be assignment, update, or call.', node);
      const value = this.expression(node.expression, scope);
      return [`${pad}${value.code};`];
    }
    if (node.type === 'IfStatement') {
      const test = this.expression(node.test, scope);
      if (test.type.text !== 'bool') fail('DEVICE_JS_CONDITION_TYPE', 'if condition must be bool.', node.test);
      const lines = [`${pad}if (${test.code}) {`];
      lines.push(...this.bodyContents(node.consequent, new Scope(scope), indent + 1));
      lines.push(`${pad}}`);
      if (node.alternate) {
        lines[lines.length - 1] += ' else {';
        lines.push(...this.bodyContents(node.alternate, new Scope(scope), indent + 1));
        lines.push(`${pad}}`);
      }
      return lines;
    }
    if (node.type === 'WhileStatement') {
      const test = this.expression(node.test, scope);
      if (test.type.text !== 'bool') fail('DEVICE_JS_CONDITION_TYPE', 'while condition must be bool.', node.test);
      const lines = [`${pad}while (${test.code}) {`];
      this.loopDepth += 1;
      try { lines.push(...this.bodyContents(node.body, new Scope(scope), indent + 1)); } finally { this.loopDepth -= 1; }
      lines.push(`${pad}}`);
      return lines;
    }
    if (node.type === 'ForStatement') {
      const loopScope = new Scope(scope);
      let init = '';
      if (node.init) {
        if (node.init.type === 'VariableDeclaration') init = this.variableDeclaration(node.init, loopScope, true);
        else if (['AssignmentExpression', 'UpdateExpression', 'CallExpression'].includes(node.init.type)) init = this.expression(node.init, loopScope).code;
        else fail('DEVICE_JS_FOR_INIT_UNSUPPORTED', 'for initializer is unsupported.', node.init);
      }
      let test = '';
      if (node.test) {
        const value = this.expression(node.test, loopScope);
        if (value.type.text !== 'bool') fail('DEVICE_JS_CONDITION_TYPE', 'for condition must be bool.', node.test);
        test = value.code;
      }
      let update = '';
      if (node.update) {
        if (!['AssignmentExpression', 'UpdateExpression', 'CallExpression'].includes(node.update.type)) fail('DEVICE_JS_FOR_UPDATE_UNSUPPORTED', 'for update is unsupported.', node.update);
        update = this.expression(node.update, loopScope).code;
      }
      const lines = [`${pad}for (${init}; ${test}; ${update}) {`];
      this.loopDepth += 1;
      try { lines.push(...this.bodyContents(node.body, new Scope(loopScope), indent + 1)); } finally { this.loopDepth -= 1; }
      lines.push(`${pad}}`);
      return lines;
    }
    if (node.type === 'BreakStatement' || node.type === 'ContinueStatement') {
      if (this.loopDepth < 1 || node.label !== null) fail('DEVICE_JS_LOOP_CONTROL_INVALID', 'break/continue require an unlabeled Device-JS loop.', node);
      return [`${pad}${node.type === 'BreakStatement' ? 'break' : 'continue'};`];
    }
    if (node.type === 'ReturnStatement') {
      if (this.fn.returns.kind === 'void') {
        if (node.argument !== null) fail('DEVICE_JS_RETURN_TYPE', 'void Device-JS function cannot return a value.', node);
        return [`${pad}return;`];
      }
      if (!node.argument) fail('DEVICE_JS_RETURN_TYPE', 'Non-void Device-JS function must return a value.', node);
      const value = this.expression(node.argument, scope);
      if (!sameType(value.type, this.fn.returns)) fail('DEVICE_JS_RETURN_TYPE', 'Device-JS return type mismatch.', node, { expected: this.fn.returns.text, actual: value.type.text });
      return [`${pad}return ${value.code};`];
    }
    if (node.type === 'EmptyStatement') return [`${pad};`];
    fail('DEVICE_JS_STATEMENT_UNSUPPORTED', 'Statement syntax is unsupported in Device-JS v0.', node, { type: node.type });
  }

  bodyContents(node, scope, indent) {
    if (node.type === 'BlockStatement') {
      const lines = [];
      for (const statement of node.body) lines.push(...this.statementLines(statement, scope, indent));
      return lines;
    }
    return this.statementLines(node, scope, indent);
  }

  blockLines(node, parentScope, indent, braces) {
    const scope = new Scope(parentScope);
    const pad = '  '.repeat(indent);
    const lines = braces ? [`${pad}{`] : [];
    for (const statement of node.body) lines.push(...this.statementLines(statement, scope, braces ? indent + 1 : indent));
    if (braces) lines.push(`${pad}}`);
    return lines;
  }

  emit() {
    const args = this.fn.parameters.map((parameter, index) => `${cppType(parameter.type)} p${index}`).join(', ');
    const qualifier = this.fn.kind === 'kernel' ? 'extern "C" __global__' : '__device__';
    const header = `${qualifier} ${cppType(this.fn.returns)} ${this.generatedNames.get(this.fn.name)}(${args}) {`;
    const lines = [header];
    for (const statement of this.ast.body.body) lines.push(...this.statementLines(statement, this.root, 1));
    lines.push('}');
    return { code: lines.join('\n'), calls: this.calls, usesScopedAtomic: this.usesScopedAtomic };
  }
}

function matchSourceFunctions(ast, functions) {
  const source = new Map();
  for (const node of ast.body) {
    if (node.type !== 'FunctionDeclaration' || node.async || node.generator || !node.id || node.id.type !== 'Identifier') fail('DEVICE_JS_TOP_LEVEL_UNSUPPORTED', 'Device-JS top level may contain only ordinary named function declarations.', node);
    if (source.has(node.id.name)) fail('DEVICE_JS_FUNCTION_DUPLICATE', 'Source function names must be unique.', node.id, { name: node.id.name });
    if (node.params.some((parameter) => parameter.type !== 'Identifier')) fail('DEVICE_JS_PARAMETER_SYNTAX', 'Device-JS source parameters must be plain identifiers.', node);
    source.set(node.id.name, node);
  }
  if (source.size !== functions.length) throw deviceJsError('DEVICE_JS_FUNCTION_METADATA_MISMATCH', 'Source and function metadata counts differ.', { sourceCount: source.size, metadataCount: functions.length });
  for (const fn of functions) {
    const node = source.get(fn.name);
    if (!node) throw deviceJsError('DEVICE_JS_FUNCTION_METADATA_MISMATCH', 'Function metadata has no matching source declaration.', { function: fn.name });
    if (node.params.length !== fn.parameters.length) fail('DEVICE_JS_FUNCTION_METADATA_MISMATCH', 'Function parameter count differs from metadata.', node, { function: fn.name });
    for (let index = 0; index < node.params.length; index += 1) {
      if (node.params[index].name !== fn.parameters[index].name) fail('DEVICE_JS_FUNCTION_METADATA_MISMATCH', 'Function parameter name/order differs from metadata.', node.params[index], { function: fn.name, expected: fn.parameters[index].name, actual: node.params[index].name });
    }
  }
  for (const name of source.keys()) if (!functions.some((fn) => fn.name === name)) throw deviceJsError('DEVICE_JS_FUNCTION_METADATA_MISMATCH', 'Source declaration has no metadata.', { function: name });
  return source;
}

function rejectRecursion(callsByFunction) {
  const visiting = new Set();
  const complete = new Set();
  function visit(name, path) {
    if (visiting.has(name)) throw deviceJsError('DEVICE_JS_RECURSION_FORBIDDEN', 'Recursive Device-JS call graph is unsupported.', { cycle: [...path, name].join(' -> ') });
    if (complete.has(name)) return;
    visiting.add(name);
    const calls = [...(callsByFunction.get(name) ?? [])].sort();
    for (const target of calls) visit(target, [...path, name]);
    visiting.delete(name);
    complete.add(name);
  }
  for (const name of [...callsByFunction.keys()].sort()) visit(name, []);
}

function freezeFunctionPublic(fn, generatedName) {
  return Object.freeze({
    name: fn.name,
    kind: fn.kind,
    parameters: Object.freeze(fn.parameters.map((parameter) => Object.freeze({ name: parameter.name, type: parameter.type.text }))),
    returns: fn.returns.text,
    ...(fn.kind === 'kernel' ? {
      functionName: generatedName,
      launchParameters: Object.freeze(fn.parameters.map((parameter) => Object.freeze({ kind: abiKind(parameter.type) }))),
    } : {}),
  });
}

export function translateDeviceProgram(request) {
  if (!plainObject(request) || Object.keys(request).some((key) => !['source', 'functions', 'compile'].includes(key)) || !Object.hasOwn(request, 'source') || !Object.hasOwn(request, 'functions')) throw deviceJsError('DEVICE_JS_REQUEST_INVALID', 'Device-JS request requires source/functions and optional compile.');
  if (typeof request.source !== 'string' || request.source.length < 1 || request.source.includes('\0')) throw deviceJsError('DEVICE_JS_SOURCE_INVALID', 'Device-JS source must be nonempty and NUL-free.');
  const sourceBytes = encoder.encode(request.source);
  if (sourceBytes.byteLength > SOURCE_LIMIT) throw deviceJsError('DEVICE_JS_SOURCE_LIMIT', 'Device-JS source exceeds the UTF-8 limit.', { byteLength: sourceBytes.byteLength, maximum: SOURCE_LIMIT });
  const functions = normalizeFunctions(request.functions);
  const compile = normalizeCompile(request.compile ?? {});
  const identity = programIdentity(request.source, functions, compile);
  const ast = parseSource(request.source);
  const sourceFunctions = matchSourceFunctions(ast, functions);
  const functionMap = new Map(functions.map((fn) => [fn.name, fn]));
  const generatedNames = new Map();
  let deviceIndex = 0;
  let kernelIndex = 0;
  for (const fn of functions) generatedNames.set(fn.name, fn.kind === 'device' ? `djs_device_${deviceIndex++}` : `djs_kernel_${kernelIndex++}`);

  const prototypes = functions.filter((fn) => fn.kind === 'device').map((fn) => {
    const args = fn.parameters.map((parameter, index) => `${cppType(parameter.type)} p${index}`).join(', ');
    return `__device__ ${cppType(fn.returns)} ${generatedNames.get(fn.name)}(${args});`;
  });
  const definitions = [];
  const calls = new Map();
  let usesScopedAtomic = false;
  for (const fn of functions) {
    const emitted = new FunctionEmitter(fn, sourceFunctions.get(fn.name), functionMap, generatedNames, compile).emit();
    definitions.push(emitted.code);
    calls.set(fn.name, emitted.calls);
    usesScopedAtomic ||= emitted.usesScopedAtomic;
  }
  rejectRecursion(calls);

  const generatedSource = [
    `/* cuda-js Device-JS ${CONTRACT}; generated; do not edit */`,
    ...(usesScopedAtomic ? ['#include <cuda/atomic>', ''] : []),
    ...prototypes,
    ...(prototypes.length ? [''] : []),
    ...definitions.flatMap((definition, index) => index === definitions.length - 1 ? [definition] : [definition, '']),
    '',
  ].join('\n');

  const publicFunctions = Object.freeze(functions.map((fn) => freezeFunctionPublic(fn, generatedNames.get(fn.name))));
  const kernels = Object.freeze(publicFunctions.filter((fn) => fn.kind === 'kernel').map((fn) => Object.freeze({ name: fn.name, functionName: fn.functionName, parameters: fn.launchParameters })));
  return Object.freeze({
    schemaVersion: 1,
    contract: CONTRACT,
    sha256: identity,
    parser: Object.freeze({ name: 'acorn', version: acornVersion }),
    functions: publicFunctions,
    kernels,
    compile,
    generatedName: `device-js-${identity.slice(0, 16)}.cu`,
    generatedSource,
  });
}

export { DeviceJsError };
