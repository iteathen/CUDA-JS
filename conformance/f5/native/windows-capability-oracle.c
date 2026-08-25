/* Independent SPEC-0011/SPEC-0016 oracle compiled with MSVC and CUDA 13.3. */
#include <cuda.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

#define SCALAR_PARAMETER_BYTES 32U
#define DELAY_PARAMETER_BYTES 16U
#define MAILBOX_PARAMETER_BYTES 16U
#define OUTPUT_WORDS 5U
#define COMPLETION_TIMEOUT_MS 30000ULL
#define DELAY_CYCLES UINT64_C(250000000)

struct scalar_layout {
    uint32_t legacy;
    uint64_t wide;
    int32_t signed_value;
    float fractional;
    CUdeviceptr output;
};

struct scalar_case {
    uint32_t legacy;
    uint64_t wide;
    int32_t signed_value;
    float fractional;
};

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

static CUresult launch_buffered(
    CUfunction function,
    CUstream stream,
    unsigned char *parameter_buffer,
    size_t parameter_size) {
    CUlaunchConfig config;
    void *extra[5];
    memset(&config, 0, sizeof(config));
    config.gridDimX = 1U;
    config.gridDimY = 1U;
    config.gridDimZ = 1U;
    config.blockDimX = 1U;
    config.blockDimY = 1U;
    config.blockDimZ = 1U;
    config.hStream = stream;
    extra[0] = CU_LAUNCH_PARAM_BUFFER_POINTER;
    extra[1] = parameter_buffer;
    extra[2] = CU_LAUNCH_PARAM_BUFFER_SIZE;
    extra[3] = &parameter_size;
    extra[4] = CU_LAUNCH_PARAM_END;
    return cuLaunchKernelEx(&config, function, NULL, extra);
}

static CUresult wait_event(CUevent event, unsigned int *polls) {
    ULONGLONG started = GetTickCount64();
    CUresult result;
    *polls = 0U;
    for (;;) {
        result = cuEventQuery(event);
        *polls += 1U;
        if (result == CUDA_SUCCESS) return result;
        if (result != CUDA_ERROR_NOT_READY) return result;
        if (GetTickCount64() - started >= COMPLETION_TIMEOUT_MS) return CUDA_ERROR_TIMEOUT;
        Sleep(1U);
    }
}

int main(int argc, char **argv) {
    static const struct scalar_case cases[] = {
        { UINT32_C(0), UINT64_C(0), INT32_MIN, -0.0f },
        { UINT32_MAX, UINT64_MAX, INT32_MAX, 0.333333333333333333f },
        { UINT32_C(0x12345678), UINT64_C(0x0102030405060708), INT32_C(-2), 1.5f }
    };
    CUresult result;
    CUdevice device = -1;
    CUcontext context = NULL;
    CUstream stream = NULL;
    CUmodule module = NULL;
    CUfunction scalar_function = NULL;
    CUfunction delayed_function = NULL;
    CUfunction mailbox_function = NULL;
    CUevent event = NULL;
    CUdeviceptr output_device = 0;
    CUdeviceptr transfer_device = 0;
    CUdeviceptr transfer_copy_device = 0;
    CUctxCreateParams context_parameters;
    unsigned char scalar_parameters[SCALAR_PARAMETER_BYTES];
    unsigned char delay_parameters[DELAY_PARAMETER_BYTES];
    unsigned char mailbox_parameters[MAILBOX_PARAMETER_BYTES];
    uint32_t output[OUTPUT_WORDS];
    uint32_t *transfer_input = NULL;
    uint32_t *transfer_output = NULL;
    uint32_t *mailbox_words = NULL;
    CUdeviceptr mailbox_device = 0;
    int mailbox_registered = 0;
    unsigned char *ptx = NULL;
    size_t ptx_length = 0U;
    size_t index;
    unsigned int polls = 0U;
    int exit_code = 0;

    if (argc != 2) return 2;
    ptx = read_ptx(argv[1], &ptx_length);
    if (ptx == NULL) return 3;
    memset(&context_parameters, 0, sizeof(context_parameters));

    printf("SCALAR_LAYOUT\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\n",
        offsetof(struct scalar_layout, legacy),
        offsetof(struct scalar_layout, wide),
        offsetof(struct scalar_layout, signed_value),
        offsetof(struct scalar_layout, fractional),
        offsetof(struct scalar_layout, output),
        sizeof(struct scalar_layout));
    printf("TYPE_LAYOUT\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\t%zu\n",
        sizeof(uint32_t), _Alignof(uint32_t), sizeof(uint64_t), _Alignof(uint64_t),
        sizeof(int32_t), _Alignof(int32_t), sizeof(float), _Alignof(float),
        sizeof(CUdeviceptr), _Alignof(CUdeviceptr));
    printf("PTX\t%zu\n", ptx_length);

    result = cuInit(0);
    if (result != CUDA_SUCCESS) { exit_code = 4; goto cleanup; }
    result = cuDeviceGet(&device, 0);
    if (result != CUDA_SUCCESS) { exit_code = 5; goto cleanup; }
    result = cuCtxCreate(&context, &context_parameters, 0, device);
    if (result != CUDA_SUCCESS || context == NULL) { exit_code = 6; goto cleanup; }
    result = cuStreamCreate(&stream, CU_STREAM_NON_BLOCKING);
    if (result != CUDA_SUCCESS || stream == NULL) { exit_code = 7; goto cleanup; }
    result = cuModuleLoadData(&module, ptx);
    if (result != CUDA_SUCCESS || module == NULL) { exit_code = 8; goto cleanup; }
    result = cuModuleGetFunction(&scalar_function, module, "cuda_js_native_scalar");
    if (result != CUDA_SUCCESS || scalar_function == NULL) { exit_code = 9; goto cleanup; }
    result = cuModuleGetFunction(&delayed_function, module, "cuda_js_native_delayed");
    if (result != CUDA_SUCCESS || delayed_function == NULL) { exit_code = 10; goto cleanup; }
    result = cuModuleGetFunction(&mailbox_function, module, "cuda_js_native_mailbox");
    if (result != CUDA_SUCCESS || mailbox_function == NULL) { exit_code = 44; goto cleanup; }
    result = cuMemAlloc(&output_device, sizeof(output));
    if (result != CUDA_SUCCESS || output_device == 0) { exit_code = 11; goto cleanup; }
    result = cuEventCreate(&event, CU_EVENT_DISABLE_TIMING);
    if (result != CUDA_SUCCESS || event == NULL) { exit_code = 12; goto cleanup; }

    for (index = 0U; index < sizeof(cases) / sizeof(cases[0]); index++) {
        memset(output, 0, sizeof(output));
        memset(scalar_parameters, 0, sizeof(scalar_parameters));
        memcpy(scalar_parameters + 0U, &cases[index].legacy, sizeof(cases[index].legacy));
        memcpy(scalar_parameters + 8U, &cases[index].wide, sizeof(cases[index].wide));
        memcpy(scalar_parameters + 16U, &cases[index].signed_value, sizeof(cases[index].signed_value));
        memcpy(scalar_parameters + 20U, &cases[index].fractional, sizeof(cases[index].fractional));
        memcpy(scalar_parameters + 24U, &output_device, sizeof(output_device));
        result = cuMemsetD8(output_device, 0U, sizeof(output));
        if (result != CUDA_SUCCESS) { exit_code = 13; goto cleanup; }
        result = launch_buffered(scalar_function, stream, scalar_parameters, sizeof(scalar_parameters));
        if (result != CUDA_SUCCESS) { exit_code = 14; goto cleanup; }
        result = cuEventRecord(event, stream);
        if (result != CUDA_SUCCESS) { exit_code = 15; goto cleanup; }
        result = wait_event(event, &polls);
        if (result != CUDA_SUCCESS) { exit_code = 16; goto cleanup; }
        result = cuMemcpyDtoH(output, output_device, sizeof(output));
        if (result != CUDA_SUCCESS) { exit_code = 17; goto cleanup; }
        printf("SCALAR_CASE_%zu\t%u\t%u\t%u\t%u\t%u\n", index,
            output[0], output[1], output[2], output[3], output[4]);
    }

    memset(delay_parameters, 0, sizeof(delay_parameters));
    memcpy(delay_parameters + 0U, &output_device, sizeof(output_device));
    {
        const uint64_t cycles = DELAY_CYCLES;
        memcpy(delay_parameters + 8U, &cycles, sizeof(cycles));
    }
    result = cuMemsetD8(output_device, 0U, sizeof(uint32_t));
    if (result != CUDA_SUCCESS) { exit_code = 18; goto cleanup; }
    result = launch_buffered(delayed_function, stream, delay_parameters, sizeof(delay_parameters));
    if (result != CUDA_SUCCESS) { exit_code = 19; goto cleanup; }
    result = cuEventRecord(event, stream);
    if (result != CUDA_SUCCESS) { exit_code = 20; goto cleanup; }
    result = cuEventQuery(event);
    printf("DELAY_FIRST_QUERY\t%d\n", (int)result);
    if (result != CUDA_ERROR_NOT_READY) { exit_code = 21; goto cleanup; }
    result = wait_event(event, &polls);
    if (result != CUDA_SUCCESS) { exit_code = 22; goto cleanup; }
    result = cuMemcpyDtoH(output, output_device, sizeof(uint32_t));
    if (result != CUDA_SUCCESS) { exit_code = 23; goto cleanup; }
    printf("DELAY_RESULT\t%u\t%u\t%u\n", output[0], polls, (unsigned int)(DELAY_CYCLES / UINT64_C(1000000)));
    if (output[0] != UINT32_C(0xc001d00d)) exit_code = 24;

    result = cuMemAlloc(&transfer_device, 4U * sizeof(uint32_t));
    if (result != CUDA_SUCCESS || transfer_device == 0) { exit_code = 30; goto cleanup; }
    result = cuMemAlloc(&transfer_copy_device, 4U * sizeof(uint32_t));
    if (result != CUDA_SUCCESS || transfer_copy_device == 0) { exit_code = 31; goto cleanup; }
    result = cuMemHostAlloc((void **)&transfer_input, 4U * sizeof(uint32_t), 0U);
    if (result != CUDA_SUCCESS || transfer_input == NULL) { exit_code = 32; goto cleanup; }
    result = cuMemHostAlloc((void **)&transfer_output, 4U * sizeof(uint32_t), 0U);
    if (result != CUDA_SUCCESS || transfer_output == NULL) { exit_code = 33; goto cleanup; }
    transfer_input[0] = UINT32_C(3);
    transfer_input[1] = UINT32_C(5);
    transfer_input[2] = UINT32_C(7);
    transfer_input[3] = UINT32_C(11);
    memset(transfer_output, 0, 4U * sizeof(uint32_t));
    result = cuMemcpyHtoDAsync(transfer_device, transfer_input, 4U * sizeof(uint32_t), stream);
    if (result != CUDA_SUCCESS) { exit_code = 34; goto cleanup; }
    result = cuMemcpyDtoDAsync(transfer_copy_device, transfer_device, 4U * sizeof(uint32_t), stream);
    if (result != CUDA_SUCCESS) { exit_code = 35; goto cleanup; }
    result = cuMemcpyDtoHAsync(transfer_output, transfer_copy_device, 4U * sizeof(uint32_t), stream);
    if (result != CUDA_SUCCESS) { exit_code = 36; goto cleanup; }
    result = cuEventRecord(event, stream);
    if (result != CUDA_SUCCESS) { exit_code = 37; goto cleanup; }
    result = wait_event(event, &polls);
    if (result != CUDA_SUCCESS) { exit_code = 38; goto cleanup; }
    printf("ASYNC_TRANSFER\t%u\t%u\t%u\t%u\n", transfer_output[0], transfer_output[1], transfer_output[2], transfer_output[3]);
    if (memcmp(transfer_input, transfer_output, 4U * sizeof(uint32_t)) != 0) exit_code = 39;

    mailbox_words = (uint32_t *)VirtualAlloc(NULL, 4096U, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
    if (mailbox_words == NULL) { exit_code = 45; goto cleanup; }
    result = cuMemHostRegister(mailbox_words, 4096U, CU_MEMHOSTREGISTER_DEVICEMAP);
    if (result != CUDA_SUCCESS) { exit_code = 46; goto cleanup; }
    mailbox_registered = 1;
    result = cuMemHostGetDevicePointer(&mailbox_device, mailbox_words, 0U);
    if (result != CUDA_SUCCESS || mailbox_device == 0) { exit_code = 47; goto cleanup; }
    memset(mailbox_parameters, 0, sizeof(mailbox_parameters));
    memcpy(mailbox_parameters + 0U, &mailbox_device, sizeof(mailbox_device));
    {
        const CUdeviceptr output_lane = mailbox_device + sizeof(uint32_t);
        memcpy(mailbox_parameters + 8U, &output_lane, sizeof(output_lane));
    }
    result = launch_buffered(mailbox_function, stream, mailbox_parameters, sizeof(mailbox_parameters));
    if (result != CUDA_SUCCESS) { exit_code = 48; goto cleanup; }
    result = cuEventRecord(event, stream);
    if (result != CUDA_SUCCESS) { exit_code = 49; goto cleanup; }
    result = cuEventQuery(event);
    if (result != CUDA_ERROR_NOT_READY) { exit_code = 50; goto cleanup; }
    InterlockedExchange((volatile long *)&mailbox_words[0], 41L);
    result = wait_event(event, &polls);
    if (result != CUDA_SUCCESS) { exit_code = 51; goto cleanup; }
    printf("MAILBOX_PUBLICATION\t%u\t%u\n", mailbox_words[0], mailbox_words[1]);
    if (mailbox_words[0] != UINT32_C(41) || mailbox_words[1] != UINT32_C(42)) exit_code = 52;

cleanup:
    if (mailbox_registered) { result = cuMemHostUnregister(mailbox_words); printf("MAILBOX_UNREGISTER\t%d\n", (int)result); if (result == CUDA_SUCCESS) mailbox_registered = 0; else if (exit_code == 0) exit_code = 53; mailbox_device = 0; }
    if (mailbox_words != NULL && !mailbox_registered) { if (!VirtualFree(mailbox_words, 0U, MEM_RELEASE) && exit_code == 0) exit_code = 54; mailbox_words = NULL; }
    if (event != NULL) { result = cuEventDestroy(event); printf("EVENT_DESTROY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 25; }
    if (transfer_copy_device != 0) { result = cuMemFree(transfer_copy_device); printf("FREE_TRANSFER_COPY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 40; }
    if (transfer_device != 0) { result = cuMemFree(transfer_device); printf("FREE_TRANSFER\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 41; }
    if (transfer_output != NULL) { result = cuMemFreeHost(transfer_output); printf("FREE_TRANSFER_OUTPUT\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 42; }
    if (transfer_input != NULL) { result = cuMemFreeHost(transfer_input); printf("FREE_TRANSFER_INPUT\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 43; }
    if (output_device != 0) { result = cuMemFree(output_device); printf("FREE_OUTPUT\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 26; }
    if (module != NULL) { result = cuModuleUnload(module); printf("MODULE_UNLOAD\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 27; }
    if (stream != NULL) { result = cuStreamDestroy(stream); printf("STREAM_DESTROY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 28; }
    if (context != NULL) { result = cuCtxDestroy(context); printf("CONTEXT_DESTROY\t%d\n", (int)result); if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 29; }
    free(ptx);
    return exit_code;
}
