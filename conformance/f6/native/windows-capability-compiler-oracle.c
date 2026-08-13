#include <cuda.h>
#include <nvrtc.h>
#include <nvJitLink.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct blob {
  unsigned char *bytes;
  size_t size;
} blob;

static unsigned int programs_created = 0;
static unsigned int programs_destroyed = 0;
static unsigned int links_created = 0;
static unsigned int links_destroyed = 0;

static void fail(const char *stage, int status) {
  fprintf(stderr, "%s failed with status %d\n", stage, status);
  exit(2);
}

static unsigned char *read_all(const char *path, size_t *size_out) {
  FILE *file = fopen(path, "rb");
  long length;
  unsigned char *bytes;
  if (!file) fail("open input", -1);
  if (fseek(file, 0, SEEK_END) != 0) fail("seek input", -1);
  length = ftell(file);
  if (length <= 0) fail("size input", -1);
  if (fseek(file, 0, SEEK_SET) != 0) fail("rewind input", -1);
  bytes = (unsigned char *)calloc((size_t)length + 1, 1);
  if (!bytes) fail("allocate input", -1);
  if (fread(bytes, 1, (size_t)length, file) != (size_t)length) fail("read input", -1);
  fclose(file);
  if (memchr(bytes, 0, (size_t)length) != NULL) fail("source contains NUL", -1);
  *size_out = (size_t)length;
  return bytes;
}

static void write_all(const char *path, const void *bytes, size_t size) {
  FILE *file = fopen(path, "wb");
  if (!file) fail("open output", -1);
  if (fwrite(bytes, 1, size, file) != size) fail("write output", -1);
  if (fclose(file) != 0) fail("close output", -1);
}

static blob compile_unit(const char *path, const char *name, int lto) {
  const char *rdc_options[] = {
    "--gpu-architecture=compute_75", "--std=c++17", "--fmad=false",
    "--relocatable-device-code=true", "--frandom-seed=0", "--no-cache"
  };
  const char *lto_options[] = {
    "--gpu-architecture=compute_75", "--std=c++17", "--fmad=false",
    "--dlink-time-opt", "--frandom-seed=0", "--no-cache"
  };
  const char **options = lto ? lto_options : rdc_options;
  int option_count = 6;
  size_t source_size = 0;
  unsigned char *source = read_all(path, &source_size);
  nvrtcProgram program = NULL;
  nvrtcResult status;
  size_t log_size = 0;
  char *log = NULL;
  size_t output_size = 0;
  blob output = { NULL, 0 };

  status = nvrtcCreateProgram(&program, (const char *)source, name, 0, NULL, NULL);
  if (status != NVRTC_SUCCESS || program == NULL) fail("nvrtcCreateProgram", status);
  programs_created += 1;
  status = nvrtcCompileProgram(program, option_count, options);
  if (nvrtcGetProgramLogSize(program, &log_size) != NVRTC_SUCCESS) fail("nvrtcGetProgramLogSize", -1);
  if (log_size > 0) {
    log = (char *)calloc(log_size, 1);
    if (!log) fail("allocate log", -1);
    if (nvrtcGetProgramLog(program, log) != NVRTC_SUCCESS) fail("nvrtcGetProgramLog", -1);
  }
  if (status != NVRTC_SUCCESS) {
    fprintf(stderr, "%s\n", log ? log : "NVRTC compile failed without a log");
    fail("nvrtcCompileProgram", status);
  }
  if (lto) {
    if (nvrtcGetLTOIRSize(program, &output_size) != NVRTC_SUCCESS || output_size == 0) fail("nvrtcGetLTOIRSize", -1);
    output.bytes = (unsigned char *)malloc(output_size);
    if (!output.bytes) fail("allocate LTO-IR", -1);
    if (nvrtcGetLTOIR(program, (char *)output.bytes) != NVRTC_SUCCESS) fail("nvrtcGetLTOIR", -1);
    output.size = output_size;
  } else {
    if (nvrtcGetPTXSize(program, &output_size) != NVRTC_SUCCESS || output_size < 2) fail("nvrtcGetPTXSize", -1);
    output.bytes = (unsigned char *)calloc(output_size, 1);
    if (!output.bytes) fail("allocate PTX", -1);
    if (nvrtcGetPTX(program, (char *)output.bytes) != NVRTC_SUCCESS || output.bytes[output_size - 1] != 0) fail("nvrtcGetPTX", -1);
    output.size = output_size - 1;
  }
  status = nvrtcDestroyProgram(&program);
  if (status != NVRTC_SUCCESS || program != NULL) fail("nvrtcDestroyProgram", status);
  programs_destroyed += 1;
  free(source);
  free(log);
  return output;
}

static blob link_units(const blob *inputs, nvJitLinkInputType type, int lto) {
  const char *ptx_options[] = { "-arch=sm_75" };
  const char *lto_options[] = { "-arch=sm_75", "-lto" };
  const char **options = lto ? lto_options : ptx_options;
  const char *ptx_names[] = { "input-0.ptx", "input-1.ptx" };
  const char *lto_names[] = { "input-0.ltoir", "input-1.ltoir" };
  const char **names = lto ? lto_names : ptx_names;
  unsigned int option_count = lto ? 2u : 1u;
  nvJitLinkHandle link = NULL;
  nvJitLinkResult status;
  size_t cubin_size = 0;
  blob output = { NULL, 0 };
  int index;

  status = nvJitLinkCreate(&link, option_count, options);
  if (status != NVJITLINK_SUCCESS || link == NULL) fail("nvJitLinkCreate", status);
  links_created += 1;
  for (index = 0; index < 2; index += 1) {
    status = nvJitLinkAddData(link, type, (void *)inputs[index].bytes, inputs[index].size, names[index]);
    if (status != NVJITLINK_SUCCESS) fail("nvJitLinkAddData", status);
  }
  status = nvJitLinkComplete(link);
  if (status != NVJITLINK_SUCCESS) fail("nvJitLinkComplete", status);
  if (nvJitLinkGetLinkedCubinSize(link, &cubin_size) != NVJITLINK_SUCCESS || cubin_size == 0) fail("nvJitLinkGetLinkedCubinSize", -1);
  output.bytes = (unsigned char *)malloc(cubin_size);
  if (!output.bytes) fail("allocate cubin", -1);
  if (nvJitLinkGetLinkedCubin(link, output.bytes) != NVJITLINK_SUCCESS) fail("nvJitLinkGetLinkedCubin", -1);
  output.size = cubin_size;
  status = nvJitLinkDestroy(&link);
  if (status != NVJITLINK_SUCCESS || link != NULL) fail("nvJitLinkDestroy", status);
  links_destroyed += 1;
  return output;
}

static void run_cubin(const blob *cubin, const char *function_name, const char *output_path) {
  enum { element_count = 64 };
  CUresult status;
  CUdevice device = -1;
  CUcontext context = NULL;
  CUstream stream = NULL;
  CUmodule module = NULL;
  CUfunction function = NULL;
  CUdeviceptr input_device = 0;
  CUdeviceptr output_device = 0;
  CUctxCreateParams context_parameters;
  uint32_t input[element_count];
  uint32_t output[element_count];
  unsigned int count = element_count;
  void *parameters[] = { &input_device, &output_device, &count };
  int index;
  memset(&context_parameters, 0, sizeof(context_parameters));
  memset(output, 0, sizeof(output));
  for (index = 0; index < element_count; index += 1) input[index] = ((uint32_t)index * UINT32_C(0x01010101)) ^ UINT32_C(0xdeadbeef);
  if (cuInit(0) != CUDA_SUCCESS) fail("cuInit", -1);
  if (cuDeviceGet(&device, 0) != CUDA_SUCCESS) fail("cuDeviceGet", -1);
  status = cuCtxCreate(&context, &context_parameters, 0, device);
  if (status != CUDA_SUCCESS || context == NULL) fail("cuCtxCreate", status);
  status = cuStreamCreate(&stream, CU_STREAM_NON_BLOCKING);
  if (status != CUDA_SUCCESS || stream == NULL) fail("cuStreamCreate", status);
  status = cuModuleLoadData(&module, cubin->bytes);
  if (status != CUDA_SUCCESS || module == NULL) fail("cuModuleLoadData", status);
  status = cuModuleGetFunction(&function, module, function_name);
  if (status != CUDA_SUCCESS || function == NULL) fail("cuModuleGetFunction", status);
  status = cuMemAlloc(&input_device, sizeof(input));
  if (status != CUDA_SUCCESS || input_device == 0) fail("cuMemAlloc input", status);
  status = cuMemAlloc(&output_device, sizeof(output));
  if (status != CUDA_SUCCESS || output_device == 0) fail("cuMemAlloc output", status);
  if (cuMemcpyHtoD(input_device, input, sizeof(input)) != CUDA_SUCCESS) fail("cuMemcpyHtoD", -1);
  status = cuLaunchKernel(function, 1, 1, 1, element_count, 1, 1, 0, stream, parameters, NULL);
  if (status != CUDA_SUCCESS) fail("cuLaunchKernel", status);
  if (cuStreamSynchronize(stream) != CUDA_SUCCESS) fail("cuStreamSynchronize", -1);
  if (cuMemcpyDtoH(output, output_device, sizeof(output)) != CUDA_SUCCESS) fail("cuMemcpyDtoH", -1);
  write_all(output_path, output, sizeof(output));
  if (cuMemFree(output_device) != CUDA_SUCCESS) fail("cuMemFree output", -1);
  if (cuMemFree(input_device) != CUDA_SUCCESS) fail("cuMemFree input", -1);
  if (cuModuleUnload(module) != CUDA_SUCCESS) fail("cuModuleUnload", -1);
  if (cuStreamDestroy(stream) != CUDA_SUCCESS) fail("cuStreamDestroy", -1);
  if (cuCtxDestroy(context) != CUDA_SUCCESS) fail("cuCtxDestroy", -1);
}

int main(int argc, char **argv) {
  blob rdc[2];
  blob lto[2];
  blob rdc_cubin;
  blob lto_cubin;
  int nvrtc_major = 0;
  int nvrtc_minor = 0;
  unsigned int link_major = 0;
  unsigned int link_minor = 0;
  int index;
  if (argc != 13) {
    fprintf(stderr, "usage: oracle rdc-kernel rdc-device lto-kernel lto-device rdc-kernel-ptx rdc-device-ptx rdc-cubin lto-kernel-ir lto-device-ir lto-cubin rdc-output lto-output\n");
    return 64;
  }
  if (nvrtcVersion(&nvrtc_major, &nvrtc_minor) != NVRTC_SUCCESS) fail("nvrtcVersion", -1);
  if (nvJitLinkVersion(&link_major, &link_minor) != NVJITLINK_SUCCESS) fail("nvJitLinkVersion", -1);

  rdc[0] = compile_unit(argv[1], "rdc-kernel.cu", 0);
  rdc[1] = compile_unit(argv[2], "rdc-device.cu", 0);
  rdc_cubin = link_units(rdc, NVJITLINK_INPUT_PTX, 0);
  lto[0] = compile_unit(argv[3], "lto-kernel.cu", 1);
  lto[1] = compile_unit(argv[4], "lto-device.cu", 1);
  lto_cubin = link_units(lto, NVJITLINK_INPUT_LTOIR, 1);

  write_all(argv[5], rdc[0].bytes, rdc[0].size);
  write_all(argv[6], rdc[1].bytes, rdc[1].size);
  write_all(argv[7], rdc_cubin.bytes, rdc_cubin.size);
  write_all(argv[8], lto[0].bytes, lto[0].size);
  write_all(argv[9], lto[1].bytes, lto[1].size);
  write_all(argv[10], lto_cubin.bytes, lto_cubin.size);
  run_cubin(&rdc_cubin, "cuda_js_rdc_kernel", argv[11]);
  run_cubin(&lto_cubin, "cuda_js_lto_kernel", argv[12]);

  printf("NVRTC_VERSION=%d.%d\n", nvrtc_major, nvrtc_minor);
  printf("NVJITLINK_VERSION=%u.%u\n", link_major, link_minor);
  printf("PROGRAMS_CREATED=%u\n", programs_created);
  printf("PROGRAMS_DESTROYED=%u\n", programs_destroyed);
  printf("LINKS_CREATED=%u\n", links_created);
  printf("LINKS_DESTROYED=%u\n", links_destroyed);
  printf("RDC_PTX_SIZES=%zu,%zu\n", rdc[0].size, rdc[1].size);
  printf("RDC_CUBIN_SIZE=%zu\n", rdc_cubin.size);
  printf("LTO_IR_SIZES=%zu,%zu\n", lto[0].size, lto[1].size);
  printf("LTO_CUBIN_SIZE=%zu\n", lto_cubin.size);
  printf("DRIVER_OUTPUT_BYTES=%zu\n", (size_t)64U * sizeof(uint32_t));
  printf("DRIVER_CLEANUP=proved\n");

  for (index = 0; index < 2; index += 1) { free(rdc[index].bytes); free(lto[index].bytes); }
  free(rdc_cubin.bytes);
  free(lto_cubin.bytes);
  return programs_created == programs_destroyed && links_created == links_destroyed ? 0 : 3;
}
