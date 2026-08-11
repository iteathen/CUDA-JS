/* Independent CJS-F4W memory oracle compiled with MSVC and the pinned CUDA 13.3 headers. */
#include <cuda.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

#define ALLOCATION_BYTES 4096
#define PATCH_BYTES 257
#define PATCH_OFFSET 777

static unsigned char fixture_byte(size_t index) {
    return (unsigned char)((index * 37U + 11U) & 0xffU);
}

static unsigned char patch_byte(size_t index) {
    return (unsigned char)((index * 19U + 5U) & 0xffU);
}

static uint32_t checksum_bytes(const unsigned char *bytes, size_t length) {
    uint32_t checksum = UINT32_C(2166136261);
    size_t index;
    for (index = 0; index < length; index++) {
        checksum ^= bytes[index];
        checksum *= UINT32_C(16777619);
    }
    return checksum;
}

int main(void) {
    CUresult result;
    CUdevice device = -1;
    CUcontext context = NULL;
    CUdeviceptr allocation = 0;
    CUctxCreateParams parameters;
    unsigned char source[ALLOCATION_BYTES];
    unsigned char expected[ALLOCATION_BYTES];
    unsigned char patch[PATCH_BYTES];
    unsigned char output[ALLOCATION_BYTES];
    size_t free_bytes = 0;
    size_t total_bytes = 0;
    size_t index;
    int bytes_match;
    int exit_code = 0;

    memset(&parameters, 0, sizeof(parameters));
    memset(output, 0, sizeof(output));
    for (index = 0; index < ALLOCATION_BYTES; index++) source[index] = fixture_byte(index);
    memcpy(expected, source, sizeof(expected));
    for (index = 0; index < PATCH_BYTES; index++) patch[index] = patch_byte(index);
    memcpy(expected + PATCH_OFFSET, patch, sizeof(patch));

    result = cuInit(0);
    printf("INIT\t%d\n", (int)result);
    if (result != CUDA_SUCCESS) return 2;
    result = cuDeviceGet(&device, 0);
    printf("DEVICE\t%d\t%d\n", (int)result, (int)device);
    if (result != CUDA_SUCCESS) return 3;
    result = cuCtxCreate(&context, &parameters, 0, device);
    printf("CONTEXT_CREATE\t%d\t%d\n", (int)result, context != NULL ? 1 : 0);
    if (result != CUDA_SUCCESS || context == NULL) return 4;

    result = cuMemGetInfo(&free_bytes, &total_bytes);
    printf("CAPACITY\t%d\t%zu\t%zu\n", (int)result, free_bytes, total_bytes);
    if (result != CUDA_SUCCESS) { exit_code = 5; goto cleanup; }
    result = cuMemAlloc(&allocation, ALLOCATION_BYTES);
    printf("ALLOCATE\t%d\t%d\t%d\n", (int)result, allocation != 0 ? 1 : 0, ALLOCATION_BYTES);
    if (result != CUDA_SUCCESS || allocation == 0) { exit_code = 6; goto cleanup; }
    result = cuMemcpyHtoD(allocation, source, sizeof(source));
    printf("WRITE_FULL\t%d\t%d\n", (int)result, ALLOCATION_BYTES);
    if (result != CUDA_SUCCESS) { exit_code = 7; goto cleanup; }
    result = cuMemcpyHtoD(allocation + PATCH_OFFSET, patch, sizeof(patch));
    printf("WRITE_PATCH\t%d\t%d\t%d\n", (int)result, PATCH_OFFSET, PATCH_BYTES);
    if (result != CUDA_SUCCESS) { exit_code = 8; goto cleanup; }
    result = cuMemcpyDtoH(output, allocation, sizeof(output));
    printf("READ_FULL\t%d\t%d\n", (int)result, ALLOCATION_BYTES);
    if (result != CUDA_SUCCESS) { exit_code = 9; goto cleanup; }
    bytes_match = memcmp(output, expected, sizeof(output)) == 0;
    printf("RESULT\t%d\t%u\n", bytes_match, checksum_bytes(output, sizeof(output)));
    if (!bytes_match) exit_code = 10;

cleanup:
    if (allocation != 0) {
        result = cuMemFree(allocation);
        printf("FREE\t%d\n", (int)result);
        if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 11;
        allocation = 0;
    }
    if (context != NULL) {
        CUcontext current = (CUcontext)(uintptr_t)1;
        result = cuCtxDestroy(context);
        printf("CONTEXT_DESTROY\t%d\n", (int)result);
        if (result != CUDA_SUCCESS && exit_code == 0) exit_code = 12;
        result = cuCtxGetCurrent(&current);
        printf("CURRENT_NULL\t%d\t%d\n", (int)result, current == NULL ? 1 : 0);
        if ((result != CUDA_SUCCESS || current != NULL) && exit_code == 0) exit_code = 13;
    }
    return exit_code;
}
