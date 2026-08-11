/* Independent CJS-F5W launch oracle compiled with MSVC and pinned CUDA 13.3 headers. */
#include <cuda.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

#define ELEMENT_COUNT 1024U
#define VECTOR_BYTES (ELEMENT_COUNT * sizeof(uint32_t))
#define PARAMETER_BYTES 28U
#define COMPLETION_TIMEOUT_MS 30000ULL

static uint32_t checksum_bytes(const unsigned char *bytes, size_t length) {
    uint32_t checksum = UINT32_C(2166136261);
    size_t index;
    for (index = 0; index < length; index++) {
        checksum ^= bytes[index];
        checksum *= UINT32_C(16777619);
    }
    return checksum;
}

static unsigned char *read_ptx(const char *path, size_t *byte_length) {
    FILE *file = NULL;
    long length;
    unsigned char *bytes;
    if (fopen_s(&file, path, "rb") != 0 || file == NULL) return NULL;
    if (fseek(file, 0, SEEK_END) != 0) { fclose(file); return NULL; }
    length = ftell(file);
    if (length <= 0 || length > 64L * 1024L * 1024L || fseek(file, 0, SEEK_SET) != 0) { fclose(file); return NULL; }
    bytes = (unsigned char *)calloc((size_t)length + 1U, 1U);
    if (bytes == NULL) { fclose(file); return NULL; }
    if (fread(bytes, 1U, (size_t)length, file) != (size_t)length) { free(bytes); fclose(file); return NULL; }
    fclose(file);
    *byte_length = (size_t)length;
    return bytes;
}

int main(int argc, char **argv) {
    CUresult result;
    CUdevice device = -1;
    CUcontext context = NULL;
    CUstream stream = NULL;
    CUmodule module = NULL;
    CUfunction function = NULL;
    CUevent event = NULL;
    CUdeviceptr output_device = 0;
    CUdeviceptr left_device = 0;
    CUdeviceptr right_device = 0;
    CUctxCreateParams context_parameters;
    CUlaunchConfig launch_config;
    unsigned char parameter_buffer[PARAMETER_BYTES];
    void *extra[5];
    size_t parameter_size = PARAMETER_BYTES;
    unsigned char *ptx = NULL;
    size_t ptx_length = 0;
    uint32_t left[ELEMENT_COUNT];
    uint32_t right[ELEMENT_COUNT];
    uint32_t expected[ELEMENT_COUNT];
    uint32_t output[ELEMENT_COUNT];
    unsigned int index;
    unsigned int polls = 0;
    const uint32_t element_count = ELEMENT_COUNT;
    ULONGLONG started;
    int exit_code = 0;

    if (argc != 2) return 2;
    ptx = read_ptx(argv[1], &ptx_length);
    if (ptx == NULL) return 3;
    memset(&context_parameters, 0, sizeof(context_parameters));
    memset(&launch_config, 0, sizeof(launch_config));
    memset(parameter_buffer, 0, sizeof(parameter_buffer));
    memset(output, 0, sizeof(output));
    for (index = 0; index < ELEMENT_COUNT; index++) {
        left[index] = index * 3U + 7U;
        right[index] = index * 5U + 11U;
        expected[index] = left[index] + right[index];
    }

    printf("PARAM_LAYOUT\t0\t8\t16\t24\t28\n");
    printf("CONFIG_LAYOUT\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\n",
        sizeof(CUlaunchConfig), offsetof(CUlaunchConfig, gridDimX), offsetof(CUlaunchConfig, gridDimY),
        offsetof(CUlaunchConfig, gridDimZ), offsetof(CUlaunchConfig, blockDimX), offsetof(CUlaunchConfig, blockDimY),
        offsetof(CUlaunchConfig, blockDimZ), offsetof(CUlaunchConfig, sharedMemBytes), offsetof(CUlaunchConfig, hStream),
        offsetof(CUlaunchConfig, attrs), offsetof(CUlaunchConfig, numAttrs));
    printf("PTX\t%zu\n", ptx_length);

    result = cuInit(0);
    printf("INIT\t%d\n", (int)result);
    if (result != CUDA_SUCCESS) { exit_code = 4; goto cleanup; }
    result = cuDeviceGet(&device, 0);
    printf("DEVICE\t%d\t%d\n", (int)result, (int)device);
    if (result != CUDA_SUCCESS) { exit_code = 5; goto cleanup; }
    result = cuCtxCreate(&context, &context_parameters, 0, device);
    printf("CONTEXT_CREATE\t%d\t%d\n", (int)result, context != NULL ? 1 : 0);
    if (result != CUDA_SUCCESS || context == NULL) { exit_code = 6; goto cleanup; }
    result = cuStreamCreate(&stream, CU_STREAM_NON_BLOCKING);
    printf("STREAM_CREATE\t%d\t%d\n", (int)result, stream != NULL ? 1 : 0);
    if (result != CUDA_SUCCESS || stream == NULL) { exit_code = 7; goto cleanup; }
    result = cuModuleLoadData(&module, ptx);
    printf("MODULE_LOAD\t%d\t%d\n", (int)result, module != NULL ? 1 : 0);
    if (result != CUDA_SUCCESS || module == NULL) { exit_code = 8; goto cleanup; }
    result = cuModuleGetFunction(&function, module, "cuda_js_vector_add_u32");
    printf("FUNCTION_GET\t%d\t%d\n", (int)result, function != NULL ? 1 : 0);
    if (result != CUDA_SUCCESS || function == NULL) { exit_code = 9; goto cleanup; }
    result = cuMemAlloc(&output_device, VECTOR_BYTES);
    if (result == CUDA_SUCCESS) result = cuMemAlloc(&left_device, VECTOR_BYTES);
    if (result == CUDA_SUCCESS) result = cuMemAlloc(&right_device, VECTOR_BYTES);
    printf("ALLOCATE\t%d\t%d\n", (int)result, (output_device != 0 && left_device != 0 && right_device != 0) ? 1 : 0);
    if (result != CUDA_SUCCESS || output_device == 0 || left_device == 0 || right_device == 0) { exit_code = 10; goto cleanup; }
    result = cuMemcpyHtoD(left_device, left, VECTOR_BYTES);
    if (result == CUDA_SUCCESS) result = cuMemcpyHtoD(right_device, right, VECTOR_BYTES);
    printf("INPUT_COPY\t%d\t%u\n", (int)result, (unsigned int)VECTOR_BYTES);
    if (result != CUDA_SUCCESS) { exit_code = 11; goto cleanup; }

    memcpy(parameter_buffer + 0U, &output_device, sizeof(output_device));
    memcpy(parameter_buffer + 8U, &left_device, sizeof(left_device));
    memcpy(parameter_buffer + 16U, &right_device, sizeof(right_device));
    memcpy(parameter_buffer + 24U, &element_count, sizeof(element_count));
    extra[0] = CU_LAUNCH_PARAM_BUFFER_POINTER;
    extra[1] = parameter_buffer;
    extra[2] = CU_LAUNCH_PARAM_BUFFER_SIZE;
    extra[3] = &parameter_size;
    extra[4] = CU_LAUNCH_PARAM_END;
    launch_config.gridDimX = (ELEMENT_COUNT + 127U) / 128U;
    launch_config.gridDimY = 1U;
    launch_config.gridDimZ = 1U;
    launch_config.blockDimX = 128U;
    launch_config.blockDimY = 1U;
    launch_config.blockDimZ = 1U;
    launch_config.sharedMemBytes = 0U;
    launch_config.hStream = stream;
    launch_config.attrs = NULL;
    launch_config.numAttrs = 0U;
    result = cuEventCreate(&event, CU_EVENT_DISABLE_TIMING);
    printf("EVENT_CREATE\t%d\t%d\n", (int)result, event != NULL ? 1 : 0);
    if (result != CUDA_SUCCESS || event == NULL) { exit_code = 12; goto cleanup; }
    result = cuLaunchKernelEx(&launch_config, function, NULL, extra);
    printf("LAUNCH\t%d\t%u\t%u\n", (int)result, launch_config.gridDimX, launch_config.blockDimX);
    if (result != CUDA_SUCCESS) { exit_code = 13; goto cleanup; }
    result = cuEventRecord(event, stream);
    printf("EVENT_RECORD\t%d\n", (int)result);
    if (result != CUDA_SUCCESS) { exit_code = 14; goto cleanup; }
    started = GetTickCount64();
    for (;;) {
        result = cuEventQuery(event);
        polls++;
        if (result == CUDA_SUCCESS) break;
        if (result != CUDA_ERROR_NOT_READY) { exit_code = 15; goto cleanup; }
        if (GetTickCount64() - started >= COMPLETION_TIMEOUT_MS) { exit_code = 16; goto cleanup; }
        Sleep(1U);
    }
    printf("COMPLETE\t%d\t%u\n", (int)result, polls);
    result = cuMemcpyDtoH(output, output_device, VECTOR_BYTES);
    printf("OUTPUT_COPY\t%d\t%u\n", (int)result, (unsigned int)VECTOR_BYTES);
    if (result != CUDA_SUCCESS) { exit_code = 17; goto cleanup; }
    printf("RESULT\t%d\t%u\n", memcmp(output, expected, VECTOR_BYTES) == 0 ? 1 : 0, checksum_bytes((const unsigned char *)output, VECTOR_BYTES));
    if (memcmp(output, expected, VECTOR_BYTES) != 0) exit_code = 18;

cleanup:
    if (event != NULL) { result = cuEventDestroy(event); printf("EVENT_DESTROY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 19; }
    if (right_device != 0) { result = cuMemFree(right_device); printf("FREE_RIGHT\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 20; }
    if (left_device != 0) { result = cuMemFree(left_device); printf("FREE_LEFT\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 21; }
    if (output_device != 0) { result = cuMemFree(output_device); printf("FREE_OUTPUT\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 22; }
    if (module != NULL) { result = cuModuleUnload(module); printf("MODULE_UNLOAD\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 23; }
    if (stream != NULL) { result = cuStreamDestroy(stream); printf("STREAM_DESTROY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 24; }
    if (context != NULL) { result = cuCtxDestroy(context); printf("CONTEXT_DESTROY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 25; }
    free(ptx);
    return exit_code;
}
