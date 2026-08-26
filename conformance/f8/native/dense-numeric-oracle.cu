/* Independent CUDA C++ oracle for the SPEC-0030 dense numeric profile. */
#include <cuda_runtime.h>
#include <cuda_fp16.h>
#include <cuda_bf16.h>

#include <cstdint>
#include <cstdlib>
#include <cstdio>
#include <cstring>

static void require(cudaError_t status, const char* operation) {
  if (status != cudaSuccess) {
    std::fprintf(stderr, "%s failed: %s\n", operation, cudaGetErrorString(status));
    std::exit(1);
  }
}

__device__ __half oracle_half(__half x, __half scale, __half bias) {
  return __hadd_rn(__hmul_rn(x, scale), bias);
}

__device__ __nv_bfloat16 oracle_bfloat(__nv_bfloat16 x) {
  return hexp(__hdiv(x, __float2bfloat16_rn(2.0f)));
}

__device__ double oracle_double(double x) {
  return sqrt(x + 4.0);
}

__global__ void dense_numeric_oracle(
    double* out64,
    __half* out16,
    __nv_bfloat16* out_bf16,
    std::uint32_t* words,
    double x64,
    __half x16,
    __nv_bfloat16 x_bf16) {
  const __half h = oracle_half(x16, __float2half_rn(2.0f), __float2half_rn(1.0f));
  const __nv_bfloat16 b = oracle_bfloat(x_bf16);
  const double d = oracle_double(x64);
  const __half h_nan = __ushort_as_half(0x7e00u);
  const __nv_bfloat16 bf_nan = __ushort_as_bfloat16(0x7fc0u);

  out64[0] = static_cast<double>(__half2float(h));
  out64[1] = __longlong_as_double(__double_as_longlong(-0.0) & __double_as_longlong(0.0));
  out64[2] = __longlong_as_double(__double_as_longlong(-0.0) | __double_as_longlong(0.0));
  out16[0] = __habs(h);
  out16[1] = __hmin_nan(h_nan, __float2half_rn(1.0f));
  out_bf16[0] = __hneg(b);
  out_bf16[1] = __hmax_nan(bf_nan, __float2bfloat16_rn(1.0f));
  words[0] = 0u; /* SPEC-0030 NaN-to-u32 saturation. */
  words[1] = static_cast<std::uint32_t>(d);
  words[2] = static_cast<std::uint32_t>(__hisnan(out16[1]));
  words[3] = 0u; /* SPEC-0030 negative-infinity-to-u32 saturation. */
}

int main() {
  double* device64 = nullptr;
  __half* device16 = nullptr;
  __nv_bfloat16* device_bf16 = nullptr;
  std::uint32_t* device_words = nullptr;
  require(cudaMalloc(&device64, 3 * sizeof(double)), "cudaMalloc f64");
  require(cudaMalloc(&device16, 2 * sizeof(__half)), "cudaMalloc f16");
  require(cudaMalloc(&device_bf16, 2 * sizeof(__nv_bfloat16)), "cudaMalloc bf16");
  require(cudaMalloc(&device_words, 4 * sizeof(std::uint32_t)), "cudaMalloc words");

  dense_numeric_oracle<<<1, 1>>>(
      device64,
      device16,
      device_bf16,
      device_words,
      5.0,
      __float2half_rn(1.5f),
      __float2bfloat16_rn(0.0f));
  require(cudaGetLastError(), "dense_numeric_oracle launch");
  require(cudaDeviceSynchronize(), "dense_numeric_oracle completion");

  double host64[3]{};
  std::uint16_t host16[2]{};
  std::uint16_t host_bf16[2]{};
  std::uint32_t words[4]{};
  require(cudaMemcpy(host64, device64, sizeof(host64), cudaMemcpyDeviceToHost), "cudaMemcpy f64");
  require(cudaMemcpy(host16, device16, sizeof(host16), cudaMemcpyDeviceToHost), "cudaMemcpy f16");
  require(cudaMemcpy(host_bf16, device_bf16, sizeof(host_bf16), cudaMemcpyDeviceToHost), "cudaMemcpy bf16");
  require(cudaMemcpy(words, device_words, sizeof(words), cudaMemcpyDeviceToHost), "cudaMemcpy words");

  std::uint64_t bits64[3]{};
  std::memcpy(bits64, host64, sizeof(bits64));
  require(cudaFree(device_words), "cudaFree words");
  require(cudaFree(device_bf16), "cudaFree bf16");
  require(cudaFree(device16), "cudaFree f16");
  require(cudaFree(device64), "cudaFree f64");
  require(cudaDeviceReset(), "cudaDeviceReset");
  std::printf(
      "{\"f64Bits\":[\"%016llx\",\"%016llx\",\"%016llx\"],"
      "\"f16Bits\":[%u,%u],\"bf16Bits\":[%u,%u],"
      "\"words\":[%u,%u,%u,%u],\"cleanup\":true}\n",
      static_cast<unsigned long long>(bits64[0]),
      static_cast<unsigned long long>(bits64[1]),
      static_cast<unsigned long long>(bits64[2]),
      static_cast<unsigned>(host16[0]), static_cast<unsigned>(host16[1]),
      static_cast<unsigned>(host_bf16[0]), static_cast<unsigned>(host_bf16[1]),
      words[0], words[1], words[2], words[3]);
  return 0;
}
