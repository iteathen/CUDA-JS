#include <nvrtc.h>
#include <nvJitLink.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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
  *size_out = (size_t)length;
  return bytes;
}

static void write_all(const char *path, const void *bytes, size_t size) {
  FILE *file = fopen(path, "wb");
  if (!file) fail("open output", -1);
  if (fwrite(bytes, 1, size, file) != size) fail("write output", -1);
  if (fclose(file) != 0) fail("close output", -1);
}

int main(int argc, char **argv) {
  const char *compile_options[] = {
    "--gpu-architecture=compute_75",
    "--std=c++17",
    "--fmad=false",
    "--frandom-seed=0",
    "--no-cache",
#if defined(__linux__)
    "--modify-stack-limit=false"
#endif
  };
  const char *link_options[] = { "-arch=sm_75" };
  size_t source_size = 0;
  unsigned char *source;
  nvrtcProgram program = NULL;
  size_t log_size = 0;
  char *log = NULL;
  size_t ptx_size_with_nul = 0;
  char *ptx = NULL;
  size_t ptx_size = 0;
  nvJitLinkHandle link = NULL;
  size_t cubin_size = 0;
  unsigned char *cubin = NULL;
  int nvrtc_major = 0;
  int nvrtc_minor = 0;
  unsigned int link_major = 0;
  unsigned int link_minor = 0;
  nvrtcResult compile_status;
  nvrtcResult destroy_program_status;
  nvJitLinkResult link_status;
  nvJitLinkResult destroy_link_status;

  if (argc != 4) {
    fprintf(stderr, "usage: compiler-oracle source ptx-output cubin-output\n");
    return 64;
  }
  source = read_all(argv[1], &source_size);
  if (memchr(source, 0, source_size) != NULL) fail("source contains NUL", -1);
  if (nvrtcVersion(&nvrtc_major, &nvrtc_minor) != NVRTC_SUCCESS) fail("nvrtcVersion", -1);
  if (nvJitLinkVersion(&link_major, &link_minor) != NVJITLINK_SUCCESS) fail("nvJitLinkVersion", -1);

  if (nvrtcCreateProgram(&program, (const char *)source, "vector-add.cu", 0, NULL, NULL) != NVRTC_SUCCESS) fail("nvrtcCreateProgram", -1);
  compile_status = nvrtcCompileProgram(program, (int)(sizeof(compile_options) / sizeof(compile_options[0])), compile_options);
  if (nvrtcGetProgramLogSize(program, &log_size) != NVRTC_SUCCESS) fail("nvrtcGetProgramLogSize", -1);
  if (log_size > 0) {
    log = (char *)calloc(log_size, 1);
    if (!log) fail("allocate log", -1);
    if (nvrtcGetProgramLog(program, log) != NVRTC_SUCCESS) fail("nvrtcGetProgramLog", -1);
  }
  if (compile_status != NVRTC_SUCCESS) {
    fprintf(stderr, "%s\n", log ? log : "NVRTC compile failed without a log");
    fail("nvrtcCompileProgram", compile_status);
  }
  if (nvrtcGetPTXSize(program, &ptx_size_with_nul) != NVRTC_SUCCESS || ptx_size_with_nul < 2) fail("nvrtcGetPTXSize", -1);
  ptx = (char *)calloc(ptx_size_with_nul, 1);
  if (!ptx) fail("allocate PTX", -1);
  if (nvrtcGetPTX(program, ptx) != NVRTC_SUCCESS) fail("nvrtcGetPTX", -1);
  if (ptx[ptx_size_with_nul - 1] != '\0') fail("PTX terminator", -1);
  ptx_size = ptx_size_with_nul - 1;
  write_all(argv[2], ptx, ptx_size);
  destroy_program_status = nvrtcDestroyProgram(&program);
  if (destroy_program_status != NVRTC_SUCCESS || program != NULL) fail("nvrtcDestroyProgram", destroy_program_status);

  link_status = nvJitLinkCreate(&link, 1, link_options);
  if (link_status != NVJITLINK_SUCCESS || link == NULL) fail("nvJitLinkCreate", link_status);
  link_status = nvJitLinkAddData(link, NVJITLINK_INPUT_PTX, ptx, ptx_size_with_nul, "input-0.ptx");
  if (link_status != NVJITLINK_SUCCESS) fail("nvJitLinkAddData", link_status);
  link_status = nvJitLinkComplete(link);
  if (link_status != NVJITLINK_SUCCESS) fail("nvJitLinkComplete", link_status);
  if (nvJitLinkGetLinkedCubinSize(link, &cubin_size) != NVJITLINK_SUCCESS || cubin_size == 0) fail("nvJitLinkGetLinkedCubinSize", -1);
  cubin = (unsigned char *)malloc(cubin_size);
  if (!cubin) fail("allocate cubin", -1);
  if (nvJitLinkGetLinkedCubin(link, cubin) != NVJITLINK_SUCCESS) fail("nvJitLinkGetLinkedCubin", -1);
  write_all(argv[3], cubin, cubin_size);
  destroy_link_status = nvJitLinkDestroy(&link);
  if (destroy_link_status != NVJITLINK_SUCCESS || link != NULL) fail("nvJitLinkDestroy", destroy_link_status);

  printf("NVRTC_VERSION=%d.%d\n", nvrtc_major, nvrtc_minor);
  printf("NVJITLINK_VERSION=%u.%u\n", link_major, link_minor);
  printf("PTX_SIZE=%zu\n", ptx_size);
  printf("CUBIN_SIZE=%zu\n", cubin_size);
  printf("PROGRAM_DESTROYED=1\n");
  printf("LINK_DESTROYED=1\n");

  free(source);
  free(log);
  free(ptx);
  free(cubin);
  return 0;
}
