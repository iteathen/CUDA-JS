import { createHash } from 'node:crypto';

export const PREPARED_OPERATION_DAG_CONTRACT = 'SPEC-0020-prepared-kernel-dag-v1';
export const PREPARED_CUBLASLT_OPERATION_DAG_CONTRACT = `${PREPARED_OPERATION_DAG_CONTRACT}+SPEC-0031-prepared-cublaslt-f32-matmul-node-v1`;
export const PREPARED_OPERATION_DAG_LIMITS = Object.freeze({ nodes: 32, edges: 64, bindings: 64, predecessorsPerNode: 8 });

const IDENTIFIER = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const PACKED_SCALAR = /^(?:[a-f0-9]{2}){1,16}$/;
const PACKED_F32 = /^[a-f0-9]{8}$/;
const ACCESS_MODES = new Set(['read', 'write', 'read-write', 'atomic-observe-relaxed-device', 'atomic-update-relaxed-device']);
const PROFILE_LIMIT_FIELDS = Object.freeze([
  'maxThreadsPerBlock', 'maxBlockDimX', 'maxBlockDimY', 'maxBlockDimZ',
  'maxGridDimX', 'maxGridDimY', 'maxGridDimZ', 'maxSharedMemoryPerBlock',
]);

export class PreparedOperationDagError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'PreparedOperationDagError';
    this.code = code;
    this.category = 'validation';
    this.details = Object.freeze({ ...details });
  }
}

function fail(code, message, details = {}) { throw new PreparedOperationDagError(code, message, details); }

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function codeUnitCompare(left, right) { return left < right ? -1 : left > right ? 1 : 0; }

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Array.isArray(value) ? value : Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function identifier(value, field, details = {}) {
  if (typeof value !== 'string' || !IDENTIFIER.test(value)) fail('PREPARED_DAG_IDENTIFIER_INVALID', `${field} must be a bounded identifier.`, details);
  return value;
}

function dimensions(value, field, node) {
  if (!exactFields(value, ['x', 'y', 'z']) || !['x', 'y', 'z'].every((axis) => Number.isSafeInteger(value[axis]) && value[axis] > 0)) {
    fail('PREPARED_DAG_DIMENSIONS_INVALID', `${field} must be an exact positive x/y/z record.`, { node });
  }
  return { x: value.x, y: value.y, z: value.z };
}

function normalizeProfile(value) {
  if (!exactFields(value, ['deviceLimits', 'maxPendingGpuOperations']) || !Number.isSafeInteger(value.maxPendingGpuOperations) || value.maxPendingGpuOperations < 1 || value.maxPendingGpuOperations > 2
      || !exactFields(value.deviceLimits, PROFILE_LIMIT_FIELDS)
      || !PROFILE_LIMIT_FIELDS.every((field) => Number.isSafeInteger(value.deviceLimits[field]) && value.deviceLimits[field] > 0)) {
    fail('PREPARED_DAG_PROFILE_INVALID', 'Prepared DAG execution profile is invalid.');
  }
  return {
    maxPendingGpuOperations: value.maxPendingGpuOperations,
    deviceLimits: Object.fromEntries(PROFILE_LIMIT_FIELDS.map((field) => [field, value.deviceLimits[field]])),
  };
}

function normalizeExecutable(value, node) {
  if (!exactFields(value, ['moduleSha256', 'name', 'parameters']) || typeof value.moduleSha256 !== 'string' || !SHA256.test(value.moduleSha256)
      || typeof value.name !== 'string' || value.name.length < 1 || value.name.length > 256 || !/^[\x20-\x7e]+$/.test(value.name) || /[\\/]/.test(value.name)
      || !Array.isArray(value.parameters) || value.parameters.length < 1 || value.parameters.length > 64
      || !value.parameters.every((entry) => exactFields(entry, ['kind']) && typeof entry.kind === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(entry.kind))) {
    fail('PREPARED_DAG_EXECUTABLE_INVALID', 'Prepared DAG executable identity is invalid.', { node });
  }
  return {
    moduleSha256: value.moduleSha256,
    name: value.name,
    parameters: value.parameters.map((entry) => ({ kind: entry.kind })),
  };
}

function normalizeArguments(value, executable, node, bindingKinds) {
  if (!Array.isArray(value) || value.length !== executable.parameters.length) fail('PREPARED_DAG_ARGUMENTS_INVALID', 'Prepared node argument count must match its executable schema.', { node });
  return value.map((entry, index) => {
    const expectedKind = executable.parameters[index].kind;
    if (exactFields(entry, ['binding', 'kind'])) {
      const name = identifier(entry.binding, 'Binding name', { node, argumentIndex: index });
      if (entry.kind !== expectedKind) fail('PREPARED_DAG_ARGUMENT_KIND', 'Prepared binding argument kind does not match the executable schema.', { node, argumentIndex: index });
      const prior = bindingKinds.get(name);
      if (prior !== undefined && prior !== entry.kind) fail('PREPARED_DAG_BINDING_CONFLICT', 'One binding name cannot have multiple kinds.', { binding: name });
      bindingKinds.set(name, entry.kind);
      return { binding: name, kind: entry.kind };
    }
    if (!exactFields(entry, ['kind', 'packedHex']) || entry.kind !== expectedKind || entry.kind === 'device-memory' || typeof entry.packedHex !== 'string' || !PACKED_SCALAR.test(entry.packedHex)) {
      fail('PREPARED_DAG_ARGUMENT_INVALID', 'Prepared arguments must be exact named bindings or fixed packed scalar identities.', { node, argumentIndex: index });
    }
    return { kind: entry.kind, packedHex: entry.packedHex };
  });
}

function normalizeAccesses(value, parameters, node) {
  const deviceIndexes = parameters.flatMap((entry, index) => entry.kind === 'device-memory' ? [index] : []);
  if (!Array.isArray(value) || value.length !== deviceIndexes.length) fail('PREPARED_DAG_ACCESSES_INVALID', 'Each prepared device-memory argument requires one exact access declaration.', { node, expected: deviceIndexes.length, actual: value?.length ?? null });
  const seen = new Set();
  return value.map((entry, accessIndex) => {
    if (!plainObject(entry) || Object.keys(entry).some((key) => !['argumentIndex', 'byteOffset', 'byteLength', 'mode', 'dtype'].includes(key))
        || !deviceIndexes.includes(entry.argumentIndex) || seen.has(entry.argumentIndex)
        || !Number.isSafeInteger(entry.byteOffset) || entry.byteOffset < 0 || !Number.isSafeInteger(entry.byteLength) || entry.byteLength < 1
        || !ACCESS_MODES.has(entry.mode)) fail('PREPARED_DAG_ACCESS_INVALID', 'Prepared access declaration is invalid.', { node, accessIndex });
    seen.add(entry.argumentIndex);
    const atomic = entry.mode.startsWith('atomic-');
    if ((atomic && !['u32', 'u64'].includes(entry.dtype)) || (!atomic && Object.hasOwn(entry, 'dtype'))) fail('PREPARED_DAG_ACCESS_TYPE', 'Prepared atomic dtype declaration is invalid.', { node, accessIndex });
    return {
      argumentIndex: entry.argumentIndex,
      byteOffset: entry.byteOffset,
      byteLength: entry.byteLength,
      mode: entry.mode,
      ...(atomic ? { dtype: entry.dtype } : {}),
    };
  }).sort((left, right) => left.argumentIndex - right.argumentIndex);
}

function preparedBinding(value, kind, node, field, bindingKinds) {
  if (!exactFields(value, ['binding', 'kind']) || value.kind !== kind) fail('PREPARED_DAG_ARGUMENT_INVALID', `${field} must be an exact named ${kind} binding.`, { node, field });
  const name = identifier(value.binding, 'Binding name', { node, field });
  const prior = bindingKinds.get(name);
  if (prior !== undefined && prior !== kind) fail('PREPARED_DAG_BINDING_CONFLICT', 'One binding name cannot have multiple kinds.', { binding: name });
  bindingKinds.set(name, kind);
  return { binding: name, kind };
}

function preparedScalar(value, node, field, bindingKinds) {
  if (exactFields(value, ['binding', 'kind'])) return preparedBinding(value, 'f32', node, field, bindingKinds);
  if (!exactFields(value, ['kind', 'packedHex']) || value.kind !== 'f32' || typeof value.packedHex !== 'string' || !PACKED_F32.test(value.packedHex)) {
    fail('PREPARED_DAG_ARGUMENT_INVALID', `${field} must be an exact named f32 binding or fixed packed f32 identity.`, { node, field });
  }
  return { kind: 'f32', packedHex: value.packedHex };
}

function normalizeCublasLtPlan(value, node) {
  const fields = ['contract', 'm', 'n', 'k', 'transposeA', 'transposeB', 'maxWorkspaceBytes', 'workspaceBytes', 'requirements', 'provider'];
  if (!exactFields(value, fields) || value.contract !== 'SPEC-0029-cublaslt-f32-row-major-matmul-v1'
      || !['m', 'n', 'k'].every((field) => Number.isSafeInteger(value[field]) && value[field] >= 1 && value[field] <= 0x7fff_ffff)
      || typeof value.transposeA !== 'boolean' || typeof value.transposeB !== 'boolean'
      || !Number.isSafeInteger(value.maxWorkspaceBytes) || value.maxWorkspaceBytes < 0 || value.maxWorkspaceBytes > 256 * 1_048_576
      || !Number.isSafeInteger(value.workspaceBytes) || value.workspaceBytes < 0 || value.workspaceBytes > value.maxWorkspaceBytes
      || !exactFields(value.requirements, ['a', 'b', 'c', 'd'])
      || !['a', 'b', 'c', 'd'].every((field) => Number.isSafeInteger(value.requirements[field]) && value.requirements[field] >= 1)
      || !exactFields(value.provider, ['name', 'version', 'qualification'])
      || !['name', 'version', 'qualification'].every((field) => typeof value.provider[field] === 'string' && value.provider[field].length >= 1 && value.provider[field].length <= 128 && /^[\x20-\x7e]+$/.test(value.provider[field]) && !/[\\/]/.test(value.provider[field]))) {
    fail('PREPARED_DAG_CUBLASLT_PLAN_INVALID', 'Prepared cuBLASLt plan identity is invalid.', { node });
  }
  const expectedRequirements = { a: value.m * value.k, b: value.k * value.n, c: value.m * value.n, d: value.m * value.n };
  if (!Object.values(expectedRequirements).every(Number.isSafeInteger) || !['a', 'b', 'c', 'd'].every((field) => value.requirements[field] === expectedRequirements[field])) {
    fail('PREPARED_DAG_CUBLASLT_PLAN_INVALID', 'Prepared cuBLASLt plan requirements do not match its dimensions.', { node });
  }
  return {
    contract: value.contract,
    m: value.m,
    n: value.n,
    k: value.k,
    transposeA: value.transposeA,
    transposeB: value.transposeB,
    maxWorkspaceBytes: value.maxWorkspaceBytes,
    workspaceBytes: value.workspaceBytes,
    requirements: { a: value.requirements.a, b: value.requirements.b, c: value.requirements.c, d: value.requirements.d },
    provider: { name: value.provider.name, version: value.provider.version, qualification: value.provider.qualification },
  };
}

function normalizeCublasLtNode(entry, id, after, bindingKinds) {
  const fields = ['id', 'kind', 'after', 'plan', 'a', 'b', 'c', 'd', 'alpha', 'beta', 'workspace'];
  if (!exactFields(entry, fields)) fail('PREPARED_DAG_NODE_INVALID', 'Prepared cuBLASLt node fields are invalid.', { node: id });
  const plan = normalizeCublasLtPlan(entry.plan, id);
  const matrices = Object.fromEntries(['a', 'b', 'c', 'd'].map((field) => [field, preparedBinding(entry[field], 'device-memory', id, field, bindingKinds)]));
  const workspace = entry.workspace === null
    ? null
    : preparedBinding(entry.workspace, 'device-memory', id, 'workspace', bindingKinds);
  if ((plan.workspaceBytes > 0) !== (workspace !== null)) fail('PREPARED_DAG_CUBLASLT_WORKSPACE_INVALID', 'Prepared cuBLASLt workspace binding must match the fixed plan requirement.', { node: id, byteLength: plan.workspaceBytes });
  return {
    id,
    kind: 'cublaslt-f32-matmul',
    after,
    plan,
    ...matrices,
    alpha: preparedScalar(entry.alpha, id, 'alpha', bindingKinds),
    beta: preparedScalar(entry.beta, id, 'beta', bindingKinds),
    workspace,
  };
}

function canonicalTopology(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const successors = new Map(nodes.map((node) => [node.id, []]));
  const indegree = new Map(nodes.map((node) => [node.id, node.after.length]));
  let edgeCount = 0;
  for (const node of nodes) {
    for (const predecessor of node.after) {
      if (!byId.has(predecessor)) fail('PREPARED_DAG_DEPENDENCY_UNKNOWN', 'Prepared dependency names an unknown node.', { node: node.id, predecessor });
      if (predecessor === node.id) fail('PREPARED_DAG_CYCLE', 'Prepared node cannot depend on itself.', { node: node.id });
      successors.get(predecessor).push(node.id);
      edgeCount += 1;
    }
  }
  if (edgeCount > PREPARED_OPERATION_DAG_LIMITS.edges) fail('PREPARED_DAG_EDGE_LIMIT', 'Prepared DAG exceeds the dependency-edge limit.', { edgeCount, maximum: PREPARED_OPERATION_DAG_LIMITS.edges });
  for (const entries of successors.values()) entries.sort(codeUnitCompare);
  const ready = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id).sort(codeUnitCompare);
  const submissionOrder = [];
  while (ready.length > 0) {
    const id = ready.shift();
    submissionOrder.push(id);
    for (const successor of successors.get(id)) {
      const next = indegree.get(successor) - 1;
      indegree.set(successor, next);
      if (next === 0) { ready.push(successor); ready.sort(codeUnitCompare); }
    }
  }
  if (submissionOrder.length !== nodes.length) fail('PREPARED_DAG_CYCLE', 'Prepared dependencies must form an acyclic graph.');
  return { edgeCount, submissionOrder };
}

export function normalizePreparedOperationDag(request) {
  if (!exactFields(request, ['executionProfile', 'nodes']) || !Array.isArray(request.nodes) || request.nodes.length < 1 || request.nodes.length > PREPARED_OPERATION_DAG_LIMITS.nodes) {
    fail('PREPARED_DAG_REQUEST_INVALID', 'Prepared DAG request requires a bounded nonempty nodes array and one execution profile.');
  }
  const executionProfile = normalizeProfile(request.executionProfile);
  const ids = new Set();
  const bindingKinds = new Map();
  const nodes = request.nodes.map((entry, inputIndex) => {
    if (!plainObject(entry) || !Object.hasOwn(entry, 'id') || !Object.hasOwn(entry, 'kind') || !Object.hasOwn(entry, 'after')) fail('PREPARED_DAG_NODE_INVALID', 'Prepared DAG node fields are invalid.', { inputIndex });
    const id = identifier(entry.id, 'Node id', { inputIndex });
    if (ids.has(id)) fail('PREPARED_DAG_NODE_DUPLICATE', 'Prepared DAG node IDs must be unique.', { node: id });
    ids.add(id);
    if (!['kernel', 'cublaslt-f32-matmul'].includes(entry.kind)) fail('PREPARED_DAG_NODE_KIND', 'Prepared DAG node kind is not accepted by this profile.', { node: id });
    if (!Array.isArray(entry.after) || entry.after.length > PREPARED_OPERATION_DAG_LIMITS.predecessorsPerNode) fail('PREPARED_DAG_DEPENDENCIES_INVALID', 'Prepared node predecessors must be a bounded array.', { node: id });
    const after = entry.after.map((value) => identifier(value, 'Predecessor id', { node: id })).sort(codeUnitCompare);
    if (after.some((value, index) => index > 0 && value === after[index - 1])) fail('PREPARED_DAG_DEPENDENCY_DUPLICATE', 'Prepared node predecessors must be unique.', { node: id });
    if (entry.kind === 'cublaslt-f32-matmul') return normalizeCublasLtNode(entry, id, after, bindingKinds);
    if (!exactFields(entry, ['id', 'kind', 'after', 'executable', 'grid', 'block', 'sharedMemoryBytes', 'arguments', 'accesses'])) fail('PREPARED_DAG_NODE_INVALID', 'Prepared kernel node fields are invalid.', { node: id });
    const executable = normalizeExecutable(entry.executable, id);
    const grid = dimensions(entry.grid, 'grid', id);
    const block = dimensions(entry.block, 'block', id);
    if (!Number.isSafeInteger(entry.sharedMemoryBytes) || entry.sharedMemoryBytes < 0) fail('PREPARED_DAG_SHARED_MEMORY_INVALID', 'Prepared sharedMemoryBytes must be a nonnegative safe integer.', { node: id });
    const arguments_ = normalizeArguments(entry.arguments, executable, id, bindingKinds);
    const accesses = normalizeAccesses(entry.accesses, executable.parameters, id);
    return { id, kind: 'kernel', after, executable, grid, block, sharedMemoryBytes: entry.sharedMemoryBytes, arguments: arguments_, accesses };
  }).sort((left, right) => codeUnitCompare(left.id, right.id));
  if (bindingKinds.size > PREPARED_OPERATION_DAG_LIMITS.bindings) fail('PREPARED_DAG_BINDING_LIMIT', 'Prepared DAG exceeds the named-binding limit.', { count: bindingKinds.size, maximum: PREPARED_OPERATION_DAG_LIMITS.bindings });
  const topology = canonicalTopology(nodes);
  const bindings = [...bindingKinds.entries()].sort((left, right) => codeUnitCompare(left[0], right[0])).map(([name, kind]) => ({ name, kind }));
  const contract = nodes.some((node) => node.kind === 'cublaslt-f32-matmul') ? PREPARED_CUBLASLT_OPERATION_DAG_CONTRACT : PREPARED_OPERATION_DAG_CONTRACT;
  const semantic = { contract, nodes, bindings, executionProfile };
  const sha256 = createHash('sha256').update(canonicalJson(semantic)).digest('hex');
  return deepFreeze({
    schemaVersion: 1,
    contract,
    sha256,
    nodeCount: nodes.length,
    edgeCount: topology.edgeCount,
    bindings,
    submissionOrder: topology.submissionOrder,
    nodes,
    executionProfile,
  });
}
