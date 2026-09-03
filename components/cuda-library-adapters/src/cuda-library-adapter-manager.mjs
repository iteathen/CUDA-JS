const PLAN_FIELDS = new Set(['m', 'n', 'k', 'transposeA', 'transposeB', 'maxWorkspaceBytes']);
const SUBMIT_FIELDS = new Set(['a', 'b', 'c', 'd', 'alpha', 'beta', 'workspace', 'after']);
const PREPARED_NODE_FIELDS = new Set(['id', 'kind', 'after', 'planToken', 'a', 'b', 'c', 'd', 'alpha', 'beta', 'workspace']);
const MAX_DIMENSION = 0x7fff_ffff;
const MAX_WORKSPACE_BYTES = 256 * 1_048_576;
const CUBLASLT_WORKSPACE_ALIGNMENT_BYTES = 256;

export class CudaLibraryAdapterError extends Error {
  constructor(code, category, message, details = {}, state = {}) {
    super(message);
    this.name = 'CudaLibraryAdapterError';
    this.code = code;
    this.category = category;
    this.details = Object.freeze({ ...details });
    this.operation = state.operation ?? null;
    this.operationId = state.operationId ?? null;
    this.healthBefore = state.healthBefore ?? null;
    this.healthAfter = state.healthAfter ?? null;
  }
}

function fail(code, category, message, details = {}, state = {}) {
  throw new CudaLibraryAdapterError(code, category, message, details, state);
}

function plainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch { return false; }
}

function dimension(value, field) {
  if (!Number.isSafeInteger(value) || value < 1 || value > MAX_DIMENSION) fail('CUBLASLT_MATMUL_DIMENSION_INVALID', 'validation', `${field} must be an integer from 1 through 2^31-1.`, { field, maximum: MAX_DIMENSION });
  return value;
}

function checkedProduct(left, right, field) {
  if (right > Math.floor(Number.MAX_SAFE_INTEGER / left)) fail('CUBLASLT_MATMUL_SIZE_INVALID', 'validation', `${field} exceeds the safe integer range.`, { field });
  return left * right;
}

function normalizePlan(value) {
  if (!plainObject(value) || Object.keys(value).some((key) => !PLAN_FIELDS.has(key)) || !['m', 'n', 'k'].every((key) => Object.hasOwn(value, key))) {
    fail('CUBLASLT_MATMUL_PLAN_INVALID', 'validation', 'The f32 matmul plan contains unknown or missing fields.');
  }
  const m = dimension(value.m, 'm');
  const n = dimension(value.n, 'n');
  const k = dimension(value.k, 'k');
  const transposeA = value.transposeA ?? false;
  const transposeB = value.transposeB ?? false;
  if (typeof transposeA !== 'boolean' || typeof transposeB !== 'boolean') fail('CUBLASLT_MATMUL_TRANSPOSE_INVALID', 'validation', 'transposeA and transposeB must be boolean values.');
  const maxWorkspaceBytes = value.maxWorkspaceBytes ?? 0;
  if (!Number.isSafeInteger(maxWorkspaceBytes) || maxWorkspaceBytes < 0 || maxWorkspaceBytes > MAX_WORKSPACE_BYTES) {
    fail('CUBLASLT_WORKSPACE_LIMIT_INVALID', 'validation', 'maxWorkspaceBytes is outside the bounded first-profile range.', { maximum: MAX_WORKSPACE_BYTES });
  }
  return Object.freeze({
    contract: 'SPEC-0029-cublaslt-f32-row-major-matmul-v1',
    m, n, k, transposeA, transposeB, maxWorkspaceBytes,
    requirements: Object.freeze({ a: checkedProduct(m, k, 'A element count'), b: checkedProduct(k, n, 'B element count'), c: checkedProduct(m, n, 'C element count'), d: checkedProduct(m, n, 'D element count') }),
  });
}

function finiteScalar(value, field) {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail('CUBLASLT_MATMUL_SCALAR_INVALID', 'validation', `${field} must be a finite JavaScript number.`, { field });
  const rounded = Math.fround(value);
  if (!Number.isFinite(rounded)) fail('CUBLASLT_MATMUL_SCALAR_INVALID', 'validation', `${field} must remain finite when represented as f32.`, { field });
  return rounded;
}

function rollbackFailure(code, message, primaryError, cleanupError, operationId) {
  return new CudaLibraryAdapterError(code, 'restart-required', message, {
    causeCode: typeof primaryError?.code === 'string' ? primaryError.code : 'CUDA_LIBRARY_ADAPTER_REGISTRATION_FAILED',
    causeReason: typeof cleanupError?.code === 'string' ? cleanupError.code : 'CUDA_LIBRARY_ADAPTER_CLEANUP_UNPROVED',
  }, { operationId, healthAfter: 'restart-required' });
}

function tokenKey(token) { return `${token.slot}:${token.generation}`; }

function exactFields(value, fields) {
  return plainObject(value) && Object.keys(value).sort().join('\0') === [...fields].sort().join('\0');
}

function packedF32(value) {
  const bytes = Buffer.allocUnsafe(4);
  bytes.writeFloatLE(value);
  return bytes.toString('hex');
}

function preparedBinding(value, field) {
  if (!exactFields(value, ['binding']) || typeof value.binding !== 'string') fail('CUBLASLT_PREPARED_BINDING_INVALID', 'validation', `${field} must be an exact named binding reference.`, { field });
  return Object.freeze({ binding: value.binding, kind: 'device-memory' });
}

function preparedScalar(value, field) {
  if (exactFields(value, ['binding'])) return Object.freeze({ semantic: Object.freeze({ binding: value.binding, kind: 'f32' }), privateValue: Object.freeze({ binding: value.binding }) });
  if (!exactFields(value, ['kind', 'value']) || value.kind !== 'f32') fail('CUBLASLT_PREPARED_SCALAR_INVALID', 'validation', `${field} must be an exact f32 value or named binding.`, { field });
  const normalized = finiteScalar(value.value, field);
  return Object.freeze({ semantic: Object.freeze({ kind: 'f32', packedHex: packedF32(normalized) }), privateValue: Object.freeze({ value: normalized }) });
}

function viewAllows(actual, requested) { return actual === 'read-write' || actual === requested; }

export class CudaLibraryAdapterManager {
  #registry;
  #contextToken;
  #memory;
  #views;
  #execution;
  #operations;
  #adapterToken = null;
  #planCount = 0;

  constructor({ registry, contextToken, memory, views, execution, operations }) {
    if (!registry || !contextToken || typeof memory?.acquireForExecution !== 'function' || typeof views?.acquire !== 'function' || typeof execution?.submitAdapterOperation !== 'function') {
      fail('CUDA_LIBRARY_ADAPTER_OWNER_INVALID', 'internal', 'CUDA library adapter dependencies are invalid.');
    }
    for (const name of ['openCublasLt', 'closeCublasLt', 'createF32MatmulPlan', 'destroyF32MatmulPlan', 'submitF32Matmul']) {
      if (typeof operations?.[name] !== 'function') fail('CUDA_LIBRARY_ADAPTER_BACKEND_INVALID', 'internal', `CUDA library adapter backend operation is missing: ${name}.`);
    }
    this.#registry = registry;
    this.#contextToken = contextToken;
    this.#memory = memory;
    this.#views = views;
    this.#execution = execution;
    this.#operations = operations;
  }

  summary() {
    return Object.freeze({ schemaVersion: 1, profile: 'cublaslt-f32-row-major-matmul-v1', state: this.#adapterToken === null ? 'unopened' : 'open', planCount: this.#planCount, optional: true });
  }

  preparedNodeFamily() {
    return Object.freeze({
      kind: 'cublaslt-f32-matmul',
      prepare: (node, context) => this.#prepareNode(node, context),
      resolve: (node, bindings, context) => this.#resolveNode(node, bindings, context),
    });
  }

  async openCublasLt(operationId = null) {
    let adapterToken = this.#adapterToken;
    let adapterRecord = null;
    let createdAdapter = false;
    if (adapterToken === null) {
      const backend = await this.#operations.openCublasLt({ operationId });
      try {
        adapterToken = this.#registry.allocate({
          kind: 'cublaslt-adapter', value: Object.freeze({ native: backend.native, provider: Object.freeze({ ...backend.provider, workspaceAlignmentBytes: CUBLASLT_WORKSPACE_ALIGNMENT_BYTES }) }), parent: this.#contextToken,
          dispose: async (record) => Object.freeze({ kind: 'cublaslt-adapter', closed: true, backend: await this.#operations.closeCublasLt({ native: record.native, operationId: null }) ?? null }),
        });
        createdAdapter = true;
      } catch (error) {
        try { await this.#operations.closeCublasLt({ native: backend.native, operationId }); }
        catch (cleanupError) { throw rollbackFailure('CUBLASLT_ADAPTER_REGISTRATION_ROLLBACK_FAILED', 'cuBLASLt adapter registration failed and native rollback cleanup was unproved.', error, cleanupError, operationId); }
        throw error;
      }
    }

    try {
      adapterRecord = this.#registry.get(adapterToken, { kind: 'cublaslt-adapter' });
    } catch (error) {
      if (createdAdapter) {
        try { await this.#registry.close(adapterToken); }
        catch (cleanupError) { throw rollbackFailure('CUBLASLT_ADAPTER_REGISTRATION_ROLLBACK_FAILED', 'cuBLASLt adapter registration succeeded but its registered resource could not be observed and rollback cleanup was unproved.', error, cleanupError, operationId); }
      }
      throw error;
    }

    let borrowerToken;
    try {
      borrowerToken = this.#registry.allocate({
        kind: 'cublaslt-borrow',
        value: Object.freeze({ adapter: adapterToken }),
        parent: adapterToken,
        dispose: () => Object.freeze({ kind: 'cublaslt-adapter', closed: true }),
      });
    } catch (error) {
      if (createdAdapter) {
        try { await this.#registry.close(adapterToken); }
        catch (cleanupError) { throw rollbackFailure('CUBLASLT_BORROW_REGISTRATION_ROLLBACK_FAILED', 'cuBLASLt borrower registration failed and provider rollback cleanup was unproved.', error, cleanupError, operationId); }
      }
      throw error;
    }
    if (createdAdapter) this.#adapterToken = adapterToken;
    return this.#adapterDescriptor(borrowerToken, adapterRecord, operationId);
  }

  adapterStatus(token, operationId = null) {
    const borrower = this.#registry.get(token, { kind: 'cublaslt-borrow' });
    return this.#adapterDescriptor(token, this.#registry.get(borrower.adapter, { kind: 'cublaslt-adapter' }), operationId);
  }

  async releaseAdapter(token, operationId = null) {
    const borrower = this.#registry.get(token, { kind: 'cublaslt-borrow' });
    const borrowerClosed = await this.#registry.close(token);
    let providerClosed = null;
    try {
      providerClosed = await this.#registry.close(borrower.adapter);
      if (this.#adapterToken !== null && tokenKey(this.#adapterToken) === tokenKey(borrower.adapter)) this.#adapterToken = null;
    } catch (error) {
      if (error?.code !== 'RESOURCE_HAS_CHILDREN') throw error;
    }
    return Object.freeze({
      schemaVersion: 1,
      released: Object.freeze({ kind: 'cublaslt-adapter' }),
      disposition: providerClosed?.disposition ?? borrowerClosed.disposition,
      operationSequence: operationId,
    });
  }

  async createF32MatmulPlan(adapterToken, options, operationId = null) {
    const normalized = normalizePlan(options);
    const borrowerLease = this.#registry.acquire(adapterToken, { kind: 'cublaslt-borrow' });
    const underlyingAdapterToken = borrowerLease.value.adapter;
    let backend = null;
    try {
      const adapter = this.#registry.get(underlyingAdapterToken, { kind: 'cublaslt-adapter' });
      backend = await this.#operations.createF32MatmulPlan({ adapterNative: adapter.native, plan: normalized, operationId });
      let token;
      try {
        if (!Number.isSafeInteger(backend.workspaceBytes) || backend.workspaceBytes < 0 || backend.workspaceBytes > normalized.maxWorkspaceBytes) {
          fail('CUBLASLT_WORKSPACE_REQUIREMENT_INVALID', 'provider', 'cuBLASLt returned a workspace requirement outside the admitted plan ceiling.', { maximum: normalized.maxWorkspaceBytes });
        }
        token = this.#registry.allocate({
          kind: 'cublaslt-matmul-plan',
          value: Object.freeze({ ...normalized, native: backend.native, adapter: underlyingAdapterToken, workspaceBytes: backend.workspaceBytes }),
          parent: adapterToken,
          dispose: async (record) => Object.freeze({ kind: 'cublaslt-matmul-plan', closed: true, backend: await this.#operations.destroyF32MatmulPlan({ native: record.native, operationId: null }) ?? null }),
        });
      } catch (error) {
        try { await this.#operations.destroyF32MatmulPlan({ native: backend.native, operationId }); }
        catch (cleanupError) { throw rollbackFailure('CUBLASLT_PLAN_REGISTRATION_ROLLBACK_FAILED', 'cuBLASLt plan registration failed and descriptor rollback cleanup was unproved.', error, cleanupError, operationId); }
        throw error;
      }
      this.#planCount += 1;
      return this.#planDescriptor(token, this.#registry.get(token, { kind: 'cublaslt-matmul-plan' }), operationId);
    } finally { borrowerLease.release(); }
  }

  planStatus(token, operationId = null) { return this.#planDescriptor(token, this.#registry.get(token, { kind: 'cublaslt-matmul-plan' }), operationId); }

  async releasePlan(token, operationId = null) {
    const record = this.#registry.get(token, { kind: 'cublaslt-matmul-plan' });
    const closed = await this.#registry.close(token);
    this.#planCount -= 1;
    return Object.freeze({ schemaVersion: 1, released: Object.freeze({ kind: 'cublaslt-matmul-plan', contract: record.contract }), disposition: closed.disposition, operationSequence: operationId });
  }

  async submitF32Matmul(planToken, request, operationId = null) {
    if (!plainObject(request) || Object.keys(request).some((key) => !SUBMIT_FIELDS.has(key)) || !['a', 'b', 'c', 'd'].every((key) => Object.hasOwn(request, key))) {
      fail('CUBLASLT_MATMUL_SUBMIT_INVALID', 'validation', 'The f32 matmul submission contains unknown or missing fields.');
    }
    const planLease = this.#registry.acquire(planToken, { kind: 'cublaslt-matmul-plan' });
    const leases = [planLease];
    let handedOff = false;
    try {
      const alpha = finiteScalar(request.alpha ?? 1, 'alpha');
      const beta = finiteScalar(request.beta ?? 0, 'beta');
      const matrices = {};
      for (const [name, access] of [['a', 'read'], ['b', 'read'], ['c', 'read'], ['d', 'write']]) {
        const acquired = this.#acquireView(request[name], access, planLease.value.requirements[name], name);
        leases.push(acquired);
        matrices[name] = acquired;
      }
      let workspace = null;
      if (planLease.value.workspaceBytes > 0) {
        if (request.workspace === undefined || request.workspace === null) fail('CUBLASLT_WORKSPACE_REQUIRED', 'validation', 'This matmul plan requires an explicit workspace view.', { byteLength: planLease.value.workspaceBytes });
        workspace = this.#acquireWorkspace(request.workspace, planLease.value.workspaceBytes);
        leases.push(workspace);
      } else if (request.workspace !== undefined && request.workspace !== null) {
        fail('CUBLASLT_WORKSPACE_UNEXPECTED', 'validation', 'This zero-workspace plan does not accept a workspace view.');
      }
      const after = request.after ?? null;
      const accesses = [
        this.#access(matrices.a, 'read'), this.#access(matrices.b, 'read'), this.#access(matrices.c, 'read'), this.#access(matrices.d, 'write'),
      ];
      if (workspace) accesses.push(this.#access(workspace, 'read-write'));
      handedOff = true;
      return await this.#execution.submitAdapterOperation({
        kind: 'cublaslt-f32-matmul', after, operationId, accesses, leases,
        enqueue: (streamNative) => this.#operations.submitF32Matmul({
          planNative: planLease.value.native, alpha, beta,
          a: matrices.a, b: matrices.b, c: matrices.c, d: matrices.d,
          workspace, workspaceBytes: planLease.value.workspaceBytes, streamNative, operationId,
        }),
      });
    } catch (error) {
      if (!handedOff) for (let index = leases.length - 1; index >= 0; index -= 1) leases[index].release();
      throw error;
    }
  }

  #prepareNode(node, { operationId = null } = {}) {
    if (!plainObject(node) || Object.keys(node).some((key) => !PREPARED_NODE_FIELDS.has(key)) || ![...PREPARED_NODE_FIELDS].every((key) => Object.hasOwn(node, key)) || node.kind !== 'cublaslt-f32-matmul') {
      fail('CUBLASLT_PREPARED_NODE_INVALID', 'validation', 'Prepared cuBLASLt node contains unknown or missing fields.');
    }
    const planLease = this.#registry.acquire(node.planToken, { kind: 'cublaslt-matmul-plan' });
    try {
      const plan = planLease.value;
      const adapter = this.#registry.get(plan.adapter, { kind: 'cublaslt-adapter' });
      const matrices = Object.fromEntries(['a', 'b', 'c', 'd'].map((field) => [field, preparedBinding(node[field], field)]));
      const alpha = preparedScalar(node.alpha, 'alpha');
      const beta = preparedScalar(node.beta, 'beta');
      const workspace = node.workspace === null ? null : preparedBinding(node.workspace, 'workspace');
      if ((plan.workspaceBytes > 0) !== (workspace !== null)) fail('CUBLASLT_PREPARED_WORKSPACE_INVALID', 'validation', 'Prepared workspace binding must match the selected plan requirement.', { byteLength: plan.workspaceBytes });
      return Object.freeze({
        semantic: Object.freeze({
          id: node.id,
          kind: node.kind,
          after: Array.isArray(node.after) ? [...node.after] : node.after,
          plan: Object.freeze({
            contract: plan.contract,
            m: plan.m,
            n: plan.n,
            k: plan.k,
            transposeA: plan.transposeA,
            transposeB: plan.transposeB,
            maxWorkspaceBytes: plan.maxWorkspaceBytes,
            workspaceBytes: plan.workspaceBytes,
            requirements: Object.freeze({ ...plan.requirements }),
            provider: Object.freeze({ ...adapter.provider }),
          }),
          ...matrices,
          alpha: alpha.semantic,
          beta: beta.semantic,
          workspace,
        }),
        privateNode: Object.freeze({
          id: node.id,
          kind: node.kind,
          planValue: plan,
          matrices,
          alpha: alpha.privateValue,
          beta: beta.privateValue,
          workspace,
        }),
        dependencies: Object.freeze([Object.freeze({ key: `cublaslt-matmul-plan:${tokenKey(node.planToken)}`, lease: planLease })]),
      });
    } catch (error) {
      planLease.release();
      throw error;
    }
  }

  #resolveNode(node, bindings, { operationId = null } = {}) {
    const matrices = {};
    for (const [field, requestedAccess] of [['a', 'read'], ['b', 'read'], ['c', 'read'], ['d', 'write']]) {
      const value = bindings.get(node.matrices[field].binding);
      if (!value || value.argument?.kind !== 'device-view') fail('CUBLASLT_PREPARED_VIEW_REQUIRED', 'validation', `Prepared ${field} must resolve to a device view.`, { field });
      if (value.lease.viewDtype !== 'f32') fail('CUBLASLT_MATMUL_DTYPE_INVALID', 'validation', 'The first cuBLASLt profile accepts only f32 matrix views.', { field });
      const requiredElements = node.planValue.requirements[field];
      if (value.lease.viewElementCount < requiredElements) fail('CUBLASLT_MATMUL_VIEW_TOO_SMALL', 'validation', 'A matrix view is smaller than the plan requirement.', { field, expected: requiredElements, actual: value.lease.viewElementCount });
      if (!viewAllows(value.lease.viewAccess, requestedAccess)) fail('MEMORY_VIEW_ACCESS_DENIED', 'validation', 'Prepared cuBLASLt access exceeds the device view access role.', { field, declared: value.lease.viewAccess, requested: requestedAccess });
      matrices[field] = Object.freeze({ native: value.lease.native, byteOffset: value.lease.byteOffset, byteLength: requiredElements * 4, elementCount: requiredElements });
    }
    let workspace = null;
    if (node.workspace !== null) {
      const value = bindings.get(node.workspace.binding);
      if (!value || value.argument?.kind !== 'device-view') fail('CUBLASLT_PREPARED_VIEW_REQUIRED', 'validation', 'Prepared workspace must resolve to a device view.', { field: 'workspace' });
      if (value.lease.viewByteLength < node.planValue.workspaceBytes) fail('CUBLASLT_WORKSPACE_TOO_SMALL', 'validation', 'The workspace view is smaller than the plan requirement.', { expected: node.planValue.workspaceBytes, actual: value.lease.viewByteLength });
      if (value.lease.byteOffset % CUBLASLT_WORKSPACE_ALIGNMENT_BYTES !== 0) fail('CUBLASLT_WORKSPACE_ALIGNMENT', 'validation', `The workspace view must begin at a ${CUBLASLT_WORKSPACE_ALIGNMENT_BYTES}-byte-aligned offset.`, { workspaceAlignmentBytes: CUBLASLT_WORKSPACE_ALIGNMENT_BYTES });
      if (!viewAllows(value.lease.viewAccess, 'read-write')) fail('MEMORY_VIEW_ACCESS_DENIED', 'validation', 'Prepared workspace requires read-write view access.', { field: 'workspace', declared: value.lease.viewAccess, requested: 'read-write' });
      workspace = Object.freeze({ native: value.lease.native, byteOffset: value.lease.byteOffset, byteLength: node.planValue.workspaceBytes });
    }
    const scalar = (value) => Object.hasOwn(value, 'binding') ? bindings.get(value.binding)?.value : value.value;
    const alpha = finiteScalar(scalar(node.alpha), 'alpha');
    const beta = finiteScalar(scalar(node.beta), 'beta');
    const accesses = [
      this.#access(matrices.a, 'read'), this.#access(matrices.b, 'read'), this.#access(matrices.c, 'read'), this.#access(matrices.d, 'write'),
    ];
    if (workspace) accesses.push(this.#access(workspace, 'read-write'));
    return Object.freeze({
      accesses: Object.freeze(accesses),
      enqueue: (streamNative) => this.#operations.submitF32Matmul({
        planNative: node.planValue.native,
        alpha,
        beta,
        a: matrices.a,
        b: matrices.b,
        c: matrices.c,
        d: matrices.d,
        workspace,
        workspaceBytes: node.planValue.workspaceBytes,
        streamNative,
        operationId,
      }),
    });
  }

  #acquireView(token, access, requiredElements, field) {
    const viewLease = this.#views.acquire(token, { access });
    let memoryLease;
    try {
      if (viewLease.dtype !== 'f32') fail('CUBLASLT_MATMUL_DTYPE_INVALID', 'validation', 'The first cuBLASLt profile accepts only f32 matrix views.', { field });
      if (viewLease.elementCount < requiredElements) fail('CUBLASLT_MATMUL_VIEW_TOO_SMALL', 'validation', 'A matrix view is smaller than the plan requirement.', { field, expected: requiredElements, actual: viewLease.elementCount });
      memoryLease = this.#memory.acquireForExecution(viewLease.memory, viewLease.byteOffset);
    } catch (error) { viewLease.release(); throw error; }
    let released = false;
    return Object.freeze({
      native: memoryLease.native, byteOffset: memoryLease.byteOffset, byteLength: requiredElements * 4, elementCount: requiredElements,
      release() { if (released) return; released = true; memoryLease.release(); viewLease.release(); },
    });
  }

  #acquireWorkspace(token, byteLength) {
    const viewLease = this.#views.acquire(token, { access: 'read-write' });
    let memoryLease;
    try {
      if (viewLease.byteLength < byteLength) fail('CUBLASLT_WORKSPACE_TOO_SMALL', 'validation', 'The workspace view is smaller than the plan requirement.', { expected: byteLength, actual: viewLease.byteLength });
      if (viewLease.byteOffset % CUBLASLT_WORKSPACE_ALIGNMENT_BYTES !== 0) fail('CUBLASLT_WORKSPACE_ALIGNMENT', 'validation', `The workspace view must begin at a ${CUBLASLT_WORKSPACE_ALIGNMENT_BYTES}-byte-aligned offset.`, { workspaceAlignmentBytes: CUBLASLT_WORKSPACE_ALIGNMENT_BYTES });
      memoryLease = this.#memory.acquireForExecution(viewLease.memory, viewLease.byteOffset);
    } catch (error) { viewLease.release(); throw error; }
    let released = false;
    return Object.freeze({
      native: memoryLease.native, byteOffset: memoryLease.byteOffset, byteLength,
      release() { if (released) return; released = true; memoryLease.release(); viewLease.release(); },
    });
  }

  #access(lease, mode) { return Object.freeze({ native: lease.native, start: lease.byteOffset, end: lease.byteOffset + lease.byteLength, mode }); }

  #adapterDescriptor(token, record, operationId) {
    return Object.freeze({ schemaVersion: 1, adapter: token, kind: 'cublaslt-adapter', profile: 'cublaslt-f32-row-major-matmul-v1', provider: record.provider, operationSequence: operationId });
  }

  #planDescriptor(token, record, operationId) {
    return Object.freeze({
      schemaVersion: 1, plan: token, kind: 'cublaslt-matmul-plan', contract: record.contract,
      m: record.m, n: record.n, k: record.k, transposeA: record.transposeA, transposeB: record.transposeB,
      maxWorkspaceBytes: record.maxWorkspaceBytes, workspaceBytes: record.workspaceBytes, requirements: record.requirements,
      operationSequence: operationId,
    });
  }
}
