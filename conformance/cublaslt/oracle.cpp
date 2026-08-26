#include <cstddef>
#include <cstdint>
#include <iostream>

#include <cuda_runtime_api.h>
#include <cublasLt.h>

namespace {
void require_cuda(cudaError_t status, const char* operation) {
  if (status != cudaSuccess) { std::cerr << operation << ':' << static_cast<int>(status) << '\n'; std::exit(2); }
}
void require_blas(cublasStatus_t status, const char* operation) {
  if (status != CUBLAS_STATUS_SUCCESS) { std::cerr << operation << ':' << static_cast<int>(status) << '\n'; std::exit(3); }
}
}

int main() {
  require_cuda(cudaSetDevice(0), "cudaSetDevice");
  cudaStream_t stream = nullptr;
  require_cuda(cudaStreamCreateWithFlags(&stream, cudaStreamNonBlocking), "cudaStreamCreateWithFlags");
  cublasLtHandle_t handle = nullptr;
  require_blas(cublasLtCreate(&handle), "cublasLtCreate");
  cublasLtMatmulDesc_t operation = nullptr;
  require_blas(cublasLtMatmulDescCreate(&operation, CUBLAS_COMPUTE_32F, CUDA_R_32F), "cublasLtMatmulDescCreate");
  const cublasOperation_t no_transpose = CUBLAS_OP_N;
  require_blas(cublasLtMatmulDescSetAttribute(operation, CUBLASLT_MATMUL_DESC_TRANSA, &no_transpose, sizeof(no_transpose)), "set transa");
  require_blas(cublasLtMatmulDescSetAttribute(operation, CUBLASLT_MATMUL_DESC_TRANSB, &no_transpose, sizeof(no_transpose)), "set transb");

  cublasLtMatrixLayout_t a_desc = nullptr, b_desc = nullptr, c_desc = nullptr, d_desc = nullptr;
  require_blas(cublasLtMatrixLayoutCreate(&a_desc, CUDA_R_32F, 2, 3, 3), "create A");
  require_blas(cublasLtMatrixLayoutCreate(&b_desc, CUDA_R_32F, 3, 2, 2), "create B");
  require_blas(cublasLtMatrixLayoutCreate(&c_desc, CUDA_R_32F, 2, 2, 2), "create C");
  require_blas(cublasLtMatrixLayoutCreate(&d_desc, CUDA_R_32F, 2, 2, 2), "create D");
  const cublasLtOrder_t row_order = CUBLASLT_ORDER_ROW;
  for (auto descriptor : {a_desc, b_desc, c_desc, d_desc}) require_blas(cublasLtMatrixLayoutSetAttribute(descriptor, CUBLASLT_MATRIX_LAYOUT_ORDER, &row_order, sizeof(row_order)), "set row order");

  cublasLtMatmulPreference_t preference = nullptr;
  require_blas(cublasLtMatmulPreferenceCreate(&preference), "create preference");
  const std::uint64_t workspace_limit = 0;
  require_blas(cublasLtMatmulPreferenceSetAttribute(preference, CUBLASLT_MATMUL_PREF_MAX_WORKSPACE_BYTES, &workspace_limit, sizeof(workspace_limit)), "set workspace limit");
  cublasLtMatmulHeuristicResult_t heuristic{};
  int algorithm_count = 0;
  require_blas(cublasLtMatmulAlgoGetHeuristic(handle, operation, a_desc, b_desc, c_desc, d_desc, preference, 1, &heuristic, &algorithm_count), "heuristic");
  if (algorithm_count != 1 || heuristic.state != CUBLAS_STATUS_SUCCESS) return 4;

  const float host_a[] = {1, 2, 3, 4, 5, 6};
  const float host_b[] = {7, 8, 9, 10, 11, 12};
  const float host_c[] = {0, 0, 0, 0};
  float host_d[] = {0, 0, 0, 0};
  float *a = nullptr, *b = nullptr, *c = nullptr, *d = nullptr;
  require_cuda(cudaMalloc(reinterpret_cast<void**>(&a), sizeof(host_a)), "cudaMalloc A");
  require_cuda(cudaMalloc(reinterpret_cast<void**>(&b), sizeof(host_b)), "cudaMalloc B");
  require_cuda(cudaMalloc(reinterpret_cast<void**>(&c), sizeof(host_c)), "cudaMalloc C");
  require_cuda(cudaMalloc(reinterpret_cast<void**>(&d), sizeof(host_d)), "cudaMalloc D");
  require_cuda(cudaMemcpy(a, host_a, sizeof(host_a), cudaMemcpyHostToDevice), "copy A");
  require_cuda(cudaMemcpy(b, host_b, sizeof(host_b), cudaMemcpyHostToDevice), "copy B");
  require_cuda(cudaMemcpy(c, host_c, sizeof(host_c), cudaMemcpyHostToDevice), "copy C");
  const float alpha = 1.0F, beta = 0.0F;
  require_blas(cublasLtMatmul(handle, operation, &alpha, a, a_desc, b, b_desc, &beta, c, c_desc, d, d_desc, &heuristic.algo, nullptr, 0, stream), "cublasLtMatmul");
  require_cuda(cudaStreamSynchronize(stream), "cudaStreamSynchronize");
  require_cuda(cudaMemcpy(host_d, d, sizeof(host_d), cudaMemcpyDeviceToHost), "copy D");

  std::cout << "{\"version\":" << cublasLtGetVersion()
            << ",\"sizeofAlgorithm\":" << sizeof(cublasLtMatmulAlgo_t)
            << ",\"sizeofHeuristic\":" << sizeof(cublasLtMatmulHeuristicResult_t)
            << ",\"workspaceOffset\":" << offsetof(cublasLtMatmulHeuristicResult_t, workspaceSize)
            << ",\"stateOffset\":" << offsetof(cublasLtMatmulHeuristicResult_t, state)
            << ",\"wavesOffset\":" << offsetof(cublasLtMatmulHeuristicResult_t, wavesCount)
            << ",\"workspaceBytes\":" << heuristic.workspaceSize
            << ",\"output\":[" << host_d[0] << ',' << host_d[1] << ',' << host_d[2] << ',' << host_d[3] << "]}\n";

  require_cuda(cudaFree(d), "cudaFree D"); require_cuda(cudaFree(c), "cudaFree C"); require_cuda(cudaFree(b), "cudaFree B"); require_cuda(cudaFree(a), "cudaFree A");
  require_blas(cublasLtMatmulPreferenceDestroy(preference), "destroy preference");
  require_blas(cublasLtMatrixLayoutDestroy(d_desc), "destroy D"); require_blas(cublasLtMatrixLayoutDestroy(c_desc), "destroy C"); require_blas(cublasLtMatrixLayoutDestroy(b_desc), "destroy B"); require_blas(cublasLtMatrixLayoutDestroy(a_desc), "destroy A");
  require_blas(cublasLtMatmulDescDestroy(operation), "destroy operation"); require_blas(cublasLtDestroy(handle), "destroy handle"); require_cuda(cudaStreamDestroy(stream), "destroy stream");
  return 0;
}
