export const cublasLtF32MatmulFfiDefinitions = Object.freeze({
  cublasLtCreate: Object.freeze({ arguments: ['pointer'], return: 'i32' }),
  cublasLtDestroy: Object.freeze({ arguments: ['u64'], return: 'i32' }),
  cublasLtGetVersion: Object.freeze({ arguments: [], return: 'u64' }),
  cublasLtMatrixLayoutCreate: Object.freeze({ arguments: ['pointer', 'i32', 'u64', 'u64', 'i64'], return: 'i32' }),
  cublasLtMatrixLayoutDestroy: Object.freeze({ arguments: ['u64'], return: 'i32' }),
  cublasLtMatrixLayoutSetAttribute: Object.freeze({ arguments: ['u64', 'i32', 'pointer', 'u64'], return: 'i32' }),
  cublasLtMatmulDescCreate: Object.freeze({ arguments: ['pointer', 'i32', 'i32'], return: 'i32' }),
  cublasLtMatmulDescDestroy: Object.freeze({ arguments: ['u64'], return: 'i32' }),
  cublasLtMatmulDescSetAttribute: Object.freeze({ arguments: ['u64', 'i32', 'pointer', 'u64'], return: 'i32' }),
  cublasLtMatmulPreferenceCreate: Object.freeze({ arguments: ['pointer'], return: 'i32' }),
  cublasLtMatmulPreferenceDestroy: Object.freeze({ arguments: ['u64'], return: 'i32' }),
  cublasLtMatmulPreferenceSetAttribute: Object.freeze({ arguments: ['u64', 'i32', 'pointer', 'u64'], return: 'i32' }),
  cublasLtMatmulAlgoGetHeuristic: Object.freeze({ arguments: ['u64', 'u64', 'u64', 'u64', 'u64', 'u64', 'u64', 'i32', 'pointer', 'pointer'], return: 'i32' }),
  cublasLtMatmul: Object.freeze({ arguments: ['u64', 'u64', 'pointer', 'u64', 'u64', 'u64', 'u64', 'pointer', 'u64', 'u64', 'u64', 'u64', 'pointer', 'u64', 'u64', 'u64'], return: 'i32' }),
});

export const cublasLtF32MatmulAbi = Object.freeze({
  heuristicResult: Object.freeze({ size: 96, algorithmOffset: 0, algorithmSize: 64, workspaceSizeOffset: 64, stateOffset: 72, wavesOffset: 76 }),
  constants: Object.freeze({ cudaR32F: 0, compute32F: 68, operationN: 0, operationT: 1, orderRow: 1, layoutOrderAttribute: 1, matmulTransAAttribute: 3, matmulTransBAttribute: 4, preferenceMaxWorkspaceBytesAttribute: 1 }),
});
